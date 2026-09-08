import React from 'react';
import { Clock, ShieldCheck, AlertTriangle, ArrowRight } from 'lucide-react';
import { useSimulation } from '../../context/SimulationContext';

export const BeforeAfterChart: React.FC = () => {
  const { simulationResult } = useSimulation();

  if (!simulationResult) return null;

  const { beforeRoutes, simulatedRoutes } = simulationResult;

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm text-left">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 mb-5 border-b border-slate-100 gap-2">
        <div>
          <h3 className="text-base font-bold text-slate-900 tracking-tight">Disruption Stress Impact Analysis</h3>
          <p className="text-xs text-slate-500">Baseline performance vs Post-Disruption simulated stress metrics</p>
        </div>
        <span className="text-xs font-mono font-semibold px-3 py-1 rounded-full bg-amber-50 text-amber-800 border border-amber-200">
          Simulated: {simulationResult.scenarioName}
        </span>
      </div>

      <div className="space-y-4">
        {simulatedRoutes.map(simRoute => {
          const baseRoute = beforeRoutes.find(b => b.id === simRoute.id) || simRoute;
          const timeDiff = simRoute.currentEtaMin - baseRoute.currentEtaMin;
          const relDiff = simRoute.reliabilityScore - baseRoute.reliabilityScore;
          const riskDiff = simRoute.delayRiskPercent - baseRoute.delayRiskPercent;

          const isSeverelyCompromised = timeDiff > 30 || relDiff < -25;
          const isResilient = Math.abs(timeDiff) <= 5 && Math.abs(relDiff) <= 5;

          return (
            <div
              key={simRoute.id}
              className={`p-4 rounded-xl border transition-all ${
                simRoute.isRecommended
                  ? 'bg-[#ecfdf5] border-emerald-400 shadow-sm'
                  : isSeverelyCompromised
                  ? 'bg-rose-50/70 border-rose-200'
                  : 'bg-slate-50/60 border-slate-200'
              }`}
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-2">
                  <h4 className="text-sm font-bold text-slate-900">{simRoute.name}</h4>
                  {simRoute.isRecommended && (
                    <span className="text-[10px] uppercase font-bold px-2.5 py-0.5 rounded-full bg-[#166534] text-white">
                      ★ Resilient Contingency
                    </span>
                  )}
                  {isSeverelyCompromised && (
                    <span className="text-[10px] uppercase font-bold px-2.5 py-0.5 rounded-full bg-rose-100 text-rose-700">
                      Severe Degradation
                    </span>
                  )}
                  {isResilient && !simRoute.isRecommended && (
                    <span className="text-[10px] uppercase font-bold px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                      Stable Performance
                    </span>
                  )}
                </div>
                <span className="text-xs text-slate-500 font-mono">
                  {simRoute.corridorName}
                </span>
              </div>

              {/* Metrics Before vs After */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
                {/* Travel Time Delta */}
                <div className="bg-white p-3 rounded-lg border border-slate-200 shadow-sm">
                  <div className="text-[10px] text-slate-500 uppercase font-bold mb-1 flex items-center justify-between">
                    <span className="flex items-center space-x-1">
                      <Clock className="w-3 h-3 text-blue-700" />
                      <span>Travel Time</span>
                    </span>
                    <span className={timeDiff > 10 ? 'text-rose-600 font-bold' : 'text-[#166534] font-bold'}>
                      {timeDiff > 0 ? `+${timeDiff} min` : `${timeDiff} min`}
                    </span>
                  </div>
                  <div className="flex items-center justify-between font-mono text-sm">
                    <span className="text-slate-500">Before: <strong className="text-slate-900">{baseRoute.currentEtaMin}m</strong></span>
                    <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
                    <span className="text-slate-900 font-bold">After: <strong className={timeDiff > 20 ? 'text-rose-600' : 'text-[#166534]'}>{simRoute.currentEtaMin}m</strong></span>
                  </div>
                  <div className="mt-2 w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                    <div
                      className={`h-full ${timeDiff > 25 ? 'bg-rose-600' : 'bg-[#166534]'}`}
                      style={{ width: `${Math.min(100, (simRoute.currentEtaMin / 140) * 100)}%` }}
                    />
                  </div>
                </div>

                {/* Journey Reliability Delta */}
                <div className="bg-white p-3 rounded-lg border border-slate-200 shadow-sm">
                  <div className="text-[10px] text-slate-500 uppercase font-bold mb-1 flex items-center justify-between">
                    <span className="flex items-center space-x-1">
                      <ShieldCheck className="w-3 h-3 text-emerald-700" />
                      <span>Reliability Score</span>
                    </span>
                    <span className={relDiff < -10 ? 'text-rose-600 font-bold' : 'text-[#166534] font-bold'}>
                      {relDiff} pts
                    </span>
                  </div>
                  <div className="flex items-center justify-between font-mono text-sm">
                    <span className="text-slate-500">Before: <strong className="text-slate-900">{baseRoute.reliabilityScore}</strong></span>
                    <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
                    <span className="text-slate-900 font-bold">After: <strong className={simRoute.reliabilityScore < 60 ? 'text-rose-600' : 'text-[#166534]'}>{simRoute.reliabilityScore}</strong></span>
                  </div>
                  <div className="mt-2 w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                    <div
                      className={`h-full ${simRoute.reliabilityScore < 60 ? 'bg-rose-600' : 'bg-[#166534]'}`}
                      style={{ width: `${simRoute.reliabilityScore}%` }}
                    />
                  </div>
                </div>

                {/* Delay Probability Risk */}
                <div className="bg-white p-3 rounded-lg border border-slate-200 shadow-sm">
                  <div className="text-[10px] text-slate-500 uppercase font-bold mb-1 flex items-center justify-between">
                    <span className="flex items-center space-x-1">
                      <AlertTriangle className="w-3 h-3 text-amber-700" />
                      <span>Delay Probability</span>
                    </span>
                    <span className={riskDiff > 15 ? 'text-rose-600 font-bold' : 'text-[#166534] font-bold'}>
                      {riskDiff > 0 ? `+${riskDiff}%` : `${riskDiff}%`}
                    </span>
                  </div>
                  <div className="flex items-center justify-between font-mono text-sm">
                    <span className="text-slate-500">Before: <strong className="text-slate-900">{baseRoute.delayRiskPercent}%</strong></span>
                    <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
                    <span className="text-slate-900 font-bold">After: <strong className={simRoute.delayRiskPercent > 50 ? 'text-rose-600' : 'text-amber-700'}>{simRoute.delayRiskPercent}%</strong></span>
                  </div>
                  <div className="mt-2 w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                    <div
                      className={`h-full ${simRoute.delayRiskPercent > 50 ? 'bg-rose-600' : 'bg-amber-500'}`}
                      style={{ width: `${simRoute.delayRiskPercent}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
