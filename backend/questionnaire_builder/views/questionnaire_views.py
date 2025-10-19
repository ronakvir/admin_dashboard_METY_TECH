from django.utils import timezone
from rest_framework import status
from rest_framework.views import APIView
from rest_framework.response import Response
from ..models import Answer, AnswerCategoryMapping,  Question, Questionnaire, QuestionnaireQuestion, Video
from ..serializers import QuestionSerializer, QuestionnaireSerializer, GetVideosForPreviewSerializer, VideoResponseSerializer,CreateQuestionRequestSerializer, CreateQuestionnaireRequestSerializer
from django.db.models import Count, Q
from drf_spectacular.utils import extend_schema
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status

class CreateQuestionnaire(APIView):
    serializer_class = CreateQuestionnaireRequestSerializer
    
    @extend_schema(
        request=CreateQuestionnaireRequestSerializer,
        responses={
            200: {"type": "object", "properties": {"id": {"type": "integer"}}}, 
            201: {"type": "object", "properties": {"id": {"type": "integer"}}}
        },
        summary="Create or update questionnaire",
        description="Creates a new questionnaire or updates an existing one with questions"
    )
    def post(self, request):
        serializedData = CreateQuestionnaireRequestSerializer(data=request.data)
        if serializedData.is_valid():
            questionnaire_id = serializedData.validated_data.get("id", 0)
            # Modify Existing Record
            if questionnaire_id != 0:
                oldQuestionnaire = Questionnaire.objects.get(id=questionnaire_id)
                self.modifyQuestionnaire(serializedData.validated_data, oldQuestionnaire)
                return Response({"id": questionnaire_id}, status=status.HTTP_200_OK)
            # Create New Record
            else:
                questionnaire_id = self.createQuestionnaire(serializedData.validated_data)
                return Response({"id": questionnaire_id}, status=status.HTTP_201_CREATED)
        return Response({ 
            "detail": "Invalid Data", 
            "errors": serializedData.errors 
        }, status=status.HTTP_400_BAD_REQUEST)
   
    def createQuestionnaire(self, questionnaireData):
        # Create Questionnaire Record
        questionnaire = Questionnaire.objects.create(
            title = questionnaireData["title"],
            status = questionnaireData["status"],
            started = questionnaireData.get("started", 0),
            completed = questionnaireData.get("completed", 0),
            last_modified = questionnaireData.get("last_modified", timezone.now())
        )
        # Create Mapping Records
        for question_id in questionnaireData["questions"]:
            question = Question.objects.get(id = question_id)
            QuestionnaireQuestion.objects.create(
                questionnaire=questionnaire,
                question=question
            )
        return questionnaire.id
    
    def modifyQuestionnaire(self, newData, oldQuestionnaire):
        
        oldQuestionnaire.title=newData["title"]
        oldQuestionnaire.status=newData["status"]
        oldQuestionnaire.started=newData.get("started", oldQuestionnaire.started)
        oldQuestionnaire.completed=newData.get("completed", oldQuestionnaire.completed)
        oldQuestionnaire.last_modified=newData.get("last_modified", timezone.now())
        oldQuestionnaire.save()

        oldQuestionnaire.questionnairequestion_set.all().delete()

        # Create Mapping Records
        for question_id in newData["questions"]:
            question = Question.objects.get(id = question_id)
            QuestionnaireQuestion.objects.create(
                questionnaire=oldQuestionnaire,
                question=question
            )
    
  
class DeleteQuestionnaire(APIView):
    def delete(self, request, id):
        try:
            questionnaire = Questionnaire.objects.get(id=id)
            questionnaire.delete()
            return Response(status=status.HTTP_204_NO_CONTENT)
        except Questionnaire.DoesNotExist:
            return Response({ "detail": "Questionnaire not found" }, status=status.HTTP_404_NOT_FOUND)


class getQuestionnaires(APIView):
    def get(self, request):
        matchingRows = Questionnaire.objects.all()
        data = QuestionnaireSerializer(matchingRows, many=True).data
        return Response(data, status=status.HTTP_200_OK)
    

class CreateQuestion(APIView):
    serializer_class = CreateQuestionRequestSerializer
    
    @extend_schema(
        request=CreateQuestionRequestSerializer,
        responses={200: QuestionSerializer, 201: QuestionSerializer},
        summary="Create or update question",
        description="Creates a new question or updates an existing one with answers"
    )
    def post(self, request):
        serializedData = CreateQuestionRequestSerializer(data=request.data)
        if serializedData.is_valid():
            question_id = serializedData.validated_data.get("id", 0)
            if question_id != 0:
                oldQuestion = Question.objects.get(id=question_id)
                question = self.modifyQuestion(serializedData.validated_data, oldQuestion)
                responseData = QuestionSerializer(question).data
                return Response(responseData, status=status.HTTP_200_OK)
            else:
                question = self.createQuestion(serializedData.validated_data)
                responseData = QuestionSerializer(question).data
                return Response(responseData, status=status.HTTP_201_CREATED)
        return Response({ 
            "detail": "Invalid Data", 
            "errors": serializedData.errors 
        }, status=status.HTTP_400_BAD_REQUEST)
   
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
                text=answerData["text"]
            )

        return oldQuestion


class DeleteQuestion(APIView):
    def delete(self, request, id):
        deleted = Question.objects.filter(id=id).delete()
        if deleted:
            return Response(status=status.HTTP_204_NO_CONTENT)
        return Response({ "detail": "Not Found" }, status=status.HTTP_404_NOT_FOUND)

class getQuestions(APIView):
    def get(self, request):
        matchingRows = Question.objects.all()
        data = QuestionSerializer(matchingRows, many=True).data
        return Response(data, status=status.HTTP_200_OK)


class getVideosForPreview(APIView):
    serializer_class = GetVideosForPreviewSerializer
    
    @extend_schema(
        request=GetVideosForPreviewSerializer,
        responses={200: VideoResponseSerializer(many=True)},
        summary="Get videos for questionnaire preview",
        description="Returns ranked videos based on questionnaire answers and category mappings"
    )
    def post(self, request):

        answerCategoryRows = AnswerCategoryMapping.objects.filter(
            questionnaire_id = request.data.get("questionnaire_id"), 
            answer_id__in = request.data.get("answer_ids")
        )

        includedCategoryIDs = list(answerCategoryRows.filter(inclusive=True).values_list("category_id", flat=True))
        
        rankedVideos = (
            Video.objects
            .filter(videocategory__category_id__in = includedCategoryIDs)
            .annotate(count = Count(
                "videocategory__category_id",
                filter=Q(videocategory__category_id__in = includedCategoryIDs),
                distinct=True
            ))
            .order_by('-count')
        )
        responseData = []
        print(rankedVideos)
        for video in rankedVideos:
            responseData.append({
                "id": video.id,
                "title": video.title,
                "duration": video.duration,
                "description": video.description,
                "url": video.url,
                "count": video.count
            }) 

        return Response(responseData, status=status.HTTP_200_OK)
