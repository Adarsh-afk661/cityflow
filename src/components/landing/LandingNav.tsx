import React from 'react';
import { LayoutDashboard, Database, LogIn, LogOut, UserCheck } from 'lucide-react';
import { useCityFlow } from '../../context/CityFlowContext';

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
  const { user, logout, setDataFeedModalOpen, setLoginModalOpen } = useCityFlow();

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
        {/* Manual Data Feed Button */}
        <button
          onClick={() => setDataFeedModalOpen(true)}
          className="hidden sm:flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-xs font-semibold text-emerald-800 transition"
          title="Manually Feed Commercial Fleet & Corridors to MongoDB"
        >
          <Database className="w-3.5 h-3.5 text-[#166534]" />
          <span>Feed Data</span>
        </button>

        <button
          onClick={onLaunchPlatform}
          className="hidden sm:flex items-center space-x-1.5 px-3.5 py-2 rounded-lg text-xs font-semibold text-slate-700 hover:text-slate-950 hover:bg-slate-100 transition"
        >
          <LayoutDashboard className="w-4 h-4 text-emerald-800" />
          <span>Launch Command Center</span>
        </button>

        {user ? (
          <div className="flex items-center space-x-1.5">
            <div className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-emerald-50 border border-emerald-200 text-xs text-emerald-900 font-medium">
              <UserCheck className="w-3.5 h-3.5 text-emerald-700" />
              <span className="font-semibold max-w-[120px] truncate">{user.name || user.email.split('@')[0]}</span>
            </div>
            <button
              onClick={logout}
              title="Log out"
              className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition"
            >
              <LogOut className="w-3.5 h-3.5" />
            </button>
          </div>
        ) : (
          <button
            onClick={() => setLoginModalOpen(true)}
            className="px-4 py-2 rounded-lg border border-slate-300 hover:border-slate-400 bg-white text-slate-800 text-xs md:text-sm font-semibold transition hover:bg-slate-50 flex items-center space-x-1.5"
          >
            <LogIn className="w-3.5 h-3.5 text-slate-500" />
            <span>Sign in</span>
          </button>
        )}

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
