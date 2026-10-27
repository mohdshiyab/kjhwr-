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
  Download,
  ChevronDown
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
    { value: '15:30', label: '15:30 GMT (EPEX 30-min • Default)' },
    { value: '11:00', label: '11:00 GMT (EPEX Hourly Auction)' },
    { value: '12:00', label: '12:00 GMT (Nord Pool N2EX)' },
    { value: '09:20', label: '09:20 GMT (EPEX Morning)' }
  ];

  return (
    <header className="border-b border-white/[0.06] bg-[#0c0e17]/90 backdrop-blur-md sticky top-0 z-50">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          
          {/* Brand Logo & Context */}
          <div className="flex items-center space-x-3 shrink-0">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-sky-500 via-indigo-500 to-emerald-400 p-[1px] shadow-sm shadow-sky-500/20">
              <div className="w-full h-full bg-[#0d0f1a] rounded-[11px] flex items-center justify-center">
                <Wind className="w-4 h-4 text-sky-400" />
              </div>
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-bold text-sm tracking-tight text-white">
                  Wind<span className="text-sky-400">Lens</span>
                </span>
                <span className="inline-flex items-center space-x-1 px-1.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-[10px] text-emerald-400 font-mono">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  <span>BMRS Live</span>
                </span>
              </div>
              <p className="text-[11px] text-zinc-400 hidden xl:block font-normal">
                Day-Ahead Wind Forecast Intelligence
              </p>
            </div>
          </div>

          {/* Central Segmented Screen Switcher (Modern Pill Style) */}
          <nav className="flex items-center p-1 rounded-xl bg-white/[0.03] border border-white/[0.06] shadow-inner text-xs">
            <button
              onClick={() => setActiveScreen('overview')}
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg font-medium transition-all duration-150 ${
                activeScreen === 'overview'
                  ? 'bg-sky-500/15 text-sky-300 shadow-sm border border-sky-500/30'
                  : 'text-zinc-400 hover:text-zinc-200 hover:bg-white/[0.02]'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>Overview</span>
            </button>

            <button
              onClick={() => setActiveScreen('replay')}
              className={`flex items-center space-x-1.5 px-3.5 py-1.5 rounded-lg font-medium transition-all duration-150 ${
                activeScreen === 'replay'
                  ? 'bg-sky-500/15 text-sky-300 shadow-sm border border-sky-500/30'
                  : 'text-zinc-400 hover:text-zinc-200 hover:bg-white/[0.02]'
              }`}
            >
              <Wind className="w-3.5 h-3.5" />
              <span>Decision Replay</span>
              <span className="text-[9px] px-1 py-0.2 rounded bg-sky-500/20 text-sky-300 font-mono font-semibold uppercase">
                Core
              </span>
            </button>

            <button
              onClick={() => setActiveScreen('analytics')}
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg font-medium transition-all duration-150 ${
                activeScreen === 'analytics'
                  ? 'bg-sky-500/15 text-sky-300 shadow-sm border border-sky-500/30'
                  : 'text-zinc-400 hover:text-zinc-200 hover:bg-white/[0.02]'
              }`}
            >
              <BarChart3 className="w-3.5 h-3.5" />
              <span>Accuracy & Insights</span>
            </button>

            <button
              onClick={() => setActiveScreen('method')}
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg font-medium transition-all duration-150 ${
                activeScreen === 'method'
                  ? 'bg-sky-500/15 text-sky-300 shadow-sm border border-sky-500/30'
                  : 'text-zinc-400 hover:text-zinc-200 hover:bg-white/[0.02]'
              }`}
            >
              <FileCheck2 className="w-3.5 h-3.5" />
              <span>Data & Method</span>
            </button>
          </nav>

          {/* Right Action Cluster: Date Selector, Cutoff, Export, Presentation */}
          <div className="flex items-center space-x-2 shrink-0">
            {/* Minimalist Date & Delivery Widget */}
            <div className="hidden sm:flex items-center space-x-2 bg-white/[0.03] border border-white/[0.06] rounded-xl px-2.5 py-1.5 text-xs">
              <Calendar className="w-3.5 h-3.5 text-sky-400" />
              <div className="flex items-center space-x-1.5 font-mono">
                <span className="text-zinc-500 text-[10px] uppercase font-medium">Decision:</span>
                <select
                  value={selectedDecisionDate}
                  onChange={(e) => setSelectedDecisionDate(e.target.value)}
                  className="bg-transparent text-zinc-200 font-semibold focus:outline-none cursor-pointer pr-1"
                >
                  {decisionDates.map((d) => (
                    <option key={d.decision_date} value={d.decision_date} className="bg-[#0f121d] text-white">
                      {d.decision_date}
                    </option>
                  ))}
                </select>
                <span className="text-zinc-600">→</span>
                <span className="text-emerald-400/90 text-[11px]" title={`Delivery Day: ${deliveryDate}`}>
                  {deliveryDate.slice(5)}
                </span>
              </div>
            </div>

            {/* Subtle Cutoff Dropdown */}
            <div className="hidden md:flex items-center bg-white/[0.03] border border-white/[0.06] rounded-xl px-2.5 py-1.5 text-xs">
              <Clock className="w-3.5 h-3.5 text-zinc-400 mr-1.5" />
              <select
                value={cutoffTime}
                onChange={(e) => setCutoffTime(e.target.value)}
                className="bg-transparent text-zinc-300 font-mono text-[11px] focus:outline-none cursor-pointer"
              >
                {cutoffOptions.map((opt) => (
                  <option key={opt.value} value={opt.value} className="bg-[#0f121d] text-white">
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Export CSV Icon Button */}
            <a
              href={getExportCsvUrl(selectedDecisionDate, cutoffTime)}
              download
              className="p-2 rounded-xl bg-white/[0.03] hover:bg-white/[0.08] border border-white/[0.06] text-zinc-300 hover:text-white transition"
              title="Download Interval Snapshot as CSV"
            >
              <Download className="w-3.5 h-3.5" />
            </a>

            {/* Presentation Modes (Discreet, Professional Pills) */}
            <div className="flex items-center space-x-1 pl-2 border-l border-white/[0.06]">
              <button
                onClick={onOpenPitch}
                className="px-2.5 py-1.5 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 text-amber-400/90 border border-amber-500/20 text-[11px] font-semibold transition flex items-center space-x-1"
                title="Open Client Pitch Presentation Deck"
              >
                <Presentation className="w-3 h-3" />
                <span className="hidden sm:inline">Pitch</span>
              </button>

              <button
                onClick={onOpenTechReview}
                className="px-2.5 py-1.5 rounded-lg bg-violet-500/10 hover:bg-violet-500/20 text-violet-400/90 border border-violet-500/20 text-[11px] font-semibold transition flex items-center space-x-1"
                title="Open Technical Architecture Review"
              >
                <Terminal className="w-3 h-3" />
                <span className="hidden sm:inline">Tech Review</span>
              </button>
            </div>

          </div>

        </div>
      </div>
    </header>
  );
};
