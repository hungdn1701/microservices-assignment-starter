from django.urls import path, include
from rest_framework.routers import DefaultRouter
from common_auth import register_health_check
from .views import (
    MedicationViewSet, PrescriptionViewSet, PrescriptionItemViewSet,
    InventoryViewSet, DispensingViewSet, DispensingItemViewSet
)

router = DefaultRouter()
router.register(r'medications', MedicationViewSet)
router.register(r'prescriptions', PrescriptionViewSet)
router.register(r'prescription-items', PrescriptionItemViewSet)
router.register(r'inventory', InventoryViewSet)
router.register(r'dispensings', DispensingViewSet)
router.register(r'dispensing-items', DispensingItemViewSet)

urlpatterns = [
    path('', include(router.urls)),
    path('pharmacy/', include(router.urls)),  # Thêm prefix 'pharmacy/' để phù hợp với API Gateway
]

# Register health check endpoint
urlpatterns = register_health_check(urlpatterns)
