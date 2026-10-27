export interface MetricSummary {
  mae_mw: number;
  rmse_mw: number;
  wape_pct: number;
  mape_pct: number;
  bias_mw: number;
  correlation: number;
  p10_error_mw: number;
  p50_error_mw: number;
  p90_error_mw: number;
  sample_count: number;
}

export interface ExecutiveKPIs {
  date_range: string;
  total_actual_gwh: number;
  total_forecast_gwh: number;
  avg_actual_mw: number;
  max_actual_mw: number;
  min_actual_mw: number;
  forecast_accuracy_wape: number;
  systematic_bias_mw: number;
  active_gate_closure: string;
  metrics: MetricSummary;
}

export interface TimeSeriesPoint {
  start_time: string;
  settlement_date: string;
  hour: number;
  settlement_periods: number[];
  actual_mw: number;
  forecast_mw?: number | null;
  error_mw?: number | null;
  abs_error_mw?: number | null;
  pct_error?: number | null;
  publish_time?: string | null;
}

export interface SettlementPeriodBreakdown {
  settlement_period: number;
  hour_of_day: number;
  avg_actual_mw: number;
  avg_forecast_mw: number;
  mae_mw: number;
  bias_mw: number;
  rmse_mw: number;
  sample_count: number;
}

export interface DailyAccuracyRecord {
  date: string;
  avg_actual_mw: number;
  avg_forecast_mw: number;
  mae_mw: number;
  rmse_mw: number;
  wape_pct: number;
  bias_mw: number;
  max_under_forecast_mw: number;
  max_over_forecast_mw: number;
}

export interface ErrorDistributionBin {
  bin_start: number;
  bin_end: number;
  bin_label: string;
  frequency: number;
  percentage: number;
}

export interface AccuracyAnalyticsResponse {
  summary: MetricSummary;
  settlement_period_profile: SettlementPeriodBreakdown[];
  daily_leaderboard: DailyAccuracyRecord[];
  error_distribution: ErrorDistributionBin[];
}

export interface GateClosureComparisonItem {
  gate_closure_id: string;
  gate_closure_label: string;
  cutoff_time: string;
  mae_mw: number;
  rmse_mw: number;
  wape_pct: number;
  bias_mw: number;
  p90_error_mw: number;
}

export interface ThermalProcurementHour {
  hour: number;
  start_time: string;
  consumer_demand_mw: number;
  wind_forecast_mw: number;
  derated_wind_mw: number;
  actual_wind_mw: number;
  thermal_procured_mw: number;
  actual_thermal_needed_mw: number;
  imbalance_mw: number;
  status: 'BALANCED' | 'SHORT' | 'LONG';
  est_imbalance_impact_gbp: number;
}

export interface ThermalProcurementResponse {
  target_date: string;
  summary: {
    target_date: string;
    gate_closure: string;
    base_demand_mw: number;
    use_derating_buffer: boolean;
    buffer_pct: number;
    total_demand_mwh: number;
    total_wind_actual_mwh: number;
    total_wind_forecast_mwh: number;
    total_thermal_procured_mwh: number;
    total_thermal_needed_mwh: number;
    net_imbalance_mwh: number;
    total_short_mwh: number;
    total_long_mwh: number;
    est_imbalance_penalty_gbp: number;
    renewable_penetration_pct: number;
  };
  hourly_schedule: ThermalProcurementHour[];
}
