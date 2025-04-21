"""
URL patterns for authentication and session management.
"""
from django.urls import path
from .views import TokenRefreshView, LogoutView, SessionView, AdminSessionView

urlpatterns = [
    path('token/refresh/', TokenRefreshView.as_view(), name='token-refresh'),
    path('logout/', LogoutView.as_view(), name='logout'),
    path('sessions/', SessionView.as_view(), name='sessions'),
    path('admin/sessions/', AdminSessionView.as_view(), name='admin-sessions'),
]
