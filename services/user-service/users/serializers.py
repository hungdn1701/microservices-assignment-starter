from rest_framework import serializers
from authentication.models import User
from authentication.serializers import UserAuthSerializer
from .models import (
    Address, ContactInfo, UserDocument, PatientProfile, DoctorProfile, NurseProfile,
    PharmacistProfile, InsuranceInformation, InsuranceProviderProfile, LabTechnicianProfile,
    AdminProfile
)

class AddressSerializer(serializers.ModelSerializer):
    class Meta:
        model = Address
        fields = '__all__'
        read_only_fields = ('id', 'created_at', 'updated_at')
        extra_kwargs = {
            'user': {'required': False}
        }

class ContactInfoSerializer(serializers.ModelSerializer):
    class Meta:
        model = ContactInfo
        fields = '__all__'
        read_only_fields = ('id', 'created_at', 'updated_at')

class UserDocumentSerializer(serializers.ModelSerializer):
    class Meta:
        model = UserDocument
        fields = '__all__'
        read_only_fields = ('id', 'is_verified', 'verification_date', 'verification_notes', 'created_at', 'updated_at')

class PatientProfileSerializer(serializers.ModelSerializer):
    age = serializers.SerializerMethodField()
    bmi = serializers.SerializerMethodField()

    class Meta:
        model = PatientProfile
        fields = '__all__'
        read_only_fields = ('id', 'created_at', 'updated_at')

    def get_age(self, obj):
        return obj.get_age()

    def get_bmi(self, obj):
        return obj.get_bmi()

class DoctorProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = DoctorProfile
        fields = '__all__'
        read_only_fields = ('id', 'average_rating', 'rating_count', 'created_at', 'updated_at')

class NurseProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = NurseProfile
        fields = '__all__'
        read_only_fields = ('id', 'created_at', 'updated_at')

class PharmacistProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = PharmacistProfile
        fields = '__all__'
        read_only_fields = ('id', 'created_at', 'updated_at')

class InsuranceInformationSerializer(serializers.ModelSerializer):
    class Meta:
        model = InsuranceInformation
        fields = '__all__'
        read_only_fields = ('id', 'created_at', 'updated_at')

class InsuranceProviderProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = InsuranceProviderProfile
        fields = '__all__'
        read_only_fields = ('id', 'created_at', 'updated_at')

class LabTechnicianProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = LabTechnicianProfile
        fields = '__all__'
        read_only_fields = ('id', 'created_at', 'updated_at')

class AdminProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = AdminProfile
        fields = '__all__'
        read_only_fields = ('id', 'created_at', 'updated_at')



class UserDetailSerializer(serializers.ModelSerializer):
    """Serializer chi tiết cho người dùng, bao gồm tất cả các thông tin liên quan"""
    addresses = AddressSerializer(many=True, read_only=True)
    contact_info = ContactInfoSerializer(read_only=True)
    documents = UserDocumentSerializer(many=True, read_only=True)

    # Các hồ sơ theo vai trò
    patient_profile = PatientProfileSerializer(read_only=True)
    doctor_profile = DoctorProfileSerializer(read_only=True)
    nurse_profile = NurseProfileSerializer(read_only=True)
    pharmacist_profile = PharmacistProfileSerializer(read_only=True)
    insurance_provider_profile = InsuranceProviderProfileSerializer(read_only=True)
    lab_technician_profile = LabTechnicianProfileSerializer(read_only=True)
    admin_profile = AdminProfileSerializer(read_only=True)

    class Meta:
        model = User
        fields = (
            'id', 'email', 'first_name', 'last_name', 'role', 'date_joined', 'is_active',
            'addresses', 'contact_info', 'documents',
            'patient_profile', 'doctor_profile', 'nurse_profile', 'pharmacist_profile',
            'insurance_provider_profile', 'lab_technician_profile', 'admin_profile'
        )
        read_only_fields = ('id', 'date_joined')

    def to_representation(self, instance):
        """Chỉ bao gồm profile phù hợp với vai trò của người dùng"""
        ret = super().to_representation(instance)

        # Bản đồ vai trò với profile tương ứng
        role_profile_mapping = {
            'PATIENT': 'patient_profile',
            'DOCTOR': 'doctor_profile',
            'NURSE': 'nurse_profile',
            'PHARMACIST': 'pharmacist_profile',
            'LAB_TECH': 'lab_technician_profile',
            'INSURANCE': 'insurance_provider_profile',
            'ADMIN': 'admin_profile'
        }

        # Lấy profile tương ứng với vai trò
        role_profile = role_profile_mapping.get(instance.role)

        # Loại bỏ tất cả các profile không phù hợp với vai trò
        for profile in role_profile_mapping.values():
            if profile != role_profile:
                ret.pop(profile, None)

        return ret

class UserBasicSerializer(serializers.ModelSerializer):
    """Serializer cơ bản cho người dùng, chỉ bao gồm thông tin cơ bản"""
    class Meta:
        model = User
        fields = ('id', 'email', 'first_name', 'last_name', 'role', 'date_joined', 'is_active')
        read_only_fields = ('id', 'date_joined')
