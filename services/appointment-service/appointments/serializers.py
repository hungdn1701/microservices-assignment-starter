from rest_framework import serializers
from .models import (
    DoctorAvailability,
    TimeSlot,
    Appointment,
    AppointmentReminder,
    AppointmentReason,
    PatientVisit
)


class DoctorAvailabilitySerializer(serializers.ModelSerializer):
    weekday_name = serializers.CharField(source='get_weekday_display', read_only=True)
    schedule_type_name = serializers.CharField(source='get_schedule_type_display', read_only=True)
    recurring_pattern_name = serializers.CharField(source='get_recurring_pattern_display', read_only=True)

    class Meta:
        model = DoctorAvailability
        fields = [
            'id', 'doctor_id', 'weekday', 'weekday_name', 'start_time', 'end_time', 'is_available', 'is_active',
            'location', 'department', 'room', 'schedule_type', 'schedule_type_name',
            'recurring_pattern', 'recurring_pattern_name', 'effective_date', 'start_date', 'end_date',
            'slot_duration', 'max_patients_per_slot', 'notes', 'created_at', 'updated_at'
        ]
        read_only_fields = ['created_at', 'updated_at']


class TimeSlotSerializer(serializers.ModelSerializer):
    availability_id = serializers.PrimaryKeyRelatedField(source='availability', read_only=True)
    doctor_info = serializers.SerializerMethodField()
    status_name = serializers.CharField(source='get_status_display', read_only=True)
    source_type_name = serializers.CharField(source='get_source_type_display', read_only=True)

    class Meta:
        model = TimeSlot
        fields = [
            'id', 'doctor_id', 'doctor_info', 'date', 'start_time', 'end_time',
            'status', 'status_name', 'is_active', 'source_type', 'source_type_name',
            'availability_id', 'location', 'department', 'room', 'duration',
            'max_patients', 'current_patients', 'created_at', 'updated_at'
        ]
        read_only_fields = ['created_at', 'updated_at', 'current_patients', 'doctor_info', 'status_name', 'source_type_name']

    def get_doctor_info(self, obj):
        """
        Lấy thông tin chi tiết về bác sĩ từ user-service
        """
        try:
            from .integrations import get_doctor_info

            # Lấy token từ request nếu có
            request = self.context.get('request')
            token = None
            if request and hasattr(request, 'auth'):
                token = request.auth

            # Lấy thông tin bác sĩ
            doctor_info = get_doctor_info(obj.doctor_id, token)

            # Nếu doctor_info có trường 'name', sử dụng trực tiếp
            if doctor_info and 'name' in doctor_info:
                result = {
                    'id': doctor_info.get('id'),
                    'name': doctor_info.get('name')
                }

                # Thêm các trường bổ sung nếu có
                for field in ['specialty', 'department', 'profile_image', 'email', 'phone', 'gender', 'rating']:
                    if field in doctor_info:
                        result[field] = doctor_info.get(field)

                return result

            # Nếu doctor_info có first_name và last_name, kết hợp lại
            if doctor_info and ('first_name' in doctor_info or 'last_name' in doctor_info):
                name = f"{doctor_info.get('first_name', '')} {doctor_info.get('last_name', '')}".strip()
                result = {
                    'id': doctor_info.get('id'),
                    'name': name or f'Bác sĩ (ID: {obj.doctor_id})',
                }

                # Thêm các trường bổ sung nếu có
                for field in ['specialty', 'department', 'profile_image', 'email', 'phone', 'gender', 'rating']:
                    if field in doctor_info:
                        result[field] = doctor_info.get(field)

                return result
        except Exception as e:
            import logging
            logger = logging.getLogger(__name__)
            logger.error(f"Error fetching doctor info for doctor_id {obj.doctor_id}: {str(e)}")

        # Trường hợp còn lại hoặc có lỗi, sử dụng thông tin cơ bản
        return {
            'id': obj.doctor_id,
            'name': f'Bác sĩ (ID: {obj.doctor_id})',
            'specialty': 'Khoa nội',
            'department': obj.department or 'Khoa nội',
            'profile_image': ''
        }


class AppointmentReasonSerializer(serializers.ModelSerializer):
    class Meta:
        model = AppointmentReason
        fields = [
            'id', 'name', 'description', 'department', 'priority', 'estimated_duration',
            'is_active', 'created_at', 'updated_at'
        ]
        read_only_fields = ['created_at', 'updated_at']


class AppointmentReminderSerializer(serializers.ModelSerializer):
    reminder_type_name = serializers.CharField(source='get_reminder_type_display', read_only=True)
    status_name = serializers.CharField(source='get_status_display', read_only=True)

    class Meta:
        model = AppointmentReminder
        fields = ['id', 'appointment', 'reminder_type', 'reminder_type_name', 'scheduled_time', 'status', 'status_name', 'sent_at', 'message', 'created_at', 'updated_at']
        read_only_fields = ['created_at', 'updated_at', 'sent_at']


class PatientVisitSerializer(serializers.ModelSerializer):
    waiting_time_display = serializers.SerializerMethodField()
    status_name = serializers.CharField(source='get_status_display', read_only=True)

    class Meta:
        model = PatientVisit
        fields = [
            'id', 'appointment', 'status', 'status_name', 'checked_in_at', 'checked_in_by',
            'nurse_id', 'vitals_recorded', 'vitals_recorded_at',
            'doctor_start_time', 'doctor_end_time', 'waiting_time', 'waiting_time_display',
            'notes', 'created_at', 'updated_at'
        ]
        read_only_fields = ['created_at', 'updated_at', 'checked_in_at', 'waiting_time']

    def get_waiting_time_display(self, obj):
        if obj.waiting_time:
            hours = obj.waiting_time // 60
            minutes = obj.waiting_time % 60
            if hours > 0:
                return f"{hours} giờ {minutes} phút"
            return f"{minutes} phút"
        return None


class AppointmentSerializer(serializers.ModelSerializer):
    status_name = serializers.CharField(source='get_status_display', read_only=True)
    appointment_type_name = serializers.CharField(source='get_appointment_type_display', read_only=True)
    priority_name = serializers.CharField(source='get_priority_display', read_only=True)
    reminders = AppointmentReminderSerializer(many=True, read_only=True)
    doctor_id = serializers.IntegerField(read_only=True)
    appointment_date = serializers.DateField(source='time_slot.date', read_only=True)
    start_time = serializers.TimeField(source='time_slot.start_time', read_only=True)
    end_time = serializers.TimeField(source='time_slot.end_time', read_only=True)
    location = serializers.CharField(source='time_slot.location', read_only=True)
    visit_data = PatientVisitSerializer(source='visit', read_only=True)
    reason_category_details = AppointmentReasonSerializer(source='reason_category', read_only=True)

    class Meta:
        model = Appointment
        fields = [
            'id', 'patient_id', 'doctor_id', 'time_slot', 'appointment_date', 'start_time', 'end_time',
            'status', 'status_name', 'appointment_type', 'appointment_type_name',
            'priority', 'priority_name', 'reason_text', 'reason_category', 'reason_category_details',
            'is_recurring', 'recurrence_pattern', 'recurrence_end_date', 'parent_appointment',
            'is_follow_up', 'follow_up_to', 'notes', 'reminders', 'visit_data',
            'medical_record_id', 'prescription_id', 'lab_request_id', 'billing_id', 'location', 'created_at', 'updated_at'
        ]
        read_only_fields = ['created_at', 'updated_at', 'doctor_id', 'appointment_date', 'start_time', 'end_time']

    def create(self, validated_data):
        # If time_slot is provided, update it using the new method
        time_slot = validated_data.get('time_slot')
        if time_slot:
            try:
                time_slot.add_patient()
            except ValueError as e:
                raise serializers.ValidationError(str(e))

        # Create the appointment
        return super().create(validated_data)

    def update(self, instance, validated_data):
        # Handle time slot changes
        old_time_slot = instance.time_slot
        new_time_slot = validated_data.get('time_slot', old_time_slot)

        # If time slot changed, update availability status using the new methods
        if old_time_slot and old_time_slot != new_time_slot:
            try:
                old_time_slot.remove_patient()
            except ValueError as e:
                # Log the error but continue, as we're removing a patient
                # from a slot that might already be empty due to data inconsistency
                import logging
                logger = logging.getLogger(__name__)
                logger.warning(f"Error removing patient from time slot {old_time_slot.id}: {str(e)}")

        if new_time_slot and new_time_slot != old_time_slot:
            try:
                new_time_slot.add_patient()
            except ValueError as e:
                raise serializers.ValidationError(f"Không thể đặt lịch vào khung giờ mới: {str(e)}")

        # Update the appointment
        return super().update(instance, validated_data)


class AppointmentCreateSerializer(serializers.ModelSerializer):
    # patient_id will be set from the authenticated user, not provided by client
    patient_id = serializers.IntegerField(read_only=True)
    time_slot_id = serializers.IntegerField(write_only=True, required=True)
    reason_category_id = serializers.IntegerField(write_only=True, required=False)
    created_by = serializers.IntegerField(required=False)
    doctor_name = serializers.CharField(read_only=True)

    class Meta:
        model = Appointment
        fields = [
            'patient_id', 'time_slot_id', 'reason_text', 'reason_category_id',
            'appointment_type', 'priority', 'notes', 'created_by', 'doctor_name',
            'is_recurring', 'recurrence_pattern', 'recurrence_end_date',
            'is_follow_up', 'follow_up_to', 'medical_record_id', 'insurance_id'
        ]

    def validate(self, data):
        """
        Validate that the appointment time is available for the doctor.
        """
        from .exceptions import TimeSlotUnavailableException, ResourceNotFoundException

        # Lấy time_slot_id từ dữ liệu
        time_slot_id = data.pop('time_slot_id', None)

        # Kiểm tra xem time_slot_id có được cung cấp không
        if not time_slot_id:
            raise serializers.ValidationError("time_slot_id là bắt buộc")

        try:
            # Lấy time slot từ database
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
                    from datetime import timedelta
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

                # Chuẩn bị thông tin về các khung giờ thay thế
                alternative_slots_info = [{
                    'id': slot.id,
                    'date': slot.date,
                    'start_time': slot.start_time,
                    'end_time': slot.end_time
                } for slot in alternative_slots]

                raise TimeSlotUnavailableException(
                    f"Khung giờ {time_slot_id} không còn khả dụng. Vui lòng chọn một trong các khung giờ thay thế.",
                    alternatives=alternative_slots_info
                )

            # Thêm time_slot vào dữ liệu đã validate
            data['time_slot'] = time_slot

            # Thêm doctor_id vào dữ liệu đã validate
            data['doctor_id'] = time_slot.doctor_id

        except TimeSlot.DoesNotExist:
            raise ResourceNotFoundException(f"Không tìm thấy khung giờ với ID {time_slot_id}")

        # Chuyển reason_category_id thành đối tượng reason_category nếu có
        reason_category_id = data.pop('reason_category_id', None)
        if reason_category_id:
            try:
                reason_category = AppointmentReason.objects.get(id=reason_category_id)
                data['reason_category'] = reason_category
            except AppointmentReason.DoesNotExist:
                raise ResourceNotFoundException(f"Không tìm thấy lý do khám với ID {reason_category_id}")

        return data

    def create(self, validated_data):
        """Tạo lịch hẹn mới và các thành phần liên quan"""
        from django.db import transaction
        import logging
        from .exceptions import TimeSlotUnavailableException, TimeSlotCapacityExceededException

        logger = logging.getLogger(__name__)

        # Sử dụng transaction để đảm bảo tính nhất quán
        with transaction.atomic():
            try:
                # Lấy time_slot từ dữ liệu đã validate
                time_slot = validated_data.get('time_slot')

                # Thêm bệnh nhân vào khung giờ (sử dụng các ngoại lệ từ TimeSlot.add_patient)
                time_slot.add_patient()

                # Đảm bảo trường status được đặt đúng
                if 'status' not in validated_data:
                    validated_data['status'] = 'PENDING'

                # Tạo bản sao của validated_data để tránh lỗi can't set attribute
                appointment_data = {}
                for key, value in validated_data.items():
                    # Loại bỏ các trường đặc biệt có thể gây lỗi
                    if key not in ['doctor_id']:
                        appointment_data[key] = value

                # Create the appointment
                appointment = Appointment.objects.create(**appointment_data)

                # Tự động chuyển trạng thái từ PENDING sang CONFIRMED
                try:
                    user_id = validated_data.get('created_by', None)
                    appointment.transition_to('CONFIRMED', user_id=user_id, notes="Tự động xác nhận lịch hẹn")
                except Exception as e:
                    logger.error(f"Error auto-confirming appointment: {str(e)}")
                    # Tiếp tục xử lý ngay cả khi không thể chuyển trạng thái

                # Tạo các nhắc nhở cho lịch hẹn
                self._create_appointment_reminders(appointment, time_slot)

                # Xử lý lịch hẹn định kỳ
                if validated_data.get('is_recurring') and validated_data.get('recurrence_pattern'):
                    self._create_recurring_appointments(appointment)

                # Tạo hóa đơn cho lịch hẹn
                self._create_appointment_billing(appointment)

                return appointment
            except TimeSlotUnavailableException as e:
                # Ghi log và ném lại ngoại lệ với thông báo rõ ràng hơn
                logger.error(f"TimeSlotUnavailableException: {str(e)}")
                raise serializers.ValidationError(f"Khung giờ không khả dụng: {str(e)}")
            except TimeSlotCapacityExceededException as e:
                # Ghi log và ném lại ngoại lệ với thông báo rõ ràng hơn
                logger.error(f"TimeSlotCapacityExceededException: {str(e)}")
                raise serializers.ValidationError(f"Khung giờ đã đầy: {str(e)}")
            except Exception as e:
                # Ghi log và ném lại ngoại lệ với thông báo rõ ràng hơn
                logger.error(f"Unexpected error creating appointment: {str(e)}")
                raise serializers.ValidationError(f"Lỗi không mong muốn khi tạo lịch hẹn: {str(e)}")

    def _create_appointment_reminders(self, appointment, time_slot):
        """Tạo các nhắc nhở cho lịch hẹn dựa trên cấu hình trong settings"""
        from django.utils import timezone
        from django.conf import settings
        import datetime

        # Thời gian lịch hẹn
        appointment_time = datetime.datetime.combine(
            time_slot.date,
            time_slot.start_time,
            tzinfo=timezone.get_current_timezone()
        )

        # Lấy thông tin bác sĩ (trong thực tế sẽ gọi API đến user-service)
        doctor_name = f"Bác sĩ ID: {time_slot.doctor_id}"
        location_info = time_slot.location or ""
        department_info = time_slot.department or ""
        room_info = time_slot.room or ""
        location_text = ""

        if location_info:
            location_text = f"tại {location_info}"
            if department_info:
                location_text += f", khoa {department_info}"
            if room_info:
                location_text += f", phòng {room_info}"

        # Lấy cấu hình nhắc nhở từ settings
        reminder_configs = getattr(settings, 'APPOINTMENT_REMINDERS', [
            {'hours': 24, 'type': 'EMAIL', 'message_template': 'Nhắc nhở: Bạn có lịch hẹn khám bệnh với {doctor_name} vào ngày {date} lúc {time} {location}.'},
            {'hours': 3, 'type': 'EMAIL', 'message_template': 'Nhắc nhở: Lịch hẹn của bạn với {doctor_name} sẽ diễn ra trong vòng 3 giờ nữa {location}.'},
            {'hours': 1, 'type': 'SMS', 'message_template': 'Nhắc nhở gấp: Bạn có lịch hẹn khám bệnh với {doctor_name} trong vòng 1 giờ nữa {location}. Vui lòng đến sớm 15 phút để chuẩn bị.'},
        ])

        # Tạo các nhắc nhở theo cấu hình
        reminders = []
        for config in reminder_configs:
            hours = config.get('hours', 24)
            reminder_type = config.get('type', 'EMAIL')
            message_template = config.get('message_template', '')

            # Tính thởi gian nhắc nhở
            reminder_time = appointment_time - datetime.timedelta(hours=hours)

            # Định dạng tin nhắn với tham số động
            message = message_template.format(
                doctor_name=doctor_name,
                date=time_slot.date.strftime('%d/%m/%Y'),
                time=time_slot.start_time.strftime('%H:%M'),
                location=location_text
            )

            # Tạo nhắc nhở
            reminder = AppointmentReminder.objects.create(
                appointment=appointment,
                reminder_type=reminder_type,
                scheduled_time=reminder_time,
                message=message
            )

            reminders.append(reminder)

        return reminders

    def _create_recurring_appointments(self, parent_appointment):
        """
        Tạo các lịch hẹn định kỳ dựa trên mẫu lặp lại

        Parameters:
        parent_appointment - Appointment: Lịch hẹn gốc để tạo các lịch hẹn định kỳ
        """
        from django.utils import timezone
        import datetime
        import logging

        logger = logging.getLogger(__name__)

        # Nếu lịch hẹn không phải là định kỳ, không làm gì
        if not parent_appointment.is_recurring:
            return []

        # Lấy thông tin cần thiết
        time_slot = parent_appointment.time_slot
        pattern = parent_appointment.recurrence_pattern
        end_date = parent_appointment.recurrence_end_date or (timezone.now().date() + datetime.timedelta(days=90))

        # Kiểm tra pattern hợp lệ
        valid_patterns = ['WEEKLY', 'BIWEEKLY', 'MONTHLY']
        if pattern not in valid_patterns:
            logger.warning(f"Invalid recurrence pattern: {pattern} for appointment {parent_appointment.id}")
            return []

        # Lấy thông tin bác sĩ và ngày bắt đầu
        doctor_id = time_slot.doctor_id
        start_date = time_slot.date
        start_time = time_slot.start_time
        end_time = time_slot.end_time

        # Tạo danh sách các ngày lặp lại
        recurring_dates = []
        current_date = start_date

        # Tính toán các ngày lặp lại dựa trên pattern
        while current_date <= end_date:
            # Bỏ qua ngày đầu tiên vì đã có lịch hẹn gốc
            if current_date > start_date:
                recurring_dates.append(current_date)

            # Tính ngày tiếp theo dựa trên pattern
            if pattern == 'WEEKLY':
                current_date += datetime.timedelta(days=7)
            elif pattern == 'BIWEEKLY':
                current_date += datetime.timedelta(days=14)
            elif pattern == 'MONTHLY':
                # Tính ngày của tháng tiếp theo
                month = current_date.month + 1
                year = current_date.year
                if month > 12:
                    month = 1
                    year += 1

                # Giữ ngày trong tháng, nhưng đảm bảo hợp lệ
                day = min(current_date.day, [31, 29 if year % 4 == 0 and (year % 100 != 0 or year % 400 == 0) else 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31][month - 1])
                current_date = datetime.date(year, month, day)

        # Tạo các lịch hẹn định kỳ
        recurring_appointments = []

        for recurring_date in recurring_dates:
            try:
                # Tìm khung giờ trống của bác sĩ vào ngày đó
                from .models import TimeSlot
                available_slots = TimeSlot.objects.filter(
                    doctor_id=doctor_id,
                    date=recurring_date,
                    status='AVAILABLE',
                    is_active=True
                ).order_by('start_time')

                # Nếu có khung giờ trống, sử dụng khung giờ đầu tiên
                if available_slots.exists():
                    recurring_time_slot = available_slots.first()
                else:
                    # Nếu không có khung giờ trống, tạo khung giờ mới
                    from .models import TimeSlot
                    recurring_time_slot = TimeSlot.objects.create(
                        doctor_id=doctor_id,
                        date=recurring_date,
                        start_time=start_time,
                        end_time=end_time,
                        status='AVAILABLE',
                        is_active=True,
                        source_type='MANUAL',
                        max_patients=time_slot.max_patients,
                        current_patients=0,
                        department=time_slot.department,
                        location=time_slot.location,
                        room=time_slot.room
                    )

                # Tạo lịch hẹn mới
                recurring_appointment = parent_appointment.__class__.objects.create(
                    patient_id=parent_appointment.patient_id,
                    time_slot=recurring_time_slot,
                    status='PENDING',
                    appointment_type=parent_appointment.appointment_type,
                    priority=parent_appointment.priority,
                    reason_text=parent_appointment.reason_text,
                    reason_category=parent_appointment.reason_category,
                    is_recurring=False,  # Đây là lịch hẹn con, không phải là định kỳ
                    recurrence_pattern=None,
                    recurrence_end_date=None,
                    is_follow_up=True,  # Đây là lịch hẹn tái khám
                    follow_up_to=parent_appointment.id,
                    medical_record_id=parent_appointment.medical_record_id,
                    insurance_id=parent_appointment.insurance_id,
                    notes=f"Lịch hẹn tái khám tự động tạo từ lịch hẹn #{parent_appointment.id}"
                )

                # Tạo các nhắc nhở cho lịch hẹn tái khám
                self._create_appointment_reminders(recurring_appointment, recurring_time_slot)

                recurring_appointments.append(recurring_appointment)
            except Exception as e:
                logger.error(f"Error creating recurring appointment for date {recurring_date}: {str(e)}")
                # Tiếp tục với ngày tiếp theo

        return recurring_appointments

    def _create_appointment_billing(self, appointment):
        """Tạo hóa đơn cho lịch hẹn"""
        # Tạm thời bỏ qua, sẽ được triển khai khi tích hợp với billing-service
        pass
