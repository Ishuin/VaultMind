from typing import Optional
from pydantic import BaseModel
from datetime import datetime


class SubscriptionBase(BaseModel):
    plan_id: str


class SubscriptionCreate(SubscriptionBase):
    razorpay_subscription_id: Optional[str] = None
    razorpay_customer_id: Optional[str] = None


class SubscriptionResponse(SubscriptionBase):
    id: int
    user_id: int
    status: str
    is_founder: bool
    founder_tier: Optional[str] = None
    trial_start: Optional[datetime] = None
    trial_end: Optional[datetime] = None
    current_period_start: Optional[datetime] = None
    current_period_end: Optional[datetime] = None
    razorpay_subscription_id: Optional[str] = None
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True


class SubscriptionUpdate(BaseModel):
    status: Optional[str] = None
    razorpay_subscription_id: Optional[str] = None
    razorpay_customer_id: Optional[str] = None
    current_period_start: Optional[datetime] = None
    current_period_end: Optional[datetime] = None


class TrialStart(BaseModel):
    """Response after starting a trial"""
    trial_end: datetime
    message: str


class PaymentOrder(BaseModel):
    """Response after creating a Razorpay order"""
    order_id: str
    amount: int
    currency: str
    razorpay_key_id: str


class PaymentVerification(BaseModel):
    """Request to verify a payment"""
    razorpay_order_id: str
    razorpay_payment_id: str
    razorpay_signature: str
    plan_id: str
