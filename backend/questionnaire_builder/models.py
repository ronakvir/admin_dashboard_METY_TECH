from django.db import models
import uuid
from django.utils import timezone

class Video(models.Model):
    title = models.CharField(max_length=255, null=False)
    duration = models.CharField(max_length=255, null=False)
    description = models.CharField(max_length=255, null=False)
    url = models.URLField(max_length=500, null=True, blank=True)

class Category(models.Model):
    text = models.CharField(max_length=255, null=False)

class VideoCategory(models.Model):
    video = models.ForeignKey(Video, on_delete=models.CASCADE, null=False)
    category = models.ForeignKey(Category, on_delete=models.CASCADE, null=False)

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

class APIKey(models.Model):
    key = models.CharField(max_length=64, unique=True, null=False)
    name = models.CharField(max_length=255, null=False, help_text="Key is used for authentication of public API")
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    last_used = models.DateTimeField(null=True, blank=True)
    
    def save(self, *args, **kwargs):
        if not self.key:
            self.key = self.generate_key()
        super().save(*args, **kwargs)
    
    def generate_key(self):
        return str(uuid.uuid4()).replace('-', '')
    
    def __str__(self):
        return f"{self.name} ({'Active' if self.is_active else 'Inactive'})"
    
    class Meta:
        verbose_name = "API Key"
        verbose_name_plural = "API Keys"


