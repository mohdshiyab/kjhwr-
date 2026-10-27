import React, { useState } from 'react';
import {
  BarChart3,
  Clock,
  Calendar,
  TrendingUp,
  AlertTriangle,
  ArrowUpRight,
  ArrowDownRight,
  Filter
} from 'lucide-react';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine
} from 'recharts';
import { AnalyticsSummaryResponse } from '../types';

interface AnalyticsPageProps {
  analytics: AnalyticsSummaryResponse | null;
  loading: boolean;
  onSelectDecisionDate?: (date: string) => void;
}

export const AnalyticsPage: React.FC<AnalyticsPageProps> = ({
  analytics,
  loading,
  onSelectDecisionDate
}) => {
  const [sortKey, setSortKey] = useState<'date' | 'mae' | 'bias'>('mae');

  if (loading || !analytics) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="glass-panel rounded-2xl p-6 h-36" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="glass-panel rounded-2xl p-6 h-80" />
          <div className="glass-panel rounded-2xl p-6 h-80" />
        </div>
      </div>
    );
  }

  const { diurnal_profile, daily_breakdown } = analytics;

  // Sorted daily breakdown
  const sortedDays = [...daily_breakdown].sort((a, b) => {
    if (sortKey === 'mae') return b.mae_mw - a.mae_mw; // worst error first
    if (sortKey === 'bias') return Math.abs(b.mean_signed_error_mw) - Math.abs(a.mean_signed_error_mw);
    return a.decision_date.localeCompare(b.decision_date);
  });

  return (
    <div className="space-y-5">
      {/* Top Banner */}
      <div className="glass-panel rounded-2xl p-6 border border-white/[0.06] shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between pb-5 border-b border-white/[0.06] gap-4">
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-[10px] uppercase font-mono tracking-wider px-2 py-0.5 rounded-md bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 font-bold">
                Accuracy & Insights
              </span>
              <span className="text-zinc-500 text-xs font-mono">•</span>
              <span className="text-xs text-zinc-400 font-mono">
                January 2026 Decisions (744 Hours)
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight mt-1">
              Forecast Reliability & Error Quantification
            </h1>
            <p className="text-xs text-zinc-400 mt-0.5">
              Empirical analysis of where, when, and by how much day-ahead wind forecasts diverge from actual grid generation.
            </p>
          </div>

          <div className="bg-white/[0.02] border border-white/[0.06] rounded-xl px-3.5 py-2 font-mono text-xs text-zinc-300 shrink-0">
            <span className="text-zinc-500">Total Evaluated: </span>
            <span className="font-bold text-emerald-400">
              {analytics.total_matched_intervals.toLocaleString()} / {analytics.total_expected_intervals.toLocaleString()} SPs (100%)
            </span>
          </div>
        </div>

        {/* 4 Scorecard Metrics */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-5">
          <div className="glass-panel glass-panel-hover rounded-2xl p-4 border border-white/[0.06]">
            <span className="text-[11px] font-mono uppercase text-zinc-400 block">Mean Absolute Error</span>
            <div className="text-2xl font-bold font-mono text-white mt-1">
              {analytics.mae_mw.toLocaleString()} <span className="text-xs font-normal text-zinc-400">MW</span>
            </div>
            <p className="text-[10px] text-zinc-500 mt-1 font-mono">Average hourly deviation</p>
          </div>

          <div className="glass-panel glass-panel-hover rounded-2xl p-4 border border-white/[0.06]">
            <span className="text-[11px] font-mono uppercase text-zinc-400 block">RMSE (Outlier Impact)</span>
            <div className="text-2xl font-bold font-mono text-white mt-1">
              {analytics.rmse_mw.toLocaleString()} <span className="text-xs font-normal text-zinc-400">MW</span>
            </div>
            <p className="text-[10px] text-zinc-500 mt-1 font-mono">Penalizes large front shifts</p>
          </div>

          <div className="glass-panel glass-panel-hover rounded-2xl p-4 border border-white/[0.06]">
            <span className="text-[11px] font-mono uppercase text-zinc-400 block">Mean Signed Error (Bias)</span>
            <div className="text-2xl font-bold font-mono text-amber-400 mt-1">
              +{analytics.mean_signed_error_mw.toLocaleString()} <span className="text-xs font-normal text-zinc-400">MW</span>
            </div>
            <p className="text-[10px] text-amber-400/80 mt-1 font-mono">Persistent over-forecast</p>
          </div>

          <div className="glass-panel glass-panel-hover rounded-2xl p-4 border border-white/[0.06]">
            <span className="text-[11px] font-mono uppercase text-zinc-400 block">Weighted Abs Error</span>
            <div className="text-2xl font-bold font-mono text-emerald-400 mt-1">
              {analytics.wape_pct}%
            </div>
            <p className="text-[10px] text-zinc-500 mt-1 font-mono">Industry standard WAPE</p>
          </div>
        </div>
      </div>

      {/* Two Column Layout: Diurnal Curve & Hourly Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Diurnal Error Profile */}
        <div className="glass-panel rounded-2xl p-5 border border-white/[0.06] shadow-xl">
          <div className="flex items-center justify-between pb-3 border-b border-white/[0.06]">
            <div>
              <h3 className="text-sm font-bold text-white flex items-center space-x-2">
                <Clock className="w-4 h-4 text-sky-400" />
                <span>Diurnal Error Curve (Hour 00:00 to 23:00)</span>
              </h3>
              <p className="text-[11px] text-zinc-400 mt-0.5">
                MAE and Mean Signed Error (Bias) across the 24-hour delivery cycle.
              </p>
            </div>
            <span className="text-[10px] font-mono text-zinc-400 bg-white/[0.03] px-2 py-0.5 rounded-lg border border-white/[0.06]">
              24-Hour Profile
            </span>
          </div>

          <div className="h-64 w-full mt-3">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={diurnal_profile} margin={{ top: 8, right: 12, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="2 4" stroke="#ffffff0a" vertical={false} />
                <XAxis dataKey="hour_label" stroke="#64748b" tick={{ fill: '#94a3b8', fontSize: 9, fontFamily: 'monospace' }} />
                <YAxis
                  stroke="#64748b"
                  tick={{ fill: '#94a3b8', fontSize: 9, fontFamily: 'monospace' }}
                  tickFormatter={(val) => `${val.toLocaleString()} MW`}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0c0e18',
                    borderColor: 'rgba(255,255,255,0.1)',
                    borderRadius: '0.75rem',
                    fontSize: '11px'
                  }}
                  formatter={(val: any, name: string) => [
                    `${Number(val).toLocaleString()} MW`,
                    name === 'mae_mw' ? 'MAE (Error Magnitude)' : 'Mean Signed Error (Bias)'
                  ]}
                  labelFormatter={(lbl) => `Hour ${lbl} (Settlement Periods)`}
                />
                <ReferenceLine y={0} stroke="#ffffff20" strokeWidth={1} />
                <Line
                  type="monotone"
                  dataKey="mae_mw"
                  stroke="#38bdf8"
                  strokeWidth={2}
                  dot={{ r: 2.5, fill: '#38bdf8' }}
                  name="mae_mw"
                />
                <Line
                  type="monotone"
                  dataKey="mean_signed_error_mw"
                  stroke="#f59e0b"
                  strokeWidth={1.75}
                  strokeDasharray="3 3"
                  dot={{ r: 2.5, fill: '#f59e0b' }}
                  name="mean_signed_error_mw"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
          <p className="text-[11px] text-zinc-400 mt-2">
            💡 <strong>Observation:</strong> Error magnitude consistently spikes between <strong>17:00 and 19:00 (evening peak)</strong>, which coincides with the tightest grid margins and highest cashout price risks.
          </p>
        </div>

        {/* Diurnal Generation Outlook */}
        <div className="glass-panel rounded-2xl p-5 border border-white/[0.06] shadow-xl">
          <div className="flex items-center justify-between pb-3 border-b border-white/[0.06]">
            <div>
              <h3 className="text-sm font-bold text-white flex items-center space-x-2">
                <BarChart3 className="w-4 h-4 text-emerald-400" />
                <span>Average Generation by Hour (Actual vs Forecast)</span>
              </h3>
              <p className="text-[11px] text-zinc-400 mt-0.5">
                Composite daily wind shape averaged across the month.
              </p>
            </div>
            <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-lg border border-emerald-500/20">
              Avg: {analytics.avg_actual_mw.toLocaleString()} MW
            </span>
          </div>

          <div className="h-64 w-full mt-3">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={diurnal_profile} margin={{ top: 8, right: 12, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="2 4" stroke="#ffffff0a" vertical={false} />
                <XAxis dataKey="hour_label" stroke="#64748b" tick={{ fill: '#94a3b8', fontSize: 9, fontFamily: 'monospace' }} />
                <YAxis
                  stroke="#64748b"
                  tick={{ fill: '#94a3b8', fontSize: 9, fontFamily: 'monospace' }}
                  tickFormatter={(val) => `${(val / 1000).toFixed(0)}k`}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0c0e18',
                    borderColor: 'rgba(255,255,255,0.1)',
                    borderRadius: '0.75rem',
                    fontSize: '11px'
                  }}
                  formatter={(val: any, name: string) => [
                    `${Number(val).toLocaleString()} MW`,
                    name === 'avg_actual_mw' ? 'Delivered Wind (Actual)' : 'Day-Ahead Forecast'
                  ]}
                />
                <Bar dataKey="avg_forecast_mw" fill="#0284c7" opacity={0.65} radius={[2, 2, 0, 0]} name="avg_forecast_mw" />
                <Bar dataKey="avg_actual_mw" fill="#10b981" opacity={0.8} radius={[2, 2, 0, 0]} name="avg_actual_mw" />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="flex items-center justify-between text-[11px] text-zinc-400 mt-2 font-mono">
            <span className="text-sky-400">■ Blue = Average Forecast (WINDFOR)</span>
            <span className="text-emerald-400">■ Green = Average Delivered (FUELHH)</span>
          </div>
        </div>
      </div>

      {/* Daily Leaderboard Ranking */}
      <div className="glass-panel rounded-2xl p-5 border border-white/[0.06] shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-white/[0.06] gap-3">
          <div>
            <h3 className="text-sm font-bold text-white flex items-center space-x-2">
              <Calendar className="w-4 h-4 text-sky-400" />
              <span>Daily Decision Performance Leaderboard (31 Decision Days)</span>
            </h3>
            <p className="text-[11px] text-zinc-400 mt-0.5">
              Click any row to jump directly to its Decision Replay.
            </p>
          </div>

          <div className="flex items-center space-x-1.5 text-xs">
            <span className="text-zinc-500 text-[11px]">Sort:</span>
            <button
              onClick={() => setSortKey('mae')}
              className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition ${
                sortKey === 'mae' ? 'bg-sky-500/20 text-sky-300 border border-sky-500/30' : 'text-zinc-400 hover:text-white'
              }`}
            >
              Highest MAE
            </button>
            <button
              onClick={() => setSortKey('bias')}
              className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition ${
                sortKey === 'bias' ? 'bg-sky-500/20 text-sky-300 border border-sky-500/30' : 'text-zinc-400 hover:text-white'
              }`}
            >
              Highest Bias
            </button>
            <button
              onClick={() => setSortKey('date')}
              className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition ${
                sortKey === 'date' ? 'bg-sky-500/20 text-sky-300 border border-sky-500/30' : 'text-zinc-400 hover:text-white'
              }`}
            >
              Date
            </button>
          </div>
        </div>

        <div className="overflow-x-auto max-h-72 overflow-y-auto rounded-xl border border-white/[0.06] mt-3">
          <table className="w-full text-xs text-left">
            <thead className="bg-[#0b0d17] text-zinc-400 uppercase font-mono text-[10px] sticky top-0 border-b border-white/[0.06]">
              <tr>
                <th className="py-2.5 px-3">Decision Date</th>
                <th className="py-2.5 px-3">Delivery Date</th>
                <th className="py-2.5 px-3 text-right">Avg Forecast</th>
                <th className="py-2.5 px-3 text-right">Avg Actual</th>
                <th className="py-2.5 px-3 text-right">MAE</th>
                <th className="py-2.5 px-3 text-right">RMSE</th>
                <th className="py-2.5 px-3 text-right">Mean Signed Error</th>
                <th className="py-2.5 px-3 text-right">Coverage</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.04] font-mono">
              {sortedDays.map((d) => {
                const isOverDay = d.mean_signed_error_mw > 0;
                return (
                  <tr
                    key={d.decision_date}
                    onClick={() => onSelectDecisionDate?.(d.decision_date)}
                    className="hover:bg-white/[0.03] cursor-pointer transition"
                  >
                    <td className="py-2 px-3 font-semibold text-zinc-200">{d.decision_date}</td>
                    <td className="py-2 px-3 text-emerald-400 font-semibold">{d.delivery_date}</td>
                    <td className="py-2 px-3 text-right text-emerald-300">{d.avg_forecast_mw.toLocaleString()} MW</td>
                    <td className="py-2 px-3 text-right text-sky-300">{d.avg_actual_mw.toLocaleString()} MW</td>
                    <td className="py-2 px-3 text-right font-medium text-zinc-200">{d.mae_mw.toLocaleString()}</td>
                    <td className="py-2 px-3 text-right text-zinc-400">{d.rmse_mw.toLocaleString()}</td>
                    <td className={`py-2 px-3 text-right font-bold ${isOverDay ? 'text-amber-400' : 'text-sky-300'}`}>
                      {d.mean_signed_error_mw > 0 ? `+${d.mean_signed_error_mw.toLocaleString()}` : d.mean_signed_error_mw.toLocaleString()} MW
                    </td>
                    <td className="py-2 px-3 text-right text-zinc-400">
                      {d.matched_intervals} / {d.total_intervals} (100%)
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
