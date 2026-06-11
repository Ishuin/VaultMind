import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Clock, ArrowRight } from 'lucide-react';

export function TrialBanner() {
  const { user } = useAuth();
  const [daysRemaining, setDaysRemaining] = useState<number | null>(null);

  useEffect(() => {
    if (user?.trial_end_date) {
      const trialEnd = new Date(user.trial_end_date);
      const now = new Date();
      const diff = trialEnd.getTime() - now.getTime();
      const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
      setDaysRemaining(Math.max(0, days));
    }
  }, [user?.trial_end_date]);

  // Don't show banner if not on trial or trial has expired
  if (!user || user.subscription_tier !== 'trial' || daysRemaining === null || daysRemaining <= 0) {
    return null;
  }

  return (
    <div className="bg-primary/10 border border-primary/20 rounded-lg p-4 mb-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-primary/20 rounded-lg">
            <Clock className="w-5 h-5 text-primary" />
          </div>
          <div>
            <p className="font-medium text-foreground">
              Free Trial — {daysRemaining} {daysRemaining === 1 ? 'day' : 'days'} remaining
            </p>
            <p className="text-sm text-muted-foreground">
              Full access to all features. Upgrade anytime to keep your access.
            </p>
          </div>
        </div>
        <a href="#pricing">
          <Button variant="outline" className="border-primary/30 text-primary hover:bg-primary/10">
            Upgrade Now
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </a>
      </div>
    </div>
  );
}
