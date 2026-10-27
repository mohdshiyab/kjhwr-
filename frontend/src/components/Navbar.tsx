import React from 'react';
import { Wind, Clock, Calendar, ShieldCheck, Flame, BarChart3, Presentation, Terminal } from 'lucide-react';

interface NavbarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  selectedGateClosure: string;
  setSelectedGateClosure: (gc: string) => void;
  selectedDate: string;
  setSelectedDate: (date: string) => void;
  isFullMonth: boolean;
  setIsFullMonth: (full: boolean) => void;
  availableDates: string[];
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  selectedGateClosure,
  setSelectedGateClosure,
  selectedDate,
  setSelectedDate,
  isFullMonth,
  setIsFullMonth,
  availableDates
}) => {
  const gateClosureOptions = [
    { id: 'da_1100', label: '11:00 AM D-1 (EPEX Day-Ahead Auction)' },
    { id: 'da_1200', label: '12:00 PM D-1 (Nord Pool N2EX Auction)' },
    { id: 'da_0700', label: '07:00 AM D-1 (Morning Trading Brief)' },
    { id: 'da_1400', label: '14:00 PM D-1 (Post-Auction Adjustment)' },
    { id: 'da_1700', label: '17:00 PM D-1 (End of Day Position)' },
    { id: 'intraday', label: 'Intraday (Latest Pre-Delivery)' }
  ];

  return (
    <header className="bg-slate-900/90 backdrop-blur border-b border-slate-800 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Platform Info */}
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-xl bg-gradient-to-br from-sky-500 to-emerald-500 text-slate-950 font-bold shadow-lg shadow-sky-500/20">
              <Wind className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-extrabold text-base tracking-tight text-white">
                  AERO<span className="text-sky-400">PROCURE</span>
                </span>
                <span className="text-xs px-2 py-0.5 rounded-full bg-sky-950/80 text-sky-400 border border-sky-800 font-mono">
                  Elexon BMRS
                </span>
                <span className="hidden sm:inline-flex text-xs px-2 py-0.5 rounded-full bg-emerald-950/80 text-emerald-400 border border-emerald-800">
                  Jan 2026 Live
                </span>
              </div>
              <p className="text-xs text-slate-400 hidden md:block">
                UK Day-Ahead Wholesale Electricity Procurement & Renewable Risk Analytics
              </p>
            </div>
          </div>

          {/* Controls: Date & Gate Closure */}
          <div className="flex items-center space-x-3">
            {/* Date Selector */}
            <div className="flex items-center bg-slate-800/80 border border-slate-700 rounded-lg p-1 text-xs">
              <button
                onClick={() => setIsFullMonth(true)}
                className={`px-2.5 py-1 rounded font-medium transition ${
                  isFullMonth ? 'bg-sky-600 text-white shadow' : 'text-slate-400 hover:text-white'
                }`}
              >
                Full Month (Jan 26)
              </button>
              <button
                onClick={() => setIsFullMonth(false)}
                className={`px-2.5 py-1 rounded font-medium transition flex items-center space-x-1 ${
                  !isFullMonth ? 'bg-sky-600 text-white shadow' : 'text-slate-400 hover:text-white'
                }`}
              >
                <Calendar className="w-3.5 h-3.5 mr-1" />
                <span>Single Day</span>
              </button>

              {!isFullMonth && (
                <select
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="bg-slate-900 border border-slate-700 text-slate-200 rounded px-2 py-0.5 ml-1 focus:outline-none focus:border-sky-500 font-mono text-xs"
                >
                  {availableDates.map((d) => (
                    <option key={d} value={d}>
                      {d}
                    </option>
                  ))}
                </select>
              )}
            </div>

            {/* Gate Closure Cutoff Selector */}
            <div className="hidden lg:flex items-center bg-slate-800/80 border border-slate-700 rounded-lg px-2.5 py-1 text-xs">
              <Clock className="w-3.5 h-3.5 text-sky-400 mr-1.5" />
              <span className="text-slate-400 mr-2">DA Gate Cutoff:</span>
              <select
                value={selectedGateClosure}
                onChange={(e) => setSelectedGateClosure(e.target.value)}
                className="bg-transparent text-sky-300 font-medium focus:outline-none cursor-pointer"
              >
                {gateClosureOptions.map((opt) => (
                  <option key={opt.id} value={opt.id} className="bg-slate-900 text-white">
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Tab Navigation Navigation Bar */}
        <div className="flex space-x-1 border-t border-slate-800/80 py-2 overflow-x-auto text-xs">
          <button
            onClick={() => setActiveTab('desk')}
            className={`flex items-center space-x-2 px-3 py-1.5 rounded-lg font-medium transition shrink-0 ${
              activeTab === 'desk'
                ? 'bg-sky-500/10 text-sky-400 border border-sky-500/30'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            <Wind className="w-4 h-4 text-sky-400" />
            <span>Day-Ahead Procurement Desk</span>
          </button>

          <button
            onClick={() => setActiveTab('analytics')}
            className={`flex items-center space-x-2 px-3 py-1.5 rounded-lg font-medium transition shrink-0 ${
              activeTab === 'analytics'
                ? 'bg-sky-500/10 text-sky-400 border border-sky-500/30'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            <BarChart3 className="w-4 h-4 text-emerald-400" />
            <span>Forecast Error Analytics</span>
          </button>

          <button
            onClick={() => setActiveTab('sensitivity')}
            className={`flex items-center space-x-2 px-3 py-1.5 rounded-lg font-medium transition shrink-0 ${
              activeTab === 'sensitivity'
                ? 'bg-sky-500/10 text-sky-400 border border-sky-500/30'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            <Clock className="w-4 h-4 text-indigo-400" />
            <span>Gate Closure Sensitivity</span>
          </button>

          <button
            onClick={() => setActiveTab('pitch')}
            className={`flex items-center space-x-2 px-3 py-1.5 rounded-lg font-medium transition shrink-0 ${
              activeTab === 'pitch'
                ? 'bg-amber-500/10 text-amber-400 border border-amber-500/30'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            <Presentation className="w-4 h-4 text-amber-400" />
            <span>Client Pitch (Part 1 Demo)</span>
          </button>

          <button
            onClick={() => setActiveTab('tech')}
            className={`flex items-center space-x-2 px-3 py-1.5 rounded-lg font-medium transition shrink-0 ${
              activeTab === 'tech'
                ? 'bg-violet-500/10 text-violet-400 border border-violet-500/30'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            <Terminal className="w-4 h-4 text-violet-400" />
            <span>Tech Lead Review (Part 2 Demo)</span>
          </button>
        </div>
      </div>
    </header>
  );
};
