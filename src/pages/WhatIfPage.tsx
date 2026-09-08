import React from 'react';
import { Activity } from 'lucide-react';
import { ScenarioControls } from '../components/whatif/ScenarioControls';
import { BeforeAfterChart } from '../components/whatif/BeforeAfterChart';
import { ContingencyCard } from '../components/whatif/ContingencyCard';
import { CityMap } from '../components/map/CityMap';
import { useSimulation } from '../context/SimulationContext';

export const WhatIfPage: React.FC = () => {
  const { simulationResult } = useSimulation();

  return (
    <div className="space-y-6 text-left">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              What-If Stress Simulator
            </h1>
            <span className="text-xs font-mono font-bold px-2.5 py-0.5 rounded-full bg-emerald-100 text-[#166534] border border-emerald-300">
              DISRUPTION RESILIENCE
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-600 mt-1">
            Stress-test your routes before disruption happens.
          </p>
        </div>

        <div className="flex items-center space-x-2 text-xs font-mono text-slate-600 bg-white px-3 py-1.5 rounded-xl border border-slate-200 shadow-sm">
          <Activity className="w-3.5 h-3.5 text-emerald-700 animate-pulse" />
          <span>Simulation Engine: Ready</span>
        </div>
      </div>

      {/* Scenario Controls */}
      <ScenarioControls />

      {/* Contingency Route Recommendation Banner */}
      {simulationResult && <ContingencyCard />}

      {/* Before / After Comparison Charts & Map */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        <div className="lg:col-span-7 space-y-4">
          <BeforeAfterChart />
        </div>

        <div className="lg:col-span-5 sticky top-24 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider font-mono">
              Simulated Disruption Network
            </h3>
            <span className="text-[10px] font-mono text-amber-700 font-bold">
              SURFACE FRICTION -40%
            </span>
          </div>
          <CityMap heightClass="h-[460px]" showControls={false} />
        </div>
      </div>
    </div>
  );
};
