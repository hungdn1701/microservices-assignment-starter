from rest_framework import serializers
from .models import TestType, LabTest, TestResult, SampleCollection, Notification


class TestTypeSerializer(serializers.ModelSerializer):
    class Meta:
        model = TestType
        fields = '__all__'


class SampleCollectionSerializer(serializers.ModelSerializer):
    class Meta:
        model = SampleCollection
        fields = '__all__'


class TestResultSerializer(serializers.ModelSerializer):
    class Meta:
        model = TestResult
        fields = '__all__'


class TestResultCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = TestResult
        fields = ['lab_test', 'technician_id', 'result_value', 'is_abnormal', 'comments', 'attachment']

    def create(self, validated_data):
        # Update the lab test status to COMPLETED when result is created
        lab_test = validated_data.get('lab_test')
        lab_test.status = LabTest.Status.COMPLETED
        lab_test.save()
        return super().create(validated_data)


class SampleCollectionCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = SampleCollection
        fields = ['lab_test', 'collector_id', 'sample_type', 'sample_id', 'notes']

    def create(self, validated_data):
        # Update the lab test status to SAMPLE_COLLECTED when sample is collected
        lab_test = validated_data.get('lab_test')
        lab_test.status = LabTest.Status.SAMPLE_COLLECTED
        lab_test.save()
        return super().create(validated_data)


class LabTestSerializer(serializers.ModelSerializer):
    test_type_details = TestTypeSerializer(source='test_type', read_only=True)
    sample_details = SampleCollectionSerializer(source='sample', read_only=True)
    result_details = TestResultSerializer(source='result', read_only=True)
    status_display = serializers.CharField(source='get_status_display', read_only=True)

    class Meta:
        model = LabTest
        fields = '__all__'


class LabTestCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = LabTest
        fields = ['id', 'patient_id', 'doctor_id', 'test_type', 'scheduled_date', 'notes']


class NotificationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Notification
        fields = '__all__'