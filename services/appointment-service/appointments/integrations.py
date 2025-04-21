import requests
import logging
import os
from django.conf import settings

logger = logging.getLogger(__name__)

# Lấy URL các service từ settings (có fallback nếu không có)
def get_service_url(service_name):
    """Lấy URL service từ settings hoặc biến môi trường"""
    service_integrations = getattr(settings, 'SERVICE_INTEGRATIONS', {})
    return service_integrations.get(f"{service_name}_URL", os.environ.get(f"{service_name}_URL", f"http://{service_name.lower()}:8000"))

# Lấy URL các service từ settings
USER_SERVICE_URL = get_service_url('USER_SERVICE')
MEDICAL_RECORD_SERVICE_URL = get_service_url('MEDICAL_RECORD_SERVICE')
PHARMACY_SERVICE_URL = get_service_url('PHARMACY_SERVICE')
LAB_SERVICE_URL = get_service_url('LABORATORY_SERVICE')
NOTIFICATION_SERVICE_URL = get_service_url('NOTIFICATION_SERVICE')
BILLING_SERVICE_URL = get_service_url('BILLING_SERVICE')

# Cấu hình retry cho các API call
MAX_RETRIES = getattr(settings, 'API_RETRY_CONFIG', {}).get('MAX_RETRIES', 3)
RETRY_DELAY = getattr(settings, 'API_RETRY_CONFIG', {}).get('RETRY_DELAY', 1)
TIMEOUT = getattr(settings, 'API_RETRY_CONFIG', {}).get('TIMEOUT', 5)


def get_auth_headers(token=None):
    """Tạo headers xác thực cho các request đến service khác"""
    headers = {
        'Content-Type': 'application/json',
    }
    if token:
        headers['Authorization'] = f'Bearer {token}'
    return headers


def make_api_request(method, url, data=None, token=None, retry=0):
    """
    Hàm chung để thực hiện API call với cơ chế retry
    """
    import time

    headers = get_auth_headers(token)

    try:
        if method.lower() == 'get':
            response = requests.get(url, headers=headers, timeout=TIMEOUT)
        elif method.lower() == 'post':
            response = requests.post(url, json=data, headers=headers, timeout=TIMEOUT)
        elif method.lower() == 'put':
            response = requests.put(url, json=data, headers=headers, timeout=TIMEOUT)
        elif method.lower() == 'patch':
            response = requests.patch(url, json=data, headers=headers, timeout=TIMEOUT)
        elif method.lower() == 'delete':
            response = requests.delete(url, headers=headers, timeout=TIMEOUT)
        else:
            logger.error(f"Unsupported HTTP method: {method}")
            return None

        # Treat 202 Accepted as success for event processing
        if response.status_code in [200, 201, 202, 204]:
            if response.status_code == 204 or not response.content:
                return {}
            return response.json()

        # Nếu lỗi tạm thời và còn lượt retry, thử lại
        if response.status_code in [408, 429, 500, 502, 503, 504] and retry < MAX_RETRIES:
            logger.warning(f"Retrying API call to {url} after error {response.status_code}, attempt {retry+1}/{MAX_RETRIES}")
            time.sleep(RETRY_DELAY)
            return make_api_request(method, url, data, token, retry+1)

        logger.error(f"API call failed: {url}, status: {response.status_code}, response: {response.text}")
        return None

    except requests.exceptions.RequestException as e:
        if retry < MAX_RETRIES:
            logger.warning(f"Connection error to {url}, retrying {retry+1}/{MAX_RETRIES}: {str(e)}")
            time.sleep(RETRY_DELAY)
            return make_api_request(method, url, data, token, retry+1)
        logger.error(f"Failed to connect to {url} after {MAX_RETRIES} attempts: {str(e)}")
        return None


# Tích hợp với User Service
def get_user_info(user_id, token=None):
    """Lấy thông tin người dùng từ User Service"""
    url = f"{USER_SERVICE_URL}/api/users/{user_id}/"
    return make_api_request('get', url, token=token)


def get_doctor_info(doctor_id, token=None):
    """Lấy thông tin bác sĩ từ User Service"""
    try:
        # Thử gọi API đến User Service
        url = f"{USER_SERVICE_URL}/api/doctors/{doctor_id}/"
        result = make_api_request('get', url, token=token)

        if result:
            return result

        # Nếu không lấy được thông tin, thử gọi API danh sách và lọc
        url = f"{USER_SERVICE_URL}/api/doctors/"
        doctors = make_api_request('get', url, token=token)

        if doctors and isinstance(doctors, list):
            for doctor in doctors:
                if doctor.get('id') == doctor_id:
                    return doctor
    except Exception as e:
        logger.error(f"Error getting doctor info: {str(e)}")

    # Nếu không lấy được thông tin, trả về thông tin cơ bản
    return {
        'id': doctor_id,
        'name': f'Bác sĩ (ID: {doctor_id})'
    }


def get_doctors_by_specialty(specialty, token=None):
    """Lấy danh sách ID bác sĩ theo chuyên khoa từ User Service"""
    url = f"{USER_SERVICE_URL}/api/doctors/?specialty={specialty}"
    doctors = make_api_request('get', url, token=token)
    return [doctor.get('id') for doctor in doctors if doctor.get('id')] if doctors else None


def get_doctors_by_department(department, token=None):
    """Lấy danh sách ID bác sĩ theo khoa từ User Service"""
    # Lấy danh sách chuyên khoa thuộc khoa này
    url = f"{USER_SERVICE_URL}/api/specialties/?department={department}"
    specialties = make_api_request('get', url, token=token)

    if not specialties:
        logger.warning(f"No specialties found for department {department}")
        return None

    # Lấy ID của các chuyên khoa
    specialty_ids = [specialty.get('id') for specialty in specialties if specialty.get('id')]

    if not specialty_ids:
        logger.warning(f"No specialty IDs found for department {department}")
        return None

    # Lấy danh sách bác sĩ cho từng chuyên khoa
    all_doctors = []
    for specialty_id in specialty_ids:
        doctors = get_doctors_by_specialty(specialty_id, token)
        if doctors:
            all_doctors.extend(doctors)

    # Loại bỏ các ID trùng lặp
    unique_doctors = list(set(all_doctors))

    return unique_doctors if unique_doctors else None


def get_doctors_info(doctor_ids, token=None):
    """Lấy thông tin chi tiết của nhiều bác sĩ từ User Service"""
    if not doctor_ids:
        return []

    # Nếu chỉ có một ID, sử dụng API chi tiết
    if len(doctor_ids) == 1:
        doctor_info = get_doctor_info(doctor_ids[0], token)
        return [doctor_info] if doctor_info else []

    # Nếu có nhiều ID, sử dụng API danh sách với filter
    try:
        # Thử sử dụng API batch nếu có
        doctor_ids_str = ','.join(map(str, doctor_ids))
        url = f"{USER_SERVICE_URL}/api/doctors/batch/?ids={doctor_ids_str}"
        result = make_api_request('get', url, token=token)

        if result:
            return result

        # Nếu không có API batch, sử dụng API danh sách
        doctors = []
        for doctor_id in doctor_ids:
            doctor_info = get_doctor_info(doctor_id, token)
            if doctor_info:
                doctors.append(doctor_info)

        return doctors
    except Exception as e:
        logger.error(f"Error getting doctors info: {str(e)}")
        return []


def get_specialties(token=None):
    """Lấy danh sách chuyên khoa từ User Service"""
    url = f"{USER_SERVICE_URL}/api/specialties/"
    return make_api_request('get', url, token=token) or []


def get_departments(token=None):
    """Lấy danh sách khoa từ User Service"""
    url = f"{USER_SERVICE_URL}/api/departments/"
    return make_api_request('get', url, token=token) or []


# Tích hợp với Medical Record Service
def get_patient_medical_record(patient_id, token=None):
    """
    Lấy thông tin hồ sơ y tế của bệnh nhân

    Parameters:
    patient_id - int: ID bệnh nhân
    token - str: JWT token để xác thực với Medical Record Service
    """
    url = f"{MEDICAL_RECORD_SERVICE_URL}/api/medical-records/?patient_id={patient_id}"
    result = make_api_request('get', url, token=token)

    # Ghi log kết quả
    if result:
        logger.info(f"Retrieved medical records for patient {patient_id}: {len(result)} records")
    else:
        logger.warning(f"Failed to retrieve medical records for patient {patient_id}")

    return result


def update_medical_record(medical_record_id, data, token=None):
    """
    Cập nhật hồ sơ y tế

    Parameters:
    medical_record_id - int: ID hồ sơ y tế
    data - dict: Dữ liệu cập nhật
    token - str: JWT token để xác thực với Medical Record Service
    """
    url = f"{MEDICAL_RECORD_SERVICE_URL}/api/medical-records/{medical_record_id}/"
    result = make_api_request('patch', url, data=data, token=token)

    # Ghi log kết quả
    if result:
        logger.info(f"Updated medical record {medical_record_id}")
    else:
        logger.warning(f"Failed to update medical record {medical_record_id}")

    return result


def create_medical_record(patient_id, data, token=None):
    """
    Tạo hồ sơ y tế mới

    Parameters:
    patient_id - int: ID bệnh nhân
    data - dict: Dữ liệu hồ sơ y tế
    token - str: JWT token để xác thực với Medical Record Service
    """
    url = f"{MEDICAL_RECORD_SERVICE_URL}/api/medical-records/"

    # Thêm patient_id vào dữ liệu
    data["patient_id"] = patient_id

    result = make_api_request('post', url, data=data, token=token)

    # Ghi log kết quả
    if result:
        logger.info(f"Created medical record for patient {patient_id}: {result.get('id')}")
    else:
        logger.warning(f"Failed to create medical record for patient {patient_id}")

    return result


def update_medical_record_from_appointment(appointment, diagnosis=None, treatment=None, notes=None, token=None):
    """
    Cập nhật hồ sơ y tế từ lịch hẹn

    Parameters:
    appointment - Appointment: Đối tượng lịch hẹn
    diagnosis - str: Chẩn đoán
    treatment - str: Phương pháp điều trị
    notes - str: Ghi chú
    token - str: JWT token để xác thực với Medical Record Service
    """
    # Lấy thông tin cần thiết từ lịch hẹn
    patient_id = appointment.patient_id
    doctor_id = appointment.doctor_id
    appointment_id = appointment.id
    medical_record_id = getattr(appointment, 'medical_record_id', None)

    # Chuẩn bị dữ liệu cập nhật
    update_data = {
        "appointment_id": appointment_id,
        "doctor_id": doctor_id,
        "visit_date": appointment.time_slot.date.strftime('%Y-%m-%d') if hasattr(appointment.time_slot, 'date') else None,
    }

    # Thêm các trường tùy chọn nếu có
    if diagnosis:
        update_data["diagnosis"] = diagnosis
    if treatment:
        update_data["treatment"] = treatment
    if notes:
        update_data["notes"] = notes

    # Nếu đã có medical_record_id, cập nhật hồ sơ hiện tại
    if medical_record_id:
        return update_medical_record(medical_record_id, update_data, token)

    # Nếu chưa có, tạo hồ sơ mới
    return create_medical_record(patient_id, update_data, token)


# Tích hợp với Laboratory Service
def create_lab_request(appointment_id, doctor_id, patient_id, tests, token=None):
    """Tạo yêu cầu xét nghiệm"""
    url = f"{LAB_SERVICE_URL}/api/lab-requests/"
    data = {
        "appointment_id": appointment_id,
        "doctor_id": doctor_id,
        "patient_id": patient_id,
        "tests": tests
    }
    return make_api_request('post', url, data=data, token=token)


def get_lab_results(appointment_id, token=None):
    """Lấy kết quả xét nghiệm cho lịch hẹn"""
    url = f"{LAB_SERVICE_URL}/api/lab-results/?appointment_id={appointment_id}"
    return make_api_request('get', url, token=token)


# Tích hợp với Pharmacy Service
def create_prescription(appointment_id, doctor_id, patient_id, medications, token=None):
    """Tạo đơn thuốc"""
    url = f"{PHARMACY_SERVICE_URL}/api/prescriptions/"
    data = {
        "appointment_id": appointment_id,
        "doctor_id": doctor_id,
        "patient_id": patient_id,
        "medications": medications
    }
    return make_api_request('post', url, data=data, token=token)


def get_prescription(prescription_id, token=None):
    """Lấy thông tin đơn thuốc"""
    url = f"{PHARMACY_SERVICE_URL}/api/prescriptions/{prescription_id}/"
    return make_api_request('get', url, token=token)


# Tích hợp với Notification Service
def send_notification(user_id, notification_type, message, additional_data=None, token=None):
    """
    Gửi thông báo cho người dùng

    Parameters:
    user_id - int: ID người dùng nhận thông báo
    notification_type - str: Loại thông báo (APPOINTMENT_CREATED, APPOINTMENT_UPDATED, APPOINTMENT_CANCELLED, etc.)
    message - str: Nội dung thông báo
    additional_data - dict: Dữ liệu bổ sung (tùy chọn)
    token - str: JWT token để xác thực với Notification Service
    """
    url = f"{NOTIFICATION_SERVICE_URL}/api/events"

    # Chuẩn bị dữ liệu thông báo
    data = {
        "service": "APPOINTMENT",
        "event_type": notification_type,
        "patient_id": user_id,
        "message": message
    }

    # Thêm dữ liệu bổ sung nếu có
    if additional_data:
        data.update(additional_data)

    # Gọi API đến Notification Service
    result = make_api_request('post', url, data=data, token=token)

    # Ghi log kết quả
    if result:
        logger.info(f"Notification sent to user {user_id}: {notification_type}")
    else:
        logger.warning(f"Failed to send notification to user {user_id}: {notification_type}")

    return result


def send_appointment_notification(appointment, notification_type, message=None, token=None):
    """
    Gửi thông báo liên quan đến lịch hẹn

    Parameters:
    appointment - Appointment: Đối tượng lịch hẹn
    notification_type - str: Loại thông báo (CREATED, UPDATED, CANCELLED, REMINDER, etc.)
    message - str: Nội dung thông báo tùy chỉnh (nếu không cung cấp, sẽ tạo tự động)
    token - str: JWT token để xác thực với Notification Service
    """
    # Lấy thông tin cần thiết từ lịch hẹn
    patient_id = appointment.patient_id
    doctor_id = appointment.doctor_id
    appointment_date = appointment.time_slot.date.strftime('%d/%m/%Y') if hasattr(appointment.time_slot, 'date') else 'N/A'
    appointment_time = appointment.time_slot.start_time.strftime('%H:%M') if hasattr(appointment.time_slot, 'start_time') else 'N/A'

    # Tạo thông báo mặc định nếu không cung cấp
    if not message:
        if notification_type == 'CREATED':
            patient_message = f"Bạn đã đặt lịch hẹn khám bệnh vào ngày {appointment_date} lúc {appointment_time}."
            doctor_message = f"Bạn có lịch hẹn khám bệnh mới vào ngày {appointment_date} lúc {appointment_time}."
        elif notification_type == 'UPDATED':
            patient_message = f"Lịch hẹn khám bệnh của bạn vào ngày {appointment_date} lúc {appointment_time} đã được cập nhật."
            doctor_message = f"Lịch hẹn khám bệnh vào ngày {appointment_date} lúc {appointment_time} đã được cập nhật."
        elif notification_type == 'CANCELLED':
            patient_message = f"Lịch hẹn khám bệnh của bạn vào ngày {appointment_date} lúc {appointment_time} đã bị hủy."
            doctor_message = f"Lịch hẹn khám bệnh vào ngày {appointment_date} lúc {appointment_time} đã bị hủy."
        elif notification_type == 'REMINDER':
            patient_message = f"Nhắc nhở: Bạn có lịch hẹn khám bệnh vào ngày {appointment_date} lúc {appointment_time}."
            doctor_message = f"Nhắc nhở: Bạn có lịch hẹn khám bệnh vào ngày {appointment_date} lúc {appointment_time}."
        else:
            patient_message = f"Có cập nhật về lịch hẹn khám bệnh của bạn vào ngày {appointment_date} lúc {appointment_time}."
            doctor_message = f"Có cập nhật về lịch hẹn khám bệnh vào ngày {appointment_date} lúc {appointment_time}."
    else:
        patient_message = message
        doctor_message = message

    # Dispatch a single event to Notification Service
    url = f"{NOTIFICATION_SERVICE_URL}/api/events"
    event_payload = {
        "service": "APPOINTMENT",
        "event_type": notification_type,
        "appointment_id": appointment.id,
        "patient_id": patient_id,
        "doctor_id": doctor_id,
        "appointment_date": appointment_date,
        "appointment_time": appointment_time,
        "status": appointment.status,
    }
    result = make_api_request('post', url, data=event_payload, token=token)
    if result:
        logger.info(f"Notification event sent for appointment {appointment.id}")
    else:
        logger.warning(f"Failed to send notification event for appointment {appointment.id}")
    return result


# Tích hợp với Billing Service
def create_billing(data, token=None):
    """
    Tạo hóa đơn mới cho một lịch hẹn

    Parameters:
    data - dict: Dữ liệu hóa đơn bao gồm:
        - appointment_id: ID lịch hẹn
        - patient_id: ID bệnh nhân
        - doctor_id: ID bác sĩ
        - service_items: Danh sách các dịch vụ
        - insurance_id: ID bảo hiểm (tùy chọn)
    """
    url = f"{BILLING_SERVICE_URL}/api/billings/"
    result = make_api_request('post', url, data=data, token=token)

    # Ghi log kết quả
    if result:
        logger.info(f"Billing created for appointment {data.get('appointment_id')}: {result.get('id')}")
    else:
        logger.warning(f"Failed to create billing for appointment {data.get('appointment_id')}")

    return result


def create_appointment_billing(appointment, service_items=None, token=None):
    """
    Tạo hóa đơn cho lịch hẹn

    Parameters:
    appointment - Appointment: Đối tượng lịch hẹn
    service_items - list: Danh sách các dịch vụ (nếu không cung cấp, sẽ tạo dịch vụ mặc định)
    token - str: JWT token để xác thực với Billing Service
    """
    # Lấy thông tin cần thiết từ lịch hẹn
    appointment_id = appointment.id
    patient_id = appointment.patient_id
    doctor_id = appointment.doctor_id
    insurance_id = getattr(appointment, 'insurance_id', None)

    # Tạo dịch vụ mặc định nếu không cung cấp
    if not service_items:
        service_items = [
            {
                "service_code": "CONSULTATION",
                "service_name": "Khám bệnh",
                "quantity": 1,
                "unit_price": 200000,
                "total_price": 200000
            }
        ]

    # Tính tổng tiền
    total_amount = sum(item.get('total_price', 0) for item in service_items)

    # Chuẩn bị dữ liệu hóa đơn
    billing_data = {
        "appointment_id": appointment_id,
        "patient_id": patient_id,
        "doctor_id": doctor_id,
        "service_items": service_items,
        "total_amount": total_amount,
        "status": "PENDING"
    }

    # Thêm thông tin bảo hiểm nếu có
    if insurance_id:
        billing_data["insurance_id"] = insurance_id

        # Xác minh bảo hiểm
        verification = verify_insurance(insurance_id, "CONSULTATION", total_amount, token)
        if verification and verification.get('is_verified'):
            billing_data["insurance_coverage"] = verification.get('covered_amount', 0)
            billing_data["patient_responsibility"] = verification.get('patient_responsibility', total_amount)

    # Tạo hóa đơn
    result = create_billing(billing_data, token)

    # Gửi thông báo cho bệnh nhân
    if result:
        send_notification(
            user_id=patient_id,
            notification_type="BILLING_CREATED",
            message=f"Hóa đơn cho lịch hẹn khám bệnh của bạn đã được tạo. Tổng tiền: {total_amount:,} VND.",
            additional_data={
                "billing_id": result.get('id'),
                "appointment_id": appointment_id,
                "total_amount": total_amount
            },
            token=token
        )

    return result


def update_billing_status(billing_id, status, token=None):
    """
    Cập nhật trạng thái của hóa đơn

    Parameters:
    billing_id - int: ID hóa đơn cần cập nhật
    status - str: Trạng thái mới ('PENDING', 'PAID', 'CANCELLED', 'REFUNDED')
    """
    url = f"{BILLING_SERVICE_URL}/api/billings/{billing_id}/update-status/"
    data = {"status": status}
    return make_api_request('patch', url, data=data, token=token)


def get_billing_by_appointment(appointment_id, token=None):
    """
    Lấy thông tin hóa đơn theo ID lịch hẹn

    Parameters:
    appointment_id - int: ID lịch hẹn
    """
    url = f"{BILLING_SERVICE_URL}/api/billings/by-appointment/{appointment_id}/"
    return make_api_request('get', url, token=token)


# Tích hợp với Insurance Service

# Giả định URL của Insurance Service
INSURANCE_SERVICE_URL = get_service_url('INSURANCE_SERVICE')

def get_patient_insurance(patient_id, token=None):
    """
    Lấy thông tin bảo hiểm của bệnh nhân

    Parameters:
    patient_id - int: ID bệnh nhân
    token - str: JWT token để xác thực với Insurance Service
    """
    # Thử gọi API đến Insurance Service nếu có
    try:
        url = f"{INSURANCE_SERVICE_URL}/api/insurance-policies/?patient_id={patient_id}"
        result = make_api_request('get', url, token=token)

        if result:
            logger.info(f"Retrieved insurance policies for patient {patient_id}: {len(result)} policies")
            return result
    except Exception as e:
        logger.warning(f"Failed to retrieve insurance from service: {str(e)}. Using sample data.")

    # Nếu không có Insurance Service hoặc gọi API thất bại, trả về dữ liệu mẫu
    logger.info(f"Using sample insurance data for patient {patient_id}")

    # Giả lập dữ liệu mẫu
    sample_insurance = [
        {
            'id': 1,
            'patient_id': patient_id,
            'insurance_provider': 'Bảo hiểm y tế',
            'policy_number': f'BH{patient_id}001',
            'coverage_percent': 80,
            'expiry_date': '2025-12-31',
            'status': 'ACTIVE'
        },
        {
            'id': 2,
            'patient_id': patient_id,
            'insurance_provider': 'Bảo hiểm xã hội',
            'policy_number': f'BH{patient_id}002',
            'coverage_percent': 70,
            'expiry_date': '2024-12-31',
            'status': 'ACTIVE'
        }
    ]

    return sample_insurance


def verify_insurance(insurance_id, service_code, amount, token=None):
    """
    Xác minh bảo hiểm cho dịch vụ cụ thể

    Parameters:
    insurance_id - int: ID bảo hiểm
    service_code - str: Mã dịch vụ
    amount - float: Số tiền cần thanh toán
    token - str: JWT token để xác thực với Insurance Service
    """
    # Thử gọi API đến Insurance Service nếu có
    try:
        url = f"{INSURANCE_SERVICE_URL}/api/insurance-verification/"
        data = {
            "insurance_id": insurance_id,
            "service_code": service_code,
            "amount": amount
        }
        result = make_api_request('post', url, data=data, token=token)

        if result:
            logger.info(f"Verified insurance {insurance_id} for service {service_code}")
            return result
    except Exception as e:
        logger.warning(f"Failed to verify insurance from service: {str(e)}. Using sample data.")

    # Nếu không có Insurance Service hoặc gọi API thất bại, trả về dữ liệu mẫu
    logger.info(f"Using sample verification data for insurance {insurance_id}")

    # Giả lập kết quả xác minh
    verification_result = {
        'insurance_id': insurance_id,
        'service_code': service_code,
        'original_amount': amount,
        'coverage_percent': 80,
        'covered_amount': amount * 0.8,
        'patient_responsibility': amount * 0.2,
        'is_verified': True,
        'verification_code': f'VER{insurance_id}{service_code}',
        'verification_date': '2023-11-01T10:00:00Z'
    }

    return verification_result
