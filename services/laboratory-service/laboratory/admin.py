from django.contrib import admin
from .models import TestType, LabTest, TestResult, SampleCollection, Notification


@admin.register(TestType)
class TestTypeAdmin(admin.ModelAdmin):
    list_display = ('name', 'unit', 'price', 'created_at')
    search_fields = ('name', 'description')
    list_filter = ('unit',)


@admin.register(LabTest)
class LabTestAdmin(admin.ModelAdmin):
    list_display = ('id', 'patient_id', 'doctor_id', 'test_type', 'status', 'ordered_date', 'scheduled_date')
    list_filter = ('status', 'test_type')
    search_fields = ('patient_id', 'doctor_id')
    date_hierarchy = 'ordered_date'


@admin.register(TestResult)
class TestResultAdmin(admin.ModelAdmin):
    list_display = ('id', 'lab_test', 'technician_id', 'is_abnormal', 'created_at')
    list_filter = ('is_abnormal',)
    search_fields = ('lab_test__patient_id', 'technician_id')


@admin.register(SampleCollection)
class SampleCollectionAdmin(admin.ModelAdmin):
    list_display = ('id', 'lab_test', 'collector_id', 'sample_type', 'collection_date', 'sample_id')
    list_filter = ('sample_type',)
    search_fields = ('sample_id', 'lab_test__patient_id')


@admin.register(Notification)
class NotificationAdmin(admin.ModelAdmin):
    list_display = ('id', 'recipient_id', 'recipient_type', 'notification_type', 'is_read', 'created_at')
    list_filter = ('recipient_type', 'notification_type', 'is_read')
    search_fields = ('recipient_id', 'message')
    date_hierarchy = 'created_at'