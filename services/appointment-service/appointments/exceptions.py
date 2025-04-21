"""
Custom exceptions for the appointment service.
"""
from rest_framework.exceptions import APIException
from rest_framework import status


class AppointmentServiceException(APIException):
    """Base exception for appointment service."""
    status_code = status.HTTP_500_INTERNAL_SERVER_ERROR
    default_detail = 'Đã xảy ra lỗi trong dịch vụ lịch hẹn.'
    default_code = 'appointment_service_error'


class InvalidStatusTransitionException(AppointmentServiceException):
    """Exception raised when trying to perform an invalid status transition."""
    status_code = status.HTTP_400_BAD_REQUEST
    default_detail = 'Không thể chuyển trạng thái lịch hẹn.'
    default_code = 'invalid_status_transition'


class TimeSlotUnavailableException(AppointmentServiceException):
    """Exception raised when trying to book an unavailable time slot."""
    status_code = status.HTTP_400_BAD_REQUEST
    default_detail = 'Khung giờ đã chọn không khả dụng.'
    default_code = 'time_slot_unavailable'

    def __init__(self, detail=None, code=None, alternatives=None):
        super().__init__(detail, code)
        self.alternatives = alternatives

        # Nếu có alternatives, thêm vào detail
        if alternatives:
            if hasattr(self.detail, 'data'):
                self.detail.data['alternatives'] = alternatives
            else:
                # Nếu detail là chuỗi, chuyển thành dict
                from rest_framework.utils.serializer_helpers import ReturnDict
                self.detail = ReturnDict({'detail': self.detail, 'alternatives': alternatives}, serializer=None)


class TimeSlotCapacityExceededException(AppointmentServiceException):
    """Exception raised when trying to book a time slot that has reached its capacity."""
    status_code = status.HTTP_400_BAD_REQUEST
    default_detail = 'Khung giờ đã đạt số lượng bệnh nhân tối đa.'
    default_code = 'time_slot_capacity_exceeded'


class InvalidAppointmentDataException(AppointmentServiceException):
    """Exception raised when appointment data is invalid."""
    status_code = status.HTTP_400_BAD_REQUEST
    default_detail = 'Dữ liệu lịch hẹn không hợp lệ.'
    default_code = 'invalid_appointment_data'


class PermissionDeniedException(AppointmentServiceException):
    """Exception raised when user doesn't have permission to perform an action."""
    status_code = status.HTTP_403_FORBIDDEN
    default_detail = 'Bạn không có quyền thực hiện hành động này.'
    default_code = 'permission_denied'


class ResourceNotFoundException(AppointmentServiceException):
    """Exception raised when a resource is not found."""
    status_code = status.HTTP_404_NOT_FOUND
    default_detail = 'Không tìm thấy tài nguyên yêu cầu.'
    default_code = 'resource_not_found'
