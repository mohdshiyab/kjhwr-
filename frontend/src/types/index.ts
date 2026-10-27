export interface DecisionDateItem {
  decision_date: string;
  delivery_date: string;
  label: string;
}

export interface DecisionInterval {
  interval_index: number;
  settlement_period: number;
  start_time: string;
  hour: number;
  minute: number;
  actual_mw: number | null;
  forecast_mw: number | null;
  error_mw: number | null;
  abs_error_mw: number | null;
  forecast_publish_time: string | null;
  is_matched: boolean;
  is_eligible: boolean;
}

export interface DecisionSummary {
  decision_date: string;
  delivery_date: string;
  cutoff_timestamp: string;
  matched_intervals: number;
  total_intervals: number;
  coverage_pct: number;
  mae_mw: number;
  rmse_mw: number;
  mean_signed_error_mw: number;
  avg_actual_mw: number;
  avg_forecast_mw: number;
  total_actual_mwh: number;
  total_forecast_mwh: number;
  active_vintage_publish_time: string | null;
}

export interface ForecastRevisionItem {
  publish_time: string;
  status: 'SELECTED' | 'SUPERSEDED' | 'EXCLUDED';
  is_eligible: boolean;
  reason: string;
  avg_forecast_mw: number;
  horizon_count: number;
}

export interface DecisionReplayResponse {
  decision_date: string;
  delivery_date: string;
  cutoff_time: string;
  cutoff_timestamp: string;
  summary: DecisionSummary;
  intervals: DecisionInterval[];
  revisions: ForecastRevisionItem[];
}

export interface DiurnalProfileHour {
  hour: number;
  hour_label: string;
  settlement_periods: number[];
  mae_mw: number;
  mean_signed_error_mw: number;
  rmse_mw: number;
  avg_actual_mw: number;
  avg_forecast_mw: number;
  sample_count: number;
}

export interface AnalyticsSummaryResponse {
  date_range: string;
  decision_days_count: number;
  total_matched_intervals: number;
  total_expected_intervals: number;
  coverage_pct: number;
  mae_mw: number;
  rmse_mw: number;
  mean_signed_error_mw: number;
  wape_pct: number;
  avg_actual_mw: number;
  avg_forecast_mw: number;
  diurnal_profile: DiurnalProfileHour[];
  daily_breakdown: DecisionSummary[];
}

export interface DataQualityReport {
  status: string;
  dataset_sources: {
    actuals: string;
    forecasts: string;
  };
  records_ingested: {
    total_wind_actual_intervals: number;
    total_wind_forecast_horizons: number;
    expected_jan_delivery_intervals: number;
    actual_jan_delivery_intervals_present: number;
    missing_intervals: number;
    duplicate_records: number;
  };
  decision_cutoff_rules: {
    default_cutoff_time: string;
    alternative_cutoffs_supported: string[];
  };
  last_cache_refresh: string;
}

// Backward-compatible types
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

export interface AccuracyAnalyticsResponse {
  summary: MetricSummary;
  settlement_period_profile: any[];
  daily_leaderboard: any[];
  error_distribution: any[];
}

export interface ThermalProcurementResponse {
  target_date: string;
  summary: any;
  hourly_schedule: any[];
}
