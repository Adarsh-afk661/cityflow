import React, { useState } from 'react';
import {
  MapPin,
  Search,
  Bell,
  Play,
  Pause,
  Sparkles,
  ChevronDown,
  Globe
} from 'lucide-react';
import { useCityFlow } from '../../context/CityFlowContext';

export const TopNav: React.FC = () => {
  const {
    selectedCity,
    setSelectedCity,
    liveTrafficEnabled,
    toggleLiveTraffic,
    alerts,
    setActivePage,
    startGuidedDemo,
    fleet
  } = useCityFlow();

  const [cityDropdownOpen, setCityDropdownOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const cities = [
    'Metroflow Metropolitan',
    'Aethelgard Port Conurbation',
    'Bay Intermodal Logistics Corridor'
  ];

  const unreadAlerts = alerts.filter(a => !a.acknowledged);
  const activeFleetCount = fleet.filter(f => f.status === 'active').length;

  return (
    <header className="h-16 bg-white border-b border-slate-200 px-6 flex items-center justify-between sticky top-0 z-20 shadow-[0_1px_2px_rgba(0,0,0,0.03)]">
      {/* City Selector & Search */}
      <div className="flex items-center space-x-4">
        <div className="relative">
          <button
            onClick={() => setCityDropdownOpen(!cityDropdownOpen)}
            className="flex items-center space-x-2 px-3 py-1.5 rounded-lg bg-slate-50 hover:bg-slate-100 border border-slate-200 text-xs font-semibold text-slate-800 transition"
          >
            <MapPin className="w-3.5 h-3.5 text-emerald-700" />
            <span>{selectedCity}</span>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
          </button>

          {cityDropdownOpen && (
            <div className="absolute left-0 mt-2 w-64 bg-white border border-slate-200 rounded-xl shadow-xl py-1.5 z-50">
              {cities.map(c => (
                <button
                  key={c}
                  onClick={() => {
                    setSelectedCity(c);
                    setCityDropdownOpen(false);
                  }}
                  className={`w-full text-left px-4 py-2 text-xs font-medium hover:bg-slate-50 transition ${
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
        <div className="relative hidden md:block w-64">
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
      <div className="flex items-center space-x-3">
        {/* Toggle back to Product Landing Overview */}
        <button
          onClick={() => setActivePage('landing')}
          className="hidden lg:flex items-center space-x-1.5 px-3 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 text-xs font-semibold text-slate-600 hover:text-slate-900 transition"
        >
          <Globe className="w-3.5 h-3.5 text-emerald-700" />
          <span>Product Overview</span>
        </button>

        {/* Live Simulation Control */}
        <div className="flex items-center space-x-2 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-200">
          <div className="flex items-center space-x-1.5">
            <span className={`w-2 h-2 rounded-full ${liveTrafficEnabled ? 'bg-emerald-600 animate-pulse' : 'bg-amber-500'}`} />
            <span className="text-xs font-mono font-medium text-slate-700">
              {liveTrafficEnabled ? 'LIVE SIMULATION' : 'PAUSED'}
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
          className="hidden sm:flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-slate-50 hover:bg-slate-100 border border-slate-200 text-xs cursor-pointer transition font-medium"
        >
          <span className="text-slate-500">Fleet Active:</span>
          <span className="font-mono font-bold text-emerald-800">{activeFleetCount} / {fleet.length}</span>
        </div>

        {/* Notifications Icon with unread badge */}
        <button
          id="top-nav-alerts-btn"
          onClick={() => setActivePage('alerts')}
          className="relative p-2 rounded-lg bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-600 hover:text-slate-900 transition"
        >
          <Bell className="w-4 h-4" />
          {unreadAlerts.length > 0 && (
            <span className="absolute -top-1 -right-1 w-4 h-4 bg-rose-600 text-white font-bold text-[10px] rounded-full flex items-center justify-center animate-bounce">
              {unreadAlerts.length}
            </span>
          )}
        </button>

        {/* Primary LAUNCH DEMO CTA */}
        <button
          id="top-launch-demo-btn"
          onClick={startGuidedDemo}
          className="px-4 py-1.5 rounded-lg bg-[#166534] hover:bg-[#14532d] text-white font-semibold text-xs transition shadow-sm flex items-center space-x-1.5"
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>LAUNCH DEMO</span>
        </button>
      </div>
    </header>
  );
};
