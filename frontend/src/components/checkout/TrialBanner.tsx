import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Clock, ArrowRight, AlertTriangle } from 'lucide-react';

export function TrialBanner() {
  const { user } = useAuth();
  const [daysRemaining, setDaysRemaining] = useState<number | null>(null);
  const [trialEndDate, setTrialEndDate] = useState<Date | null>(null);

  useEffect(() => {
    if (user?.trial_end_date) {
      const endDate = new Date(user.trial_end_date);
      setTrialEndDate(endDate);
      const now = new Date();
      const diff = endDate.getTime() - now.getTime();
      const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
      setDaysRemaining(Math.max(0, days));
    }
  }, [user?.trial_end_date]);

  // Don't show banner if not on trial or trial has expired
  if (!user || user.subscription_tier !== 'trial' || daysRemaining === null || daysRemaining <= 0) {
    return null;
  }

  const isUrgent = daysRemaining <= 2;
  const isWarning = daysRemaining <= 4;

  return (
    <div className={`border rounded-lg p-4 mb-6 ${
      isUrgent 
        ? 'bg-destructive/10 border-destructive/30' 
        : isWarning 
          ? 'bg-yellow-500/10 border-yellow-500/30' 
          : 'bg-primary/10 border-primary/20'
    }`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-lg ${
            isUrgent 
              ? 'bg-destructive/20' 
              : isWarning 
                ? 'bg-yellow-500/20' 
                : 'bg-primary/20'
          }`}>
            {isUrgent ? (
              <AlertTriangle className="w-5 h-5 text-destructive" />
            ) : (
              <Clock className={`w-5 h-5 ${
                isUrgent 
                  ? 'text-destructive' 
                  : isWarning 
                    ? 'text-yellow-500' 
                    : 'text-primary'
              }`} />
            )}
          </div>
          <div>
            <p className="font-medium text-foreground">
              Free Trial — {daysRemaining} {daysRemaining === 1 ? 'day' : 'days'} remaining
            </p>
            <p className="text-sm text-muted-foreground">
              {isUrgent 
                ? 'Your trial expires soon. Upgrade now to keep your data and access.'
                : isWarning
                  ? 'Upgrade anytime to keep your access after the trial ends.'
                  : 'Full access to all features. Upgrade anytime to keep your access.'
              }
            </p>
          </div>
        </div>
        <a href="#pricing">
          <Button variant="outline" className={`border-primary/30 text-primary hover:bg-primary/10 ${
            isUrgent ? 'border-destructive/30 text-destructive hover:bg-destructive/10' : ''
          }`}>
            Upgrade Now
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </a>
      </div>
      
      {/* Progress bar showing trial progress */}
      {trialEndDate && (
        <div className="mt-3">
          <div className="flex justify-between text-xs text-muted-foreground mb-1">
            <span>Trial Progress</span>
            <span>{7 - daysRemaining}/7 days used</span>
          </div>
          <div className="h-1.5 w-full bg-border">
            <div 
              className={`h-full transition-all duration-300 ${
                isUrgent 
                  ? 'bg-destructive' 
                  : isWarning 
                    ? 'bg-yellow-500' 
                    : 'bg-primary'
              }`}
              style={{ width: `${((7 - daysRemaining) / 7) * 100}%` }}
            />
          </div>
        </div>
      )}
    </div>
  );
}
