"""
Health check utilities for Django services.
"""
import logging
from django.conf import settings
from django.http import JsonResponse
from django.views.decorators.http import require_GET
from django.db import connections

logger = logging.getLogger(__name__)

@require_GET
def health_check(request):
    """
    Simple health check endpoint for Django services.

    This endpoint checks database connection and returns service status.

    Returns:
        JsonResponse: Health check result with status UP or DOWN
    """
    # Default to UP status
    status = "UP"

    # Check database connection
    try:
        for conn_name in connections:
            connections[conn_name].cursor()
    except Exception as e:
        logger.error(f"Health check failed: {str(e)}")
        status = "DOWN"

    # Return minimal health data
    return JsonResponse({
        "status": status,
        "service": getattr(settings, 'SERVICE_NAME', 'unknown')
    }, status=200 if status == "UP" else 503)


def register_health_check(urlpatterns):
    """
    Register health check endpoint in URL patterns.

    Args:
        urlpatterns: URL patterns list
    """
    from django.urls import path
    urlpatterns.append(path('health/', health_check, name='health_check'))
    return urlpatterns
