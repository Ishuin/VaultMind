import { useState, useEffect, useCallback } from 'react';

export interface TierPricing {
  plan_id: string;
  price_usd: number;
  price_inr: number;
  interval: string;
  total_slots: number | null;
  filled_slots: number | null;
  available_slots: number | null;
  is_available: boolean;
  total_early_filled: number;
}

export interface PricingData {
  pricing: TierPricing[];
  total_early_filled: number;
  exchange_rate: number;
  exchange_rate_note: string;
}

interface UseRealtimePricingOptions {
  pollInterval?: number; // in milliseconds, default 5000 (5 seconds)
  enabled?: boolean;
}

export function useRealtimePricing(options: UseRealtimePricingOptions = {}) {
  const { pollInterval = 5000, enabled = true } = options;
  
  const [pricing, setPricing] = useState<TierPricing[]>([]);
  const [totalEarlyFilled, setTotalEarlyFilled] = useState(0);
  const [exchangeRate, setExchangeRate] = useState(83.50);
  const [exchangeRateNote, setExchangeRateNote] = useState('Assuming 1 USD = ₹83.50');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const fetchPricing = useCallback(async () => {
    try {
      const response = await fetch('/api/v1/subscription/pricing');
      if (!response.ok) {
        throw new Error('Failed to fetch pricing');
      }
      const data: PricingData = await response.json();
      
      setPricing(data.pricing);
      setTotalEarlyFilled(data.total_early_filled);
      setExchangeRate(data.exchange_rate);
      setExchangeRateNote(data.exchange_rate_note);
      setLastUpdated(new Date());
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!enabled) return;
    
    // Initial fetch
    fetchPricing();
    
    // Set up polling
    const interval = setInterval(fetchPricing, pollInterval);
    
    return () => clearInterval(interval);
  }, [fetchPricing, pollInterval, enabled]);

  const getTierPricing = useCallback((planId: string): TierPricing | undefined => {
    return pricing.find(p => p.plan_id === planId);
  }, [pricing]);

  const getTierStatus = useCallback((planId: string) => {
    const tier = getTierPricing(planId);
    if (!tier) return null;
    
    return {
      ...tier,
      isSoldOut: tier.total_slots !== null && tier.available_slots !== null && tier.available_slots <= 0,
      isLocked: !tier.is_available && planId !== 'lifetime' && planId !== 'standard',
      fillPercentage: tier.total_slots && tier.filled_slots !== null 
        ? Math.round((tier.filled_slots / tier.total_slots) * 100) 
        : null,
    };
  }, [getTierPricing]);

  const getCurrentPhase = useCallback(() => {
    if (totalEarlyFilled >= 150) return 'standard';
    if (totalEarlyFilled >= 100) return 'founder_3';
    if (totalEarlyFilled >= 50) return 'founder_2';
    return 'founder_1';
  }, [totalEarlyFilled]);

  return {
    pricing,
    totalEarlyFilled,
    exchangeRate,
    exchangeRateNote,
    isLoading,
    error,
    lastUpdated,
    getTierPricing,
    getTierStatus,
    getCurrentPhase,
    refresh: fetchPricing,
  };
}
