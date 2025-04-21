from django.contrib import admin
from .models import (
    MedicalRecord, Diagnosis, Treatment, Allergy, 
    Immunization, MedicalHistory, Medication, 
    VitalSign, LabTest, LabResult
)

@admin.register(MedicalRecord)
class MedicalRecordAdmin(admin.ModelAdmin):
    list_display = ('id', 'patient_id', 'created_at', 'updated_at')
    search_fields = ('patient_id',)
    list_filter = ('created_at',)

@admin.register(Diagnosis)
class DiagnosisAdmin(admin.ModelAdmin):
    list_display = ('id', 'get_medical_record', 'doctor_id', 'diagnosis_code', 'diagnosis_date')
    search_fields = ('diagnosis_code', 'diagnosis_description')
    list_filter = ('diagnosis_date',)

    def get_medical_record(self, obj):
        return obj.encounter.medical_record
    get_medical_record.short_description = 'Medical Record'

@admin.register(Treatment)
class TreatmentAdmin(admin.ModelAdmin):
    list_display = ('id', 'diagnosis', 'treatment_type', 'start_date', 'end_date')
    search_fields = ('treatment_type', 'treatment_description')
    list_filter = ('start_date', 'end_date')

@admin.register(Allergy)
class AllergyAdmin(admin.ModelAdmin):
    list_display = ('id', 'medical_record', 'allergy_type', 'allergy_name', 'severity')
    search_fields = ('allergy_type', 'allergy_name')
    list_filter = ('severity',)

@admin.register(Immunization)
class ImmunizationAdmin(admin.ModelAdmin):
    list_display = ('id', 'get_medical_record', 'vaccine_name', 'administration_date', 'dose')
    search_fields = ('vaccine_name',)
    list_filter = ('administration_date',)

    def get_medical_record(self, obj):
        return obj.encounter.medical_record
    get_medical_record.short_description = 'Medical Record'

@admin.register(MedicalHistory)
class MedicalHistoryAdmin(admin.ModelAdmin):
    list_display = ('id', 'medical_record', 'condition_name', 'diagnosis_date', 'is_chronic')
    search_fields = ('condition_name',)
    list_filter = ('diagnosis_date', 'is_chronic')

@admin.register(Medication)
class MedicationAdmin(admin.ModelAdmin):
    list_display = ('id', 'get_medical_record', 'medication_name', 'dosage', 'start_date', 'end_date')
    search_fields = ('medication_name',)
    list_filter = ('start_date', 'end_date')

    def get_medical_record(self, obj):
        return obj.encounter.medical_record
    get_medical_record.short_description = 'Medical Record'

@admin.register(VitalSign)
class VitalSignAdmin(admin.ModelAdmin):
    list_display = ('id', 'get_medical_record', 'vital_type', 'value', 'unit', 'recorded_at')
    search_fields = ('vital_type',)
    list_filter = ('recorded_at',)

    def get_medical_record(self, obj):
        return obj.encounter.medical_record
    get_medical_record.short_description = 'Medical Record'

@admin.register(LabTest)
class LabTestAdmin(admin.ModelAdmin):
    list_display = ('id', 'get_medical_record', 'test_name', 'ordered_by', 'ordered_at')
    search_fields = ('test_name',)
    list_filter = ('ordered_at',)

    def get_medical_record(self, obj):
        return obj.encounter.medical_record
    get_medical_record.short_description = 'Medical Record'

@admin.register(LabResult)
class LabResultAdmin(admin.ModelAdmin):
    list_display = ('id', 'lab_test', 'result_value', 'is_abnormal', 'performed_at')
    search_fields = ('result_value',)
    list_filter = ('performed_at', 'is_abnormal')
