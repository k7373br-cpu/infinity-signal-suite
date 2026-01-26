import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface Quote {
  pair: string;
  price: number;
  change: number;
}

// Fallback prices for when API fails
const getFallbackPrice = (pair: string): number => {
  if (pair.includes('JPY')) return 140 + Math.random() * 20;
  if (pair.includes('EUR/USD')) return 1.08 + Math.random() * 0.02;
  if (pair.includes('GBP/USD')) return 1.26 + Math.random() * 0.02;
  if (pair.includes('USD')) return 1.0 + Math.random() * 0.5;
  if (pair.includes('BTC')) return 95000 + Math.random() * 5000;
  if (pair.includes('ETH')) return 3200 + Math.random() * 300;
  if (pair.includes('BNB')) return 580 + Math.random() * 40;
  if (pair.includes('SOL')) return 180 + Math.random() * 20;
  if (pair.includes('XRP')) return 2.1 + Math.random() * 0.3;
  if (pair.includes('LTC')) return 95 + Math.random() * 15;
  if (pair.includes('XAUT')) return 2650 + Math.random() * 50;
  if (pair.includes('ZEC')) return 45 + Math.random() * 10;
  if (pair.includes('MNT')) return 0.8 + Math.random() * 0.2;
  if (pair === 'GOLD') return 2650 + Math.random() * 50;
  if (pair === 'SILVER') return 31 + Math.random() * 2;
  if (pair === 'PLATINUM') return 980 + Math.random() * 40;
  if (pair === 'PALLADIUM') return 950 + Math.random() * 50;
  return 1.0 + Math.random() * 0.5;
};

// Cache for quotes with timestamps
const quotesCache: Record<string, { quote: Quote; timestamp: number }> = {};
const CACHE_TTL = 5000; // 5 seconds cache

export function useQuotes(pairs: string[]) {
  const [quotes, setQuotes] = useState<Record<string, Quote>>({});
  const isFetching = useRef(false);
  const pairsRef = useRef(pairs);
  
  // Update ref when pairs change
  useEffect(() => {
    pairsRef.current = pairs;
  }, [pairs]);

  const fetchQuotes = useCallback(async () => {
    if (isFetching.current) return;
    
    const currentPairs = pairsRef.current;
    if (currentPairs.length === 0) return;
    
    const now = Date.now();
    const pairsToFetch: string[] = [];
    const cachedQuotes: Record<string, Quote> = {};
    
    // Check cache first
    for (const pair of currentPairs) {
      const cached = quotesCache[pair];
      if (cached && now - cached.timestamp < CACHE_TTL) {
        cachedQuotes[pair] = cached.quote;
      } else {
        pairsToFetch.push(pair);
      }
    }
    
    // If all pairs are cached, use cached data
    if (pairsToFetch.length === 0) {
      setQuotes(cachedQuotes);
      return;
    }
    
    isFetching.current = true;
    
    try {
      const { data, error } = await supabase.functions.invoke('finnhub-quotes', {
        body: { pairs: pairsToFetch }
      });
      
      if (error) {
        console.error('Error fetching quotes:', error);
        // Use fallback for failed pairs
        const fallbackQuotes: Record<string, Quote> = { ...cachedQuotes };
        for (const pair of pairsToFetch) {
          const price = getFallbackPrice(pair);
          fallbackQuotes[pair] = {
            pair,
            price,
            change: (Math.random() - 0.5) * 4
          };
        }
        setQuotes(fallbackQuotes);
        return;
      }
      
      const fetchedQuotes = data?.quotes || {};
      const newQuotes: Record<string, Quote> = { ...cachedQuotes };
      
      for (const pair of pairsToFetch) {
        if (fetchedQuotes[pair] && fetchedQuotes[pair].price > 0) {
          const quote: Quote = {
            pair,
            price: fetchedQuotes[pair].price,
            change: fetchedQuotes[pair].change
          };
          newQuotes[pair] = quote;
          quotesCache[pair] = { quote, timestamp: now };
        } else {
          // Use fallback if quote not available
          const price = getFallbackPrice(pair);
          const quote: Quote = {
            pair,
            price,
            change: (Math.random() - 0.5) * 4
          };
          newQuotes[pair] = quote;
        }
      }
      
      setQuotes(newQuotes);
    } catch (error) {
      console.error('Error in fetchQuotes:', error);
      // Use fallback on error
      const fallbackQuotes: Record<string, Quote> = { ...cachedQuotes };
      for (const pair of pairsToFetch) {
        const price = getFallbackPrice(pair);
        fallbackQuotes[pair] = {
          pair,
          price,
          change: (Math.random() - 0.5) * 4
        };
      }
      setQuotes(fallbackQuotes);
    } finally {
      isFetching.current = false;
    }
  }, []);

  useEffect(() => {
    fetchQuotes();
    const interval = setInterval(fetchQuotes, 1000);
    return () => clearInterval(interval);
  }, [fetchQuotes, pairs]);

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
