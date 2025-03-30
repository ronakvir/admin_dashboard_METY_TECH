from django.shortcuts import render
from rest_framework import generics
from .models import Questionnaire
from .serializers import QuestionnaireSerializer
from rest_framework.permissions import IsAuthenticated


# Create your views here.
class QuestionnaireCreateAPIView(generics.CreateAPIView):
    queryset = Questionnaire.objects.all()
    serializer_class = QuestionnaireSerializer
    permission_classes = [IsAuthenticated]
