from celery import Celery
from app.core.config import settings

celery_app = Celery(
    "estateos_workers",
    broker=settings.REDIS_URL,
    backend=settings.REDIS_URL,
    include=[
        "app.workers.tasks.notifications",
    ]
)

celery_app.conf.update(
    task_serializer="json",
    accept_content=["json"],
    result_serializer="json",
    timezone="UTC",
    enable_utc=True,
    task_track_started=True,
    task_time_limit=300,
    worker_prefetch_multiplier=1,
)

# Celery Beat Scheduled Tasks
celery_app.conf.beat_schedule = {
    "check-overdue-tasks-every-hour": {
        "task": "app.workers.tasks.notifications.check_overdue_tasks",
        "schedule": 3600.0,
    },
    "dispatch-appointment-reminders-daily": {
        "task": "app.workers.tasks.notifications.dispatch_appointment_reminders",
        "schedule": 86400.0,
    },
}

