from rest_framework import viewsets, status, filters
from rest_framework.decorators import action, api_view, permission_classes
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework_simplejwt.authentication import JWTAuthentication
from django.utils import timezone
from .models import Notification, NotificationTemplate, NotificationSchedule, InAppNotification
from .serializers import (
    NotificationSerializer, NotificationTemplateSerializer, NotificationScheduleSerializer,
    SendEmailNotificationSerializer, SendSMSNotificationSerializer, ScheduleNotificationSerializer,
    EventSerializer, InAppNotificationSerializer
)
from .tasks import send_email_notification, send_sms_notification, send_notification_from_template
from .authentication import HeaderAuthentication
from .permissions import IsAdmin, IsAdminOrStaff
from .event_handlers import (
    process_appointment_event, process_medical_record_event, process_billing_event,
    process_pharmacy_event, process_laboratory_event
)
import logging

logger = logging.getLogger(__name__)


class NotificationViewSet(viewsets.ModelViewSet):
    """
    API endpoint for managing notifications.
    """
    queryset = Notification.objects.all().order_by('-created_at')
    serializer_class = NotificationSerializer
    # Support both service tokens and user JWTs for unified auth
    authentication_classes = [HeaderAuthentication, JWTAuthentication]
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['recipient_id', 'recipient_email', 'recipient_phone', 'subject', 'content']
    ordering_fields = ['created_at', 'sent_at', 'delivered_at']

    def get_permissions(self):
        if self.action in ['create', 'update', 'partial_update', 'destroy']:
            permission_classes = [IsAdminOrStaff]
        else:
            permission_classes = [IsAuthenticated]
        return [permission() for permission in permission_classes]

    def get_queryset(self):
        # Base queryset
        queryset = Notification.objects.all().order_by('-created_at')
        user = self.request.user
        user_role = getattr(user, 'role', None)
        user_id = getattr(user, 'id', None)
        # Admins and staff can view any or filter by recipient
        if user_role in ['ADMIN', 'STAFF']:
            recipient_id = self.request.query_params.get('recipient_id', None)
            if recipient_id:
                queryset = queryset.filter(recipient_id=recipient_id)
        else:
            # Regular users only see their own notifications
            queryset = queryset.filter(recipient_id=user_id)

        # Filter by notification_type if provided
        notification_type = self.request.query_params.get('notification_type', None)
        if notification_type:
            queryset = queryset.filter(notification_type=notification_type)

        # Filter by channel if provided
        channel = self.request.query_params.get('channel', None)
        if channel:
            queryset = queryset.filter(channel=channel)

        # Filter by status if provided
        status_param = self.request.query_params.get('status', None)
        if status_param:
            queryset = queryset.filter(status=status_param)

        # Filter by reference_id if provided
        reference_id = self.request.query_params.get('reference_id', None)
        if reference_id:
            queryset = queryset.filter(reference_id=reference_id)

        # Filter by reference_type if provided
        reference_type = self.request.query_params.get('reference_type', None)
        if reference_type:
            queryset = queryset.filter(reference_type=reference_type)

        return queryset

    @action(detail=False, methods=['post'])
    def send_email(self, request):
        """
        Send an email notification.
        """
        serializer = SendEmailNotificationSerializer(data=request.data)
        if serializer.is_valid():
            # Create a notification
            notification = Notification(
                recipient_id=serializer.validated_data['recipient_id'],
                recipient_type=serializer.validated_data['recipient_type'],
                recipient_email=serializer.validated_data['recipient_email'],
                notification_type=serializer.validated_data['notification_type'],
                channel=Notification.Channel.EMAIL,
                subject=serializer.validated_data['subject'],
                content=serializer.validated_data['content'],
                reference_id=serializer.validated_data.get('reference_id'),
                reference_type=serializer.validated_data.get('reference_type'),
                status=Notification.Status.PENDING
            )
            notification.save()

            # Send the email asynchronously
            send_email_notification.delay(notification.id)

            return Response({'id': notification.id, 'status': 'pending'}, status=status.HTTP_202_ACCEPTED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=False, methods=['post'])
    def send_sms(self, request):
        """
        Send an SMS notification.
        """
        serializer = SendSMSNotificationSerializer(data=request.data)
        if serializer.is_valid():
            # Create a notification
            notification = Notification(
                recipient_id=serializer.validated_data['recipient_id'],
                recipient_type=serializer.validated_data['recipient_type'],
                recipient_phone=serializer.validated_data['recipient_phone'],
                notification_type=serializer.validated_data['notification_type'],
                channel=Notification.Channel.SMS,
                subject='',
                content=serializer.validated_data['content'],
                reference_id=serializer.validated_data.get('reference_id'),
                reference_type=serializer.validated_data.get('reference_type'),
                status=Notification.Status.PENDING
            )
            notification.save()

            # Send the SMS asynchronously
            send_sms_notification.delay(notification.id)

            return Response({'id': notification.id, 'status': 'pending'}, status=status.HTTP_202_ACCEPTED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=False, methods=['post'])
    def send_from_template(self, request):
        """
        Send a notification using a template.
        """
        template_id = request.data.get('template_id')
        recipient_id = request.data.get('recipient_id')
        recipient_type = request.data.get('recipient_type')
        context_data = request.data.get('context_data', {})
        reference_id = request.data.get('reference_id')
        reference_type = request.data.get('reference_type')

        if not template_id or not recipient_id or not recipient_type:
            return Response(
                {'error': 'template_id, recipient_id, and recipient_type are required'},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Send the notification asynchronously
        notification_id = send_notification_from_template.delay(
            template_id, recipient_id, recipient_type, context_data, reference_id, reference_type
        )

        if notification_id:
            return Response({'id': notification_id, 'status': 'pending'}, status=status.HTTP_202_ACCEPTED)
        else:
            return Response({'error': 'Failed to send notification'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class NotificationTemplateViewSet(viewsets.ModelViewSet):
    """
    API endpoint for managing notification templates.
    """
    queryset = NotificationTemplate.objects.all().order_by('-created_at')
    serializer_class = NotificationTemplateSerializer
    authentication_classes = [HeaderAuthentication]
    permission_classes = [IsAdminOrStaff]
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['name', 'subject_template', 'content_template']
    ordering_fields = ['name', 'created_at', 'updated_at']

    def get_queryset(self):
        queryset = NotificationTemplate.objects.all().order_by('-created_at')

        # Filter by notification_type if provided
        notification_type = self.request.query_params.get('notification_type', None)
        if notification_type:
            queryset = queryset.filter(notification_type=notification_type)

        # Filter by channel if provided
        channel = self.request.query_params.get('channel', None)
        if channel:
            queryset = queryset.filter(channel=channel)

        # Filter by is_active if provided
        is_active = self.request.query_params.get('is_active', None)
        if is_active is not None:
            is_active = is_active.lower() == 'true'
            queryset = queryset.filter(is_active=is_active)

        return queryset


class NotificationScheduleViewSet(viewsets.ModelViewSet):
    """
    API endpoint for managing notification schedules.
    """
    queryset = NotificationSchedule.objects.all().order_by('-scheduled_at')
    serializer_class = NotificationScheduleSerializer
    authentication_classes = [HeaderAuthentication]
    permission_classes = [IsAdminOrStaff]
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['recipient_id', 'subject', 'content']
    ordering_fields = ['scheduled_at', 'created_at', 'updated_at']

    def get_queryset(self):
        queryset = NotificationSchedule.objects.all().order_by('-scheduled_at')

        # Filter by recipient_id if provided
        recipient_id = self.request.query_params.get('recipient_id', None)
        if recipient_id:
            queryset = queryset.filter(recipient_id=recipient_id)

        # Filter by notification_type if provided
        notification_type = self.request.query_params.get('notification_type', None)
        if notification_type:
            queryset = queryset.filter(notification_type=notification_type)

        # Filter by status if provided
        status_param = self.request.query_params.get('status', None)
        if status_param:
            queryset = queryset.filter(status=status_param)

        # Filter by scheduled_after if provided
        scheduled_after = self.request.query_params.get('scheduled_after', None)
        if scheduled_after:
            queryset = queryset.filter(scheduled_at__gte=scheduled_after)

        # Filter by scheduled_before if provided
        scheduled_before = self.request.query_params.get('scheduled_before', None)
        if scheduled_before:
            queryset = queryset.filter(scheduled_at__lte=scheduled_before)

        return queryset

    @action(detail=False, methods=['post'])
    def schedule(self, request):
        """
        Schedule a notification.
        """
        serializer = ScheduleNotificationSerializer(data=request.data)
        if serializer.is_valid():
            # Create a notification schedule
            schedule = NotificationSchedule(
                recipient_id=serializer.validated_data['recipient_id'],
                recipient_type=serializer.validated_data['recipient_type'],
                recipient_email=serializer.validated_data.get('recipient_email'),
                recipient_phone=serializer.validated_data.get('recipient_phone'),
                notification_type=serializer.validated_data['notification_type'],
                channel=serializer.validated_data['channel'],
                subject=serializer.validated_data.get('subject', ''),
                content=serializer.validated_data['content'],
                scheduled_at=serializer.validated_data['scheduled_at'],
                status=NotificationSchedule.Status.SCHEDULED,
                reference_id=serializer.validated_data.get('reference_id'),
                reference_type=serializer.validated_data.get('reference_type')
            )

            # Set template if provided
            template_id = serializer.validated_data.get('template_id')
            if template_id:
                try:
                    template = NotificationTemplate.objects.get(id=template_id, is_active=True)
                    schedule.template = template
                except NotificationTemplate.DoesNotExist:
                    return Response(
                        {'error': f'Template with ID {template_id} not found or not active'},
                        status=status.HTTP_400_BAD_REQUEST
                    )

            schedule.save()

            return Response(
                NotificationScheduleSerializer(schedule).data,
                status=status.HTTP_201_CREATED
            )
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=True, methods=['post'])
    def cancel(self, request, pk=None):
        """
        Cancel a scheduled notification.
        """
        schedule = self.get_object()

        if schedule.status != NotificationSchedule.Status.SCHEDULED:
            return Response(
                {'error': f'Cannot cancel notification with status {schedule.status}'},
                status=status.HTTP_400_BAD_REQUEST
            )

        schedule.status = NotificationSchedule.Status.CANCELLED
        schedule.save()

        return Response(
            NotificationScheduleSerializer(schedule).data,
            status=status.HTTP_200_OK
        )


class InAppNotificationViewSet(viewsets.ModelViewSet):
    """
    API endpoint for managing in-app notifications.

    This ViewSet provides endpoints for managing in-app notifications.

    List endpoint supports the following query parameters:
    - recipient_id: Filter by recipient ID
    - status: Filter by status (UNREAD, READ, ARCHIVED)
    - notification_type: Filter by notification type (APPOINTMENT, MEDICAL_RECORD, BILLING, PHARMACY, LABORATORY)
    - service: Filter by service (APPOINTMENT, MEDICAL_RECORD, BILLING, PHARMACY, LABORATORY)
    - reference_id: Filter by reference ID
    - reference_type: Filter by reference type
    - is_urgent: Filter by urgent status (true, false)
    - search: Search in content and title
    - ordering: Order by field (created_at, status, -created_at, -status)

    Example:
    GET /api/in-app/?recipient_id=4&status=UNREAD&ordering=-created_at
    """
    queryset = InAppNotification.objects.all().order_by('-created_at')
    serializer_class = InAppNotificationSerializer
    authentication_classes = []
    permission_classes = [AllowAny]
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['content', 'title']
    ordering_fields = ['created_at', 'status']

    def get_queryset(self):
        """
        Filter notifications based on query parameters.
        """
        # Base queryset
        queryset = InAppNotification.objects.all().order_by('-created_at')

        # Filter by recipient_id if provided
        recipient_id = self.request.query_params.get('recipient_id', None)
        if recipient_id:
            queryset = queryset.filter(recipient_id=recipient_id)

        # Apply additional filters
        status_param = self.request.query_params.get('status', None)
        if status_param:
            queryset = queryset.filter(status=status_param)

        # Filter by notification type
        notification_type = self.request.query_params.get('notification_type', None)
        if notification_type:
            queryset = queryset.filter(notification_type=notification_type)

        # Filter by service
        service = self.request.query_params.get('service', None)
        if service:
            queryset = queryset.filter(service=service)

        # Filter by reference_id
        reference_id = self.request.query_params.get('reference_id', None)
        if reference_id:
            queryset = queryset.filter(reference_id=reference_id)

        # Filter by reference_type
        reference_type = self.request.query_params.get('reference_type', None)
        if reference_type:
            queryset = queryset.filter(reference_type=reference_type)

        # Filter by urgency
        is_urgent = self.request.query_params.get('is_urgent', None)
        if is_urgent is not None:
            is_urgent = is_urgent.lower() == 'true'
            queryset = queryset.filter(is_urgent=is_urgent)

        return queryset

    @action(detail=True, methods=['post'])
    def mark_as_read(self, request, pk=None):
        """
        Mark a notification as read.
        """
        notification = self.get_object()

        # Mark as read
        notification.status = InAppNotification.Status.READ
        notification.read_at = timezone.now()
        notification.save(update_fields=['status', 'read_at', 'updated_at'])

        return Response(
            InAppNotificationSerializer(notification).data,
            status=status.HTTP_200_OK
        )

    @action(detail=True, methods=['post'])
    def archive(self, request, pk=None):
        """
        Archive a notification.
        """
        notification = self.get_object()

        # Archive notification
        notification.status = InAppNotification.Status.ARCHIVED
        notification.save(update_fields=['status', 'updated_at'])

        return Response(
            InAppNotificationSerializer(notification).data,
            status=status.HTTP_200_OK
        )

    @action(detail=False, methods=['post'])
    def mark_all_as_read(self, request):
        """
        Mark all notifications for a recipient as read.
        """
        recipient_id = request.data.get('recipient_id')
        if not recipient_id:
            return Response(
                {'error': 'recipient_id is required'},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Get all unread notifications for the recipient
        notifications = InAppNotification.objects.filter(
            recipient_id=recipient_id,
            status=InAppNotification.Status.UNREAD
        )

        # Mark all as read
        now = timezone.now()
        count = notifications.update(
            status=InAppNotification.Status.READ,
            read_at=now,
            updated_at=now
        )

        return Response({'count': count, 'message': f'{count} notifications marked as read'})

    @action(detail=False, methods=['get'])
    def count_unread(self, request):
        """
        Get the count of unread notifications for a recipient.
        """
        recipient_id = request.query_params.get('recipient_id')
        if not recipient_id:
            return Response(
                {'error': 'recipient_id is required'},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Count unread notifications
        count = InAppNotification.objects.filter(
            recipient_id=recipient_id,
            status=InAppNotification.Status.UNREAD
        ).count()

        # Count urgent unread notifications
        urgent_count = InAppNotification.objects.filter(
            recipient_id=recipient_id,
            status=InAppNotification.Status.UNREAD,
            is_urgent=True
        ).count()

        return Response({
            'total_unread': count,
            'urgent_unread': urgent_count
        })


class EventViewSet(viewsets.ViewSet):
    """
    ViewSet for processing events from other services.
    """
    permission_classes = [AllowAny]

    @action(detail=False, methods=['post'])
    def process(self, request):
        """
        Process events from other services and create appropriate notifications.

        This endpoint receives events from other services and creates appropriate notifications
        based on the event type and service. It supports the following services:

        - APPOINTMENT: Events related to appointments (CREATED, UPDATED, CANCELLED, REMINDER, COMPLETED)
        - MEDICAL_RECORD: Events related to medical records (CREATED, UPDATED, DIAGNOSIS_ADDED, TREATMENT_ADDED, MEDICATION_ADDED)
        - BILLING: Events related to billing (INVOICE_CREATED, PAYMENT_RECEIVED, PAYMENT_DUE, PAYMENT_OVERDUE, INSURANCE_CLAIM_SUBMITTED, INSURANCE_CLAIM_APPROVED, INSURANCE_CLAIM_REJECTED)
        - PHARMACY: Events related to pharmacy (PRESCRIPTION_CREATED, PRESCRIPTION_FILLED, PRESCRIPTION_READY, PRESCRIPTION_PICKED_UP, MEDICATION_REFILL_DUE, MEDICATION_EXPIRING)
        - LABORATORY: Events related to laboratory (TEST_ORDERED, SAMPLE_COLLECTED, RESULTS_READY, RESULTS_DELIVERED, ABNORMAL_RESULTS)

        Example request for APPOINTMENT service:
        ```json
        {
            "service": "APPOINTMENT",
            "event_type": "CREATED",
            "appointment_id": 1,
            "patient_id": 4,
            "doctor_id": 2,
            "appointment_date": "2025-04-25T10:00:00Z",
            "status": "SCHEDULED"
        }
        ```

        Example request for BILLING service:
        ```json
        {
            "service": "BILLING",
            "event_type": "INVOICE_CREATED",
            "invoice_id": 1,
            "patient_id": 4,
            "amount": 500000,
            "due_date": "2025-05-01"
        }
        ```

        The endpoint will create appropriate notifications for the event and return a list of
        notification IDs that were created.
        """
        # Log the incoming request data for debugging
        logger.info(f"Received event data: {request.data}")

        # Extract service and event_type from request data
        service = request.data.get('service')
        event_type = request.data.get('event_type')

        if not service:
            logger.error("Missing required field: service")
            return Response({'error': 'Missing required field: service'}, status=status.HTTP_400_BAD_REQUEST)

        # Prepare event_data from request data
        event_data = {}
        for key, value in request.data.items():
            if key not in ['service']:
                event_data[key] = value

        # Create data for EventSerializer
        serializer_data = {
            'service': service,
            'event_data': event_data
        }

        logger.info(f"Prepared serializer data: {serializer_data}")

        serializer = EventSerializer(data=serializer_data)
        if serializer.is_valid():
            service = serializer.validated_data['service']
            event_data = serializer.validated_data['event_data']

            try:
                # Validate required fields based on service
                event_type = event_data.get('event_type')
                if not event_type:
                    logger.error("Missing required field: event_type")
                    return Response({'error': 'Missing required field: event_type'}, status=status.HTTP_400_BAD_REQUEST)

                # Process the event based on the service
                if service == 'APPOINTMENT':
                    # Validate appointment-specific fields
                    if not event_data.get('appointment_id'):
                        logger.error("Missing required field for APPOINTMENT: appointment_id")
                        return Response({'error': 'Missing required field: appointment_id'}, status=status.HTTP_400_BAD_REQUEST)
                    if not event_data.get('patient_id'):
                        logger.error("Missing required field for APPOINTMENT: patient_id")
                        return Response({'error': 'Missing required field: patient_id'}, status=status.HTTP_400_BAD_REQUEST)

                    result = process_appointment_event(event_data)
                elif service == 'MEDICAL_RECORD':
                    # Validate medical record-specific fields
                    if not event_data.get('record_id'):
                        logger.error("Missing required field for MEDICAL_RECORD: record_id")
                        return Response({'error': 'Missing required field: record_id'}, status=status.HTTP_400_BAD_REQUEST)
                    if not event_data.get('patient_id'):
                        logger.error("Missing required field for MEDICAL_RECORD: patient_id")
                        return Response({'error': 'Missing required field: patient_id'}, status=status.HTTP_400_BAD_REQUEST)

                    result = process_medical_record_event(event_data)
                elif service == 'BILLING':
                    # Validate billing-specific fields
                    if event_type == 'INVOICE_CREATED' and not event_data.get('invoice_id'):
                        logger.error("Missing required field for BILLING/INVOICE_CREATED: invoice_id")
                        return Response({'error': 'Missing required field: invoice_id'}, status=status.HTTP_400_BAD_REQUEST)
                    if event_type == 'PAYMENT_RECEIVED' and not event_data.get('payment_id'):
                        logger.error("Missing required field for BILLING/PAYMENT_RECEIVED: payment_id")
                        return Response({'error': 'Missing required field: payment_id'}, status=status.HTTP_400_BAD_REQUEST)
                    if not event_data.get('patient_id'):
                        logger.error("Missing required field for BILLING: patient_id")
                        return Response({'error': 'Missing required field: patient_id'}, status=status.HTTP_400_BAD_REQUEST)

                    result = process_billing_event(event_data)
                elif service == 'PHARMACY':
                    # Validate pharmacy-specific fields
                    if not event_data.get('prescription_id'):
                        logger.error("Missing required field for PHARMACY: prescription_id")
                        return Response({'error': 'Missing required field: prescription_id'}, status=status.HTTP_400_BAD_REQUEST)
                    if not event_data.get('patient_id'):
                        logger.error("Missing required field for PHARMACY: patient_id")
                        return Response({'error': 'Missing required field: patient_id'}, status=status.HTTP_400_BAD_REQUEST)

                    result = process_pharmacy_event(event_data)
                elif service == 'LABORATORY':
                    # Validate laboratory-specific fields
                    if not event_data.get('test_id'):
                        logger.error("Missing required field for LABORATORY: test_id")
                        return Response({'error': 'Missing required field: test_id'}, status=status.HTTP_400_BAD_REQUEST)
                    if not event_data.get('patient_id'):
                        logger.error("Missing required field for LABORATORY: patient_id")
                        return Response({'error': 'Missing required field: patient_id'}, status=status.HTTP_400_BAD_REQUEST)

                    result = process_laboratory_event(event_data)
                else:
                    logger.error(f"Unknown service: {service}")
                    return Response({'error': f'Unknown service: {service}'}, status=status.HTTP_400_BAD_REQUEST)

                logger.info(f"Successfully processed {service} event: {event_type}")
                return Response(result, status=status.HTTP_202_ACCEPTED)
            except ValueError as ve:
                # Handle validation errors
                logger.error(f"Validation error processing {service} event: {str(ve)}")
                return Response({'error': str(ve)}, status=status.HTTP_400_BAD_REQUEST)
            except Exception as e:
                # Handle unexpected errors
                logger.error(f"Error processing {service} event: {str(e)}")
                import traceback
                logger.error(traceback.format_exc())
                return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        else:
            logger.error(f"Validation errors: {serializer.errors}")
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
