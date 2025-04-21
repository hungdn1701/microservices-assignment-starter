"""
Appointment-specific permissions for the healthcare system.
These classes control access to appointment resources based on user roles.
"""
from .base import BasePermission
from .roles import ROLE_ADMIN, ROLE_DOCTOR, ROLE_NURSE, ROLE_PATIENT


class AppointmentPermissions:
    """
    Container for all appointment-related permissions.
    Usage:
        @permission_classes([AppointmentPermissions.CanViewAppointments])
        def list_appointments(request):
            ...
    """
    
    class CanViewAppointments(BasePermission):
        """
        Permission to view appointments.
        - Admins can view all appointments
        - Doctors can view appointments where they are the doctor
        - Nurses can view all appointments
        - Patients can view only their own appointments
        """
        def has_permission(self, request, view):
            user = request.user
            if not user or not user.is_authenticated:
                return False
                
            # All authenticated users can access the list endpoint
            return True
        
        def has_object_permission(self, request, view, obj):
            user = request.user
            if not user or not user.is_authenticated:
                return False
                
            # Get user role and id
            user_role = getattr(user, 'role', None)
            user_id = getattr(user, 'id', None)
            
            # Admin can view any appointment
            if user_role == ROLE_ADMIN:
                return True
                
            # Doctor can view appointments assigned to them
            if user_role == ROLE_DOCTOR and str(getattr(obj, 'doctor_id', None)) == str(user_id):
                return True
                
            # Nurse can view any appointment
            if user_role == ROLE_NURSE:
                return True
                
            # Patient can view their own appointments
            if user_role == ROLE_PATIENT and str(getattr(obj, 'patient_id', None)) == str(user_id):
                return True
                
            # Default deny
            self.log_access_denied(request, f"User does not have permission to view appointment {self.get_object_identifier(obj)}")
            return False
    
    class CanCreateAppointment(BasePermission):
        """
        Permission to create appointments.
        - Admins can create appointments for any doctor and patient
        - Doctors can create appointments for themselves with any patient
        - Nurses can create appointments for any doctor and patient
        - Patients can create appointments with any doctor
        """
        def has_permission(self, request, view):
            user = request.user
            if not user or not user.is_authenticated:
                return False
                
            # Check role
            user_role = getattr(user, 'role', None)
            user_id = getattr(user, 'id', None)
            
            # Admin, Doctor, Nurse can always create appointments
            if user_role in [ROLE_ADMIN, ROLE_DOCTOR, ROLE_NURSE]:
                return True
                
            # Patients can create appointments
            if user_role == ROLE_PATIENT:
                # Ensure patient is creating appointment for themselves
                patient_id = request.data.get('patient_id')
                if str(patient_id) != str(user_id):
                    self.log_access_denied(request, f"Patient trying to create appointment for another patient")
                    return False
                return True
                
            # Default deny
            self.log_access_denied(request, f"Role {user_role} not allowed to create appointments")
            return False
    
    class CanUpdateAppointment(BasePermission):
        """
        Permission to update appointments.
        - Admins can update any appointment
        - Doctors can update appointments where they are the doctor
        - Nurses can update appointment details but not reassign doctor
        - Patients can only update status to CANCELLED for their own appointments
        """
        def has_object_permission(self, request, view, obj):
            user = request.user
            if not user or not user.is_authenticated:
                return False
                
            # Get user role and id
            user_role = getattr(user, 'role', None)
            user_id = getattr(user, 'id', None)
            
            # Admin can update any appointment
            if user_role == ROLE_ADMIN:
                return True
                
            # Doctor can update appointments assigned to them
            if user_role == ROLE_DOCTOR and str(getattr(obj, 'doctor_id', None)) == str(user_id):
                return True
                
            # Nurse can update certain fields
            if user_role == ROLE_NURSE:
                # Check if trying to reassign doctor (not allowed)
                if 'doctor_id' in request.data and str(request.data.get('doctor_id')) != str(obj.doctor_id):
                    self.log_access_denied(request, f"Nurse trying to reassign doctor for appointment")
                    return False
                return True
                
            # Patient can only cancel their own appointments
            if user_role == ROLE_PATIENT and str(getattr(obj, 'patient_id', None)) == str(user_id):
                # Check if only updating status to CANCELLED
                if set(request.data.keys()) <= {'status'} and request.data.get('status') == 'CANCELLED':
                    return True
                self.log_access_denied(request, f"Patient can only cancel appointments, not modify other fields")
                return False
                
            # Default deny
            self.log_access_denied(request, f"User does not have permission to update appointment {self.get_object_identifier(obj)}")
            return False
    
    class CanDeleteAppointment(BasePermission):
        """
        Permission to delete appointments.
        - Only Admins can delete appointments
        """
        def has_object_permission(self, request, view, obj):
            user = request.user
            if not user or not user.is_authenticated:
                return False
                
            # Get user role
            user_role = getattr(user, 'role', None)
            
            # Only Admin can delete appointments
            if user_role == ROLE_ADMIN:
                return True
                
            # Default deny
            self.log_access_denied(request, f"Only admins can delete appointments")
            return False
    
    class CanManageDoctorSchedule(BasePermission):
        """
        Permission to manage doctor schedules and availabilities.
        - Admin can manage any doctor's schedule
        - Doctors can only manage their own schedule
        - Others cannot manage schedules
        """
        def has_permission(self, request, view):
            user = request.user
            if not user or not user.is_authenticated:
                return False
                
            # Get user role and id
            user_role = getattr(user, 'role', None)
            user_id = getattr(user, 'id', None)
            
            # Admin can manage any schedule
            if user_role == ROLE_ADMIN:
                return True
                
            # Doctor can only manage their own schedule
            if user_role == ROLE_DOCTOR:
                # If creating/listing, ensure doctor_id is their own
                if request.method == 'POST':
                    doctor_id = request.data.get('doctor_id')
                    if str(doctor_id) != str(user_id):
                        self.log_access_denied(request, f"Doctor trying to manage another doctor's schedule")
                        return False
                return True
                
            # Others cannot manage schedules
            self.log_access_denied(request, f"Role {user_role} not allowed to manage doctor schedules")
            return False
        
        def has_object_permission(self, request, view, obj):
            user = request.user
            if not user or not user.is_authenticated:
                return False
                
            # Get user role and id
            user_role = getattr(user, 'role', None)
            user_id = getattr(user, 'id', None)
            
            # Admin can manage any schedule
            if user_role == ROLE_ADMIN:
                return True
                
            # Doctor can only manage their own schedule
            if user_role == ROLE_DOCTOR and str(getattr(obj, 'doctor_id', None)) == str(user_id):
                return True
                
            # Others cannot manage schedules
            self.log_access_denied(request, f"User does not have permission to manage this schedule")
            return False