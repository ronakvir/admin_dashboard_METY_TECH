from rest_framework import serializers
from .models import Questionnaire, Question, QuestionAnswer

class QuestionAnswerSerializer(serializers.ModelSerializer):
    class Meta:
        model = QuestionAnswer
        fields = ('value', 'order', 'input')

class QuestionSerializer(serializers.ModelSerializer):
    answers = QuestionAnswerSerializer(many=True)

    class Meta:
        model = Question
        fields = ('value', 'order', 'answers')

    def create(self, validated_data):
        answers_data = validated_data.pop('answers')
        question = Question.objects.create(**validated_data)
        for answer_data in answers_data:
            QuestionAnswer.objects.create(question=question, **answer_data)
        return question

class QuestionnaireSerializer(serializers.ModelSerializer):
    questions = QuestionSerializer(many=True)

    class Meta:
        model = Questionnaire
        fields = ('name', 'status', 'questions')

    def create(self, validated_data):
        questions_data = validated_data.pop('questions')
        questionnaire = Questionnaire.objects.create(**validated_data)
        for question_data in questions_data:
            answers_data = question_data.pop('answers')
            question = Question.objects.create(questionnaire=questionnaire, **question_data)
            for answer_data in answers_data:
                QuestionAnswer.objects.create(question=question, **answer_data)
        return questionnaire
