from rest_framework import serializers

from .models import User, AdminInvite


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = [  # noqa: RUF012
            "id",
            "email",
            "is_active",
            "is_staff",
            "is_superuser",
            "created",
            "modified",
            "last_login",
        ]

class LoginSerializer(serializers.Serializer):
    email = serializers.EmailField()
    password = serializers.CharField(write_only=True)

class LogoutSerializer(serializers.Serializer):
    detail = serializers.CharField(read_only=True)

class AdminInviteSerializer(serializers.ModelSerializer):
    invited_by_email = serializers.CharField(source='invited_by.email', read_only=True)
    used_by_email = serializers.CharField(source='used_by.email', read_only=True)
    
    class Meta:
        model = AdminInvite
        fields = [
            "id",
            "email",
            "token",
            "is_active",
            "invited_by",
            "invited_by_email",
            "used_at",
            "used_by",
            "used_by_email",
            "created",
            "modified",
        ]
        read_only_fields = ["token", "invited_by", "used_at", "used_by"]

class CreateInviteSerializer(serializers.Serializer):
    email = serializers.EmailField()

class VerifyTokenSerializer(serializers.Serializer):
    token = serializers.UUIDField()

class RegisterSerializer(serializers.Serializer):
    token = serializers.UUIDField()
    password = serializers.CharField(min_length=8, write_only=True)
    password_confirm = serializers.CharField(write_only=True)
    
    def validate(self, data):
        if data['password'] != data['password_confirm']:
            raise serializers.ValidationError("Passwords don't match")
        return data
