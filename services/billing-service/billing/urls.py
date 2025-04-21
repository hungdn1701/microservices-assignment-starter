from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    InvoiceViewSet, InvoiceItemViewSet, PaymentViewSet, InsuranceClaimViewSet,
    InvoiceCreationViewSet
)

router = DefaultRouter()
router.register(r'invoices', InvoiceViewSet)
router.register(r'invoice-items', InvoiceItemViewSet)
router.register(r'payments', PaymentViewSet)
router.register(r'insurance-claims', InsuranceClaimViewSet)
router.register(r'invoice-creation', InvoiceCreationViewSet, basename='invoice-creation')

urlpatterns = [
    path('', include(router.urls)),

    # API endpoints for creating invoices from other services - now using ViewSet
    # Old paths are kept for backward compatibility
    path('create-from-appointment/', InvoiceCreationViewSet.as_view({'post': 'from_appointment'}), name='create-from-appointment'),
    path('create-from-lab-test/', InvoiceCreationViewSet.as_view({'post': 'from_lab_test'}), name='create-from-lab-test'),
    path('create-from-prescription/', InvoiceCreationViewSet.as_view({'post': 'from_prescription'}), name='create-from-prescription'),
    path('create-from-medical-record/', InvoiceCreationViewSet.as_view({'post': 'from_medical_record'}), name='create-from-medical-record'),
]
