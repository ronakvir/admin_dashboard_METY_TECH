import traceback
from urllib import response
from django.shortcuts import render
from django.utils import timezone
from rest_framework import generics, status, viewsets
from rest_framework.views import APIView
from rest_framework.response import Response
from .models import Answer, AnswerCategoryMapping, Category, Question, Questionnaire, QuestionnaireQuestion, Video, VideoCategory, APIKey
from .serializers import AnswerCategoryMappingSerializer, CategorySerializer, GetVideoWithCategoriesSerializer, QuestionSerializer, QuestionWithAnswersAndCategoriesSerializer, QuestionnaireForLogicPageSerializer, QuestionnaireSerializer, VideoSerializer, answerFilterSerializer, APIKeySerializer, CreateAPIKeySerializer, APIKeyResponseSerializer, APIKeyStatusSerializer, PublicQuestionnaireSerializer, GetVideosForPreviewSerializer, VideoResponseSerializer, CreateVideoSerializer, VideoSearchSerializer, CreateQuestionRequestSerializer, CreateQuestionnaireRequestSerializer, CreateAnswerCategoryMappingRequestSerializer
from rest_framework.permissions import IsAuthenticated
from django.db import connection, transaction
from rest_framework import serializers
from django.db.models import Subquery, Count, Q
from drf_spectacular.utils import extend_schema


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


class getQuestionnaires(APIView):
    def get(self, request):
        matchingRows = Questionnaire.objects.all()
        data = QuestionnaireSerializer(matchingRows, many=True).data
        return Response(data, status=status.HTTP_200_OK)
    
class DeleteQuestionnaire(APIView):
    def delete(self, request, id):
        try:
            questionnaire = Questionnaire.objects.get(id=id)
            questionnaire.delete()
            return Response(status=status.HTTP_204_NO_CONTENT)
        except Questionnaire.DoesNotExist:
            return Response({ "detail": "Questionnaire not found" }, status=status.HTTP_404_NOT_FOUND)

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

import os
from dotenv import load_dotenv
import re
import json
import signal
import traceback
import google.generativeai as genai
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status

load_dotenv()
genai.configure(api_key = os.getenv("GEMINI_API_KEY"))

def correct_workout_durations(week):
    """
    Back-propagates total durations:
    - Each activity's duration_seconds = sum(exercises) * sets.
    - Each day's total_duration_seconds = sum(activity durations).
    - Ensures total duration within ±10% of declared total.
    - Scales non-warmup/cooldown exercises if needed.
    - Rounds durations to nearest 10 seconds.
    """
    if not week.get("days"):
        return week

    corrected = False

    for day in week["days"]:
        activities = day.get("segments", [])
        if not activities:
            continue

        declared_total = day.get("total_duration_seconds", 0)

        # --- Step 1: recompute each activity duration from its exercises ---
        for activity in activities:
            exercises = activity.get("segments", [])
            sets = activity.get("sets", 1)
            activity_total = sum(ex.get("duration_seconds", 0) for ex in exercises) * sets
            activity["duration_seconds"] = round(activity_total)

        # --- Step 2: recompute day's total duration from activities ---
        actual_total = sum(a.get("duration_seconds", 0) for a in activities)
        day["total_duration_seconds"] = round(actual_total)

        # --- Step 3: calculate mismatch vs declared total (±10%) ---
        if declared_total <= 0:
            declared_total = actual_total  # adopt recomputed value if missing

        error_ratio = abs(declared_total - actual_total) / declared_total

        if error_ratio <= 0.1:
            continue  # within ±10%, fine as-is

        corrected = True
        scale_factor = declared_total / actual_total

        print(
            f"⚙️ Adjusting '{day.get('title', 'Untitled')}' — "
            f"off by {error_ratio*100:.1f}%, scaling exercises by {scale_factor:.2f}"
        )

        # --- Step 4: rescale all non-warmup/cooldown exercises proportionally ---
        for activity in activities:
            name = str(activity.get("activity", "")).lower()
            if "warmup" in name or "cooldown" in name:
                continue  # skip these activities

            exercises = activity.get("segments", [])
            if not exercises:
                continue

            sets = activity.get("sets", 1)
            for ex in exercises:
                old_dur = ex.get("duration_seconds", 0)
                new_dur = max(10, round((old_dur * scale_factor) / 10) * 10)
                ex["duration_seconds"] = new_dur

            # recompute activity total
            new_activity_total = sum(ex["duration_seconds"] for ex in exercises) * sets
            activity["duration_seconds"] = round(new_activity_total)

        # --- Step 5: recompute total again after scaling ---
        new_total = sum(a["duration_seconds"] for a in activities)
        day["total_duration_seconds"] = round(new_total)

        diff = declared_total - new_total
        new_error = abs(diff) / declared_total

        print(
            f"✅ Corrected '{day.get('title', 'Untitled')}' — "
            f"new total {new_total}s, error now {new_error*100:.1f}%"
        )

    if corrected:
        week["was_corrected"] = True

    return week









class QueryAI(APIView):
    """
    One-stop endpoint:
    - Generates weekly workout plan using Gemini
    - Validates + auto-corrects mismatched durations
    - Returns clean JSON ready for frontend
    """

    def post(self, request):
        catResponse = GetCategories()
        catResponse = catResponse.get(request).data
        categories = ""
        for category in catResponse:
            categories += category["text"] + ", "
        
        #print(categories)

        userContext = request.data.get("prompt") if isinstance(request.data, dict) else request.data

        if not userContext:
            return Response({"error": "Prompt is required."}, status=status.HTTP_400_BAD_REQUEST)

        # === Gemini Generation Context ===
        context = """
        Generate a JSON response in the following format only (no extra text):

            {
                "week_number": 0,
                "days": [
                    {
                    "day_number": 0,
                    "duration_seconds": 0,
                    "title": "",
                    "segments": [
                        {
                        "activity": "",
                        "duration_seconds": 0,
                        "sets": 0,
                        "segments": [
                            {
                            "exercise": "",
                            "duration_seconds": 0,
                            "notes": ""
                            }
                        ]
                        }
                    ],
                    "total_duration_seconds": 0,
                    "difficulty": "",
                    "goal": ""
                    }
                ]
            }

        Rules:
        - Output valid JSON only (no Markdown or text).
        - Each exercise should be 10 second divisiable (10, 20, 30...)
        - Each activity must include a warmup, primary, and cooldown.
        - for every Primary activity, limit the number of exercises to between 2 and 5, but use a normal distributionwith a mean of 3.5 with a std dev of 0.75.
        - Make warmups and cooldowns be 2-3 exercises
        - Warmup total duration must be between 60 and 150 seconds (inclusive).
        - Cooldown total duration must be between 60 and 150 seconds (inclusive).
        - Warmup and cooldown together may not exceed 300 seconds combined.
        - Notes describe form or modifications.
        - Rest periods must be logically placed.
        - Create workouts for all selected days.
        - Avoid repeating the same body part two days in a row.
        - total time per activity = duration_minutes * 60.
        - warmup and cooldowns should only include low intensity exercises, and no rest
        - Do not include any exercises that require equipment not included in the context.
        - Include rest periods in between longer periods of exercise (>60 seconds)
        - Use only these exercises:
        """

        updated_prompt = f"{context}\n\n{categories}\n\nUse This User Input:\n\n{userContext}"

        def timeout_handler(signum, frame):
            raise TimeoutError("Gemini request timed out")

        signal.signal(signal.SIGALRM, timeout_handler)
        signal.alarm(45)  # 45-second safeguard

        try:
            # === Step 1: Generate plan ===
            model = genai.GenerativeModel("gemini-2.0-flash-lite")
            result = model.generate_content(updated_prompt)
            signal.alarm(0)

            raw = result.text.strip() if result.text else ""
            cleaned = re.sub(r"```json|```", "", raw).strip()

            try:
                parsed = json.loads(cleaned)
            except json.JSONDecodeError:
                return Response({"error": "Invalid JSON from Gemini", "raw": cleaned}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

            # === Step 2: Validate + correct ===
            corrected = correct_workout_durations(parsed)

            # === Step 3: Return final result ===
            return Response(corrected, status=status.HTTP_200_OK)

        except TimeoutError:
            signal.alarm(0)
            traceback.print_exc()
            return Response({"error": "Gemini request timed out"}, status=status.HTTP_504_GATEWAY_TIMEOUT)
        except Exception as e:
            signal.alarm(0)
            traceback.print_exc()
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)



    
# LOGIC BUILDER PAGE










# VIDEO MANAGEMENT PAGE START

class GetVideos(APIView):
    permission_classes = [IsAuthenticated]
    serializer_class = VideoSearchSerializer
    
    @extend_schema(
        request=VideoSearchSerializer,
        responses={200: GetVideoWithCategoriesSerializer(many=True)},
        summary="Search videos",
        description="Search videos by title, duration, or category. At least one search parameter must be provided."
    )
    def post(self, request):
        # Validate the request data
        serializer = VideoSearchSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        
        # Get validated data
        title = serializer.validated_data.get('title', '').strip()
        duration = serializer.validated_data.get('duration', '').strip()
        category = serializer.validated_data.get('category', '').strip()
        
        # Build the query
        videos_query = Video.objects.all()
        
        # Apply category filter if provided
        if category:
            category_rows = Category.objects.filter(text__iregex=fr".*{category}.*")
            video_ids = VideoCategory.objects.filter(category__in=category_rows).values_list("video_id", flat=True).distinct()
            videos_query = videos_query.filter(id__in=video_ids)
        
        # Apply title filter if provided
        if title:
            videos_query = videos_query.filter(title__iregex=fr".*{title}.*")
        
        # Apply duration filter if provided
        if duration:
            videos_query = videos_query.filter(duration__iregex=fr".*{duration}.*")

        response_data = GetVideoWithCategoriesSerializer(videos_query, many=True).data
        return Response(response_data, status=status.HTTP_200_OK)
    

class DeleteVideo(APIView):
    permission_classes = [IsAuthenticated]
    def delete(self, request, id):
        try:
            video = Video.objects.get(id=id)
            video.delete()
            return Response({"message": "Successfully Deleted Video"}, status=status.HTTP_204_NO_CONTENT)
        except Video.DoesNotExist:
            return Response({"message": "Video not found"}, status=status.HTTP_404_NOT_FOUND)
    

class CreateVideo(APIView):
    permission_classes = [IsAuthenticated]
    serializer_class = CreateVideoSerializer
    
    @extend_schema(
        request=CreateVideoSerializer,
        responses={201: {"type": "object", "properties": {"id": {"type": "integer"}}}},
        summary="Create or update video",
        description="Creates a new video or updates an existing one with categories"
    )
    def post(self, request):
        serializedData = CreateVideoSerializer(data=request.data)
        if serializedData.is_valid():
            videoData = serializedData.validated_data
            if videoData["id"] != 0:
                videoID = self.modifyVideo(videoData)
                return Response({"id": videoID}, status=status.HTTP_201_CREATED)
            else:
                videoID = self.createVideo(videoData)
                return Response({"id": videoID}, status=status.HTTP_201_CREATED)
        return Response({ 
            "detail": "Failed to Create Video", 
            "errors": serializedData.errors 
        }, status=status.HTTP_400_BAD_REQUEST)

    def createVideo(self, videoData):
        video = Video.objects.create(
            title = videoData["title"],
            duration = videoData["duration"],
            description = videoData["description"],
            url = videoData.get("url", "")
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
            description = videoData["description"],
            url = videoData.get("url", "")
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
            "answers": ["Lose weight", "Build muscle", "Increase endurance", "Improve flexibility", "General health", "Recover From an Injury"]
        },
        {
            "text": "How many days per week do you wish to workout?",
            "type": "multichoice",
            "answers": ["1 day", "2 days", "3 days", "4 days", "5 days", "6 days", "7 days"]
        },
        {
            "text": "Do you have any physical limitations?",
            "type": "checkbox",
            "answers": ["Right Leg/Hip", "Left Leg/Hip", "Back Limitations", "Right Arm/Shoulder", "Left Arm/Shoulder", "None"]
        },
        {
            "text": "What equipment do you have access to?",
            "type": "checkbox",
            "answers": ["None","Dumbbells","Barbells", "Weight plates","Resistance bands","Pull-up bar","Kettlebell","Medicine ball","Stability ball (exercise ball)","Bench (flat or adjustable)","Squat rack / Power rack","Smith machine","Cable machine","Treadmill","Stationary bike","Elliptical","Rowing machine","Jump rope","Yoga mat","Foam roller","Step platform / Aerobic step","TRX suspension straps","Dip bars / Parallel bars","Ab wheel","Battle ropes","Plyometric box (jump box)","Punching bag","Resistance sled","Leg press machine","Lat pulldown machine","Chest press machine","Shoulder press machine","Stair climber / Stepper","Cable crossover machine","Pull-down attachment","Weighted vest","Gym rings","Glute band / Hip circle","Balance board / Bosu ball"]
        },
        {
            "text": "What types of workouts do you enjoy?",
            "type": "checkbox",
            "answers": ["Cardio", "Strength training", "Yoga", "Pilates", "HIIT", "Stretching", "Circuit"]
        },
        {
            "text": "How would you rate your current fitness level?",
            "type": "multichoice",
            "answers": ["Very low", "Low", "Moderate", "High", "Very high"]
        },
        {
            "text": "How much time would you like to spend per workout?",
            "type": "multichoice",
            "answers": ["15 minutes", "30 minutes", "45 minutes", "60 minutes"]
        },

    ]


    questionnaireData = [
        {"title": "Initial Questionnaire", "status": "Published", "started": 120, "completed": 95, "last_modified": timezone.now()},
        {"title": "Cardio Readiness Survey", "status": "Draft", "started": 80, "completed": 60, "last_modified": timezone.now()},
        {"title": "Strength Training Preferences", "status": "Draft", "started": 45, "completed": 30, "last_modified": timezone.now()},
        {"title": "Flexibility & Mobility Check", "status": "Draft", "started": 70, "completed": 55, "last_modified": timezone.now()},
    ]

    questionQuestionnaireMappings = [
        {"questionnaire_id": 1, "question_id": 1},
        {"questionnaire_id": 1, "question_id": 2},
        {"questionnaire_id": 1, "question_id": 3},
        {"questionnaire_id": 1, "question_id": 4},
        {"questionnaire_id": 1, "question_id": 5},
        {"questionnaire_id": 1, "question_id": 6},
        {"questionnaire_id": 1, "question_id": 7},
        {"questionnaire_id": 2, "question_id": 1},
        {"questionnaire_id": 2, "question_id": 2},
        {"questionnaire_id": 2, "question_id": 3},
        {"questionnaire_id": 2, "question_id": 4},
        {"questionnaire_id": 2, "question_id": 5},
        {"questionnaire_id": 2, "question_id": 6},
        {"questionnaire_id": 2, "question_id": 7},
        {"questionnaire_id": 3, "question_id": 1},
        {"questionnaire_id": 3, "question_id": 2},
        {"questionnaire_id": 3, "question_id": 3},
        {"questionnaire_id": 3, "question_id": 4},
        {"questionnaire_id": 3, "question_id": 5},
        {"questionnaire_id": 3, "question_id": 6},
        {"questionnaire_id": 3, "question_id": 7},
        {"questionnaire_id": 4, "question_id": 1},
        {"questionnaire_id": 4, "question_id": 2},
        {"questionnaire_id": 4, "question_id": 3},
        {"questionnaire_id": 4, "question_id": 4},
        {"questionnaire_id": 4, "question_id": 5},
        {"questionnaire_id": 4, "question_id": 6},
        {"questionnaire_id": 4, "question_id": 7},
    ]

    videoData = [
        {"title": "Push-Ups", "duration": "0:10", "description": "Quick demo of standard push-ups for upper body strength.", "url": "https://youtube.com/watch?v=example_pushups"},
        {"title": "Sit-Ups", "duration": "0:10", "description": "Basic sit-up form to strengthen your core.", "url": "https://youtube.com/watch?v=example_situps"},
        {"title": "Squats", "duration": "0:10", "description": "Bodyweight squats for legs and glutes.", "url": "https://youtube.com/watch?v=example_squats"},
        {"title": "Lunges", "duration": "0:10", "description": "Forward lunges to target quads and glutes.", "url": "https://youtube.com/watch?v=example_lunges"},
        {"title": "Jumping Jacks", "duration": "0:10", "description": "Cardio warm-up using full-body movement.", "url": "https://youtube.com/watch?v=example_jumpingjacks"},
        {"title": "Plank Hold", "duration": "0:10", "description": "Static plank to engage your core.", "url": "https://youtube.com/watch?v=example_plank"},
        {"title": "High Knees", "duration": "0:10", "description": "Cardio drill focusing on speed and coordination.", "url": "https://youtube.com/watch?v=example_highknees"},
        {"title": "Burpees", "duration": "0:10", "description": "Full-body explosive burpee for endurance.", "url": "https://youtube.com/watch?v=example_burpees"},
        {"title": "Mountain Climbers", "duration": "0:10", "description": "Dynamic core and cardio exercise.", "url": "https://youtube.com/watch?v=example_mountainclimbers"},
        {"title": "Bicycle Crunches", "duration": "0:10", "description": "Rotational ab exercise for obliques.", "url": "https://youtube.com/watch?v=example_bicyclecrunch"},
        {"title": "Tricep Dips", "duration": "0:10", "description": "Chair dips to target triceps.", "url": "https://youtube.com/watch?v=example_tricepdips"},
        {"title": "Jump Squats", "duration": "0:10", "description": "Explosive squat variation for power.", "url": "https://youtube.com/watch?v=example_jumpsquats"},
        {"title": "Glute Bridge", "duration": "0:10", "description": "Glute activation exercise for posterior chain.", "url": "https://youtube.com/watch?v=example_glutebridge"},
        {"title": "Side Plank", "duration": "0:10", "description": "Stabilize and strengthen obliques.", "url": "https://youtube.com/watch?v=example_sideplank"},
        {"title": "Calf Raises", "duration": "0:10", "description": "Strengthen calves through controlled lifts.", "url": "https://youtube.com/watch?v=example_calfraises"},
        {"title": "Superman Hold", "duration": "0:10", "description": "Lower back strengthening isometric move.", "url": "https://youtube.com/watch?v=example_superman"},
        {"title": "Leg Raises", "duration": "0:10", "description": "Ab exercise targeting lower core.", "url": "https://youtube.com/watch?v=example_legraises"},
        {"title": "Side Lunges", "duration": "0:10", "description": "Targets adductors and glutes with lateral movement.", "url": "https://youtube.com/watch?v=example_sidelunge"},
        {"title": "Flutter Kicks", "duration": "0:10", "description": "Alternating leg movement for abs and hip flexors.", "url": "https://youtube.com/watch?v=example_flutterkicks"},
        {"title": "Jump Rope", "duration": "0:10", "description": "Classic cardio movement for rhythm and stamina.", "url": "https://youtube.com/watch?v=example_jumprope"},
        {"title": "Shadow Boxing", "duration": "0:10", "description": "Cardio and coordination drill using punches.", "url": "https://youtube.com/watch?v=example_shadowboxing"},
        {"title": "Bear Crawl", "duration": "0:10", "description": "Full-body crawl for strength and mobility.", "url": "https://youtube.com/watch?v=example_bearcrawl"},
        {"title": "Inchworm Stretch", "duration": "0:10", "description": "Dynamic warm-up stretching posterior chain.", "url": "https://youtube.com/watch?v=example_inchworm"},
        {"title": "Arm Circles", "duration": "0:10", "description": "Shoulder mobility exercise.", "url": "https://youtube.com/watch?v=example_armcircles"},
        {"title": "Hip Flexor Stretch", "duration": "0:10", "description": "Mobility exercise for tight hip flexors.", "url": "https://youtube.com/watch?v=example_hipflexor"},
        {"title": "Cat-Cow Stretch", "duration": "0:10", "description": "Spinal mobility stretch sequence.", "url": "https://youtube.com/watch?v=example_catcow"},
        {"title": "Downward Dog", "duration": "0:10", "description": "Yoga pose for hamstrings and shoulders.", "url": "https://youtube.com/watch?v=example_downwarddog"},
        {"title": "Cobra Stretch", "duration": "0:10", "description": "Lower back extension yoga posture.", "url": "https://youtube.com/watch?v=example_cobrastretch"},
        {"title": "Shoulder Tap Plank", "duration": "0:10", "description": "Core and stability move with shoulder taps.", "url": "https://youtube.com/watch?v=example_shouldertap"},
        {"title": "Skater Jumps", "duration": "0:10", "description": "Plyometric side-to-side jumps for balance.", "url": "https://youtube.com/watch?v=example_skaterjumps"},
        {"title": "Reverse Lunges", "duration": "0:10", "description": "Lunge variation to reduce knee strain.", "url": "https://youtube.com/watch?v=example_reverselunge"},
        {"title": "Punch Combo Drill", "duration": "0:10", "description": "Cardio boxing combo for speed.", "url": "https://youtube.com/watch?v=example_punchcombo"},
        {"title": "Wall Sit", "duration": "0:10", "description": "Static lower body hold for endurance.", "url": "https://youtube.com/watch?v=example_wallsit"},
        {"title": "Heel Taps", "duration": "0:10", "description": "Core exercise focusing on obliques.", "url": "https://youtube.com/watch?v=example_heeltaps"},
        {"title": "Step-Ups", "duration": "0:10", "description": "Leg strengthening exercise using a platform.", "url": "https://youtube.com/watch?v=example_stepups"},
        {"title": "Jump Lunges", "duration": "0:10", "description": "Explosive plyometric lunge movement.", "url": "https://youtube.com/watch?v=example_jumplunges"},
        {"title": "Arm Raises", "duration": "0:10", "description": "Front and lateral arm raises for shoulders.", "url": "https://youtube.com/watch?v=example_armraises"},
        {"title": "Bicep Curls", "duration": "0:10", "description": "Classic upper-arm dumbbell curl.", "url": "https://youtube.com/watch?v=example_bicepcurl"},
        {"title": "Tricep Kickbacks", "duration": "0:10", "description": "Isolation exercise for triceps.", "url": "https://youtube.com/watch?v=example_tricepkickback"},
        {"title": "Bent-Over Rows", "duration": "0:10", "description": "Back-focused pull exercise.", "url": "https://youtube.com/watch?v=example_bentoverrow"},
        {"title": "Shoulder Press", "duration": "0:10", "description": "Overhead press for deltoids.", "url": "https://youtube.com/watch?v=example_shoulderpress"},
        {"title": "Chest Press", "duration": "0:10", "description": "Chest strengthening movement.", "url": "https://youtube.com/watch?v=example_chestpress"},
        {"title": "Deadlifts", "duration": "0:10", "description": "Full-body lift focusing on posterior chain.", "url": "https://youtube.com/watch?v=example_deadlift"},
        {"title": "Side Kicks", "duration": "0:10", "description": "Martial arts-inspired lower body move.", "url": "https://youtube.com/watch?v=example_sidekick"},
        {"title": "Front Kicks", "duration": "0:10", "description": "Kick forward for balance and flexibility.", "url": "https://youtube.com/watch?v=example_frontkick"},
        {"title": "Jump Twists", "duration": "0:10", "description": "Core and cardio exercise with rotational jump.", "url": "https://youtube.com/watch?v=example_jumptwist"},
        {"title": "Torso Rotations", "duration": "0:10", "description": "Core twisting movement for flexibility.", "url": "https://youtube.com/watch?v=example_torsorotation"},
        {"title": "Bridge March", "duration": "0:10", "description": "Glute bridge with alternating leg lifts.", "url": "https://youtube.com/watch?v=example_bridgemarch"},
        {"title": "Lateral Bounds", "duration": "0:10", "description": "Side-to-side bounding for agility.", "url": "https://youtube.com/watch?v=example_lateralbounds"},
        {"title": "Side Leg Raises", "duration": "0:10", "description": "Hip abductor isolation exercise.", "url": "https://youtube.com/watch?v=example_sidelegraise"}
    ]

    categoryData = [
        { "text": "Push-Ups" },
        { "text": "Sit-Ups" },
        { "text": "Squats" },
        { "text": "Lunges" },
        { "text": "Jumping Jacks" },
        { "text": "Plank" },
        { "text": "High Knees" },
        { "text": "Burpees" },
        { "text": "Mountain Climbers" },
        { "text": "Bicycle Crunches" },
        { "text": "Tricep Dips" },
        { "text": "Jump Squats" },
        { "text": "Glute Bridge" },
        { "text": "Side Plank" },
        { "text": "Calf Raises" },
        { "text": "Superman Hold" },
        { "text": "Leg Raises" },
        { "text": "Side Lunges" },
        { "text": "Flutter Kicks" },
        { "text": "Jump Rope" },
        { "text": "Shadow Boxing" },
        { "text": "Bear Crawl" },
        { "text": "Inchworm Stretch" },
        { "text": "Arm Circles" },
        { "text": "Hip Flexor Stretch" },
        { "text": "Cat-Cow Stretch" },
        { "text": "Downward Dog" },
        { "text": "Cobra Stretch" },
        { "text": "Shoulder Tap Plank" },
        { "text": "Skater Jumps" },
        { "text": "Reverse Lunges" },
        { "text": "Wall Sit" },
        { "text": "Step-Ups" },
        { "text": "Jump Lunges" },
        { "text": "Bicep Curls" },
        { "text": "Tricep Kickbacks" },
        { "text": "Bent-Over Rows" },
        { "text": "Shoulder Press" },
        { "text": "Deadlifts" },
        { "text": "Side Kicks" },
        { "text": "Front Kicks" },
        { "text": "Butt Kicks" },
        { "text": "Arm Raises" },
        { "text": "Neck Stretch" },
        { "text": "Hamstring Stretch" },
        { "text": "Seated Twist" },
        { "text": "Bridge Hold" },
        { "text": "Heel Touches" },
        { "text": "Standing Crunches" },
        { "text": "Lateral Bounds" },
        { "text": "Single-Leg Deadlift" }
    ]

    videoCategoryMapping = [
        { "video_id": 1,  "category_id": 1 },
        { "video_id": 2,  "category_id": 2 },
        { "video_id": 3,  "category_id": 3 },
        { "video_id": 4,  "category_id": 4 },
        { "video_id": 5,  "category_id": 5 },
        { "video_id": 6,  "category_id": 6 },
        { "video_id": 7,  "category_id": 7 },
        { "video_id": 8,  "category_id": 8 },
        { "video_id": 9,  "category_id": 9 },
        { "video_id": 10, "category_id": 10 },
        { "video_id": 11, "category_id": 11 },
        { "video_id": 12, "category_id": 12 },
        { "video_id": 13, "category_id": 13 },
        { "video_id": 14, "category_id": 14 },
        { "video_id": 15, "category_id": 15 },
        { "video_id": 16, "category_id": 16 },
        { "video_id": 17, "category_id": 17 },
        { "video_id": 18, "category_id": 18 },
        { "video_id": 19, "category_id": 19 },
        { "video_id": 20, "category_id": 20 },
        { "video_id": 21, "category_id": 21 },
        { "video_id": 22, "category_id": 22 },
        { "video_id": 23, "category_id": 23 },
        { "video_id": 24, "category_id": 24 },
        { "video_id": 25, "category_id": 25 },
        { "video_id": 26, "category_id": 26 },
        { "video_id": 27, "category_id": 27 },
        { "video_id": 28, "category_id": 28 },
        { "video_id": 29, "category_id": 29 },
        { "video_id": 30, "category_id": 30 },
        { "video_id": 31, "category_id": 31 },
        { "video_id": 32, "category_id": 32 },
        { "video_id": 33, "category_id": 33 },
        { "video_id": 34, "category_id": 34 },
        { "video_id": 35, "category_id": 35 },
        { "video_id": 36, "category_id": 36 },
        { "video_id": 37, "category_id": 37 },
        { "video_id": 38, "category_id": 38 },
        { "video_id": 39, "category_id": 39 },
        { "video_id": 40, "category_id": 40 },
        { "video_id": 41, "category_id": 41 },
        { "video_id": 42, "category_id": 42 },
        { "video_id": 43, "category_id": 43 },
        { "video_id": 44, "category_id": 44 },
        { "video_id": 45, "category_id": 45 },
        { "video_id": 46, "category_id": 46 },
        { "video_id": 47, "category_id": 47 },
        { "video_id": 48, "category_id": 48 },
        { "video_id": 49, "category_id": 49 },
        { "video_id": 50, "category_id": 50 }
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

    # Sample API Keys for development
    apiKeyData = [
        {"name": "Development API Key", "is_active": True},
        {"name": "Testing API Key", "is_active": True},
        {"name": "Demo API Key", "is_active": False},
    ]

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

class ResetDatabaseData(APIView):
    """
    Reset database by clearing all data and resetting auto-increment counters
    """
    def post(self, request):
        with transaction.atomic():
            try:
                # Delete all data
                AnswerCategoryMapping.objects.all().delete()
                QuestionnaireQuestion.objects.all().delete()
                Answer.objects.all().delete()
                Question.objects.all().delete()
                Questionnaire.objects.all().delete()
                VideoCategory.objects.all().delete()
                Category.objects.all().delete()
                Video.objects.all().delete()
                APIKey.objects.all().delete()

                # Reset auto-increment counters
                with connection.cursor() as cursor:
                    cursor.execute("ALTER TABLE questionnaire_builder_answercategorymapping AUTO_INCREMENT = 1;")   
                    cursor.execute("ALTER TABLE questionnaire_builder_questionnairequestion AUTO_INCREMENT = 1;")  
                    cursor.execute("ALTER TABLE questionnaire_builder_answer AUTO_INCREMENT = 1;")         
                    cursor.execute("ALTER TABLE questionnaire_builder_question AUTO_INCREMENT = 1;")    
                    cursor.execute("ALTER TABLE questionnaire_builder_questionnaire AUTO_INCREMENT = 1;")
                    cursor.execute("ALTER TABLE questionnaire_builder_videocategory AUTO_INCREMENT = 1;")
                    cursor.execute("ALTER TABLE questionnaire_builder_category AUTO_INCREMENT = 1;")
                    cursor.execute("ALTER TABLE questionnaire_builder_video AUTO_INCREMENT = 1;")
                    cursor.execute("ALTER TABLE questionnaire_builder_apikey AUTO_INCREMENT = 1;")

                return Response({ "message": "Database reset successfully" }, status=status.HTTP_200_OK)
            
            except Exception as e:
                traceback.print_exc()
                return Response({ "error": str(e) }, status=status.HTTP_400_BAD_REQUEST)


class SeedDatabaseData(APIView):
    """
    Seed database with sample data. Throws error if database is not empty.
    """
    def post(self, request):
        with transaction.atomic():
            try:
                # Check if database is empty
                if (AnswerCategoryMapping.objects.exists() or 
                    QuestionnaireQuestion.objects.exists() or 
                    Answer.objects.exists() or 
                    Question.objects.exists() or 
                    Questionnaire.objects.exists() or 
                    VideoCategory.objects.exists() or 
                    Category.objects.exists() or 
                    Video.objects.exists() or
                    APIKey.objects.exists()):
                    return Response({ 
                        "error": "Database is not empty. Please reset the database first before seeding." 
                    }, status=status.HTTP_400_BAD_REQUEST)

                # Create questions and answers
                for question in DataStorage.questionData:
                    questionRow = Question.objects.create(text=question["text"], type=question["type"])
                    for answer in question["answers"]:
                        Answer.objects.create(
                            question = questionRow, 
                            text = answer
                        )

                # Create questionnaires
                for questionnaire in DataStorage.questionnaireData:
                    Questionnaire.objects.create(
                        title = questionnaire["title"],
                        status = questionnaire["status"],
                        started = questionnaire["started"],
                        completed = questionnaire["completed"],
                        last_modified = questionnaire["last_modified"]
                    )

                # Create question-questionnaire mappings
                for questionMapping in DataStorage.questionQuestionnaireMappings:
                    questionnaire = Questionnaire.objects.get(id=questionMapping["questionnaire_id"])
                    question = Question.objects.get(id=questionMapping["question_id"])
                    QuestionnaireQuestion.objects.create(
                        questionnaire = questionnaire,
                        question = question
                    )

                # Create videos
                for video in DataStorage.videoData:
                    Video.objects.create(**video)

                # Create categories
                for category in DataStorage.categoryData:
                    Category.objects.create(**category)

                # Create video-category mappings
                for categoryMapping in DataStorage.videoCategoryMapping:
                    video = Video.objects.get(id = categoryMapping["video_id"])
                    category = Category.objects.get(id = categoryMapping["category_id"])
                    VideoCategory.objects.create(
                        video = video,
                        category = category
                    )

                # Create answer-category mappings
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

                # Create API keys
                for apiKey in DataStorage.apiKeyData:
                    APIKey.objects.create(
                        name = apiKey["name"],
                        is_active = apiKey["is_active"]
                    )

                return Response({ "message": "Database seeded successfully" }, status=status.HTTP_200_OK)
            
            except Exception as e:
                traceback.print_exc()
                return Response({ "error": str(e) }, status=status.HTTP_400_BAD_REQUEST)
        