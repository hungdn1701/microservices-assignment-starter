from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.exceptions import ValidationError
from django.utils import timezone
from django.db.models import Q
from authentication.models import User
from common_auth.permissions import IsAuthenticated, HasRole, HasResourceAccess

def _get_description_for_specialty(specialty):
    """
    Get description for specialty.
    """
    descriptions = {
        'NOI_TIM_MACH': 'Chuyên khoa chẩn đoán và điều trị các bệnh về tim mạch',
        'NOI_TIEU_HOA': 'Chuyên khoa chẩn đoán và điều trị các bệnh về tiêu hóa',
        'NOI_HO_HAP': 'Chuyên khoa chẩn đoán và điều trị các bệnh về hô hấp',
        'NOI_THAN': 'Chuyên khoa chẩn đoán và điều trị các bệnh về thận',
        'NOI_TIET': 'Chuyên khoa chẩn đoán và điều trị các bệnh về nội tiết',
        'NOI_THAN_KINH': 'Chuyên khoa chẩn đoán và điều trị các bệnh về thần kinh',
        'NOI_DA_LIEU': 'Chuyên khoa chẩn đoán và điều trị các bệnh về da',
        'NOI_TONG_QUAT': 'Chuyên khoa chẩn đoán và điều trị các bệnh nội khoa tổng quát',
        'NGOAI_CHINH_HINH': 'Chuyên khoa chẩn đoán và điều trị các bệnh về chấn thương chỉnh hình',
        'NGOAI_TIET_NIEU': 'Chuyên khoa chẩn đoán và điều trị các bệnh về tiết niệu',
        'NGOAI_THAN_KINH': 'Chuyên khoa chẩn đoán và điều trị các bệnh về thần kinh cần phẫu thuật',
        'NGOAI_LONG_NGUC': 'Chuyên khoa chẩn đoán và điều trị các bệnh về lồng ngực và mạch máu',
        'NGOAI_TIEU_HOA': 'Chuyên khoa chẩn đoán và điều trị các bệnh về tiêu hóa cần phẫu thuật',
        'NGOAI_TONG_QUAT': 'Chuyên khoa chẩn đoán và điều trị các bệnh ngoại khoa tổng quát',
        'SAN_KHOA': 'Chuyên khoa chăm sóc thai sản và sinh đẻ',
        'PHU_KHOA': 'Chuyên khoa chẩn đoán và điều trị các bệnh phụ khoa',
        'VO_SINH': 'Chuyên khoa chẩn đoán và điều trị vô sinh, hiếm muộn',
        'NHI_TONG_QUAT': 'Chuyên khoa chẩn đoán và điều trị các bệnh nhi tổng quát',
        'NHI_TIM_MACH': 'Chuyên khoa chẩn đoán và điều trị các bệnh tim mạch ở trẻ em',
        'NHI_THAN_KINH': 'Chuyên khoa chẩn đoán và điều trị các bệnh thần kinh ở trẻ em',
        'NHI_SO_SINH': 'Chuyên khoa chăm sóc trẻ sơ sinh',
        'MAT': 'Chuyên khoa chẩn đoán và điều trị các bệnh về mắt',
        'TAI_MUI_HONG': 'Chuyên khoa chẩn đoán và điều trị các bệnh về tai, mũi, họng',
        'RANG_HAM_MAT': 'Chuyên khoa chẩn đoán và điều trị các bệnh về răng, hàm, mặt',
        'TAM_THAN': 'Chuyên khoa chẩn đoán và điều trị các bệnh tâm thần',
        'UNG_BUOU': 'Chuyên khoa chẩn đoán và điều trị các bệnh ung thư',
        'DA_KHOA': 'Chuyên khoa chẩn đoán và điều trị đa khoa',
        'KHAC': 'Các chuyên khoa khác'
    }
    return descriptions.get(specialty, '')

def _get_description_for_department(department):
    """
    Get description for department.
    """
    descriptions = {
        'KHOA_NOI': 'Khoa chịu trách nhiệm chẩn đoán và điều trị các bệnh nội khoa',
        'KHOA_NGOAI': 'Khoa chịu trách nhiệm phẫu thuật và điều trị các bệnh ngoại khoa',
        'KHOA_SAN': 'Khoa chăm sóc sức khỏe phụ nữ và thai sản',
        'KHOA_NHI': 'Khoa chăm sóc sức khỏe trẻ em từ sơ sinh đến 16 tuổi',
        'KHOA_CAP_CUU': 'Khoa tiếp nhận và xử lý các trường hợp cấp cứu',
        'KHOA_XET_NGHIEM': 'Khoa thực hiện các xét nghiệm và phân tích mẫu',
        'KHOA_CHAN_DOAN_HINH_ANH': 'Khoa thực hiện các kỹ thuật chẩn đoán hình ảnh như X-quang, CT, MRI',
        'KHOA_MAT': 'Khoa chuyên về chăm sóc và điều trị các vấn đề về mắt',
        'KHOA_TMH': 'Khoa chuyên về chăm sóc và điều trị các vấn đề về tai, mũi, họng',
        'KHOA_RHM': 'Khoa chuyên về chăm sóc và điều trị các vấn đề về răng, hàm, mặt',
        'KHOA_UNG_BUOU': 'Khoa chuyên về chẩn đoán và điều trị các loại ung thư',
        'KHOA_HOI_SUC': 'Khoa chăm sóc đặc biệt cho bệnh nhân nặng',
        'KHOA_KHAC': 'Các khoa khác trong bệnh viện'
    }
    return descriptions.get(department, '')
from .models import (
    Address, ContactInfo, UserDocument, PatientProfile, DoctorProfile, NurseProfile,
    PharmacistProfile, InsuranceInformation, InsuranceProviderProfile, LabTechnicianProfile,
    AdminProfile
)
from .serializers import (
    UserDetailSerializer, UserBasicSerializer,
    AddressSerializer, ContactInfoSerializer, UserDocumentSerializer,
    PatientProfileSerializer, DoctorProfileSerializer, NurseProfileSerializer,
    PharmacistProfileSerializer, InsuranceInformationSerializer, InsuranceProviderProfileSerializer,
    LabTechnicianProfileSerializer, AdminProfileSerializer
)

# ============================================================
# User ViewSet
# ============================================================

class UserViewSet(viewsets.ModelViewSet):
    """
    ViewSet để quản lý người dùng.
    """
    serializer_class = UserDetailSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        """Lấy danh sách người dùng dựa trên quyền"""
        if self.request.user.role == 'ADMIN':
            return User.objects.all()
        return User.objects.filter(id=self.request.user.id)

    def create(self, request, *args, **kwargs):
        """Tạo người dùng mới (chỉ dành cho admin)"""
        if request.user.role != 'ADMIN':
            return Response(
                {"detail": "Only administrators can create users."},
                status=status.HTTP_403_FORBIDDEN
            )
        return super().create(request, *args, **kwargs)

    def update(self, request, *args, **kwargs):
        """Cập nhật thông tin người dùng"""
        instance = self.get_object()
        # Kiểm tra quyền truy cập
        if request.user.role != 'ADMIN' and request.user.id != instance.id:
            return Response(
                {"detail": "You do not have permission to update this user."},
                status=status.HTTP_403_FORBIDDEN
            )
        return super().update(request, *args, **kwargs)

    def destroy(self, request, *args, **kwargs):
        """Xóa người dùng (chỉ dành cho admin)"""
        if request.user.role != 'ADMIN':
            return Response(
                {"detail": "Only administrators can delete users."},
                status=status.HTTP_403_FORBIDDEN
            )
        return super().destroy(request, *args, **kwargs)

    @action(detail=False, methods=['get'])
    def me(self, request):
        """Lấy thông tin người dùng hiện tại"""
        serializer = self.get_serializer(request.user)
        return Response(serializer.data)

    @action(detail=False, methods=['post'])
    def create_staff(self, request):
        """
        Tạo tài khoản cho nhân viên y tế.
        Chỉ quản trị viên mới có thể truy cập endpoint này.
        """
        # Kiểm tra quyền quản trị viên
        if request.user.role != 'ADMIN':
            return Response(
                {"detail": "Only administrators can create staff accounts."},
                status=status.HTTP_403_FORBIDDEN
            )

        serializer = self.get_serializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

# ============================================================
# User Document ViewSet
# ============================================================

class UserDocumentViewSet(viewsets.ModelViewSet):
    """
    ViewSet để quản lý tài liệu người dùng.
    """
    serializer_class = UserDocumentSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        """Lấy danh sách tài liệu dựa trên quyền"""
        if self.request.user.role == 'ADMIN':
            # Admin có thể xem tất cả tài liệu hoặc lọc theo người dùng
            user_id = self.request.query_params.get('user_id')
            if user_id:
                return UserDocument.objects.filter(user_id=user_id)
            return UserDocument.objects.all()
        # Người dùng thường chỉ xem tài liệu của mình
        return UserDocument.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        """Tạo tài liệu mới"""
        # Nếu là admin và cung cấp user_id, sử dụng user_id đó
        if self.request.user.role == 'ADMIN' and 'user' in self.request.data:
            serializer.save()
        else:
            # Người dùng thường chỉ có thể tạo tài liệu cho chính mình
            serializer.save(user=self.request.user)

    def check_object_permissions(self, request, obj):
        """Kiểm tra quyền truy cập đối tượng"""
        super().check_object_permissions(request, obj)
        if obj.user.id != request.user.id and request.user.role != 'ADMIN':
            raise ValidationError({"detail": "You do not have permission to access this document."})

    @action(detail=True, methods=['post'])
    def verify(self, request, pk=None):
        """Xác minh tài liệu (chỉ dành cho admin)"""
        if request.user.role != 'ADMIN':
            return Response(
                {"detail": "Only administrators can verify documents."},
                status=status.HTTP_403_FORBIDDEN
            )

        document = self.get_object()
        notes = request.data.get('verification_notes', '')
        document.verify(notes)
        serializer = self.get_serializer(document)
        return Response(serializer.data)

# ============================================================
# Address ViewSet
# ============================================================

class AddressViewSet(viewsets.ModelViewSet):
    """
    ViewSet để quản lý địa chỉ.
    """
    serializer_class = AddressSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        """Lấy danh sách địa chỉ của người dùng hiện tại"""
        if self.request.user.role == 'ADMIN':
            # Admin có thể xem tất cả địa chỉ hoặc lọc theo người dùng
            user_id = self.request.query_params.get('user_id')
            if user_id:
                return Address.objects.filter(user_id=user_id)
            return Address.objects.all()
        return Address.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        """Tạo địa chỉ mới cho người dùng hiện tại"""
        # Lấy đối tượng User từ ID của request.user
        from authentication.models import User
        user = User.objects.get(id=self.request.user.id)
        serializer.save(user=user)

    def check_object_permissions(self, request, obj):
        """Kiểm tra quyền truy cập đối tượng"""
        super().check_object_permissions(request, obj)
        if obj.user.id != request.user.id and request.user.role != 'ADMIN':
            raise ValidationError({"detail": "You do not have permission to access this address."})

# ============================================================
# Contact Info ViewSet
# ============================================================

class ContactInfoViewSet(viewsets.GenericViewSet):
    """
    ViewSet để quản lý thông tin liên hệ.
    """
    serializer_class = ContactInfoSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        """Lấy thông tin liên hệ của người dùng hiện tại"""
        return ContactInfo.objects.filter(user=self.request.user)

    @action(detail=False, methods=['get'])
    def me(self, request):
        """Lấy thông tin liên hệ của người dùng hiện tại"""
        try:
            contact_info = ContactInfo.objects.get(user=request.user)
            serializer = self.get_serializer(contact_info)
            return Response(serializer.data)
        except ContactInfo.DoesNotExist:
            return Response({"detail": "Contact information not found."}, status=status.HTTP_404_NOT_FOUND)

    @action(detail=False, methods=['post'])
    def create_or_update(self, request):
        """Tạo hoặc cập nhật thông tin liên hệ của người dùng hiện tại"""
        try:
            contact_info = ContactInfo.objects.get(user=request.user)
            serializer = self.get_serializer(contact_info, data=request.data, partial=True)
            if serializer.is_valid():
                serializer.save()
                return Response(serializer.data)
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        except ContactInfo.DoesNotExist:
            data = request.data.copy()
            data['user'] = request.user.id
            serializer = self.get_serializer(data=data)
            if serializer.is_valid():
                serializer.save()
                return Response(serializer.data, status=status.HTTP_201_CREATED)
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=False, methods=['delete'])
    def remove(self, request):
        """Xóa thông tin liên hệ của người dùng hiện tại"""
        try:
            contact_info = ContactInfo.objects.get(user=request.user)
            contact_info.delete()
            return Response(status=status.HTTP_204_NO_CONTENT)
        except ContactInfo.DoesNotExist:
            return Response({"detail": "Contact information not found."}, status=status.HTTP_404_NOT_FOUND)

# ============================================================
# Profile ViewSets
# ============================================================

class ProfileViewSetMixin:
    """
    Mixin chung cho các ViewSet quản lý hồ sơ.
    """
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        """Lấy danh sách hồ sơ dựa trên quyền"""
        if self.request.user.role == 'ADMIN':
            return self.model.objects.all()
        return self.model.objects.filter(user=self.request.user)

    @action(detail=False, methods=['get'])
    def me(self, request):
        """Lấy hồ sơ của người dùng hiện tại"""
        try:
            profile = self.model.objects.get(user=request.user)
            serializer = self.get_serializer(profile)
            return Response(serializer.data)
        except self.model.DoesNotExist:
            return Response({"detail": f"{self.profile_type} profile not found."}, status=status.HTTP_404_NOT_FOUND)

    @action(detail=False, methods=['post'])
    def create_or_update(self, request):
        """Tạo hoặc cập nhật hồ sơ của người dùng hiện tại"""
        # Kiểm tra vai trò người dùng
        if request.user.role != self.required_role and request.user.role != 'ADMIN':
            return Response(
                {"detail": f"Only users with {self.required_role} role can create {self.profile_type} profiles."},
                status=status.HTTP_403_FORBIDDEN
            )

        try:
            profile = self.model.objects.get(user=request.user)
            serializer = self.get_serializer(profile, data=request.data, partial=True)
            if serializer.is_valid():
                serializer.save()
                return Response(serializer.data)
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        except self.model.DoesNotExist:
            data = request.data.copy()
            data['user'] = request.user.id
            serializer = self.get_serializer(data=data)
            if serializer.is_valid():
                serializer.save()
                return Response(serializer.data, status=status.HTTP_201_CREATED)
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=False, methods=['delete'])
    def remove(self, request):
        """Xóa hồ sơ của người dùng hiện tại"""
        try:
            profile = self.model.objects.get(user=request.user)
            profile.delete()
            return Response(status=status.HTTP_204_NO_CONTENT)
        except self.model.DoesNotExist:
            return Response({"detail": f"{self.profile_type} profile not found."}, status=status.HTTP_404_NOT_FOUND)

class PatientProfileViewSet(ProfileViewSetMixin, viewsets.GenericViewSet):
    """
    ViewSet để quản lý hồ sơ bệnh nhân.
    """
    serializer_class = PatientProfileSerializer
    model = PatientProfile
    profile_type = "Patient"
    required_role = "PATIENT"

class DoctorProfileViewSet(ProfileViewSetMixin, viewsets.GenericViewSet):
    """
    ViewSet để quản lý hồ sơ bác sĩ.
    """
    serializer_class = DoctorProfileSerializer
    model = DoctorProfile
    profile_type = "Doctor"
    required_role = "DOCTOR"

class NurseProfileViewSet(ProfileViewSetMixin, viewsets.GenericViewSet):
    """
    ViewSet để quản lý hồ sơ y tá.
    """
    serializer_class = NurseProfileSerializer
    model = NurseProfile
    profile_type = "Nurse"
    required_role = "NURSE"

class PharmacistProfileViewSet(ProfileViewSetMixin, viewsets.GenericViewSet):
    """
    ViewSet để quản lý hồ sơ dược sĩ.
    """
    serializer_class = PharmacistProfileSerializer
    model = PharmacistProfile
    profile_type = "Pharmacist"
    required_role = "PHARMACIST"

class InsuranceProviderProfileViewSet(ProfileViewSetMixin, viewsets.GenericViewSet):
    """
    ViewSet để quản lý hồ sơ nhà cung cấp bảo hiểm.
    """
    serializer_class = InsuranceProviderProfileSerializer
    model = InsuranceProviderProfile
    profile_type = "Insurance Provider"
    required_role = "INSURANCE"

class LabTechnicianProfileViewSet(ProfileViewSetMixin, viewsets.GenericViewSet):
    """
    ViewSet để quản lý hồ sơ kỹ thuật viên phòng thí nghiệm.
    """
    serializer_class = LabTechnicianProfileSerializer
    model = LabTechnicianProfile
    profile_type = "Lab Technician"
    required_role = "LAB_TECH"

class AdminProfileViewSet(ProfileViewSetMixin, viewsets.GenericViewSet):
    """
    ViewSet để quản lý hồ sơ quản trị viên.
    """
    serializer_class = AdminProfileSerializer
    model = AdminProfile
    profile_type = "Admin"
    required_role = "ADMIN"

# ============================================================
# Insurance Information ViewSet
# ============================================================

class InsuranceInformationViewSet(viewsets.ModelViewSet):
    """
    ViewSet để quản lý thông tin bảo hiểm.
    """
    serializer_class = InsuranceInformationSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        """Lấy danh sách thông tin bảo hiểm dựa trên quyền"""
        if self.request.user.role == 'ADMIN':
            return InsuranceInformation.objects.all()
        elif self.request.user.role == 'INSURANCE':
            return InsuranceInformation.objects.filter(provider__user=self.request.user)
        elif self.request.user.role == 'PATIENT':
            return InsuranceInformation.objects.filter(covered_patients__user=self.request.user)
        return InsuranceInformation.objects.none()

# ============================================================
# Specialty and Department ViewSets
# ============================================================

class SpecialtyViewSet(viewsets.ViewSet):
    """
    ViewSet để lấy danh sách chuyên khoa.
    """
    permission_classes = [permissions.IsAuthenticated]

    def list(self, request):
        """Lấy danh sách chuyên khoa"""
        # Lấy tham số department nếu có
        department = request.query_params.get('department', None)

        # Lấy danh sách chuyên khoa từ model DoctorProfile
        specialties = []
        for choice in DoctorProfile.SPECIALIZATION_CHOICES:
            specialty_id = choice[0]

            # Nếu có tham số department, chỉ trả về các chuyên khoa thuộc khoa đó
            if department:
                # Kiểm tra xem chuyên khoa có thuộc khoa được chọn không
                if department == 'KHOA_NOI' and specialty_id.startswith('NOI_'):
                    specialties.append({
                        'id': specialty_id,
                        'name': choice[1],
                        'description': _get_description_for_specialty(specialty_id),
                        'department': department
                    })
                elif department == 'KHOA_NGOAI' and specialty_id.startswith('NGOAI_'):
                    specialties.append({
                        'id': specialty_id,
                        'name': choice[1],
                        'description': _get_description_for_specialty(specialty_id),
                        'department': department
                    })
                elif department == 'KHOA_SAN' and (specialty_id.startswith('SAN_') or specialty_id.startswith('PHU_') or specialty_id == 'VO_SINH'):
                    specialties.append({
                        'id': specialty_id,
                        'name': choice[1],
                        'description': _get_description_for_specialty(specialty_id),
                        'department': department
                    })
                elif department == 'KHOA_NHI' and specialty_id.startswith('NHI_'):
                    specialties.append({
                        'id': specialty_id,
                        'name': choice[1],
                        'description': _get_description_for_specialty(specialty_id),
                        'department': department
                    })
                elif department == 'KHOA_MAT' and specialty_id == 'MAT':
                    specialties.append({
                        'id': specialty_id,
                        'name': choice[1],
                        'description': _get_description_for_specialty(specialty_id),
                        'department': department
                    })
                elif department == 'KHOA_TMH' and specialty_id == 'TAI_MUI_HONG':
                    specialties.append({
                        'id': specialty_id,
                        'name': choice[1],
                        'description': _get_description_for_specialty(specialty_id),
                        'department': department
                    })
                elif department == 'KHOA_RHM' and specialty_id == 'RANG_HAM_MAT':
                    specialties.append({
                        'id': specialty_id,
                        'name': choice[1],
                        'description': _get_description_for_specialty(specialty_id),
                        'department': department
                    })
                elif department == 'KHOA_UNG_BUOU' and specialty_id == 'UNG_BUOU':
                    specialties.append({
                        'id': specialty_id,
                        'name': choice[1],
                        'description': _get_description_for_specialty(specialty_id),
                        'department': department
                    })
            else:
                # Nếu không có tham số department, trả về tất cả chuyên khoa
                # Xác định khoa cho chuyên khoa
                department_id = None
                if specialty_id.startswith('NOI_'):
                    department_id = 'KHOA_NOI'
                elif specialty_id.startswith('NGOAI_'):
                    department_id = 'KHOA_NGOAI'
                elif specialty_id.startswith('SAN_') or specialty_id.startswith('PHU_') or specialty_id == 'VO_SINH':
                    department_id = 'KHOA_SAN'
                elif specialty_id.startswith('NHI_'):
                    department_id = 'KHOA_NHI'
                elif specialty_id == 'MAT':
                    department_id = 'KHOA_MAT'
                elif specialty_id == 'TAI_MUI_HONG':
                    department_id = 'KHOA_TMH'
                elif specialty_id == 'RANG_HAM_MAT':
                    department_id = 'KHOA_RHM'
                elif specialty_id == 'UNG_BUOU':
                    department_id = 'KHOA_UNG_BUOU'

                specialties.append({
                    'id': specialty_id,
                    'name': choice[1],
                    'description': _get_description_for_specialty(specialty_id),
                    'department': department_id
                })

        return Response(specialties)

class DepartmentViewSet(viewsets.ViewSet):
    """
    ViewSet để lấy danh sách khoa.
    """
    permission_classes = [permissions.IsAuthenticated]

    def list(self, request):
        """Lấy danh sách khoa"""
        # Lấy danh sách khoa từ model NurseProfile
        departments = []
        for choice in NurseProfile.DEPARTMENT_CHOICES:
            department_id = choice[0]

            # Đếm số lượng chuyên khoa thuộc khoa này
            specialty_count = 0
            specialties = []

            for specialty in DoctorProfile.SPECIALIZATION_CHOICES:
                specialty_id = specialty[0]

                # Kiểm tra xem chuyên khoa có thuộc khoa này không
                if department_id == 'KHOA_NOI' and specialty_id.startswith('NOI_'):
                    specialty_count += 1
                    specialties.append(specialty_id)
                elif department_id == 'KHOA_NGOAI' and specialty_id.startswith('NGOAI_'):
                    specialty_count += 1
                    specialties.append(specialty_id)
                elif department_id == 'KHOA_SAN' and (specialty_id.startswith('SAN_') or specialty_id.startswith('PHU_') or specialty_id == 'VO_SINH'):
                    specialty_count += 1
                    specialties.append(specialty_id)
                elif department_id == 'KHOA_NHI' and specialty_id.startswith('NHI_'):
                    specialty_count += 1
                    specialties.append(specialty_id)
                elif department_id == 'KHOA_MAT' and specialty_id == 'MAT':
                    specialty_count += 1
                    specialties.append(specialty_id)
                elif department_id == 'KHOA_TMH' and specialty_id == 'TAI_MUI_HONG':
                    specialty_count += 1
                    specialties.append(specialty_id)
                elif department_id == 'KHOA_RHM' and specialty_id == 'RANG_HAM_MAT':
                    specialty_count += 1
                    specialties.append(specialty_id)
                elif department_id == 'KHOA_UNG_BUOU' and specialty_id == 'UNG_BUOU':
                    specialty_count += 1
                    specialties.append(specialty_id)

            departments.append({
                'id': department_id,
                'name': choice[1],
                'description': _get_description_for_department(department_id),
                'specialty_count': specialty_count,
                'specialties': specialties
            })

        return Response(departments)

# ============================================================
# Doctor List ViewSet
# ============================================================

class DoctorListViewSet(viewsets.ReadOnlyModelViewSet):
    """
    ViewSet để lấy danh sách bác sĩ.
    """
    serializer_class = DoctorProfileSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        """Lấy danh sách bác sĩ với các bộ lọc"""
        queryset = DoctorProfile.objects.all()

        # Lọc theo chuyên khoa
        specialization = self.request.query_params.get('specialization')
        if specialization:
            queryset = queryset.filter(specialization=specialization)

        # Lọc theo khoa
        department = self.request.query_params.get('department')
        if department:
            queryset = queryset.filter(department=department)

        # Lọc theo trạng thái
        availability = self.request.query_params.get('availability')
        if availability:
            queryset = queryset.filter(availability_status=availability)

        # Lọc theo tên
        name = self.request.query_params.get('name')
        if name:
            queryset = queryset.filter(
                Q(user__first_name__icontains=name) |
                Q(user__last_name__icontains=name)
            )

        return queryset
