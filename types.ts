export interface CaffeineLog {
  id: string;
  name: string;
  amountMg: number; // Initial amount ingested
  timestamp: number; // Unix timestamp
  source: 'manual' | 'brand' | 'ai';
}

export interface UserSettings {
  dailyLimitMg: number;
  halfLifeHours: number; // e.g., 3 (fast), 5 (avg), 7 (slow)
  bedtime: string; // "23:00"
  wakeTime: string; // "07:00"
  sleepThresholdMg: number; // Level at which sleep is possible, default 50mg
}

export enum TabView {
  DASHBOARD = 'DASHBOARD',
  ADD = 'ADD',
  STATS = 'STATS',
  WIKI = 'WIKI',
  SETTINGS = 'SETTINGS',
  SOS = 'SOS'
}

export interface BrandItem {
  name: string;
  items: { name: string; sizes: { label: string; mg: number; ml: number }[] }[];
}

export interface AIAnalysisResult {
  drinkName: string;
  estimatedMg: number;
  confidence: string;
  reasoning: string;
}