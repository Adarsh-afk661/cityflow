import React, { useState } from 'react';
import {
  ZoomIn,
  ZoomOut,
  Maximize2,
  Layers,
  AlertTriangle,
  Truck,
  CheckCircle2,
  XCircle,
  Activity,
  Globe2,
  Compass
} from 'lucide-react';
import { useCityFlow } from '../../context/CityFlowContext';
import { CITY_INFRASTRUCTURE, CITY_HUBS } from '../../data/cityNetwork';
import { CityZone } from '../../types';
import { RealTimeOSMMap } from './RealTimeOSMMap';

interface CityMapProps {
  heightClass?: string;
  showControls?: boolean;
}

export const CityMap: React.FC<CityMapProps> = ({
  heightClass = 'h-[520px]',
  showControls = true
}) => {
  const {
    cityZones,
    selectedZone,
    setSelectedZone,
    selectedRoute,
    fleet,
    setSelectedFleetVehicle,
    selectedVehicle,
    liveTrafficEnabled
  } = useCityFlow();

  const [mapMode, setMapMode] = useState<'blueprint' | 'osm'>('blueprint');
  const [zoom, setZoom] = useState(1.0);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [activeLayers, setActiveLayers] = useState({
    traffic: true,
    clearance: true,
    fleet: true,
    zones: true,
    incidents: true
  });
  const [hoveredInfra, setHoveredInfra] = useState<string | null>(null);

  const toggleLayer = (layer: keyof typeof activeLayers) => {
    setActiveLayers(prev => ({ ...prev, [layer]: !prev[layer] }));
  };

  const resetView = () => {
    setZoom(1.0);
    setPan({ x: 0, y: 0 });
  };

  // Check if an infrastructure item has clearance violation for current selected vehicle
  const getInfraClearanceViolation = (infraId: string) => {
    const infra = CITY_INFRASTRUCTURE.find(i => i.id === infraId);
    if (!infra || !selectedVehicle) return null;
    if (selectedVehicle.height > infra.maxHeight) {
      return `Height ${selectedVehicle.height}m exceeds ${infra.maxHeight}m limit`;
    }
    if (selectedVehicle.weight > infra.maxWeight) {
      return `Weight ${selectedVehicle.weight}T exceeds ${infra.maxWeight}T capacity`;
    }
    return null;
  };

  return (
    <div className={`relative w-full ${heightClass} bg-[#f8fafc] rounded-2xl overflow-hidden border border-slate-200 shadow-sm select-none group text-left`}>
      {/* Map Mode Switcher (Blueprint vs Real-Time OpenStreetMap) */}
      <div className={`absolute z-30 flex items-center bg-white/95 backdrop-blur-md p-1 rounded-xl border border-slate-200 shadow-md ${
        mapMode === 'osm' ? 'top-3 left-3 sm:left-[405px]' : 'top-3 left-3'
      }`}>
        <button
          onClick={() => setMapMode('blueprint')}
          className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center space-x-1.5 ${
            mapMode === 'blueprint'
              ? 'bg-[#166534] text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Compass className="w-3.5 h-3.5" />
          <span>Digital Twin Blueprint</span>
        </button>
        <button
          onClick={() => setMapMode('osm')}
          className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center space-x-1.5 ${
            mapMode === 'osm'
              ? 'bg-[#166534] text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Globe2 className="w-3.5 h-3.5" />
          <span>Live OpenStreetMap (Real Tiles)</span>
        </button>
      </div>

      {mapMode === 'osm' ? (
        <RealTimeOSMMap heightClass={heightClass} />
      ) : (
        <>
          {/* Background Urban Blueprint SVG */}
          <svg
            viewBox="0 0 950 600"
            className="w-full h-full cursor-grab active:cursor-grabbing transition-transform duration-200"
            style={{
              transform: `scale(${zoom}) translate(${pan.x}px, ${pan.y}px)`
            }}
          >
        <defs>
          {/* Subtle grid pattern */}
          <pattern id="lightGrid" width="40" height="40" patternUnits="userSpaceOnUse">
            <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#e2e8f0" strokeWidth="0.8" strokeOpacity="0.8" />
          </pattern>

          {/* Waterway gradient */}
          <linearGradient id="riverLight" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#e0f2fe" stopOpacity="0.9" />
            <stop offset="100%" stopColor="#bae6fd" stopOpacity="0.7" />
          </linearGradient>
        </defs>

        {/* Background Canvas */}
        <rect width="950" height="600" fill="#f8fafc" />
        <rect width="950" height="600" fill="url(#lightGrid)" />

        {/* River waterway (Grand River) */}
        <path
          d="M 120,600 C 180,450 320,380 430,300 C 530,220 540,110 500,0 L 580,0 C 620,110 610,220 510,310 C 400,390 270,470 200,600 Z"
          fill="url(#riverLight)"
          stroke="#93c5fd"
          strokeWidth="1.5"
        />
        <text x="360" y="325" fill="#60a5fa" fontSize="11" fontFamily="monospace" letterSpacing="4" fontWeight="600">GRAND RIVER WATERWAY</text>

        {/* City Pressure Zones Layer */}
        {activeLayers.zones &&
          cityZones.map(zone => {
            const isSelected = selectedZone?.id === zone.id;
            const pointsStr = zone.polygon.map(p => `${p.x},${p.y}`).join(' ');
            let fillColor = 'rgba(22, 101, 52, 0.06)';
            let strokeColor = '#166534';

            if (zone.status === 'severe') {
              fillColor = 'rgba(225, 29, 72, 0.08)';
              strokeColor = '#e11d48';
            } else if (zone.status === 'heavy') {
              fillColor = 'rgba(217, 119, 6, 0.08)';
              strokeColor = '#d97706';
            } else if (zone.status === 'moderate') {
              fillColor = 'rgba(2, 132, 199, 0.06)';
              strokeColor = '#0284c7';
            }

            return (
              <g key={zone.id} className="cursor-pointer" onClick={() => setSelectedZone(zone)}>
                <polygon
                  points={pointsStr}
                  fill={fillColor}
                  stroke={strokeColor}
                  strokeWidth={isSelected ? '2.5' : '1.2'}
                  strokeDasharray={isSelected ? 'none' : '4 3'}
                  className="transition-all hover:opacity-90"
                />
                <circle cx={zone.center.x} cy={zone.center.y} r="14" fill="#ffffff" stroke={strokeColor} strokeWidth="2" filter="drop-shadow(0 2px 4px rgba(0,0,0,0.08))" />
                <text
                  x={zone.center.x}
                  y={zone.center.y + 4}
                  textAnchor="middle"
                  fill="#0f172a"
                  fontSize="9"
                  fontFamily="monospace"
                  fontWeight="bold"
                >
                  {zone.pressureScore}
                </text>
                <text
                  x={zone.center.x}
                  y={zone.center.y + 24}
                  textAnchor="middle"
                  fill="#475569"
                  fontSize="10"
                  fontWeight="600"
                  className="pointer-events-none"
                >
                  {zone.name}
                </text>
              </g>
            );
          })}

        {/* Road Network Base Tracks */}
        <g stroke="#cbd5e1" strokeWidth="8" strokeLinecap="round" strokeLinejoin="round" fill="none">
          {/* Expressway A-10 */}
          <path d="M 220,480 L 290,410 L 370,350 L 450,270 L 540,180 L 620,120" />
          {/* Ring Beltway */}
          <path d="M 220,480 L 200,360 L 250,240 L 380,180 L 490,230 L 570,180 L 620,120" />
          {/* Green Corridor Parkway */}
          <path d="M 220,480 L 260,370 L 310,260 L 390,210 L 510,160 L 620,120" />
          {/* Cross connectors */}
          <path d="M 200,360 L 370,350 L 460,350 L 680,270 L 760,370" />
          <path d="M 450,270 L 490,230 L 740,190" />
        </g>

        {/* Live Traffic Flow Layer */}
        {activeLayers.traffic && (
          <g fill="none" strokeLinecap="round" strokeLinejoin="round">
            {/* Outer Ring Beltway (Smooth / Green) */}
            <path
              d="M 220,480 L 200,360 L 250,240 L 380,180 L 490,230 L 570,180 L 620,120"
              stroke="#166534"
              strokeWidth="4"
              strokeDasharray={liveTrafficEnabled ? '10 8' : 'none'}
              className={liveTrafficEnabled ? 'animate-flow' : ''}
              opacity="0.9"
            />

            {/* Green Corridor (Smooth) */}
            <path
              d="M 220,480 L 260,370 L 310,260 L 390,210 L 510,160 L 620,120"
              stroke="#059669"
              strokeWidth="3.5"
              strokeDasharray={liveTrafficEnabled ? '12 6' : 'none'}
              className={liveTrafficEnabled ? 'animate-flow' : ''}
              opacity="0.9"
            />

            {/* Expressway A-10 (Heavy / Congested) */}
            <path
              d="M 220,480 L 290,410 L 370,350 L 450,270 L 540,180 L 620,120"
              stroke="#d97706"
              strokeWidth="4"
              strokeDasharray="6 4"
              opacity="0.9"
            />

            {/* Severe Chokepoint */}
            <path
              d="M 460,350 L 680,270 L 760,370"
              stroke="#e11d48"
              strokeWidth="4.5"
              strokeDasharray="8 6"
              opacity="0.9"
            />
          </g>
        )}

        {/* Selected Candidate Route Highlight */}
        {selectedRoute && (
          <g fill="none" strokeLinecap="round" strokeLinejoin="round">
            <path
              d={selectedRoute.pathWaypoints.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x},${p.y}`).join(' ')}
              stroke={selectedRoute.clearanceStatus === 'failed' ? '#e11d48' : '#166534'}
              strokeWidth="7"
              opacity="0.95"
            />
            <path
              d={selectedRoute.pathWaypoints.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x},${p.y}`).join(' ')}
              stroke="#ffffff"
              strokeWidth="2.5"
              strokeDasharray="8 6"
              className="animate-flow"
            />
          </g>
        )}

        {/* Infrastructure Checkpoints (Underpasses, Bridges) */}
        {activeLayers.clearance &&
          CITY_INFRASTRUCTURE.map(infra => {
            const violation = getInfraClearanceViolation(infra.id);
            const isFailing = violation !== null;
            const isHovered = hoveredInfra === infra.id;

            return (
              <g
                key={infra.id}
                className="cursor-pointer"
                onMouseEnter={() => setHoveredInfra(infra.id)}
                onMouseLeave={() => setHoveredInfra(null)}
              >
                <circle
                  cx={infra.coordinates.x}
                  cy={infra.coordinates.y}
                  r="13"
                  fill="#ffffff"
                  stroke={isFailing ? '#e11d48' : '#166534'}
                  strokeWidth="2.5"
                  filter="drop-shadow(0 2px 4px rgba(0,0,0,0.1))"
                />

                <text
                  x={infra.coordinates.x}
                  y={infra.coordinates.y + 4}
                  textAnchor="middle"
                  fill={isFailing ? '#e11d48' : '#166534'}
                  fontSize="10"
                  fontWeight="bold"
                >
                  {infra.type === 'underpass' ? '▼' : infra.type === 'bridge' ? '▲' : '◆'}
                </text>

                {/* Clearance Tag Badge */}
                <g transform={`translate(${infra.coordinates.x + 16}, ${infra.coordinates.y - 12})`}>
                  <rect
                    width="68"
                    height="20"
                    rx="4"
                    fill={isFailing ? '#ffe4e6' : '#ffffff'}
                    stroke={isFailing ? '#f43f5e' : '#cbd5e1'}
                    strokeWidth="1"
                    filter="drop-shadow(0 1px 2px rgba(0,0,0,0.05))"
                  />
                  <text
                    x="8"
                    y="13"
                    fill={isFailing ? '#be123c' : '#334155'}
                    fontSize="9"
                    fontFamily="monospace"
                    fontWeight="bold"
                  >
                    MAX {infra.maxHeight}m
                  </text>
                </g>

                {/* Tooltip Card */}
                {isHovered && (
                  <g transform={`translate(${infra.coordinates.x - 75}, ${infra.coordinates.y - 65})`} className="pointer-events-none">
                    <rect width="170" height="52" rx="8" fill="#ffffff" stroke="#cbd5e1" strokeWidth="1" filter="drop-shadow(0 8px 16px rgba(0,0,0,0.1))" />
                    <text x="10" y="18" fill="#0f172a" fontSize="10" fontWeight="bold">{infra.name}</text>
                    <text x="10" y="32" fill="#64748b" fontSize="9">Height: {infra.maxHeight}m | Weight: {infra.maxWeight}T</text>
                    <text x="10" y="44" fill={isFailing ? '#e11d48' : '#166534'} fontSize="8" fontWeight="bold">
                      {isFailing ? `⚠️ BARRED: ${violation}` : '✓ CLEARANCE APPROVED'}
                    </text>
                  </g>
                )}
              </g>
            );
          })}

        {/* Hubs (Origin, Destination) */}
        {CITY_HUBS.map(hub => {
          const isStart = hub.name === 'Central Warehouse';
          const isDest = hub.name === 'North Distribution Hub';
          const pinColor = isStart ? '#1e3a8a' : isDest ? '#166534' : '#64748b';

          return (
            <g key={hub.id} className="cursor-pointer">
              <circle
                cx={hub.coordinates.x}
                cy={hub.coordinates.y}
                r={isStart || isDest ? '9' : '6'}
                fill="#ffffff"
                stroke={pinColor}
                strokeWidth="3"
                filter="drop-shadow(0 2px 4px rgba(0,0,0,0.1))"
              />
              <circle
                cx={hub.coordinates.x}
                cy={hub.coordinates.y}
                r={isStart || isDest ? '4' : '2.5'}
                fill={pinColor}
              />
              <text
                x={hub.coordinates.x}
                y={hub.coordinates.y - 12}
                textAnchor="middle"
                fill={isStart || isDest ? '#0f172a' : '#64748b'}
                fontSize={isStart || isDest ? '11' : '9'}
                fontWeight={isStart || isDest ? 'bold' : 'normal'}
                fontFamily="Outfit"
              >
                {hub.name}
              </text>
            </g>
          );
        })}

        {/* Fleet Vehicles */}
        {activeLayers.fleet &&
          fleet.map(veh => {
            const isDelayed = veh.status === 'delayed';
            const color = isDelayed ? '#e11d48' : '#166534';

            return (
              <g
                key={veh.id}
                className="cursor-pointer transition-all duration-300"
                onClick={() => setSelectedFleetVehicle(veh)}
              >
                <circle
                  cx={veh.coordinates.x}
                  cy={veh.coordinates.y}
                  r="6"
                  fill="#ffffff"
                  stroke={color}
                  strokeWidth="2.5"
                  filter="drop-shadow(0 2px 3px rgba(0,0,0,0.15))"
                />
                <circle cx={veh.coordinates.x} cy={veh.coordinates.y} r="2.5" fill={color} />
                <rect
                  x={veh.coordinates.x + 8}
                  y={veh.coordinates.y - 8}
                  width="48"
                  height="14"
                  rx="3"
                  fill="#ffffff"
                  stroke="#cbd5e1"
                  strokeWidth="0.8"
                />
                <text
                  x={veh.coordinates.x + 12}
                  y={veh.coordinates.y + 2}
                  fill={isDelayed ? '#e11d48' : '#0f172a'}
                  fontSize="8"
                  fontFamily="monospace"
                  fontWeight="bold"
                >
                  {veh.id}
                </text>
              </g>
            );
          })}
      </svg>

      {/* Map Interactive HUD Controls */}
      {showControls && (
        <div className="absolute top-4 right-4 flex flex-col space-y-2 z-10">
          <div className="bg-white/95 backdrop-blur-md p-1.5 rounded-xl border border-slate-200 shadow-sm flex flex-col space-y-1">
            <button
              id="map-zoom-in-btn"
              onClick={() => setZoom(z => Math.min(2.5, +(z + 0.2).toFixed(1)))}
              title="Zoom In"
              className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-700 hover:text-emerald-800 transition"
            >
              <ZoomIn className="w-4 h-4" />
            </button>
            <button
              id="map-zoom-out-btn"
              onClick={() => setZoom(z => Math.max(0.7, +(z - 0.2).toFixed(1)))}
              title="Zoom Out"
              className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-700 hover:text-emerald-800 transition"
            >
              <ZoomOut className="w-4 h-4" />
            </button>
            <button
              id="map-reset-view-btn"
              onClick={resetView}
              title="Reset Map View"
              className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-700 hover:text-emerald-800 transition"
            >
              <Maximize2 className="w-4 h-4" />
            </button>
          </div>

          {/* Layer Filter Toggles */}
          <div className="bg-white/95 backdrop-blur-md p-3 rounded-xl border border-slate-200 shadow-md text-xs space-y-2">
            <div className="flex items-center space-x-1.5 text-slate-700 font-bold text-[10px] uppercase pb-1 border-b border-slate-100">
              <Layers className="w-3 h-3 text-emerald-700" />
              <span>Map Layers</span>
            </div>
            <label className="flex items-center space-x-2 text-[11px] text-slate-700 cursor-pointer hover:text-slate-950 font-medium">
              <input
                type="checkbox"
                checked={activeLayers.clearance}
                onChange={() => toggleLayer('clearance')}
                className="rounded border-slate-300 text-emerald-700 focus:ring-0"
              />
              <span>Clearance Points</span>
            </label>
            <label className="flex items-center space-x-2 text-[11px] text-slate-700 cursor-pointer hover:text-slate-950 font-medium">
              <input
                type="checkbox"
                checked={activeLayers.traffic}
                onChange={() => toggleLayer('traffic')}
                className="rounded border-slate-300 text-emerald-700 focus:ring-0"
              />
              <span>Live Traffic Flow</span>
            </label>
            <label className="flex items-center space-x-2 text-[11px] text-slate-700 cursor-pointer hover:text-slate-950 font-medium">
              <input
                type="checkbox"
                checked={activeLayers.fleet}
                onChange={() => toggleLayer('fleet')}
                className="rounded border-slate-300 text-emerald-700 focus:ring-0"
              />
              <span>Fleet Telemetry</span>
            </label>
            <label className="flex items-center space-x-2 text-[11px] text-slate-700 cursor-pointer hover:text-slate-950 font-medium">
              <input
                type="checkbox"
                checked={activeLayers.zones}
                onChange={() => toggleLayer('zones')}
                className="rounded border-slate-300 text-emerald-700 focus:ring-0"
              />
              <span>Pressure Polygons</span>
            </label>
          </div>
        </div>
      )}

      {/* Map Legend Footer */}
      <div className="absolute bottom-3 left-4 right-4 flex items-center justify-between pointer-events-none">
        <div className="bg-white/95 backdrop-blur-md px-3 py-1.5 rounded-lg border border-slate-200 shadow-sm flex items-center space-x-4 text-[11px] text-slate-700 pointer-events-auto font-medium">
          <div className="flex items-center space-x-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-[#166534]" />
            <span>Clear / Optimal</span>
          </div>
          <div className="flex items-center space-x-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-[#d97706]" />
            <span>Moderate Traffic</span>
          </div>
          <div className="flex items-center space-x-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-[#e11d48]" />
            <span>Barred / Violation</span>
          </div>
        </div>

        {/* Active Vehicle Spec Indicator */}
        {selectedVehicle && (
          <div className="bg-white/95 backdrop-blur-md px-3 py-1.5 rounded-lg border border-slate-200 shadow-sm flex items-center space-x-2 text-[11px] font-mono pointer-events-auto">
            <Truck className="w-3.5 h-3.5 text-emerald-700" />
            <span className="text-slate-500">Vehicle:</span>
            <span className="text-slate-900 font-bold">{selectedVehicle.name}</span>
            <span className="text-slate-300">|</span>
            <span className="text-emerald-800 font-semibold">{selectedVehicle.height}m H · {selectedVehicle.weight}T</span>
          </div>
        )}
      </div>

      {/* Inspected Zone Card Overlay */}
      {selectedZone && (
        <div className="absolute top-4 left-4 w-72 bg-white/95 backdrop-blur-md p-4 rounded-xl border border-emerald-300 shadow-xl z-20">
          <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-100">
            <div className="flex items-center space-x-2">
              <Activity className="w-4 h-4 text-emerald-700" />
              <h4 className="font-bold text-sm text-slate-900">{selectedZone.name}</h4>
            </div>
            <button
              onClick={() => setSelectedZone(null)}
              className="text-slate-400 hover:text-slate-700 text-xs font-bold px-1.5 py-0.5 rounded hover:bg-slate-100"
            >
              ✕
            </button>
          </div>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="bg-slate-50 p-2 rounded border border-slate-200">
              <p className="text-[10px] text-slate-500">Pressure Score</p>
              <p className={`text-base font-mono font-extrabold ${selectedZone.pressureScore > 80 ? 'text-rose-600' : selectedZone.pressureScore > 65 ? 'text-amber-600' : 'text-emerald-700'}`}>
                {selectedZone.pressureScore} <span className="text-xs font-normal text-slate-400">/ 100</span>
              </p>
            </div>
            <div className="bg-slate-50 p-2 rounded border border-slate-200">
              <p className="text-[10px] text-slate-500">Average Speed</p>
              <p className="text-base font-mono font-extrabold text-slate-900">
                {selectedZone.avgSpeedKmh} <span className="text-xs font-normal text-slate-400">km/h</span>
              </p>
            </div>
          </div>
          <div className="mt-2.5 flex items-center justify-between text-xs text-slate-600">
            <span>Incidents: <strong className="text-amber-700">{selectedZone.activeIncidents}</strong></span>
            <span>Status: <strong className="uppercase text-slate-800">{selectedZone.status}</strong></span>
          </div>
        </div>
      )}
        </>
      )}
    </div>
  );
};

