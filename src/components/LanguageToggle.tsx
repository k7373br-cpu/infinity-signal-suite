import { Language } from '@/lib/constants';
import { cn } from '@/lib/utils';

interface LanguageToggleProps {
  language: Language;
  onLanguageChange: (lang: Language) => void;
}

export function LanguageToggle({ language, onLanguageChange }: LanguageToggleProps) {
  return (
    <div className="flex items-center gap-1 p-1 rounded-lg bg-secondary/50 border border-border">
      <button
        onClick={() => onLanguageChange('ru')}
        className={cn(
          "px-3 py-1.5 rounded-md text-sm font-medium transition-all duration-200",
          language === 'ru' 
            ? "bg-primary text-primary-foreground shadow-md" 
            : "text-muted-foreground hover:text-foreground"
        )}
      >
        🇷🇺 RU
      </button>
      <button
        onClick={() => onLanguageChange('en')}
        className={cn(
          "px-3 py-1.5 rounded-md text-sm font-medium transition-all duration-200",
          language === 'en' 
            ? "bg-primary text-primary-foreground shadow-md" 
            : "text-muted-foreground hover:text-foreground"
        )}
      >
        🇬🇧 EN
      </button>
    </div>
  );
}
