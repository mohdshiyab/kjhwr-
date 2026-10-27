import React from 'react';
import {
  Wind,
  Clock,
  Calendar,
  ChevronLeft,
  ChevronRight,
  Download,
  BarChart2,
  HelpCircle,
  FileText,
  Terminal,
  Activity
} from 'lucide-react';
import { DecisionDateItem } from '../types';
import { getExportCsvUrl } from '../services/api';

export type ActiveScreen = 'replay' | 'overview' | 'analytics' | 'method' | 'pitch' | 'tech';

interface NavbarProps {
  activeScreen: ActiveScreen;
  setActiveScreen: (screen: ActiveScreen) => void;
  decisionDates: DecisionDateItem[];
  selectedDecisionDate: string;
  setSelectedDecisionDate: (date: string) => void;
  cutoffTime: string;
  setCutoffTime: (time: string) => void;
  onPrevDate?: () => void;
  onNextDate?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeScreen,
  setActiveScreen,
  decisionDates,
  selectedDecisionDate,
  setSelectedDecisionDate,
  cutoffTime,
  setCutoffTime,
  onPrevDate,
  onNextDate
}) => {
  const currentItem = decisionDates.find((d) => d.decision_date === selectedDecisionDate);
  const deliveryDate = currentItem ? currentItem.delivery_date : '2026-01-15';

  const currentIndex = decisionDates.findIndex((d) => d.decision_date === selectedDecisionDate);
  const canGoPrev = currentIndex > 0;
  const canGoNext = currentIndex >= 0 && currentIndex < decisionDates.length - 1;

  const cutoffOptions = [
    { value: '15:30', label: '15:30 GMT (EPEX GB DA • Default)' },
    { value: '11:00', label: '11:00 GMT (EPEX Hourly)' },
    { value: '12:00', label: '12:00 GMT (Nord Pool N2EX)' },
    { value: '09:20', label: '09:20 GMT (EPEX Morning)' }
  ];

  return (
    <header className="border-b border-white/[0.08] bg-[#0b0d14]/95 backdrop-blur sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16 gap-3">
          
          {/* Logo & Product Name */}
          <div
            onClick={() => setActiveScreen('replay')}
            className="flex items-center space-x-2.5 cursor-pointer group shrink-0"
            title="Click to return to Main Dashboard"
          >
            <div className="w-8 h-8 rounded-lg bg-sky-500/15 border border-sky-500/30 flex items-center justify-center text-sky-400 group-hover:bg-sky-500/25 transition">
              <Wind className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center space-x-1.5">
                <span className="font-bold text-sm tracking-tight text-white group-hover:text-sky-300 transition">
                  WindLens
                </span>
                <span className="text-[10px] px-1.5 py-0.2 rounded bg-sky-500/10 text-sky-400 font-mono font-medium border border-sky-500/20">
                  Jan 2026
                </span>
              </div>
              <p className="text-[10px] text-zinc-400 hidden md:block">
                Day-Ahead Wind Forecast Intelligence
              </p>
            </div>
          </div>

          {/* Clean Date Navigator (< [Date Picker] >) */}
          <div className="flex items-center bg-white/[0.03] border border-white/[0.08] rounded-xl p-1 text-xs">
            <button
              onClick={onPrevDate}
              disabled={!canGoPrev}
              className={`p-1.5 rounded-lg transition ${
                canGoPrev ? 'text-zinc-300 hover:text-white hover:bg-white/[0.06] cursor-pointer' : 'text-zinc-600 cursor-not-allowed'
              }`}
              title="Previous Day"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            <div className="flex items-center space-x-1 px-2 font-mono">
              <Calendar className="w-3.5 h-3.5 text-sky-400 shrink-0 mr-1" />
              <select
                value={selectedDecisionDate}
                onChange={(e) => setSelectedDecisionDate(e.target.value)}
                className="bg-transparent text-white font-medium text-xs focus:outline-none cursor-pointer pr-1"
                title="Select Decision Date"
              >
                {decisionDates.map((d) => (
                  <option key={d.decision_date} value={d.decision_date} className="bg-[#10131d] text-white">
                    {d.decision_date} (for {d.delivery_date.slice(5)})
                  </option>
                ))}
              </select>
            </div>

            <button
              onClick={onNextDate}
              disabled={!canGoNext}
              className={`p-1.5 rounded-lg transition ${
                canGoNext ? 'text-zinc-300 hover:text-white hover:bg-white/[0.06] cursor-pointer' : 'text-zinc-600 cursor-not-allowed'
              }`}
              title="Next Day"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {/* Minimalist Navigation Tabs */}
          <nav className="hidden lg:flex items-center space-x-1 text-xs">
            <button
              onClick={() => setActiveScreen('replay')}
              className={`px-3 py-1.5 rounded-lg font-medium transition ${
                activeScreen === 'replay'
                  ? 'bg-sky-500/20 text-sky-300 border border-sky-500/30'
                  : 'text-zinc-400 hover:text-white hover:bg-white/[0.04]'
              }`}
            >
              Decision Replay
            </button>

            <button
              onClick={() => setActiveScreen('overview')}
              className={`px-3 py-1.5 rounded-lg font-medium transition ${
                activeScreen === 'overview'
                  ? 'bg-sky-500/20 text-sky-300 border border-sky-500/30'
                  : 'text-zinc-400 hover:text-white hover:bg-white/[0.04]'
              }`}
            >
              Overview
            </button>

            <button
              onClick={() => setActiveScreen('analytics')}
              className={`px-3 py-1.5 rounded-lg font-medium transition ${
                activeScreen === 'analytics'
                  ? 'bg-sky-500/20 text-sky-300 border border-sky-500/30'
                  : 'text-zinc-400 hover:text-white hover:bg-white/[0.04]'
              }`}
            >
              Accuracy Trends
            </button>

            <button
              onClick={() => setActiveScreen('method')}
              className={`px-3 py-1.5 rounded-lg font-medium transition ${
                activeScreen === 'method'
                  ? 'bg-sky-500/20 text-sky-300 border border-sky-500/30'
                  : 'text-zinc-400 hover:text-white hover:bg-white/[0.04]'
              }`}
            >
              Methodology
            </button>
          </nav>

          {/* Right Action Tools: Cutoff, Export, Presentations */}
          <div className="flex items-center space-x-2 shrink-0">
            {/* Cutoff selection (subtle) */}
            <div className="hidden sm:flex items-center bg-white/[0.03] border border-white/[0.08] rounded-xl px-2.5 py-1.5 text-[11px] text-zinc-300">
              <Clock className="w-3.5 h-3.5 text-zinc-400 mr-1.5" />
              <select
                value={cutoffTime}
                onChange={(e) => setCutoffTime(e.target.value)}
                className="bg-transparent text-zinc-200 font-mono focus:outline-none cursor-pointer"
                title="Change Auction Gate Closure Cutoff"
              >
                {cutoffOptions.map((opt) => (
                  <option key={opt.value} value={opt.value} className="bg-[#10131d] text-white">
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>

            {/* CSV Export */}
            <a
              href={getExportCsvUrl(selectedDecisionDate, cutoffTime)}
              download
              className="p-2 rounded-xl bg-white/[0.03] hover:bg-white/[0.08] border border-white/[0.08] text-zinc-300 hover:text-white transition"
              title="Download Data as CSV"
            >
              <Download className="w-3.5 h-3.5" />
            </a>

            {/* Presentation & Tech Mode Buttons */}
            <div className="flex items-center space-x-1 pl-2 border-l border-white/[0.08]">
              <button
                onClick={() => setActiveScreen('pitch')}
                className={`px-2.5 py-1.5 rounded-lg text-xs font-medium transition ${
                  activeScreen === 'pitch'
                    ? 'bg-amber-500 text-slate-950 font-bold shadow-md shadow-amber-500/20'
                    : 'bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/20'
                }`}
                title="Client Pitch Presentation"
              >
                Pitch
              </button>

              <button
                onClick={() => setActiveScreen('tech')}
                className={`px-2.5 py-1.5 rounded-lg text-xs font-medium transition ${
                  activeScreen === 'tech'
                    ? 'bg-violet-500 text-white font-bold shadow-md shadow-violet-500/20'
                    : 'bg-violet-500/10 hover:bg-violet-500/20 text-violet-300 border border-violet-500/20'
                }`}
                title="Technical Architecture Review"
              >
                Tech Review
              </button>
            </div>

          </div>

        </div>
      </div>
    </header>
  );
};
