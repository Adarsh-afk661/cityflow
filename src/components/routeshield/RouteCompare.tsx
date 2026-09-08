import React from 'react';
import { X, Check, AlertTriangle, ShieldCheck, ShieldAlert, Clock, Leaf } from 'lucide-react';
import { CandidateRoute } from '../../types';

interface RouteCompareProps {
  routes: CandidateRoute[];
  isOpen: boolean;
  onClose: () => void;
  onSelectRoute: (route: CandidateRoute) => void;
}

export const RouteCompare: React.FC<RouteCompareProps> = ({
  routes,
  isOpen,
  onClose,
  onSelectRoute
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 text-left">
      <div className="w-full max-w-4xl bg-white border border-slate-200 rounded-2xl p-6 md:p-8 shadow-2xl overflow-x-auto max-h-[90vh]">
        <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-100">
          <div>
            <h3 className="text-base font-bold text-slate-900">Route Comparison Matrix</h3>
            <p className="text-xs text-slate-500">Direct trade-off analysis across candidate corridors</p>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition">
            <X className="w-5 h-5" />
          </button>
        </div>

        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50">
              <th className="py-3 px-4 text-slate-500 font-bold uppercase text-[10px]">Parameter</th>
              {routes.map(r => (
                <th key={r.id} className="py-3 px-4 text-slate-900 font-bold">
                  {r.name}
                  {r.isRecommended && (
                    <span className="block text-[9px] text-[#166534] font-semibold font-mono">RECOMMENDED</span>
                  )}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 font-mono">
            <tr>
              <td className="py-3 px-4 text-slate-600 font-sans font-semibold">Clearance Status</td>
              {routes.map(r => (
                <td key={r.id} className="py-3 px-4">
                  {r.clearanceStatus === 'approved' ? (
                    <span className="text-[#166534] font-bold flex items-center space-x-1">
                      <ShieldCheck className="w-4 h-4" />
                      <span>APPROVED</span>
                    </span>
                  ) : (
                    <span className="text-rose-600 font-bold flex items-center space-x-1">
                      <ShieldAlert className="w-4 h-4" />
                      <span>BARRED (3.8m)</span>
                    </span>
                  )}
                </td>
              ))}
            </tr>
            <tr>
              <td className="py-3 px-4 text-slate-600 font-sans font-semibold">Nominal ETA</td>
              {routes.map(r => (
                <td key={r.id} className="py-3 px-4 font-bold text-slate-900 text-sm">
                  {r.currentEtaMin} min
                </td>
              ))}
            </tr>
            <tr>
              <td className="py-3 px-4 text-slate-600 font-sans font-semibold">Predicted Range</td>
              {routes.map(r => (
                <td key={r.id} className="py-3 px-4 text-slate-700">
                  {r.predictedTimeRange.min}–{r.predictedTimeRange.max} min
                </td>
              ))}
            </tr>
            <tr>
              <td className="py-3 px-4 text-slate-600 font-sans font-semibold">Journey Reliability</td>
              {routes.map(r => (
                <td key={r.id} className="py-3 px-4">
                  <span className={`font-bold ${r.reliabilityScore >= 90 ? 'text-[#166534]' : 'text-slate-800'}`}>
                    {r.reliabilityScore} / 100
                  </span>
                </td>
              ))}
            </tr>
            <tr>
              <td className="py-3 px-4 text-slate-600 font-sans font-semibold">Delay Probability</td>
              {routes.map(r => (
                <td key={r.id} className="py-3 px-4">
                  <span className={`font-bold ${r.delayRiskPercent < 15 ? 'text-[#166534]' : 'text-rose-600'}`}>
                    {r.delayRiskPercent}%
                  </span>
                </td>
              ))}
            </tr>
            <tr>
              <td className="py-3 px-4 text-slate-600 font-sans font-semibold">Safety Score</td>
              {routes.map(r => (
                <td key={r.id} className="py-3 px-4 text-slate-800 font-bold">
                  {r.safetyScore} / 100
                </td>
              ))}
            </tr>
            <tr>
              <td className="py-3 px-4 text-slate-600 font-sans font-semibold">CO₂ Emissions</td>
              {routes.map(r => (
                <td key={r.id} className="py-3 px-4 text-[#166534] font-bold">
                  {r.estimatedCo2Kg} kg
                </td>
              ))}
            </tr>
            <tr>
              <td className="py-3 px-4 text-slate-600 font-sans font-semibold">CO₂ Savings vs Baseline</td>
              {routes.map(r => (
                <td key={r.id} className="py-3 px-4 text-[#166534] font-bold">
                  +{r.co2SavingsKg} kg
                </td>
              ))}
            </tr>
            <tr>
              <td className="py-3 px-4 text-slate-600 font-sans font-semibold">Action</td>
              {routes.map(r => (
                <td key={r.id} className="py-3 px-4">
                  <button
                    disabled={r.clearanceStatus === 'failed'}
                    onClick={() => {
                      onSelectRoute(r);
                      onClose();
                    }}
                    className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition ${
                      r.clearanceStatus === 'failed'
                        ? 'bg-slate-100 text-slate-400 cursor-not-allowed border border-slate-200'
                        : 'bg-[#166534] hover:bg-[#14532d] text-white shadow-sm'
                    }`}
                  >
                    Select
                  </button>
                </td>
              ))}
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
};
