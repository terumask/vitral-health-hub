import { useEffect, useState } from 'react';

interface HealthScoreProps {
  score: number;
}

export function HealthScore({ score }: HealthScoreProps) {
  const [animatedScore, setAnimatedScore] = useState(0);
  
  // Circle properties
  const size = 240;
  const strokeWidth = 12;
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (animatedScore / 100) * circumference;

  useEffect(() => {
    // Animate the score from 0 to the actual value
    const duration = 1500;
    const startTime = Date.now();
    
    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      
      // Ease out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      setAnimatedScore(Math.round(score * eased));
      
      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };
    
    requestAnimationFrame(animate);
  }, [score]);

  const getScoreLabel = (score: number): string => {
    if (score >= 85) return 'Excellent';
    if (score >= 70) return 'Good';
    if (score >= 50) return 'Fair';
    return 'Needs Attention';
  };

  const getScoreColor = (score: number): string => {
    if (score >= 85) return 'hsl(var(--primary))';
    if (score >= 70) return 'hsl(var(--metric-steps))';
    if (score >= 50) return 'hsl(var(--metric-stress))';
    return 'hsl(var(--metric-heart))';
  };

  return (
    <div className="flex flex-col items-center justify-center animate-scale-in">
      <div className="relative" style={{ width: size, height: size }}>
        {/* Glow effect */}
        <div 
          className="absolute inset-0 rounded-full blur-2xl opacity-30"
          style={{ 
            background: `radial-gradient(circle, ${getScoreColor(animatedScore)} 0%, transparent 70%)` 
          }}
        />
        
        {/* Background circle */}
        <svg 
          width={size} 
          height={size} 
          className="transform -rotate-90"
        >
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="hsl(var(--muted))"
            strokeWidth={strokeWidth}
            className="opacity-50"
          />
          
          {/* Progress circle */}
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
              filter: `drop-shadow(0 0 8px ${getScoreColor(animatedScore)})`,
            }}
          />
        </svg>
        
        {/* Score text */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span 
            className="text-6xl font-bold tracking-tight"
            style={{ color: getScoreColor(animatedScore) }}
          >
            {animatedScore}
          </span>
          <span className="text-sm font-medium text-muted-foreground mt-1">
            {getScoreLabel(animatedScore)}
          </span>
        </div>
      </div>
      
      <p className="mt-6 text-lg font-medium text-foreground">
        Health Score
      </p>
      <p className="text-sm text-muted-foreground">
        Based on today's metrics
      </p>
    </div>
  );
}
