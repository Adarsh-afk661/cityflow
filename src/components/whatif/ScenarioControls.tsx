import React from 'react';
import {
  CloudRain,
  Car,
  AlertOctagon,
  TrendingUp,
  Play,
  RotateCcw,
  Sliders
} from 'lucide-react';
import { useSimulation } from '../../context/SimulationContext';

export const ScenarioControls: React.FC = () => {
  const {
    scenarios,
    toggleScenario,
    setScenarioSeverity,
    runSimulation,
    resetSimulation,
    isSimulating
  } = useSimulation();

  const getScenarioIcon = (type: string) => {
    switch (type) {
      case 'rain': return <CloudRain className="w-4 h-4 text-blue-600" />;
      case 'collision': return <Car className="w-4 h-4 text-amber-600" />;
      case 'closure': return <AlertOctagon className="w-4 h-4 text-rose-600" />;
      default: return <TrendingUp className="w-4 h-4 text-[#166534]" />;
    }
  };

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm text-left">
      <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-100">
        <div>
          <h2 className="text-base font-bold text-slate-900 tracking-tight">Stress-Test Scenario Configurator</h2>
          <p className="text-xs text-slate-500">Inject dynamic climate and infrastructure disruptions</p>
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={resetSimulation}
            className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 hover:text-slate-900 transition"
            title="Reset to baseline"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-5">
        {scenarios.map(s => (
          <div
            key={s.id}
            className={`p-4 rounded-xl border transition-all ${
              s.active
                ? 'bg-[#ecfdf5] border-emerald-400 shadow-sm'
                : 'bg-slate-50/60 border-slate-200 hover:border-slate-300'
            }`}
          >
            <div className="flex items-start justify-between">
              <label className="flex items-start space-x-3 cursor-pointer select-none">
                <input
                  type="checkbox"
                  id={`scenario-checkbox-${s.id}`}
                  checked={s.active}
                  onChange={() => toggleScenario(s.id)}
                  className="mt-1 rounded border-slate-300 text-[#166534] focus:ring-0"
                />
                <div>
                  <div className="flex items-center space-x-2">
                    {getScenarioIcon(s.type)}
                    <span className={`text-xs font-bold ${s.active ? 'text-[#166534]' : 'text-slate-800'}`}>
                      {s.name}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 mt-1 leading-snug">{s.description}</p>
                </div>
              </label>
            </div>

            {s.active && (
              <div className="mt-3 pt-2.5 border-t border-emerald-200 flex items-center justify-between text-xs">
                <span className="text-[10px] text-slate-500 uppercase font-bold flex items-center space-x-1">
                  <Sliders className="w-3 h-3" />
                  <span>Severity Level</span>
                </span>
                <div className="flex items-center space-x-1">
                  {[1, 2, 3].map(lvl => (
                    <button
                      key={lvl}
                      onClick={() => setScenarioSeverity(s.id, lvl)}
                      className={`px-2.5 py-0.5 rounded text-[10px] font-mono font-bold transition ${
                        s.severity === lvl
                          ? 'bg-[#166534] text-white shadow-sm'
                          : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
                      }`}
                    >
                      {lvl === 1 ? 'Mild' : lvl === 2 ? 'Moderate' : 'Extreme'}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="flex items-center justify-between pt-3 border-t border-slate-100">
        <span className="text-[11px] text-slate-500">
          Simulates hydraulic roadway saturation, merge friction loss, and ripple queuing.
        </span>
        <button
          id="run-simulation-btn"
          onClick={runSimulation}
          disabled={isSimulating}
          className="px-6 py-2.5 rounded-xl bg-[#166534] hover:bg-[#14532d] text-white font-bold text-xs flex items-center space-x-2 shadow-sm transition"
        >
          <Play className="w-3.5 h-3.5 fill-white text-white" />
          <span>{isSimulating ? 'Simulating Disruption...' : 'RUN SIMULATION'}</span>
        </button>
      </div>
    </div>
  );
};
