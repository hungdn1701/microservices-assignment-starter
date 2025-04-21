"""
Role-based permissions for the healthcare system.
These classes define permissions based on user roles.
"""
from rest_framework import permissions
import logging

logger = logging.getLogger(__name__)

# Constants for roles
ROLE_ADMIN = 'ADMIN'
ROLE_DOCTOR = 'DOCTOR'
ROLE_NURSE = 'NURSE'
ROLE_PATIENT = 'PATIENT'
ROLE_PHARMACIST = 'PHARMACIST'
ROLE_LAB_TECHNICIAN = 'LAB_TECHNICIAN'
ROLE_INSURANCE_PROVIDER = 'INSURANCE_PROVIDER'

# List of all valid roles
ALL_ROLES = [
    ROLE_ADMIN,
    ROLE_DOCTOR,
    ROLE_NURSE,
    ROLE_PATIENT,
    ROLE_PHARMACIST,
    ROLE_LAB_TECHNICIAN,
    ROLE_INSURANCE_PROVIDER
]

# List of medical staff roles
MEDICAL_STAFF_ROLES = [ROLE_DOCTOR, ROLE_NURSE]

# List of administrative roles
ADMIN_ROLES = [ROLE_ADMIN]

class HasRole(permissions.BasePermission):
    """
    Permission to check if the user has the required role(s).
    """
    def __init__(self, roles):
        self.roles = roles if isinstance(roles, (list, tuple)) else [roles]

    def has_permission(self, request, view):
        if not request.user or not hasattr(request.user, 'role'):
            return False

        has_role = request.user.role in self.roles

        if not has_role:
            logger.warning(
                f"Access denied: User {getattr(request.user, 'id', 'unknown')} "
                f"with role {getattr(request.user, 'role', 'unknown')} "
                f"attempted to access resource requiring {self.roles}"
            )

        return has_role


class IsAdmin(HasRole):
    """
    Permission class for administrators.
    """
    def __init__(self):
        super().__init__(ROLE_ADMIN)


class IsDoctor(HasRole):
    """
    Permission class for doctors.
    """
    def __init__(self):
        super().__init__(ROLE_DOCTOR)


class IsNurse(HasRole):
    """
    Permission class for nurses.
    """
    def __init__(self):
        super().__init__(ROLE_NURSE)


class IsPatient(HasRole):
    """
    Permission class for patients.
    """
    def __init__(self):
        super().__init__(ROLE_PATIENT)


class IsPharmacist(HasRole):
    """
    Permission class for pharmacists.
    """
    def __init__(self):
        super().__init__(ROLE_PHARMACIST)


class IsLabTechnician(HasRole):
    """
    Permission class for laboratory technicians.
    """
    def __init__(self):
        super().__init__(ROLE_LAB_TECHNICIAN)


class IsInsuranceProvider(HasRole):
    """
    Permission class for insurance providers.
    """
    def __init__(self):
        super().__init__(ROLE_INSURANCE_PROVIDER)


class IsMedicalStaff(HasRole):
    """
    Permission class for medical staff (doctors and nurses).
    """
    def __init__(self):
        super().__init__(MEDICAL_STAFF_ROLES)


class IsAdminOrMedicalStaff(HasRole):
    """
    Permission class for administrators or medical staff.
    """
    def __init__(self):
        roles = ADMIN_ROLES + MEDICAL_STAFF_ROLES
        super().__init__(roles)