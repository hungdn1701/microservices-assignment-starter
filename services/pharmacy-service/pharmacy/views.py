from rest_framework import viewsets, status, filters
from rest_framework.decorators import action, api_view, permission_classes, authentication_classes
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend
from django.utils import timezone
from django.db.models import Q
import logging

from .models import (
    Medication, Prescription, PrescriptionItem,
    Inventory, Dispensing, DispensingItem
)
from .serializers import (
    MedicationSerializer, PrescriptionSerializer, PrescriptionItemSerializer,
    InventorySerializer, DispensingSerializer, DispensingItemSerializer,
    PrescriptionCreateSerializer, DispensingCreateSerializer
)
from .authentication import CustomJWTAuthentication
from .permissions import IsPharmacist, IsDoctor, IsPatient, IsAdmin, HasAnyRole
from .services import MedicalRecordService

logger = logging.getLogger(__name__)


class MedicationViewSet(viewsets.ModelViewSet):
    """
    API endpoint for managing medications.
    """
    queryset = Medication.objects.all()
    serializer_class = MedicationSerializer
    authentication_classes = [CustomJWTAuthentication]
    permission_classes = [IsPharmacist]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['category', 'dosage_form', 'requires_prescription', 'manufacturer']
    search_fields = ['name', 'description']
    ordering_fields = ['name', 'category', 'created_at']

    @action(detail=False, methods=['get'])
    def search(self, request):
        """
        Search medications by name, description, or category.
        """
        query = request.query_params.get('q', '')
        if not query:
            return Response(
                {"error": "Search query parameter 'q' is required"},
                status=status.HTTP_400_BAD_REQUEST
            )

        medications = self.queryset.filter(
            Q(name__icontains=query) |
            Q(description__icontains=query) |
            Q(category__icontains=query)
        )

        page = self.paginate_queryset(medications)
        if page is not None:
            serializer = self.get_serializer(page, many=True)
            return self.get_paginated_response(serializer.data)

        serializer = self.get_serializer(medications, many=True)
        return Response(serializer.data)


class PrescriptionViewSet(viewsets.ModelViewSet):
    """
    API endpoint for managing prescriptions.
    """
    queryset = Prescription.objects.all()
    serializer_class = PrescriptionSerializer
    authentication_classes = [CustomJWTAuthentication]
    permission_classes = [IsDoctor | IsAdmin | IsPharmacist]
    filter_backends = [DjangoFilterBackend, filters.OrderingFilter]
    filterset_fields = ['patient_id', 'doctor_id', 'diagnosis_id', 'encounter_id', 'status']
    ordering_fields = ['date_prescribed', 'created_at', 'status']

    @action(detail=False, methods=['post'], permission_classes=[IsDoctor | IsAdmin])
    def create_from_diagnosis(self, request):
        """
        Create a prescription from a diagnosis.
        """
        diagnosis_id = request.data.get('diagnosis_id')
        if not diagnosis_id:
            return Response({"error": "diagnosis_id is required"}, status=status.HTTP_400_BAD_REQUEST)

        # Lấy token xác thực từ request
        auth_header = request.META.get('HTTP_AUTHORIZATION')
        auth_token = None
        if auth_header and auth_header.startswith('Bearer '):
            auth_token = auth_header.split(' ')[1]

        # Get diagnosis information
        diagnosis_info = MedicalRecordService.get_diagnosis_info(diagnosis_id, auth_token)
        if not diagnosis_info:
            return Response({"error": "Diagnosis not found"}, status=status.HTTP_404_NOT_FOUND)

        # Extract information from diagnosis
        encounter_id = diagnosis_info.get('encounter')
        if not isinstance(encounter_id, dict):
            # Lấy thông tin encounter
            encounter_info = MedicalRecordService.get_encounter_info(encounter_id, auth_token)
            if not encounter_info:
                return Response({"error": "Encounter not found"}, status=status.HTTP_404_NOT_FOUND)

            medical_record_id = encounter_info.get('medical_record')
            if not isinstance(medical_record_id, dict):
                # Lấy thông tin medical record
                medical_record_info = MedicalRecordService.get_medical_record_info(medical_record_id, auth_token)
                if not medical_record_info:
                    return Response({"error": "Medical record not found"}, status=status.HTTP_404_NOT_FOUND)

                patient_id = medical_record_info.get('patient_id')
            else:
                patient_id = encounter_info.get('medical_record', {}).get('patient_id')
        else:
            patient_id = diagnosis_info.get('encounter', {}).get('medical_record', {}).get('patient_id')
            encounter_id = diagnosis_info.get('encounter', {}).get('id')

        doctor_id = diagnosis_info.get('doctor_id')

        if not patient_id or not doctor_id:
            return Response({"error": "Invalid diagnosis data"}, status=status.HTTP_400_BAD_REQUEST)

        # Lấy thông tin chi tiết về chẩn đoán
        diagnosis_code = diagnosis_info.get('diagnosis_code')
        diagnosis_description = diagnosis_info.get('diagnosis_description')

        print(f"Diagnosis info: {diagnosis_info}")

        # Create prescription data
        prescription_data = {
            'patient_id': patient_id,
            'doctor_id': doctor_id,
            'diagnosis_id': diagnosis_id,
            'encounter_id': encounter_id,
            'diagnosis_code': diagnosis_code,
            'diagnosis_description': diagnosis_description,
            'date_prescribed': timezone.now().date(),
            'status': 'PENDING',
            'notes': request.data.get('notes', f"Created from diagnosis #{diagnosis_id}"),
            'items': request.data.get('items', [])
        }

        serializer = PrescriptionCreateSerializer(data=prescription_data)
        if serializer.is_valid():
            prescription = serializer.save()

            # Cập nhật chẩn đoán trong medical-record-service
            MedicalRecordService.update_diagnosis_prescriptions(diagnosis_id, prescription.id, auth_token)

            return Response(PrescriptionSerializer(prescription).data, status=status.HTTP_201_CREATED)

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def get_serializer_class(self):
        if self.action == 'create':
            return PrescriptionCreateSerializer
        return PrescriptionSerializer

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        self.perform_create(serializer)
        headers = self.get_success_headers(serializer.data)
        return Response(serializer.data, status=status.HTTP_201_CREATED, headers=headers)

    def get_queryset(self):
        """
        Filter prescriptions based on user role.
        """
        queryset = Prescription.objects.all()

        # Get user information from authentication
        user_role = getattr(self.request.user, 'role', None)
        user_id = getattr(self.request.user, 'id', None)

        # Patients can only see their own prescriptions
        if user_role == 'PATIENT':
            queryset = queryset.filter(patient_id=user_id)

        # Doctors can only see prescriptions they created
        elif user_role == 'DOCTOR':
            queryset = queryset.filter(doctor_id=user_id)

        # Filter by date range
        start_date = self.request.query_params.get('start_date', None)
        end_date = self.request.query_params.get('end_date', None)

        if start_date:
            queryset = queryset.filter(date_prescribed__gte=start_date)

        if end_date:
            queryset = queryset.filter(date_prescribed__lte=end_date)

        return queryset

    @action(detail=True, methods=['post'])
    def cancel(self, request, pk=None):
        """
        Cancel a prescription.
        """
        prescription = self.get_object()

        # Check if the prescription can be cancelled
        if prescription.status not in ['PENDING', 'PROCESSING']:
            return Response(
                {"error": f"Cannot cancel a prescription with status '{prescription.status}'"},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Update prescription status
        prescription.status = 'CANCELLED'
        prescription.save()

        serializer = self.get_serializer(prescription)
        return Response(serializer.data)

    @action(detail=False, methods=['get'])
    def pending(self, request):
        """
        Get pending prescriptions.
        """
        queryset = self.get_queryset().filter(status='PENDING')

        page = self.paginate_queryset(queryset)
        if page is not None:
            serializer = self.get_serializer(page, many=True)
            return self.get_paginated_response(serializer.data)

        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)


class PrescriptionItemViewSet(viewsets.ModelViewSet):
    """
    API endpoint for managing prescription items.
    """
    queryset = PrescriptionItem.objects.all()
    serializer_class = PrescriptionItemSerializer
    authentication_classes = [CustomJWTAuthentication]
    permission_classes = [HasAnyRole]
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['prescription', 'medication']

    def get_queryset(self):
        """
        Filter prescription items based on user role.
        """
        queryset = PrescriptionItem.objects.all()

        # Get user information from authentication
        user_role = getattr(self.request.user, 'role', None)
        user_id = getattr(self.request.user, 'id', None)

        # Doctors can only see prescription items they created
        if user_role == 'DOCTOR':
            queryset = queryset.filter(prescription__doctor_id=user_id)

        return queryset


class InventoryViewSet(viewsets.ModelViewSet):
    """
    API endpoint for managing inventory.
    """
    queryset = Inventory.objects.all()
    serializer_class = InventorySerializer
    authentication_classes = [CustomJWTAuthentication]
    permission_classes = [IsPharmacist | IsAdmin]
    filter_backends = [DjangoFilterBackend, filters.OrderingFilter]
    filterset_fields = ['medication', 'batch_number']
    ordering_fields = ['expiry_date', 'quantity', 'created_at']

    @action(detail=False, methods=['get'])
    def low_stock(self, request):
        """
        Get inventory items with low stock (less than 10 units).
        """
        queryset = self.queryset.filter(quantity__lt=10)

        page = self.paginate_queryset(queryset)
        if page is not None:
            serializer = self.get_serializer(page, many=True)
            return self.get_paginated_response(serializer.data)

        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['get'])
    def expiring_soon(self, request):
        """
        Get inventory items expiring within 30 days.
        """
        today = timezone.now().date()
        expiry_threshold = today + timezone.timedelta(days=30)

        queryset = self.queryset.filter(
            expiry_date__gte=today,
            expiry_date__lte=expiry_threshold
        )

        page = self.paginate_queryset(queryset)
        if page is not None:
            serializer = self.get_serializer(page, many=True)
            return self.get_paginated_response(serializer.data)

        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)


class DispensingViewSet(viewsets.ModelViewSet):
    """
    API endpoint for managing dispensing.
    """
    queryset = Dispensing.objects.all()
    serializer_class = DispensingSerializer
    authentication_classes = [CustomJWTAuthentication]
    permission_classes = [IsPharmacist | IsAdmin]
    filter_backends = [DjangoFilterBackend, filters.OrderingFilter]
    filterset_fields = ['prescription', 'pharmacist_id', 'status']
    ordering_fields = ['date_dispensed', 'created_at', 'status']

    def get_serializer_class(self):
        if self.action == 'create':
            return DispensingCreateSerializer
        return DispensingSerializer

    @action(detail=True, methods=['post'])
    def cancel(self, request, pk=None):
        """
        Cancel a dispensing.
        """
        dispensing = self.get_object()

        # Check if the dispensing can be cancelled
        if dispensing.status != 'PENDING':
            return Response(
                {"error": f"Cannot cancel a dispensing with status '{dispensing.status}'"},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Update dispensing status
        dispensing.status = 'CANCELLED'
        dispensing.save()

        # Update prescription status
        prescription = dispensing.prescription
        prescription.status = 'PENDING'
        prescription.save()

        # Return inventory items
        for item in dispensing.items.all():
            inventory = item.inventory
            inventory.quantity += item.quantity_dispensed
            inventory.save()

        serializer = self.get_serializer(dispensing)
        return Response(serializer.data)

    @action(detail=True, methods=['post'])
    def complete(self, request, pk=None):
        """
        Mark a dispensing as completed.
        """
        dispensing = self.get_object()

        # Check if the dispensing can be completed
        if dispensing.status != 'PENDING':
            return Response(
                {"error": f"Cannot complete a dispensing with status '{dispensing.status}'"},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Update dispensing status
        dispensing.status = 'COMPLETED'
        dispensing.save()

        # Create invoice for the completed dispensing
        try:
            from .integrations import create_invoice_from_prescription, send_notification

            # Get token from request
            auth_header = request.META.get('HTTP_AUTHORIZATION')

            # Create invoice
            invoice = create_invoice_from_prescription(
                prescription=dispensing.prescription,
                dispensing=dispensing,
                token=auth_header
            )

            if invoice:
                logger.info(f"Created invoice for dispensing {dispensing.id}: {invoice.get('id')}")

                # Send notification about invoice to patient
                send_notification(
                    user_id=dispensing.prescription.patient_id,
                    notification_type="INVOICE_CREATED",
                    message=f"An invoice has been created for your prescription.",
                    additional_data={
                        "invoice_id": invoice.get('id'),
                        "prescription_id": dispensing.prescription.id,
                        "dispensing_id": dispensing.id,
                        "amount": invoice.get('total_amount')
                    },
                    token=auth_header
                )
        except Exception as e:
            logger.error(f"Error creating invoice for dispensing {dispensing.id}: {str(e)}")
            # Don't raise the exception to avoid affecting the main flow

        serializer = self.get_serializer(dispensing)
        return Response(serializer.data)


class DispensingItemViewSet(viewsets.ModelViewSet):
    """
    API endpoint for managing dispensing items.
    """
    queryset = DispensingItem.objects.all()
    serializer_class = DispensingItemSerializer
    authentication_classes = [CustomJWTAuthentication]
    permission_classes = [IsPharmacist]
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['dispensing', 'prescription_item', 'inventory']

    def get_queryset(self):
        """
        Filter dispensing items based on user role.
        """
        queryset = DispensingItem.objects.all()

        # Get user information from authentication
        user_role = getattr(self.request.user, 'role', None)
        user_id = getattr(self.request.user, 'id', None)

        # Pharmacists can only see dispensing items they created
        if user_role == 'PHARMACIST':
            queryset = queryset.filter(dispensing__pharmacist_id=user_id)

        return queryset
