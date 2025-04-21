"""
Command to schedule payment reminders.
"""
import logging
from datetime import datetime, timedelta
from django.core.management.base import BaseCommand
from django.utils import timezone
from notification.models import NotificationSchedule, NotificationTemplate, Notification
from notification.services import get_user_info

logger = logging.getLogger(__name__)


class Command(BaseCommand):
    help = 'Schedules payment reminders for upcoming due dates'

    def add_arguments(self, parser):
        parser.add_argument(
            '--days-before',
            type=int,
            default=3,
            help='Number of days before the due date to send the reminder'
        )

    def handle(self, *args, **options):
        days_before = options['days_before']
        self.stdout.write(f'Scheduling payment reminders {days_before} days before due date...')
        
        # Get the payment reminder templates
        try:
            email_template = NotificationTemplate.objects.get(
                name='Payment Due Reminder',
                is_active=True
            )
            sms_template = NotificationTemplate.objects.get(
                name='Payment Due Reminder SMS',
                is_active=True
            )
        except NotificationTemplate.DoesNotExist:
            self.stdout.write(self.style.ERROR('Payment reminder templates not found'))
            return
        
        # In a real implementation, we would query the Billing Service
        # to get invoices with upcoming due dates
        # For this example, we'll simulate it with some test data
        
        # Example test data - in a real implementation, this would come from an API call
        test_invoices = [
            {
                'invoice_id': 101,
                'patient_id': 1,
                'amount': 500000,
                'due_date': timezone.now().date() + timedelta(days=days_before),
                'invoice_number': 'INV-2023-101'
            },
            {
                'invoice_id': 102,
                'patient_id': 3,
                'amount': 750000,
                'due_date': timezone.now().date() + timedelta(days=days_before + 1),
                'invoice_number': 'INV-2023-102'
            }
        ]
        
        scheduled_count = 0
        
        for invoice in test_invoices:
            # Check if a reminder has already been scheduled for this invoice
            existing_schedule = NotificationSchedule.objects.filter(
                recipient_id=invoice['patient_id'],
                notification_type=Notification.NotificationType.BILLING,
                reference_type='INVOICE',
                reference_id=str(invoice['invoice_id']),
                status=NotificationSchedule.Status.SCHEDULED
            ).exists()
            
            if existing_schedule:
                self.stdout.write(f'Reminder already scheduled for invoice {invoice["invoice_id"]}')
                continue
            
            # Get patient info
            patient_info = get_user_info(invoice['patient_id'], 'PATIENT')
            
            if not patient_info:
                self.stdout.write(self.style.WARNING(f'Could not get info for patient {invoice["patient_id"]}'))
                continue
            
            # Calculate the reminder date (days_before days before the due date)
            reminder_date = timezone.now()
            
            # Format amount and due date for display
            formatted_amount = f"{invoice['amount']:,}"
            formatted_due_date = invoice['due_date'].strftime('%d/%m/%Y')
            
            # Create context data for the template
            context_data = {
                'first_name': patient_info.get('first_name', ''),
                'last_name': patient_info.get('last_name', ''),
                'invoice_number': invoice['invoice_number'],
                'amount': formatted_amount,
                'due_date': formatted_due_date
            }
            
            # Schedule email notification
            if patient_info.get('email'):
                email_schedule = NotificationSchedule(
                    recipient_id=invoice['patient_id'],
                    recipient_type='PATIENT',
                    recipient_email=patient_info.get('email'),
                    notification_type=Notification.NotificationType.BILLING,
                    channel=Notification.Channel.EMAIL,
                    subject=email_template.subject_template,
                    content=email_template.content_template,
                    scheduled_at=reminder_date,
                    status=NotificationSchedule.Status.SCHEDULED,
                    template=email_template,
                    reference_id=str(invoice['invoice_id']),
                    reference_type='INVOICE'
                )
                email_schedule.save()
                scheduled_count += 1
                self.stdout.write(f'Scheduled email payment reminder for invoice {invoice["invoice_id"]}')
            
            # Schedule SMS notification if phone is available
            if patient_info.get('phone'):
                sms_schedule = NotificationSchedule(
                    recipient_id=invoice['patient_id'],
                    recipient_type='PATIENT',
                    recipient_phone=patient_info.get('phone'),
                    notification_type=Notification.NotificationType.BILLING,
                    channel=Notification.Channel.SMS,
                    subject='',
                    content=sms_template.content_template,
                    scheduled_at=reminder_date,
                    status=NotificationSchedule.Status.SCHEDULED,
                    template=sms_template,
                    reference_id=str(invoice['invoice_id']),
                    reference_type='INVOICE'
                )
                sms_schedule.save()
                scheduled_count += 1
                self.stdout.write(f'Scheduled SMS payment reminder for invoice {invoice["invoice_id"]}')
        
        self.stdout.write(self.style.SUCCESS(f'Successfully scheduled {scheduled_count} payment reminders.'))
