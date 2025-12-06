import { useEffect, useState, useMemo } from 'react';
import { Moon, Heart, Footprints, Brain, Flame, Activity } from 'lucide-react';
import {
  getLast30DaysMetrics,
  calculateAverage,
  DailyMetrics,
} from '@/lib/supabase';
import {
  metricConfigs,
  evaluateMetric,
  getMetricLabel,
  calculateTrend,
  calculateDeviationScore,
  formatMetricValue,
  calculate7DayAverage,
  MetricConfig,
} from '@/lib/metricUtils';
import { HealthScoreCardNew } from '@/components/HealthScoreCardNew';
import { MetricCardEnhanced } from '@/components/MetricCardEnhanced';
import { LoadingState } from '@/components/LoadingState';

const metricIcons: Record<string, React.ReactNode> = {
  sleep_score: <Moon className="w-5 h-5" />,
  sleep_hours: <Moon className="w-5 h-5" />,
  resting_hr: <Heart className="w-5 h-5" />,
  hrv: <Activity className="w-5 h-5" />,
  steps: <Footprints className="w-5 h-5" />,
  stress_level: <Brain className="w-5 h-5" />,
  mvpa_minutes: <Flame className="w-5 h-5" />,
};

export default function Dashboard() {
  const [metrics30, setMetrics30] = useState<DailyMetrics[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchData() {
      try {
        const data = await getLast30DaysMetrics();
        setMetrics30(data);
      } catch (err) {
        setError('Error al cargar los datos de salud');
        console.error(err);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  // Memoized calculations
  const { latest, avg7dHealthScore, avg30dHealthScore, sortedMetrics } = useMemo(() => {
    if (metrics30.length === 0) {
      return { latest: null, avg7dHealthScore: null, avg30dHealthScore: null, sortedMetrics: [] };
    }

    const latestData = metrics30[0];
    const avg7d = calculate7DayAverage(metrics30, 'health_score');
    const avg30d = calculateAverage(metrics30, 'health_score');

    // Calculate metrics with their deviation scores for sorting
    const metricsWithScores = metricConfigs.map((config) => {
      const todayValue = latestData[config.key] as number | null;
      const avg30Value = calculateAverage(metrics30, config.key);
      const deviationScore = calculateDeviationScore(todayValue, config);
      const evaluation = evaluateMetric(todayValue, config);
      const qualityLabel = getMetricLabel(todayValue, config);
      const trend = calculateTrend(todayValue, avg30Value, config.higherIsBetter);

      return {
        config,
        todayValue,
        avg30Value,
        deviationScore,
        evaluation,
        qualityLabel,
        trend,
      };
    });

    // Sort by deviation score (worst first)
    const sorted = metricsWithScores.sort((a, b) => b.deviationScore - a.deviationScore);

    return {
      latest: latestData,
      avg7dHealthScore: avg7d,
      avg30dHealthScore: avg30d,
      sortedMetrics: sorted,
    };
  }, [metrics30]);

  if (loading) {
    return (
      <div className="min-h-screen gradient-hero">
        <LoadingState />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen gradient-hero flex items-center justify-center">
        <p className="text-destructive font-medium">{error}</p>
      </div>
    );
  }

  if (!latest) {
    return (
      <div className="min-h-screen gradient-hero flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-foreground mb-2">Vitral</h1>
          <p className="text-muted-foreground">Todavía no hay datos de salud.</p>
        </div>
      </div>
    );
  }

  const formatAvg30 = (value: number | null, config: MetricConfig): string => {
    if (value === null) return '—';
    if (config.key === 'steps') {
      return Math.round(value).toLocaleString('es-ES');
    }
    return value.toFixed(config.decimals ?? 0) + (config.unitSuffix ? ` ${config.unitSuffix}` : '');
  };

  return (
    <div className="min-h-screen gradient-hero">
      <div className="container max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <header className="text-center mb-8 animate-fade-in">
          <h1 className="text-3xl font-bold text-foreground tracking-tight">Vitral</h1>
          <p className="text-muted-foreground mt-1">Tu dashboard de salud personal</p>
        </header>

        {/* Health Score Card */}
        <section className="mb-10">
          <HealthScoreCardNew
            average7d={avg7dHealthScore}
            todayScore={latest.health_score}
            average30d={avg30dHealthScore}
          />
        </section>

        {/* Metrics Grid */}
        <section className="mb-10">
          <h2
            className="text-lg font-semibold text-foreground mb-4 animate-fade-in"
            style={{ animationDelay: '200ms' }}
          >
            Métricas del día
          </h2>
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
            {sortedMetrics.map((metric, index) => (
              <MetricCardEnhanced
                key={metric.config.key}
                label={metric.config.label}
                value={formatMetricValue(metric.todayValue, metric.config)}
                unit={metric.config.unit}
                unitSuffix={metric.config.unitSuffix}
                qualityLabel={metric.qualityLabel}
                qualityColor={metric.evaluation.color}
                average30={formatAvg30(metric.avg30Value, metric.config)}
                trendDirection={metric.trend.direction}
                trendLabel={metric.trend.label}
                icon={metricIcons[metric.config.key]}
                color={metric.config.color}
                delay={300 + index * 50}
              />
            ))}
          </div>
        </section>

        {/* Footer */}
        <footer className="mt-16 text-center animate-fade-in" style={{ animationDelay: '700ms' }}>
          <p className="text-xs text-muted-foreground">
            Datos sincronizados desde tu dispositivo wearable
          </p>
        </footer>
      </div>
    </div>
  );
}
