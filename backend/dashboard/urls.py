from django.urls import re_path
from .views import dashboard_index

urlpatterns = [
    re_path(r"^(?:.*)/?$", dashboard_index),
]
