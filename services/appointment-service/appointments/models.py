from django.db import models
from django.utils import timezone


class DoctorAvailability(models.Model):
    """Lịch làm việc của bác sĩ"""
    WEEKDAY_CHOICES = [
        (0, 'Monday'),
        (1, 'Tuesday'),
        (2, 'Wednesday'),
        (3, 'Thursday'),
        (4, 'Friday'),
        (5, 'Saturday'),
        (6, 'Sunday'),
    ]

    SCHEDULE_TYPE_CHOICES = [
        ('REGULAR', 'Lịch thường xuyên'),
        ('TEMPORARY', 'Lịch tạm thời'),
        ('DAY_OFF', 'Nghỉ phép')
    ]

    RECURRING_PATTERN_CHOICES = [
        ('WEEKLY', 'Hàng tuần'),
        ('BIWEEKLY', 'Cách tuần'),
        ('MONTHLY', 'Hàng tháng'),
        ('CUSTOM', 'Tùy chỉnh')
    ]

    doctor_id = models.IntegerField(help_text="ID của bác sĩ trong user-service")
    weekday = models.IntegerField(choices=WEEKDAY_CHOICES, help_text="Ngày trong tuần (0: Thứ 2, 6: Chủ nhật)")
    start_time = models.TimeField(help_text="Giờ bắt đầu làm việc")
    end_time = models.TimeField(help_text="Giờ kết thúc làm việc")
    is_available = models.BooleanField(default=True, help_text="Trạng thái hoạt động của lịch làm việc")
    is_active = models.BooleanField(default=True, help_text="Lịch làm việc có đang hoạt động hay không")

    # Thông tin địa điểm
    location = models.CharField(max_length=255, help_text="Địa điểm làm việc", blank=True, null=True)
    department = models.CharField(max_length=100, help_text="Khoa/Phòng", blank=True, null=True)
    room = models.CharField(max_length=50, help_text="Phòng khám", blank=True, null=True)

    # Thông tin bổ sung
    schedule_type = models.CharField(max_length=20, choices=SCHEDULE_TYPE_CHOICES, default='REGULAR', help_text="Loại lịch làm việc")
    recurring_pattern = models.CharField(max_length=20, choices=RECURRING_PATTERN_CHOICES, default='WEEKLY', help_text="Mẫu lặp lại cho lịch làm việc")
    effective_date = models.DateField(null=True, blank=True, help_text="Ngày áp dụng (cho lịch tạm thời hoặc nghỉ phép)")
    start_date = models.DateField(null=True, blank=True, help_text="Ngày bắt đầu áp dụng lịch làm việc")
    end_date = models.DateField(null=True, blank=True, help_text="Ngày kết thúc áp dụng lịch làm việc")
    slot_duration = models.IntegerField(default=30, help_text="Thời lượng mỗi khung giờ (phút)")
    max_patients_per_slot = models.IntegerField(default=1, help_text="Số lượng bệnh nhân tối đa cho mỗi khung giờ")
    notes = models.TextField(blank=True, null=True, help_text="Ghi chú")

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        if self.schedule_type == 'DAY_OFF' and self.effective_date:
            return f"Dr. {self.doctor_id} - Nghỉ phép ngày {self.effective_date}"
        status = "Active" if self.is_available else "Inactive"
        return f"Dr. {self.doctor_id} - {self.get_weekday_display()} ({self.start_time} - {self.end_time}) - {status}"

    class Meta:
        verbose_name = "Doctor Availability"
        verbose_name_plural = "Doctor Availabilities"
        unique_together = ['doctor_id', 'weekday', 'start_time', 'end_time', 'schedule_type', 'effective_date']


class TimeSlot(models.Model):
    """Khung giờ khám bệnh"""
    STATUS_CHOICES = [
        ('AVAILABLE', 'Còn trống'),
        ('BOOKED', 'Đã đặt'),
        ('CANCELLED', 'Đã hủy'),
        ('BLOCKED', 'Bị khóa')
    ]

    SOURCE_TYPE_CHOICES = [
        ('REGULAR', 'Từ lịch thường xuyên'),
        ('TEMPORARY', 'Từ lịch tạm thời'),
        ('MANUAL', 'Tạo thủ công')
    ]

    doctor_id = models.IntegerField(help_text="ID của bác sĩ trong user-service")
    date = models.DateField(help_text="Ngày khám")
    start_time = models.TimeField(help_text="Giờ bắt đầu")
    end_time = models.TimeField(help_text="Giờ kết thúc")
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='AVAILABLE', help_text="Trạng thái khung giờ")
    is_active = models.BooleanField(default=True, help_text="Khung giờ có đang hoạt động hay không")
    source_type = models.CharField(max_length=20, choices=SOURCE_TYPE_CHOICES, default='REGULAR', help_text="Nguồn gốc của khung giờ")
    availability = models.ForeignKey(DoctorAvailability, on_delete=models.CASCADE, related_name='time_slots', null=True, blank=True)

    # Thông tin địa điểm
    location = models.CharField(max_length=255, help_text="Địa điểm khám", blank=True, null=True)
    department = models.CharField(max_length=100, help_text="Khoa/Phòng", blank=True, null=True)
    room = models.CharField(max_length=50, help_text="Phòng khám", blank=True, null=True)

    # Các thuộc tính bổ sung
    duration = models.IntegerField(default=30, help_text="Thời lượng khám (phút)")
    max_patients = models.IntegerField(default=1, help_text="Số lượng bệnh nhân tối đa")
    current_patients = models.IntegerField(default=0, help_text="Số lượng bệnh nhân hiện tại")

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"Dr. {self.doctor_id} - {self.date} ({self.start_time} - {self.end_time}) - {self.get_status_display()}"

    class Meta:
        verbose_name = "Time Slot"
        verbose_name_plural = "Time Slots"
        unique_together = ['doctor_id', 'date', 'start_time', 'end_time']
        ordering = ['date', 'start_time']

    def has_capacity(self):
        """Kiểm tra xem khung giờ còn chỗ cho bệnh nhân hay không"""
        return self.current_patients < self.max_patients and self.status == 'AVAILABLE' and self.is_active

    def update_status(self):
        """Cập nhật trạng thái dựa trên số lượng bệnh nhân hiện tại"""
        # Đảm bảo current_patients không âm
        if self.current_patients < 0:
            self.current_patients = 0

        # Cập nhật trạng thái
        if self.current_patients >= self.max_patients:
            self.status = 'BOOKED'
        else:
            self.status = 'AVAILABLE'

        self.save(update_fields=['current_patients', 'status'])

    def add_patient(self):
        """Thêm một bệnh nhân vào khung giờ và cập nhật trạng thái"""
        from .exceptions import TimeSlotUnavailableException, TimeSlotCapacityExceededException
        from django.db import transaction
        import logging

        logger = logging.getLogger(__name__)

        # Sử dụng transaction và select_for_update để tránh race condition
        with transaction.atomic():
            # Khóa row này cho đến khi transaction hoàn thành
            time_slot = TimeSlot.objects.select_for_update().get(pk=self.id)

            # Kiểm tra lại sau khi đã khóa row
            if time_slot.current_patients >= time_slot.max_patients:
                time_slot.status = 'BOOKED'
                time_slot.save(update_fields=['status'])
                raise TimeSlotCapacityExceededException(f"Khung giờ {self.id} đã đạt số lượng bệnh nhân tối đa ({self.max_patients})")

            if time_slot.status != 'AVAILABLE' or not time_slot.is_active:
                logger.warning(f"Trying to add patient to unavailable time slot {self.id} with status {time_slot.status}")
                raise TimeSlotUnavailableException(f"Khung giờ {self.id} không khả dụng")

            # Cập nhật số lượng bệnh nhân
            time_slot.current_patients += 1

            # Cập nhật trạng thái
            if time_slot.current_patients >= time_slot.max_patients:
                time_slot.status = 'BOOKED'

            time_slot.save(update_fields=['current_patients', 'status'])

            # Cập nhật object hiện tại để phản ánh thay đổi
            self.current_patients = time_slot.current_patients
            self.status = time_slot.status

        return True

    def remove_patient(self):
        """Xóa một bệnh nhân khỏi khung giờ và cập nhật trạng thái"""
        from django.db import transaction
        import logging

        logger = logging.getLogger(__name__)

        # Sử dụng transaction và select_for_update để tránh race condition
        with transaction.atomic():
            time_slot = TimeSlot.objects.select_for_update().get(pk=self.id)

            if time_slot.current_patients <= 0:
                # Thay vì ném ngoại lệ, chỉ ghi log và đảm bảo khung giờ được đánh dấu là khả dụng
                logger.warning(f"Trying to remove patient from time slot {self.id} with current_patients={time_slot.current_patients}")
                time_slot.current_patients = 0
                time_slot.status = 'AVAILABLE'
                time_slot.save(update_fields=['current_patients', 'status'])

                # Cập nhật object hiện tại để phản ánh thay đổi
                self.current_patients = time_slot.current_patients
                self.status = time_slot.status

                return True

            # Giảm số lượng bệnh nhân
            time_slot.current_patients -= 1

            # Cập nhật trạng thái dựa trên số lượng bệnh nhân mới
            if time_slot.current_patients < time_slot.max_patients:
                time_slot.status = 'AVAILABLE'

            time_slot.save(update_fields=['current_patients', 'status'])

            # Cập nhật object hiện tại để phản ánh thay đổi
            self.current_patients = time_slot.current_patients
            self.status = time_slot.status

        return True

    def save(self, *args, **kwargs):
        """Ghi đè phương thức save để đảm bảo tính nhất quán giữa trạng thái và current_patients"""
        # Đảm bảo current_patients không âm
        if self.current_patients < 0:
            self.current_patients = 0

        # Đảm bảo trạng thái phản ánh đúng số lượng bệnh nhân
        if self.current_patients >= self.max_patients:
            self.status = 'BOOKED'
        elif self.status != 'BLOCKED' and self.status != 'CANCELLED':
            self.status = 'AVAILABLE'

        super().save(*args, **kwargs)


class AppointmentReason(models.Model):
    """Phân loại lý do khám"""
    name = models.CharField(max_length=100, help_text="Tên lý do khám")
    description = models.TextField(blank=True, null=True, help_text="Mô tả chi tiết")
    department = models.CharField(max_length=100, blank=True, null=True, help_text="Khoa/Phòng liên quan")
    priority = models.IntegerField(default=0, help_text="Mức độ ưu tiên (cao hơn = ưu tiên hơn)")
    estimated_duration = models.IntegerField(default=30, help_text="Thời gian ước tính (phút)")
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.name

    class Meta:
        verbose_name = "Appointment Reason"
        verbose_name_plural = "Appointment Reasons"
        ordering = ['-priority', 'name']


class Appointment(models.Model):
    """Lịch hẹn khám bệnh"""
    STATUS_CHOICES = [
        ('PENDING', 'Chờ xác nhận'),
        ('CONFIRMED', 'Đã xác nhận'),
        ('CHECKED_IN', 'Đã check-in'),
        ('IN_PROGRESS', 'Đang khám'),
        ('COMPLETED', 'Đã hoàn thành'),
        ('CANCELLED', 'Đã hủy'),
        ('NO_SHOW', 'Không đến'),
        ('RESCHEDULED', 'Đã đổi lịch'),
    ]

    APPOINTMENT_TYPE_CHOICES = [
        ('REGULAR', 'Khám thông thường'),
        ('FOLLOW_UP', 'Tái khám'),
        ('EMERGENCY', 'Cấp cứu'),
        ('CONSULTATION', 'Tư vấn'),
    ]

    PRIORITY_CHOICES = [
        (0, 'Thông thường'),
        (1, 'Ưu tiên'),
        (2, 'Khẩn cấp'),
    ]

    # Định nghĩa các chuyển đổi trạng thái hợp lệ
    VALID_STATUS_TRANSITIONS = {
        'PENDING': ['CONFIRMED', 'CANCELLED', 'RESCHEDULED'],
        'CONFIRMED': ['CHECKED_IN', 'CANCELLED', 'NO_SHOW', 'RESCHEDULED'],
        'CHECKED_IN': ['IN_PROGRESS', 'CANCELLED', 'NO_SHOW'],
        'IN_PROGRESS': ['COMPLETED', 'CANCELLED'],
        'COMPLETED': [],  # Trạng thái cuối, không thể chuyển tiếp
        'CANCELLED': [],  # Trạng thái cuối, không thể chuyển tiếp
        'NO_SHOW': ['RESCHEDULED'],  # Có thể đặt lại lịch sau khi không đến
        'RESCHEDULED': ['PENDING'],  # Sau khi đổi lịch, quay lại trạng thái chờ xác nhận
    }

    patient_id = models.IntegerField(help_text="ID của bệnh nhân trong user-service")
    time_slot = models.ForeignKey(TimeSlot, on_delete=models.CASCADE, related_name='appointments')
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='PENDING')
    appointment_type = models.CharField(max_length=20, choices=APPOINTMENT_TYPE_CHOICES, default='REGULAR')
    priority = models.IntegerField(choices=PRIORITY_CHOICES, default=0)

    # Phân loại lý do khám
    reason_text = models.TextField(help_text="Lý do khám chi tiết", blank=True, null=True)
    reason_category = models.ForeignKey(AppointmentReason, on_delete=models.SET_NULL, null=True, blank=True, related_name='appointments')

    # Hỗ trợ lịch hẹn định kỳ hoặc tái khám (nếu cần)
    is_recurring = models.BooleanField(default=False)
    recurrence_pattern = models.CharField(max_length=50, blank=True, null=True, help_text="Mẫu lặp lại (ví dụ: weekly, monthly)")
    recurrence_end_date = models.DateField(null=True, blank=True)
    parent_appointment = models.ForeignKey('self', null=True, blank=True, on_delete=models.SET_NULL, related_name='recurring_appointments')
    is_follow_up = models.BooleanField(default=False)
    follow_up_to = models.ForeignKey('self', null=True, blank=True, on_delete=models.SET_NULL, related_name='follow_ups')

    notes = models.TextField(blank=True, null=True)
    medical_record_id = models.IntegerField(null=True, blank=True, help_text="ID hồ sơ y tế liên quan")
    insurance_id = models.CharField(max_length=100, blank=True, null=True, help_text="Mã bảo hiểm")
    created_by = models.IntegerField(help_text="ID người tạo lịch hẹn", null=True, blank=True)

    # Các trường liên kết với service khác
    prescription_id = models.IntegerField(null=True, blank=True, help_text="ID đơn thuốc liên quan")
    lab_request_id = models.IntegerField(null=True, blank=True, help_text="ID yêu cầu xét nghiệm liên quan")
    billing_id = models.IntegerField(null=True, blank=True, help_text="ID hóa đơn liên quan")

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    @property
    def doctor_id(self):
        return self.time_slot.doctor_id

    @property
    def appointment_date(self):
        return self.time_slot.date

    @property
    def start_time(self):
        return self.time_slot.start_time

    @property
    def end_time(self):
        return self.time_slot.end_time

    @property
    def location(self):
        return self.time_slot.location

    def _validate_transition(self, new_status):
        """
        Kiểm tra tính hợp lệ của việc chuyển trạng thái
        """
        from .exceptions import InvalidStatusTransitionException

        current_status = self.status
        allowed_transitions = self.VALID_STATUS_TRANSITIONS.get(current_status, [])

        if new_status not in allowed_transitions:
            raise InvalidStatusTransitionException(
                f"Không thể chuyển từ trạng thái '{self.get_status_display()}' sang '{dict(self.STATUS_CHOICES).get(new_status)}'."
            )
        return True

    def _handle_status_actions(self, new_status):
        """
        Xử lý các hành động liên quan đến trạng thái mới
        """
        from .exceptions import AppointmentServiceException
        import logging

        logger = logging.getLogger(__name__)

        try:
            if new_status == 'CANCELLED':
                # Khi hủy lịch hẹn, trả lại khung giờ
                self.time_slot.remove_patient()

                # Nếu có tích hợp với billing-service, cập nhật hóa đơn
                if self.billing_id:
                    from .integrations import update_billing_status
                    update_billing_status(self.billing_id, 'CANCELLED')

            elif new_status == 'COMPLETED':
                # Khi hoàn thành, kiểm tra và cập nhật lịch tái khám nếu cần
                if self.is_recurring:
                    # Logic xử lý lịch tái khám sẽ được thêm vào đây
                    pass

                # Nếu có tích hợp với billing-service, cập nhật hóa đơn
                if self.billing_id:
                    from .integrations import update_billing_status
                    update_billing_status(self.billing_id, 'COMPLETED')

            elif new_status == 'RESCHEDULED':
                # Đổi lịch sẽ được xử lý riêng trong view
                pass
        except AppointmentServiceException as e:
            # Ghi log lỗi nhưng vẫn tiếp tục
            logger.warning(f"Error during status transition actions for appointment {self.id}: {str(e)}")

    def _log_transition(self, old_status, new_status, user_id):
        """
        Ghi log việc chuyển trạng thái
        """
        from django.utils import timezone
        import logging

        logger = logging.getLogger(__name__)

        logger.info(
            f"Appointment {self.id} changed status from {old_status} to {new_status} "
            f"by user {user_id} at {timezone.now()}"
        )

    def transition_to(self, new_status, user_id=None, notes=None):
        """
        Chuyển trạng thái của lịch hẹn và thực hiện các hành động liên quan
        """
        from django.utils import timezone
        from django.db import transaction

        # Kiểm tra tính hợp lệ của việc chuyển trạng thái
        self._validate_transition(new_status)

        # Sử dụng transaction để đảm bảo tính nhất quán
        with transaction.atomic():
            old_status = self.status
            self.status = new_status

            # Thêm ghi chú nếu có
            if notes:
                self.notes = (self.notes or "") + f"\n[{timezone.now().strftime('%Y-%m-%d %H:%M')}] {notes}"

            # Xử lý các hành động đặc biệt khi chuyển trạng thái
            self._handle_status_actions(new_status)

            self.save()

            # Ghi log chuyển trạng thái
            self._log_transition(old_status, new_status, user_id)

        return True

    def __str__(self):
        return f"Appointment: Patient {self.patient_id} với Dr. {self.doctor_id} vào {self.appointment_date} ({self.start_time} - {self.end_time})"

    class Meta:
        verbose_name = "Appointment"
        verbose_name_plural = "Appointments"
        ordering = ['time_slot__date', 'time_slot__start_time']


class AppointmentReminder(models.Model):
    """Nhắc nhở lịch hẹn khám bệnh"""
    REMINDER_TYPE_CHOICES = [
        ('EMAIL', 'Email'),
        ('SMS', 'SMS'),
        ('PUSH', 'Push Notification'),
    ]

    STATUS_CHOICES = [
        ('PENDING', 'Chờ gửi'),
        ('SENT', 'Đã gửi'),
        ('FAILED', 'Gửi thất bại'),
    ]

    appointment = models.ForeignKey(Appointment, on_delete=models.CASCADE, related_name='reminders')
    reminder_type = models.CharField(max_length=10, choices=REMINDER_TYPE_CHOICES)
    scheduled_time = models.DateTimeField(help_text="Thời gian dự kiến gửi nhắc nhở")
    status = models.CharField(max_length=10, choices=STATUS_CHOICES, default='PENDING')
    sent_at = models.DateTimeField(null=True, blank=True)
    message = models.TextField(help_text="Nội dung tin nhắn nhắc nhở")
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.get_reminder_type_display()} reminder cho appointment {self.appointment.id} - {self.get_status_display()}"

    class Meta:
        verbose_name = "Appointment Reminder"
        verbose_name_plural = "Appointment Reminders"
        ordering = ['scheduled_time']


class PatientVisit(models.Model):
    """Thông tin chi tiết về lần khám bệnh"""
    VISIT_STATUS_CHOICES = [
        ('WAITING', 'Đang chờ'),
        ('WITH_NURSE', 'Đang với y tá'),
        ('WITH_DOCTOR', 'Đang khám với bác sĩ'),
        ('COMPLETED', 'Đã hoàn thành'),
        ('CANCELLED', 'Đã hủy')
    ]

    appointment = models.OneToOneField(Appointment, on_delete=models.CASCADE, related_name='visit')
    status = models.CharField(max_length=20, choices=VISIT_STATUS_CHOICES, default='WAITING')

    # Thông tin check-in
    checked_in_at = models.DateTimeField(null=True, blank=True)
    checked_in_by = models.IntegerField(help_text="ID người check-in (nhân viên)", null=True, blank=True)

    # Thông tin khám bệnh
    nurse_id = models.IntegerField(null=True, blank=True, help_text="ID y tá phụ trách")
    vitals_recorded = models.BooleanField(default=False, help_text="Dấu hiệu sinh tồn đã được ghi nhận")
    vitals_recorded_at = models.DateTimeField(null=True, blank=True)

    # Thời gian thực tế
    doctor_start_time = models.DateTimeField(null=True, blank=True, help_text="Thời gian bắt đầu khám với bác sĩ")
    doctor_end_time = models.DateTimeField(null=True, blank=True, help_text="Thời gian kết thúc khám với bác sĩ")
    waiting_time = models.IntegerField(null=True, blank=True, help_text="Thời gian chờ (phút)")

    # Thông tin bổ sung
    notes = models.TextField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"Visit for appointment {self.appointment.id} - {self.get_status_display()}"

    class Meta:
        verbose_name = "Patient Visit"
        verbose_name_plural = "Patient Visits"