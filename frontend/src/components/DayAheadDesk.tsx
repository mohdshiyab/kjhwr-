import React, { useState } from 'react';
import {
  Wind,
  Clock,
  Layers,
  ArrowDownRight,
  ArrowUpRight,
  Activity,
  CheckCircle2,
  Calendar
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
  Legend,
  ReferenceLine
} from 'recharts';
import { TimeSeriesPoint } from '../types';
import { ThermalSimulator } from './ThermalSimulator';

interface DayAheadDeskProps {
  timeSeries: TimeSeriesPoint[];
  loading: boolean;
  selectedDate: string;
  selectedGateClosure: string;
  isFullMonth: boolean;
  onSelectDate: (date: string) => void;
}

export const DayAheadDesk: React.FC<DayAheadDeskProps> = ({
  timeSeries,
  loading,
  selectedDate,
  selectedGateClosure,
  isFullMonth,
  onSelectDate
}) => {
  const [hoveredPoint, setHoveredPoint] = useState<TimeSeriesPoint | null>(null);

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 h-96" />
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 h-80" />
      </div>
    );
  }

  // Format data for chart
  const chartData = timeSeries.map((p) => {
    const dt = new Date(p.start_time);
    const label = isFullMonth
      ? `${dt.getUTCDate()} Jan ${p.hour.toString().padStart(2, '0')}:00`
      : `${p.hour.toString().padStart(2, '0')}:00`;

    return {
      raw: p,
      timeLabel: label,
      actual: p.actual_mw,
      forecast: p.forecast_mw ?? null,
      error: p.error_mw ?? 0,
      overForecastError: (p.error_mw ?? 0) > 0 ? (p.error_mw ?? 0) : 0,
      underForecastError: (p.error_mw ?? 0) < 0 ? (p.error_mw ?? 0) : 0,
    };
  });

  return (
    <div className="space-y-6">
      {/* Time-Series Chart Card */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between pb-4 border-b border-slate-800 gap-4">
          <div>
            <div className="flex items-center space-x-2">
              <div className="p-2 rounded-xl bg-sky-500/10 text-sky-400">
                <Activity className="w-5 h-5" />
              </div>
              <h2 className="text-lg font-bold text-white tracking-tight">
                National Wind Generation: Actuals vs Day-Ahead Forecast
              </h2>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Data Scope: Elexon BMRS <span className="text-sky-300 font-mono">FUELHH</span> (WIND) vs <span className="text-emerald-300 font-mono">WINDFOR</span> (Cut-off: {selectedGateClosure.toUpperCase()})
            </p>
          </div>

          {/* Chart Legend Badges */}
          <div className="flex flex-wrap items-center gap-3 text-xs font-mono">
            <span className="flex items-center text-slate-200 bg-slate-800/80 px-2.5 py-1 rounded-lg border border-slate-700">
              <span className="w-3 h-0.5 bg-sky-400 inline-block mr-2 shadow-sm shadow-sky-400" />
              Actual Delivered Wind (MW)
            </span>
            <span className="flex items-center text-slate-200 bg-slate-800/80 px-2.5 py-1 rounded-lg border border-slate-700">
              <span className="w-3 h-0.5 border-t-2 border-dashed border-emerald-400 inline-block mr-2" />
              Day-Ahead Forecast (MW)
            </span>
            <span className="flex items-center text-amber-400 bg-amber-950/40 px-2.5 py-1 rounded-lg border border-amber-900/60">
              <span className="w-2.5 h-2.5 bg-amber-500 inline-block mr-1.5 rounded-sm" />
              Over-Forecast (+Bias)
            </span>
            <span className="flex items-center text-rose-400 bg-rose-950/40 px-2.5 py-1 rounded-lg border border-rose-900/60">
              <span className="w-2.5 h-2.5 bg-rose-500 inline-block mr-1.5 rounded-sm" />
              Under-Forecast
            </span>
          </div>
        </div>

        {/* Chart Canvas */}
        <div className="h-96 w-full mt-4">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis
                dataKey="timeLabel"
                stroke="#64748b"
                tick={{ fill: '#94a3b8', fontSize: 11 }}
                interval={isFullMonth ? 23 : 1}
              />
              <YAxis
                yAxisId="mw"
                stroke="#64748b"
                tick={{ fill: '#94a3b8', fontSize: 11 }}
                tickFormatter={(val) => `${(val / 1000).toFixed(0)} GW`}
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
                    ? 'Actual Delivered Wind'
                    : name === 'forecast'
                    ? 'Day-Ahead Wind Forecast'
                    : name === 'overForecastError'
                    ? 'Over-Forecast Gap'
                    : name === 'underForecastError'
                    ? 'Under-Forecast Gap'
                    : name
                ]}
              />
              {/* Error Bars on secondary Y axis */}
              <Bar
                yAxisId="error"
                dataKey="overForecastError"
                fill="#f59e0b"
                opacity={0.35}
                name="overForecastError"
              />
              <Bar
                yAxisId="error"
                dataKey="underForecastError"
                fill="#f43f5e"
                opacity={0.35}
                name="underForecastError"
              />
              {/* Actual Wind Line */}
              <Line
                yAxisId="mw"
                type="monotone"
                dataKey="actual"
                stroke="#38bdf8"
                strokeWidth={2.5}
                dot={false}
                name="actual"
              />
              {/* Forecast Wind Line */}
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

        {/* Informative Guidance Banner */}
        <div className="mt-4 p-3 bg-slate-950/80 border border-slate-800 rounded-xl flex items-center justify-between text-xs text-slate-300">
          <div className="flex items-center space-x-2">
            <span className="p-1 rounded bg-sky-500/20 text-sky-400 font-mono text-[10px]">
              EPEX SPOT DAM
            </span>
            <span>
              Decision Gate Closure occurs at <strong>11:00 AM on Day D-1</strong>. All forecast values displayed represent the latest model published prior to gate closure.
            </span>
          </div>
          <span className="text-slate-500 font-mono hidden sm:inline">
            744 Hourly Intervals Aligned
          </span>
        </div>
      </div>

      {/* Settlement Period Table & Inspector (Single Day Mode) */}
      {!isFullMonth && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-bold text-white flex items-center space-x-2">
                <Layers className="w-4 h-4 text-sky-400" />
                <span>Half-Hourly Settlement Period Breakdown ({selectedDate})</span>
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                48 Settlement Periods (SP 1 to 48) aligned with UK market half-hour settlement windows.
              </p>
            </div>
            <span className="text-xs font-mono px-3 py-1 bg-slate-800 text-sky-300 rounded-lg border border-slate-700">
              Date: {selectedDate}
            </span>
          </div>

          <div className="overflow-x-auto max-h-64 overflow-y-auto rounded-xl border border-slate-800">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-950 text-slate-400 uppercase font-mono text-[10px] sticky top-0 border-b border-slate-800">
                <tr>
                  <th className="py-2.5 px-3">Hour</th>
                  <th className="py-2.5 px-3">Settlement Periods</th>
                  <th className="py-2.5 px-3 text-right">Actual Wind (MW)</th>
                  <th className="py-2.5 px-3 text-right">DA Forecast (MW)</th>
                  <th className="py-2.5 px-3 text-right">Error (MW)</th>
                  <th className="py-2.5 px-3 text-right">Error (%)</th>
                  <th className="py-2.5 px-3">Forecast Published</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-mono">
                {timeSeries.map((p) => {
                  const isOver = (p.error_mw ?? 0) > 0;
                  return (
                    <tr key={p.start_time} className="hover:bg-slate-800/40 transition">
                      <td className="py-2 px-3 font-semibold text-slate-200">
                        {p.hour.toString().padStart(2, '0')}:00
                      </td>
                      <td className="py-2 px-3 text-slate-400">
                        SP {p.settlement_periods.join(' & ')}
                      </td>
                      <td className="py-2 px-3 text-right font-medium text-sky-300">
                        {p.actual_mw.toLocaleString()}
                      </td>
                      <td className="py-2 px-3 text-right font-medium text-emerald-300">
                        {p.forecast_mw?.toLocaleString() ?? '-'}
                      </td>
                      <td className={`py-2 px-3 text-right font-semibold ${isOver ? 'text-amber-400' : 'text-rose-400'}`}>
                        {p.error_mw !== null && p.error_mw !== undefined
                          ? `${p.error_mw > 0 ? '+' : ''}${p.error_mw.toLocaleString()}`
                          : '-'}
                      </td>
                      <td className="py-2 px-3 text-right text-slate-400">
                        {p.pct_error !== null && p.pct_error !== undefined ? `${p.pct_error.toFixed(1)}%` : '-'}
                      </td>
                      <td className="py-2 px-3 text-slate-400 text-[11px]">
                        {p.publish_time ? p.publish_time.replace('T', ' ').replace('Z', '') : '-'}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Thermal Procurement Simulator */}
      <ThermalSimulator
        selectedDate={isFullMonth ? '2026-01-15' : selectedDate}
        selectedGateClosure={selectedGateClosure}
      />
    </div>
  );
};
