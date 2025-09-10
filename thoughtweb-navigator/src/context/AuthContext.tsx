import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import { Session, User } from '@supabase/supabase-js';
import { toast } from '@/hooks/use-toast';

type AuthContextType = {
  session: Session | null;
  user: User | null;
  loading: boolean;
  signInWithOAuth: (provider: 'google' | 'github' | 'discord' | 'azure') => Promise<void>;
  signOut: () => Promise<void>;
  signUp: (email: string, password: string, name: string) => Promise<void>;
  signIn: (credentials: { email: string; password: string } | { phone: string; password: string }) => Promise<User | null>;
  isSupabaseReady: boolean;
};

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if we're bypassing Supabase redirects for local development
    const bypassRedirects = import.meta.env.VITE_SUPABASE_BYPASS_REDIRECTS === 'true';
    
    if (!isSupabaseConfigured || bypassRedirects) {
      // Create a mock session and user for local development
      if (bypassRedirects) {
        const mockUser: User = {
          id: 'mock-user-id',
          app_metadata: {},
          user_metadata: {
            name: 'Local Developer',
            email: 'developer@localhost',
            plan: 'pro'
          },
          aud: 'authenticated',
          created_at: new Date().toISOString(),
          email: 'developer@localhost',
          email_confirmed_at: new Date().toISOString(),
          last_sign_in_at: new Date().toISOString(),
          role: 'authenticated',
          updated_at: new Date().toISOString(),
        };
        
        setSession({
          provider_token: null,
          provider_refresh_token: null,
          access_token: 'mock-access-token',
          refresh_token: 'mock-refresh-token',
          expires_in: 3600,
          expires_at: Math.floor(Date.now() / 1000) + 3600,
          token_type: 'bearer',
          user: mockUser,
        });
        setUser(mockUser);
      }
      setLoading(false);
      return;
    }

    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user || null);
      setLoading(false);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setUser(session?.user || null);
      setLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const signInWithOAuth = async (provider: 'google' | 'github' | 'discord' | 'azure') => {
    try {
      // Check if we're bypassing Supabase redirects for local development
      const bypassRedirects = import.meta.env.VITE_SUPABASE_BYPASS_REDIRECTS === 'true';
      
      if (bypassRedirects) {
        // In bypass mode, we don't actually sign in with OAuth
        // The user is already authenticated with our mock user
        toast({
          title: 'Local Development Mode',
          description: 'OAuth bypassed in local development mode.',
        });
        return;
      }

      if (!isSupabaseConfigured) {
        toast({
          title: 'Supabase not configured',
          description: 'Please add your Supabase URL and anon key in the settings.',
          variant: 'destructive',
        });
        return;
      }

      const options: { redirectTo: string; queryParams?: { [key: string]: string } } = {
        redirectTo: `${window.location.origin}/auth/callback`,
      };

      if (provider === 'github') {
        options.queryParams = { prompt: 'select_account' };
      }

      const { error } = await supabase.auth.signInWithOAuth({
        provider,
        options,
      });

      if (error) throw error;
    } catch (error: unknown) {
      let errorMessage = 'Failed to sign in. Please try again.';
      if (error instanceof Error) {
        errorMessage = error.message;
      } else if (typeof error === 'string') {
        errorMessage = error;
      }
      toast({
        title: 'Authentication failed',
        description: errorMessage,
        variant: 'destructive',
      });
    }
  };

  const signOut = async () => {
    try {
      // Check if we're bypassing Supabase redirects for local development
      const bypassRedirects = import.meta.env.VITE_SUPABASE_BYPASS_REDIRECTS === 'true';
      
      if (bypassRedirects) {
        // In bypass mode, we don't actually sign out from Supabase
        // We just clear our mock session and user
        setSession(null);
        setUser(null);
        toast({
          title: 'Signed out successfully',
          description: 'You have been signed out in local development mode.',
        });
        return;
      }

      if (!isSupabaseConfigured) {
        toast({
          title: 'Supabase not configured',
          description: 'Please add your Supabase URL and anon key in the settings.',
          variant: 'destructive',
        });
        return;
      }

      const { error } = await supabase.auth.signOut();
      if (error) throw error;

      toast({
        title: 'Signed out successfully',
        description: 'You have been signed out of your account.',
      });
    } catch (error: unknown) {
      let errorMessage = 'Failed to sign out. Please try again.';
      if (error instanceof Error) {
        errorMessage = error.message;
      } else if (typeof error === 'string') {
        errorMessage = error;
      }
      toast({
        title: 'Sign out failed',
        description: errorMessage,
        variant: 'destructive',
      });
    }
  };

  const signUp = async (email: string, password: string, name: string) => {
    try {
      // Check if we're bypassing Supabase redirects for local development
      const bypassRedirects = import.meta.env.VITE_SUPABASE_BYPASS_REDIRECTS === 'true';
      
      if (bypassRedirects) {
        // In bypass mode, we don't actually sign up with Supabase
        // We just update our mock user with the new information
        const mockUser: User = {
          id: 'mock-user-id',
          app_metadata: {},
          user_metadata: {
            name: name,
            email: email,
            plan: 'pro'
          },
          aud: 'authenticated',
          created_at: new Date().toISOString(),
          email: email,
          email_confirmed_at: new Date().toISOString(),
          last_sign_in_at: new Date().toISOString(),
          role: 'authenticated',
          updated_at: new Date().toISOString(),
        };
        
        setSession({
          provider_token: null,
          provider_refresh_token: null,
          access_token: 'mock-access-token',
          refresh_token: 'mock-refresh-token',
          expires_in: 3600,
          expires_at: Math.floor(Date.now() / 1000) + 3600,
          token_type: 'bearer',
          user: mockUser,
        });
        setUser(mockUser);
        
        toast({
          title: 'Sign up successful',
          description: 'Account created in local development mode.',
        });
        return;
      }

      if (!isSupabaseConfigured) {
        toast({
          title: 'Supabase not configured',
          description: 'Please add your Supabase URL and anon key in the settings.',
          variant: 'destructive',
        });
        return;
      }

      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
          data: {
            name,
          },
        },
      });

      if (error) throw error;

      toast({
        title: 'Sign up successful',
        description: 'Please check your email to confirm your account.',
      });
    } catch (error: unknown) {
      let errorMessage = 'Failed to sign up. Please try again.';
      if (error instanceof Error) {
        errorMessage = error.message;
      } else if (typeof error === 'string') {
        errorMessage = error;
      }
      toast({
        title: 'Sign up failed',
        description: errorMessage,
        variant: 'destructive',
      });
    }
  };

  const signIn = async (credentials: { email: string; password: string } | { phone: string; password: string }) => {
    try {
      // Check if we're bypassing Supabase redirects for local development
      const bypassRedirects = import.meta.env.VITE_SUPABASE_BYPASS_REDIRECTS === 'true';
      
      if (bypassRedirects) {
        // In bypass mode, we don't actually sign in with Supabase
        // We just update our mock user with the provided email
        const email = 'email' in credentials ? credentials.email : credentials.phone;
        const mockUser: User = {
          id: 'mock-user-id',
          app_metadata: {},
          user_metadata: {
            name: 'Local Developer',
            email: email,
            plan: 'pro'
          },
          aud: 'authenticated',
          created_at: new Date().toISOString(),
          email: email,
          email_confirmed_at: new Date().toISOString(),
          last_sign_in_at: new Date().toISOString(),
          role: 'authenticated',
          updated_at: new Date().toISOString(),
        };
        
        setSession({
          provider_token: null,
          provider_refresh_token: null,
          access_token: 'mock-access-token',
          refresh_token: 'mock-refresh-token',
          expires_in: 3600,
          expires_at: Math.floor(Date.now() / 1000) + 3600,
          token_type: 'bearer',
          user: mockUser,
        });
        setUser(mockUser);
        
        toast({
          title: 'Sign in successful',
          description: 'Signed in with local development mode.',
        });
        
        return mockUser;
      }

      if (!isSupabaseConfigured) {
        toast({
          title: 'Supabase not configured',
          description: 'Please add your Supabase URL and anon key in the settings.',
          variant: 'destructive',
        });
        return null;
      }

      const { data, error } = await supabase.auth.signInWithPassword(credentials);

      if (error) throw error;

      toast({
        title: 'Sign in successful',
        description: 'You have been successfully signed in.',
      });

      return data.user;
    } catch (error: unknown) {
      let errorMessage = 'Failed to sign in. Please try again.';
      if (error instanceof Error) {
        errorMessage = error.message;
      } else if (typeof error === 'string') {
        errorMessage = error;
      }
      toast({
        title: 'Sign in failed',
        description: errorMessage,
        variant: 'destructive',
      });
      return null;
    }
  };

  return (
    <AuthContext.Provider
      value={{
        session,
        user,
        loading,
        signInWithOAuth,
        signOut,
        signUp,
        signIn: (credentials) => signIn(credentials),
        isSupabaseReady: isSupabaseConfigured,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
