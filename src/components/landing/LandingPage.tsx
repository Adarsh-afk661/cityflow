import React, { useState } from 'react';
import { LandingNav } from './LandingNav';
import { HeroSection } from './HeroSection';
import { SocialProof } from './SocialProof';
import { FeatureGrid } from './FeatureGrid';
import { DemoModal } from './DemoModal';
import { ArrowRight, ShieldCheck, Truck, Sparkles, Check, X } from 'lucide-react';
import { PageName, useCityFlow } from '../../context/CityFlowContext';

interface LandingPageProps {
  onNavigatePlatform: (page: PageName) => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onNavigatePlatform }) => {
  const { setLoginModalOpen } = useCityFlow();
  const [demoOpen, setDemoOpen] = useState(false);

  const handleLaunchPlatform = (targetPage: PageName = 'dashboard') => {
    onNavigatePlatform(targetPage);
  };

  return (
    <div className="min-h-screen bg-white text-slate-900 selection:bg-emerald-100 selection:text-emerald-900">
      {/* Navigation Header */}
      <LandingNav
        onOpenDemo={() => setDemoOpen(true)}
        onOpenSignIn={() => setLoginModalOpen(true)}
        onLaunchPlatform={() => handleLaunchPlatform('dashboard')}
      />

      <main>
        {/* Hero Section with Interactive Live Route & Clearance Card */}
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

        {/* Competitive Comparison Table: Consumer Maps vs CityFlow */}
        <section className="py-16 px-6 max-w-5xl mx-auto text-left">
          <div className="mb-10 text-center max-w-2xl mx-auto">
            <span className="text-xs font-mono font-bold uppercase tracking-widest px-3 py-1 rounded-full bg-emerald-100 text-[#166534]">
              COMPETITIVE ADVANTAGE
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-950 tracking-tight mt-3">
              Why Generic Navigation Fails Commercial Fleets
            </h2>
            <p className="text-sm text-slate-600 mt-2 font-medium">
              Standard consumer apps calculate routes for passenger cars. CityFlow evaluates strict physical dimensional constraints, bridge tonnages, and trained commercial ML delay models.
            </p>
          </div>

          <div className="overflow-x-auto rounded-2xl border border-slate-200 shadow-sm bg-white">
            <table className="w-full text-xs sm:text-sm text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-700 font-bold">
                  <th className="py-4 px-5">Capability / Decision Metric</th>
                  <th className="py-4 px-5 text-slate-500">Standard Consumer Maps</th>
                  <th className="py-4 px-5 bg-emerald-50/80 text-[#166534] font-extrabold">CityFlow RouteShield</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                <tr>
                  <td className="py-3.5 px-5 font-bold">Overhead Underpass & Arch Height Barring</td>
                  <td className="py-3.5 px-5 text-rose-600 font-semibold">❌ Blind to height limits</td>
                  <td className="py-3.5 px-5 bg-emerald-50/40 text-[#166534] font-bold">
                    ✅ Automated barring for &gt; 3.8m vehicles
                  </td>
                </tr>
                <tr>
                  <td className="py-3.5 px-5 font-bold">Vehicle Class Dimensional Profiling</td>
                  <td className="py-3.5 px-5 text-slate-500">Passenger cars only</td>
                  <td className="py-3.5 px-5 bg-emerald-50/40 text-[#166534] font-bold">
                    ✅ Custom Height, Width, Length & Tonnage
                  </td>
                </tr>
                <tr>
                  <td className="py-3.5 px-5 font-bold">Road Surface Weather Friction Telemetry</td>
                  <td className="py-3.5 px-5 text-slate-500">Basic rain icon only</td>
                  <td className="py-3.5 px-5 bg-emerald-50/40 text-[#166534] font-bold">
                    ✅ Live friction coefficient (μ) & braking distance
                  </td>
                </tr>
                <tr>
                  <td className="py-3.5 px-5 font-bold">Predictive Commercial Delay ML Engine</td>
                  <td className="py-3.5 px-5 text-slate-500">Static speed averages</td>
                  <td className="py-3.5 px-5 bg-emerald-50/40 text-[#166534] font-bold">
                    ✅ Trained XGBoost 3.4.1 delay regression
                  </td>
                </tr>
                <tr>
                  <td className="py-3.5 px-5 font-bold">What-If Infrastructure Contingency Testing</td>
                  <td className="py-3.5 px-5 text-rose-600 font-semibold">❌ Not available</td>
                  <td className="py-3.5 px-5 bg-emerald-50/40 text-[#166534] font-bold">
                    ✅ Instant flash flood & bridge closure simulation
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        {/* Final CTA Banner */}
        <section className="py-16 px-6 bg-slate-50 border-t border-slate-200/80">
          <div className="max-w-4xl mx-auto text-center space-y-6">
            <span className="text-xs font-mono font-bold uppercase tracking-widest px-3 py-1 rounded-full bg-emerald-100 text-emerald-800">
              PRODUCTION READY
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-950 tracking-tight">
              Ready to eliminate underpass surprises?
            </h2>
            <p className="text-base text-slate-600 max-w-xl mx-auto font-medium">
              Join leading transport and logistics dispatchers routing commercial fleets with certified physical feasibility and predictive reliability.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
              <button
                onClick={() => handleLaunchPlatform('routeshield')}
                className="px-6 py-3 rounded-xl bg-[#166534] hover:bg-[#14532d] text-white font-bold text-sm transition shadow-sm cursor-pointer"
              >
                Plan Corridors in RouteShield
              </button>
              <button
                onClick={() => handleLaunchPlatform('dashboard')}
                className="px-6 py-3 rounded-xl border border-slate-300 hover:border-slate-400 bg-white text-slate-800 font-bold text-sm transition hover:bg-slate-100 flex items-center space-x-2 cursor-pointer shadow-xs"
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
          <p>© 2026 CityFlow Platform. Real-Time Road Geometry & Physical Clearance Certification.</p>
        </div>
      </footer>

      {/* Interactive Modals */}
      <DemoModal
        isOpen={demoOpen}
        onClose={() => setDemoOpen(false)}
      />
    </div>
  );
};
