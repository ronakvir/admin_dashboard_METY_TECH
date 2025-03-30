from django.db import models

# Create your models here.
class Questionnaire(models.Model):
    name = models.CharField(max_length=255)
    status = models.CharField(max_length=255)

class Question(models.Model):
    questionnaire = models.ForeignKey(
        'Questionnaire', 
        on_delete=models.CASCADE, 
        related_name='questions'
    )
    value = models.CharField(max_length=255)
    order = models.IntegerField()

class QuestionAnswer(models.Model):
    question = models.ForeignKey(
        'Question', 
        on_delete=models.CASCADE, 
        related_name='answers'
    )
    value = models.CharField(max_length=255)
    order = models.IntegerField()
    input = models.CharField(max_length=255) # multi choice, boolean, free response, etc 


