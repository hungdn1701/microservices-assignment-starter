"""
URL configuration for notification app.
"""
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    NotificationViewSet, NotificationTemplateViewSet,
    NotificationScheduleViewSet, InAppNotificationViewSet,
    EventViewSet
)

router = DefaultRouter()
router.register(r'notifications', NotificationViewSet, basename='notification')
router.register(r'templates', NotificationTemplateViewSet)
router.register(r'schedules', NotificationScheduleViewSet)
router.register(r'in-app', InAppNotificationViewSet, basename='in-app-notification')
router.register(r'events', EventViewSet, basename='events')

urlpatterns = [
    path('', include(router.urls)),
    # Giữ lại đường dẫn cũ cho khả năng tương thích ngược
    path('events', EventViewSet.as_view({'post': 'process'}), name='process-event'),
]
