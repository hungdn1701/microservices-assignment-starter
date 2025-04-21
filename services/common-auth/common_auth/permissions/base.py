"""
Base permissions for the healthcare system.
These classes provide the foundation for all other permissions.
"""
from rest_framework import permissions
import logging

logger = logging.getLogger(__name__)


class BasePermission(permissions.BasePermission):
    """
    Base class for all permissions in the healthcare system.
    Includes common utility methods and logging.
    """
    
    def log_access_denied(self, request, reason=None):
        """
        Log access denied events with appropriate details.
        """
        user_id = getattr(request.user, 'id', 'unknown')
        user_role = getattr(request.user, 'role', 'unknown')
        
        message = f"Access denied: User {user_id} with role {user_role}"
        if reason:
            message += f" - Reason: {reason}"
        
        logger.warning(message)
    
    def log_access_granted(self, request, resource=None):
        """
        Log access granted events for auditing.
        """
        user_id = getattr(request.user, 'id', 'unknown')
        user_role = getattr(request.user, 'role', 'unknown')
        
        message = f"Access granted: User {user_id} with role {user_role}"
        if resource:
            message += f" to resource {resource}"
            
        logger.info(message)
    
    def is_owner(self, request, obj, owner_field='user_id'):
        """
        Check if the user is the owner of the object.
        
        Args:
            request: The request object
            obj: The object to check ownership for
            owner_field: The field on the object that contains the owner's ID
            
        Returns:
            bool: True if the user is the owner, False otherwise
        """
        user_id = getattr(request.user, 'id', None)
        owner_id = getattr(obj, owner_field, None)
        
        return str(user_id) == str(owner_id)
    
    def get_object_identifier(self, obj):
        """
        Get a string identifier for the object for logging purposes.
        
        Args:
            obj: The object to identify
            
        Returns:
            str: An identifier for the object
        """
        if hasattr(obj, 'id'):
            return f"{obj.__class__.__name__}#{obj.id}"
        return obj.__class__.__name__


class AllowAny(BasePermission):
    """
    Permission to allow any access.
    Use for public endpoints like login, register, and public information.
    """
    def has_permission(self, request, view):
        return True
    
    def has_object_permission(self, request, view, obj):
        return True


class IsAuthenticated(BasePermission):
    """
    Permission to check if the user is authenticated.
    This is the base requirement for most protected endpoints.
    """
    def has_permission(self, request, view):
        is_authenticated = bool(request.user and hasattr(request.user, 'is_authenticated') and request.user.is_authenticated)
        
        if not is_authenticated:
            self.log_access_denied(request, "User is not authenticated")
        
        return is_authenticated
    
    def has_object_permission(self, request, view, obj):
        return self.has_permission(request, view)


class ReadOnly(BasePermission):
    """
    Permission to allow only read-only methods (GET, HEAD, OPTIONS).
    Use for endpoints where users can view but not modify data.
    """
    def has_permission(self, request, view):
        return request.method in permissions.SAFE_METHODS


class HasResourceAccess(BasePermission):
    """
    Permission to check if the user has access to a specific resource.
    This can be extended for different resources in the healthcare system.
    """
    def __init__(self, resource_type=None, required_access=None):
        """
        Initialize with resource type and required access level.
        
        Args:
            resource_type: The type of resource to check access for (e.g., 'patient', 'appointment')
            required_access: The access level required (e.g., 'read', 'write', 'admin')
        """
        self.resource_type = resource_type
        self.required_access = required_access or 'read'
    
    def has_permission(self, request, view):
        """
        Check if the user has permission to access the resource type.
        """
        if not request.user or not hasattr(request.user, 'is_authenticated') or not request.user.is_authenticated:
            self.log_access_denied(request, "User is not authenticated")
            return False
        
        # Admin users have access to all resources
        if getattr(request.user, 'role', '') == 'ADMIN':
            return True
        
        # For now, simplify and return True for authenticated users
        # This should be extended with actual access control logic
        return True
    
    def has_object_permission(self, request, view, obj):
        """
        Check if the user has permission to access the specific object.
        """
        if not request.user or not hasattr(request.user, 'is_authenticated') or not request.user.is_authenticated:
            self.log_access_denied(request, "User is not authenticated")
            return False
        
        # Admin users have access to all objects
        if getattr(request.user, 'role', '') == 'ADMIN':
            return True
        
        # Check if user is the owner of the resource
        if hasattr(obj, 'user') and obj.user == request.user:
            return True
        
        # Default implementation - should be overridden by resource-specific permissions
        return False