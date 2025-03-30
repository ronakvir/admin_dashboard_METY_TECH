from django.urls import path

from . import views
from .views import QuestionnaireCreateAPIView


urlpatterns = [
    path('api/questionnaires/', QuestionnaireCreateAPIView.as_view(), name='questionnaire-create'),
]
