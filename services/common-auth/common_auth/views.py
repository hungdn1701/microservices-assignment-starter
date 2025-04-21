"""
Views for authentication and session management.
"""
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from django.conf import settings
from datetime import datetime
import logging

from .token_management import TokenManager
from .session_management import SessionManager
from .permissions import HasRole

logger = logging.getLogger(__name__)

class TokenRefreshView(APIView):
    """
    View for refreshing access tokens using refresh tokens.
    """
    
    def post(self, request):
        """
        Refresh an access token using a refresh token.
        
        Request body:
            refresh_token: The refresh token.
        
        Returns:
            Response with new access token and optionally new refresh token.
        """
        refresh_token = request.data.get('refresh_token')
        
        if not refresh_token:
            # Try to get refresh token from cookie
            refresh_token = request.COOKIES.get('refresh_token')
            
            if not refresh_token:
                return Response(
                    {'error': 'Refresh token is required'},
                    status=status.HTTP_400_BAD_REQUEST
                )
        
        try:
            token_manager = TokenManager()
            access_token, new_refresh_token, access_expiry, refresh_expiry = (
                token_manager.refresh_access_token(refresh_token)
            )
            
            response_data = {
                'access_token': access_token,
                'access_token_expiry': access_expiry
            }
            
            # If refresh token was rotated, include it in response
            if new_refresh_token != refresh_token:
                response_data['refresh_token'] = new_refresh_token
                response_data['refresh_token_expiry'] = refresh_expiry
            
            response = Response(response_data)
            
            # Set refresh token in cookie
            if new_refresh_token != refresh_token:
                response.set_cookie(
                    'refresh_token',
                    new_refresh_token,
                    max_age=refresh_expiry - int(datetime.now().timestamp()),
                    secure=getattr(settings, 'SESSION_COOKIE_SECURE', False),
                    httponly=True,
                    samesite='Lax'
                )
            
            return response
        
        except Exception as e:
            logger.error(f"Error refreshing token: {str(e)}")
            return Response(
                {'error': str(e)},
                status=status.HTTP_401_UNAUTHORIZED
            )


class LogoutView(APIView):
    """
    View for logging out users.
    """
    permission_classes = [IsAuthenticated]
    
    def post(self, request):
        """
        Log out a user by blacklisting their tokens and terminating their session.
        
        Request body:
            refresh_token: The refresh token to blacklist.
            terminate_all_sessions: Whether to terminate all user sessions.
        
        Returns:
            Response indicating success or failure.
        """
        try:
            # Blacklist access token
            auth_header = request.META.get('HTTP_AUTHORIZATION', '')
            if auth_header.startswith('Bearer '):
                access_token = auth_header[7:]
                token_manager = TokenManager()
                token_manager.blacklist_token(access_token)
            
            # Blacklist refresh token
            refresh_token = request.data.get('refresh_token')
            if not refresh_token:
                refresh_token = request.COOKIES.get('refresh_token')
            
            if refresh_token:
                token_manager = TokenManager()
                token_manager.blacklist_token(refresh_token)
            
            # Terminate session
            session_id = request.COOKIES.get(
                getattr(settings, 'SESSION_COOKIE_NAME', 'healthcare_session')
            )
            
            if session_id:
                session_manager = SessionManager()
                session_manager.terminate_session(session_id)
            
            # Optionally terminate all user sessions
            terminate_all = request.data.get('terminate_all_sessions', False)
            if terminate_all and hasattr(request.user, 'id'):
                session_manager = SessionManager()
                session_manager.terminate_all_user_sessions(request.user.id)
                
                # Blacklist all user tokens
                token_manager = TokenManager()
                token_manager.blacklist_user_tokens(request.user.id)
            
            # Create response
            response = Response({'message': 'Successfully logged out'})
            
            # Clear cookies
            response.delete_cookie(
                getattr(settings, 'SESSION_COOKIE_NAME', 'healthcare_session')
            )
            response.delete_cookie('refresh_token')
            
            return response
        
        except Exception as e:
            logger.error(f"Error logging out: {str(e)}")
            return Response(
                {'error': str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


class SessionView(APIView):
    """
    View for managing user sessions.
    """
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        """
        Get all active sessions for the current user.
        
        Returns:
            Response with list of sessions.
        """
        try:
            user_id = request.user.id
            session_manager = SessionManager()
            sessions = session_manager.get_user_sessions(user_id)
            
            return Response(sessions)
        
        except Exception as e:
            logger.error(f"Error getting sessions: {str(e)}")
            return Response(
                {'error': str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
    
    def delete(self, request):
        """
        Terminate a specific session or all sessions.
        
        Query parameters:
            session_id: ID of the session to terminate. If not provided, terminates all sessions.
        
        Returns:
            Response indicating success or failure.
        """
        try:
            user_id = request.user.id
            session_manager = SessionManager()
            
            # Get session ID from query parameters
            session_id = request.query_params.get('session_id')
            
            if session_id:
                # Verify that the session belongs to the user
                session_data = session_manager.get_session(session_id)
                if not session_data or str(session_data.get('user_id')) != str(user_id):
                    return Response(
                        {'error': 'Session not found or does not belong to user'},
                        status=status.HTTP_404_NOT_FOUND
                    )
                
                # Terminate the session
                session_manager.terminate_session(session_id)
                return Response({'message': 'Session terminated'})
            else:
                # Terminate all sessions
                count = session_manager.terminate_all_user_sessions(user_id)
                return Response({'message': f'{count} sessions terminated'})
        
        except Exception as e:
            logger.error(f"Error terminating sessions: {str(e)}")
            return Response(
                {'error': str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


class AdminSessionView(APIView):
    """
    Admin view for managing user sessions.
    """
    permission_classes = [IsAuthenticated, HasRole('ADMIN')]
    
    def get(self, request):
        """
        Get all active sessions for a specific user.
        
        Query parameters:
            user_id: ID of the user to get sessions for.
        
        Returns:
            Response with list of sessions.
        """
        try:
            user_id = request.query_params.get('user_id')
            if not user_id:
                return Response(
                    {'error': 'user_id is required'},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            session_manager = SessionManager()
            sessions = session_manager.get_user_sessions(user_id)
            
            return Response(sessions)
        
        except Exception as e:
            logger.error(f"Error getting sessions: {str(e)}")
            return Response(
                {'error': str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
    
    def delete(self, request):
        """
        Terminate all sessions for a specific user.
        
        Query parameters:
            user_id: ID of the user to terminate sessions for.
        
        Returns:
            Response indicating success or failure.
        """
        try:
            user_id = request.query_params.get('user_id')
            if not user_id:
                return Response(
                    {'error': 'user_id is required'},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            session_manager = SessionManager()
            count = session_manager.terminate_all_user_sessions(user_id)
            
            # Also blacklist all user tokens
            token_manager = TokenManager()
            token_manager.blacklist_user_tokens(user_id)
            
            return Response({'message': f'{count} sessions terminated'})
        
        except Exception as e:
            logger.error(f"Error terminating sessions: {str(e)}")
            return Response(
                {'error': str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
