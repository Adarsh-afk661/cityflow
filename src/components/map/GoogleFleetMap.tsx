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
  Info,
  Key,
  Globe2,
  Crosshair,
  Satellite,
  Car,
  Search,
  Loader2
} from 'lucide-react';
import { useCityFlow } from '../../context/CityFlowContext';
import { searchLocations } from '../../services/universalGeocoder';
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
  const trafficLayerRef = useRef<any>(null);

  const {
    candidateRoutes,
    selectedRoute,
    setSelectedRoute,
    selectedVehicle,
    startLocation,
    destinationLocation,
    setDestinationLocation,
    startCoords,
    destCoords,
    setDestCoords,
    setPointFromMap,
    departureTime,
    googleApiKey,
    setGoogleApiKey,
    runRouteAnalysis
  } = useCityFlow();

  const [mapError, setMapError] = useState<string | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [navCardExpanded, setNavCardExpanded] = useState(true);
  const [showTraffic, setShowTraffic] = useState(true);
  const [mapType, setMapType] = useState<'roadmap' | 'satellite'>('roadmap');

  // Interactive coordinate states
  const [cursorCoords, setCursorCoords] = useState<[number, number] | null>(null);
  const [clickedCoords, setClickedCoords] = useState<[number, number] | null>(null);

  // Map Search Bar states
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<any[]>([]);

  // Key Modal
  const [keyModalOpen, setKeyModalOpen] = useState(false);
  const [inputKey, setInputKey] = useState(googleApiKey || '');

  // Google Map Search & Geocoding Handler
  const handleSearch = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!searchQuery.trim()) return;

    setIsSearching(true);
    try {
      const results = await searchLocations(searchQuery);
      if (results && results.length > 0) {
        setSearchResults(results);
        const top = results[0];
        const newCoords: [number, number] = [top.lat, top.lon];

        if (mapInstanceRef.current) {
          mapInstanceRef.current.panTo({ lat: top.lat, lng: top.lon });
          mapInstanceRef.current.setZoom(14);
        }

        // Set destination and calculate all routes connecting origin to this point
        setDestinationLocation(top.display_name);
        setDestCoords(newCoords);
        runRouteAnalysis(startLocation, top.display_name, startCoords || undefined, newCoords);
      }
    } catch (err) {
      console.warn('Google Map search error:', err);
    } finally {
      setIsSearching(false);
    }
  };

  const handleSelectResult = (item: any) => {
    const lat = typeof item.lat === 'string' ? parseFloat(item.lat) : item.lat;
    const lon = typeof item.lon === 'string' ? parseFloat(item.lon) : item.lon;
    if (!isNaN(lat) && !isNaN(lon)) {
      const coords: [number, number] = [lat, lon];
      setSearchResults([]);
      setSearchQuery(item.display_name.split(',')[0]);
      if (mapInstanceRef.current) {
        mapInstanceRef.current.panTo({ lat, lng: lon });
        mapInstanceRef.current.setZoom(14);
      }
      setDestinationLocation(item.display_name);
      setDestCoords(coords);
      runRouteAnalysis(startLocation, item.display_name, startCoords || undefined, coords);
    }
  };

  // Initialize Google Maps JavaScript API
  useEffect(() => {
    if (!googleApiKey) {
      setMapError('Google Maps API key not provided');
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

        const defaultCenter = startCoords ? { lat: startCoords[0], lng: startCoords[1] } : { lat: 28.6328, lng: 77.2197 };

        const map = new mapsLib.Map(mapContainerRef.current, {
          center: defaultCenter,
          zoom: 12,
          styles: mapType === 'roadmap' ? DARK_FLEET_MAP_STYLES : [],
          mapTypeId: mapType === 'roadmap' ? 'roadmap' : 'satellite',
          disableDefaultUI: false,
          zoomControl: true,
          mapTypeControl: false,
          streetViewControl: false,
          fullscreenControl: true
        });

        // Add Traffic Layer
        trafficLayerRef.current = new google.maps.TrafficLayer();
        if (showTraffic) {
          trafficLayerRef.current.setMap(map);
        }

        // Add mousemove coordinates listener
        map.addListener('mousemove', (e: any) => {
          if (e.latLng) {
            setCursorCoords([+e.latLng.lat().toFixed(4), +e.latLng.lng().toFixed(4)]);
          }
        });

        // Add click listener for coordinate selection
        map.addListener('click', (e: any) => {
          if (e.latLng) {
            setClickedCoords([+e.latLng.lat().toFixed(5), +e.latLng.lng().toFixed(5)]);
          }
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
  }, [googleApiKey, mapType]);

  // Toggle traffic layer
  useEffect(() => {
    if (trafficLayerRef.current && mapInstanceRef.current) {
      trafficLayerRef.current.setMap(showTraffic ? mapInstanceRef.current : null);
    }
  }, [showTraffic, isLoaded]);

  // Auto-resize observer to seamlessly handle map container expansion/fullscreen
  useEffect(() => {
    if (!mapContainerRef.current || !mapInstanceRef.current || typeof google === 'undefined') return;
    const observer = new ResizeObserver(() => {
      if (mapInstanceRef.current) {
        google.maps.event.trigger(mapInstanceRef.current, 'resize');
      }
    });
    observer.observe(mapContainerRef.current);
    return () => observer.disconnect();
  }, [isLoaded]);

  // Render Candidate Routes & Synchronize Draggable Markers
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

    // 1. Draw each candidate route (ALL corridors rendered simultaneously, none skipped)
    candidateRoutes.forEach((route, idx) => {
      const isSelected = selectedRoute?.id === route.id;
      const isFailed = route.clearanceStatus === 'failed';
      const isOptimal = route.isRecommended;

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

      let strokeColor = '#3b82f6';
      if (isFailed) {
        strokeColor = isSelected ? '#b91c1c' : '#ef4444';
      } else if (isOptimal) {
        strokeColor = isSelected ? '#15803d' : '#16a34a';
      } else if (route.id === 'route-a' || route.name.toLowerCase().includes('route a')) {
        strokeColor = isSelected ? '#c2410c' : '#ea580c';
      } else if (route.id === 'route-b' || route.name.toLowerCase().includes('route b')) {
        strokeColor = isSelected ? '#1d4ed8' : '#2563eb';
      } else {
        strokeColor = isSelected ? '#0f766e' : '#0d9488';
      }

      const zIndex = isSelected ? 25 : isOptimal ? 18 : (10 - idx);
      const strokeWeight = isSelected ? 6.5 : isOptimal ? 5.5 : 4.5;
      const strokeOpacity = isSelected ? 1.0 : isOptimal ? 0.95 : 0.8;

      // Outer glow for optimal corridor
      if (isOptimal) {
        const haloPolyline = new google.maps.Polyline({
          path: pathLatLngs,
          geodesic: true,
          strokeColor: '#4ade80',
          strokeOpacity: 0.35,
          strokeWeight: 14,
          zIndex: zIndex - 1,
          map
        });
        polylinesRef.current.push(haloPolyline);
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
          offset: '30px',
          repeat: '85px'
        }],
        map
      });

      polyline.addListener('click', () => {
        setSelectedRoute(route);
      });

      polylinesRef.current.push(polyline);

      // Midpoint Interactive Label Marker on Google Map
      const midIdx = Math.floor(pathLatLngs.length * Math.min(0.75, 0.32 + idx * 0.20));
      const midPos = pathLatLngs[midIdx];
      if (midPos) {
        const pillText = `${isOptimal ? '★ ' : ''}${route.name.split('—')[0].trim()} · ${route.currentEtaMin}m`;
        const midMarker = new google.maps.Marker({
          position: midPos,
          map,
          title: `${route.name}: ${route.currentEtaMin} min ETA (Click to select)`,
          label: {
            text: pillText,
            color: '#ffffff',
            fontSize: '10px',
            fontWeight: 'bold'
          },
          icon: {
            path: 'M -55 -12 L 55 -12 A 12 12 0 0 1 55 12 L -55 12 A 12 12 0 0 1 -55 -12 Z',
            fillColor: isOptimal ? '#166534' : isFailed ? '#991b1b' : strokeColor,
            fillOpacity: 1,
            strokeColor: isOptimal ? '#86efac' : '#ffffff',
            strokeWeight: 2,
            scale: 1
          },
          zIndex: isSelected ? 35 : isOptimal ? 28 : 15
        });

        midMarker.addListener('click', () => {
          setSelectedRoute(route);
        });

        markersRef.current.push(midMarker);
      }
    });

    // 2. Add Draggable Origin (A) and Destination (B) Markers
    const primaryRoute = selectedRoute || candidateRoutes[0];
    const waypoints = (primaryRoute as any).realCoordinates || [];

    const originPt = startCoords
      ? { lat: startCoords[0], lng: startCoords[1] }
      : waypoints.length > 0
      ? { lat: waypoints[0][1], lng: waypoints[0][0] }
      : { lat: 28.6328, lng: 77.2197 };

    const destPt = destCoords
      ? { lat: destCoords[0], lng: destCoords[1] }
      : waypoints.length > 1
      ? { lat: waypoints[waypoints.length - 1][1], lng: waypoints[waypoints.length - 1][0] }
      : { lat: 28.4744, lng: 77.5040 };

    bounds.extend(originPt);
    bounds.extend(destPt);

    const pinTimes = calculateJourneyTimes(departureTime, primaryRoute.currentEtaMin);

    // Draggable Origin Marker (A)
    const originMarker = new google.maps.Marker({
      position: originPt,
      map,
      draggable: true,
      title: `Origin: ${startLocation} (Drag anywhere on map to reposition)`,
      icon: {
        path: google.maps.SymbolPath.CIRCLE,
        scale: 14,
        fillColor: '#166534',
        fillOpacity: 1,
        strokeColor: '#ffffff',
        strokeWeight: 3
      },
      label: {
        text: 'A',
        color: '#ffffff',
        fontWeight: 'bold',
        fontSize: '12px'
      }
    });

    const originInfo = new google.maps.InfoWindow({
      content: `
        <div style="font-family: inherit; min-width: 210px; padding: 4px; color: #0f172a;">
          <div style="font-weight: 800; color: #166534; font-size: 12px; margin-bottom: 3px;">📍 ORIGIN / PICKUP (STOP A)</div>
          <div style="font-size: 13px; font-weight: 700; margin-bottom: 4px;">${startLocation || 'Origin'}</div>
          <div style="font-size: 11px; color: #475569; margin-bottom: 2px;">⏰ Pickup: <b>${pinTimes.pickupTime}</b></div>
          <div style="font-size: 10px; color: #64748b; font-family: monospace;">GPS: ${originPt.lat.toFixed(4)}, ${originPt.lng.toFixed(4)}</div>
          <div style="font-size: 10px; color: #047857; margin-top: 4px; font-weight: 600;">✨ Drag marker to reposition origin</div>
        </div>
      `
    });

    originMarker.addListener('click', () => {
      originInfo.open(map, originMarker);
    });

    originMarker.addListener('dragend', (e: any) => {
      if (e.latLng) {
        const newLat = +e.latLng.lat().toFixed(5);
        const newLng = +e.latLng.lng().toFixed(5);
        setPointFromMap('start', [newLat, newLng]);
      }
    });

    markersRef.current.push(originMarker);

    // Draggable Destination Marker (B)
    const destMarker = new google.maps.Marker({
      position: destPt,
      map,
      draggable: true,
      title: `Destination: ${destinationLocation} (Drag anywhere on map to reposition)`,
      icon: {
        path: google.maps.SymbolPath.CIRCLE,
        scale: 14,
        fillColor: '#b91c1c',
        fillOpacity: 1,
        strokeColor: '#ffffff',
        strokeWeight: 3
      },
      label: {
        text: 'B',
        color: '#ffffff',
        fontWeight: 'bold',
        fontSize: '12px'
      }
    });

    const destInfo = new google.maps.InfoWindow({
      content: `
        <div style="font-family: inherit; min-width: 210px; padding: 4px; color: #0f172a;">
          <div style="font-weight: 800; color: #b91c1c; font-size: 12px; margin-bottom: 3px;">🏁 DESTINATION / DROP-OFF (STOP B)</div>
          <div style="font-size: 13px; font-weight: 700; margin-bottom: 4px;">${destinationLocation || 'Destination'}</div>
          <div style="font-size: 11px; color: #475569; margin-bottom: 2px;">🏁 Drop: <b>${pinTimes.dropoffTime}</b></div>
          <div style="font-size: 10px; color: #64748b; font-family: monospace;">GPS: ${destPt.lat.toFixed(4)}, ${destPt.lng.toFixed(4)}</div>
          <div style="font-size: 10px; color: #b91c1c; margin-top: 4px; font-weight: 600;">✨ Drag marker to reposition destination</div>
        </div>
      `
    });

    destMarker.addListener('click', () => {
      destInfo.open(map, destMarker);
    });

    destMarker.addListener('dragend', (e: any) => {
      if (e.latLng) {
        const newLat = +e.latLng.lat().toFixed(5);
        const newLng = +e.latLng.lng().toFixed(5);
        setPointFromMap('dest', [newLat, newLng]);
      }
    });

    markersRef.current.push(destMarker);

    // Smoothly fit map to bounds
    if (!bounds.isEmpty()) {
      map.fitBounds(bounds, { top: 70, right: 70, bottom: 70, left: 70 });
    }
  }, [isLoaded, candidateRoutes, selectedRoute, selectedVehicle, startLocation, destinationLocation, startCoords, destCoords, departureTime]);

  const handleSaveKey = () => {
    if (inputKey.trim()) {
      setGoogleApiKey(inputKey.trim());
      setKeyModalOpen(false);
      setMapError(null);
    }
  };

  // If Google Maps API key is not configured, show dual-action container with OpenStreetMap
  if (mapError || !googleApiKey) {
    return (
      <div className={`relative w-full ${heightClass} bg-slate-900 rounded-2xl overflow-hidden border border-slate-800 shadow-md text-left`}>
        {/* Google Maps Setup Bar */}
        <div className="bg-slate-900 text-white px-4 py-2.5 flex flex-wrap items-center justify-between gap-2 border-b border-slate-800 z-30 relative">
          <div className="flex items-center space-x-2">
            <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping inline-block" />
            <span className="text-xs font-bold text-slate-200">Google Maps Platform API Ready</span>
            <span className="text-[11px] text-slate-400 hidden sm:inline">— Paste your key for satellite, 3D and traffic vector rendering</span>
          </div>
          <div className="flex items-center space-x-2">
            <input
              type="text"
              value={inputKey}
              onChange={e => setInputKey(e.target.value)}
              placeholder="Paste Google Maps API Key..."
              className="bg-slate-800 border border-slate-700 rounded-lg px-2.5 py-1 text-xs text-white placeholder:text-slate-500 font-mono focus:outline-none focus:border-emerald-500 w-44 sm:w-60"
            />
            <button
              type="button"
              onClick={handleSaveKey}
              className="px-3 py-1 bg-[#166534] hover:bg-[#14532d] text-white text-xs font-bold rounded-lg transition cursor-pointer"
            >
              Activate
            </button>
          </div>
        </div>

        {/* Fallback to interactive OpenStreetMap */}
        <div className="w-full h-[calc(100%-42px)]">
          <RealTimeOSMMap heightClass="h-full" showJourneyRoutes={showJourneyRoutes} />
        </div>
      </div>
    );
  }

  const primaryRoute = selectedRoute || (candidateRoutes && candidateRoutes[0]);
  const journeyTimes = primaryRoute ? calculateJourneyTimes(departureTime, primaryRoute.currentEtaMin) : null;

  return (
    <div className={`relative w-full ${heightClass} bg-[#0f172a] rounded-2xl overflow-hidden border border-slate-800 shadow-lg text-left select-none`}>
      {/* Top Header Controls Bar */}
      <div className="absolute top-3 left-3 z-20 flex flex-col gap-2 max-w-[calc(100%-80px)] sm:max-w-none pointer-events-auto">
        <div className="flex flex-wrap items-center gap-2">
          {/* Floating Search Input */}
          <form onSubmit={handleSearch} className="relative flex items-center shadow-md rounded-xl w-60 sm:w-72">
            <input
              type="text"
              value={searchQuery}
              onChange={e => {
                setSearchQuery(e.target.value);
                if (e.target.value.trim().length >= 2) {
                  searchLocations(e.target.value).then(setSearchResults);
                } else {
                  setSearchResults([]);
                }
              }}
              placeholder="Search destination to route..."
              className="w-full bg-slate-900/95 text-white backdrop-blur-md border border-slate-700 rounded-xl pl-8 pr-16 py-1.5 text-xs placeholder:text-slate-400 focus:outline-none focus:border-emerald-500 font-medium"
            />
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 pointer-events-none" />
            <button
              type="submit"
              disabled={isSearching}
              className="absolute right-1 px-2.5 py-1 rounded-lg bg-[#166534] hover:bg-[#14532d] text-white text-[11px] font-bold transition flex items-center space-x-1 cursor-pointer"
            >
              {isSearching ? <Loader2 className="w-3 h-3 animate-spin" /> : <span>Search</span>}
            </button>
          </form>

          {/* Live Traffic Toggle */}
          <button
            type="button"
            onClick={() => setShowTraffic(!showTraffic)}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center space-x-1.5 shadow-md cursor-pointer ${
              showTraffic
                ? 'bg-emerald-600/90 text-white border border-emerald-400'
                : 'bg-slate-900/90 text-slate-300 border border-slate-700 hover:text-white'
            }`}
            title="Toggle Google Maps live traffic congestion layer"
          >
            <Car className="w-3.5 h-3.5 text-emerald-200" />
            <span>Traffic {showTraffic ? 'LIVE' : 'OFF'}</span>
          </button>

          {/* Satellite / Roadmap Switcher */}
          <button
            type="button"
            onClick={() => setMapType(mapType === 'roadmap' ? 'satellite' : 'roadmap')}
            className="bg-slate-900/90 hover:bg-slate-800 text-slate-200 px-3 py-1.5 rounded-xl border border-slate-700 shadow-md text-xs font-bold transition flex items-center space-x-1.5 cursor-pointer"
          >
            <Satellite className="w-3.5 h-3.5 text-blue-400" />
            <span className="hidden sm:inline">{mapType === 'roadmap' ? 'Satellite' : 'Dark Fleet'}</span>
          </button>

          {/* API Key Modal Opener */}
          <button
            type="button"
            onClick={() => setKeyModalOpen(true)}
            className="bg-slate-900/90 hover:bg-slate-800 text-slate-300 hover:text-white p-1.5 rounded-xl border border-slate-700 shadow-md transition cursor-pointer"
            title="Configure Google Maps API Key"
          >
            <Key className="w-3.5 h-3.5 text-amber-400" />
          </button>
        </div>

        {/* Search Results Dropdown */}
        {searchResults.length > 0 && (
          <div className="bg-slate-900/95 border border-slate-700 rounded-xl shadow-2xl overflow-hidden text-xs max-h-48 overflow-y-auto w-60 sm:w-80 backdrop-blur-md divide-y divide-slate-800">
            {searchResults.map((item, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleSelectResult(item)}
                className="w-full text-left px-3 py-2 hover:bg-slate-800 border-b border-slate-800 last:border-0 flex items-start space-x-2 text-slate-200 cursor-pointer"
              >
                <MapPin className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                <div className="truncate">
                  <div className="font-bold text-white truncate">{item.display_name}</div>
                  <div className="text-[10px] text-slate-400 flex items-center space-x-1">
                    <span>{item.area}</span>
                    <span>·</span>
                    <span className="font-mono text-emerald-400">{item.lat.toFixed(4)}, {item.lon.toFixed(4)}</span>
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Floating Clicked Coordinates Card (Set Origin / Destination) */}
      {clickedCoords && (
        <div className="absolute top-16 left-3 z-30 bg-slate-900/95 backdrop-blur-md p-3 rounded-2xl border border-emerald-500 shadow-2xl text-white space-y-2 animate-in fade-in zoom-in-95 duration-150">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center space-x-1.5 text-emerald-400 font-bold text-xs">
              <Crosshair className="w-3.5 h-3.5" />
              <span>Map Point Selected</span>
            </div>
            <button
              type="button"
              onClick={() => setClickedCoords(null)}
              className="text-slate-400 hover:text-white text-xs cursor-pointer"
            >
              ✕
            </button>
          </div>
          <div className="font-mono text-xs text-slate-200 bg-slate-800 px-2 py-1 rounded-md">
            Lat: {clickedCoords[0]}°, Lng: {clickedCoords[1]}°
          </div>
          <div className="flex items-center space-x-2 pt-1">
            <button
              type="button"
              onClick={() => {
                setPointFromMap('start', clickedCoords);
                setClickedCoords(null);
              }}
              className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-bold transition flex items-center space-x-1 cursor-pointer"
            >
              <span>Set as Origin (A)</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setPointFromMap('dest', clickedCoords);
                setClickedCoords(null);
              }}
              className="px-2.5 py-1 bg-rose-600 hover:bg-rose-500 text-white rounded-lg text-xs font-bold transition flex items-center space-x-1 cursor-pointer"
            >
              <span>Set as Dest (B)</span>
            </button>
          </div>
        </div>
      )}

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

          {/* Expanded Journey Details */}
          {navCardExpanded && (
            <div className="p-3.5 space-y-3 text-xs bg-white/95">
              <div className="relative pl-6 space-y-3 before:absolute before:left-2.5 before:top-2.5 before:bottom-2.5 before:w-0.5 before:bg-slate-200">
                {/* Pickup / Origin */}
                <div className="relative">
                  <span className="absolute -left-6 top-0.5 w-3.5 h-3.5 rounded-full bg-[#166534] border-2 border-white ring-2 ring-emerald-200 flex items-center justify-center">
                    <span className="w-1.5 h-1.5 rounded-full bg-white"></span>
                  </span>
                  <div className="flex items-center justify-between gap-2">
                    <div className="font-bold text-slate-900 text-[12px] truncate max-w-[170px]" title={startLocation}>
                      {startLocation || 'Pickup'}
                    </div>
                    <div className="shrink-0 font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200 font-mono text-[11px] flex items-center space-x-1">
                      <Clock className="w-3 h-3 text-emerald-600" />
                      <span>Pickup: {journeyTimes.pickupTime}</span>
                    </div>
                  </div>
                  <div className="text-[10px] text-slate-500 font-medium">Origin · Stop A (Drag pin to move)</div>
                </div>

                {/* Drop-off / Destination */}
                <div className="relative">
                  <span className="absolute -left-6 top-0.5 w-3.5 h-3.5 rounded-full bg-[#b91c1c] border-2 border-white ring-2 ring-red-200 flex items-center justify-center">
                    <span className="w-1.5 h-1.5 rounded-full bg-white"></span>
                  </span>
                  <div className="flex items-center justify-between gap-2">
                    <div className="font-bold text-slate-900 text-[12px] truncate max-w-[170px]" title={destinationLocation}>
                      {destinationLocation || 'Destination'}
                    </div>
                    <div className="shrink-0 font-bold text-rose-800 bg-rose-50 px-2 py-0.5 rounded-md border border-rose-200 font-mono text-[11px] flex items-center space-x-1">
                      <Clock className="w-3 h-3 text-rose-600" />
                      <span>Drop: {journeyTimes.dropoffTime}</span>
                    </div>
                  </div>
                  <div className="text-[10px] text-slate-500 font-medium">Destination · Stop B (Drag pin to move)</div>
                </div>
              </div>

              {/* All Corridors Quick Switcher (No Routes Skipped) */}
              {candidateRoutes && candidateRoutes.length > 1 && (
                <div className="pt-2 border-t border-slate-100">
                  <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5 flex items-center justify-between">
                    <span>All Corridors ({candidateRoutes.length})</span>
                    <span className="text-[#166534] font-mono font-extrabold text-[9px] bg-emerald-50 px-1.5 py-0.2 rounded border border-emerald-200">NO ROUTES SKIPPED</span>
                  </div>
                  <div className="grid grid-cols-3 gap-1.5">
                    {candidateRoutes.map((r, idx) => {
                      const isSel = (selectedRoute?.id === r.id) || (!selectedRoute && idx === 0);
                      const isOpt = r.isRecommended;
                      const isBar = r.clearanceStatus === 'failed';
                      return (
                        <button
                          key={r.id}
                          type="button"
                          onClick={() => setSelectedRoute(r)}
                          className={`p-1.5 rounded-lg border text-left transition cursor-pointer flex flex-col justify-between ${
                            isSel
                              ? 'bg-slate-900 border-slate-900 text-white shadow-xs'
                              : 'bg-slate-50 hover:bg-emerald-50 border-slate-200 text-slate-700'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-[10.5px]">{r.name.split('—')[0].trim()}</span>
                            {isOpt && <span className="text-[7.5px] bg-emerald-400 text-slate-950 font-black px-1 rounded uppercase">★ OPT</span>}
                          </div>
                          <div className="text-[9.5px] font-mono mt-0.5 flex items-center justify-between">
                            <span>{r.currentEtaMin}m</span>
                            {isBar ? <span className="text-rose-400 font-bold text-[8.5px]">BARRED</span> : <span className="text-emerald-500 text-[8.5px]">SAFE</span>}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

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

      {/* Map Canvas Container */}
      <div ref={mapContainerRef} className="w-full h-full" />

      {/* Bottom Coordinates & Legend Bar */}
      <div className="absolute bottom-3 left-3 right-3 z-20 flex flex-wrap items-center justify-between gap-2 pointer-events-none">
        <div className="bg-slate-900/90 backdrop-blur-md p-2.5 rounded-xl border border-slate-700 shadow-md text-[11px] text-slate-300 flex flex-wrap items-center gap-3 font-mono pointer-events-auto">
          <div className="flex items-center space-x-1.5">
            <span className="w-3 h-1 bg-[#10b981] rounded-full inline-block" />
            <span>Active Corridor</span>
          </div>
          <div className="flex items-center space-x-1.5">
            <span className="w-3 h-1 bg-[#3b82f6] rounded-full inline-block" />
            <span>Alt Corridor</span>
          </div>
          <div className="flex items-center space-x-1">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-600 inline-block text-white text-[9px] flex items-center justify-center font-bold">A</span>
            <span>Origin</span>
          </div>
          <div className="flex items-center space-x-1">
            <span className="w-2.5 h-2.5 rounded-full bg-red-600 inline-block text-white text-[9px] flex items-center justify-center font-bold">B</span>
            <span>Dest</span>
          </div>
          {cursorCoords && (
            <div className="text-emerald-400 pl-2 border-l border-slate-700 font-mono">
              📍 Cursor: {cursorCoords[0]}° N, {cursorCoords[1]}° E
            </div>
          )}
        </div>

        <div className="bg-slate-900/90 backdrop-blur-md px-3 py-1.5 rounded-xl border border-slate-700 shadow-md text-[11px] text-slate-300 font-mono pointer-events-auto">
          💡 <em>Click anywhere on map to set Pin A/B or drag markers</em>
        </div>
      </div>

      {/* API Key Modal */}
      {keyModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl border border-slate-200 text-left space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Key className="w-5 h-5 text-emerald-700" />
                <h3 className="text-base font-bold text-slate-900">Configure Google Maps API Key</h3>
              </div>
              <button
                type="button"
                onClick={() => setKeyModalOpen(false)}
                className="text-slate-400 hover:text-slate-700 text-sm font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>
            <p className="text-xs text-slate-600">
              Enter your Google Maps JavaScript API key below to activate Google Maps Vector tiles, Live Traffic layers, Satellite view, and Google directions.
            </p>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Google Maps API Key</label>
              <input
                type="text"
                value={inputKey}
                onChange={e => setInputKey(e.target.value)}
                placeholder="AIzaSy..."
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-mono text-slate-900 focus:outline-none focus:border-emerald-600"
              />
            </div>
            <div className="flex items-center justify-end space-x-2 pt-2">
              <button
                type="button"
                onClick={() => setKeyModalOpen(false)}
                className="px-3 py-1.5 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 transition"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveKey}
                className="px-4 py-1.5 rounded-xl text-xs font-bold bg-[#166534] hover:bg-[#14532d] text-white transition shadow-sm"
              >
                Save & Activate
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
