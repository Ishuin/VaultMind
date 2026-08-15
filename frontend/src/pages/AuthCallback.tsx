
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import { toast } from '@/hooks/use-toast';

const AuthCallback = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        if (!isSupabaseConfigured) {
          toast({
            title: 'Supabase not configured',
            description: 'Please add your Supabase URL and anon key in the settings.',
            variant: 'destructive',
          });
          navigate('/settings');
          return;
        }

        const { error } = await supabase.auth.getSession();
        
        if (error) {
          throw error;
        }

        toast({
          title: 'Signed in successfully',
          description: 'Welcome to ThoughtWeb Navigator!',
        });
        
        // Add a 1-second delay before navigating to the dashboard
        setTimeout(() => {
          navigate('/dashboard');
        }, 1000);
      } catch (error: unknown) { // Changed from any to unknown
        let errorMessage = 'Failed to complete authentication. Please try again.';
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
        navigate('/auth');
      }
    };

    handleAuthCallback();
  }, [navigate]);

  return (
    <div className="flex h-screen items-center justify-center">
      <div className="text-center">
        <h2 className="text-xl font-semibold mb-4">Completing authentication...</h2>
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-thoughtweb-purple mx-auto"></div>
      </div>
    </div>
  );
};

export default AuthCallback;
