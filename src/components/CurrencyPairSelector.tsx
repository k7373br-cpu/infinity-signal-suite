import { useState, useMemo } from 'react';
import { CURRENCY_PAIRS, CRYPTO_PAIRS, Language, TRANSLATIONS } from '@/lib/constants';
import { cn } from '@/lib/utils';
import { Search, ChevronLeft, ChevronRight } from 'lucide-react';
import { Input } from '@/components/ui/input';

interface CurrencyPairSelectorProps {
  language: Language;
  onSelect: (pair: string) => void;
  showCrypto?: boolean;
}

const PAIRS_PER_PAGE = 15;

export function CurrencyPairSelector({ language, onSelect, showCrypto = false }: CurrencyPairSelectorProps) {
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(0);
  const [activeTab, setActiveTab] = useState<'forex' | 'crypto'>('forex');
  
  const t = TRANSLATIONS[language];
  
  const allPairs = useMemo(() => {
    if (activeTab === 'crypto' && showCrypto) {
      return CRYPTO_PAIRS;
    }
    return CURRENCY_PAIRS;
  }, [activeTab, showCrypto]);
  
  const filteredPairs = useMemo(() => {
    if (!search) return allPairs;
    return allPairs.filter(pair => 
      pair.toLowerCase().includes(search.toLowerCase())
    );
  }, [allPairs, search]);
  
  const totalPages = Math.ceil(filteredPairs.length / PAIRS_PER_PAGE);
  const paginatedPairs = filteredPairs.slice(page * PAIRS_PER_PAGE, (page + 1) * PAIRS_PER_PAGE);
  
  return (
    <div className="space-y-4 animate-fade-in">
      <h2 className="text-xl font-semibold text-center">{t.selectPair}</h2>
      
      {showCrypto && (
        <div className="flex justify-center gap-2">
          <button
            onClick={() => { setActiveTab('forex'); setPage(0); }}
            className={cn(
              "px-4 py-2 rounded-lg font-medium transition-all",
              activeTab === 'forex' 
                ? "bg-primary text-primary-foreground" 
                : "bg-secondary/50 text-muted-foreground hover:text-foreground"
            )}
          >
            💱 Forex
          </button>
          <button
            onClick={() => { setActiveTab('crypto'); setPage(0); }}
            className={cn(
              "px-4 py-2 rounded-lg font-medium transition-all",
              activeTab === 'crypto' 
                ? "bg-primary text-primary-foreground" 
                : "bg-secondary/50 text-muted-foreground hover:text-foreground"
            )}
          >
            ₿ Crypto
          </button>
        </div>
      )}
      
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(0); }}
          placeholder={t.searchPairs}
          className="pl-10 bg-secondary/50 border-border"
        />
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
        {paginatedPairs.map((pair) => (
          <button
            key={pair}
            onClick={() => onSelect(pair)}
            className="px-4 py-3 rounded-lg bg-secondary/50 hover:bg-secondary border border-border hover:border-primary/50 transition-all duration-200 text-sm font-medium hover:scale-[1.02] active:scale-[0.98]"
          >
            {pair}
          </button>
        ))}
      </div>
      
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-4">
          <button
            onClick={() => setPage(p => Math.max(0, p - 1))}
            disabled={page === 0}
            className="p-2 rounded-lg bg-secondary/50 hover:bg-secondary disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <span className="text-sm text-muted-foreground">
            {t.page} {page + 1} / {totalPages}
          </span>
          <button
            onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))}
            disabled={page >= totalPages - 1}
            className="p-2 rounded-lg bg-secondary/50 hover:bg-secondary disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      )}
    </div>
  );
}
