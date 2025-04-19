from rest_framework import serializers
from .models import Answer, AnswerCategoryMapping, Category, Question, Questionnaire

# class QuestionAnswerSerializer(serializers.ModelSerializer):
#     class Meta:
#         model = QuestionAnswer
#         fields = ('value', 'order', 'input')

# class QuestionSerializer(serializers.ModelSerializer):
#     answers = QuestionAnswerSerializer(many=True)

#     class Meta:
#         model = Question
#         fields = ('value', 'order', 'answers')

#     def create(self, validated_data):
#         answers_data = validated_data.pop('answers')
#         question = Question.objects.create(**validated_data)
#         for answer_data in answers_data:
#             QuestionAnswer.objects.create(question=question, **answer_data)
#         return question

# class QuestionnaireSerializer(serializers.ModelSerializer):
#     questions = QuestionSerializer(many=True)

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
#                 QuestionAnswer.objects.create(question=question, **answer_data)
#         return questionnaire

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