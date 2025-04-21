"""
Common Authentication Library for Healthcare System
"""

__version__ = '0.1.0'

# Import permissions for backward compatibility
from common_auth.permissions import (
    # Base permissions
    BasePermission, AllowAny, IsAuthenticated, ReadOnly,

    # Role-based permissions
    HasRole, IsAdmin, IsDoctor, IsNurse, IsPatient,
    IsPharmacist, IsLabTechnician, IsInsuranceProvider,

    # Resource-specific permissions
    AppointmentPermissions, MedicalRecordPermissions, PharmacyPermissions,
    LaboratoryPermissions, BillingPermissions, NotificationPermissions,
)

# Import service client
from common_auth.service_client import ServiceClient

# Import health check
from common_auth.health_check import register_health_check
