import json
import logging
from channels.generic.websocket import AsyncWebsocketConsumer
from channels.db import database_sync_to_async
from django.utils import timezone
from rest_framework_simplejwt.tokens import AccessToken
from rest_framework_simplejwt.exceptions import TokenError, InvalidToken
from .models import InAppNotification

logger = logging.getLogger(__name__)

class NotificationConsumer(AsyncWebsocketConsumer):
    """
    WebSocket consumer for handling real-time notifications.
    """

    async def connect(self):
        """
        Called when the WebSocket is handshaking as part of initial connection.
        """
        self.user_id = self.scope['url_route']['kwargs'].get('user_id')
        self.notification_group_name = f'user_{self.user_id}_notifications'

        # Authenticate user
        token = self.scope.get('query_string', b'').decode('utf-8').replace('token=', '')
        if not token:
            # Try to get token from headers
            headers = dict(self.scope.get('headers', []))
            auth_header = headers.get(b'authorization', b'').decode('utf-8')
            if auth_header.startswith('Bearer '):
                token = auth_header.replace('Bearer ', '')

        if not token or not await self.authenticate_token(token, self.user_id):
            logger.warning(f"Authentication failed for user_id: {self.user_id}")
            await self.close()
            return

        # Add to notification group
        await self.channel_layer.group_add(
            self.notification_group_name,
            self.channel_name
        )

        await self.accept()
        logger.info(f"WebSocket connection established for user_id: {self.user_id}")

        # Send unread notifications count on connect
        unread_count = await self.get_unread_count()
        await self.send(text_data=json.dumps({
            'type': 'unread_count',
            'count': unread_count
        }))

    async def disconnect(self, close_code):
        """
        Called when the WebSocket closes for any reason.
        """
        # Leave notification group
        await self.channel_layer.group_discard(
            self.notification_group_name,
            self.channel_name
        )
        logger.info(f"WebSocket connection closed for user_id: {self.user_id}, code: {close_code}")

    async def receive(self, text_data):
        """
        Called when we get a text frame from the client.
        """
        try:
            text_data_json = json.loads(text_data)
            message_type = text_data_json.get('type')

            if message_type == 'mark_as_read':
                notification_id = text_data_json.get('notification_id')
                if notification_id:
                    success = await self.mark_notification_as_read(notification_id)
                    await self.send(text_data=json.dumps({
                        'type': 'mark_as_read_response',
                        'success': success,
                        'notification_id': notification_id
                    }))

                    # Send updated unread count
                    unread_count = await self.get_unread_count()
                    await self.send(text_data=json.dumps({
                        'type': 'unread_count',
                        'count': unread_count
                    }))

            elif message_type == 'get_notifications':
                page = text_data_json.get('page', 1)
                status = text_data_json.get('status', 'UNREAD')
                notifications = await self.get_notifications(page, status)
                await self.send(text_data=json.dumps({
                    'type': 'notifications_list',
                    'notifications': notifications
                }))

            elif message_type == 'ping':
                await self.send(text_data=json.dumps({
                    'type': 'pong',
                    'timestamp': timezone.now().isoformat()
                }))

        except json.JSONDecodeError:
            logger.error(f"Invalid JSON received from user_id: {self.user_id}")
        except Exception as e:
            logger.error(f"Error processing message from user_id: {self.user_id}: {str(e)}")

    async def notification_message(self, event):
        """
        Called when a notification is sent to the notification group.
        """
        # Send notification to WebSocket
        await self.send(text_data=json.dumps({
            'type': 'new_notification',
            'notification': event['notification']
        }))

        # Also send updated unread count
        unread_count = await self.get_unread_count()
        await self.send(text_data=json.dumps({
            'type': 'unread_count',
            'count': unread_count
        }))

    @database_sync_to_async
    def authenticate_token(self, token, user_id):
        """
        Authenticate the user using JWT token.
        """
        try:
            # Verify token
            access_token = AccessToken(token)
            token_user_id = access_token.get('user_id')

            # Check if token user_id matches the requested user_id
            if str(token_user_id) != str(user_id):
                logger.warning(f"Token user_id {token_user_id} does not match requested user_id {user_id}")
                return False

            return True
        except (TokenError, InvalidToken) as e:
            logger.warning(f"Invalid token: {str(e)}")
            return False
        except Exception as e:
            logger.error(f"Authentication error: {str(e)}")
            return False

    @database_sync_to_async
    def get_unread_count(self):
        """
        Get the count of unread notifications for the user.
        """
        try:
            count = InAppNotification.objects.filter(
                recipient_id=self.user_id,
                status='UNREAD'
            ).count()
            return count
        except Exception as e:
            logger.error(f"Error getting unread count for user_id {self.user_id}: {str(e)}")
            return 0

    @database_sync_to_async
    def mark_notification_as_read(self, notification_id):
        """
        Mark a notification as read.
        """
        try:
            notification = InAppNotification.objects.get(
                id=notification_id,
                recipient_id=self.user_id
            )
            notification.status = 'READ'
            notification.read_at = timezone.now()
            notification.save(update_fields=['status', 'read_at', 'updated_at'])
            return True
        except InAppNotification.DoesNotExist:
            logger.warning(f"Notification {notification_id} not found for user_id {self.user_id}")
            return False
        except Exception as e:
            logger.error(f"Error marking notification {notification_id} as read: {str(e)}")
            return False

    @database_sync_to_async
    def get_notifications(self, page=1, status='UNREAD'):
        """
        Get notifications for the user.
        """
        try:
            from django.core.paginator import Paginator
            from .serializers import InAppNotificationSerializer

            # Get notifications
            queryset = InAppNotification.objects.filter(
                recipient_id=self.user_id
            ).order_by('-created_at')

            # Filter by status if provided
            if status and status != 'ALL':
                queryset = queryset.filter(status=status)

            # Paginate results
            paginator = Paginator(queryset, 10)  # 10 items per page
            page_obj = paginator.get_page(page)

            # Serialize notifications
            serializer = InAppNotificationSerializer(page_obj, many=True)

            return {
                'results': serializer.data,
                'count': paginator.count,
                'num_pages': paginator.num_pages,
                'current_page': page
            }
        except Exception as e:
            logger.error(f"Error getting notifications for user_id {self.user_id}: {str(e)}")
            return {
                'results': [],
                'count': 0,
                'num_pages': 1,
                'current_page': page
            }
