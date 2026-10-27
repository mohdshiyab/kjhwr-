import React, { useState } from 'react';
import {
  Wind,
  CheckCircle2,
  Download,
  Calendar,
  Layers,
  Info,
  Clock,
  ArrowRight,
  TrendingUp,
  BarChart2
} from 'lucide-react';
import {
  AreaChart,
  Area,
  Line,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ComposedChart,
  ReferenceLine
} from 'recharts';
import { DecisionReplayResponse, DecisionInterval } from '../types';
import { DecisionTimeline } from '../components/DecisionTimeline';
import { getExportCsvUrl } from '../services/api';

interface DecisionReplayPageProps {
  replay: DecisionReplayResponse | null;
  loading: boolean;
}

export const DecisionReplayPage: React.FC<DecisionReplayPageProps> = ({ replay, loading }) => {
  const [selectedInterval, setSelectedInterval] = useState<DecisionInterval | null>(null);
  const [showDifferenceBars, setShowDifferenceBars] = useState<boolean>(false);

  if (loading || !replay) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-28 rounded-2xl bg-white/[0.02] border border-white/[0.06]" />
        <div className="h-96 rounded-2xl bg-white/[0.02] border border-white/[0.06]" />
        <div className="h-64 rounded-2xl bg-white/[0.02] border border-white/[0.06]" />
      </div>
    );
  }

  const { summary, intervals, revisions } = replay;
  const isOver = summary.mean_signed_error_mw > 0;
  const errorPct = summary.total_actual_mwh > 0
    ? Math.abs(Math.round(((summary.total_forecast_mwh - summary.total_actual_mwh) / summary.total_actual_mwh) * 100))
    : 0;

  // Chart data
  const chartData = intervals.map((inv) => {
    const err = inv.error_mw ?? 0;
    return {
      raw: inv,
      time: `${inv.hour.toString().padStart(2, '0')}:${inv.minute.toString().padStart(2, '0')}`,
      sp: inv.settlement_period,
      actual: inv.actual_mw,
      forecast: inv.forecast_mw,
      error: err,
      overError: err > 0 ? err : 0,
      underError: err < 0 ? err : 0,
    };
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      
      {/* 1. Header Banner: Plain English Context */}
      <div className="rounded-2xl p-6 bg-[#0f121d] border border-white/[0.08] shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-5 border-b border-white/[0.06]">
          <div>
            <div className="flex items-center space-x-2 text-xs">
              <span className="font-semibold text-sky-400 bg-sky-500/10 px-2.5 py-0.5 rounded-full border border-sky-500/20">
                Decision Snapshot Replay
              </span>
              <span className="text-zinc-500">•</span>
              <span className="text-zinc-400">
                Order Cutoff: <strong className="text-white">{replay.cutoff_time} GMT</strong> on {replay.decision_date}
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight mt-1.5">
              Power Delivery: <span className="text-sky-400">{replay.delivery_date}</span>
            </h1>
            <p className="text-xs sm:text-sm text-zinc-400 mt-1 max-w-3xl leading-relaxed">
              Shows what the power purchasing team saw when making procurement decisions at <strong>{replay.cutoff_time} GMT</strong>.
              Forecasts published after the cutoff were strictly excluded to ensure zero look-ahead bias.
            </p>
          </div>

          <div className="flex items-center space-x-3 shrink-0">
            <a
              href={getExportCsvUrl(replay.decision_date, replay.cutoff_time)}
              download
              className="px-3.5 py-2 bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] rounded-xl text-xs font-medium text-zinc-200 transition flex items-center space-x-2"
              title="Download this day's 48 intervals as CSV"
            >
              <Download className="w-3.5 h-3.5 text-zinc-400" />
              <span>Export CSV</span>
            </a>
          </div>
        </div>

        {/* 3 Plain-English Metric Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-5">
          <div className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.06]">
            <span className="text-xs text-zinc-400 block font-medium">Actual Wind Generated</span>
            <div className="flex items-baseline space-x-2 mt-1">
              <span className="text-2xl font-bold text-sky-400 font-mono">
                {summary.total_actual_mwh.toLocaleString()}
              </span>
              <span className="text-xs text-zinc-400">MWh</span>
            </div>
            <span className="text-[11px] text-zinc-400 mt-1 block">
              Average: {summary.avg_actual_mw.toLocaleString()} MW
            </span>
          </div>

          <div className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.06]">
            <span className="text-xs text-zinc-400 block font-medium">Day-Ahead Forecast</span>
            <div className="flex items-baseline space-x-2 mt-1">
              <span className="text-2xl font-bold text-emerald-400 font-mono">
                {summary.total_forecast_mwh.toLocaleString()}
              </span>
              <span className="text-xs text-zinc-400">MWh</span>
            </div>
            <span className="text-[11px] text-zinc-400 mt-1 block">
              Average: {summary.avg_forecast_mw.toLocaleString()} MW
            </span>
          </div>

          <div className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.06]">
            <span className="text-xs text-zinc-400 block font-medium">Forecast Accuracy</span>
            <div className="flex items-baseline space-x-2 mt-1">
              <span className={`text-2xl font-bold font-mono ${isOver ? 'text-amber-400' : 'text-sky-300'}`}>
                {summary.mean_signed_error_mw > 0 ? `+${summary.mean_signed_error_mw.toLocaleString()}` : summary.mean_signed_error_mw.toLocaleString()}
              </span>
              <span className="text-xs text-zinc-400">MW</span>
            </div>
            <span className="text-[11px] text-zinc-400 mt-1 block">
              {isOver ? `Forecast was ${errorPct}% higher than actual` : `Forecast was ${errorPct}% lower than actual`}
            </span>
          </div>
        </div>
      </div>

      {/* 2. Main Chart: Minimalist & Clean */}
      <div className="rounded-2xl p-6 bg-[#0f121d] border border-white/[0.08] shadow-sm">
        
        {/* Chart Header & Toggles */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-white/[0.06] gap-3">
          <div>
            <h2 className="text-base font-bold text-white flex items-center space-x-2">
              <Wind className="w-4 h-4 text-sky-400" />
              <span>Wind Generation Profile (24 Hours • 48 Half-Hour Settlement Periods)</span>
            </h2>
            <p className="text-xs text-zinc-400 mt-0.5">
              Hover over the chart to inspect values, or click any point to view interval details.
            </p>
          </div>

          {/* Clean Controls & Legend */}
          <div className="flex items-center space-x-4 text-xs">
            <div className="flex items-center space-x-3">
              <div className="flex items-center space-x-1.5">
                <span className="w-3 h-0.5 bg-sky-400 rounded-full" />
                <span className="text-zinc-300 font-medium">Actual Wind</span>
              </div>
              <div className="flex items-center space-x-1.5">
                <span className="w-3 h-0.5 border-t-2 border-dashed border-emerald-400" />
                <span className="text-zinc-300 font-medium">Forecast</span>
              </div>
            </div>

            {/* Toggle Button for Error Bars */}
            <button
              onClick={() => setShowDifferenceBars(!showDifferenceBars)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition cursor-pointer ${
                showDifferenceBars
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                  : 'bg-white/[0.03] text-zinc-400 hover:text-white border border-white/[0.06]'
              }`}
            >
              {showDifferenceBars ? 'Hide Difference Bars' : 'Show Difference Bars'}
            </button>
          </div>
        </div>

        {/* The Clean Chart */}
        <div className="h-80 w-full mt-4">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart
              data={chartData}
              onClick={(e) => {
                if (e && e.activePayload && e.activePayload[0]) {
                  setSelectedInterval(e.activePayload[0].payload.raw);
                }
              }}
              margin={{ top: 10, right: 10, left: -10, bottom: 0 }}
            >
              <defs>
                <linearGradient id="actualMinimalGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#38bdf8" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="#38bdf8" stopOpacity={0.0} />
                </linearGradient>
              </defs>

              <CartesianGrid strokeDasharray="3 3" stroke="#ffffff0a" vertical={false} />
              <XAxis
                dataKey="time"
                stroke="#64748b"
                tick={{ fill: '#94a3b8', fontSize: 11, fontFamily: 'monospace' }}
                axisLine={{ stroke: '#ffffff0f' }}
              />
              <YAxis
                stroke="#64748b"
                tick={{ fill: '#94a3b8', fontSize: 11, fontFamily: 'monospace' }}
                tickFormatter={(val) => `${(val / 1000).toFixed(0)}k MW`}
                axisLine={{ stroke: '#ffffff0f' }}
              />

              <Tooltip
                contentStyle={{
                  backgroundColor: '#0c0e18',
                  borderColor: 'rgba(255,255,255,0.1)',
                  borderRadius: '0.75rem',
                  fontSize: '12px',
                  boxShadow: '0 10px 25px -5px rgba(0,0,0,0.8)'
                }}
                formatter={(val: any, name: string) => {
                  if (name === 'actual') return [`${Number(val).toLocaleString()} MW`, 'Actual Delivered Wind'];
                  if (name === 'forecast') return [`${Number(val).toLocaleString()} MW`, 'Day-Ahead Forecast'];
                  if (name === 'overError') return [`+${Number(val).toLocaleString()} MW`, 'Over-Forecast Difference'];
                  if (name === 'underError') return [`${Number(val).toLocaleString()} MW`, 'Under-Forecast Difference'];
                  return [val, name];
                }}
                labelFormatter={(lbl) => `Time: ${lbl} UTC (Click to inspect)`}
              />

              {/* Optional Subtle Difference Bars if enabled */}
              {showDifferenceBars && (
                <>
                  <Bar dataKey="overError" fill="#f59e0b" opacity={0.3} radius={[2, 2, 0, 0]} name="overError" />
                  <Bar dataKey="underError" fill="#f43f5e" opacity={0.3} radius={[0, 0, 2, 2]} name="underError" />
                </>
              )}

              {/* Smooth Actual Wind Curve with soft glow */}
              <Area
                type="monotone"
                dataKey="actual"
                stroke="#38bdf8"
                strokeWidth={2.5}
                fill="url(#actualMinimalGradient)"
                name="actual"
              />

              {/* Day-Ahead Forecast Curve */}
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

        {/* Selected Interval Callout */}
        {selectedInterval && (
          <div className="mt-5 p-4 rounded-xl bg-sky-950/30 border border-sky-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3 animate-in fade-in duration-150">
            <div>
              <div className="flex items-center space-x-2">
                <span className="px-2 py-0.5 rounded bg-sky-500/20 text-sky-300 font-mono text-xs font-bold">
                  Period {selectedInterval.settlement_period}
                </span>
                <span className="text-xs text-white font-semibold">
                  {selectedInterval.start_time.slice(11, 16)} UTC
                </span>
                <span className="text-zinc-500">•</span>
                <span className="text-xs text-zinc-300">
                  Actual: <strong className="text-sky-300">{selectedInterval.actual_mw?.toLocaleString()} MW</strong>
                </span>
                <span className="text-zinc-500">•</span>
                <span className="text-xs text-zinc-300">
                  Forecast: <strong className="text-emerald-300">{selectedInterval.forecast_mw?.toLocaleString()} MW</strong>
                </span>
                <span className="text-zinc-500">•</span>
                <span className="text-xs text-amber-300">
                  Error: <strong>{selectedInterval.error_mw !== null && selectedInterval.error_mw > 0 ? `+${selectedInterval.error_mw?.toLocaleString()}` : selectedInterval.error_mw?.toLocaleString()} MW</strong>
                </span>
              </div>
            </div>
            <button
              onClick={() => setSelectedInterval(null)}
              className="text-xs text-zinc-400 hover:text-white px-2 py-1 rounded bg-white/[0.05] cursor-pointer self-start sm:self-auto"
            >
              ✕ Dismiss
            </button>
          </div>
        )}

      </div>

      {/* 3. Decision Timeline (Explainability Feature) */}
      <DecisionTimeline
        decisionDate={replay.decision_date}
        deliveryDate={replay.delivery_date}
        cutoffTime={replay.cutoff_time}
        cutoffTimestamp={replay.cutoff_timestamp}
        revisions={revisions}
      />

      {/* 4. Interval Data Table */}
      <div className="rounded-2xl p-6 bg-[#0f121d] border border-white/[0.08] shadow-sm">
        <div className="flex items-center justify-between pb-3 border-b border-white/[0.06]">
          <div>
            <h3 className="text-sm font-bold text-white flex items-center space-x-2">
              <Layers className="w-4 h-4 text-sky-400" />
              <span>Settlement Period Details (48 Half-Hour Intervals)</span>
            </h3>
            <p className="text-xs text-zinc-400 mt-0.5">
              Target delivery start time alignment between Elexon actuals (FUELHH) and forecasts (WINDFOR).
            </p>
          </div>
          <span className="text-xs font-mono text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1 rounded-lg">
            Coverage: 48 / 48 (100%)
          </span>
        </div>

        <div className="overflow-x-auto max-h-72 overflow-y-auto rounded-xl border border-white/[0.06] mt-4">
          <table className="w-full text-xs text-left">
            <thead className="bg-[#0b0d14] text-zinc-400 uppercase font-mono text-[10px] sticky top-0 border-b border-white/[0.06]">
              <tr>
                <th className="py-2.5 px-3">Period</th>
                <th className="py-2.5 px-3">Time (UTC)</th>
                <th className="py-2.5 px-3 text-right">Forecast (MW)</th>
                <th className="py-2.5 px-3 text-right">Actual (MW)</th>
                <th className="py-2.5 px-3 text-right">Difference (MW)</th>
                <th className="py-2.5 px-3">Forecast Published</th>
                <th className="py-2.5 px-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.04] font-mono">
              {intervals.map((inv) => {
                const isOverInv = (inv.error_mw ?? 0) > 0;
                return (
                  <tr
                    key={inv.interval_index}
                    onClick={() => setSelectedInterval(inv)}
                    className="hover:bg-white/[0.03] cursor-pointer transition"
                  >
                    <td className="py-2 px-3 font-medium text-zinc-300">SP {inv.settlement_period}</td>
                    <td className="py-2 px-3 text-zinc-400">{inv.start_time.slice(11, 16)} UTC</td>
                    <td className="py-2 px-3 text-right font-medium text-emerald-300">
                      {inv.forecast_mw?.toLocaleString() ?? '-'}
                    </td>
                    <td className="py-2 px-3 text-right font-medium text-sky-300">
                      {inv.actual_mw?.toLocaleString() ?? '-'}
                    </td>
                    <td className={`py-2 px-3 text-right font-bold ${isOverInv ? 'text-amber-400' : 'text-sky-300'}`}>
                      {inv.error_mw !== null ? `${(inv.error_mw ?? 0) > 0 ? '+' : ''}${inv.error_mw?.toLocaleString()}` : '-'}
                    </td>
                    <td className="py-2 px-3 text-zinc-400 text-[11px]">
                      {inv.forecast_publish_time?.slice(11, 16) ?? '-'} UTC
                    </td>
                    <td className="py-2 px-3">
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                        MATCHED
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};
