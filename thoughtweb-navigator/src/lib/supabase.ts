
import { createClient } from '@supabase/supabase-js';

// Default fallback values for development (replace with your public Supabase URL and anon key if available)
const DEFAULT_SUPABASE_URL = 'https://xyzcompany.supabase.co';
const DEFAULT_SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0';

// Use env variables if available, otherwise use placeholders
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || DEFAULT_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || DEFAULT_SUPABASE_ANON_KEY;

// Check if we should bypass Supabase redirects for local development
const bypassRedirects = import.meta.env.VITE_SUPABASE_BYPASS_REDIRECTS === 'true';

// Create a dummy/mock client if no valid credentials or bypassing redirects
const isDummyClient = (!import.meta.env.VITE_SUPABASE_URL || !import.meta.env.VITE_SUPABASE_ANON_KEY) || bypassRedirects;

// Create the Supabase client
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Export flag to indicate if using a dummy client
export const isSupabaseConfigured = !isDummyClient;

// Helper function to check if Supabase is properly configured before operations
export const checkSupabaseConfig = () => {
  if (isDummyClient) {
    console.warn('Supabase is not properly configured. Please add your Supabase URL and anon key in the settings.');
    return false;
  }
  return true;
};
