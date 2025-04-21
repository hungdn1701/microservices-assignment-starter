from rest_framework import status, viewsets, permissions
from rest_framework.response import Response
from rest_framework.decorators import action
from rest_framework_simplejwt.tokens import RefreshToken
from common_auth.permissions import AllowAny, IsAuthenticated
from .jwt_customization import CustomTokenObtainPairSerializer
from .models import User
from .serializers import (
    UserAuthSerializer,
    UserRegistrationSerializer,
    UserLoginSerializer
)

class AuthViewSet(viewsets.GenericViewSet):
    queryset = User.objects.all()
    permission_classes = [AllowAny]

    def get_serializer_class(self):
        if self.action == 'register':
            return UserRegistrationSerializer
        if self.action == 'login':
            return UserLoginSerializer
        return UserAuthSerializer

    @action(detail=False, methods=['post'])
    def register(self, request):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()

        # Sử dụng CustomTokenObtainPairSerializer để tạo token với thông tin người dùng
        token = CustomTokenObtainPairSerializer.get_token(user)

        return Response({
            'user': UserAuthSerializer(user).data,
            'refresh': str(token),
            'access': str(token.access_token),
        }, status=status.HTTP_201_CREATED)

    @action(detail=False, methods=['post'])
    def login(self, request):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.validated_data['user']

        # Sử dụng CustomTokenObtainPairSerializer để tạo token với thông tin người dùng
        token = CustomTokenObtainPairSerializer.get_token(user)

        return Response({
            'user': UserAuthSerializer(user).data,
            'refresh': str(token),
            'access': str(token.access_token),
        })

    @action(detail=False, methods=['post'], permission_classes=[IsAuthenticated])
    def logout(self, request):
        try:
            refresh_token = request.data.get('refresh')
            token = RefreshToken(refresh_token)
            token.blacklist()
            return Response(status=status.HTTP_205_RESET_CONTENT)
        except Exception:
            return Response(status=status.HTTP_400_BAD_REQUEST)
