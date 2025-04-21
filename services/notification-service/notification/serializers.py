from rest_framework import serializers
from .models import Notification, NotificationTemplate, NotificationSchedule, InAppNotification


class NotificationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Notification
        fields = '__all__'
        read_only_fields = ['created_at', 'updated_at', 'sent_at', 'delivered_at', 'status', 'error_message']


class NotificationTemplateSerializer(serializers.ModelSerializer):
    class Meta:
        model = NotificationTemplate
        fields = '__all__'
        read_only_fields = ['created_at', 'updated_at']


class NotificationScheduleSerializer(serializers.ModelSerializer):
    class Meta:
        model = NotificationSchedule
        fields = '__all__'
        read_only_fields = ['created_at', 'updated_at', 'status']


class InAppNotificationSerializer(serializers.ModelSerializer):
    """
    Serializer for the InAppNotification model, used for API responses.
    """
    class Meta:
        model = InAppNotification
        fields = [
            'id', 'recipient_id', 'recipient_type', 'notification_type',
            'title', 'content', 'status', 'reference_id', 'reference_type',
            'is_urgent', 'read_at', 'service', 'event_type', 'metadata',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['created_at', 'updated_at']


class SendEmailNotificationSerializer(serializers.Serializer):
    recipient_id = serializers.IntegerField()
    recipient_type = serializers.ChoiceField(choices=Notification.RecipientType.choices)
    recipient_email = serializers.EmailField()
    subject = serializers.CharField(max_length=255)
    content = serializers.CharField()
    notification_type = serializers.ChoiceField(choices=Notification.NotificationType.choices)
    reference_id = serializers.CharField(max_length=100, required=False, allow_blank=True, allow_null=True)
    reference_type = serializers.CharField(max_length=20, required=False, allow_blank=True, allow_null=True)


class SendSMSNotificationSerializer(serializers.Serializer):
    recipient_id = serializers.IntegerField()
    recipient_type = serializers.ChoiceField(choices=Notification.RecipientType.choices)
    recipient_phone = serializers.CharField(max_length=20)
    content = serializers.CharField()
    notification_type = serializers.ChoiceField(choices=Notification.NotificationType.choices)
    reference_id = serializers.CharField(max_length=100, required=False, allow_blank=True, allow_null=True)
    reference_type = serializers.CharField(max_length=20, required=False, allow_blank=True, allow_null=True)


class ScheduleNotificationSerializer(serializers.Serializer):
    recipient_id = serializers.IntegerField()
    recipient_type = serializers.ChoiceField(choices=Notification.RecipientType.choices)
    recipient_email = serializers.EmailField(required=False, allow_blank=True, allow_null=True)
    recipient_phone = serializers.CharField(max_length=20, required=False, allow_blank=True, allow_null=True)
    notification_type = serializers.ChoiceField(choices=Notification.NotificationType.choices)
    channel = serializers.ChoiceField(choices=Notification.Channel.choices)
    subject = serializers.CharField(max_length=255, required=False, allow_blank=True, allow_null=True)
    content = serializers.CharField()
    scheduled_at = serializers.DateTimeField()
    template_id = serializers.IntegerField(required=False, allow_null=True)
    reference_id = serializers.CharField(max_length=100, required=False, allow_blank=True, allow_null=True)
    reference_type = serializers.CharField(max_length=20, required=False, allow_blank=True, allow_null=True)

    def validate(self, data):
        # Validate that either recipient_email or recipient_phone is provided based on the channel
        if data.get('channel') == Notification.Channel.EMAIL and not data.get('recipient_email'):
            raise serializers.ValidationError("recipient_email is required for EMAIL channel")
        if data.get('channel') == Notification.Channel.SMS and not data.get('recipient_phone'):
            raise serializers.ValidationError("recipient_phone is required for SMS channel")

        # Validate that subject is provided for email notifications
        if data.get('channel') == Notification.Channel.EMAIL and not data.get('subject') and not data.get('template_id'):
            raise serializers.ValidationError("subject is required for EMAIL channel when no template is used")

        return data


# Event serializers for different services
class AppointmentEventSerializer(serializers.Serializer):
    event_type = serializers.ChoiceField(choices=[
        ('CREATED', 'Created'),
        ('UPDATED', 'Updated'),
        ('CANCELLED', 'Cancelled'),
        ('REMINDER', 'Reminder'),
        ('COMPLETED', 'Completed')
    ])
    appointment_id = serializers.IntegerField()
    patient_id = serializers.IntegerField()
    doctor_id = serializers.IntegerField()
    appointment_date = serializers.CharField()
    appointment_time = serializers.CharField(required=False, allow_blank=True)
    status = serializers.CharField(required=False, allow_blank=True)
    appointment_type = serializers.CharField(max_length=50, required=False, allow_blank=True, allow_null=True)
    notes = serializers.CharField(required=False, allow_blank=True, allow_null=True)


class MedicalRecordEventSerializer(serializers.Serializer):
    event_type = serializers.ChoiceField(choices=[
        ('CREATED', 'Created'),
        ('UPDATED', 'Updated'),
        ('DIAGNOSIS_ADDED', 'Diagnosis Added'),
        ('TREATMENT_ADDED', 'Treatment Added'),
        ('MEDICATION_ADDED', 'Medication Added')
    ])
    record_id = serializers.IntegerField()
    patient_id = serializers.IntegerField()
    doctor_id = serializers.IntegerField(required=False, allow_null=True)
    record_type = serializers.CharField(max_length=50)
    description = serializers.CharField(required=False, allow_blank=True, allow_null=True)


class BillingEventSerializer(serializers.Serializer):
    event_type = serializers.ChoiceField(choices=[
        ('INVOICE_CREATED', 'Invoice Created'),
        ('PAYMENT_RECEIVED', 'Payment Received'),
        ('PAYMENT_DUE', 'Payment Due'),
        ('PAYMENT_OVERDUE', 'Payment Overdue'),
        ('INSURANCE_CLAIM_SUBMITTED', 'Insurance Claim Submitted'),
        ('INSURANCE_CLAIM_APPROVED', 'Insurance Claim Approved'),
        ('INSURANCE_CLAIM_REJECTED', 'Insurance Claim Rejected')
    ])
    invoice_id = serializers.IntegerField(required=False, allow_null=True)
    payment_id = serializers.IntegerField(required=False, allow_null=True)
    claim_id = serializers.IntegerField(required=False, allow_null=True)
    patient_id = serializers.IntegerField()
    amount = serializers.DecimalField(max_digits=10, decimal_places=2, required=False, allow_null=True)
    due_date = serializers.DateField(required=False, allow_null=True)
    description = serializers.CharField(required=False, allow_blank=True, allow_null=True)


class PharmacyEventSerializer(serializers.Serializer):
    event_type = serializers.ChoiceField(choices=[
        ('PRESCRIPTION_CREATED', 'Prescription Created'),
        ('PRESCRIPTION_FILLED', 'Prescription Filled'),
        ('PRESCRIPTION_READY', 'Prescription Ready for Pickup'),
        ('PRESCRIPTION_PICKED_UP', 'Prescription Picked Up'),
        ('MEDICATION_REFILL_DUE', 'Medication Refill Due'),
        ('MEDICATION_EXPIRING', 'Medication Expiring')
    ])
    prescription_id = serializers.IntegerField(required=False, allow_null=True)
    medication_id = serializers.IntegerField(required=False, allow_null=True)
    patient_id = serializers.IntegerField()
    doctor_id = serializers.IntegerField(required=False, allow_null=True)
    medication_name = serializers.CharField(max_length=100, required=False, allow_blank=True, allow_null=True)
    pickup_date = serializers.DateField(required=False, allow_null=True)
    refill_date = serializers.DateField(required=False, allow_null=True)
    notes = serializers.CharField(required=False, allow_blank=True, allow_null=True)


class LaboratoryEventSerializer(serializers.Serializer):
    event_type = serializers.ChoiceField(choices=[
        ('TEST_ORDERED', 'Test Ordered'),
        ('SAMPLE_COLLECTED', 'Sample Collected'),
        ('RESULTS_READY', 'Results Ready'),
        ('RESULTS_DELIVERED', 'Results Delivered'),
        ('ABNORMAL_RESULTS', 'Abnormal Results')
    ])
    test_id = serializers.IntegerField(required=False, allow_null=True)
    result_id = serializers.IntegerField(required=False, allow_null=True)
    patient_id = serializers.IntegerField()
    doctor_id = serializers.IntegerField(required=False, allow_null=True)
    test_name = serializers.CharField(max_length=100, required=False, allow_blank=True, allow_null=True)
    test_date = serializers.DateField(required=False, allow_null=True)
    is_abnormal = serializers.BooleanField(required=False, allow_null=True)
    notes = serializers.CharField(required=False, allow_blank=True, allow_null=True)


class EventSerializer(serializers.Serializer):
    service = serializers.ChoiceField(choices=[
        ('APPOINTMENT', 'Appointment Service'),
        ('MEDICAL_RECORD', 'Medical Record Service'),
        ('BILLING', 'Billing Service'),
        ('PHARMACY', 'Pharmacy Service'),
        ('LABORATORY', 'Laboratory Service')
    ])
    event_data = serializers.JSONField()

    def validate(self, data):
        service = data.get('service')
        event_data = data.get('event_data')

        # Validate event data based on service
        if service == 'APPOINTMENT':
            serializer = AppointmentEventSerializer(data=event_data)
        elif service == 'MEDICAL_RECORD':
            serializer = MedicalRecordEventSerializer(data=event_data)
        elif service == 'BILLING':
            serializer = BillingEventSerializer(data=event_data)
        elif service == 'PHARMACY':
            serializer = PharmacyEventSerializer(data=event_data)
        elif service == 'LABORATORY':
            serializer = LaboratoryEventSerializer(data=event_data)
        else:
            raise serializers.ValidationError(f"Unknown service: {service}")

        if not serializer.is_valid():
            raise serializers.ValidationError(serializer.errors)

        return data
