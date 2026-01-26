import { useState, useMemo } from 'react';
import { CURRENCY_PAIRS, CRYPTO_PAIRS, METAL_PAIRS, Language, TRANSLATIONS, AssetType } from '@/lib/constants';
import { cn } from '@/lib/utils';
import { Search, ChevronLeft, ChevronRight, TrendingUp, TrendingDown } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { useQuotes, formatPrice } from '@/hooks/useQuotes';

interface CurrencyPairSelectorProps {
  language: Language;
  onSelect: (pair: string) => void;
  showCrypto?: boolean;
  showMetals?: boolean;
}

const PAIRS_PER_PAGE = 12;

export function CurrencyPairSelector({ language, onSelect, showCrypto = false, showMetals = false }: CurrencyPairSelectorProps) {
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(0);
  const [activeTab, setActiveTab] = useState<AssetType>('forex');
  
  const t = TRANSLATIONS[language];
  
  const allPairs = useMemo(() => {
    if (activeTab === 'crypto' && showCrypto) {
      return CRYPTO_PAIRS;
    }
    if (activeTab === 'metals' && showMetals) {
      return METAL_PAIRS;
    }
    return CURRENCY_PAIRS;
  }, [activeTab, showCrypto, showMetals]);
  
  const filteredPairs = useMemo(() => {
    if (!search) return allPairs;
    return allPairs.filter(pair => 
      pair.toLowerCase().includes(search.toLowerCase())
    );
  }, [allPairs, search]);
  
  const quotes = useQuotes(filteredPairs);
  
  const totalPages = Math.ceil(filteredPairs.length / PAIRS_PER_PAGE);
  const paginatedPairs = filteredPairs.slice(page * PAIRS_PER_PAGE, (page + 1) * PAIRS_PER_PAGE);
  
  const getAssetIcon = (type: AssetType) => {
    switch (type) {
      case 'forex': return '💱';
      case 'crypto': return '₿';
      case 'metals': return '🥇';
    }
  };
  
  const getTabLabel = (type: AssetType) => {
    switch (type) {
      case 'forex': return 'Forex';
      case 'crypto': return 'Crypto';
      case 'metals': return language === 'ru' ? 'Металлы' : 'Metals';
    }
  };
  
  return (
    <div className="space-y-4 animate-fade-in">
      <h2 className="text-xl font-semibold text-center">{t.selectPair}</h2>
      
      {/* Tabs */}
      <div className="flex justify-center gap-2 flex-wrap">
        <button
          onClick={() => { setActiveTab('forex'); setPage(0); }}
          className={cn(
            "px-4 py-2 rounded-lg font-medium transition-all text-sm",
            activeTab === 'forex' 
              ? "bg-primary text-primary-foreground shadow-lg shadow-primary/25" 
              : "bg-secondary/50 text-muted-foreground hover:text-foreground hover:bg-secondary"
          )}
        >
          {getAssetIcon('forex')} {getTabLabel('forex')}
        </button>
        
        {showCrypto && (
          <button
            onClick={() => { setActiveTab('crypto'); setPage(0); }}
            className={cn(
              "px-4 py-2 rounded-lg font-medium transition-all text-sm",
              activeTab === 'crypto' 
                ? "bg-primary text-primary-foreground shadow-lg shadow-primary/25" 
                : "bg-secondary/50 text-muted-foreground hover:text-foreground hover:bg-secondary"
            )}
          >
            {getAssetIcon('crypto')} {getTabLabel('crypto')}
          </button>
        )}
        
        {showMetals && (
          <button
            onClick={() => { setActiveTab('metals'); setPage(0); }}
            className={cn(
              "px-4 py-2 rounded-lg font-medium transition-all text-sm",
              activeTab === 'metals' 
                ? "bg-primary text-primary-foreground shadow-lg shadow-primary/25" 
                : "bg-secondary/50 text-muted-foreground hover:text-foreground hover:bg-secondary"
            )}
          >
            {getAssetIcon('metals')} {getTabLabel('metals')}
          </button>
        )}
      </div>
      
      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(0); }}
          placeholder={t.searchPairs}
          className="pl-10 bg-secondary/50 border-border"
        />
      </div>
      
      {/* Pairs Grid with Quotes */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        {paginatedPairs.map((pair) => {
          const quote = quotes[pair];
          const isPositive = quote?.change >= 0;
          
          return (
            <button
              key={pair}
              onClick={() => onSelect(pair)}
              className="group px-4 py-3 rounded-lg bg-secondary/50 hover:bg-secondary border border-border hover:border-primary/50 transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
            >
              <div className="flex items-center justify-between">
                <span className="font-semibold text-foreground">{pair}</span>
                {quote && (
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-sm text-foreground">
                      {formatPrice(quote.price, pair)}
                    </span>
                    <div className={cn(
                      "flex items-center text-xs font-medium px-1.5 py-0.5 rounded",
                      isPositive 
                        ? "text-green-400 bg-green-500/10" 
                        : "text-red-400 bg-red-500/10"
                    )}>
                      {isPositive ? (
                        <TrendingUp className="w-3 h-3 mr-0.5" />
                      ) : (
                        <TrendingDown className="w-3 h-3 mr-0.5" />
                      )}
                      {isPositive ? '+' : ''}{quote.change.toFixed(2)}%
                    </div>
                  </div>
                )}
              </div>
            </button>
          );
        })}
      </div>
      
      {/* Pagination */}
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
