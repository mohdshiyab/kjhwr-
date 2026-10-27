import {
  ExecutiveKPIs,
  TimeSeriesPoint,
  AccuracyAnalyticsResponse,
  GateClosureComparisonItem,
  ThermalProcurementResponse
} from '../types';

const API_BASE = '/api';

export async function fetchSummary(
  dateFrom?: string,
  dateTo?: string,
  gateClosure = 'da_1100'
): Promise<ExecutiveKPIs> {
  const params = new URLSearchParams();
  if (dateFrom) params.append('date_from', dateFrom);
  if (dateTo) params.append('date_to', dateTo);
  params.append('gate_closure', gateClosure);

  const res = await fetch(`${API_BASE}/summary?${params.toString()}`);
  if (!res.ok) throw new Error(`Summary fetch failed: ${res.statusText}`);
  return res.json();
}

export async function fetchTimeSeries(
  dateFrom?: string,
  dateTo?: string,
  gateClosure = 'da_1100'
): Promise<TimeSeriesPoint[]> {
  const params = new URLSearchParams();
  if (dateFrom) params.append('date_from', dateFrom);
  if (dateTo) params.append('date_to', dateTo);
  params.append('gate_closure', gateClosure);

  const res = await fetch(`${API_BASE}/forecasts/timeseries?${params.toString()}`);
  if (!res.ok) throw new Error(`Timeseries fetch failed: ${res.statusText}`);
  return res.json();
}

export async function fetchAccuracyMetrics(
  dateFrom?: string,
  dateTo?: string,
  gateClosure = 'da_1100'
): Promise<AccuracyAnalyticsResponse> {
  const params = new URLSearchParams();
  if (dateFrom) params.append('date_from', dateFrom);
  if (dateTo) params.append('date_to', dateTo);
  params.append('gate_closure', gateClosure);

  const res = await fetch(`${API_BASE}/metrics?${params.toString()}`);
  if (!res.ok) throw new Error(`Metrics fetch failed: ${res.statusText}`);
  return res.json();
}

export async function fetchGateClosureComparison(
  dateFrom?: string,
  dateTo?: string
): Promise<GateClosureComparisonItem[]> {
  const params = new URLSearchParams();
  if (dateFrom) params.append('date_from', dateFrom);
  if (dateTo) params.append('date_to', dateTo);

  const res = await fetch(`${API_BASE}/sensitivity/compare?${params.toString()}`);
  if (!res.ok) throw new Error(`Sensitivity fetch failed: ${res.statusText}`);
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
  if (!res.ok) throw new Error(`Simulation failed: ${res.statusText}`);
  return res.json();
}

export async function fetchAvailableDates(): Promise<string[]> {
  const res = await fetch(`${API_BASE}/summary/dates`);
  if (!res.ok) return [];
  const data = await res.json();
  return data.available_dates || [];
}
