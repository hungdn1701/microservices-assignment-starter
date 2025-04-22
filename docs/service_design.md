# Thiết kế chi tiết các Microservices

Tài liệu này mô tả chi tiết về các lớp, chức năng, templates và REST API của các microservices trong hệ thống Y tế.

## Mục lục

1. [Classes with attributes of service models (models)](#1-classes-with-attributes-of-service-models-models)
2. [Determine functions in services (views)](#2-determine-functions-in-services-views)
3. [Determine templates](#3-determine-templates)
4. [Determine REST API connecting services](#4-determine-rest-api-connecting-services)

## 1. Classes with attributes of service models (models)

Phần này mô tả chi tiết các lớp và thuộc tính của các models trong từng service.

### 1.1 User Service Models

#### 1.1.1 User

```python
class User(AbstractBaseUser, PermissionsMixin):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    email = models.EmailField(unique=True)
    first_name = models.CharField(max_length=100)
    last_name = models.CharField(max_length=100)
    role = models.CharField(max_length=20, choices=[
        ('ADMIN', 'Administrator'),
        ('DOCTOR', 'Doctor'),
        ('NURSE', 'Nurse'),
        ('PATIENT', 'Patient'),
        ('PHARMACIST', 'Pharmacist'),
        ('LAB_TECH', 'Lab Technician'),
        ('INSURANCE', 'Insurance Provider')
    ])
    is_active = models.BooleanField(default=True)
    is_staff = models.BooleanField(default=False)
    date_joined = models.DateTimeField(auto_now_add=True)
    last_login = models.DateTimeField(null=True, blank=True)

    objects = UserManager()

    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['first_name', 'last_name', 'role']

    def get_full_name(self):
        return f"{self.first_name} {self.last_name}"

    def get_short_name(self):
        return self.first_name
```

#### 1.1.2 Profile (Abstract Base Class)

```python
class Profile(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name="%(class)s_profile")
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        abstract = True
```

#### 1.1.3 PatientProfile

```python
class PatientProfile(Profile):
    date_of_birth = models.DateField()
    gender = models.CharField(max_length=10, choices=[
        ('MALE', 'Male'),
        ('FEMALE', 'Female'),
        ('OTHER', 'Other')
    ])
    blood_type = models.CharField(max_length=10, choices=[
        ('A_POSITIVE', 'A+'),
        ('A_NEGATIVE', 'A-'),
        ('B_POSITIVE', 'B+'),
        ('B_NEGATIVE', 'B-'),
        ('AB_POSITIVE', 'AB+'),
        ('AB_NEGATIVE', 'AB-'),
        ('O_POSITIVE', 'O+'),
        ('O_NEGATIVE', 'O-')
    ], null=True, blank=True)
    height = models.FloatField(null=True, blank=True)  # in cm
    weight = models.FloatField(null=True, blank=True)  # in kg
    allergies = models.TextField(null=True, blank=True)
    emergency_contact_name = models.CharField(max_length=200, null=True, blank=True)
    emergency_contact_phone = models.CharField(max_length=20, null=True, blank=True)

    def calculate_age(self):
        today = date.today()
        return today.year - self.date_of_birth.year - ((today.month, today.day) < (self.date_of_birth.month, self.date_of_birth.day))

    def calculate_bmi(self):
        if self.height and self.weight:
            return self.weight / ((self.height / 100) ** 2)
        return None
```

#### 1.1.4 DoctorProfile

```python
class DoctorProfile(Profile):
    specialty = models.CharField(max_length=100)
    license_number = models.CharField(max_length=50, unique=True)
    years_of_experience = models.PositiveIntegerField()
    education = models.TextField(null=True, blank=True)
    bio = models.TextField(null=True, blank=True)

    def is_available(self, date, time):
        # Logic to check if doctor is available at given date and time
        pass
```

#### 1.1.5 NurseProfile

```python
class NurseProfile(Profile):
    license_number = models.CharField(max_length=50, unique=True)
    department = models.CharField(max_length=100)
    years_of_experience = models.PositiveIntegerField()
```

#### 1.1.6 PharmacistProfile

```python
class PharmacistProfile(Profile):
    license_number = models.CharField(max_length=50, unique=True)
    years_of_experience = models.PositiveIntegerField()
```

#### 1.1.7 LabTechProfile

```python
class LabTechProfile(Profile):
    license_number = models.CharField(max_length=50, unique=True)
    specialization = models.CharField(max_length=100)
    years_of_experience = models.PositiveIntegerField()
```

#### 1.1.8 Address

```python
class Address(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='addresses')
    street = models.CharField(max_length=255)
    city = models.CharField(max_length=100)
    state = models.CharField(max_length=100)
    postal_code = models.CharField(max_length=20)
    country = models.CharField(max_length=100)
    is_primary = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def get_full_address(self):
        return f"{self.street}, {self.city}, {self.state} {self.postal_code}, {self.country}"
```

#### 1.1.9 UserActivity

```python
class UserActivity(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='activities')
    activity_type = models.CharField(max_length=50, choices=[
        ('LOGIN', 'Login'),
        ('LOGOUT', 'Logout'),
        ('PASSWORD_CHANGE', 'Password Change'),
        ('PROFILE_UPDATE', 'Profile Update'),
        ('FAILED_LOGIN', 'Failed Login')
    ])
    timestamp = models.DateTimeField(auto_now_add=True)
    ip_address = models.GenericIPAddressField(null=True, blank=True)
    user_agent = models.CharField(max_length=255, null=True, blank=True)
    details = models.JSONField(null=True, blank=True)
```

### 1.2 Medical Record Service Models

#### 1.2.1 MedicalRecord

```python
class MedicalRecord(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    patient_id = models.UUIDField()
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    status = models.CharField(max_length=20, choices=[
        ('ACTIVE', 'Active'),
        ('INACTIVE', 'Inactive'),
        ('ARCHIVED', 'Archived')
    ], default='ACTIVE')
    notes = models.TextField(null=True, blank=True)

    def get_encounters(self):
        return self.encounters.all().order_by('-encounter_date')

    def get_allergies(self):
        return self.allergies.all()

    def get_immunizations(self):
        return self.immunizations.all().order_by('-administered_date')

    def get_medical_history(self):
        return self.medical_history.all()

    def get_medications(self):
        return self.medications.all()

    def get_lab_tests(self):
        return self.lab_tests.all().order_by('-ordered_date')
```

#### 1.2.2 Encounter

```python
class Encounter(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    medical_record = models.ForeignKey(MedicalRecord, on_delete=models.CASCADE, related_name='encounters')
    doctor_id = models.UUIDField()
    encounter_date = models.DateTimeField()
    encounter_type = models.CharField(max_length=50, choices=[
        ('INITIAL_VISIT', 'Initial Visit'),
        ('FOLLOW_UP', 'Follow Up'),
        ('EMERGENCY', 'Emergency'),
        ('ROUTINE_CHECKUP', 'Routine Checkup'),
        ('SPECIALIST_CONSULTATION', 'Specialist Consultation'),
        ('TELEMEDICINE', 'Telemedicine')
    ])
    reason = models.CharField(max_length=255)
    status = models.CharField(max_length=20, choices=[
        ('SCHEDULED', 'Scheduled'),
        ('IN_PROGRESS', 'In Progress'),
        ('COMPLETED', 'Completed'),
        ('CANCELLED', 'Cancelled'),
        ('NO_SHOW', 'No Show')
    ])
    notes = models.TextField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def get_diagnoses(self):
        return self.diagnoses.all()

    def get_vital_signs(self):
        return self.vital_signs.all().order_by('-recorded_at')
```

#### 1.2.3 Diagnosis

```python
class Diagnosis(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    encounter = models.ForeignKey(Encounter, on_delete=models.CASCADE, related_name='diagnoses')
    diagnosis_code = models.CharField(max_length=20)  # ICD-10 code
    diagnosis_name = models.CharField(max_length=255)
    diagnosis_date = models.DateTimeField()
    diagnosed_by = models.UUIDField()  # Doctor ID
    severity = models.CharField(max_length=20, choices=[
        ('MILD', 'Mild'),
        ('MODERATE', 'Moderate'),
        ('SEVERE', 'Severe'),
        ('LIFE_THREATENING', 'Life Threatening')
    ], null=True, blank=True)
    notes = models.TextField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def get_treatments(self):
        return self.treatments.all()
```

#### 1.2.4 Treatment

```python
class Treatment(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    diagnosis = models.ForeignKey(Diagnosis, on_delete=models.CASCADE, related_name='treatments')
    treatment_type = models.CharField(max_length=50, choices=[
        ('MEDICATION', 'Medication'),
        ('SURGERY', 'Surgery'),
        ('THERAPY', 'Therapy'),
        ('LIFESTYLE_CHANGE', 'Lifestyle Change'),
        ('MONITORING', 'Monitoring')
    ])
    treatment_name = models.CharField(max_length=255)
    prescribed_by = models.UUIDField()  # Doctor ID
    start_date = models.DateField()
    end_date = models.DateField(null=True, blank=True)
    dosage = models.CharField(max_length=100, null=True, blank=True)
    frequency = models.CharField(max_length=100, null=True, blank=True)
    instructions = models.TextField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
```

#### 1.2.5 Allergy

```python
class Allergy(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    medical_record = models.ForeignKey(MedicalRecord, on_delete=models.CASCADE, related_name='allergies')
    allergen = models.CharField(max_length=255)
    reaction = models.CharField(max_length=255)
    severity = models.CharField(max_length=20, choices=[
        ('MILD', 'Mild'),
        ('MODERATE', 'Moderate'),
        ('SEVERE', 'Severe')
    ])
    diagnosed_date = models.DateField()
    notes = models.TextField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
```

#### 1.2.6 Immunization

```python
class Immunization(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    medical_record = models.ForeignKey(MedicalRecord, on_delete=models.CASCADE, related_name='immunizations')
    vaccine_name = models.CharField(max_length=255)
    administered_date = models.DateField()
    administered_by = models.UUIDField()  # Healthcare provider ID
    dose_number = models.PositiveIntegerField(default=1)
    lot_number = models.CharField(max_length=50, null=True, blank=True)
    expiration_date = models.DateField(null=True, blank=True)
    notes = models.TextField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
```

#### 1.2.7 MedicalHistory

```python
class MedicalHistory(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    medical_record = models.ForeignKey(MedicalRecord, on_delete=models.CASCADE, related_name='medical_history')
    condition = models.CharField(max_length=255)
    diagnosed_date = models.DateField()
    status = models.CharField(max_length=20, choices=[
        ('ACTIVE', 'Active'),
        ('RESOLVED', 'Resolved'),
        ('RECURRENT', 'Recurrent'),
        ('CHRONIC', 'Chronic')
    ])
    treatment = models.TextField(null=True, blank=True)
    notes = models.TextField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
```

#### 1.2.8 Medication

```python
class Medication(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    medical_record = models.ForeignKey(MedicalRecord, on_delete=models.CASCADE, related_name='medications')
    name = models.CharField(max_length=255)
    dosage = models.CharField(max_length=100)
    frequency = models.CharField(max_length=100)
    prescribed_by = models.UUIDField()  # Doctor ID
    prescribed_date = models.DateField()
    start_date = models.DateField()
    end_date = models.DateField(null=True, blank=True)
    is_current = models.BooleanField(default=True)
    notes = models.TextField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
```

#### 1.2.9 VitalSign

```python
class VitalSign(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    encounter = models.ForeignKey(Encounter, on_delete=models.CASCADE, related_name='vital_signs')
    recorded_at = models.DateTimeField()
    recorded_by = models.UUIDField()  # Healthcare provider ID
    temperature = models.FloatField(null=True, blank=True)  # in Celsius
    heart_rate = models.PositiveIntegerField(null=True, blank=True)  # in BPM
    respiratory_rate = models.PositiveIntegerField(null=True, blank=True)  # in breaths per minute
    blood_pressure_systolic = models.PositiveIntegerField(null=True, blank=True)  # in mmHg
    blood_pressure_diastolic = models.PositiveIntegerField(null=True, blank=True)  # in mmHg
    oxygen_saturation = models.FloatField(null=True, blank=True)  # in percentage
    height = models.FloatField(null=True, blank=True)  # in cm
    weight = models.FloatField(null=True, blank=True)  # in kg
    notes = models.TextField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def calculate_bmi(self):
        if self.height and self.weight:
            return self.weight / ((self.height / 100) ** 2)
        return None
```

#### 1.2.10 LabTest

```python
class LabTest(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    medical_record = models.ForeignKey(MedicalRecord, on_delete=models.CASCADE, related_name='lab_tests')
    test_type = models.CharField(max_length=255)
    ordered_by = models.UUIDField()  # Doctor ID
    ordered_date = models.DateTimeField()
    status = models.CharField(max_length=20, choices=[
        ('ORDERED', 'Ordered'),
        ('SAMPLE_COLLECTED', 'Sample Collected'),
        ('IN_PROGRESS', 'In Progress'),
        ('COMPLETED', 'Completed'),
        ('CANCELLED', 'Cancelled')
    ], default='ORDERED')
    performed_date = models.DateTimeField(null=True, blank=True)
    performed_by = models.UUIDField(null=True, blank=True)  # Lab technician ID
    notes = models.TextField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def get_results(self):
        return self.results.all()
```

#### 1.2.11 LabResult

```python
class LabResult(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    lab_test = models.ForeignKey(LabTest, on_delete=models.CASCADE, related_name='results')
    result_date = models.DateTimeField()
    result_value = models.TextField()
    result_unit = models.CharField(max_length=50, null=True, blank=True)
    reference_range = models.CharField(max_length=100, null=True, blank=True)
    is_abnormal = models.BooleanField(default=False)
    interpreted_by = models.UUIDField(null=True, blank=True)  # Doctor or lab technician ID
    notes = models.TextField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
```

### 1.3 Appointment Service Models

#### 1.3.1 DoctorAvailability

```python
class DoctorAvailability(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    doctor_id = models.UUIDField()
    day_of_week = models.PositiveSmallIntegerField()  # 0=Monday, 6=Sunday
    start_time = models.TimeField()
    end_time = models.TimeField()
    is_active = models.BooleanField(default=True)
    effective_from = models.DateField(null=True, blank=True)
    effective_to = models.DateField(null=True, blank=True)
    notes = models.TextField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def is_available(self, date):
        # Check if the availability is effective for the given date
        if self.effective_from and date < self.effective_from:
            return False
        if self.effective_to and date > self.effective_to:
            return False

        # Check if the day of week matches
        if date.weekday() != self.day_of_week:
            return False

        return self.is_active

    def generate_time_slots(self, date, duration_minutes=30):
        # Generate time slots for the given date based on this availability
        if not self.is_available(date):
            return []

        slots = []
        current_time = self.start_time
        end_time = self.end_time

        while current_time < end_time:
            slot_end_time = (datetime.combine(date.today(), current_time) + timedelta(minutes=duration_minutes)).time()
            if slot_end_time <= end_time:
                slots.append(TimeSlot(
                    doctor_id=self.doctor_id,
                    date=date,
                    start_time=current_time,
                    end_time=slot_end_time,
                    status='AVAILABLE'
                ))
            current_time = slot_end_time

        return slots
```

#### 1.3.2 TimeSlot

```python
class TimeSlot(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    doctor_id = models.UUIDField()
    date = models.DateField()
    start_time = models.TimeField()
    end_time = models.TimeField()
    status = models.CharField(max_length=20, choices=[
        ('AVAILABLE', 'Available'),
        ('BOOKED', 'Booked'),
        ('BLOCKED', 'Blocked')
    ], default='AVAILABLE')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    notes = models.TextField(null=True, blank=True)

    def is_available(self):
        return self.status == 'AVAILABLE'

    def book(self):
        if self.is_available():
            self.status = 'BOOKED'
            self.save()
            return True
        return False

    def cancel(self):
        if self.status == 'BOOKED':
            self.status = 'AVAILABLE'
            self.save()
            return True
        return False

    def block(self):
        if self.is_available():
            self.status = 'BLOCKED'
            self.save()
            return True
        return False
```

#### 1.3.3 Appointment

```python
class Appointment(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    patient_id = models.UUIDField()
    doctor_id = models.UUIDField()
    time_slot = models.OneToOneField(TimeSlot, on_delete=models.CASCADE, related_name='appointment')
    appointment_date = models.DateField()
    start_time = models.TimeField()
    end_time = models.TimeField()
    status = models.CharField(max_length=20, choices=[
        ('SCHEDULED', 'Scheduled'),
        ('CONFIRMED', 'Confirmed'),
        ('CANCELLED', 'Cancelled'),
        ('COMPLETED', 'Completed'),
        ('NO_SHOW', 'No Show')
    ], default='SCHEDULED')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    cancelled_reason = models.TextField(null=True, blank=True)
    notes = models.TextField(null=True, blank=True)

    def cancel(self, reason=None):
        if self.status in ['SCHEDULED', 'CONFIRMED']:
            self.status = 'CANCELLED'
            self.cancelled_reason = reason
            self.save()

            # Release the time slot
            self.time_slot.cancel()

            return True
        return False

    def reschedule(self, new_slot):
        if self.status in ['SCHEDULED', 'CONFIRMED'] and new_slot.is_available():
            # Release the old time slot
            old_slot = self.time_slot
            old_slot.cancel()

            # Book the new time slot
            new_slot.book()

            # Update appointment details
            self.time_slot = new_slot
            self.appointment_date = new_slot.date
            self.start_time = new_slot.start_time
            self.end_time = new_slot.end_time
            self.save()

            return True
        return False

    def complete(self):
        if self.status in ['SCHEDULED', 'CONFIRMED']:
            self.status = 'COMPLETED'
            self.save()
            return True
        return False

    def no_show(self):
        if self.status in ['SCHEDULED', 'CONFIRMED']:
            self.status = 'NO_SHOW'
            self.save()
            return True
        return False

    def get_reason(self):
        try:
            return self.reason
        except AppointmentReason.DoesNotExist:
            return None

    def get_reminders(self):
        return self.reminders.all()
```

#### 1.3.4 AppointmentReason

```python
class AppointmentReason(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    appointment = models.OneToOneField(Appointment, on_delete=models.CASCADE, related_name='reason')
    reason = models.TextField()
    is_first_visit = models.BooleanField(default=False)
    symptoms = models.TextField(null=True, blank=True)
    duration = models.CharField(max_length=100, null=True, blank=True)  # e.g., "2 days", "1 week"
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
```

#### 1.3.5 AppointmentReminder

```python
class AppointmentReminder(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    appointment = models.ForeignKey(Appointment, on_delete=models.CASCADE, related_name='reminders')
    reminder_type = models.CharField(max_length=20, choices=[
        ('EMAIL', 'Email'),
        ('SMS', 'SMS'),
        ('PUSH', 'Push Notification')
    ])
    scheduled_time = models.DateTimeField()
    status = models.CharField(max_length=20, choices=[
        ('PENDING', 'Pending'),
        ('SENT', 'Sent'),
        ('FAILED', 'Failed')
    ], default='PENDING')
    sent_at = models.DateTimeField(null=True, blank=True)
    error_message = models.TextField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def send(self):
        # Logic to send the reminder
        # This would typically call the Notification Service
        pass

    def mark_as_sent(self):
        self.status = 'SENT'
        self.sent_at = timezone.now()
        self.save()

    def mark_as_failed(self, error):
        self.status = 'FAILED'
        self.error_message = error
        self.save()
```

#### 1.3.6 DoctorScheduleException

```python
class DoctorScheduleException(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    doctor_id = models.UUIDField()
    exception_date = models.DateField()
    start_time = models.TimeField()
    end_time = models.TimeField()
    exception_type = models.CharField(max_length=20, choices=[
        ('VACATION', 'Vacation'),
        ('SICK_LEAVE', 'Sick Leave'),
        ('CONFERENCE', 'Conference'),
        ('OTHER', 'Other')
    ])
    status = models.CharField(max_length=20, choices=[
        ('PENDING', 'Pending'),
        ('APPROVED', 'Approved'),
        ('REJECTED', 'Rejected')
    ], default='PENDING')
    created_at = models.DateTimeField(auto_now_add=True)
    reason = models.TextField(null=True, blank=True)

    def approve(self):
        if self.status == 'PENDING':
            self.status = 'APPROVED'
            self.save()

            # Block affected time slots
            affected_slots = TimeSlot.objects.filter(
                doctor_id=self.doctor_id,
                date=self.exception_date,
                start_time__gte=self.start_time,
                end_time__lte=self.end_time,
                status='AVAILABLE'
            )

            for slot in affected_slots:
                slot.block()

            return True
        return False

    def reject(self):
        if self.status == 'PENDING':
            self.status = 'REJECTED'
            self.save()
            return True
        return False

    def affects_slot(self, slot):
        if slot.doctor_id != self.doctor_id or slot.date != self.exception_date:
            return False

        # Check if the slot overlaps with the exception time range
        slot_start = datetime.combine(slot.date, slot.start_time)
        slot_end = datetime.combine(slot.date, slot.end_time)
        exception_start = datetime.combine(self.exception_date, self.start_time)
        exception_end = datetime.combine(self.exception_date, self.end_time)

        return slot_start < exception_end and exception_start < slot_end
```

## 2. Determine functions in services (views)

Phần này mô tả chi tiết các chức năng (functions) trong các views của từng service.

### 2.1 User Service Views

#### 2.1.1 UserViewSet

```python
class UserViewSet(viewsets.ModelViewSet):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [IsAuthenticated, IsAdminOrOwner]
    filter_backends = [DjangoFilterBackend, SearchFilter]
    search_fields = ['email', 'first_name', 'last_name']
    filterset_fields = ['role', 'is_active']

    def get_permissions(self):
        if self.action == 'create':
            return [IsAdmin()]
        elif self.action in ['update', 'partial_update', 'destroy']:
            return [IsAuthenticated(), IsAdminOrOwner()]
        return [IsAuthenticated()]

    def list(self, request, *args, **kwargs):
        # List all users (admin) or just the current user (non-admin)
        if not request.user.is_staff and not request.user.role == 'ADMIN':
            self.queryset = User.objects.filter(id=request.user.id)
        return super().list(request, *args, **kwargs)

    def retrieve(self, request, *args, **kwargs):
        # Retrieve user details
        return super().retrieve(request, *args, **kwargs)

    def create(self, request, *args, **kwargs):
        # Create a new user (admin only)
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        self.perform_create(serializer)
        headers = self.get_success_headers(serializer.data)
        return Response(serializer.data, status=status.HTTP_201_CREATED, headers=headers)

    def update(self, request, *args, **kwargs):
        # Update user details (admin or owner)
        partial = kwargs.pop('partial', False)
        instance = self.get_object()
        serializer = self.get_serializer(instance, data=request.data, partial=partial)
        serializer.is_valid(raise_exception=True)
        self.perform_update(serializer)
        return Response(serializer.data)

    def destroy(self, request, *args, **kwargs):
        # Soft delete user (admin only)
        instance = self.get_object()
        instance.is_active = False
        instance.save()
        return Response(status=status.HTTP_204_NO_CONTENT)

    @action(detail=False, methods=['get'])
    def me(self, request):
        # Get current user's details
        serializer = self.get_serializer(request.user)
        return Response(serializer.data)

    @action(detail=False, methods=['post'])
    def change_password(self, request):
        # Change user's password
        user = request.user
        serializer = ChangePasswordSerializer(data=request.data)
        if serializer.is_valid():
            if not user.check_password(serializer.validated_data['old_password']):
                return Response({'old_password': ['Wrong password.']}, status=status.HTTP_400_BAD_REQUEST)
            user.set_password(serializer.validated_data['new_password'])
            user.save()
            return Response({'status': 'password set'}, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
```

#### 2.1.2 PatientViewSet

```python
class PatientViewSet(viewsets.ModelViewSet):
    queryset = PatientProfile.objects.all()
    serializer_class = PatientProfileSerializer
    permission_classes = [IsAuthenticated, IsAdminOrPatientOwner]
    filter_backends = [DjangoFilterBackend, SearchFilter]
    search_fields = ['user__first_name', 'user__last_name', 'user__email']

    def get_queryset(self):
        # Filter patients based on user role
        user = self.request.user
        if user.role == 'ADMIN':
            return PatientProfile.objects.all()
        elif user.role == 'DOCTOR':
            # Doctors can see patients they have appointments with
            return PatientProfile.objects.filter(user__appointments__doctor_id=user.id).distinct()
        elif user.role == 'PATIENT':
            # Patients can only see their own profile
            return PatientProfile.objects.filter(user=user)
        return PatientProfile.objects.none()

    def retrieve(self, request, *args, **kwargs):
        # Retrieve patient profile details
        return super().retrieve(request, *args, **kwargs)

    def create(self, request, *args, **kwargs):
        # Create a new patient profile
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        self.perform_create(serializer)
        headers = self.get_success_headers(serializer.data)
        return Response(serializer.data, status=status.HTTP_201_CREATED, headers=headers)

    def update(self, request, *args, **kwargs):
        # Update patient profile
        partial = kwargs.pop('partial', False)
        instance = self.get_object()
        serializer = self.get_serializer(instance, data=request.data, partial=partial)
        serializer.is_valid(raise_exception=True)
        self.perform_update(serializer)
        return Response(serializer.data)

    @action(detail=True, methods=['get'])
    def medical_history(self, request, pk=None):
        # Get patient's medical history
        patient = self.get_object()
        # This would typically call the Medical Record Service
        return Response({'message': 'Medical history endpoint'}, status=status.HTTP_200_OK)

    @action(detail=True, methods=['get'])
    def appointments(self, request, pk=None):
        # Get patient's appointments
        patient = self.get_object()
        # This would typically call the Appointment Service
        return Response({'message': 'Appointments endpoint'}, status=status.HTTP_200_OK)
```

#### 2.1.3 DoctorViewSet

```python
class DoctorViewSet(viewsets.ModelViewSet):
    queryset = DoctorProfile.objects.all()
    serializer_class = DoctorProfileSerializer
    permission_classes = [IsAuthenticated, IsAdminOrDoctorOwner]
    filter_backends = [DjangoFilterBackend, SearchFilter]
    search_fields = ['user__first_name', 'user__last_name', 'specialty']
    filterset_fields = ['specialty']

    def get_queryset(self):
        # Filter doctors based on user role
        user = self.request.user
        if user.role in ['ADMIN', 'PATIENT']:
            return DoctorProfile.objects.all()
        elif user.role == 'DOCTOR':
            # Doctors can only see their own profile
            return DoctorProfile.objects.filter(user=user)
        return DoctorProfile.objects.none()

    def retrieve(self, request, *args, **kwargs):
        # Retrieve doctor profile details
        return super().retrieve(request, *args, **kwargs)

    def create(self, request, *args, **kwargs):
        # Create a new doctor profile (admin only)
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        self.perform_create(serializer)
        headers = self.get_success_headers(serializer.data)
        return Response(serializer.data, status=status.HTTP_201_CREATED, headers=headers)

    def update(self, request, *args, **kwargs):
        # Update doctor profile
        partial = kwargs.pop('partial', False)
        instance = self.get_object()
        serializer = self.get_serializer(instance, data=request.data, partial=partial)
        serializer.is_valid(raise_exception=True)
        self.perform_update(serializer)
        return Response(serializer.data)

    @action(detail=True, methods=['get'])
    def availability(self, request, pk=None):
        # Get doctor's availability
        doctor = self.get_object()
        # This would typically call the Appointment Service
        return Response({'message': 'Availability endpoint'}, status=status.HTTP_200_OK)

    @action(detail=True, methods=['get'])
    def appointments(self, request, pk=None):
        # Get doctor's appointments
        doctor = self.get_object()
        # This would typically call the Appointment Service
        return Response({'message': 'Appointments endpoint'}, status=status.HTTP_200_OK)
```

#### 2.1.4 AuthView

```python
class AuthView(APIView):
    permission_classes = [AllowAny]

    @swagger_auto_schema(request_body=LoginSerializer)
    def post(self, request):
        # Login user and return JWT token
        serializer = LoginSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        email = serializer.validated_data['email']
        password = serializer.validated_data['password']

        user = authenticate(request, email=email, password=password)

        if user is not None:
            refresh = RefreshToken.for_user(user)

            # Log user activity
            UserActivity.objects.create(
                user=user,
                activity_type='LOGIN',
                ip_address=get_client_ip(request),
                user_agent=request.META.get('HTTP_USER_AGENT', '')
            )

            return Response({
                'refresh': str(refresh),
                'access': str(refresh.access_token),
                'user': UserSerializer(user).data
            })

        return Response({'error': 'Invalid credentials'}, status=status.HTTP_401_UNAUTHORIZED)

    @swagger_auto_schema(request_body=RefreshTokenSerializer)
    @action(detail=False, methods=['post'])
    def refresh(self, request):
        # Refresh JWT token
        serializer = RefreshTokenSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        try:
            refresh = RefreshToken(serializer.validated_data['refresh'])
            return Response({
                'access': str(refresh.access_token)
            })
        except TokenError:
            return Response({'error': 'Invalid token'}, status=status.HTTP_401_UNAUTHORIZED)

    @action(detail=False, methods=['post'])
    def logout(self, request):
        # Logout user
        try:
            refresh_token = request.data['refresh']
            token = RefreshToken(refresh_token)
            token.blacklist()

            # Log user activity if authenticated
            if request.user.is_authenticated:
                UserActivity.objects.create(
                    user=request.user,
                    activity_type='LOGOUT',
                    ip_address=get_client_ip(request),
                    user_agent=request.META.get('HTTP_USER_AGENT', '')
                )

            return Response(status=status.HTTP_205_RESET_CONTENT)
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)
```

### 2.2 Medical Record Service Views

#### 2.2.1 MedicalRecordViewSet

```python
class MedicalRecordViewSet(viewsets.ModelViewSet):
    queryset = MedicalRecord.objects.all()
    serializer_class = MedicalRecordSerializer
    permission_classes = [IsAuthenticated, HasMedicalRecordAccess]
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['patient_id', 'status']

    def get_queryset(self):
        # Filter medical records based on user role
        user = self.request.user
        if user.role == 'ADMIN':
            return MedicalRecord.objects.all()
        elif user.role == 'DOCTOR':
            # Doctors can see medical records of patients they have encounters with
            return MedicalRecord.objects.filter(encounters__doctor_id=user.id).distinct()
        elif user.role == 'PATIENT':
            # Patients can only see their own medical records
            return MedicalRecord.objects.filter(patient_id=user.id)
        return MedicalRecord.objects.none()

    def retrieve(self, request, *args, **kwargs):
        # Retrieve medical record details
        return super().retrieve(request, *args, **kwargs)

    def create(self, request, *args, **kwargs):
        # Create a new medical record
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        self.perform_create(serializer)
        headers = self.get_success_headers(serializer.data)
        return Response(serializer.data, status=status.HTTP_201_CREATED, headers=headers)

    def update(self, request, *args, **kwargs):
        # Update medical record
        partial = kwargs.pop('partial', False)
        instance = self.get_object()
        serializer = self.get_serializer(instance, data=request.data, partial=partial)
        serializer.is_valid(raise_exception=True)
        self.perform_update(serializer)
        return Response(serializer.data)

    @action(detail=True, methods=['get'])
    def encounters(self, request, pk=None):
        # Get medical record's encounters
        medical_record = self.get_object()
        encounters = medical_record.get_encounters()
        serializer = EncounterSerializer(encounters, many=True)
        return Response(serializer.data)

    @action(detail=True, methods=['get'])
    def allergies(self, request, pk=None):
        # Get medical record's allergies
        medical_record = self.get_object()
        allergies = medical_record.get_allergies()
        serializer = AllergySerializer(allergies, many=True)
        return Response(serializer.data)

    @action(detail=True, methods=['get'])
    def immunizations(self, request, pk=None):
        # Get medical record's immunizations
        medical_record = self.get_object()
        immunizations = medical_record.get_immunizations()
        serializer = ImmunizationSerializer(immunizations, many=True)
        return Response(serializer.data)

    @action(detail=True, methods=['get'])
    def medications(self, request, pk=None):
        # Get medical record's medications
        medical_record = self.get_object()
        medications = medical_record.get_medications()
        serializer = MedicationSerializer(medications, many=True)
        return Response(serializer.data)

    @action(detail=True, methods=['get'])
    def lab_tests(self, request, pk=None):
        # Get medical record's lab tests
        medical_record = self.get_object()
        lab_tests = medical_record.get_lab_tests()
        serializer = LabTestSerializer(lab_tests, many=True)
        return Response(serializer.data)
```

#### 2.2.2 EncounterViewSet

```python
class EncounterViewSet(viewsets.ModelViewSet):
    queryset = Encounter.objects.all()
    serializer_class = EncounterSerializer
    permission_classes = [IsAuthenticated, HasEncounterAccess]
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['medical_record', 'doctor_id', 'status', 'encounter_type']

    def get_queryset(self):
        # Filter encounters based on user role
        user = self.request.user
        if user.role == 'ADMIN':
            return Encounter.objects.all()
        elif user.role == 'DOCTOR':
            # Doctors can see encounters they are involved in
            return Encounter.objects.filter(doctor_id=user.id)
        elif user.role == 'PATIENT':
            # Patients can see encounters in their medical records
            return Encounter.objects.filter(medical_record__patient_id=user.id)
        return Encounter.objects.none()

    def retrieve(self, request, *args, **kwargs):
        # Retrieve encounter details
        return super().retrieve(request, *args, **kwargs)

    def create(self, request, *args, **kwargs):
        # Create a new encounter
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        self.perform_create(serializer)
        headers = self.get_success_headers(serializer.data)
        return Response(serializer.data, status=status.HTTP_201_CREATED, headers=headers)

    def update(self, request, *args, **kwargs):
        # Update encounter
        partial = kwargs.pop('partial', False)
        instance = self.get_object()
        serializer = self.get_serializer(instance, data=request.data, partial=partial)
        serializer.is_valid(raise_exception=True)
        self.perform_update(serializer)
        return Response(serializer.data)

    @action(detail=True, methods=['get'])
    def diagnoses(self, request, pk=None):
        # Get encounter's diagnoses
        encounter = self.get_object()
        diagnoses = encounter.get_diagnoses()
        serializer = DiagnosisSerializer(diagnoses, many=True)
        return Response(serializer.data)

    @action(detail=True, methods=['get'])
    def vital_signs(self, request, pk=None):
        # Get encounter's vital signs
        encounter = self.get_object()
        vital_signs = encounter.get_vital_signs()
        serializer = VitalSignSerializer(vital_signs, many=True)
        return Response(serializer.data)
```

### 2.3 Appointment Service Views

#### 2.3.1 DoctorAvailabilityViewSet

```python
class DoctorAvailabilityViewSet(viewsets.ModelViewSet):
    queryset = DoctorAvailability.objects.all()
    serializer_class = DoctorAvailabilitySerializer
    permission_classes = [IsAuthenticated, IsDoctorOrAdmin]
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['doctor_id', 'day_of_week', 'is_active']

    def get_queryset(self):
        # Filter availabilities based on user role
        user = self.request.user
        if user.role == 'ADMIN':
            return DoctorAvailability.objects.all()
        elif user.role == 'DOCTOR':
            # Doctors can see their own availabilities
            return DoctorAvailability.objects.filter(doctor_id=user.id)
        elif user.role == 'PATIENT':
            # Patients can see all active doctor availabilities
            return DoctorAvailability.objects.filter(is_active=True)
        return DoctorAvailability.objects.none()

    def retrieve(self, request, *args, **kwargs):
        # Retrieve availability details
        return super().retrieve(request, *args, **kwargs)

    def create(self, request, *args, **kwargs):
        # Create a new availability
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        self.perform_create(serializer)
        headers = self.get_success_headers(serializer.data)
        return Response(serializer.data, status=status.HTTP_201_CREATED, headers=headers)

    def update(self, request, *args, **kwargs):
        # Update availability
        partial = kwargs.pop('partial', False)
        instance = self.get_object()
        serializer = self.get_serializer(instance, data=request.data, partial=partial)
        serializer.is_valid(raise_exception=True)
        self.perform_update(serializer)
        return Response(serializer.data)

    @action(detail=False, methods=['get'])
    def by_doctor(self, request):
        # Get availabilities for a specific doctor
        doctor_id = request.query_params.get('doctor_id')
        if not doctor_id:
            return Response({'error': 'doctor_id is required'}, status=status.HTTP_400_BAD_REQUEST)

        availabilities = DoctorAvailability.objects.filter(doctor_id=doctor_id, is_active=True)
        serializer = self.get_serializer(availabilities, many=True)
        return Response(serializer.data)

    @action(detail=True, methods=['get'])
    def time_slots(self, request, pk=None):
        # Generate time slots for a specific date based on this availability
        availability = self.get_object()
        date_str = request.query_params.get('date')
        if not date_str:
            return Response({'error': 'date is required'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            date = datetime.strptime(date_str, '%Y-%m-%d').date()
        except ValueError:
            return Response({'error': 'Invalid date format. Use YYYY-MM-DD'}, status=status.HTTP_400_BAD_REQUEST)

        slots = availability.generate_time_slots(date)
        serializer = TimeSlotSerializer(slots, many=True)
        return Response(serializer.data)
```

#### 2.3.2 AppointmentViewSet

```python
class AppointmentViewSet(viewsets.ModelViewSet):
    queryset = Appointment.objects.all()
    serializer_class = AppointmentSerializer
    permission_classes = [IsAuthenticated, HasAppointmentAccess]
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['patient_id', 'doctor_id', 'appointment_date', 'status']

    def get_queryset(self):
        # Filter appointments based on user role
        user = self.request.user
        if user.role == 'ADMIN':
            return Appointment.objects.all()
        elif user.role == 'DOCTOR':
            # Doctors can see appointments they are involved in
            return Appointment.objects.filter(doctor_id=user.id)
        elif user.role == 'PATIENT':
            # Patients can see their own appointments
            return Appointment.objects.filter(patient_id=user.id)
        return Appointment.objects.none()

    def retrieve(self, request, *args, **kwargs):
        # Retrieve appointment details
        return super().retrieve(request, *args, **kwargs)

    def create(self, request, *args, **kwargs):
        # Create a new appointment
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        # Check if the time slot is available
        time_slot_id = serializer.validated_data.get('time_slot').id
        time_slot = TimeSlot.objects.get(id=time_slot_id)

        if not time_slot.is_available():
            return Response({'error': 'Time slot is not available'}, status=status.HTTP_400_BAD_REQUEST)

        # Book the time slot
        time_slot.book()

        self.perform_create(serializer)
        headers = self.get_success_headers(serializer.data)

        # Create appointment reason if provided
        reason_data = request.data.get('reason')
        if reason_data:
            reason_data['appointment'] = serializer.instance.id
            reason_serializer = AppointmentReasonSerializer(data=reason_data)
            if reason_serializer.is_valid():
                reason_serializer.save()

        # Schedule reminders
        appointment = serializer.instance
        self._schedule_reminders(appointment)

        return Response(serializer.data, status=status.HTTP_201_CREATED, headers=headers)

    def update(self, request, *args, **kwargs):
        # Update appointment
        partial = kwargs.pop('partial', False)
        instance = self.get_object()
        serializer = self.get_serializer(instance, data=request.data, partial=partial)
        serializer.is_valid(raise_exception=True)
        self.perform_update(serializer)
        return Response(serializer.data)

    @action(detail=True, methods=['post'])
    def cancel(self, request, pk=None):
        # Cancel appointment
        appointment = self.get_object()
        reason = request.data.get('reason')

        if appointment.cancel(reason):
            return Response({'status': 'appointment cancelled'}, status=status.HTTP_200_OK)
        return Response({'error': 'Cannot cancel appointment'}, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=True, methods=['post'])
    def reschedule(self, request, pk=None):
        # Reschedule appointment
        appointment = self.get_object()
        time_slot_id = request.data.get('time_slot_id')

        if not time_slot_id:
            return Response({'error': 'time_slot_id is required'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            new_slot = TimeSlot.objects.get(id=time_slot_id)
        except TimeSlot.DoesNotExist:
            return Response({'error': 'Time slot not found'}, status=status.HTTP_404_NOT_FOUND)

        if appointment.reschedule(new_slot):
            # Update reminders
            self._update_reminders(appointment)

            return Response({'status': 'appointment rescheduled'}, status=status.HTTP_200_OK)
        return Response({'error': 'Cannot reschedule appointment'}, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=True, methods=['post'])
    def complete(self, request, pk=None):
        # Mark appointment as completed
        appointment = self.get_object()

        if appointment.complete():
            return Response({'status': 'appointment completed'}, status=status.HTTP_200_OK)
        return Response({'error': 'Cannot complete appointment'}, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=True, methods=['post'])
    def no_show(self, request, pk=None):
        # Mark appointment as no-show
        appointment = self.get_object()

        if appointment.no_show():
            return Response({'status': 'appointment marked as no-show'}, status=status.HTTP_200_OK)
        return Response({'error': 'Cannot mark appointment as no-show'}, status=status.HTTP_400_BAD_REQUEST)

    def _schedule_reminders(self, appointment):
        # Schedule reminders for the appointment
        # 1 day before
        reminder_date = appointment.appointment_date - timedelta(days=1)
        reminder_time = datetime.combine(reminder_date, time(hour=10, minute=0))
        AppointmentReminder.objects.create(
            appointment=appointment,
            reminder_type='EMAIL',
            scheduled_time=reminder_time
        )

        # 1 hour before
        reminder_datetime = datetime.combine(appointment.appointment_date, appointment.start_time) - timedelta(hours=1)
        AppointmentReminder.objects.create(
            appointment=appointment,
            reminder_type='SMS',
            scheduled_time=reminder_datetime
        )

    def _update_reminders(self, appointment):
        # Update existing reminders for the appointment
        appointment.reminders.all().delete()
        self._schedule_reminders(appointment)
```

## 3. Determine templates

Phần này mô tả các templates sử dụng trong hệ thống. Với kiến trúc microservices, các templates chủ yếu được sử dụng cho email, SMS, và thông báo.

### 3.1 Email Templates

#### 3.1.1 User Registration Email

```html
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>Welcome to Healthcare System</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            line-height: 1.6;
            color: #333;
        }
        .container {
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
        }
        .header {
            background-color: #4285f4;
            color: white;
            padding: 10px 20px;
            text-align: center;
        }
        .content {
            padding: 20px;
            background-color: #f9f9f9;
        }
        .button {
            display: inline-block;
            background-color: #4285f4;
            color: white;
            padding: 10px 20px;
            text-decoration: none;
            border-radius: 4px;
            margin-top: 20px;
        }
        .footer {
            text-align: center;
            margin-top: 20px;
            font-size: 12px;
            color: #777;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>Welcome to Healthcare System</h1>
        </div>
        <div class="content">
            <p>Hello {{ user.first_name }},</p>
            <p>Thank you for registering with our Healthcare System. Your account has been created successfully.</p>
            <p>Here are your account details:</p>
            <ul>
                <li><strong>Email:</strong> {{ user.email }}</li>
                <li><strong>Role:</strong> {{ user.role }}</li>
            </ul>
            <p>Please click the button below to verify your email address and activate your account:</p>
            <a href="{{ verification_url }}" class="button">Verify Email</a>
            <p>If you did not create this account, please ignore this email.</p>
        </div>
        <div class="footer">
            <p>&copy; {{ current_year }} Healthcare System. All rights reserved.</p>
            <p>123 Medical Center Drive, Healthcare City</p>
        </div>
    </div>
</body>
</html>
```

#### 3.1.2 Appointment Confirmation Email

```html
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>Appointment Confirmation</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            line-height: 1.6;
            color: #333;
        }
        .container {
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
        }
        .header {
            background-color: #4285f4;
            color: white;
            padding: 10px 20px;
            text-align: center;
        }
        .content {
            padding: 20px;
            background-color: #f9f9f9;
        }
        .appointment-details {
            background-color: white;
            padding: 15px;
            border-radius: 4px;
            margin: 20px 0;
            border-left: 4px solid #4285f4;
        }
        .button {
            display: inline-block;
            background-color: #4285f4;
            color: white;
            padding: 10px 20px;
            text-decoration: none;
            border-radius: 4px;
            margin-top: 20px;
        }
        .footer {
            text-align: center;
            margin-top: 20px;
            font-size: 12px;
            color: #777;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>Appointment Confirmation</h1>
        </div>
        <div class="content">
            <p>Hello {{ patient.first_name }},</p>
            <p>Your appointment has been confirmed. Here are the details:</p>
            <div class="appointment-details">
                <p><strong>Doctor:</strong> Dr. {{ doctor.first_name }} {{ doctor.last_name }}</p>
                <p><strong>Date:</strong> {{ appointment.appointment_date|date:"l, F j, Y" }}</p>
                <p><strong>Time:</strong> {{ appointment.start_time|time:"g:i A" }} - {{ appointment.end_time|time:"g:i A" }}</p>
                <p><strong>Location:</strong> Main Medical Center, Room {{ doctor.room_number }}</p>
                {% if appointment.reason %}
                <p><strong>Reason:</strong> {{ appointment.reason.reason }}</p>
                {% endif %}
            </div>
            <p>Please arrive 15 minutes before your scheduled appointment time to complete any necessary paperwork.</p>
            <p>If you need to reschedule or cancel your appointment, please click the button below:</p>
            <a href="{{ manage_appointment_url }}" class="button">Manage Appointment</a>
        </div>
        <div class="footer">
            <p>&copy; {{ current_year }} Healthcare System. All rights reserved.</p>
            <p>123 Medical Center Drive, Healthcare City</p>
            <p>Phone: (123) 456-7890</p>
        </div>
    </div>
</body>
</html>
```

### 3.2 SMS Templates

#### 3.2.1 Appointment Reminder SMS

```
Reminder: You have an appointment with Dr. {{ doctor.last_name }} tomorrow at {{ appointment.start_time|time:"g:i A" }}. Reply Y to confirm or call (123) 456-7890 to reschedule.
```

#### 3.2.2 Prescription Ready SMS

```
Your prescription is ready for pickup at the pharmacy. Prescription #{{ prescription.id }}. The pharmacy is open from 8:00 AM to 6:00 PM.
```

### 3.3 Notification Templates

#### 3.3.1 In-App Appointment Notification

```json
{
  "title": "Upcoming Appointment",
  "message": "You have an appointment with Dr. {{ doctor.last_name }} on {{ appointment.appointment_date|date:"F j" }} at {{ appointment.start_time|time:"g:i A" }}.",
  "action_url": "/appointments/{{ appointment.id }}",
  "icon": "calendar"
}
```

#### 3.3.2 In-App Lab Results Notification

```json
{
  "title": "Lab Results Available",
  "message": "Your {{ lab_test.test_type }} results are now available.",
  "action_url": "/medical-records/lab-tests/{{ lab_test.id }}",
  "icon": "lab"
}
```

## 4. Determine REST API connecting services

Phần này mô tả các REST API được sử dụng để kết nối các microservices với nhau.

### 4.1 User Service API

#### 4.1.1 Authentication API

```yaml
openapi: 3.0.0
info:
  title: User Service Authentication API
  version: 1.0.0
  description: API for user authentication and authorization
paths:
  /api/auth/login:
    post:
      summary: Login user
      description: Authenticate user and return JWT token
      requestBody:
        required: true
        content:
          application/json:
            schema:
              type: object
              properties:
                email:
                  type: string
                  format: email
                password:
                  type: string
                  format: password
              required:
                - email
                - password
      responses:
        '200':
          description: Login successful
          content:
            application/json:
              schema:
                type: object
                properties:
                  refresh:
                    type: string
                  access:
                    type: string
                  user:
                    $ref: '#/components/schemas/User'
        '401':
          description: Invalid credentials

  /api/auth/refresh:
    post:
      summary: Refresh token
      description: Refresh JWT token
      requestBody:
        required: true
        content:
          application/json:
            schema:
              type: object
              properties:
                refresh:
                  type: string
              required:
                - refresh
      responses:
        '200':
          description: Token refreshed
          content:
            application/json:
              schema:
                type: object
                properties:
                  access:
                    type: string
        '401':
          description: Invalid token

  /api/auth/logout:
    post:
      summary: Logout user
      description: Logout user and blacklist refresh token
      requestBody:
        required: true
        content:
          application/json:
            schema:
              type: object
              properties:
                refresh:
                  type: string
              required:
                - refresh
      responses:
        '205':
          description: Logout successful
        '400':
          description: Invalid request

components:
  schemas:
    User:
      type: object
      properties:
        id:
          type: string
          format: uuid
        email:
          type: string
          format: email
        first_name:
          type: string
        last_name:
          type: string
        role:
          type: string
          enum: [ADMIN, DOCTOR, NURSE, PATIENT, PHARMACIST, LAB_TECH, INSURANCE]
```

#### 4.1.2 User API

```yaml
openapi: 3.0.0
info:
  title: User Service API
  version: 1.0.0
  description: API for user management
paths:
  /api/users:
    get:
      summary: List users
      description: Get a list of users
      parameters:
        - name: role
          in: query
          schema:
            type: string
        - name: is_active
          in: query
          schema:
            type: boolean
        - name: search
          in: query
          schema:
            type: string
      responses:
        '200':
          description: List of users
          content:
            application/json:
              schema:
                type: array
                items:
                  $ref: '#/components/schemas/User'
    post:
      summary: Create user
      description: Create a new user
      requestBody:
        required: true
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/UserCreate'
      responses:
        '201':
          description: User created
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/User'

  /api/users/{id}:
    get:
      summary: Get user
      description: Get user details
      parameters:
        - name: id
          in: path
          required: true
          schema:
            type: string
            format: uuid
      responses:
        '200':
          description: User details
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/User'
        '404':
          description: User not found
    put:
      summary: Update user
      description: Update user details
      parameters:
        - name: id
          in: path
          required: true
          schema:
            type: string
            format: uuid
      requestBody:
        required: true
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/UserUpdate'
      responses:
        '200':
          description: User updated
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/User'
        '404':
          description: User not found
    delete:
      summary: Delete user
      description: Soft delete user
      parameters:
        - name: id
          in: path
          required: true
          schema:
            type: string
            format: uuid
      responses:
        '204':
          description: User deleted
        '404':
          description: User not found

  /api/users/me:
    get:
      summary: Get current user
      description: Get current user details
      responses:
        '200':
          description: Current user details
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/User'

  /api/users/change-password:
    post:
      summary: Change password
      description: Change user's password
      requestBody:
        required: true
        content:
          application/json:
            schema:
              type: object
              properties:
                old_password:
                  type: string
                  format: password
                new_password:
                  type: string
                  format: password
              required:
                - old_password
                - new_password
      responses:
        '200':
          description: Password changed
        '400':
          description: Invalid request

components:
  schemas:
    User:
      type: object
      properties:
        id:
          type: string
          format: uuid
        email:
          type: string
          format: email
        first_name:
          type: string
        last_name:
          type: string
        role:
          type: string
          enum: [ADMIN, DOCTOR, NURSE, PATIENT, PHARMACIST, LAB_TECH, INSURANCE]
        is_active:
          type: boolean
        date_joined:
          type: string
          format: date-time
        last_login:
          type: string
          format: date-time

    UserCreate:
      type: object
      properties:
        email:
          type: string
          format: email
        password:
          type: string
          format: password
        first_name:
          type: string
        last_name:
          type: string
        role:
          type: string
          enum: [ADMIN, DOCTOR, NURSE, PATIENT, PHARMACIST, LAB_TECH, INSURANCE]
      required:
        - email
        - password
        - first_name
        - last_name
        - role

    UserUpdate:
      type: object
      properties:
        email:
          type: string
          format: email
        first_name:
          type: string
        last_name:
          type: string
        is_active:
          type: boolean
```

### 4.2 Medical Record Service API

```yaml
openapi: 3.0.0
info:
  title: Medical Record Service API
  version: 1.0.0
  description: API for medical record management
paths:
  /api/medical-records:
    get:
      summary: List medical records
      description: Get a list of medical records
      parameters:
        - name: patient_id
          in: query
          schema:
            type: string
            format: uuid
        - name: status
          in: query
          schema:
            type: string
      responses:
        '200':
          description: List of medical records
          content:
            application/json:
              schema:
                type: array
                items:
                  $ref: '#/components/schemas/MedicalRecord'
    post:
      summary: Create medical record
      description: Create a new medical record
      requestBody:
        required: true
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/MedicalRecordCreate'
      responses:
        '201':
          description: Medical record created
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/MedicalRecord'

  /api/medical-records/{id}:
    get:
      summary: Get medical record
      description: Get medical record details
      parameters:
        - name: id
          in: path
          required: true
          schema:
            type: string
            format: uuid
      responses:
        '200':
          description: Medical record details
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/MedicalRecord'
        '404':
          description: Medical record not found
    put:
      summary: Update medical record
      description: Update medical record details
      parameters:
        - name: id
          in: path
          required: true
          schema:
            type: string
            format: uuid
      requestBody:
        required: true
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/MedicalRecordUpdate'
      responses:
        '200':
          description: Medical record updated
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/MedicalRecord'
        '404':
          description: Medical record not found

  /api/medical-records/{id}/encounters:
    get:
      summary: Get medical record encounters
      description: Get encounters for a medical record
      parameters:
        - name: id
          in: path
          required: true
          schema:
            type: string
            format: uuid
      responses:
        '200':
          description: List of encounters
          content:
            application/json:
              schema:
                type: array
                items:
                  $ref: '#/components/schemas/Encounter'

  /api/medical-records/{id}/allergies:
    get:
      summary: Get medical record allergies
      description: Get allergies for a medical record
      parameters:
        - name: id
          in: path
          required: true
          schema:
            type: string
            format: uuid
      responses:
        '200':
          description: List of allergies
          content:
            application/json:
              schema:
                type: array
                items:
                  $ref: '#/components/schemas/Allergy'

  /api/medical-records/{id}/medications:
    get:
      summary: Get medical record medications
      description: Get medications for a medical record
      parameters:
        - name: id
          in: path
          required: true
          schema:
            type: string
            format: uuid
      responses:
        '200':
          description: List of medications
          content:
            application/json:
              schema:
                type: array
                items:
                  $ref: '#/components/schemas/Medication'

components:
  schemas:
    MedicalRecord:
      type: object
      properties:
        id:
          type: string
          format: uuid
        patient_id:
          type: string
          format: uuid
        status:
          type: string
          enum: [ACTIVE, INACTIVE, ARCHIVED]
        notes:
          type: string
        created_at:
          type: string
          format: date-time
        updated_at:
          type: string
          format: date-time

    MedicalRecordCreate:
      type: object
      properties:
        patient_id:
          type: string
          format: uuid
        status:
          type: string
          enum: [ACTIVE, INACTIVE, ARCHIVED]
        notes:
          type: string
      required:
        - patient_id

    MedicalRecordUpdate:
      type: object
      properties:
        status:
          type: string
          enum: [ACTIVE, INACTIVE, ARCHIVED]
        notes:
          type: string

    Encounter:
      type: object
      properties:
        id:
          type: string
          format: uuid
        medical_record:
          type: string
          format: uuid
        doctor_id:
          type: string
          format: uuid
        encounter_date:
          type: string
          format: date-time
        encounter_type:
          type: string
        reason:
          type: string
        status:
          type: string
        notes:
          type: string
        created_at:
          type: string
          format: date-time
        updated_at:
          type: string
          format: date-time

    Allergy:
      type: object
      properties:
        id:
          type: string
          format: uuid
        medical_record:
          type: string
          format: uuid
        allergen:
          type: string
        reaction:
          type: string
        severity:
          type: string
        diagnosed_date:
          type: string
          format: date
        notes:
          type: string

    Medication:
      type: object
      properties:
        id:
          type: string
          format: uuid
        medical_record:
          type: string
          format: uuid
        name:
          type: string
        dosage:
          type: string
        frequency:
          type: string
        prescribed_by:
          type: string
          format: uuid
        prescribed_date:
          type: string
          format: date
        start_date:
          type: string
          format: date
        end_date:
          type: string
          format: date
        is_current:
          type: boolean
        notes:
          type: string
```

### 4.3 Appointment Service API

```yaml
openapi: 3.0.0
info:
  title: Appointment Service API
  version: 1.0.0
  description: API for appointment management
paths:
  /api/appointments:
    get:
      summary: List appointments
      description: Get a list of appointments
      parameters:
        - name: patient_id
          in: query
          schema:
            type: string
            format: uuid
        - name: doctor_id
          in: query
          schema:
            type: string
            format: uuid
        - name: appointment_date
          in: query
          schema:
            type: string
            format: date
        - name: status
          in: query
          schema:
            type: string
      responses:
        '200':
          description: List of appointments
          content:
            application/json:
              schema:
                type: array
                items:
                  $ref: '#/components/schemas/Appointment'
    post:
      summary: Create appointment
      description: Create a new appointment
      requestBody:
        required: true
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/AppointmentCreate'
      responses:
        '201':
          description: Appointment created
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/Appointment'

  /api/appointments/{id}:
    get:
      summary: Get appointment
      description: Get appointment details
      parameters:
        - name: id
          in: path
          required: true
          schema:
            type: string
            format: uuid
      responses:
        '200':
          description: Appointment details
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/Appointment'
        '404':
          description: Appointment not found
    put:
      summary: Update appointment
      description: Update appointment details
      parameters:
        - name: id
          in: path
          required: true
          schema:
            type: string
            format: uuid
      requestBody:
        required: true
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/AppointmentUpdate'
      responses:
        '200':
          description: Appointment updated
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/Appointment'
        '404':
          description: Appointment not found

  /api/appointments/{id}/cancel:
    post:
      summary: Cancel appointment
      description: Cancel an appointment
      parameters:
        - name: id
          in: path
          required: true
          schema:
            type: string
            format: uuid
      requestBody:
        content:
          application/json:
            schema:
              type: object
              properties:
                reason:
                  type: string
      responses:
        '200':
          description: Appointment cancelled
        '400':
          description: Cannot cancel appointment
        '404':
          description: Appointment not found

  /api/appointments/{id}/reschedule:
    post:
      summary: Reschedule appointment
      description: Reschedule an appointment
      parameters:
        - name: id
          in: path
          required: true
          schema:
            type: string
            format: uuid
      requestBody:
        required: true
        content:
          application/json:
            schema:
              type: object
              properties:
                time_slot_id:
                  type: string
                  format: uuid
              required:
                - time_slot_id
      responses:
        '200':
          description: Appointment rescheduled
        '400':
          description: Cannot reschedule appointment
        '404':
          description: Appointment not found

  /api/doctor-availability:
    get:
      summary: List doctor availabilities
      description: Get a list of doctor availabilities
      parameters:
        - name: doctor_id
          in: query
          schema:
            type: string
            format: uuid
        - name: day_of_week
          in: query
          schema:
            type: integer
        - name: is_active
          in: query
          schema:
            type: boolean
      responses:
        '200':
          description: List of doctor availabilities
          content:
            application/json:
              schema:
                type: array
                items:
                  $ref: '#/components/schemas/DoctorAvailability'

  /api/doctor-availability/by-doctor:
    get:
      summary: Get doctor availabilities by doctor
      description: Get availabilities for a specific doctor
      parameters:
        - name: doctor_id
          in: query
          required: true
          schema:
            type: string
            format: uuid
      responses:
        '200':
          description: List of doctor availabilities
          content:
            application/json:
              schema:
                type: array
                items:
                  $ref: '#/components/schemas/DoctorAvailability'
        '400':
          description: doctor_id is required

  /api/doctor-availability/{id}/time-slots:
    get:
      summary: Get time slots for availability
      description: Generate time slots for a specific date based on this availability
      parameters:
        - name: id
          in: path
          required: true
          schema:
            type: string
            format: uuid
        - name: date
          in: query
          required: true
          schema:
            type: string
            format: date
      responses:
        '200':
          description: List of time slots
          content:
            application/json:
              schema:
                type: array
                items:
                  $ref: '#/components/schemas/TimeSlot'
        '400':
          description: date is required or invalid date format

components:
  schemas:
    Appointment:
      type: object
      properties:
        id:
          type: string
          format: uuid
        patient_id:
          type: string
          format: uuid
        doctor_id:
          type: string
          format: uuid
        time_slot:
          type: string
          format: uuid
        appointment_date:
          type: string
          format: date
        start_time:
          type: string
          format: time
        end_time:
          type: string
          format: time
        status:
          type: string
          enum: [SCHEDULED, CONFIRMED, CANCELLED, COMPLETED, NO_SHOW]
        cancelled_reason:
          type: string
        notes:
          type: string
        created_at:
          type: string
          format: date-time
        updated_at:
          type: string
          format: date-time
        reason:
          $ref: '#/components/schemas/AppointmentReason'

    AppointmentCreate:
      type: object
      properties:
        patient_id:
          type: string
          format: uuid
        doctor_id:
          type: string
          format: uuid
        time_slot:
          type: string
          format: uuid
        appointment_date:
          type: string
          format: date
        start_time:
          type: string
          format: time
        end_time:
          type: string
          format: time
        notes:
          type: string
        reason:
          $ref: '#/components/schemas/AppointmentReasonCreate'
      required:
        - patient_id
        - doctor_id
        - time_slot
        - appointment_date
        - start_time
        - end_time

    AppointmentUpdate:
      type: object
      properties:
        status:
          type: string
          enum: [SCHEDULED, CONFIRMED, CANCELLED, COMPLETED, NO_SHOW]
        notes:
          type: string

    AppointmentReason:
      type: object
      properties:
        id:
          type: string
          format: uuid
        appointment:
          type: string
          format: uuid
        reason:
          type: string
        is_first_visit:
          type: boolean
        symptoms:
          type: string
        duration:
          type: string

    AppointmentReasonCreate:
      type: object
      properties:
        reason:
          type: string
        is_first_visit:
          type: boolean
        symptoms:
          type: string
        duration:
          type: string
      required:
        - reason

    DoctorAvailability:
      type: object
      properties:
        id:
          type: string
          format: uuid
        doctor_id:
          type: string
          format: uuid
        day_of_week:
          type: integer
        start_time:
          type: string
          format: time
        end_time:
          type: string
          format: time
        is_active:
          type: boolean
        effective_from:
          type: string
          format: date
        effective_to:
          type: string
          format: date
        notes:
          type: string

    TimeSlot:
      type: object
      properties:
        id:
          type: string
          format: uuid
        doctor_id:
          type: string
          format: uuid
        date:
          type: string
          format: date
        start_time:
          type: string
          format: time
        end_time:
          type: string
          format: time
        status:
          type: string
          enum: [AVAILABLE, BOOKED, BLOCKED]
```