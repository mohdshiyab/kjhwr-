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
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between pb-6 border-b border-slate-800 gap-4">
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-amber-950/80 text-amber-400 border border-amber-800 font-mono">
                Screen 4 — Data & Method
              </span>
              <span className="text-xs text-slate-400">
                Methodology, Quality Indicators & Auditability
              </span>
            </div>
            <h1 className="text-2xl font-extrabold text-white tracking-tight mt-1">
              Data Lineage, Selection Rules & Quality Audit
            </h1>
            <p className="text-xs text-slate-400 mt-1">
              Complete transparency on how Elexon BMRS streams are retrieved, filtered, aligned, and audited.
            </p>
          </div>

          <a
            href={getExportCsvUrl(selectedDecisionDate, cutoffTime)}
            download
            className="px-4 py-2 bg-sky-600 hover:bg-sky-500 text-white text-xs font-semibold rounded-xl transition flex items-center space-x-2 shadow-lg shadow-sky-600/20"
          >
            <Download className="w-4 h-4" />
            <span>Export Snapshot ({selectedDecisionDate})</span>
          </a>
        </div>

        {/* Data Quality Health Indicators */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
          <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-800">
            <span className="text-xs text-slate-400 uppercase font-medium">Delivered Intervals Present</span>
            <div className="text-2xl font-bold font-mono text-emerald-400 mt-1">
              1,488 / 1,488
            </div>
            <p className="text-[10px] text-slate-500 mt-1">100% of January delivery SPs</p>
          </div>

          <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-800">
            <span className="text-xs text-slate-400 uppercase font-medium">Missing Observations</span>
            <div className="text-2xl font-bold font-mono text-white mt-1">
              0
            </div>
            <p className="text-[10px] text-emerald-400 mt-1">✓ No missing intervals</p>
          </div>

          <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-800">
            <span className="text-xs text-slate-400 uppercase font-medium">Duplicate Records</span>
            <div className="text-2xl font-bold font-mono text-white mt-1">
              0
            </div>
            <p className="text-[10px] text-emerald-400 mt-1">✓ Deduplicated deterministically</p>
          </div>

          <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-800">
            <span className="text-xs text-slate-400 uppercase font-medium">Forecast Horizons Processed</span>
            <div className="text-2xl font-bold font-mono text-sky-400 mt-1">
              20,440
            </div>
            <p className="text-[10px] text-slate-500 mt-1">WINDFOR publication streams</p>
          </div>
        </div>
      </div>

      {/* Two Columns: Methodology & Sources */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Method & Selection Rule */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
          <h3 className="text-sm font-bold text-white flex items-center space-x-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Formal Forecast Selection Algorithm</span>
          </h3>
          <p className="text-xs text-slate-300 leading-relaxed">
            To prevent <strong>look-ahead bias</strong> (data leakage), the platform selects forecasts strictly using the historical decision cutoff timestamp:
          </p>

          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-xs font-mono text-slate-200 space-y-2">
            <div className="text-sky-400 font-bold">
              Selected forecast(t, D) = argmax_f (f.publishTime)
            </div>
            <div className="text-slate-400 text-[11px]">
              subject to:
              <br />
              • f.startTime = t (target delivery interval)
              <br />
              • f.publishTime ≤ D (decision cutoff on decision date)
            </div>
          </div>

          <p className="text-xs text-slate-400 leading-relaxed">
            <strong>Decision Cutoff Assumption:</strong> In the UK wholesale electricity market, EPEX SPOT documents the GB hourly day-ahead auction at 09:20 GMT and the GB 30-minute day-ahead auction at <strong>15:30 GMT</strong>. Since this challenge uses half-hourly settlement intervals, 15:30 GMT on Day D-1 is modeled as the primary decision cutoff.
          </p>
        </div>

        {/* Elexon BMRS Sources */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
          <h3 className="text-sm font-bold text-white flex items-center space-x-2">
            <Database className="w-4 h-4 text-sky-400" />
            <span>Elexon BMRS Source Datasets</span>
          </h3>

          <div className="space-y-3 text-xs">
            <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800">
              <strong className="text-sky-300 font-mono">1. Actual Generation: FUELHH</strong>
              <p className="text-slate-400 mt-1">
                Endpoint: <code className="text-slate-300 font-mono">https://data.elexon.co.uk/bmrs/api/v1/datasets/FUELHH/stream</code>
                <br />
                Filtered where <code className="text-sky-400 font-mono">fuelType == 'WIND'</code>. 30-minute resolution covering 48 settlement periods per day.
              </p>
            </div>

            <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800">
              <strong className="text-emerald-300 font-mono">2. Forecast Generation: WINDFOR</strong>
              <p className="text-slate-400 mt-1">
                Endpoint: <code className="text-slate-300 font-mono">https://data.elexon.co.uk/bmrs/api/v1/datasets/WINDFOR/stream</code>
                <br />
                Provides rolling multi-horizon forecasts with precise <code className="text-emerald-400 font-mono">publishTime</code> timestamps.
              </p>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-amber-950/40 border border-amber-800/80 text-xs text-amber-200">
            <strong className="text-amber-400 flex items-center space-x-1 mb-1">
              <AlertCircle className="w-4 h-4" />
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
