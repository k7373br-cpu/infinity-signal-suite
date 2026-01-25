import { Signal } from '@/lib/trading';
import { Language, TRANSLATIONS } from '@/lib/constants';
import { calculateAccuracy } from '@/lib/trading';
import { cn } from '@/lib/utils';
import { TrendingUp, TrendingDown, Target, Clock, BarChart3, CheckCircle, XCircle, ArrowLeft } from 'lucide-react';

interface SignalDisplayProps {
  signal: Signal;
  language: Language;
  remainingSignals: number | '∞';
  feedbackHistory: ('+' | '-')[];
  onFeedback: (feedback: '+' | '-') => void;
  onMainMenu: () => void;
  onImprovedSignal: () => void;
}

export function SignalDisplay({
  signal,
  language,
  remainingSignals,
  feedbackHistory,
  onFeedback,
  onMainMenu,
  onImprovedSignal
}: SignalDisplayProps) {
  const t = TRANSLATIONS[language];
  const isBuy = signal.direction === 'BUY';
  const accuracy = calculateAccuracy(feedbackHistory);
  const positiveCount = feedbackHistory.filter(f => f === '+').length;
  const negativeCount = feedbackHistory.filter(f => f === '-').length;
  
  return (
    <div className="space-y-6 animate-slide-up">
      {/* Signal Card */}
      <div className={cn(
        "relative overflow-hidden rounded-2xl p-6 border-2",
        isBuy 
          ? "bg-gradient-to-br from-green-500/10 to-emerald-500/5 border-green-500/30" 
          : "bg-gradient-to-br from-red-500/10 to-rose-500/5 border-red-500/30"
      )}>
        {/* Glow effect */}
        <div className={cn(
          "absolute inset-0 opacity-20",
          isBuy ? "bg-green-500" : "bg-red-500"
        )} style={{ filter: 'blur(60px)' }} />
        
        <div className="relative space-y-4">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {isBuy ? (
                <TrendingUp className="w-6 h-6 text-green-400" />
              ) : (
                <TrendingDown className="w-6 h-6 text-red-400" />
              )}
              <span className="text-sm font-medium text-muted-foreground">INFINITY TRAFFIC</span>
            </div>
            <div className={cn(
              "px-4 py-2 rounded-full font-bold text-lg",
              isBuy 
                ? "bg-green-500 text-black" 
                : "bg-red-500 text-white"
            )}>
              {signal.direction}
            </div>
          </div>
          
          {/* Main info */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground uppercase">{t.instrument}</p>
              <p className="font-mono font-semibold text-lg">{signal.instrument}</p>
            </div>
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground uppercase flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {t.timeframe}
              </p>
              <p className="font-mono font-semibold text-lg">{signal.timeframe}</p>
            </div>
          </div>
          
          {/* Probability */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <p className="text-xs text-muted-foreground uppercase flex items-center gap-1">
                <Target className="w-3 h-3" />
                {t.probability}
              </p>
              <p className={cn(
                "font-mono font-bold text-2xl",
                isBuy ? "text-green-400" : "text-red-400"
              )}>
                {signal.probability}%
              </p>
            </div>
            <div className="h-2 bg-secondary rounded-full overflow-hidden">
              <div 
                className={cn(
                  "h-full rounded-full transition-all duration-1000",
                  isBuy 
                    ? "bg-gradient-to-r from-green-500 to-emerald-400" 
                    : "bg-gradient-to-r from-red-500 to-rose-400"
                )}
                style={{ width: `${signal.probability}%` }}
              />
            </div>
          </div>
          
          {/* Stats row */}
          <div className="flex items-center justify-end pt-2 border-t border-border/50">
            <div className="text-sm">
              <span className="text-muted-foreground">{t.signalsLeft}:</span>
              <span className="ml-1 font-mono font-bold text-primary">{remainingSignals}</span>
            </div>
          </div>
        </div>
      </div>
      
      {/* Feedback section */}
      <div className="space-y-3">
        <p className="text-center text-sm text-muted-foreground">{t.rateSignal}</p>
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={() => onFeedback('+')}
            className="flex items-center justify-center gap-2 py-4 rounded-xl bg-green-500/10 hover:bg-green-500/20 border border-green-500/30 text-green-400 font-medium transition-all hover:scale-[1.02] active:scale-[0.98]"
          >
            <CheckCircle className="w-5 h-5" />
            {t.correct} (+)
          </button>
          <button
            onClick={() => onFeedback('-')}
            className="flex items-center justify-center gap-2 py-4 rounded-xl bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 text-red-400 font-medium transition-all hover:scale-[1.02] active:scale-[0.98]"
          >
            <XCircle className="w-5 h-5" />
            {t.incorrect} (-)
          </button>
        </div>
      </div>
      
      {/* Action buttons */}
      <div className="grid grid-cols-2 gap-3">
        <button
          onClick={onImprovedSignal}
          className="py-3 rounded-xl bg-primary/10 hover:bg-primary/20 border border-primary/30 text-primary font-medium transition-all"
        >
          🔄 {t.improvedSignal}
        </button>
        <button
          onClick={onMainMenu}
          className="py-3 rounded-xl bg-secondary hover:bg-secondary/80 text-muted-foreground hover:text-foreground font-medium transition-all flex items-center justify-center gap-2"
        >
          <ArrowLeft className="w-4 h-4" />
          {t.mainMenu}
        </button>
      </div>
    </div>
  );
}
