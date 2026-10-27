import React, { useState, useEffect } from 'react';
import { Navbar, ActiveScreen } from './components/Navbar';
import { OverviewPage } from './pages/OverviewPage';
import { DecisionReplayPage } from './pages/DecisionReplayPage';
import { AnalyticsPage } from './pages/AnalyticsPage';
import { DataMethodPage } from './pages/DataMethodPage';
import { ClientPitchDeck } from './components/ClientPitchDeck';
import { TechLeadReview } from './components/TechLeadReview';
import { ArrowLeft } from 'lucide-react';

import {
  fetchDecisionDates,
  fetchDecisionReplay,
  fetchAnalyticsSummary
} from './services/api';
import {
  DecisionDateItem,
  DecisionReplayResponse,
  AnalyticsSummaryResponse
} from './types';

export const App: React.FC = () => {
  // Screens: 'replay' (main), 'overview', 'analytics', 'method', 'pitch', 'tech'
  const [activeScreen, setActiveScreen] = useState<ActiveScreen>('replay');
  const [decisionDates, setDecisionDates] = useState<DecisionDateItem[]>([]);
  const [selectedDecisionDate, setSelectedDecisionDate] = useState<string>('2026-01-14');
  const [cutoffTime, setCutoffTime] = useState<string>('15:30');

  const [replayData, setReplayData] = useState<DecisionReplayResponse | null>(null);
  const [analyticsData, setAnalyticsData] = useState<AnalyticsSummaryResponse | null>(null);
  const [loadingReplay, setLoadingReplay] = useState<boolean>(true);
  const [loadingAnalytics, setLoadingAnalytics] = useState<boolean>(true);

  // Load decision dates on mount
  useEffect(() => {
    async function initDates() {
      try {
        const dates = await fetchDecisionDates();
        setDecisionDates(dates);
        if (dates.length > 0 && !dates.some((d) => d.decision_date === selectedDecisionDate)) {
          setSelectedDecisionDate(dates[13]?.decision_date || dates[0].decision_date);
        }
      } catch (err) {
        console.error('Failed to load decision dates:', err);
      }
    }
    initDates();
  }, []);

  // Fetch decision replay when date or cutoff changes
  useEffect(() => {
    async function loadReplay() {
      if (!selectedDecisionDate) return;
      setLoadingReplay(true);
      try {
        const data = await fetchDecisionReplay(selectedDecisionDate, cutoffTime);
        setReplayData(data);
      } catch (err) {
        console.error('Failed to load decision replay:', err);
      } finally {
        setLoadingReplay(false);
      }
    }
    loadReplay();
  }, [selectedDecisionDate, cutoffTime]);

  // Fetch month-long analytics when cutoff changes
  useEffect(() => {
    async function loadAnalytics() {
      setLoadingAnalytics(true);
      try {
        const data = await fetchAnalyticsSummary('2026-01-01', '2026-01-31', cutoffTime);
        setAnalyticsData(data);
      } catch (err) {
        console.error('Failed to load analytics summary:', err);
      } finally {
        setLoadingAnalytics(false);
      }
    }
    loadAnalytics();
  }, [cutoffTime]);

  // Date navigation helpers
  const handlePrevDate = () => {
    const idx = decisionDates.findIndex((d) => d.decision_date === selectedDecisionDate);
    if (idx > 0) {
      setSelectedDecisionDate(decisionDates[idx - 1].decision_date);
    }
  };

  const handleNextDate = () => {
    const idx = decisionDates.findIndex((d) => d.decision_date === selectedDecisionDate);
    if (idx >= 0 && idx < decisionDates.length - 1) {
      setSelectedDecisionDate(decisionDates[idx + 1].decision_date);
    }
  };

  const isPitchOrTech = activeScreen === 'pitch' || activeScreen === 'tech';

  return (
    <div className="min-h-screen bg-[#090b10] text-slate-100 flex flex-col font-sans selection:bg-sky-500 selection:text-white">
      {/* Top Navigation */}
      <Navbar
        activeScreen={activeScreen}
        setActiveScreen={setActiveScreen}
        decisionDates={decisionDates}
        selectedDecisionDate={selectedDecisionDate}
        setSelectedDecisionDate={setSelectedDecisionDate}
        cutoffTime={cutoffTime}
        setCutoffTime={setCutoffTime}
        onPrevDate={handlePrevDate}
        onNextDate={handleNextDate}
      />

      {/* Prominent Sticky Back Bar when in Presentation or Tech mode */}
      {isPitchOrTech && (
        <div className="bg-sky-950/80 border-b border-sky-800/80 py-2.5 px-4 sticky top-16 z-40 backdrop-blur shadow-lg">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <button
              onClick={() => setActiveScreen('replay')}
              className="inline-flex items-center space-x-2 px-4 py-2 bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold text-xs rounded-xl transition shadow-md shadow-sky-500/25 cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>← Back to WindLens Dashboard</span>
            </button>
            <div className="flex items-center space-x-2 text-xs text-sky-200">
              <span className="hidden sm:inline">Viewing:</span>
              <strong className="text-white">
                {activeScreen === 'pitch' ? 'Part 1: Client Pitch Presentation' : 'Part 2: Technical Architecture Review'}
              </strong>
            </div>
          </div>
        </div>
      )}

      {/* Main Screen Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-6">
        {activeScreen === 'overview' && (
          <OverviewPage
            replay={replayData}
            loading={loadingReplay}
            onNavigateToReplay={() => setActiveScreen('replay')}
            onNavigateToAnalytics={() => setActiveScreen('analytics')}
          />
        )}

        {activeScreen === 'replay' && (
          <DecisionReplayPage
            replay={replayData}
            loading={loadingReplay}
          />
        )}

        {activeScreen === 'analytics' && (
          <AnalyticsPage
            analytics={analyticsData}
            loading={loadingAnalytics}
            onSelectDecisionDate={(date) => {
              setSelectedDecisionDate(date);
              setActiveScreen('replay');
            }}
          />
        )}

        {activeScreen === 'method' && (
          <DataMethodPage
            selectedDecisionDate={selectedDecisionDate}
            cutoffTime={cutoffTime}
          />
        )}

        {activeScreen === 'pitch' && (
          <ClientPitchDeck onBack={() => setActiveScreen('replay')} />
        )}

        {activeScreen === 'tech' && (
          <TechLeadReview onBack={() => setActiveScreen('replay')} />
        )}
      </main>

      {/* Minimalist Clean Footer */}
      <footer className="border-t border-white/[0.06] py-5 mt-auto text-xs text-zinc-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center space-x-2">
            <span className="font-bold text-zinc-300">WindLens</span>
            <span>•</span>
            <span>Day-Ahead Wind Forecast Intelligence for Electricity Desks</span>
          </div>

          <div className="flex items-center space-x-3 text-[11px] font-mono text-zinc-500">
            <span>Elexon BMRS Public Data</span>
            <span>•</span>
            <span>GB Day-Ahead Jan 2026</span>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default App;
