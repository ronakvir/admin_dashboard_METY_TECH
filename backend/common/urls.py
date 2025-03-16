from django.urls import path

from . import views
from .views import get_csrf_token


app_name = "common"
urlpatterns = [
    path("", views.IndexView.as_view(), name="index"),
    path('get-csrf-token/', get_csrf_token, name='get_csrf_token'),
]
