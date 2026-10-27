from pydantic import BaseModel, Field
from typing import List, Dict, Optional, Any


class MetricSummary(BaseModel):
    mae_mw: float = Field(..., description="Mean Absolute Error in MW")
    rmse_mw: float = Field(..., description="Root Mean Square Error in MW")
    wape_pct: float = Field(..., description="Weighted Absolute Percentage Error in %")
    mape_pct: float = Field(..., description="Mean Absolute Percentage Error in %")
    bias_mw: float = Field(..., description="Mean Prediction Error (Bias) in MW: + Over-forecast, - Under-forecast")
    correlation: float = Field(..., description="Pearson correlation between forecast and actual")
    p10_error_mw: float = Field(..., description="10th percentile of error")
    p50_error_mw: float = Field(..., description="Median error")
    p90_error_mw: float = Field(..., description="90th percentile of error")
    sample_count: int = Field(..., description="Total time intervals evaluated")


class ExecutiveKPIs(BaseModel):
    date_range: str
    total_actual_gwh: float
    total_forecast_gwh: float
    avg_actual_mw: float
    max_actual_mw: float
    min_actual_mw: float
    forecast_accuracy_wape: float
    systematic_bias_mw: float
    active_gate_closure: str
    metrics: MetricSummary


class TimeSeriesPoint(BaseModel):
    start_time: str
    settlement_date: str
    hour: int
    settlement_periods: List[int]
    actual_mw: float
    forecast_mw: Optional[float]
    error_mw: Optional[float]
    abs_error_mw: Optional[float]
    pct_error: Optional[float]
    publish_time: Optional[str]
    thermal_required_mw: Optional[float] = None
    thermal_procured_mw: Optional[float] = None
    imbalance_mw: Optional[float] = None


class SettlementPeriodBreakdown(BaseModel):
    settlement_period: int
    hour_of_day: float
    avg_actual_mw: float
    avg_forecast_mw: float
    mae_mw: float
    bias_mw: float
    rmse_mw: float
    sample_count: int


class DailyAccuracyRecord(BaseModel):
    date: str
    avg_actual_mw: float
    avg_forecast_mw: float
    mae_mw: float
    rmse_mw: float
    wape_pct: float
    bias_mw: float
    max_under_forecast_mw: float
    max_over_forecast_mw: float


class ErrorDistributionBin(BaseModel):
    bin_start: float
    bin_end: float
    bin_label: str
    frequency: int
    percentage: float


class AccuracyAnalyticsResponse(BaseModel):
    summary: MetricSummary
    settlement_period_profile: List[SettlementPeriodBreakdown]
    daily_leaderboard: List[DailyAccuracyRecord]
    error_distribution: List[ErrorDistributionBin]


class GateClosureComparisonItem(BaseModel):
    gate_closure_id: str
    gate_closure_label: str
    cutoff_time: str
    mae_mw: float
    rmse_mw: float
    wape_pct: float
    bias_mw: float
    p90_error_mw: float


class ThermalProcurementRequest(BaseModel):
    target_date: Optional[str] = "2026-01-15"
    demand_level_mw: float = 30000.0  # Overall consumer demand
    use_derating_buffer: bool = True
    buffer_pct: float = 15.0  # e.g. 15% safety margin on wind forecast to mitigate over-forecast bias
    gate_closure: str = "da_1100"


class ThermalProcurementHour(BaseModel):
    hour: int
    start_time: str
    consumer_demand_mw: float
    wind_forecast_mw: float
    derated_wind_mw: float
    actual_wind_mw: float
    thermal_procured_mw: float  # Procurement = Demand - derated_wind
    actual_thermal_needed_mw: float  # Actual needed = Demand - actual_wind
    imbalance_mw: float  # Procured - Needed
    status: str  # BALANCED, SHORT, LONG
    est_imbalance_impact_gbp: float


class ThermalProcurementResponse(BaseModel):
    target_date: str
    summary: Dict[str, Any]
    hourly_schedule: List[ThermalProcurementHour]
