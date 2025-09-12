import React from 'react';
import { CreditCard, TrendingUp, Zap, Crown, Check, ExternalLink } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { MainLayout } from "@/components/layout/MainLayout";
import { useAuth } from "@/context/AuthContext";

export default function DashboardPricingPage() {
  const { user } = useAuth();

  const currentPlan = {
    name: 'Pro',
    price: '₹1299',
    billing: 'Monthly',
    features: ['Unlimited features and others', 'Early access to new features', 'Unlimited storage', 'Email and Slack support', 'Custom integrations', 'Team sharing', 'AI access']
  };

  const plans = [
    {
      name: 'Free',
      price: '₹0',
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
      price: '₹1299',
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
      <div className="min-h-screen bg-black p-6">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-white mb-2">Pricing & Usage</h1>
            <p className="text-gray-400">Manage your subscription and monitor usage</p>
          </div>

          {/* Current Plan */}
          <div className="glass-panel p-6 rounded-3xl mb-8">
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <Crown className="w-6 h-6 text-cyan-400" />
                  <h2 className="text-2xl font-bold text-white">Current Plan: {currentPlan.name}</h2>
                  <Badge className="bg-cyan-500/20 text-cyan-400 border-cyan-500/30">Active</Badge>
                </div>
                <p className="text-gray-300 mb-4">
                  {currentPlan.price}/{currentPlan.billing.toLowerCase()} • Next billing: October 15, 2024
                </p>
                <div className="flex flex-wrap gap-2">
                  {currentPlan.features.slice(0, 4).map((feature, index) => (
                    <span key={index} className="text-sm bg-gray-800/50 text-gray-300 px-2 py-1 rounded">
                      {feature}
                    </span>
                  ))}
                  <span className="text-sm text-cyan-400">+{currentPlan.features.length - 4} more</span>
                </div>
              </div>
              <div className="text-right">
                <Button variant="outline" className="border-gray-600 text-gray-300">
                  <ExternalLink className="w-4 h-4 mr-2" />
                  Manage Billing
                </Button>
                <p className="text-sm text-gray-400">Manage via Stripe</p>
              </div>
            </div>
          </div>

          {/* Usage Statistics */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            {usageStats.map((stat, index) => (
              <div key={index} className="group relative overflow-hidden glass-panel p-6 rounded-3xl">
                <div className="relative z-10">
                  <div className="flex items-center justify-between mb-4">
                    <TrendingUp className="w-6 h-6 text-cyan-400" />
                    <span className="text-cyan-400 text-sm">Unlimited</span>
                  </div>
                  <p className="text-gray-400 text-sm">{stat.label}</p>
                  <p className="text-2xl font-bold text-white">{stat.value}</p>
                  <p className="text-gray-500 text-sm">of {stat.limit}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Available Plans */}
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-white mb-6">Available Plans</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {plans.map((plan, index) => (
                <div 
                  key={index}
                  className={`group relative overflow-hidden glass-panel p-6 rounded-3xl transition-all ${
                    plan.current 
                      ? 'border-cyan-500/50' 
                      : plan.popular 
                      ? 'border-purple-500/50' 
                      : 'hover:border-cyan-500/50'
                  }`}
                >
                  <div className="relative z-10">
                    {plan.popular && (
                      <Badge className="bg-purple-500/20 text-purple-400 border-purple-500/30 mb-4">
                        Most Popular
                      </Badge>
                    )}
                    
                    {plan.current && (
                      <Badge className="bg-cyan-500/20 text-cyan-400 border-cyan-500/30 mb-4">
                        Current Plan
                      </Badge>
                    )}
                    
                    <h3 className="text-xl font-bold text-white mb-2">{plan.name}</h3>
                    <div className="mb-4">
                      <span className="text-3xl font-bold text-white">{plan.price}</span>
                      <span className="text-gray-400">/{plan.billing.toLowerCase()}</span>
                    </div>
                    
                    <p className="text-gray-400 text-sm mb-6">{plan.description}</p>
                    
                    <ul className="space-y-3 mb-6">
                      {plan.features.map((feature, featureIndex) => (
                        <li key={featureIndex} className="flex items-center gap-3">
                          <Check className="w-4 h-4 text-green-400 flex-shrink-0" />
                          <span className="text-gray-300 text-sm">{feature}</span>
                        </li>
                      ))}
                    </ul>
                    
                    <Button 
                      className={`w-full ${
                        plan.current 
                          ? 'bg-gray-600 text-gray-300 cursor-not-allowed' 
                          : plan.popular 
                          ? 'bg-purple-500 hover:bg-purple-600 text-white' 
                          : 'bg-cyan-500 hover:bg-cyan-600 text-black'
                      }`}
                      disabled={plan.current}
                    >
                      {plan.current ? 'Current Plan' : plan.name === 'Enterprise' ? 'Contact Sales' : 'Upgrade'}
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Billing History */}
          <div className="glass-panel p-6 rounded-3xl">
            <h3 className="text-xl font-semibold text-white mb-6">Billing History</h3>
            
            <div className="space-y-4">
              {[
                { date: 'Sep 15, 2024', amount: '₹1299', status: 'Paid', invoice: 'INV-2024-009' },
                { date: 'Aug 15, 2024', amount: '₹1299', status: 'Paid', invoice: 'INV-2024-008' },
                { date: 'Jul 15, 2024', amount: '₹1299', status: 'Paid', invoice: 'INV-2024-007' }
              ].map((bill, index) => (
                <div 
                  key={index}
                  className="group relative overflow-hidden flex items-center justify-between p-4 glass-panel rounded-lg hover:border-cyan-500/50 transition-all"
                >
                  <div className="relative z-10 flex items-center gap-4">
                    <CreditCard className="w-5 h-5 text-cyan-400" />
                    <div>
                      <p className="text-white font-medium">{bill.date}</p>
                      <p className="text-gray-400 text-sm">{bill.invoice}</p>
                    </div>
                  </div>
                  
                  <div className="relative z-10 flex items-center gap-4">
                    <span className="text-white font-medium">{bill.amount}</span>
                    <Badge variant="outline" className="border-green-500 text-green-400">
                      {bill.status}
                    </Badge>
                    <Button variant="ghost" size="sm" className="text-gray-400 hover:text-gray-300">
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
