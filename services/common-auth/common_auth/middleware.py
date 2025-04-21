"""
Middleware for session and authentication management.
"""
import logging
import json
from django.utils.deprecation import MiddlewareMixin
from django.conf import settings
from .session_management import SessionManager
from .token_management import TokenManager

logger = logging.getLogger(__name__)

class SessionMiddleware(MiddlewareMixin):
    """
    Middleware for managing user sessions.
    
    This middleware:
    1. Reads session ID from cookie
    2. Validates and updates the session
    3. Adds session data to request
    4. Sets session cookie in response
    """
    
    def __init__(self, get_response=None):
        super().__init__(get_response)
        self.session_manager = SessionManager()
        self.session_cookie_name = getattr(settings, 'SESSION_COOKIE_NAME', 'healthcare_session')
        self.session_cookie_secure = getattr(settings, 'SESSION_COOKIE_SECURE', False)
        self.session_cookie_httponly = getattr(settings, 'SESSION_COOKIE_HTTPONLY', True)
        self.session_cookie_samesite = getattr(settings, 'SESSION_COOKIE_SAMESITE', 'Lax')
        self.session_ttl = getattr(settings, 'SESSION_TTL', 86400)  # Default: 1 day
    
    def process_request(self, request):
        """
        Process the request before the view is called.
        
        Args:
            request: The HTTP request object.
        """
        # Get session ID from cookie
        session_id = request.COOKIES.get(self.session_cookie_name)
        
        if not session_id:
            # No session cookie, nothing to do
            request.session_data = None
            return
        
        # Get session data
        session_data = self.session_manager.get_session(session_id)
        
        if not session_data:
            # Invalid or expired session
            request.session_data = None
            return
        
        # Update session with current request info
        self.session_manager.update_session(session_id, request=request)
        
        # Add session data to request
        request.session_id = session_id
        request.session_data = session_data
    
    def process_response(self, request, response):
        """
        Process the response after the view is called.
        
        Args:
            request: The HTTP request object.
            response: The HTTP response object.
        
        Returns:
            The processed HTTP response object.
        """
        # Check if we need to set a session cookie
        if hasattr(request, 'session_id') and request.session_id:
            # Set session cookie
            response.set_cookie(
                self.session_cookie_name,
                request.session_id,
                max_age=self.session_ttl,
                secure=self.session_cookie_secure,
                httponly=self.session_cookie_httponly,
                samesite=self.session_cookie_samesite
            )
        
        return response


class TokenRefreshMiddleware(MiddlewareMixin):
    """
    Middleware for refreshing JWT tokens.
    
    This middleware:
    1. Checks if access token is about to expire
    2. Uses refresh token to get a new access token
    3. Sets new tokens in response headers
    """
    
    def __init__(self, get_response=None):
        super().__init__(get_response)
        self.token_manager = TokenManager()
    
    def process_response(self, request, response):
        """
        Process the response after the view is called.
        
        Args:
            request: The HTTP request object.
            response: The HTTP response object.
        
        Returns:
            The processed HTTP response object.
        """
        # Check if token is about to expire
        if 'X-Token-Expiring-Soon' in response.headers:
            # Get refresh token from cookie
            refresh_token = request.COOKIES.get('refresh_token')
            
            if refresh_token:
                try:
                    # Refresh the access token
                    access_token, new_refresh_token, access_expiry, refresh_expiry = (
                        self.token_manager.refresh_access_token(refresh_token)
                    )
                    
                    # Set new tokens in response headers
                    response['X-New-Access-Token'] = access_token
                    
                    # If refresh token was rotated, set it in cookie
                    if new_refresh_token != refresh_token:
                        response.set_cookie(
                            'refresh_token',
                            new_refresh_token,
                            max_age=refresh_expiry - int(datetime.now().timestamp()),
                            secure=getattr(settings, 'SESSION_COOKIE_SECURE', False),
                            httponly=True,
                            samesite='Lax'
                        )
                
                except Exception as e:
                    logger.error(f"Error refreshing token: {str(e)}")
        
        return response
