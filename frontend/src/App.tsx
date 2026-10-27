import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { ExecutiveKPIs } from './components/ExecutiveKPIs';
import { DayAheadDesk } from './components/DayAheadDesk';
import { AccuracyAnalytics } from './components/AccuracyAnalytics';
import { GateClosureImpact } from './components/GateClosureImpact';
import { ClientPitchDeck } from './components/ClientPitchDeck';
import { TechLeadReview } from './components/TechLeadReview';

import {
  fetchSummary,
  fetchTimeSeries,
  fetchAccuracyMetrics,
  fetchAvailableDates
} from './services/api';
import {
  ExecutiveKPIs as KPIsType,
  TimeSeriesPoint,
  AccuracyAnalyticsResponse
} from './types';

export const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<string>('desk');
  const [selectedGateClosure, setSelectedGateClosure] = useState<string>('da_1100');
  const [selectedDate, setSelectedDate] = useState<string>('2026-01-15');
  const [isFullMonth, setIsFullMonth] = useState<boolean>(true);
  const [availableDates, setAvailableDates] = useState<string[]>([]);

  const [kpis, setKpis] = useState<KPIsType | null>(null);
  const [timeSeries, setTimeSeries] = useState<TimeSeriesPoint[]>([]);
  const [analytics, setAnalytics] = useState<AccuracyAnalyticsResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  // Load available dates on mount
  useEffect(() => {
    async function loadDates() {
      try {
        const dates = await fetchAvailableDates();
        if (dates.length > 0) {
          setAvailableDates(dates);
          if (!selectedDate || !dates.includes(selectedDate)) {
            setSelectedDate(dates[14] || dates[0]); // Jan 15 or first
          }
        }
      } catch (err) {
        console.error('Failed to load dates:', err);
      }
    }
    loadDates();
  }, []);

  // Fetch data when date, fullMonth, or gate closure changes
  useEffect(() => {
    async function loadData() {
      setLoading(true);
      try {
        const dateFrom = isFullMonth ? '2026-01-01' : selectedDate;
        const dateTo = isFullMonth ? '2026-01-31' : selectedDate;

        const [kpisRes, tsRes, analyticsRes] = await Promise.all([
          fetchSummary(dateFrom, dateTo, selectedGateClosure),
          fetchTimeSeries(dateFrom, dateTo, selectedGateClosure),
          fetchAccuracyMetrics(dateFrom, dateTo, selectedGateClosure)
        ]);

        setKpis(kpisRes);
        setTimeSeries(tsRes);
        setAnalytics(analyticsRes);
      } catch (err) {
        console.error('Error fetching dashboard data:', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [selectedDate, isFullMonth, selectedGateClosure]);

  const handleSelectDateFromCalendar = (date: string) => {
    setSelectedDate(date);
    setIsFullMonth(false);
    setActiveTab('desk');
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      {/* Top Navbar */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        selectedGateClosure={selectedGateClosure}
        setSelectedGateClosure={setSelectedGateClosure}
        selectedDate={selectedDate}
        setSelectedDate={setSelectedDate}
        isFullMonth={isFullMonth}
        setIsFullMonth={setIsFullMonth}
        availableDates={availableDates}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Top Executive KPI Row (always visible except on Pitch Deck) */}
        {activeTab !== 'pitch' && (
          <ExecutiveKPIs kpis={kpis} loading={loading} />
        )}

        {/* Dynamic Tab Views */}
        {activeTab === 'desk' && (
          <DayAheadDesk
            timeSeries={timeSeries}
            loading={loading}
            selectedDate={selectedDate}
            selectedGateClosure={selectedGateClosure}
            isFullMonth={isFullMonth}
            onSelectDate={handleSelectDateFromCalendar}
          />
        )}

        {activeTab === 'analytics' && (
          <AccuracyAnalytics
            analytics={analytics}
            loading={loading}
            onSelectDate={handleSelectDateFromCalendar}
          />
        )}

        {activeTab === 'sensitivity' && <GateClosureImpact />}

        {activeTab === 'pitch' && <ClientPitchDeck />}

        {activeTab === 'tech' && <TechLeadReview />}
      </main>

      {/* Footer */}
      <footer className="bg-slate-900 border-t border-slate-800 py-6 mt-12 text-xs text-slate-400">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center space-x-2">
            <span className="font-bold text-white tracking-tight">
              AERO<span className="text-sky-400">PROCURE</span>
            </span>
            <span className="text-slate-500">•</span>
            <span>UK Day-Ahead Electricity Market & Renewable Forecast Analytics</span>
          </div>

          <div className="flex items-center space-x-4 font-mono text-[11px] text-slate-500">
            <span>Source: Elexon BMRS (FUELHH & WINDFOR)</span>
            <span>•</span>
            <span>Decision Horizon: January 2026</span>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default App;
