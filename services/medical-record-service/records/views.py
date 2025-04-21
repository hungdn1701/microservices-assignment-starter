from rest_framework import status, viewsets
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.pagination import PageNumberPagination
from rest_framework.decorators import api_view, permission_classes, authentication_classes, action
from rest_framework.exceptions import ValidationError
from django.db.models import Q
from django.shortcuts import get_object_or_404
from django.utils import timezone
import logging

logger = logging.getLogger(__name__)
from .models import (
    MedicalRecord, Encounter, Diagnosis, Treatment, Allergy,
    Immunization, MedicalHistory, Medication,
    VitalSign, LabTest, LabResult
)
from .serializers import (
    MedicalRecordSerializer, MedicalRecordSummarySerializer,
    DiagnosisSerializer, TreatmentSerializer, AllergySerializer,
    ImmunizationSerializer, MedicalHistorySerializer, MedicationSerializer,
    VitalSignSerializer, LabTestSerializer, LabResultSerializer,
    EncounterSerializer
)
from .permissions import (
    CanViewMedicalRecords, CanCreateMedicalRecord, CanUpdateMedicalRecord,
    CanDeleteMedicalRecord, CanShareMedicalRecord, IsAdmin, IsDoctor, IsNurse,
    IsPatient, IsLabTechnician, IsPharmacist, IsServiceRequest
)
from .authentication import CustomJWTAuthentication
from .services import UserService, AppointmentService

class StandardResultsSetPagination(PageNumberPagination):
    page_size = 10
    page_size_query_param = 'page_size'
    max_page_size = 100

@api_view(['POST'])
@authentication_classes([CustomJWTAuthentication])
@permission_classes([IsDoctor])
def create_encounter_from_appointment(request, appointment_id):
    """
    API endpoint để tạo Encounter từ Appointment.
    """
    # Lấy token xác thực từ request
    auth_header = request.META.get('HTTP_AUTHORIZATION')
    auth_token = None
    if auth_header and auth_header.startswith('Bearer '):
        auth_token = auth_header.split(' ')[1]

    # Lấy thông tin appointment từ appointment-service
    appointment_data = AppointmentService.get_appointment_info(appointment_id, auth_token)

    if not appointment_data:
        return Response({"detail": "Appointment not found."}, status=status.HTTP_404_NOT_FOUND)

    # Kiểm tra trạng thái appointment
    if appointment_data.get('status') != 'CONFIRMED':
        return Response({"detail": "Only confirmed appointments can be converted to encounters."}, status=status.HTTP_400_BAD_REQUEST)

    # Kiểm tra quyền của bác sĩ
    user_id = request.user.id
    doctor_id = appointment_data.get('doctor_id')

    if int(user_id) != int(doctor_id) and request.auth.get('role') != 'ADMIN':
        return Response({"detail": "You do not have permission to create an encounter for this appointment."}, status=status.HTTP_403_FORBIDDEN)

    # Lấy hoặc tạo medical record cho bệnh nhân
    patient_id = appointment_data.get('patient_id')
    medical_record = None

    try:
        medical_record = MedicalRecord.objects.get(patient_id=patient_id)
    except MedicalRecord.DoesNotExist:
        medical_record = MedicalRecord.objects.create(patient_id=patient_id)

    # Tạo encounter
    encounter_data = {
        'medical_record': medical_record.id,
        'doctor_id': doctor_id,
        'appointment_id': appointment_id,
        'encounter_date': appointment_data.get('appointment_date'),
        'chief_complaint': appointment_data.get('reason', ''),
        'encounter_type': 'OUTPATIENT',
        'notes': f"Created from appointment #{appointment_id}"
    }

    serializer = EncounterSerializer(data=encounter_data)
    if serializer.is_valid():
        encounter = serializer.save()

        # Cập nhật trạng thái appointment thành COMPLETED
        AppointmentService.update_appointment_status(appointment_id, 'COMPLETED', auth_token)

        return Response(serializer.data, status=status.HTTP_201_CREATED)

    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

# API cho Medical Record
class MedicalRecordViewSet(viewsets.ModelViewSet):
    """
    API endpoint để quản lý hồ sơ y tế.

    list: Lấy danh sách hồ sơ y tế
    retrieve: Lấy chi tiết hồ sơ y tế
    create: Tạo mới hồ sơ y tế
    update: Cập nhật hồ sơ y tế
    partial_update: Cập nhật một phần hồ sơ y tế
    destroy: Xóa hồ sơ y tế
    """
    queryset = MedicalRecord.objects.all()
    permission_classes = [IsServiceRequest | CanViewMedicalRecords]
    authentication_classes = [CustomJWTAuthentication]
    pagination_class = StandardResultsSetPagination

    def get_serializer_class(self):
        if self.action == 'list':
            return MedicalRecordSummarySerializer
        return MedicalRecordSerializer

    def get_queryset(self):
        user_role = self.request.auth.get('role', None) if self.request.auth else None
        user_id = self.request.user.id

        queryset = MedicalRecord.objects.all()

        if user_role == 'PATIENT':
            queryset = queryset.filter(patient_id=user_id)

        patient_id = self.request.query_params.get('patient_id', None)
        if patient_id is not None:
            if user_role == 'PATIENT' and int(patient_id) != user_id:
                # Không trả về lỗi ở đây, chỉ lọc theo user_id
                queryset = queryset.filter(patient_id=user_id)
            else:
                queryset = queryset.filter(patient_id=patient_id)

        search = self.request.query_params.get('search', None)
        if search is not None:
            queryset = queryset.filter(patient_id__icontains=search)

        ordering = self.request.query_params.get('ordering', '-created_at')
        if ordering:
            queryset = queryset.order_by(ordering)

        return queryset

    def retrieve(self, request, *args, **kwargs):
        instance = self.get_object()
        serializer = self.get_serializer(instance)
        data = serializer.data

        # Lấy thông tin bệnh nhân
        patient_info = UserService.get_patient_info(instance.patient_id)
        if patient_info:
            data['patient'] = {
                'id': patient_info.get('id'),
                'name': f"{patient_info.get('first_name', '')} {patient_info.get('last_name', '')}",
                'date_of_birth': patient_info.get('patient_profile', {}).get('date_of_birth', ''),
                'gender': patient_info.get('patient_profile', {}).get('gender', ''),
                'contact_number': patient_info.get('contact_number', '')
            }

        return Response(data)

    def update(self, request, *args, **kwargs):
        user_role = request.auth.get('role', None) if request.auth else None
        if user_role not in ['DOCTOR', 'ADMIN']:
            return Response({"detail": "You do not have permission to update medical records."}, status=status.HTTP_403_FORBIDDEN)

        return super().update(request, *args, **kwargs)

    def destroy(self, request, *args, **kwargs):
        user_role = request.auth.get('role', None) if request.auth else None
        if user_role != 'ADMIN':
            return Response({"detail": "You do not have permission to delete medical records."}, status=status.HTTP_403_FORBIDDEN)

        return super().destroy(request, *args, **kwargs)

    @action(detail=True, methods=['get'])
    def summary(self, request, pk=None):
        """
        Lấy tóm tắt hồ sơ y tế.
        """
        instance = self.get_object()
        serializer = MedicalRecordSummarySerializer(instance)
        return Response(serializer.data)

# API cho Diagnosis
class DiagnosisViewSet(viewsets.ModelViewSet):
    """
    API endpoint để quản lý chẩn đoán.

    list: Lấy danh sách chẩn đoán
    retrieve: Lấy chi tiết chẩn đoán
    create: Tạo mới chẩn đoán
    update: Cập nhật chẩn đoán
    partial_update: Cập nhật một phần chẩn đoán
    destroy: Xóa chẩn đoán
    """
    queryset = Diagnosis.objects.all()
    serializer_class = DiagnosisSerializer
    permission_classes = [CanViewMedicalRecords]
    authentication_classes = [CustomJWTAuthentication]
    pagination_class = StandardResultsSetPagination

    def get_queryset(self):
        user_role = self.request.auth.get('role', None) if self.request.auth else None
        user_id = self.request.user.id

        queryset = Diagnosis.objects.all()

        if user_role == 'PATIENT':
            queryset = queryset.filter(encounter__medical_record__patient_id=user_id)

        encounter_id = self.request.query_params.get('encounter_id', None)
        if encounter_id is not None:
            queryset = queryset.filter(encounter_id=encounter_id)

        search = self.request.query_params.get('search', None)
        if search is not None:
            queryset = queryset.filter(
                Q(diagnosis_code__icontains=search) |
                Q(diagnosis_description__icontains=search)
            )

        ordering = self.request.query_params.get('ordering', '-diagnosis_date')
        if ordering:
            queryset = queryset.order_by(ordering)

        return queryset

    def perform_create(self, serializer):
        user_role = self.request.auth.get('role', None) if self.request.auth else None
        user_id = self.request.user.id

        if user_role not in ['DOCTOR', 'ADMIN']:
            raise ValidationError({"detail": "You do not have permission to create diagnoses."})

        encounter_id = self.request.data.get('encounter')
        try:
            encounter = Encounter.objects.get(pk=encounter_id)
            if user_role == 'PATIENT' and encounter.medical_record.patient_id != user_id:
                raise ValidationError({"detail": "You do not have permission to add diagnoses to this medical record."})
        except Encounter.DoesNotExist:
            raise ValidationError({"detail": "Encounter not found."})

        if user_role == 'DOCTOR':
            serializer.save(doctor_id=user_id)
        elif user_role == 'ADMIN':
            doctor_id = self.request.data.get('doctor_id')
            if not doctor_id:
                raise ValidationError({"detail": "doctor_id is required for admin users."})
            serializer.save(doctor_id=doctor_id)

    def retrieve(self, request, *args, **kwargs):
        instance = self.get_object()
        serializer = self.get_serializer(instance)
        data = serializer.data

        # Lấy thông tin bác sĩ
        doctor_info = UserService.get_user_info(instance.doctor_id)
        if doctor_info:
            data['doctor'] = {
                'id': doctor_info.get('id'),
                'name': f"{doctor_info.get('first_name', '')} {doctor_info.get('last_name', '')}",
                'specialization': doctor_info.get('doctor_profile', {}).get('specialization', '')
            }

        return Response(data)

    def update(self, request, *args, **kwargs):
        user_role = request.auth.get('role', None) if request.auth else None
        if user_role not in ['DOCTOR', 'ADMIN']:
            return Response({"detail": "You do not have permission to update diagnoses."}, status=status.HTTP_403_FORBIDDEN)

        return super().update(request, *args, **kwargs)

    def destroy(self, request, *args, **kwargs):
        user_role = request.auth.get('role', None) if request.auth else None
        if user_role not in ['DOCTOR', 'ADMIN']:
            return Response({"detail": "You do not have permission to delete diagnoses."}, status=status.HTTP_403_FORBIDDEN)

        return super().destroy(request, *args, **kwargs)
    """
    API endpoint để xem, cập nhật và xóa chẩn đoán.
    """
    permission_classes = [CanViewMedicalRecords]
    authentication_classes = [CustomJWTAuthentication]

    def get_object(self, pk):
        try:
            diagnosis = Diagnosis.objects.get(pk=pk)
            user_role = self.request.auth.get('role', None) if self.request.auth else None
            user_id = self.request.user.id

            if user_role in ['DOCTOR', 'ADMIN', 'NURSE']:
                return diagnosis
            elif user_role == 'PATIENT' and diagnosis.encounter.medical_record.patient_id == user_id:
                return diagnosis
            else:
                return None
        except Diagnosis.DoesNotExist:
            return None

    def retrieve(self, request, pk=None):
        diagnosis = self.get_object(pk)
        if diagnosis is None:
            return Response({"detail": "Diagnosis not found or you do not have permission to view it."}, status=status.HTTP_404_NOT_FOUND)

        doctor_info = UserService.get_user_info(diagnosis.doctor_id)
        serializer = DiagnosisSerializer(diagnosis)
        data = serializer.data
        if doctor_info:
            data['doctor'] = {
                'id': doctor_info.get('id'),
                'name': f"{doctor_info.get('first_name', '')} {doctor_info.get('last_name', '')}",
                'specialization': doctor_info.get('doctor_profile', {}).get('specialization', '')
            }

        return Response(data)

    def update(self, request, pk=None):
        diagnosis = self.get_object(pk)
        if diagnosis is None:
            return Response({"detail": "Diagnosis not found or you do not have permission to update it."}, status=status.HTTP_404_NOT_FOUND)

        user_role = request.auth.get('role', None) if request.auth else None
        if user_role not in ['DOCTOR', 'ADMIN']:
            return Response({"detail": "You do not have permission to update diagnoses."}, status=status.HTTP_403_FORBIDDEN)

        serializer = DiagnosisSerializer(diagnosis, data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def destroy(self, request, pk=None):
        diagnosis = self.get_object(pk)
        if diagnosis is None:
            return Response({"detail": "Diagnosis not found or you do not have permission to delete it."}, status=status.HTTP_404_NOT_FOUND)

        user_role = request.auth.get('role', None) if request.auth else None
        if user_role not in ['DOCTOR', 'ADMIN']:
            return Response({"detail": "You do not have permission to delete diagnoses."}, status=status.HTTP_403_FORBIDDEN)

        diagnosis.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)

    @action(detail=True, methods=['post'])
    def add_prescription(self, request, pk):
        """
        Thêm ID đơn thuốc vào danh sách đơn thuốc của chẩn đoán.
        """
        diagnosis = self.get_object(pk)
        if diagnosis is None:
            return Response({"detail": "Diagnosis not found or you do not have permission to update it."}, status=status.HTTP_404_NOT_FOUND)

        prescription_id = request.data.get('prescription_id')
        if not prescription_id:
            return Response({"detail": "prescription_id is required."}, status=status.HTTP_400_BAD_REQUEST)

        # Lấy danh sách đơn thuốc hiện tại
        prescription_ids = diagnosis.prescription_ids or []

        # Thêm ID đơn thuốc mới nếu chưa tồn tại
        if prescription_id not in prescription_ids:
            prescription_ids.append(prescription_id)
            diagnosis.prescription_ids = prescription_ids
            diagnosis.save(update_fields=['prescription_ids'])

        serializer = DiagnosisSerializer(diagnosis)
        return Response(serializer.data)

    @action(detail=True, methods=['post'])
    def create_prescription(self, request, pk):
        """
        Tạo đơn thuốc mới từ chẩn đoán và gửi đến pharmacy-service.
        """
        diagnosis = self.get_object(pk)
        if diagnosis is None:
            return Response({"detail": "Diagnosis not found or you do not have permission to update it."}, status=status.HTTP_404_NOT_FOUND)

        user_role = request.auth.get('role', None) if request.auth else None
        user_id = request.user.id

        if user_role not in ['DOCTOR', 'ADMIN']:
            return Response({"detail": "You do not have permission to create prescriptions."}, status=status.HTTP_403_FORBIDDEN)

        # Lấy thông tin bệnh nhân từ encounter
        encounter = diagnosis.encounter
        medical_record = encounter.medical_record
        patient_id = medical_record.patient_id

        # Chuẩn bị dữ liệu cho đơn thuốc
        prescription_data = {
            'diagnosis_id': diagnosis.id,
            'encounter_id': encounter.id,
            'patient_id': patient_id,
            'doctor_id': diagnosis.doctor_id,
            'diagnosis_code': diagnosis.diagnosis_code,
            'diagnosis_description': diagnosis.diagnosis_description,
            'notes': request.data.get('notes', ''),
            'items': request.data.get('items', [])
        }

        # Lấy token xác thực từ request
        auth_token = request.META.get('HTTP_AUTHORIZATION', '').replace('Bearer ', '') if 'HTTP_AUTHORIZATION' in request.META else None

        # Gọi API đến pharmacy-service
        from .services import PharmacyService
        prescription = PharmacyService.create_prescription_from_diagnosis(prescription_data, auth_token)

        if prescription:
            # Thêm ID đơn thuốc vào danh sách đơn thuốc của chẩn đoán
            prescription_id = prescription.get('id')
            prescription_ids = diagnosis.prescription_ids or []
            if prescription_id not in prescription_ids:
                prescription_ids.append(prescription_id)
                diagnosis.prescription_ids = prescription_ids
                diagnosis.save(update_fields=['prescription_ids'])

            return Response({
                'message': 'Prescription created successfully',
                'prescription': prescription,
                'diagnosis': DiagnosisSerializer(diagnosis).data
            }, status=status.HTTP_201_CREATED)
        else:
            return Response({"detail": "Failed to create prescription."}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    @action(detail=True, methods=['get'])
    def prescriptions(self, request, pk):
        """
        Lấy danh sách đơn thuốc của chẩn đoán từ pharmacy-service.
        """
        diagnosis = self.get_object(pk)
        if diagnosis is None:
            return Response({"detail": "Diagnosis not found or you do not have permission to view it."}, status=status.HTTP_404_NOT_FOUND)

        # Lấy token xác thực từ request
        auth_token = request.META.get('HTTP_AUTHORIZATION', '').replace('Bearer ', '') if 'HTTP_AUTHORIZATION' in request.META else None

        # Gọi API đến pharmacy-service
        from .services import PharmacyService
        prescriptions = PharmacyService.get_prescriptions_by_diagnosis(diagnosis.id, auth_token)

        return Response(prescriptions)

# API cho Treatment
class TreatmentListCreateAPIView(APIView):
    """
    API endpoint để lấy danh sách và tạo mới điều trị.
    """
    permission_classes = [CanViewMedicalRecords]
    authentication_classes = [CustomJWTAuthentication]
    pagination_class = StandardResultsSetPagination

    def get(self, request):
        user_role = request.auth.get('role', None) if request.auth else None
        user_id = request.user.id

        queryset = Treatment.objects.all()

        if user_role == 'PATIENT':
            queryset = queryset.filter(diagnosis__encounter__medical_record__patient_id=user_id)

        diagnosis_id = request.query_params.get('diagnosis_id', None)
        if diagnosis_id is not None:
            queryset = queryset.filter(diagnosis_id=diagnosis_id)

        search = request.query_params.get('search', None)
        if search is not None:
            queryset = queryset.filter(
                Q(treatment_type__icontains=search) |
                Q(treatment_description__icontains=search)
            )

        ordering = request.query_params.get('ordering', '-start_date')
        if ordering:
            queryset = queryset.order_by(ordering)

        paginator = self.pagination_class()
        page = paginator.paginate_queryset(queryset, request)

        if page is not None:
            serializer = TreatmentSerializer(page, many=True)
            return paginator.get_paginated_response(serializer.data)

        serializer = TreatmentSerializer(queryset, many=True)
        return Response(serializer.data)

    def post(self, request):
        serializer = TreatmentSerializer(data=request.data)
        if serializer.is_valid():
            user_role = request.auth.get('role', None) if request.auth else None
            user_id = request.user.id

            if user_role not in ['DOCTOR', 'ADMIN']:
                return Response({"detail": "You do not have permission to create treatments."}, status=status.HTTP_403_FORBIDDEN)

            diagnosis_id = request.data.get('diagnosis')
            try:
                diagnosis = Diagnosis.objects.get(pk=diagnosis_id)
                if user_role == 'PATIENT' and diagnosis.encounter.medical_record.patient_id != user_id:
                    return Response({"detail": "You do not have permission to add treatments to this diagnosis."}, status=status.HTTP_403_FORBIDDEN)
            except Diagnosis.DoesNotExist:
                return Response({"detail": "Diagnosis not found."}, status=status.HTTP_404_NOT_FOUND)

            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class TreatmentDetailAPIView(APIView):
    """
    API endpoint để xem, cập nhật và xóa điều trị.
    """
    permission_classes = [CanViewMedicalRecords]
    authentication_classes = [CustomJWTAuthentication]

    def get_object(self, pk):
        try:
            treatment = Treatment.objects.get(pk=pk)
            user_role = self.request.auth.get('role', None) if self.request.auth else None
            user_id = self.request.user.id

            if user_role in ['DOCTOR', 'ADMIN', 'NURSE']:
                return treatment
            elif user_role == 'PATIENT' and treatment.diagnosis.encounter.medical_record.patient_id == user_id:
                return treatment
            else:
                return None
        except Treatment.DoesNotExist:
            return None

    def get(self, request, pk):
        treatment = self.get_object(pk)
        if treatment is None:
            return Response({"detail": "Treatment not found or you do not have permission to view it."}, status=status.HTTP_404_NOT_FOUND)

        serializer = TreatmentSerializer(treatment)
        return Response(serializer.data)

    def put(self, request, pk):
        treatment = self.get_object(pk)
        if treatment is None:
            return Response({"detail": "Treatment not found or you do not have permission to update it."}, status=status.HTTP_404_NOT_FOUND)

        user_role = request.auth.get('role', None) if request.auth else None
        if user_role not in ['DOCTOR', 'ADMIN']:
            return Response({"detail": "You do not have permission to update treatments."}, status=status.HTTP_403_FORBIDDEN)

        serializer = TreatmentSerializer(treatment, data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def delete(self, request, pk):
        treatment = self.get_object(pk)
        if treatment is None:
            return Response({"detail": "Treatment not found or you do not have permission to delete it."}, status=status.HTTP_404_NOT_FOUND)

        user_role = request.auth.get('role', None) if request.auth else None
        if user_role not in ['DOCTOR', 'ADMIN']:
            return Response({"detail": "You do not have permission to delete treatments."}, status=status.HTTP_403_FORBIDDEN)

        treatment.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)

# API cho Allergy
class AllergyListCreateAPIView(APIView):
    """
    API endpoint để lấy danh sách và tạo mới dị ứng.
    """
    permission_classes = [CanViewMedicalRecords]
    authentication_classes = [CustomJWTAuthentication]
    pagination_class = StandardResultsSetPagination

    def get(self, request):
        user_role = request.auth.get('role', None) if request.auth else None
        user_id = request.user.id

        queryset = Allergy.objects.all()

        if user_role == 'PATIENT':
            queryset = queryset.filter(medical_record__patient_id=user_id)

        medical_record_id = request.query_params.get('medical_record_id', None)
        if medical_record_id is not None:
            queryset = queryset.filter(medical_record_id=medical_record_id)

        search = request.query_params.get('search', None)
        if search is not None:
            queryset = queryset.filter(
                Q(allergy_type__icontains=search) |
                Q(allergy_name__icontains=search)
            )

        ordering = request.query_params.get('ordering', '-created_at')
        if ordering:
            queryset = queryset.order_by(ordering)

        paginator = self.pagination_class()
        page = paginator.paginate_queryset(queryset, request)

        if page is not None:
            serializer = AllergySerializer(page, many=True)
            return paginator.get_paginated_response(serializer.data)

        serializer = AllergySerializer(queryset, many=True)
        return Response(serializer.data)

    def post(self, request):
        serializer = AllergySerializer(data=request.data)
        if serializer.is_valid():
            user_role = request.auth.get('role', None) if request.auth else None
            user_id = request.user.id

            if user_role not in ['DOCTOR', 'ADMIN']:
                return Response({"detail": "You do not have permission to create allergies."}, status=status.HTTP_403_FORBIDDEN)

            medical_record_id = request.data.get('medical_record')
            try:
                medical_record = MedicalRecord.objects.get(pk=medical_record_id)
                if user_role == 'PATIENT' and medical_record.patient_id != user_id:
                    return Response({"detail": "You do not have permission to add allergies to this medical record."}, status=status.HTTP_403_FORBIDDEN)
            except MedicalRecord.DoesNotExist:
                return Response({"detail": "Medical record not found."}, status=status.HTTP_404_NOT_FOUND)

            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class AllergyDetailAPIView(APIView):
    """
    API endpoint để xem, cập nhật và xóa dị ứng.
    """
    permission_classes = [CanViewMedicalRecords]
    authentication_classes = [CustomJWTAuthentication]

    def get_object(self, pk):
        try:
            allergy = Allergy.objects.get(pk=pk)
            user_role = self.request.auth.get('role', None) if self.request.auth else None
            user_id = self.request.user.id

            if user_role in ['DOCTOR', 'ADMIN', 'NURSE']:
                return allergy
            elif user_role == 'PATIENT' and allergy.medical_record.patient_id == user_id:
                return allergy
            else:
                return None
        except Allergy.DoesNotExist:
            return None

    def get(self, request, pk):
        allergy = self.get_object(pk)
        if allergy is None:
            return Response({"detail": "Allergy not found or you do not have permission to view it."}, status=status.HTTP_404_NOT_FOUND)

        serializer = AllergySerializer(allergy)
        return Response(serializer.data)

    def put(self, request, pk):
        allergy = self.get_object(pk)
        if allergy is None:
            return Response({"detail": "Allergy not found or you do not have permission to update it."}, status=status.HTTP_404_NOT_FOUND)

        user_role = request.auth.get('role', None) if request.auth else None
        if user_role not in ['DOCTOR', 'ADMIN']:
            return Response({"detail": "You do not have permission to update allergies."}, status=status.HTTP_403_FORBIDDEN)

        serializer = AllergySerializer(allergy, data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def delete(self, request, pk):
        allergy = self.get_object(pk)
        if allergy is None:
            return Response({"detail": "Allergy not found or you do not have permission to delete it."}, status=status.HTTP_404_NOT_FOUND)

        user_role = request.auth.get('role', None) if request.auth else None
        if user_role not in ['DOCTOR', 'ADMIN']:
            return Response({"detail": "You do not have permission to delete allergies."}, status=status.HTTP_403_FORBIDDEN)

        allergy.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)

# API cho Immunization
class ImmunizationListCreateAPIView(APIView):
    """
    API endpoint để lấy danh sách và tạo mới tiêm chủng.
    """
    permission_classes = [CanViewMedicalRecords]
    authentication_classes = [CustomJWTAuthentication]
    pagination_class = StandardResultsSetPagination

    def get(self, request):
        user_role = request.auth.get('role', None) if request.auth else None
        user_id = request.user.id

        queryset = Immunization.objects.all()

        if user_role == 'PATIENT':
            queryset = queryset.filter(encounter__medical_record__patient_id=user_id)

        encounter_id = request.query_params.get('encounter_id', None)
        if encounter_id is not None:
            queryset = queryset.filter(encounter_id=encounter_id)

        search = request.query_params.get('search', None)
        if search is not None:
            queryset = queryset.filter(vaccine_name__icontains=search)

        ordering = request.query_params.get('ordering', '-administration_date')
        if ordering:
            queryset = queryset.order_by(ordering)

        paginator = self.pagination_class()
        page = paginator.paginate_queryset(queryset, request)

        if page is not None:
            serializer = ImmunizationSerializer(page, many=True)
            return paginator.get_paginated_response(serializer.data)

        serializer = ImmunizationSerializer(queryset, many=True)
        return Response(serializer.data)

    def post(self, request):
        serializer = ImmunizationSerializer(data=request.data)
        if serializer.is_valid():
            user_role = request.auth.get('role', None) if request.auth else None
            user_id = request.user.id

            if user_role not in ['DOCTOR', 'NURSE', 'ADMIN']:
                return Response({"detail": "You do not have permission to create immunizations."}, status=status.HTTP_403_FORBIDDEN)

            encounter_id = request.data.get('encounter')
            try:
                from .models import Encounter
                encounter = Encounter.objects.get(pk=encounter_id)
                if user_role == 'PATIENT' and encounter.medical_record.patient_id != user_id:
                    return Response({"detail": "You do not have permission to add immunizations to this medical record."}, status=status.HTTP_403_FORBIDDEN)
            except Encounter.DoesNotExist:
                return Response({"detail": "Encounter not found."}, status=status.HTTP_404_NOT_FOUND)

            serializer.save(administered_by=user_id)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class ImmunizationDetailAPIView(APIView):
    """
    API endpoint để xem, cập nhật và xóa tiêm chủng.
    """
    permission_classes = [CanViewMedicalRecords]
    authentication_classes = [CustomJWTAuthentication]

    def get_object(self, pk):
        try:
            immunization = Immunization.objects.get(pk=pk)
            user_role = self.request.auth.get('role', None) if self.request.auth else None
            user_id = self.request.user.id

            if user_role in ['DOCTOR', 'ADMIN', 'NURSE']:
                return immunization
            elif user_role == 'PATIENT' and immunization.encounter.medical_record.patient_id == user_id:
                return immunization
            else:
                return None
        except Immunization.DoesNotExist:
            return None

    def get(self, request, pk):
        immunization = self.get_object(pk)
        if immunization is None:
            return Response({"detail": "Immunization not found or you do not have permission to view it."}, status=status.HTTP_404_NOT_FOUND)

        serializer = ImmunizationSerializer(immunization)
        return Response(serializer.data)

    def put(self, request, pk):
        immunization = self.get_object(pk)
        if immunization is None:
            return Response({"detail": "Immunization not found or you do not have permission to update it."}, status=status.HTTP_404_NOT_FOUND)

        user_role = request.auth.get('role', None) if request.auth else None
        if user_role not in ['DOCTOR', 'NURSE', 'ADMIN']:
            return Response({"detail": "You do not have permission to update immunizations."}, status=status.HTTP_403_FORBIDDEN)

        serializer = ImmunizationSerializer(immunization, data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def delete(self, request, pk):
        immunization = self.get_object(pk)
        if immunization is None:
            return Response({"detail": "Immunization not found or you do not have permission to delete it."}, status=status.HTTP_404_NOT_FOUND)

        user_role = request.auth.get('role', None) if request.auth else None
        if user_role not in ['DOCTOR', 'ADMIN']:
            return Response({"detail": "You do not have permission to delete immunizations."}, status=status.HTTP_403_FORBIDDEN)

        immunization.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)

# API cho Medical History
class MedicalHistoryListCreateAPIView(APIView):
    """
    API endpoint để lấy danh sách và tạo mới lịch sử bệnh án.
    """
    permission_classes = [CanViewMedicalRecords]
    authentication_classes = [CustomJWTAuthentication]
    pagination_class = StandardResultsSetPagination

    def get(self, request):
        user_role = request.auth.get('role', None) if request.auth else None
        user_id = request.user.id

        queryset = MedicalHistory.objects.all()

        if user_role == 'PATIENT':
            queryset = queryset.filter(medical_record__patient_id=user_id)

        medical_record_id = request.query_params.get('medical_record_id', None)
        if medical_record_id is not None:
            queryset = queryset.filter(medical_record_id=medical_record_id)

        search = request.query_params.get('search', None)
        if search is not None:
            queryset = queryset.filter(condition_name__icontains=search)

        ordering = request.query_params.get('ordering', '-diagnosis_date')
        if ordering:
            queryset = queryset.order_by(ordering)

        paginator = self.pagination_class()
        page = paginator.paginate_queryset(queryset, request)

        if page is not None:
            serializer = MedicalHistorySerializer(page, many=True)
            return paginator.get_paginated_response(serializer.data)

        serializer = MedicalHistorySerializer(queryset, many=True)
        return Response(serializer.data)

    def post(self, request):
        serializer = MedicalHistorySerializer(data=request.data)
        if serializer.is_valid():
            user_role = request.auth.get('role', None) if request.auth else None
            user_id = request.user.id

            if user_role not in ['DOCTOR', 'ADMIN']:
                return Response({"detail": "You do not have permission to create medical histories."}, status=status.HTTP_403_FORBIDDEN)

            medical_record_id = request.data.get('medical_record')
            try:
                medical_record = MedicalRecord.objects.get(pk=medical_record_id)
                if user_role == 'PATIENT' and medical_record.patient_id != user_id:
                    return Response({"detail": "You do not have permission to add medical histories to this medical record."}, status=status.HTTP_403_FORBIDDEN)
            except MedicalRecord.DoesNotExist:
                return Response({"detail": "Medical record not found."}, status=status.HTTP_404_NOT_FOUND)

            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class MedicalHistoryDetailAPIView(APIView):
    """
    API endpoint để xem, cập nhật và xóa lịch sử bệnh án.
    """
    permission_classes = [CanViewMedicalRecords]
    authentication_classes = [CustomJWTAuthentication]

    def get_object(self, pk):
        try:
            medical_history = MedicalHistory.objects.get(pk=pk)
            user_role = self.request.auth.get('role', None) if self.request.auth else None
            user_id = self.request.user.id

            if user_role in ['DOCTOR', 'ADMIN', 'NURSE']:
                return medical_history
            elif user_role == 'PATIENT' and medical_history.medical_record.patient_id == user_id:
                return medical_history
            else:
                return None
        except MedicalHistory.DoesNotExist:
            return None

    def get(self, request, pk):
        medical_history = self.get_object(pk)
        if medical_history is None:
            return Response({"detail": "Medical history not found or you do not have permission to view it."}, status=status.HTTP_404_NOT_FOUND)

        serializer = MedicalHistorySerializer(medical_history)
        return Response(serializer.data)

    def put(self, request, pk):
        medical_history = self.get_object(pk)
        if medical_history is None:
            return Response({"detail": "Medical history not found or you do not have permission to update it."}, status=status.HTTP_404_NOT_FOUND)

        user_role = request.auth.get('role', None) if request.auth else None
        if user_role not in ['DOCTOR', 'ADMIN']:
            return Response({"detail": "You do not have permission to update medical histories."}, status=status.HTTP_403_FORBIDDEN)

        serializer = MedicalHistorySerializer(medical_history, data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def delete(self, request, pk):
        medical_history = self.get_object(pk)
        if medical_history is None:
            return Response({"detail": "Medical history not found or you do not have permission to delete it."}, status=status.HTTP_404_NOT_FOUND)

        user_role = request.auth.get('role', None) if request.auth else None
        if user_role not in ['DOCTOR', 'ADMIN']:
            return Response({"detail": "You do not have permission to delete medical histories."}, status=status.HTTP_403_FORBIDDEN)

        medical_history.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)

# API cho Medication
class MedicationListCreateAPIView(APIView):
    """
    API endpoint để lấy danh sách và tạo mới thuốc.
    """
    permission_classes = [CanViewMedicalRecords]
    authentication_classes = [CustomJWTAuthentication]
    pagination_class = StandardResultsSetPagination

    def get(self, request):
        user_role = request.auth.get('role', None) if request.auth else None
        user_id = request.user.id

        queryset = Medication.objects.all()

        if user_role == 'PATIENT':
            queryset = queryset.filter(encounter__medical_record__patient_id=user_id)

        encounter_id = request.query_params.get('encounter_id', None)
        if encounter_id is not None:
            queryset = queryset.filter(encounter_id=encounter_id)

        search = request.query_params.get('search', None)
        if search is not None:
            queryset = queryset.filter(
                Q(medication_name__icontains=search) |
                Q(dosage__icontains=search)
            )

        ordering = request.query_params.get('ordering', '-start_date')
        if ordering:
            queryset = queryset.order_by(ordering)

        paginator = self.pagination_class()
        page = paginator.paginate_queryset(queryset, request)

        if page is not None:
            serializer = MedicationSerializer(page, many=True)
            return paginator.get_paginated_response(serializer.data)

        serializer = MedicationSerializer(queryset, many=True)
        return Response(serializer.data)

    def post(self, request):
        serializer = MedicationSerializer(data=request.data)
        if serializer.is_valid():
            user_role = request.auth.get('role', None) if request.auth else None
            user_id = request.user.id

            if user_role not in ['DOCTOR', 'ADMIN']:
                return Response({"detail": "You do not have permission to create medications."}, status=status.HTTP_403_FORBIDDEN)

            encounter_id = request.data.get('encounter')
            try:
                from .models import Encounter
                encounter = Encounter.objects.get(pk=encounter_id)
                if user_role == 'PATIENT' and encounter.medical_record.patient_id != user_id:
                    return Response({"detail": "You do not have permission to add medications to this medical record."}, status=status.HTTP_403_FORBIDDEN)
            except Encounter.DoesNotExist:
                return Response({"detail": "Encounter not found."}, status=status.HTTP_404_NOT_FOUND)

            serializer.save(prescribed_by=user_id)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class MedicationDetailAPIView(APIView):
    """
    API endpoint để xem, cập nhật và xóa thuốc.
    """
    permission_classes = [CanViewMedicalRecords]
    authentication_classes = [CustomJWTAuthentication]

    def get_object(self, pk):
        try:
            medication = Medication.objects.get(pk=pk)
            user_role = self.request.auth.get('role', None) if self.request.auth else None
            user_id = self.request.user.id

            if user_role in ['DOCTOR', 'ADMIN', 'NURSE']:
                return medication
            elif user_role == 'PATIENT' and medication.encounter.medical_record.patient_id == user_id:
                return medication
            else:
                return None
        except Medication.DoesNotExist:
            return None

    def get(self, request, pk):
        medication = self.get_object(pk)
        if medication is None:
            return Response({"detail": "Medication not found or you do not have permission to view it."}, status=status.HTTP_404_NOT_FOUND)

        serializer = MedicationSerializer(medication)
        return Response(serializer.data)

    def put(self, request, pk):
        medication = self.get_object(pk)
        if medication is None:
            return Response({"detail": "Medication not found or you do not have permission to update it."}, status=status.HTTP_404_NOT_FOUND)

        user_role = request.auth.get('role', None) if request.auth else None
        if user_role not in ['DOCTOR', 'ADMIN']:
            return Response({"detail": "You do not have permission to update medications."}, status=status.HTTP_403_FORBIDDEN)

        serializer = MedicationSerializer(medication, data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def delete(self, request, pk):
        medication = self.get_object(pk)
        if medication is None:
            return Response({"detail": "Medication not found or you do not have permission to delete it."}, status=status.HTTP_404_NOT_FOUND)

        user_role = request.auth.get('role', None) if request.auth else None
        if user_role not in ['DOCTOR', 'ADMIN']:
            return Response({"detail": "You do not have permission to delete medications."}, status=status.HTTP_403_FORBIDDEN)

        medication.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)

# API cho Vital Sign
class VitalSignListCreateAPIView(APIView):
    """
    API endpoint để lấy danh sách và tạo mới dấu hiệu sinh tồn.
    """
    permission_classes = [CanViewMedicalRecords]
    authentication_classes = [CustomJWTAuthentication]
    pagination_class = StandardResultsSetPagination

    def get(self, request):
        user_role = request.auth.get('role', None) if request.auth else None
        user_id = request.user.id

        queryset = VitalSign.objects.all()

        if user_role == 'PATIENT':
            queryset = queryset.filter(encounter__medical_record__patient_id=user_id)

        encounter_id = request.query_params.get('encounter_id', None)
        if encounter_id is not None:
            queryset = queryset.filter(encounter_id=encounter_id)

        search = request.query_params.get('search', None)
        if search is not None:
            queryset = queryset.filter(vital_type__icontains=search)

        ordering = request.query_params.get('ordering', '-recorded_at')
        if ordering:
            queryset = queryset.order_by(ordering)

        paginator = self.pagination_class()
        page = paginator.paginate_queryset(queryset, request)

        if page is not None:
            serializer = VitalSignSerializer(page, many=True)
            return paginator.get_paginated_response(serializer.data)

        serializer = VitalSignSerializer(queryset, many=True)
        return Response(serializer.data)

    def post(self, request):
        serializer = VitalSignSerializer(data=request.data)
        if serializer.is_valid():
            user_role = request.auth.get('role', None) if request.auth else None
            user_id = request.user.id

            if user_role not in ['DOCTOR', 'NURSE', 'ADMIN']:
                return Response({"detail": "You do not have permission to create vital signs."}, status=status.HTTP_403_FORBIDDEN)

            encounter_id = request.data.get('encounter')
            try:
                from .models import Encounter
                encounter = Encounter.objects.get(pk=encounter_id)
                if user_role == 'PATIENT' and encounter.medical_record.patient_id != user_id:
                    return Response({"detail": "You do not have permission to add vital signs to this medical record."}, status=status.HTTP_403_FORBIDDEN)
            except Encounter.DoesNotExist:
                return Response({"detail": "Encounter not found."}, status=status.HTTP_404_NOT_FOUND)

            serializer.save(recorded_by=user_id, recorded_at=timezone.now())
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class VitalSignDetailAPIView(APIView):
    """
    API endpoint để xem, cập nhật và xóa dấu hiệu sinh tồn.
    """
    permission_classes = [CanViewMedicalRecords]
    authentication_classes = [CustomJWTAuthentication]

    def get_object(self, pk):
        try:
            vital_sign = VitalSign.objects.get(pk=pk)
            user_role = self.request.auth.get('role', None) if self.request.auth else None
            user_id = self.request.user.id

            if user_role in ['DOCTOR', 'ADMIN', 'NURSE']:
                return vital_sign
            elif user_role == 'PATIENT' and vital_sign.encounter.medical_record.patient_id == user_id:
                return vital_sign
            else:
                return None
        except VitalSign.DoesNotExist:
            return None

    def get(self, request, pk):
        vital_sign = self.get_object(pk)
        if vital_sign is None:
            return Response({"detail": "Vital sign not found or you do not have permission to view it."}, status=status.HTTP_404_NOT_FOUND)

        serializer = VitalSignSerializer(vital_sign)
        return Response(serializer.data)

    def put(self, request, pk):
        vital_sign = self.get_object(pk)
        if vital_sign is None:
            return Response({"detail": "Vital sign not found or you do not have permission to update it."}, status=status.HTTP_404_NOT_FOUND)

        user_role = request.auth.get('role', None) if request.auth else None
        if user_role not in ['DOCTOR', 'NURSE', 'ADMIN']:
            return Response({"detail": "You do not have permission to update vital signs."}, status=status.HTTP_403_FORBIDDEN)

        serializer = VitalSignSerializer(vital_sign, data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def delete(self, request, pk):
        vital_sign = self.get_object(pk)
        if vital_sign is None:
            return Response({"detail": "Vital sign not found or you do not have permission to delete it."}, status=status.HTTP_404_NOT_FOUND)

        user_role = request.auth.get('role', None) if request.auth else None
        if user_role not in ['DOCTOR', 'ADMIN']:
            return Response({"detail": "You do not have permission to delete vital signs."}, status=status.HTTP_403_FORBIDDEN)

        vital_sign.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)

# API cho Lab Test
class LabTestListCreateAPIView(APIView):
    """
    API endpoint để lấy danh sách và tạo mới xét nghiệm.
    """
    permission_classes = [CanViewMedicalRecords]
    authentication_classes = [CustomJWTAuthentication]
    pagination_class = StandardResultsSetPagination

    def get(self, request):
        user_role = request.auth.get('role', None) if request.auth else None
        user_id = request.user.id

        queryset = LabTest.objects.all()

        if user_role == 'PATIENT':
            queryset = queryset.filter(encounter__medical_record__patient_id=user_id)

        encounter_id = request.query_params.get('encounter_id', None)
        if encounter_id is not None:
            queryset = queryset.filter(encounter_id=encounter_id)

        search = request.query_params.get('search', None)
        if search is not None:
            queryset = queryset.filter(
                Q(test_name__icontains=search) |
                Q(test_code__icontains=search)
            )

        ordering = request.query_params.get('ordering', '-ordered_at')
        if ordering:
            queryset = queryset.order_by(ordering)

        paginator = self.pagination_class()
        page = paginator.paginate_queryset(queryset, request)

        if page is not None:
            serializer = LabTestSerializer(page, many=True)
            return paginator.get_paginated_response(serializer.data)

        serializer = LabTestSerializer(queryset, many=True)
        return Response(serializer.data)

    def post(self, request):
        serializer = LabTestSerializer(data=request.data)
        if serializer.is_valid():
            user_role = request.auth.get('role', None) if request.auth else None
            user_id = request.user.id

            if user_role not in ['DOCTOR', 'ADMIN']:
                return Response({"detail": "You do not have permission to create lab tests."}, status=status.HTTP_403_FORBIDDEN)

            encounter_id = request.data.get('encounter')
            try:
                from .models import Encounter
                encounter = Encounter.objects.get(pk=encounter_id)
                if user_role == 'PATIENT' and encounter.medical_record.patient_id != user_id:
                    return Response({"detail": "You do not have permission to add lab tests to this medical record."}, status=status.HTTP_403_FORBIDDEN)
            except Encounter.DoesNotExist:
                return Response({"detail": "Encounter not found."}, status=status.HTTP_404_NOT_FOUND)

            # Lưu yêu cầu xét nghiệm trong medical-record-service
            lab_test = serializer.save(ordered_by=user_id, ordered_at=timezone.now())

            # Đồng bộ với laboratory-service
            from .services import LaboratoryService
            auth_token = request.META.get('HTTP_AUTHORIZATION', '').replace('Bearer ', '') if 'HTTP_AUTHORIZATION' in request.META else None

            # Lấy thông tin test_type dựa trên test_code
            test_type_id = 1  # Mặc định là loại xét nghiệm đầu tiên

            # Nếu có test_code, thử tìm test_type tương ứng
            if lab_test.test_code:
                test_type = LaboratoryService.get_test_type_by_code(lab_test.test_code, auth_token)
                if test_type:
                    test_type_id = test_type.get('id')

            # Tạo dữ liệu cho laboratory-service
            lab_test_data = {
                'patient_id': encounter.medical_record.patient_id,
                'doctor_id': user_id,
                'test_type': test_type_id,
                'notes': lab_test.notes,
                'scheduled_date': lab_test.ordered_at.isoformat()
            }

            # Gọi API đến laboratory-service
            lab_service_response = LaboratoryService.create_lab_test(lab_test_data, auth_token)

            # Log response
            import logging
            logger = logging.getLogger(__name__)
            logger.info(f"Laboratory service response: {lab_service_response}")

            # Cập nhật trường lab_service_id trong LabTest
            if lab_service_response:
                lab_test.lab_service_id = lab_service_response.get('id')
                lab_test.save(update_fields=['lab_service_id'])
                logger.info(f"Updated lab_test with lab_service_id: {lab_service_response.get('id')}")

            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class LabTestDetailAPIView(APIView):
    """
    API endpoint để xem, cập nhật và xóa xét nghiệm.
    """
    permission_classes = [CanViewMedicalRecords]
    authentication_classes = [CustomJWTAuthentication]

    def get_object(self, pk):
        try:
            lab_test = LabTest.objects.get(pk=pk)
            user_role = self.request.auth.get('role', None) if self.request.auth else None
            user_id = self.request.user.id

            if user_role in ['DOCTOR', 'ADMIN', 'NURSE']:
                return lab_test
            elif user_role == 'PATIENT' and lab_test.encounter.medical_record.patient_id == user_id:
                return lab_test
            else:
                return None
        except LabTest.DoesNotExist:
            return None

    def get(self, request, pk):
        lab_test = self.get_object(pk)
        if lab_test is None:
            return Response({"detail": "Lab test not found or you do not have permission to view it."}, status=status.HTTP_404_NOT_FOUND)

        serializer = LabTestSerializer(lab_test)
        return Response(serializer.data)

    def put(self, request, pk):
        lab_test = self.get_object(pk)
        if lab_test is None:
            return Response({"detail": "Lab test not found or you do not have permission to update it."}, status=status.HTTP_404_NOT_FOUND)

        user_role = request.auth.get('role', None) if request.auth else None
        if user_role not in ['DOCTOR', 'LAB_TECHNICIAN', 'ADMIN']:
            return Response({"detail": "You do not have permission to update lab tests."}, status=status.HTTP_403_FORBIDDEN)

        serializer = LabTestSerializer(lab_test, data=request.data)
        if serializer.is_valid():
            updated_lab_test = serializer.save()

            # Đồng bộ với laboratory-service
            if updated_lab_test.lab_service_id:
                from .services import LaboratoryService
                auth_token = request.META.get('HTTP_AUTHORIZATION', '').replace('Bearer ', '') if 'HTTP_AUTHORIZATION' in request.META else None

                # Cập nhật trạng thái của lab test trong laboratory-service
                LaboratoryService.update_lab_test_status(updated_lab_test.lab_service_id, updated_lab_test.status, auth_token)

            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def delete(self, request, pk):
        lab_test = self.get_object(pk)
        if lab_test is None:
            return Response({"detail": "Lab test not found or you do not have permission to delete it."}, status=status.HTTP_404_NOT_FOUND)

        user_role = request.auth.get('role', None) if request.auth else None
        if user_role not in ['DOCTOR', 'ADMIN']:
            return Response({"detail": "You do not have permission to delete lab tests."}, status=status.HTTP_403_FORBIDDEN)

        # Đồng bộ với laboratory-service
        if lab_test.lab_service_id:
            from .services import LaboratoryService
            auth_token = request.META.get('HTTP_AUTHORIZATION', '').replace('Bearer ', '') if 'HTTP_AUTHORIZATION' in request.META else None

            # Cập nhật trạng thái của lab test trong laboratory-service
            LaboratoryService.update_lab_test_status(lab_test.lab_service_id, 'CANCELLED', auth_token)

        lab_test.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)

# API cho Lab Result
class LabResultListCreateAPIView(APIView):
    """
    API endpoint để lấy danh sách và tạo mới kết quả xét nghiệm.
    """
    permission_classes = [CanViewMedicalRecords]
    authentication_classes = [CustomJWTAuthentication]
    pagination_class = StandardResultsSetPagination

    def get(self, request):
        user_role = request.auth.get('role', None) if request.auth else None
        user_id = request.user.id

        queryset = LabResult.objects.all()

        if user_role == 'PATIENT':
            queryset = queryset.filter(lab_test__encounter__medical_record__patient_id=user_id)

        lab_test_id = request.query_params.get('lab_test_id', None)
        if lab_test_id is not None:
            queryset = queryset.filter(lab_test_id=lab_test_id)

        search = request.query_params.get('search', None)
        if search is not None:
            queryset = queryset.filter(result_value__icontains=search)

        ordering = request.query_params.get('ordering', '-performed_at')
        if ordering:
            queryset = queryset.order_by(ordering)

        paginator = self.pagination_class()
        page = paginator.paginate_queryset(queryset, request)

        if page is not None:
            serializer = LabResultSerializer(page, many=True)
            return paginator.get_paginated_response(serializer.data)

        serializer = LabResultSerializer(queryset, many=True)
        return Response(serializer.data)

    def post(self, request):
        serializer = LabResultSerializer(data=request.data)
        if serializer.is_valid():
            user_role = request.auth.get('role', None) if request.auth else None
            user_id = request.user.id

            if user_role not in ['LAB_TECHNICIAN', 'ADMIN']:
                return Response({"detail": "You do not have permission to create lab results."}, status=status.HTTP_403_FORBIDDEN)

            lab_test_id = request.data.get('lab_test')
            try:
                from .models import LabTest
                lab_test = LabTest.objects.get(pk=lab_test_id)
                if user_role == 'PATIENT' and lab_test.encounter.medical_record.patient_id != user_id:
                    return Response({"detail": "You do not have permission to add results to this lab test."}, status=status.HTTP_403_FORBIDDEN)
            except LabTest.DoesNotExist:
                return Response({"detail": "Lab test not found."}, status=status.HTTP_404_NOT_FOUND)

            # Lưu kết quả xét nghiệm trong medical-record-service
            lab_result = serializer.save(performed_by=user_id, performed_at=timezone.now())

            # Đồng bộ với laboratory-service
            if lab_test.lab_service_id:
                from .services import LaboratoryService
                auth_token = request.META.get('HTTP_AUTHORIZATION', '').replace('Bearer ', '') if 'HTTP_AUTHORIZATION' in request.META else None

                # Tạo dữ liệu cho laboratory-service
                result_data = {
                    'lab_test': lab_test.lab_service_id,
                    'technician_id': user_id,
                    'result_value': lab_result.result_value,
                    'is_abnormal': lab_result.is_abnormal,
                    'comments': lab_result.notes
                }

                # Gọi API đến laboratory-service
                LaboratoryService.create_test_result(result_data, auth_token)

                # Cập nhật trạng thái của lab test trong laboratory-service
                LaboratoryService.update_lab_test_status(lab_test.lab_service_id, 'COMPLETED', auth_token)

            # Cập nhật trạng thái của lab test trong medical-record-service
            lab_test.status = 'COMPLETED'
            lab_test.save(update_fields=['status'])

            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class LabResultDetailAPIView(APIView):
    """
    API endpoint để xem, cập nhật và xóa kết quả xét nghiệm.
    """
    permission_classes = [CanViewMedicalRecords]
    authentication_classes = [CustomJWTAuthentication]

    def get_object(self, pk):
        try:
            lab_result = LabResult.objects.get(pk=pk)
            user_role = self.request.auth.get('role', None) if self.request.auth else None
            user_id = self.request.user.id

            if user_role in ['DOCTOR', 'ADMIN', 'NURSE', 'LAB_TECHNICIAN']:
                return lab_result
            elif user_role == 'PATIENT' and lab_result.lab_test.encounter.medical_record.patient_id == user_id:
                return lab_result
            else:
                return None
        except LabResult.DoesNotExist:
            return None

    def get(self, request, pk):
        lab_result = self.get_object(pk)
        if lab_result is None:
            return Response({"detail": "Lab result not found or you do not have permission to view it."}, status=status.HTTP_404_NOT_FOUND)

        serializer = LabResultSerializer(lab_result)
        return Response(serializer.data)

    def put(self, request, pk):
        lab_result = self.get_object(pk)
        if lab_result is None:
            return Response({"detail": "Lab result not found or you do not have permission to update it."}, status=status.HTTP_404_NOT_FOUND)

        user_role = request.auth.get('role', None) if request.auth else None
        if user_role not in ['LAB_TECHNICIAN', 'ADMIN']:
            return Response({"detail": "You do not have permission to update lab results."}, status=status.HTTP_403_FORBIDDEN)

        serializer = LabResultSerializer(lab_result, data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def delete(self, request, pk):
        lab_result = self.get_object(pk)
        if lab_result is None:
            return Response({"detail": "Lab result not found or you do not have permission to delete it."}, status=status.HTTP_404_NOT_FOUND)

        user_role = request.auth.get('role', None) if request.auth else None
        if user_role not in ['LAB_TECHNICIAN', 'ADMIN']:
            return Response({"detail": "You do not have permission to delete lab results."}, status=status.HTTP_403_FORBIDDEN)

        lab_result.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)

# API cho Encounter
class EncounterListCreateAPIView(APIView):
    """
    API endpoint để lấy danh sách và tạo mới phiên khám của bệnh nhân.
    """
    permission_classes = [CanViewMedicalRecords]
    pagination_class = StandardResultsSetPagination
    authentication_classes = [CustomJWTAuthentication]

    def get(self, request):
        user_role = request.auth.get('role', None) if request.auth else None
        user_id = request.user.id
        queryset = Encounter.objects.all()
        # Nếu người dùng là bệnh nhân, chỉ lấy phiên khám của chính họ
        if user_role == 'PATIENT':
            queryset = queryset.filter(medical_record__patient_id=user_id)
        ordering = request.query_params.get('ordering', '-encounter_date')
        if ordering:
            queryset = queryset.order_by(ordering)
        paginator = self.pagination_class()
        page = paginator.paginate_queryset(queryset, request)
        if page is not None:
            serializer = EncounterSerializer(page, many=True)
            return paginator.get_paginated_response(serializer.data)
        serializer = EncounterSerializer(queryset, many=True)
        return Response(serializer.data)

    def post(self, request):
        serializer = EncounterSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class EncounterDetailAPIView(APIView):
    """
    API endpoint để xem, cập nhật và xóa một phiên khám.
    """
    permission_classes = [CanViewMedicalRecords]
    authentication_classes = [CustomJWTAuthentication]

    def get_object(self, pk):
        try:
            return Encounter.objects.get(pk=pk)
        except Encounter.DoesNotExist:
            return None

    def get(self, request, pk):
        encounter = self.get_object(pk)
        if encounter is None:
            return Response({"detail": "Encounter not found."}, status=status.HTTP_404_NOT_FOUND)
        serializer = EncounterSerializer(encounter)
        return Response(serializer.data)

    def put(self, request, pk):
        encounter = self.get_object(pk)
        if encounter is None:
            return Response({"detail": "Encounter not found."}, status=status.HTTP_404_NOT_FOUND)

        # Lưu trạng thái cũ để kiểm tra thay đổi
        old_status = encounter.status if hasattr(encounter, 'status') else None

        serializer = EncounterSerializer(encounter, data=request.data)
        if serializer.is_valid():
            updated_encounter = serializer.save()

            # Kiểm tra nếu trạng thái đã thay đổi thành COMPLETED
            new_status = updated_encounter.status if hasattr(updated_encounter, 'status') else None

            if new_status == 'COMPLETED' and old_status != 'COMPLETED':
                # Tạo hóa đơn cho cuộc gặp đã hoàn thành
                try:
                    from .integrations import create_invoice_from_medical_record, send_notification

                    # Lấy token xác thực từ request
                    auth_header = request.META.get('HTTP_AUTHORIZATION')

                    # Tạo hóa đơn
                    invoice = create_invoice_from_medical_record(
                        medical_record=updated_encounter.medical_record,
                        encounter=updated_encounter,
                        token=auth_header
                    )

                    if invoice:
                        logger.info(f"Created invoice for encounter {updated_encounter.id}: {invoice.get('id')}")

                        # Gửi thông báo về hóa đơn cho bệnh nhân
                        send_notification(
                            user_id=updated_encounter.medical_record.patient_id,
                            notification_type="INVOICE_CREATED",
                            message=f"An invoice has been created for your medical visit on {updated_encounter.encounter_date}.",
                            additional_data={
                                "invoice_id": invoice.get('id'),
                                "encounter_id": updated_encounter.id,
                                "amount": invoice.get('total_amount')
                            },
                            token=auth_header
                        )
                except Exception as e:
                    logger.error(f"Error creating invoice for encounter {updated_encounter.id}: {str(e)}")
                    # Don't raise the exception to avoid affecting the main flow

            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def delete(self, request, pk):
        encounter = self.get_object(pk)
        if encounter is None:
            return Response({"detail": "Encounter not found."}, status=status.HTTP_404_NOT_FOUND)
        encounter.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)