import traceback
from rest_framework import status
from rest_framework.views import APIView
from rest_framework.response import Response
from ..models import Answer, AnswerCategoryMapping, Category, Question, Questionnaire, QuestionnaireQuestion, Video, VideoCategory, APIKey
from django.db import connection, transaction
import traceback
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status



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

