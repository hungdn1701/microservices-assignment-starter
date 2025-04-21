from django.db.models.signals import post_save
from django.dispatch import receiver
from django.utils import timezone
from datetime import datetime, timedelta

from .models import DoctorAvailability, TimeSlot, Appointment, AppointmentReminder

# Import module redis_notifications từ common-auth
try:
    from common_auth.redis_notifications import send_notification
except ImportError:
    # Fallback nếu không import được
    def send_notification(service, event_type, data, recipients=None):
        print(f"Would send notification: {service}.{event_type} - {data}")
        return True


@receiver(post_save, sender=Appointment)
def create_appointment_reminder(sender, instance, created, **kwargs):
    """
    Tự động tạo nhắc nhở cho lịch hẹn.
    """
    if created or instance.status == 'CONFIRMED':
        # Tạo nhắc nhở 24 giờ trước lịch hẹn
        reminder_time = datetime.combine(
            instance.time_slot.date,
            instance.time_slot.start_time,
            tzinfo=timezone.get_current_timezone()
        ) - timedelta(hours=24)

        # Kiểm tra xem đã có nhắc nhở chưa
        existing = AppointmentReminder.objects.filter(
            appointment=instance,
            reminder_type='EMAIL'
        ).first()

        if not existing:
            AppointmentReminder.objects.create(
                appointment=instance,
                reminder_type='EMAIL',
                scheduled_time=reminder_time,
                message=f"Nhắc nhở: Bạn có lịch hẹn khám bệnh vào lúc {instance.time_slot.start_time} ngày {instance.time_slot.date}."
            )


@receiver(post_save, sender=Appointment)
def send_appointment_notification(sender, instance, created, **kwargs):
    """
    Gửi thông báo khi lịch hẹn được tạo hoặc cập nhật.
    """
    try:
        # Xác định loại sự kiện dựa trên trạng thái
        if created:
            # Lịch hẹn mới được tạo
            event_type = 'CREATED'
            message = f"Lịch hẹn mới đã được tạo vào ngày {instance.time_slot.date} lúc {instance.time_slot.start_time}."
        else:
            # Kiểm tra thay đổi trạng thái
            if hasattr(instance, '_original_status'):
                old_status = instance._original_status
                new_status = instance.status

                # Chỉ gửi thông báo khi trạng thái thay đổi
                if old_status != new_status:
                    if new_status == 'CANCELLED':
                        event_type = 'CANCELLED'
                        message = f"Lịch hẹn vào ngày {instance.time_slot.date} lúc {instance.time_slot.start_time} đã bị hủy."
                    elif new_status == 'COMPLETED':
                        event_type = 'COMPLETED'
                        message = f"Lịch hẹn vào ngày {instance.time_slot.date} lúc {instance.time_slot.start_time} đã hoàn thành."
                    elif new_status == 'CONFIRMED':
                        event_type = 'CONFIRMED'
                        message = f"Lịch hẹn vào ngày {instance.time_slot.date} lúc {instance.time_slot.start_time} đã được xác nhận."
                    elif new_status == 'RESCHEDULED':
                        event_type = 'RESCHEDULED'
                        message = f"Lịch hẹn vào ngày {instance.time_slot.date} lúc {instance.time_slot.start_time} đã được đổi lịch."
                    else:
                        event_type = 'UPDATED'
                        message = f"Lịch hẹn vào ngày {instance.time_slot.date} lúc {instance.time_slot.start_time} đã được cập nhật."
                else:
                    # Không có thay đổi trạng thái, không cần gửi thông báo
                    return
            else:
                # Không theo dõi trạng thái, mặc định là UPDATED
                event_type = 'UPDATED'
                message = f"Lịch hẹn vào ngày {instance.time_slot.date} lúc {instance.time_slot.start_time} đã được cập nhật."

        # Chuẩn bị dữ liệu thông báo
        data = {
            'appointment_id': instance.id,
            'patient_id': instance.patient_id,
            'doctor_id': instance.time_slot.doctor_id,
            'appointment_date': instance.time_slot.date.strftime('%Y-%m-%d'),
            'appointment_time': instance.time_slot.start_time.strftime('%H:%M'),
            'status': instance.status,
            'message': message,
            'subject': f"Thông báo lịch hẹn: {event_type}",
            'reference_id': str(instance.id),
            'reference_type': 'APPOINTMENT'
        }

        # Chuẩn bị danh sách người nhận
        recipients = [
            # Bệnh nhân nhận thông báo qua tất cả các kênh
            {
                'recipient_id': instance.patient_id,
                'recipient_type': 'PATIENT',
                'channels': ['IN_APP', 'EMAIL', 'SMS']  # Bệnh nhân nhận thông báo qua nhiều kênh
            },
            # Bác sĩ chỉ nhận thông báo in-app
            {
                'recipient_id': instance.time_slot.doctor_id,
                'recipient_type': 'DOCTOR',
                'channels': ['IN_APP']  # Bác sĩ chỉ nhận thông báo in-app
            }
        ]

        # Gửi thông báo qua Redis stream
        send_notification('APPOINTMENT', event_type, data, recipients)

    except Exception as e:
        import logging
        logger = logging.getLogger(__name__)
        logger.error(f"Error sending appointment notification: {str(e)}")


@receiver(post_save, sender=AppointmentReminder)
def send_reminder_notification(sender, instance, created, **kwargs):
    """
    Gửi thông báo khi reminder được tạo hoặc kích hoạt.
    """
    try:
        # Chỉ gửi thông báo nếu reminder mới được tạo hoặc đang chờ xử lý
        if created or instance.status == 'PENDING':
            appointment = instance.appointment

            # Chuẩn bị dữ liệu thông báo
            data = {
                'appointment_id': appointment.id,
                'patient_id': appointment.patient_id,
                'doctor_id': appointment.time_slot.doctor_id,
                'appointment_date': appointment.time_slot.date.strftime('%Y-%m-%d'),
                'appointment_time': appointment.time_slot.start_time.strftime('%H:%M'),
                'message': instance.message,
                'subject': "Nhắc nhở lịch hẹn",
                'reference_id': str(appointment.id),
                'reference_type': 'APPOINTMENT',
                'reminder_id': instance.id,
                'reminder_type': instance.reminder_type
            }

            # Chuẩn bị danh sách người nhận - chỉ gửi cho bệnh nhân
            recipients = [
                {
                    'recipient_id': appointment.patient_id,
                    'recipient_type': 'PATIENT',
                    'channels': ['IN_APP', 'SMS']  # SMS thích hợp cho nhắc nhở
                }
            ]

            # Gửi thông báo qua Redis stream
            send_notification('APPOINTMENT', 'REMINDER', data, recipients)

    except Exception as e:
        import logging
        logger = logging.getLogger(__name__)
        logger.error(f"Error sending reminder notification: {str(e)}")


# Lưu trạng thái ban đầu để theo dõi thay đổi
@receiver(post_save, sender=Appointment)
def save_original_status(sender, instance, **kwargs):
    """
    Lưu trạng thái ban đầu của lịch hẹn để so sánh sau khi cập nhật.
    """
    if hasattr(instance, 'status'):
        instance._original_status = instance.status
