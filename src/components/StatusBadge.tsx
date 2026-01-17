import { UserStatus, Language, TRANSLATIONS } from '@/lib/constants';
import { cn } from '@/lib/utils';
import { Crown, CheckCircle, User } from 'lucide-react';

interface StatusBadgeProps {
  status: UserStatus;
  language: Language;
  className?: string;
}

export function StatusBadge({ status, language, className }: StatusBadgeProps) {
  const t = TRANSLATIONS[language];
  
  const config = {
    vip: {
      label: `💎 ${t.vip}`,
      icon: Crown,
      className: "bg-gradient-to-r from-amber-500/20 to-yellow-500/20 border-amber-500/50 text-amber-400"
    },
    verified: {
      label: `✅ ${t.verified}`,
      icon: CheckCircle,
      className: "bg-gradient-to-r from-green-500/20 to-emerald-500/20 border-green-500/50 text-green-400"
    },
    free: {
      label: `🆓 ${t.free}`,
      icon: User,
      className: "bg-secondary/50 border-border text-muted-foreground"
    }
  };
  
  const { label, icon: Icon, className: statusClass } = config[status];
  
  return (
    <div className={cn(
      "inline-flex items-center gap-2 px-3 py-1.5 rounded-full border text-sm font-medium",
      statusClass,
      className
    )}>
      <Icon className="w-4 h-4" />
      <span>{label}</span>
    </div>
  );
}
