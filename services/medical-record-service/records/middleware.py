from django.conf import settings
from django.http import JsonResponse
import logging

logger = logging.getLogger(__name__)

class ServiceAPIKeyMiddleware:
    """
    Middleware để xác thực API key cho service-to-service communication.
    """
    
    def __init__(self, get_response):
        self.get_response = get_response
        
    def __call__(self, request):
        # Kiểm tra xem có header X-Service-API-Key không
        api_key = request.META.get('HTTP_X_SERVICE_API_KEY')
        service_name = request.META.get('HTTP_X_SERVICE_NAME')
        
        # Nếu có API key và service name, kiểm tra xem có hợp lệ không
        if api_key and service_name:
            valid_api_key = settings.SERVICE_API_KEYS.get(service_name)
            
            if valid_api_key and api_key == valid_api_key:
                # API key hợp lệ, đánh dấu request là từ service
                request.is_service_request = True
                request.service_name = service_name
                logger.info(f"Authenticated service request from {service_name}")
            else:
                # API key không hợp lệ
                logger.warning(f"Invalid API key for service {service_name}")
                return JsonResponse({"detail": "Invalid API key"}, status=403)
        else:
            # Không có API key, đây là request thông thường
            request.is_service_request = False
            
        response = self.get_response(request)
        return response
