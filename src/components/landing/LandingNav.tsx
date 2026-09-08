import React from 'react';
import { LayoutDashboard, ArrowRight } from 'lucide-react';

interface LandingNavProps {
  onOpenDemo: () => void;
  onOpenSignIn: () => void;
  onLaunchPlatform: () => void;
}

export const LandingNav: React.FC<LandingNavProps> = ({
  onOpenDemo,
  onOpenSignIn,
  onLaunchPlatform
}) => {
  return (
    <header className="w-full bg-white/95 backdrop-blur-md border-b border-slate-200/80 sticky top-0 z-40 px-6 py-3.5 flex items-center justify-between">
      {/* Brand */}
      <div className="flex items-center space-x-2.5 cursor-pointer" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
        <div className="w-9 h-9 rounded-xl bg-[#166534] text-white flex items-center justify-center font-bold text-sm font-mono shadow-sm">
          CF
        </div>
        <span className="text-xl font-bold text-slate-900 tracking-tight">CityFlow</span>
      </div>

      {/* Right CTAs */}
      <div className="flex items-center space-x-3">
        <button
          onClick={onLaunchPlatform}
          className="hidden sm:flex items-center space-x-1.5 px-3.5 py-2 rounded-lg text-xs font-semibold text-slate-700 hover:text-slate-950 hover:bg-slate-100 transition"
        >
          <LayoutDashboard className="w-4 h-4 text-emerald-800" />
          <span>Launch Command Center</span>
        </button>

        <button
          onClick={onOpenSignIn}
          className="px-4 py-2 rounded-lg border border-slate-300 hover:border-slate-400 bg-white text-slate-800 text-xs md:text-sm font-semibold transition hover:bg-slate-50"
        >
          Sign in
        </button>

        <button
          onClick={onOpenDemo}
          className="px-4 md:px-5 py-2 rounded-lg bg-[#166534] hover:bg-[#14532d] text-white text-xs md:text-sm font-semibold transition shadow-sm"
        >
          Get a demo
        </button>
      </div>
    </header>
  );
};
