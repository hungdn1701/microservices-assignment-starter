from rest_framework import viewsets, status, filters
from rest_framework.response import Response
from rest_framework.decorators import action, api_view
from django_filters.rest_framework import DjangoFilterBackend
from django.utils import timezone
from datetime import datetime, timedelta
from rest_framework.permissions import IsAuthenticated
from .models import DoctorAvailability, TimeSlot, Appointment, PatientVisit, AppointmentReason
from .serializers import (
    DoctorAvailabilitySerializer,
    TimeSlotSerializer,
    AppointmentSerializer,
    AppointmentCreateSerializer,
    PatientVisitSerializer,
    AppointmentReasonSerializer
)
from .permissions import (
    CanViewAppointments, CanManageDoctorSchedule, IsAdmin
)
from .authentication import CustomJWTAuthentication
from .integrations import get_doctors_by_specialty, get_doctors_by_department, get_doctors_info, get_doctor_info, get_specialties, get_departments
import logging
logger = logging.getLogger(__name__)

class DoctorAvailabilityViewSet(viewsets.ModelViewSet):
    queryset = DoctorAvailability.objects.all()
    serializer_class = DoctorAvailabilitySerializer
    authentication_classes = [CustomJWTAuthentication]
    permission_classes = [CanManageDoctorSchedule]
    filter_backends = [DjangoFilterBackend, filters.OrderingFilter]
    filterset_fields = ['doctor_id', 'weekday', 'is_available']
    ordering_fields = ['weekday', 'start_time']

    def get_queryset(self):
        """
        Filter availabilities based on user role.
        """
        queryset = DoctorAvailability.objects.all()

        # Get user information from authentication
        user_role = getattr(self.request.user, 'role', None)
        user_id = getattr(self.request.user, 'id', None)

        # Doctors can only see their own availabilities
        if user_role == 'DOCTOR':
            queryset = queryset.filter(doctor_id=user_id)

        return queryset

    def perform_create(self, serializer):
        """
        Set doctor_id to the current user's ID if not provided.
        """
        user_role = getattr(self.request.user, 'role', None)
        user_id = getattr(self.request.user, 'id', None)

        # If the user is a doctor and doctor_id is not provided, use the user's ID
        if user_role == 'DOCTOR' and 'doctor_id' not in serializer.validated_data:
            serializer.save(doctor_id=user_id)
        else:
            serializer.save()

    @action(detail=False, methods=['post'])
    def create_schedule_with_slots(self, request):
        """
        Tạo lịch làm việc cho bác sĩ và tự động tạo khung giờ khám bệnh trong một lần gọi.
        Hỗ trợ tạo lịch hàng tuần, lịch tạm thởi hoặc lịch nghỉ phép.

        Parameters:
        - doctor_id: ID của bác sĩ (bắt buộc)
        - schedule_type: Loại lịch (REGULAR: Lịch thường xuyên, TEMPORARY: Lịch tạm thời, DAY_OFF: Nghỉ phép)

        Cho lịch thường xuyên (REGULAR):
        - weekdays: Danh sách các ngày trong tuần (0-6, 0 là thứ 2) (bắt buộc)
        - start_time: Thời gian bắt đầu (HH:MM) (bắt buộc)
        - end_time: Thời gian kết thúc (HH:MM) (bắt buộc)
        - start_date: Ngày bắt đầu (YYYY-MM-DD) (tùy chọn, mặc định là ngày hiện tại)
        - end_date: Ngày kết thúc (YYYY-MM-DD) (tùy chọn, mặc định là 4 tuần sau start_date)
        - recurring_pattern: Mẫu lặp lại (WEEKLY, BIWEEKLY, MONTHLY) (tùy chọn, mặc định là WEEKLY)

        Cho lịch tạm thởi (TEMPORARY):
        - effective_date: Ngày áp dụng (YYYY-MM-DD) (bắt buộc)
        - start_time: Thời gian bắt đầu (HH:MM) (bắt buộc)
        - end_time: Thời gian kết thúc (HH:MM) (bắt buộc)

        Cho lịch nghỉ phép (DAY_OFF):
        - effective_date: Ngày nghỉ (YYYY-MM-DD) (bắt buộc)
        - notes: Lý do nghỉ phép (tùy chọn)

        Các tham số chung:
        - slot_duration: Thời lượng mỗi khung giờ (phút) (tùy chọn, mặc định là 30)
        - max_patients_per_slot: Số lượng bệnh nhân tối đa cho mỗi khung giờ (tùy chọn, mặc định là 1)
        - location: Địa điểm làm việc (tùy chọn)
        - department: Khoa/Phòng (tùy chọn)
        - room: Phòng khám (tùy chọn)
        - notes: Ghi chú (tùy chọn)
        """
        # Log dữ liệu đầu vào để debug
        logger.info(f"create_schedule_with_slots received data: {request.data}")

        doctor_id = request.data.get('doctor_id')
        schedule_type = request.data.get('schedule_type', 'REGULAR')  # REGULAR, TEMPORARY, DAY_OFF
        weekdays = request.data.get('weekdays', [])  # [0, 1, 2] - Thứ 2, 3, 4
        start_time = request.data.get('start_time')
        end_time = request.data.get('end_time')
        recurring_pattern = request.data.get('recurring_pattern', 'WEEKLY')
        start_date = request.data.get('start_date')
        end_date = request.data.get('end_date')
        effective_date = request.data.get('effective_date')
        slot_duration = request.data.get('slot_duration', 30)
        max_patients_per_slot = request.data.get('max_patients_per_slot', 1)

        # Kiểm tra các trường bắt buộc
        if not doctor_id:
            return Response(
                {"error": "doctor_id là bắt buộc"},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Kiểm tra loại lịch và các trường bắt buộc tương ứng
        if schedule_type == 'REGULAR':
            if not weekdays:
                return Response(
                    {"error": "weekdays là bắt buộc cho lịch thường xuyên"},
                    status=status.HTTP_400_BAD_REQUEST
                )
            if not start_time or not end_time:
                return Response(
                    {"error": "start_time và end_time là bắt buộc cho lịch thường xuyên"},
                    status=status.HTTP_400_BAD_REQUEST
                )
        elif schedule_type == 'TEMPORARY':
            if not effective_date:
                return Response(
                    {"error": "effective_date là bắt buộc cho lịch tạm thời"},
                    status=status.HTTP_400_BAD_REQUEST
                )
            if not start_time or not end_time:
                return Response(
                    {"error": "start_time và end_time là bắt buộc cho lịch tạm thời"},
                    status=status.HTTP_400_BAD_REQUEST
                )
        elif schedule_type == 'DAY_OFF':
            if not effective_date:
                return Response(
                    {"error": "effective_date là bắt buộc cho lịch nghỉ phép"},
                    status=status.HTTP_400_BAD_REQUEST
                )

        # Tạo lịch làm việc
        created_schedules = []
        created_time_slots = []

        try:
            if schedule_type == 'REGULAR':
                # Tạo lịch làm việc hàng tuần
                for weekday in weekdays:
                    try:
                        # Kiểm tra xung đột thởi gian
                        if start_date:
                            # Nếu có start_date, kiểm tra xung đột cho ngày đầu tiên
                            current_date = datetime.strptime(start_date, '%Y-%m-%d').date()
                            end_date_obj = datetime.strptime(end_date, '%Y-%m-%d').date() if end_date else current_date

                            while current_date <= end_date_obj:
                                if current_date.weekday() == weekday:
                                    has_conflict, conflict_message = self._check_time_conflict(
                                        doctor_id=doctor_id,
                                        date=current_date,
                                        start_time=start_time,
                                        end_time=end_time
                                    )
                                    if has_conflict:
                                        return Response(
                                            {"error": f"Xung đột thởi gian cho ngày {current_date}: {conflict_message}"},
                                            status=status.HTTP_400_BAD_REQUEST
                                        )
                                    break
                                current_date += timedelta(days=1)

                        # Tạo lịch mới
                        schedule = DoctorAvailability.objects.create(
                            doctor_id=doctor_id,
                            weekday=weekday,
                            start_time=start_time,
                            end_time=end_time,
                            schedule_type='REGULAR',
                            is_available=True,
                            is_active=True,
                            recurring_pattern=recurring_pattern,
                            start_date=start_date,
                            end_date=end_date,
                            location=request.data.get('location'),
                            department=request.data.get('department'),
                            room=request.data.get('room'),
                            slot_duration=slot_duration,
                            max_patients_per_slot=max_patients_per_slot,
                            notes=request.data.get('notes')
                        )

                        created_schedules.append(schedule)

                        # Tạo các khung giờ cho lịch làm việc này
                        if start_date and end_date:
                            # Tạo khung giờ cho khoảng thởi gian cụ thể
                            start_date_obj = datetime.strptime(start_date, '%Y-%m-%d').date()
                            end_date_obj = datetime.strptime(end_date, '%Y-%m-%d').date()

                            current_date = start_date_obj
                            while current_date <= end_date_obj:
                                if current_date.weekday() == weekday:
                                    # Tạo khung giờ cho ngày này
                                    slots = self._create_time_slots_for_date(
                                        doctor_id=doctor_id,
                                        date=current_date,
                                        start_time=start_time,
                                        end_time=end_time,
                                        slot_duration=slot_duration,
                                        availability=schedule,
                                        location=request.data.get('location'),
                                        department=request.data.get('department'),
                                        room=request.data.get('room'),
                                        max_patients=max_patients_per_slot
                                    )
                                    created_time_slots.extend(slots)
                                current_date += timedelta(days=1)
                        else:
                            # Tạo khung giờ cho 4 tuần tới
                            start_date_obj = timezone.now().date()
                            end_date_obj = start_date_obj + timedelta(days=28)

                            current_date = start_date_obj
                            while current_date <= end_date_obj:
                                if current_date.weekday() == weekday:
                                    # Tạo khung giờ cho ngày này
                                    slots = self._create_time_slots_for_date(
                                        doctor_id=doctor_id,
                                        date=current_date,
                                        start_time=start_time,
                                        end_time=end_time,
                                        slot_duration=slot_duration,
                                        availability=schedule,
                                        location=request.data.get('location'),
                                        department=request.data.get('department'),
                                        room=request.data.get('room'),
                                        max_patients=max_patients_per_slot
                                    )
                                    created_time_slots.extend(slots)
                                current_date += timedelta(days=1)
                    except Exception as e:
                        logger.error(f"Error creating schedule for weekday {weekday}: {str(e)}")
                        return Response(
                            {"error": f"Lỗi khi tạo lịch làm việc cho thứ {weekday + 1}: {str(e)}"},
                            status=status.HTTP_500_INTERNAL_SERVER_ERROR
                        )
            elif schedule_type == 'TEMPORARY':
                try:
                    # Chuyển đổi ngày thành đối tượng date
                    effective_date_obj = datetime.strptime(effective_date, '%Y-%m-%d').date()
                    weekday = effective_date_obj.weekday()

                    # Kiểm tra xung đột thởi gian cho lịch tạm thởi
                    has_conflict, conflict_message = self._check_time_conflict(
                        doctor_id=doctor_id,
                        date=effective_date_obj,
                        start_time=start_time,
                        end_time=end_time
                    )
                    if has_conflict:
                        return Response(
                            {"error": f"Xung đột thởi gian cho ngày {effective_date_obj}: {conflict_message}"},
                            status=status.HTTP_400_BAD_REQUEST
                        )

                    # Tạo lịch tạm thởi
                    schedule = DoctorAvailability.objects.create(
                        doctor_id=doctor_id,
                        weekday=weekday,
                        start_time=start_time,
                        end_time=end_time,
                        effective_date=effective_date_obj,
                        schedule_type='TEMPORARY',
                        is_available=True,
                        is_active=True,
                        recurring_pattern=recurring_pattern,
                        location=request.data.get('location'),
                        department=request.data.get('department'),
                        room=request.data.get('room'),
                        slot_duration=slot_duration,
                        max_patients_per_slot=max_patients_per_slot,
                        notes=request.data.get('notes')
                    )

                    created_schedules.append(schedule)

                    # Tạo khung giờ cho ngày cụ thể
                    slots = self._create_time_slots_for_date(
                        doctor_id=doctor_id,
                        date=effective_date_obj,
                        start_time=start_time,
                        end_time=end_time,
                        slot_duration=slot_duration,
                        availability=schedule,
                        location=request.data.get('location'),
                        department=request.data.get('department'),
                        room=request.data.get('room'),
                        max_patients=max_patients_per_slot
                    )
                    created_time_slots.extend(slots)
                except Exception as e:
                    logger.error(f"Error creating temporary schedule: {str(e)}")
                    return Response(
                        {"error": f"Lỗi khi tạo lịch tạm thởi: {str(e)}"},
                        status=status.HTTP_500_INTERNAL_SERVER_ERROR
                    )
            elif schedule_type == 'DAY_OFF':
                try:
                    # Chuyển đổi ngày thành đối tượng date
                    effective_date_obj = datetime.strptime(effective_date, '%Y-%m-%d').date()
                    weekday = effective_date_obj.weekday()

                    # Tạo lịch nghỉ phép
                    schedule = DoctorAvailability.objects.create(
                        doctor_id=doctor_id,
                        weekday=weekday,
                        effective_date=effective_date_obj,
                        schedule_type='DAY_OFF',
                        is_available=False,
                        is_active=True,
                        notes=request.data.get('notes')
                    )

                    created_schedules.append(schedule)

                    # Hủy các khung giờ đã tạo trong ngày nghỉ
                    affected_slots = TimeSlot.objects.filter(
                        doctor_id=doctor_id,
                        date=effective_date_obj
                    )

                    # Lấy danh sách lịch hẹn bị ảnh hưởng
                    affected_appointments = Appointment.objects.filter(
                        time_slot__in=affected_slots,
                        status__in=['PENDING', 'CONFIRMED']
                    ).select_related('time_slot')

                    # Hủy các lịch hẹn bị ảnh hưởng
                    cancelled_appointments = []
                    for appointment in affected_appointments:
                        try:
                            appointment.transition_to('CANCELLED', notes=f"Bác sĩ nghỉ phép ngày {effective_date}")
                            cancelled_appointments.append(appointment.id)
                        except Exception as e:
                            logger.error(f"Error cancelling appointment {appointment.id}: {str(e)}")

                    # Đánh dấu các khung giờ là không khả dụng
                    affected_slots.update(status='BLOCKED', is_active=False)

                    # Thêm thông tin về các lịch hẹn bị hủy vào response
                    if cancelled_appointments:
                        logger.info(f"Cancelled {len(cancelled_appointments)} appointments due to doctor day off")
                        schedule.notes = (schedule.notes or "") + f"\nHủy {len(cancelled_appointments)} lịch hẹn: {', '.join(map(str, cancelled_appointments))}"
                        schedule.save(update_fields=['notes'])
                except Exception as e:
                    logger.error(f"Error creating day off: {str(e)}")
                    return Response(
                        {"error": f"Lỗi khi tạo lịch nghỉ phép: {str(e)}"},
                        status=status.HTTP_500_INTERNAL_SERVER_ERROR
                    )

            # Serialize kết quả
            schedule_serializer = DoctorAvailabilitySerializer(created_schedules, many=True)
            time_slot_serializer = TimeSlotSerializer(created_time_slots, many=True, context={'request': request})

            # Tổ chức kết quả theo ngày
            slots_by_date = {}
            for slot in time_slot_serializer.data:
                date = slot['date']
                if date not in slots_by_date:
                    slots_by_date[date] = []
                slots_by_date[date].append(slot)

            # Sắp xếp các khung giờ theo thởi gian bắt đầu
            for date in slots_by_date:
                slots_by_date[date].sort(key=lambda x: x['start_time'])

            # Sắp xếp các ngày theo thứ tự
            sorted_dates = sorted(slots_by_date.keys())

            # Tạo thông tin tổng quan
            summary = {
                'schedule_type': request.data.get('schedule_type', 'REGULAR'),
                'doctor_id': doctor_id,
                'total_schedules': len(created_schedules),
                'total_time_slots': len(created_time_slots),
                'dates': sorted_dates,
                'time_range': f"{request.data.get('start_time')} - {request.data.get('end_time')}" if schedule_type != 'DAY_OFF' else 'N/A',
                'slot_duration': slot_duration if schedule_type != 'DAY_OFF' else 'N/A',
                'max_patients_per_slot': max_patients_per_slot if schedule_type != 'DAY_OFF' else 'N/A',
            }

            return Response({
                'success': True,
                'message': f"Tạo thành công {len(created_schedules)} lịch làm việc và {len(created_time_slots)} khung giờ",
                'summary': summary,
                'schedules': schedule_serializer.data,
                'time_slots_by_date': slots_by_date,
                'time_slots': time_slot_serializer.data,
            }, status=status.HTTP_201_CREATED)
        except Exception as e:
            logger.error(f"Unexpected error in create_schedule_with_slots: {str(e)}")
            return Response(
                {"error": f"Lỗi không mong muốn: {str(e)}"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

    def _check_time_conflict(self, doctor_id, date, start_time, end_time, exclude_id=None):
        """
        Kiểm tra xung đột thởi gian khi tạo lịch làm việc mới

        Parameters:
        - doctor_id: ID của bác sĩ
        - date: Ngày cần kiểm tra
        - start_time: Thời gian bắt đầu
        - end_time: Thời gian kết thúc
        - exclude_id: ID của lịch làm việc cần loại trừ khi kiểm tra (cho trường hợp cập nhật)

        Returns:
        - (bool, str): (Có xung đột không, Thông báo lỗi)
        """
        # Chuyển đổi thởi gian thành đối tượng time nếu cần
        if isinstance(start_time, str):
            from datetime import datetime
            start_time = datetime.strptime(start_time, '%H:%M').time()
        if isinstance(end_time, str):
            from datetime import datetime
            end_time = datetime.strptime(end_time, '%H:%M').time()

        # Kiểm tra xem thởi gian bắt đầu có trước thởi gian kết thúc không
        if start_time >= end_time:
            return True, "Thời gian bắt đầu phải trước thởi gian kết thúc"

        # Tìm các khung giờ đã tồn tại của bác sĩ trong ngày
        existing_slots = TimeSlot.objects.filter(
            doctor_id=doctor_id,
            date=date,
            is_active=True
        )

        # Loại trừ các khung giờ của lịch làm việc cần loại trừ
        if exclude_id:
            existing_slots = existing_slots.exclude(availability_id=exclude_id)

        # Kiểm tra xung đột với các khung giờ đã tồn tại
        for slot in existing_slots:
            # Kiểm tra xem có giao nhau không
            if (start_time < slot.end_time and end_time > slot.start_time):
                return True, f"Xung đột với khung giờ {slot.start_time} - {slot.end_time}"

        return False, ""

    def _create_time_slots_for_date(self, doctor_id, date, start_time, end_time, slot_duration,
                                   availability=None, location=None, department=None, room=None, max_patients=1):
        """
        Tạo khung giờ cho một ngày cụ thể sử dụng bulk_create để tối ưu hóa database queries
        """
        # Đảm bảo start_time và end_time là đối tượng time
        from datetime import datetime, time

        # Nếu start_time là chuỗi, chuyển đổi nó thành đối tượng time
        if isinstance(start_time, str):
            try:
                start_time = datetime.strptime(start_time, '%H:%M').time()
            except ValueError:
                # Log lỗi và trả về danh sách rỗng
                logger.error(f"Invalid start_time format: {start_time}")
                return []

        # Kiểm tra xung đột thởi gian
        has_conflict, conflict_message = self._check_time_conflict(
            doctor_id=doctor_id,
            date=date,
            start_time=start_time,
            end_time=end_time,
            exclude_id=availability.id if availability else None
        )
        if has_conflict:
            logger.error(f"Time conflict for date {date}: {conflict_message}")
            return []

        # Nếu end_time là chuỗi, chuyển đổi nó thành đối tượng time
        if isinstance(end_time, str):
            try:
                end_time = datetime.strptime(end_time, '%H:%M').time()
            except ValueError:
                # Log lỗi và trả về danh sách rỗng
                logger.error(f"Invalid end_time format: {end_time}")
                return []

        # Convert time to minutes for easier calculation
        start_minutes = start_time.hour * 60 + start_time.minute
        end_minutes = end_time.hour * 60 + end_time.minute

        # Generate slots
        current_minutes = start_minutes
        created_slots = []
        slots_to_create = []
        slot_times = []

        # Đầu tiên, tạo danh sách tất cả các khung giờ cần tạo
        while current_minutes + slot_duration <= end_minutes:
            slot_start_time = f"{current_minutes // 60:02d}:{current_minutes % 60:02d}"
            current_minutes += slot_duration
            slot_end_time = f"{current_minutes // 60:02d}:{current_minutes % 60:02d}"

            # Lưu lại thởi gian để kiểm tra sau
            slot_times.append((slot_start_time, slot_end_time))

        # Kiểm tra các khung giờ đã tồn tại
        existing_slots = {}
        if slot_times:
            for slot in TimeSlot.objects.filter(
                doctor_id=doctor_id,
                date=date,
                start_time__in=[st for st, _ in slot_times],
                end_time__in=[et for _, et in slot_times]
            ):
                # Dùng tuple (start_time, end_time) làm key để tìm kiếm nhanh
                key = (str(slot.start_time)[:5], str(slot.end_time)[:5])
                existing_slots[key] = slot
                if slot.is_available:
                    created_slots.append(slot)

        # Tạo các slot mới chưa tồn tại
        for start_time_str, end_time_str in slot_times:
            key = (start_time_str, end_time_str)
            if key not in existing_slots:
                slots_to_create.append(
                    TimeSlot(
                        doctor_id=doctor_id,
                        date=date,
                        start_time=start_time_str,
                        end_time=end_time_str,
                        status='AVAILABLE',
                        is_active=True,
                        source_type='REGULAR' if availability and availability.schedule_type == 'REGULAR' else 'TEMPORARY',
                        availability=availability,
                        location=location,
                        department=department,
                        room=room,
                        duration=slot_duration,
                        max_patients=max_patients,
                        current_patients=0
                    )
                )

        # Tạo hàng loạt các time slot mới nếu có
        if slots_to_create:
            created_bulk = TimeSlot.objects.bulk_create(slots_to_create)
            created_slots.extend(created_bulk)

        return created_slots


class TimeSlotViewSet(viewsets.ModelViewSet):
    """
    API endpoint for managing time slots.

    Supports both URL structures:
    - /api/time-slots/
    - /api/appointments/time-slots/
    """
    queryset = TimeSlot.objects.all()
    serializer_class = TimeSlotSerializer
    authentication_classes = [CustomJWTAuthentication]
    # Thay đổi từ CanViewAppointments thành IsAuthenticated để cho phép tất cả người dùng đã xác thực truy cập
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.OrderingFilter, filters.SearchFilter]
    filterset_fields = ['doctor_id', 'date', 'status', 'is_active', 'location', 'department', 'room', 'source_type']
    ordering_fields = ['date', 'start_time', 'end_time', 'status', 'created_at', 'updated_at']
    search_fields = ['location', 'department', 'room', 'doctor_id']

    def get_queryset(self):
        """
        Filter time slots based on user role and query parameters.
        """
        from datetime import datetime
        from django.utils import timezone
        from django.db.models import Q

        queryset = TimeSlot.objects.all()

        # Get user information from authentication
        user_role = getattr(self.request.user, 'role', None)
        user_id = getattr(self.request.user, 'id', None)

        # Doctors can only see their own time slots
        if user_role == 'DOCTOR':
            queryset = queryset.filter(doctor_id=user_id)

        # Không hiển thị các khung giờ trong quá khứ
        current_datetime = timezone.now()
        current_date = current_datetime.date()
        current_time = current_datetime.time()

        # Lọc các khung giờ trong quá khứ
        queryset = queryset.filter(
            # Ngày lớn hơn ngày hiện tại
            Q(date__gt=current_date) |
            # Hoặc cùng ngày nhưng giờ bắt đầu lớn hơn giờ hiện tại
            Q(date=current_date, start_time__gt=current_time)
        )

        # Filter by availability
        available_only = self.request.query_params.get('available', None)
        if available_only == 'true':
            queryset = queryset.filter(status='AVAILABLE', is_active=True)

        # Filter by date range
        start_date = self.request.query_params.get('start_date', None)
        end_date = self.request.query_params.get('end_date', None)

        if start_date:
            try:
                start_date = datetime.strptime(start_date, '%Y-%m-%d').date()
                queryset = queryset.filter(date__gte=start_date)
            except ValueError:
                pass

        if end_date:
            try:
                end_date = datetime.strptime(end_date, '%Y-%m-%d').date()
                queryset = queryset.filter(date__lte=end_date)
            except ValueError:
                pass

        # Filter by specialty (requires integration with user-service)
        specialty = self.request.query_params.get('specialty', None)
        if specialty:
            # Lấy danh sách bác sĩ thuộc chuyên khoa
            from .integrations import get_doctors_by_specialty
            token = getattr(self.request, 'auth', None)
            doctor_ids = get_doctors_by_specialty(specialty, token)
            if doctor_ids:
                queryset = queryset.filter(doctor_id__in=doctor_ids)
            else:
                # Nếu không tìm thấy bác sĩ nào, trả về queryset rỗng
                queryset = queryset.none()

        # Filter by department
        department = self.request.query_params.get('department', None)
        if department:
            # Lấy danh sách bác sĩ thuộc khoa
            from .integrations import get_doctors_by_department
            token = getattr(self.request, 'auth', None)
            doctor_ids = get_doctors_by_department(department, token)
            if doctor_ids:
                queryset = queryset.filter(doctor_id__in=doctor_ids)
            else:
                # Nếu không tìm thấy bác sĩ nào, trả về queryset rỗng
                queryset = queryset.none()

        # Filter by weekday
        weekday = self.request.query_params.get('weekday', None)
        if weekday is not None:
            try:
                weekday = int(weekday)
                # Lọc các khung giờ có ngày thuộc weekday
                queryset = queryset.filter(date__week_day=(weekday % 7) + 1)  # Django uses 1-7 for week_day
            except ValueError:
                pass

        # Filter by location (search)
        location = self.request.query_params.get('location', None)
        if location:
            queryset = queryset.filter(location__icontains=location)

        return queryset

    @action(detail=False, methods=['get'])
    def available(self, request):
        """
        Get available time slots for a specific doctor and date range.

        Query parameters:
        - doctor_id: ID của bác sĩ (optional)
        - start_date: Ngày bắt đầu (YYYY-MM-DD) (optional)
        - end_date: Ngày kết thúc (YYYY-MM-DD) (optional)
        - department: Khoa/Phòng (optional)
        - location: Địa điểm (optional)
        - time_from: Thời gian bắt đầu trong ngày (HH:MM) (optional)
        - time_to: Thời gian kết thúc trong ngày (HH:MM) (optional)
        - weekday: Ngày trong tuần (0-6, 0 là thứ 2) (optional)
        """
        doctor_id = request.query_params.get('doctor_id')
        start_date = request.query_params.get('start_date')
        end_date = request.query_params.get('end_date')
        department = request.query_params.get('department')
        location = request.query_params.get('location')
        time_from = request.query_params.get('time_from')
        time_to = request.query_params.get('time_to')
        weekday = request.query_params.get('weekday')

        # Sử dụng get_queryset để đảm bảo áp dụng các bộ lọc chung
        # bao gồm lọc các khung giờ trong quá khứ
        queryset = self.get_queryset()

        if doctor_id:
            queryset = queryset.filter(doctor_id=doctor_id)

        if department:
            queryset = queryset.filter(department=department)

        if location:
            queryset = queryset.filter(location=location)

        # Only show available slots
        queryset = queryset.filter(status='AVAILABLE', is_active=True)

        # Filter by date range
        if start_date:
            try:
                start_date = datetime.strptime(start_date, '%Y-%m-%d').date()
                queryset = queryset.filter(date__gte=start_date)
            except ValueError:
                pass

        if end_date:
            try:
                end_date = datetime.strptime(end_date, '%Y-%m-%d').date()
                queryset = queryset.filter(date__lte=end_date)
            except ValueError:
                pass

        # Filter by time range
        if time_from:
            try:
                time_from = datetime.strptime(time_from, '%H:%M').time()
                queryset = queryset.filter(start_time__gte=time_from)
            except ValueError:
                pass

        if time_to:
            try:
                time_to = datetime.strptime(time_to, '%H:%M').time()
                queryset = queryset.filter(end_time__lte=time_to)
            except ValueError:
                pass

        # Filter by weekday
        if weekday is not None:
            try:
                weekday = int(weekday)
                # Lọc các khung giờ có ngày thuộc weekday
                queryset = queryset.filter(date__week_day=(weekday % 7) + 1)  # Django uses 1-7 for week_day
            except ValueError:
                pass

        # Thêm thông tin về số lượng bệnh nhân đã đặt lịch và thởi gian chờ dự kiến
        serializer = self.get_serializer(queryset, many=True)
        result = serializer.data

        # Nhóm các khung giờ theo ngày và bác sĩ
        grouped_slots = {}
        for slot in result:
            date = slot['date']
            doctor_id = slot['doctor_id']
            key = f"{date}_{doctor_id}"
            if key not in grouped_slots:
                grouped_slots[key] = []
            grouped_slots[key].append(slot)

        # Tính thởi gian chờ dự kiến cho từng nhóm
        for key, slots in grouped_slots.items():
            # Sắp xếp các khung giờ theo thởi gian bắt đầu
            slots.sort(key=lambda x: x['start_time'])

            # Tính tổng số bệnh nhân đã đặt lịch trong ngày
            total_patients = sum(slot.get('current_patients', 0) for slot in slots)

            # Tính thởi gian chờ dự kiến cho từng khung giờ
            for i, slot in enumerate(slots):
                # Thởi gian chờ dự kiến tăng dần theo thứ tự khung giờ
                # Giả sử mỗi bệnh nhân mất khoảng 15 phút
                waiting_time = i * 15 + slot.get('current_patients', 0) * 15

                # Thêm thông tin vào kết quả
                slot['estimated_waiting_time'] = waiting_time
                slot['estimated_waiting_time_display'] = f"{waiting_time // 60} giờ {waiting_time % 60} phút" if waiting_time >= 60 else f"{waiting_time} phút"
                slot['total_patients_in_day'] = total_patients

        return Response(result)


class AppointmentViewSet(viewsets.ModelViewSet):
    """
    API endpoint for managing appointments.

    Supports both URL structures:
    - /api/appointments/
    - /api/appointments/appointments/ (nested)
    """
    queryset = Appointment.objects.all()
    serializer_class = AppointmentSerializer
    authentication_classes = [CustomJWTAuthentication]
    permission_classes = [CanViewAppointments]
    filter_backends = [DjangoFilterBackend, filters.OrderingFilter]
    filterset_fields = ['patient_id', 'time_slot__doctor_id', 'time_slot__date', 'status']
    ordering_fields = ['time_slot__date', 'time_slot__start_time', 'status']

    def get_serializer_class(self):
        """
        Use different serializers for different actions.
        """
        if self.action == 'create':
            return AppointmentCreateSerializer
        return AppointmentSerializer

    def get_queryset(self):
        """
        Filter appointments based on user role.
        """
        queryset = Appointment.objects.all()

        # Get user information from authentication
        user_role = getattr(self.request.user, 'role', None)
        user_id = getattr(self.request.user, 'id', None)

        # Patients can only see their own appointments
        if user_role == 'PATIENT':
            queryset = queryset.filter(patient_id=user_id)

        # Doctors can only see appointments assigned to them
        elif user_role == 'DOCTOR':
            queryset = queryset.filter(time_slot__doctor_id=user_id)

        # Filter by date range
        start_date = self.request.query_params.get('start_date', None)
        end_date = self.request.query_params.get('end_date', None)

        if start_date:
            try:
                start_date = datetime.strptime(start_date, '%Y-%m-%d').date()
                queryset = queryset.filter(time_slot__date__gte=start_date)
            except ValueError:
                pass

        if end_date:
            try:
                end_date = datetime.strptime(end_date, '%Y-%m-%d').date()
                queryset = queryset.filter(time_slot__date__lte=end_date)
            except ValueError:
                pass

        return queryset

    def perform_create(self, serializer):
        """
        Set patient_id to the current user's ID if not provided.
        """
        user_role = getattr(self.request.user, 'role', None)
        user_id = getattr(self.request.user, 'id', None)

        # Save the appointment; notification via signal
        if user_role == 'PATIENT' and 'patient_id' not in serializer.validated_data:
            return serializer.save(patient_id=user_id)
        return serializer.save()

    @action(detail=True, methods=['post'])
    def cancel(self, request, pk=None):
        """
        Cancel an appointment.

        Không cho phép hủy lịch hẹn trong vòng 24 giờ trước giờ hẹn,
        trừ khi người hủy là bác sĩ hoặc admin.

        Parameters:
        - notes: Lý do hủy lịch
        - cancel_recurring: Hủy tất cả các lịch hẹn định kỳ (true/false)
        - suggest_alternatives: Đề xuất các khung giờ thay thế (true/false)
        """
        self.check_object_permissions(request, self.get_object())
        appointment = self.get_object()

        # Lấy lý do hủy từ request
        notes = request.data.get('notes', '')
        user_id = getattr(self.request.user, 'id', None)
        user_role = getattr(self.request.user, 'role', None)
        cancel_recurring = request.data.get('cancel_recurring', False)
        suggest_alternatives = request.data.get('suggest_alternatives', True)

        # Kiểm tra thởi gian hủy lịch
        from django.utils import timezone
        import datetime

        # Tính thởi gian còn lại đến lịch hẹn
        appointment_time = datetime.datetime.combine(
            appointment.time_slot.date,
            appointment.time_slot.start_time,
            tzinfo=timezone.get_current_timezone()
        )
        time_until_appointment = appointment_time - timezone.now()
        hours_until_appointment = time_until_appointment.total_seconds() / 3600

        # Nếu thởi gian còn lại ít hơn 24 giờ và người dùng không phải bác sĩ hoặc admin
        if hours_until_appointment < 24 and user_role not in ['DOCTOR', 'ADMIN']:
            return Response(
                {"error": "Không thể hủy lịch hẹn trong vòng 24 giờ trước giờ hẹn. Vui lòng liên hệ trực tiếp với phòng khám."},
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            # Sử dụng phương thức transition_to mới
            appointment.transition_to('CANCELLED', user_id=user_id, notes=notes)

            # Giải phóng khung giờ
            time_slot = appointment.time_slot
            time_slot.remove_patient()

            # Gửi thông báo
            from .integrations import send_notification
            send_notification(
                user_id=appointment.patient_id,
                notification_type='APPOINTMENT_CANCELLED',
                message=f"Lịch hẹn của bạn vào ngày {appointment.time_slot.date} lúc {appointment.time_slot.start_time} đã bị hủy."
            )

            # Nếu bác sĩ hủy lịch hẹn, gửi thông báo với lý do
            if user_role == 'DOCTOR':
                send_notification(
                    user_id=appointment.patient_id,
                    notification_type='DOCTOR_CANCELLED',
                    message=f"Bác sĩ đã hủy lịch hẹn của bạn vào ngày {appointment.time_slot.date}. Lý do: {notes}"
                )

            # Nếu là lịch hẹn định kỳ và yêu cầu hủy tất cả
            cancelled_recurring = []
            if cancel_recurring and appointment.is_recurring:
                # Tìm tất cả các lịch hẹn con
                recurring_appointments = Appointment.objects.filter(
                    follow_up_to=appointment.id,
                    status__in=['PENDING', 'CONFIRMED']
                )

                # Hủy từng lịch hẹn con
                for recurring_appointment in recurring_appointments:
                    try:
                        recurring_appointment.transition_to('CANCELLED', user_id=user_id, notes=f"Hủy tự động do hủy lịch hẹn định kỳ gốc #{appointment.id}")

                        # Giải phóng khung giờ
                        recurring_time_slot = recurring_appointment.time_slot
                        recurring_time_slot.remove_patient()

                        cancelled_recurring.append(recurring_appointment.id)
                    except Exception as e:
                        logger.error(f"Error cancelling recurring appointment {recurring_appointment.id}: {str(e)}")

            # Trả về thông tin lịch hẹn đã hủy
            serializer = self.get_serializer(appointment)
            response_data = serializer.data

            # Thêm thông tin về các lịch hẹn định kỳ đã hủy
            if cancelled_recurring:
                response_data['cancelled_recurring'] = {
                    'count': len(cancelled_recurring),
                    'ids': cancelled_recurring
                }

            return Response(response_data)

        except ValueError as e:
            return Response(
                {"error": str(e)},
                status=status.HTTP_400_BAD_REQUEST
            )

    @action(detail=True, methods=['post'])
    def complete(self, request, pk=None):
        """
        Mark an appointment as completed.
        """
        appointment = self.get_object()

        # Lấy ghi chú từ request
        notes = request.data.get('notes', '')
        user_id = getattr(self.request.user, 'id', None)

        try:
            # Sử dụng phương thức transition_to mới
            appointment.transition_to('COMPLETED', user_id=user_id, notes=notes)

            # Gửi thông báo
            from .integrations import send_notification
            send_notification(
                user_id=appointment.patient_id,
                notification_type='APPOINTMENT_COMPLETED',
                message=f"Lịch hẹn của bạn vào ngày {appointment.time_slot.date} đã hoàn thành."
            )

            serializer = self.get_serializer(appointment)
            return Response(serializer.data)

        except ValueError as e:
            return Response(
                {"error": str(e)},
                status=status.HTTP_400_BAD_REQUEST
            )

    @action(detail=True, methods=['post'])
    def reschedule(self, request, pk=None):
        """
        Reschedule an appointment to a new time slot.

        Cho phép đổi lịch hẹn thay vì hủy hoàn toàn.
        Nếu thởi gian còn lại ít hơn 24 giờ, chỉ bác sĩ hoặc admin mới có thể đổi lịch.

        Parameters:
        - time_slot_id: ID của khung giờ mới
        - notes: Ghi chú về việc đổi lịch
        - reschedule_recurring: Đổi tất cả các lịch hẹn định kỳ (true/false)
        """
        appointment = self.get_object()

        # Lấy thông tin từ request
        new_time_slot_id = request.data.get('time_slot_id')
        notes = request.data.get('notes', '')
        user_id = getattr(self.request.user, 'id', None)
        user_role = getattr(self.request.user, 'role', None)
        reschedule_recurring = request.data.get('reschedule_recurring', False)

        # Kiểm tra thởi gian đổi lịch
        from django.utils import timezone
        import datetime

        # Tính thởi gian còn lại đến lịch hẹn
        appointment_time = datetime.datetime.combine(
            appointment.time_slot.date,
            appointment.time_slot.start_time,
            tzinfo=timezone.get_current_timezone()
        )
        time_until_appointment = appointment_time - timezone.now()
        hours_until_appointment = time_until_appointment.total_seconds() / 3600

        # Nếu thởi gian còn lại ít hơn 24 giờ và người dùng không phải bác sĩ hoặc admin
        if hours_until_appointment < 24 and user_role not in ['DOCTOR', 'ADMIN']:
            return Response(
                {"error": "Không thể đổi lịch hẹn trong vòng 24 giờ trước giờ hẹn. Vui lòng liên hệ trực tiếp với phòng khám."},
                status=status.HTTP_400_BAD_REQUEST
            )

        if not new_time_slot_id:
            return Response(
                {"error": "time_slot_id is required"},
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            # Lấy time slot mới
            new_time_slot = TimeSlot.objects.get(id=new_time_slot_id)

            # Kiểm tra xem time slot có khả dụng không
            if new_time_slot.status != 'AVAILABLE' or not new_time_slot.is_active:
                # Tìm các khung giờ thay thế
                doctor_id = new_time_slot.doctor_id
                date = new_time_slot.date

                # Tìm các khung giờ trống của bác sĩ trong ngày đó
                alternative_slots_same_day = TimeSlot.objects.filter(
                    doctor_id=doctor_id,
                    date=date,
                    status='AVAILABLE',
                    is_active=True
                ).order_by('start_time')[:5]

                # Nếu không có khung giờ trống trong ngày, tìm các ngày gần nhất
                if not alternative_slots_same_day.exists():
                    # Tìm các khung giờ trống trong 7 ngày tiếp theo
                    next_week = date + timedelta(days=7)
                    alternative_slots = TimeSlot.objects.filter(
                        doctor_id=doctor_id,
                        date__gt=date,
                        date__lte=next_week,
                        status='AVAILABLE',
                        is_active=True
                    ).order_by('date', 'start_time')[:10]
                else:
                    alternative_slots = alternative_slots_same_day

                # Serialize các khung giờ thay thế
                serializer = TimeSlotSerializer(alternative_slots, many=True, context={'request': request})

                return Response({
                    "error": "Khung giờ đã chọn không còn khả dụng",
                    "alternatives": serializer.data,
                    "message": "Vui lòng chọn một trong các khung giờ thay thế sau"
                }, status=status.HTTP_400_BAD_REQUEST)

            # Kiểm tra xem time slot mới có phải trong tương lai không
            new_appointment_time = datetime.datetime.combine(
                new_time_slot.date,
                new_time_slot.start_time,
                tzinfo=timezone.get_current_timezone()
            )
            if new_appointment_time < timezone.now():
                return Response(
                    {"error": "Cannot reschedule to a past time"},
                    status=status.HTTP_400_BAD_REQUEST
                )

            # Lưu time slot cũ để trả lại sau
            old_time_slot = appointment.time_slot

            # Đánh dấu lịch hẹn là đã đổi lịch
            appointment.transition_to('RESCHEDULED', user_id=user_id, notes=notes)

            # Tạo lịch hẹn mới với time slot mới
            new_appointment = Appointment.objects.create(
                patient_id=appointment.patient_id,
                time_slot=new_time_slot,
                status='PENDING',  # Lịch hẹn mới sẽ có trạng thái PENDING
                appointment_type=appointment.appointment_type,
                priority=appointment.priority,
                reason_text=appointment.reason_text,
                reason_category=appointment.reason_category,
                is_recurring=appointment.is_recurring,
                recurrence_pattern=appointment.recurrence_pattern,
                recurrence_end_date=appointment.recurrence_end_date,
                is_follow_up=appointment.is_follow_up,
                medical_record_id=appointment.medical_record_id,
                insurance_id=appointment.insurance_id,
                created_by=user_id,
                notes=f"Rescheduled from appointment {appointment.id}"
            )

            # Đánh dấu time slot mới là đã đặt
            new_time_slot.add_patient()

            # Tạo các nhắc nhở cho lịch hẹn mới
            from .serializers import AppointmentCreateSerializer
            serializer_instance = AppointmentCreateSerializer()
            serializer_instance._create_appointment_reminders(new_appointment, new_time_slot)

            # Gửi thông báo
            from .integrations import send_notification
            send_notification(
                user_id=appointment.patient_id,
                notification_type='APPOINTMENT_RESCHEDULED',
                message=f"Lịch hẹn của bạn đã được đổi sang ngày {new_time_slot.date} lúc {new_time_slot.start_time}."
            )

            # Nếu bác sĩ đổi lịch hẹn, gửi thông báo với lý do
            if user_role == 'DOCTOR':
                send_notification(
                    user_id=appointment.patient_id,
                    notification_type='DOCTOR_RESCHEDULED',
                    message=f"Bác sĩ đã đổi lịch hẹn của bạn sang ngày {new_time_slot.date} lúc {new_time_slot.start_time}. Lý do: {notes}"
                )

            # Xử lý đổi lịch hẹn định kỳ nếu được yêu cầu
            rescheduled_recurring = []
            if reschedule_recurring and appointment.is_recurring:
                # Tìm tất cả các lịch hẹn con
                recurring_appointments = Appointment.objects.filter(
                    follow_up_to=appointment.id,
                    status__in=['PENDING', 'CONFIRMED']
                )

                # Tính khoảng cách ngày giữa lịch hẹn gốc và lịch hẹn mới
                days_diff = (new_time_slot.date - appointment.time_slot.date).days

                # Đổi từng lịch hẹn con
                for recurring_appointment in recurring_appointments:
                    try:
                        # Tính ngày mới cho lịch hẹn con
                        new_date = recurring_appointment.time_slot.date + timedelta(days=days_diff)

                        # Tìm khung giờ trống của bác sĩ trong ngày mới
                        available_slots = TimeSlot.objects.filter(
                            doctor_id=new_time_slot.doctor_id,
                            date=new_date,
                            status='AVAILABLE',
                            is_active=True,
                            start_time=new_time_slot.start_time  # Cùng giờ với lịch hẹn mới
                        )

                        if available_slots.exists():
                            # Sử dụng khung giờ trống đầu tiên
                            recurring_new_slot = available_slots.first()

                            # Đánh dấu lịch hẹn cũ là đã đổi lịch
                            recurring_appointment.transition_to('RESCHEDULED', user_id=user_id, notes=f"Đổi tự động do đổi lịch hẹn định kỳ gốc #{appointment.id}")

                            # Giải phóng khung giờ cũ
                            recurring_old_slot = recurring_appointment.time_slot
                            recurring_old_slot.remove_patient()

                            # Tạo lịch hẹn mới với khung giờ mới
                            recurring_new_appointment = Appointment.objects.create(
                                patient_id=recurring_appointment.patient_id,
                                time_slot=recurring_new_slot,
                                status='PENDING',
                                appointment_type=recurring_appointment.appointment_type,
                                priority=recurring_appointment.priority,
                                reason_text=recurring_appointment.reason_text,
                                reason_category=recurring_appointment.reason_category,
                                is_recurring=recurring_appointment.is_recurring,
                                recurrence_pattern=recurring_appointment.recurrence_pattern,
                                recurrence_end_date=recurring_appointment.recurrence_end_date,
                                is_follow_up=recurring_appointment.is_follow_up,
                                follow_up_to=recurring_appointment.follow_up_to,
                                medical_record_id=recurring_appointment.medical_record_id,
                                insurance_id=recurring_appointment.insurance_id,
                                created_by=user_id,
                                notes=f"Rescheduled from appointment {recurring_appointment.id}"
                            )

                            # Đánh dấu khung giờ mới là đã đặt
                            recurring_new_slot.add_patient()

                            # Tạo các nhắc nhở cho lịch hẹn mới
                            from .serializers import AppointmentCreateSerializer
                            serializer_instance = AppointmentCreateSerializer()
                            serializer_instance._create_appointment_reminders(recurring_new_appointment, recurring_new_slot)

                            # Gửi thông báo
                            from .integrations import send_notification
                            send_notification(
                                user_id=recurring_appointment.patient_id,
                                notification_type='APPOINTMENT_RESCHEDULED',
                                message=f"Lịch hẹn tái khám của bạn đã được đổi sang ngày {recurring_new_slot.date} lúc {recurring_new_slot.start_time}."
                            )

                            rescheduled_recurring.append({
                                'old_id': recurring_appointment.id,
                                'new_id': recurring_new_appointment.id,
                                'date': recurring_new_slot.date.strftime('%Y-%m-%d'),
                                'time': recurring_new_slot.start_time.strftime('%H:%M')
                            })
                    except Exception as e:
                        logger.error(f"Error rescheduling recurring appointment {recurring_appointment.id}: {str(e)}")

            # Trả về thông tin lịch hẹn mới
            serializer = self.get_serializer(new_appointment)
            response_data = serializer.data

            # Thêm thông tin về các lịch hẹn định kỳ đã đổi
            if rescheduled_recurring:
                response_data['rescheduled_recurring'] = {
                    'count': len(rescheduled_recurring),
                    'appointments': rescheduled_recurring
                }

            return Response(response_data)

        except TimeSlot.DoesNotExist:
            return Response(
                {"error": "Time slot not found"},
                status=status.HTTP_404_NOT_FOUND
            )
        except ValueError as e:
            return Response(
                {"error": str(e)},
                status=status.HTTP_400_BAD_REQUEST
            )

    @action(detail=False, methods=['get'])
    def upcoming(self, request):
        """
        Get upcoming appointments for the current user.
        """
        user_role = getattr(self.request.user, 'role', None)
        user_id = getattr(self.request.user, 'id', None)

        # Get today's date
        today = timezone.now().date()

        # Filter appointments
        queryset = self.get_queryset().filter(
            time_slot__date__gte=today,
            status__in=['PENDING', 'CONFIRMED']
        )

        # Order by date and time
        queryset = queryset.order_by('time_slot__date', 'time_slot__start_time')

        # Paginate results
        page = self.paginate_queryset(queryset)
        if page is not None:
            serializer = self.get_serializer(page, many=True)
            return self.get_paginated_response(serializer.data)

        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)

    @action(detail=True, methods=['post'])
    def create_follow_up(self, request, pk=None):
        """
        Tạo lịch hẹn tái khám từ lịch hẹn hiện tại
        """
        # Lấy lịch hẹn gốc
        parent_appointment = self.get_object()

        # Kiểm tra quyền truy cập
        self.check_object_permissions(request, parent_appointment)

        # Lấy thông tin từ request
        time_slot_id = request.data.get('time_slot_id')
        follow_up_date = request.data.get('follow_up_date')
        follow_up_time = request.data.get('follow_up_time')
        notes = request.data.get('notes', '')
        reason_text = request.data.get('reason_text', 'Tái khám')
        user_id = getattr(request.user, 'id', None)

        # Kiểm tra các trường bắt buộc
        if not time_slot_id and not (follow_up_date and follow_up_time):
            return Response(
                {"error": "Phải cung cấp time_slot_id hoặc cả follow_up_date và follow_up_time"},
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            # Nếu cung cấp time_slot_id, sử dụng nó
            if time_slot_id:
                time_slot = TimeSlot.objects.get(id=time_slot_id)

                # Kiểm tra xem time slot có khả dụng không
                if time_slot.status != 'AVAILABLE' or not time_slot.is_active:
                    # Tìm các khung giờ thay thế
                    doctor_id = time_slot.doctor_id
                    date = time_slot.date

                    # Tìm các khung giờ trống của bác sĩ trong ngày đó
                    alternative_slots_same_day = TimeSlot.objects.filter(
                        doctor_id=doctor_id,
                        date=date,
                        status='AVAILABLE',
                        is_active=True
                    ).order_by('start_time')[:5]

                    # Nếu không có khung giờ trống trong ngày, tìm các ngày gần nhất
                    if not alternative_slots_same_day.exists():
                        # Tìm các khung giờ trống trong 7 ngày tiếp theo
                        next_week = date + timedelta(days=7)
                        alternative_slots = TimeSlot.objects.filter(
                            doctor_id=doctor_id,
                            date__gt=date,
                            date__lte=next_week,
                            status='AVAILABLE',
                            is_active=True
                        ).order_by('date', 'start_time')[:10]
                    else:
                        alternative_slots = alternative_slots_same_day

                    # Serialize các khung giờ thay thế
                    serializer = TimeSlotSerializer(alternative_slots, many=True, context={'request': request})

                    return Response({
                        "error": "Khung giờ đã chọn không còn khả dụng",
                        "alternatives": serializer.data,
                        "message": "Vui lòng chọn một trong các khung giờ thay thế sau"
                    }, status=status.HTTP_400_BAD_REQUEST)
            else:
                # Nếu không cung cấp time_slot_id, tạo time slot mới
                from datetime import datetime

                # Chuyển đổi chuỗi ngày và giờ thành đối tượng date và time
                try:
                    follow_up_date_obj = datetime.strptime(follow_up_date, '%Y-%m-%d').date()
                    follow_up_time_obj = datetime.strptime(follow_up_time, '%H:%M').time()

                    # Tính end_time (mặc định là 30 phút sau start_time)
                    from datetime import timedelta
                    follow_up_datetime = datetime.combine(follow_up_date_obj, follow_up_time_obj)
                    end_datetime = follow_up_datetime + timedelta(minutes=30)
                    follow_up_end_time = end_datetime.time()
                except ValueError:
                    return Response(
                        {"error": "Invalid date or time format. Use YYYY-MM-DD for date and HH:MM for time"},
                        status=status.HTTP_400_BAD_REQUEST
                    )

                # Kiểm tra xem đã có time slot nào vào thởi điểm này chưa
                existing_slots = TimeSlot.objects.filter(
                    doctor_id=parent_appointment.doctor_id,
                    date=follow_up_date_obj,
                    start_time=follow_up_time_obj
                )

                if existing_slots.exists():
                    time_slot = existing_slots.first()

                    # Kiểm tra xem time slot có khả dụng không
                    if time_slot.status != 'AVAILABLE' or not time_slot.is_active:
                        return Response(
                            {"error": "Khung giờ đã chọn không còn khả dụng"},
                            status=status.HTTP_400_BAD_REQUEST
                        )
                else:
                    # Tạo time slot mới
                    time_slot = TimeSlot.objects.create(
                        doctor_id=parent_appointment.doctor_id,
                        date=follow_up_date_obj,
                        start_time=follow_up_time_obj,
                        end_time=follow_up_end_time,
                        status='AVAILABLE',
                        is_active=True,
                        source_type='MANUAL',
                        max_patients=1,
                        current_patients=0,
                        department=getattr(parent_appointment.time_slot, 'department', None),
                        location=getattr(parent_appointment.time_slot, 'location', None),
                        room=getattr(parent_appointment.time_slot, 'room', None)
                    )

            # Tạo lịch hẹn tái khám
            follow_up_appointment = Appointment.objects.create(
                patient_id=parent_appointment.patient_id,
                time_slot=time_slot,
                status='PENDING',
                appointment_type='FOLLOW_UP',
                priority=parent_appointment.priority,
                reason_text=reason_text,
                reason_category=parent_appointment.reason_category,
                is_recurring=False,
                recurrence_pattern=None,
                recurrence_end_date=None,
                is_follow_up=True,
                follow_up_to=parent_appointment.id,
                medical_record_id=parent_appointment.medical_record_id,
                insurance_id=parent_appointment.insurance_id,
                created_by=user_id,
                notes=notes or f"Tái khám từ lịch hẹn {parent_appointment.id}"
            )

            # Đánh dấu time slot là đã đặt
            time_slot.add_patient()

            # Tạo các nhắc nhở cho lịch hẹn mới
            from .serializers import AppointmentCreateSerializer
            serializer_instance = AppointmentCreateSerializer()
            serializer_instance._create_appointment_reminders(follow_up_appointment, time_slot)

            # Gửi thông báo
            from .integrations import send_appointment_notification
            send_appointment_notification(
                appointment=follow_up_appointment,
                notification_type='CREATED',
                message=f"Lịch hẹn tái khám của bạn đã được tạo vào ngày {time_slot.date.strftime('%d/%m/%Y')} lúc {time_slot.start_time.strftime('%H:%M')}."
            )

            # Trả về thông tin lịch hẹn mới
            serializer = self.get_serializer(follow_up_appointment)
            return Response(serializer.data, status=status.HTTP_201_CREATED)

        except TimeSlot.DoesNotExist:
            return Response(
                {"error": "Không tìm thấy khung giờ với ID đã cung cấp"},
                status=status.HTTP_404_NOT_FOUND
            )
        except Exception as e:
            return Response(
                {"error": str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

    @action(detail=False, methods=['get'])
    def patient_appointments(self, request):
        """
        Get all appointments for the current patient.
        This endpoint specifically addresses the API call to /api/appointments/patient-appointments/
        """
        user_role = getattr(self.request.user, 'role', None)
        user_id = getattr(self.request.user, 'id', None)

        # Log user information for debugging
        logger.info(f"Patient appointments requested by user: {user_id}, role: {user_role}")

        # Only allow patients to use this endpoint
        if user_role != 'PATIENT':
            logger.warning(f"Non-patient user {user_id} tried to access patient appointments")
            return Response(
                {"error": "Only patients can access this endpoint"},
                status=status.HTTP_403_FORBIDDEN
            )

        # Get all appointments for this patient
        queryset = Appointment.objects.filter(patient_id=user_id)

        # Allow filtering by status
        appointment_status = request.query_params.get('status', None)
        if appointment_status:
            queryset = queryset.filter(status=appointment_status.upper())

        # Order by date (newest first) and time
        queryset = queryset.order_by('-time_slot__date', 'time_slot__start_time')

        # Paginate results
        page = self.paginate_queryset(queryset)
        if page is not None:
            serializer = self.get_serializer(page, many=True)
            return self.get_paginated_response(serializer.data)

        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)


class PatientVisitViewSet(viewsets.ModelViewSet):
    """
    API endpoint for managing patient visits (check-ins).

    Supports both URL structures:
    - /api/patient-visits/
    - /api/appointments/visits/
    """
    queryset = PatientVisit.objects.all()
    serializer_class = PatientVisitSerializer
    authentication_classes = [CustomJWTAuthentication]
    permission_classes = [CanViewAppointments]
    filter_backends = [DjangoFilterBackend, filters.OrderingFilter]
    filterset_fields = ['appointment', 'status', 'checked_in_at']
    ordering_fields = ['checked_in_at', 'status']

    def get_queryset(self):
        """
        Filter visits based on user role.
        """
        queryset = PatientVisit.objects.all()

        # Get user information from authentication
        user_role = getattr(self.request.user, 'role', None)
        user_id = getattr(self.request.user, 'id', None)

        # Patients can only see their own visits
        if user_role == 'PATIENT':
            queryset = queryset.filter(appointment__patient_id=user_id)

        # Doctors can only see visits for their appointments
        elif user_role == 'DOCTOR':
            queryset = queryset.filter(appointment__time_slot__doctor_id=user_id)

        return queryset

    @action(detail=False, methods=['post'])
    def check_in(self, request):
        """
        Check in a patient for their appointment.
        """
        appointment_id = request.data.get('appointment_id')
        notes = request.data.get('notes', '')

        if not appointment_id:
            return Response(
                {"error": "appointment_id is required"},
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            # Get the appointment
            appointment = Appointment.objects.get(id=appointment_id)

            # Check if the appointment is today
            today = timezone.now().date()
            if appointment.time_slot.date != today:
                return Response(
                    {"error": "Can only check in for appointments scheduled today"},
                    status=status.HTTP_400_BAD_REQUEST
                )

            # Check if the appointment is in the right status
            if appointment.status not in ['CONFIRMED', 'PENDING']:
                return Response(
                    {"error": f"Cannot check in for appointment with status {appointment.status}"},
                    status=status.HTTP_400_BAD_REQUEST
                )

            # Check if a visit already exists
            if hasattr(appointment, 'visit'):
                return Response(
                    {"error": "Patient is already checked in for this appointment"},
                    status=status.HTTP_400_BAD_REQUEST
                )

            # Create the visit
            visit = PatientVisit.objects.create(
                appointment=appointment,
                status='WAITING',
                checked_in_at=timezone.now(),
                checked_in_by=getattr(request.user, 'id', None),
                notes=notes
            )

            # Update appointment status
            appointment.transition_to('CHECKED_IN', user_id=getattr(request.user, 'id', None), notes=f"Checked in at {timezone.now()}")

            # Return the visit data
            serializer = self.get_serializer(visit)
            return Response(serializer.data, status=status.HTTP_201_CREATED)

        except Appointment.DoesNotExist:
            return Response(
                {"error": "Appointment not found"},
                status=status.HTTP_404_NOT_FOUND
            )
        except Exception as e:
            return Response(
                {"error": str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

    @action(detail=True, methods=['post'])
    def update_status(self, request, pk=None):
        """
        Update the status of a patient visit.
        """
        visit = self.get_object()
        new_status = request.data.get('status')
        notes = request.data.get('notes', '')

        if not new_status:
            return Response(
                {"error": "status is required"},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Check if the status is valid
        valid_statuses = [choice[0] for choice in PatientVisit.VISIT_STATUS_CHOICES]
        if new_status not in valid_statuses:
            return Response(
                {"error": f"Invalid status. Must be one of: {', '.join(valid_statuses)}"},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Update the visit status
        visit.status = new_status

        # Update additional fields based on status
        if new_status == 'WITH_NURSE':
            visit.nurse_id = getattr(request.user, 'id', None)
        elif new_status == 'WITH_DOCTOR':
            visit.doctor_start_time = timezone.now()
            # Update appointment status
            visit.appointment.transition_to('IN_PROGRESS', user_id=getattr(request.user, 'id', None))
        elif new_status == 'COMPLETED':
            visit.doctor_end_time = timezone.now()
            # Calculate waiting time
            if visit.checked_in_at and visit.doctor_start_time:
                waiting_minutes = (visit.doctor_start_time - visit.checked_in_at).total_seconds() / 60
                visit.waiting_time = int(waiting_minutes)
            # Update appointment status
            visit.appointment.transition_to('COMPLETED', user_id=getattr(request.user, 'id', None))

        # Add notes if provided
        if notes:
            visit.notes = (visit.notes or "") + f"\n[{timezone.now().strftime('%Y-%m-%d %H:%M')}] {notes}"

        visit.save()

        serializer = self.get_serializer(visit)
        return Response(serializer.data)


@api_view(['GET'])
def available_doctors(request):
    """
    API endpoint for getting doctors with available time slots in a date range.

    Query parameters:
    - start_date: Ngày bắt đầu (YYYY-MM-DD) (optional, mặc định là ngày hiện tại)
    - end_date: Ngày kết thúc (YYYY-MM-DD) (optional, mặc định là 30 ngày sau start_date)
    - specialty: Lọc theo chuyên khoa (optional)
    - department: Lọc theo khoa (optional)
    - location: Lọc theo địa điểm (optional)
    - time_range: Lọc theo khoảng thởi gian (optional, format: HH:MM-HH:MM)
    - weekday: Lọc theo ngày trong tuần (optional, 0-6, 0 là thứ 2)
    - reason_id: ID lý do khám, để gợi ý bác sĩ phù hợp (optional)
    - sort_by: Sắp xếp kết quả (optional, các giá trị: rating, availability, relevance)
    """
    # Xác thực người dùng
    if not request.user.is_authenticated:
        return Response({"error": "Authentication required"}, status=status.HTTP_401_UNAUTHORIZED)

    # Lấy và validate các tham số
    start_date = request.query_params.get('start_date')
    end_date = request.query_params.get('end_date')
    specialty = request.query_params.get('specialty')
    department = request.query_params.get('department')
    location = request.query_params.get('location')
    time_range = request.query_params.get('time_range')
    weekday = request.query_params.get('weekday')
    reason_id = request.query_params.get('reason_id')
    sort_by = request.query_params.get('sort_by', 'availability').lower()

    # Nếu không có start_date hoặc end_date, sử dụng ngày hiện tại và 30 ngày sau
    if not start_date:
        start_date_obj = timezone.now().date()
        start_date = start_date_obj.strftime('%Y-%m-%d')
    else:
        try:
            start_date_obj = datetime.strptime(start_date, '%Y-%m-%d').date()
        except ValueError:
            return Response(
                {"error": "Invalid start_date format. Use YYYY-MM-DD"},
                status=status.HTTP_400_BAD_REQUEST
            )

    if not end_date:
        end_date_obj = start_date_obj + timedelta(days=30)
        end_date = end_date_obj.strftime('%Y-%m-%d')
    else:
        try:
            end_date_obj = datetime.strptime(end_date, '%Y-%m-%d').date()
        except ValueError:
            return Response(
                {"error": "Invalid end_date format. Use YYYY-MM-DD"},
                status=status.HTTP_400_BAD_REQUEST
            )

    # Log thông tin tìm kiếm
    logger.info(f"Searching for available doctors from {start_date} to {end_date}")
    if specialty:
        logger.info(f"Filtering by specialty: {specialty}")
    if department:
        logger.info(f"Filtering by department: {department}")
    if location:
        logger.info(f"Filtering by location: {location}")
    if time_range:
        logger.info(f"Filtering by time range: {time_range}")
    if weekday:
        logger.info(f"Filtering by weekday: {weekday}")
    if reason_id:
        logger.info(f"Filtering by reason_id: {reason_id}")

    # Tìm các bác sĩ có khung giờ trống trong khoảng thởi gian
    available_slots = TimeSlot.objects.filter(
        date__gte=start_date_obj,
        date__lte=end_date_obj,
        status='AVAILABLE',
        is_active=True
    )

    # Lọc theo department nếu có
    if department:
        available_slots = available_slots.filter(department=department)

    # Lọc theo location nếu có
    if location:
        available_slots = available_slots.filter(location=location)

    # Lọc theo weekday nếu có
    if weekday:
        try:
            weekday_int = int(weekday)
            if 0 <= weekday_int <= 6:
                # Tạo danh sách các ngày trong khoảng thởi gian có weekday tương ứng
                weekday_dates = []
                current_date = start_date_obj
                while current_date <= end_date_obj:
                    if current_date.weekday() == weekday_int:
                        weekday_dates.append(current_date)
                    current_date += timedelta(days=1)

                # Lọc theo các ngày có weekday tương ứng
                available_slots = available_slots.filter(date__in=weekday_dates)
        except ValueError:
            logger.warning(f"Invalid weekday value: {weekday}")

    # Lọc theo time_range nếu có
    if time_range:
        try:
            # Format: HH:MM-HH:MM
            start_time_str, end_time_str = time_range.split('-')
            start_time = datetime.strptime(start_time_str, '%H:%M').time()
            end_time = datetime.strptime(end_time_str, '%H:%M').time()

            # Lọc các khung giờ nằm trong khoảng thởi gian
            available_slots = available_slots.filter(
                start_time__gte=start_time,
                end_time__lte=end_time
            )
        except (ValueError, IndexError):
            logger.warning(f"Invalid time_range format: {time_range}")

    # Lấy danh sách ID bác sĩ có lịch trống
    doctor_ids = available_slots.values_list('doctor_id', flat=True).distinct()

    logger.info(f"Found {len(doctor_ids)} doctors with available slots")

    # Lấy thông tin chi tiết về bác sĩ từ user-service
    from .integrations import get_doctors_info
    token = getattr(request, 'auth', None)
    doctors = get_doctors_info(list(doctor_ids), token)

    # Nếu không lấy được thông tin từ user-service, trả về lỗi
    if not doctors:
        logger.error("Could not get doctor information from user-service")
        return Response({"error": "Không thể lấy thông tin bác sĩ"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    # Lọc theo specialty nếu có
    if specialty and doctors:
        doctors = [d for d in doctors if d.get('specialty') == specialty or d.get('specialization') == specialty]
        logger.info(f"After specialty filter: {len(doctors)} doctors")

    # Thêm thông tin về ngày có lịch trống cho mỗi bác sĩ
    for doctor in doctors:
        doctor_id = doctor.get('id')

        # Lấy các ngày có lịch trống
        available_dates = available_slots.filter(
            doctor_id=doctor_id
        ).values('date').distinct()

        doctor['available_dates'] = [date['date'].strftime('%Y-%m-%d') for date in available_dates]

        # Lấy số lượng khung giờ trống
        doctor['available_slots_count'] = available_slots.filter(doctor_id=doctor_id).count()

        # Lấy thông tin về khoa/phòng làm việc
        departments = available_slots.filter(
            doctor_id=doctor_id
        ).values_list('department', flat=True).distinct()

        doctor['departments'] = list(filter(None, departments))

        # Lấy thông tin về số lượng bệnh nhân đã khám
        appointment_count = Appointment.objects.filter(
            time_slot__doctor_id=doctor_id,
            status='COMPLETED'
        ).count()

        doctor['completed_appointments'] = appointment_count

        # Tính điểm phù hợp nếu có reason_id
        if reason_id:
            try:
                reason = AppointmentReason.objects.get(id=reason_id)
                # Tính điểm phù hợp dựa trên khoa và chuyên khoa
                relevance_score = 0
                if reason.department and reason.department in doctor.get('departments', []):
                    relevance_score += 5
                if doctor.get('specialty') and reason.department and doctor.get('specialty').lower() in reason.department.lower():
                    relevance_score += 3

                doctor['relevance_score'] = relevance_score
            except AppointmentReason.DoesNotExist:
                doctor['relevance_score'] = 0

    # Sắp xếp bác sĩ theo tiêu chí được chọn
    if sort_by == 'rating':
        # Sắp xếp theo đánh giá
        doctors.sort(key=lambda x: (-x.get('rating', 0), -x.get('available_slots_count', 0)))
    elif sort_by == 'relevance' and reason_id:
        # Sắp xếp theo mức độ phù hợp với lý do khám
        doctors.sort(key=lambda x: (-x.get('relevance_score', 0), -x.get('rating', 0), -x.get('available_slots_count', 0)))
    else:  # 'availability' hoặc mặc định
        # Sắp xếp theo số lượng khung giờ trống
        doctors.sort(key=lambda x: (-x.get('available_slots_count', 0), -x.get('rating', 0)))

    # Thêm thông tin về khung giờ trống sớm nhất cho mỗi bác sĩ
    for doctor in doctors:
        doctor_id = doctor.get('id')
        earliest_slot = available_slots.filter(
            doctor_id=doctor_id
        ).order_by('date', 'start_time').first()

        if earliest_slot:
            doctor['earliest_available_slot'] = {
                'id': earliest_slot.id,
                'date': earliest_slot.date.strftime('%Y-%m-%d'),
                'start_time': earliest_slot.start_time.strftime('%H:%M'),
                'end_time': earliest_slot.end_time.strftime('%H:%M'),
                'location': earliest_slot.location,
                'department': earliest_slot.department,
                'room': earliest_slot.room
            }

    # Nhóm bác sĩ theo khoa và chuyên khoa
    doctors_by_department = {}
    doctors_by_specialty = {}

    for doctor in doctors:
        # Nhóm theo khoa
        for dept in doctor.get('departments', []):
            if dept:
                if dept not in doctors_by_department:
                    doctors_by_department[dept] = []
                doctors_by_department[dept].append(doctor)

        # Nhóm theo chuyên khoa
        specialty = doctor.get('specialty')
        if specialty:
            if specialty not in doctors_by_specialty:
                doctors_by_specialty[specialty] = []
            doctors_by_specialty[specialty].append(doctor)

    # Sắp xếp các bác sĩ trong mỗi nhóm theo tiêu chí đã chọn
    for dept in doctors_by_department:
        if sort_by == 'rating':
            doctors_by_department[dept].sort(key=lambda x: (-x.get('rating', 0), -x.get('available_slots_count', 0)))
        elif sort_by == 'relevance' and reason_id:
            doctors_by_department[dept].sort(key=lambda x: (-x.get('relevance_score', 0), -x.get('rating', 0), -x.get('available_slots_count', 0)))
        else:
            doctors_by_department[dept].sort(key=lambda x: (-x.get('available_slots_count', 0), -x.get('rating', 0)))

    for spec in doctors_by_specialty:
        if sort_by == 'rating':
            doctors_by_specialty[spec].sort(key=lambda x: (-x.get('rating', 0), -x.get('available_slots_count', 0)))
        elif sort_by == 'relevance' and reason_id:
            doctors_by_specialty[spec].sort(key=lambda x: (-x.get('relevance_score', 0), -x.get('rating', 0), -x.get('available_slots_count', 0)))
        else:
            doctors_by_specialty[spec].sort(key=lambda x: (-x.get('available_slots_count', 0), -x.get('rating', 0)))

    # Tạo thông tin tổng quan
    summary = {
        'total_doctors': len(doctors),
        'total_departments': len(doctors_by_department),
        'total_specialties': len(doctors_by_specialty),
        'date_range': f"{start_date} - {end_date}",
        'filters_applied': {
            'specialty': specialty,
            'department': department,
            'location': location,
            'time_range': time_range,
            'weekday': weekday,
            'reason_id': reason_id,
            'sort_by': sort_by
        }
    }

    logger.info(f"Returning {len(doctors)} available doctors in {len(doctors_by_department)} departments and {len(doctors_by_specialty)} specialties")
    return Response({
        'success': True,
        'summary': summary,
        'count': len(doctors),
        'start_date': start_date,
        'end_date': end_date,
        'doctors': doctors,
        'doctors_by_department': {
            dept: [{'id': d['id'], 'name': d['name'], 'available_slots_count': d['available_slots_count']} for d in docs]
            for dept, docs in doctors_by_department.items()
        },
        'doctors_by_specialty': {
            spec: [{'id': d['id'], 'name': d['name'], 'available_slots_count': d['available_slots_count']} for d in docs]
            for spec, docs in doctors_by_specialty.items()
        }
    })


@api_view(['GET'])
def estimated_waiting_time(request):
    """
    API endpoint for getting estimated waiting time for a doctor or department.

    Query parameters:
    - doctor_id: Doctor ID (optional)
    - department: Department name (optional)
    - date: Date in YYYY-MM-DD format (optional, defaults to today)
    """
    # Xác thực người dùng
    if not request.user.is_authenticated:
        return Response({"error": "Authentication required"}, status=status.HTTP_401_UNAUTHORIZED)

    # Lấy các tham số
    doctor_id = request.query_params.get('doctor_id')
    department = request.query_params.get('department')
    date_str = request.query_params.get('date')

    # Nếu không có date, sử dụng ngày hiện tại
    if date_str:
        try:
            date = datetime.strptime(date_str, '%Y-%m-%d').date()
        except ValueError:
            return Response(
                {"error": "Invalid date format. Use YYYY-MM-DD"},
                status=status.HTTP_400_BAD_REQUEST
            )
    else:
        date = timezone.now().date()

    # Kiểm tra các tham số bắt buộc
    if not doctor_id and not department:
        return Response(
            {"error": "Either doctor_id or department is required"},
            status=status.HTTP_400_BAD_REQUEST
        )

    # Tìm các lịch hẹn trong ngày
    appointments = Appointment.objects.filter(
        time_slot__date=date,
        status__in=['CONFIRMED', 'PENDING', 'IN_PROGRESS']
    ).select_related('time_slot', 'visit')

    # Lọc theo bác sĩ hoặc khoa
    if doctor_id:
        appointments = appointments.filter(time_slot__doctor_id=doctor_id)
    if department:
        appointments = appointments.filter(time_slot__department=department)

    # Tính thởi gian chờ trung bình
    total_waiting_time = 0
    count = 0

    for appointment in appointments:
        if hasattr(appointment, 'visit') and appointment.visit and appointment.visit.waiting_time:
            total_waiting_time += appointment.visit.waiting_time
            count += 1

    # Tính thởi gian chờ trung bình
    avg_waiting_time = total_waiting_time // count if count > 0 else 0

    # Ước tính số lượng bệnh nhân đang chờ
    waiting_patients = appointments.filter(status__in=['CONFIRMED', 'PENDING']).count()

    # Ước tính thởi gian chờ dự kiến
    estimated_time = avg_waiting_time * waiting_patients // 2 if waiting_patients > 0 else 0

    # Chuyển đổi thởi gian chờ sang giờ:phút
    hours = estimated_time // 60
    minutes = estimated_time % 60

    waiting_time_display = f"{hours} giờ {minutes} phút" if hours > 0 else f"{minutes} phút"

    # Lấy thông tin chi tiết về bác sĩ nếu có doctor_id
    doctor_info = None
    if doctor_id:
        from .integrations import get_doctor_info
        token = getattr(request, 'auth', None)
        doctor_info = get_doctor_info(doctor_id, token)

        if not doctor_info:
            doctor_info = {
                'id': doctor_id,
                'name': f'Bác sĩ (ID: {doctor_id})'
            }

    # Lấy danh sách lịch hẹn đang chờ
    waiting_appointments = []
    if waiting_patients > 0:
        pending_appointments = appointments.filter(status__in=['CONFIRMED', 'PENDING']).select_related('time_slot').order_by('time_slot__start_time')[:10]

        for appointment in pending_appointments:
            waiting_appointments.append({
                'id': appointment.id,
                'patient_id': appointment.patient_id,
                'time_slot': {
                    'id': appointment.time_slot.id,
                    'date': appointment.time_slot.date.strftime('%Y-%m-%d'),
                    'start_time': appointment.time_slot.start_time.strftime('%H:%M'),
                    'end_time': appointment.time_slot.end_time.strftime('%H:%M')
                },
                'status': appointment.status,
                'status_name': appointment.get_status_display()
            })

    # Tạo thông tin tổng quan
    summary = {
        'date': date.strftime('%Y-%m-%d'),
        'doctor_id': doctor_id,
        'doctor_name': doctor_info.get('name') if doctor_info else None,
        'department': department,
        'waiting_patients': waiting_patients,
        'average_waiting_time_minutes': avg_waiting_time,
        'average_waiting_time_display': f"{avg_waiting_time // 60} giờ {avg_waiting_time % 60} phút" if avg_waiting_time >= 60 else f"{avg_waiting_time} phút",
        'estimated_waiting_time_minutes': estimated_time,
        'estimated_waiting_time_display': waiting_time_display,
        'busyness_level': 'Cao' if waiting_patients > 5 else ('Trung bình' if waiting_patients > 2 else 'Thấp')
    }

    return Response({
        'success': True,
        'summary': summary,
        'doctor_info': doctor_info,
        'waiting_appointments': waiting_appointments,
        'date': date.strftime('%Y-%m-%d'),
        'doctor_id': doctor_id,
        'department': department,
        'waiting_patients': waiting_patients,
        'average_waiting_time': avg_waiting_time,
        'estimated_waiting_time': estimated_time,
        'estimated_waiting_time_display': waiting_time_display
    })


@api_view(['GET'])
def specialties(request):
    """
    API endpoint for getting specialties.
    """
    # Xác thực người dùng
    if not request.user.is_authenticated:
        return Response({"error": "Authentication required"}, status=status.HTTP_401_UNAUTHORIZED)

    # Lấy danh sách chuyên khoa từ user-service
    from .integrations import get_specialties
    token = getattr(request, 'auth', None)
    specialties_list = get_specialties(token)

    # Nếu không lấy được từ user-service, trả về lỗi
    if not specialties_list:
        logger.error("Could not get specialties from user-service")
        return Response({"error": "Không thể lấy danh sách chuyên khoa"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    return Response(specialties_list)


@api_view(['GET'])
def departments(request):
    """
    API endpoint for getting departments.
    """
    # Xác thực người dùng
    if not request.user.is_authenticated:
        return Response({"error": "Authentication required"}, status=status.HTTP_401_UNAUTHORIZED)

    # Lấy danh sách khoa từ user-service
    from .integrations import get_departments
    token = getattr(request, 'auth', None)
    departments_list = get_departments(token)

    # Nếu không lấy được từ user-service, trả về lỗi
    if not departments_list:
        logger.error("Could not get departments from user-service")
        return Response({"error": "Không thể lấy danh sách khoa"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    return Response(departments_list)


@api_view(['GET'])
def appointment_reasons_list(request):
    """
    API endpoint để lấy danh sách lý do khám.

    Query parameters:
    - department: Lọc theo khoa (optional)
    - priority: Lọc theo mức độ ưu tiên (optional)
    - search: Tìm kiếm theo tên hoặc mô tả (optional)
    - is_active: Lọc theo trạng thái hoạt động (optional, mặc định là True)
    """
    # Xác thực người dùng
    if not request.user.is_authenticated:
        return Response({"error": "Authentication required"}, status=status.HTTP_401_UNAUTHORIZED)

    # Lấy các tham số từ request
    department = request.query_params.get('department')
    priority = request.query_params.get('priority')
    search = request.query_params.get('search')
    is_active = request.query_params.get('is_active', 'true').lower() == 'true'

    # Lấy danh sách lý do khám
    reasons = AppointmentReason.objects.filter(is_active=is_active)

    # Áp dụng các bộ lọc
    if department:
        reasons = reasons.filter(department=department)

    if priority:
        try:
            priority_int = int(priority)
            reasons = reasons.filter(priority=priority_int)
        except ValueError:
            pass

    if search:
        from django.db.models import Q
        reasons = reasons.filter(
            Q(name__icontains=search) | Q(description__icontains=search)
        )

    # Sắp xếp kết quả
    reasons = reasons.order_by('-priority', 'name')

    # Serialize kết quả
    serializer = AppointmentReasonSerializer(reasons, many=True)

    return Response({
        'count': reasons.count(),
        'results': serializer.data
    })
