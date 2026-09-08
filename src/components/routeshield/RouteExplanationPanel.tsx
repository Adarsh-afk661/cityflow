import React from 'react';
import {
  X,
  Sparkles,
  ArrowRight,
  CheckCircle2,
  SlidersHorizontal,
  Compass,
  Zap,
  Activity,
  BarChart3,
  Layers
} from 'lucide-react';
import { CandidateRoute } from '../../types';
import { useCityFlow } from '../../context/CityFlowContext';
import { useSimulation } from '../../context/SimulationContext';
import { generateRouteExplanation } from '../../services/explanationEngine';

interface RouteExplanationPanelProps {
  route: CandidateRoute | null;
  isOpen: boolean;
  onClose: () => void;
}

export const RouteExplanationPanel: React.FC<RouteExplanationPanelProps> = ({
  route,
  isOpen,
  onClose
}) => {
  const {
    candidateRoutes,
    selectedVehicle,
    routingMode,
    setSelectedRoute,
    setActivePage
  } = useCityFlow();

  const { scenarios } = useSimulation();

  if (!isOpen || !route) return null;

  // Generate dynamic explanation based on real current route metrics, mode & vehicle
  const explanation = generateRouteExplanation(
    route,
    candidateRoutes,
    selectedVehicle,
    routingMode,
    scenarios
  );

  const handleApplyRoute = () => {
    setSelectedRoute(route);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center lg:justify-end z-[99999] p-0 sm:p-4 transition-all duration-300 animate-in fade-in">
      <div className="w-full sm:max-w-2xl lg:max-w-3xl h-full sm:h-auto sm:max-h-[94vh] bg-white sm:rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col text-left">
        {/* Top Header */}
        <div className="px-6 py-5 border-b border-slate-200/90 bg-gradient-to-r from-slate-900 via-slate-950 to-slate-900 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-[#166534] border border-emerald-400/30 flex items-center justify-center text-white shadow-md">
              <Sparkles className="w-5 h-5 text-emerald-300" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-[10px] font-mono font-bold uppercase tracking-widest px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  AI Route Explainability Engine
                </span>
                <span className="text-[10px] font-mono text-slate-400 capitalize px-2 py-0.5 rounded bg-slate-800 border border-slate-700">
                  Mode: {routingMode}
                </span>
              </div>
              <h2 className="text-lg sm:text-xl font-black text-white tracking-tight mt-1">
                WHY CITYFLOW CHOSE THIS ROUTE
              </h2>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-white transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Content Body */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6">
          {/* SECTION 1: RECOMMENDED ROUTE & DECISION SCORE HERO CARD */}
          <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white rounded-2xl p-5 sm:p-6 shadow-md border border-slate-700/80 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-slate-700/60">
              <div>
                <span className="text-[11px] font-mono font-bold text-emerald-400 uppercase tracking-widest flex items-center space-x-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Recommended Route</span>
                </span>
                <h3 className="text-2xl sm:text-3xl font-black tracking-tight text-white mt-1">
                  {route.name}
                </h3>
                <p className="text-xs text-slate-300 mt-0.5 font-medium flex items-center space-x-2">
                  <span>{route.corridorName}</span>
                  <span className="text-slate-500">•</span>
                  <span>{route.distanceKm} km span</span>
                  <span className="text-slate-500">•</span>
                  <span>Target: {selectedVehicle.name}</span>
                </p>
              </div>

              {/* CityFlow Decision Score Badge */}
              <div className="flex items-center space-x-3 bg-slate-800/90 border border-emerald-500/40 px-4 py-3 rounded-2xl shadow-inner shrink-0">
                <div className="text-right">
                  <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block font-bold">
                    Decision Score
                  </span>
                  <div className="text-3xl font-black font-mono text-emerald-400 leading-none mt-0.5">
                    {explanation.decisionScore}
                    <span className="text-sm font-normal text-slate-400">/100</span>
                  </div>
                </div>
                <div className="w-11 h-11 rounded-xl bg-emerald-500/20 border border-emerald-400/40 flex items-center justify-center text-emerald-300 font-black font-mono text-base">
                  ✓
                </div>
              </div>
            </div>

            {/* AI Confidence Meter */}
            <div className="mt-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
              <div className="flex items-center space-x-2">
                <span className="text-slate-300 font-semibold">CityFlow Confidence:</span>
                <span className="font-mono font-black text-emerald-300 bg-emerald-950/80 px-2.5 py-0.5 rounded-full border border-emerald-600/50">
                  {explanation.confidence}%
                </span>
              </div>
              <p className="text-[11px] text-slate-300/90 leading-relaxed sm:text-right max-w-md">
                {explanation.confidenceRationale}
              </p>
            </div>
          </div>

          {/* SECTION 2: MAJOR FACTORS QUICK CHECKLIST */}
          <div className="bg-slate-50 rounded-2xl p-5 border border-slate-200">
            <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-700 mb-3 flex items-center space-x-2">
              <BarChart3 className="w-3.5 h-3.5 text-[#166534]" />
              <span>Core Decision Factors Overview</span>
            </h4>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {/* Clearance */}
              <div className="p-3 bg-white rounded-xl border border-slate-200 shadow-2xs">
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="font-semibold text-slate-600">Vehicle Clearance</span>
                  <span className={`text-[10px] font-bold font-mono px-1.5 py-0.5 rounded ${explanation.checklist.clearance.passed ? 'bg-emerald-100 text-[#166534]' : 'bg-rose-100 text-rose-700'}`}>
                    {explanation.checklist.clearance.passed ? '✓ Approved' : '✕ Barred'}
                  </span>
                </div>
                <div className="text-xs text-slate-500 font-mono">
                  {explanation.checklist.clearance.detail}
                </div>
              </div>

              {/* Reliability */}
              <div className="p-3 bg-white rounded-xl border border-slate-200 shadow-2xs">
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="font-semibold text-slate-600">Reliability</span>
                  <span className="text-xs font-mono font-bold text-[#166534]">
                    {explanation.checklist.reliability.score}/100
                  </span>
                </div>
                <div className="text-xs text-slate-500 font-mono">
                  {explanation.checklist.reliability.detail}
                </div>
              </div>

              {/* Delay Probability */}
              <div className="p-3 bg-white rounded-xl border border-slate-200 shadow-2xs">
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="font-semibold text-slate-600">Delay Risk</span>
                  <span className="text-xs font-mono font-bold text-blue-700">
                    {explanation.checklist.delayRisk.percent}%
                  </span>
                </div>
                <div className="text-xs text-slate-500 font-mono">
                  {explanation.checklist.delayRisk.detail}
                </div>
              </div>

              {/* Safety */}
              <div className="p-3 bg-white rounded-xl border border-slate-200 shadow-2xs">
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="font-semibold text-slate-600">Safety Index</span>
                  <span className="text-xs font-mono font-bold text-slate-800">
                    {explanation.checklist.safety.score}/100
                  </span>
                </div>
                <div className="text-xs text-slate-500 font-mono">
                  {explanation.checklist.safety.detail}
                </div>
              </div>

              {/* CO2 Emissions */}
              <div className="p-3 bg-white rounded-xl border border-slate-200 shadow-2xs">
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="font-semibold text-slate-600">CO₂ Emissions</span>
                  <span className="text-xs font-mono font-bold text-[#166534]">
                    {explanation.checklist.co2.kg} kg
                  </span>
                </div>
                <div className="text-xs text-slate-500 font-mono">
                  {route.fuelImpactLiters}L fuel consumption
                </div>
              </div>

              {/* Traffic State */}
              <div className="p-3 bg-white rounded-xl border border-slate-200 shadow-2xs">
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="font-semibold text-slate-600">Traffic Level</span>
                  <span className="text-[10px] font-bold font-mono px-1.5 py-0.5 rounded bg-emerald-100 text-[#166534]">
                    {explanation.checklist.traffic.detail}
                  </span>
                </div>
                <div className="text-xs text-slate-500 font-mono">
                  Corridor velocity smooth
                </div>
              </div>
            </div>
          </div>

          {/* SECTION 3: DYNAMIC NARRATIVE EXPLANATION */}
          <div className="bg-emerald-50/70 rounded-2xl p-5 border border-emerald-200/90 text-xs text-slate-800 leading-relaxed space-y-3">
            <div className="flex items-center space-x-2">
              <Zap className="w-4 h-4 text-[#166534]" />
              <h4 className="font-extrabold text-sm text-slate-900">
                Decision Rationale
              </h4>
            </div>

            <p className="text-sm font-semibold text-[#166534]">
              "{explanation.primarySummary}"
            </p>

            <p className="text-slate-700">
              {explanation.tradeoffSummary}
            </p>

            {/* What-If Simulation scenario impact notice if present */}
            {explanation.simulationNotice && (
              <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-300 text-amber-950 font-medium flex items-start space-x-2.5 mt-2">
                <Activity className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
                <div>
                  <strong className="block text-amber-900 font-bold mb-0.5">
                    What-If Simulation Active: {explanation.simulationNotice.activeScenarioName}
                  </strong>
                  <span>{explanation.simulationNotice.text}</span>
                </div>
              </div>
            )}
          </div>

          {/* SECTION 4: FACTOR CONTRIBUTION VISUALIZATION */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-800 flex items-center space-x-2">
                <Layers className="w-3.5 h-3.5 text-[#166534]" />
                <span>Decision Factor Contribution</span>
              </h4>
              <span className="text-[11px] font-mono text-slate-500">Routing Weight Index</span>
            </div>

            <div className="space-y-3.5">
              {explanation.factors.map(factor => (
                <div key={factor.id}>
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="font-bold text-slate-800">{factor.name}</span>
                    <span className="font-mono font-bold text-slate-900">
                      {typeof factor.value === 'string' ? factor.value : `${factor.score}/100`}
                    </span>
                  </div>

                  {/* Progress bar */}
                  <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden border border-slate-200">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        factor.status === 'failed'
                          ? 'bg-rose-500'
                          : factor.status === 'warning'
                          ? 'bg-amber-500'
                          : 'bg-[#166534]'
                      }`}
                      style={{ width: `${factor.score}%` }}
                    />
                  </div>

                  <p className="text-[10px] text-slate-500 mt-1 font-mono">
                    {factor.description}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* SECTION 5: ROUTE TRADE-OFF COMPARISON */}
          <div className="bg-slate-50 rounded-2xl p-5 border border-slate-200 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-800 flex items-center space-x-2">
                  <Compass className="w-3.5 h-3.5 text-[#166534]" />
                  <span>Route Trade-Off Matrix</span>
                </h4>
                <p className="text-xs text-slate-500 mt-0.5">
                  Direct telemetry comparison against primary corridor alternative
                </p>
              </div>

              <div className="text-right text-[11px] font-mono">
                <span className="text-slate-400">vs </span>
                <span className="font-bold text-slate-800">{explanation.fastestRoute.name.split('—')[0]}</span>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead>
                  <tr className="border-b border-slate-200 text-[10px] font-mono uppercase text-slate-400">
                    <th className="pb-2 font-bold">Metric</th>
                    <th className="pb-2 font-bold text-[#166534]">{route.name.split('—')[0]} (Rec)</th>
                    <th className="pb-2 font-bold text-slate-600">{explanation.fastestRoute.name.split('—')[0]} (Alt)</th>
                    <th className="pb-2 font-bold text-right">Variance / Impact</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200/60 font-mono">
                  {explanation.tradeoffs.map((item, idx) => (
                    <tr key={idx} className="hover:bg-white/80 transition">
                      <td className="py-2.5 font-sans font-semibold text-slate-800">
                        {item.metric}
                      </td>
                      <td className="py-2.5 font-bold text-[#166534]">
                        {item.recommendedValue}
                      </td>
                      <td className="py-2.5 text-slate-600">
                        {item.alternativeValue}
                      </td>
                      <td className="py-2.5 text-right font-sans text-[11px]">
                        <span className={`px-2 py-0.5 rounded-full font-bold inline-block ${
                          item.isAdvantage ? 'bg-emerald-100 text-[#166534]' : 'bg-slate-200 text-slate-700'
                        }`}>
                          {item.difference}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* SECTION 6: "WHAT MATTERED MOST?" (TOP 3 FACTORS BY ROUTING MODE) */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-800 flex items-center space-x-2">
                <SlidersHorizontal className="w-3.5 h-3.5 text-[#166534]" />
                <span>What Mattered Most</span>
              </h4>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 font-bold border border-slate-200">
                Mode: {routingMode.toUpperCase()}
              </span>
            </div>

            <p className="text-xs text-slate-500 mb-4">
              Top 3 driving factors prioritized by the CityFlow decision engine under <strong>{routingMode}</strong> mode:
            </p>

            <div className="space-y-3">
              {explanation.primaryInfluences.map(inf => (
                <div
                  key={inf.rank}
                  className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex items-start space-x-3.5"
                >
                  <div className="w-7 h-7 rounded-lg bg-[#166534] text-white flex items-center justify-center font-mono font-bold text-xs shrink-0 shadow-2xs">
                    {inf.rank}
                  </div>
                  <div>
                    <h5 className="text-xs font-bold text-slate-900">{inf.title}</h5>
                    <p className="text-xs text-slate-600 mt-0.5 leading-relaxed font-normal">
                      {inf.explanation}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* SECTION 7: RECOMMENDED ACTION */}
          <div className="p-5 rounded-2xl bg-gradient-to-r from-emerald-50 via-teal-50 to-emerald-50 border border-emerald-200 shadow-sm text-xs space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-[#166534] bg-emerald-100 px-2 py-0.5 rounded border border-emerald-300">
                DISPATCH DIRECTIVE
              </span>
              <span className="font-mono text-emerald-800 font-semibold text-[11px]">
                Active Telemetry Certified
              </span>
            </div>

            <div>
              <h4 className="text-base font-extrabold text-slate-900">
                {explanation.recommendedAction.headline}
              </h4>
              <p className="text-slate-600 mt-1 leading-relaxed">
                {explanation.recommendedAction.details}
              </p>
            </div>

            <div className="pt-2 flex flex-wrap items-center justify-between gap-3">
              <button
                onClick={handleApplyRoute}
                className="px-5 py-2.5 rounded-xl bg-[#166534] hover:bg-[#14532d] text-white font-bold text-xs flex items-center space-x-2 shadow-sm transition"
              >
                <span>Dispatch Commercial Unit With This Route</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                onClick={() => {
                  onClose();
                  setActivePage('whatif');
                }}
                className="px-4 py-2.5 rounded-xl border border-slate-300 hover:border-slate-400 bg-white text-slate-800 font-semibold text-xs transition hover:bg-slate-50"
              >
                Stress-Test in What-If Simulator
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
