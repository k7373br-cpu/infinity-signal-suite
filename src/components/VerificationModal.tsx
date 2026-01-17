import { useState } from 'react';
import { Language, TRANSLATIONS } from '@/lib/constants';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Key, CheckCircle, XCircle, Crown, Star, User } from 'lucide-react';

interface VerificationModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  language: Language;
  onVerify: (code: string) => { success: boolean; status?: string };
}

export function VerificationModal({ open, onOpenChange, language, onVerify }: VerificationModalProps) {
  const [code, setCode] = useState('');
  const [result, setResult] = useState<{ success: boolean; status?: string } | null>(null);
  
  const t = TRANSLATIONS[language];
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const verificationResult = onVerify(code);
    setResult(verificationResult);
    
    if (verificationResult.success) {
      setTimeout(() => {
        onOpenChange(false);
        setCode('');
        setResult(null);
      }, 1500);
    }
  };
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md bg-card border-border">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <Key className="w-5 h-5 text-primary" />
            {t.verification}
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Access levels info */}
          <div className="space-y-3 p-4 rounded-xl bg-secondary/50 border border-border">
            <h3 className="font-medium text-sm text-muted-foreground">{t.accessLevels}</h3>
            
            <div className="flex items-center gap-3 py-2">
              <div className="p-2 rounded-lg bg-muted">
                <User className="w-4 h-4 text-muted-foreground" />
              </div>
              <div>
                <p className="font-medium text-sm">🆓 {t.free}</p>
                <p className="text-xs text-muted-foreground">{t.freeSignals}</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3 py-2">
              <div className="p-2 rounded-lg bg-green-500/10">
                <Star className="w-4 h-4 text-green-400" />
              </div>
              <div>
                <p className="font-medium text-sm">✅ {t.verified}</p>
                <p className="text-xs text-muted-foreground">{t.verifiedSignals}</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3 py-2">
              <div className="p-2 rounded-lg bg-amber-500/10">
                <Crown className="w-4 h-4 text-amber-400" />
              </div>
              <div>
                <p className="font-medium text-sm">💎 {t.vip}</p>
                <p className="text-xs text-muted-foreground">{t.vipSignals}</p>
              </div>
            </div>
          </div>
          
          {/* Code input */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm text-muted-foreground">{t.enterCode}</label>
              <Input
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder="XXXXXXX"
                className="font-mono text-center text-lg tracking-widest bg-secondary border-border"
              />
            </div>
            
            {result && (
              <div className={`flex items-center gap-2 p-3 rounded-lg ${
                result.success 
                  ? 'bg-green-500/10 text-green-400 border border-green-500/30' 
                  : 'bg-red-500/10 text-red-400 border border-red-500/30'
              }`}>
                {result.success ? (
                  <>
                    <CheckCircle className="w-5 h-5" />
                    <span>{t.verificationSuccess}</span>
                  </>
                ) : (
                  <>
                    <XCircle className="w-5 h-5" />
                    <span>{t.invalidCode}</span>
                  </>
                )}
              </div>
            )}
            
            <Button type="submit" className="w-full bg-primary hover:bg-primary/90 text-primary-foreground">
              <Key className="w-4 h-4 mr-2" />
              {t.verification}
            </Button>
          </form>
          
          {/* Contact info */}
          <div className="text-center text-sm text-muted-foreground">
            <p>📝 {language === 'ru' ? 'Для получения кода:' : 'To get a code:'}</p>
            <a 
              href="https://t.me/INFINITY_TRAFFlC" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-primary hover:underline font-medium"
            >
              @INFINITY_TRAFFlC
            </a>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
