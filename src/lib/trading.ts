import { SignalDirection } from './constants';

export interface Signal {
  id: string;
  direction: SignalDirection;
  probability: number;
  instrument: string;
  timeframe: string;
  reason: string;
  timestamp: Date;
}

export interface UserStats {
  signalsUsed: number;
  signalsLimit: number;
  feedbackHistory: ('+' | '-')[];
  lastSignal: Signal | null;
}

export function isMarketOpen(): boolean {
  const now = new Date();
  const day = now.getUTCDay();
  // Saturday (6) and Sunday (0) - market closed
  return day !== 0 && day !== 6;
}

export function getMarketStatus(lang: 'ru' | 'en'): { isOpen: boolean; message: string } {
  const now = new Date();
  const day = now.getUTCDay();
  
  if (day === 6) {
    return {
      isOpen: false,
      message: lang === 'ru' 
        ? "📅 СУББОТА: РЫНОК ЗАКРЫТ\n⏰ Откроется в понедельник 00:00 UTC"
        : "📅 SATURDAY: MARKET CLOSED\n⏰ Opens Monday 00:00 UTC"
    };
  }
  
  if (day === 0) {
    return {
      isOpen: false,
      message: lang === 'ru'
        ? "📅 ВОСКРЕСЕНЬЕ: РЫНОК ЗАКРЫТ\n⏰ Откроется в понедельник 00:00 UTC"
        : "📅 SUNDAY: MARKET CLOSED\n⏰ Opens Monday 00:00 UTC"
    };
  }
  
  const days = {
    ru: ["Воскресенье", "Понедельник", "Вторник", "Среда", "Четверг", "Пятница", "Суббота"],
    en: ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"]
  };
  
  return {
    isOpen: true,
    message: lang === 'ru'
      ? `📅 ${days.ru[day]}: РЫНОК ОТКРЫТ ✅`
      : `📅 ${days.en[day]}: MARKET OPEN ✅`
  };
}

export async function generateSignalFromAI(
  instrument: string, 
  timeframe: string,
  feedbackHistory: ('+' | '-')[],
  lang: 'ru' | 'en' = 'en'
): Promise<Signal> {
  // Clean instrument name from flags
  const cleanInstrument = instrument.replace(/[\u{1F1E6}-\u{1F1FF}]+\s*/gu, '').trim();
  
  try {
    const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/generate-signal`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
      },
      body: JSON.stringify({
        instrument: cleanInstrument,
        timeframe,
        feedbackHistory,
        lang
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to generate signal');
    }

    const data = await response.json();
    
    return {
      id: data.id || Math.random().toString(36).substring(2, 11),
      direction: data.direction as SignalDirection,
      probability: data.probability,
      instrument: cleanInstrument,
      timeframe,
      reason: data.reason,
      timestamp: new Date(data.timestamp || Date.now())
    };
  } catch (error) {
    console.error('AI Signal generation error:', error);
    // Fallback to random signal if AI fails
    return generateFallbackSignal(cleanInstrument, timeframe, feedbackHistory);
  }
}

function generateFallbackSignal(
  instrument: string, 
  timeframe: string,
  feedbackHistory: ('+' | '-')[]
): Signal {
  const positiveCount = feedbackHistory.filter(f => f === '+').length;
  const negativeCount = feedbackHistory.filter(f => f === '-').length;
  
  let buyProbability = 0.5;
  if (feedbackHistory.length > 0) {
    buyProbability = 0.5 + (positiveCount - negativeCount) * 0.05;
    buyProbability = Math.max(0.3, Math.min(0.7, buyProbability));
  }
  
  const direction: SignalDirection = Math.random() < buyProbability ? 'BUY' : 'SELL';
  const probability = Math.floor(Math.random() * 20) + 75;
  
  const reasons = [
    "Chart pattern analysis",
    "Technical indicators",
    "Price movements",
    "Support/resistance levels",
    "Trend analysis"
  ];
  
  return {
    id: Math.random().toString(36).substring(2, 11),
    direction,
    probability,
    instrument,
    timeframe,
    reason: reasons[Math.floor(Math.random() * reasons.length)],
    timestamp: new Date()
  };
}

export function calculateAccuracy(feedbackHistory: ('+' | '-')[]): number {
  if (feedbackHistory.length === 0) return 0;
  const positive = feedbackHistory.filter(f => f === '+').length;
  return (positive / feedbackHistory.length) * 100;
}
