import React, { useState, useEffect } from 'react';
import {
  Flame,
  ShieldCheck,
  AlertOctagon,
  ArrowRight,
  TrendingDown,
  TrendingUp,
  Sliders,
  DollarSign,
  Info
} from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  ReferenceLine
} from 'recharts';
import { simulateProcurement } from '../services/api';
import { ThermalProcurementResponse } from '../types';

interface ThermalSimulatorProps {
  selectedDate: string;
  selectedGateClosure: string;
}

export const ThermalSimulator: React.FC<ThermalSimulatorProps> = ({
  selectedDate,
  selectedGateClosure
}) => {
  const [demandMw, setDemandMw] = useState<number>(30000);
  const [useBuffer, setUseBuffer] = useState<boolean>(true);
  const [bufferPct, setBufferPct] = useState<number>(15);
  const [simulation, setSimulation] = useState<ThermalProcurementResponse | null>(null);
  const [baselineSim, setBaselineSim] = useState<ThermalProcurementResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    async function runSim() {
      setLoading(true);
      try {
        // Run active simulation
        const activeRes = await simulateProcurement(
          selectedDate,
          demandMw,
          useBuffer,
          bufferPct,
          selectedGateClosure
        );
        setSimulation(activeRes);

        // Run baseline (unbuffered) simulation for comparison
        const baseRes = await simulateProcurement(
          selectedDate,
          demandMw,
          false,
          0,
          selectedGateClosure
        );
        setBaselineSim(baseRes);
      } catch (err) {
        console.error('Error running thermal procurement simulation:', err);
      } finally {
        setLoading(false);
      }
    }
    runSim();
  }, [selectedDate, demandMw, useBuffer, bufferPct, selectedGateClosure]);

  if (loading || !simulation) {
    return (
      <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 h-96 flex items-center justify-center animate-pulse">
        <div className="text-slate-400 flex items-center space-x-2">
          <Flame className="w-5 h-5 text-amber-500 animate-spin" />
          <span>Simulating Day-Ahead Thermal Procurement & Imbalance Exposure...</span>
        </div>
      </div>
    );
  }

  const { summary, hourly_schedule } = simulation;
  const baseSummary = baselineSim?.summary;

  // Calculate cashout penalty savings achieved by the buffer
  const unbufferedPenalty = baseSummary ? baseSummary.est_imbalance_penalty_gbp : summary.est_imbalance_penalty_gbp;
  const bufferedPenalty = summary.est_imbalance_penalty_gbp;
  const netSavings = Math.max(0, unbufferedPenalty - bufferedPenalty);

  // Prepare chart data
  const chartData = hourly_schedule.map((h) => ({
    hour: `${h.hour.toString().padStart(2, '0')}:00`,
    consumerDemand: h.consumer_demand_mw,
    thermalProcured: h.thermal_procured_mw,
    actualThermalNeeded: h.actual_thermal_needed_mw,
    windForecast: h.wind_forecast_mw,
    actualWind: h.actual_wind_mw,
    imbalance: h.imbalance_mw,
    status: h.status
  }));

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl mb-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between pb-6 border-b border-slate-800 gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400">
              <Flame className="w-5 h-5" />
            </div>
            <h2 className="text-lg font-bold text-white tracking-tight">
              Day-Ahead Thermal Procurement & Imbalance Simulator
            </h2>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Simulates the volume of thermal dispatch (CCGT / peakers) required to serve consumer demand after accounting for intermittent wind generation.
          </p>
        </div>

        {/* Financial ROI Badge */}
        {useBuffer && (
          <div className="bg-emerald-950/60 border border-emerald-800/80 rounded-xl px-4 py-2.5 flex items-center space-x-3">
            <div className="p-1.5 rounded-lg bg-emerald-500/20 text-emerald-400">
              <DollarSign className="w-4 h-4" />
            </div>
            <div>
              <span className="text-xs text-emerald-300 font-medium">Imbalance Penalty Protected</span>
              <div className="text-lg font-bold text-emerald-400 font-mono">
                £{netSavings.toLocaleString('en-GB', { maximumFractionDigits: 0 })}
                <span className="text-xs text-emerald-500/80 font-normal ml-1">/ day</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Simulator Interactive Controls */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 my-6 p-4 rounded-xl bg-slate-950/60 border border-slate-800/80">
        {/* Demand Slider */}
        <div>
          <div className="flex justify-between items-center mb-1.5">
            <label className="text-xs font-medium text-slate-300 flex items-center">
              <Sliders className="w-3.5 h-3.5 mr-1 text-sky-400" />
              Consumer Peak Demand
            </label>
            <span className="text-xs font-mono font-bold text-sky-400">
              {demandMw.toLocaleString()} MW
            </span>
          </div>
          <input
            type="range"
            min="20000"
            max="40000"
            step="1000"
            value={demandMw}
            onChange={(e) => setDemandMw(Number(e.target.value))}
            className="w-full accent-sky-500 cursor-pointer"
          />
          <div className="flex justify-between text-[10px] text-slate-500 font-mono mt-1">
            <span>20 GW (Trough)</span>
            <span>30 GW (Typical)</span>
            <span>40 GW (Cold Snap)</span>
          </div>
        </div>

        {/* Safety Buffer Toggle */}
        <div className="flex flex-col justify-center">
          <div className="flex items-center justify-between mb-2">
            <label className="text-xs font-medium text-slate-300 flex items-center">
              <ShieldCheck className="w-3.5 h-3.5 mr-1 text-emerald-400" />
              Empirical Derating Buffer
            </label>
            <button
              onClick={() => setUseBuffer(!useBuffer)}
              className={`px-3 py-1 rounded-full text-xs font-bold transition ${
                useBuffer
                  ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                  : 'bg-slate-800 text-slate-400 border border-slate-700'
              }`}
            >
              {useBuffer ? 'ENABLED (Protected)' : 'DISABLED (Raw)'}
            </button>
          </div>
          <p className="text-[11px] text-slate-400 leading-snug">
            Protects against the systematic +1,840 MW over-forecast bias in January 2026 by derating expected wind before buying thermal.
          </p>
        </div>

        {/* Buffer Slider */}
        <div className={useBuffer ? 'opacity-100' : 'opacity-40 pointer-events-none'}>
          <div className="flex justify-between items-center mb-1.5">
            <label className="text-xs font-medium text-slate-300">
              Derating Margin
            </label>
            <span className="text-xs font-mono font-bold text-emerald-400">
              {bufferPct}% of Wind Forecast
            </span>
          </div>
          <input
            type="range"
            min="5"
            max="30"
            step="1"
            value={bufferPct}
            onChange={(e) => setBufferPct(Number(e.target.value))}
            className="w-full accent-emerald-500 cursor-pointer"
            disabled={!useBuffer}
          />
          <div className="flex justify-between text-[10px] text-slate-500 font-mono mt-1">
            <span>5% (Aggressive)</span>
            <span>15% (Empirical MAE)</span>
            <span>30% (Conservative)</span>
          </div>
        </div>
      </div>

      {/* Dispatch Schedule Chart */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
            24-Hour Thermal Procurement Schedule vs Demand ({selectedDate})
          </h3>
          <div className="flex items-center space-x-4 text-xs font-mono">
            <span className="flex items-center text-slate-300">
              <span className="w-3 h-0.5 bg-slate-300 inline-block mr-1.5" />
              Demand Load
            </span>
            <span className="flex items-center text-amber-400">
              <span className="w-3 h-3 bg-amber-500/30 border border-amber-500 inline-block mr-1.5 rounded-sm" />
              Thermal Procured
            </span>
            <span className="flex items-center text-sky-400">
              <span className="w-3 h-3 bg-sky-500/30 border border-sky-500 inline-block mr-1.5 rounded-sm" />
              Wind Delivered
            </span>
          </div>
        </div>

        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="colorThermal" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#f59e0b" stopOpacity={0.05} />
                </linearGradient>
                <linearGradient id="colorWind" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#38bdf8" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#38bdf8" stopOpacity={0.05} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis dataKey="hour" stroke="#64748b" tick={{ fill: '#94a3b8', fontSize: 11 }} />
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
                  name === 'consumerDemand'
                    ? 'Consumer Demand'
                    : name === 'thermalProcured'
                    ? 'Day-Ahead Thermal Procured'
                    : name === 'actualThermalNeeded'
                    ? 'Actual Thermal Needed'
                    : name === 'actualWind'
                    ? 'Actual Wind Generated'
                    : name
                ]}
              />
              <Area
                type="monotone"
                dataKey="actualWind"
                stroke="#0284c7"
                fill="url(#colorWind)"
                strokeWidth={2}
                name="actualWind"
              />
              <Area
                type="monotone"
                dataKey="thermalProcured"
                stroke="#d97706"
                fill="url(#colorThermal)"
                strokeWidth={2}
                name="thermalProcured"
              />
              <ReferenceLine stroke="#94a3b8" strokeDasharray="4 4" strokeWidth={1.5} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Summary KPI Footprint */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-4 border-t border-slate-800 text-xs">
        <div className="bg-slate-950/40 p-3 rounded-xl border border-slate-800/80">
          <span className="text-slate-400">Total Thermal Procured</span>
          <div className="text-base font-bold text-amber-400 font-mono mt-0.5">
            {summary.total_thermal_procured_mwh.toLocaleString()} MWh
          </div>
        </div>

        <div className="bg-slate-950/40 p-3 rounded-xl border border-slate-800/80">
          <span className="text-slate-400">Renewable Wind Share</span>
          <div className="text-base font-bold text-sky-400 font-mono mt-0.5">
            {summary.renewable_penetration_pct}%
          </div>
        </div>

        <div className="bg-slate-950/40 p-3 rounded-xl border border-slate-800/80">
          <span className="text-slate-400">Shortfall Volume Short</span>
          <div className="text-base font-bold text-rose-400 font-mono mt-0.5">
            {summary.total_short_mwh.toLocaleString()} MWh
          </div>
        </div>

        <div className="bg-slate-950/40 p-3 rounded-xl border border-slate-800/80">
          <span className="text-slate-400">Estimated Cashout Impact</span>
          <div className="text-base font-bold text-slate-200 font-mono mt-0.5">
            £{summary.est_imbalance_penalty_gbp.toLocaleString('en-GB', { maximumFractionDigits: 0 })}
          </div>
        </div>
      </div>
    </div>
  );
};
