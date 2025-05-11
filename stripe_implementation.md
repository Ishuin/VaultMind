# Stripe Implementation Code for ThoughtWeb Navigator

This document provides the code snippets needed to implement Stripe payment integration in the ThoughtWeb Navigator application.

## Backend Implementation (Supabase Edge Functions)

### 1. Create Checkout Session Function

```typescript
// supabase/functions/create-checkout-session/index.ts
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import Stripe from 'https://esm.sh/stripe@12.0.0?target=deno'

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') as string, {
  apiVersion: '2023-10-16',
})

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { priceId, customerId, returnUrl } = await req.json()
    
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: req.headers.get('Authorization')! } } }
    )
    
    // Get the user from Supabase auth
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    // Create or retrieve the customer
    let customer
    if (customerId) {
      customer = await stripe.customers.retrieve(customerId)
    } else {
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()

      customer = await stripe.customers.create({
        email: user.email,
        name: profile?.full_name || user.email,
        metadata: {
          supabaseUid: user.id,
        },
      })

      // Store the customer ID in the database
      await supabase
        .from('subscriptions')
        .upsert({
          id: user.id,
          customer_id: customer.id,
        })
    }

    // Create a checkout session
    const session = await stripe.checkout.sessions.create({
      customer: customer.id,
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      mode: 'subscription',
      success_url: `${returnUrl}?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: returnUrl,
      allow_promotion_codes: true,
      subscription_data: {
        metadata: {
          supabaseUid: user.id,
        },
      },
    })

    return new Response(JSON.stringify({ sessionId: session.id, url: session.url }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})
```

### 2. Create Portal Session Function

```typescript
// supabase/functions/create-portal-session/index.ts
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import Stripe from 'https://esm.sh/stripe@12.0.0?target=deno'

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') as string, {
  apiVersion: '2023-10-16',
})

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { returnUrl } = await req.json()
    
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: req.headers.get('Authorization')! } } }
    )
    
    // Get the user from Supabase auth
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    // Get the customer ID from the database
    const { data: subscription } = await supabase
      .from('subscriptions')
      .select('customer_id')
      .eq('id', user.id)
      .single()

    if (!subscription?.customer_id) {
      return new Response(JSON.stringify({ error: 'No subscription found' }), {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    // Create a portal session
    const session = await stripe.billingPortal.sessions.create({
      customer: subscription.customer_id,
      return_url: returnUrl,
    })

    return new Response(JSON.stringify({ url: session.url }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})
```

### 3. Webhook Handler Function

```typescript
// supabase/functions/webhook-handler/index.ts
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import Stripe from 'https://esm.sh/stripe@12.0.0?target=deno'

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') as string, {
  apiVersion: '2023-10-16',
})

const endpointSecret = Deno.env.get('STRIPE_WEBHOOK_SECRET') as string

serve(async (req) => {
  const signature = req.headers.get('stripe-signature')
  
  if (!signature) {
    return new Response(JSON.stringify({ error: 'No signature provided' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  try {
    const body = await req.text()
    const event = stripe.webhooks.constructEvent(body, signature, endpointSecret)
    
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Handle the event
    switch (event.type) {
      case 'customer.subscription.created':
      case 'customer.subscription.updated':
        const subscription = event.data.object
        
        // Find the user by customer ID
        const { data: subscriptionData } = await supabase
          .from('subscriptions')
          .select('id')
          .eq('customer_id', subscription.customer)
          .single()
        
        if (subscriptionData) {
          // Update the subscription in the database
          await supabase
            .from('subscriptions')
            .update({
              subscription_id: subscription.id,
              subscription_status: subscription.status,
              price_id: subscription.items.data[0].price.id,
              quantity: subscription.items.data[0].quantity,
              cancel_at_period_end: subscription.cancel_at_period_end,
              cancel_at: subscription.cancel_at ? new Date(subscription.cancel_at * 1000).toISOString() : null,
              canceled_at: subscription.canceled_at ? new Date(subscription.canceled_at * 1000).toISOString() : null,
              current_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
              current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
              trial_start: subscription.trial_start ? new Date(subscription.trial_start * 1000).toISOString() : null,
              trial_end: subscription.trial_end ? new Date(subscription.trial_end * 1000).toISOString() : null,
            })
            .eq('id', subscriptionData.id)
        }
        break
        
      case 'customer.subscription.deleted':
        const deletedSubscription = event.data.object
        
        // Find the user by customer ID
        const { data: deletedSubscriptionData } = await supabase
          .from('subscriptions')
          .select('id')
          .eq('customer_id', deletedSubscription.customer)
          .single()
        
        if (deletedSubscriptionData) {
          // Update the subscription in the database
          await supabase
            .from('subscriptions')
            .update({
              subscription_id: null,
              subscription_status: 'canceled',
              cancel_at_period_end: false,
              cancel_at: null,
              canceled_at: new Date().toISOString(),
              current_period_end: new Date(deletedSubscription.current_period_end * 1000).toISOString(),
            })
            .eq('id', deletedSubscriptionData.id)
        }
        break
    }

    return new Response(JSON.stringify({ received: true }), {
      headers: { 'Content-Type': 'application/json' },
    })
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    })
  }
})
```

### 4. Usage Tracking Function

```typescript
// supabase/functions/track-usage/index.ts
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import Stripe from 'https://esm.sh/stripe@12.0.0?target=deno'

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') as string, {
  apiVersion: '2023-10-16',
})

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { recordType, quantity } = await req.json()
    
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: req.headers.get('Authorization')! } } }
    )
    
    // Get the user from Supabase auth
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    // Record the usage
    await supabase
      .from('usage_records')
      .insert({
        user_id: user.id,
        record_type: recordType,
        quantity: quantity,
      })

    return new Response(JSON.stringify({ success: true }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})
```

## Frontend Implementation

### 1. Subscription Context

```tsx
// src/context/SubscriptionContext.tsx
import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { supabase } from '@/lib/supabase';
import { toast } from '@/hooks/use-toast';

type SubscriptionStatus = 
  | 'active'
  | 'canceled'
  | 'incomplete'
  | 'incomplete_expired'
  | 'past_due'
  | 'trialing'
  | 'unpaid';

type Subscription = {
  id: string;
  customerId: string;
  subscriptionId: string | null;
  status: SubscriptionStatus | null;
  priceId: string | null;
  quantity: number | null;
  cancelAtPeriodEnd: boolean;
  currentPeriodEnd: Date | null;
  trialEnd: Date | null;
};

type Plan = {
  id: string;
  name: string;
  description: string;
  priceMonthly: number;
  priceYearly: number;
  features: string[];
  limits: {
    sources: number;
    apiCalls: number;
    storage: number;
  };
  isActive: boolean;
  sortOrder: number;
};

type SubscriptionContextType = {
  subscription: Subscription | null;
  isLoading: boolean;
  plans: Plan[];
  currentPlan: Plan | null;
  createCheckoutSession: (priceId: string) => Promise<string | null>;
  createPortalSession: () => Promise<string | null>;
};

const SubscriptionContext = createContext<SubscriptionContextType | null>(null);

export const SubscriptionProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [plans, setPlans] = useState<Plan[]>([]);
  const [currentPlan, setCurrentPlan] = useState<Plan | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch subscription data
  useEffect(() => {
    const fetchSubscription = async () => {
      if (!user) {
        setSubscription(null);
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        
        // Fetch subscription data
        const { data: subscriptionData, error: subscriptionError } = await supabase
          .from('subscriptions')
          .select('*')
          .eq('id', user.id)
          .single();

        if (subscriptionError) {
          console.error('Error fetching subscription:', subscriptionError);
          return;
        }

        if (subscriptionData) {
          setSubscription({
            id: subscriptionData.id,
            customerId: subscriptionData.customer_id,
            subscriptionId: subscriptionData.subscription_id,
            status: subscriptionData.subscription_status as SubscriptionStatus,
            priceId: subscriptionData.price_id,
            quantity: subscriptionData.quantity,
            cancelAtPeriodEnd: subscriptionData.cancel_at_period_end,
            currentPeriodEnd: subscriptionData.current_period_end ? new Date(subscriptionData.current_period_end) : null,
            trialEnd: subscriptionData.trial_end ? new Date(subscriptionData.trial_end) : null,
          });
        }

        // Fetch plans
        const { data: plansData, error: plansError } = await supabase
          .from('subscription_plans')
          .select('*')
          .eq('is_active', true)
          .order('sort_order');

        if (plansError) {
          console.error('Error fetching plans:', plansError);
          return;
        }

        if (plansData) {
          const formattedPlans = plansData.map(plan => ({
            id: plan.id,
            name: plan.name,
            description: plan.description,
            priceMonthly: plan.price_monthly,
            priceYearly: plan.price_yearly,
            features: plan.features,
            limits: plan.limits,
            isActive: plan.is_active,
            sortOrder: plan.sort_order,
          }));
          
          setPlans(formattedPlans);
          
          // Set current plan
          if (subscriptionData?.price_id) {
            const currentPlan = formattedPlans.find(plan => 
              plan.id === subscriptionData.price_id
            );
            setCurrentPlan(currentPlan || null);
          }
        }
      } catch (error) {
        console.error('Error fetching subscription data:', error);
        toast({
          title: 'Error',
          description: 'Failed to load subscription data',
          variant: 'destructive',
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchSubscription();
  }, [user]);

  // Create checkout session
  const createCheckoutSession = async (priceId: string): Promise<string | null> => {
    try {
      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/create-checkout-session`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${supabase.auth.getSession().then(res => res.data.session?.access_token)}`,
        },
        body: JSON.stringify({
          priceId,
          customerId: subscription?.customerId,
          returnUrl: `${window.location.origin}/settings/subscription`,
        }),
      });

      const data = await response.json();
      
      if (data.error) {
        throw new Error(data.error);
      }

      return data.url;
    } catch (error) {
      console.error('Error creating checkout session:', error);
      toast({
        title: 'Error',
        description: 'Failed to create checkout session',
        variant: 'destructive',
      });
      return null;
    }
  };

  // Create portal session
  const createPortalSession = async (): Promise<string | null> => {
    try {
      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/create-portal-session`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${supabase.auth.getSession().then(res => res.data.session?.access_token)}`,
        },
        body: JSON.stringify({
          returnUrl: `${window.location.origin}/settings/subscription`,
        }),
      });

      const data = await response.json();
      
      if (data.error) {
        throw new Error(data.error);
      }

      return data.url;
    } catch (error) {
      console.error('Error creating portal session:', error);
      toast({
        title: 'Error',
        description: 'Failed to create customer portal session',
        variant: 'destructive',
      });
      return null;
    }
  };

  return (
    <SubscriptionContext.Provider
      value={{
        subscription,
        isLoading,
        plans,
        currentPlan,
        createCheckoutSession,
        createPortalSession,
      }}
    >
      {children}
    </SubscriptionContext.Provider>
  );
};

export const useSubscription = () => {
  const context = useContext(SubscriptionContext);
  if (!context) {
    throw new Error('useSubscription must be used within a SubscriptionProvider');
  }
  return context;
};
```

### 2. Subscription Plans Component

```tsx
// src/components/subscription/SubscriptionPlans.tsx
import React from 'react';
import { useSubscription } from '@/context/SubscriptionContext';
import { useAuth } from '@/context/AuthContext';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Check, Loader2 } from 'lucide-react';

const SubscriptionPlans = () => {
  const { plans, currentPlan, isLoading, createCheckoutSession } = useSubscription();
  const { user } = useAuth();
  const [selectedInterval, setSelectedInterval] = React.useState<'monthly' | 'yearly'>('monthly');
  const [isProcessing, setIsProcessing] = React.useState(false);

  const handleSubscribe = async (priceId: string) => {
    if (!user) {
      // Redirect to login
      window.location.href = '/auth';
      return;
    }

    setIsProcessing(true);
    try {
      const url = await createCheckoutSession(priceId);
      if (url) {
        window.location.href = url;
      }
    } finally {
      setIsProcessing(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-thoughtweb-purple" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-center mb-6">
        <div className="bg-gray-100 dark:bg-gray-800 p-1 rounded-lg inline-flex">
          <button
            className={`px-4 py-2 rounded-md ${
              selectedInterval === 'monthly'
                ? 'bg-white dark:bg-gray-700 shadow-sm'
                : 'text-gray-500 dark:text-gray-400'
            }`}
            onClick={() => setSelectedInterval('monthly')}
          >
            Monthly
          </button>
          <button
            className={`px-4 py-2 rounded-md ${
              selectedInterval === 'yearly'
                ? 'bg-white dark:bg-gray-700 shadow-sm'
                : 'text-gray-500 dark:text-gray-400'
            }`}
            onClick={() => setSelectedInterval('yearly')}
          >
            Yearly <span className="text-xs text-green-500">Save 20%</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {plans.map((plan) => {
          const price = selectedInterval === 'monthly' ? plan.priceMonthly : plan.priceYearly;
          const priceId = selectedInterval === 'monthly' ? `${plan.id}_monthly` : `${plan.id}_yearly`;
          const isCurrentPlan = currentPlan?.id === plan.id;

          return (
            <Card
              key={plan.id}
              className={`flex flex-col ${
                plan.name === 'Premium'
                  ? 'border-thoughtweb-purple shadow-md dark:border-thoughtweb-purple'
                  : ''
              }`}
            >
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle>{plan.name}</CardTitle>
                    <CardDescription>{plan.description}</CardDescription>
                  </div>
                  {plan.name === 'Premium' && (
                    <Badge className="bg-thoughtweb-purple">Popular</Badge>
                  )}
                </div>
              </CardHeader>
              <CardContent className="flex-1">
                <div className="mb-4">
                  <span className="text-3xl font-bold">${(price / 100).toFixed(2)}</span>
                  <span className="text-gray-500 dark:text-gray-400">/{selectedInterval === 'monthly' ? 'month' : 'year'}</span>
                </div>
                <ul className="space-y-2">
                  {plan.features.map((feature, index) => (
                    <li key={index} className="flex items-start">
                      <Check className="h-5 w-5 text-green-500 mr-2 flex-shrink-0" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
              <CardFooter>
                <Button
                  className={`w-full ${
                    plan.name === 'Premium'
                      ? 'bg-thoughtweb-purple hover:bg-thoughtweb-purple/90'
                      : ''
                  }`}
                  disabled={isCurrentPlan || isProcessing}
                  onClick={() => handleSubscribe(priceId)}
                >
                  {isProcessing ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Processing...
                    </>
                  ) : isCurrentPlan ? (
                    'Current Plan'
                  ) : (
                    'Subscribe'
                  )}
                </Button>
              </CardFooter>
            </Card>
          );
        })}
      </div>
    </div>
  );
};

export default SubscriptionPlans;
```

### 3. Subscription Management Component

```tsx
// src/components/subscription/SubscriptionManagement.tsx
import React from 'react';
import { useSubscription } from '@/context/SubscriptionContext';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Loader2, CreditCard, Calendar } from 'lucide-react';
import { format } from 'date-fns';

const SubscriptionManagement = () => {
  const { subscription, currentPlan, isLoading, createPortalSession } = useSubscription();
  const [isProcessing, setIsProcessing] = React.useState(false);

  const handleManageSubscription = async () => {
    setIsProcessing(true);
    try {
      const url = await createPortalSession();
      if (url) {
        window.location.href = url;
      }
    } finally {
      setIsProcessing(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-thoughtweb-purple" />
      </div>
    );
  }

  if (!subscription || !subscription.subscriptionId) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>No Active Subscription</CardTitle>
          <CardDescription>
            You don't have an active subscription. Choose a plan to get started.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p>Upgrade to access premium features and increase your usage limits.</p>
        </CardContent>
        <CardFooter>
          <Button onClick={() => window.location.href = '/settings/subscription/plans'}>
            View Plans
          </Button>
        </CardFooter>
      </Card>
    );
  }

  const getStatusBadgeColor = (status: string | null) => {
    switch (status) {
      case 'active':
        return 'bg-green-500';
      case 'trialing':
        return 'bg-blue-500';
      case 'past_due':
        return 'bg-yellow-500';
      case 'canceled':
        return 'bg-gray-500';
      default:
        return 'bg-gray-500';
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle>Your Subscription</CardTitle>
            <CardDescription>
              Manage your subscription and billing details
            </CardDescription>
          </div>
          <Badge className={getStatusBadgeColor(subscription.status)}>
            {subscription.status === 'trialing' ? 'Trial' : 
             subscription.status === 'active' ? 'Active' : 
             subscription.status === 'past_due' ? 'Past Due' : 
             subscription.status === 'canceled' ? 'Canceled' : 
             subscription.status}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {currentPlan && (
          <div>
            <h3 className="font-medium">Current Plan</h3>
            <p className="text-2xl font-bold">{currentPlan.name}</p>
          </div>
        )}
        
        {subscription.currentPeriodEnd && (
          <div className="flex items-center">
            <Calendar className="h-5 w-5 mr-2 text-gray-500" />
            <div>
              <p className="text-sm text-gray-500">
                {subscription.cancelAtPeriodEnd 
                  ? 'Your subscription will end on' 
                  : 'Your next billing date is'}
              </p>
              <p className="font-medium">
                {format(new Date(subscription.currentPeriodEnd), 'MMMM d, yyyy')}
              </p>
            </div>
          </div>
        )}
        
        {subscription.trialEnd && new Date(subscription.trialEnd) > new Date() && (
          <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-md">
            <p className="text-sm">
              Your trial ends on {format(new Date(subscription.trialEnd), 'MMMM d, yyyy')}
            </p>
          </div>
        )}
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button variant="outline" onClick={() => window.location.href = '/settings/subscription/plans'}>
          Change Plan
        </Button>
        <Button onClick={handleManageSubscription} disabled={isProcessing}>
          {isProcessing ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Processing...
            </>
          )
