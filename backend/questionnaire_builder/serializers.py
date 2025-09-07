from rest_framework import serializers
from .models import Answer, AnswerCategoryMapping, Category, Question, Questionnaire, QuestionnaireQuestion, Video, APIKey

# QUESTIONNAIRE BUILDER PAGE
# class CreateQuestionAnswerSerializer(serializers.ModelSerializer):
#     class Meta:
#         model = Answer
#         fields = ('value', 'order', 'input')

# class CreateQuestionSerializer(serializers.ModelSerializer):
#     answers = CreateQuestionAnswerSerializer(many=True)

#     class Meta:
#         model = Question
#         fields = ('value', 'order', 'answers')

#     def create(self, validated_data):
#         answers_data = validated_data.pop('answers')
#         question = Question.objects.create(**validated_data)
#         for answer_data in answers_data:
#             Answer.objects.create(question=question, **answer_data)
#         return question

# class CreateQuestionnaireSerializer(serializers.ModelSerializer):
#     questions = CreateQuestionSerializer(many=True)

#     class Meta:
#         model = Questionnaire
#         fields = ('name', 'status', 'questions')

#     def create(self, validated_data):
#         questions_data = validated_data.pop('questions')
#         questionnaire = Questionnaire.objects.create(**validated_data)
#         for question_data in questions_data:
#             answers_data = question_data.pop('answers')
#             question = Question.objects.create(questionnaire=questionnaire, **question_data)
#             for answer_data in answers_data:
#                 Answer.objects.create(question=question, **answer_data)
#         return questionnaire

class QuestionnaireSerializer(serializers.ModelSerializer):
    questions = serializers.SerializerMethodField()

    class Meta:
        model = Questionnaire
        fields = ('id', 'title', 'status', 'completed', 'started', 'last_modified', 'questions')

    def get_questions(self, questionnaire):
        matchedRows = QuestionnaireQuestion.objects.filter(questionnaire=questionnaire)
        questions = [row.question for row in matchedRows]
        return QuestionSerializer(questions, many=True).data

class QuestionSerializer(serializers.ModelSerializer):
    answers = serializers.SerializerMethodField()

    class Meta:
        model = Question
        fields = ('id', 'text', 'type', 'answers')

    def get_answers(self, question):
        answers = Answer.objects.filter(question=question)
        return AnswerSerializer(answers, many=True).data

class AnswerSerializer(serializers.ModelSerializer):
    
    class Meta:
        model = Answer
        fields = ('id', 'text')

class answerFilterSerializer(serializers.Serializer):
    include_ids = serializers.ListField(
        child=serializers.IntegerField(), required=False
    )
    exclude_ids = serializers.ListField(
        child=serializers.IntegerField(), required=False
    )

# QUESTIONNAIRE BUILDER PAGE

# Removed duplicate VideoSerializer - using the one below with categories


# LOGIC BUILDER PAGE
class QuestionnaireForLogicPageSerializer(serializers.ModelSerializer):
    
    class Meta:
        model = Questionnaire
        fields = ('id', 'title')

class QuestionWithAnswersAndCategoriesSerializer(serializers.ModelSerializer):
    answers = serializers.SerializerMethodField()

    class Meta:
        model = Question
        fields = ('id', 'text', 'answers')

    def get_answers(self, question):
        # Query DB for rows matching the question
        questionnaire_id = self.context.get("questionnaire_id")
        answers = Answer.objects.filter(question=question)
        return AnswerWithCategorySerializer(answers, many=True, context={ "questionnaire_id": questionnaire_id }).data
    

class AnswerWithCategorySerializer(serializers.ModelSerializer):
    categories = serializers.SerializerMethodField()
    
    class Meta:
        model = Answer
        fields = ('id', 'text', 'categories')

    def get_categories(self, answer):
        questionnaire_id = self.context.get("questionnaire_id")
        mappings = AnswerCategoryMapping.objects.filter(questionnaire_id=questionnaire_id, answer=answer)
        return CategoriesForAnswerSerializer(mappings, many=True).data
    
class CategoriesForAnswerSerializer(serializers.ModelSerializer):
    id = serializers.IntegerField(source='category.id')
    text = serializers.CharField(source='category.text') 
    inclusive = serializers.BooleanField()

    class Meta:
        model = AnswerCategoryMapping
        fields = ('id', 'text', 'inclusive')

class CategorySerializer(serializers.ModelSerializer):

    class Meta:
        model = Category
        fields = ('id', 'text')


class AnswerCategoryMappingSerializer(serializers.ModelSerializer):
    questionnaire_id = serializers.PrimaryKeyRelatedField(
        queryset=Questionnaire.objects.all(),
        source='questionnaire'
    )
    answer_id = serializers.PrimaryKeyRelatedField(
        queryset=Answer.objects.all(),
        source='answer'
    )
    category_id = serializers.PrimaryKeyRelatedField(
        queryset=Category.objects.all(),
        source='category'
    )

    class Meta:
        model = AnswerCategoryMapping
        fields = ('id', 'questionnaire_id', 'answer_id', 'category_id', 'inclusive')
# LOGIC BUILDER PAGE


# Video MANAGEMENT PAGE START

class GetVideoWithCategoriesSerializer(serializers.ModelSerializer):
    categories = serializers.SerializerMethodField()

    class Meta:
        model = Video
        fields = ('id', 'title', 'duration', 'description', 'categories')

    def get_categories(self, video):
        videoCategories = video.videocategory_set.select_related("category").all()
        categories = [row.category for row in videoCategories]
        return CategorySerializer(categories, many=True).data

class VideoSerializer(serializers.ModelSerializer):
    categories = CategorySerializer(many=True)
    class Meta:
        model = Video
        fields = ('id', 'title', 'duration', 'description', 'categories')

# API Key Management Serializers
class APIKeySerializer(serializers.ModelSerializer):
    class Meta:
        model = APIKey
        fields = ('id', 'name', 'key', 'is_active', 'created_at', 'last_used')

class CreateAPIKeySerializer(serializers.ModelSerializer):
    class Meta:
        model = APIKey
        fields = ('name',)

class APIKeyResponseSerializer(serializers.ModelSerializer):
    class Meta:
        model = APIKey
        fields = ('id', 'name', 'key', 'is_active', 'created_at', 'last_used')

class APIKeyStatusSerializer(serializers.ModelSerializer):
    class Meta:
        model = APIKey
        fields = ('id', 'is_active')

# Public API Serializers
class AnswerChoiceSerializer(serializers.ModelSerializer):
    class Meta:
        model = Answer
        fields = ('id', 'text')

class PublicQuestionSerializer(serializers.ModelSerializer):
    answer_choices = serializers.SerializerMethodField()
    
    class Meta:
        model = Question
        fields = ('id', 'text', 'type', 'answer_choices')
    
    def get_answer_choices(self, question):
        answers = Answer.objects.filter(question=question)
        return AnswerChoiceSerializer(answers, many=True).data

class PublicQuestionnaireSerializer(serializers.ModelSerializer):
    questions = serializers.SerializerMethodField()

    class Meta:
        model = Questionnaire
        fields = ('title', 'questions')

    def get_questions(self, questionnaire):
        questionnaire_questions = QuestionnaireQuestion.objects.filter(questionnaire=questionnaire)
        questions = [qq.question for qq in questionnaire_questions]
        return PublicQuestionSerializer(questions, many=True).data

# Get Videos for Preview Serializer
class GetVideosForPreviewSerializer(serializers.Serializer):
    questionnaire_id = serializers.IntegerField()
    answer_ids = serializers.ListField(child=serializers.IntegerField())

# Video Response Serializer for getVideosForPreview
class VideoResponseSerializer(serializers.Serializer):
    id = serializers.IntegerField()
    title = serializers.CharField()
    duration = serializers.CharField()
    description = serializers.CharField()
    count = serializers.IntegerField()

# Create Video Request Serializer
class CreateVideoSerializer(serializers.Serializer):
    id = serializers.IntegerField(default=0)
    title = serializers.CharField()
    duration = serializers.CharField()
    description = serializers.CharField()
    categories = serializers.ListField(
        child=serializers.DictField(child=serializers.CharField()),
        allow_empty=False
    )

# Video Search Request Serializer
class VideoSearchSerializer(serializers.Serializer):
    title = serializers.CharField(required=False, allow_blank=True)
    duration = serializers.CharField(required=False, allow_blank=True)
    category = serializers.CharField(required=False, allow_blank=True)
    
    def validate(self, data):
        # Ensure at least one search parameter is provided
        if not any(data.get(field) for field in ['title', 'duration', 'category']):
            raise serializers.ValidationError("At least one search parameter (title, duration, or category) must be provided.")
        return data

# Create Question Request Serializer
class CreateQuestionRequestSerializer(serializers.Serializer):
    id = serializers.IntegerField(default=0)
    text = serializers.CharField()
    type = serializers.CharField()
    answers = serializers.ListField(
        child=serializers.DictField(child=serializers.CharField()),
        allow_empty=False
    )

# Create Questionnaire Request Serializer
class CreateQuestionnaireRequestSerializer(serializers.Serializer):
    id = serializers.IntegerField(default=0)
    title = serializers.CharField()
    status = serializers.CharField()
    questions = serializers.ListField(
        child=serializers.IntegerField(),
        allow_empty=True
    )

# Create Answer Category Mapping Request Serializer
class CreateAnswerCategoryMappingRequestSerializer(serializers.Serializer):
    questionnaire_id = serializers.IntegerField()
    answer_id = serializers.IntegerField()
    category_id = serializers.IntegerField()
    inclusive = serializers.BooleanField(default=True)