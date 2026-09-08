import React from 'react';
import {
  CheckCircle2,
  Loader2,
  Cpu,
  ShieldCheck,
  Activity,
  Zap,
  Radio
} from 'lucide-react';
import { useCityFlow } from '../../context/CityFlowContext';

export const AnalysisModal: React.FC = () => {
  const { isAnalyzing, analysisStage, selectedVehicle } = useCityFlow();

  if (!isAnalyzing) return null;

  const stages = [
    { label: 'Scanning road network & geometry...', icon: <Radio className="w-4 h-4" /> },
    { label: 'Checking vehicle clearance (height, width, weight, length)...', icon: <ShieldCheck className="w-4 h-4" /> },
    { label: 'Analyzing real-time and historical traffic density...', icon: <Activity className="w-4 h-4" /> },
    { label: 'Predicting journey reliability and delay probability...', icon: <Cpu className="w-4 h-4" /> },
    { label: 'Calculating safety scores & infrastructure risk factors...', icon: <ShieldCheck className="w-4 h-4" /> },
    { label: 'Estimating CO₂ emissions and stop-and-go energy loss...', icon: <Zap className="w-4 h-4" /> },
    { label: 'Ranking candidate routes using multi-criteria weighting...', icon: <CheckCircle2 className="w-4 h-4" /> },
  ];

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="w-full max-w-lg bg-white border border-slate-200 rounded-2xl p-6 md:p-8 shadow-2xl text-left">
        {/* Header */}
        <div className="flex items-center space-x-3 mb-6 pb-4 border-b border-slate-100">
          <div className="w-12 h-12 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-center">
            <Cpu className="w-6 h-6 text-[#166534] animate-spin" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-900 tracking-tight">RouteShield Analysis Engine</h3>
            <p className="text-xs text-slate-500">
              Evaluating parameters for <strong className="text-slate-800">{selectedVehicle.name}</strong> ({selectedVehicle.height}m H · {selectedVehicle.weight}T)
            </p>
          </div>
        </div>

        {/* Stages Checklist */}
        <div className="space-y-3 mb-6">
          {stages.map((stage, idx) => {
            const isDone = idx < analysisStage;
            const isCurrent = idx === analysisStage;
            const isPending = idx > analysisStage;

            return (
              <div
                key={stage.label}
                className={`flex items-center space-x-3 px-3.5 py-2.5 rounded-xl border transition-all text-xs ${
                  isDone
                    ? 'bg-emerald-50/70 border-emerald-200 text-slate-800'
                    : isCurrent
                    ? 'bg-slate-50 border-emerald-500 text-slate-900 font-semibold shadow-sm'
                    : 'bg-white border-slate-100 text-slate-400'
                }`}
              >
                <div className="shrink-0">
                  {isDone && <CheckCircle2 className="w-4 h-4 text-[#166534]" />}
                  {isCurrent && <Loader2 className="w-4 h-4 text-[#166534] animate-spin" />}
                  {isPending && <div className="w-4 h-4 rounded-full border border-slate-300" />}
                </div>
                <div className="flex-1 font-medium">{stage.label}</div>
                {isDone && <span className="text-[10px] font-mono text-[#166534] font-bold">DONE</span>}
                {isCurrent && <span className="text-[10px] font-mono text-[#166534] font-bold animate-pulse">PROCESSING</span>}
              </div>
            );
          })}
        </div>

        {/* Progress bar */}
        <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden border border-slate-200">
          <div
            className="bg-[#166534] h-full transition-all duration-300"
            style={{ width: `${Math.round(((analysisStage + 1) / 7) * 100)}%` }}
          />
        </div>
        <div className="mt-2 text-right text-[10px] font-mono text-slate-500">
          STAGE {Math.min(7, analysisStage + 1)} / 7
        </div>
      </div>
    </div>
  );
};
