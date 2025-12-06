import { ReactNode } from 'react';
import { cn } from '@/lib/utils';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { TrendDirection } from '@/lib/metricUtils';

interface MetricCardEnhancedProps {
  label: string;
  value: string;
  unit?: string;
  unitSuffix?: string;
  qualityLabel: string;
  qualityColor: 'excellent' | 'good' | 'fair' | 'poor';
  average30: string;
  trendDirection: TrendDirection;
  trendLabel: string;
  icon: ReactNode;
  color: 'sleep' | 'heart' | 'stress' | 'steps' | 'activity' | 'training' | 'hrv' | 'vo2';
  delay?: number;
}

const colorClasses: Record<MetricCardEnhancedProps['color'], string> = {
  sleep: 'text-metric-sleep',
  heart: 'text-metric-heart',
  stress: 'text-metric-stress',
  steps: 'text-metric-steps',
  activity: 'text-primary',
  training: 'text-metric-battery',
  hrv: 'text-metric-hrv',
  vo2: 'text-metric-vo2',
};

const iconBgClasses: Record<MetricCardEnhancedProps['color'], string> = {
  sleep: 'bg-metric-sleep/15',
  heart: 'bg-metric-heart/15',
  stress: 'bg-metric-stress/15',
  steps: 'bg-metric-steps/15',
  activity: 'bg-primary/15',
  training: 'bg-metric-battery/15',
  hrv: 'bg-metric-hrv/15',
  vo2: 'bg-metric-vo2/15',
};

const qualityColorClasses: Record<MetricCardEnhancedProps['qualityColor'], string> = {
  excellent: 'text-metric-steps bg-metric-steps/10',
  good: 'text-primary bg-primary/10',
  fair: 'text-metric-stress bg-metric-stress/10',
  poor: 'text-metric-heart bg-metric-heart/10',
};

const trendColorClasses: Record<TrendDirection, string> = {
  up: 'text-metric-steps',
  down: 'text-metric-heart',
  stable: 'text-muted-foreground',
};

export function MetricCardEnhanced({
  label,
  value,
  unit,
  unitSuffix,
  qualityLabel,
  qualityColor,
  average30,
  trendDirection,
  trendLabel,
  icon,
  color,
  delay = 0,
}: MetricCardEnhancedProps) {
  const TrendIcon = trendDirection === 'up' ? TrendingUp : trendDirection === 'down' ? TrendingDown : Minus;

  return (
    <div
      className={cn(
        'relative overflow-hidden rounded-2xl bg-card p-4 card-shadow',
        'transition-all duration-300 hover:card-shadow-hover hover:-translate-y-0.5',
        'animate-fade-in flex flex-col'
      )}
      style={{ animationDelay: `${delay}ms` }}
    >
      <div className="absolute inset-0 gradient-card opacity-50" />

      <div className="relative z-10 flex flex-col flex-1">
        {/* Icon + Label row */}
        <div className="flex items-center gap-2 mb-3">
          <div className={cn('p-2 rounded-xl', iconBgClasses[color])}>
            <div className={colorClasses[color]}>{icon}</div>
          </div>
          <p className="text-sm font-medium text-muted-foreground leading-tight">{label}</p>
        </div>

        {/* Value with quality */}
        <div className="flex-1">
          <div className="flex items-baseline gap-1 flex-wrap">
            <span className={cn('text-3xl font-bold tracking-tight', colorClasses[color])}>
              {value}
            </span>
            {unit && <span className="text-sm font-medium text-muted-foreground">{unit}</span>}
            {unitSuffix && <span className="text-sm font-medium text-muted-foreground">{unitSuffix}</span>}
          </div>
          
          {/* Quality badge */}
          <div className="mt-2">
            <span className={cn('inline-block px-2 py-0.5 rounded-full text-xs font-medium', qualityColorClasses[qualityColor])}>
              {qualityLabel}
            </span>
          </div>
        </div>

        {/* Bottom info */}
        <div className="mt-3 pt-3 border-t border-border/50 space-y-1">
          <p className="text-xs text-muted-foreground">
            Media 30d: <span className="font-semibold text-foreground/90">{average30}</span>
          </p>
          <div className={cn('flex items-center gap-1 text-xs', trendColorClasses[trendDirection])}>
            <TrendIcon className="w-3 h-3" />
            <span className="font-medium">{trendLabel.replace('Tendencia: ', '')}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
