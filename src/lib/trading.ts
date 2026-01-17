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

export function generateSignal(
  instrument: string, 
  timeframe: string,
  feedbackHistory: ('+' | '-')[]
): Signal {
  // Simulate AI analysis with some randomness
  const positiveCount = feedbackHistory.filter(f => f === '+').length;
  const negativeCount = feedbackHistory.filter(f => f === '-').length;
  
  // Bias based on feedback history
  let buyProbability = 0.5;
  if (feedbackHistory.length > 0) {
    buyProbability = 0.5 + (positiveCount - negativeCount) * 0.05;
    buyProbability = Math.max(0.3, Math.min(0.7, buyProbability));
  }
  
  const direction: SignalDirection = Math.random() < buyProbability ? 'BUY' : 'SELL';
  const probability = Math.floor(Math.random() * 20) + 75; // 75-94%
  
  const reasons = {
    ru: [
      "Анализ графических паттернов",
      "Технические индикаторы",
      "Ценовые движения",
      "Уровни поддержки/сопротивления",
      "Тренд анализ"
    ],
    en: [
      "Chart pattern analysis",
      "Technical indicators",
      "Price movements",
      "Support/resistance levels",
      "Trend analysis"
    ]
  };
  
  // Clean instrument name from flags
  const cleanInstrument = instrument.replace(/[\u{1F1E6}-\u{1F1FF}]+\s*/gu, '').trim();
  
  return {
    id: Math.random().toString(36).substring(2, 11),
    direction,
    probability,
    instrument: cleanInstrument,
    timeframe,
    reason: reasons.en[Math.floor(Math.random() * reasons.en.length)],
    timestamp: new Date()
  };
}

export function calculateAccuracy(feedbackHistory: ('+' | '-')[]): number {
  if (feedbackHistory.length === 0) return 0;
  const positive = feedbackHistory.filter(f => f === '+').length;
  return (positive / feedbackHistory.length) * 100;
}
