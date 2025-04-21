"""
Medical Record-specific permissions for the healthcare system.
These classes control access to medical records based on user roles.
"""
from .base import BasePermission
from .roles import (
    ROLE_ADMIN, ROLE_DOCTOR, ROLE_NURSE, ROLE_PATIENT,
    ROLE_PHARMACIST, ROLE_LAB_TECHNICIAN, ROLE_INSURANCE_PROVIDER
)


class MedicalRecordPermissions:
    """
    Container for all medical record-related permissions.
    Usage:
        @permission_classes([MedicalRecordPermissions.CanViewMedicalRecords])
        def list_records(request):
            ...
    """
    
    class CanViewMedicalRecords(BasePermission):
        """
        Permission to view medical records.
        - Admins can view all medical records
        - Doctors can view records of their patients
        - Nurses can view all records
        - Patients can view only their own records
        - Insurance providers can view records of their clients with proper authorization
        """
        def has_permission(self, request, view):
            user = request.user
            if not user or not user.is_authenticated:
                return False
                
            # All authenticated medical staff, admins can access the list endpoint
            if user.role in [ROLE_ADMIN, ROLE_DOCTOR, ROLE_NURSE, ROLE_INSURANCE_PROVIDER]:
                return True
                
            # Patients can only access individual records, not list all
            if user.role == ROLE_PATIENT and getattr(view, 'action', None) != 'list':
                return True
                
            # Default deny
            self.log_access_denied(request, f"Role {user.role} not allowed to list medical records")
            return False
        
        def has_object_permission(self, request, view, obj):
            user = request.user
            if not user or not user.is_authenticated:
                return False
                
            # Get user role and id
            user_role = getattr(user, 'role', None)
            user_id = getattr(user, 'id', None)
            
            # Admin can view any record
            if user_role == ROLE_ADMIN:
                return True
                
            # Doctor can view records of their patients
            if user_role == ROLE_DOCTOR:
                treating_doctor = getattr(obj, 'doctor_id', None)
                if treating_doctor and str(treating_doctor) == str(user_id):
                    return True
                
                # Doctor may also have access to records shared with them
                shared_with_doctors = getattr(obj, 'shared_with_doctors', [])
                if user_id in shared_with_doctors:
                    return True
                
                self.log_access_denied(request, f"Doctor does not have access to this patient's records")
                return False
                
            # Nurse can view all records
            if user_role == ROLE_NURSE:
                return True
                
            # Patient can view only their own records
            if user_role == ROLE_PATIENT and str(getattr(obj, 'patient_id', None)) == str(user_id):
                return True
                
            # Insurance provider checks
            if user_role == ROLE_INSURANCE_PROVIDER:
                # Check if this record belongs to an insured patient
                insurer_id = getattr(obj, 'insurance_provider_id', None)
                if insurer_id and str(insurer_id) == str(user_id):
                    # Check if authorization exists
                    if getattr(obj, 'insurance_access_authorized', False):
                        return True
                self.log_access_denied(request, f"Insurance provider does not have authorization to view this record")
                return False
                
            # Default deny
            self.log_access_denied(request, f"User does not have permission to view medical record {self.get_object_identifier(obj)}")
            return False
    
    class CanCreateMedicalRecord(BasePermission):
        """
        Permission to create medical records.
        - Admins can create records
        - Doctors can create records
        - Nurses can create basic records
        """
        def has_permission(self, request, view):
            user = request.user
            if not user or not user.is_authenticated:
                return False
                
            # Check role
            user_role = getattr(user, 'role', None)
            
            # Only medical staff and admins can create records
            if user_role in [ROLE_ADMIN, ROLE_DOCTOR, ROLE_NURSE]:
                return True
                
            # Default deny
            self.log_access_denied(request, f"Role {user_role} not allowed to create medical records")
            return False
    
    class CanUpdateMedicalRecord(BasePermission):
        """
        Permission to update medical records.
        - Admins can update any record
        - Doctors can update records they created or for patients under their care
        - Nurses can update vitals and some basic information
        """
        def has_object_permission(self, request, view, obj):
            user = request.user
            if not user or not user.is_authenticated:
                return False
                
            # Get user role and id
            user_role = getattr(user, 'role', None)
            user_id = getattr(user, 'id', None)
            
            # Admin can update any record
            if user_role == ROLE_ADMIN:
                return True
                
            # Doctor can update records of patients under their care
            if user_role == ROLE_DOCTOR:
                treating_doctor = getattr(obj, 'doctor_id', None)
                created_by = getattr(obj, 'created_by', None)
                
                if (treating_doctor and str(treating_doctor) == str(user_id)) or \
                   (created_by and str(created_by) == str(user_id)):
                    return True
                
                self.log_access_denied(request, f"Doctor is not the treating doctor for this record")
                return False
                
            # Nurse can update certain fields only
            if user_role == ROLE_NURSE:
                # Check if trying to update restricted fields
                restricted_fields = ['diagnosis', 'treatment_plan', 'doctor_notes']
                for field in restricted_fields:
                    if field in request.data:
                        self.log_access_denied(request, f"Nurse trying to update restricted field: {field}")
                        return False
                return True
                
            # Default deny
            self.log_access_denied(request, f"User does not have permission to update medical record {self.get_object_identifier(obj)}")
            return False
    
    class CanDeleteMedicalRecord(BasePermission):
        """
        Permission to delete medical records.
        - Only Admins can delete medical records
        """
        def has_object_permission(self, request, view, obj):
            user = request.user
            if not user or not user.is_authenticated:
                return False
                
            # Get user role
            user_role = getattr(user, 'role', None)
            
            # Only Admin can delete records
            if user_role == ROLE_ADMIN:
                return True
                
            # Default deny
            self.log_access_denied(request, f"Only admins can delete medical records")
            return False
    
    class CanShareMedicalRecord(BasePermission):
        """
        Permission to share medical records with other healthcare providers.
        - Admins can share any record
        - Doctors can share records of their patients
        - Patients can share their own records
        """
        def has_object_permission(self, request, view, obj):
            user = request.user
            if not user or not user.is_authenticated:
                return False
                
            # Get user role and id
            user_role = getattr(user, 'role', None)
            user_id = getattr(user, 'id', None)
            
            # Admin can share any record
            if user_role == ROLE_ADMIN:
                return True
                
            # Doctor can share records of their patients
            if user_role == ROLE_DOCTOR and str(getattr(obj, 'doctor_id', None)) == str(user_id):
                return True
                
            # Patient can share their own records
            if user_role == ROLE_PATIENT and str(getattr(obj, 'patient_id', None)) == str(user_id):
                return True
                
            # Default deny
            self.log_access_denied(request, f"User does not have permission to share medical record {self.get_object_identifier(obj)}")
            return False