from urllib import response
from django.shortcuts import render
from rest_framework import generics, status, viewsets
from rest_framework.views import APIView
from rest_framework.response import Response
from .models import AnswerCategoryMapping, Category, Questionnaire, QuestionnaireQuestion
from .serializers import AnswerCategoryMappingSerializer, CategorySerializer, QuestionWithAnswersAndCategoriesSerializer, QuestionnaireForLogicPageSerializer
from rest_framework.permissions import IsAuthenticated


# # Create your views here.
# class QuestionnaireCreateAPIView(generics.CreateAPIView):
#     queryset = Questionnaire.objects.all()
#     serializer_class = QuestionnaireSerializer
#     permission_classes = [IsAuthenticated]

class GetQuestionnaireForLogicPage(APIView):
    def get(self, request):
        matchingRows = Questionnaire.objects.all()
        data = QuestionnaireForLogicPageSerializer(matchingRows, many=True).data
        return Response(data, status=status.HTTP_200_OK)

class GetQuestionWithAnswersAndCategories(APIView):
    def get(self, request, questionnaire_id):
        matchingRows = QuestionnaireQuestion.objects.filter(questionnaire_id=questionnaire_id)
        questions = [row.question for row in matchingRows]
        data = QuestionWithAnswersAndCategoriesSerializer(questions, many=True, context={"questionnaire_id": questionnaire_id}).data
        return Response(data, status=status.HTTP_200_OK)
    
class GetCategories(APIView):
    def get(self, request):
        matchingRows = Category.objects.all()
        data = CategorySerializer(matchingRows, many=True).data
        return Response(data, status=status.HTTP_200_OK)
    
class DeleteAnswerCategoryMapping(APIView):
    def delete(self, request, questionnaire_id, answer_id):
        deleted = AnswerCategoryMapping.objects.filter(questionnaire_id=questionnaire_id, answer_id=answer_id).delete()
        if deleted:
            return Response(status=status.HTTP_204_NO_CONTENT)
        return Response({ "detail": "Not Found" }, status=status.HTTP_404_NOT_FOUND)
    
class AddAnswerCategoryMapping(APIView):
    def post(self, request):
        serializedData = AnswerCategoryMappingSerializer(data=request.data)
        print("Pre-Validated data: ", serializedData)
        if serializedData.is_valid():
            print("Validated data: ", serializedData.validated_data)
            serializedData.save()
            return Response(serializedData.data, status=status.HTTP_201_CREATED)
        return Response({ "detail": "Invalid Data", "errors": serializedData.errors }, status=status.HTTP_400_BAD_REQUEST)