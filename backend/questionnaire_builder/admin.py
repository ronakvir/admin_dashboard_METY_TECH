from django.contrib import admin
from .models import APIKey, Questionnaire, Question, Answer, Video, Category

# Register your models here.

@admin.register(APIKey)
class APIKeyAdmin(admin.ModelAdmin):
    list_display = ('name', 'key', 'is_active', 'created_at', 'last_used')
    list_filter = ('is_active', 'created_at')
    search_fields = ('name', 'key')
    readonly_fields = ('key', 'created_at', 'last_used')
    ordering = ('-created_at',)
    
    def get_readonly_fields(self, request, obj=None):
        if obj:  # editing an existing object
            return self.readonly_fields + ('key',)
        return self.readonly_fields

@admin.register(Questionnaire)
class QuestionnaireAdmin(admin.ModelAdmin):
    list_display = ('title', 'status', 'started', 'completed', 'last_modified')
    list_filter = ('status', 'last_modified')
    search_fields = ('title',)
    ordering = ('-last_modified',)

@admin.register(Question)
class QuestionAdmin(admin.ModelAdmin):
    list_display = ('text', 'type')
    list_filter = ('type',)
    search_fields = ('text',)

@admin.register(Answer)
class AnswerAdmin(admin.ModelAdmin):
    list_display = ('text', 'question')
    search_fields = ('text', 'question__text')

@admin.register(Video)
class VideoAdmin(admin.ModelAdmin):
    list_display = ('title', 'duration', 'description')
    search_fields = ('title', 'description')

@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):
    list_display = ('text',)
    search_fields = ('text',)
