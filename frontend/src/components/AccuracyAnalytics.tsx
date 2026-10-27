import React, { useState } from 'react';
import {
  BarChart3,
  TrendingUp,
  AlertTriangle,
  Clock,
  Layers,
  Calendar,
  ShieldAlert,
  HelpCircle
} from 'lucide-react';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
  Cell
} from 'recharts';
import { AccuracyAnalyticsResponse } from '../types';

interface AccuracyAnalyticsProps {
  analytics: AccuracyAnalyticsResponse | null;
  loading: boolean;
  onSelectDate?: (date: string) => void;
}

export const AccuracyAnalytics: React.FC<AccuracyAnalyticsProps> = ({
  analytics,
  loading,
  onSelectDate
}) => {
  const [selectedSort, setSelectedSort] = useState<'date' | 'wape' | 'bias'>('wape');

  if (loading || !analytics) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 h-64" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 h-80" />
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 h-80" />
        </div>
      </div>
    );
  }

  const { summary, settlement_period_profile, daily_leaderboard, error_distribution } = analytics;

  // Sort daily leaderboard
  const sortedDays = [...daily_leaderboard].sort((a, b) => {
    if (selectedSort === 'wape') return b.wape_pct - a.wape_pct; // worst first
    if (selectedSort === 'bias') return Math.abs(b.bias_mw) - Math.abs(a.bias_mw);
    return a.date.localeCompare(b.date);
  });

  return (
    <div className="space-y-6">
      {/* Top Statistical Formulas & Evaluation Card */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between pb-6 border-b border-slate-800 gap-4">
          <div>
            <div className="flex items-center space-x-2">
              <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400">
                <BarChart3 className="w-5 h-5" />
              </div>
              <h2 className="text-lg font-bold text-white tracking-tight">
                Quantitative Forecast Accuracy & Error Evaluation
              </h2>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Rigorous statistical evaluation of Elexon Day-Ahead wind forecast predictions across all 744 hours of January 2026.
            </p>
          </div>

          <div className="bg-slate-950/80 border border-slate-800 rounded-xl px-4 py-2 font-mono text-xs text-slate-300">
            <span>Pearson Correlation: </span>
            <span className="font-bold text-sky-400 font-mono text-sm">r = {summary.correlation}</span>
            <span className="text-slate-500 ml-2">(High Tracking, High Bias)</span>
          </div>
        </div>

        {/* Statistical Metric Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 mt-6">
          <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-800">
            <span className="text-xs text-slate-400 uppercase font-medium">MAE</span>
            <div className="text-xl font-bold font-mono text-white mt-1">
              {summary.mae_mw.toLocaleString()} <span className="text-xs text-slate-400 font-normal">MW</span>
            </div>
            <span className="text-[10px] text-slate-500">Mean Absolute Error</span>
          </div>

          <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-800">
            <span className="text-xs text-slate-400 uppercase font-medium">RMSE</span>
            <div className="text-xl font-bold font-mono text-white mt-1">
              {summary.rmse_mw.toLocaleString()} <span className="text-xs text-slate-400 font-normal">MW</span>
            </div>
            <span className="text-[10px] text-slate-500">Penalizes large spikes</span>
          </div>

          <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-800">
            <span className="text-xs text-slate-400 uppercase font-medium">WAPE</span>
            <div className="text-xl font-bold font-mono text-emerald-400 mt-1">
              {summary.wape_pct}%
            </div>
            <span className="text-[10px] text-slate-500">Weighted Abs Error</span>
          </div>

          <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-800">
            <span className="text-xs text-slate-400 uppercase font-medium">Systematic Bias</span>
            <div className="text-xl font-bold font-mono text-amber-400 mt-1">
              +{summary.bias_mw.toLocaleString()} <span className="text-xs text-slate-400 font-normal">MW</span>
            </div>
            <span className="text-[10px] text-amber-400/80">Mean Over-prediction</span>
          </div>

          <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-800">
            <span className="text-xs text-slate-400 uppercase font-medium">P10 Error</span>
            <div className="text-xl font-bold font-mono text-slate-200 mt-1">
              {summary.p10_error_mw.toLocaleString()} <span className="text-xs text-slate-400 font-normal">MW</span>
            </div>
            <span className="text-[10px] text-slate-500">Lower 10th percentile</span>
          </div>

          <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-800">
            <span className="text-xs text-slate-400 uppercase font-medium">P90 Error</span>
            <div className="text-xl font-bold font-mono text-rose-400 mt-1">
              +{summary.p90_error_mw.toLocaleString()} <span className="text-xs text-slate-400 font-normal">MW</span>
            </div>
            <span className="text-[10px] text-rose-400/80">Upper 90th deficit risk</span>
          </div>
        </div>
      </div>

      {/* Two Column Layout: Settlement Period Profile & Error Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Settlement Period Diurnal Error Profile */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
          <div className="flex items-center justify-between pb-4 border-b border-slate-800">
            <div>
              <h3 className="text-sm font-bold text-white flex items-center space-x-2">
                <Clock className="w-4 h-4 text-sky-400" />
                <span>Diurnal Error Curve by Hour of Day</span>
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                MAE and Systematic Bias across Settlement Periods 1 to 48 (00:00 to 23:00).
              </p>
            </div>
            <span className="text-xs font-mono text-slate-400 bg-slate-800 px-2.5 py-1 rounded-lg">
              24-Hour Cycle
            </span>
          </div>

          <div className="h-72 w-full mt-4">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={settlement_period_profile}
                margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis
                  dataKey="hour_of_day"
                  stroke="#64748b"
                  tick={{ fill: '#94a3b8', fontSize: 11 }}
                  tickFormatter={(val) => `${val.toString().padStart(2, '0')}:00`}
                />
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
                    name === 'mae_mw'
                      ? 'Mean Absolute Error (MAE)'
                      : name === 'bias_mw'
                      ? 'Systematic Bias'
                      : name
                  ]}
                  labelFormatter={(lbl) => `Hour ${lbl}:00 (Settlement Periods ${Number(lbl)*2+1} & ${Number(lbl)*2+2})`}
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
                  dataKey="bias_mw"
                  stroke="#f59e0b"
                  strokeWidth={2}
                  strokeDasharray="4 4"
                  dot={{ r: 3, fill: '#f59e0b' }}
                  name="bias_mw"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
          <p className="text-[11px] text-slate-400 mt-2">
            💡 <strong>Trading Insight:</strong> Forecast error consistently ramps during evening tea-time peak (17:00-19:00), which coincides with the tightest grid margins and highest cashout price risks!
          </p>
        </div>

        {/* Error Frequency Distribution Histogram */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
          <div className="flex items-center justify-between pb-4 border-b border-slate-800">
            <div>
              <h3 className="text-sm font-bold text-white flex items-center space-x-2">
                <BarChart3 className="w-4 h-4 text-emerald-400" />
                <span>Forecast Error Probability Distribution</span>
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Frequency histogram of forecast errors (bins in MW).
              </p>
            </div>
            <span className="text-xs font-mono text-emerald-400 bg-emerald-950/60 border border-emerald-800 px-2 py-0.5 rounded">
              Mean: +{summary.bias_mw} MW
            </span>
          </div>

          <div className="h-72 w-full mt-4">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={error_distribution}
                margin={{ top: 10, right: 10, left: 0, bottom: 20 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis
                  dataKey="bin_label"
                  stroke="#64748b"
                  tick={{ fill: '#94a3b8', fontSize: 9 }}
                  angle={-30}
                  textAnchor="end"
                />
                <YAxis
                  stroke="#64748b"
                  tick={{ fill: '#94a3b8', fontSize: 11 }}
                  tickFormatter={(val) => `${val}`}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    borderColor: '#334155',
                    borderRadius: '0.75rem',
                    fontSize: '12px'
                  }}
                  formatter={(val: any) => [`${val} hours (${((Number(val)/744)*100).toFixed(1)}%)`, 'Frequency']}
                />
                <Bar dataKey="frequency" fill="#0284c7" radius={[4, 4, 0, 0]}>
                  {error_distribution.map((entry: any, index: number) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={entry.bin_start >= 0 ? '#f59e0b' : '#38bdf8'}
                      opacity={0.8}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="flex items-center justify-between text-[11px] text-slate-400 mt-2">
            <span className="text-sky-400">■ Blue = Under-forecast (Surplus wind)</span>
            <span className="text-amber-400">■ Orange = Over-forecast (Deficit / Shortfall)</span>
          </div>
        </div>
      </div>

      {/* Daily Accuracy Leaderboard Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-800 gap-3">
          <div>
            <h3 className="text-sm font-bold text-white flex items-center space-x-2">
              <Calendar className="w-4 h-4 text-sky-400" />
              <span>January 2026 Daily Forecast Performance Leaderboard</span>
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              All 31 delivery days in January 2026 ranked by error metric. Click any day to inspect.
            </p>
          </div>

          {/* Sort Buttons */}
          <div className="flex items-center space-x-2 text-xs">
            <span className="text-slate-400">Sort by:</span>
            <button
              onClick={() => setSelectedSort('wape')}
              className={`px-2.5 py-1 rounded font-medium transition ${
                selectedSort === 'wape' ? 'bg-sky-600 text-white' : 'bg-slate-800 text-slate-300'
              }`}
            >
              Worst WAPE (%)
            </button>
            <button
              onClick={() => setSelectedSort('bias')}
              className={`px-2.5 py-1 rounded font-medium transition ${
                selectedSort === 'bias' ? 'bg-sky-600 text-white' : 'bg-slate-800 text-slate-300'
              }`}
            >
              Highest Bias (MW)
            </button>
            <button
              onClick={() => setSelectedSort('date')}
              className={`px-2.5 py-1 rounded font-medium transition ${
                selectedSort === 'date' ? 'bg-sky-600 text-white' : 'bg-slate-800 text-slate-300'
              }`}
            >
              Chronological
            </button>
          </div>
        </div>

        <div className="overflow-x-auto max-h-80 overflow-y-auto rounded-xl border border-slate-800 mt-4">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-950 text-slate-400 uppercase font-mono text-[10px] sticky top-0 border-b border-slate-800">
              <tr>
                <th className="py-2.5 px-3">Delivery Date</th>
                <th className="py-2.5 px-3 text-right">Avg Wind Actual</th>
                <th className="py-2.5 px-3 text-right">Avg DA Forecast</th>
                <th className="py-2.5 px-3 text-right">MAE (MW)</th>
                <th className="py-2.5 px-3 text-right">RMSE (MW)</th>
                <th className="py-2.5 px-3 text-right">WAPE (%)</th>
                <th className="py-2.5 px-3 text-right">Bias (MW)</th>
                <th className="py-2.5 px-3 text-right">Max Over-prediction</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-mono">
              {sortedDays.map((d) => {
                const isOver = d.bias_mw > 0;
                const isHighError = d.wape_pct > 25.0;
                return (
                  <tr
                    key={d.date}
                    onClick={() => onSelectDate?.(d.date)}
                    className="hover:bg-slate-800/50 cursor-pointer transition"
                  >
                    <td className="py-2 px-3 font-semibold text-slate-200 flex items-center space-x-1.5">
                      <span>{d.date}</span>
                      {isHighError && (
                        <span className="w-1.5 h-1.5 rounded-full bg-rose-500" title="High Error Day" />
                      )}
                    </td>
                    <td className="py-2 px-3 text-right text-sky-300">
                      {d.avg_actual_mw.toLocaleString()} MW
                    </td>
                    <td className="py-2 px-3 text-right text-emerald-300">
                      {d.avg_forecast_mw.toLocaleString()} MW
                    </td>
                    <td className="py-2 px-3 text-right font-medium text-slate-200">
                      {d.mae_mw.toLocaleString()}
                    </td>
                    <td className="py-2 px-3 text-right text-slate-400">
                      {d.rmse_mw.toLocaleString()}
                    </td>
                    <td className={`py-2 px-3 text-right font-bold ${isHighError ? 'text-rose-400' : 'text-slate-300'}`}>
                      {d.wape_pct.toFixed(1)}%
                    </td>
                    <td className={`py-2 px-3 text-right font-semibold ${isOver ? 'text-amber-400' : 'text-sky-400'}`}>
                      {d.bias_mw > 0 ? `+${d.bias_mw.toLocaleString()}` : d.bias_mw.toLocaleString()}
                    </td>
                    <td className="py-2 px-3 text-right text-amber-400/90">
                      +{d.max_over_forecast_mw.toLocaleString()} MW
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
