
// Supabase is being phased out in favor of the FastAPI backend.
// This file is kept for compatibility with existing imports but provides a stubbed client.

export const supabase = {
  auth: {
    getSession: async () => ({ data: { session: null }, error: null }),
    onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } }),
    signInWithOAuth: async () => ({ error: new Error("Supabase OAuth is disabled. Use FastAPI login.") }),
    signOut: async () => ({ error: null }),
    signInWithPassword: async () => ({ data: { user: null }, error: new Error("Supabase Auth is disabled. Use FastAPI login.") }),
    signUp: async () => ({ data: { user: null }, error: new Error("Supabase Auth is disabled. Use FastAPI signup.") }),
  },
  from: () => ({
    select: () => ({
      order: () => ({
        limit: () => Promise.resolve({ data: [], error: null })
      }),
      eq: () => Promise.resolve({ data: [], error: null })
    }),
    insert: () => Promise.resolve({ data: null, error: null }),
    update: () => Promise.resolve({ data: null, error: null }),
    delete: () => Promise.resolve({ data: null, error: null }),
  })
} as any;

export const isSupabaseConfigured = false;
export const checkSupabaseConfig = () => false;
