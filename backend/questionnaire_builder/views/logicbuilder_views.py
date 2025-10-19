from rest_framework import status
from rest_framework.views import APIView
from rest_framework.response import Response
from ..models import AnswerCategoryMapping, Category, Questionnaire, QuestionnaireQuestion
from ..serializers import AnswerCategoryMappingSerializer, CategorySerializer, QuestionWithAnswersAndCategoriesSerializer, QuestionnaireForLogicPageSerializer, CreateAnswerCategoryMappingRequestSerializer
from rest_framework.permissions import IsAuthenticated
from drf_spectacular.utils import extend_schema
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status


class GetQuestionnaireForLogicPage(APIView):
    permission_classes = [IsAuthenticated]
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

# Create New Answer-Category Mapping record
# Input Data Structure: ('id', 'questionnaire_id', 'answer_id', 'category_id', 'inclusive')
class AddAnswerCategoryMapping(APIView):
    serializer_class = CreateAnswerCategoryMappingRequestSerializer
    
    @extend_schema(
        request=CreateAnswerCategoryMappingRequestSerializer,
        responses={201: AnswerCategoryMappingSerializer},
        summary="Create answer category mapping",
        description="Creates a mapping between an answer and a category for a questionnaire"
    )
    def post(self, request):
        serializedData = CreateAnswerCategoryMappingRequestSerializer(data=request.data)
        if serializedData.is_valid():
            # Create the mapping using the validated data
            mapping = AnswerCategoryMapping.objects.create(
                questionnaire_id=serializedData.validated_data['questionnaire_id'],
                answer_id=serializedData.validated_data['answer_id'],
                category_id=serializedData.validated_data['category_id'],
                inclusive=serializedData.validated_data['inclusive']
            )
            response_data = AnswerCategoryMappingSerializer(mapping).data
            return Response(response_data, status=status.HTTP_201_CREATED)
        return Response({ 
            "detail": "Invalid Data", 
            "errors": serializedData.errors 
        }, status=status.HTTP_400_BAD_REQUEST)
