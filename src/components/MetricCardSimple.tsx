import { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface MetricCardSimpleProps {
  label: string;
  value: string;
  unit?: string;
  average30: string;
  icon: ReactNode;
  color: 'sleep' | 'heart' | 'stress' | 'steps' | 'activity' | 'training' | 'hrv' | 'vo2';
  delay?: number;
  subtitle?: string;
}

const colorClasses: Record<MetricCardSimpleProps['color'], string> = {
  sleep: 'text-metric-sleep',
  heart: 'text-metric-heart',
  stress: 'text-metric-stress',
  steps: 'text-metric-steps',
  activity: 'text-primary',
  training: 'text-metric-battery',
  hrv: 'text-metric-hrv',
  vo2: 'text-metric-vo2',
};

const iconBgClasses: Record<MetricCardSimpleProps['color'], string> = {
  sleep: 'bg-metric-sleep/15',
  heart: 'bg-metric-heart/15',
  stress: 'bg-metric-stress/15',
  steps: 'bg-metric-steps/15',
  activity: 'bg-primary/15',
  training: 'bg-metric-battery/15',
  hrv: 'bg-metric-hrv/15',
  vo2: 'bg-metric-vo2/15',
};

export function MetricCardSimple({
  label,
  value,
  unit,
  average30,
  icon,
  color,
  delay = 0,
  subtitle,
}: MetricCardSimpleProps) {
  return (
    <div
      className={cn(
        'relative overflow-hidden rounded-2xl bg-card p-5 card-shadow',
        'transition-all duration-300 hover:card-shadow-hover hover:-translate-y-0.5',
        'animate-fade-in'
      )}
      style={{ animationDelay: `${delay}ms` }}
    >
      <div className="absolute inset-0 gradient-card opacity-50" />

      <div className="relative z-10">
        {/* Icon + Label row */}
        <div className="flex items-center gap-3 mb-3">
          <div className={cn('p-2 rounded-xl', iconBgClasses[color])}>
            <div className={colorClasses[color]}>{icon}</div>
          </div>
          <p className="text-sm font-medium text-muted-foreground">{label}</p>
        </div>

        {/* Value */}
        <div className="flex items-baseline gap-1">
          <span className="text-3xl font-bold text-foreground tracking-tight">{value}</span>
          {unit && <span className="text-sm font-medium text-muted-foreground">{unit}</span>}
        </div>

        {/* Average 30 days */}
        <p className="mt-2 text-xs text-muted-foreground">
          Media 30 días: <span className="font-medium text-foreground/80">{average30}</span>
        </p>

        {/* Optional subtitle */}
        {subtitle && (
          <p className="mt-1 text-xs text-muted-foreground/70">{subtitle}</p>
        )}
      </div>
    </div>
  );
}
