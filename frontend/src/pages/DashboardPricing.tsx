import React, { useState, useEffect } from 'react';
import { CreditCard, TrendingUp, Crown, Check, ExternalLink, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { MainLayout } from "@/components/layout/MainLayout";
import { useAuth } from "@/context/AuthContext";
import { apiFetch } from '@/lib/api';
import { FounderBadge, getBadgeType } from '@/components/ui/FounderBadge';
import { TrialBanner } from '@/components/checkout/TrialBanner';
import { RazorpayCheckout } from '@/components/checkout/RazorpayCheckout';

const PLAN_DETAILS = {
  trial: {
    name: 'Free Trial',
    price: '$0',
    billing: '7 days',
    features: ['Full access to all features', 'Unlimited documents', 'AI-powered queries', 'Email support'],
  },
  founder_1: {
    name: 'Founder 1',
    price: '$19',
    billing: 'Monthly',
    features: ['5GB storage', 'Unlimited documents', 'Full RAG capabilities', 'Email support', 'Founding Member badge'],
  },
  founder_2: {
    name: 'Founder 2',
    price: '$49',
    billing: 'Monthly',
    features: ['25GB storage', 'Unlimited documents', 'Advanced RAG + citations', 'Priority support', 'API access', 'Founding Member badge'],
  },
  founder_3: {
    name: 'Founder 3',
    price: '$149',
    billing: 'Monthly',
    features: ['100GB storage', 'Unlimited everything', 'Team collaboration', 'Admin dashboard', 'Custom integrations', 'Dedicated support', 'Founding Member badge'],
  },
  lifetime: {
    name: 'Lifetime',
    price: '$999',
    billing: 'One-time',
    features: ['100GB storage', 'Unlimited everything', 'All Founder 3 features', 'Lifetime price lock', 'Lifetime Founder badge', 'Priority feature access'],
  },
  standard: {
    name: 'Standard',
    price: '$250',
    billing: 'Monthly',
    features: ['100GB storage', 'Unlimited everything', 'All features', 'Email support'],
  },
  free: {
    name: 'Free',
    price: '$0',
    billing: 'Forever',
    features: ['Basic features', 'Limited storage', 'Community support'],
  },
};

export default function DashboardPricingPage() {
  const { user } = useAuth();
  const [subscription, setSubscription] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSubscription();
  }, []);

  const fetchSubscription = async () => {
    try {
      const data = await apiFetch('/subscription/status');
      setSubscription(data);
    } catch (error) {
      console.error('Failed to fetch subscription:', error);
    } finally {
      setLoading(false);
    }
  };

  const currentPlan = subscription ? PLAN_DETAILS[subscription.plan_id as keyof typeof PLAN_DETAILS] || PLAN_DETAILS.free : PLAN_DETAILS.free;
  const isTrial = subscription?.status === 'trialing';
  const isActive = subscription?.status === 'active';

  const availablePlans = [
    { id: 'founder_1', ...PLAN_DETAILS.founder_1, priceUsd: 19, priceInr: 1599, interval: 'monthly' },
    { id: 'founder_2', ...PLAN_DETAILS.founder_2, priceUsd: 49, priceInr: 4199, interval: 'monthly' },
    { id: 'founder_3', ...PLAN_DETAILS.founder_3, priceUsd: 149, priceInr: 12499, interval: 'monthly' },
    { id: 'lifetime', ...PLAN_DETAILS.lifetime, priceUsd: 999, priceInr: 83299, interval: 'one-time' },
  ];

  if (loading) {
    return (
      <MainLayout>
        <div className="min-h-screen bg-ghost-canvas p-6 flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="min-h-screen bg-ghost-canvas p-6">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="font-display text-3xl font-bold text-midnight-navy mb-2">Pricing & Usage</h1>
            <p className="text-slate-ink">Manage your subscription and monitor usage</p>
          </div>

          {/* Trial Banner */}
          <TrialBanner />

          {/* Current Plan */}
          <div className="bg-white p-6 rounded-2xl border border-fog-border shadow-sm mb-8">
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <Crown className="w-6 h-6 text-midnight-navy" />
                  <h2 className="text-2xl font-bold text-midnight-navy font-display">Current Plan: {currentPlan.name}</h2>
                  <Badge className={`${
                    isActive ? 'bg-green-100 text-green-800 border-green-200' :
                    isTrial ? 'bg-blue-100 text-blue-800 border-blue-200' :
                    'bg-gray-100 text-gray-800 border-gray-200'
                  }`}>
                    {subscription?.status?.charAt(0).toUpperCase() + subscription?.status?.slice(1) || 'Free'}
                  </Badge>
                  <FounderBadge 
                    type={getBadgeType(user?.is_founder || false, user?.subscription_tier)} 
                  />
                </div>
                <p className="text-slate-ink mb-4">
                  {currentPlan.price}/{currentPlan.billing.toLowerCase()}
                  {subscription?.current_period_end && (
                    <> • Next billing: {new Date(subscription.current_period_end).toLocaleDateString()}</>
                  )}
                  {isTrial && subscription?.trial_end && (
                    <> • Trial ends: {new Date(subscription.trial_end).toLocaleDateString()}</>
                  )}
                </p>
                <div className="flex flex-wrap gap-2">
                  {currentPlan.features.slice(0, 4).map((feature, index) => (
                    <span key={index} className="text-sm bg-ghost-canvas text-slate-ink px-3 py-1 rounded-full">
                      {feature}
                    </span>
                  ))}
                  {currentPlan.features.length > 4 && (
                    <span className="text-sm text-midnight-navy font-medium">+{currentPlan.features.length - 4} more</span>
                  )}
                </div>
              </div>
              <div className="text-right">
                {isTrial && (
                  <a href="/pricing">
                    <Button className="btn-primary">
                      Upgrade Now
                    </Button>
                  </a>
                )}
                {isActive && subscription?.plan_id !== 'lifetime' && (
                  <p className="text-sm text-slate-ink/60 mt-2">Manage via Razorpay</p>
                )}
              </div>
            </div>
          </div>

          {/* Available Plans */}
          {!isTrial && !isActive && (
            <div className="mb-8">
              <h2 className="font-display text-2xl font-bold text-midnight-navy mb-6">Upgrade Your Plan</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {availablePlans.map((plan) => (
                  <div 
                    key={plan.id}
                    className="bg-white p-6 rounded-2xl border border-fog-border shadow-sm transition-all hover:border-midnight-navy/20"
                  >
                    <h3 className="text-xl font-bold text-midnight-navy mb-2 font-display">{plan.name}</h3>
                    <div className="mb-4">
                      <span className="text-3xl font-bold text-midnight-navy">{plan.price}</span>
                      <span className="text-slate-ink/60">/{plan.billing.toLowerCase()}</span>
                    </div>
                    
                    <ul className="space-y-3 mb-6">
                      {plan.features.map((feature, featureIndex) => (
                        <li key={featureIndex} className="flex items-center gap-3">
                          <Check className="w-4 h-4 text-chartreuse flex-shrink-0" />
                          <span className="text-slate-ink text-sm">{feature}</span>
                        </li>
                      ))}
                    </ul>
                    
                    <RazorpayCheckout
                      planId={plan.id}
                      planName={plan.name}
                      amount={plan.priceUsd}
                      currency="USD"
                      onSuccess={fetchSubscription}
                    >
                      <span className="font-mono uppercase tracking-wider">
                        Get {plan.name} →
                      </span>
                    </RazorpayCheckout>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Billing History */}
          {isActive && (
            <div className="bg-white p-6 rounded-2xl border border-fog-border shadow-sm">
              <h3 className="font-display text-lg font-semibold text-midnight-navy mb-6">Billing History</h3>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-ghost-canvas rounded-xl">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-midnight-navy/5 flex items-center justify-center">
                      <CreditCard className="w-5 h-5 text-midnight-navy" />
                    </div>
                    <div>
                      <p className="text-midnight-navy font-medium">{new Date(subscription.created_at).toLocaleDateString()}</p>
                      <p className="text-slate-ink/60 text-sm">Initial subscription</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-4">
                    <span className="text-midnight-navy font-medium">{currentPlan.price}</span>
                    <Badge variant="outline" className="border-chartreuse text-midnight-navy bg-chartreuse/10">
                      Paid
                    </Badge>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </MainLayout>
  );
}
