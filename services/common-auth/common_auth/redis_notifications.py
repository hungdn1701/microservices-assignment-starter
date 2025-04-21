import json
import logging
import redis
import os
from datetime import datetime
from django.conf import settings

logger = logging.getLogger(__name__)

class RedisNotificationClient:
    """
    Client để gửi và nhận thông báo qua Redis Streams
    """
    def __init__(self, stream_name="notifications", redis_url=None):
        self.stream_name = stream_name
        self._redis_client = None
        self.redis_url = redis_url

    @property
    def redis_client(self):
        """Lazy initialization của Redis client"""
        if self._redis_client is None:
            if not self.redis_url:
                self.redis_url = getattr(settings, 'REDIS_URL', None)
            if not self.redis_url:
                self.redis_url = os.environ.get('REDIS_URL', 'redis://redis:6379/0')
            self._redis_client = redis.from_url(self.redis_url)
        return self._redis_client

    def publish_notification(self, service, event_type, data, recipients=None):
        """
        Gửi thông báo đến Redis Stream
        """
        try:
            notification = {
                "service": service,
                "event_type": event_type,
                "timestamp": datetime.now().isoformat(),
                "recipients": json.dumps(recipients or []),
                "data": json.dumps(data or {})
            }
            message_id = self.redis_client.xadd(
                self.stream_name,
                notification,
                maxlen=100000,
                approximate=True
            )
            logger.info(f"Published notification to Redis Stream {self.stream_name}")
            return message_id
        except Exception as e:
            logger.error(f"Error publishing notification to Redis: {str(e)}")
            return None

    def create_consumer_group(self, group_name):
        """
        Tạo consumer group để xử lý thông báo
        """
        try:
            self.redis_client.xgroup_create(
                self.stream_name,
                group_name,
                id="0",
                mkstream=True
            )
            logger.info(f"Created consumer group {group_name} for stream {self.stream_name}")
        except redis.exceptions.ResponseError as e:
            if "BUSYGROUP" in str(e):
                logger.debug(f"Consumer group {group_name} already exists")
            else:
                raise

    def read_notifications(self, group_name, consumer_name, count=10, block=2000):
        """
        Đọc thông báo từ Redis Stream
        """
        try:
            self.create_consumer_group(group_name)
            messages = self.redis_client.xreadgroup(
                group_name,
                consumer_name,
                {self.stream_name: '>'},
                count=count,
                block=block
            )
            return messages
        except Exception as e:
            logger.error(f"Error reading notifications from Redis: {str(e)}")
            return []

    def acknowledge_message(self, group_name, message_id):
        """
        Xác nhận đã xử lý tin nhắn
        """
        try:
            self.redis_client.xack(self.stream_name, group_name, message_id)
        except Exception as e:
            logger.error(f"Error acknowledging message {message_id}: {str(e)}")

# Helper functions
def get_notification_client():
    return RedisNotificationClient()

def send_notification(service, event_type, data, recipients=None):
    client = get_notification_client()
    return client.publish_notification(service, event_type, data, recipients)