import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://hcvrbginvsepcndtshmc.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhjdnJiZ2ludnNlcGNuZHRzaG1jIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjM5ODcyMzYsImV4cCI6MjA3OTU2MzIzNn0.hILf1liNLtC0aFuQ1f3eJ9xz8KcyGM8JrBcFnpB0_PA';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export interface DailyMetrics {
  id: string;
  date: string;
  sleep_hours: number;
  resting_heart_rate: number;
  stress_level: number;
  steps: number;
  body_battery: number;
  created_at: string;
}

export async function getLatestMetrics(): Promise<DailyMetrics | null> {
  const { data, error } = await supabase
    .from('daily_metrics')
    .select('*')
    .order('date', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) {
    console.error('Error fetching metrics:', error);
    return null;
  }

  return data;
}

// Calculate HealthScore from 0-100 based on normalized metrics
export function calculateHealthScore(metrics: DailyMetrics): number {
  // Handle null/undefined values with defaults
  const sleepHours = metrics.sleep_hours ?? 0;
  const restingHR = metrics.resting_heart_rate ?? 60;
  const stressLevel = metrics.stress_level ?? 50;
  const steps = metrics.steps ?? 0;
  const bodyBattery = metrics.body_battery ?? 50;

  // Normalize each metric to a 0-100 scale
  const sleepScore = Math.min(100, (sleepHours / 8) * 100);
  const heartScore = Math.max(0, Math.min(100, 100 - ((restingHR - 50) / 40) * 100));
  const stressScore = Math.max(0, 100 - stressLevel);
  const stepsScore = Math.min(100, (steps / 10000) * 100);
  const batteryScore = bodyBattery;

  // Weighted average
  const weights = {
    sleep: 0.25,
    heart: 0.2,
    stress: 0.2,
    steps: 0.15,
    battery: 0.2,
  };

  const score =
    sleepScore * weights.sleep +
    heartScore * weights.heart +
    stressScore * weights.stress +
    stepsScore * weights.steps +
    batteryScore * weights.battery;

  const finalScore = Math.round(Math.max(0, Math.min(100, score)));
  return isNaN(finalScore) ? 0 : finalScore;
}
