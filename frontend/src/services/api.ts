import {
  DecisionDateItem,
  DecisionReplayResponse,
  AnalyticsSummaryResponse,
  DataQualityReport,
  GateClosureComparisonItem,
  ThermalProcurementResponse
} from '../types';

const API_BASE = '/api';

export async function fetchDecisionDates(): Promise<DecisionDateItem[]> {
  const res = await fetch(`${API_BASE}/decision-dates`);
  if (!res.ok) throw new Error('Failed to load decision dates');
  const data = await res.json();
  return data.decision_dates || [];
}

export async function fetchDecisionReplay(
  decisionDate: string,
  cutoffTime: string = '15:30'
): Promise<DecisionReplayResponse> {
  const res = await fetch(`${API_BASE}/decisions/${decisionDate}?cutoff_time=${encodeURIComponent(cutoffTime)}`);
  if (!res.ok) throw new Error(`Failed to load decision replay for ${decisionDate}`);
  return res.json();
}

export async function fetchAnalyticsSummary(
  dateFrom = '2026-01-01',
  dateTo = '2026-01-31',
  cutoffTime = '15:30'
): Promise<AnalyticsSummaryResponse> {
  const params = new URLSearchParams({
    date_from: dateFrom,
    date_to: dateTo,
    cutoff_time: cutoffTime
  });
  const res = await fetch(`${API_BASE}/analytics/summary?${params.toString()}`);
  if (!res.ok) throw new Error('Failed to load analytics summary');
  return res.json();
}

export async function fetchDataQuality(): Promise<DataQualityReport> {
  const res = await fetch(`${API_BASE}/data-quality`);
  if (!res.ok) throw new Error('Failed to load data quality report');
  return res.json();
}

export function getExportCsvUrl(decisionDate: string, cutoffTime = '15:30'): string {
  return `${API_BASE}/decisions/${decisionDate}/export?cutoff_time=${encodeURIComponent(cutoffTime)}`;
}

export async function fetchGateClosureComparison(): Promise<GateClosureComparisonItem[]> {
  const res = await fetch(`${API_BASE}/sensitivity/compare`);
  if (!res.ok) return [];
  return res.json();
}

export async function simulateProcurement(
  targetDate: string,
  demandLevelMw: number,
  useDeratingBuffer: boolean,
  bufferPct: number,
  gateClosure = 'da_1100'
): Promise<ThermalProcurementResponse> {
  const res = await fetch(`${API_BASE}/procurement/simulate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      target_date: targetDate,
      demand_level_mw: demandLevelMw,
      use_derating_buffer: useDeratingBuffer,
      buffer_pct: bufferPct,
      gate_closure: gateClosure
    })
  });
  if (!res.ok) throw new Error('Simulation failed');
  return res.json();
}
