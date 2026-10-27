import React from 'react';
import { Clock, CheckCircle2, XCircle, AlertCircle, ShieldAlert, GitCommit } from 'lucide-react';
import { ForecastRevisionItem } from '../types';

interface DecisionTimelineProps {
  decisionDate: string;
  deliveryDate: string;
  cutoffTime: string;
  cutoffTimestamp: string;
  revisions: ForecastRevisionItem[];
}

export const DecisionTimeline: React.FC<DecisionTimelineProps> = ({
  decisionDate,
  deliveryDate,
  cutoffTime,
  revisions
}) => {
  return (
    <div className="glass-panel rounded-2xl p-5 border border-white/[0.06] shadow-xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-white/[0.06] gap-2">
        <div>
          <h3 className="text-sm font-bold text-white flex items-center space-x-2">
            <Clock className="w-4 h-4 text-sky-400" />
            <span>Forecast Selection Audit Trail (Decision Replay)</span>
          </h3>
          <p className="text-[11px] text-zinc-400 mt-0.5">
            Elexon forecast publication vintages for delivery day <strong>{deliveryDate}</strong>, ordered chronologically.
          </p>
        </div>

        <div className="flex items-center space-x-2 text-[11px] font-mono">
          <span className="px-2.5 py-1 rounded-lg bg-sky-500/10 text-sky-300 border border-sky-500/20">
            Cutoff: {cutoffTime} GMT ({decisionDate})
          </span>
        </div>
      </div>

      {/* Modern Stepper Audit Trail */}
      <div className="mt-5 space-y-2.5">
        {revisions.map((rev, index) => {
          const isSelected = rev.status === 'SELECTED';
          const isSuperseded = rev.status === 'SUPERSEDED';
          const isExcluded = rev.status === 'EXCLUDED';
          const timeFormatted = rev.publish_time.replace('T', ' ').replace('Z', ' UTC');

          return (
            <div
              key={index}
              className={`p-3.5 rounded-xl border transition-all duration-150 flex flex-col md:flex-row md:items-center justify-between gap-3 ${
                isSelected
                  ? 'bg-emerald-500/[0.08] border-emerald-500/40 shadow-sm ring-1 ring-emerald-500/20'
                  : isExcluded
                  ? 'bg-white/[0.01] border-white/[0.04] opacity-50 hover:opacity-75'
                  : 'bg-white/[0.02] border-white/[0.04] hover:bg-white/[0.03]'
              }`}
            >
              <div className="flex items-start space-x-3">
                <div className="mt-0.5 shrink-0">
                  {isSelected && <CheckCircle2 className="w-4 h-4 text-emerald-400" />}
                  {isSuperseded && <GitCommit className="w-4 h-4 text-zinc-500" />}
                  {isExcluded && <XCircle className="w-4 h-4 text-rose-400/80" />}
                </div>

                <div>
                  <div className="flex items-center space-x-2">
                    <span className="font-mono font-semibold text-xs text-zinc-200">
                      {timeFormatted}
                    </span>
                    <span
                      className={`text-[9px] px-2 py-0.5 rounded-md font-mono font-bold uppercase tracking-wider ${
                        isSelected
                          ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                          : isSuperseded
                          ? 'bg-zinc-800 text-zinc-400 border border-zinc-700'
                          : 'bg-rose-500/15 text-rose-300 border border-rose-500/30'
                      }`}
                    >
                      {rev.status}
                    </span>
                  </div>
                  <p className="text-xs text-zinc-300 mt-1 leading-snug">
                    {rev.reason}
                  </p>
                </div>
              </div>

              <div className="flex items-center space-x-4 text-xs font-mono shrink-0 pl-7 md:pl-0">
                <div className="text-right">
                  <span className="text-[10px] text-zinc-500 block uppercase">Avg Forecast</span>
                  <span className="font-semibold text-zinc-200">{rev.avg_forecast_mw.toLocaleString()} MW</span>
                </div>
                <div className="text-right">
                  <span className="text-[10px] text-zinc-500 block uppercase">Horizons</span>
                  <span className="text-zinc-400">{rev.horizon_count} hrs</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-4 p-3 bg-white/[0.02] border border-white/[0.06] rounded-xl text-[11px] text-zinc-400 flex items-center space-x-2.5">
        <ShieldAlert className="w-4 h-4 text-sky-400 shrink-0" />
        <span>
          <strong>Zero Look-Ahead Bias Guarantee:</strong> Forecasts published after {cutoffTime} GMT are strictly excluded from Day-Ahead evaluation. They cannot retroactively leak into past purchase decisions.
        </span>
      </div>
    </div>
  );
};
