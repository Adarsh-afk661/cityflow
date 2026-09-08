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
  Sparkles,
  Info
} from 'lucide-react';
import { useCityFlow } from '../../context/CityFlowContext';
import { RealTimeOSMMap } from './RealTimeOSMMap';

declare const google: any;

interface GoogleFleetMapProps {
  heightClass?: string;
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
  heightClass = 'h-[540px]'
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
    destinationLocation
  } = useCityFlow();

  const [mapError, setMapError] = useState<string | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  const googleApiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || '';

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

      const originMarker = new google.maps.Marker({
        position: originPt,
        map,
        title: `Origin: ${startLocation}`,
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
      markersRef.current.push(originMarker);

      const destMarker = new google.maps.Marker({
        position: destPt,
        map,
        title: `Destination: ${destinationLocation}`,
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
      markersRef.current.push(destMarker);

      // 3. Accident / Collision Hazard Marker (💥)
      const routeA = candidateRoutes.find(r => r.id === 'route-a') || candidateRoutes[0];
      const routeAWaypoints = (routeA as any).realCoordinates || [];
      const incidentIdx = Math.floor(routeAWaypoints.length * 0.38);
      const incidentPt = routeAWaypoints[incidentIdx]
        ? { lat: routeAWaypoints[incidentIdx][1], lng: routeAWaypoints[incidentIdx][0] }
        : { lat: 28.6187, lng: 77.2871 };

      const accidentMarker = new google.maps.Marker({
        position: incidentPt,
        map,
        title: 'Severe Incident: Multi-Vehicle Collision (+18 min delay)',
        label: { text: '💥', fontSize: '18px' },
        icon: {
          path: google.maps.SymbolPath.CIRCLE,
          scale: 16,
          fillColor: '#dc2626',
          fillOpacity: 0.9,
          strokeColor: '#ffffff',
          strokeWeight: 2
        }
      });

      const accidentInfoWindow = new google.maps.InfoWindow({
        content: `
          <div style="color: #0f172a; font-family: sans-serif; padding: 4px;">
            <strong style="color: #dc2626; font-size: 13px;">💥 LIVE ACCIDENT / COLLISION</strong><br/>
            <span style="font-size: 11px;">Expressway A-10 (Km 14.8) · 2 Right Lanes Blocked</span><br/>
            <span style="font-size: 11px; color: #dc2626; font-weight: bold;">+18 min bottleneck queue</span><br/>
            <div style="margin-top: 4px; font-size: 10px; color: #047857; font-weight: bold;">
              RouteShield: Outer Ring Beltway (Route B) bypasses this crash
            </div>
          </div>
        `
      });
      accidentMarker.addListener('click', () => {
        accidentInfoWindow.open(map, accidentMarker);
      });
      markersRef.current.push(accidentMarker);

      // 4. Weather Advisory Hazard Marker (🌧️)
      const weatherIdx = Math.floor(waypoints.length * 0.68);
      const weatherPt = waypoints[weatherIdx]
        ? { lat: waypoints[weatherIdx][1], lng: waypoints[weatherIdx][0] }
        : { lat: 28.6255, lng: 77.3125 };

      const weatherMarker = new google.maps.Marker({
        position: weatherPt,
        map,
        title: 'Weather Alert: Heavy Downpour 14.5 mm/h',
        label: { text: '🌧️', fontSize: '18px' },
        icon: {
          path: google.maps.SymbolPath.CIRCLE,
          scale: 16,
          fillColor: '#0284c7',
          fillOpacity: 0.9,
          strokeColor: '#ffffff',
          strokeWeight: 2
        }
      });

      const weatherInfoWindow = new google.maps.InfoWindow({
        content: `
          <div style="color: #0f172a; font-family: sans-serif; padding: 4px;">
            <strong style="color: #0284c7; font-size: 13px;">🌧️ LIVE WEATHER ADVISORY</strong><br/>
            <span style="font-size: 11px;">Heavy Rain (14.5 mm/h) · Wet Road Surface</span><br/>
            <span style="font-size: 11px; color: #b45309; font-weight: bold;">Braking Distance +35% · Max Speed 45 km/h</span>
          </div>
        `
      });
      weatherMarker.addListener('click', () => {
        weatherInfoWindow.open(map, weatherMarker);
      });
      markersRef.current.push(weatherMarker);

      // 5. Overhead Clearance Underpass Marker (🚧)
      const underpassIdx = Math.floor(routeAWaypoints.length * 0.48);
      const underpassPt = routeAWaypoints[underpassIdx]
        ? { lat: routeAWaypoints[underpassIdx][1], lng: routeAWaypoints[underpassIdx][0] }
        : { lat: 28.6211, lng: 77.2850 };
      const isHeightViolated = selectedVehicle ? selectedVehicle.height > 3.8 : true;

      const underpassMarker = new google.maps.Marker({
        position: underpassPt,
        map,
        title: `Underpass Checkpoint: 3.8m Limit (${isHeightViolated ? 'BARRED' : 'PASSED'})`,
        label: { text: '🚧', fontSize: '16px' },
        icon: {
          path: google.maps.SymbolPath.CIRCLE,
          scale: 15,
          fillColor: isHeightViolated ? '#dc2626' : '#d97706',
          fillOpacity: 0.9,
          strokeColor: '#ffffff',
          strokeWeight: 2
        }
      });

      const underpassInfoWindow = new google.maps.InfoWindow({
        content: `
          <div style="color: #0f172a; font-family: sans-serif; padding: 4px;">
            <strong style="color: ${isHeightViolated ? '#dc2626' : '#d97706'}; font-size: 13px;">🚧 METRO UNDERPASS (3.8m LIMIT)</strong><br/>
            <span style="font-size: 11px;">Vehicle Height: ${selectedVehicle ? selectedVehicle.height : 4.0}m</span><br/>
            <span style="font-size: 11px; font-weight: bold; color: ${isHeightViolated ? '#dc2626' : '#166534'};">
              ${isHeightViolated ? '⛔ Physical Clearance Breach — Route Barred' : '✅ Clearance Approved'}
            </span>
          </div>
        `
      });
      underpassMarker.addListener('click', () => {
        underpassInfoWindow.open(map, underpassMarker);
      });
      markersRef.current.push(underpassMarker);
    }

    // Smoothly fit map to entire route bounds
    if (!bounds.isEmpty()) {
      map.fitBounds(bounds, { top: 60, right: 60, bottom: 60, left: 60 });
    }
  }, [isLoaded, candidateRoutes, selectedRoute, selectedVehicle, startLocation, destinationLocation]);

  // If Google Maps API key is not configured or fails to load, gracefully fall back to live OpenStreetMap
  if (mapError || !googleApiKey) {
    return (
      <div className="relative w-full h-full text-left">
        <RealTimeOSMMap heightClass="h-full" />
      </div>
    );
  }

  return (
    <div className={`relative w-full ${heightClass} bg-[#0f172a] rounded-2xl overflow-hidden border border-slate-800 shadow-lg text-left select-none`}>
      <div className="absolute top-3 left-3 z-20 bg-slate-900/90 backdrop-blur-md px-3.5 py-1.5 rounded-xl border border-slate-700 shadow-md text-xs text-white flex items-center space-x-3">
        <div className="flex items-center space-x-2">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="font-mono font-bold tracking-wide">GOOGLE MAPS PLATFORM</span>
        </div>
        <span className="text-slate-500">|</span>
        <span className="text-slate-300 text-[11px]">Dark Fleet Mode</span>
        {selectedRoute && (
          <>
            <span className="text-slate-500">|</span>
            <span className="text-emerald-400 font-mono font-bold text-[11px]">
              {selectedRoute.distanceKm} km · {selectedRoute.currentEtaMin} min
            </span>
          </>
        )}
      </div>

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
          <span>💥</span>
          <span>Accident</span>
        </div>
        <div className="flex items-center space-x-1.5">
          <span>🌧️</span>
          <span>Weather</span>
        </div>
        <div className="flex items-center space-x-1.5">
          <span>🚧</span>
          <span>Underpass</span>
        </div>
      </div>
    </div>
  );
};
