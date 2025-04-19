from django.urls import path

from . import views
# from .views import QuestionnaireCreateAPIView


urlpatterns = [
    # path('api/questionnaires/', QuestionnaireCreateAPIView.as_view(), name='questionnaire-create'),
    path('logicbuilder/getquestionnaires/', views.GetQuestionnaireForLogicPage.as_view(), name='GetQuestionnaireForLogicPage'),
    path('logicbuilder/getquestions/<int:questionnaire_id>', views.GetQuestionWithAnswersAndCategories.as_view(), name='GetQuestionWithAnswersAndCategories'),
    path('logicbuilder/getcategories/', views.GetCategories.as_view(), name='GetCategories'),
    path('logicbuilder/deletemapping/<int:questionnaire_id>/<int:answer_id>', views.DeleteAnswerCategoryMapping.as_view(), name='DeleteAnswerCategoryMapping'),
    path('logicbuilder/addmapping/', views.AddAnswerCategoryMapping.as_view(), name='AddAnswerCategoryMapping'),
]
