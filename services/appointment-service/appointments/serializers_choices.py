from rest_framework import serializers
from .models import Appointment


class AppointmentTypeSerializer(serializers.Serializer):
    id = serializers.CharField()
    name = serializers.CharField()
    code = serializers.CharField()

    def to_representation(self, instance):
        return {
            'id': instance[0],
            'name': instance[1],
            'code': instance[0]
        }


class PrioritySerializer(serializers.Serializer):
    id = serializers.CharField()
    name = serializers.CharField()
    code = serializers.CharField()
    description = serializers.CharField(required=False)

    def to_representation(self, instance):
        return {
            'id': str(instance[0]),
            'name': instance[1],
            'code': str(instance[0]),
            'description': self.get_description(instance[0])
        }
    
    def get_description(self, priority_id):
        descriptions = {
            0: "Khám thông thường, không cần ưu tiên đặc biệt",
            1: "Ưu tiên khám trước cho các trường hợp đặc biệt",
            2: "Khẩn cấp, cần khám ngay lập tức"
        }
        return descriptions.get(priority_id, "")
