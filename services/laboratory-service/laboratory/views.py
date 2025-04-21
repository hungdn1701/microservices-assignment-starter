from rest_framework import viewsets, status, filters
from rest_framework.decorators import action
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend
from django.utils import timezone
from django.db.models import Q
import logging

from .models import TestType, LabTest, TestResult, SampleCollection, Notification
from .serializers import (
    TestTypeSerializer, LabTestSerializer, TestResultSerializer,
    SampleCollectionSerializer, NotificationSerializer,
    LabTestCreateSerializer, TestResultCreateSerializer,
    SampleCollectionCreateSerializer
)
from .authentication import CustomJWTAuthentication
from .permissions import IsAdmin, IsDoctor, IsPatient, IsLabTechnician, IsNurse

logger = logging.getLogger(__name__)


class TestTypeViewSet(viewsets.ModelViewSet):
    """
    API endpoint for managing test types.
    """
    queryset = TestType.objects.all()
    serializer_class = TestTypeSerializer
    authentication_classes = [CustomJWTAuthentication]
    permission_classes = [IsAdmin | IsLabTechnician | IsDoctor]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['name', 'unit']
    search_fields = ['name', 'description']
    ordering_fields = ['name', 'price', 'created_at']


class LabTestViewSet(viewsets.ModelViewSet):
    """
    API endpoint for managing laboratory tests.
    """
    queryset = LabTest.objects.all()
    serializer_class = LabTestSerializer
    authentication_classes = [CustomJWTAuthentication]
    permission_classes = [IsAdmin | IsDoctor | IsLabTechnician | IsPatient]
    filter_backends = [DjangoFilterBackend, filters.OrderingFilter]
    filterset_fields = ['patient_id', 'doctor_id', 'test_type', 'status']
    ordering_fields = ['ordered_date', 'scheduled_date', 'created_at']

    def get_serializer_class(self):
        if self.action == 'create':
            return LabTestCreateSerializer
        return LabTestSerializer

    def get_queryset(self):
        """
        Filter lab tests based on user role.
        """
        queryset = LabTest.objects.all()

        # Get user information from authentication
        user_role = getattr(self.request.user, 'role', None)
        user_id = getattr(self.request.user, 'id', None)

        # Filter based on user role
        if user_role == 'PATIENT':
            queryset = queryset.filter(patient_id=user_id)
        elif user_role == 'DOCTOR':
            queryset = queryset.filter(doctor_id=user_id)

        return queryset

    @action(detail=True, methods=['post'])
    def cancel(self, request, pk=None):
        """
        Cancel a lab test.
        """
        lab_test = self.get_object()
        lab_test.status = LabTest.Status.CANCELLED
        lab_test.save()

        # Create notification for cancellation
        Notification.objects.create(
            lab_test=lab_test,
            recipient_id=lab_test.patient_id,
            recipient_type='PATIENT',
            notification_type=Notification.NotificationType.TEST_CANCELLED,
            message=f"Your lab test {lab_test.test_type.name} has been cancelled."
        )

        serializer = self.get_serializer(lab_test)
        return Response(serializer.data)

    @action(detail=False, methods=['get'])
    def pending(self, request):
        """
        Get pending lab tests.
        """
        queryset = self.get_queryset().filter(
            Q(status=LabTest.Status.ORDERED) |
            Q(status=LabTest.Status.SAMPLE_COLLECTED) |
            Q(status=LabTest.Status.IN_PROGRESS)
        )
        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)


class TestResultViewSet(viewsets.ModelViewSet):
    """
    API endpoint for managing test results.
    """
    queryset = TestResult.objects.all()
    serializer_class = TestResultSerializer
    authentication_classes = [CustomJWTAuthentication]
    permission_classes = [IsAdmin | IsLabTechnician | IsDoctor | IsPatient]
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['lab_test', 'technician_id', 'is_abnormal']

    def get_serializer_class(self):
        if self.action == 'create':
            return TestResultCreateSerializer
        return TestResultSerializer

    def get_queryset(self):
        """
        Filter test results based on user role.
        """
        queryset = TestResult.objects.all()

        # Get user information from authentication
        user_role = getattr(self.request.user, 'role', None)
        user_id = getattr(self.request.user, 'id', None)

        # Filter based on user role
        if user_role == 'PATIENT':
            queryset = queryset.filter(lab_test__patient_id=user_id)
        elif user_role == 'DOCTOR':
            queryset = queryset.filter(lab_test__doctor_id=user_id)
        elif user_role == 'LAB_TECHNICIAN':
            queryset = queryset.filter(technician_id=user_id)

        return queryset

    def perform_create(self, serializer):
        result = serializer.save()

        # Update the lab test status and result date
        lab_test = result.lab_test
        lab_test.status = LabTest.Status.COMPLETED
        lab_test.result_date = timezone.now()
        lab_test.save()

        # Create notifications for patient and doctor
        Notification.objects.create(
            lab_test=lab_test,
            recipient_id=lab_test.patient_id,
            recipient_type='PATIENT',
            notification_type=Notification.NotificationType.RESULT_READY,
            message=f"Results for your {lab_test.test_type.name} test are now available."
        )

        Notification.objects.create(
            lab_test=lab_test,
            recipient_id=lab_test.doctor_id,
            recipient_type='DOCTOR',
            notification_type=Notification.NotificationType.RESULT_READY,
            message=f"Results for {lab_test.test_type.name} test for patient {lab_test.patient_id} are now available."
        )

        # Create invoice for the completed lab test
        try:
            from .integrations import create_invoice_from_lab_test
            # Get token from request
            auth_header = self.request.META.get('HTTP_AUTHORIZATION')
            auth_token = None
            if auth_header and auth_header.startswith('Bearer '):
                auth_token = auth_header

            # Create invoice
            invoice = create_invoice_from_lab_test(lab_test, token=auth_token)

            if invoice:
                logger.info(f"Created invoice for lab test {lab_test.id}: {invoice.get('id')}")

                # Send notification about invoice
                from .integrations import send_notification
                send_notification(
                    user_id=lab_test.patient_id,
                    notification_type="INVOICE_CREATED",
                    message=f"An invoice has been created for your {lab_test.test_type.name} test.",
                    additional_data={
                        "invoice_id": invoice.get('id'),
                        "lab_test_id": lab_test.id,
                        "amount": invoice.get('total_amount')
                    },
                    token=auth_token
                )
        except Exception as e:
            logger.error(f"Error creating invoice for lab test {lab_test.id}: {str(e)}")
            # Don't raise the exception to avoid affecting the main flow


class SampleCollectionViewSet(viewsets.ModelViewSet):
    """
    API endpoint for managing sample collections.
    """
    queryset = SampleCollection.objects.all()
    serializer_class = SampleCollectionSerializer
    authentication_classes = [CustomJWTAuthentication]
    permission_classes = [IsAdmin | IsLabTechnician | IsNurse]
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['lab_test', 'collector_id', 'sample_type']

    def get_serializer_class(self):
        if self.action == 'create':
            return SampleCollectionCreateSerializer
        return SampleCollectionSerializer

    def perform_create(self, serializer):
        sample = serializer.save()

        # Update the lab test status and sample collection date
        lab_test = sample.lab_test
        lab_test.status = LabTest.Status.SAMPLE_COLLECTED
        lab_test.sample_collection_date = timezone.now()
        lab_test.save()

        # Create notification for sample collection
        Notification.objects.create(
            lab_test=lab_test,
            recipient_id=lab_test.patient_id,
            recipient_type='PATIENT',
            notification_type=Notification.NotificationType.SAMPLE_COLLECTED,
            message=f"Your sample for {lab_test.test_type.name} test has been collected."
        )


class NotificationViewSet(viewsets.ModelViewSet):
    """
    API endpoint for managing notifications.
    """
    queryset = Notification.objects.all()
    serializer_class = NotificationSerializer
    authentication_classes = [CustomJWTAuthentication]
    permission_classes = [IsAdmin | IsDoctor | IsLabTechnician | IsPatient | IsNurse]
    filter_backends = [DjangoFilterBackend, filters.OrderingFilter]
    filterset_fields = ['recipient_id', 'recipient_type', 'notification_type', 'is_read']
    ordering_fields = ['created_at']

    def get_queryset(self):
        """
        Filter notifications based on user role and ID.
        """
        queryset = Notification.objects.all()

        # Get user information from authentication
        user_role = getattr(self.request.user, 'role', None)
        user_id = getattr(self.request.user, 'id', None)

        # Users should only see their own notifications
        if user_role and user_id:
            recipient_type = user_role
            queryset = queryset.filter(recipient_id=user_id, recipient_type=recipient_type)

        return queryset

    @action(detail=True, methods=['post'])
    def mark_as_read(self, request, pk=None):
        """
        Mark a notification as read.
        """
        notification = self.get_object()
        notification.is_read = True
        notification.save()
        serializer = self.get_serializer(notification)
        return Response(serializer.data)

    @action(detail=False, methods=['post'])
    def mark_all_as_read(self, request):
        """
        Mark all notifications as read for the current user.
        """
        queryset = self.get_queryset()
        queryset.update(is_read=True)
        return Response({"message": "All notifications marked as read."}, status=status.HTTP_200_OK)

    @action(detail=False, methods=['get'])
    def unread(self, request):
        """
        Get unread notifications for the current user.
        """
        queryset = self.get_queryset().filter(is_read=False)
        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)