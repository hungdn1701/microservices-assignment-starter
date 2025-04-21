"""
Session management utilities for the Healthcare System.
"""
import redis
import json
import uuid
import logging
from datetime import datetime, timedelta
from django.conf import settings

logger = logging.getLogger(__name__)

class SessionManager:
    """
    Manages user sessions, including creation, validation, and termination.
    """
    
    def __init__(self, redis_url=None):
        """
        Initialize the SessionManager.
        
        Args:
            redis_url: Redis URL for session storage. If None, uses settings.REDIS_URL.
        """
        self.redis_url = redis_url or getattr(settings, 'REDIS_URL', None)
        self.session_ttl = getattr(settings, 'SESSION_TTL', 86400)  # Default: 1 day
        self.max_sessions_per_user = getattr(settings, 'MAX_SESSIONS_PER_USER', 5)
    
    def create_session(self, user_id, user_data=None, request=None):
        """
        Create a new session for a user.
        
        Args:
            user_id: The user ID.
            user_data: Additional user data to store in the session.
            request: The HTTP request object (for IP and user agent).
        
        Returns:
            Tuple of (session_id, session_data)
        """
        try:
            if not self.redis_url:
                logger.warning("Redis URL not configured")
                return None, None
            
            r = redis.from_url(self.redis_url)
            
            # Generate session ID
            session_id = str(uuid.uuid4())
            
            # Create session data
            session_data = {
                'user_id': user_id,
                'created_at': datetime.now().isoformat(),
                'last_activity': datetime.now().isoformat(),
            }
            # Add user data if available
            if user_data:
                session_data.update(user_data)
            
            # Add request information if available
            if request:
                session_data.update({
                    'ip_address': self._get_client_ip(request),
                    'user_agent': request.META.get('HTTP_USER_AGENT', '')
                })
            
            # Store session in Redis
            r.setex(
                f"session:{session_id}",
                self.session_ttl,
                json.dumps(session_data)
            )
            
            # Add to user's sessions set
            r.sadd(f"user_sessions:{user_id}", session_id)
            
            # Enforce maximum sessions per user
            self._enforce_max_sessions(user_id, r)
            
            return session_id, session_data
        
        except Exception as e:
            logger.error(f"Error creating session: {str(e)}")
            return None, None
    
    def get_session(self, session_id):
        """
        Get session data by session ID.
        
        Args:
            session_id: The session ID.
        
        Returns:
            dict: Session data or None if not found.
        """
        try:
            if not self.redis_url or not session_id:
                return None
            
            r = redis.from_url(self.redis_url)
            
            # Get session data
            session_data = r.get(f"session:{session_id}")
            if not session_data:
                return None
            
            return json.loads(session_data)
        
        except Exception as e:
            logger.error(f"Error getting session: {str(e)}")
            return None
    
    def update_session(self, session_id, update_data=None, request=None):
        """
        Update session data and extend TTL.
        
        Args:
            session_id: The session ID.
            update_data: Data to update in the session.
            request: The HTTP request object (for IP and user agent).
        
        Returns:
            bool: True if successful, False otherwise.
        """
        try:
            if not self.redis_url or not session_id:
                return False
            
            r = redis.from_url(self.redis_url)
            
            # Get current session data
            session_data = r.get(f"session:{session_id}")
            if not session_data:
                return False
            
            data = json.loads(session_data)
            
            # Update last activity
            data['last_activity'] = datetime.now().isoformat()
            
            # Update with new data
            if update_data:
                data.update(update_data)
            
            # Update with request information if available
            if request:
                data.update({
                    'ip_address': self._get_client_ip(request),
                    'user_agent': request.META.get('HTTP_USER_AGENT', '')
                })
            
            # Store updated session in Redis
            r.setex(
                f"session:{session_id}",
                self.session_ttl,
                json.dumps(data)
            )
            
            return True
        
        except Exception as e:
            logger.error(f"Error updating session: {str(e)}")
            return False
    
    def terminate_session(self, session_id):
        """
        Terminate a session.
        
        Args:
            session_id: The session ID.
        
        Returns:
            bool: True if successful, False otherwise.
        """
        try:
            if not self.redis_url or not session_id:
                return False
            
            r = redis.from_url(self.redis_url)
            
            # Get session data to find user_id
            session_data = r.get(f"session:{session_id}")
            if session_data:
                data = json.loads(session_data)
                user_id = data.get('user_id')
                
                if user_id:
                    # Remove from user's sessions set
                    r.srem(f"user_sessions:{user_id}", session_id)
            
            # Delete session
            r.delete(f"session:{session_id}")
            
            return True
        
        except Exception as e:
            logger.error(f"Error terminating session: {str(e)}")
            return False
    
    def terminate_all_user_sessions(self, user_id):
        """
        Terminate all sessions for a user.
        
        Args:
            user_id: The user ID.
        
        Returns:
            int: Number of sessions terminated.
        """
        try:
            if not self.redis_url:
                return 0
            
            r = redis.from_url(self.redis_url)
            
            # Get all sessions for the user
            session_ids = r.smembers(f"user_sessions:{user_id}")
            count = 0
            
            # Delete each session
            for session_id in session_ids:
                r.delete(f"session:{session_id.decode('utf-8')}")
                count += 1
            
            # Delete the set
            r.delete(f"user_sessions:{user_id}")
            
            return count
        
        except Exception as e:
            logger.error(f"Error terminating user sessions: {str(e)}")
            return 0
    
    def get_user_sessions(self, user_id):
        """
        Get all active sessions for a user.
        
        Args:
            user_id: The user ID.
        
        Returns:
            list: List of session data dictionaries.
        """
        try:
            if not self.redis_url:
                return []
            
            r = redis.from_url(self.redis_url)
            
            # Get all sessions for the user
            session_ids = r.smembers(f"user_sessions:{user_id}")
            sessions = []
            
            # Get data for each session
            for session_id in session_ids:
                session_key = f"session:{session_id.decode('utf-8')}"
                session_data = r.get(session_key)
                
                if session_data:
                    data = json.loads(session_data)
                    data['session_id'] = session_id.decode('utf-8')
                    sessions.append(data)
            
            return sessions
        
        except Exception as e:
            logger.error(f"Error getting user sessions: {str(e)}")
            return []
    
    def _enforce_max_sessions(self, user_id, redis_conn):
        """
        Enforce maximum number of sessions per user.
        
        Args:
            user_id: The user ID.
            redis_conn: Redis connection.
        """
        try:
            # Get all sessions for the user
            session_ids = redis_conn.smembers(f"user_sessions:{user_id}")
            
            # If under the limit, do nothing
            if len(session_ids) <= self.max_sessions_per_user:
                return
            
            # Get session data for all sessions
            sessions = []
            for session_id in session_ids:
                session_key = f"session:{session_id.decode('utf-8')}"
                session_data = redis_conn.get(session_key)
                
                if session_data:
                    data = json.loads(session_data)
                    data['session_id'] = session_id.decode('utf-8')
                    
                    # Parse last activity timestamp
                    try:
                        last_activity = datetime.fromisoformat(data.get('last_activity'))
                        data['last_activity_timestamp'] = last_activity
                    except (ValueError, TypeError):
                        data['last_activity_timestamp'] = datetime.now()
                    
                    sessions.append(data)
            
            # Sort by last activity (oldest first)
            sessions.sort(key=lambda x: x.get('last_activity_timestamp', datetime.now()))
            
            # Remove oldest sessions to get under the limit
            sessions_to_remove = sessions[:len(sessions) - self.max_sessions_per_user]
            
            for session in sessions_to_remove:
                session_id = session.get('session_id')
                if session_id:
                    # Delete session
                    redis_conn.delete(f"session:{session_id}")
                    redis_conn.srem(f"user_sessions:{user_id}", session_id)
        
        except Exception as e:
            logger.error(f"Error enforcing max sessions: {str(e)}")
    
    def _get_client_ip(self, request):
        """
        Get client IP address from request.
        
        Args:
            request: The HTTP request object.
        
        Returns:
            str: IP address.
        """
        x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
        if x_forwarded_for:
            ip = x_forwarded_for.split(',')[0]
        else:
            ip = request.META.get('REMOTE_ADDR')
        return ip
