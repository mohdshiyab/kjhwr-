import React, { useState } from 'react';
import {
  Wind,
  Clock,
  Layers,
  CheckCircle2,
  AlertTriangle,
  Download,
  Calendar,
  Eye,
  Sliders,
  TrendingUp,
  Zap,
  ArrowUpRight,
  Maximize2
} from 'lucide-react';
import {
  ComposedChart,
  Line,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
  Area,
  AreaChart
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
  const [chartViewMode, setChartViewMode] = useState<'split' | 'overlay'>('split');

  if (loading || !replay) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="glass-panel rounded-2xl p-6 h-32" />
        <div className="glass-panel rounded-2xl p-6 h-96" />
        <div className="glass-panel rounded-2xl p-6 h-80" />
      </div>
    );
  }

  const { summary, intervals, revisions } = replay;
  const isOver = summary.mean_signed_error_mw > 0;

  // Format data for chart
  const chartData = intervals.map((inv) => {
    const isOverInv = (inv.error_mw ?? 0) > 0;
    const isUnderInv = (inv.error_mw ?? 0) < 0;

    return {
      raw: inv,
      time: `${inv.hour.toString().padStart(2, '0')}:${inv.minute.toString().padStart(2, '0')}`,
      sp: inv.settlement_period,
      actual: inv.actual_mw,
      forecast: inv.forecast_mw,
      error: inv.error_mw ?? 0,
      overForecastError: isOverInv ? (inv.error_mw ?? 0) : 0,
      underForecastError: isUnderInv ? (inv.error_mw ?? 0) : 0,
    };
  });

  return (
    <div className="space-y-5">
      {/* Executive Decision Header & KPI Strip */}
      <div className="glass-panel rounded-2xl p-5 border border-white/[0.06] shadow-xl">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between pb-4 border-b border-white/[0.06] gap-4">
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-[10px] uppercase font-mono tracking-wider px-2 py-0.5 rounded-md bg-sky-500/10 text-sky-400 border border-sky-500/20 font-bold">
                Decision Snapshot Replay
              </span>
              <span className="text-zinc-500 text-xs font-mono">•</span>
              <span className="text-xs text-zinc-400 font-mono">
                Order Cutoff: <strong className="text-zinc-200">{replay.cutoff_time} GMT</strong> ({replay.decision_date})
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight mt-1">
              Delivery Day: <span className="text-sky-400">{replay.delivery_date}</span>
            </h1>
            <p className="text-xs text-zinc-400 mt-0.5">
              Reconstructs the exact information state the purchasing desk had at gate closure. Intraday publications after {replay.cutoff_time} GMT are strictly excluded.
            </p>
          </div>

          {/* Quick Metrics Bar */}
          <div className="flex flex-wrap items-center gap-3 font-mono text-xs">
            <div className="px-3 py-2 rounded-xl bg-white/[0.02] border border-white/[0.06]">
              <span className="text-zinc-500 text-[10px] block uppercase">Delivered Wind</span>
              <span className="text-sky-300 font-bold text-sm">
                {summary.total_actual_mwh.toLocaleString()} <span className="text-[10px] text-zinc-400 font-normal">MWh</span>
              </span>
            </div>

            <div className="px-3 py-2 rounded-xl bg-white/[0.02] border border-white/[0.06]">
              <span className="text-zinc-500 text-[10px] block uppercase">DA Forecast</span>
              <span className="text-emerald-300 font-bold text-sm">
                {summary.total_forecast_mwh.toLocaleString()} <span className="text-[10px] text-zinc-400 font-normal">MWh</span>
              </span>
            </div>

            <div className="px-3 py-2 rounded-xl bg-white/[0.02] border border-white/[0.06]">
              <span className="text-zinc-500 text-[10px] block uppercase">Mean Signed Error</span>
              <span className={`font-bold text-sm ${isOver ? 'text-amber-400' : 'text-sky-300'}`}>
                {summary.mean_signed_error_mw > 0 ? `+${summary.mean_signed_error_mw.toLocaleString()}` : summary.mean_signed_error_mw.toLocaleString()} <span className="text-[10px] text-zinc-400 font-normal">MW</span>
              </span>
            </div>

            <div className="px-3 py-2 rounded-xl bg-white/[0.02] border border-white/[0.06]">
              <span className="text-zinc-500 text-[10px] block uppercase">MAE</span>
              <span className="text-white font-bold text-sm">
                {summary.mae_mw.toLocaleString()} <span className="text-[10px] text-zinc-400 font-normal">MW</span>
              </span>
            </div>

            <a
              href={getExportCsvUrl(replay.decision_date, replay.cutoff_time)}
              download
              className="px-3 py-2 bg-sky-500/10 hover:bg-sky-500/20 text-sky-400 border border-sky-500/30 rounded-xl transition flex items-center space-x-1.5 font-sans font-medium"
              title="Download audit CSV snapshot"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export CSV</span>
            </a>
          </div>
        </div>

        {/* Chart View Control Strip */}
        <div className="flex items-center justify-between pt-4 pb-1 text-xs">
          <div className="flex items-center space-x-2">
            <span className="text-zinc-400 text-[11px] font-medium">Layout Mode:</span>
            <div className="inline-flex rounded-lg bg-white/[0.03] p-0.5 border border-white/[0.06]">
              <button
                onClick={() => setChartViewMode('split')}
                className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition ${
                  chartViewMode === 'split'
                    ? 'bg-sky-500/20 text-sky-300 border border-sky-500/30 shadow-sm'
                    : 'text-zinc-400 hover:text-white'
                }`}
              >
                Split Pane (Profile + Delta)
              </button>
              <button
                onClick={() => setChartViewMode('overlay')}
                className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition ${
                  chartViewMode === 'overlay'
                    ? 'bg-sky-500/20 text-sky-300 border border-sky-500/30 shadow-sm'
                    : 'text-zinc-400 hover:text-white'
                }`}
              >
                Combined Overlay
              </button>
            </div>
          </div>

          <div className="flex items-center space-x-4 text-[11px] font-mono">
            <span className="flex items-center text-sky-400">
              <span className="w-2.5 h-0.5 bg-sky-400 inline-block mr-1.5 shadow-[0_0_8px_rgba(56,189,248,0.6)]" />
              Actual Wind (MW)
            </span>
            <span className="flex items-center text-emerald-400">
              <span className="w-2.5 h-0.5 border-t border-dashed border-emerald-400 inline-block mr-1.5" />
              DA Forecast (MW)
            </span>
            <span className="flex items-center text-amber-400">
              <span className="w-2 h-2 bg-amber-500/80 inline-block mr-1 rounded-sm" />
              Over-Forecast (+Bias)
            </span>
            <span className="flex items-center text-rose-400">
              <span className="w-2 h-2 bg-rose-500/80 inline-block mr-1 rounded-sm" />
              Under-Forecast
            </span>
          </div>
        </div>

        {/* Primary Chart Area: Refined and Non-Crowded */}
        {chartViewMode === 'split' ? (
          <div className="space-y-2 mt-2">
            {/* Upper Pane: Generation Curves */}
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                  data={chartData}
                  onClick={(e) => {
                    if (e && e.activePayload && e.activePayload[0]) {
                      setSelectedInterval(e.activePayload[0].payload.raw);
                    }
                  }}
                  margin={{ top: 8, right: 12, left: -10, bottom: 0 }}
                >
                  <defs>
                    <linearGradient id="actualGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#38bdf8" stopOpacity={0.25} />
                      <stop offset="95%" stopColor="#38bdf8" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="2 4" stroke="#ffffff0a" vertical={false} />
                  <XAxis dataKey="time" stroke="#475569" tick={false} axisLine={{ stroke: '#ffffff0f' }} />
                  <YAxis
                    stroke="#64748b"
                    tick={{ fill: '#94a3b8', fontSize: 10, fontFamily: 'monospace' }}
                    tickFormatter={(val) => `${(val / 1000).toFixed(0)}k`}
                    axisLine={{ stroke: '#ffffff0f' }}
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
                    labelFormatter={(lbl) => `Settlement Interval ${lbl} UTC`}
                  />
                  <Area
                    type="monotone"
                    dataKey="actual"
                    stroke="#38bdf8"
                    strokeWidth={2}
                    fill="url(#actualGradient)"
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

            {/* Lower Pane: Forecast Error Delta Bar Chart (Clean & Subdued) */}
            <div className="h-32 w-full pt-1 border-t border-white/[0.04]">
              <div className="flex justify-between text-[10px] text-zinc-500 font-mono mb-1 px-1">
                <span>Forecast Error Delta (MW) = Forecast - Actual</span>
                <span>Click interval to inspect details below</span>
              </div>
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart
                  data={chartData}
                  onClick={(e) => {
                    if (e && e.activePayload && e.activePayload[0]) {
                      setSelectedInterval(e.activePayload[0].payload.raw);
                    }
                  }}
                  margin={{ top: 0, right: 12, left: -10, bottom: 0 }}
                >
                  <CartesianGrid strokeDasharray="2 4" stroke="#ffffff0a" vertical={false} />
                  <XAxis
                    dataKey="time"
                    stroke="#64748b"
                    tick={{ fill: '#94a3b8', fontSize: 9, fontFamily: 'monospace' }}
                    axisLine={{ stroke: '#ffffff0f' }}
                  />
                  <YAxis
                    stroke="#64748b"
                    tick={{ fill: '#94a3b8', fontSize: 9, fontFamily: 'monospace' }}
                    tickFormatter={(val) => `${val > 0 ? '+' : ''}${(val / 1000).toFixed(1)}k`}
                    axisLine={{ stroke: '#ffffff0f' }}
                  />
                  <ReferenceLine y={0} stroke="#ffffff20" strokeWidth={1} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#0c0e18',
                      borderColor: 'rgba(255,255,255,0.1)',
                      borderRadius: '0.75rem',
                      fontSize: '11px'
                    }}
                    formatter={(val: any, name: string) => [
                      `${val > 0 ? '+' : ''}${Number(val).toLocaleString()} MW`,
                      name === 'overForecastError' ? 'Over-Forecast (+Bias)' : 'Under-Forecast'
                    ]}
                  />
                  <Bar
                    dataKey="overForecastError"
                    fill="#f59e0b"
                    opacity={0.7}
                    radius={[2, 2, 0, 0]}
                    name="overForecastError"
                  />
                  <Bar
                    dataKey="underForecastError"
                    fill="#f43f5e"
                    opacity={0.7}
                    radius={[0, 0, 2, 2]}
                    name="underForecastError"
                  />
                </ComposedChart>
              </ResponsiveContainer>
            </div>
          </div>
        ) : (
          /* Combined View Mode */
          <div className="h-80 w-full mt-2">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart
                data={chartData}
                onClick={(e) => {
                  if (e && e.activePayload && e.activePayload[0]) {
                    setSelectedInterval(e.activePayload[0].payload.raw);
                  }
                }}
                margin={{ top: 8, right: 12, left: -10, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="2 4" stroke="#ffffff0a" />
                <XAxis dataKey="time" stroke="#64748b" tick={{ fill: '#94a3b8', fontSize: 10, fontFamily: 'monospace' }} />
                <YAxis
                  yAxisId="mw"
                  stroke="#64748b"
                  tick={{ fill: '#94a3b8', fontSize: 10, fontFamily: 'monospace' }}
                  tickFormatter={(val) => `${(val / 1000).toFixed(0)}k`}
                />
                <YAxis
                  yAxisId="err"
                  orientation="right"
                  stroke="#475569"
                  tick={{ fill: '#64748b', fontSize: 9, fontFamily: 'monospace' }}
                  tickFormatter={(val) => `${val > 0 ? '+' : ''}${(val / 1000).toFixed(1)}k`}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0c0e18',
                    borderColor: 'rgba(255,255,255,0.1)',
                    borderRadius: '0.75rem',
                    fontSize: '11px'
                  }}
                />
                <Bar yAxisId="err" dataKey="overForecastError" fill="#f59e0b" opacity={0.25} />
                <Bar yAxisId="err" dataKey="underForecastError" fill="#f43f5e" opacity={0.25} />
                <Line yAxisId="mw" type="monotone" dataKey="actual" stroke="#38bdf8" strokeWidth={2.25} dot={false} />
                <Line yAxisId="mw" type="monotone" dataKey="forecast" stroke="#34d399" strokeWidth={1.75} strokeDasharray="3 3" dot={false} />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>

      {/* Selected Interval Detail Card (Appears cleanly below chart on click) */}
      {selectedInterval && (
        <div className="glass-panel rounded-2xl p-4 border border-sky-500/30 shadow-lg relative animate-in fade-in slide-in-from-top-1 duration-200">
          <div className="flex items-center justify-between pb-3 border-b border-white/[0.06]">
            <div className="flex items-center space-x-2">
              <span className="p-1 rounded bg-sky-500/20 text-sky-400 font-mono text-[10px] font-bold">
                SP {selectedInterval.settlement_period}
              </span>
              <span className="text-xs font-semibold text-white">
                Interval Inspector: {selectedInterval.start_time.replace('T', ' ').replace('Z', ' UTC')}
              </span>
            </div>
            <button
              onClick={() => setSelectedInterval(null)}
              className="text-xs text-zinc-400 hover:text-white px-2 py-0.5 rounded bg-white/[0.04]"
            >
              ✕ Dismiss
            </button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-3 font-mono text-xs">
            <div className="p-2.5 rounded-xl bg-white/[0.02] border border-white/[0.04]">
              <span className="text-zinc-500 text-[10px] uppercase block">Delivered Wind</span>
              <span className="text-sky-300 font-bold text-sm">
                {selectedInterval.actual_mw?.toLocaleString() ?? 'N/A'} MW
              </span>
            </div>

            <div className="p-2.5 rounded-xl bg-white/[0.02] border border-white/[0.04]">
              <span className="text-zinc-500 text-[10px] uppercase block">DA Forecast</span>
              <span className="text-emerald-300 font-bold text-sm">
                {selectedInterval.forecast_mw?.toLocaleString() ?? 'N/A'} MW
              </span>
            </div>

            <div className="p-2.5 rounded-xl bg-white/[0.02] border border-white/[0.04]">
              <span className="text-zinc-500 text-[10px] uppercase block">Forecast Error</span>
              <span className={`font-bold text-sm ${(selectedInterval.error_mw ?? 0) > 0 ? 'text-amber-400' : 'text-rose-400'}`}>
                {selectedInterval.error_mw !== null
                  ? `${(selectedInterval.error_mw ?? 0) > 0 ? '+' : ''}${selectedInterval.error_mw?.toLocaleString()} MW`
                  : 'N/A'}
              </span>
            </div>

            <div className="p-2.5 rounded-xl bg-white/[0.02] border border-white/[0.04]">
              <span className="text-zinc-500 text-[10px] uppercase block">Forecast Publication</span>
              <span className="text-zinc-300 text-xs truncate block mt-0.5">
                {selectedInterval.forecast_publish_time?.replace('T', ' ').replace('Z', '') ?? 'N/A'}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Decision Timeline: The Critical Explainability Feature */}
      <DecisionTimeline
        decisionDate={replay.decision_date}
        deliveryDate={replay.delivery_date}
        cutoffTime={replay.cutoff_time}
        cutoffTimestamp={replay.cutoff_timestamp}
        revisions={revisions}
      />

      {/* Full 48 Settlement Periods Audit Table */}
      <div className="glass-panel rounded-2xl p-5 border border-white/[0.06] shadow-xl">
        <div className="flex items-center justify-between pb-3 border-b border-white/[0.06]">
          <div>
            <h3 className="text-sm font-bold text-white flex items-center space-x-2">
              <Layers className="w-4 h-4 text-sky-400" />
              <span>Interval Audit Table (48 Half-Hour Settlement Periods)</span>
            </h3>
            <p className="text-[11px] text-zinc-400 mt-0.5">
              Target delivery start time alignment between Elexon FUELHH and WINDFOR streams.
            </p>
          </div>
          <span className="text-[11px] font-mono text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1 rounded-lg">
            Coverage: {summary.matched_intervals} / {summary.total_intervals} (100%)
          </span>
        </div>

        <div className="overflow-x-auto max-h-64 overflow-y-auto rounded-xl border border-white/[0.06] mt-3">
          <table className="w-full text-xs text-left">
            <thead className="bg-[#0b0d17] text-zinc-400 uppercase font-mono text-[10px] sticky top-0 border-b border-white/[0.06]">
              <tr>
                <th className="py-2.5 px-3">SP</th>
                <th className="py-2.5 px-3">Start Time (UTC)</th>
                <th className="py-2.5 px-3 text-right">Forecast (MW)</th>
                <th className="py-2.5 px-3 text-right">Actual (MW)</th>
                <th className="py-2.5 px-3 text-right">Error (MW)</th>
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
                    <td className="py-2 px-3 font-bold text-zinc-300">SP {inv.settlement_period}</td>
                    <td className="py-2 px-3 text-zinc-400">{inv.start_time.slice(11, 16)} UTC</td>
                    <td className="py-2 px-3 text-right font-medium text-emerald-300">
                      {inv.forecast_mw?.toLocaleString() ?? '-'}
                    </td>
                    <td className="py-2 px-3 text-right font-medium text-sky-300">
                      {inv.actual_mw?.toLocaleString() ?? '-'}
                    </td>
                    <td className={`py-2 px-3 text-right font-bold ${isOverInv ? 'text-amber-400' : 'text-rose-400'}`}>
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
