import { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface HealthScoreCardNewProps {
  average7d: number | null;
  todayScore: number | null;
  average30d: number | null;
}

export function HealthScoreCardNew({ average7d, todayScore, average30d }: HealthScoreCardNewProps) {
  const [animatedScore, setAnimatedScore] = useState(0);
  const displayScore = average7d ?? 0;

  useEffect(() => {
    if (average7d === null) return;
    
    const duration = 1500;
    const startTime = Date.now();

    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setAnimatedScore(Math.round(displayScore * eased));

      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };

    requestAnimationFrame(animate);
  }, [displayScore, average7d]);

  const getScoreColor = (s: number): string => {
    if (s >= 85) return 'hsl(var(--primary))';
    if (s >= 70) return 'hsl(var(--metric-steps))';
    if (s >= 50) return 'hsl(var(--metric-stress))';
    return 'hsl(var(--metric-heart))';
  };

  const getScoreLabel = (s: number): string => {
    if (s >= 85) return 'Excelente';
    if (s >= 70) return 'Bien';
    if (s >= 50) return 'Regular';
    return 'Necesita atención';
  };

  // Compare today vs 30d average
  const getComparisonInfo = () => {
    if (todayScore === null || average30d === null) {
      return { text: 'Sin datos suficientes', icon: null, color: 'text-muted-foreground' };
    }

    const diff = todayScore - average30d;

    if (diff > 3) {
      return {
        text: 'Hoy por encima de tu media mensual',
        icon: <TrendingUp className="w-4 h-4" />,
        color: 'text-metric-steps',
      };
    } else if (diff < -3) {
      return {
        text: 'Hoy por debajo de tu media mensual',
        icon: <TrendingDown className="w-4 h-4" />,
        color: 'text-metric-heart',
      };
    } else {
      return {
        text: 'Muy parecido a tu media mensual',
        icon: <Minus className="w-4 h-4" />,
        color: 'text-muted-foreground',
      };
    }
  };

  const comparison = getComparisonInfo();

  // Circle properties
  const size = 180;
  const strokeWidth = 10;
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (animatedScore / 100) * circumference;

  return (
    <div
      className={cn(
        'relative overflow-hidden rounded-3xl bg-card p-6 card-shadow',
        'flex flex-col items-center justify-center',
        'animate-fade-in'
      )}
    >
      <div className="absolute inset-0 gradient-card opacity-50" />

      <div className="relative z-10 flex flex-col items-center w-full">
        {/* Circular gauge */}
        <div className="relative" style={{ width: size, height: size }}>
          {/* Glow effect */}
          <div
            className="absolute inset-0 rounded-full blur-2xl opacity-20"
            style={{
              background: `radial-gradient(circle, ${getScoreColor(animatedScore)} 0%, transparent 70%)`,
            }}
          />

          <svg width={size} height={size} className="transform -rotate-90">
            <circle
              cx={size / 2}
              cy={size / 2}
              r={radius}
              fill="none"
              stroke="hsl(var(--muted))"
              strokeWidth={strokeWidth}
              className="opacity-40"
            />
            <circle
              cx={size / 2}
              cy={size / 2}
              r={radius}
              fill="none"
              stroke={getScoreColor(animatedScore)}
              strokeWidth={strokeWidth}
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={offset}
              className="transition-all duration-300 ease-out"
              style={{
                filter: `drop-shadow(0 0 6px ${getScoreColor(animatedScore)})`,
              }}
            />
          </svg>

          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span
              className="text-5xl font-bold tracking-tight"
              style={{ color: getScoreColor(animatedScore) }}
            >
              {average7d !== null ? animatedScore : '—'}
            </span>
            <span className="text-sm font-medium text-muted-foreground mt-1">
              {average7d !== null ? getScoreLabel(animatedScore) : 'Sin datos'}
            </span>
          </div>
        </div>

        <h2 className="mt-4 text-lg font-semibold text-foreground">Health Score</h2>
        <p className="text-xs text-muted-foreground">Media últimos 7 días</p>

        {/* Comparison band */}
        <div className="mt-4 w-full pt-4 border-t border-border/50">
          <p className="text-sm text-center text-muted-foreground">
            Hoy:{' '}
            <span className="font-semibold text-foreground">
              {todayScore !== null ? Math.round(todayScore) : '—'}
            </span>
            {' · '}
            Media 30d:{' '}
            <span className="font-semibold text-foreground">
              {average30d !== null ? Math.round(average30d) : '—'}
            </span>
          </p>
          
          <div className={cn('flex items-center justify-center gap-1.5 mt-2', comparison.color)}>
            {comparison.icon}
            <span className="text-xs font-medium">{comparison.text}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
