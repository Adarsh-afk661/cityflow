import React, { useState } from 'react';
import {
  MapPin,
  Search,
  Bell,
  Play,
  Pause,
  Sparkles,
  ChevronDown,
  Globe,
  Database,
  LogIn,
  LogOut,
  UserCheck,
  Menu,
  ArrowLeft,
  Home
} from 'lucide-react';
import { useCityFlow } from '../../context/CityFlowContext';
import { DataStatusIndicator } from '../common/DataStatusIndicator';

export const TopNav: React.FC = () => {
  const {
    activePage,
    goBack,
    canGoBack,
    selectedCity,
    setSelectedCity,
    liveTrafficEnabled,
    toggleLiveTraffic,
    alerts,
    setActivePage,
    startGuidedDemo,
    fleet,
    user,
    setLoginModalOpen,
    setDataFeedModalOpen,
    logout,
    setStartLocation,
    setDestinationLocation,
    runRouteAnalysis,
    mobileMenuOpen,
    setMobileMenuOpen
  } = useCityFlow();

  const [cityDropdownOpen, setCityDropdownOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const cities = [
    'Delhi — Greater Noida Corridor',
    'Delhi (National Capital Territory)',
    'Greater Noida (Industrial & Logistics Hub)'
  ];

  const handleCitySelect = (city: string) => {
    setSelectedCity(city);
    setCityDropdownOpen(false);

    if (city.includes('Greater Noida Corridor')) {
      setStartLocation('Delhi');
      setDestinationLocation('Greater Noida');
      runRouteAnalysis('Delhi', 'Greater Noida');
    } else if (city.includes('Delhi (National Capital')) {
      setStartLocation('Delhi');
      setDestinationLocation('Connaught Place, New Delhi');
      runRouteAnalysis('Delhi', 'Connaught Place, New Delhi');
    } else if (city.includes('Greater Noida')) {
      setStartLocation('Delhi');
      setDestinationLocation('Greater Noida');
      runRouteAnalysis('Delhi', 'Greater Noida');
    }
  };

  const unreadAlerts = alerts.filter(a => !a.acknowledged);
  const activeFleetCount = fleet.filter(f => f.status === 'active').length;

  return (
    <header className="h-16 bg-white border-b border-slate-200 px-3 sm:px-6 flex items-center justify-between sticky top-0 z-20 shadow-[0_1px_2px_rgba(0,0,0,0.03)]">
      {/* City Selector & Search */}
      <div className="flex items-center space-x-2 sm:space-x-4 min-w-0">
        <button
          type="button"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="lg:hidden p-1.5 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition shrink-0 cursor-pointer"
          title="Toggle Navigation Menu"
        >
          <Menu className="w-5 h-5 text-slate-700" />
        </button>

        <div className="relative shrink-0">
          <button
            onClick={() => setCityDropdownOpen(!cityDropdownOpen)}
            className="flex items-center space-x-1.5 sm:space-x-2 px-2.5 sm:px-3 py-1.5 rounded-lg bg-slate-50 hover:bg-slate-100 border border-slate-200 text-xs font-semibold text-slate-800 transition max-w-[160px] sm:max-w-none"
          >
            <MapPin className="w-3.5 h-3.5 text-emerald-700 shrink-0" />
            <span className="truncate">{selectedCity.split(' — ')[0]}</span>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400 shrink-0" />
          </button>

          {cityDropdownOpen && (
            <div className="absolute left-0 mt-2 w-72 bg-white border border-slate-200 rounded-xl shadow-xl py-1.5 z-50">
              {cities.map(c => (
                <button
                  key={c}
                  onClick={() => handleCitySelect(c)}
                  className={`w-full text-left px-4 py-2.5 text-xs font-medium hover:bg-slate-50 transition ${
                    selectedCity === c ? 'text-emerald-800 font-bold bg-emerald-50' : 'text-slate-700'
                  }`}
                >
                  {c}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Global Search Bar */}
        <div className="relative hidden md:block w-48 lg:w-64">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search corridors, fleet, hubs..."
            className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-8 pr-3 py-1.5 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-emerald-600 focus:bg-white transition"
          />
        </div>
      </div>

      {/* Action Controls */}
      <div className="flex items-center space-x-1.5 sm:space-x-3 shrink-0">
        {/* Universal In-App Back & Home Navigation */}
        <div className="flex items-center space-x-1 sm:space-x-1.5">
          <button
            id="topnav-back-btn"
            onClick={goBack}
            title="Go Back to Previous Screen"
            className="flex items-center space-x-1 px-2.5 py-1.5 rounded-lg bg-slate-50 hover:bg-slate-100 text-slate-700 hover:text-slate-900 border border-slate-200 text-xs font-semibold transition cursor-pointer shadow-2xs"
          >
            <ArrowLeft className="w-3.5 h-3.5 text-slate-600" />
            <span className="hidden xs:inline">Back</span>
          </button>

          <button
            id="topnav-home-btn"
            onClick={() => setActivePage('landing')}
            title="Return to Home Overview"
            className={`flex items-center space-x-1 px-2.5 sm:px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer shadow-2xs border ${
              activePage === 'landing'
                ? 'bg-emerald-50 text-[#166534] border-emerald-300 font-bold'
                : 'bg-white hover:bg-slate-50 text-slate-700 hover:text-[#166534] border-slate-200'
            }`}
          >
            <Home className="w-3.5 h-3.5 text-emerald-700" />
            <span>Home</span>
          </button>
        </div>

        {/* Real-time Data Freshness & Provider Status */}
        <div className="hidden xl:block">
          <DataStatusIndicator />
        </div>

        {/* Live Simulation Control */}
        <div className="hidden md:flex items-center space-x-2 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-200">
          <div className="flex items-center space-x-1.5">
            <span className={`w-2 h-2 rounded-full ${liveTrafficEnabled ? 'bg-emerald-600 animate-pulse' : 'bg-amber-500'}`} />
            <span className="text-xs font-mono font-medium text-slate-700">
              {liveTrafficEnabled ? 'LIVE' : 'PAUSED'}
            </span>
          </div>
          <div className="h-3 w-px bg-slate-200 mx-1" />
          <button
            id="toggle-live-traffic-btn"
            onClick={toggleLiveTraffic}
            title={liveTrafficEnabled ? 'Pause Live Traffic' : 'Resume Live Traffic'}
            className="p-0.5 text-slate-500 hover:text-emerald-700 transition"
          >
            {liveTrafficEnabled ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
          </button>
        </div>

        {/* Active Fleet summary badge */}
        <div
          onClick={() => setActivePage('fleet')}
          className="hidden lg:flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-slate-50 hover:bg-slate-100 border border-slate-200 text-xs cursor-pointer transition font-medium"
        >
          <span className="text-slate-500">Fleet Active:</span>
          <span className="font-mono font-bold text-emerald-800">{activeFleetCount} / {fleet.length}</span>
        </div>

        {/* Notifications Icon with unread badge */}
        <button
          id="top-nav-alerts-btn"
          onClick={() => setActivePage('alerts')}
          className="relative p-2 rounded-lg bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-600 hover:text-slate-900 transition shrink-0"
        >
          <Bell className="w-4 h-4" />
          {unreadAlerts.length > 0 && (
            <span className="absolute -top-1 -right-1 w-4 h-4 bg-rose-600 text-white font-bold text-[10px] rounded-full flex items-center justify-center animate-bounce">
              {unreadAlerts.length}
            </span>
          )}
        </button>

        {/* Feed Data Studio CTA */}
        <button
          id="top-feed-data-btn"
          onClick={() => setDataFeedModalOpen(true)}
          className="hidden sm:flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 border border-emerald-300 text-xs font-semibold text-emerald-800 transition shadow-sm shrink-0"
          title="Manually feed commercial vehicles, freight corridors & hazard alerts to MongoDB Atlas"
        >
          <Database className="w-3.5 h-3.5 text-[#166534]" />
          <span>Feed Data</span>
        </button>

        {/* Primary LAUNCH DEMO CTA */}
        <button
          id="top-launch-demo-btn"
          onClick={startGuidedDemo}
          className="px-2.5 sm:px-4 py-1.5 rounded-lg bg-[#166534] hover:bg-[#14532d] text-white font-semibold text-xs transition shadow-sm flex items-center space-x-1.5 shrink-0"
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">LAUNCH DEMO</span>
          <span className="sm:hidden">DEMO</span>
        </button>

        {/* User Session & Operator Controls */}
        <div className="relative pl-2 border-l border-slate-200">
          {user ? (
            <div>
              <button
                onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100/80 border border-emerald-200 text-xs text-[#166534] font-medium transition cursor-pointer"
                title="Operator Session Active - Click to Manage"
              >
                <UserCheck className="w-3.5 h-3.5 text-[#166534]" />
                <span className="font-bold">{user.name}</span>
                <ChevronDown className="w-3 h-3 text-emerald-700 ml-0.5" />
              </button>

              {userDropdownOpen && (
                <div className="absolute right-0 mt-2 w-64 bg-white border border-slate-200 rounded-xl shadow-xl py-2 z-50 animate-in fade-in duration-150">
                  <div className="px-4 py-2 border-b border-slate-100">
                    <div className="text-xs font-bold text-slate-800">{user.name}</div>
                    <div className="text-[11px] text-slate-500 font-mono truncate">{user.email}</div>
                    <div className="mt-1 inline-flex items-center space-x-1 px-2 py-0.5 rounded bg-emerald-50 text-emerald-800 text-[10px] font-bold uppercase tracking-wider">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                      <span>{user.role}</span>
                    </div>
                  </div>

                  <div className="py-1">
                    <button
                      onClick={() => {
                        setUserDropdownOpen(false);
                        setActivePage('login');
                      }}
                      className="w-full text-left px-4 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 flex items-center space-x-2 transition"
                    >
                      <LogIn className="w-3.5 h-3.5 text-emerald-700" />
                      <span>Switch Operator Profile</span>
                    </button>

                    <button
                      onClick={() => {
                        setUserDropdownOpen(false);
                        logout();
                      }}
                      className="w-full text-left px-4 py-2 text-xs font-medium text-rose-600 hover:bg-rose-50 flex items-center space-x-2 transition"
                    >
                      <LogOut className="w-3.5 h-3.5 text-rose-600" />
                      <span>Sign Out</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <button
              onClick={() => setActivePage('login')}
              className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition shadow-xs cursor-pointer"
            >
              <LogIn className="w-3.5 h-3.5" />
              <span>Sign In</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
