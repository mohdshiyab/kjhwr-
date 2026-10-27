import React from 'react';
import { Wind, TrendingUp, AlertTriangle, ShieldCheck, Zap, ArrowUpRight } from 'lucide-react';
import { ExecutiveKPIs as KPIsType } from '../types';

interface ExecutiveKPIsProps {
  kpis: KPIsType | null;
  loading: boolean;
}

export const ExecutiveKPIs: React.FC<ExecutiveKPIsProps> = ({ kpis, loading }) => {
  if (loading || !kpis) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-4 animate-pulse h-28" />
        ))}
      </div>
    );
  }

  const { metrics } = kpis;
  const isOverForecasting = metrics.bias_mw > 0;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
      {/* 1. Actual Generation Delivered */}
      <div className="bg-gradient-to-br from-slate-900 to-slate-900/80 border border-slate-800 rounded-2xl p-4 relative overflow-hidden group hover:border-slate-700 transition">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">Delivered Wind Energy</span>
          <div className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-400">
            <Zap className="w-4 h-4" />
          </div>
        </div>
        <div className="flex items-baseline space-x-1.5">
          <span className="text-2xl font-bold tracking-tight text-white font-mono">
            {kpis.total_actual_gwh.toLocaleString()}
          </span>
          <span className="text-xs font-semibold text-emerald-400">GWh</span>
        </div>
        <p className="text-xs text-slate-400 mt-1">
          Avg: <span className="font-mono text-slate-200">{kpis.avg_actual_mw.toLocaleString()} MW</span> (Peak: {kpis.max_actual_mw.toLocaleString()})
        </p>
      </div>

      {/* 2. Day-Ahead Forecast Procured Against */}
      <div className="bg-gradient-to-br from-slate-900 to-slate-900/80 border border-slate-800 rounded-2xl p-4 relative overflow-hidden group hover:border-slate-700 transition">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">DA Forecasted Wind</span>
          <div className="p-1.5 rounded-lg bg-sky-500/10 text-sky-400">
            <Wind className="w-4 h-4" />
          </div>
        </div>
        <div className="flex items-baseline space-x-1.5">
          <span className="text-2xl font-bold tracking-tight text-white font-mono">
            {kpis.total_forecast_gwh.toLocaleString()}
          </span>
          <span className="text-xs font-semibold text-sky-400">GWh</span>
        </div>
        <p className="text-xs text-slate-400 mt-1 flex items-center">
          Gate Cutoff: <span className="ml-1 text-sky-300 font-mono font-medium">{kpis.active_gate_closure.toUpperCase()}</span>
        </p>
      </div>

      {/* 3. Weighted Absolute Forecast Error (WAPE) */}
      <div className="bg-gradient-to-br from-slate-900 to-slate-900/80 border border-slate-800 rounded-2xl p-4 relative overflow-hidden group hover:border-slate-700 transition">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">Forecast Error (WAPE)</span>
          <div className="p-1.5 rounded-lg bg-indigo-500/10 text-indigo-400">
            <TrendingUp className="w-4 h-4" />
          </div>
        </div>
        <div className="flex items-baseline space-x-1.5">
          <span className="text-2xl font-bold tracking-tight text-white font-mono">
            {metrics.wape_pct.toFixed(1)}%
          </span>
          <span className="text-xs text-slate-400 font-mono">MAE: {metrics.mae_mw.toLocaleString()} MW</span>
        </div>
        <p className="text-xs text-slate-400 mt-1">
          RMSE: <span className="font-mono text-slate-200">{metrics.rmse_mw.toLocaleString()} MW</span> (r={metrics.correlation})
        </p>
      </div>

      {/* 4. Systematic Forecast Bias */}
      <div className={`bg-gradient-to-br from-slate-900 to-slate-900/80 border rounded-2xl p-4 relative overflow-hidden group transition ${
        isOverForecasting ? 'border-amber-900/60 hover:border-amber-700/80' : 'border-slate-800 hover:border-slate-700'
      }`}>
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">Systematic Bias</span>
          <div className={`p-1.5 rounded-lg ${isOverForecasting ? 'bg-amber-500/10 text-amber-400' : 'bg-sky-500/10 text-sky-400'}`}>
            <AlertTriangle className="w-4 h-4" />
          </div>
        </div>
        <div className="flex items-baseline space-x-1.5">
          <span className={`text-2xl font-bold tracking-tight font-mono ${isOverForecasting ? 'text-amber-400' : 'text-sky-400'}`}>
            {metrics.bias_mw > 0 ? `+${metrics.bias_mw.toLocaleString()}` : metrics.bias_mw.toLocaleString()}
          </span>
          <span className="text-xs font-semibold text-slate-400">MW</span>
        </div>
        <p className="text-xs text-amber-300/80 mt-1 flex items-center">
          <ArrowUpRight className="w-3.5 h-3.5 mr-0.5 text-amber-400" />
          <span>Over-forecast (Shortfall Risk!)</span>
        </p>
      </div>

      {/* 5. P90 Risk Buffer Recommendation */}
      <div className="bg-gradient-to-br from-slate-900 to-slate-900/80 border border-slate-800 rounded-2xl p-4 relative overflow-hidden group hover:border-slate-700 transition">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">P90 Deficit Buffer</span>
          <div className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-400">
            <ShieldCheck className="w-4 h-4" />
          </div>
        </div>
        <div className="flex items-baseline space-x-1.5">
          <span className="text-2xl font-bold tracking-tight text-emerald-400 font-mono">
            {metrics.p90_error_mw.toLocaleString()}
          </span>
          <span className="text-xs font-semibold text-slate-400">MW</span>
        </div>
        <p className="text-xs text-slate-400 mt-1">
          Procurement margin for 90% risk coverage
        </p>
      </div>
    </div>
  );
};
