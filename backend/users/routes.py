from django.urls import path

from .views import (
    LoginView, LogoutRequestView, UserViewSet, AdminInviteViewSet,
    CreateInviteView, VerifyTokenView, RegisterView, AdminManagementView, CurrentUserView
)


routes = [
    {"regex": r"users", "viewset": UserViewSet, "basename": "user"},
    {"regex": r"admin-invites", "viewset": AdminInviteViewSet, "basename": "admin-invite"},
]

urlpatterns = [
    path("users/login/", LoginView.as_view(), name="login"),
    path('api/logout/', LogoutRequestView.as_view(), name='logout-request'),
    path("admin-invites/create/", CreateInviteView.as_view(), name="create-invite"),
    path("admin-invites/verify-token/", VerifyTokenView.as_view(), name="verify-token"),
    path("users/register/", RegisterView.as_view(), name="register"),
    path("admin-management/", AdminManagementView.as_view(), name="admin-management"),
    path("current-user/", CurrentUserView.as_view(), name="current-user"),
]
