"""
Proxy module for permissions from common-auth package.
This file exists to maintain backward compatibility.
"""
from common_auth.permissions import AppointmentPermissions, IsAdmin, IsDoctor, IsNurse, IsPatient

# Re-export for backward compatibility
CanViewAppointments = AppointmentPermissions.CanViewAppointments
CanCreateAppointment = AppointmentPermissions.CanCreateAppointment
CanUpdateAppointment = AppointmentPermissions.CanUpdateAppointment
CanDeleteAppointment = AppointmentPermissions.CanDeleteAppointment
CanManageDoctorSchedule = AppointmentPermissions.CanManageDoctorSchedule

# Quyền hạn mới cho y tá
class CanAssistDoctor:
    """
    Permission cho phép y tá hỗ trợ bác sĩ trong quản lý lịch hẹn.
    Y tá có thể xem, check-in và cập nhật thông tin sinh tồn cho bệnh nhân.
    """
    def has_permission(self, request, view):
        user_role = getattr(request.user, 'role', None)
        return user_role in ['NURSE', 'DOCTOR', 'ADMIN']
    
    def has_object_permission(self, request, view, obj):
        user_role = getattr(request.user, 'role', None)
        if user_role == 'ADMIN':
            return True
        # Y tá chỉ có thể cập nhật thông tin check-in và sinh tồn
        if user_role == 'NURSE' and request.method in ['PATCH', 'PUT']:
            allowed_fields = {'check_in', 'vitals'}
            data_fields = set(request.data.keys())
            return len(data_fields.intersection(allowed_fields)) > 0
        return user_role in ['DOCTOR', 'ADMIN']

# Quyền hạn cho nhà cung cấp bảo hiểm
class CanVerifyInsurance:
    """
    Permission cho phép nhà cung cấp bảo hiểm xác minh thông tin bảo hiểm.
    """
    def has_permission(self, request, view):
        user_role = getattr(request.user, 'role', None)
        return user_role in ['INSURANCE_PROVIDER', 'ADMIN']

# Quyền hạn quản lý danh sách chờ
class CanManageWaitingList:
    """
    Permission cho phép quản lý danh sách chờ.
    Bệnh nhân có thể tạo và hủy yêu cầu chờ.
    Bác sĩ, y tá và admin có thể xem và cập nhật danh sách chờ.
    """
    def has_permission(self, request, view):
        user_role = getattr(request.user, 'role', None)
        # Bệnh nhân chỉ có thể tạo và xem danh sách chờ của họ
        if user_role == 'PATIENT':
            return request.method in ['GET', 'POST']
        # Các vai trò khác có thể quản lý đầy đủ
        return user_role in ['DOCTOR', 'NURSE', 'ADMIN']
    
    def has_object_permission(self, request, view, obj):
        user_role = getattr(request.user, 'role', None)
        user_id = getattr(request.user, 'id', None)
        
        # Admin có quyền đầy đủ
        if user_role == 'ADMIN':
            return True
            
        # Bệnh nhân chỉ có thể xem và hủy yêu cầu chờ của chính họ
        if user_role == 'PATIENT':
            return obj.patient_id == user_id and request.method in ['GET', 'DELETE']
            
        # Bác sĩ chỉ có thể xem và cập nhật danh sách chờ của họ
        if user_role == 'DOCTOR':
            return obj.doctor_id == user_id
            
        # Y tá có thể xem và cập nhật tất cả danh sách chờ
        return user_role == 'NURSE'

# Legacy classes - mapped to new permissions for backward compatibility
class IsPatientOrDoctor:
    def __new__(cls):
        return CanViewAppointments()

class IsDoctor(IsDoctor):
    """
    Permission to only allow doctors to access their availabilities and time slots.
    """
    pass

# Use IsAdmin directly from common-auth
# No need to redefine
