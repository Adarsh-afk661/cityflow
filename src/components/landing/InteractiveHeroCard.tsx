import React, { useState } from 'react';
import { ShieldCheck, ShieldAlert, AlertTriangle, Check } from 'lucide-react';

export const InteractiveHeroCard: React.FC = () => {
  const [selectedRouteId, setSelectedRouteId] = useState<'A' | 'B' | 'C'>('C');

  const routes = [
    {
      id: 'A' as const,
      name: 'Route A · Ashford bypass',
      duration: '22 min',
      status: 'clear' as const,
      badgeText: 'clear',
      badgeClass: 'bg-[#166534] text-white',
      desc: 'Free flowing peripheral bypass. All bridge clearances exceed 4.8m.'
    },
    {
      id: 'B' as const,
      name: 'Route B · Deacon underpass',
      duration: '19 min',
      status: 'barred' as const,
      badgeText: 'barred',
      badgeClass: 'bg-rose-100 text-rose-700 font-semibold border border-rose-200',
      desc: 'Barred: 3.8m low-overhead railway arch. Vehicle height 4.1m violates clearance by 0.3m.'
    },
    {
      id: 'C' as const,
      name: 'Route C · Harrow ring road',
      duration: '26 min',
      status: 'selected' as const,
      badgeText: 'selected',
      badgeClass: 'bg-[#166534] text-white font-semibold',
      desc: 'Selected: Clearance certified (5.2m viaduct). Steady momentum and optimal buffer.'
    }
  ];

  return (
    <div className="w-full max-w-xl mx-auto bg-white rounded-3xl p-6 md:p-8 shadow-[0_20px_50px_rgba(0,0,0,0.06)] border border-slate-200/90 text-left transition-all">
      {/* Card Header */}
      <div className="flex items-center justify-between pb-4 border-b border-slate-100">
        <span className="text-xs md:text-sm font-medium text-slate-500 font-mono">
          Central warehouse → North distribution hub
        </span>
        <div className="flex items-center space-x-1.5 text-xs font-mono text-emerald-700 font-semibold">
          <span className="w-2 h-2 rounded-full bg-emerald-600 animate-pulse" />
          <span>Live</span>
        </div>
      </div>

      {/* Routes List */}
      <div className="space-y-2.5 py-4">
        {routes.map(r => {
          const isSelected = selectedRouteId === r.id;
          const isBarred = r.status === 'barred';

          return (
            <div
              key={r.id}
              onClick={() => {
                if (!isBarred) setSelectedRouteId(r.id);
              }}
              className={`flex items-center justify-between px-4 py-3.5 rounded-2xl transition-all cursor-pointer select-none ${
                isSelected
                  ? 'bg-[#ecfdf5] border border-emerald-200/80 shadow-sm'
                  : isBarred
                  ? 'bg-slate-50/60 opacity-65 cursor-not-allowed'
                  : 'bg-slate-50/80 hover:bg-slate-100/80'
              }`}
            >
              <div className="flex items-center space-x-3">
                <span
                  className={`text-sm md:text-base font-semibold ${
                    isBarred ? 'line-through text-slate-400' : 'text-slate-800'
                  }`}
                >
                  {r.name}
                </span>
              </div>

              <div className="flex items-center space-x-3 font-mono">
                <span className={`text-xs md:text-sm ${isBarred ? 'text-slate-400' : 'text-slate-600'}`}>
                  {r.duration}
                </span>
                <span
                  className={`px-3 py-1 rounded-full text-xs uppercase font-mono tracking-wider ${
                    isBarred
                      ? 'bg-rose-50 text-rose-600 font-bold'
                      : isSelected
                      ? 'bg-[#166534] text-white font-bold'
                      : 'bg-[#166534] text-white font-medium'
                  }`}
                >
                  {r.badgeText}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Clearance Warning Feedback if Deacon Underpass is clicked */}
      {selectedRouteId === 'B' || (
        <div className="mt-1 px-3 py-2 rounded-xl bg-amber-50/80 border border-amber-200 text-xs text-amber-900 flex items-center space-x-2">
          <AlertTriangle className="w-3.5 h-3.5 text-amber-700 shrink-0" />
          <span>
            <strong>Automatic barring:</strong> Deacon underpass removed from dispatch options (4.1m vehicle vs 3.8m limit).
          </span>
        </div>
      )}

      {/* SVG Elevation & Trajectory Contour Curve */}
      <div className="pt-6 relative">
        <svg viewBox="0 0 500 120" className="w-full h-24 overflow-visible">
          <defs>
            <linearGradient id="curveGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#0f766e" />
              <stop offset="50%" stopColor="#166534" />
              <stop offset="100%" stopColor="#15803d" />
            </linearGradient>
          </defs>

          {/* Smooth S-curve route path */}
          <path
            d="M 25,100 C 120,10 260,130 380,40 C 420,10 460,20 480,25"
            fill="none"
            stroke="url(#curveGradient)"
            strokeWidth="4"
            strokeLinecap="round"
          />

          {/* Start Origin Node */}
          <circle cx="25" cy="100" r="7" fill="#1e3a8a" />
          <circle cx="25" cy="100" r="3.5" fill="#ffffff" />

          {/* Destination Node */}
          <circle cx="480" cy="25" r="8" fill="#166534" />
          <circle cx="480" cy="25" r="4" fill="#ffffff" />
          <circle cx="480" cy="25" r="14" fill="none" stroke="#166534" strokeWidth="1.5" className="animate-ping" opacity="0.4" />

          {/* Dynamic waypoint marker */}
          <circle cx="260" cy="78" r="5" fill="#166534" />
        </svg>

        <div className="flex items-center justify-between text-[11px] font-mono text-slate-400 mt-1">
          <span>Warehouse Origin (Elev: 42m)</span>
          <span>Harrow Viaduct Clearance Apex (5.2m)</span>
          <span>North Hub Dest (Elev: 85m)</span>
        </div>
      </div>
    </div>
  );
};
