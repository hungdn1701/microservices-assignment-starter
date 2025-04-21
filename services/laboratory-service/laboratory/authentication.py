"""
Proxy module for authentication from common-auth package.
This file exists to maintain backward compatibility.
"""
from common_auth.authentication import ServiceAuthentication

# Re-export for backward compatibility
CustomJWTAuthentication = ServiceAuthentication