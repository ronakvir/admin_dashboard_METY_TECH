from urllib import response
from django.shortcuts import render
from rest_framework import generics, status, viewsets
from rest_framework.views import APIView
from rest_framework.response import Response
from .models import Answer, AnswerCategoryMapping, Category, Question, Questionnaire, QuestionnaireQuestion, VideoCategory
from .serializers import AnswerCategoryMappingSerializer, CategorySerializer, QuestionSerializer, QuestionWithAnswersAndCategoriesSerializer, QuestionnaireForLogicPageSerializer, QuestionnaireSerializer, VideoSerializer, answerFilterSerializer
from rest_framework.permissions import IsAuthenticated


# QUESTIONNAIRE PAGE
# class AddQuestionnaire(generics.CreateAPIView):
#     queryset = Questionnaire.objects.all()
#     serializer_class = CreateQuestionnaireSerializer
#     permission_classes = [IsAuthenticated]
#     def post(self, request):
#         serializedData = QuestionnaireSerializer(data=request.data)
#         if serializedData.is_valid():
#             CreateQuestionnaireSerializer(serializedData.data)
#             return Response(serializedData.data, status=status.HTTP_201_CREATED)
#         return Response({ "detail": "Invalid Data", "errors": serializedData.errors }, status=status.HTTP_400_BAD_REQUEST)


# QUESTIONNAIRE PAGE
class CreateQuestionnaire(APIView):
    def post(self, request):

        serializedData = QuestionnaireSerializer(data=request.data)
        if serializedData.is_valid():
            questionnaire = self.save_full_questionnaire(request.data)
            responseData = QuestionnaireSerializer(questionnaire).data
            return Response(responseData, status=status.HTTP_201_CREATED)
        return Response({ "detail": "Invalid Data", "errors": serializedData.errors }, status=status.HTTP_400_BAD_REQUEST)
   
    def save_full_questionnaire(self, data):
        print("TESTING")
        print(data)
        questionnaire = Questionnaire.objects.create(
            title=data["title"],
            status=data["status"],
            started=data["started"],
            completed=data["completed"],
            last_modified=data["last_modified"]
        )

        for question_data in data["questions"]:
            question = Question.objects.create(
                text=question_data["text"],
                type=question_data["type"]
            )

            QuestionnaireQuestion.objects.create(
                questionnaire=questionnaire,
                question=question
            )

            for answer_data in question_data["answers"]:
                Answer.objects.create(
                    question=question,
                    text=answer_data["text"]
                )
        return questionnaire
    
class CreateQuestion(APIView):
    def post(self, request):
        serializedData = QuestionSerializer(data=request.data)
        if serializedData.is_valid():
            question_id = request.data.get("id")
            if question_id != 0:
                print("WHAT ")
                print(question_id)
                oldQuestion = Question.objects.get(id=question_id)
                question = self.modifyQuestion(request.data, oldQuestion)
                responseData = QuestionSerializer(question).data
                return Response(responseData, status=status.HTTP_200_OK)
            else:
                question = self.createQuestion(request.data)
                responseData = QuestionSerializer(question).data
                return Response(responseData, status=status.HTTP_200_OK)
        return Response({ "detail": "Invalid Data", "errors": serializedData.errors }, status=status.HTTP_400_BAD_REQUEST)
   
    def createQuestion(self, data):
        question = Question.objects.create(
            text=data["text"],
            type=data["type"]
        )

        for answer_data in data["answers"]:
            Answer.objects.create(
                question=question,
                text=answer_data["text"]
            )
        return question
    
    def modifyQuestion(self, newData, oldQuestion):
        
        oldQuestion.text=newData["text"]
        oldQuestion.type=newData["type"]
        oldQuestion.save()

        oldQuestion.answer_set.all().delete()

        for answerData in newData["answers"]:
            Answer.objects.create(
                question=oldQuestion,
                text=oldQuestion.text
            )

        return oldQuestion
    
class DeleteQuestion(APIView):
    def delete(self, request, id):
        deleted = Question.objects.filter(id=id).delete()
        if deleted:
            return Response(status=status.HTTP_204_NO_CONTENT)
        return Response({ "detail": "Not Found" }, status=status.HTTP_404_NOT_FOUND)


class getQuestionnaires(APIView):
    def get(self, request):
        matchingRows = Questionnaire.objects.all()
        data = QuestionnaireSerializer(matchingRows, many=True).data
        return Response(data, status=status.HTTP_200_OK)

class getQuestions(APIView):
    def get(self, request):
        matchingRows = Question.objects.all()
        data = QuestionSerializer(matchingRows, many=True).data
        return Response(data, status=status.HTTP_200_OK)

class getVideosFromPreview(APIView):
    def post(self, request):
        serializedData = answerFilterSerializer(data=request.data)
        if serializedData.is_valid():
            inclusive = serializedData.validated_data.get("inclusive", [])
            exclusive = serializedData.validated_data.get("exclusive", [])

            matchingRows = AnswerCategoryMapping.objects.filter(id__in=inclusive).exclude(id__in=exclusive)
            categories = [row.category for row in matchingRows]
            videoCats = VideoCategory.objects.filter(category__in=categories)
            videoData = [row.video for row in videoCats]

            data = VideoSerializer(videoData, many=True).data
            return Response(data, status=status.HTTP_200_OK)

# QUESTIONNAIRE PAGE END


# LOGIC PAGE
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
    
class AddAnswerCategoryMapping(APIView):
    def post(self, request):
        serializedData = AnswerCategoryMappingSerializer(data=request.data)
        if serializedData.is_valid():
            serializedData.save()
            return Response(serializedData.data, status=status.HTTP_201_CREATED)
        return Response({ "detail": "Invalid Data", "errors": serializedData.errors }, status=status.HTTP_400_BAD_REQUEST)
# LOGIC PAGE