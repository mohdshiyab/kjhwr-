import React from 'react';
import {
  Wind,
  Clock,
  Calendar,
  Layers,
  BarChart3,
  FileCheck2,
  Presentation,
  Terminal,
  ShieldCheck,
  Download
} from 'lucide-react';
import { DecisionDateItem } from '../types';
import { getExportCsvUrl } from '../services/api';

interface NavbarProps {
  activeScreen: 'overview' | 'replay' | 'analytics' | 'method';
  setActiveScreen: (screen: 'overview' | 'replay' | 'analytics' | 'method') => void;
  decisionDates: DecisionDateItem[];
  selectedDecisionDate: string;
  setSelectedDecisionDate: (date: string) => void;
  cutoffTime: string;
  setCutoffTime: (time: string) => void;
  onOpenPitch: () => void;
  onOpenTechReview: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeScreen,
  setActiveScreen,
  decisionDates,
  selectedDecisionDate,
  setSelectedDecisionDate,
  cutoffTime,
  setCutoffTime,
  onOpenPitch,
  onOpenTechReview
}) => {
  const currentItem = decisionDates.find((d) => d.decision_date === selectedDecisionDate);
  const deliveryDate = currentItem ? currentItem.delivery_date : '2026-01-15';

  const cutoffOptions = [
    { value: '15:30', label: '15:30 GMT (EPEX GB 30-min Auction • Default)' },
    { value: '11:00', label: '11:00 GMT (EPEX Hourly Auction)' },
    { value: '12:00', label: '12:00 GMT (Nord Pool N2EX Auction)' },
    { value: '09:20', label: '09:20 GMT (EPEX Morning Auction)' }
  ];

  return (
    <header className="bg-slate-900/95 backdrop-blur border-b border-slate-800 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Top Header Row */}
        <div className="flex items-center justify-between h-16">
          {/* Logo & Product Name */}
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-xl bg-gradient-to-br from-sky-400 to-indigo-600 text-white font-bold shadow-md shadow-sky-500/20">
              <Wind className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-extrabold text-base tracking-tight text-white">
                  Wind<span className="text-sky-400">Lens</span>
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700 font-mono">
                  BMRS Analytics
                </span>
                <span className="hidden sm:inline-flex text-[10px] px-2 py-0.5 rounded-full bg-emerald-950/80 text-emerald-400 border border-emerald-800">
                  Jan 2026 Decisions
                </span>
              </div>
              <p className="text-xs text-slate-400 hidden md:block">
                Day-Ahead Wind Forecast Intelligence & Decision Snapshot Engine
              </p>
            </div>
          </div>

          {/* Date & Cutoff Selector Controls */}
          <div className="flex items-center space-x-3">
            {/* Decision Date Dropdown */}
            <div className="flex items-center bg-slate-800/90 border border-slate-700 rounded-lg px-2.5 py-1 text-xs">
              <Calendar className="w-3.5 h-3.5 text-sky-400 mr-1.5" />
              <div className="flex flex-col">
                <div className="flex items-center space-x-1.5">
                  <span className="text-slate-400 text-[10px] uppercase font-semibold">Decision Date:</span>
                  <select
                    value={selectedDecisionDate}
                    onChange={(e) => setSelectedDecisionDate(e.target.value)}
                    className="bg-transparent text-sky-300 font-bold focus:outline-none cursor-pointer font-mono"
                  >
                    {decisionDates.map((d) => (
                      <option key={d.decision_date} value={d.decision_date} className="bg-slate-900 text-white">
                        {d.decision_date}
                      </option>
                    ))}
                  </select>
                </div>
                <span className="text-[10px] text-emerald-400 font-mono">
                  ↳ Delivery: <strong>{deliveryDate}</strong>
                </span>
              </div>
            </div>

            {/* Decision Cutoff Selector */}
            <div className="hidden lg:flex items-center bg-slate-800/90 border border-slate-700 rounded-lg px-2.5 py-1 text-xs">
              <Clock className="w-3.5 h-3.5 text-indigo-400 mr-1.5" />
              <div className="flex flex-col">
                <span className="text-slate-400 text-[10px] uppercase font-semibold">Purchasing Cutoff:</span>
                <select
                  value={cutoffTime}
                  onChange={(e) => setCutoffTime(e.target.value)}
                  className="bg-transparent text-indigo-300 font-medium focus:outline-none cursor-pointer"
                >
                  {cutoffOptions.map((opt) => (
                    <option key={opt.value} value={opt.value} className="bg-slate-900 text-white">
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Quick Export CSV Button */}
            <a
              href={getExportCsvUrl(selectedDecisionDate, cutoffTime)}
              download
              className="hidden sm:flex items-center space-x-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg text-xs text-slate-200 transition font-medium"
              title="Download interval snapshot as CSV"
            >
              <Download className="w-3.5 h-3.5 text-sky-400" />
              <span>Export CSV</span>
            </a>
          </div>
        </div>

        {/* Bottom Navigation Row: 4 Product Screens + Presentation Guides */}
        <div className="flex items-center justify-between border-t border-slate-800/80 py-2 overflow-x-auto text-xs">
          <div className="flex space-x-1">
            {/* Screen 1: Overview */}
            <button
              onClick={() => setActiveScreen('overview')}
              className={`flex items-center space-x-2 px-3 py-1.5 rounded-lg font-medium transition shrink-0 ${
                activeScreen === 'overview'
                  ? 'bg-sky-500/10 text-sky-400 border border-sky-500/30'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
              }`}
            >
              <Layers className="w-4 h-4 text-sky-400" />
              <span>Screen 1: Overview</span>
            </button>

            {/* Screen 2: Decision Replay (The Flagship) */}
            <button
              onClick={() => setActiveScreen('replay')}
              className={`flex items-center space-x-2 px-3 py-1.5 rounded-lg font-medium transition shrink-0 ${
                activeScreen === 'replay'
                  ? 'bg-sky-500/10 text-sky-400 border border-sky-500/30'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
              }`}
            >
              <Wind className="w-4 h-4 text-emerald-400" />
              <span>Screen 2: Decision Replay</span>
              <span className="text-[10px] px-1.5 py-0.2 bg-emerald-500/20 text-emerald-300 rounded font-bold">
                CORE
              </span>
            </button>

            {/* Screen 3: Accuracy & Insights */}
            <button
              onClick={() => setActiveScreen('analytics')}
              className={`flex items-center space-x-2 px-3 py-1.5 rounded-lg font-medium transition shrink-0 ${
                activeScreen === 'analytics'
                  ? 'bg-sky-500/10 text-sky-400 border border-sky-500/30'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
              }`}
            >
              <BarChart3 className="w-4 h-4 text-indigo-400" />
              <span>Screen 3: Accuracy & Insights</span>
            </button>

            {/* Screen 4: Data & Method */}
            <button
              onClick={() => setActiveScreen('method')}
              className={`flex items-center space-x-2 px-3 py-1.5 rounded-lg font-medium transition shrink-0 ${
                activeScreen === 'method'
                  ? 'bg-sky-500/10 text-sky-400 border border-sky-500/30'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
              }`}
            >
              <FileCheck2 className="w-4 h-4 text-amber-400" />
              <span>Screen 4: Data & Method</span>
            </button>
          </div>

          {/* Quick Shortcuts for Demo Presentation */}
          <div className="flex items-center space-x-2 pl-4 border-l border-slate-800 shrink-0">
            <button
              onClick={onOpenPitch}
              className="flex items-center space-x-1.5 px-2.5 py-1 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/30 transition text-xs font-semibold"
            >
              <Presentation className="w-3.5 h-3.5" />
              <span>Part 1 Pitch</span>
            </button>

            <button
              onClick={onOpenTechReview}
              className="flex items-center space-x-1.5 px-2.5 py-1 rounded-lg bg-violet-500/10 hover:bg-violet-500/20 text-violet-400 border border-violet-500/30 transition text-xs font-semibold"
            >
              <Terminal className="w-3.5 h-3.5" />
              <span>Part 2 Tech Review</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
