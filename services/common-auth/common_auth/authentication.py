"""
Authentication classes for all services in the Healthcare System.
"""
from rest_framework.authentication import BaseAuthentication
from rest_framework.exceptions import AuthenticationFailed
import jwt
import logging
from django.conf import settings
from django.contrib.auth.models import AnonymousUser
import redis
import json
from datetime import datetime

logger = logging.getLogger(__name__)

class ServiceUser:
    """
    Custom user class for service authentication.
    """
    def __init__(self, user_id, role, email=None, first_name=None, last_name=None, **kwargs):
        self.id = user_id
        self.user_id = user_id  # For compatibility with both formats
        self.role = role
        self.email = email
        self.first_name = first_name
        self.last_name = last_name
        self.is_authenticated = True
        self.is_active = True
        
        # Store additional attributes
        for key, value in kwargs.items():
            setattr(self, key, value)
    
    def __str__(self):
        return f"{self.email} ({self.role})"


class ServiceAuthentication(BaseAuthentication):
    """
    Unified authentication class for all services.
    
    This class handles authentication in two ways:
    1. From headers set by API Gateway (preferred method)
    2. Directly from JWT token (fallback method)
    
    It also checks token validity against a Redis blacklist.
    """
    
    def authenticate(self, request):
        """
        Authenticate the request and return a tuple of (user, auth).
        """
        # Try to authenticate from headers first (API Gateway method)
        user = self._authenticate_from_headers(request)
        if user:
            return (user, None)
        
        # Fallback to token authentication
        return self._authenticate_from_token(request)
    
    def _authenticate_from_headers(self, request):
        """
        Authenticate using headers set by API Gateway.
        """
        user_id = request.META.get('HTTP_X_USER_ID')
        user_role = request.META.get('HTTP_X_USER_ROLE')
        user_email = request.META.get('HTTP_X_USER_EMAIL')
        user_first_name = request.META.get('HTTP_X_USER_FIRST_NAME')
        user_last_name = request.META.get('HTTP_X_USER_LAST_NAME')
        
        if not user_id or not user_role:
            logger.debug("No user ID or role found in headers")
            return None
        
        try:
            # Create user object with information from headers
            user = ServiceUser(
                user_id=int(user_id),
                role=user_role,
                email=user_email,
                first_name=user_first_name,
                last_name=user_last_name
            )
            
            # Check if token is blacklisted
            token_jti = request.META.get('HTTP_X_TOKEN_JTI')
            if token_jti and self._is_token_blacklisted(token_jti):
                logger.warning(f"Blacklisted token used: {token_jti}")
                raise AuthenticationFailed('Token has been revoked')
            
            logger.info(f"Authenticated user from headers: {user_id}, role: {user_role}")
            return user
        except Exception as e:
            logger.error(f"Header authentication error: {str(e)}")
            return None
    
    def _authenticate_from_token(self, request):
        """
        Authenticate using JWT token directly (fallback method).
        """
        auth_header = request.META.get('HTTP_AUTHORIZATION')
        if not auth_header:
            logger.debug("No Authorization header found")
            return None
        
        try:
            # Extract token
            parts = auth_header.split()
            if len(parts) != 2 or parts[0].lower() != 'bearer':
                logger.debug(f"Invalid Authorization header format: {auth_header}")
                return None
            
            token = parts[1]
            
            # Log a portion of the token for debugging (never log full tokens in production)
            token_prefix = token[:10] if len(token) > 10 else token
            logger.debug(f"Authenticating with token prefix: {token_prefix}...")
            
            # Get JWT secret from settings
            jwt_secret = getattr(settings, 'JWT_SECRET', None)
            if not jwt_secret:
                logger.error("JWT_SECRET not configured")
                return None
            
            logger.debug(f"Using JWT_SECRET with length: {len(jwt_secret)}")
            
            # Verify and decode token - USE FIXED SECRET FOR DEBUGGING
            verify_signature = getattr(settings, 'VERIFY_JWT_SIGNATURE', False)
            options = {"verify_signature": verify_signature}
            
            logger.debug(f"Token verification options: {options}")
            
            try:
                # FIXED JWT SECRET FOR DEBUGGING - HARDCODED FOR TESTING
                decoded = jwt.decode(
                    token,
                    'healthcare_jwt_secret_key_2025',  # Fixed secret for debugging
                    algorithms=['HS256'],
                    options=options
                )
                logger.debug("Token decoded successfully with fixed secret")
            except Exception as jwt_err:
                logger.warning(f"Failed to decode with fixed secret: {str(jwt_err)}")
                # Try with configured secret as fallback
                decoded = jwt.decode(
                    token,
                    jwt_secret,
                    algorithms=['HS256'],
                    options=options
                )
                logger.debug("Token decoded successfully with configured secret")
            
            # Log decoded token (except sensitive parts)
            safe_decoded = {k: v for k, v in decoded.items() if k not in ['jti']}
            logger.debug(f"Decoded token: {safe_decoded}")
            
            # Check if token is blacklisted
            if 'jti' in decoded and self._is_token_blacklisted(decoded['jti']):
                logger.warning(f"Blacklisted token used: {decoded['jti']}")
                raise AuthenticationFailed('Token has been revoked')
            
            # Create user from token data
            user_id = decoded.get('user_id') or decoded.get('id')
            if not user_id:
                logger.warning("No user_id found in token")
                return None
            
            user = ServiceUser(
                user_id=user_id,
                role=decoded.get('role'),
                email=decoded.get('email'),
                first_name=decoded.get('first_name'),
                last_name=decoded.get('last_name')
            )
            
            logger.info(f"Authenticated user from token: {user_id}, role: {user.role}")
            return (user, decoded)
        except jwt.ExpiredSignatureError:
            logger.warning("Token has expired")
            raise AuthenticationFailed('Token has expired')
        except jwt.InvalidTokenError as e:
            logger.warning(f"Invalid token: {str(e)}")
            raise AuthenticationFailed('Invalid token')
        except Exception as e:
            logger.error(f"Token authentication error: {str(e)}")
            return None
    
    def _is_token_blacklisted(self, token_jti):
        """
        Check if a token is blacklisted in Redis.
        """
        try:
            redis_url = getattr(settings, 'REDIS_URL', None)
            if not redis_url:
                return False
            
            r = redis.from_url(redis_url)
            blacklisted = r.get(f"blacklist_token:{token_jti}")
            return blacklisted is not None
        except Exception as e:
            logger.error(f"Error checking token blacklist: {str(e)}")
            return False


class SessionAuthentication(ServiceAuthentication):
    """
    Extended authentication that also manages user sessions.
    """
    
    def authenticate(self, request):
        """
        Authenticate and update session information.
        """
        auth_result = super().authenticate(request)
        if not auth_result:
            return None
        
        user, token = auth_result
        
        # Update session information in Redis
        try:
            self._update_session(request, user)
        except Exception as e:
            logger.error(f"Error updating session: {str(e)}")
        
        return auth_result
    
    def _update_session(self, request, user):
        """
        Update user session information in Redis.
        """
        try:
            redis_url = getattr(settings, 'REDIS_URL', None)
            if not redis_url:
                return
            
            r = redis.from_url(redis_url)
            
            # Get session ID from cookie or create a new one
            session_id = request.COOKIES.get('session_id')
            if not session_id:
                return
            
            # Update session data
            session_data = {
                'user_id': user.id,
                'role': user.role,
                'last_activity': datetime.now().isoformat(),
                'ip_address': self._get_client_ip(request),
                'user_agent': request.META.get('HTTP_USER_AGENT', '')
            }
            
            # Store session data in Redis with expiration
            session_ttl = getattr(settings, 'SESSION_TTL', 86400)  # Default: 1 day
            r.setex(
                f"session:{session_id}",
                session_ttl,
                json.dumps(session_data)
            )
            
            # Update user's active sessions list
            r.sadd(f"user_sessions:{user.id}", session_id)
        except Exception as e:
            logger.error(f"Error updating session: {str(e)}")
    
    def _get_client_ip(self, request):
        """
        Get client IP address from request.
        """
        x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
        if x_forwarded_for:
            ip = x_forwarded_for.split(',')[0]
        else:
            ip = request.META.get('REMOTE_ADDR')
        return ip
