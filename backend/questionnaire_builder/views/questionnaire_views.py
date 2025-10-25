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

        if data["type"] in ["checkbox", "multichoice"]:
            for answer_data in data.get("answers", []):
                Answer.objects.create(
                    question=question,
                    text=answer_data.get("text", "")
                )

        return question
    
    def modifyQuestion(self, newData, oldQuestion):
        
        oldQuestion.text=newData["text"]
        oldQuestion.type=newData["type"]
        oldQuestion.save()

        # Delete old answers for checkbox/multichoice
        if oldQuestion.type in ["checkbox", "multichoice"]:
            oldQuestion.answer_set.all().delete()
            for answerData in newData.get("answers", []):
                Answer.objects.create(
                    question=oldQuestion,
                    text=answerData.get("text", "")
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


from itertools import chain
from django.db.models import Q, Count
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from drf_spectacular.utils import extend_schema

from ..models import Video, AnswerCategoryMapping
from ..serializers import GetVideosForPreviewSerializer, VideoResponseSerializer
from math import ceil

class getVideosForPreview(APIView):
    serializer_class = GetVideosForPreviewSerializer

    @extend_schema(
        request=GetVideosForPreviewSerializer,
        responses={200: VideoResponseSerializer(many=True)},
        summary="Get videos for questionnaire preview",
        description="Returns ranked videos based on questionnaire answers and category mappings"
    )
    def post(self, request):

        questionnaire_id = request.data.get("questionnaire_id")
        raw_answer_ids = request.data.get("answer_ids", [])

        if not raw_answer_ids:
            return Response({"error": "No answer IDs provided."}, status=status.HTTP_400_BAD_REQUEST)

        # Flatten nested lists safely (handles [[1,2],[3,4]] and [1,2,3])
        answer_ids = list(
            set(
                chain.from_iterable(
                    a if isinstance(a, (list, tuple)) else [a]
                    for a in raw_answer_ids
                )
            )
        )

        if not answer_ids:
            return Response({"error": "No valid answer IDs found."}, status=status.HTTP_400_BAD_REQUEST)

        # Query all matching AnswerCategoryMappings
        answerCategoryRows = AnswerCategoryMapping.objects.filter(
            questionnaire_id=questionnaire_id,
            answer_id__in=answer_ids
        )

        includedCategoryIDs = list(
            answerCategoryRows.filter(inclusive=True).values_list("category_id", flat=True)
        )

        # Get ranked videos
        rankedVideos = (
            Video.objects
            .filter(videocategory__category_id__in=includedCategoryIDs)
            .annotate(
                count=Count(
                    "videocategory__category_id",
                    filter=Q(videocategory__category_id__in=includedCategoryIDs),
                    distinct=True,
                )
            )
            .order_by("-count")
        )

        # Build clean response
        # responseData = [
        #     {
        #         "id": v.id,
        #         "title": v.title,
        #         "duration": v.duration,
        #         "description": v.description,
        #         "url": v.url,
        #         "count": getattr(v, "count", 0),
        #     }
        #     for v in rankedVideos
        # ]
        # responseData = []
        # for video in rankedVideos:
        #     # Add duration parsing logic for testing
        #     total_seconds = self.parse_duration_to_seconds(video.duration)
        #     segments_needed = self.calculate_segments_needed(total_seconds)
            
        #     responseData.append({
        #         "id": video.id,
        #         "title": video.title,
        #         "duration": video.duration,
        #         "description": video.description,
        #         "url": video.url,
        #         "count": getattr(video, "count", 0),
        #         # NEW 
        #         "total_seconds": total_seconds,
        #         "segments_needed": segments_needed,
        #         "is_sequence": segments_needed > 1
        #     })
        #responseData = self.generate_video_sequences(rankedVideos)

        # responseData = []
        # for video in rankedVideos:
        #     total_seconds = self.parse_duration_to_seconds(video.duration)
        #     segments_needed = self.calculate_segments_needed(total_seconds)
            
        #     # Create multiple segments for the video
        #     for segment_num in range(segments_needed):
        #         # Calculate segment duration (10s or remainder for last segment)
        #         segment_duration = 10
        #         if segment_num == segments_needed - 1:  # Last segment
        #             remaining_seconds = total_seconds % 10
        #             if remaining_seconds > 0:
        #                 segment_duration = remaining_seconds
                
        #         responseData.append({
        #             "id": f"{video.id}-{segment_num + 1}",  # Unique segment ID
        #             "title": video.title,
        #             "duration": str(segment_duration),
        #             "description": video.description,
        #             "url": video.url,  
        #             "segment_number": segment_num + 1,
        #             "total_segments": segments_needed,
        #             "original_video_id": video.id,
        #             "exercise_type": video.title  # Category is basically the title
        #         })
        # NEW: Build workout sequence using skeleton approach
        workout_skeleton = self.get_workout_skeleton(answer_ids)
        available_videos = list(rankedVideos)  # Convert to list for easier manipulation

        responseData = []
        current_segment = 1

        for slot in workout_skeleton['structure']:
            if slot['type'] == 'exercise':
                # Select appropriate exercise for this slot
                exercise_video = self.select_exercise_for_slot(slot, available_videos)
                if exercise_video:
                    responseData.append({
                        "id": f"workout-{current_segment}",
                        "title": exercise_video.title,
                        "duration": str(slot['duration']),
                        "description": exercise_video.description,
                        "url": exercise_video.url,
                        "segment_number": current_segment,
                        "total_segments": len(workout_skeleton['structure']),
                        "workout_type": workout_skeleton['name'],
                        "slot_type": slot['type'],
                        "exercise_type": slot['exercise_type'],
                        "is_workout_segment": True
                    })
                    # Remove used video to avoid duplicates (optional)
                    if exercise_video in available_videos:
                        available_videos.remove(exercise_video)
            else:
                # Warmup, cooldown, or rest slot
                slot_title = f"{slot['type'].title()} Segment"
                slot_description = f"{slot['type'].title()} for {slot['duration']} seconds"
                
                # For rest periods, no video URL
                slot_url = None
                if slot['type'] in ['warmup', 'cooldown']:
                    # You could add specific warmup/cooldown videos here later
                    slot_description = f"{slot['type'].title()} exercises for {slot['duration']} seconds"
                
                responseData.append({
                    "id": f"workout-{current_segment}",
                    "title": slot_title,
                    "duration": str(slot['duration']),
                    "description": slot_description,
                    "url": slot_url,
                    "segment_number": current_segment,
                    "total_segments": len(workout_skeleton['structure']),
                    "workout_type": workout_skeleton['name'],
                    "slot_type": slot['type'],
                    "exercise_type": slot['exercise_type'],
                    "is_workout_segment": True
                })
            
            current_segment += 1

        # Add workout metadata as the first item
        responseData.insert(0, {
            "id": "workout-metadata",
            "workout_metadata": {
                "workout_type": workout_skeleton['name'],
                "total_duration": workout_skeleton['total_duration'],
                "segment_count": len(workout_skeleton['structure']),
            },
            "is_metadata": True
        })
        # except Exception as e:
        #     # Fallback to original behavior if skeleton approach fails
        #     print(f"Workout skeleton error: {e}")
        #     responseData = []
        #     for video in rankedVideos:
        #         responseData.append({
        #             "id": video.id,
        #             "title": video.title,
        #             "duration": video.duration,
        #             "description": video.description,
        #             "url": video.url,
        #             "count": getattr(video, "count", 0)
        #         })
        return Response(responseData, status=status.HTTP_200_OK)
    def get_workout_skeleton(self, answer_ids):
        """
        Determine workout type based on user answers and select appropriate skeleton
        """
        WORKOUT_SKELETONS = {
            'hiit': {
                'name': 'HIIT Workout',
                'structure': [
                    {'type': 'warmup', 'duration': 30, 'exercise_type': 'warmup'},
                    {'type': 'exercise', 'duration': 45, 'exercise_type': 'cardio'},
                    {'type': 'rest', 'duration': 15, 'exercise_type': 'rest'},
                    {'type': 'exercise', 'duration': 45, 'exercise_type': 'strength'},
                    {'type': 'rest', 'duration': 15, 'exercise_type': 'rest'},
                    {'type': 'exercise', 'duration': 45, 'exercise_type': 'cardio'},
                    {'type': 'cooldown', 'duration': 30, 'exercise_type': 'cooldown'}
                ],
                'total_duration': 225
            },
            'strength': {
                'name': 'Strength Training',
                'structure': [
                    {'type': 'warmup', 'duration': 30, 'exercise_type': 'warmup'},
                    {'type': 'exercise', 'duration': 60, 'exercise_type': 'strength'},
                    {'type': 'exercise', 'duration': 60, 'exercise_type': 'strength'},
                    {'type': 'exercise', 'duration': 60, 'exercise_type': 'strength'},
                    {'type': 'cooldown', 'duration': 30, 'exercise_type': 'cooldown'}
                ],
                'total_duration': 240
            },
            'cardio': {
                'name': 'Cardio Session',
                'structure': [
                    {'type': 'warmup', 'duration': 30, 'exercise_type': 'warmup'},
                    {'type': 'exercise', 'duration': 60, 'exercise_type': 'cardio'},
                    {'type': 'exercise', 'duration': 60, 'exercise_type': 'cardio'},
                    {'type': 'cooldown', 'duration': 30, 'exercise_type': 'cooldown'}
                ],
                'total_duration': 180
            }
        }
        
        # Get answer texts to analyze preferences
        from ..models import Answer
        answers = Answer.objects.filter(id__in=answer_ids)
        answer_texts = [answer.text.lower() for answer in answers]
        all_answers_text = ' '.join(answer_texts)
        
        # Determine workout type based on answer keywords
        if any(keyword in all_answers_text for keyword in ['hiit', 'high intensity', 'interval', 'burpee', 'jump']):
            return WORKOUT_SKELETONS['hiit']
        elif any(keyword in all_answers_text for keyword in ['strength', 'weight', 'muscle', 'lift', 'push', 'pull', 'squat']):
            return WORKOUT_SKELETONS['strength']
        elif any(keyword in all_answers_text for keyword in ['cardio', 'endurance', 'running', 'aerobic', 'jog']):
            return WORKOUT_SKELETONS['cardio']
        else:
            # Default to HIIT if no clear preference
            return WORKOUT_SKELETONS['hiit']

    def select_exercise_for_slot(self, slot, available_videos):
        """
        Select an appropriate exercise for a workout slot
        """
        try:
            if not available_videos:
                return None
                
            slot_duration = slot.get('duration', 45)
            exercise_type = slot.get('exercise_type', 'cardio')
            
            print(f"Slot: {exercise_type}, needs {slot_duration}s, available: {len(available_videos)} videos")
            
            # Filter by exercise type if possible
            suitable_videos = [v for v in available_videos if self.video_matches_type(v, exercise_type)]
            
            # If no type matches, use all available videos
            if not suitable_videos:
                suitable_videos = available_videos
                print(f"No {exercise_type} matches, using all available videos")
            
            # Just use the first suitable video
            # Since all videos are 10s, the frontend will need to handle repeating them
            selected_video = suitable_videos[0]
            print(f"Selected: {selected_video.title} for {slot_duration}s slot")
            
            return selected_video
            
        except Exception as e:
            print(f"Error in select_exercise_for_slot: {e}")
            return available_videos[0] if available_videos else None

    def video_matches_type(self, video, exercise_type):
        """
        Determine if a video matches the required exercise type
        """
        try:
            title = video.title.lower()
            
            # Simple keyword matching
            if exercise_type == 'cardio':
                cardio_keywords = ['jump', 'jack', 'burpee', 'knee', 'skip', 'kick', 'climber', 'shadow', 'rope', 'high', 'run', 'jog']
                return any(keyword in title for keyword in cardio_keywords)
            elif exercise_type == 'strength':
                strength_keywords = ['push', 'pull', 'squat', 'sit-up', 'lunge', 'dip', 'plank', 'bridge', 'raise', 'curl', 'press', 'up']
                return any(keyword in title for keyword in strength_keywords)
            else:
                # For warmup/cooldown/rest, any video is fine (though we shouldn't get here for these)
                return True
                
        except Exception as e:
            print(f"Error in video_matches_type: {e}")
            return True  # Default to True if there's an error

    def parse_duration_to_seconds(self, duration_str):
        """
        Convert duration string to total seconds for testing
        """
        try:
            # If it's just a number, assume seconds
            if duration_str.isdigit():
                return int(duration_str)
            
            # Handle "45s" format
            if duration_str.endswith('s') and duration_str[:-1].isdigit():
                return int(duration_str[:-1])
            
            # Handle "1:30" format (minutes:seconds)
            if ':' in duration_str:
                parts = duration_str.split(':')
                if len(parts) == 2:
                    return int(parts[0]) * 60 + int(parts[1])
            
            # Default fallback
            return 30  
        except:
            return 30  

    def calculate_segments_needed(self, total_seconds):
        """Calculate how many 10-second segments are needed"""
        from math import ceil
        return ceil(total_seconds / 10)
