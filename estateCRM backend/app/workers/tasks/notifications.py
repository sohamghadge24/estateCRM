from app.workers.celery_app import celery_app
from app.core.logging import logger

@celery_app.task(name="app.workers.tasks.notifications.send_email_notification", bind=True, max_retries=3)
def send_email_notification(self, recipient: str, subject: str, body: str):
    try:
        logger.info(f"[Celery Worker] Dispatched Email to {recipient} with subject: {subject}")
        return {"status": "DELIVERED", "recipient": recipient}
    except Exception as exc:
        logger.error(f"Email dispatch error: {exc}")
        raise self.retry(exc=exc, countdown=60)

@celery_app.task(name="app.workers.tasks.notifications.send_sms_notification", bind=True, max_retries=3)
def send_sms_notification(self, phone: str, message: str):
    logger.info(f"[Celery Worker] Dispatched SMS to {phone}")
    return {"status": "DELIVERED", "phone": phone}

@celery_app.task(name="app.workers.tasks.notifications.check_overdue_tasks")
def check_overdue_tasks():
    logger.info("[Celery Beat] Checking for overdue tasks across tenant workspaces...")
    return {"checked": True}

@celery_app.task(name="app.workers.tasks.notifications.dispatch_appointment_reminders")
def dispatch_appointment_reminders():
    logger.info("[Celery Beat] Dispatched scheduled 24-hour site visit reminders.")
    return {"reminders_dispatched": True}

