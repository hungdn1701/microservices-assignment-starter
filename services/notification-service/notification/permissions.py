"""
Proxy module for permissions from common-auth package.
This file exists to maintain backward compatibility.
"""
from common_auth.permissions import NotificationPermissions, IsAdmin, IsDoctor, IsNurse

# Re-export for backward compatibility
CanViewNotifications = NotificationPermissions.CanViewNotifications
CanSendNotification = NotificationPermissions.CanSendNotification
CanUpdateNotification = NotificationPermissions.CanUpdateNotification
CanDeleteNotification = NotificationPermissions.CanDeleteNotification
CanConfigureNotifications = NotificationPermissions.CanConfigureNotifications

# Legacy classes - mapped to new permissions for backward compatibility
class IsAdminOrStaff:
    def __new__(cls):
        return CanSendNotification()
