from django.urls import path

from . import views
# from .views import QuestionnaireCreateAPIView


urlpatterns = [
    path('questionnairebuilder/createquestionnaire/', views.CreateQuestionnaire.as_view(), name='CreateQuestionnaire'),
    path('questionnairebuilder/deletequestionnaire/<int:id>', views.DeleteQuestionnaire.as_view(), name='DeleteQuestionnaire'),
    path('questionnairebuilder/getquestionnaires/', views.getQuestionnaires.as_view(), name='getQuestionnaires'),
    path('questionnairebuilder/addquestion/', views.CreateQuestion.as_view(), name='CreateQuestion'),
    path('questionnairebuilder/deletequestion/<int:id>', views.DeleteQuestion.as_view(), name='DeleteQuestion'),
    path('questionnairebuilder/getquestions/', views.getQuestions.as_view(), name='getQuestions'),
    path('questionnairebuilder/getvideos/', views.getVideosForPreview.as_view(), name='getVideosForPreview'),

    path('logicbuilder/getquestionnaires/', views.GetQuestionnaireForLogicPage.as_view(), name='GetQuestionnaireForLogicPage'),
    path('logicbuilder/getquestions/<int:questionnaire_id>', views.GetQuestionWithAnswersAndCategories.as_view(), name='GetQuestionWithAnswersAndCategories'),
    path('logicbuilder/getcategories/', views.GetCategories.as_view(), name='GetCategories'),
    path('logicbuilder/deletemapping/<int:questionnaire_id>/<int:answer_id>', views.DeleteAnswerCategoryMapping.as_view(), name='DeleteAnswerCategoryMapping'),
    path('logicbuilder/addmapping/', views.AddAnswerCategoryMapping.as_view(), name='AddAnswerCategoryMapping'),

    path('videomanagement/getvideos/<str:title>/<str:duration>/<str:category>', views.GetVideos.as_view(), name='GetVideos'),
    path('videomanagement/deletevideo/<int:id>', views.DeleteVideo.as_view(), name='DeleteVideo'),
    path('videomanagement/createvideo/', views.CreateVideo.as_view(), name='CreateVideo'),

    path('resetalldata/', views.ResetDatabaseData.as_view(), name='ResetDatabaseData'),
]
