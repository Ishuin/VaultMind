from sqlalchemy import Column, Integer, String, DateTime, Boolean, ForeignKey
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from app.db.database import Base


class Subscription(Base):
    __tablename__ = "subscriptions"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, unique=True)
    
    # Subscription details
    plan_id = Column(String, nullable=False)  # founder_1, founder_2, founder_3, lifetime, standard
    status = Column(String, default="trialing")  # trialing, active, cancelled, halted, past_due
    
    # Razorpay details
    razorpay_subscription_id = Column(String, unique=True, nullable=True)
    razorpay_customer_id = Column(String, nullable=True)
    
    # Trial details
    trial_start = Column(DateTime(timezone=True), server_default=func.now())
    trial_end = Column(DateTime(timezone=True), nullable=True)
    
    # Billing details
    current_period_start = Column(DateTime(timezone=True), nullable=True)
    current_period_end = Column(DateTime(timezone=True), nullable=True)
    
    # Founder badge
    is_founder = Column(Boolean, default=False)
    founder_tier = Column(String, nullable=True)  # founder_1, founder_2, founder_3, lifetime
    
    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Relationship
    user = relationship("User", back_populates="subscription")


# Exchange rate assumption: 1 USD = 83.50 INR
EXCHANGE_RATE_USD_TO_INR = 83.50

# Plan definitions with slot limits
# Tier 1: Dynamic pricing (monthly) - 150 early slots total
# Tier 2: Lifetime (one-time) - always available
PLAN_LIMITS = {
    # Dynamic pricing phases - price increases as slots fill
    "founder_1": {"total_slots": 50, "price_usd": 49, "price_inr": 4090, "interval": "monthly", "phase": 1},
    "founder_2": {"total_slots": 50, "price_usd": 99, "price_inr": 8270, "interval": "monthly", "phase": 2},
    "founder_3": {"total_slots": 50, "price_usd": 149, "price_inr": 12440, "interval": "monthly", "phase": 3},
    # Standard tier - available after all 150 early slots fill
    "standard": {"total_slots": None, "price_usd": 250, "price_inr": 20875, "interval": "monthly", "phase": None},
    # Lifetime tier - always available, never locked
    "lifetime": {"total_slots": None, "price_usd": 999, "price_inr": 83420, "interval": "one-time", "phase": None},
}

# Dynamic pricing tiers (for sequential unlocking)
DYNAMIC_PRICING_TIERS = ["founder_1", "founder_2", "founder_3"]

# Trial duration in days
TRIAL_DURATION_DAYS = 7
