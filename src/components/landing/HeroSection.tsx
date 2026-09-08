import React from 'react';
import { Sparkles, ArrowRight } from 'lucide-react';
import { InteractiveHeroCard } from './InteractiveHeroCard';

interface HeroSectionProps {
  onOpenDemo: () => void;
  onSeeHowItWorks: () => void;
}

export const HeroSection: React.FC<HeroSectionProps> = ({
  onOpenDemo,
  onSeeHowItWorks
}) => {
  return (
    <section className="pt-12 pb-16 px-6 max-w-5xl mx-auto text-left">
      {/* Pill Badge */}
      <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-emerald-50 border border-emerald-200/80 text-emerald-800 text-xs md:text-sm font-medium mb-6">
        <span className="w-2 h-2 rounded-full bg-emerald-600" />
        <span>Now covering 40 metro corridors</span>
      </div>

      {/* Main Punchy Headline */}
      <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold text-slate-950 tracking-tight leading-[1.1] max-w-3xl mb-6">
        Route every truck like you know exactly what won't fit.
      </h1>

      {/* Subtitle */}
      <p className="text-base sm:text-lg text-slate-600 max-w-2xl leading-relaxed mb-8">
        CityFlow checks bridge heights, weight limits, and live traffic before a route ever reaches a driver — so dispatch stops discovering problems at the underpass.
      </p>

      {/* CTAs */}
      <div className="flex flex-wrap items-center gap-3 mb-14">
        <button
          onClick={onOpenDemo}
          className="px-6 py-3 rounded-xl bg-[#166534] hover:bg-[#14532d] text-white font-semibold text-sm transition shadow-sm"
        >
          Get a demo
        </button>
        <button
          onClick={onSeeHowItWorks}
          className="px-6 py-3 rounded-xl border border-slate-300 hover:border-slate-400 bg-white text-slate-800 font-semibold text-sm transition hover:bg-slate-50"
        >
          See how it works
        </button>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-3 gap-6 max-w-2xl mb-12 border-t border-slate-100 pt-8">
        <div>
          <div className="text-3xl sm:text-4xl font-extrabold font-mono text-slate-950">
            31%
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-1 font-medium leading-snug">
            Fewer missed clearances
          </p>
        </div>

        <div>
          <div className="text-3xl sm:text-4xl font-extrabold font-mono text-slate-950">
            18 min
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-1 font-medium leading-snug">
            Avg. dispatch time saved
          </p>
        </div>

        <div>
          <div className="text-3xl sm:text-4xl font-extrabold font-mono text-slate-950">
            2,400+
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-1 font-medium leading-snug">
            Vehicles routed daily
          </p>
        </div>
      </div>

      {/* Realistic Interactive Product Demonstration Card */}
      <InteractiveHeroCard />
    </section>
  );
};
