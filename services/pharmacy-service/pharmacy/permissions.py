"""
Proxy module for permissions from common-auth package.
This file exists to maintain backward compatibility.
"""
from rest_framework import permissions
from common_auth.permissions import PharmacyPermissions, IsAdmin, IsDoctor, IsPatient, IsPharmacist

# Re-export for backward compatibility
CanViewPrescriptions = PharmacyPermissions.CanViewPrescriptions
CanCreatePrescription = PharmacyPermissions.CanCreatePrescription
CanUpdatePrescription = PharmacyPermissions.CanUpdatePrescription
CanCancelPrescription = PharmacyPermissions.CanCancelPrescription
CanManageMedication = PharmacyPermissions.CanManageMedication

# Custom permission class that allows any of the specified roles
class HasAnyRole(permissions.BasePermission):
    """
    Permission class that allows access if the user has any of the specified roles.
    """
    def has_permission(self, request, view):
        if not request.user or not hasattr(request.user, 'role'):
            return False

        # Allow access for DOCTOR, PHARMACIST, PATIENT roles
        allowed_roles = ['DOCTOR', 'PHARMACIST', 'PATIENT']
        return request.user.role in allowed_roles
