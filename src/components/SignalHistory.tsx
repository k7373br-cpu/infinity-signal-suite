import { SignalHistoryItem } from '@/hooks/useTrading';
import { Language, TRANSLATIONS } from '@/lib/constants';
import { TrendingUp, TrendingDown, Clock, History } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SignalHistoryProps {
  history: SignalHistoryItem[];
  language: Language;
}

export function SignalHistory({ history, language }: SignalHistoryProps) {
  const t = TRANSLATIONS[language];
  
  if (history.length === 0) {
    return (
      <div className="glass-card p-4 space-y-3">
        <div className="flex items-center gap-2">
          <History className="w-4 h-4 text-muted-foreground" />
          <h3 className="font-medium text-sm text-muted-foreground">
            {language === 'ru' ? 'История сигналов' : 'Signal History'}
          </h3>
        </div>
        <p className="text-sm text-muted-foreground text-center py-4">
          {language === 'ru' ? 'Пока нет сигналов' : 'No signals yet'}
        </p>
      </div>
    );
  }

  return (
    <div className="glass-card p-4 space-y-3">
      <div className="flex items-center gap-2">
        <History className="w-4 h-4 text-primary" />
        <h3 className="font-medium text-sm text-muted-foreground">
          {language === 'ru' ? 'История сигналов' : 'Signal History'}
        </h3>
      </div>
      
      <div className="space-y-2 max-h-48 overflow-y-auto">
        {history.map((item) => (
          <div
            key={item.id}
            className={cn(
              "flex items-center justify-between p-3 rounded-lg border transition-all",
              item.direction === 'BUY'
                ? "bg-green-500/5 border-green-500/20"
                : "bg-red-500/5 border-red-500/20"
            )}
          >
            <div className="flex items-center gap-3">
              <div className={cn(
                "p-1.5 rounded-lg",
                item.direction === 'BUY' ? "bg-green-500/10" : "bg-red-500/10"
              )}>
                {item.direction === 'BUY' ? (
                  <TrendingUp className="w-4 h-4 text-green-400" />
                ) : (
                  <TrendingDown className="w-4 h-4 text-red-400" />
                )}
              </div>
              <div>
                <p className="font-mono font-medium text-sm">{item.pair}</p>
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Clock className="w-3 h-3" />
                  {item.time}
                </div>
              </div>
            </div>
            
            <div className={cn(
              "px-3 py-1 rounded-full text-xs font-bold",
              item.direction === 'BUY'
                ? "bg-green-500/20 text-green-400"
                : "bg-red-500/20 text-red-400"
            )}>
              {item.direction === 'BUY' ? '↑' : '↓'} {item.direction}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
