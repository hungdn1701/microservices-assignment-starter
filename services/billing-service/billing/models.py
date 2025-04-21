from django.db import models
from django.utils.translation import gettext_lazy as _


class Invoice(models.Model):
    """
    Model representing a billing invoice.
    """
    class Status(models.TextChoices):
        DRAFT = 'DRAFT', _('Draft')
        PENDING = 'PENDING', _('Pending')
        PAID = 'PAID', _('Paid')
        PARTIALLY_PAID = 'PARTIALLY_PAID', _('Partially Paid')
        OVERDUE = 'OVERDUE', _('Overdue')
        CANCELLED = 'CANCELLED', _('Cancelled')
        REFUNDED = 'REFUNDED', _('Refunded')

    patient_id = models.IntegerField()
    invoice_number = models.CharField(max_length=50, unique=True)
    status = models.CharField(max_length=20, choices=Status.choices, default=Status.DRAFT)
    issue_date = models.DateField()
    due_date = models.DateField()
    total_amount = models.DecimalField(max_digits=10, decimal_places=2)
    discount = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    tax = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    final_amount = models.DecimalField(max_digits=10, decimal_places=2)
    notes = models.TextField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"Invoice #{self.invoice_number} - {self.get_status_display()}"


class InvoiceItem(models.Model):
    """
    Model representing an item in an invoice.
    """
    class ItemType(models.TextChoices):
        # Appointment related
        APPOINTMENT = 'APPOINTMENT', _('Appointment')
        CONSULTATION = 'CONSULTATION', _('Consultation')
        FOLLOW_UP = 'FOLLOW_UP', _('Follow-up Visit')
        EMERGENCY = 'EMERGENCY', _('Emergency Visit')

        # Medical record related
        PROCEDURE = 'PROCEDURE', _('Medical Procedure')
        SURGERY = 'SURGERY', _('Surgery')
        IMAGING = 'IMAGING', _('Imaging (X-ray, MRI, etc.)')
        VACCINATION = 'VACCINATION', _('Vaccination')

        # Laboratory related
        LAB_TEST = 'LAB_TEST', _('Laboratory Test')
        BLOOD_TEST = 'BLOOD_TEST', _('Blood Test')
        URINE_TEST = 'URINE_TEST', _('Urine Test')
        PATHOLOGY = 'PATHOLOGY', _('Pathology')

        # Pharmacy related
        MEDICATION = 'MEDICATION', _('Medication')
        PRESCRIPTION = 'PRESCRIPTION', _('Prescription')
        OTC_MEDICATION = 'OTC_MEDICATION', _('Over-the-counter Medication')
        MEDICAL_SUPPLY = 'MEDICAL_SUPPLY', _('Medical Supply')

        # Facility related
        ROOM_CHARGE = 'ROOM_CHARGE', _('Room Charge')
        ICU_CHARGE = 'ICU_CHARGE', _('ICU Charge')
        WARD_CHARGE = 'WARD_CHARGE', _('Ward Charge')

        # Other
        ADMINISTRATIVE = 'ADMINISTRATIVE', _('Administrative Fee')
        INSURANCE = 'INSURANCE', _('Insurance Processing')
        OTHER = 'OTHER', _('Other')

    invoice = models.ForeignKey(Invoice, on_delete=models.CASCADE, related_name='items')
    item_type = models.CharField(max_length=20, choices=ItemType.choices)
    description = models.CharField(max_length=255)
    quantity = models.PositiveIntegerField(default=1)
    unit_price = models.DecimalField(max_digits=10, decimal_places=2)
    total_price = models.DecimalField(max_digits=10, decimal_places=2)

    # Reference fields for related services
    reference_id = models.IntegerField(null=True, blank=True)  # ID of the related entity (appointment, medication, etc.)
    service_type = models.CharField(max_length=50, null=True, blank=True)  # Type of service (appointment, medical-record, laboratory, pharmacy)

    # Specific reference fields for each service
    appointment_id = models.IntegerField(null=True, blank=True)
    medical_record_id = models.IntegerField(null=True, blank=True)
    lab_test_id = models.IntegerField(null=True, blank=True)
    prescription_id = models.IntegerField(null=True, blank=True)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.description} - {self.total_price}"


class Payment(models.Model):
    """
    Model representing a payment for an invoice.
    """
    class PaymentMethod(models.TextChoices):
        CASH = 'CASH', _('Cash')
        CREDIT_CARD = 'CREDIT_CARD', _('Credit Card')
        DEBIT_CARD = 'DEBIT_CARD', _('Debit Card')
        BANK_TRANSFER = 'BANK_TRANSFER', _('Bank Transfer')
        INSURANCE = 'INSURANCE', _('Insurance')
        MOBILE_PAYMENT = 'MOBILE_PAYMENT', _('Mobile Payment')
        OTHER = 'OTHER', _('Other')

    class Status(models.TextChoices):
        PENDING = 'PENDING', _('Pending')
        COMPLETED = 'COMPLETED', _('Completed')
        FAILED = 'FAILED', _('Failed')
        REFUNDED = 'REFUNDED', _('Refunded')

    invoice = models.ForeignKey(Invoice, on_delete=models.CASCADE, related_name='payments')
    payment_method = models.CharField(max_length=20, choices=PaymentMethod.choices)
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    transaction_id = models.CharField(max_length=100, blank=True, null=True)
    payment_date = models.DateTimeField()
    status = models.CharField(max_length=20, choices=Status.choices, default=Status.PENDING)
    payment_gateway = models.CharField(max_length=50, blank=True, null=True, help_text='Payment gateway used for processing')
    payment_reference = models.CharField(max_length=100, blank=True, null=True, help_text='Reference code from payment gateway')
    notes = models.TextField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"Payment of {self.amount} for Invoice #{self.invoice.invoice_number}"


class InsuranceClaim(models.Model):
    """
    Model representing an insurance claim for an invoice.
    """
    class Status(models.TextChoices):
        SUBMITTED = 'SUBMITTED', _('Submitted')
        IN_REVIEW = 'IN_REVIEW', _('In Review')
        APPROVED = 'APPROVED', _('Approved')
        PARTIALLY_APPROVED = 'PARTIALLY_APPROVED', _('Partially Approved')
        REJECTED = 'REJECTED', _('Rejected')
        APPEALED = 'APPEALED', _('Appealed')

    invoice = models.ForeignKey(Invoice, on_delete=models.CASCADE, related_name='insurance_claims')
    insurance_provider_id = models.IntegerField()
    policy_number = models.CharField(max_length=100)
    member_id = models.CharField(max_length=100, blank=True, null=True)
    claim_number = models.CharField(max_length=100, unique=True)
    claim_amount = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    submission_date = models.DateField()
    status = models.CharField(max_length=20, choices=Status.choices, default=Status.SUBMITTED)
    approved_amount = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    rejection_reason = models.TextField(blank=True, null=True)
    notes = models.TextField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"Claim #{self.claim_number} - {self.get_status_display()}"
