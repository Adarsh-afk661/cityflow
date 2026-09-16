import {
  LayoutDashboard,
  ShieldAlert,
  Truck,
  Activity,
  BarChart3,
  Bell,
  Settings,
  Radio,
  RotateCcw,
  Sparkles,
  Globe,
  LogIn,
  X
} from 'lucide-react';
import { useCityFlow, PageName } from '../../context/CityFlowContext';

export const Sidebar: React.FC = () => {
  const {
    activePage,
    setActivePage,
    alerts,
    systemStatus,
    startGuidedDemo,
    resetAllData,
    user,
    mobileMenuOpen,
    setMobileMenuOpen
  } = useCityFlow();

  const unreadAlerts = alerts.filter(a => !a.acknowledged).length;

  const navItems: { id: PageName; label: string; icon: React.ReactNode; badge?: number }[] = [
    { id: 'landing', label: 'Product Overview', icon: <Globe className="w-4 h-4" /> },
    { id: 'dashboard', label: 'Command Center', icon: <LayoutDashboard className="w-4 h-4" /> },
    { id: 'routeshield', label: 'RouteShield', icon: <ShieldAlert className="w-4 h-4" /> },
    { id: 'fleet', label: 'Fleet Operations', icon: <Truck className="w-4 h-4" /> },
    { id: 'whatif', label: 'What-If Stress', icon: <Activity className="w-4 h-4" /> },
    { id: 'analytics', label: 'Analytics', icon: <BarChart3 className="w-4 h-4" /> },
    { id: 'alerts', label: 'Active Alerts', icon: <Bell className="w-4 h-4" />, badge: unreadAlerts },
    { id: 'settings', label: 'Settings', icon: <Settings className="w-4 h-4" /> },
  ];

  const handleNavClick = (id: PageName) => {
    setActivePage(id);
    setMobileMenuOpen(false);
  };

  return (
    <>
      {/* Mobile Drawer Overlay Backdrop */}
      {mobileMenuOpen && (
        <div
          onClick={() => setMobileMenuOpen(false)}
          className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-40 lg:hidden animate-in fade-in duration-200"
        />
      )}

      <aside
        className={`fixed lg:sticky top-0 left-0 h-screen w-64 bg-white border-r border-slate-200 flex flex-col justify-between shrink-0 select-none z-50 transition-transform duration-300 ease-in-out shadow-[1px_0_4px_rgba(0,0,0,0.02)] ${
          mobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        {/* Brand Header */}
        <div>
          <div className="p-5 pb-4 border-b border-slate-100 flex items-center justify-between">
            <div className="flex items-center space-x-3 cursor-pointer" onClick={() => handleNavClick('landing')}>
              <div className="w-9 h-9 rounded-xl bg-[#166534] text-white flex items-center justify-center font-bold text-sm font-mono shadow-sm">
                CF
              </div>
              <div>
                <div className="flex items-center space-x-1.5">
                  <span className="font-extrabold text-lg tracking-tight text-slate-900">CityFlow</span>
                  <span className="text-[10px] px-1.5 py-0.2 rounded bg-emerald-50 text-emerald-800 font-mono font-semibold border border-emerald-200">PRO</span>
                </div>
                <p className="text-[11px] text-slate-500 font-medium leading-tight">Route Intelligence Platform</p>
              </div>
            </div>

            {/* Mobile Close Button */}
            <button
              onClick={() => setMobileMenuOpen(false)}
              className="lg:hidden p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition"
              title="Close Menu"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Quick Demo Button */}
          <div className="px-5 pt-3">
            <button
              id="sidebar-launch-demo-btn"
              onClick={() => {
                startGuidedDemo();
                setMobileMenuOpen(false);
              }}
              className="w-full py-2 px-3 rounded-lg bg-[#ecfdf5] hover:bg-emerald-100/80 border border-emerald-200 text-[#166534] text-xs font-bold flex items-center justify-center space-x-2 transition shadow-sm"
            >
              <Sparkles className="w-3.5 h-3.5 text-[#166534]" />
              <span>LAUNCH GUIDED DEMO</span>
            </button>
          </div>

          {/* Navigation List */}
          <nav className="p-3 space-y-1">
            <p className="px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-400 font-mono">Operations</p>
            {navItems.map(item => {
              const isActive = activePage === item.id;
              return (
                <button
                  key={item.id}
                  id={`nav-btn-${item.id}`}
                  onClick={() => handleNavClick(item.id)}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs md:text-sm font-semibold transition-all cursor-pointer ${
                    isActive
                      ? 'bg-[#ecfdf5] text-[#166534] border-l-4 border-[#166534] shadow-sm'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <span className={isActive ? 'text-[#166534]' : 'text-slate-400'}>
                      {item.icon}
                    </span>
                    <span>{item.label}</span>
                  </div>
                  {item.badge !== undefined && item.badge > 0 && (
                    <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-rose-50 text-rose-600 border border-rose-200">
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

      {/* Footer / System Status */}
      <div className="p-4 border-t border-slate-100 bg-slate-50/50 space-y-3">
        {/* System Engines Indicators */}
        <div className="bg-white p-2.5 rounded-xl border border-slate-200 text-xs shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] uppercase font-bold text-slate-500 flex items-center space-x-1.5">
              <Radio className="w-3 h-3 text-emerald-600 animate-pulse" />
              <span>Core Engines</span>
            </span>
            <span className="text-[10px] font-mono font-bold text-emerald-700">All 4 Online</span>
          </div>
          <div className="grid grid-cols-2 gap-1.5 text-[10px] text-slate-500 font-medium">
            <div className="flex items-center space-x-1.5">
              <span className={`w-1.5 h-1.5 rounded-full ${systemStatus.trafficEngine ? 'bg-emerald-600' : 'bg-rose-500'}`} />
              <span>Traffic Flow</span>
            </div>
            <div className="flex items-center space-x-1.5">
              <span className={`w-1.5 h-1.5 rounded-full ${systemStatus.routeShield ? 'bg-emerald-600' : 'bg-rose-500'}`} />
              <span>RouteShield</span>
            </div>
            <div className="flex items-center space-x-1.5">
              <span className={`w-1.5 h-1.5 rounded-full ${systemStatus.predictionEngine ? 'bg-emerald-600' : 'bg-rose-500'}`} />
              <span>ML Predictor</span>
            </div>
            <div className="flex items-center space-x-1.5">
              <span className={`w-1.5 h-1.5 rounded-full ${systemStatus.simulationEngine ? 'bg-emerald-600' : 'bg-rose-500'}`} />
              <span>What-If Sim</span>
            </div>
          </div>
        </div>

        {/* User profile & Reset */}
        <div className="flex items-center justify-between pt-1">
          <div
            onClick={() => setActivePage('login')}
            className="flex items-center space-x-2.5 cursor-pointer group flex-1 min-w-0 p-1 rounded-lg hover:bg-slate-100 transition"
            title="Click to Switch Operator / Sign In"
          >
            <div className="w-7 h-7 rounded-lg bg-[#166534] text-white flex items-center justify-center text-xs font-bold font-mono group-hover:bg-[#14532d] transition shrink-0">
              {user ? user.name.slice(0, 2).toUpperCase() : 'CF'}
            </div>
            <div className="text-left min-w-0 truncate">
              <p className="text-xs font-bold text-slate-800 leading-tight truncate group-hover:text-emerald-800 transition">
                {user?.name || 'Operator Sign In'}
              </p>
              <p className="text-[10px] text-emerald-800 font-medium truncate">
                {user ? user.role.replace('_', ' ').toUpperCase() : 'Click to Log In'}
              </p>
            </div>
          </div>
          <button
            onClick={resetAllData}
            title="Reset system state"
            className="p-1.5 rounded-lg hover:bg-slate-200/80 text-slate-400 hover:text-slate-700 transition shrink-0"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </aside>
  </>
);
};
