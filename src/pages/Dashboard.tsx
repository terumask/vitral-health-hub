import { useEffect, useState } from 'react';
import { Moon, Heart, Brain, Footprints, Battery } from 'lucide-react';
import { getLatestMetrics, calculateHealthScore, DailyMetrics } from '@/lib/supabase';
import { HealthScore } from '@/components/HealthScore';
import { MetricCard } from '@/components/MetricCard';
import { EmptyState } from '@/components/EmptyState';
import { LoadingState } from '@/components/LoadingState';

export default function Dashboard() {
  const [metrics, setMetrics] = useState<DailyMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchData() {
      try {
        const data = await getLatestMetrics();
        setMetrics(data);
      } catch (err) {
        setError('Failed to load health data');
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
        <div className="text-center">
          <p className="text-destructive font-medium">{error}</p>
        </div>
      </div>
    );
  }

  if (!metrics) {
    return (
      <div className="min-h-screen gradient-hero">
        <div className="container max-w-4xl mx-auto px-4 py-8">
          <header className="text-center mb-12">
            <h1 className="text-3xl font-bold text-foreground tracking-tight">
              Vitral
            </h1>
            <p className="text-muted-foreground mt-1">
              Your personal health dashboard
            </p>
          </header>
          <EmptyState />
        </div>
      </div>
    );
  }

  const healthScore = calculateHealthScore(metrics);
  const formattedDate = new Date(metrics.date).toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <div className="min-h-screen gradient-hero">
      <div className="container max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <header className="text-center mb-8 animate-fade-in">
          <h1 className="text-3xl font-bold text-foreground tracking-tight">
            Vitral
          </h1>
          <p className="text-muted-foreground mt-1">
            {formattedDate}
          </p>
        </header>

        {/* Health Score */}
        <section className="mb-12">
          <HealthScore score={healthScore} />
        </section>

        {/* Metrics Grid */}
        <section>
          <h2 className="text-lg font-semibold text-foreground mb-4 animate-fade-in" style={{ animationDelay: '200ms' }}>
            Daily Metrics
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <MetricCard
              title="Sleep"
              value={(metrics.sleep_hours ?? 0).toFixed(1)}
              unit="hours"
              icon={<Moon className="w-5 h-5" />}
              color="sleep"
              subtitle="Time asleep"
              delay={300}
            />
            <MetricCard
              title="Resting Heart Rate"
              value={metrics.resting_heart_rate ?? '-'}
              unit="bpm"
              icon={<Heart className="w-5 h-5" />}
              color="heart"
              subtitle="Average resting"
              delay={400}
            />
            <MetricCard
              title="Stress Level"
              value={metrics.stress_level ?? '-'}
              unit="/100"
              icon={<Brain className="w-5 h-5" />}
              color="stress"
              subtitle="Daily average"
              delay={500}
            />
            <MetricCard
              title="Steps"
              value={(metrics.steps ?? 0).toLocaleString()}
              icon={<Footprints className="w-5 h-5" />}
              color="steps"
              subtitle="Total today"
              delay={600}
            />
            <MetricCard
              title="Body Battery"
              value={metrics.body_battery ?? '-'}
              unit="%"
              icon={<Battery className="w-5 h-5" />}
              color="battery"
              subtitle="Energy level"
              delay={700}
            />
          </div>
        </section>

        {/* Footer */}
        <footer className="mt-16 text-center animate-fade-in" style={{ animationDelay: '800ms' }}>
          <p className="text-xs text-muted-foreground">
            Data synced from your wearable device
          </p>
        </footer>
      </div>
    </div>
  );
}
