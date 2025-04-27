import traceback
from urllib import response
from django.shortcuts import render
from rest_framework import generics, status, viewsets
from rest_framework.views import APIView
from rest_framework.response import Response
from .models import Answer, AnswerCategoryMapping, Category, Question, Questionnaire, QuestionnaireQuestion, Video, VideoCategory
from .serializers import AnswerCategoryMappingSerializer, CategorySerializer, GetVideoWithCategoriesSerializer, QuestionSerializer, QuestionWithAnswersAndCategoriesSerializer, QuestionnaireForLogicPageSerializer, QuestionnaireSerializer, VideoSerializer, answerFilterSerializer
from rest_framework.permissions import IsAuthenticated
from django.db import connection, transaction
from rest_framework import serializers
from django.db.models import Subquery, Count, Q

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

# Create new Questionnaire Record - Propogates to question
class CreateQuestionnaire(APIView):
    def post(self, request):
        serializedData = QuestionnaireSerializer(data = request.data)
        if serializedData.is_valid():
            questionnaire_id = request.data.get("id")
            # Modify Existing Record
            if questionnaire_id != 0:
                oldQuestionnaire = Questionnaire.objects.get(id=questionnaire_id)
                self.modifyQuestionnaire(request.data, oldQuestionnaire)
                return Response({"id": questionnaire_id}, status=status.HTTP_204_NO_CONTENT)
            # Create New Record
            else:
                questionnaire_id = self.createQuestionnaire(request.data)
                return Response({"id": questionnaire_id}, status=status.HTTP_201_CREATED)
        return Response({ "detail": "Invalid Data", "errors": serializedData.errors }, status=status.HTTP_400_BAD_REQUEST)
   
    def createQuestionnaire(self, questionnaireData):
        # Create Questionnaire Record
        questionnaire = Questionnaire.objects.create(
            title = questionnaireData["title"],
            status = questionnaireData["status"],
            started = questionnaireData["started"],
            completed = questionnaireData["completed"],
            last_modified = questionnaireData["last_modified"]
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
        oldQuestionnaire.started=newData["started"]
        oldQuestionnaire.completed=newData["completed"]
        oldQuestionnaire.last_modified=newData["last_modified"]
        oldQuestionnaire.save()

        oldQuestionnaire.questionnairequestion_set.all().delete()

        # Create Mapping Records
        for question_id in newData["questions"]:
            question = Question.objects.get(id = question_id)
            QuestionnaireQuestion.objects.create(
                questionnaire=oldQuestionnaire,
                question=question
            )
    
class CreateQuestion(APIView):
    def post(self, request):
        serializedData = QuestionSerializer(data=request.data)
        if serializedData.is_valid():
            question_id = request.data.get("id")
            if question_id != 0:
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
    
class DeleteQuestionnaire(APIView):
    def delete(self, request, id):
        deleted = Questionnaire.objects.get(id=id).delete()
        if deleted:
            return Response(status=status.HTTP_204_NO_CONTENT)
        return Response({ "detail": "Not Found" }, status=status.HTTP_404_NOT_FOUND)

class getQuestions(APIView):
    def get(self, request):
        matchingRows = Question.objects.all()
        data = QuestionSerializer(matchingRows, many=True).data
        return Response(data, status=status.HTTP_200_OK)

class getVideosForPreview(APIView):
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
                "count": video.count
            }) 

        return Response(responseData, status=status.HTTP_200_OK)

# QUESTIONNAIRE PAGE END











# LOGIC BUILDER PAGE
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
    def post(self, request):
        serializedData = AnswerCategoryMappingSerializer(data=request.data)
        if serializedData.is_valid():
            serializedData.save()
            return Response(serializedData.data, status=status.HTTP_201_CREATED)
        return Response({ "detail": "Invalid Data", "errors": serializedData.errors }, status=status.HTTP_400_BAD_REQUEST)
# LOGIC BUILDER PAGE










# VIDEO MANAGEMENT PAGE START

class GetVideos(APIView):
    permission_classes = [IsAuthenticated]
    def get(self, request, title, duration, category):
        
        title = "" if title == "_" else title
        duration = "" if duration == "_" else duration
        category = "" if category == "_" else category

        categoryRows = Category.objects.filter(text__iregex=fr".*{category}.*")
        video_ids = VideoCategory.objects.filter(category__in=categoryRows).values_list("video_id", flat=True).distinct()

        videos = Video.objects.filter(id__in=video_ids, title__iregex=fr".*{title}.*", duration__iregex=fr".*{duration}.*")

        responseData = GetVideoWithCategoriesSerializer(videos, many=True).data
        return Response(responseData, status=status.HTTP_200_OK)
    

class DeleteVideo(APIView):
    permission_classes = [IsAuthenticated]
    def delete(self, request, id):
        deleted = Video.objects.get(id=id).delete()

        if deleted:
            return Response({"message": "Successfully Deleted Video"}, status=status.HTTP_204_NO_CONTENT)
        return Response({"message": "Failed Action"}, status=status.HTTP_400_BAD_REQUEST)
    

class CreateVideo(APIView):
    permission_classes = [IsAuthenticated]
    def post(self, request):
        serializedData = VideoSerializer(data=request.data)
        if serializedData.is_valid():
            videoData = request.data
            if videoData["id"] != 0:
                videoID = self.modifyVideo(videoData)
                return Response({"id": videoID}, status=status.HTTP_201_CREATED)
            else:
                videoID = self.createVideo(videoData)
                return Response({"id": videoID}, status=status.HTTP_201_CREATED)
        return Response({ "detail": "Failed to Create Video" }, status=status.HTTP_400_BAD_REQUEST)

    def createVideo(self, videoData):
        video = Video.objects.create(
            title = videoData["title"],
            duration = videoData["duration"],
            description = videoData["description"]
        )


        for categoryData in videoData["categories"]:
            try:
                categoryRow = Category.objects.get(text = categoryData["text"])
            except:
                categoryRow = Category.objects.create(text = categoryData["text"])

            VideoCategory.objects.create(
                video = video,
                category = categoryRow
            )

        return video.id
    
    def modifyVideo(self, videoData):
        Video.objects.filter(id = videoData["id"]).update(
            title = videoData["title"],
            duration = videoData["duration"],
            description = videoData["description"]
        )
        originalVideo = Video.objects.get(id = videoData["id"])
        originalVideo.videocategory_set.all().delete()

        for categoryData in videoData["categories"]:
            try:
                categoryRow = Category.objects.get(text = categoryData["text"])
            except:
                categoryRow = Category.objects.create(text = categoryData["text"])

            VideoCategory.objects.create(
                video = originalVideo,
                category = categoryRow
            )

        return originalVideo.id


# VIDEO MANAGEMENT PAGE END










# DEV TOOL: WIPE AND RESET FILLER DATA IN DATABASE:
class DataStorage:
    from django.utils import timezone
    questionData = [
        {
            "text": "What is your primary fitness goal?",
            "type": "multichoice",
            "answers": ["Lose weight", "Build muscle", "Increase endurance", "Improve flexibility", "General health"]
        },
        {
            "text": "How many days per week do you currently work out?",
            "type": "multichoice",
            "answers": ["0-1 days", "2-3 days", "4-5 days", "6-7 days"]
        },
        {
            "text": "Do you have any injuries or physical limitations?",
            "type": "multichoice",
            "answers": ["None", "Back issues", "Knee pain", "Shoulder problems", "Other"]
        },
        {
            "text": "What types of workouts do you enjoy?",
            "type": "checkbox",
            "answers": ["Cardio", "Strength training", "Yoga", "Pilates", "HIIT", "Stretching"]
        },
        {
            "text": "How would you rate your current endurance level?",
            "type": "multichoice",
            "answers": ["Very low", "Low", "Moderate", "High", "Very high"]
        },
        {
            "text": "Do you prefer working out at home or in a gym?",
            "type": "multichoice",
            "answers": ["At home", "In a gym", "No preference"]
        },
        {
            "text": "What time of day do you usually exercise?",
            "type": "checkbox",
            "answers": ["Early morning", "Late morning", "Afternoon", "Evening", "Night"]
        },
        {
            "text": "Do you have experience with strength training?",
            "type": "multichoice",
            "answers": ["No experience", "Some experience", "Regularly strength train"]
        },
        {
            "text": "What equipment do you have access to?",
            "type": "checkbox",
            "answers": ["Dumbbells", "Resistance bands", "Treadmill", "Stationary bike", "Barbells", "None"]
        },
        {
            "text": "How much time can you dedicate to each workout session?",
            "type": "multichoice",
            "answers": ["Less than 15 minutes", "15–30 minutes", "30–45 minutes", "45–60 minutes", "More than 1 hour"]
        },
        {
            "text": "What is your current flexibility level?",
            "type": "multichoice",
            "answers": ["Very stiff", "Somewhat stiff", "Moderately flexible", "Very flexible"]
        },
        {
            "text": "Are you interested in improving your posture?",
            "type": "multichoice",
            "answers": ["Yes", "No", "Maybe"]
        },
        {
            "text": "Do you follow any specific diet or nutrition plan?",
            "type": "multichoice",
            "answers": ["No plan", "Keto", "Vegan", "Paleo", "Intermittent fasting", "Other"]
        },
        {
            "text": "How would you describe your recovery habits?",
            "type": "multichoice",
            "answers": ["I stretch and rest properly", "I sometimes skip recovery", "I rarely recover intentionally"]
        },
        {
            "text": "Have you done high-intensity interval training (HIIT) before?",
            "type": "multichoice",
            "answers": ["Yes", "No", "Tried once or twice"]
        },
        {
            "text": "What motivates you to stick to a workout routine?",
            "type": "checkbox",
            "answers": ["Progress tracking", "Support from others", "Seeing physical results", "Mental health", "Routine/habit"]
        },
        {
            "text": "Do you track your workouts or progress?",
            "type": "multichoice",
            "answers": ["Yes, with an app", "Yes, manually", "No, I don't track"]
        },
        {
            "text": "What’s your preferred workout duration?",
            "type": "multichoice",
            "answers": ["15 minutes", "30 minutes", "45 minutes", "1 hour", "More than 1 hour"]
        },
        {
            "text": "Are you training for a specific event or sport?",
            "type": "multichoice",
            "answers": ["Yes", "No", "Considering it"]
        },
        {
            "text": "How do you usually feel after a workout?",
            "type": "checkbox",
            "answers": ["Energized", "Tired", "Sore", "Relaxed", "Accomplished"]
        },
    ]


    questionnaireData = [
        {"title": "Beginner Full-Body Assessment", "status": "Published", "started": 120, "completed": 95, "last_modified": timezone.now()},
        {"title": "Cardio Readiness Survey", "status": "Published", "started": 80, "completed": 60, "last_modified": timezone.now()},
        {"title": "Strength Training Preferences", "status": "Draft", "started": 45, "completed": 30, "last_modified": timezone.now()},
        {"title": "Flexibility & Mobility Check", "status": "Published", "started": 70, "completed": 55, "last_modified": timezone.now()},
        {"title": "Upper Body Focus Questionnaire", "status": "Draft", "started": 35, "completed": 25, "last_modified": timezone.now()},
        {"title": "Lower Body Focus Questionnaire", "status": "Published", "started": 60, "completed": 50, "last_modified": timezone.now()},
        {"title": "Posture & Core Stability Assessment", "status": "Published", "started": 90, "completed": 75, "last_modified": timezone.now()},
        {"title": "HIIT Program Fit Survey", "status": "Draft", "started": 40, "completed": 28, "last_modified": timezone.now()},
        {"title": "Recovery & Rest Habits", "status": "Published", "started": 65, "completed": 58, "last_modified": timezone.now()},
        {"title": "Pre-Workout Nutrition Check", "status": "Template", "started": 50, "completed": 40, "last_modified": timezone.now()},
    ]

    questionQuestionnaireMappings = [
        {"questionnaire_id": 1, "question_id": 1},
        {"questionnaire_id": 1, "question_id": 2},
        {"questionnaire_id": 1, "question_id": 3},
        {"questionnaire_id": 1, "question_id": 4},
        {"questionnaire_id": 1, "question_id": 5},
        {"questionnaire_id": 1, "question_id": 6},
        {"questionnaire_id": 1, "question_id": 7},
        {"questionnaire_id": 1, "question_id": 8},
        {"questionnaire_id": 2, "question_id": 9},
        {"questionnaire_id": 2, "question_id": 10},
        {"questionnaire_id": 2, "question_id": 11},
        {"questionnaire_id": 2, "question_id": 12},
        {"questionnaire_id": 2, "question_id": 13},
        {"questionnaire_id": 2, "question_id": 14},
        {"questionnaire_id": 2, "question_id": 15},
        {"questionnaire_id": 2, "question_id": 16},
        {"questionnaire_id": 3, "question_id": 17},
        {"questionnaire_id": 3, "question_id": 18},
        {"questionnaire_id": 3, "question_id": 19},
        {"questionnaire_id": 3, "question_id": 20},
        {"questionnaire_id": 3, "question_id": 1},
        {"questionnaire_id": 3, "question_id": 2},
        {"questionnaire_id": 3, "question_id": 3},
        {"questionnaire_id": 3, "question_id": 4},
    ]

    videoData = [
        {"title": "Full Body Stretch", "duration": "<15min", "description": "A gentle full-body stretching routine."},
        {"title": "HIIT Cardio Blast", "duration": "15-30min", "description": "High-intensity interval training for fat burn."},
        {"title": "Beginner Yoga Flow", "duration": "15-30min", "description": "Relaxing yoga for beginners."},
        {"title": "Upper Body Strength", "duration": "15-30min", "description": "Strength training focusing on upper body."},
        {"title": "Core Crusher", "duration": "<15min", "description": "A focused ab and core workout."},
        {"title": "Lower Body Burner", "duration": "15-30min", "description": "Leg and glute-focused exercise routine."},
        {"title": "Morning Energy Boost", "duration": "<15min", "description": "Short workout to start your day energized."},
        {"title": "Boxing Cardio Workout", "duration": "30-45min", "description": "Boxing-style cardio for endurance."},
        {"title": "Quick Office Stretch", "duration": "<15min", "description": "Stretches you can do at your desk."},
        {"title": "Low Impact Cardio", "duration": "15-30min", "description": "Heart-pumping cardio with minimal joint impact."},
        {"title": "Power Pilates", "duration": "30-45min", "description": "Pilates workout for strength and balance."},
        {"title": "Glute Activation", "duration": "<15min", "description": "Warm-up focused on activating glute muscles."},
        {"title": "Full Body Dumbbell Workout", "duration": "30-45min", "description": "Strength training using dumbbells."},
        {"title": "Bodyweight Burn", "duration": "15-30min", "description": "No equipment needed, full body workout."},
        {"title": "Mobility and Flexibility", "duration": "15-30min", "description": "Improve range of motion and flexibility."},
        {"title": "Evening Cool Down", "duration": "<15min", "description": "Relaxing exercises to wind down your day."},
        {"title": "Tabata Cardio", "duration": "<15min", "description": "Tabata-style intervals for max effort."},
        {"title": "Balance and Stability", "duration": "15-30min", "description": "Exercises to improve balance and posture."},
        {"title": "Chair Workout", "duration": "15-30min", "description": "Full-body workout using just a chair."},
        {"title": "Resistance Band Training", "duration": "45-60min", "description": "Strength training using resistance bands."},
    ]

    categoryData = [
        {"text": "Strength Training"},
        {"text": "Cardiovascular Fitness"},
        {"text": "Flexibility & Mobility"},
        {"text": "Weight Loss"},
        {"text": "Muscle Building"},
        {"text": "HIIT (High-Intensity Interval Training)"},
        {"text": "Yoga"},
        {"text": "Pilates"},
        {"text": "Injury Recovery"},
        {"text": "Core Strength"},
        {"text": "Endurance Training"},
        {"text": "Balance & Stability"},
        {"text": "Senior Fitness"},
        {"text": "Prenatal/Postnatal Fitness"},
        {"text": "Mental Wellness"},
        {"text": "Functional Fitness"},
        {"text": "Sports Conditioning"},
        {"text": "Low Impact Workouts"},
        {"text": "Nutrition & Diet"},
        {"text": "Meditation & Breathwork"},
    ]

    videoCategoryMapping = [
        {"video_id": 1, "category_id": 3},
        {"video_id": 1, "category_id": 8},
        {"video_id": 2, "category_id": 2},
        {"video_id": 2, "category_id": 4},
        {"video_id": 3, "category_id": 7},
        {"video_id": 3, "category_id": 15},
        {"video_id": 4, "category_id": 1},
        {"video_id": 4, "category_id": 5},
        {"video_id": 5, "category_id": 10},
        {"video_id": 6, "category_id": 1},
        {"video_id": 6, "category_id": 5},
        {"video_id": 7, "category_id": 2},
        {"video_id": 7, "category_id": 14},
        {"video_id": 8, "category_id": 2},
        {"video_id": 8, "category_id": 17},
        {"video_id": 9, "category_id": 3},
        {"video_id": 9, "category_id": 13},
        {"video_id": 10, "category_id": 2},
        {"video_id": 10, "category_id": 17},
        {"video_id": 11, "category_id": 8},
        {"video_id": 11, "category_id": 16},
        {"video_id": 12, "category_id": 5},
        {"video_id": 12, "category_id": 10},
        {"video_id": 13, "category_id": 1},
        {"video_id": 13, "category_id": 5},
        {"video_id": 14, "category_id": 1},
        {"video_id": 14, "category_id": 16},
        {"video_id": 15, "category_id": 3},
        {"video_id": 15, "category_id": 12},
        {"video_id": 16, "category_id": 3},
        {"video_id": 16, "category_id": 20},
        {"video_id": 17, "category_id": 2},
        {"video_id": 17, "category_id": 4},
        {"video_id": 18, "category_id": 12},
        {"video_id": 18, "category_id": 16},
        {"video_id": 19, "category_id": 13},
        {"video_id": 20, "category_id": 1},
        {"video_id": 20, "category_id": 18},
    ]
    answercategoryMapping = [
        {"questionnaire_id": 1, "answer_id": 1, "category_id": 4, "inclusive": True},
        {"questionnaire_id": 1, "answer_id": 2, "category_id": 2, "inclusive": True},
        {"questionnaire_id": 1, "answer_id": 3, "category_id": 5, "inclusive": True},
        {"questionnaire_id": 1, "answer_id": 4, "category_id": 7, "inclusive": True},
        {"questionnaire_id": 1, "answer_id": 5, "category_id": 10, "inclusive": True},
        {"questionnaire_id": 1, "answer_id": 6, "category_id": 8, "inclusive": True},
        {"questionnaire_id": 1, "answer_id": 7, "category_id": 12, "inclusive": True},
        {"questionnaire_id": 1, "answer_id": 8, "category_id": 6, "inclusive": False},
        {"questionnaire_id": 1, "answer_id": 9, "category_id": 3, "inclusive": True},
        {"questionnaire_id": 1, "answer_id": 10, "category_id": 15, "inclusive": True},
        {"questionnaire_id": 1, "answer_id": 11, "category_id": 1, "inclusive": True},
        {"questionnaire_id": 1, "answer_id": 12, "category_id": 4, "inclusive": True},
        {"questionnaire_id": 1, "answer_id": 13, "category_id": 14, "inclusive": True},
        {"questionnaire_id": 1, "answer_id": 14, "category_id": 7, "inclusive": True},
        {"questionnaire_id": 1, "answer_id": 15, "category_id": 2, "inclusive": True},
        {"questionnaire_id": 1, "answer_id": 16, "category_id": 13, "inclusive": False},
        {"questionnaire_id": 1, "answer_id": 17, "category_id": 5, "inclusive": True},
        {"questionnaire_id": 1, "answer_id": 18, "category_id": 11, "inclusive": True},
        {"questionnaire_id": 1, "answer_id": 19, "category_id": 6, "inclusive": True},
        {"questionnaire_id": 1, "answer_id": 20, "category_id": 3, "inclusive": True},
        {"questionnaire_id": 1, "answer_id": 21, "category_id": 9, "inclusive": True},
        {"questionnaire_id": 1, "answer_id": 22, "category_id": 12, "inclusive": True},
        {"questionnaire_id": 1, "answer_id": 23, "category_id": 1, "inclusive": True},
        {"questionnaire_id": 1, "answer_id": 24, "category_id": 2, "inclusive": True},
        {"questionnaire_id": 1, "answer_id": 25, "category_id": 3, "inclusive": True},
        {"questionnaire_id": 1, "answer_id": 26, "category_id": 4, "inclusive": False},
        {"questionnaire_id": 1, "answer_id": 27, "category_id": 5, "inclusive": True},
        {"questionnaire_id": 1, "answer_id": 28, "category_id": 5, "inclusive": True},
        {"questionnaire_id": 1, "answer_id": 28, "category_id": 10, "inclusive": True},
        {"questionnaire_id": 1, "answer_id": 29, "category_id": 7, "inclusive": True},
        {"questionnaire_id": 1, "answer_id": 30, "category_id": 11, "inclusive": True},
        {"questionnaire_id": 1, "answer_id": 30, "category_id": 16, "inclusive": True},
        {"questionnaire_id": 1, "answer_id": 31, "category_id": 6, "inclusive": True},
        {"questionnaire_id": 1, "answer_id": 31, "category_id": 18, "inclusive": False},
        {"questionnaire_id": 1, "answer_id": 32, "category_id": 8, "inclusive": False},
        {"questionnaire_id": 1, "answer_id": 33, "category_id": 19, "inclusive": True},
        {"questionnaire_id": 1, "answer_id": 34, "category_id": 17, "inclusive": True},
        {"questionnaire_id": 1, "answer_id": 34, "category_id": 20, "inclusive": True},
        {"questionnaire_id": 1, "answer_id": 35, "category_id": 15, "inclusive": True},
        {"questionnaire_id": 1, "answer_id": 36, "category_id": 9, "inclusive": False},
    ]

class ResetDatabaseData(APIView):

    # Insert into database
    def post(self, request):
        with transaction.atomic():
            try:
                AnswerCategoryMapping.objects.all().delete()
                QuestionnaireQuestion.objects.all().delete()
                Answer.objects.all().delete()
                Question.objects.all().delete()
                Questionnaire.objects.all().delete()
                VideoCategory.objects.all().delete()
                Category.objects.all().delete()
                Video.objects.all().delete()

                with connection.cursor() as cursor:
                    # Clear out database
                    cursor.execute("ALTER TABLE questionnaire_builder_answercategorymapping AUTO_INCREMENT = 1;")   
                    cursor.execute("ALTER TABLE questionnaire_builder_questionnairequestion AUTO_INCREMENT = 1;")  
                    cursor.execute("ALTER TABLE questionnaire_builder_answer AUTO_INCREMENT = 1;")         
                    cursor.execute("ALTER TABLE questionnaire_builder_question AUTO_INCREMENT = 1;")    
                    cursor.execute("ALTER TABLE questionnaire_builder_questionnaire AUTO_INCREMENT = 1;")
                    cursor.execute("ALTER TABLE questionnaire_builder_videocategory AUTO_INCREMENT = 1;")
                    cursor.execute("ALTER TABLE questionnaire_builder_category AUTO_INCREMENT = 1;")
                    cursor.execute("ALTER TABLE questionnaire_builder_video AUTO_INCREMENT = 1;")

                for question in DataStorage.questionData:
                    questionRow = Question.objects.create(text=question["text"], type=question["type"])
                    for answer in question["answers"]:
                        Answer.objects.create(
                            question = questionRow, 
                            text = answer
                        )

                        
                for questionnaire in DataStorage.questionnaireData:
                    Questionnaire.objects.create(
                        title = questionnaire["title"],
                        status = questionnaire["status"],
                        started = questionnaire["started"],
                        completed = questionnaire["completed"],
                        last_modified = questionnaire["last_modified"]
                    )
                for questionMapping in DataStorage.questionQuestionnaireMappings:
                    questionnaire = Questionnaire.objects.get(id=questionMapping["questionnaire_id"])
                    question = Question.objects.get(id=questionMapping["question_id"])
                    QuestionnaireQuestion.objects.create(
                        questionnaire = questionnaire,
                        question = question
                    )

                for video in DataStorage.videoData:
                    Video.objects.create(**video)

                for category in DataStorage.categoryData:
                    Category.objects.create(**category)

                for categoryMapping in DataStorage.videoCategoryMapping:
                    video = Video.objects.get(id = categoryMapping["video_id"])
                    category = Category.objects.get(id = categoryMapping["category_id"])
                    VideoCategory.objects.create(
                        video = video,
                        category = category
                    )

                for ansCatMapping in DataStorage.answercategoryMapping:
                    category = Category.objects.get(id = ansCatMapping["category_id"])
                    answer = Answer.objects.get(id = ansCatMapping["answer_id"])
                    questionnaire = Questionnaire.objects.get(id = ansCatMapping["questionnaire_id"])
                    AnswerCategoryMapping.objects.create(
                        category = category,
                        answer = answer,
                        questionnaire = questionnaire,
                        inclusive = ansCatMapping["inclusive"],
                    )

                return Response({ "massage": "Successful Operation" }, status=status.HTTP_204_NO_CONTENT)
            
            except Exception as e:
                traceback.print_exc()
                return Response({ "error": str(e) }, status=status.HTTP_400_BAD_REQUEST)
        