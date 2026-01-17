import { Language } from '@/lib/constants';
import { getMarketStatus } from '@/lib/trading';
import { cn } from '@/lib/utils';

interface MarketStatusProps {
  language: Language;
  className?: string;
}

export function MarketStatus({ language, className }: MarketStatusProps) {
  const status = getMarketStatus(language);
  
  return (
    <div className={cn(
      "px-4 py-2 rounded-lg text-sm font-medium whitespace-pre-line",
      status.isOpen 
        ? "bg-green-500/10 border border-green-500/30 text-green-400" 
        : "bg-red-500/10 border border-red-500/30 text-red-400",
      className
    )}>
      {status.message}
    </div>
  );
}
