from django.db import models
from django.utils.translation import gettext_lazy as _


class Notification(models.Model):
    """
    Model representing a notification.
    """
    class NotificationType(models.TextChoices):
        APPOINTMENT = 'APPOINTMENT', _('Appointment')
        BILLING = 'BILLING', _('Billing')
        MEDICAL_RECORD = 'MEDICAL_RECORD', _('Medical Record')
        LAB_RESULT = 'LAB_RESULT', _('Lab Result')
        PRESCRIPTION = 'PRESCRIPTION', _('Prescription')
        SYSTEM = 'SYSTEM', _('System')
        OTHER = 'OTHER', _('Other')

    class Channel(models.TextChoices):
        EMAIL = 'EMAIL', _('Email')
        SMS = 'SMS', _('SMS')
        PUSH = 'PUSH', _('Push Notification')
        IN_APP = 'IN_APP', _('In-App Notification')

    class Status(models.TextChoices):
        PENDING = 'PENDING', _('Pending')
        SENT = 'SENT', _('Sent')
        DELIVERED = 'DELIVERED', _('Delivered')
        FAILED = 'FAILED', _('Failed')
        CANCELLED = 'CANCELLED', _('Cancelled')

    class RecipientType(models.TextChoices):
        PATIENT = 'PATIENT', _('Patient')
        DOCTOR = 'DOCTOR', _('Doctor')
        NURSE = 'NURSE', _('Nurse')
        ADMIN = 'ADMIN', _('Administrator')
        PHARMACIST = 'PHARMACIST', _('Pharmacist')
        INSURANCE_PROVIDER = 'INSURANCE_PROVIDER', _('Insurance Provider')
        LAB_TECHNICIAN = 'LAB_TECHNICIAN', _('Laboratory Technician')
        OTHER = 'OTHER', _('Other')

    recipient_id = models.IntegerField()
    recipient_type = models.CharField(max_length=20, choices=RecipientType.choices)
    recipient_email = models.EmailField(blank=True, null=True)
    recipient_phone = models.CharField(max_length=20, blank=True, null=True)
    notification_type = models.CharField(max_length=20, choices=NotificationType.choices)
    channel = models.CharField(max_length=10, choices=Channel.choices)
    subject = models.CharField(max_length=255)
    content = models.TextField()
    status = models.CharField(max_length=10, choices=Status.choices, default=Status.PENDING)
    sent_at = models.DateTimeField(blank=True, null=True)
    delivered_at = models.DateTimeField(blank=True, null=True)
    error_message = models.TextField(blank=True, null=True)
    reference_id = models.CharField(max_length=100, blank=True, null=True)  # ID of the related entity (appointment, invoice, etc.)
    reference_type = models.CharField(max_length=20, blank=True, null=True)  # Type of the related entity
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.get_notification_type_display()} to {self.recipient_email or self.recipient_phone}"


class NotificationTemplate(models.Model):
    """
    Model representing a notification template.
    """
    name = models.CharField(max_length=100)
    notification_type = models.CharField(max_length=20, choices=Notification.NotificationType.choices)
    channel = models.CharField(max_length=10, choices=Notification.Channel.choices)
    subject_template = models.CharField(max_length=255)
    content_template = models.TextField()
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.name} ({self.get_notification_type_display()} - {self.get_channel_display()})"


class NotificationSchedule(models.Model):
    """
    Model representing a scheduled notification.
    """
    class Status(models.TextChoices):
        SCHEDULED = 'SCHEDULED', _('Scheduled')
        PROCESSING = 'PROCESSING', _('Processing')
        COMPLETED = 'COMPLETED', _('Completed')
        FAILED = 'FAILED', _('Failed')
        CANCELLED = 'CANCELLED', _('Cancelled')

    recipient_id = models.IntegerField()
    recipient_type = models.CharField(max_length=20, choices=Notification.RecipientType.choices)
    recipient_email = models.EmailField(blank=True, null=True)
    recipient_phone = models.CharField(max_length=20, blank=True, null=True)
    notification_type = models.CharField(max_length=20, choices=Notification.NotificationType.choices)
    channel = models.CharField(max_length=10, choices=Notification.Channel.choices)
    subject = models.CharField(max_length=255)
    content = models.TextField()
    scheduled_at = models.DateTimeField()
    status = models.CharField(max_length=10, choices=Status.choices, default=Status.SCHEDULED)
    template = models.ForeignKey(NotificationTemplate, on_delete=models.SET_NULL, blank=True, null=True)
    reference_id = models.CharField(max_length=100, blank=True, null=True)
    reference_type = models.CharField(max_length=20, blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.get_notification_type_display()} scheduled for {self.scheduled_at}"


class InAppNotification(models.Model):
    """
    Model representing an in-app notification that will be displayed in the user interface.
    This model is specifically for storing notifications that are shown within the application.
    """
    class Status(models.TextChoices):
        UNREAD = 'UNREAD', _('Unread')
        READ = 'READ', _('Read')
        ARCHIVED = 'ARCHIVED', _('Archived')

    recipient_id = models.IntegerField()
    recipient_type = models.CharField(max_length=20, choices=Notification.RecipientType.choices)
    notification_type = models.CharField(
        max_length=20, 
        choices=Notification.NotificationType.choices,
        default=Notification.NotificationType.SYSTEM
    )
    title = models.CharField(max_length=255, blank=True)
    content = models.TextField()
    status = models.CharField(max_length=10, choices=Status.choices, default=Status.UNREAD)
    reference_id = models.CharField(max_length=100, blank=True, null=True)
    reference_type = models.CharField(max_length=20, blank=True, null=True)
    is_urgent = models.BooleanField(default=False)
    read_at = models.DateTimeField(blank=True, null=True)
    service = models.CharField(max_length=50, blank=True)
    event_type = models.CharField(max_length=50, blank=True)
    metadata = models.JSONField(default=dict, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['recipient_id', 'recipient_type']),
            models.Index(fields=['status']),
            models.Index(fields=['created_at']),
        ]

    def __str__(self):
        return f"Notification for {self.recipient_type} {self.recipient_id}: {self.title}"

    def mark_as_read(self):
        """Mark the notification as read."""
        self.status = self.Status.READ
        self.read_at = timezone.now()
        self.save(update_fields=['status', 'read_at', 'updated_at'])

    def archive(self):
        """Archive the notification."""
        self.status = self.Status.ARCHIVED
        self.save(update_fields=['status', 'updated_at'])
