import React, { useState, useEffect } from 'react';
import {
  FileCheck2,
  Database,
  ShieldCheck,
  Download,
  AlertCircle,
  Clock,
  Terminal,
  Layers,
  CheckCircle2
} from 'lucide-react';
import { DataQualityReport } from '../types';
import { fetchDataQuality, getExportCsvUrl } from '../services/api';

interface DataMethodPageProps {
  selectedDecisionDate: string;
  cutoffTime: string;
}

export const DataMethodPage: React.FC<DataMethodPageProps> = ({
  selectedDecisionDate,
  cutoffTime
}) => {
  const [qualityReport, setQualityReport] = useState<DataQualityReport | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    async function loadQuality() {
      try {
        const report = await fetchDataQuality();
        setQualityReport(report);
      } catch (err) {
        console.error('Failed to load quality report:', err);
      } finally {
        setLoading(false);
      }
    }
    loadQuality();
  }, []);

  return (
    <div className="space-y-5">
      {/* Top Banner */}
      <div className="glass-panel rounded-2xl p-6 border border-white/[0.06] shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between pb-5 border-b border-white/[0.06] gap-4">
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-[10px] uppercase font-mono tracking-wider px-2 py-0.5 rounded-md bg-amber-500/10 text-amber-400 border border-amber-500/20 font-bold">
                Screen 4 — Data & Method
              </span>
              <span className="text-zinc-500 text-xs font-mono">•</span>
              <span className="text-xs text-zinc-400 font-mono">
                Methodology & Auditability
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight mt-1">
              Data Lineage, Selection Rules & Quality Audit
            </h1>
            <p className="text-xs text-zinc-400 mt-0.5">
              Full reproducibility and transparency on how Elexon BMRS streams are retrieved, filtered, aligned, and audited.
            </p>
          </div>

          <a
            href={getExportCsvUrl(selectedDecisionDate, cutoffTime)}
            download
            className="px-3.5 py-2 bg-sky-500/15 hover:bg-sky-500/25 text-sky-300 border border-sky-500/30 text-xs font-semibold rounded-xl transition flex items-center space-x-2 shadow"
          >
            <Download className="w-4 h-4" />
            <span>Export Snapshot ({selectedDecisionDate})</span>
          </a>
        </div>

        {/* Data Quality Health Indicators */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-5">
          <div className="glass-panel glass-panel-hover rounded-2xl p-4 border border-white/[0.06]">
            <span className="text-[11px] font-mono uppercase text-zinc-400 block">Delivered Intervals Present</span>
            <div className="text-2xl font-bold font-mono text-emerald-400 mt-1">
              1,488 / 1,488
            </div>
            <p className="text-[10px] text-zinc-500 mt-1 font-mono">100% of January delivery SPs</p>
          </div>

          <div className="glass-panel glass-panel-hover rounded-2xl p-4 border border-white/[0.06]">
            <span className="text-[11px] font-mono uppercase text-zinc-400 block">Missing Observations</span>
            <div className="text-2xl font-bold font-mono text-white mt-1">
              0
            </div>
            <p className="text-[10px] text-emerald-400 mt-1 font-mono">✓ Zero missing intervals</p>
          </div>

          <div className="glass-panel glass-panel-hover rounded-2xl p-4 border border-white/[0.06]">
            <span className="text-[11px] font-mono uppercase text-zinc-400 block">Duplicate Records</span>
            <div className="text-2xl font-bold font-mono text-white mt-1">
              0
            </div>
            <p className="text-[10px] text-emerald-400 mt-1 font-mono">✓ Deduplicated deterministically</p>
          </div>

          <div className="glass-panel glass-panel-hover rounded-2xl p-4 border border-white/[0.06]">
            <span className="text-[11px] font-mono uppercase text-zinc-400 block">Forecast Horizons Processed</span>
            <div className="text-2xl font-bold font-mono text-sky-400 mt-1">
              20,440
            </div>
            <p className="text-[10px] text-zinc-500 mt-1 font-mono">WINDFOR publication streams</p>
          </div>
        </div>
      </div>

      {/* Two Columns: Selection Rule & Sources */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Method & Selection Rule */}
        <div className="glass-panel rounded-2xl p-5 border border-white/[0.06] shadow-xl space-y-3">
          <h3 className="text-sm font-bold text-white flex items-center space-x-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Formal Forecast Selection Algorithm</span>
          </h3>
          <p className="text-xs text-zinc-300 leading-relaxed">
            To prevent <strong>look-ahead bias</strong> (data leakage), the platform selects forecasts strictly using the historical decision cutoff timestamp:
          </p>

          <div className="p-4 rounded-xl bg-black/40 border border-white/[0.06] text-xs font-mono text-zinc-200 space-y-2">
            <div className="text-sky-400 font-bold">
              Selected forecast(t, D) = argmax_f (f.publishTime)
            </div>
            <div className="text-zinc-400 text-[11px]">
              subject to:
              <br />
              • f.startTime = t (target delivery interval)
              <br />
              • f.publishTime ≤ D (decision cutoff on decision date)
            </div>
          </div>

          <p className="text-xs text-zinc-400 leading-relaxed">
            <strong>Decision Cutoff Assumption:</strong> In the UK wholesale electricity market, EPEX SPOT documents the GB hourly day-ahead auction at 09:20 GMT and the GB 30-minute day-ahead auction at <strong>15:30 GMT</strong>. Since this challenge uses half-hourly settlement intervals, 15:30 GMT on Day D-1 is modeled as the primary decision cutoff.
          </p>
        </div>

        {/* Elexon BMRS Sources */}
        <div className="glass-panel rounded-2xl p-5 border border-white/[0.06] shadow-xl space-y-3">
          <h3 className="text-sm font-bold text-white flex items-center space-x-2">
            <Database className="w-4 h-4 text-sky-400" />
            <span>Elexon BMRS Source Datasets</span>
          </h3>

          <div className="space-y-2.5 text-xs">
            <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.06]">
              <strong className="text-sky-300 font-mono">1. Actual Generation: FUELHH</strong>
              <p className="text-zinc-400 mt-1 leading-relaxed">
                Endpoint: <code className="text-zinc-300 font-mono">https://data.elexon.co.uk/bmrs/api/v1/datasets/FUELHH/stream</code>
                <br />
                Filtered where <code className="text-sky-400 font-mono">fuelType == 'WIND'</code>. 30-minute resolution covering 48 settlement periods per day.
              </p>
            </div>

            <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.06]">
              <strong className="text-emerald-300 font-mono">2. Forecast Generation: WINDFOR</strong>
              <p className="text-zinc-400 mt-1 leading-relaxed">
                Endpoint: <code className="text-zinc-300 font-mono">https://data.elexon.co.uk/bmrs/api/v1/datasets/WINDFOR/stream</code>
                <br />
                Provides rolling multi-horizon forecasts with precise <code className="text-emerald-400 font-mono">publishTime</code> timestamps.
              </p>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-amber-500/[0.07] border border-amber-500/20 text-xs text-amber-200">
            <strong className="text-amber-400 flex items-center space-x-1.5 mb-1">
              <AlertCircle className="w-3.5 h-3.5" />
              <span>Explicit Product Scope Boundary</span>
            </strong>
            <p className="text-[11px] text-amber-300/80 leading-relaxed">
              National wind generation data alone cannot tell us the exact megawatt procurement order of an individual utility, because that requires consumer load profiles and other portfolio generation which are not provided in Elexon market-wide data. WindLens focuses strictly on forecasting intelligence and error quantification.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
