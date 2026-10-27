import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { OverviewPage } from './pages/OverviewPage';
import { DecisionReplayPage } from './pages/DecisionReplayPage';
import { AnalyticsPage } from './pages/AnalyticsPage';
import { DataMethodPage } from './pages/DataMethodPage';
import { ClientPitchDeck } from './components/ClientPitchDeck';
import { TechLeadReview } from './components/TechLeadReview';

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
  const [activeScreen, setActiveScreen] = useState<'overview' | 'replay' | 'analytics' | 'method'>('replay');
  const [decisionDates, setDecisionDates] = useState<DecisionDateItem[]>([]);
  const [selectedDecisionDate, setSelectedDecisionDate] = useState<string>('2026-01-14');
  const [cutoffTime, setCutoffTime] = useState<string>('15:30');

  const [replayData, setReplayData] = useState<DecisionReplayResponse | null>(null);
  const [analyticsData, setAnalyticsData] = useState<AnalyticsSummaryResponse | null>(null);
  const [loadingReplay, setLoadingReplay] = useState<boolean>(true);
  const [loadingAnalytics, setLoadingAnalytics] = useState<boolean>(true);

  // Modals for video presentation guides
  const [showPitchModal, setShowPitchModal] = useState<boolean>(false);
  const [showTechModal, setShowTechModal] = useState<boolean>(false);

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

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans antialiased">
      {/* Top Navigation */}
      <Navbar
        activeScreen={activeScreen}
        setActiveScreen={setActiveScreen}
        decisionDates={decisionDates}
        selectedDecisionDate={selectedDecisionDate}
        setSelectedDecisionDate={setSelectedDecisionDate}
        cutoffTime={cutoffTime}
        setCutoffTime={setCutoffTime}
        onOpenPitch={() => setShowPitchModal(true)}
        onOpenTechReview={() => setShowTechModal(true)}
      />

      {/* Main Screen Layout */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
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
      </main>

      {/* Presentation Deck Modal (Part 1 Client Pitch) */}
      {showPitchModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="max-w-4xl w-full relative">
            <button
              onClick={() => setShowPitchModal(false)}
              className="absolute -top-10 right-0 text-slate-400 hover:text-white text-xs font-mono bg-slate-900 border border-slate-700 px-3 py-1 rounded-lg"
            >
              ✕ Close Pitch Deck
            </button>
            <ClientPitchDeck />
          </div>
        </div>
      )}

      {/* Technical Review Modal (Part 2 Tech Lead) */}
      {showTechModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="max-w-4xl w-full relative">
            <button
              onClick={() => setShowTechModal(false)}
              className="absolute -top-10 right-0 text-slate-400 hover:text-white text-xs font-mono bg-slate-900 border border-slate-700 px-3 py-1 rounded-lg"
            >
              ✕ Close Tech Review
            </button>
            <TechLeadReview />
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="bg-slate-900 border-t border-slate-800 py-6 mt-12 text-xs text-slate-400">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center space-x-2">
            <span className="font-extrabold text-white tracking-tight">
              Wind<span className="text-sky-400">Lens</span>
            </span>
            <span className="text-slate-500">•</span>
            <span>Day-Ahead Wind Forecast Intelligence Platform for UK Electricity Desks</span>
          </div>

          <div className="flex items-center space-x-4 font-mono text-[11px] text-slate-500">
            <span>Sources: Elexon BMRS FUELHH & WINDFOR</span>
            <span>•</span>
            <span>Decisions: Jan 1 - Jan 31, 2026 (Delivery: Jan 2 - Feb 1, 2026)</span>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default App;
