from django.urls import path

from .views import LoginView, UserViewSet


routes = [
    {"regex": r"users", "viewset": UserViewSet, "basename": "user"},
]

urlpatterns = [
    path("users/login/", LoginView.as_view(), name="login"),
]
