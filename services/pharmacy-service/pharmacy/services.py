import requests
import logging
from django.conf import settings

logger = logging.getLogger(__name__)

class MedicalRecordService:
    """
    Service để giao tiếp với Medical Record Service thông qua API Gateway.
    """

    @staticmethod
    def get_medical_record_info(medical_record_id, auth_token=None):
        """
        Lấy thông tin hồ sơ bệnh án từ Medical Record Service thông qua API Gateway.

        Args:
            medical_record_id (int): ID của hồ sơ bệnh án
            auth_token (str, optional): JWT token để xác thực

        Returns:
            dict: Thông tin hồ sơ bệnh án hoặc None nếu có lỗi
        """
        try:
            headers = {
                'X-Service-API-Key': settings.SERVICE_API_KEY,
                'X-Service-Name': settings.SERVICE_NAME
            }
            if auth_token:
                headers['Authorization'] = f'Bearer {auth_token}'

            # Sử dụng API Gateway URL để gọi đến medical-record-service
            url = f"{settings.API_GATEWAY_URL}/api/medical-records/{medical_record_id}/"
            print(f"Calling medical-record-service at: {url}")
            response = requests.get(url, headers=headers)
            if response.status_code == 200:
                return response.json()
            logger.error(f"Failed to fetch medical record info: {response.status_code} - {response.text}")
            return None
        except Exception as e:
            logger.error(f"Error fetching medical record info: {str(e)}")
            return None

    @staticmethod
    def get_diagnosis_info(diagnosis_id, auth_token=None):
        """
        Lấy thông tin chẩn đoán từ Medical Record Service thông qua API Gateway.

        Args:
            diagnosis_id (int): ID của chẩn đoán
            auth_token (str, optional): JWT token để xác thực

        Returns:
            dict: Thông tin chẩn đoán hoặc None nếu có lỗi
        """
        try:
            headers = {
                'X-Service-API-Key': settings.SERVICE_API_KEY,
                'X-Service-Name': settings.SERVICE_NAME
            }
            if auth_token:
                headers['Authorization'] = f'Bearer {auth_token}'

            # Sử dụng API Gateway URL để gọi đến medical-record-service
            url = f"{settings.API_GATEWAY_URL}/api/diagnoses/{diagnosis_id}/"
            print(f"Calling medical-record-service at: {url}")
            response = requests.get(url, headers=headers)
            if response.status_code == 200:
                return response.json()
            logger.error(f"Failed to fetch diagnosis info: {response.status_code} - {response.text}")
            return None
        except Exception as e:
            logger.error(f"Error fetching diagnosis info: {str(e)}")
            return None

    @staticmethod
    def get_encounter_info(encounter_id, auth_token=None):
        """
        Lấy thông tin cuộc gặp từ Medical Record Service thông qua API Gateway.

        Args:
            encounter_id (int): ID của cuộc gặp
            auth_token (str, optional): JWT token để xác thực

        Returns:
            dict: Thông tin cuộc gặp hoặc None nếu có lỗi
        """
        try:
            headers = {
                'X-Service-API-Key': settings.SERVICE_API_KEY,
                'X-Service-Name': settings.SERVICE_NAME
            }
            if auth_token:
                headers['Authorization'] = f'Bearer {auth_token}'

            # Sử dụng API Gateway URL để gọi đến medical-record-service
            url = f"{settings.API_GATEWAY_URL}/api/encounters/{encounter_id}/"
            print(f"Calling medical-record-service at: {url}")
            response = requests.get(url, headers=headers)
            if response.status_code == 200:
                return response.json()
            logger.error(f"Failed to fetch encounter info: {response.status_code} - {response.text}")
            return None
        except Exception as e:
            logger.error(f"Error fetching encounter info: {str(e)}")
            return None

    @staticmethod
    def update_diagnosis_prescriptions(diagnosis_id, prescription_id, auth_token=None):
        """
        Cập nhật danh sách đơn thuốc trong chẩn đoán.

        Args:
            diagnosis_id (int): ID của chẩn đoán
            prescription_id (int): ID của đơn thuốc mới
            auth_token (str, optional): JWT token để xác thực

        Returns:
            bool: True nếu cập nhật thành công, False nếu có lỗi
        """
        try:
            headers = {
                'X-Service-API-Key': settings.SERVICE_API_KEY,
                'X-Service-Name': settings.SERVICE_NAME,
                'Content-Type': 'application/json'
            }
            if auth_token:
                headers['Authorization'] = f'Bearer {auth_token}'

            # Sử dụng API Gateway URL để gọi đến medical-record-service
            url = f"{settings.API_GATEWAY_URL}/api/diagnoses/{diagnosis_id}/add_prescription/"
            print(f"Calling medical-record-service at: {url}")
            data = {
                'prescription_id': prescription_id
            }
            response = requests.post(url, json=data, headers=headers)
            if response.status_code in [200, 201]:
                return True
            logger.error(f"Failed to update diagnosis prescriptions: {response.status_code} - {response.text}")
            return False
        except Exception as e:
            logger.error(f"Error updating diagnosis prescriptions: {str(e)}")
            return False
