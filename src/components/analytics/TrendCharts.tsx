import React, { useState } from 'react';
import { Calendar } from 'lucide-react';

export const TrendCharts: React.FC = () => {
  const [timeframe, setTimeframe] = useState<'today' | '7d' | '30d'>('today');

  // Simulated data based on timeframe
  const reliabilityData = timeframe === 'today'
    ? [
        { label: '06:00', value: 95 },
        { label: '08:00', value: 84 },
        { label: '10:00', value: 91 },
        { label: '12:00', value: 93 },
        { label: '14:00', value: 89 },
        { label: '16:00', value: 82 },
        { label: '18:00', value: 86 },
        { label: '20:00', value: 94 },
        { label: '22:00', value: 97 }
      ]
    : timeframe === '7d'
    ? [
        { label: 'Mon', value: 92 },
        { label: 'Tue', value: 94 },
        { label: 'Wed', value: 89 },
        { label: 'Thu', value: 91 },
        { label: 'Fri', value: 87 },
        { label: 'Sat', value: 96 },
        { label: 'Sun', value: 98 }
      ]
    : [
        { label: 'W1', value: 90 },
        { label: 'W2', value: 93 },
        { label: 'W3', value: 91 },
        { label: 'W4', value: 95 }
      ];

  const co2Comparison = timeframe === 'today'
    ? [
        { corridor: 'Expressway A-10', standard: 18.4, cityflow: 13.7 },
        { corridor: 'Ring Beltway B', standard: 16.2, cityflow: 12.1 },
        { corridor: 'Green Viaduct C', standard: 15.0, cityflow: 11.9 },
        { corridor: 'Harbor Link', standard: 22.0, cityflow: 17.5 },
      ]
    : [
        { corridor: 'North Distribution', standard: 124, cityflow: 94 },
        { corridor: 'East Freight Depot', standard: 148, cityflow: 112 },
        { corridor: 'Airport Cargo Hub', standard: 162, cityflow: 128 },
        { corridor: 'South Terminal', standard: 110, cityflow: 88 }
      ];

  return (
    <div className="space-y-6 text-left">
      {/* Time Filter Bar */}
      <div className="flex items-center justify-between bg-white border border-slate-200 p-3.5 rounded-2xl shadow-sm">
        <div className="flex items-center space-x-2 text-xs text-slate-700 font-medium">
          <Calendar className="w-4 h-4 text-[#166534]" />
          <span>Analytics Horizon</span>
        </div>
        <div className="flex items-center space-x-1 bg-slate-100 p-1 rounded-xl border border-slate-200">
          {(['today', '7d', '30d'] as const).map(t => (
            <button
              key={t}
              onClick={() => setTimeframe(t)}
              className={`px-3 py-1 rounded-lg text-xs font-semibold uppercase tracking-wider transition ${
                timeframe === t
                  ? 'bg-[#166534] text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {t === 'today' ? 'Today' : t === '7d' ? '7 Days' : '30 Days'}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Reliability Trend Chart */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
          <div className="flex items-center justify-between mb-4 pb-2 border-b border-slate-100">
            <div>
              <h3 className="text-sm font-bold text-slate-900 tracking-tight">Fleet Journey Reliability Index</h3>
              <p className="text-[11px] text-slate-500">Mean reliability performance score vs 90 threshold</p>
            </div>
            <span className="text-xs font-mono font-bold text-[#166534] bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
              AVG 91.4
            </span>
          </div>

          {/* SVG Line / Bar Chart */}
          <div className="h-56 w-full pt-4">
            <svg viewBox="0 0 500 180" className="w-full h-full overflow-visible">
              <defs>
                <linearGradient id="chartGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#166534" stopOpacity="0.25" />
                  <stop offset="100%" stopColor="#166534" stopOpacity="0.0" />
                </linearGradient>
              </defs>

              {/* Threshold line 90 */}
              <line x1="0" y1="36" x2="500" y2="36" stroke="#166534" strokeWidth="1" strokeDasharray="4 4" opacity="0.6" />
              <text x="495" y="32" textAnchor="end" fill="#166534" fontSize="9" fontFamily="monospace" fontWeight="bold">TARGET 90</text>

              {/* Grid lines */}
              <line x1="0" y1="90" x2="500" y2="90" stroke="#f1f5f9" strokeWidth="1" />
              <line x1="0" y1="140" x2="500" y2="140" stroke="#f1f5f9" strokeWidth="1" />

              {/* Points & Polyline */}
              {(() => {
                const step = 500 / (reliabilityData.length - 1);
                const points = reliabilityData.map((d, i) => {
                  const x = i * step;
                  // Map 75..100 to y 150..20
                  const y = 160 - ((d.value - 75) / 25) * 140;
                  return { x, y, ...d };
                });

                const polylinePoints = points.map(p => `${p.x},${p.y}`).join(' ');
                const areaPoints = `0,160 ${polylinePoints} 500,160`;

                return (
                  <>
                    <polygon points={areaPoints} fill="url(#chartGrad)" />
                    <polyline points={polylinePoints} fill="none" stroke="#166534" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
                    {points.map((p, i) => (
                      <g key={i}>
                        <circle cx={p.x} cy={p.y} r="4.5" fill="#ffffff" stroke="#166534" strokeWidth="2.5" />
                        <text x={p.x} y="176" textAnchor="middle" fill="#64748b" fontSize="9" fontFamily="monospace">{p.label}</text>
                        <text x={p.x} y={p.y - 8} textAnchor="middle" fill="#0f172a" fontSize="9" fontFamily="monospace" fontWeight="bold">{p.value}</text>
                      </g>
                    ))}
                  </>
                );
              })()}
            </svg>
          </div>
        </div>

        {/* CO2 Emissions Comparison Chart */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
          <div className="flex items-center justify-between mb-4 pb-2 border-b border-slate-100">
            <div>
              <h3 className="text-sm font-bold text-slate-900 tracking-tight">Corridor CO₂ Comparison</h3>
              <p className="text-[11px] text-slate-500">Baseline navigation vs CityFlow eco-clearance routing (kg)</p>
            </div>
            <div className="flex items-center space-x-3 text-[10px] font-mono">
              <span className="flex items-center space-x-1 text-slate-500">
                <span className="w-2.5 h-2.5 bg-slate-300 rounded" />
                <span>Baseline</span>
              </span>
              <span className="flex items-center space-x-1 text-[#166534] font-bold">
                <span className="w-2.5 h-2.5 bg-[#166534] rounded" />
                <span>CityFlow</span>
              </span>
            </div>
          </div>

          <div className="space-y-4 pt-2">
            {co2Comparison.map((item, idx) => {
              const maxVal = Math.max(...co2Comparison.map(c => c.standard));
              const stdWidth = (item.standard / maxVal) * 100;
              const cfWidth = (item.cityflow / maxVal) * 100;
              const savings = +(item.standard - item.cityflow).toFixed(1);

              return (
                <div key={idx} className="space-y-1.5 text-xs">
                  <div className="flex justify-between text-slate-700 font-medium">
                    <span>{item.corridor}</span>
                    <span className="text-[#166534] font-mono font-bold">-{savings} kg ({Math.round((savings / item.standard) * 100)}%)</span>
                  </div>
                  <div className="space-y-1">
                    <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                      <div className="bg-slate-300 h-full rounded-full" style={{ width: `${stdWidth}%` }} />
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                      <div className="bg-[#166534] h-full rounded-full" style={{ width: `${cfWidth}%` }} />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

