from rest_framework import serializers
from .models import (
    MedicalRecord, Encounter, Diagnosis, Treatment, Allergy,
    Immunization, MedicalHistory, Medication,
    VitalSign, LabTest, LabResult
)


class TreatmentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Treatment
        fields = '__all__'
        read_only_fields = ('id', 'created_at', 'updated_at')


class DiagnosisSerializer(serializers.ModelSerializer):
    treatments = TreatmentSerializer(many=True, read_only=True)
    doctor_id = serializers.IntegerField(required=False)  # Not mandatory in requests

    class Meta:
        model = Diagnosis
        fields = '__all__'
        read_only_fields = ('id', 'created_at', 'updated_at')


class AllergySerializer(serializers.ModelSerializer):
    class Meta:
        model = Allergy
        fields = '__all__'
        read_only_fields = ('id', 'created_at', 'updated_at')


class ImmunizationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Immunization
        fields = '__all__'
        read_only_fields = ('id', 'created_at', 'updated_at')


class MedicalHistorySerializer(serializers.ModelSerializer):
    class Meta:
        model = MedicalHistory
        fields = '__all__'
        read_only_fields = ('id', 'created_at', 'updated_at')


class MedicationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Medication
        fields = '__all__'
        read_only_fields = ('id', 'created_at', 'updated_at')


class VitalSignSerializer(serializers.ModelSerializer):
    class Meta:
        model = VitalSign
        fields = '__all__'
        read_only_fields = ('id', 'created_at', 'updated_at')


class LabResultSerializer(serializers.ModelSerializer):
    performed_by = serializers.IntegerField(required=False)  # Not mandatory in requests
    performed_at = serializers.DateTimeField(required=False)  # Not mandatory in requests

    class Meta:
        model = LabResult
        fields = '__all__'
        read_only_fields = ('id', 'created_at', 'updated_at')


class LabTestSerializer(serializers.ModelSerializer):
    results = LabResultSerializer(many=True, read_only=True)
    ordered_by = serializers.IntegerField(required=False)  # Not mandatory in requests
    ordered_at = serializers.DateTimeField(required=False)  # Not mandatory in requests

    class Meta:
        model = LabTest
        fields = '__all__'
        read_only_fields = ('id', 'created_at', 'updated_at')


class EncounterSerializer(serializers.ModelSerializer):
    diagnoses = DiagnosisSerializer(many=True, read_only=True)
    immunizations = ImmunizationSerializer(many=True, read_only=True)
    medications = MedicationSerializer(many=True, read_only=True)
    vital_signs = VitalSignSerializer(many=True, read_only=True)
    lab_tests = LabTestSerializer(many=True, read_only=True)

    class Meta:
        model = Encounter
        fields = '__all__'
        read_only_fields = ('id', 'created_at', 'updated_at')


class MedicalRecordSerializer(serializers.ModelSerializer):
    encounters = EncounterSerializer(many=True, read_only=True)
    allergies = AllergySerializer(many=True, read_only=True)
    medical_histories = MedicalHistorySerializer(many=True, read_only=True)

    class Meta:
        model = MedicalRecord
        fields = '__all__'
        read_only_fields = ('id', 'created_at', 'updated_at')


class MedicalRecordSummarySerializer(serializers.ModelSerializer):
    diagnosis_count = serializers.SerializerMethodField()
    allergy_count = serializers.SerializerMethodField()
    medication_count = serializers.SerializerMethodField()

    class Meta:
        model = MedicalRecord
        fields = (
            'id', 'patient_id', 'created_at', 'updated_at',
            'diagnosis_count', 'allergy_count', 'medication_count'
        )

    def get_diagnosis_count(self, obj):
        count = 0
        for encounter in obj.encounters.all():
            count += encounter.diagnoses.count()
        return count

    def get_allergy_count(self, obj):
        return obj.allergies.count()

    def get_medication_count(self, obj):
        count = 0
        for encounter in obj.encounters.all():
            count += encounter.medications.count()
        return count
