import React, { useEffect, useRef, useState } from 'react';
import { setOptions, importLibrary } from '@googlemaps/js-api-loader';
import {
  Compass,
  Layers,
  MapPin,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Truck,
  RotateCcw,
  Navigation,
  Navigation2,
  Clock,
  ArrowRight,
  ChevronDown,
  ChevronUp,
  Sparkles,
  Info
} from 'lucide-react';
import { useCityFlow } from '../../context/CityFlowContext';
import { RealTimeOSMMap } from './RealTimeOSMMap';

declare const google: any;

// Helper to compute realistic Pickup and Drop-off times
const calculateJourneyTimes = (departureStr: string = 'Now', durationMins: number = 30) => {
  const match = departureStr ? departureStr.match(/(\d{1,2}):(\d{2})\s*(AM|PM)/i) : null;
  let startHour: number;
  let startMin: number;

  if (match) {
    let h = parseInt(match[1], 10);
    const m = parseInt(match[2], 10);
    const period = match[3].toUpperCase();
    if (period === 'PM' && h < 12) h += 12;
    if (period === 'AM' && h === 12) h = 0;
    startHour = h;
    startMin = m;
  } else {
    const now = new Date();
    startHour = now.getHours();
    startMin = now.getMinutes();
  }

  const pickupDate = new Date();
  pickupDate.setHours(startHour, startMin, 0, 0);

  const dropoffDate = new Date(pickupDate.getTime() + durationMins * 60 * 1000);

  const fmt = (d: Date) =>
    d.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit', hour12: true });

  return {
    pickupTime: fmt(pickupDate),
    dropoffTime: fmt(dropoffDate),
  };
};

interface GoogleFleetMapProps {
  heightClass?: string;
  showJourneyRoutes?: boolean;
}

// Professional Dark Fleet Command-Center Style
const DARK_FLEET_MAP_STYLES = [
  { elementType: 'geometry', stylers: [{ color: '#0f172a' }] },
  { elementType: 'labels.text.stroke', stylers: [{ color: '#0f172a' }] },
  { elementType: 'labels.text.fill', stylers: [{ color: '#94a3b8' }] },
  {
    featureType: 'administrative.locality',
    elementType: 'labels.text.fill',
    stylers: [{ color: '#cbd5e1' }]
  },
  {
    featureType: 'poi',
    elementType: 'labels.text.fill',
    stylers: [{ color: '#64748b' }]
  },
  {
    featureType: 'poi.park',
    elementType: 'geometry',
    stylers: [{ color: '#13202e' }]
  },
  {
    featureType: 'road',
    elementType: 'geometry',
    stylers: [{ color: '#1e293b' }]
  },
  {
    featureType: 'road',
    elementType: 'geometry.stroke',
    stylers: [{ color: '#0f172a' }]
  },
  {
    featureType: 'road',
    elementType: 'labels.text.fill',
    stylers: [{ color: '#64748b' }]
  },
  {
    featureType: 'road.highway',
    elementType: 'geometry',
    stylers: [{ color: '#334155' }]
  },
  {
    featureType: 'road.highway',
    elementType: 'geometry.stroke',
    stylers: [{ color: '#1e293b' }]
  },
  {
    featureType: 'road.highway',
    elementType: 'labels.text.fill',
    stylers: [{ color: '#94a3b8' }]
  },
  {
    featureType: 'transit',
    elementType: 'geometry',
    stylers: [{ color: '#1e293b' }]
  },
  {
    featureType: 'water',
    elementType: 'geometry',
    stylers: [{ color: '#090e17' }]
  },
  {
    featureType: 'water',
    elementType: 'labels.text.fill',
    stylers: [{ color: '#475569' }]
  }
];

export const GoogleFleetMap: React.FC<GoogleFleetMapProps> = ({
  heightClass = 'h-[540px]',
  showJourneyRoutes = true
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const polylinesRef = useRef<any[]>([]);
  const markersRef = useRef<any[]>([]);

  const {
    candidateRoutes,
    selectedRoute,
    setSelectedRoute,
    selectedVehicle,
    startLocation,
    destinationLocation,
    departureTime
  } = useCityFlow();

  const [mapError, setMapError] = useState<string | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [navCardExpanded, setNavCardExpanded] = useState(true);

  const googleApiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || (typeof window !== 'undefined' ? localStorage.getItem('CITYFLOW_GOOGLE_MAPS_KEY') || '' : '');

  // Initialize Google Maps JavaScript API
  useEffect(() => {
    if (!googleApiKey) {
      setMapError('VITE_GOOGLE_MAPS_API_KEY not configured');
      return;
    }

    let isMounted = true;

    async function initGoogleMap() {
      try {
        setOptions({
          key: googleApiKey,
          v: 'weekly'
        });

        const mapsLib = (await importLibrary('maps')) as any;
        if (!isMounted || !mapContainerRef.current) return;

        const map = new mapsLib.Map(mapContainerRef.current, {
          center: { lat: 28.6139, lng: 77.2090 },
          zoom: 12,
          styles: DARK_FLEET_MAP_STYLES,
          disableDefaultUI: false,
          zoomControl: true,
          mapTypeControl: false,
          streetViewControl: false,
          fullscreenControl: true
        });

        mapInstanceRef.current = map;
        setIsLoaded(true);
        setMapError(null);
      } catch (err: any) {
        console.warn('[GoogleMaps] Initialization notice:', err.message);
        if (isMounted) setMapError(err.message || 'Google Maps failed to load');
      }
    }

    initGoogleMap();

    return () => {
      isMounted = false;
      polylinesRef.current.forEach(p => p.setMap(null));
      markersRef.current.forEach(m => m.setMap(null));
    };
  }, [googleApiKey]);

  // Render Candidate Routes & Synchronize Markers
  useEffect(() => {
    if (!isLoaded || !mapInstanceRef.current || typeof google === 'undefined') return;
    const map = mapInstanceRef.current;

    // Clear old polylines
    polylinesRef.current.forEach(p => p.setMap(null));
    polylinesRef.current = [];

    // Clear old markers
    markersRef.current.forEach(m => m.setMap(null));
    markersRef.current = [];

    if (!candidateRoutes || candidateRoutes.length === 0) return;

    const bounds = new google.maps.LatLngBounds();

    // 1. Draw each candidate route
    candidateRoutes.forEach(route => {
      const isSelected = selectedRoute?.id === route.id;
      const isFailed = route.clearanceStatus === 'failed';

      let pathLatLngs: Array<{ lat: number; lng: number }> = [];
      if ((route as any).realCoordinates && (route as any).realCoordinates.length > 0) {
        pathLatLngs = (route as any).realCoordinates.map((c: [number, number]) => ({
          lat: c[1],
          lng: c[0]
        }));
      } else if (route.pathWaypoints && route.pathWaypoints.length > 0) {
        pathLatLngs = route.pathWaypoints.map((w: any) => ({
          lat: w.lat || (28.6139 + (w.y - 250) * 0.001),
          lng: w.lon || (77.2090 + (w.x - 250) * 0.001)
        }));
      }

      if (pathLatLngs.length === 0) return;

      pathLatLngs.forEach(pt => bounds.extend(pt));

      let strokeColor = '#64748b';
      let strokeWeight = 4;
      let strokeOpacity = 0.7;
      let zIndex = 2;

      if (isFailed) {
        strokeColor = '#ef4444';
        strokeWeight = 3;
        strokeOpacity = 0.85;
        zIndex = 1;
      } else if (isSelected) {
        strokeColor = '#10b981';
        strokeWeight = 6;
        strokeOpacity = 0.95;
        zIndex = 10;
      } else if (route.isRecommended) {
        strokeColor = '#3b82f6';
        strokeWeight = 4;
        strokeOpacity = 0.8;
        zIndex = 5;
      }

      const polyline = new google.maps.Polyline({
        path: pathLatLngs,
        geodesic: true,
        strokeColor,
        strokeOpacity,
        strokeWeight,
        zIndex,
        icons: [{
          icon: {
            path: google.maps.SymbolPath.FORWARD_CLOSED_ARROW,
            scale: isSelected ? 3.5 : 2.5,
            strokeColor: '#ffffff',
            strokeWeight: 1.5,
            fillColor: strokeColor,
            fillOpacity: 1
          },
          offset: '25px',
          repeat: '80px'
        }],
        map
      });

      polyline.addListener('click', () => {
        setSelectedRoute(route);
      });

      polylinesRef.current.push(polyline);
    });

    // 2. Add Origin and Destination Markers
    const primaryRoute = selectedRoute || candidateRoutes[0];
    const waypoints = (primaryRoute as any).realCoordinates || [];
    if (waypoints.length > 1) {
      const originPt = { lat: waypoints[0][1], lng: waypoints[0][0] };
      const destPt = { lat: waypoints[waypoints.length - 1][1], lng: waypoints[waypoints.length - 1][0] };
      const journeyTimes = calculateJourneyTimes(departureTime, primaryRoute.currentEtaMin);

      const originMarker = new google.maps.Marker({
        position: originPt,
        map,
        title: `Pickup Point: ${startLocation}`,
        label: { text: 'A', color: '#ffffff', fontWeight: 'bold' },
        icon: {
          path: google.maps.SymbolPath.CIRCLE,
          scale: 14,
          fillColor: '#166534',
          fillOpacity: 1,
          strokeColor: '#ffffff',
          strokeWeight: 2
        }
      });

      const originInfo = new google.maps.InfoWindow({
        content: `
          <div style="font-family: sans-serif; min-width: 220px; padding: 4px; color: #0f172a;">
            <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 5px; border-bottom: 1px solid #bbf7d0; padding-bottom: 4px;">
              <strong style="color: #166534; font-size: 12px;">PICKUP LOCATION (START)</strong>
              <span style="font-size: 10px; font-weight: bold; background: #dcfce7; color: #166534; padding: 1px 6px; border-radius: 4px;">STOP A</span>
            </div>
            <div style="font-size: 13px; font-weight: bold; margin-bottom: 5px;">${startLocation || 'Delhi Hub'}</div>
            <div style="background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 6px; padding: 5px 8px; margin-bottom: 4px;">
              <span style="font-size: 11px; color: #166534;">🕒 <b>Pickup Time:</b> ${journeyTimes.pickupTime}</span>
            </div>
            <div style="font-size: 10px; color: #64748b;">Journey commences towards ${destinationLocation || 'destination'}</div>
          </div>
        `
      });
      originMarker.addListener('click', () => originInfo.open(map, originMarker));
      markersRef.current.push(originMarker);

      const destMarker = new google.maps.Marker({
        position: destPt,
        map,
        title: `Drop-off Point: ${destinationLocation}`,
        label: { text: 'B', color: '#ffffff', fontWeight: 'bold' },
        icon: {
          path: google.maps.SymbolPath.CIRCLE,
          scale: 14,
          fillColor: '#b91c1c',
          fillOpacity: 1,
          strokeColor: '#ffffff',
          strokeWeight: 2
        }
      });

      const destInfo = new google.maps.InfoWindow({
        content: `
          <div style="font-family: sans-serif; min-width: 220px; padding: 4px; color: #0f172a;">
            <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 5px; border-bottom: 1px solid #fecaca; padding-bottom: 4px;">
              <strong style="color: #b91c1c; font-size: 12px;">DROP-OFF LOCATION (DEST)</strong>
              <span style="font-size: 10px; font-weight: bold; background: #fee2e2; color: #b91c1c; padding: 1px 6px; border-radius: 4px;">STOP B</span>
            </div>
            <div style="font-size: 13px; font-weight: bold; margin-bottom: 5px;">${destinationLocation || 'Greater Noida Hub'}</div>
            <div style="background: #fef2f2; border: 1px solid #fecaca; border-radius: 6px; padding: 5px 8px; margin-bottom: 4px;">
              <span style="font-size: 11px; color: #b91c1c;">🏁 <b>Expected Drop Time:</b> ${journeyTimes.dropoffTime}</span>
            </div>
            <div style="font-size: 10px; color: #64748b;">Estimated Transit: <b>${primaryRoute.currentEtaMin} min</b> (${primaryRoute.distanceKm} km)</div>
          </div>
        `
      });
      destMarker.addListener('click', () => destInfo.open(map, destMarker));
      markersRef.current.push(destMarker);

      // 3. Render physical clearance checkpoint violation marker ONLY if vehicle physically breaches infrastructure
      candidateRoutes.forEach(r => {
        if (r.clearanceStatus === 'failed' && r.clearanceChecks) {
          const failedCheck = r.clearanceChecks.find(c => !c.passed);
          if (failedCheck && (r as any).realCoordinates && (r as any).realCoordinates.length > 2) {
            const midIdx = Math.floor((r as any).realCoordinates.length / 2);
            const breachPt = {
              lat: (r as any).realCoordinates[midIdx][1],
              lng: (r as any).realCoordinates[midIdx][0]
            };

            const breachMarker = new google.maps.Marker({
              position: breachPt,
              map,
              title: `Clearance Breach: ${failedCheck.infrastructureName}`,
              label: { text: '⛔', fontSize: '14px' },
              icon: {
                path: google.maps.SymbolPath.CIRCLE,
                scale: 14,
                fillColor: '#dc2626',
                fillOpacity: 0.95,
                strokeColor: '#ffffff',
                strokeWeight: 2
              }
            });

            const breachInfo = new google.maps.InfoWindow({
              content: `
                <div style="color: #0f172a; font-family: sans-serif; padding: 4px;">
                  <strong style="color: #dc2626; font-size: 12px;">⛔ PHYSICAL CLEARANCE BREACH</strong><br/>
                  <span style="font-size: 11px;">${failedCheck.infrastructureName} (${failedCheck.infrastructureType})</span><br/>
                  <span style="font-size: 11px; color: #b91c1c; font-weight: bold;">${failedCheck.failureReason || 'Exceeds vehicle height limit'}</span>
                </div>
              `
            });
            breachMarker.addListener('click', () => {
              breachInfo.open(map, breachMarker);
            });
            markersRef.current.push(breachMarker);
          }
        }
      });
    }

    // Smoothly fit map to entire route bounds
    if (!bounds.isEmpty()) {
      map.fitBounds(bounds, { top: 60, right: 60, bottom: 60, left: 60 });
    }
  }, [isLoaded, candidateRoutes, selectedRoute, selectedVehicle, startLocation, destinationLocation, departureTime]);

  // If Google Maps API key is not configured or fails to load, gracefully fall back to live OpenStreetMap
  if (mapError || !googleApiKey) {
    return (
      <div className="relative w-full h-full text-left">
        <RealTimeOSMMap heightClass="h-full" showJourneyRoutes={showJourneyRoutes} />
      </div>
    );
  }

  const primaryRoute = selectedRoute || (candidateRoutes && candidateRoutes[0]);
  const journeyTimes = primaryRoute ? calculateJourneyTimes(departureTime, primaryRoute.currentEtaMin) : null;

  return (
    <div className={`relative w-full ${heightClass} bg-[#0f172a] rounded-2xl overflow-hidden border border-slate-800 shadow-lg text-left select-none`}>
      <div className="absolute top-3 left-3 z-20 bg-slate-900/90 backdrop-blur-md px-3.5 py-1.5 rounded-xl border border-slate-700 shadow-md text-xs text-white flex items-center space-x-3">
        <div className="flex items-center space-x-2">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="font-mono font-bold tracking-wide">GOOGLE MAPS PLATFORM</span>
        </div>
        <span className="text-slate-500">|</span>
        <span className="text-slate-300 text-[11px]">Direction Guidance Active</span>
      </div>

      {/* Google Maps Style Journey Navigation & Timing Card */}
      {showJourneyRoutes && primaryRoute && journeyTimes && (
        <div className="absolute top-3 right-3 z-20 w-80 sm:w-96 bg-white/95 backdrop-blur-md rounded-2xl border border-slate-200/90 shadow-2xl overflow-hidden transition-all duration-200 pointer-events-auto">
          {/* Card Header: Duration & Live Traffic Badge */}
          <div className="bg-gradient-to-r from-[#166534] via-[#15803d] to-[#166534] px-4 py-3 text-white flex items-center justify-between shadow-xs">
            <div className="flex items-center space-x-2.5">
              <div className="w-8 h-8 rounded-xl bg-white/15 flex items-center justify-center backdrop-blur-xs border border-white/20 shadow-xs">
                <Navigation2 className="w-4 h-4 text-white fill-white" />
              </div>
              <div>
                <div className="flex items-baseline space-x-2">
                  <span className="text-xl font-black tracking-tight">{primaryRoute.currentEtaMin} min</span>
                  <span className="text-xs font-semibold text-emerald-100">({primaryRoute.distanceKm} km)</span>
                </div>
                <div className="text-[11px] text-emerald-100 font-medium flex items-center space-x-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-300 animate-pulse inline-block"></span>
                  <span>Fastest route · Typical traffic</span>
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setNavCardExpanded(!navCardExpanded)}
              className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white transition flex items-center justify-center cursor-pointer"
              title={navCardExpanded ? "Minimize navigation card" : "Expand navigation card"}
            >
              {navCardExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>
          </div>

          {/* Expanded Journey Details (From -> To & Pick/Drop Timings) */}
          {navCardExpanded && (
            <div className="p-3.5 space-y-3 text-xs bg-white/95">
              {/* Route Path (Pickup & Drop-off Timings) */}
              <div className="relative pl-6 space-y-3 before:absolute before:left-2.5 before:top-2.5 before:bottom-2.5 before:w-0.5 before:bg-slate-200">
                {/* Pickup / Origin */}
                <div className="relative">
                  <span className="absolute -left-6 top-0.5 w-3.5 h-3.5 rounded-full bg-[#166534] border-2 border-white ring-2 ring-emerald-200 flex items-center justify-center">
                    <span className="w-1.5 h-1.5 rounded-full bg-white"></span>
                  </span>
                  <div className="flex items-center justify-between gap-2">
                    <div className="font-bold text-slate-900 text-[12px] truncate max-w-[170px]" title={startLocation || 'Pickup Location'}>
                      {startLocation || 'Delhi Hub'}
                    </div>
                    <div className="shrink-0 font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200 font-mono text-[11px] flex items-center space-x-1">
                      <Clock className="w-3 h-3 text-emerald-600" />
                      <span>Pickup: {journeyTimes.pickupTime}</span>
                    </div>
                  </div>
                  <div className="text-[10px] text-slate-500 font-medium">Origin · Start of Journey</div>
                </div>

                {/* Drop-off / Destination */}
                <div className="relative">
                  <span className="absolute -left-6 top-0.5 w-3.5 h-3.5 rounded-full bg-[#b91c1c] border-2 border-white ring-2 ring-red-200 flex items-center justify-center">
                    <span className="w-1.5 h-1.5 rounded-full bg-white"></span>
                  </span>
                  <div className="flex items-center justify-between gap-2">
                    <div className="font-bold text-slate-900 text-[12px] truncate max-w-[170px]" title={destinationLocation || 'Drop-off Destination'}>
                      {destinationLocation || 'Greater Noida Hub'}
                    </div>
                    <div className="shrink-0 font-bold text-rose-800 bg-rose-50 px-2 py-0.5 rounded-md border border-rose-200 font-mono text-[11px] flex items-center space-x-1">
                      <Clock className="w-3 h-3 text-rose-600" />
                      <span>Drop: {journeyTimes.dropoffTime}</span>
                    </div>
                  </div>
                  <div className="text-[10px] text-slate-500 font-medium">Destination · Expected Arrival</div>
                </div>
              </div>

              {/* Bottom Quick Indicator */}
              <div className="pt-2.5 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-600">
                <span className="font-semibold text-slate-700 truncate max-w-[190px] flex items-center space-x-1">
                  <span>Corridor:</span>
                  <strong className="text-slate-900 truncate">{primaryRoute.name}</strong>
                </span>
                <span className="inline-flex items-center space-x-1 text-emerald-700 font-bold text-[10px] bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-100">
                  <ArrowRight className="w-3 h-3 text-emerald-600" />
                  <span>Direction Arrows Active</span>
                </span>
              </div>
            </div>
          )}
        </div>
      )}

      <div ref={mapContainerRef} className="w-full h-full" />

      <div className="absolute bottom-3 left-3 z-20 bg-slate-900/90 backdrop-blur-md p-2.5 rounded-xl border border-slate-700 shadow-md text-[11px] text-slate-300 flex flex-wrap items-center gap-3 font-mono">
        <div className="flex items-center space-x-2">
          <span className="w-3 h-1 bg-[#10b981] rounded-full inline-block" />
          <span>Active Route</span>
        </div>
        <div className="flex items-center space-x-2">
          <span className="w-3 h-1 bg-[#3b82f6] rounded-full inline-block" />
          <span>Alt Corridor (Clickable)</span>
        </div>
        <div className="flex items-center space-x-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-600 inline-block text-white text-[9px] flex items-center justify-center font-bold">A</span>
          <span>Origin</span>
        </div>
        <div className="flex items-center space-x-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-red-600 inline-block text-white text-[9px] flex items-center justify-center font-bold">B</span>
          <span>Destination</span>
        </div>
        <div className="flex items-center space-x-1.5">
          <span>⛔</span>
          <span>Clearance Breach</span>
        </div>
      </div>
    </div>
  );
};
