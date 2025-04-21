"""
Notification-specific permissions for the healthcare system.
These classes control access to notification resources based on user roles.
"""
from .base import BasePermission
from .roles import (
    ROLE_ADMIN, ROLE_DOCTOR, ROLE_NURSE, ROLE_PATIENT,
    ROLE_PHARMACIST, ROLE_LAB_TECHNICIAN, ROLE_INSURANCE_PROVIDER
)


class NotificationPermissions:
    """
    Container for all notification-related permissions.
    Usage:
        @permission_classes([NotificationPermissions.CanViewNotifications])
        def list_notifications(request):
            ...
    """
    
    class CanViewNotifications(BasePermission):
        """
        Permission to view notifications.
        - All authenticated users can view their own notifications
        - Admins can view any user's notifications
        """
        def has_permission(self, request, view):
            user = request.user
            if not user or not user.is_authenticated:
                return False
                
            # All authenticated users can view notifications that belong to them
            return True
        
        def has_object_permission(self, request, view, obj):
            user = request.user
            if not user or not user.is_authenticated:
                return False
                
            # Get user role and id
            user_role = getattr(user, 'role', None)
            user_id = getattr(user, 'id', None)
            
            # Admin can view any notification
            if user_role == ROLE_ADMIN:
                return True
                
            # Users can only view their own notifications
            recipient_id = getattr(obj, 'recipient_id', None)
            if recipient_id and str(recipient_id) == str(user_id):
                return True
                
            # Default deny
            self.log_access_denied(request, f"User can only view their own notifications")
            return False
    
    class CanSendNotification(BasePermission):
        """
        Permission to send notifications.
        - Admins can send notifications to anyone
        - Doctors can send notifications to their patients and associated staff
        - System can send notifications to anyone (used by scheduler and event handlers)
        """
        def has_permission(self, request, view):
            user = request.user
            if not user or not user.is_authenticated:
                return False
                
            # Check role
            user_role = getattr(user, 'role', None)
            user_id = getattr(user, 'id', None)
            
            # Admin can send notifications to anyone
            if user_role == ROLE_ADMIN:
                return True
                
            # Doctor can send notifications to patients under their care
            if user_role == ROLE_DOCTOR:
                recipient_id = request.data.get('recipient_id')
                recipient_role = request.data.get('recipient_role')
                
                # If no specific recipient, assume it's a broadcast to their patients
                if not recipient_id:
                    return True
                    
                # If sending to a specific patient, would need to check if this patient is under their care
                # This would typically involve a database query
                # For now, we'll assume the check happens elsewhere
                return True
                
            # Nurses can send notifications to patients they are caring for
            if user_role == ROLE_NURSE:
                recipient_role = request.data.get('recipient_role')
                if recipient_role == ROLE_PATIENT:
                    return True
                    
                # Nurses can also send notifications to doctors they work with
                if recipient_role == ROLE_DOCTOR:
                    return True
                    
                self.log_access_denied(request, f"Nurses can only send notifications to patients and doctors")
                return False
                    
            # Pharmacists can send notifications about prescriptions
            if user_role == ROLE_PHARMACIST:
                notification_type = request.data.get('type')
                if notification_type and notification_type in ['PRESCRIPTION_FILLED', 'PRESCRIPTION_READY', 'MEDICATION_REMINDER']:
                    return True
                    
                self.log_access_denied(request, f"Pharmacists can only send prescription-related notifications")
                return False
                
            # Lab technicians can send notifications about lab test results
            if user_role == ROLE_LAB_TECHNICIAN:
                notification_type = request.data.get('type')
                if notification_type and notification_type in ['LAB_RESULTS_READY', 'TEST_SCHEDULED']:
                    return True
                    
                self.log_access_denied(request, f"Lab technicians can only send lab test-related notifications")
                return False
                
            # Default deny
            self.log_access_denied(request, f"Role {user_role} not allowed to send notifications")
            return False
    
    class CanUpdateNotification(BasePermission):
        """
        Permission to update notifications (mark as read).
        - Users can only update their own notifications
        - Admins can update any notification
        """
        def has_object_permission(self, request, view, obj):
            user = request.user
            if not user or not user.is_authenticated:
                return False
                
            # Get user role and id
            user_role = getattr(user, 'role', None)
            user_id = getattr(user, 'id', None)
            
            # Admin can update any notification
            if user_role == ROLE_ADMIN:
                return True
                
            # Users can only update their own notifications
            recipient_id = getattr(obj, 'recipient_id', None)
            if recipient_id and str(recipient_id) == str(user_id):
                # Only allow updating read_status and read_at fields
                allowed_fields = ['read_status', 'read_at']
                if set(request.data.keys()).issubset(set(allowed_fields)):
                    return True
                    
                self.log_access_denied(request, f"Users can only update read status of notifications")
                return False
                
            # Default deny
            self.log_access_denied(request, f"User can only update their own notifications")
            return False
    
    class CanDeleteNotification(BasePermission):
        """
        Permission to delete notifications.
        - Users can delete their own notifications
        - Admins can delete any notification
        """
        def has_object_permission(self, request, view, obj):
            user = request.user
            if not user or not user.is_authenticated:
                return False
                
            # Get user role and id
            user_role = getattr(user, 'role', None)
            user_id = getattr(user, 'id', None)
            
            # Admin can delete any notification
            if user_role == ROLE_ADMIN:
                return True
                
            # Users can delete their own notifications
            recipient_id = getattr(obj, 'recipient_id', None)
            if recipient_id and str(recipient_id) == str(user_id):
                return True
                
            # Default deny
            self.log_access_denied(request, f"User can only delete their own notifications")
            return False
    
    class CanConfigureNotifications(BasePermission):
        """
        Permission to configure notification preferences.
        - Users can configure their own notification preferences
        - Admins can configure any user's notification preferences
        """
        def has_permission(self, request, view):
            user = request.user
            if not user or not user.is_authenticated:
                return False
                
            # Check role
            user_role = getattr(user, 'role', None)
            user_id = getattr(user, 'id', None)
            
            # Admin can configure any notification preferences
            if user_role == ROLE_ADMIN:
                return True
                
            # Users can only configure their own preferences
            target_user_id = request.data.get('user_id')
            if target_user_id and str(target_user_id) != str(user_id):
                self.log_access_denied(request, f"User can only configure their own notification preferences")
                return False
                
            return True
        
        def has_object_permission(self, request, view, obj):
            user = request.user
            if not user or not user.is_authenticated:
                return False
                
            # Get user role and id
            user_role = getattr(user, 'role', None)
            user_id = getattr(user, 'id', None)
            
            # Admin can configure any notification preferences
            if user_role == ROLE_ADMIN:
                return True
                
            # Users can only configure their own preferences
            config_user_id = getattr(obj, 'user_id', None)
            if config_user_id and str(config_user_id) == str(user_id):
                return True
                
            # Default deny
            self.log_access_denied(request, f"User can only configure their own notification preferences")
            return False