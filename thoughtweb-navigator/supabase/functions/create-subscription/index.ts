import { serve } from "jsr:@std/http/server.ts";
import Stripe from "npm:stripe@^14"; // Import Stripe library for Deno
import { createClient } from 'jsr:@supabase/supabase-js@^2';

// Define CORS headers
const corsHeaders = {
  'Access-Control-Allow-Origin': '*', // Allow requests from any origin (adjust for production)
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Initialize Stripe client
// Ensure STRIPE_SECRET_KEY is set in your Supabase project's Function secrets
const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY")!, {
  apiVersion: "2023-10-16", // Use a fixed API version
  httpClient: Stripe.createFetchHttpClient(), // Use Deno's fetch
});

serve(async (req: Request) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // 1. Get data from request
    const { priceId } = await req.json();
    if (!priceId) {
      throw new Error("Missing priceId in request body");
    }

    // 2. Get user from Supabase Auth JWT
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error("Missing Authorization header");
    }

    // Create Supabase client with Auth context to get user info
    // Use the anon key as we are relying on the JWT for user identification
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: authHeader } } } // Pass the auth header
    );

    const { data: { user }, error: userError } = await supabaseClient.auth.getUser();

    if (userError || !user) {
      console.error("Auth Error:", userError);
      return new Response(JSON.stringify({ error: 'User not authenticated' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // 3. Get or create Stripe customer
    // Use Supabase Admin client (with service role key) for interacting with 'profiles' table
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '' // Ensure this secret is set in Supabase Function settings
    );

    let stripeCustomerId: string | null = null;

    // Check if user profile exists and has a stripe_customer_id
    const { data: profile, error: profileError } = await supabaseAdmin
      .from('profiles') // ASSUMES 'profiles' table exists linked to auth.users via 'id'
      .select('stripe_customer_id')
      .eq('id', user.id)
      .single();

    if (profileError && profileError.code !== 'PGRST116') { // PGRST116: row not found
      console.error("Profile fetch error:", profileError);
      throw new Error("Failed to fetch user profile");
    }

    if (profile?.stripe_customer_id) {
      stripeCustomerId = profile.stripe_customer_id;
    } else {
      // Create a new Stripe customer
      console.log(`Creating Stripe customer for user ${user.id} with email ${user.email}`);
      const customer = await stripe.customers.create({
        email: user.email,
        metadata: { supabase_id: user.id }, // Link Supabase user ID in Stripe metadata
      });
      stripeCustomerId = customer.id;
      console.log(`Created Stripe customer ${stripeCustomerId}`);

      // Update the user's profile with the new Stripe customer ID
      // This assumes the profile row already exists (e.g., created by a trigger on auth.users insert)
      // If not, you might need an upsert or insert operation here.
      const { error: updateError } = await supabaseAdmin
        .from('profiles')
        .update({ stripe_customer_id: stripeCustomerId })
        .eq('id', user.id);

      if (updateError) {
        console.error("Profile update error:", updateError);
        // Don't throw here, maybe just log, as checkout can proceed
        console.warn(`Failed to update profile ${user.id} with Stripe customer ID ${stripeCustomerId}`);
      } else {
        console.log(`Updated profile ${user.id} with Stripe customer ID`);
      }
    }

    if (!stripeCustomerId) {
       throw new Error("Could not get or create Stripe customer ID");
    }

    // 4. Create Stripe Checkout session
    console.log(`Creating Checkout session for customer ${stripeCustomerId} and price ${priceId}`);
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      mode: 'subscription', // Or 'payment' for one-time
      customer: stripeCustomerId,
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      // Define success and cancel URLs (use env vars)
      success_url: `${Deno.env.get('SITE_URL') || 'http://localhost:8080'}/dashboard?session_id={CHECKOUT_SESSION_ID}`, // Redirect back to your app
      cancel_url: `${Deno.env.get('SITE_URL') || 'http://localhost:8080'}/pricing`,
      // Pass Supabase user ID to metadata for webhook identification
      subscription_data: {
        metadata: {
          supabase_user_id: user.id,
        }
      },
      // Optionally pass customer email for prefill
      // customer_email: user.email, 
    });

    console.log(`Created Checkout session: ${session.id}`);

    // 5. Return the session URL
    return new Response(
      JSON.stringify({ sessionId: session.id, url: session.url }), // Return session ID and URL
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error: unknown) {
    console.error("Error creating subscription:", error);
    let errorMessage = "Internal Server Error";
    if (error instanceof Error) {
      errorMessage = error.message;
    }
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
