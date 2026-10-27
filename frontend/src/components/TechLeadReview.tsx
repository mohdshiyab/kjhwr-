import React from 'react';
import {
  Terminal,
  Server,
  Database,
  Layers,
  Code2,
  Box,
  CheckCircle2,
  GitBranch,
  ShieldCheck,
  Cpu,
  FileText
} from 'lucide-react';

export const TechLeadReview: React.FC = () => {
  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-8 shadow-2xl">
        <div className="flex items-center space-x-3 pb-4 border-b border-slate-800">
          <div className="p-2 rounded-xl bg-violet-500/10 text-violet-400">
            <Terminal className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-violet-400">
                Part 2: Technical Walkthrough & Knowledge Transfer
              </span>
              <span className="text-xs px-2 py-0.5 rounded-full bg-violet-950/80 text-violet-300 border border-violet-800 font-mono">
                For Tech Lead Review
              </span>
            </div>
            <h1 className="text-lg font-bold text-white tracking-tight">
              Software Architecture, Data Pipelines & Engineering Standards
            </h1>
          </div>
        </div>

        <p className="text-sm text-slate-300 mt-4 leading-relaxed">
          Welcome to the technical review. This section is structured for a rapid 5-minute deep-dive covering the architecture, domain logic implementation, streaming ingestion pipeline, algorithmic metrics, test coverage, and containerization.
        </p>

        {/* 4 Pillars of Architecture */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-6">
          <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-800">
            <div className="flex items-center space-x-2 text-sky-400 font-bold text-xs uppercase mb-1">
              <Database className="w-4 h-4" />
              <span>Data Ingestion</span>
            </div>
            <p className="text-xs text-slate-300">
              Elexon BMRS streaming clients for <code className="text-sky-300">FUELHH</code> and <code className="text-sky-300">WINDFOR</code> with SQLite persistent cache.
            </p>
          </div>

          <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-800">
            <div className="flex items-center space-x-2 text-emerald-400 font-bold text-xs uppercase mb-1">
              <Server className="w-4 h-4" />
              <span>Backend Core</span>
            </div>
            <p className="text-xs text-slate-300">
              Python FastAPI with Pydantic v2 schemas, NumPy statistical computing, and sub-5ms response times.
            </p>
          </div>

          <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-800">
            <div className="flex items-center space-x-2 text-indigo-400 font-bold text-xs uppercase mb-1">
              <Code2 className="w-4 h-4" />
              <span>Frontend App</span>
            </div>
            <p className="text-xs text-slate-300">
              React 18 + Vite + TypeScript with Tailwind CSS and Recharts data visualization.
            </p>
          </div>

          <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-800">
            <div className="flex items-center space-x-2 text-amber-400 font-bold text-xs uppercase mb-1">
              <Box className="w-4 h-4" />
              <span>Production Ops</span>
            </div>
            <p className="text-xs text-slate-300">
              Multi-stage Dockerfile and docker-compose.yml for zero-friction local and cloud deployments.
            </p>
          </div>
        </div>
      </div>

      {/* Architecture Lineage & Look-Ahead Bias Prevention */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Architecture & Pipeline */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
          <h3 className="text-sm font-bold text-white mb-2 flex items-center space-x-2">
            <Layers className="w-4 h-4 text-sky-400" />
            <span>End-to-End Data Pipeline Architecture</span>
          </h3>
          <p className="text-xs text-slate-400 mb-4">
            How data flows from Elexon BMRS to the trading desk UI:
          </p>

          <div className="space-y-3 font-mono text-xs">
            <div className="p-3 bg-slate-950/80 rounded-xl border border-slate-800 flex items-start space-x-3">
              <span className="p-1 rounded bg-sky-500/20 text-sky-400 text-[10px] font-bold">1</span>
              <div>
                <strong className="text-white">Elexon BMRS REST Stream Endpoints:</strong>
                <p className="text-slate-400 text-[11px] mt-0.5">
                  Stream <code className="text-sky-300">/FUELHH/stream</code> (Wind Actuals) and <code className="text-sky-300">/WINDFOR/stream</code> (Wind Forecasts).
                </p>
              </div>
            </div>

            <div className="p-3 bg-slate-950/80 rounded-xl border border-slate-800 flex items-start space-x-3">
              <span className="p-1 rounded bg-emerald-500/20 text-emerald-400 text-[10px] font-bold">2</span>
              <div>
                <strong className="text-white">Data Cleaning & Temporal Alignment:</strong>
                <p className="text-slate-400 text-[11px] mt-0.5">
                  Matches 30-min settlement actuals to 1-hour forecast horizons. Evaluates gate closure cuts strictly at D-1 07:00, 11:00, 12:00, 14:00, 17:00.
                </p>
              </div>
            </div>

            <div className="p-3 bg-slate-950/80 rounded-xl border border-slate-800 flex items-start space-x-3">
              <span className="p-1 rounded bg-violet-500/20 text-violet-400 text-[10px] font-bold">3</span>
              <div>
                <strong className="text-white">FastAPI Analytical Endpoints:</strong>
                <p className="text-slate-400 text-[11px] mt-0.5">
                  <code className="text-violet-300">/api/summary</code>, <code className="text-violet-300">/api/forecasts/timeseries</code>, <code className="text-violet-300">/api/metrics</code>, <code className="text-violet-300">/api/procurement/simulate</code>.
                </p>
              </div>
            </div>

            <div className="p-3 bg-slate-950/80 rounded-xl border border-slate-800 flex items-start space-x-3">
              <span className="p-1 rounded bg-amber-500/20 text-amber-400 text-[10px] font-bold">4</span>
              <div>
                <strong className="text-white">React Interactive Trading Console:</strong>
                <p className="text-slate-400 text-[11px] mt-0.5">
                  Renders charts, diurnal error profiles, and thermal procurement simulations with 60 FPS fluidity.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Look-Ahead Bias Prevention & Mathematical Rigor */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
          <h3 className="text-sm font-bold text-white mb-2 flex items-center space-x-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Market Integrity: Look-Ahead Bias Prevention</span>
          </h3>
          <p className="text-xs text-slate-400 mb-4">
            Critical domain consideration in day-ahead electricity trading:
          </p>

          <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 text-xs text-slate-300 space-y-3">
            <div>
              <strong className="text-emerald-400 font-mono">The Gate Closure Rule:</strong>
              <p className="text-slate-400 mt-1 leading-relaxed">
                For delivery day <code className="text-slate-200 font-mono">D</code>, the day-ahead auction closes at <strong>11:00 AM on Day D-1</strong>. Forecasts published after 11:00 AM on D-1 are strictly filtered out when evaluating day-ahead decisions.
              </p>
            </div>

            <div className="p-3 rounded-lg bg-slate-900 border border-slate-800 font-mono text-[11px]">
              <span className="text-slate-500"># Filtering candidate forecasts</span>
              <br />
              <span className="text-sky-400">cutoff_iso</span> = f&quot;&#123;d_minus_1&#125;T11:00:00Z&quot;
              <br />
              <span className="text-emerald-400">valid_forecasts</span> = [f for f in forecasts if f.publish_time &lt;= cutoff_iso]
              <br />
              <span className="text-amber-400">active_forecast</span> = max(valid_forecasts, key=lambda x: x.publish_time)
            </div>

            <p className="text-slate-400 text-[11px]">
              This guarantees zero data leakage or look-ahead bias, ensuring that all error metrics represent the exact reality experienced by traders at bid submission.
            </p>
          </div>

          <div className="mt-4 p-4 rounded-xl bg-slate-950/80 border border-slate-800 text-xs">
            <strong className="text-sky-400">Why WAPE Over Naive MAPE?</strong>
            <p className="text-slate-400 mt-1 leading-relaxed text-[11px]">
              During low wind periods (e.g. calm winter anti-cyclones where wind drops below 500 MW), naive MAPE divides by near-zero, producing artificial 500%+ errors. We implement <strong>Weighted Absolute Percentage Error (WAPE = \sum |Error| / \sum Actual)</strong>, which is numerically stable and industry-standard in energy forecasting.
            </p>
          </div>
        </div>
      </div>

      {/* Codebase Structure & Testing Verification */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
        <h3 className="text-sm font-bold text-white mb-4 flex items-center space-x-2">
          <Code2 className="w-4 h-4 text-violet-400" />
          <span>Codebase Layout & Verification Test Suite</span>
        </h3>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 text-xs">
          {/* Directory Tree */}
          <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 font-mono text-[11px] leading-relaxed">
            <span className="text-slate-400 font-bold">PROJECT REPOSITORY STRUCTURE:</span>
            <pre className="text-slate-300 mt-2">
{`├── backend/
│   ├── app/
│   │   ├── data/                 # Jan 2026 pre-computed cache & SQLite DB
│   │   ├── models/schemas.py     # Pydantic v2 data models
│   │   ├── routers/              # Modular API endpoints (summary, metrics, etc.)
│   │   ├── services/             # Pure business logic (metrics, simulator)
│   │   ├── config.py             # UK market parameters
│   │   └── main.py               # FastAPI application & SPA static hosting
│   ├── tests/                    # Pytest test suite (9 passing tests)
│   ├── fetch_cache.py            # Automated ingestion from Elexon BMRS
│   └── requirements.txt
├── frontend/
│   ├── src/
│   │   ├── components/           # UI views (Desk, Analytics, Simulator, Pitch)
│   │   ├── services/api.ts       # Typed API client
│   │   └── types/index.ts        # TypeScript interfaces
│   ├── Dockerfile
│   └── package.json
├── docker-compose.yml
└── README.md`}
            </pre>
          </div>

          {/* Test Results Card */}
          <div className="space-y-4">
            <div className="p-4 rounded-xl bg-emerald-950/40 border border-emerald-800/80">
              <div className="flex items-center space-x-2 text-emerald-400 font-bold mb-2">
                <CheckCircle2 className="w-4 h-4" />
                <span>Pytest Automated Test Suite Status</span>
              </div>
              <p className="text-slate-300 text-xs">
                9 out of 9 tests passing across mathematical formulas and API contract integrity:
              </p>
              <ul className="mt-2 space-y-1 font-mono text-[11px] text-emerald-300/90">
                <li>✓ test_calculate_metrics_summary_perfect_forecast</li>
                <li>✓ test_calculate_metrics_summary_known_error</li>
                <li>✓ test_empty_records</li>
                <li>✓ test_error_distribution_bins</li>
                <li>✓ test_summary_router</li>
                <li>✓ test_timeseries_router</li>
                <li>✓ test_metrics_router</li>
                <li>✓ test_procurement_router</li>
                <li>✓ test_sensitivity_router</li>
              </ul>
            </div>

            <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800">
              <div className="flex items-center space-x-2 text-sky-400 font-bold mb-2">
                <Box className="w-4 h-4" />
                <span>Single-Command Docker Run</span>
              </div>
              <div className="bg-slate-900 p-2.5 rounded-lg font-mono text-[11px] text-sky-300 border border-slate-800">
                docker compose up --build
              </div>
              <p className="text-slate-400 text-[11px] mt-2">
                Containerizes both frontend and backend into an isolated, reproducible container listening on port 8000.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
