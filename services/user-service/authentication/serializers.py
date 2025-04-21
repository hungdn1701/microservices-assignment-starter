from rest_framework import serializers
from .models import User

class UserAuthSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ('id', 'email', 'first_name', 'last_name', 'role', 'date_joined')
        read_only_fields = ('id', 'date_joined')

class UserRegistrationSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, required=True, style={'input_type': 'password'})
    password_confirm = serializers.CharField(write_only=True, required=True, style={'input_type': 'password'})
    role = serializers.CharField(default='PATIENT', read_only=True)  # Chỉ cho phép vai trò PATIENT

    class Meta:
        model = User
        fields = ('email', 'password', 'password_confirm', 'first_name', 'last_name', 'role')

    def validate(self, attrs):
        if attrs['password'] != attrs['password_confirm']:
            raise serializers.ValidationError({"password": "Password fields didn't match."})

        # Luôn đặt vai trò là PATIENT cho người dùng tự đăng ký
        attrs['role'] = 'PATIENT'

        return attrs

    def create(self, validated_data):
        validated_data.pop('password_confirm')
        # Tạo người dùng với vai trò PATIENT
        user = User.objects.create_user(**validated_data)

        # Tự động tạo hồ sơ bệnh nhân cơ bản
        # Các trường date_of_birth và gender có thể để trống và cập nhật sau
        from users.models import PatientProfile
        PatientProfile.objects.create(user=user)

        return user

class UserLoginSerializer(serializers.Serializer):
    email = serializers.EmailField(required=True)
    password = serializers.CharField(required=True, write_only=True)

    def validate(self, attrs):
        email = attrs.get('email')
        password = attrs.get('password')

        if email and password:
            # Tìm kiếm user trực tiếp bằng email thay vì sử dụng authenticate
            try:
                user = User.objects.get(email=email)
                if user.check_password(password):
                    if not user.is_active:
                        raise serializers.ValidationError('User account is disabled.')
                    attrs['user'] = user
                    return attrs
                else:
                    raise serializers.ValidationError('Unable to log in with provided credentials.')
            except User.DoesNotExist:
                raise serializers.ValidationError('Unable to log in with provided credentials.')
        else:
            raise serializers.ValidationError('Must include "email" and "password".')


