"""
Command to schedule appointment reminders.
"""
import logging
from datetime import datetime, timedelta
from django.core.management.base import BaseCommand
from django.utils import timezone
from notification.models import NotificationSchedule, NotificationTemplate, Notification
from notification.services import get_user_info

logger = logging.getLogger(__name__)


class Command(BaseCommand):
    help = 'Schedules appointment reminders for upcoming appointments'

    def add_arguments(self, parser):
        parser.add_argument(
            '--days-before',
            type=int,
            default=1,
            help='Number of days before the appointment to send the reminder'
        )

    def handle(self, *args, **options):
        days_before = options['days_before']
        self.stdout.write(f'Scheduling appointment reminders {days_before} days before appointment date...')
        
        # Get the appointment reminder templates
        try:
            email_template = NotificationTemplate.objects.get(
                name='Appointment Reminder',
                is_active=True
            )
            sms_template = NotificationTemplate.objects.get(
                name='Appointment Reminder SMS',
                is_active=True
            )
        except NotificationTemplate.DoesNotExist:
            self.stdout.write(self.style.ERROR('Appointment reminder templates not found'))
            return
        
        # In a real implementation, we would query the Appointment Service
        # to get upcoming appointments
        # For this example, we'll simulate it with some test data
        
        # Example test data - in a real implementation, this would come from an API call
        test_appointments = [
            {
                'appointment_id': 401,
                'patient_id': 1,
                'doctor_id': 2,
                'doctor_name': 'Dr. Nguyễn Văn A',
                'appointment_date': timezone.now().date() + timedelta(days=days_before),
                'appointment_time': '09:00',
                'appointment_type': 'Khám tổng quát',
                'location': 'Phòng khám số 3, Tầng 2'
            },
            {
                'appointment_id': 402,
                'patient_id': 3,
                'doctor_id': 4,
                'doctor_name': 'Dr. Trần Thị B',
                'appointment_date': timezone.now().date() + timedelta(days=days_before + 1),
                'appointment_time': '14:30',
                'appointment_type': 'Tư vấn dinh dưỡng',
                'location': 'Phòng tư vấn số 5, Tầng 1'
            }
        ]
        
        scheduled_count = 0
        
        for appointment in test_appointments:
            # Check if a reminder has already been scheduled for this appointment
            existing_schedule = NotificationSchedule.objects.filter(
                recipient_id=appointment['patient_id'],
                notification_type=Notification.NotificationType.APPOINTMENT,
                reference_type='APPOINTMENT',
                reference_id=str(appointment['appointment_id']),
                status=NotificationSchedule.Status.SCHEDULED
            ).exists()
            
            if existing_schedule:
                self.stdout.write(f'Reminder already scheduled for appointment {appointment["appointment_id"]}')
                continue
            
            # Get patient info
            patient_info = get_user_info(appointment['patient_id'], 'PATIENT')
            
            if not patient_info:
                self.stdout.write(self.style.WARNING(f'Could not get info for patient {appointment["patient_id"]}'))
                continue
            
            # Calculate the reminder date (days_before days before the appointment date)
            reminder_date = timezone.now()
            
            # Format appointment date and time for display
            formatted_date = appointment['appointment_date'].strftime('%d/%m/%Y')
            formatted_datetime = f"{formatted_date} {appointment['appointment_time']}"
            
            # Create context data for the template
            context_data = {
                'first_name': patient_info.get('first_name', ''),
                'last_name': patient_info.get('last_name', ''),
                'appointment_date': formatted_datetime,
                'appointment_type': appointment['appointment_type'],
                'doctor_name': appointment['doctor_name'],
                'location': appointment['location']
            }
            
            # Schedule email notification
            if patient_info.get('email'):
                email_schedule = NotificationSchedule(
                    recipient_id=appointment['patient_id'],
                    recipient_type='PATIENT',
                    recipient_email=patient_info.get('email'),
                    notification_type=Notification.NotificationType.APPOINTMENT,
                    channel=Notification.Channel.EMAIL,
                    subject=email_template.subject_template,
                    content=email_template.content_template,
                    scheduled_at=reminder_date,
                    status=NotificationSchedule.Status.SCHEDULED,
                    template=email_template,
                    reference_id=str(appointment['appointment_id']),
                    reference_type='APPOINTMENT'
                )
                email_schedule.save()
                scheduled_count += 1
                self.stdout.write(f'Scheduled email appointment reminder for appointment {appointment["appointment_id"]}')
            
            # Schedule SMS notification if phone is available
            if patient_info.get('phone'):
                sms_schedule = NotificationSchedule(
                    recipient_id=appointment['patient_id'],
                    recipient_type='PATIENT',
                    recipient_phone=patient_info.get('phone'),
                    notification_type=Notification.NotificationType.APPOINTMENT,
                    channel=Notification.Channel.SMS,
                    subject='',
                    content=sms_template.content_template,
                    scheduled_at=reminder_date,
                    status=NotificationSchedule.Status.SCHEDULED,
                    template=sms_template,
                    reference_id=str(appointment['appointment_id']),
                    reference_type='APPOINTMENT'
                )
                sms_schedule.save()
                scheduled_count += 1
                self.stdout.write(f'Scheduled SMS appointment reminder for appointment {appointment["appointment_id"]}')
        
        self.stdout.write(self.style.SUCCESS(f'Successfully scheduled {scheduled_count} appointment reminders.'))
