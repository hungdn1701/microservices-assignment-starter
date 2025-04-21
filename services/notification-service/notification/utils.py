import json
import logging
from asgiref.sync import async_to_sync
from channels.layers import get_channel_layer
from .serializers import InAppNotificationSerializer

logger = logging.getLogger(__name__)

def send_realtime_notification(notification):
    """
    Send a real-time notification to the user via WebSocket.
    
    Args:
        notification: InAppNotification instance
    """
    try:
        channel_layer = get_channel_layer()
        if channel_layer:
            # Create notification group name
            notification_group_name = f'user_{notification.recipient_id}_notifications'
            
            # Serialize notification
            serializer = InAppNotificationSerializer(notification)
            
            # Send notification to group
            async_to_sync(channel_layer.group_send)(
                notification_group_name,
                {
                    'type': 'notification_message',
                    'notification': serializer.data
                }
            )
            logger.info(f"Sent real-time notification to user {notification.recipient_id}")
        else:
            logger.warning("Channel layer not available")
    except Exception as e:
        logger.error(f"Error sending real-time notification: {str(e)}")
