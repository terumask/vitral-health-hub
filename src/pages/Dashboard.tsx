import { useEffect, useState } from 'react';
import { Moon, Heart, Footprints, Brain, Flame, Dumbbell, Activity, Wind } from 'lucide-react';
import {
  getLast30DaysMetrics,
  calculateAverage,
  formatNumber,
  formatInteger,
  formatDate,
  DailyMetrics,
} from '@/lib/supabase';
import { HealthScoreCard } from '@/components/HealthScoreCard';
import { MetricCardSimple } from '@/components/MetricCardSimple';
import { LoadingState } from '@/components/LoadingState';

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

  if (metrics30.length === 0) {
    return (
      <div className="min-h-screen gradient-hero flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-foreground mb-2">Vitral</h1>
          <p className="text-muted-foreground">Todavía no hay datos de salud.</p>
        </div>
      </div>
    );
  }

  const latest = metrics30[0];

  // Calculate averages
  const avgHealthScore = calculateAverage(metrics30, 'health_score');
  const avgSleepScore = calculateAverage(metrics30, 'sleep_score');
  const avgSleepHours = calculateAverage(metrics30, 'sleep_hours');
  const avgRestingHr = calculateAverage(metrics30, 'resting_hr');
  const avgSteps = calculateAverage(metrics30, 'steps');
  const avgStress = calculateAverage(metrics30, 'stress_level');
  const avgMvpa = calculateAverage(metrics30, 'mvpa_minutes');
  const avgTrainingLoad = calculateAverage(metrics30, 'training_load');
  const avgHrv = calculateAverage(metrics30, 'hrv');
  const avgVo2max = calculateAverage(metrics30, 'vo2max');

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
          <HealthScoreCard
            score={latest.health_score}
            average30={avgHealthScore}
            date={formatDate(latest.date)}
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
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Sleep Score */}
            <MetricCardSimple
              label="Sueño"
              value={formatNumber(latest.sleep_score, 0)}
              unit="/100"
              average30={formatNumber(avgSleepScore, 0)}
              icon={<Moon className="w-5 h-5" />}
              color="sleep"
              delay={300}
              subtitle={latest.sleep_hours !== null ? `Horas de hoy: ${formatNumber(latest.sleep_hours, 1)} h` : undefined}
            />

            {/* Resting HR */}
            <MetricCardSimple
              label="Ritmo en reposo"
              value={formatNumber(latest.resting_hr, 0)}
              unit="bpm"
              average30={`${formatNumber(avgRestingHr, 0)} bpm`}
              icon={<Heart className="w-5 h-5" />}
              color="heart"
              delay={400}
            />

            {/* Steps */}
            <MetricCardSimple
              label="Pasos"
              value={formatInteger(latest.steps)}
              average30={formatInteger(avgSteps)}
              icon={<Footprints className="w-5 h-5" />}
              color="steps"
              delay={500}
            />

            {/* Stress Level */}
            <MetricCardSimple
              label="Estrés"
              value={formatNumber(latest.stress_level, 0)}
              unit="/100"
              average30={formatNumber(avgStress, 0)}
              icon={<Brain className="w-5 h-5" />}
              color="stress"
              delay={600}
            />

            {/* MVPA Minutes */}
            <MetricCardSimple
              label="Actividad"
              value={formatNumber(latest.mvpa_minutes, 0)}
              unit="min"
              average30={`${formatNumber(avgMvpa, 0)} min`}
              icon={<Flame className="w-5 h-5" />}
              color="activity"
              delay={700}
            />

            {/* Training Load */}
            <MetricCardSimple
              label="Carga entrenamiento"
              value={formatNumber(latest.training_load, 1)}
              average30={formatNumber(avgTrainingLoad, 1)}
              icon={<Dumbbell className="w-5 h-5" />}
              color="training"
              delay={800}
            />
          </div>
        </section>

        {/* Advanced Metrics Section */}
        <section className="mb-10">
          <h2
            className="text-lg font-semibold text-foreground mb-4 animate-fade-in"
            style={{ animationDelay: '850ms' }}
          >
            Métricas avanzadas
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* HRV */}
            <MetricCardSimple
              label="Variabilidad cardíaca (HRV)"
              value={formatNumber(latest.hrv, 0)}
              unit="ms"
              average30={`${formatNumber(avgHrv, 0)} ms`}
              icon={<Activity className="w-5 h-5" />}
              color="hrv"
              delay={900}
            />

            {/* VO2 Max */}
            <MetricCardSimple
              label="VO₂ máx"
              value={formatNumber(latest.vo2max, 1)}
              unit="ml/kg/min"
              average30={`${formatNumber(avgVo2max, 1)} ml/kg/min`}
              icon={<Wind className="w-5 h-5" />}
              color="vo2"
              delay={1000}
            />
          </div>
        </section>

        {/* Footer */}
        <footer className="mt-16 text-center animate-fade-in" style={{ animationDelay: '1100ms' }}>
          <p className="text-xs text-muted-foreground">
            Datos sincronizados desde tu dispositivo wearable
          </p>
        </footer>
      </div>
    </div>
  );
}
