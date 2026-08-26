export type IndicatorCategory = 'short' | 'mid' | 'long';

export type SignalType = 'green' | 'yellow' | 'red';

export type TrendType = 'up' | 'down' | 'same';

export type HardTriggerStatus = 'no' | 'warning' | 'yes'; // ❌ | ⚠️ | ✅

export interface IndicatorData {
  id: string;
  name: string;
  category: IndicatorCategory;
  value: string;
  numValue?: number;
  unit?: string;
  date: string;
  source: string;
  threshold: string;
  signal: SignalType;
  trend: TrendType;
  interpretation: string;
}

export interface HardThreshold {
  id: string;
  condition: string;
  threshold: string;
  currentReading: string;
  status: HardTriggerStatus;
  notes: string;
}

export interface WeeklyExtraData {
  sp500ForwardPE: string;
  tipsRealYield10Y: string;
  dxy: string;
  goldSp500Ratio: string;
  date: string;
}

export interface ThursdayDeepDiveData {
  m2Growth: string;
  sloosReport: string;
  chicagoFedNfci: string;
  date: string;
}

export interface ScanReport {
  date: string;
  isEscalated: boolean; // 🚨 警戒升級 if hardTriggersCount >= 2
  indicators: IndicatorData[];
  
  // Alert stats
  shortTermUnwarned: number;
  shortTermTotal: number;
  midTermUnwarned: number;
  midTermTotal: number;
  longTermUnwarned: number;
  longTermTotal: number;

  // Conclusions
  shortTermConclusion: string;
  midTermConclusion: string;
  longTermConclusion: string;

  // Hard threshold tracking
  hardThresholds: HardThreshold[];
  hardTriggersCount: number;
  sellThresholdReached: boolean; // >= 3 triggered

  // Spotlight Signal
  spotlightSignalId: string;
  spotlightTitle: string;
  spotlightReason: string;

  // Optional extensions
  weeklyExtra?: WeeklyExtraData;
  thursdayDeepDive?: ThursdayDeepDiveData;

  // Delayed / Source conflict notes
  dataNotes?: string[];
}
