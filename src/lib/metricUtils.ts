import { DailyMetrics } from './supabase';

// Metric configuration for evaluation
export interface MetricConfig {
  key: keyof DailyMetrics;
  label: string;
  unit?: string;
  unitSuffix?: string;
  color: 'sleep' | 'heart' | 'stress' | 'steps' | 'activity' | 'training' | 'hrv' | 'vo2';
  // Higher is better (true) or lower is better (false)
  higherIsBetter: boolean;
  // Thresholds for evaluation [excellent, good, fair] - below fair is "needs attention"
  thresholds: [number, number, number];
  // For score-based metrics (0-100)
  isScore?: boolean;
  decimals?: number;
}

export const metricConfigs: MetricConfig[] = [
  {
    key: 'sleep_score',
    label: 'Puntuación de sueño',
    unit: '/100',
    color: 'sleep',
    higherIsBetter: true,
    thresholds: [85, 70, 50],
    isScore: true,
    decimals: 0,
  },
  {
    key: 'sleep_hours',
    label: 'Horas de sueño',
    unitSuffix: 'h',
    color: 'sleep',
    higherIsBetter: true,
    thresholds: [8, 7, 6],
    decimals: 1,
  },
  {
    key: 'resting_hr',
    label: 'Frecuencia cardíaca en reposo',
    unitSuffix: 'bpm',
    color: 'heart',
    higherIsBetter: false, // Lower is better for resting HR
    thresholds: [55, 65, 75], // Inverted: <55 excellent, <65 good, <75 fair
    decimals: 0,
  },
  {
    key: 'hrv',
    label: 'Variabilidad cardíaca (HRV)',
    unitSuffix: 'ms',
    color: 'hrv',
    higherIsBetter: true,
    thresholds: [60, 45, 30],
    decimals: 0,
  },
  {
    key: 'steps',
    label: 'Pasos',
    color: 'steps',
    higherIsBetter: true,
    thresholds: [10000, 7500, 5000],
    decimals: 0,
  },
  {
    key: 'stress_level',
    label: 'Estrés',
    unit: '/100',
    color: 'stress',
    higherIsBetter: false, // Lower stress is better
    thresholds: [25, 40, 60], // <25 excellent, <40 good, <60 fair
    isScore: true,
    decimals: 0,
  },
  {
    key: 'mvpa_minutes',
    label: 'Minutos de actividad',
    unitSuffix: 'min',
    color: 'activity',
    higherIsBetter: true,
    thresholds: [60, 45, 30],
    decimals: 0,
  },
];

export interface MetricEvaluation {
  label: string;
  color: 'excellent' | 'good' | 'fair' | 'poor';
}

export function evaluateMetric(value: number | null, config: MetricConfig): MetricEvaluation {
  if (value === null) {
    return { label: 'Sin datos', color: 'fair' };
  }

  const [excellent, good, fair] = config.thresholds;

  if (config.higherIsBetter) {
    if (value >= excellent) return { label: 'Excelente', color: 'excellent' };
    if (value >= good) return { label: 'Bueno', color: 'good' };
    if (value >= fair) return { label: 'Regular', color: 'fair' };
    return { label: 'Por debajo del objetivo', color: 'poor' };
  } else {
    // Lower is better (stress, resting_hr)
    if (value <= excellent) return { label: 'Excelente', color: 'excellent' };
    if (value <= good) return { label: 'Bueno', color: 'good' };
    if (value <= fair) return { label: 'Moderado', color: 'fair' };
    return { label: 'Alto', color: 'poor' };
  }
}

// Custom labels for specific metrics
export function getMetricLabel(value: number | null, config: MetricConfig): string {
  if (value === null) return 'Sin datos';
  
  const evaluation = evaluateMetric(value, config);
  
  // Custom labels based on metric type
  if (config.key === 'resting_hr') {
    if (evaluation.color === 'excellent') return 'Óptimo';
    if (evaluation.color === 'good') return 'En tu rango';
    if (evaluation.color === 'fair') return 'Elevado';
    return 'Alto';
  }
  
  if (config.key === 'hrv') {
    if (evaluation.color === 'excellent') return 'Excelente recuperación';
    if (evaluation.color === 'good') return 'Buena recuperación';
    if (evaluation.color === 'fair') return 'Recuperación media';
    return 'Baja recuperación';
  }
  
  if (config.key === 'stress_level') {
    if (evaluation.color === 'excellent') return 'Muy bajo';
    if (evaluation.color === 'good') return 'Bajo';
    if (evaluation.color === 'fair') return 'Moderado';
    return 'Alto';
  }
  
  if (config.key === 'sleep_hours') {
    if (evaluation.color === 'excellent') return 'Óptimo';
    if (evaluation.color === 'good') return 'Bien';
    if (evaluation.color === 'fair') return 'Insuficiente';
    return 'Muy poco';
  }
  
  return evaluation.label;
}

export type TrendDirection = 'up' | 'down' | 'stable';

export function calculateTrend(today: number | null, avg30: number | null, higherIsBetter: boolean): { direction: TrendDirection; label: string } {
  if (today === null || avg30 === null || avg30 === 0) {
    return { direction: 'stable', label: 'Tendencia: ↔ Sin datos' };
  }

  const ratio = today / avg30;
  
  if (ratio > 1.05) {
    // Today is higher than average
    if (higherIsBetter) {
      return { direction: 'up', label: 'Tendencia: ↑ Mejorando' };
    } else {
      return { direction: 'down', label: 'Tendencia: ↓ Empeorando' };
    }
  } else if (ratio < 0.95) {
    // Today is lower than average
    if (higherIsBetter) {
      return { direction: 'down', label: 'Tendencia: ↓ Empeorando' };
    } else {
      return { direction: 'up', label: 'Tendencia: ↑ Mejorando' };
    }
  }
  
  return { direction: 'stable', label: 'Tendencia: ↔ Estable' };
}

// Calculate how "bad" a metric is (0 = perfect, higher = worse)
export function calculateDeviationScore(value: number | null, config: MetricConfig): number {
  if (value === null) return 100; // Null values are worst
  
  const [excellent] = config.thresholds;
  
  if (config.higherIsBetter) {
    // For metrics where higher is better, deviation is how far below excellent
    return Math.max(0, excellent - value);
  } else {
    // For metrics where lower is better, deviation is how far above excellent
    return Math.max(0, value - excellent);
  }
}

export function formatMetricValue(value: number | null, config: MetricConfig): string {
  if (value === null) return '—';
  
  if (config.key === 'steps') {
    return Math.round(value).toLocaleString('es-ES');
  }
  
  return value.toFixed(config.decimals ?? 0);
}

export function calculate7DayAverage(metrics: DailyMetrics[], field: keyof DailyMetrics): number | null {
  const last7 = metrics.slice(0, 7);
  const values = last7
    .map((m) => m[field])
    .filter((v): v is number => v !== null && typeof v === 'number');
  
  if (values.length === 0) return null;
  
  return values.reduce((acc, val) => acc + val, 0) / values.length;
}
