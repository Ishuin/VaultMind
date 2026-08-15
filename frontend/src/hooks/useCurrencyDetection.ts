import { useState, useEffect } from 'react';

export type Currency = 'USD' | 'INR' | 'EUR' | 'GBP' | 'CAD' | 'AUD';

interface CurrencyInfo {
  code: Currency;
  symbol: string;
  name: string;
  rate: number; // Exchange rate from USD
}

const CURRENCY_MAP: Record<string, Currency> = {
  US: 'USD',
  IN: 'INR',
  GB: 'GBP',
  EU: 'EUR',
  DE: 'EUR',
  FR: 'EUR',
  IT: 'EUR',
  ES: 'EUR',
  NL: 'EUR',
  BE: 'EUR',
  AT: 'EUR',
  IE: 'EUR',
  FI: 'EUR',
  PT: 'EUR',
  GR: 'EUR',
  LU: 'EUR',
  CA: 'CAD',
  AU: 'AUD',
};

const CURRENCY_INFO: Record<Currency, CurrencyInfo> = {
  USD: { code: 'USD', symbol: '$', name: 'US Dollar', rate: 1.0 },
  INR: { code: 'INR', symbol: '₹', name: 'Indian Rupee', rate: 83.50 },
  EUR: { code: 'EUR', symbol: '€', name: 'Euro', rate: 0.92 },
  GBP: { code: 'GBP', symbol: '£', name: 'British Pound', rate: 0.79 },
  CAD: { code: 'CAD', symbol: 'C$', name: 'Canadian Dollar', rate: 1.36 },
  AUD: { code: 'AUD', symbol: 'A$', name: 'Australian Dollar', rate: 1.53 },
};

const STORAGE_KEY = 'vaultmind_currency';

export function useCurrencyDetection() {
  const [currency, setCurrency] = useState<Currency>(() => {
    // Check localStorage first
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved && saved in CURRENCY_INFO) {
        return saved as Currency;
      }
    }
    return 'USD';
  });
  
  const [isDetecting, setIsDetecting] = useState(true);
  const [exchangeRateNote, setExchangeRateNote] = useState('');

  useEffect(() => {
    // Try to detect from IP if no saved currency
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      setIsDetecting(false);
      setExchangeRateNote(`Assuming 1 USD = ₹${CURRENCY_INFO[currency].rate}`);
      return;
    }

    const detectCurrency = async () => {
      try {
        const response = await fetch('https://ipapi.co/json/', {
          signal: AbortSignal.timeout(3000), // 3 second timeout
        });
        const data = await response.json();
        
        const detectedCurrency = CURRENCY_MAP[data.country_code] || 'USD';
        setCurrency(detectedCurrency);
        localStorage.setItem(STORAGE_KEY, detectedCurrency);
        setExchangeRateNote(`Assuming 1 USD = ₹${CURRENCY_INFO[detectedCurrency].rate}`);
      } catch (error) {
        // Fallback to USD on error
        setCurrency('USD');
        setExchangeRateNote('Assuming 1 USD = ₹83.50');
      } finally {
        setIsDetecting(false);
      }
    };

    detectCurrency();
  }, []);

  const changeCurrency = (newCurrency: Currency) => {
    setCurrency(newCurrency);
    localStorage.setItem(STORAGE_KEY, newCurrency);
    setExchangeRateNote(`Assuming 1 USD = ₹${CURRENCY_INFO[newCurrency].rate}`);
  };

  const getPrice = (priceUsd: number, priceInr: number): string => {
    const info = CURRENCY_INFO[currency];
    
    switch (currency) {
      case 'INR':
        return `₹${priceInr.toLocaleString()}`;
      case 'USD':
        return `$${priceUsd.toLocaleString()}`;
      case 'EUR':
        return `€${Math.round(priceUsd * info.rate).toLocaleString()}`;
      case 'GBP':
        return `£${Math.round(priceUsd * info.rate).toLocaleString()}`;
      case 'CAD':
        return `C$${Math.round(priceUsd * info.rate).toLocaleString()}`;
      case 'AUD':
        return `A$${Math.round(priceUsd * info.rate).toLocaleString()}`;
      default:
        return `$${priceUsd.toLocaleString()}`;
    }
  };

  const getSymbol = (): string => {
    return CURRENCY_INFO[currency].symbol;
  };

  return {
    currency,
    isDetecting,
    exchangeRateNote,
    changeCurrency,
    getPrice,
    getSymbol,
    supportedCurrencies: Object.values(CURRENCY_INFO),
  };
}
