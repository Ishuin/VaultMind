from typing import Optional
from sqlalchemy.orm import Session
from datetime import datetime, timedelta
from app.models.subscription import Subscription, PLAN_LIMITS


class CRUDSubscription:
    def get_by_user(self, db: Session, user_id: int) -> Optional[Subscription]:
        return db.query(Subscription).filter(Subscription.user_id == user_id).first()
    
    def get_by_razorpay_id(self, db: Session, razorpay_subscription_id: str) -> Optional[Subscription]:
        return db.query(Subscription).filter(
            Subscription.razorpay_subscription_id == razorpay_subscription_id
        ).first()
    
    def create_trial(self, db: Session, user_id: int) -> Subscription:
        """Start a 7-day trial for a new user"""
        trial_end = datetime.utcnow() + timedelta(days=7)
        
        subscription = Subscription(
            user_id=user_id,
            plan_id="trial",
            status="trialing",
            trial_start=datetime.utcnow(),
            trial_end=trial_end,
            is_founder=False,
        )
        db.add(subscription)
        db.commit()
        db.refresh(subscription)
        return subscription
    
    def create_subscription(
        self,
        db: Session,
        user_id: int,
        plan_id: str,
        razorpay_subscription_id: Optional[str] = None,
        razorpay_customer_id: Optional[str] = None,
    ) -> Subscription:
        """Create a new subscription"""
        subscription = Subscription(
            user_id=user_id,
            plan_id=plan_id,
            status="active" if plan_id == "lifetime" else "pending",
            razorpay_subscription_id=razorpay_subscription_id,
            razorpay_customer_id=razorpay_customer_id,
            is_founder=plan_id.startswith("founder_"),
            founder_tier=plan_id if plan_id.startswith("founder_") else None,
            current_period_start=datetime.utcnow(),
            current_period_end=datetime.utcnow() + timedelta(days=30) if plan_id != "lifetime" else None,
        )
        db.add(subscription)
        db.commit()
        db.refresh(subscription)
        return subscription
    
    def activate_subscription(self, db: Session, subscription_id: int) -> Subscription:
        """Activate a subscription after payment"""
        subscription = db.query(Subscription).filter(Subscription.id == subscription_id).first()
        if subscription:
            subscription.status = "active"
            subscription.current_period_start = datetime.utcnow()
            if subscription.plan_id != "lifetime":
                subscription.current_period_end = datetime.utcnow() + timedelta(days=30)
            db.commit()
            db.refresh(subscription)
        return subscription
    
    def cancel_subscription(self, db: Session, subscription_id: int) -> Subscription:
        """Cancel a subscription"""
        subscription = db.query(Subscription).filter(Subscription.id == subscription_id).first()
        if subscription:
            subscription.status = "cancelled"
            db.commit()
            db.refresh(subscription)
        return subscription
    
    def update_razorpay_details(
        self,
        db: Session,
        subscription_id: int,
        razorpay_subscription_id: str,
        razorpay_customer_id: Optional[str] = None,
    ) -> Subscription:
        """Update Razorpay details after payment"""
        subscription = db.query(Subscription).filter(Subscription.id == subscription_id).first()
        if subscription:
            subscription.razorpay_subscription_id = razorpay_subscription_id
            if razorpay_customer_id:
                subscription.razorpay_customer_id = razorpay_customer_id
            db.commit()
            db.refresh(subscription)
        return subscription
    
    def get_plan_limits(self, plan_id: str) -> dict:
        """Get plan limits"""
        return PLAN_LIMITS.get(plan_id, {})
    
    def count_active_subscriptions(self, db: Session, plan_id: str) -> int:
        """Count active subscriptions for a plan"""
        return db.query(Subscription).filter(
            Subscription.plan_id == plan_id,
            Subscription.status.in_(["active", "trialing"]),
        ).count()
    
    def has_available_slots(self, db: Session, plan_id: str) -> bool:
        """Check if a plan has available slots"""
        plan_limits = self.get_plan_limits(plan_id)
        if not plan_limits or plan_limits.get("total_slots") is None:
            return True  # Unlimited slots
        
        active_count = self.count_active_subscriptions(db, plan_id)
        return active_count < plan_limits["total_slots"]


subscription = CRUDSubscription()
