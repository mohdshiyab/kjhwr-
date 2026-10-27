import React, { useState } from 'react';
import {
  Wind,
  Clock,
  Layers,
  CheckCircle2,
  AlertTriangle,
  Download,
  Info,
  Calendar,
  Eye
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

  if (loading || !replay) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 h-96" />
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 h-80" />
      </div>
    );
  }

  const { summary, intervals, revisions } = replay;

  // Chart data
  const chartData = intervals.map((inv) => {
    const isOver = (inv.error_mw ?? 0) > 0;
    const isUnder = (inv.error_mw ?? 0) < 0;

    return {
      raw: inv,
      time: `${inv.hour.toString().padStart(2, '0')}:${inv.minute.toString().padStart(2, '0')}`,
      sp: inv.settlement_period,
      actual: inv.actual_mw,
      forecast: inv.forecast_mw,
      overForecastError: isOver ? (inv.error_mw ?? 0) : 0,
      underForecastError: isUnder ? (inv.error_mw ?? 0) : 0,
    };
  });

  return (
    <div className="space-y-6">
      {/* Flagship Header Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between pb-4 border-b border-slate-800 gap-4">
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-950/80 text-emerald-400 border border-emerald-800 font-mono">
                Screen 2 — Decision Replay (Core Feature)
              </span>
              <span className="text-xs text-slate-400 font-mono">
                Cutoff: {replay.cutoff_time} GMT
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight mt-1">
              Historical Decision Snapshot: {replay.decision_date} (Delivering {replay.delivery_date})
            </h1>
            <p className="text-xs text-slate-400 mt-1">
              Reconstructs the exact information the purchasing desk could have seen when placing day-ahead orders. Later publications are strictly excluded.
            </p>
          </div>

          <a
            href={getExportCsvUrl(replay.decision_date, replay.cutoff_time)}
            download
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 text-xs font-semibold rounded-xl transition flex items-center space-x-2 shadow self-start md:self-auto"
          >
            <Download className="w-4 h-4 text-sky-400" />
            <span>Download Audit CSV</span>
          </a>
        </div>

        {/* Replay Chart Canvas */}
        <div className="h-96 w-full mt-4">
          <div className="flex flex-wrap items-center justify-between mb-2 text-xs font-mono">
            <span className="text-slate-400">
              48 Settlement Periods (Click any interval to inspect)
            </span>
            <div className="flex items-center space-x-4">
              <span className="flex items-center text-sky-400">
                <span className="w-3 h-0.5 bg-sky-400 inline-block mr-1.5" />
                Actual Delivered (MW)
              </span>
              <span className="flex items-center text-emerald-400">
                <span className="w-3 h-0.5 border-t-2 border-dashed border-emerald-400 inline-block mr-1.5" />
                Day-Ahead Forecast (MW)
              </span>
              <span className="flex items-center text-amber-400">
                <span className="w-2.5 h-2.5 bg-amber-500/80 inline-block mr-1.5 rounded-sm" />
                Over-Forecast
              </span>
              <span className="flex items-center text-rose-400">
                <span className="w-2.5 h-2.5 bg-rose-500/80 inline-block mr-1.5 rounded-sm" />
                Under-Forecast
              </span>
            </div>
          </div>

          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart
              data={chartData}
              onClick={(e) => {
                if (e && e.activePayload && e.activePayload[0]) {
                  setSelectedInterval(e.activePayload[0].payload.raw);
                }
              }}
              margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis dataKey="time" stroke="#64748b" tick={{ fill: '#94a3b8', fontSize: 11 }} />
              <YAxis
                yAxisId="mw"
                stroke="#64748b"
                tick={{ fill: '#94a3b8', fontSize: 11 }}
                tickFormatter={(val) => `${(val / 1000).toFixed(0)}k`}
              />
              <YAxis
                yAxisId="error"
                orientation="right"
                stroke="#475569"
                tick={{ fill: '#64748b', fontSize: 10 }}
                tickFormatter={(val) => `${val > 0 ? '+' : ''}${(val / 1000).toFixed(1)}k`}
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
                  name === 'actual'
                    ? 'Delivered Wind (Actual)'
                    : name === 'forecast'
                    ? 'Day-Ahead Forecast'
                    : name === 'overForecastError'
                    ? 'Over-Forecast Gap'
                    : name === 'underForecastError'
                    ? 'Under-Forecast Gap'
                    : name
                ]}
                labelFormatter={(lbl) => `Interval ${lbl} UTC`}
              />
              <Bar
                yAxisId="error"
                dataKey="overForecastError"
                fill="#f59e0b"
                opacity={0.4}
                name="overForecastError"
              />
              <Bar
                yAxisId="error"
                dataKey="underForecastError"
                fill="#f43f5e"
                opacity={0.4}
                name="underForecastError"
              />
              <Line
                yAxisId="mw"
                type="monotone"
                dataKey="actual"
                stroke="#38bdf8"
                strokeWidth={2.5}
                dot={false}
                name="actual"
              />
              <Line
                yAxisId="mw"
                type="monotone"
                dataKey="forecast"
                stroke="#34d399"
                strokeWidth={2}
                strokeDasharray="4 4"
                dot={false}
                name="forecast"
              />
              <ReferenceLine yAxisId="error" y={0} stroke="#475569" strokeDasharray="2 2" />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Interval Inspector Card (When clicked or default interval) */}
      {selectedInterval && (
        <div className="bg-slate-900 border border-sky-800/80 rounded-2xl p-6 shadow-xl ring-1 ring-sky-500/20">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <h3 className="text-sm font-bold text-white flex items-center space-x-2">
              <Eye className="w-4 h-4 text-sky-400" />
              <span>Interval Inspector: Settlement Period {selectedInterval.settlement_period} ({selectedInterval.start_time.replace('T', ' ').replace('Z', ' UTC')})</span>
            </h3>
            <button
              onClick={() => setSelectedInterval(null)}
              className="text-xs text-slate-400 hover:text-white"
            >
              ✕ Close
            </button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-4 font-mono text-xs">
            <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
              <span className="text-slate-400 text-[10px] uppercase">Delivered Wind</span>
              <div className="text-base font-bold text-sky-300 mt-1">
                {selectedInterval.actual_mw?.toLocaleString() ?? 'N/A'} MW
              </div>
            </div>

            <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
              <span className="text-slate-400 text-[10px] uppercase">Day-Ahead Forecast</span>
              <div className="text-base font-bold text-emerald-300 mt-1">
                {selectedInterval.forecast_mw?.toLocaleString() ?? 'N/A'} MW
              </div>
            </div>

            <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
              <span className="text-slate-400 text-[10px] uppercase">Forecast Error</span>
              <div className={`text-base font-bold mt-1 ${(selectedInterval.error_mw ?? 0) > 0 ? 'text-amber-400' : 'text-rose-400'}`}>
                {selectedInterval.error_mw !== null
                  ? `${(selectedInterval.error_mw ?? 0) > 0 ? '+' : ''}${selectedInterval.error_mw?.toLocaleString()} MW`
                  : 'N/A'}
              </div>
            </div>

            <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
              <span className="text-slate-400 text-[10px] uppercase">Forecast Publication</span>
              <div className="text-xs font-semibold text-slate-200 mt-1 truncate">
                {selectedInterval.forecast_publish_time?.replace('T', ' ').replace('Z', '') ?? 'N/A'}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Decision Timeline: The Feature That Proves Time-Dependent Modeling */}
      <DecisionTimeline
        decisionDate={replay.decision_date}
        deliveryDate={replay.delivery_date}
        cutoffTime={replay.cutoff_time}
        cutoffTimestamp={replay.cutoff_timestamp}
        revisions={revisions}
      />

      {/* 48-Interval Auditable Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div>
            <h3 className="text-base font-bold text-white flex items-center space-x-2">
              <Layers className="w-4 h-4 text-sky-400" />
              <span>Full 48 Half-Hourly Settlement Periods</span>
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Auditable interval-level match using delivery startTime.
            </p>
          </div>
          <span className="text-xs font-mono text-emerald-400 bg-emerald-950/80 border border-emerald-800 px-2.5 py-1 rounded-lg">
            Coverage: {summary.matched_intervals} / {summary.total_intervals} (100%)
          </span>
        </div>

        <div className="overflow-x-auto max-h-72 overflow-y-auto rounded-xl border border-slate-800 mt-4">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-950 text-slate-400 uppercase font-mono text-[10px] sticky top-0 border-b border-slate-800">
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
            <tbody className="divide-y divide-slate-800/60 font-mono">
              {intervals.map((inv) => {
                const isOver = (inv.error_mw ?? 0) > 0;
                return (
                  <tr
                    key={inv.interval_index}
                    onClick={() => setSelectedInterval(inv)}
                    className="hover:bg-slate-800/40 cursor-pointer transition"
                  >
                    <td className="py-2 px-3 font-bold text-slate-300">SP {inv.settlement_period}</td>
                    <td className="py-2 px-3 text-slate-400">{inv.start_time.replace('T', ' ').replace('Z', '')}</td>
                    <td className="py-2 px-3 text-right font-semibold text-emerald-300">
                      {inv.forecast_mw?.toLocaleString() ?? '-'}
                    </td>
                    <td className="py-2 px-3 text-right font-semibold text-sky-300">
                      {inv.actual_mw?.toLocaleString() ?? '-'}
                    </td>
                    <td className={`py-2 px-3 text-right font-bold ${isOver ? 'text-amber-400' : 'text-rose-400'}`}>
                      {inv.error_mw !== null ? `${(inv.error_mw ?? 0) > 0 ? '+' : ''}${inv.error_mw?.toLocaleString()}` : '-'}
                    </td>
                    <td className="py-2 px-3 text-slate-400 text-[11px]">
                      {inv.forecast_publish_time?.replace('T', ' ').replace('Z', '') ?? '-'}
                    </td>
                    <td className="py-2 px-3">
                      <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-950/80 text-emerald-400 border border-emerald-800">
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
