"""
Command to schedule follow-up appointment reminders.
"""
import logging
from datetime import datetime, timedelta
from django.core.management.base import BaseCommand
from django.utils import timezone
from notification.models import NotificationSchedule, NotificationTemplate, Notification
from notification.services import get_user_info

logger = logging.getLogger(__name__)


class Command(BaseCommand):
    help = 'Schedules follow-up appointment reminders based on medical records'

    def add_arguments(self, parser):
        parser.add_argument(
            '--days-before',
            type=int,
            default=7,
            help='Number of days before the recommended follow-up date to send the reminder'
        )

    def handle(self, *args, **options):
        days_before = options['days_before']
        self.stdout.write(f'Scheduling follow-up reminders {days_before} days before recommended date...')
        
        # Get the follow-up appointment reminder template
        try:
            template = NotificationTemplate.objects.get(
                name='Follow-up Appointment Reminder',
                is_active=True
            )
        except NotificationTemplate.DoesNotExist:
            self.stdout.write(self.style.ERROR('Follow-up Appointment Reminder template not found'))
            return
        
        # In a real implementation, we would query the Medical Record Service
        # to get patients with recommended follow-up dates
        # For this example, we'll simulate it with some test data
        
        # Example test data - in a real implementation, this would come from an API call
        test_followups = [
            {
                'patient_id': 1,
                'doctor_id': 2,
                'doctor_name': 'Dr. Nguyễn Văn A',
                'recommended_date': timezone.now().date() + timedelta(days=days_before),
                'reason': 'Kiểm tra sau phẫu thuật'
            },
            {
                'patient_id': 3,
                'doctor_id': 4,
                'doctor_name': 'Dr. Trần Thị B',
                'recommended_date': timezone.now().date() + timedelta(days=days_before + 1),
                'reason': 'Theo dõi huyết áp'
            }
        ]
        
        scheduled_count = 0
        
        for followup in test_followups:
            # Check if a reminder has already been scheduled for this follow-up
            existing_schedule = NotificationSchedule.objects.filter(
                recipient_id=followup['patient_id'],
                notification_type=Notification.NotificationType.APPOINTMENT,
                reference_type='FOLLOWUP',
                reference_id=str(followup.get('record_id', 0)),  # In a real implementation, this would be the actual record ID
                status=NotificationSchedule.Status.SCHEDULED
            ).exists()
            
            if existing_schedule:
                self.stdout.write(f'Reminder already scheduled for patient {followup["patient_id"]}')
                continue
            
            # Get patient info
            patient_info = get_user_info(followup['patient_id'], 'PATIENT')
            
            if not patient_info or not patient_info.get('email'):
                self.stdout.write(self.style.WARNING(f'Could not get email for patient {followup["patient_id"]}'))
                continue
            
            # Calculate the reminder date (days_before days before the recommended follow-up date)
            reminder_date = timezone.now()
            
            # Create context data for the template
            context_data = {
                'first_name': patient_info.get('first_name', ''),
                'last_name': patient_info.get('last_name', ''),
                'doctor_name': followup.get('doctor_name', ''),
                'recommended_date': followup['recommended_date'].strftime('%d/%m/%Y'),
                'reason': followup.get('reason', '')
            }
            
            # Schedule the notification
            schedule = NotificationSchedule(
                recipient_id=followup['patient_id'],
                recipient_type='PATIENT',
                recipient_email=patient_info.get('email'),
                notification_type=Notification.NotificationType.APPOINTMENT,
                channel=Notification.Channel.EMAIL,
                subject=template.subject_template,
                content=template.content_template,
                scheduled_at=reminder_date,
                status=NotificationSchedule.Status.SCHEDULED,
                template=template,
                reference_id=str(followup.get('record_id', 0)),
                reference_type='FOLLOWUP'
            )
            schedule.save()
            
            scheduled_count += 1
            
            self.stdout.write(f'Scheduled follow-up reminder for patient {followup["patient_id"]}')
        
        self.stdout.write(self.style.SUCCESS(f'Successfully scheduled {scheduled_count} follow-up reminders.'))
