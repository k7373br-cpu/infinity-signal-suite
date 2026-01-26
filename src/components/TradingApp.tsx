import { useState } from 'react';
import { useTrading } from '@/hooks/useTrading';
import { Language, TRANSLATIONS } from '@/lib/constants';
import { isMarketOpen } from '@/lib/trading';
import { LanguageToggle } from './LanguageToggle';
import { StatusBadge } from './StatusBadge';
import { MarketStatus } from './MarketStatus';
import { CurrencyPairSelector } from './CurrencyPairSelector';
import { TimeframeSelector } from './TimeframeSelector';
import { SignalDisplay } from './SignalDisplay';
import { LoadingSignal } from './LoadingSignal';
import { VerificationModal } from './VerificationModal';
import { SignalHistory } from './SignalHistory';
import { Button } from '@/components/ui/button';
import { 
  Key, 
  Zap,
  BarChart3,
  Send,
  MessageCircle
} from 'lucide-react';
import { toast } from 'sonner';

type View = 'home' | 'selectPair' | 'selectTimeframe' | 'signal' | 'loading';

export function TradingApp() {
  const {
    language,
    userStatus,
    stats,
    currentSignal,
    selectedPair,
    selectedTimeframe,
    signalHistory,
    isGenerating,
    setLanguage,
    getRemainingSignals,
    canGenerateSignal,
    generateNewSignal,
    addFeedback,
    verifyCode,
    repeatLastSignal
  } = useTrading();
  
  const [view, setView] = useState<View>('home');
  const [tempPair, setTempPair] = useState<string | null>(null);
  const [tempTimeframe, setTempTimeframe] = useState<string | null>(null);
  const [showVerification, setShowVerification] = useState(false);
  
  const t = TRANSLATIONS[language];

  const handleGetSignal = () => {
    if (!isMarketOpen()) {
      toast.error(t.marketClosed);
      return;
    }
    if (!canGenerateSignal()) {
      toast.error(t.limitExceeded);
      return;
    }
    setView('selectPair');
  };

  const handlePairSelect = (pair: string) => {
    setTempPair(pair);
    setView('selectTimeframe');
  };

  const handleTimeframeSelect = async (timeframe: string) => {
    setTempTimeframe(timeframe);
    setView('loading');
    
    const signal = await generateNewSignal(tempPair!, timeframe);
    if (signal) {
      setView('signal');
    } else {
      toast.error(language === 'ru' ? 'Ошибка генерации сигнала' : 'Signal generation error');
      setView('home');
    }
  };

  const handleFeedback = async (feedback: '+' | '-') => {
    addFeedback(feedback);
    toast.success(
      feedback === '+' 
        ? (language === 'ru' ? 'Сигнал отмечен как правильный ✅' : 'Signal marked as correct ✅')
        : (language === 'ru' ? 'Сигнал отмечен как неправильный ❌' : 'Signal marked as incorrect ❌')
    );
    
    // Generate new signal after feedback
    if (tempPair && tempTimeframe && canGenerateSignal()) {
      setView('loading');
      const signal = await generateNewSignal(tempPair, tempTimeframe);
      if (signal) {
        setView('signal');
      } else {
        setView('home');
      }
    }
  };

  const handleRepeatSignal = async () => {
    if (!selectedPair || !selectedTimeframe) {
      toast.error(language === 'ru' ? 'Сначала получите сигнал' : 'Get a signal first');
      return;
    }
    if (!canGenerateSignal()) {
      toast.error(t.limitExceeded);
      return;
    }
    
    setView('loading');
    setTempPair(selectedPair);
    setTempTimeframe(selectedTimeframe);
    
    const signal = await repeatLastSignal();
    if (signal) {
      setView('signal');
    } else {
      setView('home');
    }
  };

  const handleImprovedSignal = async () => {
    if (!tempPair || !tempTimeframe) return;
    if (!canGenerateSignal()) {
      toast.error(t.limitExceeded);
      return;
    }
    
    setView('loading');
    // Pass current signal's probability as minimum for improved signal
    const minProbability = currentSignal?.probability;
    const signal = await generateNewSignal(tempPair, tempTimeframe, minProbability);
    if (signal) {
      setView('signal');
    } else {
      setView('home');
    }
  };

  const handleVerify = (code: string) => {
    const result = verifyCode(code);
    if (result.success) {
      toast.success(t.verificationSuccess);
    }
    return result;
  };

  return (
    <div className="min-h-screen bg-background trading-grid">
      <div className="min-h-screen bg-gradient-to-b from-background via-background to-background/95">
        {/* Header */}
        <header className="sticky top-0 z-50 backdrop-blur-xl bg-background/80 border-b border-border">
          <div className="container max-w-2xl mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-primary/10 glow-primary">
                  <Zap className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h1 className="font-bold text-lg leading-none">INFINITY TRAFFIC</h1>
                  <p className="text-xs text-muted-foreground">AI Trading Signals</p>
                </div>
              </div>
              <LanguageToggle language={language} onLanguageChange={setLanguage} />
            </div>
          </div>
        </header>

        {/* Main content */}
        <main className="container max-w-2xl mx-auto px-4 py-6">
          {view === 'home' && (
            <div className="space-y-6 animate-fade-in">
              {/* Welcome section */}
              <div className="text-center space-y-3 py-8">
                <h2 className="text-3xl font-bold text-gradient-primary">
                  {t.welcome}
                </h2>
                <p className="text-muted-foreground max-w-md mx-auto">
                  {t.subtitle}
                </p>
              </div>

              {/* Status cards */}
              <div className="grid grid-cols-2 gap-4">
                <div className="glass-card p-4 space-y-2">
                  <p className="text-xs text-muted-foreground uppercase">{t.status}</p>
                  <StatusBadge 
                    status={userStatus} 
                    language={language} 
                    onClick={() => setShowVerification(true)}
                  />
                </div>
                <div className="glass-card p-4 space-y-2">
                  <p className="text-xs text-muted-foreground uppercase">{t.signalsLeft}</p>
                  <p className="text-2xl font-bold font-mono text-primary">
                    {getRemainingSignals()}
                  </p>
                </div>
              </div>

              {/* Market status */}
              <MarketStatus language={language} />

              {/* Main actions */}
              <div className="space-y-3">
                <Button
                  onClick={handleGetSignal}
                  className="w-full h-14 text-lg font-semibold bg-primary hover:bg-primary/90 text-primary-foreground glow-primary transition-all hover:scale-[1.02] active:scale-[0.98]"
                  disabled={!isMarketOpen() || !canGenerateSignal()}
                >
                  <BarChart3 className="w-5 h-5 mr-2" />
                  {t.getSignal}
                </Button>

              </div>

              {/* Signal History */}
              <SignalHistory history={signalHistory} language={language} />

              {/* Telegram links */}
              <div className="glass-card p-4 space-y-3">
                <h3 className="font-medium text-sm text-muted-foreground">Telegram</h3>
                <div className="grid grid-cols-2 gap-3">
                  <a
                    href="https://t.me/GeminiTraffic_bot"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 p-3 rounded-lg bg-secondary/50 hover:bg-secondary transition-colors"
                  >
                    <Send className="w-4 h-4 text-primary" />
                    <span className="text-sm">{t.telegramBot}</span>
                  </a>
                  <a
                    href="https://t.me/INFINITY_TRAFFlC"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 p-3 rounded-lg bg-secondary/50 hover:bg-secondary transition-colors"
                  >
                    <MessageCircle className="w-4 h-4 text-primary" />
                    <span className="text-sm">{t.telegramSupport}</span>
                  </a>
                </div>
              </div>
            </div>
          )}

          {view === 'selectPair' && (
            <CurrencyPairSelector
              language={language}
              onSelect={handlePairSelect}
              showCrypto={userStatus === 'vip'}
              showMetals={userStatus === 'vip'}
            />
          )}

          {view === 'selectTimeframe' && tempPair && (
            <TimeframeSelector
              language={language}
              selectedPair={tempPair}
              onSelect={handleTimeframeSelect}
              onBack={() => setView('selectPair')}
            />
          )}

          {view === 'loading' && tempPair && tempTimeframe && (
            <LoadingSignal
              language={language}
              pair={tempPair}
              timeframe={tempTimeframe}
            />
          )}

          {view === 'signal' && currentSignal && (
            <SignalDisplay
              signal={currentSignal}
              language={language}
              remainingSignals={getRemainingSignals()}
              feedbackHistory={stats.feedbackHistory}
              onFeedback={handleFeedback}
              onMainMenu={() => setView('home')}
              onImprovedSignal={handleImprovedSignal}
            />
          )}
        </main>

        {/* Verification Modal */}
        <VerificationModal
          open={showVerification}
          onOpenChange={setShowVerification}
          language={language}
          onVerify={handleVerify}
        />
      </div>
    </div>
  );
}
