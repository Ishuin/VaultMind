
import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import { Session, User } from '@supabase/supabase-js';
import { toast } from '@/hooks/use-toast';

type AuthContextType = {
  session: Session | null;
  user: User | null;
  loading: boolean;
  signInWithOAuth: (provider: 'google' | 'github' | 'discord' | 'azure') => Promise<void>; // Added 'azure'
  signOut: () => Promise<void>;
  isSupabaseReady: boolean;
};

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isSupabaseConfigured) {
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

  const signInWithOAuth = async (provider: 'google' | 'github' | 'discord' | 'azure') => { // Added 'azure'
    try {
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
     } catch (error: unknown) { // Changed from any to unknown
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

  return (
    <AuthContext.Provider
      value={{
        session,
        user,
        loading,
        signInWithOAuth,
        signOut,
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
