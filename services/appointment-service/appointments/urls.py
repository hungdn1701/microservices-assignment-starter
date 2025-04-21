from django.urls import path, include
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    DoctorAvailabilityViewSet,
    TimeSlotViewSet,
    AppointmentViewSet,
    PatientVisitViewSet,
    appointment_reasons_list
)

# Router chính cho tất cả các endpoint
router = DefaultRouter()
router.register(r'appointments', AppointmentViewSet)
router.register(r'doctor-availabilities', DoctorAvailabilityViewSet)
router.register(r'time-slots', TimeSlotViewSet)
router.register(r'patient-visits', PatientVisitViewSet)
# Removed AppointmentReasonViewSet; using function endpoint instead

# Cấu trúc URL đơn giản và thống nhất
urlpatterns = [
    path('', include(router.urls)),
    path('appointment-reasons/', appointment_reasons_list, name='appointment-reasons-list'),
]
