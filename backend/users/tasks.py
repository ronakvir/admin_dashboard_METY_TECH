from django.core import management

from admin_dashboard import celery_app


@celery_app.task
def clearsessions():
    management.call_command("clearsessions")
