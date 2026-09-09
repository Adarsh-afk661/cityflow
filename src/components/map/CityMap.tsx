import React, { useState } from 'react';
import {
  Globe2,
  Compass
} from 'lucide-react';
import { useCityFlow } from '../../context/CityFlowContext';
import { RealTimeOSMMap } from './RealTimeOSMMap';
import { GoogleFleetMap } from './GoogleFleetMap';

interface CityMapProps {
  heightClass?: string;
  showControls?: boolean;
  showJourneyRoutes?: boolean;
}

export const CityMap: React.FC<CityMapProps> = ({
  heightClass = 'h-[520px]',
  showControls = true,
  showJourneyRoutes = false
}) => {
  const [mapMode, setMapMode] = useState<'google' | 'osm'>('google');

  return (
    <div className={`relative w-full ${heightClass} bg-[#0f172a] rounded-2xl overflow-hidden border border-slate-800 shadow-sm select-none group text-left`}>
      {/* Map Mode Switcher (Google Maps Platform vs OpenStreetMap Vector) - positioned bottom-right */}
      {showControls && (
        <div className="absolute z-30 bottom-3 right-3 flex items-center bg-slate-900/90 backdrop-blur-md p-1 rounded-xl border border-slate-700 shadow-md">
          <button
            onClick={() => setMapMode('google')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center space-x-1.5 cursor-pointer ${
              mapMode === 'google'
                ? 'bg-[#166534] text-white shadow-xs'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Globe2 className="w-3.5 h-3.5 text-emerald-300" />
            <span>Google Maps</span>
          </button>
          <button
            onClick={() => setMapMode('osm')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center space-x-1.5 cursor-pointer ${
              mapMode === 'osm'
                ? 'bg-[#166534] text-white shadow-xs'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Compass className="w-3.5 h-3.5" />
            <span>OpenStreetMap</span>
          </button>
        </div>
      )}

      {mapMode === 'google' ? (
        <GoogleFleetMap heightClass={heightClass} showJourneyRoutes={showJourneyRoutes} />
      ) : (
        <RealTimeOSMMap heightClass={heightClass} showJourneyRoutes={showJourneyRoutes} />
      )}
    </div>
  );
};
