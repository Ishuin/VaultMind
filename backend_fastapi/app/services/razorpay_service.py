import razorpay
from typing import Optional
from app.core.config import settings


class RazorpayService:
    def __init__(self):
        self.client = None
        self._initialize_client()
    
    def _initialize_client(self):
        """Initialize Razorpay client with API keys"""
        if settings.RAZORPAY_KEY_ID and settings.RAZORPAY_KEY_SECRET:
            self.client = razorpay.Client(auth=(settings.RAZORPAY_KEY_ID, settings.RAZORPAY_KEY_SECRET))
    
    def is_configured(self) -> bool:
        """Check if Razorpay is configured"""
        return self.client is not None
    
    def create_customer(self, email: str, name: Optional[str] = None) -> dict:
        """Create a Razorpay customer"""
        if not self.is_configured():
            raise ValueError("Razorpay is not configured")
        
        customer_data = {"email": email}
        if name:
            customer_data["name"] = name
        
        return self.client.customer.create(**customer_data)
    
    def create_order(self, amount: int, currency: str = "INR", receipt: Optional[str] = None) -> dict:
        """Create a Razorpay order"""
        if not self.is_configured():
            raise ValueError("Razorpay is not configured")
        
        order_data = {
            "amount": amount * 100,  # Convert to paise/cents
            "currency": currency,
            "receipt": receipt,
        }
        
        return self.client.order.create(**order_data)
    
    def create_subscription(self, plan_id: str, customer_id: str, total_count: int = 12) -> dict:
        """Create a Razorpay subscription"""
        if not self.is_configured():
            raise ValueError("Razorpay is not configured")
        
        subscription_data = {
            "plan_id": plan_id,
            "customer_id": customer_id,
            "total_count": total_count,
            "notify": 1,
        }
        
        return self.client.subscription.create(**subscription_data)
    
    def verify_payment(self, order_id: str, payment_id: str, signature: str) -> bool:
        """Verify Razorpay payment signature"""
        if not self.is_configured():
            raise ValueError("Razorpay is not configured")
        
        try:
            self.client.utility.verify_payment_signature({
                "razorpay_order_id": order_id,
                "razorpay_payment_id": payment_id,
                "razorpay_signature": signature,
            })
            return True
        except Exception:
            return False
    
    def cancel_subscription(self, subscription_id: str) -> dict:
        """Cancel a Razorpay subscription"""
        if not self.is_configured():
            raise ValueError("Razorpay is not configured")
        
        return self.client.subscription.cancel(subscription_id)
    
    def fetch_subscription(self, subscription_id: str) -> dict:
        """Fetch a Razorpay subscription"""
        if not self.is_configured():
            raise ValueError("Razorpay is not configured")
        
        return self.client.subscription.fetch(subscription_id)
    
    def fetch_payment(self, payment_id: str) -> dict:
        """Fetch a Razorpay payment"""
        if not self.is_configured():
            raise ValueError("Razorpay is not configured")
        
        return self.client.payment.fetch(payment_id)


# Singleton instance
razorpay_service = RazorpayService()
