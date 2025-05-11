# Stripe Integration Guide for ThoughtWeb Navigator

This document provides detailed technical guidance for implementing Stripe payment processing in the ThoughtWeb Navigator application. It covers subscription management, payment processing, webhook handling, and frontend integration.

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Stripe Account Setup](#stripe-account-setup)
3. [Backend Implementation](#backend-implementation)
4. [Frontend Implementation](#frontend-implementation)
5. [Webhook Integration](#webhook-integration)
6. [Testing](#testing)
7. [Going Live](#going-live)
8. [Maintenance and Monitoring](#maintenance-and-monitoring)

## Prerequisites

Before beginning the Stripe integration, ensure you have:

- A Stripe account (create one at [stripe.com](https://stripe.com))
- API keys from your Stripe dashboard
- Node.js backend environment (for webhook handling)
- Secure HTTPS endpoints for production

## Stripe Account Setup

### 1. Create Products and Pricing Plans

Set up the subscription tiers in the Stripe dashboard:

1. Navigate to **Products** in your Stripe dashboard
2. Create the following products and pricing plans:

   **Personal Plan**
   - Price: $9.99/month or $99/year
   - Features: As defined in the unified product strategy
   - Set up both monthly and annual pricing options

   **Professional Plan**
   - Price: $19.99/month or $199/year
   - Features: As defined in the unified product strategy
   - Set up both monthly and annual pricing options

   **Enterprise Plan**
   - Configure as a custom pricing plan
   - Enable quote creation for sales team

### 2. Configure Stripe Settings

1. Set up your business details and branding
2. Configure email receipts and notifications
3. Set up tax rates if applicable
4. Configure payment methods (credit cards, PayPal, etc.)

### 3. Generate API Keys

1. Navigate to **Developers > API Keys** in your Stripe dashboard
2. Note your publishable key and secret key
3. Create restricted API keys for specific services if needed

## Backend Implementation

### 1. Install Dependencies

```bash
# For Node.js backend
npm install stripe @types/stripe

# For Python/FastAPI backend
pip install stripe
```

### 2. Initialize Stripe Client

```typescript
// TypeScript example
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2023-10-16', // Use the latest API version
});
```

```python
# Python example
import stripe
stripe.api_key = os.environ.get('STRIPE_SECRET_KEY')
```

### 3. Create Subscription Management API

#### Customer Creation

```typescript
// Create a new customer in Stripe
async function createCustomer(email: string, name: string) {
  const customer = await stripe.customers.create({
    email,
    name,
    metadata: {
      userId: 'user-id-from-your-system',
    },
  });
  
  return customer;
}
```

#### Subscription Creation

```typescript
// Create a new subscription
async function createSubscription(customerId: string, priceId: string) {
  const subscription = await stripe.subscriptions.create({
    customer: customerId,
    items: [{ price: priceId }],
    payment_behavior: 'default_incomplete',
    expand: ['latest_invoice.payment_intent'],
  });
  
  return subscription;
}
```

#### Subscription Management

```typescript
// Update a subscription
async function updateSubscription(subscriptionId: string, newPriceId: string) {
  const subscription = await stripe.subscriptions.retrieve(subscriptionId);
  
  const updatedSubscription = await stripe.subscriptions.update(subscriptionId, {
    items: [
      {
        id: subscription.items.data[0].id,
        price: newPriceId,
      },
    ],
  });
  
  return updatedSubscription;
}

// Cancel a subscription
async function cancelSubscription(subscriptionId: string) {
  const canceledSubscription = await stripe.subscriptions.cancel(subscriptionId);
  return canceledSubscription;
}
```

### 4. Create API Endpoints

```typescript
// Example using Express.js
import express from 'express';
const router = express.Router();

// Create checkout session
router.post('/create-checkout-session', async (req, res) => {
  const { priceId, customerId } = req.body;
  
  try {
    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      customer: customerId,
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      success_url: `${process.env.CLIENT_URL}/subscription/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.CLIENT_URL}/subscription/canceled`,
    });
    
    res.json({ url: session.url });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create customer portal session
router.post('/create-portal-session', async (req, res) => {
  const { customerId } = req.body;
  
  try {
    const session = await stripe.billingPortal.sessions.create({
      customer: customerId,
      return_url: `${process.env.CLIENT_URL}/account`,
    });
    
    res.json({ url: session.url });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
```

```python
# Example using FastAPI
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

router = APIRouter()

class CheckoutSessionRequest(BaseModel):
    price_id: str
    customer_id: str

@router.post("/create-checkout-session")
async def create_checkout_session(request: CheckoutSessionRequest):
    try:
        session = stripe.checkout.Session.create(
            mode="subscription",
            customer=request.customer_id,
            line_items=[
                {
                    "price": request.price_id,
                    "quantity": 1,
                },
            ],
            success_url=f"{os.environ.get('CLIENT_URL')}/subscription/success?session_id={{CHECKOUT_SESSION_ID}}",
            cancel_url=f"{os.environ.get('CLIENT_URL')}/subscription/canceled",
        )
        
        return {"url": session.url}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
```

### 5. Database Schema for Subscriptions

Create the following tables in your database:

**customers**
```sql
CREATE TABLE customers (
  id SERIAL PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  stripe_customer_id TEXT UNIQUE NOT NULL,
  email TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

**subscriptions**
```sql
CREATE TABLE subscriptions (
  id SERIAL PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  stripe_subscription_id TEXT UNIQUE NOT NULL,
  stripe_price_id TEXT NOT NULL,
  status TEXT NOT NULL,
  current_period_start TIMESTAMP WITH TIME ZONE NOT NULL,
  current_period_end TIMESTAMP WITH TIME ZONE NOT NULL,
  cancel_at_period_end BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

**usage_records**
```sql
CREATE TABLE usage_records (
  id SERIAL PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  resource_type TEXT NOT NULL, -- 'query', 'storage', 'source'
  quantity INTEGER NOT NULL,
  recorded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

## Frontend Implementation

### 1. Install Dependencies

```bash
npm install @stripe/stripe-js @stripe/react-stripe-js
```

### 2. Initialize Stripe

```tsx
// src/lib/stripe.ts
import { loadStripe } from '@stripe/stripe-js';

export const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY);
```

### 3. Create Subscription UI Components

#### Pricing Page

```tsx
// src/components/pricing/PricingPlans.tsx
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/hooks/use-auth';

interface PricingPlan {
  name: string;
  description: string;
  price: {
    monthly: number;
    annually: number;
  };
  features: string[];
  stripePriceId: {
    monthly: string;
    annually: string;
  };
}

const plans: PricingPlan[] = [
  {
    name: 'Free',
    description: 'Basic features for personal use',
    price: { monthly: 0, annually: 0 },
    features: [
      '5 sources',
      'Basic LLM access',
      '50 queries per month',
      '100MB storage',
      'Community support',
    ],
    stripePriceId: { monthly: '', annually: '' },
  },
  {
    name: 'Personal',
    description: 'Advanced features for individuals',
    price: { monthly: 9.99, annually: 99 },
    features: [
      '50 sources',
      'Standard and advanced LLM models',
      '500 queries per month',
      '1GB storage',
      'Priority email support',
      'Advanced search capabilities',
    ],
    stripePriceId: { 
      monthly: 'price_monthly_personal_id_from_stripe', 
      annually: 'price_annual_personal_id_from_stripe' 
    },
  },
  {
    name: 'Professional',
    description: 'Premium features for professionals',
    price: { monthly: 19.99, annually: 199 },
    features: [
      'Unlimited sources',
      'All LLM models including GPT-4',
      '2,000 queries per month',
      '5GB storage',
      'Priority support',
      'API access',
      'Collaboration features (up to 3 users)',
    ],
    stripePriceId: { 
      monthly: 'price_monthly_professional_id_from_stripe', 
      annually: 'price_annual_professional_id_from_stripe' 
    },
  },
];

export function PricingPlans() {
  const [billingInterval, setBillingInterval] = React.useState<'monthly' | 'annually'>('monthly');
  const { user } = useAuth();

  const handleSubscribe = async (priceId: string) => {
    try {
      const response = await fetch('/api/create-checkout-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          priceId,
        }),
      });

      const { url } = await response.json();
      window.location.href = url;
    } catch (error) {
      console.error('Error creating checkout session:', error);
    }
  };

  return (
    <div className="container mx-auto py-10">
      <div className="flex justify-center mb-8">
        <div className="inline-flex items-center rounded-full border p-1">
          <button
            onClick={() => setBillingInterval('monthly')}
            className={`px-4 py-2 rounded-full ${
              billingInterval === 'monthly' ? 'bg-primary text-primary-foreground' : ''
            }`}
          >
            Monthly
          </button>
          <button
            onClick={() => setBillingInterval('annually')}
            className={`px-4 py-2 rounded-full ${
              billingInterval === 'annually' ? 'bg-primary text-primary-foreground' : ''
            }`}
          >
            Annually (Save 17%)
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {plans.map((plan) => (
          <Card key={plan.name} className={plan.name === 'Professional' ? 'border-primary' : ''}>
            <CardHeader>
              <CardTitle>{plan.name}</CardTitle>
              <CardDescription>{plan.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="mb-4">
                <span className="text-3xl font-bold">
                  ${billingInterval === 'monthly' ? plan.price.monthly : plan.price.annually}
                </span>
                {plan.price.monthly > 0 && (
                  <span className="text-muted-foreground">
                    /{billingInterval === 'monthly' ? 'month' : 'year'}
                  </span>
                )}
              </div>
              <ul className="space-y-2">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-center">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5 text-green-500 mr-2"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                        clipRule="evenodd"
                      />
                    </svg>
                    {feature}
                  </li>
                ))}
              </ul>
            </CardContent>
            <CardFooter>
              {plan.price.monthly > 0 ? (
                <Button 
                  className="w-full" 
                  onClick={() => handleSubscribe(plan.stripePriceId[billingInterval])}
                  disabled={!user}
                >
                  {user ? 'Subscribe' : 'Sign in to subscribe'}
                </Button>
              ) : (
                <Button className="w-full" variant="outline" disabled={!user}>
                  {user ? 'Current Plan' : 'Sign in to start'}
                </Button>
              )}
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
}
```

#### Account Management

```tsx
// src/components/account/SubscriptionManagement.tsx
import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/hooks/use-auth';

interface Subscription {
  id: string;
  status: string;
  plan: string;
  currentPeriodEnd: string;
  cancelAtPeriodEnd: boolean;
}

export function SubscriptionManagement() {
  const { user } = useAuth();
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchSubscription();
    }
  }, [user]);

  const fetchSubscription = async () => {
    try {
      const response = await fetch('/api/subscription');
      const data = await response.json();
      setSubscription(data.subscription);
    } catch (error) {
      console.error('Error fetching subscription:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleManageSubscription = async () => {
    try {
      const response = await fetch('/api/create-portal-session', {
        method: 'POST',
      });
      const { url } = await response.json();
      window.location.href = url;
    } catch (error) {
      console.error('Error creating portal session:', error);
    }
  };

  if (loading) {
    return <div>Loading subscription details...</div>;
  }

  if (!subscription) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>No Active Subscription</CardTitle>
          <CardDescription>You are currently on the free plan</CardDescription>
        </CardHeader>
        <CardFooter>
          <Button onClick={() => window.location.href = '/pricing'}>View Plans</Button>
        </CardFooter>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Your Subscription</CardTitle>
        <CardDescription>Manage your subscription and billing</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <div className="flex justify-between">
            <span className="font-medium">Plan</span>
            <span>{subscription.plan}</span>
          </div>
          <div className="flex justify-between">
            <span className="font-medium">Status</span>
            <span className={subscription.status === 'active' ? 'text-green-500' : 'text-yellow-500'}>
              {subscription.status.charAt(0).toUpperCase() + subscription.status.slice(1)}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="font-medium">Current period ends</span>
            <span>{new Date(subscription.currentPeriodEnd).toLocaleDateString()}</span>
          </div>
          {subscription.cancelAtPeriodEnd && (
            <div className="mt-4 p-3 bg-yellow-50 text-yellow-800 rounded-md">
              Your subscription will end on {new Date(subscription.currentPeriodEnd).toLocaleDateString()}
            </div>
          )}
        </div>
      </CardContent>
      <CardFooter>
        <Button onClick={handleManageSubscription}>Manage Subscription</Button>
      </CardFooter>
    </Card>
  );
}
```

### 4. Usage Tracking UI

```tsx
// src/components/account/UsageStats.tsx
import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { useAuth } from '@/hooks/use-auth';

interface UsageStats {
  queries: {
    used: number;
    limit: number;
  };
  storage: {
    used: number; // in MB
    limit: number; // in MB
  };
  sources: {
    used: number;
    limit: number;
  };
}

export function UsageStats() {
  const { user } = useAuth();
  const [usage, setUsage] = useState<UsageStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchUsageStats();
    }
  }, [user]);

  const fetchUsageStats = async () => {
    try {
      const response = await fetch('/api/usage-stats');
      const data = await response.json();
      setUsage(data.usage);
    } catch (error) {
      console.error('Error fetching usage stats:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div>Loading usage statistics...</div>;
  }

  if (!usage) {
    return <div>No usage data available</div>;
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Queries</CardTitle>
          <CardDescription>
            {usage.queries.used} of {usage.queries.limit} queries used this month
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Progress value={(usage.queries.used / usage.queries.limit) * 100} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Storage</CardTitle>
          <CardDescription>
            {(usage.storage.used / 1024).toFixed(2)} GB of {(usage.storage.limit / 1024).toFixed(2)} GB used
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Progress value={(usage.storage.used / usage.storage.limit) * 100} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Sources</CardTitle>
          <CardDescription>
            {usage.sources.used} of {usage.sources.limit} sources used
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Progress value={(usage.sources.used / usage.sources.limit) * 100} />
        </CardContent>
      </Card>
    </div>
  );
}
```

## Webhook Integration

### 1. Set Up Webhook Endpoint

```typescript
// src/api/webhooks/stripe.ts
import { buffer } from 'micro';
import Stripe from 'stripe';
import { NextApiRequest, NextApiResponse } from 'next';
import { supabase } from '@/lib/supabase';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2023-10-16',
});

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).end('Method Not Allowed');
  }

  const buf = await buffer(req);
  const sig = req.headers['stripe-signature'];

  let event;

  try {
    event = stripe.webhooks.constructEvent(buf.toString(), sig, webhookSecret);
  } catch (err) {
    console.error(`Webhook Error: ${err.message}`);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // Handle the event
  switch (event.type) {
    case 'customer.subscription.created':
    case 'customer.subscription.updated':
      await handleSubscriptionChange(event.data.object);
      break;
    case 'customer.subscription.deleted':
      await handleSubscriptionCancellation(event.data.object);
      break;
    case 'invoice.paid':
      await handleInvoicePaid(event.data.object);
      break;
    case 'invoice.payment_failed':
      await handleInvoicePaymentFailed(event.data.object);
      break;
    default:
      console.log(`Unhandled event type: ${event.type}`);
  }

  res.json({ received: true });
}

async function handleSubscriptionChange(subscription) {
  // Get customer from Stripe subscription
  const customer = await stripe.customers.retrieve(subscription.customer);
  
  // Find user by customer metadata
  const { data: customerData } = await supabase
    .from('customers')
    .select('user_id')
    .eq('stripe_customer_id', subscription.customer)
    .single();
    
  if (!customerData) {
    console.error('Customer not found in database');
    return;
  }
  
  // Update subscription in database
  const { error } = await supabase
    .from('subscriptions')
    .upsert({
      user_id: customerData.user_id,
      stripe_subscription_id: subscription.id,
      stripe_price_id: subscription.items.data[0].price.id,
      status: subscription.status,
      current_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
      current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
      cancel_at_period_end: subscription.cancel_at_period_end,
    });
    
  if (error) {
    console.error('Error updating subscription:', error);
  }
}

async function handleSubscriptionCancellation(subscription) {
  // Find subscription in database
  const { data: subscriptionData } = await supabase
    .from('subscriptions')
    .select('user_id')
    .eq('stripe_subscription_id', subscription.id)
    .single();
    
  if (!subscriptionData) {
    console.error('Subscription not found in database');
    return;
  }
  
  // Update subscription status
  const { error } = await supabase
    .from('subscriptions')
    .update({
      status: 'canceled',
      updated_at: new Date().toISOString(),
    })
    .eq('stripe_subscription_id', subscription.id);
    
  if (error) {
    console.error('Error updating subscription:', error);
  }
}

async function handleInvoicePaid(invoice) {
  // Update subscription status if needed
  if (invoice.subscription) {
    const { error } = await supabase
      .from('subscriptions')
      .update({
        status: 'active',
        updated_at: new Date().toISOString(),
      })
      .eq('stripe_subscription_id', invoice.subscription);
      
    if (error) {
      console.error('Error updating subscription after invoice payment:', error);
    }
  }
}

async function handleInvoicePaymentFailed(invoice) {
  // Update subscription status if needed
  if (invoice.subscription) {
    const { error } = await supabase
      .from('subscriptions')
      .update({
        status: 'past_due',
        updated_at: new Date().toISOString(),
      })
      .eq('stripe_subscription_id', invoice.subscription);
      
    if (error) {
      console.error('Error updating subscription after payment failure:', error);
    }
  }
}
```

### 2. Register Webhook URL in Stripe Dashboard

1. Go to **Developers > Webhooks** in your Stripe dashboard
2. Click **Add endpoint**
3. Enter your webhook URL (e.g., `https://yourapp.com/api/webhooks/stripe`)
4. Select the events to listen for:
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.paid`
   - `invoice.payment_failed`
5. Click **Add endpoint**
6. Note the signing secret for use in your webhook handler

### 3. Test Webhook Locally

Use the Stripe CLI to test webhooks locally:

1. Install the Stripe CLI: [https://stripe.com/docs/stripe-cli](https://stripe.com/docs/stripe-cli)
2. Login to your Stripe account:
   ```bash
   stripe login
   ```
3. Forward events to your local server:
   ```bash
   stripe listen --forward-to localhost:3000/api/webhooks/stripe
   ```
4. Trigger test events:
   ```bash
   stripe trigger customer.subscription.created
   ```

## Testing

### 1. Test Mode

All development and testing should be done in Stripe's test mode:

1. Ensure you're using test API keys
2. Use Stripe's test card numbers:
   - `4242 4242 4242 4242` - Successful payment
   - `4000 0000 0000 0002` - Declined payment
   - `4000 0000 0000 9995` - Insufficient funds

### 2. Test Subscription Flows

Test the following scenarios:

1. **New subscription**:
   - User selects a plan
   - Completes checkout
   - Subscription is created in Stripe and your database
   - User has access to paid features

2. **Subscription upgrade**:
   - User changes from lower to higher tier
   - Prorated charges are calculated correctly
   - New features are immediately available

3. **Subscription downgrade**:
   - User changes from higher to lower tier
   - Changes take effect at the end of the billing period
   - Access is maintained until period end

4. **Subscription cancellation**:
   - User cancels subscription
   - Access is maintained until period end
   - User is downgraded to free tier after period end

5. **Payment failure**:
   - Simulate failed payment
   - Verify retry logic
   - Test dunning management

### 3. Test Usage Limits

Test the enforcement of usage limits:

1. Create test accounts with different subscription tiers
2. Simulate usage approaching and exceeding limits
3. Verify that limits are enforced correctly
4. Test notifications for approaching limits

## Going Live

### 1. Pre-Launch Checklist

Before going live with Stripe integration:

1. Switch from test to live API keys
2. Update webhook endpoints to production URLs
3. Verify SSL certificates are valid
4. Test the entire payment flow in a staging environment
5. Ensure all error handling is robust
6. Set up monitoring and alerting

### 2. Launch Steps

1. Deploy backend changes with Stripe integration
2. Deploy frontend changes with payment UI
3. Configure production webhooks
4. Monitor initial transactions closely
5. Be prepared to roll back if issues arise

### 3. Compliance Considerations

Ensure compliance with:

1. **PCI DSS**: By using Stripe Elements, most PCI compliance is handled by Stripe
2. **GDPR**: Ensure proper data handling and privacy notices
3. **Tax regulations**: Configure tax rates in Stripe for different regions
4. **Terms of Service**: Update to include subscription terms
5. **Privacy Policy**: Update to include payment processing information

## Maintenance and Monitoring

### 1. Regular Maintenance

1. Keep Stripe libraries updated
2. Monitor for API changes and deprecations
3. Regularly test the payment flow
4. Review and update pricing as needed

### 2. Monitoring

Set up monitoring for:

1. Failed payments and subscription issues
2. Webhook delivery failures
3. Unusual payment patterns (potential fraud)
4. Subscription churn rate

### 3. Analytics

Track key metrics:

1. Conversion rate from free to paid
2. Upgrade/downgrade patterns
3. Churn rate and reasons
4. Lifetime value of customers
5. Revenue by plan and billing interval

## Conclusion

This Stripe integration guide provides a comprehensive framework for implementing subscription-based payments in the ThoughtWeb Navigator application. By following these steps, you can create a robust payment system that handles subscriptions, usage tracking, and billing management.

Remember to start with thorough testing in Stripe's test mode before going live, and continuously monitor the payment system after launch to ensure smooth operation and identify any issues quickly.

The implementation should be done incrementally, starting with the core subscription functionality and then adding more advanced features like usage-based billing and the customer portal as needed.
