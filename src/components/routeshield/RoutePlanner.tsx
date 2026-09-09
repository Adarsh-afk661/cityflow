import React, { useState, useEffect } from 'react';
import {
  MapPin,
  Truck,
  Plus,
  Sliders,
  Zap,
  Clock,
  ShieldCheck,
  AlertCircle,
  ArrowLeftRight,
  Crosshair,
  Compass,
  Navigation
} from 'lucide-react';
import { useCityFlow } from '../../context/CityFlowContext';
import { RoutingMode } from '../../types';
import { CustomVehicleModal } from './CustomVehicleModal';
import { searchDelhiPlaces, PlaceItem, DELHI_NCR_PLACES } from '../../services/delhiPlaces';

export const RoutePlanner: React.FC = () => {
  const {
    startLocation,
    setStartLocation,
    startCoords,
    setStartCoords,
    destinationLocation,
    setDestinationLocation,
    destCoords,
    setDestCoords,
    setRouteEndpoints,
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

  const [startQuery, setStartQuery] = useState(startLocation);
  const [destQuery, setDestQuery] = useState(destinationLocation);
  const [startSuggestions, setStartSuggestions] = useState<any[]>([]);
  const [destSuggestions, setDestSuggestions] = useState<any[]>([]);
  const [activeDropdown, setActiveDropdown] = useState<'start' | 'dest' | null>(null);

  // Sync input query when context changes
  useEffect(() => {
    setStartQuery(startLocation);
  }, [startLocation]);

  useEffect(() => {
    setDestQuery(destinationLocation);
  }, [destinationLocation]);

  // Dismiss dropdowns on outside click
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest('#start-location-group') && !target.closest('#destination-location-group')) {
        setActiveDropdown(null);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  // Hybrid Real-Time Geocoding: Instant Delhi NCR Catalog + Global Nominatim
  const searchGeocode = async (query: string, type: 'start' | 'dest') => {
    if (query.trim().length < 2) {
      if (type === 'start') setStartSuggestions([]);
      else setDestSuggestions([]);
      return;
    }

    // 1. Instant Delhi NCR high-precision matches
    const localMatches = searchDelhiPlaces(query, 6).map(p => ({
      display_name: p.name,
      area: p.area,
      category: p.category,
      lat: p.lat,
      lon: p.lon,
      isDelhiLocal: true
    }));

    if (type === 'start') setStartSuggestions(localMatches);
    else setDestSuggestions(localMatches);

    // 2. Fetch live Nominatim / server geocode for any other arbitrary world/NCR locations
    try {
      const res = await fetch(`/api/map/geocode?q=${encodeURIComponent(query)}`);
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data)) {
          const formatted = data.map((item: any) => ({
            display_name: item.display_name || item.name,
            area: item.address?.state || item.address?.city || 'Geocoded Address',
            category: (item.category || 'landmark') as any,
            lat: parseFloat(item.lat),
            lon: parseFloat(item.lon),
            isDelhiLocal: false
          }));

          const merged = [...localMatches];
          for (const item of formatted) {
            if (!merged.some(m => Math.abs(m.lat - item.lat) < 0.005 && Math.abs(m.lon - item.lon) < 0.005)) {
              merged.push(item);
            }
          }

          if (type === 'start') setStartSuggestions(merged.slice(0, 8));
          else setDestSuggestions(merged.slice(0, 8));
        }
      }
    } catch (e) {}
  };

  const handleSwap = () => {
    const prevStart = startLocation;
    const prevStartCoords = startCoords;
    const prevDest = destinationLocation;
    const prevDestCoords = destCoords;

    setStartLocation(prevDest);
    setStartQuery(prevDest);
    if (prevDestCoords) setStartCoords(prevDestCoords);

    setDestinationLocation(prevStart);
    setDestQuery(prevStart);
    if (prevStartCoords) setDestCoords(prevStartCoords);

    setActiveDropdown(null);
  };

  // Select a suggestion with exact coordinates
  const handleSelectSuggestion = (item: any, type: 'start' | 'dest') => {
    const lat = typeof item.lat === 'string' ? parseFloat(item.lat) : item.lat;
    const lon = typeof item.lon === 'string' ? parseFloat(item.lon) : item.lon;

    if (type === 'start') {
      setStartLocation(item.display_name);
      setStartQuery(item.display_name);
      if (!isNaN(lat) && !isNaN(lon)) setStartCoords([lat, lon]);
    } else {
      setDestinationLocation(item.display_name);
      setDestQuery(item.display_name);
      if (!isNaN(lat) && !isNaN(lon)) setDestCoords([lat, lon]);
    }
    setActiveDropdown(null);
  };

  // Popular Delhi NCR Key Corridors & Places
  const delhiHotspots = [
    { label: 'Connaught Place', place: DELHI_NCR_PLACES[0] },
    { label: 'Chandni Chowk', place: DELHI_NCR_PLACES[4] },
    { label: 'Karol Bagh', place: DELHI_NCR_PLACES[2] },
    { label: 'Saket (Select Citywalk)', place: DELHI_NCR_PLACES[8] },
    { label: 'Hauz Khas', place: DELHI_NCR_PLACES[9] },
    { label: 'Rohini Sec 18', place: DELHI_NCR_PLACES[31] },
    { label: 'Dwarka Sec 21', place: DELHI_NCR_PLACES[22] },
    { label: 'Noida Sec 62', place: DELHI_NCR_PLACES[44] },
    { label: 'Cyber City Gurugram', place: DELHI_NCR_PLACES[52] },
    { label: 'Pari Chowk Gr Noida', place: DELHI_NCR_PLACES[48] }
  ];

  const corridorPresets = [
    {
      label: 'CP ➔ Greater Noida',
      start: 'Connaught Place (Rajiv Chowk)',
      sCoords: [28.6328, 77.2197] as [number, number],
      dest: 'Pari Chowk, Greater Noida',
      dCoords: [28.4744, 77.5040] as [number, number]
    },
    {
      label: 'Rohini ➔ Saket (Select Citywalk)',
      start: 'Rohini Sector 18 Commercial Hub',
      sCoords: [28.7425, 77.1350] as [number, number],
      dest: 'Saket (Select Citywalk & District Centre)',
      dCoords: [28.5284, 77.2185] as [number, number]
    },
    {
      label: 'Noida Sec 62 ➔ CP',
      start: 'Noida Sector 62 (Electronic City & NH9 Link)',
      sCoords: [28.6280, 77.3649] as [number, number],
      dest: 'Connaught Place (Rajiv Chowk)',
      dCoords: [28.6328, 77.2197] as [number, number]
    },
    {
      label: 'Cyber City Gurugram ➔ IGI Airport T3',
      start: 'DLF Cyber City & Cyber Hub, Gurugram',
      sCoords: [28.4950, 77.0890] as [number, number],
      dest: 'Indira Gandhi International Airport (IGI T3 Cargo)',
      dCoords: [28.5562, 77.1000] as [number, number]
    },
    {
      label: 'Chandni Chowk ➔ Okhla Ind Area',
      start: 'Chandni Chowk & Old Delhi Station',
      sCoords: [28.6562, 77.2300] as [number, number],
      dest: 'Okhla Industrial Area Phase III',
      dCoords: [28.5412, 77.2721] as [number, number]
    }
  ];

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
      setFormError('Please enter a valid start location.');
      return;
    }
    if (!destinationLocation.trim()) {
      setFormError('Please enter a valid destination.');
      return;
    }
    if (startLocation.trim().toLowerCase() === destinationLocation.trim().toLowerCase()) {
      setFormError('Start and destination locations cannot be identical.');
      return;
    }
    runRouteAnalysis(startLocation, destinationLocation, startCoords || undefined, destCoords || undefined);
  };

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm text-left">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-4 mb-5 border-b border-slate-100 gap-2">
        <div>
          <div className="flex items-center space-x-2">
            <h2 className="text-lg font-bold text-slate-900 tracking-tight">Route Planning & Clearance Matrix</h2>
            <span className="px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800 text-[10px] font-bold uppercase tracking-wider">
              Real GPS Coordinates
            </span>
          </div>
          <p className="text-xs text-slate-500">
            Type any specific area or landmark across Delhi-NCR or enter exact latitude/longitude coordinates
          </p>
        </div>
        <div className="flex items-center space-x-1.5 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-[#166534] text-xs font-semibold">
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>Physical Clearance Engine Active</span>
        </div>
      </div>

      {formError && (
        <div className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 flex items-center space-x-2 text-xs text-rose-700 font-medium">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{formError}</span>
        </div>
      )}

      {/* Preset Corridors Bar */}
      <div className="mb-3.5 flex flex-wrap items-center gap-1.5 text-xs">
        <span className="text-slate-400 font-mono text-[10.5px] font-bold uppercase mr-1">Corridors:</span>
        {corridorPresets.map(preset => (
          <button
            key={preset.label}
            type="button"
            onClick={() => {
              setRouteEndpoints(preset.start, preset.sCoords, preset.dest, preset.dCoords);
              setActiveDropdown(null);
            }}
            className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-emerald-50 border border-slate-200 hover:border-emerald-300 text-slate-700 hover:text-[#166534] font-medium text-[11px] transition cursor-pointer"
          >
            {preset.label}
          </button>
        ))}
      </div>

      {/* Quick Delhi Locations Pills */}
      <div className="mb-5 flex flex-wrap items-center gap-1.5 text-xs bg-slate-50 p-2.5 rounded-xl border border-slate-200">
        <span className="text-slate-500 font-bold text-[10px] uppercase tracking-wider flex items-center space-x-1 mr-1">
          <Compass className="w-3 h-3 text-[#166534]" />
          <span>Delhi Hubs:</span>
        </span>
        {delhiHotspots.map(({ label, place }) => (
          <button
            key={place.id}
            type="button"
            onClick={() => {
              // If origin is empty, set origin, else set destination
              if (!startLocation || startLocation === 'Connaught Place (Rajiv Chowk)') {
                setDestinationLocation(place.name);
                setDestCoords([place.lat, place.lon]);
                runRouteAnalysis(startLocation, place.name, startCoords || undefined, [place.lat, place.lon]);
              } else {
                setStartLocation(place.name);
                setStartCoords([place.lat, place.lon]);
                runRouteAnalysis(place.name, destinationLocation, [place.lat, place.lon], destCoords || undefined);
              }
            }}
            className="px-2 py-0.5 rounded-md bg-white hover:bg-emerald-100 border border-slate-200 text-slate-700 hover:text-[#166534] text-[10.5px] font-medium transition cursor-pointer shadow-2xs"
            title={`${place.name} [${place.lat}, ${place.lon}]`}
          >
            {label}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-5">
        {/* Start Location Input with Live Specific Delhi Places Autocomplete */}
        <div id="start-location-group" className="relative">
          <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center justify-between">
            <span className="flex items-center space-x-1">
              <MapPin className="w-3.5 h-3.5 text-blue-700" />
              <span>ORIGIN / SOURCE</span>
            </span>
            {startCoords && (
              <span className="font-mono text-[10px] text-blue-700 font-semibold bg-blue-50 px-1.5 py-0.2 rounded border border-blue-200">
                {startCoords[0].toFixed(3)}°, {startCoords[1].toFixed(3)}°
              </span>
            )}
          </label>
          <input
            id="start-location-input"
            type="text"
            value={startQuery}
            onChange={e => {
              setStartQuery(e.target.value);
              setStartLocation(e.target.value);
              searchGeocode(e.target.value, 'start');
              setActiveDropdown('start');
            }}
            onFocus={() => {
              searchGeocode(startQuery, 'start');
              setActiveDropdown('start');
            }}
            placeholder="Search any Delhi place, sector, or lat,lon..."
            className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2.5 text-xs font-semibold text-slate-800 focus:outline-none focus:border-emerald-600 focus:bg-white transition"
          />

          {/* Autocomplete Dropdown with Specific Coordinates & Area Badges */}
          {activeDropdown === 'start' && startSuggestions.length > 0 && (
            <div className="absolute left-0 right-0 mt-1 bg-white border border-slate-200 rounded-xl shadow-xl z-50 max-h-56 overflow-y-auto divide-y divide-slate-100">
              {startSuggestions.map((sug, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleSelectSuggestion(sug, 'start')}
                  className="w-full text-left p-2.5 hover:bg-emerald-50 text-xs text-slate-800 transition flex items-start space-x-2"
                >
                  <MapPin className="w-3.5 h-3.5 text-blue-600 shrink-0 mt-0.5" />
                  <div className="flex-1 min-w-0">
                    <div className="font-bold text-slate-900 truncate">{sug.display_name}</div>
                    <div className="flex items-center space-x-2 mt-0.5 text-[10px] text-slate-500">
                      <span className="text-slate-600 font-medium">{sug.area}</span>
                      <span>·</span>
                      <span className="font-mono text-emerald-700 bg-emerald-50 px-1 rounded">
                        {typeof sug.lat === 'number' ? sug.lat.toFixed(4) : sug.lat}, {typeof sug.lon === 'number' ? sug.lon.toFixed(4) : sug.lon}
                      </span>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Destination Location Input with Live Specific Delhi Places Autocomplete */}
        <div id="destination-location-group" className="relative">
          <div className="flex items-center justify-between mb-1.5">
            <label className="text-xs font-bold text-slate-700 flex items-center space-x-1">
              <MapPin className="w-3.5 h-3.5 text-emerald-700" />
              <span>DESTINATION</span>
            </label>
            <div className="flex items-center space-x-2">
              {destCoords && (
                <span className="font-mono text-[10px] text-emerald-700 font-semibold bg-emerald-50 px-1.5 py-0.2 rounded border border-emerald-200">
                  {destCoords[0].toFixed(3)}°, {destCoords[1].toFixed(3)}°
                </span>
              )}
              <button
                type="button"
                onClick={handleSwap}
                className="text-[11px] font-bold text-[#166534] hover:text-[#14532d] flex items-center space-x-0.5 transition cursor-pointer"
                title="Reverse origin and destination"
              >
                <ArrowLeftRight className="w-3 h-3" />
                <span>Swap</span>
              </button>
            </div>
          </div>
          <input
            id="destination-location-input"
            type="text"
            value={destQuery}
            onChange={e => {
              setDestQuery(e.target.value);
              setDestinationLocation(e.target.value);
              searchGeocode(e.target.value, 'dest');
              setActiveDropdown('dest');
            }}
            onFocus={() => {
              searchGeocode(destQuery, 'dest');
              setActiveDropdown('dest');
            }}
            placeholder="Search any destination in Delhi NCR or lat,lon..."
            className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2.5 text-xs font-semibold text-slate-800 focus:outline-none focus:border-emerald-600 focus:bg-white transition"
          />

          {/* Autocomplete Dropdown */}
          {activeDropdown === 'dest' && destSuggestions.length > 0 && (
            <div className="absolute left-0 right-0 mt-1 bg-white border border-slate-200 rounded-xl shadow-xl z-50 max-h-56 overflow-y-auto divide-y divide-slate-100">
              {destSuggestions.map((sug, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleSelectSuggestion(sug, 'dest')}
                  className="w-full text-left p-2.5 hover:bg-emerald-50 text-xs text-slate-800 transition flex items-start space-x-2"
                >
                  <MapPin className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                  <div className="flex-1 min-w-0">
                    <div className="font-bold text-slate-900 truncate">{sug.display_name}</div>
                    <div className="flex items-center space-x-2 mt-0.5 text-[10px] text-slate-500">
                      <span className="text-slate-600 font-medium">{sug.area}</span>
                      <span>·</span>
                      <span className="font-mono text-emerald-700 bg-emerald-50 px-1 rounded">
                        {typeof sug.lat === 'number' ? sug.lat.toFixed(4) : sug.lat}, {typeof sug.lon === 'number' ? sug.lon.toFixed(4) : sug.lon}
                      </span>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}
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
