from django.contrib import admin
from .models import Address, ContactInfo, UserDocument, PatientProfile, DoctorProfile, NurseProfile, PharmacistProfile, InsuranceInformation, InsuranceProviderProfile, LabTechnicianProfile, AdminProfile

@admin.register(Address)
class AddressAdmin(admin.ModelAdmin):
    list_display = ('user', 'street', 'city', 'state', 'postal_code', 'country', 'is_primary')
    search_fields = ('user__email', 'street', 'city', 'state', 'postal_code', 'country')
    list_filter = ('is_primary', 'country', 'state', 'city')

@admin.register(ContactInfo)
class ContactInfoAdmin(admin.ModelAdmin):
    list_display = ('user', 'phone_number', 'emergency_contact_name', 'emergency_contact_phone')
    search_fields = ('user__email', 'phone_number', 'emergency_contact_name', 'emergency_contact_phone')

@admin.register(PatientProfile)
class PatientProfileAdmin(admin.ModelAdmin):
    list_display = ('user', 'date_of_birth', 'gender', 'blood_type')
    search_fields = ('user__email', 'blood_type', 'allergies', 'medical_conditions')
    list_filter = ('gender', 'blood_type')

@admin.register(DoctorProfile)
class DoctorProfileAdmin(admin.ModelAdmin):
    list_display = ('user', 'specialization', 'license_number', 'years_of_experience')
    search_fields = ('user__email', 'specialization', 'license_number', 'education')
    list_filter = ('specialization', 'years_of_experience')

@admin.register(NurseProfile)
class NurseProfileAdmin(admin.ModelAdmin):
    list_display = ('user', 'license_number', 'department')
    search_fields = ('user__email', 'license_number', 'department')
    list_filter = ('department',)

@admin.register(UserDocument)
class UserDocumentAdmin(admin.ModelAdmin):
    list_display = ('user', 'document_type', 'document_number', 'is_verified')
    search_fields = ('user__email', 'document_type', 'document_number')
    list_filter = ('document_type', 'is_verified')

@admin.register(PharmacistProfile)
class PharmacistProfileAdmin(admin.ModelAdmin):
    list_display = ('user', 'license_number', 'specialization', 'pharmacy_name')
    search_fields = ('user__email', 'license_number', 'pharmacy_name')
    list_filter = ('specialization',)

@admin.register(InsuranceInformation)
class InsuranceInformationAdmin(admin.ModelAdmin):
    list_display = ('provider', 'policy_number', 'subscriber_name', 'is_active')
    search_fields = ('policy_number', 'subscriber_name')
    list_filter = ('insurance_type', 'is_active')

@admin.register(InsuranceProviderProfile)
class InsuranceProviderProfileAdmin(admin.ModelAdmin):
    list_display = ('user', 'company_name', 'provider_id', 'contact_person')
    search_fields = ('user__email', 'company_name', 'provider_id', 'contact_person')

@admin.register(LabTechnicianProfile)
class LabTechnicianProfileAdmin(admin.ModelAdmin):
    list_display = ('user', 'license_number', 'specialization', 'laboratory_name')
    search_fields = ('user__email', 'license_number', 'laboratory_name')
    list_filter = ('specialization',)

@admin.register(AdminProfile)
class AdminProfileAdmin(admin.ModelAdmin):
    list_display = ('user', 'admin_type', 'employee_id', 'position', 'access_level')
    search_fields = ('user__email', 'employee_id', 'position')
    list_filter = ('admin_type', 'access_level')
