import React, { createContext, useContext, useState, useEffect } from 'react';
import { toast } from '@/hooks/use-toast';
import { apiFetch } from '@/lib/api';

export type User = {
  id: string;
  email: string;
  username: string;
  full_name?: string;
  // Subscription fields
  subscription_tier?: string;
  trial_end_date?: string;
  is_founder?: boolean;
  // Mocking Supabase properties for compatibility
  identities?: any[];
  email_confirmed_at?: string;
};

export type Session = {
  access_token: string;
  token_type: string;
  user: User;
};

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
    const initAuth = async () => {
      const token = localStorage.getItem('thoughtweb-token');
      if (token) {
        try {
          const userData = await apiFetch('/users/me');
          const mockUser: User = {
            ...userData,
            id: String(userData.id),
            identities: [{}],
            email_confirmed_at: new Date().toISOString(),
          };
          
          setUser(mockUser);
          setSession({
            access_token: token,
            token_type: 'bearer',
            user: mockUser,
          });
        } catch (error) {
          console.error('Failed to fetch user profile:', error);
          localStorage.removeItem('thoughtweb-token');
        }
      }
      setLoading(false);
    };

    initAuth();
  }, []);

  const signInWithOAuth = async (provider: 'google' | 'github' | 'discord' | 'azure') => {
    toast({
      title: 'OAuth not supported',
      description: `OAuth sign-in with ${provider} is not currently supported in the FastAPI backend.`,
      variant: 'destructive',
    });
  };

  const signOut = async () => {
    localStorage.removeItem('thoughtweb-token');
    setSession(null);
    setUser(null);
    toast({
      title: 'Signed out successfully',
      description: 'You have been signed out of your account.',
    });
  };

  const signUp = async (email: string, password: string, name: string) => {
    try {
      // Basic email validation check before sending
      if (!email.includes('@')) {
        throw new Error('Please enter a valid email address.');
      }

      const userData = await apiFetch('/users/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          password,
          username: email.split('@')[0] || `user_${Date.now()}`,
          full_name: name || email.split('@')[0],
        }),
      });

      toast({
        title: 'Sign up successful',
        description: 'Account created successfully. You can now sign in.',
      });
    } catch (error: any) {
      toast({
        title: 'Sign up failed',
        description: error.message || 'Failed to sign up. Please try again.',
        variant: 'destructive',
      });
      throw error;
    }
  };

  const signIn = async (credentials: { email: string; password: string } | { phone: string; password: string }) => {
    try {
      const email = 'email' in credentials ? credentials.email : credentials.phone;
      
      // FastAPI expects application/x-www-form-urlencoded for login
      const formData = new URLSearchParams();
      formData.append('username', email);
      formData.append('password', credentials.password);

      const tokenData = await apiFetch('/login/access-token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: formData,
      });

      localStorage.setItem('thoughtweb-token', tokenData.access_token);
      
      const userData = await apiFetch('/users/me');
      const mockUser: User = {
        ...userData,
        id: String(userData.id),
        identities: [{}],
        email_confirmed_at: new Date().toISOString(),
      };

      setSession({
        access_token: tokenData.access_token,
        token_type: 'bearer',
        user: mockUser,
      });
      setUser(mockUser);

      toast({
        title: 'Sign in successful',
        description: 'You have been successfully signed in.',
      });

      return mockUser;
    } catch (error: any) {
      toast({
        title: 'Sign in failed',
        description: error.message || 'Failed to sign in. Please try again.',
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
        signIn,
        isSupabaseReady: false, // Transitioned to FastAPI
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
