import React, { useState, useEffect } from 'react';
import {
  Globe2,
  Compass,
  Maximize2,
  Minimize2,
  Navigation,
  ShieldCheck
} from 'lucide-react';
import { useCityFlow } from '../../context/CityFlowContext';
import { RealTimeOSMMap } from './RealTimeOSMMap';
import { GoogleFleetMap } from './GoogleFleetMap';

interface CityMapProps {
  heightClass?: string;
  showControls?: boolean;
  showJourneyRoutes?: boolean;
  onToggleExpand?: () => void;
  isExpandedInline?: boolean;
}

export const CityMap: React.FC<CityMapProps> = ({
  heightClass = 'h-[520px]',
  showControls = true,
  showJourneyRoutes = false,
  onToggleExpand,
  isExpandedInline = false
}) => {
  const [mapMode, setMapMode] = useState<'google' | 'osm'>('google');
  const [isFullscreen, setIsFullscreen] = useState(false);
  const { selectedRoute, startLocation, destinationLocation } = useCityFlow();

  // Handle ESC key to exit fullscreen
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsFullscreen(false);
      }
    };
    if (isFullscreen) {
      document.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [isFullscreen]);

  return (
    <>
      <div className={`relative w-full ${heightClass} bg-[#0f172a] rounded-2xl overflow-hidden border border-slate-800 shadow-sm select-none group text-left transition-all duration-300`}>
        {/* Map Mode Switcher & Fullscreen Action Bar - bottom-right */}
        {showControls && (
          <div className="absolute z-30 bottom-3 right-3 flex items-center gap-1.5 bg-slate-900/90 backdrop-blur-md p-1 rounded-xl border border-slate-700 shadow-xl">
            {/* Inline Expand Toggle if provided */}
            {onToggleExpand && (
              <button
                type="button"
                onClick={onToggleExpand}
                className="px-2.5 py-1.5 rounded-lg text-xs font-bold transition flex items-center space-x-1.5 cursor-pointer bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700"
                title={isExpandedInline ? "Side-by-Side View" : "Wide View"}
              >
                <Maximize2 className="w-3.5 h-3.5 text-blue-400" />
                <span className="hidden sm:inline">{isExpandedInline ? 'Normal View' : 'Wide View'}</span>
              </button>
            )}

            {/* Immersive Fullscreen Button */}
            <button
              type="button"
              onClick={() => setIsFullscreen(true)}
              className="px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center space-x-1.5 cursor-pointer bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 shadow-xs"
              title="Full Screen Mode"
            >
              <Maximize2 className="w-3.5 h-3.5 text-amber-400" />
              <span>Full Screen</span>
            </button>

            {/* Google vs OSM Switcher */}
            <button
              type="button"
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
              type="button"
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

      {/* Fullscreen Map Modal Overlay */}
      {isFullscreen && (
        <div className="fixed inset-0 z-50 bg-slate-950/95 backdrop-blur-xl p-3 sm:p-5 flex flex-col animate-in fade-in zoom-in-95 duration-150">
          {/* Top Fullscreen Header */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl px-4 py-3 mb-3 flex flex-wrap items-center justify-between gap-3 shadow-2xl shrink-0">
            <div className="flex items-center space-x-3">
              <div className="w-9 h-9 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 shadow-sm">
                <Navigation className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center space-x-2">
                  <h3 className="text-sm sm:text-base font-extrabold text-white tracking-tight">
                    CityFlow Panoramic Map & Live Traffic Inspector
                  </h3>
                  <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded font-mono font-bold border border-emerald-500/40">
                    FULLSCREEN
                  </span>
                </div>
                <div className="text-[11px] text-slate-400 flex items-center space-x-2 mt-0.5">
                  <span className="truncate max-w-xs sm:max-w-md">
                    {startLocation} ➔ {destinationLocation}
                  </span>
                  {selectedRoute && (
                    <span className="text-emerald-300 font-bold font-mono">
                      · {selectedRoute.name.split('—')[0]} ({selectedRoute.currentEtaMin}m ETA)
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Controls Bar */}
            <div className="flex items-center space-x-2">
              <div className="flex items-center bg-slate-800 p-1 rounded-xl border border-slate-700">
                <button
                  type="button"
                  onClick={() => setMapMode('google')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center space-x-1.5 cursor-pointer ${
                    mapMode === 'google' ? 'bg-[#166534] text-white' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <Globe2 className="w-3.5 h-3.5 text-emerald-300" />
                  <span>Google Maps</span>
                </button>
                <button
                  type="button"
                  onClick={() => setMapMode('osm')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center space-x-1.5 cursor-pointer ${
                    mapMode === 'osm' ? 'bg-[#166534] text-white' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <Compass className="w-3.5 h-3.5" />
                  <span>OpenStreetMap</span>
                </button>
              </div>

              {/* Exit Fullscreen Button */}
              <button
                type="button"
                onClick={() => setIsFullscreen(false)}
                className="px-3.5 py-1.5 bg-rose-600 hover:bg-rose-500 text-white rounded-xl text-xs font-bold transition flex items-center space-x-1.5 cursor-pointer shadow-md"
                title="Exit Fullscreen (Esc)"
              >
                <Minimize2 className="w-4 h-4" />
                <span>Exit Fullscreen (Esc)</span>
              </button>
            </div>
          </div>

          {/* Fullscreen Map Canvas */}
          <div className="flex-1 w-full relative rounded-2xl overflow-hidden border border-slate-800 shadow-2xl">
            {mapMode === 'google' ? (
              <GoogleFleetMap heightClass="h-full" showJourneyRoutes={showJourneyRoutes} />
            ) : (
              <RealTimeOSMMap heightClass="h-full" showJourneyRoutes={showJourneyRoutes} />
            )}
          </div>
        </div>
      )}
    </>
  );
};
