"""
Proxy module for permissions from common-auth package.
This file exists to maintain backward compatibility.
"""
from rest_framework import permissions
from common_auth.permissions import MedicalRecordPermissions, IsAdmin, IsDoctor, IsNurse, IsPatient, IsLabTechnician, IsPharmacist

# Re-export for backward compatibility
CanViewMedicalRecords = MedicalRecordPermissions.CanViewMedicalRecords
CanCreateMedicalRecord = MedicalRecordPermissions.CanCreateMedicalRecord
CanUpdateMedicalRecord = MedicalRecordPermissions.CanUpdateMedicalRecord
CanDeleteMedicalRecord = MedicalRecordPermissions.CanDeleteMedicalRecord
CanShareMedicalRecord = MedicalRecordPermissions.CanShareMedicalRecord

class IsServiceRequest(permissions.BasePermission):
    """
    Cho phép truy cập nếu request đến từ một service khác đã được xác thực.
    """

    def has_permission(self, request, view):
        return getattr(request, 'is_service_request', False)
