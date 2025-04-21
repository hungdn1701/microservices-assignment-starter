"""
Service Client for inter-service communication in Healthcare System.
"""
import requests
import logging
import time
import os
from urllib.parse import urljoin

logger = logging.getLogger(__name__)

class ServiceClient:
    """
    Base client for inter-service communication.

    This client provides a standardized way for services to communicate with each other,
    with built-in support for:
    - Authentication token handling
    - Retry mechanism
    - Health checks
    - Pagination
    - Error handling
    """

    def __init__(self, service_name, base_url=None, api_gateway_url=None):
        """
        Initialize the service client.

        Args:
            service_name (str): Name of the service (e.g., 'USER_SERVICE')
            base_url (str, optional): Base URL of the service. If not provided,
                                     will try to get from environment variables.
            api_gateway_url (str, optional): URL of the API Gateway. If not provided,
                                           will try to get from environment variables.
        """
        self.service_name = service_name

        # Get base URL from parameters, environment variables, or default
        if base_url:
            self.base_url = base_url
        else:
            env_var_name = f"{service_name}_URL"
            self.base_url = os.environ.get(env_var_name, f"http://{service_name.lower().replace('_', '-')}:8000")

        # Get API Gateway URL from parameters, environment variables, or default
        if api_gateway_url:
            self.api_gateway_url = api_gateway_url
        else:
            self.api_gateway_url = os.environ.get("API_GATEWAY_URL", "http://api-gateway:4000")

        # Default configuration
        self.max_retries = int(os.environ.get("API_MAX_RETRIES", "3"))
        self.retry_delay = int(os.environ.get("API_RETRY_DELAY", "1"))
        self.timeout = int(os.environ.get("API_TIMEOUT", "5"))
        self.use_api_gateway = os.environ.get("USE_API_GATEWAY", "true").lower() == "true"

        logger.info(f"Initialized {service_name} client with base_url={self.base_url}, "
                   f"api_gateway_url={self.api_gateway_url}, use_api_gateway={self.use_api_gateway}")

    def get_auth_headers(self, token=None):
        """
        Get authentication headers for API requests.

        Args:
            token (str, optional): JWT token for authentication

        Returns:
            dict: Headers dictionary
        """
        headers = {
            'Content-Type': 'application/json',
            'X-Service-Name': self.service_name
        }

        if token:
            # Standardize token format
            if token.startswith('Bearer '):
                headers['Authorization'] = token
            else:
                headers['Authorization'] = f'Bearer {token}'

        return headers

    def make_api_request(self, method, endpoint, data=None, params=None, token=None,
                        use_api_gateway=None, retry=0, paginate=False, page=1, page_size=10):
        """
        Make an API request to another service.

        Args:
            method (str): HTTP method ('get', 'post', 'put', 'patch', 'delete')
            endpoint (str): API endpoint (e.g., '/api/users/')
            data (dict, optional): Data to send in the request body
            params (dict, optional): Query parameters
            token (str, optional): JWT token for authentication
            use_api_gateway (bool, optional): Whether to use the API Gateway
            retry (int, optional): Current retry attempt
            paginate (bool, optional): Whether to use pagination
            page (int, optional): Page number for pagination
            page_size (int, optional): Page size for pagination

        Returns:
            dict or None: Response data or None if the request failed
        """
        # Determine whether to use API Gateway
        if use_api_gateway is None:
            use_api_gateway = self.use_api_gateway

        # Build URL
        if use_api_gateway:
            # Remove leading slash if present
            if endpoint.startswith('/'):
                endpoint = endpoint[1:]
            url = urljoin(self.api_gateway_url, endpoint)
        else:
            # Remove leading slash if present
            if endpoint.startswith('/'):
                endpoint = endpoint[1:]
            url = urljoin(self.base_url, endpoint)

        # Get authentication headers
        headers = self.get_auth_headers(token)

        # Add pagination parameters if needed
        if paginate:
            if params is None:
                params = {}
            params['page'] = page
            params['page_size'] = page_size

        try:
            logger.debug(f"Making {method.upper()} request to {url}")

            # Make the request
            response = getattr(requests, method.lower())(
                url,
                json=data,
                params=params,
                headers=headers,
                timeout=self.timeout
            )

            # Log response status
            logger.debug(f"Response status: {response.status_code}")

            # Handle response
            if response.status_code in [200, 201, 204]:
                if response.status_code == 204 or not response.content:
                    return {}
                return response.json()
            elif response.status_code == 404:
                logger.warning(f"Resource not found: {url}")
                return None
            else:
                logger.error(f"API request failed: {response.status_code} - {response.text}")

                # Retry on server errors
                if response.status_code >= 500 and retry < self.max_retries:
                    logger.warning(f"Retrying {retry+1}/{self.max_retries} after server error")
                    time.sleep(self.retry_delay)
                    return self.make_api_request(
                        method, endpoint, data, params, token,
                        use_api_gateway, retry+1, paginate, page, page_size
                    )

                return None

        except requests.exceptions.RequestException as e:
            logger.error(f"Request exception: {str(e)}")

            # Retry on connection errors
            if retry < self.max_retries:
                logger.warning(f"Retrying {retry+1}/{self.max_retries} after connection error")
                time.sleep(self.retry_delay)
                return self.make_api_request(
                    method, endpoint, data, params, token,
                    use_api_gateway, retry+1, paginate, page, page_size
                )

            return None

    def check_health(self):
        """
        Check the health of the service.

        Returns:
            bool: True if the service is healthy, False otherwise
        """
        try:
            # Simplified health check - direct request to avoid token issues
            service_path = self.service_name.lower().replace('_', '-')
            url = f"{self.api_gateway_url}/api/{service_path}/health"
            response = requests.get(url, timeout=2)
            return response.status_code == 200
        except Exception as e:
            logger.error(f"Health check failed: {str(e)}")
            return False

    # Convenience methods for common HTTP methods

    def get(self, endpoint, params=None, token=None, paginate=False, page=1, page_size=10):
        """
        Make a GET request to the service.

        Args:
            endpoint (str): API endpoint
            params (dict, optional): Query parameters
            token (str, optional): JWT token for authentication
            paginate (bool, optional): Whether to use pagination
            page (int, optional): Page number for pagination
            page_size (int, optional): Page size for pagination

        Returns:
            dict or None: Response data or None if the request failed
        """
        return self.make_api_request(
            'get', endpoint, params=params, token=token,
            paginate=paginate, page=page, page_size=page_size
        )

    def post(self, endpoint, data=None, token=None):
        """
        Make a POST request to the service.

        Args:
            endpoint (str): API endpoint
            data (dict, optional): Data to send in the request body
            token (str, optional): JWT token for authentication

        Returns:
            dict or None: Response data or None if the request failed
        """
        return self.make_api_request('post', endpoint, data=data, token=token)

    def put(self, endpoint, data=None, token=None):
        """
        Make a PUT request to the service.

        Args:
            endpoint (str): API endpoint
            data (dict, optional): Data to send in the request body
            token (str, optional): JWT token for authentication

        Returns:
            dict or None: Response data or None if the request failed
        """
        return self.make_api_request('put', endpoint, data=data, token=token)

    def patch(self, endpoint, data=None, token=None):
        """
        Make a PATCH request to the service.

        Args:
            endpoint (str): API endpoint
            data (dict, optional): Data to send in the request body
            token (str, optional): JWT token for authentication

        Returns:
            dict or None: Response data or None if the request failed
        """
        return self.make_api_request('patch', endpoint, data=data, token=token)

    def delete(self, endpoint, token=None):
        """
        Make a DELETE request to the service.

        Args:
            endpoint (str): API endpoint
            token (str, optional): JWT token for authentication

        Returns:
            dict or None: Response data or None if the request failed
        """
        return self.make_api_request('delete', endpoint, token=token)
