import React, { useState } from 'react';
import { LandingNav } from './LandingNav';
import { HeroSection } from './HeroSection';
import { SocialProof } from './SocialProof';
import { FeatureGrid } from './FeatureGrid';
import { DemoModal } from './DemoModal';
import { SignInModal } from './SignInModal';
import { ArrowRight, ShieldCheck, Truck, Sparkles } from 'lucide-react';
import { PageName } from '../../context/CityFlowContext';

interface LandingPageProps {
  onNavigatePlatform: (page: PageName) => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onNavigatePlatform }) => {
  const [demoOpen, setDemoOpen] = useState(false);
  const [signInOpen, setSignInOpen] = useState(false);

  const handleLaunchPlatform = (targetPage: PageName = 'dashboard') => {
    onNavigatePlatform(targetPage);
  };

  return (
    <div className="min-h-screen bg-white text-slate-900 selection:bg-emerald-100 selection:text-emerald-900">
      {/* Navigation Header */}
      <LandingNav
        onOpenDemo={() => setDemoOpen(true)}
        onOpenSignIn={() => setSignInOpen(true)}
        onLaunchPlatform={() => handleLaunchPlatform('dashboard')}
      />

      <main>
        {/* Hero Section with Interactive Live Route Card */}
        <HeroSection
          onOpenDemo={() => setDemoOpen(true)}
          onSeeHowItWorks={() => handleLaunchPlatform('routeshield')}
        />

        {/* Social Proof Logos */}
        <SocialProof />

        {/* Features Showcase */}
        <FeatureGrid
          onExploreFeature={(featureKey) => {
            if (featureKey === 'whatif') handleLaunchPlatform('whatif');
            else if (featureKey === 'fleet') handleLaunchPlatform('fleet');
            else handleLaunchPlatform('routeshield');
          }}
        />

        {/* Final CTA Banner */}
        <section className="py-16 px-6 bg-slate-50 border-t border-slate-200/80">
          <div className="max-w-4xl mx-auto text-center space-y-6">
            <span className="text-xs font-mono font-bold uppercase tracking-widest px-3 py-1 rounded-full bg-emerald-100 text-emerald-800">
              DEPLOYMENT READY
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-950 tracking-tight">
              Ready to eliminate underpass surprises?
            </h2>
            <p className="text-base text-slate-600 max-w-xl mx-auto">
              Join leading transport and logistics teams routing commercial fleets with guaranteed physical feasibility.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
              <button
                onClick={() => setDemoOpen(true)}
                className="px-6 py-3 rounded-xl bg-[#166534] hover:bg-[#14532d] text-white font-semibold text-sm transition shadow-sm"
              >
                Get a demo
              </button>
              <button
                onClick={() => handleLaunchPlatform('dashboard')}
                className="px-6 py-3 rounded-xl border border-slate-300 hover:border-slate-400 bg-white text-slate-800 font-semibold text-sm transition hover:bg-slate-100 flex items-center space-x-2"
              >
                <span>Launch Command Center</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="py-8 px-6 border-t border-slate-200 bg-white text-xs text-slate-500 text-center">
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center space-x-2">
            <div className="w-6 h-6 rounded-md bg-[#166534] text-white flex items-center justify-center font-bold text-[10px] font-mono">
              CF
            </div>
            <span className="font-bold text-slate-800">CityFlow</span>
            <span>— Intelligent Routes. Predictable Journeys.</span>
          </div>
          <p>© 2026 CityFlow Platform. Full-Stack Node.js & MongoDB Architecture.</p>
        </div>
      </footer>

      {/* Interactive Modals */}
      <DemoModal
        isOpen={demoOpen}
        onClose={() => setDemoOpen(false)}
      />
      <SignInModal
        isOpen={signInOpen}
        onClose={() => setSignInOpen(false)}
        onSuccess={() => handleLaunchPlatform('dashboard')}
      />
    </div>
  );
};
