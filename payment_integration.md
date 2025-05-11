# Payment Integration Guide for ThoughtWeb Navigator

This document provides detailed technical specifications for integrating Stripe payment processing into the ThoughtWeb Navigator application. It covers the setup process, implementation details, and best practices for handling payments securely.

## Table of Contents

1. [Overview](#overview)
2. [Prerequisites](#prerequisites)
3. [Stripe Account Setup](#stripe-account-setup)
4. [Subscription Plans](#subscription-plans)
5. [Backend Integration](#backend-integration)
6. [Frontend Integration](#frontend-integration)
7. [Webhook Implementation](#webhook-implementation)
8. [Testing](#testing)
9. [Security Considerations](#security-considerations)
10. [Troubleshooting](#troubleshooting)

## Overview

ThoughtWeb Navigator uses Stripe as its payment processor to handle subscription-based billing. The integration includes:

- Creating and managing subscription plans
- Processing payments securely
- Handling subscription lifecycle events
- Managing customer information
- Tracking usage based on subscription tiers

## Prerequisites

Before implementing the payment integration, ensure you have:

- A Stripe account (create one at [stripe.com](https://stripe.com))
- Supabase project set up with the required database schema
- Environment variables configured for both development and production
- Basic understanding of Stripe's subscription model

## Stripe Account Setup

1. **Create a Stripe Account**:
   - Sign up at [stripe.com](https://stripe.com)
   - Complete the account verification process

2. **Get API Keys**:
   - Navigate to Developers > API keys in the Stripe Dashboard
   - Note your Publishable Key and Secret Key
   - Create a Webhook Secret for securing webhook endpoints

3. **Configure Account Settings**:
   - Set up your business information
   - Configure email receipts and notifications
   - Set up your branding in the Stripe Dashboard

## Subscription Plans

ThoughtWeb Navigator offers the following subscription tiers:

| Tier | Price | Features | Stripe Product ID |
|------|-------|----------|-------------------|
| Free | $0/month | Basic source management, Limited queries (50/month), Standard models | `prod_free` |
| Standard | $9.99/month | Advanced source management, Increased query limit (500/month), Standard models | `prod_standard` |
| Premium | $19.99/month | Unlimited sources, High query limit (2000/month), Premium models, Priority support | `prod_premium` |
| Enterprise | Custom | Custom features, Dedicated support, Team collaboration | `prod_enterprise` |

### Creating Products and Prices in Stripe

1. **Create Products**:

```javascript
// Example using Stripe API
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

// Create Standard product
const standardProduct = await stripe.products.create({
  name: 'ThoughtWeb Navigator Standard',
  description: 'Standard subscription plan for ThoughtWeb Navigator',
  metadata: {
    tier: 'standard',
    query_limit: '500',
    features: 'advanced_sources,standard_models'
  }
});

// Create price for Standard product
const standardPrice = await stripe.prices.create({
  product: standardProduct.id,
  unit_amount: 999, // $9.99 in cents
  currency: 'usd',
  recurring: {
    interval: 'month'
  },
  metadata: {
    tier: 'standard'
  }
});

// Repeat for other tiers
```

2. **Store Product and Price IDs**:
   - Save the IDs in your environment variables or database
   - Use these IDs when creating subscriptions

## Backend Integration

### 1. Install Stripe SDK

```bash
npm install stripe
# or
yarn add stripe
```

### 2. Initialize Stripe

```typescript
// src/lib/stripe.ts
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2023-10-16', // Use the latest API version
});

export default stripe;
```

### 3. Create Customer in Stripe

When a user registers, create a corresponding Stripe customer:

```typescript
// src/api/auth.ts
import stripe from '@/lib/stripe';
import { supabase } from '@/lib/supabase';

export async function createStripeCustomer(userId: string, email: string) {
  try {
    // Create a customer in Stripe
    const customer = await stripe.customers.create({
      email,
      metadata: {
        userId
      }
    });

    // Store the customer ID in your database
    await supabase
      .from('profiles')
      .update({ stripe_customer_id: customer.id })
      .eq('id', userId);

    return customer.id;
  } catch (error) {
    console.error('Error creating Stripe customer:', error);
    throw error;
  }
}
```

### 4. Create Subscription

```typescript
// src/api/subscriptions.ts
import stripe from '@/lib/stripe';
import { supabase } from '@/lib/supabase';

export async function createSubscription(
  customerId: string,
  priceId: string,
  userId: string,
  returnUrl: string
) {
  try {
    // Create a subscription checkout session
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      payment_method_types: ['card'],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      mode: 'subscription',
      success_url: `${returnUrl}?success=true&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${returnUrl}?canceled=true`,
      metadata: {
        userId,
      },
    });

    return session;
  } catch (error) {
    console.error('Error creating subscription:', error);
    throw error;
  }
}
```

### 5. Update Subscription

```typescript
// src/api/subscriptions.ts
export async function updateSubscription(
  subscriptionId: string,
  newPriceId: string
) {
  try {
    const subscription = await stripe.subscriptions.retrieve(subscriptionId);
    
    // Update the subscription with the new price
    await stripe.subscriptions.update(subscriptionId, {
      items: [
        {
          id: subscription.items.data[0].id,
          price: newPriceId,
        },
      ],
    });
    
    return true;
  } catch (error) {
    console.error('Error updating subscription:', error);
    throw error;
  }
}
```

### 6. Cancel Subscription

```typescript
// src/api/subscriptions.ts
export async function cancelSubscription(subscriptionId: string) {
  try {
    await stripe.subscriptions.cancel(subscriptionId);
    return true;
  } catch (error) {
    console.error('Error canceling subscription:', error);
    throw error;
  }
}
```

### 7. Get Subscription Details

```typescript
// src/api/subscriptions.ts
export async function getSubscription(subscriptionId: string) {
  try {
    const subscription = await stripe.subscriptions.retrieve(subscriptionId);
    return subscription;
  } catch (error) {
    console.error('Error retrieving subscription:', error);
    throw error;
  }
}
```

### 8. Create Supabase Edge Functions

Create Edge Functions in Supabase to handle Stripe API calls securely:

```typescript
// supabase/functions/create-checkout/index.ts
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import Stripe from 'https://esm.sh/stripe@12.0.0';

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY'), {
  apiVersion: '2023-10-16',
});

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }
  
  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL'),
      Deno.env.get('SUPABASE_ANON_KEY')
    );
    
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    const { priceId, returnUrl } = await req.json();
    
    // Get user profile
    const { data: profile } = await supabase
      .from('profiles')
      .select('stripe_customer_id')
      .eq('id', session.user.id)
      .single();
    
    if (!profile?.stripe_customer_id) {
      // Create customer if not exists
      const customer = await stripe.customers.create({
        email: session.user.email,
        metadata: { userId: session.user.id },
      });
      
      await supabase
        .from('profiles')
        .update({ stripe_customer_id: customer.id })
        .eq('id', session.user.id);
        
      profile.stripe_customer_id = customer.id;
    }
    
    // Create checkout session
    const checkoutSession = await stripe.checkout.sessions.create({
      customer: profile.stripe_customer_id,
      line_items: [{ price: priceId, quantity: 1 }],
      mode: 'subscription',
      success_url: `${returnUrl}?success=true&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${returnUrl}?canceled=true`,
      metadata: { userId: session.user.id },
    });
    
    return new Response(
      JSON.stringify({ sessionId: checkoutSession.id, url: checkoutSession.url }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
```

## Frontend Integration

### 1. Install Stripe.js

```bash
npm install @stripe/stripe-js
# or
yarn add @stripe/stripe-js
```

### 2. Initialize Stripe

```typescript
// src/lib/stripe-client.ts
import { loadStripe } from '@stripe/stripe-js';

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY);

export default stripePromise;
```

### 3. Create Subscription Component

```tsx
// src/components/subscription/SubscriptionPlans.tsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/lib/supabase';
import stripePromise from '@/lib/stripe-client';

const plans = [
  {
    name: 'Free',
    description: 'Basic features for personal use',
    price: '$0/month',
    features: [
      'Basic source management',
      '50 queries per month',
      'Standard models',
    ],
    priceId: null, // No price ID for free plan
    highlight: false,
  },
  {
    name: 'Standard',
    description: 'Everything you need for serious knowledge management',
    price: '$9.99/month',
    features: [
      'Advanced source management',
      '500 queries per month',
      'Standard models',
      'Email support',
    ],
    priceId: 'price_standard', // Replace with actual Stripe Price ID
    highlight: true,
  },
  {
    name: 'Premium',
    description: 'Power features for professionals',
    price: '$19.99/month',
    features: [
      'Unlimited sources',
      '2000 queries per month',
      'Premium models',
      'Priority support',
    ],
    priceId: 'price_premium', // Replace with actual Stripe Price ID
    highlight: false,
  },
];

export default function SubscriptionPlans() {
  const [loading, setLoading] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleSubscribe = async (priceId: string) => {
    try {
      setLoading(priceId);
      
      // Call your Supabase Edge Function
      const { data, error } = await supabase.functions.invoke('create-checkout', {
        body: {
          priceId,
          returnUrl: `${window.location.origin}/settings/subscription`,
        },
      });
      
      if (error) throw error;
      
      // Redirect to Stripe Checkout
      window.location.href = data.url;
    } catch (error) {
      console.error('Error creating checkout session:', error);
      alert('Failed to create checkout session. Please try again.');
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className="grid gap-6 md:grid-cols-3">
      {plans.map((plan) => (
        <Card 
          key={plan.name} 
          className={`flex flex-col ${plan.highlight ? 'border-primary shadow-lg' : ''}`}
        >
          <CardHeader>
            <CardTitle>{plan.name}</CardTitle>
            <CardDescription>{plan.description}</CardDescription>
          </CardHeader>
          <CardContent className="flex-grow">
            <div className="text-3xl font-bold mb-4">{plan.price}</div>
            <ul className="space-y-2">
              {plan.features.map((feature) => (
                <li key={feature} className="flex items-center">
                  <svg
                    className="w-4 h-4 mr-2 text-green-500"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M5 13l4 4L19 7"
                    ></path>
                  </svg>
                  {feature}
                </li>
              ))}
            </ul>
          </CardContent>
          <CardFooter>
            <Button
              className="w-full"
              variant={plan.highlight ? 'default' : 'outline'}
              disabled={loading === plan.priceId || !plan.priceId}
              onClick={() => plan.priceId && handleSubscribe(plan.priceId)}
            >
              {loading === plan.priceId ? 'Processing...' : plan.priceId ? 'Subscribe' : 'Current Plan'}
            </Button>
          </CardFooter>
        </Card>
      ))}
    </div>
  );
}
```

### 4. Create Customer Portal Component

```tsx
// src/components/subscription/ManageSubscription.tsx
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { supabase } from '@/lib/supabase';

export default function ManageSubscription() {
  const [loading, setLoading] = useState(false);

  const handleManageSubscription = async () => {
    try {
      setLoading(true);
      
      // Call your Supabase Edge Function
      const { data, error } = await supabase.functions.invoke('create-portal-session', {
        body: {
          returnUrl: `${window.location.origin}/settings/subscription`,
        },
      });
      
      if (error) throw error;
      
      // Redirect to Stripe Customer Portal
      window.location.href = data.url;
    } catch (error) {
      console.error('Error creating portal session:', error);
      alert('Failed to open customer portal. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button onClick={handleManageSubscription} disabled={loading}>
      {loading ? 'Loading...' : 'Manage Subscription'}
    </Button>
  );
}
```

### 5. Create Subscription Status Component

```tsx
// src/components/subscription/SubscriptionStatus.tsx
import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { supabase } from '@/lib/supabase';

interface SubscriptionData {
  tier: string;
  status: string;
  currentPeriodEnd: string;
  queryLimit: number;
  queriesUsed: number;
}

export default function SubscriptionStatus() {
  const [subscription, setSubscription] = useState<SubscriptionData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchSubscription() {
      try {
        // Get subscription data from your API
        const { data, error } = await supabase.functions.invoke('get-subscription-status');
        
        if (error) throw error;
        
        setSubscription(data);
      } catch (error) {
        console.error('Error fetching subscription:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchSubscription();
  }, []);

  if (loading) {
    return <div>Loading subscription details...</div>;
  }

  if (!subscription) {
    return <div>No subscription information available.</div>;
  }

  const usagePercentage = (subscription.queriesUsed / subscription.queryLimit) * 100;
  const formattedDate = new Date(subscription.currentPeriodEnd).toLocaleDateString();

  return (
    <Card>
      <CardHeader>
        <CardTitle>Your Subscription</CardTitle>
        <CardDescription>Current plan and usage information</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex justify-between">
            <span className="font-medium">Plan:</span>
            <span className="font-bold">{subscription.tier}</span>
          </div>
          <div className="flex justify-between">
            <span className="font-medium">Status:</span>
            <span className={`font-bold ${subscription.status === 'active' ? 'text-green-500' : 'text-yellow-500'}`}>
              {subscription.status.charAt(0).toUpperCase() + subscription.status.slice(1)}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="font-medium">Current Period Ends:</span>
            <span>{formattedDate}</span>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="font-medium">Query Usage:</span>
              <span>{subscription.queriesUsed} / {subscription.queryLimit}</span>
            </div>
            <Progress value={usagePercentage} className="h-2" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
```

## Webhook Implementation

### 1. Create Webhook Handler

```typescript
// supabase/functions/stripe-webhook/index.ts
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import Stripe from 'https://esm.sh/stripe@12.0.0';

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY'), {
  apiVersion: '2023-10-16',
});

const endpointSecret = Deno.env.get('STRIPE_WEBHOOK_SECRET');

serve(async (req) => {
  const signature = req.headers.get('stripe-signature');
  
  if (!signature) {
    return new Response('Missing stripe-signature header', { status: 400 });
  }
  
  const body = await req.text();
  let event;
  
  try {
    event = stripe.webhooks.constructEvent(body, signature, endpointSecret);
  } catch (err) {
    return new Response(`Webhook Error: ${err.message}`, { status: 400 });
  }
  
  const supabase = createClient(
    Deno.env.get('SUPABASE_URL'),
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
  );
  
  try {
    // Handle the event
    switch (event.type) {
      case 'customer.subscription.created':
      case 'customer.subscription.updated': {
        const subscription = event.data.object;
        const customerId = subscription.customer;
        
        // Get the price ID from the subscription
        const priceId = subscription.items.data[0].price.id;
        
        // Get the product details to determine the tier
        const product = await stripe.products.retrieve(subscription.items.data[0].price.product);
        const tier = product.metadata.tier || 'standard';
        
        // Find the user associated with this Stripe customer
        const { data: profiles } = await supabase
          .from('profiles')
          .select('id')
          .eq('stripe_customer_id', customerId);
        
        if (profiles && profiles.length > 0) {
          const userId = profiles[0].id;
          
          // Update the user's subscription information
          await supabase
            .from('profiles')
            .update({
              subscription_tier: tier,
              subscription_status: subscription.status,
              subscription_id: subscription.id,
              current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
              updated_at: new Date().toISOString()
            })
            .eq('id', userId);
        }
        break;
      }
      
      case 'customer.subscription.deleted': {
        const subscription = event.data.object;
        const customerId = subscription.customer;
        
        // Find the user associated with this Stripe customer
        const { data: profiles } = await supabase
          .from('profiles')
          .select('id')
          .eq('stripe_customer_id', customerId);
        
        if (profiles && profiles.length > 0) {
          const userId = profiles[0].id;
          
          // Update the user's subscription information
          await supabase
            .from('profiles')
            .update({
              subscription_tier: 'free',
              subscription_status: 'canceled',
              subscription_id: null,
              current_period_end: null,
              updated_at: new Date().toISOString()
            })
            .eq('id', userId);
        }
        break;
      }
      
      // Add handlers for other events as needed
      
      default:
        console.log(`Unhandled event type ${event.type}`);
    }
    
    return new Response(JSON.stringify({ received: true }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error(`Error processing webhook: ${error.message}`);
    return new Response(`Webhook Error: ${error.message}`, { status: 400 });
  }
});
```

### 2. Deploy the Webhook Handler

```bash
supabase functions deploy stripe-webhook --no-verify-jwt
```

### 3. Configure Webhook in Stripe Dashboard

1. Go to the Stripe Dashboard > Developers > Webhooks
2. Click "Add endpoint"
3. Enter your webhook URL (e.g., `https://your-project.supabase.co/functions/v1/stripe-webhook`)
4. Select the events to listen for:
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `checkout.session.completed`
   - `invoice.paid`
   - `invoice.payment_failed`
5. Click "Add endpoint"
6. Note the signing secret and add it to your environment variables

## Testing

### 1. Use Stripe Test Mode

Ensure you're using Stripe's test mode for development:

- Use test API keys
- Use test card numbers (e.g., `4242 4242 4242 4242`)

### 2. Test Subscription Flow

1. Create a test user account
2. Subscribe to a plan
3. Verify the subscription is created in Stripe
4. Verify the user's subscription status is updated in your database

### 3. Test Webhook Events

Use the Stripe CLI to test webhook events locally:

```bash
# Install Stripe CLI
brew install stripe/stripe-cli/stripe

# Login to Stripe
stripe login

# Forward webhook events to your local endpoint
stripe listen --forward-to localhost:54321/functions/v1/stripe-webhook

# Trigger test events
stripe trigger customer.subscription.created
stripe trigger customer.subscription.updated
stripe trigger customer.subscription.deleted
```

## Security Considerations

### 1. API Key Security

- Never expose your Stripe Secret Key in client-side code
- Use environment variables to store API keys
- Use Supabase Edge Functions for server-side operations

### 2. Webhook Security

- Always verify webhook signatures
- Use HTTPS for webhook endpoints
- Implement idempotency to handle duplicate webhook events

### 3. Payment Information Security

- Use Stripe Checkout or Elements to collect payment information
- Never store credit card details in your database
- Ensure your application is PCI compliant

## Troubleshooting

### Common Issues

1. **Webhook Signature Verification Failed**:
   - Check that you're using the correct webhook secret
   - Ensure the request body is not modified before verification

2. **Subscription Not Created**:
   - Verify the customer ID is correctly associated with the user
   - Check for errors in the Stripe Dashboard

3. **Webhook Events Not Received**:
   - Verify the webhook URL is correct and accessible
   - Check that the events are configured correctly in the Stripe Dashboard

### Debugging Tips

1. Use Stripe Dashboard logs to view API requests and responses
2. Enable detailed logging in your application
3. Use Stripe CLI to test webhook events locally
4. Check Supabase logs for Edge Function errors

## Additional Resources

- [Stripe Documentation](https://stripe.com/docs)
- [Stripe API Reference](https://stripe.com/docs/api)
- [Supabase Edge Functions](https://supabase.com/docs/guides/functions)
- [Stripe.js Documentation](https://stripe.com/docs/js)
