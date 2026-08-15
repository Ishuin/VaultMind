from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from datetime import datetime, timedelta
from typing import Optional, List

from app.db.database import get_db
from app.api.deps import get_current_user
from app.models.user import User
from app.models.subscription import Subscription, PLAN_LIMITS, EXCHANGE_RATE_USD_TO_INR
from app.crud.subscription import subscription
from app.schemas.subscription import (
    SubscriptionResponse,
    TrialStart,
    PaymentOrder,
    PaymentVerification,
)

router = APIRouter()


@router.get("/status", response_model=Optional[SubscriptionResponse])
def get_subscription_status(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Get current user's subscription status"""
    sub = subscription.get_by_user(db, current_user.id)
    return sub


@router.post("/trial", response_model=TrialStart)
def start_trial(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Start a 7-day free trial"""
    # Check if user already has a subscription
    existing_sub = subscription.get_by_user(db, current_user.id)
    if existing_sub:
        if existing_sub.status == "trialing" and existing_sub.trial_end > datetime.utcnow():
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="You already have an active trial"
            )
        elif existing_sub.status == "active":
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="You already have an active subscription"
            )
    
    # Create trial subscription
    trial_sub = subscription.create_trial(db, current_user.id)
    
    # Update user's trial end date
    current_user.trial_end_date = trial_sub.trial_end
    current_user.subscription_tier = "trial"
    db.commit()
    
    return TrialStart(
        trial_end=trial_sub.trial_end,
        message="Your 7-day trial has started! Enjoy full access to all features."
    )


@router.get("/plans")
def get_plans():
    """Get available subscription plans with slot information"""
    plans = []
    for plan_id, plan_info in PLAN_LIMITS.items():
        if plan_id == "trial":
            continue
        plans.append({
            "id": plan_id,
            "name": plan_id.replace("_", " ").title(),
            "price_usd": plan_info["price_usd"],
            "price_inr": plan_info["price_inr"],
            "interval": plan_info["interval"],
            "total_slots": plan_info["total_slots"],
        })
    return plans


@router.get("/tiers")
def get_tier_status(db: Session = Depends(get_db)):
    """Get tier slot status for sequential locking"""
    return subscription.get_all_tier_status(db)


@router.get("/pricing")
def get_pricing(db: Session = Depends(get_db)):
    """
    Get current pricing for all tiers with slot availability.
    Returns real-time pricing based on slots filled.
    """
    return {
        "pricing": subscription.get_all_pricing(db),
        "total_early_filled": subscription.get_total_early_filled(db),
        "exchange_rate": EXCHANGE_RATE_USD_TO_INR,
        "exchange_rate_note": f"Assuming 1 USD = ₹{EXCHANGE_RATE_USD_TO_INR}",
    }


@router.post("/create-order")
def create_payment_order(
    plan_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Create a Razorpay order for subscription"""
    # Validate plan
    if plan_id not in PLAN_LIMITS or plan_id == "trial":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid plan ID"
        )
    
    # Check if tier is available (sequential locking)
    if not subscription.is_tier_available(db, plan_id):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="This tier is locked. Complete the previous tier first."
        )
    
    # Check slot availability
    if not subscription.has_available_slots(db, plan_id):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No slots available for this plan"
        )
    
    # Check if user already has this subscription
    existing_sub = subscription.get_by_user(db, current_user.id)
    if existing_sub and existing_sub.plan_id == plan_id and existing_sub.status == "active":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="You already have this subscription"
        )
    
    # Get current price (may differ from base price for dynamic tiers)
    pricing = subscription.get_current_price(db, plan_id)
    
    # In production, this would create a Razorpay order
    # For now, return placeholder data
    return {
        "order_id": f"order_placeholder_{plan_id}",
        "amount": pricing["price_usd"] * 100,  # Amount in paise/cents
        "currency": "USD",
        "razorpay_key_id": "rzp_test_placeholder",
        "plan_id": plan_id,
        "price_usd": pricing["price_usd"],
        "price_inr": pricing["price_inr"],
    }


@router.post("/verify")
def verify_payment(
    verification: PaymentVerification,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Verify payment and activate subscription"""
    # In production, this would verify the Razorpay signature
    # For now, activate the subscription directly
    
    plan_id = verification.plan_id
    
    # Check slot availability again
    if not subscription.has_available_slots(db, plan_id):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No slots available for this plan"
        )
    
    # Create or update subscription
    existing_sub = subscription.get_by_user(db, current_user.id)
    
    if existing_sub:
        # Update existing subscription
        existing_sub.plan_id = plan_id
        existing_sub.status = "active"
        existing_sub.razorpay_subscription_id = verification.razorpay_payment_id
        existing_sub.is_founder = plan_id.startswith("founder_")
        existing_sub.founder_tier = plan_id if plan_id.startswith("founder_") else None
        existing_sub.current_period_start = datetime.utcnow()
        if plan_id != "lifetime":
            existing_sub.current_period_end = datetime.utcnow() + timedelta(days=30)
        else:
            existing_sub.current_period_end = None
        db.commit()
        db.refresh(existing_sub)
        sub = existing_sub
    else:
        # Create new subscription
        sub = subscription.create_subscription(
            db,
            user_id=current_user.id,
            plan_id=plan_id,
            razorpay_subscription_id=verification.razorpay_payment_id,
        )
    
    # Update user's subscription tier
    current_user.subscription_tier = plan_id
    current_user.is_founder = plan_id.startswith("founder_")
    db.commit()
    
    return {"message": "Subscription activated successfully", "subscription": SubscriptionResponse.from_orm(sub)}


@router.post("/cancel")
def cancel_subscription(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Cancel current subscription"""
    sub = subscription.get_by_user(db, current_user.id)
    if not sub:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No active subscription found"
        )
    
    if sub.status != "active":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No active subscription to cancel"
        )
    
    subscription.cancel_subscription(db, sub.id)
    current_user.subscription_tier = "free"
    current_user.is_founder = False
    db.commit()
    
    return {"message": "Subscription cancelled successfully"}


@router.post("/webhook")
def razorpay_webhook(payload: dict):
    """Handle Razorpay webhook events"""
    # In production, this would:
    # 1. Verify webhook signature
    # 2. Parse event type
    # 3. Update subscription status based on event
    
    event_type = payload.get("event")
    
    # Placeholder webhook handling
    if event_type in ["subscription.activated", "subscription.charged"]:
        # Update subscription status
        pass
    elif event_type in ["subscription.cancelled", "subscription.halted"]:
        # Cancel subscription
        pass
    
    return {"status": "ok"}
