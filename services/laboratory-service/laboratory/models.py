from django.db import models
from django.utils.translation import gettext_lazy as _


class TestType(models.Model):
    """
    Model representing different types of laboratory tests.
    """
    name = models.CharField(max_length=100)
    description = models.TextField()
    preparation_instructions = models.TextField(blank=True, null=True)
    normal_range = models.CharField(max_length=255, blank=True, null=True)
    unit = models.CharField(max_length=50, blank=True, null=True)
    price = models.DecimalField(max_digits=10, decimal_places=2)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.name


class LabTest(models.Model):
    """
    Model representing a laboratory test ordered for a patient.
    """
    class Status(models.TextChoices):
        ORDERED = 'ORDERED', _('Ordered')
        SAMPLE_COLLECTED = 'SAMPLE_COLLECTED', _('Sample Collected')
        IN_PROGRESS = 'IN_PROGRESS', _('In Progress')
        COMPLETED = 'COMPLETED', _('Completed')
        CANCELLED = 'CANCELLED', _('Cancelled')

    patient_id = models.IntegerField()
    doctor_id = models.IntegerField()
    test_type = models.ForeignKey(TestType, on_delete=models.CASCADE, related_name='lab_tests')
    status = models.CharField(max_length=20, choices=Status.choices, default=Status.ORDERED)
    ordered_date = models.DateTimeField(auto_now_add=True)
    scheduled_date = models.DateTimeField(null=True, blank=True)
    sample_collection_date = models.DateTimeField(null=True, blank=True)
    result_date = models.DateTimeField(null=True, blank=True)
    notes = models.TextField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.test_type.name} for Patient {self.patient_id}"


class TestResult(models.Model):
    """
    Model representing the results of a laboratory test.
    """
    lab_test = models.OneToOneField(LabTest, on_delete=models.CASCADE, related_name='result')
    technician_id = models.IntegerField()
    result_value = models.TextField()
    is_abnormal = models.BooleanField(default=False)
    comments = models.TextField(blank=True, null=True)
    attachment = models.FileField(upload_to='test_results/', null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"Result for {self.lab_test}"


class SampleCollection(models.Model):
    """
    Model representing the collection of samples for laboratory tests.
    """
    class SampleType(models.TextChoices):
        BLOOD = 'BLOOD', _('Blood')
        URINE = 'URINE', _('Urine')
        STOOL = 'STOOL', _('Stool')
        SWAB = 'SWAB', _('Swab')
        TISSUE = 'TISSUE', _('Tissue')
        OTHER = 'OTHER', _('Other')

    lab_test = models.OneToOneField(LabTest, on_delete=models.CASCADE, related_name='sample')
    collector_id = models.IntegerField()
    sample_type = models.CharField(max_length=20, choices=SampleType.choices)
    collection_date = models.DateTimeField(auto_now_add=True)
    sample_id = models.CharField(max_length=50, unique=True)
    notes = models.TextField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.sample_type} sample for {self.lab_test}"


class Notification(models.Model):
    """
    Model representing notifications for laboratory tests.
    """
    class NotificationType(models.TextChoices):
        TEST_ORDERED = 'TEST_ORDERED', _('Test Ordered')
        SAMPLE_COLLECTED = 'SAMPLE_COLLECTED', _('Sample Collected')
        RESULT_READY = 'RESULT_READY', _('Result Ready')
        TEST_CANCELLED = 'TEST_CANCELLED', _('Test Cancelled')

    lab_test = models.ForeignKey(LabTest, on_delete=models.CASCADE, related_name='notifications')
    recipient_id = models.IntegerField()
    recipient_type = models.CharField(max_length=20)  # PATIENT, DOCTOR, LAB_TECHNICIAN, etc.
    notification_type = models.CharField(max_length=20, choices=NotificationType.choices)
    message = models.TextField()
    is_read = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.notification_type} for {self.recipient_type} {self.recipient_id}"