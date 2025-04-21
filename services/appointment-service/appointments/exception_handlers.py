"""
Custom exception handlers for the appointment service.
"""
from rest_framework.views import exception_handler
from rest_framework.response import Response
from rest_framework import status
import logging

from .exceptions import (
    AppointmentServiceException,
    InvalidStatusTransitionException,
    TimeSlotUnavailableException,
    TimeSlotCapacityExceededException,
    InvalidAppointmentDataException,
    PermissionDeniedException,
    ResourceNotFoundException
)

logger = logging.getLogger(__name__)


def appointment_exception_handler(exc, context):
    """
    Custom exception handler for appointment service.
    """
    # First, handle any DRF exceptions using the default handler
    response = exception_handler(exc, context)

    # If response is already handled by DRF, return it
    if response is not None:
        return response

    # Handle our custom exceptions
    if isinstance(exc, AppointmentServiceException):
        logger.error(f"AppointmentServiceException: {str(exc)}")

        # Create a custom response
        data = {
            'error': exc.default_code,
            'message': str(exc),
            'status_code': exc.status_code
        }

        # Add additional context if available
        if hasattr(exc, 'detail') and exc.detail:
            data['detail'] = exc.detail

        # Xử lý các ngoại lệ cụ thể
        if isinstance(exc, TimeSlotUnavailableException):
            # Thêm thông tin về các khung giờ thay thế nếu có
            if hasattr(exc, 'alternatives') and exc.alternatives:
                data['alternatives'] = exc.alternatives

        return Response(data, status=exc.status_code)

    # Handle unexpected exceptions
    logger.exception("Unexpected exception occurred")
    return Response(
        {
            'error': 'internal_server_error',
            'message': 'Đã xảy ra lỗi không mong muốn. Vui lòng thử lại sau.',
            'status_code': status.HTTP_500_INTERNAL_SERVER_ERROR
        },
        status=status.HTTP_500_INTERNAL_SERVER_ERROR
    )
