import { Language, TRANSLATIONS } from '@/lib/constants';
import { Loader2, Brain, BarChart3, Zap } from 'lucide-react';

interface LoadingSignalProps {
  language: Language;
  pair: string;
  timeframe: string;
}

export function LoadingSignal({ language, pair, timeframe }: LoadingSignalProps) {
  const t = TRANSLATIONS[language];
  
  return (
    <div className="space-y-6 animate-fade-in">
      <div className="relative overflow-hidden rounded-2xl p-8 bg-gradient-to-br from-secondary/50 to-card border border-border">
        {/* Animated background */}
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-primary/5 to-transparent animate-shimmer" 
             style={{ backgroundSize: '200% 100%' }} />
        
        <div className="relative space-y-6 text-center">
          {/* Spinning loader */}
          <div className="relative mx-auto w-20 h-20">
            <div className="absolute inset-0 rounded-full border-2 border-primary/20 animate-pulse-ring" />
            <div className="absolute inset-2 rounded-full border-2 border-primary/40 animate-pulse-ring" style={{ animationDelay: '0.2s' }} />
            <div className="absolute inset-4 rounded-full bg-primary/10 flex items-center justify-center">
              <Loader2 className="w-8 h-8 text-primary animate-spin" />
            </div>
          </div>
          
          <div className="space-y-2">
            <h3 className="text-xl font-bold">INFINITY TRAFFIC</h3>
            <p className="text-muted-foreground">{t.analyzing}</p>
          </div>
          
          {/* Info */}
          <div className="grid grid-cols-2 gap-4 max-w-xs mx-auto">
            <div className="p-3 rounded-lg bg-secondary/50">
              <p className="text-xs text-muted-foreground mb-1">💱 {language === 'ru' ? 'Пара' : 'Pair'}</p>
              <p className="font-mono font-medium text-sm">{pair}</p>
            </div>
            <div className="p-3 rounded-lg bg-secondary/50">
              <p className="text-xs text-muted-foreground mb-1">⏰ {t.timeframe}</p>
              <p className="font-mono font-medium text-sm">{timeframe}</p>
            </div>
          </div>
          
          {/* Progress steps */}
          <div className="flex items-center justify-center gap-6 text-xs text-muted-foreground">
            <div className="flex items-center gap-1.5">
              <Brain className="w-4 h-4 text-primary animate-pulse" />
              <span>AI</span>
            </div>
            <div className="flex items-center gap-1.5">
              <BarChart3 className="w-4 h-4 text-primary animate-pulse" style={{ animationDelay: '0.3s' }} />
              <span>{language === 'ru' ? 'Анализ' : 'Analysis'}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Zap className="w-4 h-4 text-primary animate-pulse" style={{ animationDelay: '0.6s' }} />
              <span>{language === 'ru' ? 'Сигнал' : 'Signal'}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
