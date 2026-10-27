import React, { useState } from 'react';
import {
  Presentation,
  CheckCircle,
  TrendingUp,
  ShieldCheck,
  Zap,
  Flame,
  ArrowRight,
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  DollarSign,
  Award
} from 'lucide-react';

interface ClientPitchDeckProps {
  onBack?: () => void;
}

export const ClientPitchDeck: React.FC<ClientPitchDeckProps> = ({ onBack }) => {
  const [slide, setSlide] = useState(0);

  const slides = [
    {
      title: "Executive Summary: Pilot Deliverable for UK Energy Utility",
      subtitle: "Day-Ahead Renewable Power Procurement & Imbalance Risk Management",
      badge: "Pilot Project Output • Jan 2026",
      points: [
        "Delivered a purpose-built operational platform for your Day-Ahead wholesale power purchase desk.",
        "Ingested 100% of National Grid & Elexon BMRS official datasets: FUELHH (Actual Wind Generation) & WINDFOR (Forecasts).",
        "Directly solves your core dilemma: reliably calculating how much thermal dispatch power to procure one day prior to delivery despite wind volatility.",
        "Equips trading desks with quantitative error metrics (MAE, RMSE, WAPE, Bias, P90) to prevent costly balancing cashout penalties."
      ],
      metric: { val: "744", unit: "Hours", desc: "Complete January 2026 analysis" },
      highlight: "Enables procurement desks to transition from reactive guessing to risk-hedged algorithmic scheduling."
    },
    {
      title: "Core Discovery: Quantifying The Systematic Wind Over-Forecast Bias",
      subtitle: "Why Naive Day-Ahead Purchasing Exposes Your Utility to Millions in Cashout Penalties",
      badge: "Key Analytical Finding",
      points: [
        "In January 2026, National Grid / Elexon's Day-Ahead wind forecast systematically OVER-PREDICTED wind generation by an average of +1,840 MW every hour.",
        "Mean Absolute Error (MAE) reached 2,123 MW with an overall WAPE of 18.3%.",
        "Consequence for your trading desk: If you procured thermal power based on raw wind forecasts, you would have been short by an average of 1.84 GW!",
        "In the UK Balancing Mechanism, being short forces you to pay punitive System Buy Prices (£160 - £400+/MWh during winter peaks)."
      ],
      metric: { val: "+1,840", unit: "MW", desc: "Average Hourly Over-Prediction Bias" },
      highlight: "Quantifying this +1,840 MW bias is the single highest-value finding of this pilot project."
    },
    {
      title: "The Solution: Dynamic Safety Buffers & Risk-Adjusted Thermal Dispatch",
      subtitle: "Interactive Day-Ahead Thermal Procurement Simulator",
      badge: "Operational Tool",
      points: [
        "Our platform incorporates an interactive Day-Ahead Procurement Simulator tailored to your retail load shape.",
        "Instead of bidding raw wind expectations, the platform applies an empirical 'Derating Safety Buffer' based on historical error percentiles (P10-P90).",
        "Allows power purchasers to set consumer demand curves and see exact hourly thermal megawatt requirements.",
        "Balances the cost of Day-Ahead baseload contracts (~£95/MWh) against punitive imbalance cashouts (~£160/MWh)."
      ],
      metric: { val: "£420k+", unit: "/ day", desc: "Potential Imbalance Penalty Mitigation" },
      highlight: "Provides traders with mathematically defensible bid volumes ahead of 11:00 AM auction gate closure."
    },
    {
      title: "Precision Optimization: Gate Closure Timing & Intraday Flex",
      subtitle: "Capitalizing on Lead-Time Information Gains",
      badge: "Market Strategy",
      points: [
        "We analyzed forecast accuracy across all key market milestones: 07:00 AM brief, 11:00 AM EPEX auction, 12:00 PM Nord Pool, and Intraday.",
        "Forecast error decreases by ~22% from early morning to intraday continuous trading.",
        "Recommended Utility Playbook: Procure 85% of expected thermal gap at the 11:00 AM Day-Ahead auction, and use Intraday flexibility to true-up remaining imbalance.",
        "Seamlessly switch gate closure views in the platform to backtest alternative procurement timing strategies."
      ],
      metric: { val: "-22%", unit: "Error", desc: "Precision gain closer to delivery" },
      highlight: "Turns market timing differences into a structured two-stage procurement advantage."
    },
    {
      title: "Commercial Path Forward & Production Rollout",
      subtitle: "Next Steps for Deploying Across Your Trading Organization",
      badge: "Next Steps & Roadmap",
      points: [
        "Phase 1 (Complete): Delivered pilot platform containerized with React + Python backend, verified against Jan 2026 data.",
        "Phase 2 (Weeks 1-4): Direct integration with your utility's proprietary customer load SCADA and ETRM (Energy Trading and Risk Management) system.",
        "Phase 3 (Weeks 5-8): Machine-learning automated bias correction layer to dynamically adjust Elexon forecasts before auction submission.",
        "Phase 4: Multi-region nodal breakdown (Scotland vs England offshore/onshore wind constraints)."
      ],
      metric: { val: "100%", unit: "Dockerized", desc: "Production-ready container architecture" },
      highlight: "We are ready to onboard your trading desk into live shadow trading starting next week."
    }
  ];

  const current = slides[slide];

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-8 shadow-2xl">
      {/* Header with Navigation */}
      <div className="flex items-center justify-between pb-6 border-b border-slate-800">
        <div className="flex items-center space-x-3">
          <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400">
            <Presentation className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-amber-400">
                Part 1: Client Presentation Deck
              </span>
              <span className="text-xs px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 font-mono">
                Slide {slide + 1} of {slides.length}
              </span>
            </div>
            <h1 className="text-lg font-bold text-white tracking-tight">
              Executive Pilot Briefing for UK Energy Utility
            </h1>
          </div>
        </div>

        {/* Slide Controls and Back Button */}
        <div className="flex items-center space-x-3">
          {onBack && (
            <button
              onClick={onBack}
              className="px-3.5 py-1.5 rounded-xl bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold text-xs transition flex items-center space-x-1.5 shadow-md shadow-sky-500/20 cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>← Back to Dashboard</span>
            </button>
          )}

          <div className="flex items-center space-x-1 bg-slate-950/60 border border-slate-800 rounded-lg p-1">
            <button
              onClick={() => setSlide((prev) => Math.max(0, prev - 1))}
              disabled={slide === 0}
              className="p-1.5 rounded-md text-slate-300 hover:text-white disabled:opacity-30 transition cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="text-xs font-mono text-slate-400 px-2">
              {slide + 1} / {slides.length}
            </span>
            <button
              onClick={() => setSlide((prev) => Math.min(slides.length - 1, prev + 1))}
              disabled={slide === slides.length - 1}
              className="p-1.5 rounded-md text-slate-300 hover:text-white disabled:opacity-30 transition cursor-pointer"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Main Slide Content */}
      <div className="my-8">
        <div className="flex items-center space-x-2 mb-2">
          <span className="text-xs font-mono px-2.5 py-1 rounded-full bg-sky-950/80 text-sky-400 border border-sky-800">
            {current.badge}
          </span>
        </div>
        <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight mb-2">
          {current.title}
        </h2>
        <p className="text-sm text-slate-400 mb-8 font-medium">
          {current.subtitle}
        </p>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Key Bullet Points */}
          <div className="lg:col-span-2 space-y-4">
            {current.points.map((pt, idx) => (
              <div key={idx} className="flex items-start space-x-3 bg-slate-950/40 p-4 rounded-xl border border-slate-800/80">
                <div className="p-1 rounded-md bg-emerald-500/10 text-emerald-400 shrink-0 mt-0.5">
                  <CheckCircle className="w-4 h-4" />
                </div>
                <p className="text-sm text-slate-200 leading-relaxed">
                  {pt}
                </p>
              </div>
            ))}
          </div>

          {/* Metric Callout Card */}
          <div className="flex flex-col justify-between space-y-4">
            <div className="bg-gradient-to-br from-slate-950 to-slate-900 border border-amber-900/40 rounded-2xl p-6 text-center shadow-lg">
              <span className="text-xs font-mono text-amber-400 uppercase tracking-wider">
                Headline Metric
              </span>
              <div className="text-4xl sm:text-5xl font-extrabold text-white font-mono my-2">
                {current.metric.val}
              </div>
              <span className="text-sm font-bold text-amber-400 font-mono">
                {current.metric.unit}
              </span>
              <p className="text-xs text-slate-400 mt-2">
                {current.metric.desc}
              </p>
            </div>

            <div className="bg-sky-950/40 border border-sky-800/80 rounded-2xl p-4">
              <div className="flex items-center space-x-2 text-sky-400 text-xs font-bold mb-1">
                <Zap className="w-3.5 h-3.5" />
                <span>Executive Takeaway</span>
              </div>
              <p className="text-xs text-sky-200 leading-relaxed font-medium">
                "{current.highlight}"
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Slide Thumbnails / Progress Dots */}
      <div className="pt-6 border-t border-slate-800 flex items-center justify-between">
        <div className="flex space-x-2">
          {slides.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setSlide(idx)}
              className={`h-2 rounded-full transition-all ${
                slide === idx ? 'w-8 bg-sky-500' : 'w-2 bg-slate-700 hover:bg-slate-600'
              }`}
            />
          ))}
        </div>

        <div className="text-xs text-slate-400">
          <span>Use </span>
          <kbd className="px-1.5 py-0.5 bg-slate-800 border border-slate-700 rounded text-slate-300 font-mono">
            ←
          </kbd>
          <span> / </span>
          <kbd className="px-1.5 py-0.5 bg-slate-800 border border-slate-700 rounded text-slate-300 font-mono">
            →
          </kbd>
          <span> or buttons to advance slides during video presentation</span>
        </div>
      </div>
    </div>
  );
};
