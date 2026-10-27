import React from 'react';
import {
  Calendar,
  Clock,
  Wind,
  Zap,
  TrendingUp,
  AlertTriangle,
  CheckCircle2,
  ArrowRight,
  ShieldCheck,
  Download
} from 'lucide-react';
import {
  AreaChart,
  Area,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ComposedChart
} from 'recharts';
import { DecisionReplayResponse } from '../types';
import { getExportCsvUrl } from '../services/api';

interface OverviewPageProps {
  replay: DecisionReplayResponse | null;
  loading: boolean;
  onNavigateToReplay: () => void;
  onNavigateToAnalytics: () => void;
}

export const OverviewPage: React.FC<OverviewPageProps> = ({
  replay,
  loading,
  onNavigateToReplay,
  onNavigateToAnalytics
}) => {
  if (loading || !replay) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 h-40" />
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-slate-900 border border-slate-800 rounded-2xl p-6 h-32" />
          ))}
        </div>
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 h-96" />
      </div>
    );
  }

  const { summary, intervals } = replay;
  const isOver = summary.mean_signed_error_mw > 0;

  // Chart data
  const chartData = intervals.map((inv) => ({
    time: `${inv.hour.toString().padStart(2, '0')}:${inv.minute.toString().padStart(2, '0')}`,
    sp: inv.settlement_period,
    actual: inv.actual_mw,
    forecast: inv.forecast_mw,
    error: inv.error_mw
  }));

  return (
    <div className="space-y-6">
      {/* Top Banner: Decision Day Executive Snapshot */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-900 to-indigo-950/40 border border-slate-800 rounded-2xl p-6 shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-sky-950/80 text-sky-400 border border-sky-800 font-mono">
                Screen 1 — Daily Overview
              </span>
              <span className="text-xs text-slate-400">
                Decision Snapshot for Day-Ahead Power Procurement
              </span>
            </div>
            <h1 className="text-2xl font-extrabold text-white tracking-tight mt-1">
              Purchasing Decision: {replay.decision_date} → Delivery: {replay.delivery_date}
            </h1>
            <p className="text-xs text-slate-400 mt-1">
              Purchasing cutoff fixed at <strong>{replay.cutoff_time} GMT</strong> (EPEX SPOT 30-min Gate Closure). Reconstructed from historical Elexon BMRS streams.
            </p>
          </div>

          <div className="flex items-center space-x-3 shrink-0">
            <a
              href={getExportCsvUrl(replay.decision_date, replay.cutoff_time)}
              download
              className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 text-xs font-semibold rounded-xl transition flex items-center space-x-1.5 shadow"
            >
              <Download className="w-4 h-4 text-sky-400" />
              <span>Export CSV Snapshot</span>
            </a>

            <button
              onClick={onNavigateToReplay}
              className="px-4 py-2 bg-sky-600 hover:bg-sky-500 text-white text-xs font-semibold rounded-xl transition flex items-center space-x-1.5 shadow-lg shadow-sky-600/30"
            >
              <span>Inspect Decision Replay</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* 4 Core Scorecard Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1: Forecasted Wind Energy */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">Forecasted Wind Energy</span>
            <div className="p-1.5 rounded-lg bg-sky-500/10 text-sky-400">
              <Wind className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-white font-mono">
            {summary.total_forecast_mwh.toLocaleString()} <span className="text-xs font-semibold text-sky-400">MWh</span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Avg: <span className="font-mono text-slate-200">{summary.avg_forecast_mw.toLocaleString()} MW</span>
          </p>
        </div>

        {/* Metric 2: Actual Delivered Wind Energy */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">Delivered Wind Energy</span>
            <div className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-400">
              <Zap className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-white font-mono">
            {summary.total_actual_mwh.toLocaleString()} <span className="text-xs font-semibold text-emerald-400">MWh</span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Avg: <span className="font-mono text-slate-200">{summary.avg_actual_mw.toLocaleString()} MW</span>
          </p>
        </div>

        {/* Metric 3: Mean Absolute Error (MAE) */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">Mean Absolute Error (MAE)</span>
            <div className="p-1.5 rounded-lg bg-indigo-500/10 text-indigo-400">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-white font-mono">
            {summary.mae_mw.toLocaleString()} <span className="text-xs font-semibold text-slate-400">MW</span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            RMSE: <span className="font-mono text-slate-200">{summary.rmse_mw.toLocaleString()} MW</span>
          </p>
        </div>

        {/* Metric 4: Mean Signed Error (Bias) & Coverage */}
        <div className={`bg-slate-900 border rounded-2xl p-5 ${isOver ? 'border-amber-900/60' : 'border-slate-800'}`}>
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">Mean Signed Error (Bias)</span>
            <div className={`p-1.5 rounded-lg ${isOver ? 'bg-amber-500/10 text-amber-400' : 'bg-sky-500/10 text-sky-400'}`}>
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <div className={`text-2xl font-bold font-mono ${isOver ? 'text-amber-400' : 'text-sky-400'}`}>
            {summary.mean_signed_error_mw > 0 ? `+${summary.mean_signed_error_mw.toLocaleString()}` : summary.mean_signed_error_mw.toLocaleString()} <span className="text-xs font-semibold text-slate-400">MW</span>
          </div>
          <p className="text-xs text-slate-400 mt-1 flex items-center">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 mr-1" />
            <span>Coverage: <strong>{summary.matched_intervals} / {summary.total_intervals} (100%)</strong></span>
          </p>
        </div>
      </div>

      {/* Chart: 30-Minute Generation Profile Over Delivery Day */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-800 gap-2">
          <div>
            <h2 className="text-base font-bold text-white tracking-tight">
              30-Minute Generation Outlook: Forecasted vs Actual Wind ({replay.delivery_date})
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              48 Settlement Periods (SP 1 to 48) aligned on target delivery start time.
            </p>
          </div>

          <div className="flex items-center space-x-4 text-xs font-mono">
            <span className="flex items-center text-sky-400">
              <span className="w-3 h-0.5 bg-sky-400 inline-block mr-1.5" />
              Actual Delivered Wind
            </span>
            <span className="flex items-center text-emerald-400">
              <span className="w-3 h-0.5 border-t-2 border-dashed border-emerald-400 inline-block mr-1.5" />
              Day-Ahead Forecast (at {replay.cutoff_time})
            </span>
          </div>
        </div>

        <div className="h-80 w-full mt-4">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis dataKey="time" stroke="#64748b" tick={{ fill: '#94a3b8', fontSize: 11 }} />
              <YAxis
                stroke="#64748b"
                tick={{ fill: '#94a3b8', fontSize: 11 }}
                tickFormatter={(val) => `${(val / 1000).toFixed(0)}k`}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#0f172a',
                  borderColor: '#334155',
                  borderRadius: '0.75rem',
                  fontSize: '12px'
                }}
                formatter={(val: any, name: string) => [
                  `${Number(val).toLocaleString()} MW`,
                  name === 'actual' ? 'Actual Wind (FUELHH)' : 'Day-Ahead Forecast (WINDFOR)'
                ]}
              />
              <Line
                type="monotone"
                dataKey="actual"
                stroke="#38bdf8"
                strokeWidth={2.5}
                dot={false}
                name="actual"
              />
              <Line
                type="monotone"
                dataKey="forecast"
                stroke="#34d399"
                strokeWidth={2}
                strokeDasharray="4 4"
                dot={false}
                name="forecast"
              />
            </ComposedChart>
          </ResponsiveContainer>
        </div>

        {/* Quick Analytical Callout */}
        <div className="mt-4 p-4 rounded-xl bg-slate-950/80 border border-slate-800 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center space-x-2">
            <span className="p-1 rounded bg-sky-500/20 text-sky-400 font-mono text-[10px] font-bold">
              TRADER SNAPSHOT
            </span>
            <span className="text-slate-300">
              {isOver ? (
                <>
                  Wind was <strong>over-forecasted by an average of {summary.mean_signed_error_mw.toLocaleString()} MW</strong> across this delivery day. Residual thermal power would need to be procured to avoid shortfall penalties.
                </>
              ) : (
                <>
                  Wind generation <strong>exceeded the day-ahead forecast by {Math.abs(summary.mean_signed_error_mw).toLocaleString()} MW</strong> on average, providing surplus renewable power.
                </>
              )}
            </span>
          </div>

          <button
            onClick={onNavigateToAnalytics}
            className="text-sky-400 hover:text-sky-300 font-semibold text-xs shrink-0 flex items-center space-x-1"
          >
            <span>View Month-Long Patterns</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
