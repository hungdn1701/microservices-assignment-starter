from django.urls import path, include
from rest_framework.routers import DefaultRouter
from common_auth import register_health_check
from .views import (
    TestTypeViewSet, LabTestViewSet, TestResultViewSet,
    SampleCollectionViewSet, NotificationViewSet
)

router = DefaultRouter()
router.register(r'test-types', TestTypeViewSet)
router.register(r'lab-tests', LabTestViewSet)
router.register(r'test-results', TestResultViewSet)
router.register(r'sample-collections', SampleCollectionViewSet)
router.register(r'notifications', NotificationViewSet)

urlpatterns = [
    path('', include(router.urls)),
]

# Register health check endpoint
urlpatterns = register_health_check(urlpatterns)