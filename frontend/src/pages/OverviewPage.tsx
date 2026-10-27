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
  ResponsiveContainer
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
        <div className="glass-panel rounded-2xl p-6 h-36" />
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="glass-panel rounded-2xl p-6 h-28" />
          ))}
        </div>
        <div className="glass-panel rounded-2xl p-6 h-80" />
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
    <div className="space-y-5">
      {/* Top Banner: Decision Day Executive Snapshot */}
      <div className="glass-panel rounded-2xl p-6 border border-white/[0.06] shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-[10px] uppercase font-mono tracking-wider px-2 py-0.5 rounded-md bg-sky-500/10 text-sky-400 border border-sky-500/20 font-bold">
                Daily Overview
              </span>
              <span className="text-zinc-500 text-xs font-mono">•</span>
              <span className="text-xs text-zinc-400 font-mono">
                Cutoff: <strong>{replay.cutoff_time} GMT</strong> ({replay.decision_date})
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight mt-1">
              Decision: <span className="text-zinc-200">{replay.decision_date}</span> → Delivery: <span className="text-sky-400">{replay.delivery_date}</span>
            </h1>
            <p className="text-xs text-zinc-400 mt-0.5">
              Reconstructed from official Elexon BMRS streams locked prior to the 15:30 GMT GB Day-Ahead gate closure.
            </p>
          </div>

          <div className="flex items-center space-x-2.5 shrink-0">
            <a
              href={getExportCsvUrl(replay.decision_date, replay.cutoff_time)}
              download
              className="px-3 py-2 bg-white/[0.03] hover:bg-white/[0.08] border border-white/[0.06] text-zinc-200 text-xs font-medium rounded-xl transition flex items-center space-x-1.5 shadow"
            >
              <Download className="w-3.5 h-3.5 text-zinc-400" />
              <span>Export CSV</span>
            </a>

            <button
              onClick={onNavigateToReplay}
              className="px-3.5 py-2 bg-sky-500 hover:bg-sky-400 text-slate-950 text-xs font-bold rounded-xl transition flex items-center space-x-1.5 shadow-md shadow-sky-500/20"
            >
              <span>Inspect Decision Replay</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* 4 Refined Scorecard Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Delivered Wind */}
        <div className="glass-panel glass-panel-hover rounded-2xl p-5 border border-white/[0.06]">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-mono uppercase tracking-wider text-zinc-400">Delivered Wind Energy</span>
            <div className="p-1.5 rounded-lg bg-sky-500/10 text-sky-400">
              <Zap className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-white font-mono tracking-tight">
            {summary.total_actual_mwh.toLocaleString()} <span className="text-xs font-semibold text-sky-400">MWh</span>
          </div>
          <p className="text-[11px] text-zinc-400 mt-1 font-mono">
            Avg: <span className="text-zinc-200">{summary.avg_actual_mw.toLocaleString()} MW</span>
          </p>
        </div>

        {/* Forecasted Wind */}
        <div className="glass-panel glass-panel-hover rounded-2xl p-5 border border-white/[0.06]">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-mono uppercase tracking-wider text-zinc-400">Day-Ahead Forecast</span>
            <div className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-400">
              <Wind className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-white font-mono tracking-tight">
            {summary.total_forecast_mwh.toLocaleString()} <span className="text-xs font-semibold text-emerald-400">MWh</span>
          </div>
          <p className="text-[11px] text-zinc-400 mt-1 font-mono">
            Avg: <span className="text-zinc-200">{summary.avg_forecast_mw.toLocaleString()} MW</span>
          </p>
        </div>

        {/* MAE */}
        <div className="glass-panel glass-panel-hover rounded-2xl p-5 border border-white/[0.06]">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-mono uppercase tracking-wider text-zinc-400">Mean Absolute Error</span>
            <div className="p-1.5 rounded-lg bg-indigo-500/10 text-indigo-400">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-white font-mono tracking-tight">
            {summary.mae_mw.toLocaleString()} <span className="text-xs font-semibold text-zinc-400">MW</span>
          </div>
          <p className="text-[11px] text-zinc-400 mt-1 font-mono">
            RMSE: <span className="text-zinc-200">{summary.rmse_mw.toLocaleString()} MW</span>
          </p>
        </div>

        {/* Mean Signed Error / Bias */}
        <div className="glass-panel glass-panel-hover rounded-2xl p-5 border border-white/[0.06]">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-mono uppercase tracking-wider text-zinc-400">Mean Signed Error</span>
            <div className={`p-1.5 rounded-lg ${isOver ? 'bg-amber-500/10 text-amber-400' : 'bg-sky-500/10 text-sky-400'}`}>
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <div className={`text-2xl font-bold font-mono tracking-tight ${isOver ? 'text-amber-400' : 'text-sky-300'}`}>
            {summary.mean_signed_error_mw > 0 ? `+${summary.mean_signed_error_mw.toLocaleString()}` : summary.mean_signed_error_mw.toLocaleString()} <span className="text-xs font-semibold text-zinc-400">MW</span>
          </div>
          <p className="text-[11px] text-zinc-400 mt-1 flex items-center font-mono">
            <CheckCircle2 className="w-3 h-3 text-emerald-400 mr-1" />
            <span>Coverage: <strong>{summary.matched_intervals} / {summary.total_intervals} (100%)</strong></span>
          </p>
        </div>
      </div>

      {/* Generation Chart */}
      <div className="glass-panel rounded-2xl p-6 border border-white/[0.06] shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-white/[0.06] gap-2">
          <div>
            <h2 className="text-sm font-bold text-white tracking-tight">
              30-Minute Generation Outlook: Actual vs Forecasted Wind ({replay.delivery_date})
            </h2>
            <p className="text-[11px] text-zinc-400 mt-0.5">
              Aligned across 48 half-hourly settlement periods using delivery startTime.
            </p>
          </div>

          <div className="flex items-center space-x-4 text-xs font-mono">
            <span className="flex items-center text-sky-400">
              <span className="w-2.5 h-0.5 bg-sky-400 inline-block mr-1.5" />
              Actual Wind (FUELHH)
            </span>
            <span className="flex items-center text-emerald-400">
              <span className="w-2.5 h-0.5 border-t border-dashed border-emerald-400 inline-block mr-1.5" />
              Day-Ahead Forecast (WINDFOR)
            </span>
          </div>
        </div>

        <div className="h-72 w-full mt-4">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ top: 8, right: 12, left: -10, bottom: 0 }}>
              <defs>
                <linearGradient id="overviewActualGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#38bdf8" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="#38bdf8" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="2 4" stroke="#ffffff0a" vertical={false} />
              <XAxis dataKey="time" stroke="#64748b" tick={{ fill: '#94a3b8', fontSize: 10, fontFamily: 'monospace' }} />
              <YAxis
                stroke="#64748b"
                tick={{ fill: '#94a3b8', fontSize: 10, fontFamily: 'monospace' }}
                tickFormatter={(val) => `${(val / 1000).toFixed(0)}k`}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#0c0e18',
                  borderColor: 'rgba(255,255,255,0.1)',
                  borderRadius: '0.75rem',
                  fontSize: '11px',
                  boxShadow: '0 10px 25px -5px rgba(0,0,0,0.8)'
                }}
                formatter={(val: any, name: string) => [
                  `${Number(val).toLocaleString()} MW`,
                  name === 'actual' ? 'Actual Wind (FUELHH)' : 'Day-Ahead Forecast (WINDFOR)'
                ]}
              />
              <Area
                type="monotone"
                dataKey="actual"
                stroke="#38bdf8"
                strokeWidth={2}
                fill="url(#overviewActualGrad)"
                name="actual"
              />
              <Line
                type="monotone"
                dataKey="forecast"
                stroke="#34d399"
                strokeWidth={1.75}
                strokeDasharray="3 3"
                dot={false}
                name="forecast"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Trader Snapshot Banner */}
        <div className="mt-4 p-3.5 rounded-xl bg-white/[0.02] border border-white/[0.06] text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center space-x-2">
            <span className="px-1.5 py-0.5 rounded bg-sky-500/20 text-sky-400 font-mono text-[10px] font-bold">
              DESK TAKEAWAY
            </span>
            <span className="text-zinc-300">
              {isOver ? (
                <>
                  Wind was <strong>over-forecasted by +{summary.mean_signed_error_mw.toLocaleString()} MW</strong> on average across this delivery day.
                </>
              ) : (
                <>
                  Wind output <strong>exceeded the day-ahead forecast by {Math.abs(summary.mean_signed_error_mw).toLocaleString()} MW</strong> on average.
                </>
              )}
            </span>
          </div>

          <button
            onClick={onNavigateToAnalytics}
            className="text-sky-400 hover:text-sky-300 font-medium text-xs shrink-0 flex items-center space-x-1 font-mono"
          >
            <span>Month-Wide Analytics</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
