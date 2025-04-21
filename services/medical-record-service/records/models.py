from django.db import models
from django.utils import timezone

class MedicalRecord(models.Model):
    """Hồ sơ y tế tổng thể của bệnh nhân"""
    patient_id = models.IntegerField(help_text="ID của bệnh nhân trong user-service", unique=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"Medical Record for Patient {self.patient_id}"

    class Meta:
        verbose_name = "Medical Record"
        verbose_name_plural = "Medical Records"

class Encounter(models.Model):
    """Phiên khám bệnh - mỗi lần bệnh nhân đến khám"""
    medical_record = models.ForeignKey(MedicalRecord, on_delete=models.CASCADE, related_name='encounters')
    encounter_date = models.DateTimeField(default=timezone.now)
    doctor_id = models.IntegerField(help_text="ID của bác sĩ phụ trách phiên khám", null=True, blank=True)
    appointment_id = models.IntegerField(help_text="ID của cuộc hẹn trong appointment-service", null=True, blank=True)
    chief_complaint = models.TextField(help_text="Lý do khám chính", blank=True, null=True)
    encounter_type = models.CharField(max_length=20, choices=[
        ('OUTPATIENT', 'Outpatient'),
        ('INPATIENT', 'Inpatient'),
        ('EMERGENCY', 'Emergency'),
        ('FOLLOWUP', 'Follow-up'),
        ('TELECONSULTATION', 'Teleconsultation'),
    ], default='OUTPATIENT')
    notes = models.TextField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"Encounter on {self.encounter_date.strftime('%Y-%m-%d %H:%M')}"

    class Meta:
        verbose_name = "Encounter"
        verbose_name_plural = "Encounters"
        ordering = ['-encounter_date']

class Diagnosis(models.Model):
    """Chẩn đoán bệnh thuộc phiên khám"""
    encounter = models.ForeignKey(Encounter, on_delete=models.CASCADE, related_name='diagnoses')
    doctor_id = models.IntegerField(help_text="ID của bác sĩ trong user-service")
    diagnosis_code = models.CharField(max_length=20, help_text="Mã chẩn đoán (ICD-10)")
    diagnosis_description = models.TextField()
    diagnosis_date = models.DateField()
    notes = models.TextField(blank=True, null=True)
    prescription_ids = models.JSONField(default=list, blank=True, help_text="Danh sách ID của các đơn thuốc liên quan từ pharmacy-service")
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.diagnosis_code} - {self.diagnosis_description[:30]}"

    class Meta:
        verbose_name = "Diagnosis"
        verbose_name_plural = "Diagnoses"
        ordering = ['-diagnosis_date']

class Treatment(models.Model):
    """Phương pháp điều trị cho chẩn đoán"""
    TREATMENT_TYPE_CHOICES = [
        ('MEDICATION', 'Medication'),
        ('SURGERY', 'Surgery'),
        ('THERAPY', 'Therapy'),
        ('PROCEDURE', 'Procedure'),
        ('OTHER', 'Other'),
    ]

    diagnosis = models.ForeignKey(Diagnosis, on_delete=models.CASCADE, related_name='treatments')
    treatment_type = models.CharField(max_length=50, choices=TREATMENT_TYPE_CHOICES)
    treatment_description = models.TextField()
    start_date = models.DateField()
    end_date = models.DateField(null=True, blank=True)
    notes = models.TextField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.treatment_type} for {self.diagnosis}"

    class Meta:
        verbose_name = "Treatment"
        verbose_name_plural = "Treatments"
        ordering = ['-start_date']

class Allergy(models.Model):
    """Thông tin dị ứng – dữ liệu chung thuộc MedicalRecord"""
    SEVERITY_CHOICES = [
        ('MILD', 'Mild'),
        ('MODERATE', 'Moderate'),
        ('SEVERE', 'Severe'),
        ('LIFE_THREATENING', 'Life-threatening'),
    ]

    medical_record = models.ForeignKey(MedicalRecord, on_delete=models.CASCADE, related_name='allergies')
    allergy_type = models.CharField(max_length=50, help_text="Loại dị ứng (thuốc, thực phẩm, môi trường, v.v.)")
    allergy_name = models.CharField(max_length=100)
    severity = models.CharField(max_length=20, choices=SEVERITY_CHOICES)
    reaction = models.TextField(help_text="Mô tả phản ứng dị ứng")
    notes = models.TextField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.allergy_name} ({self.severity})"

    class Meta:
        verbose_name = "Allergy"
        verbose_name_plural = "Allergies"
        unique_together = ['medical_record', 'allergy_name']

class Immunization(models.Model):
    """Thông tin tiêm chủng thuộc phiên khám"""
    encounter = models.ForeignKey(Encounter, on_delete=models.CASCADE, related_name='immunizations')
    vaccine_name = models.CharField(max_length=100)
    administration_date = models.DateField()
    dose = models.CharField(max_length=20, help_text="Liều lượng hoặc số thứ tự của mũi tiêm")
    administered_by = models.IntegerField(help_text="ID của nhân viên y tế trong user-service", null=True, blank=True)
    notes = models.TextField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.vaccine_name} on {self.administration_date}"

    class Meta:
        verbose_name = "Immunization"
        verbose_name_plural = "Immunizations"
        ordering = ['-administration_date']

class MedicalHistory(models.Model):
    """Lịch sử bệnh án – dữ liệu chung thuộc MedicalRecord"""
    medical_record = models.ForeignKey(MedicalRecord, on_delete=models.CASCADE, related_name='medical_histories')
    condition_name = models.CharField(max_length=100)
    diagnosis_date = models.DateField()
    resolution_date = models.DateField(null=True, blank=True)
    is_chronic = models.BooleanField(default=False)
    notes = models.TextField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        status = "Chronic" if self.is_chronic else "Resolved" if self.resolution_date else "Active"
        return f"{self.condition_name} ({status})"

    class Meta:
        verbose_name = "Medical History"
        verbose_name_plural = "Medical Histories"
        ordering = ['-diagnosis_date']

class Medication(models.Model):
    """Thông tin thuốc được kê trong phiên khám"""
    FREQUENCY_CHOICES = [
        ('ONCE', 'Once daily'),
        ('TWICE', 'Twice daily'),
        ('THREE', 'Three times daily'),
        ('FOUR', 'Four times daily'),
        ('AS_NEEDED', 'As needed'),
        ('OTHER', 'Other'),
    ]

    encounter = models.ForeignKey(Encounter, on_delete=models.CASCADE, related_name='medications')
    medication_name = models.CharField(max_length=100)
    dosage = models.CharField(max_length=50)
    frequency = models.CharField(max_length=20, choices=FREQUENCY_CHOICES)
    route = models.CharField(max_length=50, help_text="Đường dùng thuốc (uống, tiêm, v.v.)")
    start_date = models.DateField()
    end_date = models.DateField(null=True, blank=True)
    prescribed_by = models.IntegerField(help_text="ID của bác sĩ trong user-service")
    reason = models.TextField(help_text="Lý do sử dụng thuốc")
    notes = models.TextField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.medication_name} {self.dosage}"

    class Meta:
        verbose_name = "Medication"
        verbose_name_plural = "Medications"
        ordering = ['-start_date']

class VitalSign(models.Model):
    """Dấu hiệu sinh tồn thu thập trong phiên khám"""
    VITAL_TYPE_CHOICES = [
        ('TEMPERATURE', 'Temperature'),
        ('BLOOD_PRESSURE', 'Blood Pressure'),
        ('HEART_RATE', 'Heart Rate'),
        ('RESPIRATORY_RATE', 'Respiratory Rate'),
        ('OXYGEN_SATURATION', 'Oxygen Saturation'),
        ('HEIGHT', 'Height'),
        ('WEIGHT', 'Weight'),
        ('BMI', 'Body Mass Index'),
        ('OTHER', 'Other'),
    ]

    encounter = models.ForeignKey(Encounter, on_delete=models.CASCADE, related_name='vital_signs')
    vital_type = models.CharField(max_length=50, choices=VITAL_TYPE_CHOICES)
    value = models.CharField(max_length=50)
    unit = models.CharField(max_length=20)
    recorded_by = models.IntegerField(help_text="ID của nhân viên y tế trong user-service", null=True, blank=True)
    recorded_at = models.DateTimeField()
    notes = models.TextField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.vital_type}: {self.value} {self.unit}"

    class Meta:
        verbose_name = "Vital Sign"
        verbose_name_plural = "Vital Signs"
        ordering = ['-recorded_at']

class LabTest(models.Model):
    """Xét nghiệm y tế trong phiên khám"""
    STATUS_CHOICES = [
        ('ORDERED', 'Ordered'),
        ('SAMPLE_COLLECTED', 'Specimen Collected'),
        ('IN_PROGRESS', 'In Progress'),
        ('COMPLETED', 'Completed'),
        ('CANCELLED', 'Cancelled'),
    ]

    encounter = models.ForeignKey(Encounter, on_delete=models.CASCADE, related_name='lab_tests')
    test_name = models.CharField(max_length=100)
    test_code = models.CharField(max_length=50, blank=True, null=True)
    ordered_by = models.IntegerField(help_text="ID của bác sĩ trong user-service")
    ordered_at = models.DateTimeField()
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='ORDERED')
    collection_date = models.DateTimeField(null=True, blank=True)
    notes = models.TextField(blank=True, null=True)
    lab_service_id = models.IntegerField(help_text="ID của xét nghiệm trong laboratory-service", null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.test_name} ({self.status})"

    class Meta:
        verbose_name = "Lab Test"
        verbose_name_plural = "Lab Tests"
        ordering = ['-ordered_at']

class LabResult(models.Model):
    """Kết quả xét nghiệm của LabTest"""
    lab_test = models.ForeignKey(LabTest, on_delete=models.CASCADE, related_name='results')
    result_value = models.CharField(max_length=100)
    unit = models.CharField(max_length=20, blank=True, null=True)
    reference_range = models.CharField(max_length=100, blank=True, null=True)
    is_abnormal = models.BooleanField(default=False)
    performed_by = models.IntegerField(help_text="ID của kỹ thuật viên trong user-service", null=True, blank=True)
    performed_at = models.DateTimeField()
    notes = models.TextField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.lab_test.test_name}: {self.result_value} {self.unit or ''}"

    class Meta:
        verbose_name = "Lab Result"
        verbose_name_plural = "Lab Results"
        ordering = ['-performed_at']