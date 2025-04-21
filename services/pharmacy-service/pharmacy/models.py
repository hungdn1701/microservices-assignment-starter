from django.db import models

class Medication(models.Model):
    """
    Model for storing medication information.
    """
    DOSAGE_FORM_CHOICES = [
        ('TABLET', 'Tablet'),
        ('CAPSULE', 'Capsule'),
        ('LIQUID', 'Liquid'),
        ('INJECTION', 'Injection'),
        ('CREAM', 'Cream'),
        ('OINTMENT', 'Ointment'),
        ('DROPS', 'Drops'),
        ('INHALER', 'Inhaler'),
        ('PATCH', 'Patch'),
        ('OTHER', 'Other'),
    ]

    CATEGORY_CHOICES = [
        ('ANTIBIOTIC', 'Antibiotic'),
        ('ANALGESIC', 'Analgesic'),
        ('ANTIVIRAL', 'Antiviral'),
        ('ANTIHISTAMINE', 'Antihistamine'),
        ('ANTIDEPRESSANT', 'Antidepressant'),
        ('ANTIHYPERTENSIVE', 'Antihypertensive'),
        ('ANTIDIABETIC', 'Antidiabetic'),
        ('ANTIINFLAMMATORY', 'Anti-inflammatory'),
        ('VITAMIN', 'Vitamin'),
        ('SUPPLEMENT', 'Supplement'),
        ('OTHER', 'Other'),
    ]

    name = models.CharField(max_length=255)
    description = models.TextField(blank=True, null=True)
    dosage_form = models.CharField(max_length=20, choices=DOSAGE_FORM_CHOICES)
    strength = models.CharField(max_length=100)
    manufacturer = models.CharField(max_length=255)
    category = models.CharField(max_length=20, choices=CATEGORY_CHOICES)
    requires_prescription = models.BooleanField(default=True)
    side_effects = models.TextField(blank=True, null=True)
    contraindications = models.TextField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.name} {self.strength} {self.get_dosage_form_display()}"

    class Meta:
        ordering = ['name', 'strength']
        indexes = [
            models.Index(fields=['name']),
            models.Index(fields=['category']),
        ]


class Prescription(models.Model):
    """
    Model for storing prescription information.
    """
    STATUS_CHOICES = [
        ('PENDING', 'Pending'),
        ('PROCESSING', 'Processing'),
        ('DISPENSED', 'Dispensed'),
        ('CANCELLED', 'Cancelled'),
        ('EXPIRED', 'Expired'),
    ]

    patient_id = models.IntegerField()
    doctor_id = models.IntegerField()
    diagnosis_id = models.IntegerField(null=True, blank=True, help_text="ID of the diagnosis in medical-record-service")
    encounter_id = models.IntegerField(null=True, blank=True, help_text="ID of the encounter in medical-record-service")
    # Thông tin chi tiết về chẩn đoán
    diagnosis_code = models.CharField(max_length=20, blank=True, null=True, help_text="Mã chẩn đoán (ICD-10)")
    diagnosis_description = models.TextField(blank=True, null=True, help_text="Mô tả chẩn đoán")
    date_prescribed = models.DateField()
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='PENDING')
    notes = models.TextField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"Prescription #{self.id} - Patient {self.patient_id}"

    class Meta:
        ordering = ['-date_prescribed']
        indexes = [
            models.Index(fields=['patient_id']),
            models.Index(fields=['doctor_id']),
            models.Index(fields=['status']),
        ]


class PrescriptionItem(models.Model):
    """
    Model for storing prescription item details.
    """
    prescription = models.ForeignKey(Prescription, related_name='items', on_delete=models.CASCADE)
    medication = models.ForeignKey(Medication, related_name='prescription_items', on_delete=models.PROTECT)
    dosage = models.CharField(max_length=100)
    frequency = models.CharField(max_length=100)
    duration = models.CharField(max_length=100)
    instructions = models.TextField()
    quantity = models.PositiveIntegerField()
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.medication.name} - {self.quantity} units"

    class Meta:
        ordering = ['prescription', 'id']
        indexes = [
            models.Index(fields=['prescription']),
            models.Index(fields=['medication']),
        ]


class Inventory(models.Model):
    """
    Model for storing medication inventory.
    """
    medication = models.ForeignKey(Medication, related_name='inventory_items', on_delete=models.CASCADE)
    batch_number = models.CharField(max_length=100)
    expiry_date = models.DateField()
    quantity = models.PositiveIntegerField()
    unit_price = models.DecimalField(max_digits=10, decimal_places=2)
    location = models.CharField(max_length=100, blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.medication.name} - Batch {self.batch_number} - {self.quantity} units"

    class Meta:
        ordering = ['expiry_date']
        indexes = [
            models.Index(fields=['medication']),
            models.Index(fields=['expiry_date']),
            models.Index(fields=['batch_number']),
        ]
        verbose_name_plural = "Inventories"


class Dispensing(models.Model):
    """
    Model for storing dispensing information.
    """
    STATUS_CHOICES = [
        ('PENDING', 'Pending'),
        ('COMPLETED', 'Completed'),
        ('CANCELLED', 'Cancelled'),
    ]

    prescription = models.ForeignKey(Prescription, related_name='dispensings', on_delete=models.CASCADE)
    pharmacist_id = models.IntegerField()
    date_dispensed = models.DateTimeField()
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='PENDING')
    notes = models.TextField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"Dispensing #{self.id} for Prescription #{self.prescription.id}"

    class Meta:
        ordering = ['-date_dispensed']
        indexes = [
            models.Index(fields=['prescription']),
            models.Index(fields=['pharmacist_id']),
            models.Index(fields=['status']),
        ]
        verbose_name_plural = "Dispensings"


class DispensingItem(models.Model):
    """
    Model for storing dispensing item details.
    """
    dispensing = models.ForeignKey(Dispensing, related_name='items', on_delete=models.CASCADE)
    prescription_item = models.ForeignKey(PrescriptionItem, related_name='dispensing_items', on_delete=models.CASCADE)
    inventory = models.ForeignKey(Inventory, related_name='dispensing_items', on_delete=models.CASCADE)
    quantity_dispensed = models.PositiveIntegerField()
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.prescription_item.medication.name} - {self.quantity_dispensed} units"

    class Meta:
        ordering = ['dispensing', 'id']
        indexes = [
            models.Index(fields=['dispensing']),
            models.Index(fields=['prescription_item']),
            models.Index(fields=['inventory']),
        ]
