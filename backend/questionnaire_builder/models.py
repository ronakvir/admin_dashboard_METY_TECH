from django.db import models

class Video(models.Model):
    title = models.CharField(max_length=255, null=False)
    duration = models.CharField(max_length=255, null=False)
    description = models.CharField(max_length=255, null=False)

class Category(models.Model):
    text = models.CharField(max_length=255, null=False)

class VideoCategory(models.Model):
    video = models.ForeignKey(Video, on_delete=models.CASCADE, null=False)
    category = models.ForeignKey(Category, on_delete=models.CASCADE, null=False)

# Create your models here.
class Questionnaire(models.Model):
    title = models.CharField(max_length=255, null=False)
    status = models.CharField(max_length=255, null=False)
    started = models.IntegerField(null=False, default=0)
    completed = models.IntegerField(null=False, default=0)
    last_modified = models.DateTimeField(null=False, default='2025-04-18 15:30:45')

class Question(models.Model):
    text = models.CharField(max_length=255, null=False)
    type = models.CharField(max_length=255, null=False, default="template")

class Answer(models.Model):
    question = models.ForeignKey(Question, on_delete=models.CASCADE, null=False)
    text = models.CharField(max_length=255, null=False)

class QuestionnaireQuestion(models.Model):
    question = models.ForeignKey(Question, on_delete=models.CASCADE, null=False)
    questionnaire = models.ForeignKey(Questionnaire, on_delete=models.CASCADE, null=False)
    
class AnswerCategoryMapping(models.Model):
    questionnaire = models.ForeignKey(Questionnaire, on_delete=models.CASCADE, null=False)
    answer = models.ForeignKey(Answer, on_delete=models.CASCADE, null=False)
    category = models.ForeignKey(Category, on_delete=models.CASCADE, null=False)
    inclusive = models.BooleanField(null=False, default=True)


