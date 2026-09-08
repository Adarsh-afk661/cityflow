import React from 'react';
import { Sparkles, ArrowRight, Zap, LayoutDashboard, ShieldCheck } from 'lucide-react';
import { InteractiveHeroCard } from './InteractiveHeroCard';
import { useCityFlow } from '../../context/CityFlowContext';

interface HeroSectionProps {
  onOpenDemo: () => void;
  onSeeHowItWorks: () => void;
}

export const HeroSection: React.FC<HeroSectionProps> = ({
  onOpenDemo,
  onSeeHowItWorks
}) => {
  const { setActivePage } = useCityFlow();

  return (
    <section className="pt-10 pb-16 px-6 max-w-5xl mx-auto text-left">
      {/* Pill Badge */}
      <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-emerald-50 border border-emerald-300 text-emerald-900 text-xs md:text-sm font-semibold mb-6 shadow-xs">
        <span className="w-2 h-2 rounded-full bg-emerald-600 animate-pulse" />
        <span>AI-Powered Route Intelligence & Fleet Decision Support Platform</span>
      </div>

      {/* Main Headline */}
      <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold text-slate-950 tracking-tight leading-[1.1] max-w-3xl mb-6">
        Route every truck like you know exactly what won't fit.
      </h1>

      {/* Subtitle */}
      <p className="text-base sm:text-lg text-slate-600 max-w-2xl leading-relaxed mb-8 font-medium">
        CityFlow cross-references commercial vehicle dimensions against physical bridge heights, tunnel restrictions, and real-time ML delay bottlenecks before departure — eliminating underpass collisions and dispatch surprises.
      </p>

      {/* Primary CTAs */}
      <div className="flex flex-wrap items-center gap-3.5 mb-12">
        <button
          onClick={onSeeHowItWorks}
          className="px-6 py-3 rounded-xl bg-[#166534] hover:bg-[#14532d] text-white font-bold text-sm transition shadow-sm flex items-center space-x-2 cursor-pointer"
        >
          <Zap className="w-4 h-4 fill-white" />
          <span>Launch RouteShield Platform</span>
          <ArrowRight className="w-4 h-4" />
        </button>

        <button
          onClick={() => setActivePage('dashboard')}
          className="px-6 py-3 rounded-xl border border-slate-300 hover:border-slate-400 bg-white text-slate-800 font-bold text-sm transition hover:bg-slate-50 flex items-center space-x-2 cursor-pointer shadow-xs"
        >
          <LayoutDashboard className="w-4 h-4 text-emerald-800" />
          <span>Open Digital Twin Command Center</span>
        </button>

        <button
          onClick={onOpenDemo}
          className="px-5 py-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-sm transition cursor-pointer"
        >
          Watch Guided Tour
        </button>
      </div>

      {/* Realistic Real-World Platform Metrics */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 max-w-4xl mb-12 border-t border-slate-200/80 pt-8">
        <div>
          <div className="text-2xl sm:text-3xl font-extrabold font-mono text-slate-950">
            99.8%
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-1 font-medium leading-snug">
            Physical Clearance Accuracy
          </p>
        </div>

        <div>
          <div className="text-2xl sm:text-3xl font-extrabold font-mono text-slate-950">
            19.8 km
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-1 font-medium leading-snug">
            Certified Corridor Telemetry
          </p>
        </div>

        <div>
          <div className="text-2xl sm:text-3xl font-extrabold font-mono text-slate-950">
            24+
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-1 font-medium leading-snug">
            Live Monitored Fleet Units
          </p>
        </div>

        <div>
          <div className="text-2xl sm:text-3xl font-extrabold font-mono text-slate-950">
            &lt; 200ms
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-1 font-medium leading-snug">
            XGBoost ML Rerouting Latency
          </p>
        </div>
      </div>

      {/* Realistic Interactive Product Demonstration Card */}
      <InteractiveHeroCard />
    </section>
  );
};
