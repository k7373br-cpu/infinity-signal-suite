import { Language, TIMEFRAMES, TRANSLATIONS } from '@/lib/constants';
import { cn } from '@/lib/utils';
import { Clock } from 'lucide-react';

interface TimeframeSelectorProps {
  language: Language;
  selectedPair: string;
  onSelect: (timeframe: string) => void;
  onBack: () => void;
}

export function TimeframeSelector({ language, selectedPair, onSelect, onBack }: TimeframeSelectorProps) {
  const t = TRANSLATIONS[language];
  const timeframes = TIMEFRAMES[language];
  
  return (
    <div className="space-y-6 animate-fade-in">
      <div className="text-center">
        <p className="text-muted-foreground text-sm mb-2">💱 {selectedPair}</p>
        <h2 className="text-xl font-semibold flex items-center justify-center gap-2">
          <Clock className="w-5 h-5 text-primary" />
          {t.selectTimeframe}
        </h2>
      </div>
      
      <div className="grid grid-cols-3 gap-3">
        {timeframes.map((tf) => (
          <button
            key={tf}
            onClick={() => onSelect(tf)}
            className="px-4 py-4 rounded-lg bg-secondary/50 hover:bg-secondary border border-border hover:border-primary/50 transition-all duration-200 font-mono text-sm font-medium hover:scale-[1.02] active:scale-[0.98]"
          >
            {tf}
          </button>
        ))}
      </div>
      
      <button
        onClick={onBack}
        className="w-full py-3 rounded-lg bg-muted hover:bg-muted/80 text-muted-foreground hover:text-foreground transition-all"
      >
        ← {t.mainMenu}
      </button>
    </div>
  );
}
