import React from 'react';
import { CityFlowProvider, useCityFlow } from './context/CityFlowContext';
import { SimulationProvider } from './context/SimulationContext';
import { Sidebar } from './components/layout/Sidebar';
import { TopNav } from './components/layout/TopNav';
import { LandingPage } from './components/landing/LandingPage';
import { DashboardPage } from './pages/DashboardPage';
import { RouteShieldPage } from './pages/RouteShieldPage';
import { FleetPage } from './pages/FleetPage';
import { WhatIfPage } from './pages/WhatIfPage';
import { AnalyticsPage } from './pages/AnalyticsPage';
import { AlertsPage } from './pages/AlertsPage';
import { SettingsPage } from './pages/SettingsPage';
import { DemoGuideBanner } from './components/demo/DemoGuideBanner';
import { DemoFinalModal } from './components/demo/DemoFinalModal';

const AppContent: React.FC = () => {
  const { activePage, setActivePage } = useCityFlow();

  if (activePage === 'landing') {
    return <LandingPage onNavigatePlatform={setActivePage} />;
  }

  const renderActivePage = () => {
    switch (activePage) {
      case 'dashboard':
        return <DashboardPage />;
      case 'routeshield':
        return <RouteShieldPage />;
      case 'fleet':
        return <FleetPage />;
      case 'whatif':
        return <WhatIfPage />;
      case 'analytics':
        return <AnalyticsPage />;
      case 'alerts':
        return <AlertsPage />;
      case 'settings':
        return <SettingsPage />;
      default:
        return <DashboardPage />;
    }
  };

  return (
    <div className="flex min-h-screen bg-[#f8fafc] text-slate-900 selection:bg-emerald-100 selection:text-[#166534]">
      {/* Sidebar Navigation */}
      <Sidebar />

      {/* Main App Workspace */}
      <div className="flex-1 flex flex-col min-w-0">
        <TopNav />
        <main className="flex-1 p-6 md:p-8 max-w-7xl mx-auto w-full">
          {renderActivePage()}
        </main>
      </div>

      {/* Demo Tour Guidance and Final Recommendation Modal */}
      <DemoGuideBanner />
      <DemoFinalModal />
    </div>
  );
};

export const App: React.FC = () => {
  return (
    <CityFlowProvider>
      <SimulationProvider>
        <AppContent />
      </SimulationProvider>
    </CityFlowProvider>
  );
};

export default App;
