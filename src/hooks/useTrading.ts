import { useState, useCallback, useEffect } from 'react';
import { Language, UserStatus, VERIFICATION_CODES } from '@/lib/constants';
import { Signal, UserStats, generateSignalFromAI, isMarketOpen } from '@/lib/trading';

const STORAGE_KEY = 'infinity_traffic_state';

interface TradingState {
  language: Language;
  userStatus: UserStatus;
  stats: UserStats;
  currentSignal: Signal | null;
  selectedPair: string | null;
  selectedTimeframe: string | null;
}

const getInitialState = (): TradingState => {
  if (typeof window !== 'undefined') {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        // Reset daily usage if new day
        const today = new Date().toDateString();
        if (parsed.lastUsageDate !== today) {
          parsed.stats.signalsUsed = 0;
          parsed.lastUsageDate = today;
        }
        return parsed;
      } catch {
        // Invalid saved state
      }
    }
  }
  
  return {
    language: 'ru',
    userStatus: 'free',
    stats: {
      signalsUsed: 0,
      signalsLimit: 5,
      feedbackHistory: [],
      lastSignal: null
    },
    currentSignal: null,
    selectedPair: null,
    selectedTimeframe: null
  };
};

export function useTrading() {
  const [state, setState] = useState<TradingState>(getInitialState);
  const [isGenerating, setIsGenerating] = useState(false);

  // Persist state
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({
      ...state,
      lastUsageDate: new Date().toDateString()
    }));
  }, [state]);

  const setLanguage = useCallback((lang: Language) => {
    setState(prev => ({ ...prev, language: lang }));
  }, []);

  const getSignalsLimit = useCallback((status: UserStatus): number => {
    switch (status) {
      case 'vip': return Infinity;
      case 'verified': return 50;
      default: return 5;
    }
  }, []);

  const getRemainingSignals = useCallback((): number | '∞' => {
    if (state.userStatus === 'vip') return '∞';
    const limit = getSignalsLimit(state.userStatus);
    return Math.max(0, limit - state.stats.signalsUsed);
  }, [state.userStatus, state.stats.signalsUsed, getSignalsLimit]);

  const canGenerateSignal = useCallback((): boolean => {
    if (!isMarketOpen()) return false;
    if (state.userStatus === 'vip') return true;
    const limit = getSignalsLimit(state.userStatus);
    return state.stats.signalsUsed < limit;
  }, [state.userStatus, state.stats.signalsUsed, getSignalsLimit]);

  const generateNewSignal = useCallback(async (pair: string, timeframe: string, minProbability?: number): Promise<Signal | null> => {
    if (!canGenerateSignal()) return null;
    
    setIsGenerating(true);
    
    try {
      const signal = await generateSignalFromAI(pair, timeframe, state.stats.feedbackHistory, state.language, minProbability);
      
      setState(prev => ({
        ...prev,
        currentSignal: signal,
        selectedPair: pair,
        selectedTimeframe: timeframe,
        stats: {
          ...prev.stats,
          signalsUsed: prev.stats.signalsUsed + 1,
          lastSignal: signal
        }
      }));
      
      setIsGenerating(false);
      return signal;
    } catch (error) {
      console.error('Error generating signal:', error);
      setIsGenerating(false);
      return null;
    }
  }, [canGenerateSignal, state.stats.feedbackHistory, state.language]);

  const addFeedback = useCallback((feedback: '+' | '-') => {
    setState(prev => ({
      ...prev,
      stats: {
        ...prev.stats,
        feedbackHistory: [...prev.stats.feedbackHistory.slice(-9), feedback]
      }
    }));
  }, []);

  const verifyCode = useCallback((code: string): { success: boolean; status?: UserStatus } => {
    if (code === VERIFICATION_CODES.vip) {
      setState(prev => ({
        ...prev,
        userStatus: 'vip',
        stats: { ...prev.stats, signalsLimit: Infinity }
      }));
      return { success: true, status: 'vip' };
    }
    if (code === VERIFICATION_CODES.verified) {
      setState(prev => ({
        ...prev,
        userStatus: 'verified',
        stats: { ...prev.stats, signalsLimit: 50 }
      }));
      return { success: true, status: 'verified' };
    }
    return { success: false };
  }, []);

  const repeatLastSignal = useCallback(async (): Promise<Signal | null> => {
    if (!state.selectedPair || !state.selectedTimeframe) return null;
    return generateNewSignal(state.selectedPair, state.selectedTimeframe);
  }, [state.selectedPair, state.selectedTimeframe, generateNewSignal]);

  return {
    language: state.language,
    userStatus: state.userStatus,
    stats: state.stats,
    currentSignal: state.currentSignal,
    selectedPair: state.selectedPair,
    selectedTimeframe: state.selectedTimeframe,
    isGenerating,
    setLanguage,
    getRemainingSignals,
    canGenerateSignal,
    generateNewSignal,
    addFeedback,
    verifyCode,
    repeatLastSignal
  };
}
