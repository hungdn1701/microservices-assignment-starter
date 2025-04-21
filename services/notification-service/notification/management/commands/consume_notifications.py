import logging
import json
import time
import os
from django.core.management.base import BaseCommand
from django.utils import timezone
from common_auth.redis_notifications import RedisNotificationClient
from notification.models import InAppNotification, Notification

logger = logging.getLogger(__name__)

class Command(BaseCommand):
    help = 'Consumes notifications from Redis Stream and processes them as in-app notifications'

    def add_arguments(self, parser):
        parser.add_argument('--group', type=str, default='notification_processors', help='Consumer group name')
        parser.add_argument('--consumer', type=str, default=None, help='Consumer name (default: auto-generated)')
        parser.add_argument('--batch-size', type=int, default=10, help='Number of notifications to process in one batch')
        parser.add_argument('--sleep', type=int, default=1, help='Sleep time in seconds when no messages are available')

    def handle(self, *args, **options):
        group_name = options['group']
        consumer_name = options['consumer'] or f"consumer-{os.getpid()}"
        batch_size = options['batch_size']
        sleep_time = options['sleep']

        client = RedisNotificationClient()
        client.create_consumer_group(group_name)

        self.stdout.write(self.style.SUCCESS(f"Starting Redis notification consumer: {consumer_name}"))
        self.stdout.write(f"Consumer group: {group_name}, Batch size: {batch_size}, Sleep time: {sleep_time}s")

        while True:
            try:
                messages = client.read_notifications(group_name, consumer_name, count=batch_size)

                if not messages:
                    time.sleep(sleep_time)
                    continue

                for stream, message_list in messages:
                    for message_id, message_data in message_list:
                        self.process_notification(message_id, message_data, group_name, client)

            except KeyboardInterrupt:
                self.stdout.write(self.style.SUCCESS("Notification consumer stopped by user"))
                break
            except Exception as e:
                logger.error(f"Error in notification consumer loop: {str(e)}")
                self.stderr.write(self.style.ERROR(f"Error in consumer loop: {str(e)}"))
                time.sleep(sleep_time)

    def process_notification(self, message_id, message_data, group_name, client):
        try:
            # Decode message data from bytes to string
            notification = {
                key.decode('utf-8') if isinstance(key, bytes) else key: 
                value.decode('utf-8') if isinstance(value, bytes) else value
                for key, value in message_data.items()
            }

            # Parse JSON fields if they exist
            if 'recipients' in notification:
                try:
                    notification['recipients'] = json.loads(notification['recipients'])
                except json.JSONDecodeError:
                    notification['recipients'] = []
                    
            if 'data' in notification:
                try:
                    notification['data'] = json.loads(notification['data'])
                except json.JSONDecodeError:
                    notification['data'] = {}

            # Extract data from notification
            service = notification.get('service', 'SYSTEM')
            event_type = notification.get('event_type', 'UNKNOWN')
            recipients = notification.get('recipients', [])
            data = notification.get('data', {})
            
            self.stdout.write(f"Processing {service}.{event_type} notification")
            
            # Log detailed information for debugging
            logger.debug(f"Notification data: {notification}")
            logger.debug(f"Recipients: {recipients}")
            logger.debug(f"Data: {data}")

            # If no recipients specified, use defaults based on data
            if not recipients:
                recipients = self._determine_default_recipients(service, event_type, data)

            # Map notification_type based on service and event_type
            notification_type = self._map_notification_type(service, event_type)
            
            # Determine if this notification is urgent
            is_urgent = self._is_urgent_notification(service, event_type, data)

            # Create in-app notification for each recipient
            created_count = 0
            for recipient in recipients:
                try:
                    # Extract recipient information
                    recipient_id = recipient.get('recipient_id')
                    recipient_type = recipient.get('recipient_type', 'PATIENT')
                    
                    if not recipient_id:
                        continue
                        
                    # Only create in-app notifications for recipients that should receive them
                    if 'channels' in recipient and 'IN_APP' not in recipient['channels']:
                        logger.debug(f"Skipping in-app notification for recipient {recipient_id}: not in channels")
                        continue
                    
                    # Get title and content
                    title = data.get('subject', f"{service} {event_type}")
                    content = data.get('message', '')
                    if not content and 'content' in data:
                        content = data.get('content')
                        
                    # Get reference information
                    reference_id = data.get('reference_id', '')
                    reference_type = data.get('reference_type', service)
                    
                    # Extract IDs for common entities
                    metadata = data.copy()
                    
                    # Create the in-app notification
                    InAppNotification.objects.create(
                        recipient_id=recipient_id,
                        recipient_type=recipient_type,
                        notification_type=notification_type,
                        title=title,
                        content=content,
                        status=InAppNotification.Status.UNREAD,
                        reference_id=reference_id,
                        reference_type=reference_type,
                        is_urgent=is_urgent,
                        service=service,
                        event_type=event_type,
                        metadata=metadata
                    )
                    created_count += 1
                    
                except Exception as e:
                    logger.error(f"Error creating notification for recipient {recipient}: {str(e)}")
            
            # Acknowledge message processing
            client.acknowledge_message(group_name, message_id)
            logger.info(f"Processed notification {message_id}: Created {created_count} in-app notifications")
            self.stdout.write(self.style.SUCCESS(f"Created {created_count} in-app notifications"))

        except Exception as e:
            logger.error(f"Error processing notification {message_id}: {str(e)}")
            self.stderr.write(self.style.ERROR(f"Error processing notification: {str(e)}"))
            
    def _determine_default_recipients(self, service, event_type, data):
        """
        Determine default recipients based on notification data.
        """
        recipients = []
        
        # Extract common IDs
        patient_id = data.get('patient_id')
        doctor_id = data.get('doctor_id')
        
        # Add patient as recipient if patient_id exists
        if patient_id:
            recipients.append({
                'recipient_id': patient_id,
                'recipient_type': 'PATIENT',
                'channels': ['IN_APP']
            })
            
        # Add doctor as recipient if doctor_id exists
        if doctor_id:
            recipients.append({
                'recipient_id': doctor_id,
                'recipient_type': 'DOCTOR',
                'channels': ['IN_APP']
            })
            
        # Service specific handling
        if service == 'LABORATORY':
            # Also notify lab technician
            lab_tech_id = data.get('lab_technician_id')
            if lab_tech_id:
                recipients.append({
                    'recipient_id': lab_tech_id,
                    'recipient_type': 'LAB_TECHNICIAN',
                    'channels': ['IN_APP']
                })
                
        elif service == 'PHARMACY':
            # Also notify pharmacist
            pharmacist_id = data.get('pharmacist_id')
            if pharmacist_id:
                recipients.append({
                    'recipient_id': pharmacist_id,
                    'recipient_type': 'PHARMACIST',
                    'channels': ['IN_APP']
                })
        
        # If no recipients could be determined, log a warning
        if not recipients:
            logger.warning(f"No recipients determined for {service}.{event_type}")
            
        return recipients
    
    def _map_notification_type(self, service, event_type):
        """
        Map service and event_type to notification_type.
        """
        # Default mapping
        notification_type_map = {
            'APPOINTMENT': {
                'CREATED': Notification.NotificationType.APPOINTMENT,
                'UPDATED': Notification.NotificationType.APPOINTMENT,
                'CANCELLED': Notification.NotificationType.APPOINTMENT,
                'COMPLETED': Notification.NotificationType.APPOINTMENT,
                'DEFAULT': Notification.NotificationType.APPOINTMENT,
            },
            'MEDICAL_RECORD': {
                'CREATED': Notification.NotificationType.MEDICAL_RECORD,
                'UPDATED': Notification.NotificationType.MEDICAL_RECORD,
                'DEFAULT': Notification.NotificationType.MEDICAL_RECORD,
            },
            'BILLING': {
                'INVOICE_CREATED': Notification.NotificationType.BILLING,
                'PAYMENT_RECEIVED': Notification.NotificationType.BILLING,
                'DEFAULT': Notification.NotificationType.BILLING,
            },
            'LABORATORY': {
                'TEST_ORDERED': Notification.NotificationType.LAB_RESULT,
                'RESULTS_READY': Notification.NotificationType.LAB_RESULT,
                'DEFAULT': Notification.NotificationType.LAB_RESULT,
            },
            'PHARMACY': {
                'PRESCRIPTION_CREATED': Notification.NotificationType.PRESCRIPTION,
                'PRESCRIPTION_READY': Notification.NotificationType.PRESCRIPTION,
                'DEFAULT': Notification.NotificationType.PRESCRIPTION,
            },
            'DEFAULT': Notification.NotificationType.SYSTEM,
        }
        
        # Get mapping for the service
        service_map = notification_type_map.get(service, {})
        
        # Get specific event type or default for the service
        notification_type = service_map.get(event_type, service_map.get('DEFAULT', notification_type_map['DEFAULT']))
        
        return notification_type
        
    def _is_urgent_notification(self, service, event_type, data):
        """
        Determine if a notification is urgent based on service, event type and data.
        """
        # Define urgent event types for each service
        urgent_events = {
            'APPOINTMENT': ['CANCELLED', 'RESCHEDULED'],
            'MEDICAL_RECORD': ['DIAGNOSIS_ADDED'],
            'BILLING': ['PAYMENT_OVERDUE'],
            'LABORATORY': ['RESULTS_READY', 'ABNORMAL_RESULTS'],
            'PHARMACY': ['PRESCRIPTION_READY']
        }
        
        # Check if the event type is in the urgent events list for this service
        service_urgent_events = urgent_events.get(service, [])
        is_urgent = event_type in service_urgent_events
        
        # Special cases based on data
        if service == 'APPOINTMENT' and event_type == 'REMINDER':
            # Appointment reminders within 24 hours are urgent
            if 'appointment_date' in data:
                try:
                    # Simple check if "today" is in the message
                    if 'today' in data.get('message', '').lower():
                        is_urgent = True
                except:
                    pass
        
        # Abnormal lab results are always urgent
        if service == 'LABORATORY' and data.get('is_abnormal') is True:
            is_urgent = True
            
        return is_urgent