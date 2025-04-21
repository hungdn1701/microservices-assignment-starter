import requests
import logging
from django.conf import settings

logger = logging.getLogger(__name__)

class AppointmentService:
    """
    Service để giao tiếp với Appointment Service thông qua API Gateway.
    """

    @staticmethod
    def get_appointment_info(appointment_id, auth_token=None):
        """
        Lấy thông tin cuộc hẹn từ Appointment Service thông qua API Gateway.

        Args:
            appointment_id (int): ID của cuộc hẹn
            auth_token (str, optional): JWT token để xác thực

        Returns:
            dict: Thông tin cuộc hẹn hoặc None nếu có lỗi
        """
        try:
            headers = {}
            if auth_token:
                headers['Authorization'] = f'Bearer {auth_token}'

            response = requests.get(
                f"{settings.API_GATEWAY_URL}/api/appointments/{appointment_id}/",
                headers=headers
            )
            if response.status_code == 200:
                return response.json()
            logger.error(f"Failed to fetch appointment info: {response.status_code} - {response.text}")
            return None
        except Exception as e:
            logger.error(f"Error fetching appointment info: {str(e)}")
            return None

    @staticmethod
    def update_appointment_status(appointment_id, status, auth_token=None):
        """
        Cập nhật trạng thái cuộc hẹn trong Appointment Service thông qua API Gateway.

        Args:
            appointment_id (int): ID của cuộc hẹn
            status (str): Trạng thái mới của cuộc hẹn
            auth_token (str, optional): JWT token để xác thực

        Returns:
            bool: True nếu cập nhật thành công, False nếu có lỗi
        """
        try:
            headers = {'Content-Type': 'application/json'}
            if auth_token:
                headers['Authorization'] = f'Bearer {auth_token}'

            response = requests.patch(
                f"{settings.API_GATEWAY_URL}/api/appointments/{appointment_id}/",
                json={'status': status},
                headers=headers
            )
            if response.status_code in [200, 201, 204]:
                return True
            logger.error(f"Failed to update appointment status: {response.status_code} - {response.text}")
            return False
        except Exception as e:
            logger.error(f"Error updating appointment status: {str(e)}")
            return False

class UserService:
    """
    Service để giao tiếp với User Service thông qua API Gateway.
    """

    @staticmethod
    def get_user_info(user_id):
        """
        Lấy thông tin người dùng từ User Service thông qua API Gateway.

        Args:
            user_id (int): ID của người dùng

        Returns:
            dict: Thông tin người dùng hoặc None nếu có lỗi
        """
        try:
            response = requests.get(f"{settings.API_GATEWAY_URL}/api/users/{user_id}/")
            if response.status_code == 200:
                return response.json()
            logger.error(f"Failed to fetch user info: {response.status_code} - {response.text}")
            return None
        except Exception as e:
            logger.error(f"Error fetching user info: {str(e)}")
            return None

    @staticmethod
    def get_doctor_info(doctor_id):
        """
        Lấy thông tin bác sĩ từ User Service thông qua API Gateway.

        Args:
            doctor_id (int): ID của bác sĩ

        Returns:
            dict: Thông tin bác sĩ hoặc None nếu có lỗi
        """
        try:
            response = requests.get(f"{settings.API_GATEWAY_URL}/api/users/doctors/{doctor_id}/")
            if response.status_code == 200:
                return response.json()
            logger.error(f"Failed to fetch doctor info: {response.status_code} - {response.text}")
            return None
        except Exception as e:
            logger.error(f"Error fetching doctor info: {str(e)}")
            return None

    @staticmethod
    def get_patient_info(patient_id):
        """
        Lấy thông tin bệnh nhân từ User Service thông qua API Gateway.

        Args:
            patient_id (int): ID của bệnh nhân

        Returns:
            dict: Thông tin bệnh nhân hoặc None nếu có lỗi
        """
        try:
            response = requests.get(f"{settings.API_GATEWAY_URL}/api/users/patients/{patient_id}/")
            if response.status_code == 200:
                return response.json()
            logger.error(f"Failed to fetch patient info: {response.status_code} - {response.text}")
            return None
        except Exception as e:
            logger.error(f"Error fetching patient info: {str(e)}")
            return None

    @staticmethod
    def validate_user_token(token):
        """
        Xác thực token người dùng thông qua API Gateway.

        Args:
            token (str): JWT token

        Returns:
            dict: Thông tin người dùng đã xác thực hoặc None nếu token không hợp lệ
        """
        try:
            headers = {'Authorization': f'Bearer {token}'}
            response = requests.get(f"{settings.API_GATEWAY_URL}/api/auth/validate-token/", headers=headers)
            if response.status_code == 200:
                return response.json()
            logger.error(f"Failed to validate token: {response.status_code} - {response.text}")
            return None
        except Exception as e:
            logger.error(f"Error validating token: {str(e)}")
            return None

class LaboratoryService:
    """
    Service để giao tiếp với Laboratory Service thông qua API Gateway.
    """

    @staticmethod
    def get_test_type_by_code(test_code, auth_token=None):
        """
        Lấy thông tin loại xét nghiệm dựa trên mã xét nghiệm.

        Args:
            test_code (str): Mã xét nghiệm
            auth_token (str, optional): JWT token để xác thực

        Returns:
            dict: Thông tin loại xét nghiệm hoặc None nếu có lỗi
        """
        try:
            headers = {}
            if auth_token:
                headers['Authorization'] = f'Bearer {auth_token}'

            response = requests.get(
                f"{settings.API_GATEWAY_URL}/api/laboratory/test-types/?search={test_code}",
                headers=headers
            )
            if response.status_code == 200:
                data = response.json()
                if data.get('results') and len(data['results']) > 0:
                    return data['results'][0]
                return None
            logger.error(f"Failed to fetch test type: {response.status_code} - {response.text}")
            return None
        except Exception as e:
            logger.error(f"Error fetching test type: {str(e)}")
            return None

    @staticmethod
    def create_lab_test(lab_test_data, auth_token=None):
        """
        Tạo yêu cầu xét nghiệm mới trong Laboratory Service thông qua API Gateway.

        Args:
            lab_test_data (dict): Dữ liệu yêu cầu xét nghiệm
            auth_token (str, optional): JWT token để xác thực

        Returns:
            dict: Thông tin yêu cầu xét nghiệm đã tạo hoặc None nếu có lỗi
        """
        try:
            headers = {'Content-Type': 'application/json'}
            if auth_token:
                headers['Authorization'] = f'Bearer {auth_token}'

            response = requests.post(
                f"{settings.API_GATEWAY_URL}/api/laboratory/lab-tests/",
                json=lab_test_data,
                headers=headers
            )
            if response.status_code in [200, 201]:
                logger.info(f"Successfully created lab test in laboratory-service: {response.text}")
                response_data = response.json()
                logger.info(f"Response data: {response_data}")
                return response_data
            logger.error(f"Failed to create lab test: {response.status_code} - {response.text}")
            return None
        except Exception as e:
            logger.error(f"Error creating lab test: {str(e)}")
            return None

    @staticmethod
    def get_lab_test(lab_test_id, auth_token=None):
        """
        Lấy thông tin yêu cầu xét nghiệm từ Laboratory Service thông qua API Gateway.

        Args:
            lab_test_id (int): ID của yêu cầu xét nghiệm
            auth_token (str, optional): JWT token để xác thực

        Returns:
            dict: Thông tin yêu cầu xét nghiệm hoặc None nếu có lỗi
        """
        try:
            headers = {}
            if auth_token:
                headers['Authorization'] = f'Bearer {auth_token}'

            response = requests.get(
                f"{settings.API_GATEWAY_URL}/api/laboratory/lab-tests/{lab_test_id}/",
                headers=headers
            )
            if response.status_code == 200:
                return response.json()
            logger.error(f"Failed to fetch lab test: {response.status_code} - {response.text}")
            return None
        except Exception as e:
            logger.error(f"Error fetching lab test: {str(e)}")
            return None

    @staticmethod
    def update_lab_test_status(lab_test_id, status, auth_token=None):
        """
        Cập nhật trạng thái yêu cầu xét nghiệm trong Laboratory Service thông qua API Gateway.

        Args:
            lab_test_id (int): ID của yêu cầu xét nghiệm
            status (str): Trạng thái mới của yêu cầu xét nghiệm
            auth_token (str, optional): JWT token để xác thực

        Returns:
            bool: True nếu cập nhật thành công, False nếu có lỗi
        """
        try:
            headers = {'Content-Type': 'application/json'}
            if auth_token:
                headers['Authorization'] = f'Bearer {auth_token}'

            # Không cần chuyển đổi trạng thái nữa vì đã đồng bộ giữa hai service
            logger.info(f"Updating lab test status in laboratory-service: {status}")

            response = requests.patch(
                f"{settings.API_GATEWAY_URL}/api/laboratory/lab-tests/{lab_test_id}/",
                json={'status': status},
                headers=headers
            )
            if response.status_code in [200, 201, 204]:
                logger.info(f"Successfully updated lab test status in laboratory-service")
                return True
            logger.error(f"Failed to update lab test status: {response.status_code} - {response.text}")
            return False
        except Exception as e:
            logger.error(f"Error updating lab test status: {str(e)}")
            return False

    @staticmethod
    def create_test_result(result_data, auth_token=None):
        """
        Tạo kết quả xét nghiệm mới trong Laboratory Service thông qua API Gateway.

        Args:
            result_data (dict): Dữ liệu kết quả xét nghiệm
            auth_token (str, optional): JWT token để xác thực

        Returns:
            dict: Thông tin kết quả xét nghiệm đã tạo hoặc None nếu có lỗi
        """
        try:
            headers = {'Content-Type': 'application/json'}
            if auth_token:
                headers['Authorization'] = f'Bearer {auth_token}'

            response = requests.post(
                f"{settings.API_GATEWAY_URL}/api/laboratory/test-results/",
                json=result_data,
                headers=headers
            )
            if response.status_code in [200, 201]:
                return response.json()
            logger.error(f"Failed to create test result: {response.status_code} - {response.text}")
            return None
        except Exception as e:
            logger.error(f"Error creating test result: {str(e)}")
            return None

    @staticmethod
    def get_test_result(lab_test_id, auth_token=None):
        """
        Lấy kết quả xét nghiệm từ Laboratory Service thông qua API Gateway.

        Args:
            lab_test_id (int): ID của yêu cầu xét nghiệm
            auth_token (str, optional): JWT token để xác thực

        Returns:
            dict: Thông tin kết quả xét nghiệm hoặc None nếu có lỗi
        """
        try:
            headers = {}
            if auth_token:
                headers['Authorization'] = f'Bearer {auth_token}'

            response = requests.get(
                f"{settings.API_GATEWAY_URL}/api/laboratory/test-results/?lab_test={lab_test_id}",
                headers=headers
            )
            if response.status_code == 200:
                results = response.json()
                if results.get('results') and len(results['results']) > 0:
                    return results['results'][0]
                return None
            logger.error(f"Failed to fetch test result: {response.status_code} - {response.text}")
            return None
        except Exception as e:
            logger.error(f"Error fetching test result: {str(e)}")
            return None

class PharmacyService:
    """
    Service để giao tiếp với Pharmacy Service thông qua API Gateway.
    """

    @staticmethod
    def create_prescription_from_diagnosis(diagnosis_data, auth_token=None):
        """
        Tạo đơn thuốc mới từ chẩn đoán trong Pharmacy Service thông qua API Gateway.

        Args:
            diagnosis_data (dict): Dữ liệu chẩn đoán và thông tin đơn thuốc
            auth_token (str, optional): JWT token để xác thực

        Returns:
            dict: Thông tin đơn thuốc đã tạo hoặc None nếu có lỗi
        """
        try:
            headers = {'Content-Type': 'application/json'}
            if auth_token:
                headers['Authorization'] = f'Bearer {auth_token}'

            response = requests.post(
                f"{settings.API_GATEWAY_URL}/api/prescriptions/create_from_diagnosis/",
                json=diagnosis_data,
                headers=headers
            )
            if response.status_code in [200, 201]:
                logger.info(f"Successfully created prescription in pharmacy-service: {response.text}")
                return response.json()
            logger.error(f"Failed to create prescription: {response.status_code} - {response.text}")
            return None
        except Exception as e:
            logger.error(f"Error creating prescription: {str(e)}")
            return None

    @staticmethod
    def get_prescription(prescription_id, auth_token=None):
        """
        Lấy thông tin đơn thuốc từ Pharmacy Service thông qua API Gateway.

        Args:
            prescription_id (int): ID của đơn thuốc
            auth_token (str, optional): JWT token để xác thực

        Returns:
            dict: Thông tin đơn thuốc hoặc None nếu có lỗi
        """
        try:
            headers = {}
            if auth_token:
                headers['Authorization'] = f'Bearer {auth_token}'

            response = requests.get(
                f"{settings.API_GATEWAY_URL}/api/prescriptions/{prescription_id}/",
                headers=headers
            )
            if response.status_code == 200:
                return response.json()
            logger.error(f"Failed to fetch prescription: {response.status_code} - {response.text}")
            return None
        except Exception as e:
            logger.error(f"Error fetching prescription: {str(e)}")
            return None

    @staticmethod
    def get_prescriptions_by_diagnosis(diagnosis_id, auth_token=None):
        """
        Lấy danh sách đơn thuốc theo ID chẩn đoán từ Pharmacy Service.

        Args:
            diagnosis_id (int): ID của chẩn đoán
            auth_token (str, optional): JWT token để xác thực

        Returns:
            list: Danh sách đơn thuốc hoặc [] nếu có lỗi
        """
        try:
            headers = {}
            if auth_token:
                headers['Authorization'] = f'Bearer {auth_token}'

            response = requests.get(
                f"{settings.API_GATEWAY_URL}/api/prescriptions/?diagnosis_id={diagnosis_id}",
                headers=headers
            )
            if response.status_code == 200:
                data = response.json()
                return data.get('results', [])
            logger.error(f"Failed to fetch prescriptions by diagnosis: {response.status_code} - {response.text}")
            return []
        except Exception as e:
            logger.error(f"Error fetching prescriptions by diagnosis: {str(e)}")
            return []

    @staticmethod
    def get_medication_info(medication_id, auth_token=None):
        """
        Lấy thông tin thuốc từ Pharmacy Service thông qua API Gateway.

        Args:
            medication_id (int): ID của thuốc
            auth_token (str, optional): JWT token để xác thực

        Returns:
            dict: Thông tin thuốc hoặc None nếu có lỗi
        """
        try:
            headers = {}
            if auth_token:
                headers['Authorization'] = f'Bearer {auth_token}'

            response = requests.get(
                f"{settings.API_GATEWAY_URL}/api/medications/{medication_id}/",
                headers=headers
            )
            if response.status_code == 200:
                return response.json()
            logger.error(f"Failed to fetch medication info: {response.status_code} - {response.text}")
            return None
        except Exception as e:
            logger.error(f"Error fetching medication info: {str(e)}")
            return None