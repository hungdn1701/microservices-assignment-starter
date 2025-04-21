"""
Integrations with other services in the healthcare system.
"""
import logging
from django.conf import settings
from common_auth import ServiceClient

logger = logging.getLogger(__name__)

# Initialize service clients
billing_client = ServiceClient('BILLING_SERVICE')
notification_client = ServiceClient('NOTIFICATION_SERVICE')


# This function is replaced by ServiceClient


def create_invoice_from_prescription(prescription, dispensing=None, token=None):
    """
    Create an invoice in the Billing Service for a dispensed prescription.

    Args:
        prescription: The Prescription object
        dispensing: The Dispensing object (optional)
        token (str, optional): JWT token for authentication

    Returns:
        dict or None: Invoice data or None if creation failed
    """
    data = {
        'prescription_id': prescription.id,
        'patient_id': prescription.patient_id,
        'apply_insurance': True  # Automatically apply insurance if available
    }

    if dispensing:
        data['dispensing_id'] = dispensing.id

    # Use the billing client to create the invoice
    result = billing_client.post('/create-from-prescription/', data=data, token=token)

    if result:
        logger.info(f"Invoice created for prescription {prescription.id}: {result.get('id')}")
    else:
        logger.warning(f"Failed to create invoice for prescription {prescription.id}")

    return result


def send_notification(user_id, notification_type, message, additional_data=None, token=None):
    """
    Send a notification to a user.

    Args:
        user_id (int): ID of the user to notify
        notification_type (str): Type of notification
        message (str): Notification message
        additional_data (dict, optional): Additional data for the notification
        token (str, optional): JWT token for authentication

    Returns:
        dict or None: Notification data or None if sending failed
    """
    data = {
        "service": "PHARMACY",
        "event_type": notification_type,
        "patient_id": user_id,
        "message": message
    }

    if additional_data:
        data.update(additional_data)

    # Use the notification client to send the notification
    result = notification_client.post('/events', data=data, token=token)

    if result:
        logger.info(f"Notification sent to user {user_id}: {notification_type}")
    else:
        logger.warning(f"Failed to send notification to user {user_id}")

    return result
