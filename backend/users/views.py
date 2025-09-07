from django.contrib.auth import authenticate, login, logout
from django.utils import timezone
from django.db import transaction

from rest_framework import status, viewsets
from rest_framework.generics import GenericAPIView
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework.decorators import api_view

from .models import User, AdminInvite
from .serializers import (
    LoginSerializer, UserSerializer, LogoutSerializer, 
    AdminInviteSerializer, CreateInviteSerializer, 
    VerifyTokenSerializer, RegisterSerializer
)


class UserViewSet(viewsets.ModelViewSet):
    queryset = User.objects.all()
    serializer_class = UserSerializer

class LoginView(GenericAPIView):
    permission_classes = [AllowAny]
    serializer_class = LoginSerializer
    def post(self, request):
        serializer = LoginSerializer(data=request.data)
        if serializer.is_valid():
            user = authenticate(
                request,
                username=serializer.validated_data['email'],
                password=serializer.validated_data['password']
            )
            if user:
                login(request, user)
                return Response({"detail": "Login success!"})
            else:
                return Response({"detail": "Invalid credentials"}, status=status.HTTP_401_UNAUTHORIZED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class LogoutRequestView(GenericAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = LogoutSerializer

    def post(self, request, *args, **kwargs):
        logout(request)
        return Response({"detail": "Logout success!"})

class AdminInviteViewSet(viewsets.ModelViewSet):
    queryset = AdminInvite.objects.all()
    serializer_class = AdminInviteSerializer
    permission_classes = [IsAuthenticated]

    def perform_create(self, serializer):
        serializer.save(invited_by=self.request.user)

class CreateInviteView(GenericAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = CreateInviteSerializer

    def post(self, request):
        serializer = CreateInviteSerializer(data=request.data)
        if serializer.is_valid():
            email = serializer.validated_data['email']
            
            # Check if user already exists
            if User.objects.filter(email=email).exists():
                return Response(
                    {"detail": "User with this email already exists"}, 
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            # Check if invite already exists and is active
            if AdminInvite.objects.filter(email=email, is_active=True).exists():
                return Response(
                    {"detail": "Active invite already exists for this email"}, 
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            # Create new invite
            invite = AdminInvite.objects.create(
                email=email,
                invited_by=request.user
            )
            
            return Response({
                "detail": "Invite created successfully",
                "invite": AdminInviteSerializer(invite).data
            })
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class VerifyTokenView(GenericAPIView):
    permission_classes = [AllowAny]
    serializer_class = VerifyTokenSerializer

    def post(self, request):
        serializer = VerifyTokenSerializer(data=request.data)
        if serializer.is_valid():
            token = serializer.validated_data['token']
            try:
                invite = AdminInvite.objects.get(token=token, is_active=True)
                return Response({
                    "valid": True,
                    "email": invite.email
                })
            except AdminInvite.DoesNotExist:
                return Response({
                    "valid": False,
                    "detail": "Invalid or expired token"
                })
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class RegisterView(GenericAPIView):
    permission_classes = [AllowAny]
    serializer_class = RegisterSerializer

    def post(self, request):
        serializer = RegisterSerializer(data=request.data)
        if serializer.is_valid():
            token = serializer.validated_data['token']
            password = serializer.validated_data['password']
            
            try:
                with transaction.atomic():
                    invite = AdminInvite.objects.select_for_update().get(
                        token=token, 
                        is_active=True
                    )
                    
                    # Create user
                    user = User.objects.create_user(
                        email=invite.email,
                        password=password,
                        is_staff=True
                    )
                    
                    # Mark invite as used
                    invite.is_active = False
                    invite.used_at = timezone.now()
                    invite.used_by = user
                    invite.save()
                    
                    return Response({
                        "detail": "Registration successful! You can now login."
                    })
                    
            except AdminInvite.DoesNotExist:
                return Response(
                    {"detail": "Invalid or expired token"}, 
                    status=status.HTTP_400_BAD_REQUEST
                )
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class CurrentUserView(GenericAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = UserSerializer
    
    def get(self, request):
        """Get current logged in user information"""
        serializer = UserSerializer(request.user)
        return Response(serializer.data)


class AdminManagementView(GenericAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = UserSerializer
    
    def get(self, request):
        """Get all admin users (staff users)"""
        admin_users = User.objects.filter(is_staff=True).order_by('-created')
        serializer = UserSerializer(admin_users, many=True)
        return Response(serializer.data)
    
    def patch(self, request):
        """Disable/Enable an admin user (superusers cannot be disabled)"""
        user_id = request.data.get('user_id')
        is_active = request.data.get('is_active')
        
        if not user_id:
            return Response(
                {"detail": "user_id is required"}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            user = User.objects.get(id=user_id, is_staff=True)
            
            # Prevent disabling yourself
            if user == request.user:
                return Response(
                    {"detail": "You cannot disable your own account"}, 
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            # Prevent disabling superusers
            if user.is_superuser and not is_active:
                return Response(
                    {"detail": "Super admin users cannot be disabled"}, 
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            user.is_active = is_active
            user.save()
            
            action = "enabled" if is_active else "disabled"
            return Response({
                "detail": f"Admin user {action} successfully",
                "user": UserSerializer(user).data
            })
            
        except User.DoesNotExist:
            return Response(
                {"detail": "Admin user not found"}, 
                status=status.HTTP_404_NOT_FOUND
            )