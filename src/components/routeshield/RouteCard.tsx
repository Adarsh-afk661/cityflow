import React, { useState } from 'react';
import {
  Clock,
  ShieldCheck,
  ShieldAlert,
  AlertTriangle,
  Leaf,
  CheckCircle2,
  ChevronRight,
  TrendingDown,
  Navigation,
  Sparkles
} from 'lucide-react';
import { CandidateRoute } from '../../types';
import { useCityFlow } from '../../context/CityFlowContext';
import { ClearanceModal } from './ClearanceModal';
import { RouteExplanationPanel } from './RouteExplanationPanel';

interface RouteCardProps {
  route: CandidateRoute;
  onCompare?: (route: CandidateRoute) => void;
}

export const RouteCard: React.FC<RouteCardProps> = ({ route, onCompare }) => {
  const { selectedRoute, setSelectedRoute } = useCityFlow();
  const [inspectOpen, setInspectOpen] = useState(false);
  const [explainOpen, setExplainOpen] = useState(false);

  const isSelected = selectedRoute?.id === route.id;
  const isFailed = route.clearanceStatus === 'failed';

  return (
    <>
      <div
        className={`relative rounded-2xl p-5 transition-all border text-left ${
          isFailed
            ? 'bg-slate-50/70 border-rose-200 shadow-sm'
            : isSelected
            ? 'bg-[#ecfdf5]/80 border-emerald-500 shadow-sm'
            : 'bg-white border-slate-200 hover:border-slate-300 shadow-sm'
        }`}
      >
        {/* Recommended Badge or Failure Banner */}
        <div className="flex items-center justify-between gap-2 mb-3">
          <div className="flex items-center space-x-2">
            {route.isRecommended && (
              <>
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-[#166534] font-bold text-[11px] tracking-wide uppercase flex items-center space-x-1 border border-emerald-300">
                  <CheckCircle2 className="w-3 h-3 text-[#166534]" />
                  <span>RECOMMENDED ROUTE</span>
                </span>
                <button
                  id={`why-this-route-btn-${route.id}`}
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setExplainOpen(true);
                  }}
                  className="px-2.5 py-0.5 rounded-full bg-white hover:bg-emerald-50 border border-emerald-300 text-[#166534] font-bold text-[11px] tracking-wide flex items-center space-x-1 shadow-xs transition hover:scale-[1.02] cursor-pointer"
                  title="Explain why CityFlow chose this route"
                >
                  <Sparkles className="w-3 h-3 text-[#166534]" />
                  <span>Why This Route?</span>
                </button>
              </>
            )}
            {isFailed ? (
              <span className="px-3 py-1 rounded-full bg-rose-100 border border-rose-200 text-rose-700 font-bold text-[11px] font-mono tracking-wider uppercase flex items-center space-x-1">
                <ShieldAlert className="w-3 h-3" />
                <span>BARRED</span>
              </span>
            ) : (
              <span className="px-3 py-1 rounded-full bg-[#166534] text-white font-bold text-[11px] font-mono tracking-wider uppercase flex items-center space-x-1">
                <ShieldCheck className="w-3 h-3" />
                <span>CLEAR</span>
              </span>
            )}
          </div>

          <span className="text-xs font-mono text-slate-500">
            Score: <strong className={isFailed ? 'text-rose-600' : 'text-[#166534]'}>{route.overallScore}</strong>/100
          </span>
        </div>

        {/* Route Name and Corridor */}
        <div className="mb-4">
          <h4 className={`text-base font-extrabold tracking-tight ${isFailed ? 'line-through text-slate-400' : 'text-slate-900'}`}>
            {route.name}
          </h4>
          <p className="text-xs text-slate-500 mt-0.5 leading-snug">{route.corridorName}</p>
        </div>

        {/* Primary Metrics Grid */}
        <div className="grid grid-cols-4 gap-2 mb-4">
          {/* ETA */}
          <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200">
            <div className="flex items-center space-x-1 text-[10px] text-slate-500 mb-0.5 font-bold uppercase">
              <Clock className="w-3 h-3 text-blue-700" />
              <span>ETA</span>
            </div>
            <div className="text-base sm:text-lg font-extrabold font-mono text-slate-900 leading-tight">
              {route.currentEtaMin} <span className="text-xs font-normal text-slate-500">min</span>
            </div>
            <div className="text-[10px] text-slate-500 font-mono">
              {route.predictedTimeRange.min}–{route.predictedTimeRange.max}m
            </div>
          </div>

          {/* Reliability */}
          <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200">
            <div className="flex items-center space-x-1 text-[10px] text-slate-500 mb-0.5 font-bold uppercase">
              <ShieldCheck className="w-3 h-3 text-emerald-700" />
              <span>Reliability</span>
            </div>
            <div className={`text-base sm:text-lg font-extrabold font-mono leading-tight ${route.reliabilityScore >= 90 ? 'text-[#166534]' : route.reliabilityScore >= 75 ? 'text-blue-700' : 'text-rose-600'}`}>
              {route.reliabilityScore}<span className="text-xs font-normal text-slate-500">/100</span>
            </div>
            <div className="text-[10px] text-slate-500 font-mono">
              Risk: {route.delayRiskPercent}%
            </div>
          </div>

          {/* Safety */}
          <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200">
            <div className="flex items-center space-x-1 text-[10px] text-slate-500 mb-0.5 font-bold uppercase">
              <ShieldAlert className="w-3 h-3 text-emerald-700" />
              <span>Safety</span>
            </div>
            <div className="text-base sm:text-lg font-extrabold font-mono text-slate-900 leading-tight">
              {route.safetyScore}<span className="text-xs font-normal text-slate-500">/100</span>
            </div>
            <div className="text-[10px] text-slate-500">
              {route.distanceKm} km
            </div>
          </div>

          {/* CO2 Emissions */}
          <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200">
            <div className="flex items-center space-x-1 text-[10px] text-slate-500 mb-0.5 font-bold uppercase">
              <Leaf className="w-3 h-3 text-emerald-700" />
              <span>CO₂</span>
            </div>
            <div className="text-base sm:text-lg font-extrabold font-mono text-[#166534] leading-tight">
              {route.estimatedCo2Kg} <span className="text-xs font-normal text-slate-500">kg</span>
            </div>
            <div className="text-[10px] text-slate-500 font-mono">
              {route.fuelImpactLiters}L fuel
            </div>
          </div>
        </div>

        {/* Dynamic Context Notes / Savings */}
        {isFailed ? (
          <div className="p-3 mb-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-medium flex items-start space-x-2">
            <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5 text-rose-600" />
            <div>
              <strong>Physical Clearance Barred:</strong> 3.8m underpass detected along route. Vehicle height (4.1m) violates clearance by 0.3m. Do NOT dispatch.
            </div>
          </div>
        ) : route.co2SavingsKg > 0 ? (
          <div className="p-2.5 mb-3 rounded-xl bg-emerald-50 border border-emerald-200 text-[#166534] text-xs font-medium flex items-center space-x-2">
            <TrendingDown className="w-4 h-4 shrink-0" />
            <span><strong>{route.co2SavingsKg} kg CO₂ saved</strong> compared with fastest corridor baseline.</span>
          </div>
        ) : null}

        {/* Hybrid Spatial-Graph Indicator */}
        {route.circuityRatio && (
          <div className="mb-3 px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200/90 text-[10px] font-mono text-slate-700 flex flex-wrap items-center justify-between gap-1">
            <span className="font-bold text-[#166534] flex items-center space-x-1">
              <span>🌐</span>
              <span>HYBRID SPATIAL-GRAPH</span>
            </span>
            <span>
              Haversine: <strong>{route.haversineDirectKm || '—'} km</strong> · Road: <strong>{route.distanceKm} km</strong> · Circuity: <strong className="text-emerald-700">{route.circuityRatio}x</strong>
            </span>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex items-center justify-between pt-3 border-t border-slate-200/80">
          <div className="flex items-center space-x-3">
            <button
              onClick={() => setInspectOpen(true)}
              className="text-xs font-bold text-slate-600 hover:text-[#166534] transition flex items-center space-x-1"
            >
              <span>View Clearance Details</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>

            {route.isRecommended && (
              <button
                type="button"
                onClick={() => setExplainOpen(true)}
                className="text-xs font-bold text-[#166534] hover:text-[#14532d] transition flex items-center space-x-1"
              >
                <Sparkles className="w-3.5 h-3.5 text-[#166534]" />
                <span>Why This Route?</span>
              </button>
            )}
          </div>

          <div className="flex items-center space-x-2">
            {onCompare && (
              <button
                onClick={() => onCompare(route)}
                className="px-3 py-1.5 rounded-lg border border-slate-300 hover:bg-slate-100 text-xs font-semibold text-slate-700 transition"
              >
                Compare
              </button>
            )}
            <button
              id={`select-route-btn-${route.id}`}
              onClick={() => setSelectedRoute(route)}
              disabled={isFailed}
              className={`px-4 py-1.5 rounded-lg text-xs font-bold transition flex items-center space-x-1.5 ${
                isFailed
                  ? 'bg-slate-100 text-slate-400 cursor-not-allowed border border-slate-200'
                  : isSelected
                  ? 'bg-[#166534] text-white shadow-sm'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-800'
              }`}
            >
              <Navigation className="w-3.5 h-3.5" />
              <span>{isSelected ? 'Active Selected' : 'Select Route'}</span>
            </button>
          </div>
        </div>
      </div>

      <ClearanceModal
        route={route}
        isOpen={inspectOpen}
        onClose={() => setInspectOpen(false)}
      />

      <RouteExplanationPanel
        route={route}
        isOpen={explainOpen}
        onClose={() => setExplainOpen(false)}
      />
    </>
  );
};
