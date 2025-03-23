from django.db import models

# Create your models here.
class Questionnaire(models.Model):
    type = models.CharField(max_length=255)
    status = models.CharField(max_length=255)
    # responses = models.IntegerField(default=0)

class Question(models.Model):
    questionnaire = models.ForeignKey(
        'Questionnaire', 
        on_delete=models.CASCADE, 
        related_name='questions'
    )
    value = models.CharField(max_length=255)
    order = models.IntegerField()
    type = models.CharField(max_length=255)

