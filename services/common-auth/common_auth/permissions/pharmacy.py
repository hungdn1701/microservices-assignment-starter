"""
Pharmacy-specific permissions for the healthcare system.
These classes control access to pharmacy resources based on user roles.
"""
from .base import BasePermission
from .roles import (
    ROLE_ADMIN, ROLE_DOCTOR, ROLE_NURSE, ROLE_PATIENT,
    ROLE_PHARMACIST, ROLE_LAB_TECHNICIAN
)


class PharmacyPermissions:
    """
    Container for all pharmacy-related permissions.
    Usage:
        @permission_classes([PharmacyPermissions.CanViewPrescriptions])
        def list_prescriptions(request):
            ...
    """
    
    class CanViewPrescriptions(BasePermission):
        """
        Permission to view prescriptions.
        - Admins can view all prescriptions
        - Doctors can view prescriptions they created
        - Pharmacists can view all prescriptions
        - Patients can view only their own prescriptions
        """
        def has_permission(self, request, view):
            user = request.user
            if not user or not user.is_authenticated:
                return False
                
            # Admin, pharmacists can view all prescriptions
            if user.role in [ROLE_ADMIN, ROLE_PHARMACIST]:
                return True
                
            # Doctors and patients can access but with object-level filtering
            if user.role in [ROLE_DOCTOR, ROLE_PATIENT]:
                return True
                
            # Default deny
            self.log_access_denied(request, f"Role {user.role} not allowed to view prescriptions")
            return False
        
        def has_object_permission(self, request, view, obj):
            user = request.user
            if not user or not user.is_authenticated:
                return False
                
            # Get user role and id
            user_role = getattr(user, 'role', None)
            user_id = getattr(user, 'id', None)
            
            # Admin can view any prescription
            if user_role == ROLE_ADMIN:
                return True
                
            # Pharmacist can view all prescriptions
            if user_role == ROLE_PHARMACIST:
                return True
                
            # Doctor can view prescriptions they created
            if user_role == ROLE_DOCTOR and str(getattr(obj, 'doctor_id', None)) == str(user_id):
                return True
                
            # Patient can view their own prescriptions
            if user_role == ROLE_PATIENT and str(getattr(obj, 'patient_id', None)) == str(user_id):
                return True
                
            # Default deny
            self.log_access_denied(request, f"User does not have permission to view prescription {self.get_object_identifier(obj)}")
            return False
    
    class CanCreatePrescription(BasePermission):
        """
        Permission to create prescriptions.
        - Admins can create prescriptions
        - Doctors can create prescriptions
        """
        def has_permission(self, request, view):
            user = request.user
            if not user or not user.is_authenticated:
                return False
                
            # Check role
            user_role = getattr(user, 'role', None)
            user_id = getattr(user, 'id', None)
            
            # Only admin and doctors can create prescriptions
            if user_role in [ROLE_ADMIN, ROLE_DOCTOR]:
                # If doctor, ensure they are creating prescription with themselves as doctor
                if user_role == ROLE_DOCTOR:
                    doctor_id = request.data.get('doctor_id')
                    if doctor_id and str(doctor_id) != str(user_id):
                        self.log_access_denied(request, f"Doctor trying to create prescription for another doctor")
                        return False
                return True
                
            # Default deny
            self.log_access_denied(request, f"Role {user_role} not allowed to create prescriptions")
            return False
    
    class CanUpdatePrescription(BasePermission):
        """
        Permission to update prescriptions.
        - Admins can update any prescription
        - Doctors can update prescriptions they created (if not yet filled)
        - Pharmacists can update prescription status to fill/dispense
        """
        def has_object_permission(self, request, view, obj):
            user = request.user
            if not user or not user.is_authenticated:
                return False
                
            # Get user role and id
            user_role = getattr(user, 'role', None)
            user_id = getattr(user, 'id', None)
            
            # Admin can update any prescription
            if user_role == ROLE_ADMIN:
                return True
                
            # Doctor can update prescriptions they created if not yet filled
            if user_role == ROLE_DOCTOR and str(getattr(obj, 'doctor_id', None)) == str(user_id):
                if getattr(obj, 'status', None) not in ['FILLED', 'DISPENSED']:
                    return True
                else:
                    self.log_access_denied(request, f"Cannot update prescription that has already been filled")
                    return False
                    
            # Pharmacist can update prescription status 
            if user_role == ROLE_PHARMACIST:
                # Only allow updating status field
                allowed_fields = ['status', 'notes', 'filled_by', 'filled_date']
                if set(request.data.keys()).issubset(set(allowed_fields)):
                    return True
                else:
                    self.log_access_denied(request, f"Pharmacist can only update status and related fields")
                    return False
                
            # Default deny
            self.log_access_denied(request, f"User does not have permission to update prescription {self.get_object_identifier(obj)}")
            return False
    
    class CanCancelPrescription(BasePermission):
        """
        Permission to cancel prescriptions.
        - Admins can cancel any prescription
        - Doctors can cancel prescriptions they created (if not yet filled)
        """
        def has_object_permission(self, request, view, obj):
            user = request.user
            if not user or not user.is_authenticated:
                return False
                
            # Get user role and id
            user_role = getattr(user, 'role', None)
            user_id = getattr(user, 'id', None)
            
            # Can't cancel filled or dispensed prescriptions
            if getattr(obj, 'status', None) in ['FILLED', 'DISPENSED']:
                self.log_access_denied(request, f"Cannot cancel prescription that has already been filled")
                return False
                
            # Admin can cancel any unfilled prescription
            if user_role == ROLE_ADMIN:
                return True
                
            # Doctor can cancel prescriptions they created
            if user_role == ROLE_DOCTOR and str(getattr(obj, 'doctor_id', None)) == str(user_id):
                return True
                
            # Default deny
            self.log_access_denied(request, f"User does not have permission to cancel prescription {self.get_object_identifier(obj)}")
            return False
    
    class CanManageMedication(BasePermission):
        """
        Permission to manage medications in the pharmacy inventory.
        - Admins can manage any medication
        - Pharmacists can manage medications
        """
        def has_permission(self, request, view):
            user = request.user
            if not user or not user.is_authenticated:
                return False
                
            # Get user role
            user_role = getattr(user, 'role', None)
            
            # Only admin and pharmacists can manage medications
            if user_role in [ROLE_ADMIN, ROLE_PHARMACIST]:
                return True
                
            # Default deny
            self.log_access_denied(request, f"Role {user_role} not allowed to manage medications")
            return False
        
        def has_object_permission(self, request, view, obj):
            return self.has_permission(request, view)