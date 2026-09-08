import React, { useState } from 'react';
import { ShieldCheck, ArrowRight, CheckCircle2, Zap, Navigation, Sparkles } from 'lucide-react';
import { useSimulation } from '../../context/SimulationContext';
import { useCityFlow } from '../../context/CityFlowContext';
import { RouteExplanationPanel } from '../routeshield/RouteExplanationPanel';

export const ContingencyCard: React.FC = () => {
  const { simulationResult } = useSimulation();
  const { setSelectedRoute, setActivePage } = useCityFlow();
  const [explainOpen, setExplainOpen] = useState(false);

  if (!simulationResult) return null;

  const { contingencyRoute, contingencyMessage, keyInsights } = simulationResult;

  const handleCommitContingency = () => {
    setSelectedRoute(contingencyRoute);
    setActivePage('dashboard');
  };

  return (
    <>
      <div className="bg-[#ecfdf5] border border-emerald-300 rounded-2xl p-6 shadow-sm text-left">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pb-4 mb-4 border-b border-emerald-200/80">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 rounded-xl bg-white border border-emerald-300 flex items-center justify-center text-[#166534] shadow-sm">
              <ShieldCheck className="w-7 h-7" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-emerald-100 text-[#166534]">
                  OPTIMAL CONTINGENCY IDENTIFIED
                </span>
              </div>
              <h3 className="text-xl font-extrabold text-slate-900 mt-1">
                Recommended: {contingencyRoute.name}
              </h3>
              <p className="text-xs text-slate-600 font-medium mt-0.5">
                {contingencyMessage}
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button
              id="why-contingency-btn"
              type="button"
              onClick={() => setExplainOpen(true)}
              className="px-4 py-2.5 rounded-xl bg-white hover:bg-emerald-50 border border-emerald-300 text-[#166534] font-bold text-xs flex items-center space-x-1.5 shadow-sm transition cursor-pointer"
            >
              <Sparkles className="w-4 h-4 text-[#166534]" />
              <span>Why This Route?</span>
            </button>

            <button
              id="commit-contingency-btn"
              onClick={handleCommitContingency}
              className="px-5 py-2.5 rounded-xl bg-[#166534] hover:bg-[#14532d] text-white font-bold text-xs tracking-wider uppercase flex items-center space-x-2 shadow-sm transition"
            >
              <Navigation className="w-4 h-4 fill-white text-white" />
              <span>Apply Contingency to Map</span>
            </button>
          </div>
        </div>

      {/* Contingency telemetry highlights */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
        <div className="bg-white p-3 rounded-xl border border-emerald-200 shadow-sm">
          <span className="text-[10px] uppercase text-slate-500 block font-bold">Resilient ETA</span>
          <span className="text-lg font-mono font-bold text-slate-900">{contingencyRoute.currentEtaMin} min</span>
          <span className="text-[10px] text-[#166534] block font-semibold">Only +2 min storm variance</span>
        </div>
        <div className="bg-white p-3 rounded-xl border border-emerald-200 shadow-sm">
          <span className="text-[10px] uppercase text-slate-500 block font-bold">Reliability Index</span>
          <span className="text-lg font-mono font-bold text-[#166534]">{contingencyRoute.reliabilityScore} / 100</span>
          <span className="text-[10px] text-slate-500 block">Top stability tier</span>
        </div>
        <div className="bg-white p-3 rounded-xl border border-emerald-200 shadow-sm">
          <span className="text-[10px] uppercase text-slate-500 block font-bold">Delay Probability</span>
          <span className="text-lg font-mono font-bold text-blue-700">{contingencyRoute.delayRiskPercent}%</span>
          <span className="text-[10px] text-slate-500 block">Lowest vulnerability</span>
        </div>
        <div className="bg-white p-3 rounded-xl border border-emerald-200 shadow-sm">
          <span className="text-[10px] uppercase text-slate-500 block font-bold">Clearance Status</span>
          <span className="text-xs font-mono font-bold text-[#166534] flex items-center space-x-1 mt-1">
            <CheckCircle2 className="w-4 h-4 text-[#166534]" />
            <span>APPROVED (5.2m)</span>
          </span>
          <span className="text-[10px] text-slate-500 block">Viaduct bypass safe</span>
        </div>
      </div>

      {/* Strategic AI Insights */}
      <div className="bg-white/80 p-4 rounded-xl border border-emerald-200 text-xs text-slate-700">
        <p className="text-[10px] font-bold uppercase text-slate-500 mb-1.5 flex items-center space-x-1">
          <Zap className="w-3 h-3 text-amber-600" />
          <span>Automated Dispatch Recommendations</span>
        </p>
        <ul className="space-y-1">
          {keyInsights.map((insight, i) => (
            <li key={i} className="flex items-start space-x-2 text-[11px]">
              <span className="text-[#166534] font-bold">•</span>
              <span>{insight}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>

    <RouteExplanationPanel
      route={contingencyRoute}
      isOpen={explainOpen}
      onClose={() => setExplainOpen(false)}
    />
  </>
);
};
