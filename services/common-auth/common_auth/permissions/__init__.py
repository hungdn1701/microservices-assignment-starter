"""
Permissions package for healthcare system.
This package provides a comprehensive permission system for the entire healthcare application.
"""

# Import base permissions
from common_auth.permissions.base import BasePermission, AllowAny, IsAuthenticated, ReadOnly, HasResourceAccess

# Import role-based permissions
from common_auth.permissions.roles import (
    HasRole, IsAdmin, IsDoctor, IsNurse, IsPatient, 
    IsPharmacist, IsLabTechnician, IsInsuranceProvider,
    ROLE_ADMIN, ROLE_DOCTOR, ROLE_NURSE, ROLE_PATIENT,
    ROLE_PHARMACIST, ROLE_LAB_TECHNICIAN, ROLE_INSURANCE_PROVIDER
)

# Import resource-specific permissions
from common_auth.permissions.appointment import AppointmentPermissions
from common_auth.permissions.medical_record import MedicalRecordPermissions
from common_auth.permissions.pharmacy import PharmacyPermissions
from common_auth.permissions.laboratory import LaboratoryPermissions
from common_auth.permissions.billing import BillingPermissions
from common_auth.permissions.notification import NotificationPermissions

# Define what's available when using "from common_auth.permissions import *"
__all__ = [
    # Base permissions
    'BasePermission', 'AllowAny', 'IsAuthenticated', 'ReadOnly', 'HasResourceAccess',
    
    # Role constants
    'ROLE_ADMIN', 'ROLE_DOCTOR', 'ROLE_NURSE', 'ROLE_PATIENT',
    'ROLE_PHARMACIST', 'ROLE_LAB_TECHNICIAN', 'ROLE_INSURANCE_PROVIDER',
    
    # Role-based permissions
    'HasRole', 'IsAdmin', 'IsDoctor', 'IsNurse', 'IsPatient', 
    'IsPharmacist', 'IsLabTechnician', 'IsInsuranceProvider',
    
    # Resource-specific permissions
    'AppointmentPermissions', 'MedicalRecordPermissions', 'PharmacyPermissions',
    'LaboratoryPermissions', 'BillingPermissions', 'NotificationPermissions',
]