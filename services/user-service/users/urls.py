from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    UserViewSet, UserDocumentViewSet, AddressViewSet, ContactInfoViewSet,
    PatientProfileViewSet, DoctorProfileViewSet, NurseProfileViewSet,
    PharmacistProfileViewSet, InsuranceProviderProfileViewSet, LabTechnicianProfileViewSet,
    AdminProfileViewSet, InsuranceInformationViewSet, SpecialtyViewSet, DepartmentViewSet,
    DoctorListViewSet
)

# Tạo router cho các ViewSet
router = DefaultRouter()
router.register(r'users', UserViewSet, basename='user')
router.register(r'documents', UserDocumentViewSet, basename='document')
router.register(r'addresses', AddressViewSet, basename='address')
router.register(r'contact-info', ContactInfoViewSet, basename='contact-info')
router.register(r'patient-profile', PatientProfileViewSet, basename='patient-profile')
router.register(r'doctor-profile', DoctorProfileViewSet, basename='doctor-profile')
router.register(r'nurse-profile', NurseProfileViewSet, basename='nurse-profile')
router.register(r'pharmacist-profile', PharmacistProfileViewSet, basename='pharmacist-profile')
router.register(r'insurance-provider-profile', InsuranceProviderProfileViewSet, basename='insurance-provider-profile')
router.register(r'lab-technician-profile', LabTechnicianProfileViewSet, basename='lab-technician-profile')
router.register(r'admin-profile', AdminProfileViewSet, basename='admin-profile')
router.register(r'insurance-information', InsuranceInformationViewSet, basename='insurance-information')
router.register(r'specialties', SpecialtyViewSet, basename='specialties')
router.register(r'departments', DepartmentViewSet, basename='departments')
router.register(r'doctors', DoctorListViewSet, basename='doctors')

urlpatterns = [
    # Bao gồm tất cả các URL từ router
    path('', include(router.urls)),
]
