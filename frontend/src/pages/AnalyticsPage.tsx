import React, { useState } from 'react';
import {
  BarChart3,
  Clock,
  Calendar,
  TrendingUp,
  AlertTriangle,
  ArrowUpRight,
  ArrowDownRight
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
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 h-40" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 h-80" />
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 h-80" />
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
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between pb-6 border-b border-slate-800 gap-4">
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-indigo-950/80 text-indigo-400 border border-indigo-800 font-mono">
                Screen 3 — Accuracy & Insights
              </span>
              <span className="text-xs text-slate-400">
                Reliability & Error Patterns Across January 2026 Decisions
              </span>
            </div>
            <h1 className="text-2xl font-extrabold text-white tracking-tight mt-1">
              Forecast Reliability & Error Quantification
            </h1>
            <p className="text-xs text-slate-400 mt-1">
              Analyzes where, when, and by how much wind forecasts diverge from actuals, helping traders set risk buffers.
            </p>
          </div>

          <div className="bg-slate-950/80 border border-slate-800 rounded-xl px-4 py-2 font-mono text-xs text-slate-300">
            <span>Overall Coverage: </span>
            <span className="font-bold text-emerald-400 font-mono">
              {analytics.total_matched_intervals} / {analytics.total_expected_intervals} ({analytics.coverage_pct}%)
            </span>
          </div>
        </div>

        {/* 4 Scorecard Metrics */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6">
          <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-800">
            <span className="text-xs text-slate-400 uppercase font-medium">Mean Absolute Error (MAE)</span>
            <div className="text-2xl font-bold font-mono text-white mt-1">
              {analytics.mae_mw.toLocaleString()} <span className="text-xs text-slate-400 font-normal">MW</span>
            </div>
            <p className="text-[10px] text-slate-500 mt-1">Average hourly error magnitude</p>
          </div>

          <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-800">
            <span className="text-xs text-slate-400 uppercase font-medium">Root Mean Square Error (RMSE)</span>
            <div className="text-2xl font-bold font-mono text-white mt-1">
              {analytics.rmse_mw.toLocaleString()} <span className="text-xs text-slate-400 font-normal">MW</span>
            </div>
            <p className="text-[10px] text-slate-500 mt-1">Penalizes large outlier errors</p>
          </div>

          <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-800">
            <span className="text-xs text-slate-400 uppercase font-medium">Mean Signed Error (Bias)</span>
            <div className="text-2xl font-bold font-mono text-amber-400 mt-1">
              +{analytics.mean_signed_error_mw.toLocaleString()} <span className="text-xs text-slate-400 font-normal">MW</span>
            </div>
            <p className="text-[10px] text-amber-400/80 mt-1">Systematic over-prediction</p>
          </div>

          <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-800">
            <span className="text-xs text-slate-400 uppercase font-medium">Weighted Abs Error (WAPE)</span>
            <div className="text-2xl font-bold font-mono text-emerald-400 mt-1">
              {analytics.wape_pct}%
            </div>
            <p className="text-[10px] text-slate-500 mt-1">Normalized relative to wind output</p>
          </div>
        </div>
      </div>

      {/* Two Column Section: Diurnal Profile & Hourly Generation Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Diurnal Error Profile */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
          <div className="flex items-center justify-between pb-4 border-b border-slate-800">
            <div>
              <h3 className="text-sm font-bold text-white flex items-center space-x-2">
                <Clock className="w-4 h-4 text-sky-400" />
                <span>Diurnal Error Curve by Hour of Day</span>
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                MAE and Mean Signed Error (Bias) across hours 00:00 to 23:00.
              </p>
            </div>
            <span className="text-xs font-mono text-slate-400 bg-slate-800 px-2.5 py-1 rounded-lg">
              24-Hour Cycle
            </span>
          </div>

          <div className="h-72 w-full mt-4">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={diurnal_profile} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="hour_label" stroke="#64748b" tick={{ fill: '#94a3b8', fontSize: 11 }} />
                <YAxis
                  stroke="#64748b"
                  tick={{ fill: '#94a3b8', fontSize: 11 }}
                  tickFormatter={(val) => `${val.toLocaleString()} MW`}
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
                    name === 'mae_mw' ? 'MAE (Error Magnitude)' : 'Mean Signed Error (Bias)'
                  ]}
                  labelFormatter={(lbl) => `Hour ${lbl} (Settlement Periods)`}
                />
                <ReferenceLine y={0} stroke="#475569" strokeDasharray="2 2" />
                <Line
                  type="monotone"
                  dataKey="mae_mw"
                  stroke="#38bdf8"
                  strokeWidth={2.5}
                  dot={{ r: 3, fill: '#38bdf8' }}
                  name="mae_mw"
                />
                <Line
                  type="monotone"
                  dataKey="mean_signed_error_mw"
                  stroke="#f59e0b"
                  strokeWidth={2}
                  strokeDasharray="4 4"
                  dot={{ r: 3, fill: '#f59e0b' }}
                  name="mean_signed_error_mw"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
          <p className="text-[11px] text-slate-400 mt-2">
            💡 <strong>Observation:</strong> Error magnitude peaks between <strong>17:00 and 19:00 (tea-time peak)</strong>, matching highest consumer demand and tightest grid margins.
          </p>
        </div>

        {/* Diurnal Generation Outlook */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
          <div className="flex items-center justify-between pb-4 border-b border-slate-800">
            <div>
              <h3 className="text-sm font-bold text-white flex items-center space-x-2">
                <BarChart3 className="w-4 h-4 text-emerald-400" />
                <span>Average Generation by Hour (Actual vs Forecast)</span>
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Shows average daily wind shape across the 31 delivery days.
              </p>
            </div>
            <span className="text-xs font-mono text-emerald-400 bg-emerald-950/60 border border-emerald-800 px-2 py-0.5 rounded">
              Month Avg: {analytics.avg_actual_mw.toLocaleString()} MW
            </span>
          </div>

          <div className="h-72 w-full mt-4">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={diurnal_profile} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="hour_label" stroke="#64748b" tick={{ fill: '#94a3b8', fontSize: 11 }} />
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
                    name === 'avg_actual_mw' ? 'Average Actual Wind' : 'Average Forecast Wind'
                  ]}
                />
                <Bar dataKey="avg_forecast_mw" fill="#0284c7" opacity={0.7} name="avg_forecast_mw" />
                <Bar dataKey="avg_actual_mw" fill="#10b981" opacity={0.85} name="avg_actual_mw" />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="flex items-center justify-between text-[11px] text-slate-400 mt-2">
            <span className="text-sky-400">■ Blue = Average Forecast (WINDFOR)</span>
            <span className="text-emerald-400">■ Green = Average Delivered (FUELHH)</span>
          </div>
        </div>
      </div>

      {/* Daily Leaderboard Ranking */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-800 gap-3">
          <div>
            <h3 className="text-sm font-bold text-white flex items-center space-x-2">
              <Calendar className="w-4 h-4 text-sky-400" />
              <span>January 2026 Daily Decision Performance Table</span>
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Ranked across all 31 decision days. Click any row to inspect in Decision Replay.
            </p>
          </div>

          <div className="flex items-center space-x-2 text-xs">
            <span className="text-slate-400">Sort by:</span>
            <button
              onClick={() => setSortKey('mae')}
              className={`px-2.5 py-1 rounded font-medium transition ${
                sortKey === 'mae' ? 'bg-sky-600 text-white' : 'bg-slate-800 text-slate-300'
              }`}
            >
              Highest MAE
            </button>
            <button
              onClick={() => setSortKey('bias')}
              className={`px-2.5 py-1 rounded font-medium transition ${
                sortKey === 'bias' ? 'bg-sky-600 text-white' : 'bg-slate-800 text-slate-300'
              }`}
            >
              Highest Bias
            </button>
            <button
              onClick={() => setSortKey('date')}
              className={`px-2.5 py-1 rounded font-medium transition ${
                sortKey === 'date' ? 'bg-sky-600 text-white' : 'bg-slate-800 text-slate-300'
              }`}
            >
              Date
            </button>
          </div>
        </div>

        <div className="overflow-x-auto max-h-80 overflow-y-auto rounded-xl border border-slate-800 mt-4">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-950 text-slate-400 uppercase font-mono text-[10px] sticky top-0 border-b border-slate-800">
              <tr>
                <th className="py-2.5 px-3">Decision Date</th>
                <th className="py-2.5 px-3">Delivery Date</th>
                <th className="py-2.5 px-3 text-right">Avg Forecast (MW)</th>
                <th className="py-2.5 px-3 text-right">Avg Actual (MW)</th>
                <th className="py-2.5 px-3 text-right">MAE (MW)</th>
                <th className="py-2.5 px-3 text-right">RMSE (MW)</th>
                <th className="py-2.5 px-3 text-right">Mean Signed Error</th>
                <th className="py-2.5 px-3 text-right">Coverage</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-mono">
              {sortedDays.map((d) => {
                const isOver = d.mean_signed_error_mw > 0;
                return (
                  <tr
                    key={d.decision_date}
                    onClick={() => onSelectDecisionDate?.(d.decision_date)}
                    className="hover:bg-slate-800/50 cursor-pointer transition"
                  >
                    <td className="py-2 px-3 font-semibold text-slate-200">{d.decision_date}</td>
                    <td className="py-2 px-3 text-emerald-400 font-semibold">{d.delivery_date}</td>
                    <td className="py-2 px-3 text-right text-emerald-300">{d.avg_forecast_mw.toLocaleString()}</td>
                    <td className="py-2 px-3 text-right text-sky-300">{d.avg_actual_mw.toLocaleString()}</td>
                    <td className="py-2 px-3 text-right font-medium text-slate-200">{d.mae_mw.toLocaleString()}</td>
                    <td className="py-2 px-3 text-right text-slate-400">{d.rmse_mw.toLocaleString()}</td>
                    <td className={`py-2 px-3 text-right font-semibold ${isOver ? 'text-amber-400' : 'text-sky-400'}`}>
                      {d.mean_signed_error_mw > 0 ? `+${d.mean_signed_error_mw.toLocaleString()}` : d.mean_signed_error_mw.toLocaleString()} MW
                    </td>
                    <td className="py-2 px-3 text-right text-slate-400">
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
