import React, { useState } from 'react';
import {
  ShieldAlert,
  Zap,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  Sliders,
  Columns,
  MapPin
} from 'lucide-react';
import { RoutePlanner } from '../components/routeshield/RoutePlanner';
import { RouteCard } from '../components/routeshield/RouteCard';
import { AnalysisModal } from '../components/routeshield/AnalysisModal';
import { RouteCompare } from '../components/routeshield/RouteCompare';
import { CityMap } from '../components/map/CityMap';
import { useCityFlow } from '../context/CityFlowContext';

export const RouteShieldPage: React.FC = () => {
  const {
    candidateRoutes,
    selectedRoute,
    setSelectedRoute,
    selectedVehicle,
    startLocation,
    destinationLocation,
    setActivePage
  } = useCityFlow();

  const [compareModalOpen, setCompareModalOpen] = useState(false);

  const failedRoutes = candidateRoutes.filter(r => r.clearanceStatus === 'failed');

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

      {/* Primary Route Parameter Matrix Form */}
      <RoutePlanner />

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
          {failedRoutes.length > 0 && (
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
          <CityMap heightClass="h-[460px]" showControls={false} />

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
