export type ViewState = 'dashboard' | 'atomic-habits' | 'settings';

export interface Habit {
  id: string;
  identity: string; // The "Who" (e.g., "Runner")
  cue: string; // The "When"
  action: string; // The "What"
  streak: number;
  completedDates: string[]; // ISO date strings
  color: string;
}

export interface Metric {
  label: string;
  value: string | number;
  trend: 'up' | 'down' | 'neutral';
  trendValue?: string;
}

export enum LoadingState {
  IDLE = 'IDLE',
  LOADING = 'LOADING',
  SUCCESS = 'SUCCESS',
  ERROR = 'ERROR'
}

export interface UserProfile {
  name: string;
  apiKey: string;
}