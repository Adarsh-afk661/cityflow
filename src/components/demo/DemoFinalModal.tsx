import React from 'react';
import { CheckCircle2, Sparkles, X, ArrowRight } from 'lucide-react';
import { useCityFlow } from '../../context/CityFlowContext';

export const DemoFinalModal: React.FC = () => {
  const { demoFinalModalOpen, closeDemoFinalModal, setActivePage } = useCityFlow();

  if (!demoFinalModalOpen) return null;

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-[99999] p-4">
      <div className="w-full max-w-xl bg-white border border-slate-200 rounded-3xl p-7 shadow-2xl text-left">
        {/* Celebration Header */}
        <div className="flex items-start justify-between pb-4 mb-4 border-b border-slate-100">
          <div className="flex items-center space-x-3">
            <div className="w-14 h-14 rounded-2xl bg-emerald-100 border border-emerald-300 flex items-center justify-center text-[#166534] shadow-sm">
              <Sparkles className="w-8 h-8" />
            </div>
            <div>
              <span className="text-[10px] font-mono uppercase tracking-widest px-2 py-0.5 rounded bg-emerald-100 text-[#166534] border border-emerald-300 font-bold">
                DISPATCH INTELLIGENCE COMPLETE
              </span>
              <h3 className="text-xl font-extrabold text-slate-900 mt-1">
                Optimal Resilient Recommendation
              </h3>
              <p className="text-xs text-slate-600">
                End-to-End RouteShield & Stress Simulation Verification
              </p>
            </div>
          </div>
          <button
            onClick={closeDemoFinalModal}
            className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Highlight Card */}
        <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200 mb-5 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <div>
              <span className="text-xs font-semibold text-[#166534] uppercase tracking-wider">Recommended Route</span>
              <h4 className="text-2xl font-black text-slate-900">ROUTE C — GREEN CORRIDOR</h4>
            </div>
            <span className="px-3 py-1 rounded-full bg-emerald-100 text-[#166534] border border-emerald-300 text-xs font-mono font-bold flex items-center space-x-1">
              <CheckCircle2 className="w-4 h-4" />
              <span>VEHICLE CLEARANCE: APPROVED</span>
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 my-4">
            <div className="bg-white p-2.5 rounded-xl border border-slate-200 text-center shadow-xs">
              <span className="text-[10px] text-slate-500 uppercase block">Reliability</span>
              <span className="text-lg font-mono font-extrabold text-[#166534]">94 / 100</span>
            </div>
            <div className="bg-white p-2.5 rounded-xl border border-slate-200 text-center shadow-xs">
              <span className="text-[10px] text-slate-500 uppercase block">Delay Probability</span>
              <span className="text-lg font-mono font-extrabold text-[#166534]">8%</span>
            </div>
            <div className="bg-white p-2.5 rounded-xl border border-slate-200 text-center shadow-xs">
              <span className="text-[10px] text-slate-500 uppercase block">Safety Score</span>
              <span className="text-lg font-mono font-extrabold text-slate-900">91 / 100</span>
            </div>
            <div className="bg-white p-2.5 rounded-xl border border-slate-200 text-center shadow-xs">
              <span className="text-[10px] text-slate-500 uppercase block">Estimated CO₂</span>
              <span className="text-lg font-mono font-extrabold text-[#166534]">13.7 kg</span>
            </div>
          </div>

          <p className="text-xs text-slate-700 leading-relaxed font-medium bg-white p-3 rounded-xl border border-slate-200 shadow-xs">
            "CityFlow has selected the route with the best balance of speed, reliability, safety and environmental efficiency."
          </p>
        </div>

        {/* Product Positioning Summary */}
        <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 mb-6 text-xs space-y-2">
          <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
            CityFlow Product Positioning
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
            <div className="p-2.5 rounded-lg bg-white border border-slate-200 shadow-xs">
              <span className="text-[10px] text-slate-500 font-bold block uppercase">Traditional Navigation</span>
              <p className="text-slate-700 font-medium mt-1">
                "Which route is fastest?"
              </p>
            </div>
            <div className="p-2.5 rounded-lg bg-emerald-50 border border-emerald-200 shadow-xs">
              <span className="text-[10px] text-[#166534] font-bold block uppercase">CityFlow Route Intelligence</span>
              <p className="text-slate-900 font-medium mt-1">
                "Which route is vehicle-suitable, reliable, safe, efficient, and resilient to disruptions?"
              </p>
            </div>
          </div>
        </div>

        {/* Bottom CTA */}
        <div className="flex items-center justify-between">
          <span className="text-xs text-slate-500">
            Automated demo tour complete. Ready for exploration.
          </span>
          <button
            onClick={() => {
              closeDemoFinalModal();
              setActivePage('dashboard');
            }}
            className="px-6 py-2.5 rounded-xl bg-[#166534] hover:bg-[#14532d] text-white font-bold text-xs flex items-center space-x-1.5 shadow-sm transition"
          >
            <span>Explore Dashboard</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

