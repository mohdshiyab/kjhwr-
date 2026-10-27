import React from 'react';
import { Clock, CheckCircle2, XCircle, AlertCircle, ShieldAlert } from 'lucide-react';
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
  cutoffTimestamp,
  revisions
}) => {
  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-800 gap-2">
        <div>
          <h3 className="text-base font-bold text-white flex items-center space-x-2">
            <Clock className="w-4 h-4 text-sky-400" />
            <span>Decision Replay: Forecast Selection Timeline</span>
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Explains exactly which Elexon forecast vintage was selected for Day-Ahead purchasing and why later publications were strictly excluded.
          </p>
        </div>

        <div className="flex items-center space-x-2 text-xs font-mono">
          <span className="px-2.5 py-1 rounded-lg bg-sky-950/80 text-sky-300 border border-sky-800">
            Cutoff: {cutoffTime} GMT ({decisionDate})
          </span>
          <span className="px-2.5 py-1 rounded-lg bg-emerald-950/80 text-emerald-300 border border-emerald-800">
            Target Delivery: {deliveryDate}
          </span>
        </div>
      </div>

      {/* Visual Timeline Stepper */}
      <div className="mt-6 space-y-3">
        {revisions.map((rev, index) => {
          const isSelected = rev.status === 'SELECTED';
          const isSuperseded = rev.status === 'SUPERSEDED';
          const isExcluded = rev.status === 'EXCLUDED';
          const timeFormatted = rev.publish_time.replace('T', ' ').replace('Z', ' UTC');

          return (
            <div
              key={index}
              className={`p-4 rounded-xl border transition flex flex-col md:flex-row md:items-center justify-between gap-3 ${
                isSelected
                  ? 'bg-emerald-950/40 border-emerald-500/60 shadow-lg shadow-emerald-950/30 ring-1 ring-emerald-500/30'
                  : isExcluded
                  ? 'bg-slate-950/40 border-slate-800/80 opacity-60'
                  : 'bg-slate-950/60 border-slate-800'
              }`}
            >
              <div className="flex items-start space-x-3">
                <div className="mt-0.5">
                  {isSelected && <CheckCircle2 className="w-5 h-5 text-emerald-400" />}
                  {isSuperseded && <AlertCircle className="w-5 h-5 text-sky-400" />}
                  {isExcluded && <XCircle className="w-5 h-5 text-rose-400" />}
                </div>

                <div>
                  <div className="flex items-center space-x-2">
                    <span className="font-mono font-bold text-xs text-slate-200">
                      {timeFormatted}
                    </span>
                    <span
                      className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider ${
                        isSelected
                          ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                          : isSuperseded
                          ? 'bg-sky-500/20 text-sky-400 border border-sky-500/40'
                          : 'bg-rose-500/20 text-rose-400 border border-rose-500/40'
                      }`}
                    >
                      {rev.status}
                    </span>
                  </div>
                  <p className="text-xs text-slate-300 mt-1">
                    {rev.reason}
                  </p>
                </div>
              </div>

              <div className="flex items-center space-x-4 text-xs font-mono shrink-0 pl-8 md:pl-0">
                <div>
                  <span className="text-[10px] text-slate-500 uppercase block">Avg Wind Outlook</span>
                  <span className="font-bold text-slate-200">{rev.avg_forecast_mw.toLocaleString()} MW</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 uppercase block">Horizons</span>
                  <span className="text-slate-400">{rev.horizon_count} hours</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-4 p-3 bg-slate-950/80 border border-slate-800 rounded-xl text-xs text-slate-400 flex items-center space-x-2">
        <ShieldAlert className="w-4 h-4 text-sky-400 shrink-0" />
        <span>
          <strong>Why this matters:</strong> Forecasts published after {cutoffTime} GMT are strictly excluded. Leaking late-published forecasts into day-ahead performance evaluations creates false confidence (look-ahead bias) and invalidates backtests.
        </span>
      </div>
    </div>
  );
};
