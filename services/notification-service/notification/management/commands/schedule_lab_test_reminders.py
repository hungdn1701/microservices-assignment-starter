"""
Command to schedule lab test reminders.
"""
import logging
from datetime import datetime, timedelta
from django.core.management.base import BaseCommand
from django.utils import timezone
from notification.models import NotificationSchedule, NotificationTemplate, Notification
from notification.services import get_user_info

logger = logging.getLogger(__name__)


class Command(BaseCommand):
    help = 'Schedules lab test reminders for upcoming tests'

    def add_arguments(self, parser):
        parser.add_argument(
            '--days-before',
            type=int,
            default=1,
            help='Number of days before the test to send the reminder'
        )

    def handle(self, *args, **options):
        days_before = options['days_before']
        self.stdout.write(f'Scheduling lab test reminders {days_before} days before test date...')
        
        # Get the lab test reminder template
        try:
            template = NotificationTemplate.objects.get(
                name='Lab Test Ordered',
                is_active=True
            )
        except NotificationTemplate.DoesNotExist:
            self.stdout.write(self.style.ERROR('Lab Test Ordered template not found'))
            return
        
        # In a real implementation, we would query the Laboratory Service
        # to get upcoming lab tests
        # For this example, we'll simulate it with some test data
        
        # Example test data - in a real implementation, this would come from an API call
        test_lab_tests = [
            {
                'test_id': 501,
                'patient_id': 1,
                'doctor_id': 2,
                'test_name': 'Xét nghiệm máu tổng quát',
                'test_date': timezone.now().date() + timedelta(days=days_before),
                'test_time': '08:30',
                'location': 'Phòng xét nghiệm số 2, Tầng 1',
                'notes': 'Nhịn ăn 8 giờ trước khi xét nghiệm'
            },
            {
                'test_id': 502,
                'patient_id': 3,
                'doctor_id': 4,
                'test_name': 'Siêu âm ổ bụng',
                'test_date': timezone.now().date() + timedelta(days=days_before + 1),
                'test_time': '10:00',
                'location': 'Phòng siêu âm số 3, Tầng 2',
                'notes': 'Uống đầy đủ nước trước khi siêu âm'
            }
        ]
        
        scheduled_count = 0
        
        for test in test_lab_tests:
            # Check if a reminder has already been scheduled for this test
            existing_schedule = NotificationSchedule.objects.filter(
                recipient_id=test['patient_id'],
                notification_type=Notification.NotificationType.LAB_RESULT,
                reference_type='TEST',
                reference_id=str(test['test_id']),
                status=NotificationSchedule.Status.SCHEDULED
            ).exists()
            
            if existing_schedule:
                self.stdout.write(f'Reminder already scheduled for test {test["test_id"]}')
                continue
            
            # Get patient info
            patient_info = get_user_info(test['patient_id'], 'PATIENT')
            
            if not patient_info or not patient_info.get('email'):
                self.stdout.write(self.style.WARNING(f'Could not get email for patient {test["patient_id"]}'))
                continue
            
            # Calculate the reminder date (days_before days before the test date)
            reminder_date = timezone.now()
            
            # Format test date and time for display
            formatted_date = test['test_date'].strftime('%d/%m/%Y')
            formatted_datetime = f"{formatted_date} {test['test_time']}"
            
            # Create context data for the template
            context_data = {
                'first_name': patient_info.get('first_name', ''),
                'last_name': patient_info.get('last_name', ''),
                'test_name': test['test_name'],
                'test_date': formatted_datetime,
                'location': test.get('location', ''),
                'notes': test.get('notes', '')
            }
            
            # Schedule the notification
            schedule = NotificationSchedule(
                recipient_id=test['patient_id'],
                recipient_type='PATIENT',
                recipient_email=patient_info.get('email'),
                notification_type=Notification.NotificationType.LAB_RESULT,
                channel=Notification.Channel.EMAIL,
                subject=template.subject_template,
                content=template.content_template,
                scheduled_at=reminder_date,
                status=NotificationSchedule.Status.SCHEDULED,
                template=template,
                reference_id=str(test['test_id']),
                reference_type='TEST'
            )
            schedule.save()
            
            scheduled_count += 1
            
            self.stdout.write(f'Scheduled lab test reminder for patient {test["patient_id"]}')
        
        self.stdout.write(self.style.SUCCESS(f'Successfully scheduled {scheduled_count} lab test reminders.'))
