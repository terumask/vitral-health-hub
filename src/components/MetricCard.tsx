import { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface MetricCardProps {
  title: string;
  value: string | number;
  unit?: string;
  icon: ReactNode;
  color: 'sleep' | 'heart' | 'stress' | 'steps' | 'battery';
  subtitle?: string;
  delay?: number;
}

const colorClasses = {
  sleep: 'bg-metric-sleep/10 text-metric-sleep',
  heart: 'bg-metric-heart/10 text-metric-heart',
  stress: 'bg-metric-stress/10 text-metric-stress',
  steps: 'bg-metric-steps/10 text-metric-steps',
  battery: 'bg-metric-battery/10 text-metric-battery',
};

const iconBgClasses = {
  sleep: 'bg-metric-sleep/15',
  heart: 'bg-metric-heart/15',
  stress: 'bg-metric-stress/15',
  steps: 'bg-metric-steps/15',
  battery: 'bg-metric-battery/15',
};

export function MetricCard({ title, value, unit, icon, color, subtitle, delay = 0 }: MetricCardProps) {
  return (
    <div 
      className={cn(
        "relative overflow-hidden rounded-2xl bg-card p-6 card-shadow",
        "transition-all duration-300 hover:card-shadow-hover hover:-translate-y-1",
        "animate-fade-in"
      )}
      style={{ animationDelay: `${delay}ms` }}
    >
      {/* Subtle gradient overlay */}
      <div className="absolute inset-0 gradient-card opacity-50" />
      
      <div className="relative z-10">
        <div className="flex items-start justify-between mb-4">
          <div className={cn(
            "p-3 rounded-xl",
            iconBgClasses[color]
          )}>
            <div className={colorClasses[color]}>
              {icon}
            </div>
          </div>
        </div>
        
        <div className="space-y-1">
          <p className="text-sm font-medium text-muted-foreground">
            {title}
          </p>
          <div className="flex items-baseline gap-1">
            <span className="text-3xl font-bold text-foreground tracking-tight">
              {value}
            </span>
            {unit && (
              <span className="text-sm font-medium text-muted-foreground">
                {unit}
              </span>
            )}
          </div>
          {subtitle && (
            <p className="text-xs text-muted-foreground mt-1">
              {subtitle}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
