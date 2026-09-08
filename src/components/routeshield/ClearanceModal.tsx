import React from 'react';
import { X, ShieldAlert, CheckCircle2, AlertTriangle } from 'lucide-react';
import { CandidateRoute } from '../../types';
import { useCityFlow } from '../../context/CityFlowContext';

interface ClearanceModalProps {
  route: CandidateRoute | null;
  isOpen: boolean;
  onClose: () => void;
}

export const ClearanceModal: React.FC<ClearanceModalProps> = ({ route, isOpen, onClose }) => {
  const { selectedVehicle } = useCityFlow();

  if (!isOpen || !route) return null;

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="w-full max-w-xl bg-white border border-slate-200 rounded-2xl p-6 md:p-8 shadow-2xl text-left">
        <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-100">
          <div className="flex items-center space-x-2.5">
            <div className={`p-2 rounded-xl ${route.clearanceStatus === 'failed' ? 'bg-rose-100 text-rose-700' : 'bg-emerald-100 text-[#166534]'}`}>
              {route.clearanceStatus === 'failed' ? <ShieldAlert className="w-5 h-5" /> : <CheckCircle2 className="w-5 h-5" />}
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">Infrastructure Clearance Report</h3>
              <p className="text-xs text-slate-500">{route.name} · {route.corridorName}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Selected Vehicle Dimensions Summary */}
        <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 mb-5">
          <p className="text-[10px] uppercase font-bold text-slate-500 mb-2">Subject Vehicle Profile</p>
          <div className="grid grid-cols-4 gap-2 text-center text-xs">
            <div className="bg-white p-2 rounded border border-slate-200">
              <span className="text-[10px] text-slate-500 block">Height</span>
              <span className="font-mono font-bold text-slate-900">{selectedVehicle.height} m</span>
            </div>
            <div className="bg-white p-2 rounded border border-slate-200">
              <span className="text-[10px] text-slate-500 block">Width</span>
              <span className="font-mono font-bold text-slate-900">{selectedVehicle.width} m</span>
            </div>
            <div className="bg-white p-2 rounded border border-slate-200">
              <span className="text-[10px] text-slate-500 block">Length</span>
              <span className="font-mono font-bold text-slate-900">{selectedVehicle.length} m</span>
            </div>
            <div className="bg-white p-2 rounded border border-slate-200">
              <span className="text-[10px] text-slate-500 block">Gross Weight</span>
              <span className="font-mono font-bold text-slate-900">{selectedVehicle.weight} T</span>
            </div>
          </div>
        </div>

        {/* Clearance Checks List */}
        <div className="space-y-3 mb-6">
          <p className="text-[10px] uppercase font-bold text-slate-500">Encountered Infrastructure Nodes</p>
          {route.clearanceChecks.length === 0 ? (
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-500 text-center">
              No overhead or weight-restricted checkpoints along this route.
            </div>
          ) : (
            route.clearanceChecks.map(check => (
              <div
                key={check.infrastructureId}
                className={`p-4 rounded-xl border text-xs ${
                  check.passed
                    ? 'bg-emerald-50/60 border-emerald-200'
                    : 'bg-rose-50/80 border-rose-200'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-2">
                    {check.passed ? (
                      <CheckCircle2 className="w-4 h-4 text-[#166534] shrink-0" />
                    ) : (
                      <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
                    )}
                    <span className="font-bold text-slate-900">{check.infrastructureName}</span>
                    <span className="px-2 py-0.5 rounded text-[10px] uppercase bg-white text-slate-600 font-mono border border-slate-200">
                      {check.infrastructureType}
                    </span>
                  </div>
                  <span
                    className={`font-mono text-[10px] font-bold px-2.5 py-0.5 rounded ${
                      check.passed ? 'bg-[#166534] text-white' : 'bg-rose-100 text-rose-700'
                    }`}
                  >
                    {check.passed ? 'CLEAR' : 'BARRED'}
                  </span>
                </div>

                {check.failureReason && (
                  <div className="mt-2.5 p-2.5 rounded bg-white border border-rose-200 text-rose-800 font-medium text-xs">
                    ⚠️ {check.failureReason}
                  </div>
                )}
              </div>
            ))
          )}
        </div>

        {/* Safety Breakdown / Summary */}
        <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
          <p className="text-[10px] uppercase font-bold text-slate-500 mb-2">Safety Score Breakdown (/100)</p>
          <div className="grid grid-cols-5 gap-2 text-center text-xs font-mono">
            <div className="p-1.5 bg-white rounded border border-slate-200">
              <span className="text-[9px] text-slate-500 block">Traffic Risk</span>
              <span className="text-slate-800">{route.safetyBreakdown.trafficRisk}</span>
            </div>
            <div className="p-1.5 bg-white rounded border border-slate-200">
              <span className="text-[9px] text-slate-500 block">Complexity</span>
              <span className="text-slate-800">{route.safetyBreakdown.roadComplexity}</span>
            </div>
            <div className="p-1.5 bg-white rounded border border-slate-200">
              <span className="text-[9px] text-slate-500 block">Incident Risk</span>
              <span className="text-slate-800">{route.safetyBreakdown.incidentRisk}</span>
            </div>
            <div className="p-1.5 bg-white rounded border border-slate-200">
              <span className="text-[9px] text-slate-500 block">Weather Risk</span>
              <span className="text-slate-800">{route.safetyBreakdown.weatherRisk}</span>
            </div>
            <div className="p-1.5 bg-white rounded border border-slate-200">
              <span className="text-[9px] text-slate-500 block">Infra Risk</span>
              <span className={route.safetyBreakdown.infrastructureRisk > 30 ? 'text-rose-700 font-bold' : 'text-slate-800'}>
                {route.safetyBreakdown.infrastructureRisk}
              </span>
            </div>
          </div>
        </div>

        <div className="mt-5 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-xs font-bold text-slate-800 transition"
          >
            Close Report
          </button>
        </div>
      </div>
    </div>
  );
};
