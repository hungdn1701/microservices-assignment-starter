"""
Event handlers for processing events from other services.
"""
import logging
from django.utils import timezone
from .models import Notification, InAppNotification
from .tasks import send_email_notification, send_sms_notification
from .utils import send_realtime_notification

logger = logging.getLogger(__name__)


def process_appointment_event(event_data):
    """
    Process events from the Appointment Service.
    """
    event_type = event_data.get('event_type')
    appointment_id = event_data.get('appointment_id')
    patient_id = event_data.get('patient_id')
    doctor_id = event_data.get('doctor_id')
    appointment_date = event_data.get('appointment_date')
    appointment_type = event_data.get('appointment_type')
    notes = event_data.get('notes', '')
    department_id = event_data.get('department_id')
    specialty_id = event_data.get('specialty_id')

    # Format appointment date for display
    formatted_date = appointment_date if appointment_date else 'Unknown'

    # List to store all notifications
    notifications = []

    # Create notifications based on event type
    if event_type == 'CREATED':
        # Notify patient about new appointment - Email
        patient_email = Notification(
            recipient_id=patient_id,
            recipient_type='PATIENT',
            notification_type='APPOINTMENT',
            channel='EMAIL',
            subject=f'Lịch hẹn mới: {appointment_type}',
            content=f'Lịch hẹn của bạn đã được đặt vào ngày {formatted_date}. ' +
                    f'Loại lịch hẹn: {appointment_type}. ' +
                    (f'Ghi chú: {notes}' if notes else ''),
            reference_id=str(appointment_id),
            reference_type='APPOINTMENT',
            status='PENDING'
        )
        patient_email.save()
        send_email_notification.delay(patient_email.id)
        notifications.append(patient_email.id)

        # Notify patient about new appointment - In-App
        patient_inapp = Notification(
            recipient_id=patient_id,
            recipient_type='PATIENT',
            notification_type='APPOINTMENT',
            channel='IN_APP',
            subject=f'Lịch hẹn mới',
            content=f'Lịch hẹn của bạn đã được đặt vào ngày {formatted_date}.',
            reference_id=str(appointment_id),
            reference_type='APPOINTMENT',
            status='PENDING'
        )
        patient_inapp.save()
        notifications.append(patient_inapp.id)

        # Create in-app notification for patient
        in_app_notification = InAppNotification(
            recipient_id=patient_id,
            recipient_type='PATIENT',
            notification_type='APPOINTMENT',
            title=f'Lịch hẹn mới',
            content=f'Lịch hẹn của bạn đã được đặt vào ngày {formatted_date}.',
            reference_id=str(appointment_id),
            reference_type='APPOINTMENT',
            service='APPOINTMENT',
            event_type='CREATED'
        )
        in_app_notification.save()

        # Send real-time notification
        send_realtime_notification(in_app_notification)

        # Notify doctor about new appointment - Email
        doctor_email = Notification(
            recipient_id=doctor_id,
            recipient_type='DOCTOR',
            notification_type='APPOINTMENT',
            channel='EMAIL',
            subject=f'Lịch hẹn mới: {appointment_type}',
            content=f'Một lịch hẹn mới đã được đặt vào ngày {formatted_date}. ' +
                    f'Loại lịch hẹn: {appointment_type}. ' +
                    (f'Ghi chú: {notes}' if notes else ''),
            reference_id=str(appointment_id),
            reference_type='APPOINTMENT',
            status='PENDING'
        )
        doctor_email.save()
        send_email_notification.delay(doctor_email.id)
        notifications.append(doctor_email.id)

        # Notify doctor about new appointment - In-App
        doctor_inapp = Notification(
            recipient_id=doctor_id,
            recipient_type='DOCTOR',
            notification_type='APPOINTMENT',
            channel='IN_APP',
            subject=f'Lịch hẹn mới',
            content=f'Một lịch hẹn mới đã được đặt vào ngày {formatted_date}.',
            reference_id=str(appointment_id),
            reference_type='APPOINTMENT',
            status='PENDING'
        )
        doctor_inapp.save()
        notifications.append(doctor_inapp.id)

        # Create in-app notification for doctor
        doctor_in_app = InAppNotification(
            recipient_id=doctor_id,
            recipient_type='DOCTOR',
            notification_type='APPOINTMENT',
            title=f'Lịch hẹn mới',
            content=f'Một lịch hẹn mới đã được đặt vào ngày {formatted_date}.',
            reference_id=str(appointment_id),
            reference_type='APPOINTMENT',
            service='APPOINTMENT',
            event_type='CREATED'
        )
        doctor_in_app.save()

        # Send real-time notification
        send_realtime_notification(doctor_in_app)

        # Notify nurses in the department - In-App
        if department_id:
            nurse_inapp = Notification(
                recipient_id=department_id,  # Using department_id as a group identifier
                recipient_type='NURSE',
                notification_type='APPOINTMENT',
                channel='IN_APP',
                subject=f'Lịch hẹn mới trong khoa',
                content=f'Một lịch hẹn mới đã được đặt vào ngày {formatted_date} trong khoa của bạn.',
                reference_id=str(appointment_id),
                reference_type='APPOINTMENT',
                status='PENDING'
            )
            nurse_inapp.save()
            notifications.append(nurse_inapp.id)

            # Create in-app notification for nurses
            nurse_in_app = InAppNotification(
                recipient_id=department_id,  # Using department_id as a group identifier
                recipient_type='NURSE',
                notification_type='APPOINTMENT',
                title=f'Lịch hẹn mới trong khoa',
                content=f'Một lịch hẹn mới đã được đặt vào ngày {formatted_date} trong khoa của bạn.',
                reference_id=str(appointment_id),
                reference_type='APPOINTMENT',
                service='APPOINTMENT',
                event_type='CREATED'
            )
            nurse_in_app.save()

            # Send real-time notification
            send_realtime_notification(nurse_in_app)

        # Notify admin - In-App
        admin_inapp = Notification(
            recipient_id=0,  # Admin group ID
            recipient_type='ADMIN',
            notification_type='APPOINTMENT',
            channel='IN_APP',
            subject=f'Lịch hẹn mới được tạo',
            content=f'Một lịch hẹn mới đã được tạo vào ngày {formatted_date}.',
            reference_id=str(appointment_id),
            reference_type='APPOINTMENT',
            status='PENDING'
        )
        admin_inapp.save()
        notifications.append(admin_inapp.id)

        # Create in-app notification for admin
        admin_in_app = InAppNotification(
            recipient_id=0,  # Admin group ID
            recipient_type='ADMIN',
            notification_type='APPOINTMENT',
            title=f'Lịch hẹn mới được tạo',
            content=f'Một lịch hẹn mới đã được tạo vào ngày {formatted_date}.',
            reference_id=str(appointment_id),
            reference_type='APPOINTMENT',
            service='APPOINTMENT',
            event_type='CREATED'
        )
        admin_in_app.save()

        # Send real-time notification
        send_realtime_notification(admin_in_app)

        return {
            'message': 'Appointment creation notifications sent',
            'notifications': notifications
        }

    elif event_type == 'UPDATED':
        # List to store all notifications
        notifications = []

        # Notify patient about updated appointment - Email
        patient_email = Notification(
            recipient_id=patient_id,
            recipient_type='PATIENT',
            notification_type='APPOINTMENT',
            channel='EMAIL',
            subject=f'Lịch hẹn đã cập nhật: {appointment_type}',
            content=f'Lịch hẹn của bạn đã được cập nhật vào ngày {formatted_date}. ' +
                    f'Loại lịch hẹn: {appointment_type}. ' +
                    (f'Ghi chú: {notes}' if notes else ''),
            reference_id=str(appointment_id),
            reference_type='APPOINTMENT',
            status='PENDING'
        )
        patient_email.save()
        send_email_notification.delay(patient_email.id)
        notifications.append(patient_email.id)

        # Notify patient about updated appointment - In-App
        patient_inapp = Notification(
            recipient_id=patient_id,
            recipient_type='PATIENT',
            notification_type='APPOINTMENT',
            channel='IN_APP',
            subject=f'Lịch hẹn đã cập nhật',
            content=f'Lịch hẹn của bạn đã được cập nhật vào ngày {formatted_date}.',
            reference_id=str(appointment_id),
            reference_type='APPOINTMENT',
            status='PENDING'
        )
        patient_inapp.save()
        notifications.append(patient_inapp.id)

        # Notify doctor about updated appointment - Email
        doctor_email = Notification(
            recipient_id=doctor_id,
            recipient_type='DOCTOR',
            notification_type='APPOINTMENT',
            channel='EMAIL',
            subject=f'Lịch hẹn đã cập nhật: {appointment_type}',
            content=f'Một lịch hẹn đã được cập nhật vào ngày {formatted_date}. ' +
                    f'Loại lịch hẹn: {appointment_type}. ' +
                    (f'Ghi chú: {notes}' if notes else ''),
            reference_id=str(appointment_id),
            reference_type='APPOINTMENT',
            status='PENDING'
        )
        doctor_email.save()
        send_email_notification.delay(doctor_email.id)
        notifications.append(doctor_email.id)

        # Notify doctor about updated appointment - In-App
        doctor_inapp = Notification(
            recipient_id=doctor_id,
            recipient_type='DOCTOR',
            notification_type='APPOINTMENT',
            channel='IN_APP',
            subject=f'Lịch hẹn đã cập nhật',
            content=f'Một lịch hẹn đã được cập nhật vào ngày {formatted_date}.',
            reference_id=str(appointment_id),
            reference_type='APPOINTMENT',
            status='PENDING'
        )
        doctor_inapp.save()
        notifications.append(doctor_inapp.id)

        # Notify nurses in the department - In-App
        if department_id:
            nurse_inapp = Notification(
                recipient_id=department_id,  # Using department_id as a group identifier
                recipient_type='NURSE',
                notification_type='APPOINTMENT',
                channel='IN_APP',
                subject=f'Lịch hẹn đã cập nhật trong khoa',
                content=f'Một lịch hẹn đã được cập nhật vào ngày {formatted_date} trong khoa của bạn.',
                reference_id=str(appointment_id),
                reference_type='APPOINTMENT',
                status='PENDING'
            )
            nurse_inapp.save()
            notifications.append(nurse_inapp.id)

        return {
            'message': 'Appointment update notifications sent',
            'notifications': notifications
        }

    elif event_type == 'CANCELLED':
        # List to store all notifications
        notifications = []

        # Notify patient about cancelled appointment - Email
        patient_email = Notification(
            recipient_id=patient_id,
            recipient_type='PATIENT',
            notification_type='APPOINTMENT',
            channel='EMAIL',
            subject=f'Lịch hẹn đã bị hủy',
            content=f'Lịch hẹn của bạn vào ngày {formatted_date} đã bị hủy. ' +
                    (f'Ghi chú: {notes}' if notes else ''),
            reference_id=str(appointment_id),
            reference_type='APPOINTMENT',
            status='PENDING'
        )
        patient_email.save()
        send_email_notification.delay(patient_email.id)
        notifications.append(patient_email.id)

        # Notify patient about cancelled appointment - In-App
        patient_inapp = Notification(
            recipient_id=patient_id,
            recipient_type='PATIENT',
            notification_type='APPOINTMENT',
            channel='IN_APP',
            subject=f'Lịch hẹn đã bị hủy',
            content=f'Lịch hẹn của bạn vào ngày {formatted_date} đã bị hủy.',
            reference_id=str(appointment_id),
            reference_type='APPOINTMENT',
            status='PENDING'
        )
        patient_inapp.save()
        notifications.append(patient_inapp.id)

        # Notify doctor about cancelled appointment - Email
        doctor_email = Notification(
            recipient_id=doctor_id,
            recipient_type='DOCTOR',
            notification_type='APPOINTMENT',
            channel='EMAIL',
            subject=f'Lịch hẹn đã bị hủy',
            content=f'Một lịch hẹn vào ngày {formatted_date} đã bị hủy. ' +
                    (f'Ghi chú: {notes}' if notes else ''),
            reference_id=str(appointment_id),
            reference_type='APPOINTMENT',
            status='PENDING'
        )
        doctor_email.save()
        send_email_notification.delay(doctor_email.id)
        notifications.append(doctor_email.id)

        # Notify doctor about cancelled appointment - In-App
        doctor_inapp = Notification(
            recipient_id=doctor_id,
            recipient_type='DOCTOR',
            notification_type='APPOINTMENT',
            channel='IN_APP',
            subject=f'Lịch hẹn đã bị hủy',
            content=f'Một lịch hẹn vào ngày {formatted_date} đã bị hủy.',
            reference_id=str(appointment_id),
            reference_type='APPOINTMENT',
            status='PENDING'
        )
        doctor_inapp.save()
        notifications.append(doctor_inapp.id)

        # Notify nurses in the department - In-App
        if department_id:
            nurse_inapp = Notification(
                recipient_id=department_id,  # Using department_id as a group identifier
                recipient_type='NURSE',
                notification_type='APPOINTMENT',
                channel='IN_APP',
                subject=f'Lịch hẹn đã bị hủy trong khoa',
                content=f'Một lịch hẹn vào ngày {formatted_date} trong khoa của bạn đã bị hủy.',
                reference_id=str(appointment_id),
                reference_type='APPOINTMENT',
                status='PENDING'
            )
            nurse_inapp.save()
            notifications.append(nurse_inapp.id)

        # Notify admin - In-App
        admin_inapp = Notification(
            recipient_id=0,  # Admin group ID
            recipient_type='ADMIN',
            notification_type='APPOINTMENT',
            channel='IN_APP',
            subject=f'Lịch hẹn đã bị hủy',
            content=f'Một lịch hẹn vào ngày {formatted_date} đã bị hủy.',
            reference_id=str(appointment_id),
            reference_type='APPOINTMENT',
            status='PENDING'
        )
        admin_inapp.save()
        notifications.append(admin_inapp.id)

        return {
            'message': 'Appointment cancellation notifications sent',
            'notifications': notifications
        }

    elif event_type == 'REMINDER':
        # List to store all notifications
        notifications = []

        # Send reminder to patient - Email
        patient_email = Notification(
            recipient_id=patient_id,
            recipient_type='PATIENT',
            notification_type='APPOINTMENT',
            channel='EMAIL',
            subject='Nhắc nhở lịch hẹn',
            content=f'Nhắc nhở: Bạn có lịch hẹn vào ngày {formatted_date}. ' +
                    f'Loại lịch hẹn: {appointment_type}. ' +
                    (f'Ghi chú: {notes}' if notes else ''),
            reference_id=str(appointment_id),
            reference_type='APPOINTMENT',
            status='PENDING'
        )
        patient_email.save()
        send_email_notification.delay(patient_email.id)
        notifications.append(patient_email.id)

        # Send reminder to patient - In-App
        patient_inapp = Notification(
            recipient_id=patient_id,
            recipient_type='PATIENT',
            notification_type='APPOINTMENT',
            channel='IN_APP',
            subject='Nhắc nhở lịch hẹn',
            content=f'Nhắc nhở: Bạn có lịch hẹn vào ngày {formatted_date}.',
            reference_id=str(appointment_id),
            reference_type='APPOINTMENT',
            status='PENDING'
        )
        patient_inapp.save()
        notifications.append(patient_inapp.id)

        # Send SMS reminder if available
        patient_sms = Notification(
            recipient_id=patient_id,
            recipient_type='PATIENT',
            notification_type='APPOINTMENT',
            channel='SMS',
            subject='',
            content=f'Nhắc nhở: Bạn có lịch hẹn vào ngày {formatted_date}.',
            reference_id=str(appointment_id),
            reference_type='APPOINTMENT',
            status='PENDING'
        )
        patient_sms.save()
        send_sms_notification.delay(patient_sms.id)
        notifications.append(patient_sms.id)

        # Send reminder to doctor - In-App
        doctor_inapp = Notification(
            recipient_id=doctor_id,
            recipient_type='DOCTOR',
            notification_type='APPOINTMENT',
            channel='IN_APP',
            subject='Nhắc nhở lịch hẹn',
            content=f'Nhắc nhở: Bạn có lịch hẹn vào ngày {formatted_date}.',
            reference_id=str(appointment_id),
            reference_type='APPOINTMENT',
            status='PENDING'
        )
        doctor_inapp.save()
        notifications.append(doctor_inapp.id)

        # Notify nurses in the department - In-App
        if department_id:
            nurse_inapp = Notification(
                recipient_id=department_id,  # Using department_id as a group identifier
                recipient_type='NURSE',
                notification_type='APPOINTMENT',
                channel='IN_APP',
                subject='Nhắc nhở lịch hẹn trong khoa',
                content=f'Nhắc nhở: Có lịch hẹn vào ngày {formatted_date} trong khoa của bạn.',
                reference_id=str(appointment_id),
                reference_type='APPOINTMENT',
                status='PENDING'
            )
            nurse_inapp.save()
            notifications.append(nurse_inapp.id)

        return {
            'message': 'Appointment reminder notifications sent',
            'notifications': notifications
        }

    elif event_type == 'COMPLETED':
        # List to store all notifications
        notifications = []

        # Notify patient about completed appointment - Email
        patient_email = Notification(
            recipient_id=patient_id,
            recipient_type='PATIENT',
            notification_type='APPOINTMENT',
            channel='EMAIL',
            subject='Lịch hẹn đã hoàn thành',
            content=f'Lịch hẹn của bạn vào ngày {formatted_date} đã được đánh dấu là hoàn thành. ' +
                    'Cảm ơn bạn đã đến cơ sở y tế của chúng tôi.',
            reference_id=str(appointment_id),
            reference_type='APPOINTMENT',
            status='PENDING'
        )
        patient_email.save()
        send_email_notification.delay(patient_email.id)
        notifications.append(patient_email.id)

        # Notify patient about completed appointment - In-App
        patient_inapp = Notification(
            recipient_id=patient_id,
            recipient_type='PATIENT',
            notification_type='APPOINTMENT',
            channel='IN_APP',
            subject='Lịch hẹn đã hoàn thành',
            content=f'Lịch hẹn của bạn vào ngày {formatted_date} đã được hoàn thành.',
            reference_id=str(appointment_id),
            reference_type='APPOINTMENT',
            status='PENDING'
        )
        patient_inapp.save()
        notifications.append(patient_inapp.id)

        # Notify doctor about completed appointment - In-App
        doctor_inapp = Notification(
            recipient_id=doctor_id,
            recipient_type='DOCTOR',
            notification_type='APPOINTMENT',
            channel='IN_APP',
            subject='Lịch hẹn đã hoàn thành',
            content=f'Lịch hẹn vào ngày {formatted_date} đã được hoàn thành.',
            reference_id=str(appointment_id),
            reference_type='APPOINTMENT',
            status='PENDING'
        )
        doctor_inapp.save()
        notifications.append(doctor_inapp.id)

        # Notify admin - In-App
        admin_inapp = Notification(
            recipient_id=0,  # Admin group ID
            recipient_type='ADMIN',
            notification_type='APPOINTMENT',
            channel='IN_APP',
            subject='Lịch hẹn đã hoàn thành',
            content=f'Một lịch hẹn vào ngày {formatted_date} đã được hoàn thành.',
            reference_id=str(appointment_id),
            reference_type='APPOINTMENT',
            status='PENDING'
        )
        admin_inapp.save()
        notifications.append(admin_inapp.id)

        return {
            'message': 'Appointment completion notification sent',
            'notifications': notifications
        }

    else:
        logger.warning(f"Unknown appointment event type: {event_type}")
        return {
            'message': f'Unknown appointment event type: {event_type}',
            'notifications': []
        }


def process_medical_record_event(event_data):
    """
    Process events from the Medical Record Service.
    """
    event_type = event_data.get('event_type')
    record_id = event_data.get('record_id')
    patient_id = event_data.get('patient_id')
    doctor_id = event_data.get('doctor_id')
    record_type = event_data.get('record_type')
    description = event_data.get('description', '')

    # Create notifications based on event type
    if event_type == 'CREATED':
        # List to store all notifications
        notifications = []

        # Notify patient about new medical record - Email
        patient_email = Notification(
            recipient_id=patient_id,
            recipient_type='PATIENT',
            notification_type='MEDICAL_RECORD',
            channel='EMAIL',
            subject='Hồ sơ y tế mới',
            content=f'Một hồ sơ y tế mới đã được tạo cho bạn. ' +
                    f'Loại hồ sơ: {record_type}. ' +
                    (f'Mô tả: {description}' if description else ''),
            reference_id=str(record_id),
            reference_type='MEDICAL_RECORD',
            status='PENDING'
        )
        patient_email.save()
        send_email_notification.delay(patient_email.id)
        notifications.append(patient_email.id)

        # Notify patient about new medical record - In-App
        patient_inapp = Notification(
            recipient_id=patient_id,
            recipient_type='PATIENT',
            notification_type='MEDICAL_RECORD',
            channel='IN_APP',
            subject='Hồ sơ y tế mới',
            content=f'Một hồ sơ y tế mới đã được tạo cho bạn.',
            reference_id=str(record_id),
            reference_type='MEDICAL_RECORD',
            status='PENDING'
        )
        patient_inapp.save()
        notifications.append(patient_inapp.id)

        # Notify doctor about new medical record - In-App
        doctor_inapp = Notification(
            recipient_id=doctor_id,
            recipient_type='DOCTOR',
            notification_type='MEDICAL_RECORD',
            channel='IN_APP',
            subject='Hồ sơ y tế mới đã được tạo',
            content=f'Bạn đã tạo một hồ sơ y tế mới cho bệnh nhân.',
            reference_id=str(record_id),
            reference_type='MEDICAL_RECORD',
            status='PENDING'
        )
        doctor_inapp.save()
        notifications.append(doctor_inapp.id)

        # Notify nurses - In-App
        nurse_inapp = Notification(
            recipient_id=0,  # Nurse group ID
            recipient_type='NURSE',
            notification_type='MEDICAL_RECORD',
            channel='IN_APP',
            subject='Hồ sơ y tế mới đã được tạo',
            content=f'Một hồ sơ y tế mới đã được tạo.',
            reference_id=str(record_id),
            reference_type='MEDICAL_RECORD',
            status='PENDING'
        )
        nurse_inapp.save()
        notifications.append(nurse_inapp.id)

        return {
            'message': 'Medical record creation notification sent',
            'notifications': notifications
        }

    elif event_type == 'UPDATED':
        # List to store all notifications
        notifications = []

        # Notify patient about updated medical record - Email
        patient_email = Notification(
            recipient_id=patient_id,
            recipient_type='PATIENT',
            notification_type='MEDICAL_RECORD',
            channel='EMAIL',
            subject='Hồ sơ y tế đã cập nhật',
            content=f'Hồ sơ y tế của bạn đã được cập nhật. ' +
                    f'Loại hồ sơ: {record_type}. ' +
                    (f'Mô tả: {description}' if description else ''),
            reference_id=str(record_id),
            reference_type='MEDICAL_RECORD',
            status='PENDING'
        )
        patient_email.save()
        send_email_notification.delay(patient_email.id)
        notifications.append(patient_email.id)

        # Notify patient about updated medical record - In-App
        patient_inapp = Notification(
            recipient_id=patient_id,
            recipient_type='PATIENT',
            notification_type='MEDICAL_RECORD',
            channel='IN_APP',
            subject='Hồ sơ y tế đã cập nhật',
            content=f'Hồ sơ y tế của bạn đã được cập nhật.',
            reference_id=str(record_id),
            reference_type='MEDICAL_RECORD',
            status='PENDING'
        )
        patient_inapp.save()
        notifications.append(patient_inapp.id)

        # Notify doctor about updated medical record - In-App
        doctor_inapp = Notification(
            recipient_id=doctor_id,
            recipient_type='DOCTOR',
            notification_type='MEDICAL_RECORD',
            channel='IN_APP',
            subject='Hồ sơ y tế đã cập nhật',
            content=f'Bạn đã cập nhật hồ sơ y tế của bệnh nhân.',
            reference_id=str(record_id),
            reference_type='MEDICAL_RECORD',
            status='PENDING'
        )
        doctor_inapp.save()
        notifications.append(doctor_inapp.id)

        # Notify nurses - In-App
        nurse_inapp = Notification(
            recipient_id=0,  # Nurse group ID
            recipient_type='NURSE',
            notification_type='MEDICAL_RECORD',
            channel='IN_APP',
            subject='Hồ sơ y tế đã cập nhật',
            content=f'Một hồ sơ y tế đã được cập nhật.',
            reference_id=str(record_id),
            reference_type='MEDICAL_RECORD',
            status='PENDING'
        )
        nurse_inapp.save()
        notifications.append(nurse_inapp.id)

        return {
            'message': 'Medical record update notification sent',
            'notifications': notifications
        }

    elif event_type == 'DIAGNOSIS_ADDED':
        # List to store all notifications
        notifications = []

        # Notify patient about new diagnosis - Email
        patient_email = Notification(
            recipient_id=patient_id,
            recipient_type='PATIENT',
            notification_type='MEDICAL_RECORD',
            channel='EMAIL',
            subject='Chẩn đoán mới đã được thêm vào hồ sơ y tế của bạn',
            content=f'Một chẩn đoán mới đã được thêm vào hồ sơ y tế của bạn. ' +
                    (f'Chi tiết: {description}' if description else ''),
            reference_id=str(record_id),
            reference_type='MEDICAL_RECORD',
            status='PENDING'
        )
        patient_email.save()
        send_email_notification.delay(patient_email.id)
        notifications.append(patient_email.id)

        # Notify patient about new diagnosis - In-App
        patient_inapp = Notification(
            recipient_id=patient_id,
            recipient_type='PATIENT',
            notification_type='MEDICAL_RECORD',
            channel='IN_APP',
            subject='Chẩn đoán mới',
            content=f'Một chẩn đoán mới đã được thêm vào hồ sơ y tế của bạn.',
            reference_id=str(record_id),
            reference_type='MEDICAL_RECORD',
            status='PENDING'
        )
        patient_inapp.save()
        notifications.append(patient_inapp.id)

        # Notify doctor about new diagnosis - In-App
        doctor_inapp = Notification(
            recipient_id=doctor_id,
            recipient_type='DOCTOR',
            notification_type='MEDICAL_RECORD',
            channel='IN_APP',
            subject='Chẩn đoán mới đã được thêm',
            content=f'Bạn đã thêm một chẩn đoán mới vào hồ sơ y tế của bệnh nhân.',
            reference_id=str(record_id),
            reference_type='MEDICAL_RECORD',
            status='PENDING'
        )
        doctor_inapp.save()
        notifications.append(doctor_inapp.id)

        # Notify nurses - In-App
        nurse_inapp = Notification(
            recipient_id=0,  # Nurse group ID
            recipient_type='NURSE',
            notification_type='MEDICAL_RECORD',
            channel='IN_APP',
            subject='Chẩn đoán mới đã được thêm',
            content=f'Một chẩn đoán mới đã được thêm vào hồ sơ y tế của bệnh nhân.',
            reference_id=str(record_id),
            reference_type='MEDICAL_RECORD',
            status='PENDING'
        )
        nurse_inapp.save()
        notifications.append(nurse_inapp.id)

        return {
            'message': 'Diagnosis notification sent',
            'notifications': notifications
        }

    elif event_type == 'TREATMENT_ADDED':
        # List to store all notifications
        notifications = []

        # Notify patient about new treatment - Email
        patient_email = Notification(
            recipient_id=patient_id,
            recipient_type='PATIENT',
            notification_type='MEDICAL_RECORD',
            channel='EMAIL',
            subject='Điều trị mới đã được thêm vào hồ sơ y tế của bạn',
            content=f'Một phương pháp điều trị mới đã được thêm vào hồ sơ y tế của bạn. ' +
                    (f'Chi tiết: {description}' if description else ''),
            reference_id=str(record_id),
            reference_type='MEDICAL_RECORD',
            status='PENDING'
        )
        patient_email.save()
        send_email_notification.delay(patient_email.id)
        notifications.append(patient_email.id)

        # Notify patient about new treatment - In-App
        patient_inapp = Notification(
            recipient_id=patient_id,
            recipient_type='PATIENT',
            notification_type='MEDICAL_RECORD',
            channel='IN_APP',
            subject='Điều trị mới',
            content=f'Một phương pháp điều trị mới đã được thêm vào hồ sơ y tế của bạn.',
            reference_id=str(record_id),
            reference_type='MEDICAL_RECORD',
            status='PENDING'
        )
        patient_inapp.save()
        notifications.append(patient_inapp.id)

        # Notify doctor about new treatment - In-App
        doctor_inapp = Notification(
            recipient_id=doctor_id,
            recipient_type='DOCTOR',
            notification_type='MEDICAL_RECORD',
            channel='IN_APP',
            subject='Điều trị mới đã được thêm',
            content=f'Bạn đã thêm một phương pháp điều trị mới vào hồ sơ y tế của bệnh nhân.',
            reference_id=str(record_id),
            reference_type='MEDICAL_RECORD',
            status='PENDING'
        )
        doctor_inapp.save()
        notifications.append(doctor_inapp.id)

        # Notify nurses - In-App
        nurse_inapp = Notification(
            recipient_id=0,  # Nurse group ID
            recipient_type='NURSE',
            notification_type='MEDICAL_RECORD',
            channel='IN_APP',
            subject='Điều trị mới đã được thêm',
            content=f'Một phương pháp điều trị mới đã được thêm vào hồ sơ y tế của bệnh nhân.',
            reference_id=str(record_id),
            reference_type='MEDICAL_RECORD',
            status='PENDING'
        )
        nurse_inapp.save()
        notifications.append(nurse_inapp.id)

        return {
            'message': 'Treatment notification sent',
            'notifications': notifications
        }

    elif event_type == 'MEDICATION_ADDED':
        # List to store all notifications
        notifications = []

        # Notify patient about new medication - Email
        patient_email = Notification(
            recipient_id=patient_id,
            recipient_type='PATIENT',
            notification_type='MEDICAL_RECORD',
            channel='EMAIL',
            subject='Thuốc mới đã được thêm vào hồ sơ y tế của bạn',
            content=f'Một loại thuốc mới đã được thêm vào hồ sơ y tế của bạn. ' +
                    (f'Chi tiết: {description}' if description else ''),
            reference_id=str(record_id),
            reference_type='MEDICAL_RECORD',
            status='PENDING'
        )
        patient_email.save()
        send_email_notification.delay(patient_email.id)
        notifications.append(patient_email.id)

        # Notify patient about new medication - In-App
        patient_inapp = Notification(
            recipient_id=patient_id,
            recipient_type='PATIENT',
            notification_type='MEDICAL_RECORD',
            channel='IN_APP',
            subject='Thuốc mới',
            content=f'Một loại thuốc mới đã được thêm vào hồ sơ y tế của bạn.',
            reference_id=str(record_id),
            reference_type='MEDICAL_RECORD',
            status='PENDING'
        )
        patient_inapp.save()
        notifications.append(patient_inapp.id)

        # Notify doctor about new medication - In-App
        doctor_inapp = Notification(
            recipient_id=doctor_id,
            recipient_type='DOCTOR',
            notification_type='MEDICAL_RECORD',
            channel='IN_APP',
            subject='Thuốc mới đã được thêm',
            content=f'Bạn đã thêm một loại thuốc mới vào hồ sơ y tế của bệnh nhân.',
            reference_id=str(record_id),
            reference_type='MEDICAL_RECORD',
            status='PENDING'
        )
        doctor_inapp.save()
        notifications.append(doctor_inapp.id)

        # Notify pharmacist - In-App
        pharmacist_inapp = Notification(
            recipient_id=0,  # Pharmacist group ID
            recipient_type='PHARMACIST',
            notification_type='MEDICAL_RECORD',
            channel='IN_APP',
            subject='Thuốc mới đã được kê đơn',
            content=f'Một loại thuốc mới đã được kê đơn cho bệnh nhân.',
            reference_id=str(record_id),
            reference_type='MEDICAL_RECORD',
            status='PENDING'
        )
        pharmacist_inapp.save()
        notifications.append(pharmacist_inapp.id)

        return {
            'message': 'Medication notification sent',
            'notifications': notifications
        }

    else:
        logger.warning(f"Unknown medical record event type: {event_type}")
        return {
            'message': f'Unknown medical record event type: {event_type}',
            'notifications': []
        }


def process_billing_event(event_data):
    """
    Process events from the Billing Service.
    """
    event_type = event_data.get('event_type')
    invoice_id = event_data.get('invoice_id')
    payment_id = event_data.get('payment_id')
    claim_id = event_data.get('claim_id')
    patient_id = event_data.get('patient_id')
    amount = event_data.get('amount')
    due_date = event_data.get('due_date')
    description = event_data.get('description', '')

    # Format amount for display
    formatted_amount = f"{amount:,.0f} VND" if amount else "Không xác định"

    # Format due date for display
    try:
        from datetime import datetime
        if due_date and isinstance(due_date, str):
            # Try to parse the date string
            try:
                # Try ISO format first (YYYY-MM-DD)
                parsed_date = datetime.fromisoformat(due_date.replace('Z', '+00:00'))
                formatted_due_date = parsed_date.strftime('%d/%m/%Y')
            except ValueError:
                # If that fails, try other common formats
                try:
                    parsed_date = datetime.strptime(due_date, '%Y-%m-%d')
                    formatted_due_date = parsed_date.strftime('%d/%m/%Y')
                except ValueError:
                    # If all parsing attempts fail, just use the string as is
                    formatted_due_date = due_date
        elif due_date and hasattr(due_date, 'strftime'):
            # If it's already a datetime object
            formatted_due_date = due_date.strftime('%d/%m/%Y')
        else:
            formatted_due_date = 'Không xác định'
    except Exception as e:
        logger.error(f"Error formatting due date: {str(e)}")
        formatted_due_date = str(due_date) if due_date else 'Không xác định'

    # Create notifications based on event type
    if event_type == 'INVOICE_CREATED':
        # List to store all notifications
        notifications = []

        # Notify patient about new invoice - Email
        email_notification = Notification(
            recipient_id=patient_id,
            recipient_type='PATIENT',
            notification_type='BILLING',
            channel='EMAIL',
            subject='Hóa đơn mới đã được tạo',
            content=f'Một hóa đơn mới đã được tạo cho bạn. ' +
                    f'Số tiền: {formatted_amount}. ' +
                    f'Ngày đến hạn: {formatted_due_date}. ' +
                    (f'Mô tả: {description}' if description else ''),
            reference_id=str(invoice_id),
            reference_type='INVOICE',
            status='PENDING'
        )
        email_notification.save()
        send_email_notification.delay(email_notification.id)
        notifications.append(email_notification.id)

        # Notify patient about new invoice - In-App
        inapp_notification = Notification(
            recipient_id=patient_id,
            recipient_type='PATIENT',
            notification_type='BILLING',
            channel='IN_APP',
            subject='Hóa đơn mới',
            content=f'Một hóa đơn mới đã được tạo cho bạn. Số tiền: {formatted_amount}. Ngày đến hạn: {formatted_due_date}.',
            reference_id=str(invoice_id),
            reference_type='INVOICE',
            status='PENDING'
        )
        inapp_notification.save()
        notifications.append(inapp_notification.id)

        # Create in-app notification for patient
        in_app = InAppNotification(
            recipient_id=patient_id,
            recipient_type='PATIENT',
            notification_type='BILLING',
            title='Hóa đơn mới',
            content=f'Một hóa đơn mới đã được tạo cho bạn. Số tiền: {formatted_amount}. Ngày đến hạn: {formatted_due_date}.',
            reference_id=str(invoice_id),
            reference_type='INVOICE',
            service='BILLING',
            event_type='INVOICE_CREATED',
            is_urgent=True
        )
        in_app.save()

        # Notify admin about new invoice - In-App
        admin_notification = Notification(
            recipient_id=0,  # Admin group ID
            recipient_type='ADMIN',
            notification_type='BILLING',
            channel='IN_APP',
            subject='Hóa đơn mới đã được tạo',
            content=f'Một hóa đơn mới đã được tạo cho bệnh nhân. Số tiền: {formatted_amount}.',
            reference_id=str(invoice_id),
            reference_type='INVOICE',
            status='PENDING'
        )
        admin_notification.save()
        notifications.append(admin_notification.id)

        return {
            'message': 'Đã gửi thông báo tạo hóa đơn',
            'notifications': notifications
        }

    elif event_type == 'PAYMENT_RECEIVED':
        # List to store all notifications
        notifications = []

        # Notify patient about payment received - Email
        email_notification = Notification(
            recipient_id=patient_id,
            recipient_type='PATIENT',
            notification_type='BILLING',
            channel='EMAIL',
            subject='Đã nhận thanh toán',
            content=f'Chúng tôi đã nhận được khoản thanh toán của bạn với số tiền {formatted_amount}. ' +
                    'Cảm ơn bạn đã thanh toán.',
            reference_id=str(payment_id),
            reference_type='PAYMENT',
            status='PENDING'
        )
        email_notification.save()
        send_email_notification.delay(email_notification.id)
        notifications.append(email_notification.id)

        # Notify patient about payment received - In-App
        inapp_notification = Notification(
            recipient_id=patient_id,
            recipient_type='PATIENT',
            notification_type='BILLING',
            channel='IN_APP',
            subject='Đã nhận thanh toán',
            content=f'Chúng tôi đã nhận được khoản thanh toán của bạn với số tiền {formatted_amount}.',
            reference_id=str(payment_id),
            reference_type='PAYMENT',
            status='PENDING'
        )
        inapp_notification.save()
        notifications.append(inapp_notification.id)

        # Create in-app notification for patient
        in_app = InAppNotification(
            recipient_id=patient_id,
            recipient_type='PATIENT',
            notification_type='BILLING',
            title='Đã nhận thanh toán',
            content=f'Chúng tôi đã nhận được khoản thanh toán của bạn với số tiền {formatted_amount}.',
            reference_id=str(payment_id),
            reference_type='PAYMENT',
            service='BILLING',
            event_type='PAYMENT_RECEIVED'
        )
        in_app.save()

        # Notify admin about payment received - In-App
        admin_notification = Notification(
            recipient_id=0,  # Admin group ID
            recipient_type='ADMIN',
            notification_type='BILLING',
            channel='IN_APP',
            subject='Đã nhận thanh toán',
            content=f'Đã nhận được khoản thanh toán từ bệnh nhân với số tiền {formatted_amount}.',
            reference_id=str(payment_id),
            reference_type='PAYMENT',
            status='PENDING'
        )
        admin_notification.save()
        notifications.append(admin_notification.id)

        return {
            'message': 'Đã gửi thông báo nhận thanh toán',
            'notifications': notifications
        }

    elif event_type == 'PAYMENT_DUE':
        # Notify patient about payment due
        notification = Notification(
            recipient_id=patient_id,
            recipient_type='PATIENT',
            notification_type='BILLING',
            channel='EMAIL',
            subject='Nhắc nhở thanh toán',
            content=f'Đây là lời nhắc rằng khoản thanh toán của bạn với số tiền {formatted_amount} sẽ đến hạn vào ngày {formatted_due_date}. ' +
                    'Vui lòng thanh toán trước ngày đến hạn để tránh phí trễ hạn.',
            reference_id=str(invoice_id),
            reference_type='INVOICE',
            status='PENDING'
        )
        notification.save()
        send_email_notification.delay(notification.id)

        # Also send SMS reminder
        sms_notification = Notification(
            recipient_id=patient_id,
            recipient_type='PATIENT',
            notification_type='BILLING',
            channel='SMS',
            subject='',
            content=f'Nhắc nhở: Khoản thanh toán của bạn với số tiền {formatted_amount} sẽ đến hạn vào ngày {formatted_due_date}.',
            reference_id=str(invoice_id),
            reference_type='INVOICE',
            status='PENDING'
        )
        sms_notification.save()
        send_sms_notification.delay(sms_notification.id)

        return {
            'message': 'Đã gửi thông báo nhắc nhở thanh toán',
            'notifications': [notification.id, sms_notification.id]
        }

    elif event_type == 'PAYMENT_OVERDUE':
        # Notify patient about overdue payment
        notification = Notification(
            recipient_id=patient_id,
            recipient_type='PATIENT',
            notification_type='BILLING',
            channel='EMAIL',
            subject='Thanh toán quá hạn',
            content=f'Khoản thanh toán của bạn với số tiền {formatted_amount} đã đến hạn vào ngày {formatted_due_date} và hiện đã quá hạn. ' +
                    'Vui lòng thanh toán càng sớm càng tốt để tránh các khoản phí bổ sung.',
            reference_id=str(invoice_id),
            reference_type='INVOICE',
            status='PENDING'
        )
        notification.save()
        send_email_notification.delay(notification.id)

        # Also send SMS reminder for overdue payment
        sms_notification = Notification(
            recipient_id=patient_id,
            recipient_type='PATIENT',
            notification_type='BILLING',
            channel='SMS',
            subject='',
            content=f'KHẨN CẤP: Khoản thanh toán của bạn với số tiền {formatted_amount} đã quá hạn. Vui lòng thanh toán ngay lập tức.',
            reference_id=str(invoice_id),
            reference_type='INVOICE',
            status='PENDING'
        )
        sms_notification.save()
        send_sms_notification.delay(sms_notification.id)

        return {
            'message': 'Đã gửi thông báo thanh toán quá hạn',
            'notifications': [notification.id, sms_notification.id]
        }

    elif event_type == 'INSURANCE_CLAIM_SUBMITTED':
        # Notify patient about insurance claim submission
        notification = Notification(
            recipient_id=patient_id,
            recipient_type='PATIENT',
            notification_type='BILLING',
            channel='EMAIL',
            subject='Đã gửi yêu cầu bảo hiểm',
            content=f'Một yêu cầu bảo hiểm đã được gửi cho hóa đơn của bạn. ' +
                    f'Số tiền yêu cầu: {formatted_amount}. ' +
                    'Chúng tôi sẽ thông báo cho bạn khi nhận được phản hồi từ nhà cung cấp bảo hiểm của bạn.',
            reference_id=str(claim_id),
            reference_type='CLAIM',
            status='PENDING'
        )
        notification.save()
        send_email_notification.delay(notification.id)

        return {
            'message': 'Đã gửi thông báo yêu cầu bảo hiểm',
            'notifications': [notification.id]
        }

    elif event_type == 'INSURANCE_CLAIM_APPROVED':
        # Notify patient about approved insurance claim
        notification = Notification(
            recipient_id=patient_id,
            recipient_type='PATIENT',
            notification_type='BILLING',
            channel='EMAIL',
            subject='Yêu cầu bảo hiểm đã được chấp nhận',
            content=f'Yêu cầu bảo hiểm của bạn đã được chấp nhận. ' +
                    f'Số tiền được chấp nhận: {formatted_amount}. ' +
                    'Số tiền được chấp nhận sẽ được áp dụng vào hóa đơn của bạn.',
            reference_id=str(claim_id),
            reference_type='CLAIM',
            status='PENDING'
        )
        notification.save()
        send_email_notification.delay(notification.id)

        return {
            'message': 'Đã gửi thông báo chấp nhận yêu cầu bảo hiểm',
            'notifications': [notification.id]
        }

    elif event_type == 'INSURANCE_CLAIM_REJECTED':
        # Notify patient about rejected insurance claim
        notification = Notification(
            recipient_id=patient_id,
            recipient_type='PATIENT',
            notification_type='BILLING',
            channel='EMAIL',
            subject='Yêu cầu bảo hiểm đã bị từ chối',
            content=f'Yêu cầu bảo hiểm của bạn đã bị từ chối. ' +
                    f'Số tiền yêu cầu: {formatted_amount}. ' +
                    'Vui lòng liên hệ với bộ phận thanh toán của chúng tôi để biết thêm thông tin và thảo luận về các tùy chọn thanh toán.',
            reference_id=str(claim_id),
            reference_type='CLAIM',
            status='PENDING'
        )
        notification.save()
        send_email_notification.delay(notification.id)

        return {
            'message': 'Đã gửi thông báo từ chối yêu cầu bảo hiểm',
            'notifications': [notification.id]
        }

    else:
        logger.warning(f"Unknown billing event type: {event_type}")
        return {
            'message': f'Loại sự kiện thanh toán không xác định: {event_type}',
            'notifications': []
        }


def process_pharmacy_event(event_data):
    """
    Process events from the Pharmacy Service.
    """
    event_type = event_data.get('event_type')
    prescription_id = event_data.get('prescription_id')
    medication_id = event_data.get('medication_id')
    patient_id = event_data.get('patient_id')
    doctor_id = event_data.get('doctor_id')
    medication_name = event_data.get('medication_name', '')
    pickup_date = event_data.get('pickup_date')
    refill_date = event_data.get('refill_date')
    notes = event_data.get('notes', '')

    # Format dates for display
    formatted_pickup_date = pickup_date if pickup_date else 'Không xác định'
    formatted_refill_date = refill_date if refill_date else 'Không xác định'

    # Create notifications based on event type
    if event_type == 'PRESCRIPTION_CREATED':
        # Notify patient about new prescription
        notification = Notification(
            recipient_id=patient_id,
            recipient_type='PATIENT',
            notification_type='PHARMACY',
            channel='EMAIL',
            subject='Đơn thuốc mới đã được tạo',
            content=f'Một đơn thuốc mới đã được tạo cho bạn. ' +
                    (f'Thuốc: {medication_name}. ' if medication_name else '') +
                    (f'Ghi chú: {notes}' if notes else ''),
            reference_id=str(prescription_id),
            reference_type='PRESCRIPTION',
            status='PENDING'
        )
        notification.save()
        send_email_notification.delay(notification.id)

        return {
            'message': 'Đã gửi thông báo tạo đơn thuốc',
            'notifications': [notification.id]
        }

    elif event_type == 'PRESCRIPTION_FILLED':
        # Notify patient about filled prescription
        notification = Notification(
            recipient_id=patient_id,
            recipient_type='PATIENT',
            notification_type='PHARMACY',
            channel='EMAIL',
            subject='Đơn thuốc đã được chuẩn bị',
            content=f'Đơn thuốc của bạn đã được chuẩn bị và đang được xử lý. ' +
                    (f'Thuốc: {medication_name}. ' if medication_name else '') +
                    'Chúng tôi sẽ thông báo cho bạn khi đơn thuốc sẵn sàng để lấy.',
            reference_id=str(prescription_id),
            reference_type='PRESCRIPTION',
            status='PENDING'
        )
        notification.save()
        send_email_notification.delay(notification.id)

        return {
            'message': 'Đã gửi thông báo chuẩn bị đơn thuốc',
            'notifications': [notification.id]
        }

    elif event_type == 'PRESCRIPTION_READY':
        # Notify patient about prescription ready for pickup
        notification = Notification(
            recipient_id=patient_id,
            recipient_type='PATIENT',
            notification_type='PHARMACY',
            channel='EMAIL',
            subject='Đơn thuốc sẵn sàng để lấy',
            content=f'Đơn thuốc của bạn đã sẵn sàng để lấy. ' +
                    (f'Thuốc: {medication_name}. ' if medication_name else '') +
                    (f'Ngày lấy: {formatted_pickup_date}. ' if pickup_date else '') +
                    'Vui lòng mang theo giấy tờ tùy thân khi đến lấy thuốc.',
            reference_id=str(prescription_id),
            reference_type='PRESCRIPTION',
            status='PENDING'
        )
        notification.save()
        send_email_notification.delay(notification.id)

        # Also send SMS notification
        sms_notification = Notification(
            recipient_id=patient_id,
            recipient_type='PATIENT',
            notification_type='PHARMACY',
            channel='SMS',
            subject='',
            content=f'Đơn thuốc của bạn đã sẵn sàng để lấy tại nhà thuốc của chúng tôi.' +
                    (f' Thuốc: {medication_name}.' if medication_name else ''),
            reference_id=str(prescription_id),
            reference_type='PRESCRIPTION',
            status='PENDING'
        )
        sms_notification.save()
        send_sms_notification.delay(sms_notification.id)

        return {
            'message': 'Đã gửi thông báo đơn thuốc sẵn sàng',
            'notifications': [notification.id, sms_notification.id]
        }

    elif event_type == 'PRESCRIPTION_PICKED_UP':
        # Notify patient about picked up prescription
        notification = Notification(
            recipient_id=patient_id,
            recipient_type='PATIENT',
            notification_type='PHARMACY',
            channel='EMAIL',
            subject='Đơn thuốc đã được lấy',
            content=f'Đơn thuốc của bạn đã được lấy thành công. ' +
                    (f'Thuốc: {medication_name}. ' if medication_name else '') +
                    'Cảm ơn bạn đã sử dụng dịch vụ của chúng tôi.',
            reference_id=str(prescription_id),
            reference_type='PRESCRIPTION',
            status='PENDING'
        )
        notification.save()
        send_email_notification.delay(notification.id)

        return {
            'message': 'Đã gửi thông báo đơn thuốc đã được lấy',
            'notifications': [notification.id]
        }

    elif event_type == 'MEDICATION_REFILL_DUE':
        # Notify patient about medication refill due
        notification = Notification(
            recipient_id=patient_id,
            recipient_type='PATIENT',
            notification_type='PHARMACY',
            channel='EMAIL',
            subject='Nhắc nhở tái cấp thuốc',
            content=f'Đây là lời nhắc rằng thuốc của bạn sẽ cần được tái cấp vào ngày {formatted_refill_date}. ' +
                    (f'Thuốc: {medication_name}. ' if medication_name else '') +
                    'Vui lòng liên hệ với bác sĩ của bạn để được kê đơn mới hoặc tái cấp thuốc.',
            reference_id=str(medication_id),
            reference_type='MEDICATION',
            status='PENDING'
        )
        notification.save()
        send_email_notification.delay(notification.id)

        # Also send SMS reminder
        sms_notification = Notification(
            recipient_id=patient_id,
            recipient_type='PATIENT',
            notification_type='PHARMACY',
            channel='SMS',
            subject='',
            content=f'Nhắc nhở: Thuốc của bạn ({medication_name}) sẽ cần được tái cấp vào ngày {formatted_refill_date}.',
            reference_id=str(medication_id),
            reference_type='MEDICATION',
            status='PENDING'
        )
        sms_notification.save()
        send_sms_notification.delay(sms_notification.id)

        return {
            'message': 'Đã gửi thông báo nhắc nhở tái cấp thuốc',
            'notifications': [notification.id, sms_notification.id]
        }

    elif event_type == 'MEDICATION_EXPIRING':
        # Notify patient about expiring medication
        notification = Notification(
            recipient_id=patient_id,
            recipient_type='PATIENT',
            notification_type='PHARMACY',
            channel='EMAIL',
            subject='Thuốc sắp hết hạn',
            content=f'Thuốc của bạn sắp hết hạn. ' +
                    (f'Thuốc: {medication_name}. ' if medication_name else '') +
                    'Vui lòng kiểm tra ngày hết hạn trên bao bì và liên hệ với bác sĩ của bạn nếu cần đơn thuốc mới.',
            reference_id=str(medication_id),
            reference_type='MEDICATION',
            status='PENDING'
        )
        notification.save()
        send_email_notification.delay(notification.id)

        return {
            'message': 'Đã gửi thông báo thuốc sắp hết hạn',
            'notifications': [notification.id]
        }

    else:
        logger.warning(f"Unknown pharmacy event type: {event_type}")
        return {
            'message': f'Loại sự kiện nhà thuốc không xác định: {event_type}',
            'notifications': []
        }


def process_laboratory_event(event_data):
    """
    Process events from the Laboratory Service.
    """
    event_type = event_data.get('event_type')
    test_id = event_data.get('test_id')
    result_id = event_data.get('result_id')
    patient_id = event_data.get('patient_id')
    doctor_id = event_data.get('doctor_id')
    test_name = event_data.get('test_name', '')
    test_date = event_data.get('test_date')
    is_abnormal = event_data.get('is_abnormal')
    notes = event_data.get('notes', '')

    # Format date for display
    formatted_test_date = test_date if test_date else 'Không xác định'

    # Create notifications based on event type
    if event_type == 'TEST_ORDERED':
        # List to store all notifications
        notifications = []

        # Notify patient about ordered test - Email
        patient_email = Notification(
            recipient_id=patient_id,
            recipient_type='PATIENT',
            notification_type='LABORATORY',
            channel='EMAIL',
            subject='Xét nghiệm mới đã được yêu cầu',
            content=f'Một xét nghiệm mới đã được yêu cầu cho bạn. ' +
                    (f'Tên xét nghiệm: {test_name}. ' if test_name else '') +
                    (f'Ngày xét nghiệm: {formatted_test_date}. ' if test_date else '') +
                    (f'Ghi chú: {notes}' if notes else ''),
            reference_id=str(test_id),
            reference_type='TEST',
            status='PENDING'
        )
        patient_email.save()
        send_email_notification.delay(patient_email.id)
        notifications.append(patient_email.id)

        # Notify patient about ordered test - In-App
        patient_inapp = Notification(
            recipient_id=patient_id,
            recipient_type='PATIENT',
            notification_type='LABORATORY',
            channel='IN_APP',
            subject='Xét nghiệm mới',
            content=f'Một xét nghiệm mới đã được yêu cầu cho bạn. ' +
                    (f'Tên xét nghiệm: {test_name}.' if test_name else ''),
            reference_id=str(test_id),
            reference_type='TEST',
            status='PENDING'
        )
        patient_inapp.save()
        notifications.append(patient_inapp.id)

        # Notify doctor about ordered test - In-App
        if doctor_id:
            doctor_inapp = Notification(
                recipient_id=doctor_id,
                recipient_type='DOCTOR',
                notification_type='LABORATORY',
                channel='IN_APP',
                subject='Xét nghiệm mới đã được yêu cầu',
                content=f'Bạn đã yêu cầu một xét nghiệm mới cho bệnh nhân. ' +
                        (f'Tên xét nghiệm: {test_name}.' if test_name else ''),
                reference_id=str(test_id),
                reference_type='TEST',
                status='PENDING'
            )
            doctor_inapp.save()
            notifications.append(doctor_inapp.id)

        # Notify lab technician - In-App
        lab_tech_inapp = Notification(
            recipient_id=0,  # Lab technician group ID
            recipient_type='LAB_TECHNICIAN',
            notification_type='LABORATORY',
            channel='IN_APP',
            subject='Xét nghiệm mới cần xử lý',
            content=f'Một xét nghiệm mới cần được xử lý. ' +
                    (f'Tên xét nghiệm: {test_name}.' if test_name else ''),
            reference_id=str(test_id),
            reference_type='TEST',
            status='PENDING'
        )
        lab_tech_inapp.save()
        notifications.append(lab_tech_inapp.id)

        return {
            'message': 'Đã gửi thông báo yêu cầu xét nghiệm',
            'notifications': notifications
        }

    elif event_type == 'SAMPLE_COLLECTED':
        # List to store all notifications
        notifications = []

        # Notify patient about sample collection - Email
        patient_email = Notification(
            recipient_id=patient_id,
            recipient_type='PATIENT',
            notification_type='LABORATORY',
            channel='EMAIL',
            subject='Mẫu xét nghiệm đã được thu thập',
            content=f'Mẫu xét nghiệm của bạn đã được thu thập. ' +
                    (f'Tên xét nghiệm: {test_name}. ' if test_name else '') +
                    'Chúng tôi sẽ thông báo cho bạn khi kết quả sẵn sàng.',
            reference_id=str(test_id),
            reference_type='TEST',
            status='PENDING'
        )
        patient_email.save()
        send_email_notification.delay(patient_email.id)
        notifications.append(patient_email.id)

        # Notify patient about sample collection - In-App
        patient_inapp = Notification(
            recipient_id=patient_id,
            recipient_type='PATIENT',
            notification_type='LABORATORY',
            channel='IN_APP',
            subject='Mẫu xét nghiệm đã được thu thập',
            content=f'Mẫu xét nghiệm của bạn đã được thu thập. ' +
                    (f'Tên xét nghiệm: {test_name}.' if test_name else ''),
            reference_id=str(test_id),
            reference_type='TEST',
            status='PENDING'
        )
        patient_inapp.save()
        notifications.append(patient_inapp.id)

        # Notify doctor about sample collection - In-App
        if doctor_id:
            doctor_inapp = Notification(
                recipient_id=doctor_id,
                recipient_type='DOCTOR',
                notification_type='LABORATORY',
                channel='IN_APP',
                subject='Mẫu xét nghiệm đã được thu thập',
                content=f'Mẫu xét nghiệm của bệnh nhân đã được thu thập. ' +
                        (f'Tên xét nghiệm: {test_name}.' if test_name else ''),
                reference_id=str(test_id),
                reference_type='TEST',
                status='PENDING'
            )
            doctor_inapp.save()
            notifications.append(doctor_inapp.id)

        # Notify lab technician - In-App
        lab_tech_inapp = Notification(
            recipient_id=0,  # Lab technician group ID
            recipient_type='LAB_TECHNICIAN',
            notification_type='LABORATORY',
            channel='IN_APP',
            subject='Mẫu xét nghiệm đã được thu thập',
            content=f'Mẫu xét nghiệm đã được thu thập và sẵn sàng để xử lý. ' +
                    (f'Tên xét nghiệm: {test_name}.' if test_name else ''),
            reference_id=str(test_id),
            reference_type='TEST',
            status='PENDING'
        )
        lab_tech_inapp.save()
        notifications.append(lab_tech_inapp.id)

        return {
            'message': 'Đã gửi thông báo thu thập mẫu',
            'notifications': notifications
        }

    elif event_type == 'RESULTS_READY':
        # List to store all notifications
        notifications = []

        # Notify patient about ready results - Email
        patient_email = Notification(
            recipient_id=patient_id,
            recipient_type='PATIENT',
            notification_type='LABORATORY',
            channel='EMAIL',
            subject='Kết quả xét nghiệm đã sẵn sàng',
            content=f'Kết quả xét nghiệm của bạn đã sẵn sàng. ' +
                    (f'Tên xét nghiệm: {test_name}. ' if test_name else '') +
                    'Vui lòng đăng nhập vào tài khoản của bạn để xem kết quả hoặc liên hệ với bác sĩ của bạn.',
            reference_id=str(result_id),
            reference_type='RESULT',
            status='PENDING'
        )
        patient_email.save()
        send_email_notification.delay(patient_email.id)
        notifications.append(patient_email.id)

        # Notify patient about ready results - In-App
        patient_inapp = Notification(
            recipient_id=patient_id,
            recipient_type='PATIENT',
            notification_type='LABORATORY',
            channel='IN_APP',
            subject='Kết quả xét nghiệm đã sẵn sàng',
            content=f'Kết quả xét nghiệm của bạn đã sẵn sàng. ' +
                    (f'Tên xét nghiệm: {test_name}.' if test_name else ''),
            reference_id=str(result_id),
            reference_type='RESULT',
            status='PENDING'
        )
        patient_inapp.save()
        notifications.append(patient_inapp.id)

        # Notify doctor about ready results - Email
        if doctor_id:
            doctor_email = Notification(
                recipient_id=doctor_id,
                recipient_type='DOCTOR',
                notification_type='LABORATORY',
                channel='EMAIL',
                subject='Kết quả xét nghiệm đã sẵn sàng',
                content=f'Kết quả xét nghiệm của bệnh nhân (ID: {patient_id}) đã sẵn sàng. ' +
                        (f'Tên xét nghiệm: {test_name}. ' if test_name else '') +
                        (f'Kết quả bất thường: Có' if is_abnormal else ''),
                reference_id=str(result_id),
                reference_type='RESULT',
                status='PENDING'
            )
            doctor_email.save()
            send_email_notification.delay(doctor_email.id)
            notifications.append(doctor_email.id)

            # Notify doctor about ready results - In-App
            doctor_inapp = Notification(
                recipient_id=doctor_id,
                recipient_type='DOCTOR',
                notification_type='LABORATORY',
                channel='IN_APP',
                subject='Kết quả xét nghiệm đã sẵn sàng',
                content=f'Kết quả xét nghiệm của bệnh nhân đã sẵn sàng. ' +
                        (f'Tên xét nghiệm: {test_name}. ' if test_name else '') +
                        (f'Kết quả bất thường: Có' if is_abnormal else ''),
                reference_id=str(result_id),
                reference_type='RESULT',
                status='PENDING'
            )
            doctor_inapp.save()
            notifications.append(doctor_inapp.id)

        # Notify lab technician - In-App
        lab_tech_inapp = Notification(
            recipient_id=0,  # Lab technician group ID
            recipient_type='LAB_TECHNICIAN',
            notification_type='LABORATORY',
            channel='IN_APP',
            subject='Kết quả xét nghiệm đã sẵn sàng',
            content=f'Kết quả xét nghiệm đã sẵn sàng. ' +
                    (f'Tên xét nghiệm: {test_name}. ' if test_name else '') +
                    (f'Kết quả bất thường: Có' if is_abnormal else ''),
            reference_id=str(result_id),
            reference_type='RESULT',
            status='PENDING'
        )
        lab_tech_inapp.save()
        notifications.append(lab_tech_inapp.id)

        return {
            'message': 'Đã gửi thông báo kết quả sẵn sàng',
            'notifications': notifications
        }

    elif event_type == 'RESULTS_DELIVERED':
        # Notify patient about delivered results
        notification = Notification(
            recipient_id=patient_id,
            recipient_type='PATIENT',
            notification_type='LABORATORY',
            channel='EMAIL',
            subject='Kết quả xét nghiệm đã được gửi',
            content=f'Kết quả xét nghiệm của bạn đã được gửi. ' +
                    (f'Tên xét nghiệm: {test_name}. ' if test_name else '') +
                    'Vui lòng kiểm tra email của bạn hoặc đăng nhập vào tài khoản của bạn để xem kết quả.',
            reference_id=str(result_id),
            reference_type='RESULT',
            status='PENDING'
        )
        notification.save()
        send_email_notification.delay(notification.id)

        return {
            'message': 'Đã gửi thông báo kết quả đã được gửi',
            'notifications': [notification.id]
        }

    elif event_type == 'ABNORMAL_RESULTS':
        # Notify patient about abnormal results
        notification = Notification(
            recipient_id=patient_id,
            recipient_type='PATIENT',
            notification_type='LABORATORY',
            channel='EMAIL',
            subject='Kết quả xét nghiệm bất thường',
            content=f'Kết quả xét nghiệm của bạn có một số giá trị bất thường. ' +
                    (f'Tên xét nghiệm: {test_name}. ' if test_name else '') +
                    'Vui lòng liên hệ với bác sĩ của bạn để thảo luận về kết quả này.',
            reference_id=str(result_id),
            reference_type='RESULT',
            status='PENDING'
        )
        notification.save()
        send_email_notification.delay(notification.id)

        # Also send SMS for abnormal results
        sms_notification = Notification(
            recipient_id=patient_id,
            recipient_type='PATIENT',
            notification_type='LABORATORY',
            channel='SMS',
            subject='',
            content=f'QUAN TRỌNG: Kết quả xét nghiệm của bạn có một số giá trị bất thường. Vui lòng liên hệ với bác sĩ của bạn.',
            reference_id=str(result_id),
            reference_type='RESULT',
            status='PENDING'
        )
        sms_notification.save()
        send_sms_notification.delay(sms_notification.id)

        # Also notify doctor about abnormal results
        if doctor_id:
            doctor_notification = Notification(
                recipient_id=doctor_id,
                recipient_type='DOCTOR',
                notification_type='LABORATORY',
                channel='EMAIL',
                subject='Kết quả xét nghiệm bất thường',
                content=f'Kết quả xét nghiệm bất thường đã được phát hiện cho bệnh nhân (ID: {patient_id}). ' +
                        (f'Tên xét nghiệm: {test_name}. ' if test_name else '') +
                        'Vui lòng xem xét kết quả và liên hệ với bệnh nhân.',
                reference_id=str(result_id),
                reference_type='RESULT',
                status='PENDING'
            )
            doctor_notification.save()
            send_email_notification.delay(doctor_notification.id)

            return {
                'message': 'Đã gửi thông báo kết quả bất thường',
                'notifications': [notification.id, sms_notification.id, doctor_notification.id]
            }

        return {
            'message': 'Đã gửi thông báo kết quả bất thường',
            'notifications': [notification.id, sms_notification.id]
        }

    else:
        logger.warning(f"Unknown laboratory event type: {event_type}")
        return {
            'message': f'Loại sự kiện phòng xét nghiệm không xác định: {event_type}',
            'notifications': []
        }
