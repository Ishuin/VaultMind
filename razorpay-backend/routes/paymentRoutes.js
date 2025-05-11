
const express = require('express');
const router = express.Router();
// const { razorpayInstance } = require('../server'); // Removed direct require
const { createClient } = require('@supabase/supabase-js');

// Initialize Supabase client for JWT verification
console.log('[paymentRoutes.js] Initializing Supabase client...');
console.log(`[paymentRoutes.js] SUPABASE_URL: ${process.env.SUPABASE_URL ? 'Set' : 'NOT SET'}`);
console.log(`[paymentRoutes.js] SUPABASE_ANON_KEY: ${process.env.SUPABASE_ANON_KEY ? 'Set' : 'NOT SET'}`);

let supabase;
try {
  supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY);
  console.log('[paymentRoutes.js] Supabase client initialized successfully.');
} catch (error) {
  console.error('[paymentRoutes.js] Error initializing Supabase client:', error);
  // If Supabase client fails to init, routes using it will fail.
  // Consider how to handle this - maybe all routes return an error.
}


// POST /api/create-razorpay-subscription
router.post('/create-razorpay-subscription', async (req, res) => {
  try {
    const { app_plan_id } = req.body; // e.g., "pro_monthly" - you'll map this to a Razorpay Plan ID
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Unauthorized: Missing or invalid token' });
    }
    const token = authHeader.split(' ')[1];

    // Verify JWT with Supabase
    if (!supabase) {
      console.error("[paymentRoutes.js] Supabase client not available in /create-razorpay-subscription");
      return res.status(500).json({ error: 'Server configuration error (Supabase client).' });
    }
    const { data: { user }, error: userError } = await supabase.auth.getUser(token);
    if (userError || !user) {
      console.error("[paymentRoutes.js] Supabase auth error:", userError);
      return res.status(401).json({ error: 'Unauthorized: Invalid token or user not found' });
    }

    // --- Map your application plan ID to a Razorpay Plan ID ---
    // You should create these plans in your Razorpay dashboard first.
    // Store these Razorpay Plan IDs in your .env or a config file.
    let rzpPlanId;
    if (app_plan_id === process.env.APP_PRO_MONTHLY_PLAN_ID_KEY) { // e.g., APP_PRO_MONTHLY_PLAN_ID_KEY="pro_monthly"
      rzpPlanId = process.env.RAZORPAY_PRO_MONTHLY_PLAN_ID; // e.g., "plan_xxxxxxxxxxxxxx"
    } else {
      return res.status(400).json({ error: 'Invalid plan ID provided' });
    }

    if (!rzpPlanId) {
        return res.status(500).json({ error: 'Razorpay Plan ID not configured for the selected plan.' });
    }
    
    const subscriptionOptions = {
      plan_id: rzpPlanId,
      customer_notify: 1, // Send notifications to customer
      total_count: 12,    // Example: Bill for 12 cycles (e.g., 1 year if plan is monthly)
                          // For indefinite subscriptions, you might omit this or use a very large number
                          // depending on Razorpay's API for "until cancelled".
      notes: {
        supabase_user_id: user.id, // Store Supabase user ID for linking
        user_email: user.email
      }
    };

    const razorpayInstanceFromApp = req.app.get('razorpayInstance');
    if (!razorpayInstanceFromApp) {
      console.error('Razorpay instance not found on app object');
      return res.status(500).json({ error: 'Razorpay client not initialized on server.' });
    }
    const subscription = await razorpayInstanceFromApp.subscriptions.create(subscriptionOptions);

    if (!subscription) {
      throw new Error('Failed to create Razorpay subscription.');
    }

    res.json({
      subscription_id: subscription.id,
      razorpay_key_id: process.env.RAZORPAY_KEY_ID 
    });

  } catch (error) {
    console.error('Error creating Razorpay subscription:', error);
    res.status(500).json({ error: error.message || 'Failed to create subscription' });
  }
});

// POST /api/razorpay-webhook
router.post('/razorpay-webhook', async (req, res) => {
  // TODO: Implement logic to:
  // 1. Verify Razorpay webhook signature (req.headers['x-razorpay-signature'], req.body, process.env.RAZORPAY_WEBHOOK_SECRET)
  // 2. Parse event from req.body
  // 3. Handle event types (subscription.activated, payment.failed, etc.)
  // 4. Update Supabase 'profiles' table with subscription details
  //    (Requires Supabase admin client initialized with service role key)
  const crypto = require('crypto');

  // Initialize Supabase Admin Client (using service role key for DB updates)
  // Note: This client should only be used for operations requiring admin privileges.
  let supabaseAdmin;
  if (process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY) {
    supabaseAdmin = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);
    console.log('[paymentRoutes.js] Supabase Admin client initialized for webhook.');
  } else {
    console.error('[paymentRoutes.js] Supabase URL or Service Role Key not configured for Admin client. Webhook DB updates will fail.');
  }

  const secret = process.env.RAZORPAY_WEBHOOK_SECRET;

  if (!secret) {
    console.error("RAZORPAY_WEBHOOK_SECRET is not set in .env. Webhook verification will fail.");
    return res.status(500).json({ error: 'Webhook secret not configured on server.' });
  }
  if (!supabaseAdmin) {
    console.error("Supabase Admin client not initialized. Cannot process webhook for DB update.");
    return res.status(500).json({ error: 'Server configuration error (Supabase Admin).' });
  }

  try {
    // Step 1: Verify the webhook signature
    // Razorpay sends the payload as raw request body, ensure your body parser doesn't process it if it interferes.
    // Express.json() should be fine, but if issues, might need raw-body.
    const shasum = crypto.createHmac('sha256', secret);
    shasum.update(JSON.stringify(req.body)); // req.body should be the raw JSON payload
    const digest = shasum.digest('hex');

    if (digest !== req.headers['x-razorpay-signature']) {
      console.warn('Webhook signature mismatch.');
      return res.status(400).json({ error: 'Invalid signature' });
    }

    // Step 2: Process the event
    const event = req.body;
    console.log('[Webhook] Received event:', JSON.stringify(event, null, 2));

    let supabaseUserId;
    let razorpaySubscriptionId;
    let subscriptionStatus;
    let currentPeriodEnd;

    // Handle relevant events, primarily for subscriptions
    if (event.event === 'subscription.activated' || event.event === 'subscription.charged') {
      const subscription = event.payload.subscription.entity;
      const payment = event.payload.payment.entity;

      razorpaySubscriptionId = subscription.id;
      subscriptionStatus = subscription.status; // e.g., "active"
      if (typeof subscription.current_period_end === 'number' && subscription.current_period_end > 0) {
        currentPeriodEnd = new Date(subscription.current_period_end * 1000);
      } else {
        console.warn(`[Webhook] Invalid or missing current_period_end for subscription ${razorpaySubscriptionId}:`, subscription.current_period_end);
        currentPeriodEnd = undefined; // Set to undefined if invalid
      }
      
      // Get supabase_user_id from subscription notes (set during creation)
      if (subscription.notes && subscription.notes.supabase_user_id) {
        supabaseUserId = subscription.notes.supabase_user_id;
      } else if (payment.notes && payment.notes.supabase_user_id) { // Fallback to payment notes if available
        supabaseUserId = payment.notes.supabase_user_id;
      }


      if (supabaseUserId && razorpaySubscriptionId) {
        console.log(`[Webhook] Updating profile for user: ${supabaseUserId}, subscription: ${razorpaySubscriptionId}, status: ${subscriptionStatus}`);
        const { error: updateError } = await supabaseAdmin
          .from('profiles')
          .update({
            razorpay_subscription_id: razorpaySubscriptionId,
            subscription_status: subscriptionStatus,
            subscription_current_period_end: currentPeriodEnd?.toISOString(),
            // You might want to store razorpay_customer_id as well if available
            // razorpay_customer_id: subscription.customer_id 
          })
          .eq('id', supabaseUserId);

        if (updateError) {
          console.error('[Webhook] Supabase DB update error:', updateError);
          return res.status(500).json({ error: 'Failed to update user profile' });
        }
        console.log(`[Webhook] Profile updated successfully for user ${supabaseUserId}.`);
      } else {
        console.warn('[Webhook] Missing supabase_user_id or razorpay_subscription_id in event payload. Cannot update DB.', event.payload);
      }
    } else if (event.event === 'subscription.cancelled' || event.event === 'subscription.halted') {
        const subscription = event.payload.subscription.entity;
        razorpaySubscriptionId = subscription.id;
        subscriptionStatus = subscription.status; // "cancelled" or "halted"
        if (subscription.notes && subscription.notes.supabase_user_id) {
            supabaseUserId = subscription.notes.supabase_user_id;
        }
        
        if (supabaseUserId && razorpaySubscriptionId) {
            console.log(`[Webhook] Updating profile for cancelled/halted subscription. User: ${supabaseUserId}, Sub: ${razorpaySubscriptionId}`);
            await supabaseAdmin
              .from('profiles')
              .update({ subscription_status: subscriptionStatus })
              .eq('id', supabaseUserId)
              .eq('razorpay_subscription_id', razorpaySubscriptionId); // Ensure we update the correct sub
        }
    } else {
      console.log(`[Webhook] Unhandled event type: ${event.event}`);
    }

    res.status(200).json({ received: true });

  } catch (error) {
    console.error('[Webhook] Error processing webhook:', error);
    res.status(500).json({ error: error.message || 'Webhook processing failed' });
  }
});

module.exports = router;
