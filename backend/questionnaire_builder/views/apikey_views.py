from django.utils import timezone
from rest_framework import status
from rest_framework.views import APIView
from rest_framework.response import Response
from ..models import Questionnaire, APIKey
from ..serializers import APIKeySerializer, CreateAPIKeySerializer, APIKeyResponseSerializer, APIKeyStatusSerializer, PublicQuestionnaireSerializer
from rest_framework.permissions import IsAuthenticated
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status


# API KEY MANAGEMENT
class APIKeyManagement(APIView):
    """
    Admin-only endpoint for managing API keys.
    """
    permission_classes = [IsAuthenticated]
    serializer_class = APIKeySerializer
    
    def get(self, request):
        """List all API keys"""
        api_keys = APIKey.objects.all().order_by('-created_at')
        serializer = APIKeySerializer(api_keys, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)
    
    def post(self, request):
        """Create a new API key"""
        serializer = CreateAPIKeySerializer(data=request.data)
        if serializer.is_valid():
            api_key = APIKey.objects.create(name=serializer.validated_data['name'])
            response_serializer = APIKeyResponseSerializer(api_key)
            return Response(response_serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    def delete(self, request, key_id):
        """Delete an API key"""
        try:
            api_key = APIKey.objects.get(id=key_id)
            api_key.delete()
            return Response(status=status.HTTP_204_NO_CONTENT)
        except APIKey.DoesNotExist:
            return Response(
                {"error": "API key not found"}, 
                status=status.HTTP_404_NOT_FOUND
            )
    
    def patch(self, request, key_id):
        """Toggle API key active status"""
        try:
            api_key = APIKey.objects.get(id=key_id)
            api_key.is_active = not api_key.is_active
            api_key.save()
            serializer = APIKeyStatusSerializer(api_key)
            return Response(serializer.data, status=status.HTTP_200_OK)
        except APIKey.DoesNotExist:
            return Response(
                {"error": "API key not found"}, 
                status=status.HTTP_404_NOT_FOUND
            )

# PUBLIC API FOR PUBLISHED QUESTIONNAIRES
class GetPublishedQuestionnaire(APIView):
    """
    Public API endpoint to get published questionnaire by title.
    Returns questionnaire title, questions, question types, and answer choices.
    Supports both public access and API key authentication.
    """
    permission_classes = []  # No authentication required for public API
    serializer_class = PublicQuestionnaireSerializer
    
    def get(self, request):
        title = request.GET.get('title', '').strip()
        api_key = request.GET.get('api_key', '').strip()
        
        if not title:
            return Response(
                {"error": "Title parameter is required"}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # If API key is provided, validate it
        try:
            api_key_obj = APIKey.objects.get(key=api_key, is_active=True)
            # Update last used timestamp
            api_key_obj.last_used = timezone.now()
            api_key_obj.save(update_fields=['last_used'])
        except APIKey.DoesNotExist:
            return Response(
                {"error": "Invalid or inactive API key"}, 
                status=status.HTTP_401_UNAUTHORIZED
            )
        
        try:
            # Find published questionnaire by title (case-insensitive)
            questionnaire = Questionnaire.objects.filter(
                title__iexact=title, 
                status='Published'
            ).first()
            
            if not questionnaire:
                return Response(
                    {"error": f"No published questionnaire found with title: {title}"}, 
                    status=status.HTTP_404_NOT_FOUND
                )
            
            # Use serializer to format response
            serializer = PublicQuestionnaireSerializer(questionnaire)
            return Response(serializer.data, status=status.HTTP_200_OK)
            
        except Exception as e:
            return Response(
                {"error": f"An error occurred: {str(e)}"}, 
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
