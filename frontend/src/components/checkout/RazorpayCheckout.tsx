import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { apiFetch } from '@/lib/api';
import { Loader2 } from 'lucide-react';

declare global {
  interface Window {
    Razorpay: any;
  }
}

interface RazorpayCheckoutProps {
  planId: string;
  planName: string;
  amount: number;
  currency: string;
  onSuccess?: () => void;
  children?: React.ReactNode;
}

export function RazorpayCheckout({
  planId,
  planName,
  amount,
  currency,
  onSuccess,
  children,
}: RazorpayCheckoutProps) {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const handleCheckout = async () => {
    setIsLoading(true);

    try {
      // Create order on the backend
      const orderData = await apiFetch('/subscription/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan_id: planId }),
      });

      // Load Razorpay script if not already loaded
      if (!window.Razorpay) {
        await loadRazorpayScript();
      }

      // Initialize Razorpay checkout
      const options = {
        key: orderData.razorpay_key_id,
        amount: orderData.amount,
        currency: orderData.currency,
        name: 'VaultMind',
        description: `${planName} Subscription`,
        order_id: orderData.order_id,
        handler: async (response: any) => {
          try {
            // Verify payment on the backend
            await apiFetch('/subscription/verify', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
                plan_id: planId,
              }),
            });

            toast({
              title: 'Payment Successful',
              description: `Your ${planName} subscription has been activated!`,
            });

            onSuccess?.();
          } catch (error: any) {
            toast({
              title: 'Payment Verification Failed',
              description: error.message || 'Please contact support',
              variant: 'destructive',
            });
          }
        },
        prefill: {
          name: '',
          email: '',
        },
        theme: {
          color: '#8ab800',
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.on('payment.failed', (response: any) => {
        toast({
          title: 'Payment Failed',
          description: response.error?.description || 'Payment failed. Please try again.',
          variant: 'destructive',
        });
      });
      rzp.open();
    } catch (error: any) {
      toast({
        title: 'Checkout Error',
        description: error.message || 'Failed to initiate checkout',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button
      onClick={handleCheckout}
      disabled={isLoading}
      className="w-full rounded-none"
    >
      {isLoading ? (
        <>
          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
          Processing...
        </>
      ) : (
        children || `Subscribe to ${planName}`
      )}
    </Button>
  );
}

function loadRazorpayScript(): Promise<void> {
  return new Promise((resolve, reject) => {
    if (document.querySelector('script[src="https://checkout.razorpay.com/v1/checkout.js"]')) {
      resolve();
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.onload = () => resolve();
    script.onerror = () => reject(new Error('Failed to load Razorpay script'));
    document.body.appendChild(script);
  });
}
