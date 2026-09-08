import React from 'react';
import { Activity, LayoutGrid, Bell, ShieldCheck, ArrowRight } from 'lucide-react';

interface FeatureGridProps {
  onExploreFeature: (featureKey: string) => void;
}

export const FeatureGrid: React.FC<FeatureGridProps> = ({ onExploreFeature }) => {
  const features = [
    {
      id: 'whatif',
      icon: <Activity className="w-5 h-5 text-emerald-700" />,
      iconBg: 'bg-emerald-50',
      title: 'What-if stress testing',
      desc: 'Simulate a closed corridor, a surge in demand, or a new vehicle class before it happens, and see exactly which routes absorb the impact.',
      actionLabel: 'Launch Simulator'
    },
    {
      id: 'fleet',
      icon: <LayoutGrid className="w-5 h-5 text-emerald-700" />,
      iconBg: 'bg-emerald-50',
      title: 'Live fleet visibility',
      desc: 'Every active vehicle, its current corridor, and its clearance status in one dispatch view — no separate tracking tool required.',
      actionLabel: 'View Fleet Board'
    },
    {
      id: 'routeshield',
      icon: <Bell className="w-5 h-5 text-emerald-700" />,
      iconBg: 'bg-emerald-50',
      title: 'Automatic barring',
      desc: 'Corridors that violate a vehicle’s physical limits are removed from the recommendation set automatically — never shown to a driver by mistake.',
      actionLabel: 'Test RouteShield'
    }
  ];

  return (
    <section className="py-20 px-6 max-w-5xl mx-auto text-left">
      {/* Section Header */}
      <div className="mb-14">
        <span className="text-xs font-semibold text-emerald-800 uppercase tracking-wider block mb-3">
          Platform
        </span>
        <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-slate-950 tracking-tight leading-[1.15] mb-5">
          Built around the truck, not just the map.
        </h2>
        <p className="text-base sm:text-lg text-slate-600 max-w-2xl leading-relaxed">
          Most routing tools optimize for time. CityFlow starts with what the vehicle physically can and can’t do, then layers in traffic, weather, and cost.
        </p>
      </div>

      {/* Feature List Cards (Matching Screenshot 4) */}
      <div className="divide-y divide-slate-200 border-t border-b border-slate-200">
        {features.map(f => (
          <div
            key={f.id}
            onClick={() => onExploreFeature(f.id)}
            className="py-8 group cursor-pointer flex flex-col md:flex-row md:items-start justify-between gap-6 hover:bg-slate-50/70 px-4 -mx-4 rounded-xl transition"
          >
            <div className="flex items-start space-x-4 max-w-3xl">
              <div className={`p-2.5 rounded-xl ${f.iconBg} shrink-0 border border-emerald-100 shadow-sm mt-0.5`}>
                {f.icon}
              </div>
              <div>
                <h3 className="text-xl font-bold text-slate-900 group-hover:text-emerald-800 transition">
                  {f.title}
                </h3>
                <p className="text-sm sm:text-base text-slate-600 mt-2 leading-relaxed">
                  {f.desc}
                </p>
              </div>
            </div>

            <button
              onClick={e => {
                e.stopPropagation();
                onExploreFeature(f.id);
              }}
              className="inline-flex items-center space-x-1.5 text-xs font-bold text-emerald-800 hover:text-emerald-950 transition uppercase tracking-wider shrink-0 md:mt-2"
            >
              <span>{f.actionLabel}</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition" />
            </button>
          </div>
        ))}
      </div>
    </section>
  );
};
