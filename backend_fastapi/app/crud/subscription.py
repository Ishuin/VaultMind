from typing import Optional, Dict, Any, List
from sqlalchemy.orm import Session
from datetime import datetime, timedelta
from app.models.subscription import Subscription, PLAN_LIMITS, DYNAMIC_PRICING_TIERS


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
    
    def get_total_early_filled(self, db: Session) -> int:
        """Get total number of early founder slots filled across all dynamic pricing tiers"""
        return sum(
            self.count_active_subscriptions(db, tier) for tier in DYNAMIC_PRICING_TIERS
        )
    
    def get_current_price(self, db: Session, plan_id: str) -> Dict[str, Any]:
        """
        Calculate current price based on slots filled.
        Returns price information for the specified plan.
        """
        plan_limits = self.get_plan_limits(plan_id)
        if not plan_limits:
            return {"error": "Invalid plan"}
        
        # Lifetime and standard tiers have fixed pricing
        if plan_id in ["lifetime", "standard"]:
            return {
                "plan_id": plan_id,
                "price_usd": plan_limits["price_usd"],
                "price_inr": plan_limits["price_inr"],
                "interval": plan_limits["interval"],
                "total_slots": plan_limits["total_slots"],
                "filled_slots": None,
                "available_slots": None,
                "is_available": True,
                "total_early_filled": self.get_total_early_filled(db),
            }
        
        # Dynamic pricing tiers
        filled = self.count_active_subscriptions(db, plan_id)
        total_slots = plan_limits["total_slots"]
        available = total_slots - filled if total_slots else None
        
        return {
            "plan_id": plan_id,
            "price_usd": plan_limits["price_usd"],
            "price_inr": plan_limits["price_inr"],
            "interval": plan_limits["interval"],
            "total_slots": total_slots,
            "filled_slots": filled,
            "available_slots": available,
            "is_available": self.is_tier_available(db, plan_id) and self.has_available_slots(db, plan_id),
            "total_early_filled": self.get_total_early_filled(db),
        }
    
    def get_all_pricing(self, db: Session) -> List[Dict[str, Any]]:
        """Get pricing information for all plans"""
        return [self.get_current_price(db, plan_id) for plan_id in PLAN_LIMITS.keys()]
    
    def is_tier_available(self, db: Session, plan_id: str) -> bool:
        """
        Check if a tier is available for purchase.
        Enforces sequential unlocking for dynamic pricing tiers.
        Lifetime and standard tiers are always available (when slots exist).
        """
        # Lifetime and standard tiers are never locked
        if plan_id in ["lifetime", "standard"]:
            return True
        
        # Get tier index in dynamic pricing tiers
        if plan_id not in DYNAMIC_PRICING_TIERS:
            return False
        
        tier_index = DYNAMIC_PRICING_TIERS.index(plan_id)
        
        # First tier is always available
        if tier_index == 0:
            return True
        
        # Check if all previous tiers are sold out
        for i in range(tier_index):
            prev_tier = DYNAMIC_PRICING_TIERS[i]
            prev_count = self.count_active_subscriptions(db, prev_tier)
            prev_limit = PLAN_LIMITS[prev_tier]["total_slots"]
            if prev_count < prev_limit:
                return False  # Previous tier still has slots
        
        return True
    
    def get_tier_status(self, db: Session, plan_id: str) -> Dict[str, Any]:
        """Get detailed status of a tier including lock reason"""
        plan_limits = self.get_plan_limits(plan_id)
        if not plan_limits:
            return {"error": "Invalid plan"}
        
        is_available = self.is_tier_available(db, plan_id)
        has_slots = self.has_available_slots(db, plan_id)
        filled = self.count_active_subscriptions(db, plan_id) if plan_limits.get("total_slots") else None
        total = plan_limits.get("total_slots")
        
        # Determine lock reason
        lock_reason = None
        if not is_available:
            if plan_id in DYNAMIC_PRICING_TIERS:
                tier_index = DYNAMIC_PRICING_TIERS.index(plan_id)
                if tier_index > 0:
                    prev_tier = DYNAMIC_PRICING_TIERS[tier_index - 1]
                    lock_reason = f"Complete {prev_tier} tier first"
        elif not has_slots:
            lock_reason = "Sold out"
        
        return {
            "plan_id": plan_id,
            "price_usd": plan_limits["price_usd"],
            "price_inr": plan_limits["price_inr"],
            "interval": plan_limits["interval"],
            "total_slots": total,
            "filled_slots": filled,
            "available_slots": (total - filled) if total and filled is not None else None,
            "is_available": is_available and has_slots,
            "is_locked": not is_available,
            "is_sold_out": is_available and not has_slots,
            "lock_reason": lock_reason,
            "total_early_filled": self.get_total_early_filled(db),
        }
    
    def get_all_tier_status(self, db: Session) -> List[Dict[str, Any]]:
        """Get status of all tiers"""
        return [self.get_tier_status(db, plan_id) for plan_id in PLAN_LIMITS.keys()]


subscription = CRUDSubscription()
