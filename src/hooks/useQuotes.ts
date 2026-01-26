import { useState, useEffect, useCallback } from 'react';

export interface Quote {
  pair: string;
  price: number;
  change: number;
}

// Generate realistic base prices for different asset types
const getBasePrice = (pair: string): number => {
  // Forex pairs
  if (pair.includes('JPY')) return 140 + Math.random() * 20;
  if (pair.includes('EUR/USD')) return 1.08 + Math.random() * 0.02;
  if (pair.includes('GBP/USD')) return 1.26 + Math.random() * 0.02;
  if (pair.includes('USD')) return 1.0 + Math.random() * 0.5;
  if (pair.includes('EUR') || pair.includes('GBP') || pair.includes('AUD') || pair.includes('NZD') || pair.includes('CAD') || pair.includes('CHF')) {
    return 0.6 + Math.random() * 0.8;
  }
  
  // Crypto pairs
  if (pair.includes('BTC')) return 95000 + Math.random() * 5000;
  if (pair.includes('ETH')) return 3200 + Math.random() * 300;
  if (pair.includes('BNB')) return 580 + Math.random() * 40;
  if (pair.includes('SOL')) return 180 + Math.random() * 20;
  if (pair.includes('XRP')) return 2.1 + Math.random() * 0.3;
  if (pair.includes('LTC')) return 95 + Math.random() * 15;
  if (pair.includes('XAUT')) return 2650 + Math.random() * 50;
  if (pair.includes('ZEC')) return 45 + Math.random() * 10;
  if (pair.includes('MNT')) return 0.8 + Math.random() * 0.2;
  
  // Metals
  if (pair === 'GOLD') return 2650 + Math.random() * 50;
  if (pair === 'SILVER') return 31 + Math.random() * 2;
  if (pair === 'PLATINUM') return 980 + Math.random() * 40;
  if (pair === 'PALLADIUM') return 950 + Math.random() * 50;
  
  return 1.0 + Math.random() * 0.5;
};

// Store prices to simulate realistic changes
const priceCache: Record<string, number> = {};

const getQuoteForPair = (pair: string): Quote => {
  if (!priceCache[pair]) {
    priceCache[pair] = getBasePrice(pair);
  }
  
  // Small random price change (-0.1% to +0.1%)
  const changePercent = (Math.random() - 0.5) * 0.002;
  priceCache[pair] = priceCache[pair] * (1 + changePercent);
  
  // Calculate display change (-2% to +2%)
  const displayChange = (Math.random() - 0.5) * 4;
  
  return {
    pair,
    price: priceCache[pair],
    change: displayChange
  };
};

export function useQuotes(pairs: string[]) {
  const [quotes, setQuotes] = useState<Record<string, Quote>>({});

  const updateQuotes = useCallback(() => {
    const newQuotes: Record<string, Quote> = {};
    pairs.forEach(pair => {
      newQuotes[pair] = getQuoteForPair(pair);
    });
    setQuotes(newQuotes);
  }, [pairs]);

  useEffect(() => {
    updateQuotes();
    const interval = setInterval(updateQuotes, 1000);
    return () => clearInterval(interval);
  }, [updateQuotes]);

  return quotes;
}

export function formatPrice(price: number, pair: string): string {
  if (pair.includes('JPY') || pair.includes('BTC') || pair.includes('ETH') || pair.includes('BNB') || pair.includes('SOL') || pair === 'GOLD' || pair === 'PLATINUM' || pair === 'PALLADIUM') {
    return price.toFixed(2);
  }
  if (pair.includes('USDT') && !pair.includes('BTC') && !pair.includes('ETH') && !pair.includes('BNB') && !pair.includes('SOL')) {
    return price.toFixed(4);
  }
  if (pair === 'SILVER') {
    return price.toFixed(3);
  }
  return price.toFixed(5);
}
