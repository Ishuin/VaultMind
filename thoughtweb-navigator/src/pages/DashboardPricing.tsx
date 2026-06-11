import React from 'react';
import { CreditCard, TrendingUp, Crown, Check, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { MainLayout } from "@/components/layout/MainLayout";
import { useAuth } from "@/context/AuthContext";

export default function DashboardPricingPage() {
  const { user } = useAuth();

  const currentPlan = {
    name: 'Pro',
    price: '$29',
    billing: 'Monthly',
    features: ['Unlimited features and others', 'Early access to new features', 'Unlimited storage', 'Email and Slack support', 'Custom integrations', 'Team sharing', 'AI access']
  };

  const plans = [
    {
      name: 'Free',
      price: '$0',
      billing: 'Forever',
      description: 'Perfect for getting started with basic knowledge management',
      features: [
        'Up to 100 notes',
        'Basic search',
        '1GB storage',
        'Web access'
      ],
      popular: false,
      current: false
    },
    {
      name: 'Pro',
      price: '$29',
      billing: 'Monthly',
      description: 'Advanced features for power users and enhanced workflow',
      features: [
        'Unlimited features and others',
        'Early access to new features',
        'Unlimited storage',
        'AI access',
        'Email and Slack support',
        'Custom integrations',
        'Team sharing'
      ],
      popular: true,
      current: true
    },
    {
      name: 'Enterprise',
      price: 'Custom',
      billing: 'Yearly',
      description: 'For teams and organizations with advanced security needs',
      features: [
        'Everything in Pro',
        'Unlimited storage',
        'Unlimited queries',
        'Custom integrations',
        'Dedicated support',
        'Advanced security',
        'Team sharing'
      ],
      popular: false,
      current: false
    }
  ];

  const usageStats = [
    { label: 'Queries Used', value: '847', limit: '∞', percentage: 0 },
    { label: 'Storage Used', value: '2.4 GB', limit: '∞', percentage: 0 },
    { label: 'API Calls', value: '12,450', limit: '∞', percentage: 0 },
    { label: 'Data Sources', value: '3', limit: '∞', percentage: 0 }
  ];

  return (
    <MainLayout>
      <div className="min-h-screen bg-ghost-canvas p-6">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="font-display text-3xl font-bold text-midnight-navy mb-2">Pricing & Usage</h1>
            <p className="text-slate-ink">Manage your subscription and monitor usage</p>
          </div>

          {/* Current Plan */}
          <div className="bg-white p-6 rounded-2xl border border-fog-border shadow-sm mb-8">
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <Crown className="w-6 h-6 text-midnight-navy" />
                  <h2 className="text-2xl font-bold text-midnight-navy font-display">Current Plan: {currentPlan.name}</h2>
                  <Badge className="bg-chartreuse/10 text-midnight-navy border-chartreuse/20">Active</Badge>
                </div>
                <p className="text-slate-ink mb-4">
                  {currentPlan.price}/{currentPlan.billing.toLowerCase()} • Next billing: October 15, 2024
                </p>
                <div className="flex flex-wrap gap-2">
                  {currentPlan.features.slice(0, 4).map((feature, index) => (
                    <span key={index} className="text-sm bg-ghost-canvas text-slate-ink px-3 py-1 rounded-full">
                      {feature}
                    </span>
                  ))}
                  <span className="text-sm text-midnight-navy font-medium">+{currentPlan.features.length - 4} more</span>
                </div>
              </div>
              <div className="text-right">
                <Button variant="outline" className="border-fog-border text-slate-ink">
                  <ExternalLink className="w-4 h-4 mr-2" />
                  Manage Billing
                </Button>
                <p className="text-sm text-slate-ink/60 mt-2">Manage via Stripe</p>
              </div>
            </div>
          </div>

          {/* Usage Statistics */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            {usageStats.map((stat, index) => (
              <div key={index} className="bg-white p-6 rounded-2xl border border-fog-border shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-10 h-10 rounded-full bg-midnight-navy/5 flex items-center justify-center">
                    <TrendingUp className="w-5 h-5 text-midnight-navy" />
                  </div>
                  <span className="text-chartreuse text-sm font-medium">Unlimited</span>
                </div>
                <p className="text-slate-ink text-sm">{stat.label}</p>
                <p className="text-2xl font-bold text-midnight-navy">{stat.value}</p>
                <p className="text-slate-ink/40 text-sm">of {stat.limit}</p>
              </div>
            ))}
          </div>

          {/* Available Plans */}
          <div className="mb-8">
            <h2 className="font-display text-2xl font-bold text-midnight-navy mb-6">Available Plans</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {plans.map((plan, index) => (
                <div 
                  key={index}
                  className={`bg-white p-6 rounded-2xl border shadow-sm transition-all ${
                    plan.current 
                      ? 'border-midnight-navy' 
                      : plan.popular 
                      ? 'border-fog-border' 
                      : 'border-fog-border hover:border-midnight-navy/20'
                  }`}
                >
                  {plan.popular && (
                    <Badge className="bg-chartreuse/10 text-midnight-navy border-chartreuse/20 mb-4">
                      Most Popular
                    </Badge>
                  )}
                  
                  {plan.current && (
                    <Badge className="bg-midnight-navy/10 text-midnight-navy border-midnight-navy/20 mb-4">
                      Current Plan
                    </Badge>
                  )}
                  
                  <h3 className="text-xl font-bold text-midnight-navy mb-2 font-display">{plan.name}</h3>
                  <div className="mb-4">
                    <span className="text-3xl font-bold text-midnight-navy">{plan.price}</span>
                    <span className="text-slate-ink/60">/{plan.billing.toLowerCase()}</span>
                  </div>
                  
                  <p className="text-slate-ink text-sm mb-6">{plan.description}</p>
                  
                  <ul className="space-y-3 mb-6">
                    {plan.features.map((feature, featureIndex) => (
                      <li key={featureIndex} className="flex items-center gap-3">
                        <Check className="w-4 h-4 text-chartreuse flex-shrink-0" />
                        <span className="text-slate-ink text-sm">{feature}</span>
                      </li>
                    ))}
                  </ul>
                  
                  <Button 
                    className={`w-full ${
                      plan.current 
                        ? 'bg-ghost-canvas text-slate-ink/60 cursor-not-allowed' 
                        : plan.popular 
                        ? 'btn-primary' 
                        : 'bg-midnight-navy/5 hover:bg-midnight-navy/10 text-midnight-navy'
                    }`}
                    disabled={plan.current}
                  >
                    {plan.current ? 'Current Plan' : plan.name === 'Enterprise' ? 'Contact Sales' : 'Upgrade'}
                  </Button>
                </div>
              ))}
            </div>
          </div>

          {/* Billing History */}
          <div className="bg-white p-6 rounded-2xl border border-fog-border shadow-sm">
            <h3 className="font-display text-lg font-semibold text-midnight-navy mb-6">Billing History</h3>
            
            <div className="space-y-4">
              {[
                { date: 'Sep 15, 2024', amount: '$29', status: 'Paid', invoice: 'INV-2024-009' },
                { date: 'Aug 15, 2024', amount: '$29', status: 'Paid', invoice: 'INV-2024-008' },
                { date: 'Jul 15, 2024', amount: '$29', status: 'Paid', invoice: 'INV-2024-007' }
              ].map((bill, index) => (
                <div 
                  key={index}
                  className="flex items-center justify-between p-4 bg-ghost-canvas rounded-xl"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-midnight-navy/5 flex items-center justify-center">
                      <CreditCard className="w-5 h-5 text-midnight-navy" />
                    </div>
                    <div>
                      <p className="text-midnight-navy font-medium">{bill.date}</p>
                      <p className="text-slate-ink/60 text-sm">{bill.invoice}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-4">
                    <span className="text-midnight-navy font-medium">{bill.amount}</span>
                    <Badge variant="outline" className="border-chartreuse text-midnight-navy bg-chartreuse/10">
                      {bill.status}
                    </Badge>
                    <Button variant="ghost" size="sm" className="text-slate-ink/60 hover:text-midnight-navy">
                      Download
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
