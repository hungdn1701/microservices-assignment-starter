"""
Services for sending notifications.
"""
import logging
import os
from datetime import datetime
from django.core.mail import send_mail
from django.conf import settings
from django.template import Template, Context

logger = logging.getLogger(__name__)

# Try to import SendGrid if it's configured
try:
    if settings.USE_SENDGRID and settings.SENDGRID_API_KEY:
        import sendgrid
        from sendgrid.helpers.mail import Mail, Email, To, Content
        sg = sendgrid.SendGridAPIClient(api_key=settings.SENDGRID_API_KEY)
except (ImportError, AttributeError):
    logger.warning("SendGrid is not properly configured")

# Try to import Twilio if it's configured
try:
    if settings.USE_TWILIO and settings.TWILIO_ACCOUNT_SID and settings.TWILIO_AUTH_TOKEN:
        from twilio.rest import Client
        twilio_client = Client(settings.TWILIO_ACCOUNT_SID, settings.TWILIO_AUTH_TOKEN)
except (ImportError, AttributeError):
    logger.warning("Twilio is not properly configured")


def send_email(recipient_email, subject, content, from_email=None):
    """
    Send an email notification.
    """
    if not from_email:
        from_email = settings.DEFAULT_FROM_EMAIL

    try:
        # Use SendGrid if configured
        if hasattr(settings, 'USE_SENDGRID') and settings.USE_SENDGRID and hasattr(settings, 'SENDGRID_API_KEY') and settings.SENDGRID_API_KEY:
            message = Mail(
                from_email=Email(from_email),
                to_emails=To(recipient_email),
                subject=subject,
                html_content=Content("text/html", content)
            )
            response = sg.send(message)
            return response.status_code == 202
        # Otherwise use Django's send_mail
        else:
            sent = send_mail(
                subject=subject,
                message="",
                html_message=content,
                from_email=from_email,
                recipient_list=[recipient_email],
                fail_silently=False,
            )
            return sent > 0
    except Exception as e:
        logger.error(f"Error sending email to {recipient_email}: {str(e)}")
        return False


def send_sms(recipient_phone, content):
    """
    Send an SMS notification.
    """
    try:
        # Use Twilio if configured
        if hasattr(settings, 'USE_TWILIO') and settings.USE_TWILIO and hasattr(settings, 'TWILIO_ACCOUNT_SID') and settings.TWILIO_AUTH_TOKEN:
            message = twilio_client.messages.create(
                body=content,
                from_=settings.TWILIO_PHONE_NUMBER,
                to=recipient_phone
            )
            return message.sid is not None
        else:
            logger.warning("Twilio is not configured, SMS not sent")
            return False
    except Exception as e:
        logger.error(f"Error sending SMS to {recipient_phone}: {str(e)}")
        return False


def render_template(template_content, context_data):
    """
    Render a template with the given context data.
    """
    try:
        template = Template(template_content)
        context = Context(context_data)
        return template.render(context)
    except Exception as e:
        logger.error(f"Error rendering template: {str(e)}")
        return template_content


def get_user_info(user_id, user_type):
    """
    Get user information from the User Service.
    """
    import requests
    import os
    from django.conf import settings

    # Get User Service URL from settings or environment variable
    user_service_url = getattr(settings, 'USER_SERVICE_URL', os.environ.get('USER_SERVICE_URL', 'http://user-service:8000'))

    try:
        # Make API call to User Service
        response = requests.get(
            f"{user_service_url}/api/users/{user_id}/",
            headers={
                'X-User-ID': str(user_id),
                'X-User-Role': user_type
            },
            timeout=5  # 5 seconds timeout
        )

        if response.status_code == 200:
            user_data = response.json()

            # Get contact information
            contact_response = requests.get(
                f"{user_service_url}/api/contact-info/?user_id={user_id}",
                headers={
                    'X-User-ID': str(user_id),
                    'X-User-Role': user_type
                },
                timeout=5
            )

            contact_data = {}
            if contact_response.status_code == 200:
                contacts = contact_response.json()
                if contacts and 'results' in contacts and len(contacts['results']) > 0:
                    for contact in contacts['results']:
                        if contact['contact_type'] == 'EMAIL':
                            contact_data['email'] = contact['value']
                        elif contact['contact_type'] == 'PHONE':
                            contact_data['phone'] = contact['value']

            # Combine user data with contact data
            return {
                'id': user_data.get('id'),
                'email': contact_data.get('email', user_data.get('email')),
                'phone': contact_data.get('phone'),
                'first_name': user_data.get('first_name'),
                'last_name': user_data.get('last_name'),
                'type': user_type
            }
        else:
            logger.error(f"Failed to get user info from User Service: {response.status_code} - {response.text}")
    except Exception as e:
        logger.error(f"Error getting user info from User Service: {str(e)}")

    # Fallback to basic info if API call fails
    return {
        'id': user_id,
        'email': f"user{user_id}@example.com",
        'phone': f"+1234567890{user_id}",
        'first_name': f"User{user_id}",
        'last_name': "Test",
        'type': user_type
    }
