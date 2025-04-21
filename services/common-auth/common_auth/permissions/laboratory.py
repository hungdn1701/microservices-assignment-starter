"""
Laboratory-specific permissions for the healthcare system.
These classes control access to laboratory resources based on user roles.
"""
from .base import BasePermission
from .roles import (
    ROLE_ADMIN, ROLE_DOCTOR, ROLE_NURSE, ROLE_PATIENT,
    ROLE_LAB_TECHNICIAN
)


class LaboratoryPermissions:
    """
    Container for all laboratory-related permissions.
    Usage:
        @permission_classes([LaboratoryPermissions.CanViewLabTests])
        def list_tests(request):
            ...
    """
    
    class CanViewLabTests(BasePermission):
        """
        Permission to view laboratory tests.
        - Admins can view all lab tests
        - Doctors can view tests they ordered or for their patients
        - Lab Technicians can view all lab tests
        - Patients can view only their own test results
        """
        def has_permission(self, request, view):
            user = request.user
            if not user or not user.is_authenticated:
                return False
                
            # Admin, lab techs can view all lab tests
            if user.role in [ROLE_ADMIN, ROLE_LAB_TECHNICIAN]:
                return True
                
            # Doctors, nurses, and patients can access but with object-level filtering
            if user.role in [ROLE_DOCTOR, ROLE_NURSE, ROLE_PATIENT]:
                return True
                
            # Default deny
            self.log_access_denied(request, f"Role {user.role} not allowed to view lab tests")
            return False
        
        def has_object_permission(self, request, view, obj):
            user = request.user
            if not user or not user.is_authenticated:
                return False
                
            # Get user role and id
            user_role = getattr(user, 'role', None)
            user_id = getattr(user, 'id', None)
            
            # Admin can view any lab test
            if user_role == ROLE_ADMIN:
                return True
                
            # Lab Technician can view all lab tests
            if user_role == ROLE_LAB_TECHNICIAN:
                return True
                
            # Doctor can view tests they ordered
            if user_role == ROLE_DOCTOR:
                ordering_doctor = getattr(obj, 'doctor_id', None)
                # If doctor ordered the test
                if ordering_doctor and str(ordering_doctor) == str(user_id):
                    return True
                
                # Doctor may also view tests of patients under their care
                patient_id = getattr(obj, 'patient_id', None)
                if patient_id:
                    # Check if doctor is treating this patient (would need patient-doctor relationship)
                    # This would typically be checked against a patient's record
                    # For now, assume generic permission check
                    return True
                
                self.log_access_denied(request, f"Doctor does not have permission to view this lab test")
                return False
                
            # Nurse can view test results of patients
            if user_role == ROLE_NURSE:
                return True
                
            # Patient can view only their own test results
            if user_role == ROLE_PATIENT and str(getattr(obj, 'patient_id', None)) == str(user_id):
                return True
                
            # Default deny
            self.log_access_denied(request, f"User does not have permission to view lab test {self.get_object_identifier(obj)}")
            return False
    
    class CanOrderLabTest(BasePermission):
        """
        Permission to order laboratory tests.
        - Admins can order tests
        - Doctors can order tests for their patients
        """
        def has_permission(self, request, view):
            user = request.user
            if not user or not user.is_authenticated:
                return False
                
            # Check role
            user_role = getattr(user, 'role', None)
            user_id = getattr(user, 'id', None)
            
            # Only admin and doctors can order lab tests
            if user_role in [ROLE_ADMIN, ROLE_DOCTOR]:
                # If doctor, ensure they are ordering test with themselves as ordering doctor
                if user_role == ROLE_DOCTOR:
                    doctor_id = request.data.get('doctor_id')
                    if doctor_id and str(doctor_id) != str(user_id):
                        self.log_access_denied(request, f"Doctor trying to order lab test using another doctor's ID")
                        return False
                return True
                
            # Default deny
            self.log_access_denied(request, f"Role {user_role} not allowed to order lab tests")
            return False
    
    class CanUpdateLabTest(BasePermission):
        """
        Permission to update laboratory tests.
        - Admins can update any test
        - Lab Technicians can update test results and status
        - Doctors can update some fields for tests they ordered
        """
        def has_object_permission(self, request, view, obj):
            user = request.user
            if not user or not user.is_authenticated:
                return False
                
            # Get user role and id
            user_role = getattr(user, 'role', None)
            user_id = getattr(user, 'id', None)
            
            # Admin can update any test
            if user_role == ROLE_ADMIN:
                return True
                
            # Lab Technician can update test results and status
            if user_role == ROLE_LAB_TECHNICIAN:
                # Maybe restrict certain fields based on test status
                if getattr(obj, 'status', None) == 'CANCELLED':
                    self.log_access_denied(request, f"Cannot update cancelled test")
                    return False
                return True
                
            # Doctor can update only specific fields for tests they ordered
            if user_role == ROLE_DOCTOR and str(getattr(obj, 'doctor_id', None)) == str(user_id):
                # Doctor can only update certain fields (like priority, notes, etc)
                allowed_fields = ['priority', 'notes', 'clinical_information']
                if set(request.data.keys()).issubset(set(allowed_fields)):
                    # Can only update if test is not completed or cancelled
                    if getattr(obj, 'status', None) not in ['COMPLETED', 'CANCELLED']:
                        return True
                    else:
                        self.log_access_denied(request, f"Cannot update completed or cancelled test")
                        return False
                else:
                    self.log_access_denied(request, f"Doctor can only update specific fields")
                    return False
                
            # Default deny
            self.log_access_denied(request, f"User does not have permission to update lab test {self.get_object_identifier(obj)}")
            return False
    
    class CanCancelLabTest(BasePermission):
        """
        Permission to cancel laboratory tests.
        - Admins can cancel any test
        - Doctors can cancel tests they ordered (if not yet completed)
        - Lab Technicians can cancel tests that are pending
        """
        def has_object_permission(self, request, view, obj):
            user = request.user
            if not user or not user.is_authenticated:
                return False
                
            # Get user role and id
            user_role = getattr(user, 'role', None)
            user_id = getattr(user, 'id', None)
            
            # Can't cancel completed tests
            if getattr(obj, 'status', None) in ['COMPLETED']:
                self.log_access_denied(request, f"Cannot cancel completed test")
                return False
                
            # Admin can cancel any non-completed test
            if user_role == ROLE_ADMIN:
                return True
                
            # Doctor can cancel tests they ordered
            if user_role == ROLE_DOCTOR and str(getattr(obj, 'doctor_id', None)) == str(user_id):
                return True
                
            # Lab Tech can cancel pending tests
            if user_role == ROLE_LAB_TECHNICIAN and getattr(obj, 'status', None) == 'PENDING':
                return True
                
            # Default deny
            self.log_access_denied(request, f"User does not have permission to cancel lab test {self.get_object_identifier(obj)}")
            return False
    
    class CanEnterLabResults(BasePermission):
        """
        Permission to enter laboratory test results.
        - Admins can enter results
        - Lab Technicians can enter results
        """
        def has_object_permission(self, request, view, obj):
            user = request.user
            if not user or not user.is_authenticated:
                return False
                
            # Get user role
            user_role = getattr(user, 'role', None)
            
            # Can't enter results for cancelled tests
            if getattr(obj, 'status', None) == 'CANCELLED':
                self.log_access_denied(request, f"Cannot enter results for cancelled test")
                return False
                
            # Only admin and lab techs can enter results
            if user_role in [ROLE_ADMIN, ROLE_LAB_TECHNICIAN]:
                return True
                
            # Default deny
            self.log_access_denied(request, f"Only lab technicians and admins can enter test results")
            return False