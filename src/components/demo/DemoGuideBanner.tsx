import React from 'react';
import { Loader2 } from 'lucide-react';
import { useCityFlow } from '../../context/CityFlowContext';

export const DemoGuideBanner: React.FC = () => {
  const { isDemoRunning, demoStep } = useCityFlow();

  if (!isDemoRunning) return null;

  const stepMessages: Record<number, { title: string; desc: string }> = {
    1: {
      title: 'Demo Step 1: Vehicle & Corridor Initialized',
      desc: 'Selected Heavy Delivery Truck (4.1m H · 2.5m W · 12m L · 16T). Start: Central Warehouse → Dest: North Distribution Hub.'
    },
    2: {
      title: 'Demo Step 2: Executing RouteShield Intelligence',
      desc: 'Running 7-stage engine: clearance validation, predictive reliability, road safety, and emissions calculation...'
    },
    3: {
      title: 'Demo Step 3: Clearance Validation & Rejection',
      desc: 'Route A rejected due to 3.8m underpass violation (excess: 0.3m). Route B & C approved. Route B recommended.'
    },
    4: {
      title: 'Demo Step 4: What-If Stress Testing',
      desc: 'Navigating to What-If Simulator and applying Heavy Rain (30mm) scenario...'
    },
    5: {
      title: 'Demo Step 5: Contingency Route Determination',
      desc: 'Simulating weather impact: Route A plunges to 132 min, Route C emerges as the most resilient contingency!'
    }
  };

  const current = stepMessages[demoStep] || stepMessages[1];

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 w-11/12 max-w-2xl bg-white/95 backdrop-blur-md border border-slate-300 p-4 rounded-2xl shadow-xl z-50 flex items-center justify-between gap-4 text-left">
      <div className="flex items-center space-x-3">
        <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-[#166534] shrink-0">
          <Loader2 className="w-5 h-5 animate-spin" />
        </div>
        <div>
          <div className="flex items-center space-x-2">
            <span className="text-[10px] uppercase font-mono font-bold px-2 py-0.5 rounded bg-emerald-100 text-[#166534] border border-emerald-200">
              LIVE DEMO WALKTHROUGH · STEP {demoStep} / 5
            </span>
          </div>
          <h4 className="text-sm font-extrabold text-slate-900 mt-0.5">{current.title}</h4>
          <p className="text-xs text-slate-600 leading-snug">{current.desc}</p>
        </div>
      </div>

      <div className="flex items-center space-x-1.5 shrink-0 font-mono text-xs">
        {[1, 2, 3, 4, 5].map(step => (
          <span
            key={step}
            className={`w-2.5 h-2.5 rounded-full ${
              step === demoStep ? 'bg-[#166534] animate-pulse ring-2 ring-emerald-200' : step < demoStep ? 'bg-emerald-600' : 'bg-slate-200'
            }`}
          />
        ))}
      </div>
    </div>
  );
};

