from django.db import models
from django.utils import timezone
from authentication.models import User

class Address(models.Model):
    """Địa chỉ của người dùng"""
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='addresses')
    street = models.CharField(max_length=255)
    city = models.CharField(max_length=100)
    state = models.CharField(max_length=100)
    postal_code = models.CharField(max_length=20)
    country = models.CharField(max_length=100)
    is_primary = models.BooleanField(default=False)
    address_type = models.CharField(max_length=20, choices=[
        ('HOME', 'Home'),
        ('WORK', 'Work'),
        ('BILLING', 'Billing'),
        ('OTHER', 'Other')
    ], default='HOME')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.user.email} - {self.address_type}: {self.street}, {self.city}"

    class Meta:
        verbose_name = "Address"
        verbose_name_plural = "Addresses"
        ordering = ['-is_primary', '-created_at']

class ContactInfo(models.Model):
    """Thông tin liên hệ của người dùng"""
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='contact_info')
    phone_number = models.CharField(max_length=20)
    secondary_phone = models.CharField(max_length=20, blank=True, null=True)
    work_phone = models.CharField(max_length=20, blank=True, null=True)
    emergency_contact_name = models.CharField(max_length=100, blank=True, null=True)
    emergency_contact_relationship = models.CharField(max_length=50, blank=True, null=True)
    emergency_contact_phone = models.CharField(max_length=20, blank=True, null=True)
    preferred_contact_method = models.CharField(max_length=20, choices=[
        ('EMAIL', 'Email'),
        ('PHONE', 'Phone'),
        ('SMS', 'SMS')
    ], default='EMAIL')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.user.email} - {self.phone_number}"

    class Meta:
        verbose_name = "Contact Information"
        verbose_name_plural = "Contact Information"

class UserDocument(models.Model):
    """Tài liệu của người dùng (ID, giấy phép, chứng chỉ, v.v.)"""
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='documents')
    document_type = models.CharField(max_length=50, choices=[
        ('ID_CARD', 'ID Card'),
        ('PASSPORT', 'Passport'),
        ('DRIVER_LICENSE', 'Driver License'),
        ('MEDICAL_LICENSE', 'Medical License'),
        ('INSURANCE_CARD', 'Insurance Card'),
        ('CERTIFICATION', 'Certification'),
        ('OTHER', 'Other')
    ])
    document_number = models.CharField(max_length=100)
    issue_date = models.DateField()
    expiry_date = models.DateField(null=True, blank=True)
    issuing_authority = models.CharField(max_length=200)
    document_file = models.CharField(max_length=255, help_text="Path to document file in storage service")
    is_verified = models.BooleanField(default=False)
    verification_date = models.DateTimeField(null=True, blank=True)
    verification_notes = models.TextField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.user.email} - {self.document_type}: {self.document_number}"

    class Meta:
        verbose_name = "User Document"
        verbose_name_plural = "User Documents"
        unique_together = ['user', 'document_type', 'document_number']

    def verify(self, notes=None):
        """Xác minh tài liệu"""
        self.is_verified = True
        self.verification_date = timezone.now()
        if notes:
            self.verification_notes = notes
        self.save()

class PatientProfile(models.Model):
    """Hồ sơ bệnh nhân"""
    GENDER_CHOICES = [
        ('M', 'Male'),
        ('F', 'Female'),
        ('O', 'Other'),
    ]

    BLOOD_TYPE_CHOICES = [
        ('A+', 'A+'),
        ('A-', 'A-'),
        ('B+', 'B+'),
        ('B-', 'B-'),
        ('AB+', 'AB+'),
        ('AB-', 'AB-'),
        ('O+', 'O+'),
        ('O-', 'O-'),
    ]

    MARITAL_STATUS_CHOICES = [
        ('SINGLE', 'Single'),
        ('MARRIED', 'Married'),
        ('DIVORCED', 'Divorced'),
        ('WIDOWED', 'Widowed'),
        ('OTHER', 'Other'),
    ]

    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='patient_profile')
    date_of_birth = models.DateField(null=True, blank=True)
    gender = models.CharField(max_length=1, choices=GENDER_CHOICES, null=True, blank=True)
    blood_type = models.CharField(max_length=3, choices=BLOOD_TYPE_CHOICES, blank=True, null=True)
    height = models.DecimalField(max_digits=5, decimal_places=2, help_text="Height in cm", null=True, blank=True)
    weight = models.DecimalField(max_digits=5, decimal_places=2, help_text="Weight in kg", null=True, blank=True)
    allergies = models.TextField(blank=True, null=True)
    medical_conditions = models.TextField(blank=True, null=True)
    current_medications = models.TextField(blank=True, null=True, help_text="List of current medications")
    family_medical_history = models.TextField(blank=True, null=True)
    emergency_contact = models.ForeignKey(ContactInfo, on_delete=models.SET_NULL, null=True, blank=True, related_name='emergency_for_patients')
    primary_language = models.CharField(max_length=50, default='English')
    requires_translator = models.BooleanField(default=False)
    marital_status = models.CharField(max_length=20, choices=MARITAL_STATUS_CHOICES, blank=True, null=True)
    occupation = models.CharField(max_length=100, blank=True, null=True)
    primary_care_physician = models.ForeignKey('DoctorProfile', on_delete=models.SET_NULL, null=True, blank=True, related_name='primary_patients')
    preferred_pharmacy = models.ForeignKey('PharmacistProfile', on_delete=models.SET_NULL, null=True, blank=True, related_name='preferred_by_patients')
    insurance_information = models.ForeignKey('InsuranceInformation', on_delete=models.SET_NULL, null=True, blank=True, related_name='covered_patients')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.user.first_name} {self.user.last_name} - Patient Profile"

    def get_age(self):
        """Tính tuổi của bệnh nhân"""
        if not self.date_of_birth:
            return None
        today = timezone.now().date()
        return today.year - self.date_of_birth.year - ((today.month, today.day) < (self.date_of_birth.month, self.date_of_birth.day))

    def get_bmi(self):
        """Tính chỉ số BMI"""
        if self.height and self.weight and self.height > 0:
            # Convert height from cm to m
            height_m = self.height / 100
            return round(self.weight / (height_m * height_m), 2)
        return None

    class Meta:
        verbose_name = "Patient Profile"
        verbose_name_plural = "Patient Profiles"

class DoctorProfile(models.Model):
    """Hồ sơ bác sĩ"""
    SPECIALIZATION_CHOICES = [
        # Chuyên khoa thuộc Khoa Nội
        ('NOI_TIM_MACH', 'Chuyên khoa Tim mạch'),
        ('NOI_TIEU_HOA', 'Chuyên khoa Tiêu hóa'),
        ('NOI_HO_HAP', 'Chuyên khoa Hô hấp'),
        ('NOI_THAN', 'Chuyên khoa Thận - Tiết niệu'),
        ('NOI_TIET', 'Chuyên khoa Nội tiết'),
        ('NOI_THAN_KINH', 'Chuyên khoa Thần kinh'),
        ('NOI_DA_LIEU', 'Chuyên khoa Da liễu'),
        ('NOI_TONG_QUAT', 'Chuyên khoa Nội tổng quát'),

        # Chuyên khoa thuộc Khoa Ngoại
        ('NGOAI_CHINH_HINH', 'Chuyên khoa Chấn thương chỉnh hình'),
        ('NGOAI_TIET_NIEU', 'Chuyên khoa Tiết niệu'),
        ('NGOAI_THAN_KINH', 'Chuyên khoa Thần kinh'),
        ('NGOAI_LONG_NGUC', 'Chuyên khoa Lồng ngực - Mạch máu'),
        ('NGOAI_TIEU_HOA', 'Chuyên khoa Tiêu hóa'),
        ('NGOAI_TONG_QUAT', 'Chuyên khoa Ngoại tổng quát'),

        # Chuyên khoa thuộc Khoa Sản - Phụ khoa
        ('SAN_KHOA', 'Chuyên khoa Sản'),
        ('PHU_KHOA', 'Chuyên khoa Phụ khoa'),
        ('VO_SINH', 'Chuyên khoa Vô sinh - Hiếm muộn'),

        # Chuyên khoa thuộc Khoa Nhi
        ('NHI_TONG_QUAT', 'Chuyên khoa Nhi Tổng quát'),
        ('NHI_TIM_MACH', 'Chuyên khoa Nhi Tim mạch'),
        ('NHI_THAN_KINH', 'Chuyên khoa Nhi Thần kinh'),
        ('NHI_SO_SINH', 'Chuyên khoa Sơ sinh'),

        # Các chuyên khoa khác
        ('MAT', 'Chuyên khoa Mắt'),
        ('TAI_MUI_HONG', 'Chuyên khoa Tai Mũi Họng'),
        ('RANG_HAM_MAT', 'Chuyên khoa Răng Hàm Mặt'),
        ('TAM_THAN', 'Chuyên khoa Tâm thần'),
        ('UNG_BUOU', 'Chuyên khoa Ung bướu'),
        ('DA_KHOA', 'Đa khoa'),
        ('KHAC', 'Chuyên khoa khác'),
    ]

    AVAILABILITY_STATUS_CHOICES = [
        ('AVAILABLE', 'Available'),
        ('UNAVAILABLE', 'Unavailable'),
        ('ON_LEAVE', 'On Leave'),
        ('EMERGENCY_ONLY', 'Emergency Only'),
    ]

    WORKING_DAYS_CHOICES = [
        ('MON', 'Monday'),
        ('TUE', 'Tuesday'),
        ('WED', 'Wednesday'),
        ('THU', 'Thursday'),
        ('FRI', 'Friday'),
        ('SAT', 'Saturday'),
        ('SUN', 'Sunday'),
    ]

    # Thông tin cơ bản (bắt buộc)
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='doctor_profile')
    specialization = models.CharField(max_length=100, choices=SPECIALIZATION_CHOICES)
    license_number = models.CharField(max_length=50, unique=True)
    years_of_experience = models.PositiveIntegerField()

    # Thông tin làm việc (bắt buộc)
    department = models.CharField(max_length=100, default="General")
    consultation_fee = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    availability_status = models.CharField(max_length=20, choices=AVAILABILITY_STATUS_CHOICES, default='AVAILABLE')
    max_patients_per_day = models.PositiveIntegerField(default=20)

    # Thông tin lịch làm việc (bắt buộc)
    working_days = models.CharField(max_length=100, default="MON,TUE,WED,THU,FRI", help_text="Comma separated days, e.g., 'MON,TUE,WED,THU,FRI'")
    working_hours = models.CharField(max_length=100, default="08:00-17:00", help_text="Format: '09:00-17:00'")

    # Thông tin bổ sung (không bắt buộc)
    secondary_specialization = models.CharField(max_length=100, choices=SPECIALIZATION_CHOICES, blank=True, null=True)
    license_expiry_date = models.DateField(null=True, blank=True)
    education = models.CharField(max_length=255, blank=True, null=True)
    board_certifications = models.TextField(blank=True, null=True)
    short_bio = models.CharField(max_length=500, blank=True, null=True)
    languages_spoken = models.CharField(max_length=200, default='Tiếng Việt')
    profile_picture = models.CharField(max_length=255, blank=True, null=True, help_text="Path to profile picture in storage service")

    # Thông tin đánh giá (tự động)
    average_rating = models.DecimalField(max_digits=3, decimal_places=2, default=0.0)
    rating_count = models.PositiveIntegerField(default=0)

    # Thời gian
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"Dr. {self.user.first_name} {self.user.last_name} - {self.specialization}"

    def update_rating(self, new_rating):
        """Cập nhật đánh giá trung bình"""
        if self.rating_count == 0:
            self.average_rating = new_rating
        else:
            total_rating = self.average_rating * self.rating_count
            self.average_rating = (total_rating + new_rating) / (self.rating_count + 1)
        self.rating_count += 1
        self.save()

    class Meta:
        verbose_name = "Doctor Profile"
        verbose_name_plural = "Doctor Profiles"

class NurseProfile(models.Model):
    """Hồ sơ y tá"""
    DEPARTMENT_CHOICES = [
        ('KHOA_NOI', 'Khoa Nội'),
        ('KHOA_NGOAI', 'Khoa Ngoại'),
        ('KHOA_SAN', 'Khoa Sản - Phụ khoa'),
        ('KHOA_NHI', 'Khoa Nhi'),
        ('KHOA_CAP_CUU', 'Khoa Cấp cứu'),
        ('KHOA_XET_NGHIEM', 'Khoa Xét nghiệm'),
        ('KHOA_CHAN_DOAN_HINH_ANH', 'Khoa Chẩn đoán hình ảnh'),
        ('KHOA_MAT', 'Khoa Mắt'),
        ('KHOA_TMH', 'Khoa Tai Mũi Họng'),
        ('KHOA_RHM', 'Khoa Răng Hàm Mặt'),
        ('KHOA_UNG_BUOU', 'Khoa Ung bướu'),
        ('KHOA_HOI_SUC', 'Khoa Hồi sức tích cực (ICU)'),
        ('KHOA_KHAC', 'Khoa khác'),
    ]

    NURSE_TYPE_CHOICES = [
        ('RN', 'Registered Nurse'),
        ('LPN', 'Licensed Practical Nurse'),
        ('NP', 'Nurse Practitioner'),
        ('CNA', 'Certified Nursing Assistant'),
        ('SPECIALIST', 'Specialist Nurse'),
        ('OTHER', 'Other'),
    ]

    SHIFT_CHOICES = [
        ('MORNING', 'Morning Shift'),
        ('AFTERNOON', 'Afternoon Shift'),
        ('NIGHT', 'Night Shift'),
        ('ROTATING', 'Rotating Shift'),
    ]

    # Thông tin cơ bản (bắt buộc)
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='nurse_profile')
    license_number = models.CharField(max_length=50, unique=True)
    nurse_type = models.CharField(max_length=20, choices=NURSE_TYPE_CHOICES, default='RN')

    # Thông tin làm việc (bắt buộc)
    department = models.CharField(max_length=100, choices=DEPARTMENT_CHOICES)
    shift_preference = models.CharField(max_length=20, choices=SHIFT_CHOICES, default='ROTATING')
    years_of_experience = models.PositiveIntegerField(default=0)

    # Thông tin bổ sung (không bắt buộc)
    license_expiry_date = models.DateField(null=True, blank=True)
    specialization = models.CharField(max_length=100, blank=True, null=True)
    education = models.CharField(max_length=255, blank=True, null=True)
    certifications = models.CharField(max_length=255, blank=True, null=True)
    languages_spoken = models.CharField(max_length=200, default='Tiếng Việt')
    supervisor = models.ForeignKey('self', on_delete=models.SET_NULL, null=True, blank=True, related_name='supervised_nurses')
    profile_picture = models.CharField(max_length=255, blank=True, null=True, help_text="Path to profile picture in storage service")

    # Thời gian
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.user.first_name} {self.user.last_name} - {self.nurse_type} ({self.department})"

    class Meta:
        verbose_name = "Nurse Profile"
        verbose_name_plural = "Nurse Profiles"

class PharmacistProfile(models.Model):
    """Hồ sơ dược sĩ"""
    SPECIALIZATION_CHOICES = [
        ('CLINICAL', 'Clinical Pharmacist'),
        ('RETAIL', 'Retail Pharmacist'),
        ('HOSPITAL', 'Hospital Pharmacist'),
        ('RESEARCH', 'Research Pharmacist'),
        ('INDUSTRIAL', 'Industrial Pharmacist'),
        ('CONSULTANT', 'Consultant Pharmacist'),
        ('ONCOLOGY', 'Oncology Pharmacist'),
        ('PEDIATRIC', 'Pediatric Pharmacist'),
        ('GERIATRIC', 'Geriatric Pharmacist'),
        ('OTHER', 'Other'),
    ]

    # Thông tin cơ bản (bắt buộc)
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='pharmacist_profile')
    license_number = models.CharField(max_length=50, unique=True)
    specialization = models.CharField(max_length=50, choices=SPECIALIZATION_CHOICES, default='RETAIL')

    # Thông tin làm việc (bắt buộc)
    pharmacy_name = models.CharField(max_length=200, default="General Pharmacy")
    pharmacy_address = models.ForeignKey(Address, on_delete=models.SET_NULL, null=True, blank=True, related_name='pharmacies')
    years_of_experience = models.PositiveIntegerField(default=0)
    is_pharmacy_manager = models.BooleanField(default=False)

    # Thông tin bổ sung (không bắt buộc)
    license_expiry_date = models.DateField(null=True, blank=True)
    education = models.CharField(max_length=255, blank=True, null=True)
    certifications = models.CharField(max_length=255, blank=True, null=True)
    languages_spoken = models.CharField(max_length=200, default='Tiếng Việt')
    profile_picture = models.CharField(max_length=255, blank=True, null=True, help_text="Path to profile picture in storage service")

    # Thời gian
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        pharmacy_info = f" at {self.pharmacy_name}" if self.pharmacy_name else ""
        return f"{self.user.first_name} {self.user.last_name} - Pharmacist{pharmacy_info}"

    class Meta:
        verbose_name = "Pharmacist Profile"
        verbose_name_plural = "Pharmacist Profiles"

class InsuranceInformation(models.Model):
    """Thông tin bảo hiểm"""
    INSURANCE_TYPE_CHOICES = [
        ('HEALTH', 'Health Insurance'),
        ('DENTAL', 'Dental Insurance'),
        ('VISION', 'Vision Insurance'),
        ('LIFE', 'Life Insurance'),
        ('DISABILITY', 'Disability Insurance'),
        ('OTHER', 'Other'),
    ]

    COVERAGE_LEVEL_CHOICES = [
        ('BASIC', 'Basic'),
        ('STANDARD', 'Standard'),
        ('PREMIUM', 'Premium'),
        ('COMPREHENSIVE', 'Comprehensive'),
        ('CUSTOM', 'Custom'),
    ]

    provider = models.ForeignKey('InsuranceProviderProfile', on_delete=models.CASCADE, related_name='insurance_plans')
    insurance_type = models.CharField(max_length=20, choices=INSURANCE_TYPE_CHOICES, default='HEALTH')
    policy_number = models.CharField(max_length=100)
    group_number = models.CharField(max_length=100, blank=True, null=True)
    member_id = models.CharField(max_length=100, blank=True, null=True)
    subscriber_name = models.CharField(max_length=200)
    subscriber_relationship = models.CharField(max_length=50, default='SELF')
    coverage_start_date = models.DateField()
    coverage_end_date = models.DateField(null=True, blank=True)
    coverage_level = models.CharField(max_length=20, choices=COVERAGE_LEVEL_CHOICES, default='STANDARD')
    deductible = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    copay = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    coinsurance_rate = models.DecimalField(max_digits=5, decimal_places=2, null=True, blank=True, help_text="Percentage as decimal (e.g., 0.20 for 20%)")
    max_out_of_pocket = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    is_active = models.BooleanField(default=True)
    notes = models.TextField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.subscriber_name} - {self.provider.company_name} ({self.policy_number})"

    class Meta:
        verbose_name = "Insurance Information"
        verbose_name_plural = "Insurance Information"
        unique_together = ['provider', 'policy_number']

class InsuranceProviderProfile(models.Model):
    """Hồ sơ nhà cung cấp bảo hiểm"""
    # Thông tin cơ bản (bắt buộc)
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='insurance_provider_profile')
    company_name = models.CharField(max_length=200)
    provider_id = models.CharField(max_length=100, unique=True)

    # Thông tin liên hệ (bắt buộc)
    contact_person = models.CharField(max_length=200)
    contact_email = models.EmailField()
    contact_phone = models.CharField(max_length=20)
    address = models.ForeignKey(Address, on_delete=models.SET_NULL, null=True, blank=True, related_name='insurance_providers')

    # Thông tin dịch vụ (bắt buộc)
    service_areas = models.CharField(max_length=500, default="All Areas", help_text="Comma-separated list of service areas")
    available_plans = models.CharField(max_length=500, default="Basic, Standard, Premium", help_text="Description of available insurance plans")

    # Thông tin bổ sung (không bắt buộc)
    website = models.URLField(blank=True, null=True)
    established_year = models.PositiveIntegerField(null=True, blank=True)

    # Thời gian
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.company_name} ({self.provider_id})"

    class Meta:
        verbose_name = "Insurance Provider Profile"
        verbose_name_plural = "Insurance Provider Profiles"

class LabTechnicianProfile(models.Model):
    """Hồ sơ kỹ thuật viên phòng thí nghiệm"""
    SPECIALIZATION_CHOICES = [
        ('HEMATOLOGY', 'Hematology'),
        ('MICROBIOLOGY', 'Microbiology'),
        ('BIOCHEMISTRY', 'Biochemistry'),
        ('IMMUNOLOGY', 'Immunology'),
        ('PATHOLOGY', 'Pathology'),
        ('TOXICOLOGY', 'Toxicology'),
        ('GENETICS', 'Genetics'),
        ('GENERAL', 'General Laboratory'),
        ('OTHER', 'Other'),
    ]

    # Thông tin cơ bản (bắt buộc)
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='lab_technician_profile')
    license_number = models.CharField(max_length=50, unique=True)
    specialization = models.CharField(max_length=50, choices=SPECIALIZATION_CHOICES, default='GENERAL')

    # Thông tin làm việc (bắt buộc)
    laboratory_name = models.CharField(max_length=200)
    laboratory_address = models.ForeignKey(Address, on_delete=models.SET_NULL, null=True, blank=True, related_name='laboratories')
    years_of_experience = models.PositiveIntegerField(default=0)

    # Thông tin bổ sung (không bắt buộc)
    license_expiry_date = models.DateField(null=True, blank=True)
    education = models.CharField(max_length=255, blank=True, null=True)
    certifications = models.CharField(max_length=255, blank=True, null=True)
    supervisor = models.CharField(max_length=200, blank=True, null=True)
    equipment_expertise = models.CharField(max_length=500, blank=True, null=True, help_text="List of laboratory equipment the technician is proficient with")
    profile_picture = models.CharField(max_length=255, blank=True, null=True, help_text="Path to profile picture in storage service")

    # Thời gian
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.user.first_name} {self.user.last_name} - Lab Technician ({self.specialization})"

    class Meta:
        verbose_name = "Lab Technician Profile"
        verbose_name_plural = "Lab Technician Profiles"

class AdminProfile(models.Model):
    """Hồ sơ quản trị viên"""
    ADMIN_TYPE_CHOICES = [
        ('SYSTEM', 'System Administrator'),
        ('HOSPITAL', 'Hospital Administrator'),
        ('DEPARTMENT', 'Department Administrator'),
        ('CLINIC', 'Clinic Administrator'),
        ('BILLING', 'Billing Administrator'),
        ('HR', 'Human Resources Administrator'),
        ('OTHER', 'Other'),
    ]

    ACCESS_LEVEL_CHOICES = [
        (1, 'Level 1 - Basic Access'),
        (2, 'Level 2 - Standard Access'),
        (3, 'Level 3 - Enhanced Access'),
        (4, 'Level 4 - Advanced Access'),
        (5, 'Level 5 - Full Access'),
    ]

    # Thông tin cơ bản (bắt buộc)
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='admin_profile')
    admin_type = models.CharField(max_length=20, choices=ADMIN_TYPE_CHOICES, default='HOSPITAL')
    employee_id = models.CharField(max_length=50, unique=True)

    # Thông tin quyền hạn (bắt buộc)
    position = models.CharField(max_length=100)
    access_level = models.PositiveIntegerField(choices=ACCESS_LEVEL_CHOICES, default=1, help_text="1-5, with 5 being highest access")

    # Thông tin bổ sung (không bắt buộc)
    department = models.CharField(max_length=100, blank=True, null=True)
    responsibilities = models.CharField(max_length=500, blank=True, null=True)
    supervisor = models.ForeignKey('self', on_delete=models.SET_NULL, null=True, blank=True, related_name='supervised_admins')
    profile_picture = models.CharField(max_length=255, blank=True, null=True, help_text="Path to profile picture in storage service")

    # Thời gian
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.user.first_name} {self.user.last_name} - {self.admin_type} Administrator"

    class Meta:
        verbose_name = "Administrator Profile"
        verbose_name_plural = "Administrator Profiles"

