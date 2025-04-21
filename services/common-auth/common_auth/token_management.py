"""
Token management utilities for the Healthcare System.
"""
import jwt
import uuid
import redis
import json
import logging
from datetime import datetime, timedelta
from django.conf import settings

logger = logging.getLogger(__name__)

class TokenManager:
    """
    Manages JWT tokens, including creation, validation, and blacklisting.
    """
    
    def __init__(self, redis_url=None):
        """
        Initialize the TokenManager.
        
        Args:
            redis_url: Redis URL for token blacklist. If None, uses settings.REDIS_URL.
        """
        self.redis_url = redis_url or getattr(settings, 'REDIS_URL', None)
        self.jwt_secret = getattr(settings, 'JWT_SECRET', None)
        self.access_token_lifetime = getattr(settings, 'ACCESS_TOKEN_LIFETIME', timedelta(minutes=60))
        self.refresh_token_lifetime = getattr(settings, 'REFRESH_TOKEN_LIFETIME', timedelta(days=7))
        
        if not self.jwt_secret:
            logger.warning("JWT_SECRET not configured")
    
    def create_tokens(self, user_data):
        """
        Create access and refresh tokens for a user.
        
        Args:
            user_data: Dictionary containing user information.
        
        Returns:
            Tuple of (access_token, refresh_token, access_token_expiry, refresh_token_expiry)
        """
        if not self.jwt_secret:
            raise ValueError("JWT_SECRET not configured")
        
        # Generate JTIs (JWT IDs) for both tokens
        access_jti = str(uuid.uuid4())
        refresh_jti = str(uuid.uuid4())
        
        # Calculate expiry times
        now = datetime.utcnow()
        access_expiry = now + self.access_token_lifetime
        refresh_expiry = now + self.refresh_token_lifetime
        
        # Create access token payload
        access_payload = {
            'iat': now,
            'exp': access_expiry,
            'jti': access_jti,
            'token_type': 'access',
            **user_data
        }
        
        # Create refresh token payload
        refresh_payload = {
            'iat': now,
            'exp': refresh_expiry,
            'jti': refresh_jti,
            'token_type': 'refresh',
            'user_id': user_data.get('user_id') or user_data.get('id'),
            'role': user_data.get('role')
        }
        
        # Generate tokens
        access_token = jwt.encode(access_payload, self.jwt_secret, algorithm='HS256')
        refresh_token = jwt.encode(refresh_payload, self.jwt_secret, algorithm='HS256')
        
        # Store token metadata in Redis
        self._store_token_metadata(access_jti, user_data, access_expiry)
        self._store_token_metadata(refresh_jti, user_data, refresh_expiry)
        
        return (
            access_token,
            refresh_token,
            int(access_expiry.timestamp()),
            int(refresh_expiry.timestamp())
        )
    
    def refresh_access_token(self, refresh_token):
        """
        Create a new access token using a refresh token.
        
        Args:
            refresh_token: The refresh token string.
        
        Returns:
            Tuple of (access_token, refresh_token, access_token_expiry, refresh_token_expiry)
            If refresh_token is None, the original refresh token is returned.
        
        Raises:
            ValueError: If the refresh token is invalid or expired.
        """
        if not self.jwt_secret:
            raise ValueError("JWT_SECRET not configured")
        
        try:
            # Decode and validate refresh token
            decoded = jwt.decode(refresh_token, self.jwt_secret, algorithms=['HS256'])
            
            # Check token type
            if decoded.get('token_type') != 'refresh':
                raise ValueError("Not a refresh token")
            
            # Check if token is blacklisted
            if self._is_token_blacklisted(decoded['jti']):
                raise ValueError("Token has been revoked")
            
            # Get user data
            user_id = decoded.get('user_id')
            role = decoded.get('role')
            
            if not user_id or not role:
                raise ValueError("Invalid token payload")
            
            # Create new tokens
            user_data = {
                'user_id': user_id,
                'role': role
            }
            
            # Optionally rotate refresh token
            rotate_refresh = getattr(settings, 'ROTATE_REFRESH_TOKENS', False)
            
            if rotate_refresh:
                # Create new access and refresh tokens
                return self.create_tokens(user_data)
            else:
                # Create only new access token
                now = datetime.utcnow()
                access_expiry = now + self.access_token_lifetime
                access_jti = str(uuid.uuid4())
                
                # Create access token payload
                access_payload = {
                    'iat': now,
                    'exp': access_expiry,
                    'jti': access_jti,
                    'token_type': 'access',
                    **user_data
                }
                
                # Generate access token
                access_token = jwt.encode(access_payload, self.jwt_secret, algorithm='HS256')
                
                # Store token metadata in Redis
                self._store_token_metadata(access_jti, user_data, access_expiry)
                
                # Get refresh token expiry from decoded token
                refresh_expiry = datetime.fromtimestamp(decoded['exp'])
                
                return (
                    access_token,
                    refresh_token,
                    int(access_expiry.timestamp()),
                    int(refresh_expiry.timestamp())
                )
        
        except jwt.ExpiredSignatureError:
            raise ValueError("Refresh token has expired")
        except jwt.InvalidTokenError as e:
            raise ValueError(f"Invalid refresh token: {str(e)}")
    
    def blacklist_token(self, token):
        """
        Add a token to the blacklist.
        
        Args:
            token: The token string to blacklist.
        
        Returns:
            bool: True if successful, False otherwise.
        """
        try:
            # Decode token without verification to get JTI
            decoded = jwt.decode(token, options={"verify_signature": False})
            jti = decoded.get('jti')
            
            if not jti:
                logger.warning("Token has no JTI")
                return False
            
            # Calculate remaining time until token expiry
            exp = decoded.get('exp')
            if not exp:
                logger.warning("Token has no expiry")
                return False
            
            now = datetime.utcnow()
            expiry = datetime.fromtimestamp(exp)
            ttl = max(0, int((expiry - now).total_seconds()))
            
            # Add to blacklist in Redis
            return self._blacklist_token_jti(jti, ttl)
        
        except Exception as e:
            logger.error(f"Error blacklisting token: {str(e)}")
            return False
    
    def blacklist_user_tokens(self, user_id):
        """
        Blacklist all tokens for a specific user.
        
        Args:
            user_id: The user ID.
        
        Returns:
            int: Number of tokens blacklisted.
        """
        try:
            if not self.redis_url:
                logger.warning("Redis URL not configured")
                return 0
            
            r = redis.from_url(self.redis_url)
            
            # Get all tokens for the user
            token_keys = r.keys(f"token:user:{user_id}:*")
            count = 0
            
            for key in token_keys:
                try:
                    # Get token metadata
                    token_data = r.get(key)
                    if not token_data:
                        continue
                    
                    data = json.loads(token_data)
                    jti = data.get('jti')
                    
                    if jti:
                        # Calculate remaining time until token expiry
                        exp = data.get('exp')
                        if not exp:
                            continue
                        
                        now = datetime.utcnow()
                        expiry = datetime.fromtimestamp(exp)
                        ttl = max(0, int((expiry - now).total_seconds()))
                        
                        # Add to blacklist
                        if self._blacklist_token_jti(jti, ttl):
                            count += 1
                except Exception as e:
                    logger.error(f"Error processing token: {str(e)}")
            
            return count
        
        except Exception as e:
            logger.error(f"Error blacklisting user tokens: {str(e)}")
            return 0
    
    def _store_token_metadata(self, jti, user_data, expiry):
        """
        Store token metadata in Redis.
        
        Args:
            jti: The JWT ID.
            user_data: Dictionary containing user information.
            expiry: Token expiry datetime.
        
        Returns:
            bool: True if successful, False otherwise.
        """
        try:
            if not self.redis_url:
                return False
            
            r = redis.from_url(self.redis_url)
            
            # Get user ID
            user_id = user_data.get('user_id') or user_data.get('id')
            if not user_id:
                return False
            
            # Store token metadata
            token_data = {
                'jti': jti,
                'user_id': user_id,
                'role': user_data.get('role'),
                'exp': int(expiry.timestamp()),
                'created_at': int(datetime.utcnow().timestamp())
            }
            
            # Calculate TTL
            now = datetime.utcnow()
            ttl = max(0, int((expiry - now).total_seconds()))
            
            # Store in Redis with expiry
            r.setex(
                f"token:jti:{jti}",
                ttl,
                json.dumps(token_data)
            )
            
            # Store reference by user ID
            r.setex(
                f"token:user:{user_id}:{jti}",
                ttl,
                json.dumps(token_data)
            )
            
            return True
        
        except Exception as e:
            logger.error(f"Error storing token metadata: {str(e)}")
            return False
    
    def _blacklist_token_jti(self, jti, ttl):
        """
        Add a token JTI to the blacklist.
        
        Args:
            jti: The JWT ID.
            ttl: Time to live in seconds.
        
        Returns:
            bool: True if successful, False otherwise.
        """
        try:
            if not self.redis_url:
                return False
            
            r = redis.from_url(self.redis_url)
            
            # Add to blacklist with the same TTL as the token
            r.setex(
                f"blacklist_token:{jti}",
                ttl,
                "1"
            )
            
            return True
        
        except Exception as e:
            logger.error(f"Error blacklisting token JTI: {str(e)}")
            return False
    
    def _is_token_blacklisted(self, jti):
        """
        Check if a token JTI is blacklisted.
        
        Args:
            jti: The JWT ID.
        
        Returns:
            bool: True if blacklisted, False otherwise.
        """
        try:
            if not self.redis_url:
                return False
            
            r = redis.from_url(self.redis_url)
            return r.exists(f"blacklist_token:{jti}") > 0
        
        except Exception as e:
            logger.error(f"Error checking token blacklist: {str(e)}")
            return False
