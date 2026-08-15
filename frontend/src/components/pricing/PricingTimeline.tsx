import React from 'react';
import { motion } from 'framer-motion';
import { useRealtimePricing, TierPricing } from '@/hooks/useRealtimePricing';
import { useCurrencyDetection, Currency } from '@/hooks/useCurrencyDetection';
import { Lock, Unlock, Zap, Crown, Infinity } from 'lucide-react';

interface PricingTimelineProps {
  onSelectPlan?: (planId: string) => void;
  selectedPlan?: string | null;
}

export function PricingTimeline({ onSelectPlan, selectedPlan }: PricingTimelineProps) {
  const { 
    pricing, 
    totalEarlyFilled, 
    exchangeRateNote, 
    isLoading, 
    getTierStatus,
    getCurrentPhase 
  } = useRealtimePricing({ pollInterval: 5000 });
  
  const { currency, changeCurrency, getPrice, getSymbol, supportedCurrencies } = useCurrencyDetection();

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  const founder1 = getTierStatus('founder_1');
  const founder2 = getTierStatus('founder_2');
  const founder3 = getTierStatus('founder_3');
  const standard = getTierStatus('standard');
  const lifetime = getTierStatus('lifetime');

  const currentPhase = getCurrentPhase();

  return (
    <div className="space-y-8">
      {/* Exchange Rate Note */}
      <div className="text-center text-sm text-muted-foreground">
        {exchangeRateNote}
      </div>

      {/* Currency Selector */}
      <div className="flex justify-center">
        <div className="inline-flex border border-border bg-card rounded-lg overflow-hidden">
          {supportedCurrencies.map((c) => (
            <button
              key={c.code}
              onClick={() => changeCurrency(c.code)}
              className={`px-4 py-2 text-sm font-medium transition-colors ${
                currency === c.code
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              {c.symbol} {c.code}
            </button>
          ))}
        </div>
      </div>

      {/* Dynamic Pricing Timeline */}
      <div className="bg-card border border-border rounded-xl p-6">
        <div className="flex items-center gap-2 mb-6">
          <Zap className="w-5 h-5 text-primary" />
          <h3 className="text-lg font-semibold">Dynamic Pricing Timeline</h3>
        </div>
        
        {/* Timeline Bar */}
        <div className="relative">
          {/* Background Track */}
          <div className="h-3 bg-muted rounded-full overflow-hidden">
            {/* Filled Progress */}
            <motion.div
              className="h-full bg-primary"
              initial={{ width: 0 }}
              animate={{ width: `${Math.min((totalEarlyFilled / 150) * 100, 100)}%` }}
              transition={{ duration: 0.5, ease: "easeOut" }}
            />
          </div>
          
          {/* Phase Markers */}
          <div className="flex justify-between mt-3">
            <div className={`text-center ${currentPhase === 'founder_1' ? 'text-primary font-bold text-lg' : 'text-muted-foreground text-sm'}`}>
              <div>$49</div>
              {currentPhase === 'founder_1' && <div className="text-xs font-medium mt-1">← Active</div>}
            </div>
            <div className={`text-center ${currentPhase === 'founder_2' ? 'text-primary font-bold text-lg' : 'text-muted-foreground text-sm'}`}>
              <div>$99</div>
              {currentPhase === 'founder_2' && <div className="text-xs font-medium mt-1">← Active</div>}
            </div>
            <div className={`text-center ${currentPhase === 'founder_3' ? 'text-primary font-bold text-lg' : 'text-muted-foreground text-sm'}`}>
              <div>$149</div>
              {currentPhase === 'founder_3' && <div className="text-xs font-medium mt-1">← Active</div>}
            </div>
            <div className={`text-center ${totalEarlyFilled >= 150 ? 'text-primary font-bold text-lg' : 'text-muted-foreground text-sm'}`}>
              <div>$250 ∞</div>
              {totalEarlyFilled >= 150 && <div className="text-xs font-medium mt-1">← Active</div>}
            </div>
          </div>
          
          {/* Slot Count */}
          <div className="flex justify-between mt-2 text-sm text-muted-foreground">
            <span>0</span>
            <span>50</span>
            <span>100</span>
            <span>150+</span>
          </div>
        </div>

        {/* Current Status */}
        <div className="mt-6 p-4 bg-muted/50 rounded-lg">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Current Price:</span>
            <span className="text-2xl font-bold text-primary">
              {currentPhase === 'founder_1' && founder1 && getPrice(founder1.price_usd, founder1.price_inr)}
              {currentPhase === 'founder_2' && founder2 && getPrice(founder2.price_usd, founder2.price_inr)}
              {currentPhase === 'founder_3' && founder3 && getPrice(founder3.price_usd, founder3.price_inr)}
              {currentPhase === 'standard' && standard && getPrice(standard.price_usd, standard.price_inr)}
              <span className="text-lg font-normal text-muted-foreground">/mo</span>
            </span>
          </div>
          <div className="flex items-center justify-between mt-2">
            <span className="text-sm text-muted-foreground">Slots Filled:</span>
            <span className="font-medium text-lg">{totalEarlyFilled} / 150</span>
          </div>
        </div>

        {/* Tier Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
          {/* Phase 1 */}
          <TierCard
            tier={founder1}
            phase={1}
            isCurrentPhase={currentPhase === 'founder_1'}
            currency={currency}
            getPrice={getPrice}
            onSelect={() => onSelectPlan?.('founder_1')}
            isSelected={selectedPlan === 'founder_1'}
          />
          
          {/* Phase 2 */}
          <TierCard
            tier={founder2}
            phase={2}
            isCurrentPhase={currentPhase === 'founder_2'}
            isLocked={currentPhase === 'founder_1'}
            currency={currency}
            getPrice={getPrice}
            onSelect={() => onSelectPlan?.('founder_2')}
            isSelected={selectedPlan === 'founder_2'}
          />
          
          {/* Phase 3 */}
          <TierCard
            tier={founder3}
            phase={3}
            isCurrentPhase={currentPhase === 'founder_3'}
            isLocked={currentPhase === 'founder_1' || currentPhase === 'founder_2'}
            currency={currency}
            getPrice={getPrice}
            onSelect={() => onSelectPlan?.('founder_3')}
            isSelected={selectedPlan === 'founder_3'}
          />
        </div>

        {/* Standard Tier (After 150 slots) */}
        {totalEarlyFilled >= 150 && standard && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-4 p-4 border border-primary/50 rounded-lg bg-primary/5"
          >
            <div className="flex items-center justify-between">
              <div>
                <span className="font-medium">Standard Price:</span>
                <span className="ml-2 text-primary font-bold">
                  {getPrice(standard.price_usd, standard.price_inr)}/mo
                </span>
              </div>
              <span className="text-sm text-muted-foreground">Unlimited slots</span>
            </div>
          </motion.div>
        )}
      </div>

      {/* Lifetime Tier */}
      <div className="bg-card border border-border rounded-xl p-6">
        <div className="flex items-center gap-2 mb-6">
          <Crown className="w-5 h-5 text-primary" />
          <h3 className="text-lg font-semibold">Lifetime Access</h3>
        </div>
        
        {/* Lifetime Timeline (Infinity) */}
        <div className="relative">
          <div className="h-3 bg-gradient-to-r from-primary/50 to-primary rounded-full" />
          <div className="flex justify-between mt-3 text-sm text-muted-foreground">
            <span>Now</span>
            <span className="flex items-center gap-1">
              <Infinity className="w-4 h-4" /> Forever
            </span>
          </div>
        </div>

        {/* Lifetime Card */}
        {lifetime && (
          <div className="mt-6 p-6 border border-primary rounded-lg bg-primary/5">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <h4 className="text-2xl font-bold">Lifetime Founder</h4>
                <p className="text-muted-foreground text-lg">One-time payment. Lifetime access.</p>
                <p className="text-muted-foreground mt-1">Always available. Never locked.</p>
              </div>
              <div className="text-right">
                <div className="text-4xl font-bold text-primary">
                  {getPrice(lifetime.price_usd, lifetime.price_inr)}
                </div>
                <div className="text-lg text-muted-foreground">one-time</div>
                <button
                  onClick={() => onSelectPlan?.('lifetime')}
                  className={`mt-4 px-8 py-3 rounded-lg font-medium text-lg transition-colors ${
                    selectedPlan === 'lifetime'
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-primary/10 text-primary hover:bg-primary/20'
                  }`}
                >
                  Get Lifetime Access
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// Tier Card Component
interface TierCardProps {
  tier: TierPricing | null;
  phase: number;
  isCurrentPhase: boolean;
  isLocked?: boolean;
  currency: Currency;
  getPrice: (priceUsd: number, priceInr: number) => string;
  onSelect: () => void;
  isSelected: boolean;
}

function TierCard({ 
  tier, 
  phase, 
  isCurrentPhase, 
  isLocked = false, 
  currency, 
  getPrice, 
  onSelect, 
  isSelected 
}: TierCardProps) {
  if (!tier) return null;

  const isSoldOut = tier.total_slots !== null && tier.available_slots !== null && tier.available_slots <= 0;
  const fillPercentage = tier.total_slots && tier.filled_slots !== null 
    ? Math.round((tier.filled_slots / tier.total_slots) * 100) 
    : 0;

  return (
    <motion.div
      whileHover={{ scale: isLocked || isSoldOut ? 1 : 1.02 }}
      className={`relative p-4 rounded-lg border transition-all ${
        isSelected
          ? 'border-primary bg-primary/10'
          : isCurrentPhase
          ? 'border-primary/50 bg-primary/5'
          : isLocked || isSoldOut
          ? 'border-border bg-muted/30 opacity-60'
          : 'border-border bg-card hover:border-primary/30'
      }`}
    >
      {/* Phase Badge */}
      <div className="flex items-center justify-between mb-3">
        <span className="text-sm font-medium text-muted-foreground">Phase {phase}</span>
        {isCurrentPhase && (
          <span className="px-2 py-0.5 text-sm font-medium bg-primary text-primary-foreground rounded">
            Current
          </span>
        )}
        {isLocked && (
          <Lock className="w-5 h-5 text-muted-foreground" />
        )}
        {isSoldOut && (
          <span className="px-2 py-0.5 text-sm font-medium bg-destructive text-destructive-foreground rounded">
            Sold Out
          </span>
        )}
      </div>

      {/* Price */}
      <div className="text-3xl font-bold text-foreground">
        {getPrice(tier.price_usd, tier.price_inr)}
        <span className="text-lg font-normal text-muted-foreground">/mo</span>
      </div>

      {/* Slots */}
      <div className="mt-3">
        <div className="flex justify-between text-sm text-muted-foreground mb-1">
          <span>{tier.filled_slots ?? 0} / {tier.total_slots ?? '∞'} slots</span>
          <span>{fillPercentage}%</span>
        </div>
        <div className="h-2 bg-muted rounded-full overflow-hidden">
          <motion.div
            className={`h-full ${isSoldOut ? 'bg-destructive' : 'bg-primary'}`}
            initial={{ width: 0 }}
            animate={{ width: `${fillPercentage}%` }}
            transition={{ duration: 0.3 }}
          />
        </div>
      </div>

      {/* Action Button */}
      <button
        onClick={onSelect}
        disabled={isLocked || isSoldOut}
        className={`w-full mt-4 py-2 px-4 rounded-lg font-medium transition-colors ${
          isSelected
            ? 'bg-primary text-primary-foreground'
            : isLocked || isSoldOut
            ? 'bg-muted text-muted-foreground cursor-not-allowed'
            : 'bg-primary/10 text-primary hover:bg-primary/20'
        }`}
      >
        {isLocked ? (
          <span className="flex items-center justify-center gap-2">
            <Lock className="w-4 h-4" />
            Unlock Previous First
          </span>
        ) : isSoldOut ? (
          'Sold Out'
        ) : isSelected ? (
          'Selected'
        ) : (
          <span className="flex items-center justify-center gap-2">
            <Unlock className="w-4 h-4" />
            Subscribe
          </span>
        )}
      </button>
    </motion.div>
  );
}
