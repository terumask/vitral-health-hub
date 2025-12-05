import { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';

interface HealthScoreCardProps {
  score: number | null;
  average30: number | null;
  date: string;
}

export function HealthScoreCard({ score, average30, date }: HealthScoreCardProps) {
  const [animatedScore, setAnimatedScore] = useState(0);
  const displayScore = score ?? 0;

  useEffect(() => {
    if (score === null) return;
    
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
  }, [displayScore, score]);

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

  // Circle properties
  const size = 200;
  const strokeWidth = 10;
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (animatedScore / 100) * circumference;

  return (
    <div
      className={cn(
        'relative overflow-hidden rounded-3xl bg-card p-8 card-shadow',
        'flex flex-col items-center justify-center',
        'animate-fade-in'
      )}
    >
      <div className="absolute inset-0 gradient-card opacity-50" />

      <div className="relative z-10 flex flex-col items-center">
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
              className="text-6xl font-bold tracking-tight"
              style={{ color: getScoreColor(animatedScore) }}
            >
              {score !== null ? animatedScore : '—'}
            </span>
            <span className="text-sm font-medium text-muted-foreground mt-1">
              {score !== null ? getScoreLabel(animatedScore) : 'Sin datos'}
            </span>
          </div>
        </div>

        <h2 className="mt-6 text-xl font-semibold text-foreground">Health Score</h2>

        {/* Average 30 days */}
        <p className="mt-2 text-sm text-muted-foreground">
          Media 30 días:{' '}
          <span className="font-medium text-foreground">
            {average30 !== null ? Math.round(average30) : '—'}
          </span>
        </p>

        {/* Date */}
        <p className="mt-1 text-xs text-muted-foreground/70">Datos de: {date}</p>
      </div>
    </div>
  );
}
