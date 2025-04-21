"""
Celery tasks for sending notifications.
"""
import logging
from datetime import datetime
from celery import shared_task
from django.db import transaction
from .models import Notification, NotificationSchedule, NotificationTemplate
from .services import send_email, send_sms, render_template, get_user_info

logger = logging.getLogger(__name__)


@shared_task
def send_email_notification(notification_id):
    """
    Send an email notification.
    """
    try:
        notification = Notification.objects.get(id=notification_id)
        
        # Skip if not an email notification or already sent
        if notification.channel != Notification.Channel.EMAIL or notification.status != Notification.Status.PENDING:
            return False
        
        # Send the email
        success = send_email(
            recipient_email=notification.recipient_email,
            subject=notification.subject,
            content=notification.content
        )
        
        # Update the notification status
        with transaction.atomic():
            if success:
                notification.status = Notification.Status.SENT
                notification.sent_at = datetime.now()
            else:
                notification.status = Notification.Status.FAILED
                notification.error_message = "Failed to send email"
            notification.save()
        
        return success
    except Notification.DoesNotExist:
        logger.error(f"Notification with ID {notification_id} not found")
        return False
    except Exception as e:
        logger.error(f"Error sending email notification {notification_id}: {str(e)}")
        
        # Update the notification status if possible
        try:
            notification.status = Notification.Status.FAILED
            notification.error_message = str(e)
            notification.save()
        except:
            pass
        
        return False


@shared_task
def send_sms_notification(notification_id):
    """
    Send an SMS notification.
    """
    try:
        notification = Notification.objects.get(id=notification_id)
        
        # Skip if not an SMS notification or already sent
        if notification.channel != Notification.Channel.SMS or notification.status != Notification.Status.PENDING:
            return False
        
        # Send the SMS
        success = send_sms(
            recipient_phone=notification.recipient_phone,
            content=notification.content
        )
        
        # Update the notification status
        with transaction.atomic():
            if success:
                notification.status = Notification.Status.SENT
                notification.sent_at = datetime.now()
            else:
                notification.status = Notification.Status.FAILED
                notification.error_message = "Failed to send SMS"
            notification.save()
        
        return success
    except Notification.DoesNotExist:
        logger.error(f"Notification with ID {notification_id} not found")
        return False
    except Exception as e:
        logger.error(f"Error sending SMS notification {notification_id}: {str(e)}")
        
        # Update the notification status if possible
        try:
            notification.status = Notification.Status.FAILED
            notification.error_message = str(e)
            notification.save()
        except:
            pass
        
        return False


@shared_task
def process_scheduled_notifications():
    """
    Process scheduled notifications that are due.
    """
    now = datetime.now()
    scheduled_notifications = NotificationSchedule.objects.filter(
        status=NotificationSchedule.Status.SCHEDULED,
        scheduled_at__lte=now
    )
    
    for schedule in scheduled_notifications:
        try:
            with transaction.atomic():
                # Mark as processing
                schedule.status = NotificationSchedule.Status.PROCESSING
                schedule.save()
                
                # Create a notification
                notification = Notification(
                    recipient_id=schedule.recipient_id,
                    recipient_type=schedule.recipient_type,
                    recipient_email=schedule.recipient_email,
                    recipient_phone=schedule.recipient_phone,
                    notification_type=schedule.notification_type,
                    channel=schedule.channel,
                    subject=schedule.subject,
                    content=schedule.content,
                    reference_id=schedule.reference_id,
                    reference_type=schedule.reference_type,
                    status=Notification.Status.PENDING
                )
                notification.save()
                
                # Send the notification
                if schedule.channel == Notification.Channel.EMAIL:
                    send_email_notification.delay(notification.id)
                elif schedule.channel == Notification.Channel.SMS:
                    send_sms_notification.delay(notification.id)
                
                # Mark as completed
                schedule.status = NotificationSchedule.Status.COMPLETED
                schedule.save()
        except Exception as e:
            logger.error(f"Error processing scheduled notification {schedule.id}: {str(e)}")
            
            # Mark as failed
            try:
                schedule.status = NotificationSchedule.Status.FAILED
                schedule.save()
            except:
                pass


@shared_task
def send_notification_from_template(template_id, recipient_id, recipient_type, context_data=None, reference_id=None, reference_type=None):
    """
    Send a notification using a template.
    """
    if context_data is None:
        context_data = {}
    
    try:
        # Get the template
        template = NotificationTemplate.objects.get(id=template_id, is_active=True)
        
        # Get user info
        user_info = get_user_info(recipient_id, recipient_type)
        
        # Merge context data with user info
        context = {**user_info, **(context_data or {})}
        
        # Render the template
        subject = render_template(template.subject_template, context) if template.subject_template else ""
        content = render_template(template.content_template, context)
        
        # Create a notification
        notification = Notification(
            recipient_id=recipient_id,
            recipient_type=recipient_type,
            notification_type=template.notification_type,
            channel=template.channel,
            subject=subject,
            content=content,
            reference_id=reference_id,
            reference_type=reference_type,
            status=Notification.Status.PENDING
        )
        
        # Set recipient contact info based on channel
        if template.channel == Notification.Channel.EMAIL:
            notification.recipient_email = user_info.get('email')
        elif template.channel == Notification.Channel.SMS:
            notification.recipient_phone = user_info.get('phone')
        
        notification.save()
        
        # Send the notification
        if template.channel == Notification.Channel.EMAIL:
            send_email_notification.delay(notification.id)
        elif template.channel == Notification.Channel.SMS:
            send_sms_notification.delay(notification.id)
        
        return notification.id
    except NotificationTemplate.DoesNotExist:
        logger.error(f"Notification template with ID {template_id} not found or not active")
        return None
    except Exception as e:
        logger.error(f"Error sending notification from template {template_id}: {str(e)}")
        return None
