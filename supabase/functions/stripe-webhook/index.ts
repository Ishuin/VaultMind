import { serve } from "https://deno.land/std@0.208.0/http/server.ts";
import Stripe from "npm:stripe@^14";
import { createClient, SupabaseClient } from 'jsr:@supabase/supabase-js@^2';

// Define CORS headers - though less critical for webhooks, good practice
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Initialize Stripe client
const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY")!, {
  apiVersion: "2023-10-16",
  httpClient: Stripe.createFetchHttpClient(),
});

// Function to create Supabase Admin Client (uses service_role_key)
const createSupabaseAdminClient = (): SupabaseClient => {
  return createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SERVICE_ROLE_KEY') ?? '' // Ensure this secret is set
  );
};

serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  const signature = req.headers.get("Stripe-Signature");
  const body = await req.text(); // Read body as text for signature verification

  // Get webhook secret from environment variables
  const webhookSecret = Deno.env.get("STRIPE_WEBHOOK_SECRET");
  if (!webhookSecret) {
    console.error("Stripe webhook secret is not set.");
    return new Response("Webhook secret not configured.", { status: 500 });
  }

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, signature!, webhookSecret);
  } catch (err: any) {
    console.error("Webhook signature verification failed:", err.message);
    return new Response(`Webhook Error: ${err.message}`, { status: 400 });
  }

  const supabaseAdmin = createSupabaseAdminClient();
  let supabaseUserId: string | undefined;
  let stripeSubscriptionId: string | undefined;
  let subscriptionStatus: string | undefined;
  let currentPeriodEnd: Date | undefined;

  // Handle the event
  switch (event.type) {
    case 'checkout.session.completed': {
      const session = event.data.object as Stripe.Checkout.Session;
      console.log("Checkout session completed:", session.id);
      // Metadata should contain supabase_user_id if set during checkout creation
      supabaseUserId = session.metadata?.supabase_user_id; 
      stripeSubscriptionId = session.subscription as string; // session.subscription is the ID
      
      // Retrieve the subscription to get status and current_period_end
      if (stripeSubscriptionId) {
        try {
          const subscription = await stripe.subscriptions.retrieve(stripeSubscriptionId);
          subscriptionStatus = subscription.status;
          currentPeriodEnd = new Date(subscription.current_period_end * 1000);
        } catch (subError) {
          console.error("Error retrieving subscription:", subError);
          // Continue, but status might be missing
        }
      }
      break;
    }
    case 'customer.subscription.updated': {
      const subscription = event.data.object as Stripe.Subscription;
      console.log("Subscription updated:", subscription.id);
      supabaseUserId = subscription.metadata?.supabase_user_id;
      stripeSubscriptionId = subscription.id;
      subscriptionStatus = subscription.status;
      currentPeriodEnd = new Date(subscription.current_period_end * 1000);
      break;
    }
    case 'customer.subscription.deleted': {
      const subscription = event.data.object as Stripe.Subscription;
      console.log("Subscription deleted:", subscription.id);
      supabaseUserId = subscription.metadata?.supabase_user_id;
      stripeSubscriptionId = subscription.id;
      subscriptionStatus = subscription.status; // e.g., 'canceled'
      // currentPeriodEnd might remain the same or be null depending on Stripe's handling
      currentPeriodEnd = subscription.current_period_end ? new Date(subscription.current_period_end * 1000) : undefined;
      break;
    }
    // Add other event types as needed (e.g., invoice.payment_failed)
    default:
      console.log(`Unhandled event type: ${event.type}`);
      return new Response(`Unhandled event type: ${event.type}`, { status: 200 });
  }

  // Update Supabase database
  if (supabaseUserId && stripeSubscriptionId) {
    try {
      const { error } = await supabaseAdmin
        .from("profiles") // Assuming you store subscription info in 'profiles'
        .update({
          stripe_subscription_id: stripeSubscriptionId,
          subscription_status: subscriptionStatus,
          subscription_current_period_end: currentPeriodEnd?.toISOString(),
        })
        .eq("id", supabaseUserId);

      if (error) {
        console.error("Supabase DB update error:", error);
        throw error; // This will be caught by the outer try-catch
      }
      console.log(`Profile updated for user ${supabaseUserId} with subscription ${stripeSubscriptionId}`);
    } catch (dbError) {
      console.error("Failed to update database:", dbError);
      // Return 500 so Stripe retries if configured
      return new Response("Database update failed.", { status: 500 });
    }
  } else {
    console.warn("Missing supabaseUserId or stripeSubscriptionId, skipping DB update for event:", event.id);
  }

  return new Response(JSON.stringify({ received: true }), { status: 200 });
});
