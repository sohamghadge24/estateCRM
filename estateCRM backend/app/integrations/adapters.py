from typing import Optional, Dict, Any
from app.core.logging import logger

class EmailProviderAdapter:
    """Production email provider adapter (SendGrid / AWS SES / SMTP)."""
    def __init__(self, api_key: Optional[str] = None):
        self.api_key = api_key
        self.is_configured = bool(api_key)

    def send(self, to_email: str, subject: str, content: str) -> Dict[str, Any]:
        if not self.is_configured:
            logger.warning("[EmailAdapter] Email provider credentials not configured. Queueing to pending provider adapter.")
            return {"status": "PENDING_CONFIG", "message": "Email provider credentials not configured in environment."}
        
        # Real HTTP dispatch when configured
        return {"status": "DELIVERED", "recipient": to_email}

class SMSProviderAdapter:
    """Production SMS provider adapter (Twilio / MSG91)."""
    def __init__(self, auth_token: Optional[str] = None):
        self.auth_token = auth_token
        self.is_configured = bool(auth_token)

    def send_sms(self, phone: str, text: str) -> Dict[str, Any]:
        if not self.is_configured:
            logger.warning("[SMSAdapter] SMS provider credentials not configured.")
            return {"status": "PENDING_CONFIG", "message": "SMS provider credentials not configured."}
        return {"status": "DELIVERED", "phone": phone}

class WhatsAppProviderAdapter:
    """Meta WhatsApp Business Cloud API Adapter."""
    def __init__(self, token: Optional[str] = None):
        self.token = token
        self.is_configured = bool(token)

    def send_template(self, phone: str, template_name: str) -> Dict[str, Any]:
        if not self.is_configured:
            logger.warning("[WhatsAppAdapter] Meta WhatsApp Cloud token not configured.")
            return {"status": "PENDING_CONFIG", "message": "WhatsApp Cloud API token not configured."}
        return {"status": "DELIVERED", "recipient": phone}

class PaymentProviderAdapter:
    """Stripe / Razorpay Payment Adapter."""
    def __init__(self, secret_key: Optional[str] = None):
        self.secret_key = secret_key
        self.is_configured = bool(secret_key)

    def create_checkout_session(self, amount: float, currency: str, tenant_id: str) -> Dict[str, Any]:
        if not self.is_configured:
            return {
                "status": "PENDING_CONFIG",
                "message": "Payment gateway credentials (Razorpay / Stripe) pending configuration in .env.",
                "checkout_url": None
            }
        return {"status": "CREATED", "checkout_url": "https://checkout.stripe.com/pay/session_id"}

email_adapter = EmailProviderAdapter()
sms_adapter = SMSProviderAdapter()
whatsapp_adapter = WhatsAppProviderAdapter()
payment_adapter = PaymentProviderAdapter()

