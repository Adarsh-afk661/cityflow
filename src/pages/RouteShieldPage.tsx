import React, { useState } from 'react';
import {
  ShieldAlert,
  Zap,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  Sliders,
  Columns,
  MapPin,
  Clock,
  Navigation
} from 'lucide-react';
import { RoutePlanner } from '../components/routeshield/RoutePlanner';
import { RouteCard } from '../components/routeshield/RouteCard';
import { AnalysisModal } from '../components/routeshield/AnalysisModal';
import { RouteCompare } from '../components/routeshield/RouteCompare';
import { CityMap } from '../components/map/CityMap';
import { useCityFlow } from '../context/CityFlowContext';

// Helper to compute realistic Pickup and Drop-off times
const calculateJourneyTimes = (departureStr: string = 'Now', durationMins: number = 30) => {
  const match = departureStr ? departureStr.match(/(\d{1,2}):(\d{2})\s*(AM|PM)/i) : null;
  let startHour: number;
  let startMin: number;

  if (match) {
    let h = parseInt(match[1], 10);
    const m = parseInt(match[2], 10);
    const period = match[3].toUpperCase();
    if (period === 'PM' && h < 12) h += 12;
    if (period === 'AM' && h === 12) h = 0;
    startHour = h;
    startMin = m;
  } else {
    const now = new Date();
    startHour = now.getHours();
    startMin = now.getMinutes();
  }

  const pickupDate = new Date();
  pickupDate.setHours(startHour, startMin, 0, 0);

  const dropoffDate = new Date(pickupDate.getTime() + durationMins * 60 * 1000);

  const fmt = (d: Date) =>
    d.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit', hour12: true });

  return {
    pickupTime: fmt(pickupDate),
    dropoffTime: fmt(dropoffDate),
  };
};

export const RouteShieldPage: React.FC = () => {
  const {
    candidateRoutes,
    selectedRoute,
    setSelectedRoute,
    selectedVehicle,
    startLocation,
    destinationLocation,
    departureTime,
    setActivePage
  } = useCityFlow();

  const [compareModalOpen, setCompareModalOpen] = useState(false);
  const [rerouteFeedback, setRerouteFeedback] = useState<string | null>(null);

  const failedRoutes = candidateRoutes.filter(r => r.clearanceStatus === 'failed');
  const approvedRoutes = candidateRoutes.filter(r => r.clearanceStatus === 'approved');
  const recommendedRoute = candidateRoutes.find(r => r.isRecommended) || approvedRoutes[0];

  // Evaluate if Smart Reroute is recommended
  let smartRerouteCandidate = null;
  let rerouteReason = '';
  let isMandatoryClearanceReroute = false;

  if (selectedRoute && selectedRoute.clearanceStatus === 'failed') {
    // Critical: selected route is physically barred!
    isMandatoryClearanceReroute = true;
    smartRerouteCandidate = recommendedRoute || approvedRoutes[0];
    rerouteReason = `Active corridor "${selectedRoute.name}" is physically BARRED for ${selectedVehicle.name} (${selectedVehicle.height}m H / ${selectedVehicle.weight}T). Reroute immediately to avoid collisions.`;
  } else if (selectedRoute && approvedRoutes.length > 1) {
    // Check if an alternative route has significantly lower delay risk or faster ETA
    const alternative = approvedRoutes.find(
      r => r.id !== selectedRoute.id && (
        (selectedRoute.delayRiskPercent - r.delayRiskPercent >= 10) ||
        (selectedRoute.currentEtaMin - r.currentEtaMin >= 4 && r.reliabilityScore >= 85) ||
        (selectedRoute.delayRiskPercent >= 35 && r.delayRiskPercent <= 15)
      )
    );
    if (alternative) {
      smartRerouteCandidate = alternative;
      const riskDiff = selectedRoute.delayRiskPercent - alternative.delayRiskPercent;
      const timeDiff = selectedRoute.currentEtaMin - alternative.currentEtaMin;
      rerouteReason = `Elevated delay probability (${selectedRoute.delayRiskPercent}%) detected on current route. "${alternative.name}" offers ${riskDiff > 0 ? `${riskDiff}% lower risk` : 'higher reliability'}${timeDiff > 0 ? ` and saves ${timeDiff} minutes` : ''}.`;
    }
  }

  const handleApplyReroute = (candidate: any) => {
    setSelectedRoute(candidate);
    setRerouteFeedback(`Switched active corridor to ${candidate.name}`);
    setTimeout(() => setRerouteFeedback(null), 3500);
  };

  return (
    <div className="space-y-6 text-left">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">RouteShield</h1>
            <span className="text-xs font-mono font-bold px-2.5 py-0.5 rounded-full bg-emerald-100 text-[#166534] border border-emerald-300">
              VEHICLE-AWARE DISPATCH
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-600 mt-1">
            Physical clearance validation, predictive reliability, and automated underpass barring.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={() => setCompareModalOpen(true)}
            className="px-4 py-2 rounded-xl bg-white hover:bg-slate-50 border border-slate-300 text-xs font-bold text-slate-800 flex items-center space-x-2 transition shadow-sm"
          >
            <Columns className="w-3.5 h-3.5 text-[#166534]" />
            <span>Compare Matrix</span>
          </button>

          <button
            onClick={() => setActivePage('whatif')}
            className="px-4 py-2 rounded-xl bg-[#166534] hover:bg-[#14532d] text-white text-xs font-bold flex items-center space-x-2 transition shadow-sm"
          >
            <span>Stress Test in What-If</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Reroute Feedback Notification */}
      {rerouteFeedback && (
        <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-300 text-xs text-[#166534] font-bold flex items-center space-x-2 animate-in fade-in slide-in-from-top-2">
          <CheckCircle2 className="w-4 h-4 text-[#166534]" />
          <span>{rerouteFeedback}</span>
        </div>
      )}

      {/* Primary Route Parameter Matrix Form */}
      <RoutePlanner />

      {/* Smart Reroute Command Center Recommendation Banner */}
      {smartRerouteCandidate && (
        <div className={`p-4 sm:p-5 rounded-2xl border shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4 transition-all ${
          isMandatoryClearanceReroute
            ? 'bg-rose-50 border-rose-300 text-rose-900'
            : 'bg-[#ecfdf5] border-emerald-400 text-slate-900'
        }`}>
          <div className="flex items-start space-x-3.5">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 shadow-sm ${
              isMandatoryClearanceReroute
                ? 'bg-rose-600 text-white'
                : 'bg-[#166534] text-white'
            }`}>
              <Zap className="w-5 h-5 fill-white text-white" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className={`text-[10px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded-md ${
                  isMandatoryClearanceReroute
                    ? 'bg-rose-200 text-rose-900 font-extrabold'
                    : 'bg-emerald-200 text-[#166534]'
                }`}>
                  {isMandatoryClearanceReroute ? 'MANDATORY CLEARANCE REROUTE' : 'SMART REROUTE RECOMMENDED'}
                </span>
                <span className="text-xs font-bold font-mono">
                  {smartRerouteCandidate.currentEtaMin}m ETA · {smartRerouteCandidate.reliabilityScore}/100 Reliability
                </span>
              </div>
              <p className="text-xs font-medium mt-1 leading-relaxed">
                {rerouteReason}
              </p>
            </div>
          </div>

          <div className="shrink-0 flex items-center space-x-2">
            <button
              id="smart-reroute-apply-btn"
              onClick={() => handleApplyReroute(smartRerouteCandidate)}
              className={`px-5 py-2.5 rounded-xl font-bold text-xs tracking-wide uppercase flex items-center space-x-2 transition shadow-md cursor-pointer ${
                isMandatoryClearanceReroute
                  ? 'bg-rose-700 hover:bg-rose-800 text-white shadow-rose-200'
                  : 'bg-[#166534] hover:bg-[#14532d] text-white shadow-emerald-200'
              }`}
            >
              <Zap className="w-3.5 h-3.5 fill-white" />
              <span>Reroute to {smartRerouteCandidate.name.split('—')[0]}</span>
            </button>
          </div>
        </div>
      )}

      {/* Interactive Map & Routes Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Candidate Routes List (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider font-mono flex items-center space-x-2">
              <span>Candidate Routes</span>
              <span className="text-slate-500">
                ({startLocation} → {destinationLocation})
              </span>
            </h3>
            <span className="text-xs text-slate-600 font-mono">
              Vehicle: <strong className="text-slate-900">{selectedVehicle.height}m H</strong> / {selectedVehicle.weight}T
            </span>
          </div>

          {/* Clearance Notice Banner if any routes failed */}
          {failedRoutes.length > 0 && !isMandatoryClearanceReroute && (
            <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-800 font-medium flex items-start space-x-2.5">
              <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5 text-rose-600" />
              <div>
                <strong>Physical Clearance Warning:</strong> {failedRoutes.length} candidate corridor contains height or weight clearance violations for {selectedVehicle.name}. Incompatible routes are automatically barred and barred from driver dispatch.
              </div>
            </div>
          )}

          {/* Render Candidate Cards */}
          <div className="space-y-4">
            {candidateRoutes.map(route => (
              <RouteCard
                key={route.id}
                route={route}
                onCompare={() => setCompareModalOpen(true)}
              />
            ))}
          </div>
        </div>

        {/* Live Map Inspector (5 cols) */}
        <div className="lg:col-span-5 sticky top-24 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider font-mono flex items-center space-x-1.5">
              <MapPin className="w-3.5 h-3.5 text-[#166534]" />
              <span>Route Geometry Visualizer</span>
            </h3>
            {selectedRoute && (
              <span className="text-[11px] font-mono text-[#166534] font-bold">
                {selectedRoute.name.split('—')[0]} SELECTED
              </span>
            )}
          </div>

          {/* Google Maps Style Journey Navigation & Timing HUD */}
          {(() => {
            const activeRoute = selectedRoute || (candidateRoutes && candidateRoutes[0]);
            if (!activeRoute) return null;
            const times = calculateJourneyTimes(departureTime, activeRoute.currentEtaMin);
            return (
              <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-md text-xs space-y-2.5 animate-in fade-in duration-200">
                {/* Header: ETA Duration & Status */}
                <div className="flex items-center justify-between bg-gradient-to-r from-[#166534] to-[#15803d] text-white p-2.5 rounded-xl shadow-xs">
                  <div className="flex items-center space-x-2">
                    <div className="w-7 h-7 rounded-lg bg-white/20 flex items-center justify-center">
                      <Navigation className="w-3.5 h-3.5 text-white" />
                    </div>
                    <div>
                      <div className="flex items-baseline space-x-1.5">
                        <span className="text-base font-black leading-none">{activeRoute.currentEtaMin} min</span>
                        <span className="text-[11px] font-medium text-emerald-100">({activeRoute.distanceKm} km)</span>
                      </div>
                      <div className="text-[10px] text-emerald-200 font-medium">Fastest route · Typical traffic</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] font-mono font-bold bg-white/20 px-2 py-0.5 rounded text-white">
                      {activeRoute.clearanceStatus === 'approved' ? 'SAFE CORRIDOR' : 'BARRED'}
                    </span>
                  </div>
                </div>

                {/* From ➔ To & Pick/Drop Timings */}
                <div className="grid grid-cols-2 gap-2 text-[11px]">
                  {/* Origin / Pickup */}
                  <div className="bg-slate-50 border border-slate-200 p-2 rounded-xl flex flex-col justify-between">
                    <div className="flex items-center space-x-1 text-[#166534] font-bold text-[10px] uppercase">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#166534]"></span>
                      <span>Pickup (Start)</span>
                    </div>
                    <div className="font-bold text-slate-800 truncate mt-0.5" title={startLocation}>
                      {startLocation || 'Delhi Hub'}
                    </div>
                    <div className="mt-1 font-mono font-bold text-[#166534] bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200 text-[10.5px] flex items-center space-x-1">
                      <Clock className="w-3 h-3 text-[#166534]" />
                      <span>{times.pickupTime}</span>
                    </div>
                  </div>

                  {/* Destination / Drop-off */}
                  <div className="bg-slate-50 border border-slate-200 p-2 rounded-xl flex flex-col justify-between">
                    <div className="flex items-center space-x-1 text-[#b91c1c] font-bold text-[10px] uppercase">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#b91c1c]"></span>
                      <span>Drop-off (End)</span>
                    </div>
                    <div className="font-bold text-slate-800 truncate mt-0.5" title={destinationLocation}>
                      {destinationLocation || 'Greater Noida Hub'}
                    </div>
                    <div className="mt-1 font-mono font-bold text-[#b91c1c] bg-rose-50 px-1.5 py-0.5 rounded border border-rose-200 text-[10.5px] flex items-center space-x-1">
                      <Clock className="w-3 h-3 text-[#b91c1c]" />
                      <span>{times.dropoffTime}</span>
                    </div>
                  </div>
                </div>

                {/* Sub-bar: Direction Guidance notice */}
                <div className="flex items-center justify-between text-[10px] text-slate-500 pt-1 border-t border-slate-100">
                  <span className="font-medium text-slate-700 flex items-center space-x-1">
                    <span>Corridor:</span>
                    <strong className="text-slate-900 truncate max-w-[150px]">{activeRoute.name}</strong>
                  </span>
                  <span className="text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-100 flex items-center space-x-1">
                    <ArrowRight className="w-2.5 h-2.5" />
                    <span>Direction Arrows Active</span>
                  </span>
                </div>
              </div>
            );
          })()}

          <CityMap heightClass="h-[430px]" showControls={true} showJourneyRoutes={true} />

          {/* Selected Route Quick Telemetry bar */}
          {selectedRoute && (
            <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-sm text-xs">
              <div className="flex items-center justify-between mb-1.5">
                <span className="font-bold text-slate-900">{selectedRoute.name}</span>
                <span className="font-mono text-[#166534] font-bold">
                  {selectedRoute.reliabilityScore}/100 Reliability
                </span>
              </div>
              <p className="text-slate-500 text-[11px] leading-relaxed">
                {selectedRoute.description}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Animated Analysis Modal */}
      <AnalysisModal />

      {/* Comparison Drawer/Modal */}
      <RouteCompare
        routes={candidateRoutes}
        isOpen={compareModalOpen}
        onClose={() => setCompareModalOpen(false)}
        onSelectRoute={setSelectedRoute}
      />
    </div>
  );
};
