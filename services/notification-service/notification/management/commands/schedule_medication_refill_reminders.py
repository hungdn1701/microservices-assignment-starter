"""
Command to schedule medication refill reminders.
"""
import logging
from datetime import datetime, timedelta
from django.core.management.base import BaseCommand
from django.utils import timezone
from notification.models import NotificationSchedule, NotificationTemplate, Notification
from notification.services import get_user_info

logger = logging.getLogger(__name__)


class Command(BaseCommand):
    help = 'Schedules medication refill reminders'

    def add_arguments(self, parser):
        parser.add_argument(
            '--days-before',
            type=int,
            default=5,
            help='Number of days before the refill date to send the reminder'
        )

    def handle(self, *args, **options):
        days_before = options['days_before']
        self.stdout.write(f'Scheduling medication refill reminders {days_before} days before refill date...')
        
        # Get the medication refill reminder templates
        try:
            email_template = NotificationTemplate.objects.get(
                name='Medication Refill Due',
                is_active=True
            )
            sms_template = NotificationTemplate.objects.get(
                name='Medication Refill Due SMS',
                is_active=True
            )
        except NotificationTemplate.DoesNotExist:
            self.stdout.write(self.style.ERROR('Medication refill reminder templates not found'))
            return
        
        # In a real implementation, we would query the Pharmacy Service
        # to get medications with upcoming refill dates
        # For this example, we'll simulate it with some test data
        
        # Example test data - in a real implementation, this would come from an API call
        test_medications = [
            {
                'medication_id': 201,
                'patient_id': 1,
                'medication_name': 'Amoxicillin 500mg',
                'refill_date': timezone.now().date() + timedelta(days=days_before),
                'prescription_id': 301
            },
            {
                'medication_id': 202,
                'patient_id': 3,
                'medication_name': 'Lisinopril 10mg',
                'refill_date': timezone.now().date() + timedelta(days=days_before + 1),
                'prescription_id': 302
            }
        ]
        
        scheduled_count = 0
        
        for medication in test_medications:
            # Check if a reminder has already been scheduled for this medication
            existing_schedule = NotificationSchedule.objects.filter(
                recipient_id=medication['patient_id'],
                notification_type=Notification.NotificationType.PRESCRIPTION,
                reference_type='MEDICATION',
                reference_id=str(medication['medication_id']),
                status=NotificationSchedule.Status.SCHEDULED
            ).exists()
            
            if existing_schedule:
                self.stdout.write(f'Reminder already scheduled for medication {medication["medication_id"]}')
                continue
            
            # Get patient info
            patient_info = get_user_info(medication['patient_id'], 'PATIENT')
            
            if not patient_info:
                self.stdout.write(self.style.WARNING(f'Could not get info for patient {medication["patient_id"]}'))
                continue
            
            # Calculate the reminder date (days_before days before the refill date)
            reminder_date = timezone.now()
            
            # Format refill date for display
            formatted_refill_date = medication['refill_date'].strftime('%d/%m/%Y')
            
            # Create context data for the template
            context_data = {
                'first_name': patient_info.get('first_name', ''),
                'last_name': patient_info.get('last_name', ''),
                'medication_name': medication['medication_name'],
                'refill_date': formatted_refill_date
            }
            
            # Schedule email notification
            if patient_info.get('email'):
                email_schedule = NotificationSchedule(
                    recipient_id=medication['patient_id'],
                    recipient_type='PATIENT',
                    recipient_email=patient_info.get('email'),
                    notification_type=Notification.NotificationType.PRESCRIPTION,
                    channel=Notification.Channel.EMAIL,
                    subject=email_template.subject_template,
                    content=email_template.content_template,
                    scheduled_at=reminder_date,
                    status=NotificationSchedule.Status.SCHEDULED,
                    template=email_template,
                    reference_id=str(medication['medication_id']),
                    reference_type='MEDICATION'
                )
                email_schedule.save()
                scheduled_count += 1
                self.stdout.write(f'Scheduled email medication refill reminder for medication {medication["medication_id"]}')
            
            # Schedule SMS notification if phone is available
            if patient_info.get('phone'):
                sms_schedule = NotificationSchedule(
                    recipient_id=medication['patient_id'],
                    recipient_type='PATIENT',
                    recipient_phone=patient_info.get('phone'),
                    notification_type=Notification.NotificationType.PRESCRIPTION,
                    channel=Notification.Channel.SMS,
                    subject='',
                    content=sms_template.content_template,
                    scheduled_at=reminder_date,
                    status=NotificationSchedule.Status.SCHEDULED,
                    template=sms_template,
                    reference_id=str(medication['medication_id']),
                    reference_type='MEDICATION'
                )
                sms_schedule.save()
                scheduled_count += 1
                self.stdout.write(f'Scheduled SMS medication refill reminder for medication {medication["medication_id"]}')
        
        self.stdout.write(self.style.SUCCESS(f'Successfully scheduled {scheduled_count} medication refill reminders.'))
