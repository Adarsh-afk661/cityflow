import React, { useState } from 'react';
import {
  MapPin,
  Truck,
  Plus,
  Sliders,
  Zap,
  Clock,
  ShieldCheck,
  AlertCircle
} from 'lucide-react';
import { useCityFlow } from '../../context/CityFlowContext';
import { RoutingMode } from '../../types';
import { CITY_HUBS } from '../../data/cityNetwork';
import { CustomVehicleModal } from './CustomVehicleModal';

export const RoutePlanner: React.FC = () => {
  const {
    startLocation,
    setStartLocation,
    destinationLocation,
    setDestinationLocation,
    routingMode,
    setRoutingMode,
    departureTime,
    setDepartureTime,
    vehicles,
    selectedVehicle,
    setSelectedVehicle,
    runRouteAnalysis,
    isAnalyzing
  } = useCityFlow();

  const [customModalOpen, setCustomModalOpen] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const modes: { id: RoutingMode; label: string; desc: string }[] = [
    { id: 'fastest', label: 'Fastest', desc: 'Minimal travel time' },
    { id: 'reliable', label: 'Reliable', desc: 'Predictable on-time delivery' },
    { id: 'eco', label: 'Eco-Flow', desc: 'Minimal CO₂ footprint' },
    { id: 'clearance', label: 'Clearance Fit', desc: 'Maximum clearance margin' },
    { id: 'balanced', label: 'Balanced', desc: 'Optimal multi-criteria weighting' }
  ];

  const handleAnalyze = () => {
    setFormError(null);
    if (!startLocation.trim()) {
      setFormError('Please select a start location.');
      return;
    }
    if (!destinationLocation.trim()) {
      setFormError('Please select a destination.');
      return;
    }
    if (startLocation === destinationLocation) {
      setFormError('Start and destination locations cannot be identical.');
      return;
    }
    runRouteAnalysis();
  };

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm text-left">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-4 mb-5 border-b border-slate-100 gap-2">
        <div>
          <h2 className="text-lg font-bold text-slate-900 tracking-tight">Route Planning & Clearance Matrix</h2>
          <p className="text-xs text-slate-500">Configure vehicle physical constraints and multi-criteria routing weights</p>
        </div>
        <div className="flex items-center space-x-1.5 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-[#166534] text-xs font-semibold">
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>Vehicle-Aware Clearance Active</span>
        </div>
      </div>

      {formError && (
        <div className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 flex items-center space-x-2 text-xs text-rose-700 font-medium">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{formError}</span>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-5">
        {/* Start Location */}
        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center space-x-1">
            <MapPin className="w-3.5 h-3.5 text-blue-700" />
            <span>START LOCATION</span>
          </label>
          <select
            id="start-location-select"
            value={startLocation}
            onChange={e => setStartLocation(e.target.value)}
            className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2.5 text-xs font-semibold text-slate-800 focus:outline-none focus:border-emerald-600 focus:bg-white transition"
          >
            {CITY_HUBS.map(hub => (
              <option key={hub.id} value={hub.name}>{hub.name}</option>
            ))}
          </select>
        </div>

        {/* Destination Location */}
        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center space-x-1">
            <MapPin className="w-3.5 h-3.5 text-emerald-700" />
            <span>DESTINATION</span>
          </label>
          <select
            id="destination-location-select"
            value={destinationLocation}
            onChange={e => setDestinationLocation(e.target.value)}
            className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2.5 text-xs font-semibold text-slate-800 focus:outline-none focus:border-emerald-600 focus:bg-white transition"
          >
            {CITY_HUBS.map(hub => (
              <option key={hub.id} value={hub.name}>{hub.name}</option>
            ))}
          </select>
        </div>

        {/* Vehicle Selection with Dimensions */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="text-xs font-bold text-slate-700 flex items-center space-x-1">
              <Truck className="w-3.5 h-3.5 text-amber-700" />
              <span>VEHICLE CLASS</span>
            </label>
            <button
              onClick={() => setCustomModalOpen(true)}
              className="text-[11px] font-bold text-[#166534] hover:underline flex items-center space-x-0.5"
            >
              <Plus className="w-3 h-3" />
              <span>Custom</span>
            </button>
          </div>
          <select
            id="vehicle-select"
            value={selectedVehicle.id}
            onChange={e => {
              const v = vehicles.find(veh => veh.id === e.target.value);
              if (v) setSelectedVehicle(v);
            }}
            className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2.5 text-xs font-semibold text-slate-800 focus:outline-none focus:border-emerald-600 focus:bg-white transition"
          >
            {vehicles.map(v => (
              <option key={v.id} value={v.id}>
                {v.name} ({v.height}m H · {v.weight}T)
              </option>
            ))}
          </select>
        </div>

        {/* Departure Window */}
        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center space-x-1">
            <Clock className="w-3.5 h-3.5 text-slate-500" />
            <span>DEPARTURE TIME</span>
          </label>
          <select
            value={departureTime}
            onChange={e => setDepartureTime(e.target.value)}
            className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2.5 text-xs font-semibold text-slate-800 focus:outline-none focus:border-emerald-600 focus:bg-white transition"
          >
            <option value="Now (10:15 AM)">Now (10:15 AM)</option>
            <option value="+15 Minutes (+10:30 AM)">+15 Minutes (+10:30 AM)</option>
            <option value="+30 Minutes (+10:45 AM)">+30 Minutes (+10:45 AM)</option>
            <option value="+1 Hour (11:15 AM)">+1 Hour (11:15 AM)</option>
          </select>
        </div>
      </div>

      {/* Selected Vehicle Dimensions Display Card */}
      <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 mb-5 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center space-x-2.5">
          <div className="w-8 h-8 rounded-lg bg-white border border-slate-200 flex items-center justify-center text-[#166534] shadow-sm">
            <Truck className="w-4 h-4" />
          </div>
          <div>
            <p className="text-xs font-bold text-slate-900">{selectedVehicle.name}</p>
            <p className="text-[10px] text-slate-500 uppercase font-mono">
              {selectedVehicle.fuelType} · {selectedVehicle.type}
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-4 font-mono text-xs">
          <div>
            <span className="text-[10px] text-slate-500 uppercase block">Height</span>
            <span className="font-bold text-slate-900">{selectedVehicle.height} m</span>
          </div>
          <div className="w-px h-6 bg-slate-200" />
          <div>
            <span className="text-[10px] text-slate-500 uppercase block">Width</span>
            <span className="font-bold text-slate-900">{selectedVehicle.width} m</span>
          </div>
          <div className="w-px h-6 bg-slate-200" />
          <div>
            <span className="text-[10px] text-slate-500 uppercase block">Length</span>
            <span className="font-bold text-slate-900">{selectedVehicle.length} m</span>
          </div>
          <div className="w-px h-6 bg-slate-200" />
          <div>
            <span className="text-[10px] text-slate-500 uppercase block">Gross Weight</span>
            <span className="font-bold text-slate-900">{selectedVehicle.weight} T</span>
          </div>
        </div>
      </div>

      {/* Routing Modes Buttons */}
      <div className="mb-5">
        <label className="block text-xs font-bold text-slate-700 mb-2 flex items-center space-x-1">
          <Sliders className="w-3.5 h-3.5 text-slate-500" />
          <span>ROUTING PREFERENCE</span>
        </label>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2.5">
          {modes.map(m => {
            const isSelected = routingMode === m.id;
            return (
              <button
                key={m.id}
                id={`mode-btn-${m.id}`}
                onClick={() => setRoutingMode(m.id)}
                className={`p-3 rounded-xl border text-left transition-all ${
                  isSelected
                    ? 'bg-[#ecfdf5] border-emerald-500 shadow-sm text-[#166534]'
                    : 'bg-white border-slate-200 hover:border-slate-300 text-slate-600 hover:text-slate-900'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className={`text-xs font-bold ${isSelected ? 'text-[#166534]' : 'text-slate-800'}`}>
                    {m.label}
                  </span>
                  {isSelected && <span className="w-2 h-2 rounded-full bg-[#166534]" />}
                </div>
                <p className="text-[11px] text-slate-500 mt-1 leading-tight">{m.desc}</p>
              </button>
            );
          })}
        </div>
      </div>

      {/* Primary Action Button */}
      <div className="flex items-center justify-between pt-2 border-t border-slate-100">
        <div className="text-[11px] text-slate-500">
          Enforcing dynamic bridge, underpass, and tonnage clearance filters.
        </div>
        <button
          id="analyze-routes-btn"
          onClick={handleAnalyze}
          disabled={isAnalyzing}
          className="px-6 py-2.5 rounded-xl bg-[#166534] hover:bg-[#14532d] text-white font-bold text-xs tracking-wider uppercase flex items-center space-x-2 shadow-sm transition"
        >
          <Zap className="w-3.5 h-3.5 fill-white text-white" />
          <span>{isAnalyzing ? 'Analyzing Network...' : 'ANALYZE ROUTES'}</span>
        </button>
      </div>

      <CustomVehicleModal
        isOpen={customModalOpen}
        onClose={() => setCustomModalOpen(false)}
      />
    </div>
  );
};
