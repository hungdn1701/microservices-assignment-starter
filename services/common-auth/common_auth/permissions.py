"""
Permission classes for all services in the Healthcare System.

This file is maintained for backward compatibility.
For new development, please use the modular permission classes directly from their respective modules:
- common_auth.permissions.base
- common_auth.permissions.roles
- common_auth.permissions.appointment
- common_auth.permissions.medical_record
- common_auth.permissions.pharmacy
- common_auth.permissions.laboratory
- common_auth.permissions.billing
- common_auth.permissions.notification
"""
import logging
from rest_framework import permissions

# Import from new structure for re-export
from common_auth.permissions.base import BasePermission, AllowAny, IsAuthenticated, ReadOnly
from common_auth.permissions.roles import (
    HasRole, IsAdmin, IsDoctor, IsNurse, IsPatient, 
    IsPharmacist, IsLabTechnician, IsInsuranceProvider,
    ROLE_ADMIN, ROLE_DOCTOR, ROLE_NURSE, ROLE_PATIENT,
    ROLE_PHARMACIST, ROLE_LAB_TECHNICIAN, ROLE_INSURANCE_PROVIDER
)

# Legacy classes - maintained for backward compatibility
logger = logging.getLogger(__name__)

# Legacy HasResourceAccess class with same behavior
class HasResourceAccess(permissions.BasePermission):
    """
    Permission to check if the user has access to a specific resource.
    
    DEPRECATED: Please use the specific resource permissions classes from their respective modules:
    - AppointmentPermissions from common_auth.permissions.appointment
    - MedicalRecordPermissions from common_auth.permissions.medical_record
    - PharmacyPermissions from common_auth.permissions.pharmacy
    - LaboratoryPermissions from common_auth.permissions.laboratory
    """
    def __init__(self, resource_type, owner_field=None):
        self.resource_type = resource_type
        self.owner_field = owner_field

    def has_permission(self, request, view):
        # Admin always has access
        if hasattr(request.user, 'role') and request.user.role == ROLE_ADMIN:
            return True

        # Check if user is authenticated
        if not request.user or not hasattr(request.user, 'is_authenticated') or not request.user.is_authenticated:
            return False

        return True

    def has_object_permission(self, request, view, obj):
        # Admin always has access
        if hasattr(request.user, 'role') and request.user.role == ROLE_ADMIN:
            return True

        user_id = getattr(request.user, 'id', None)
        user_role = getattr(request.user, 'role', None)

        if not user_id or not user_role:
            return False

        # Resource-specific access control logic
        if self.resource_type == 'MEDICAL_RECORD':
            # Patients can only access their own records
            if user_role == ROLE_PATIENT:
                owner_id = self._get_owner_id(obj)
                return str(owner_id) == str(user_id)

            # Doctors and nurses have access to all records
            elif user_role in [ROLE_DOCTOR, ROLE_NURSE]:
                return True

        elif self.resource_type == 'APPOINTMENT':
            # Patients can only access their own appointments
            if user_role == ROLE_PATIENT:
                owner_id = self._get_owner_id(obj)
                return str(owner_id) == str(user_id)

            # Doctors can only access appointments where they are the doctor
            elif user_role == ROLE_DOCTOR:
                return str(getattr(obj, 'doctor_id', None)) == str(user_id)

            # Nurses and admins have access to all appointments
            elif user_role in [ROLE_NURSE, ROLE_ADMIN]:
                return True

        elif self.resource_type == 'PRESCRIPTION':
            # Patients can only access their own prescriptions
            if user_role == ROLE_PATIENT:
                owner_id = self._get_owner_id(obj)
                return str(owner_id) == str(user_id)

            # Doctors can only access prescriptions they created
            elif user_role == ROLE_DOCTOR:
                return str(getattr(obj, 'doctor_id', None)) == str(user_id)

            # Pharmacists can access all prescriptions
            elif user_role == ROLE_PHARMACIST:
                return True

        elif self.resource_type == 'LAB_TEST':
            # Patients can only access their own lab tests
            if user_role == ROLE_PATIENT:
                owner_id = self._get_owner_id(obj)
                return str(owner_id) == str(user_id)

            # Doctors can access lab tests they ordered
            elif user_role == ROLE_DOCTOR:
                return str(getattr(obj, 'doctor_id', None)) == str(user_id)

            # Lab technicians can access all lab tests
            elif user_role == ROLE_LAB_TECHNICIAN:
                return True

        # Default: no access
        return False

    def _get_owner_id(self, obj):
        """
        Get the ID of the resource owner.
        """
        if self.owner_field:
            # Use the specified owner field
            return getattr(obj, self.owner_field, None)

        # Try common owner field names
        for field in ['patient_id', 'user_id', 'owner_id']:
            if hasattr(obj, field):
                return getattr(obj, field)

        return None


class IsAdminUser(IsAdmin):
    """
    Permission to check if the user is an admin.
    
    DEPRECATED: Please use IsAdmin from common_auth.permissions.roles instead.
    """
    pass

# Export specific resource permissions for easier access
from common_auth.permissions.appointment import AppointmentPermissions
from common_auth.permissions.medical_record import MedicalRecordPermissions
from common_auth.permissions.pharmacy import PharmacyPermissions
from common_auth.permissions.laboratory import LaboratoryPermissions
from common_auth.permissions.billing import BillingPermissions
from common_auth.permissions.notification import NotificationPermissions
