import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://hcvrbginvsepcndtshmc.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhjdnJiZ2ludnNlcGNuZHRzaG1jIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjM5ODcyMzYsImV4cCI6MjA3OTU2MzIzNn0.hILf1liNLtC0aFuQ1f3eJ9xz8KcyGM8JrBcFnpB0_PA';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Hardcoded user_id for now
const USER_ID = '36f40093-9629-442d-8e9f-5a4f00a371c0';

export interface DailyMetrics {
  id: number;
  user_id: string;
  date: string;
  sleep_hours: number | null;
  resting_hr: number | null;
  steps: number | null;
  stress_level: number | null;
  sleep_score: number | null;
  hrv: number | null;
  vo2max: number | null;
  mvpa_minutes: number | null;
  training_load: number | null;
  health_score: number | null;
  body_battery: number | null;
  created_at: string | null;
}

export async function getLast30DaysMetrics(): Promise<DailyMetrics[]> {
  const today = new Date();
  const thirtyDaysAgo = new Date(today);
  thirtyDaysAgo.setDate(today.getDate() - 30);
  
  const dateString = thirtyDaysAgo.toISOString().split('T')[0];

  const { data, error } = await supabase
    .from('daily_metrics')
    .select('*')
    .eq('user_id', USER_ID)
    .gte('date', dateString)
    .order('date', { ascending: false });

  if (error) {
    console.error('Error fetching metrics:', error);
    return [];
  }

  return data || [];
}

// Helper function to calculate average of a numeric field, ignoring nulls
export function calculateAverage(
  metrics: DailyMetrics[],
  field: keyof DailyMetrics
): number | null {
  const values = metrics
    .map((m) => m[field])
    .filter((v): v is number => v !== null && typeof v === 'number');
  
  if (values.length === 0) return null;
  
  const sum = values.reduce((acc, val) => acc + val, 0);
  return sum / values.length;
}

// Format helpers
export function formatNumber(value: number | null, decimals: number = 0): string {
  if (value === null || value === undefined) return '—';
  return value.toFixed(decimals);
}

export function formatInteger(value: number | null): string {
  if (value === null || value === undefined) return '—';
  return Math.round(value).toLocaleString('es-ES');
}

export function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString('es-ES', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}
