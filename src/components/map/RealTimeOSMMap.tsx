import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import {
  Search,
  Loader2,
  Navigation,
  Navigation2,
  MapPin,
  Clock,
  ArrowRight,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { useCityFlow } from '../../context/CityFlowContext';
import { CandidateRoute } from '../../types';
import { searchLocations } from '../../services/universalGeocoder';

// Helper to calculate geographic bearing angle (0-360 degrees) between two points
const getBearingAngle = (p1: [number, number], p2: [number, number]): number => {
  const lat1 = (p1[0] * Math.PI) / 180;
  const lon1 = (p1[1] * Math.PI) / 180;
  const lat2 = (p2[0] * Math.PI) / 180;
  const lon2 = (p2[1] * Math.PI) / 180;
  const dLon = lon2 - lon1;
  const y = Math.sin(dLon) * Math.cos(lat2);
  const x = Math.cos(lat1) * Math.sin(lat2) - Math.sin(lat1) * Math.cos(lat2) * Math.cos(dLon);
  const brng = (Math.atan2(y, x) * 180) / Math.PI;
  return (brng + 360) % 360;
};

// Helper to compute realistic Pickup and Drop-off times from departure settings & ETA
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

interface RealTimeOSMMapProps {
  heightClass?: string;
  showJourneyRoutes?: boolean;
}

export const RealTimeOSMMap: React.FC<RealTimeOSMMapProps> = ({
  heightClass = 'h-[520px]',
  showJourneyRoutes = true
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const routesLayerGroupRef = useRef<L.LayerGroup | null>(null);
  const markersGroupRef = useRef<L.LayerGroup | null>(null);

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
    fleet,
    cityZones,
    runRouteAnalysis
  } = useCityFlow();

  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [routeInfo, setRouteInfo] = useState<{
    distanceKm: number;
    durationMin: number;
    name: string;
    pickupTime: string;
    dropoffTime: string;
  } | null>(null);
  const [navCardExpanded, setNavCardExpanded] = useState(true);
  const [showTraffic, setShowTraffic] = useState(true);

  // Interactive coordinate states
  const [cursorCoords, setCursorCoords] = useState<[number, number] | null>(null);
  const [clickedCoords, setClickedCoords] = useState<[number, number] | null>(null);

  // Auto-resize observer to seamlessly handle map container expansion/fullscreen
  useEffect(() => {
    if (!mapContainerRef.current) return;
    const observer = new ResizeObserver(() => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.invalidateSize();
      }
    });
    observer.observe(mapContainerRef.current);
    return () => observer.disconnect();
  }, []);

  // Initialize Leaflet map instance once
  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (!mapInstanceRef.current) {
      const defaultCenter: [number, number] = startCoords ? [startCoords[0], startCoords[1]] : [28.6250, 77.2950];
      const map = L.map(mapContainerRef.current, {
        center: defaultCenter,
        zoom: 12,
        zoomControl: false
      });

      // Crisp OpenStreetMap standard clean tiles
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        subdomains: ['a', 'b', 'c'],
        maxZoom: 19
      }).addTo(map);

      // Add zoom control in bottom right
      L.control.zoom({ position: 'bottomright' }).addTo(map);

      // Track cursor position in real-time
      map.on('mousemove', (e: L.LeafletMouseEvent) => {
        setCursorCoords([+e.latlng.lat.toFixed(4), +e.latlng.lng.toFixed(4)]);
      });

      // Handle map clicks to drop pin and select coordinates
      map.on('click', (e: L.LeafletMouseEvent) => {
        setClickedCoords([+e.latlng.lat.toFixed(5), +e.latlng.lng.toFixed(5)]);
      });

      // Create separate layer groups for clean batch updates
      routesLayerGroupRef.current = L.layerGroup().addTo(map);
      markersGroupRef.current = L.layerGroup().addTo(map);

      mapInstanceRef.current = map;
    }

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // Map rendering effect: handles both Command Center Digital Twin Mode & RouteShield Journey Mode
  useEffect(() => {
    if (!mapInstanceRef.current || !routesLayerGroupRef.current || !markersGroupRef.current) return;

    const routesGroup = routesLayerGroupRef.current;
    const markersGroup = markersGroupRef.current;

    // Clear previous vector layers and markers cleanly
    routesGroup.clearLayers();
    markersGroup.clearLayers();

    const bounds = L.latLngBounds([]);

    // =========================================================================
    // CASE A: DASHBOARD MODE (showJourneyRoutes === false)
    // Display Metropolitan Mobility Digital Twin: Active fleet units, city zones,
    // and live regional traffic incidents WITHOUT arbitrary journey route lines.
    // =========================================================================
    if (!showJourneyRoutes) {
      // 1. Render City Traffic Pressure Zones
      if (cityZones && cityZones.length > 0) {
        cityZones.forEach(zone => {
          // Approximate Delhi-NCR coordinates for zones
          const centerLat = 28.6139 + (zone.center.y - 300) * 0.0007;
          const centerLon = 77.2400 + (zone.center.x - 450) * 0.0007;

          const zoneColor =
            zone.status === 'severe'
              ? '#ef4444'
              : zone.status === 'heavy'
              ? '#f59e0b'
              : zone.status === 'moderate'
              ? '#3b82f6'
              : '#10b981';

          const circle = L.circle([centerLat, centerLon], {
            radius: 1800,
            color: zoneColor,
            fillColor: zoneColor,
            fillOpacity: 0.14,
            weight: 1.5
          }).addTo(routesGroup);

          circle.bindPopup(`
            <div style="font-family: inherit; min-width: 170px; padding: 2px;">
              <strong style="color: ${zoneColor}; font-size: 12.5px;">${zone.name}</strong><br/>
              <div style="font-size: 11px; color: #334155; margin-top: 3px;">
                <span>Pressure Score: <b>${zone.pressureScore}/100</b></span><br/>
                <span>Flow Status: <b style="text-transform: uppercase;">${zone.status}</b></span><br/>
                <span>Average Speed: <b>${zone.avgSpeedKmh} km/h</b></span><br/>
                <span>Active Incidents: <b>${zone.activeIncidents}</b></span>
              </div>
            </div>
          `);

          bounds.extend([centerLat, centerLon]);
        });
      }

      // 2. Render Active Commercial Fleet Vehicles — GPS NOT CONNECTED
      // Fleet positions shown as last-known static markers with clear "NOT LIVE" label.
      // No telematics provider connected — do not fake GPS coordinates.
      if (fleet && fleet.length > 0) {
        fleet.forEach(veh => {
          // Only render vehicles that have meaningful last-known coordinates
          if (!veh.coordinates || (veh.coordinates.x === 0 && veh.coordinates.y === 0)) return;

          // Convert canvas grid coords to approximate Delhi-NCR lat/lon (last known position only)
          const vehLat = 28.6139 + (veh.coordinates.y - 300) * 0.00065;
          const vehLon = 77.2500 + (veh.coordinates.x - 450) * 0.00065;

          const isDelayed = veh.status === 'delayed';
          const isIdling = veh.status === 'idling' || veh.status === 'maintenance';
          const badgeBg = isDelayed ? '#ef4444' : isIdling ? '#6b7280' : '#166534';

          const fleetIcon = L.divIcon({
            className: 'fleet-vehicle-icon',
            html: `
              <div style="
                background: ${badgeBg};
                color: #ffffff;
                padding: 2px 7px;
                border-radius: 6px;
                font-family: inherit;
                font-size: 10px;
                font-weight: 700;
                box-shadow: 0 2px 6px rgba(0,0,0,0.3);
                border: 1.5px solid #ffffff;
                display: flex;
                align-items: center;
                gap: 4px;
                white-space: nowrap;
                cursor: pointer;
              ">
                <span>${veh.type === 'truck' ? '🚚' : veh.type === 'bus' ? '🚌' : '🚐'}</span>
                <span>${veh.id}</span>
                <span style="opacity: 0.9; font-size: 8.5px; font-weight: 700; color: #bbf7d0;">${veh.speedKmh} km/h</span>
              </div>
            `,
            iconSize: [95, 22],
            iconAnchor: [47, 11]
          });

          L.marker([vehLat, vehLon], { icon: fleetIcon })
            .bindPopup(`
              <div style="font-family: inherit; min-width: 210px; padding: 2px;">
                <div style="display: flex; align-items: center; gap: 5px; margin-bottom: 4px;">
                  <span style="font-size: 14px;">${veh.type === 'truck' ? '🚚' : '🚌'}</span>
                  <strong style="color: ${badgeBg}; font-size: 12px;">Fleet Unit ${veh.id}</strong>
                </div>
                <div style="font-size: 11px; color: #334155; line-height: 1.5;">
                  <div>Driver: <b>${veh.driver}</b></div>
                  <div>Assigned Route: <b>${veh.currentRouteName || '—'}</b></div>
                  <div>Destination: <b>${veh.destination}</b></div>
                  <div>Status: <b style="color: ${badgeBg}; text-transform: uppercase;">${veh.status} · ${veh.speedKmh} km/h</b></div>
                  <div style="margin-top: 6px; padding: 4px 8px; background: #ecfdf5; border-radius: 4px; font-size: 10px; color: #166534; font-weight: 600; display: flex; align-items: center; gap: 4px;">
                    <span style="display:inline-block; width: 6px; height: 6px; border-radius: 50%; background: #166534;"></span>
                    <span>Live Stream Active · ETA ${veh.etaMin} min · ${veh.reliabilityScore}% rel</span>
                  </div>
                </div>
              </div>
            `)
            .addTo(markersGroup);

          bounds.extend([vehLat, vehLon]);
        });
      }

      // 3. NO STATIC INCIDENT MARKERS — Incident data unavailable without connected provider.
      // Incidents must come from a real API source only.

      setRouteInfo(null);

      if (bounds.isValid()) {
        mapInstanceRef.current.fitBounds(bounds, { padding: [50, 50], maxZoom: 13 });
      }
      return;
    }

    // =========================================================================
    // CASE B: ROUTESHIELD JOURNEY MODE (showJourneyRoutes === true)
    // Display planned candidate routes with real distance, duration, hazard markers,
    // live road traffic conditions, and interactive Google Maps-style route selection.
    // =========================================================================
    if (!candidateRoutes || candidateRoutes.length === 0) return;

    // 0. RENDER LIVE TRAFFIC PRESSURE CONDITIONS ACROSS CORRIDORS
    if (showTraffic && cityZones && cityZones.length > 0) {
      cityZones.forEach(zone => {
        const centerLat = 28.6139 + (zone.center.y - 300) * 0.0007;
        const centerLon = 77.2400 + (zone.center.x - 450) * 0.0007;

        const zoneColor =
          zone.status === 'severe'
            ? '#ef4444'
            : zone.status === 'heavy'
            ? '#f59e0b'
            : zone.status === 'moderate'
            ? '#3b82f6'
            : '#10b981';

        const circle = L.circle([centerLat, centerLon], {
          radius: 1400,
          color: zoneColor,
          fillColor: zoneColor,
          fillOpacity: 0.16,
          weight: 1.5
        }).addTo(routesGroup);

        circle.bindPopup(`
          <div style="font-family: inherit; min-width: 175px; padding: 2px;">
            <strong style="color: ${zoneColor}; font-size: 12.5px;">${zone.name}</strong><br/>
            <div style="font-size: 11px; color: #334155; margin-top: 3px;">
              <span>Pressure Score: <b>${zone.pressureScore}/100</b></span><br/>
              <span>Live Flow: <b style="text-transform: uppercase;">${zone.status}</b></span><br/>
              <span>Average Speed: <b>${zone.avgSpeedKmh} km/h</b></span>
            </div>
          </div>
        `);
      });
    }

    // Helper: convert [lon, lat] pairs from OSRM coordinates into Leaflet [lat, lon]
    const extractLatLngs = (route: CandidateRoute): L.LatLngExpression[] => {
      if (route.realCoordinates && route.realCoordinates.length > 0) {
        return route.realCoordinates.map(c => [c[1], c[0]]);
      }
      return [];
    };

    const activeRoute = selectedRoute || candidateRoutes[0];
    const nonSelectedRoutes = candidateRoutes.filter(r => r.id !== activeRoute.id);

    // Color palette mapping per corridor to guarantee high visual distinction
    const getCorridorPalette = (r: CandidateRoute, isSelected: boolean) => {
      const isBarred = r.clearanceStatus === 'failed';
      const isOpt = r.isRecommended;

      if (isBarred) {
        return {
          core: isSelected ? '#b91c1c' : '#ef4444',
          halo: '#fca5a5',
          pillBg: isSelected ? '#991b1b' : '#dc2626',
          pillBorder: '#ffffff',
          tag: 'BARRED'
        };
      }

      if (isOpt) {
        return {
          core: isSelected ? '#15803d' : '#16a34a',
          halo: '#4ade80',
          pillBg: '#166534',
          pillBorder: '#86efac',
          tag: '★ OPTIMAL ROUTE'
        };
      }

      if (r.id === 'route-a' || r.name.toLowerCase().includes('route a')) {
        return {
          core: isSelected ? '#c2410c' : '#ea580c',
          halo: '#fdba74',
          pillBg: '#9a3412',
          pillBorder: '#fed7aa',
          tag: 'ROUTE A'
        };
      }

      if (r.id === 'route-b' || r.name.toLowerCase().includes('route b')) {
        return {
          core: isSelected ? '#1d4ed8' : '#3b82f6',
          halo: '#93c5fd',
          pillBg: '#1e40af',
          pillBorder: '#bfdbfe',
          tag: 'ROUTE B'
        };
      }

      return {
        core: isSelected ? '#0f766e' : '#0d9488',
        halo: '#99f6e4',
        pillBg: '#115e59',
        pillBorder: '#ccfbf1',
        tag: 'ROUTE C'
      };
    };

    // 1. RENDER ALL ALTERNATIVE ROUTES (NO ROUTE SKIPPED)
    nonSelectedRoutes.forEach((route, idx) => {
      const latLngs = extractLatLngs(route);
      if (latLngs.length === 0) return;

      latLngs.forEach(pt => bounds.extend(pt));

      const isBarred = route.clearanceStatus === 'failed';
      const isOptimal = route.isRecommended;
      const palette = getCorridorPalette(route, false);

      // If optimal alternative, render glowing underlayer
      if (isOptimal) {
        L.polyline(latLngs, {
          color: palette.halo,
          weight: 10,
          opacity: 0.35,
          lineCap: 'round',
          lineJoin: 'round',
          interactive: false
        }).addTo(routesGroup);
      }

      // Alternative Polyline
      const polyline = L.polyline(latLngs, {
        color: palette.core,
        weight: isOptimal ? 6 : 5,
        opacity: isOptimal ? 0.9 : 0.75,
        dashArray: isBarred ? '8, 8' : undefined,
        lineCap: 'round',
        lineJoin: 'round',
        interactive: true
      });

      // Hover emphasis
      polyline.on('mouseover', function (e) {
        (e.target as L.Polyline).setStyle({ weight: 7, opacity: 1.0 });
      });
      polyline.on('mouseout', function (e) {
        (e.target as L.Polyline).setStyle({ weight: isOptimal ? 6 : 5, opacity: isOptimal ? 0.9 : 0.75 });
      });

      // User click: switch active route to this candidate!
      polyline.on('click', () => {
        setSelectedRoute(route);
      });

      polyline.bindTooltip(
        `<div style="font-family: inherit; font-size: 11px; padding: 2px;">
          <strong style="color: ${palette.core};">${route.name}</strong><br/>
          <span>ETA: <b>${route.currentEtaMin} min</b> (${route.distanceKm} km)</span><br/>
          ${isOptimal ? '<span style="color: #166534; font-weight: bold;">★ RECOMMENDED OPTIMAL CORRIDOR</span><br/>' : ''}
          <span style="color: #2563eb; font-size: 10px; font-weight: bold;">Click to select corridor</span>
        </div>`,
        { sticky: true, direction: 'top' }
      );

      polyline.addTo(routesGroup);

      // Midpoint ETA Pill for alternative route (Interactive Google Maps style)
      const fraction = 0.32 + (idx * 0.20);
      const midIdx = Math.floor(latLngs.length * Math.min(0.75, fraction));
      const midPoint = latLngs[midIdx] as [number, number];

      if (midPoint) {
        const altPillIcon = L.divIcon({
          className: 'route-eta-pill-alt',
          html: `
            <div style="
              background: ${palette.pillBg};
              color: #ffffff;
              padding: 3px 9px;
              border-radius: 9999px;
              font-family: inherit;
              font-size: 11px;
              font-weight: 700;
              box-shadow: 0 3px 10px rgba(0,0,0,0.35);
              border: 2px solid ${palette.pillBorder};
              cursor: pointer;
              display: flex;
              align-items: center;
              gap: 5px;
              white-space: nowrap;
              transition: transform 0.15s ease, filter 0.15s ease;
            " onmouseover="this.style.transform='scale(1.08)'" onmouseout="this.style.transform='scale(1)'">
              ${isOptimal ? '<span style="color: #fef08a; font-size: 10px;">★ OPTIMAL</span>' : `<span style="opacity: 0.9; font-size: 9.5px;">${palette.tag}</span>`}
              <span style="font-weight: 800;">${route.currentEtaMin} min</span>
              <span style="font-size: 9px; opacity: 0.85;">(${route.distanceKm} km)</span>
            </div>
          `,
          iconSize: [isOptimal ? 160 : 130, 26],
          iconAnchor: [isOptimal ? 80 : 65, 13]
        });

        const pillMarker = L.marker(midPoint, { icon: altPillIcon, interactive: true });
        pillMarker.on('click', () => setSelectedRoute(route));
        pillMarker.addTo(routesGroup);
      }

      // Direction Arrows along Alternative Route (Google Maps style)
      if (latLngs.length >= 2) {
        const altStep = Math.max(2, Math.floor((latLngs.length - 1) / 5));
        for (let i = 1; i < latLngs.length - 1; i += altStep) {
          const p1 = latLngs[i] as [number, number];
          const p2 = latLngs[Math.min(i + 1, latLngs.length - 1)] as [number, number];
          if (Math.abs(p1[0] - p2[0]) < 0.00005 && Math.abs(p1[1] - p2[1]) < 0.00005) continue;

          const angle = getBearingAngle(p1, p2);
          const midPoint: [number, number] = [(p1[0] + p2[0]) / 2, (p1[1] + p2[1]) / 2];

          const altArrowIcon = L.divIcon({
            className: 'route-direction-arrow-alt',
            html: `
              <div style="
                width: 18px;
                height: 18px;
                display: flex;
                align-items: center;
                justify-content: center;
                transform: rotate(${angle}deg);
                opacity: 0.85;
                pointer-events: none;
                filter: drop-shadow(0 1px 2px rgba(0,0,0,0.3));
              ">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
                  <path d="M12 2L21 21L12 16L3 21L12 2Z" fill="#ffffff" stroke="${palette.core}" stroke-width="2.2" stroke-linejoin="round" />
                </svg>
              </div>
            `,
            iconSize: [18, 18],
            iconAnchor: [9, 9]
          });

          L.marker(midPoint, { icon: altArrowIcon, interactive: false }).addTo(routesGroup);
        }
      }
    });

    // 2. RENDER ACTIVE / SELECTED ROUTE (Prominently Highlighted with Outer Glow)
    if (activeRoute) {
      const activeLatLngs = extractLatLngs(activeRoute);
      if (activeLatLngs.length > 0) {
        activeLatLngs.forEach(pt => bounds.extend(pt));

        const isBarred = activeRoute.clearanceStatus === 'failed';
        const isOpt = activeRoute.isRecommended;
        const palette = getCorridorPalette(activeRoute, true);

        // Outer glowing halo polyline
        L.polyline(activeLatLngs, {
          color: palette.halo,
          weight: 14,
          opacity: 0.40,
          lineCap: 'round',
          lineJoin: 'round',
          interactive: false
        }).addTo(routesGroup);

        // Core solid polyline
        const selPolyline = L.polyline(activeLatLngs, {
          color: palette.core,
          weight: 6.5,
          opacity: 1.0,
          lineCap: 'round',
          lineJoin: 'round',
          interactive: true
        }).addTo(routesGroup);

        selPolyline.bindTooltip(
          `<div style="font-family: inherit; font-size: 11px; padding: 2px;">
            <strong style="color: ${palette.core};">${activeRoute.name} ${isOpt ? '★ OPTIMAL (SELECTED)' : '(SELECTED)'}</strong><br/>
            <span>ETA: <b>${activeRoute.currentEtaMin} min</b> (${activeRoute.distanceKm} km)</span><br/>
            <span>Reliability: <b>${activeRoute.reliabilityScore}%</b> · Safety: <b>${activeRoute.safetyScore}%</b></span>
          </div>`,
          { sticky: true, direction: 'top' }
        );

        // Google Maps Navigation Direction Arrows along active route
        if (activeLatLngs.length >= 2) {
          const numArrows = Math.min(14, Math.max(5, Math.floor(activeLatLngs.length / 3)));
          const step = Math.max(1, Math.floor((activeLatLngs.length - 1) / numArrows));

          for (let i = 0; i < activeLatLngs.length - 1; i += step) {
            const p1 = activeLatLngs[i] as [number, number];
            const p2 = activeLatLngs[Math.min(i + 1, activeLatLngs.length - 1)] as [number, number];

            if (Math.abs(p1[0] - p2[0]) < 0.00005 && Math.abs(p1[1] - p2[1]) < 0.00005) continue;

            const angle = getBearingAngle(p1, p2);
            const midPoint: [number, number] = [
              (p1[0] + p2[0]) / 2,
              (p1[1] + p2[1]) / 2
            ];

            const arrowIcon = L.divIcon({
              className: 'route-direction-arrow-active',
              html: `
                <div style="
                  width: 22px;
                  height: 22px;
                  display: flex;
                  align-items: center;
                  justify-content: center;
                  transform: rotate(${angle}deg);
                  pointer-events: none;
                  filter: drop-shadow(0 2px 5px rgba(0,0,0,0.5));
                ">
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none">
                    <path d="M12 2L21 21L12 16L3 21L12 2Z" fill="#ffffff" stroke="${palette.core}" stroke-width="2.5" stroke-linejoin="round" />
                  </svg>
                </div>
              `,
              iconSize: [22, 22],
              iconAnchor: [11, 11]
            });

            L.marker(midPoint, { icon: arrowIcon, interactive: false }).addTo(routesGroup);
          }
        }

        // Active Route Prominent ETA Pill
        const activeMidIdx = Math.floor(activeLatLngs.length * 0.52);
        const activeMidPoint = activeLatLngs[activeMidIdx] as [number, number];
        if (activeMidPoint) {
          const activePillIcon = L.divIcon({
            className: 'route-eta-pill-active',
            html: `
              <div style="
                background: ${palette.pillBg};
                color: #ffffff;
                padding: 4px 12px;
                border-radius: 9999px;
                font-family: inherit;
                font-size: 11.5px;
                font-weight: 800;
                box-shadow: 0 4px 14px rgba(0,0,0,0.4);
                border: 2px solid ${palette.pillBorder};
                display: flex;
                align-items: center;
                gap: 6px;
                white-space: nowrap;
              ">
                <span style="display: inline-block; width: 7px; height: 7px; border-radius: 50%; background: #4ade80; box-shadow: 0 0 6px #4ade80;"></span>
                ${isOpt ? '<span style="background: rgba(254,240,138,0.3); color: #fef08a; padding: 1px 6px; border-radius: 4px; font-size: 9.5px; font-weight: 800;">★ OPTIMAL</span>' : `<span style="background: rgba(255,255,255,0.2); padding: 1px 5px; border-radius: 4px; font-size: 9px; font-weight: 700;">${palette.tag}</span>`}
                <span>${activeRoute.currentEtaMin} min</span>
                <span style="font-size: 9.5px; opacity: 0.9;">(${activeRoute.distanceKm} km)</span>
                <span style="background: rgba(255,255,255,0.25); padding: 1px 5px; border-radius: 4px; font-size: 9px; font-weight: 700; letter-spacing: 0.5px;">ACTIVE</span>
              </div>
            `,
            iconSize: [isOpt ? 180 : 155, 30],
            iconAnchor: [isOpt ? 90 : 77, 15]
          });

          L.marker(activeMidPoint, { icon: activePillIcon, interactive: false }).addTo(routesGroup);
        }

        const calculatedTimes = calculateJourneyTimes(departureTime, activeRoute.currentEtaMin);
        setRouteInfo({
          distanceKm: activeRoute.distanceKm,
          durationMin: activeRoute.currentEtaMin,
          name: activeRoute.name,
          pickupTime: calculatedTimes.pickupTime,
          dropoffTime: calculatedTimes.dropoffTime
        });
      }
    }

    // 3. RENDER ORIGIN (A) & DESTINATION (B) PINS
    const primaryRoute = activeRoute || candidateRoutes[0];
    const primaryLatLngs = extractLatLngs(primaryRoute);

    if (primaryLatLngs.length > 1) {
      const originPt: [number, number] = startCoords
        ? [startCoords[0], startCoords[1]]
        : (primaryLatLngs[0] as [number, number]);
      const destPt: [number, number] = destCoords
        ? [destCoords[0], destCoords[1]]
        : (primaryLatLngs[primaryLatLngs.length - 1] as [number, number]);
      const pinTimes = calculateJourneyTimes(departureTime, primaryRoute.currentEtaMin);

      // Draggable Origin Pin (A)
      const originIcon = L.divIcon({
        className: 'origin-marker-icon',
        html: `
          <div style="position: relative; display: flex; align-items: center; justify-content: center; cursor: pointer;">
            <div style="position: absolute; width: 34px; height: 34px; border-radius: 50%; background: rgba(22, 101, 52, 0.35); animation: ping 2s cubic-bezier(0, 0, 0.2, 1) infinite;"></div>
            <div style="width: 30px; height: 30px; border-radius: 50%; background: #166534; color: white; display: flex; align-items: center; justify-content: center; font-size: 13px; font-weight: 800; border: 2.5px solid white; box-shadow: 0 3px 8px rgba(0,0,0,0.35);">
              A
            </div>
          </div>
        `,
        iconSize: [34, 34],
        iconAnchor: [17, 17]
      });

      const originMarker = L.marker(originPt, { icon: originIcon, draggable: true })
        .bindPopup(`
          <div style="font-family: inherit; min-width: 220px; padding: 4px;">
            <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 5px; border-bottom: 1px solid #bbf7d0; padding-bottom: 4px;">
              <div style="display: flex; align-items: center; gap: 6px;">
                <span style="display:inline-block; width: 10px; height: 10px; border-radius: 50%; background: #166534;"></span>
                <strong style="color: #166534; font-size: 12px; letter-spacing: 0.5px;">PICKUP LOCATION (START)</strong>
              </div>
              <span style="font-size: 9px; font-weight: 800; background: #dcfce7; color: #166534; padding: 1px 6px; border-radius: 4px;">STOP A</span>
            </div>
            <div style="font-size: 12.5px; color: #0f172a; font-weight: 800; margin-bottom: 5px;">${startLocation || 'Delhi Hub'}</div>
            <div style="background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 6px; padding: 5px 8px; margin-bottom: 4px; display: flex; align-items: center; justify-content: space-between;">
              <span style="font-size: 11px; color: #166534; font-weight: 600;">🕒 Pickup Time:</span>
              <span style="font-size: 12px; color: #166534; font-weight: 800;">${pinTimes.pickupTime}</span>
            </div>
            <div style="font-size: 10px; color: #64748b; font-family: monospace;">GPS: ${originPt[0].toFixed(4)}, ${originPt[1].toFixed(4)}</div>
            <div style="font-size: 10px; color: #047857; margin-top: 3px; font-weight: 600;">✨ Drag marker to reposition origin</div>
          </div>
        `)
        .addTo(markersGroup);

      originMarker.on('dragend', (e: any) => {
        const p = e.target.getLatLng();
        setPointFromMap('start', [+p.lat.toFixed(5), +p.lng.toFixed(5)]);
      });

      // Draggable Destination Pin (B)
      const destIcon = L.divIcon({
        className: 'dest-marker-icon',
        html: `
          <div style="position: relative; display: flex; align-items: center; justify-content: center; cursor: pointer;">
            <div style="position: absolute; width: 34px; height: 34px; border-radius: 50%; background: rgba(185, 28, 28, 0.35); animation: ping 2s cubic-bezier(0, 0, 0.2, 1) infinite;"></div>
            <div style="width: 30px; height: 30px; border-radius: 50%; background: #b91c1c; color: white; display: flex; align-items: center; justify-content: center; font-size: 13px; font-weight: 800; border: 2.5px solid white; box-shadow: 0 3px 8px rgba(0,0,0,0.35);">
              B
            </div>
          </div>
        `,
        iconSize: [34, 34],
        iconAnchor: [17, 17]
      });

      const destMarker = L.marker(destPt, { icon: destIcon, draggable: true })
        .bindPopup(`
          <div style="font-family: inherit; min-width: 220px; padding: 4px;">
            <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 5px; border-bottom: 1px solid #fecaca; padding-bottom: 4px;">
              <div style="display: flex; align-items: center; gap: 6px;">
                <span style="display:inline-block; width: 10px; height: 10px; border-radius: 50%; background: #b91c1c;"></span>
                <strong style="color: #b91c1c; font-size: 12px; letter-spacing: 0.5px;">DROP-OFF LOCATION (DEST)</strong>
              </div>
              <span style="font-size: 9px; font-weight: 800; background: #fee2e2; color: #b91c1c; padding: 1px 6px; border-radius: 4px;">STOP B</span>
            </div>
            <div style="font-size: 12.5px; color: #0f172a; font-weight: 800; margin-bottom: 5px;">${destinationLocation || 'Greater Noida Hub'}</div>
            <div style="background: #fef2f2; border: 1px solid #fecaca; border-radius: 6px; padding: 5px 8px; margin-bottom: 4px; display: flex; align-items: center; justify-content: space-between;">
              <span style="font-size: 11px; color: #b91c1c; font-weight: 600;">🏁 Drop-off Time:</span>
              <span style="font-size: 12px; color: #b91c1c; font-weight: 800;">${pinTimes.dropoffTime}</span>
            </div>
            <div style="font-size: 10px; color: #64748b; font-family: monospace;">GPS: ${destPt[0].toFixed(4)}, ${destPt[1].toFixed(4)}</div>
            <div style="font-size: 10px; color: #b91c1c; margin-top: 3px; font-weight: 600;">✨ Drag marker to reposition destination</div>
          </div>
        `)
        .addTo(markersGroup);

      destMarker.on('dragend', (e: any) => {
        const p = e.target.getLatLng();
        setPointFromMap('dest', [+p.lat.toFixed(5), +p.lng.toFixed(5)]);
      });

      // 4. ACCIDENT / COLLISION HAZARD MARKER (💥)
      // Placed on the Expressway corridor (Route A) where the severe bottleneck occurs
      const routeA = candidateRoutes.find(r => r.id === 'route-a') || candidateRoutes[0];
      const routeALatLngs = extractLatLngs(routeA);
      const incidentIdx = Math.floor(routeALatLngs.length * 0.38);
      const incidentCoord = (routeALatLngs[incidentIdx] as [number, number]) || [28.6187, 77.2871];

      const accidentIcon = L.divIcon({
        className: 'accident-marker-icon',
        html: `
          <div style="position: relative; display: flex; align-items: center; justify-content: center; cursor: pointer;">
            <div style="position: absolute; width: 40px; height: 40px; border-radius: 50%; background: rgba(239, 68, 68, 0.45); animation: ping 1.5s cubic-bezier(0, 0, 0.2, 1) infinite;"></div>
            <div style="width: 32px; height: 32px; border-radius: 50%; background: #dc2626; color: white; display: flex; align-items: center; justify-content: center; font-size: 16px; border: 2.5px solid #ffffff; box-shadow: 0 4px 12px rgba(220,38,38,0.5); font-weight: bold; transform: scale(1); transition: transform 0.15s ease;" onmouseover="this.style.transform='scale(1.15)'" onmouseout="this.style.transform='scale(1)'">
              💥
            </div>
          </div>
        `,
        iconSize: [40, 40],
        iconAnchor: [20, 20]
      });

      L.marker(incidentCoord, { icon: accidentIcon })
        .bindPopup(`
          <div style="font-family: inherit; min-width: 230px; padding: 4px;">
            <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 5px; border-bottom: 1px solid #fee2e2; padding-bottom: 5px;">
              <span style="font-size: 20px;">💥</span>
              <div>
                <div style="color: #b91c1c; font-size: 12.5px; font-weight: 800; letter-spacing: 0.3px;">LIVE ACCIDENT / COLLISION</div>
                <div style="color: #64748b; font-size: 10px;">Expressway A-10 (Km 14.8)</div>
              </div>
            </div>
            <div style="font-size: 11px; color: #334155; line-height: 1.5;">
              <div><strong>Incident Severity:</strong> <span style="color: #dc2626; font-weight: 700;">2 Right Lanes Blocked</span></div>
              <div><strong>Bottleneck Delay:</strong> <span style="color: #dc2626; font-weight: 700;">+18 min queue</span></div>
              <div><strong>Emergency Response:</strong> Tow trucks on site</div>
            </div>
            <div style="margin-top: 6px; padding: 6px 8px; background: #fef2f2; border: 1px solid #fecaca; border-radius: 6px; color: #991b1b; font-weight: 600; font-size: 10px; line-height: 1.35;">
              🛡️ <b>CityFlow AI:</b> Detour via Outer Ring Beltway (Route B) bypasses this crash completely!
            </div>
          </div>
        `)
        .addTo(markersGroup);

      // 5. WEATHER ADVISORY HAZARD MARKER (🌧️)
      // Placed in eastern precipitation corridor
      const weatherIdx = Math.floor(primaryLatLngs.length * 0.68);
      const weatherCoord = (primaryLatLngs[weatherIdx] as [number, number]) || [28.6255, 77.3125];

      const weatherIcon = L.divIcon({
        className: 'weather-marker-icon',
        html: `
          <div style="position: relative; display: flex; align-items: center; justify-content: center; cursor: pointer;">
            <div style="position: absolute; width: 40px; height: 40px; border-radius: 50%; background: rgba(14, 165, 233, 0.45); animation: ping 2s cubic-bezier(0, 0, 0.2, 1) infinite;"></div>
            <div style="width: 32px; height: 32px; border-radius: 50%; background: #0284c7; color: white; display: flex; align-items: center; justify-content: center; font-size: 16px; border: 2.5px solid #ffffff; box-shadow: 0 4px 12px rgba(2,132,199,0.5); transform: scale(1); transition: transform 0.15s ease;" onmouseover="this.style.transform='scale(1.15)'" onmouseout="this.style.transform='scale(1)'">
              🌧️
            </div>
          </div>
        `,
        iconSize: [40, 40],
        iconAnchor: [20, 20]
      });

      L.marker(weatherCoord, { icon: weatherIcon })
        .bindPopup(`
          <div style="font-family: inherit; min-width: 230px; padding: 4px;">
            <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 5px; border-bottom: 1px solid #e0f2fe; padding-bottom: 5px;">
              <span style="font-size: 20px;">🌧️</span>
              <div>
                <div style="color: #0369a1; font-size: 12.5px; font-weight: 800; letter-spacing: 0.3px;">LIVE WEATHER ADVISORY</div>
                <div style="color: #64748b; font-size: 10px;">East Corridor / Yamuna Floodplain</div>
              </div>
            </div>
            <div style="font-size: 11px; color: #334155; line-height: 1.5;">
              <div><strong>Condition:</strong> Localized Heavy Downpour</div>
              <div><strong>Rainfall Rate:</strong> 14.5 mm/h · Visibility: 1.8 km</div>
              <div><strong>Surface Grip:</strong> Wet Asphalt (Friction μ = 0.42)</div>
            </div>
            <div style="margin-top: 6px; padding: 6px 8px; background: #f0f9ff; border: 1px solid #bae6fd; border-radius: 6px; color: #075985; font-weight: 600; font-size: 10px; line-height: 1.35;">
              ⚠️ <b>Fleet Safety:</b> Braking distance increased by 35%. Speed advisory restricted to 45 km/h.
            </div>
          </div>
        `)
        .addTo(markersGroup);

      // 6. LOW CLEARANCE UNDERPASS CHECKPOINT MARKER (🚧)
      const underpassIdx = Math.floor(routeALatLngs.length * 0.48);
      const underpassCoord = (routeALatLngs[underpassIdx] as [number, number]) || [28.6211, 77.2850];
      const isHeightViolated = selectedVehicle ? selectedVehicle.height > 3.8 : true;

      const underpassIcon = L.divIcon({
        className: 'underpass-marker-icon',
        html: `
          <div style="position: relative; display: flex; align-items: center; justify-content: center; cursor: pointer;">
            <div style="width: 30px; height: 30px; border-radius: 8px; background: ${isHeightViolated ? '#dc2626' : '#d97706'}; color: white; display: flex; align-items: center; justify-content: center; font-size: 15px; border: 2px solid white; box-shadow: 0 3px 8px rgba(0,0,0,0.35); font-weight: bold; transform: scale(1); transition: transform 0.15s ease;" onmouseover="this.style.transform='scale(1.15)'" onmouseout="this.style.transform='scale(1)'">
              🚧
            </div>
          </div>
        `,
        iconSize: [30, 30],
        iconAnchor: [15, 15]
      });

      L.marker(underpassCoord, { icon: underpassIcon })
        .bindPopup(`
          <div style="font-family: inherit; min-width: 220px; padding: 4px;">
            <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 5px; border-bottom: 1px solid #fed7aa; padding-bottom: 5px;">
              <span style="font-size: 18px;">🚧</span>
              <div>
                <div style="color: ${isHeightViolated ? '#b91c1c' : '#b45309'}; font-size: 12px; font-weight: 800;">METRO RAIL UNDERPASS (A-10)</div>
                <div style="color: #64748b; font-size: 10px;">Physical Height Constraint</div>
              </div>
            </div>
            <div style="font-size: 11px; color: #334155; line-height: 1.5;">
              <div><strong>Max Arch Clearance:</strong> 3.80 meters</div>
              <div><strong>Vehicle Height:</strong> ${selectedVehicle ? selectedVehicle.height : 4.0}m</div>
            </div>
            <div style="margin-top: 6px; padding: 6px 8px; background: ${isHeightViolated ? '#fef2f2' : '#f0fdf4'}; border: 1px solid ${isHeightViolated ? '#fecaca' : '#bbf7d0'}; border-radius: 6px; color: ${isHeightViolated ? '#991b1b' : '#166534'}; font-weight: 700; font-size: 10px; line-height: 1.35;">
              ${isHeightViolated ? '⛔ PHYSICAL CLEARANCE BREACH — ROUTE BARRED' : '✅ CLEARANCE APPROVED — SAFE TRANSIT'}
            </div>
          </div>
        `)
        .addTo(markersGroup);
    }

    // Fit map bounds smoothly to fit all candidate routes and markers
    if (bounds.isValid()) {
      mapInstanceRef.current.fitBounds(bounds, {
        padding: [50, 50],
        maxZoom: 14
      });
    }
  }, [showJourneyRoutes, candidateRoutes, selectedRoute, selectedVehicle, startLocation, destinationLocation, startCoords, destCoords, departureTime, fleet, cityZones, setSelectedRoute]);

  // Real-time geocoding search handler
  const handleSearch = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!searchQuery.trim()) return;

    setIsSearching(true);
    try {
      const results = await searchLocations(searchQuery);

      if (results && results.length > 0) {
        setSearchResults(results);
        const top = results[0];
        const newLat = top.lat;
        const newLon = top.lon;
        const coords: [number, number] = [newLat, newLon];

        if (mapInstanceRef.current) {
          mapInstanceRef.current.flyTo(coords, 14, { duration: 1.2 });
        }

        // Set destination and calculate all routes connecting origin to this point
        setDestinationLocation(top.display_name);
        setDestCoords(coords);
        runRouteAnalysis(startLocation, top.display_name, startCoords || undefined, coords);
      }
    } catch (err) {
      console.warn('Geocoding search error:', err);
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
        mapInstanceRef.current.flyTo(coords, 14, { duration: 1.2 });
      }

      setDestinationLocation(item.display_name);
      setDestCoords(coords);
      runRouteAnalysis(startLocation, item.display_name, startCoords || undefined, coords);
    }
  };

  return (
    <div className={`relative isolate z-0 w-full ${heightClass} bg-slate-100 rounded-2xl overflow-hidden border border-slate-200 shadow-sm text-left select-none`}>
      {/* Floating Clicked Coordinates Action Card */}
      {clickedCoords && (
        <div className="absolute top-16 left-3 z-30 bg-white/95 backdrop-blur-md p-3 rounded-2xl border border-emerald-600 shadow-2xl text-slate-900 space-y-2 animate-in fade-in zoom-in-95 duration-150">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center space-x-1.5 text-emerald-800 font-bold text-xs">
              <MapPin className="w-3.5 h-3.5 text-emerald-600" />
              <span>Map Coordinates Selected</span>
            </div>
            <button
              type="button"
              onClick={() => setClickedCoords(null)}
              className="text-slate-400 hover:text-slate-800 text-xs font-bold cursor-pointer"
            >
              ✕
            </button>
          </div>
          <div className="font-mono text-xs text-slate-800 bg-slate-100 px-2 py-1 rounded-md border border-slate-200">
            Lat: {clickedCoords[0]}°, Lon: {clickedCoords[1]}°
          </div>
          <div className="flex items-center space-x-2 pt-1">
            <button
              type="button"
              onClick={() => {
                setPointFromMap('start', clickedCoords);
                setClickedCoords(null);
              }}
              className="px-2.5 py-1 bg-[#166534] hover:bg-[#14532d] text-white rounded-lg text-xs font-bold transition flex items-center space-x-1 cursor-pointer"
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

      {/* Search Header Bar with Live Traffic Toggle (Real-Time OSM) */}
      <div className="absolute top-3 left-3 z-10 flex flex-col gap-1.5 max-w-[calc(100%-80px)] sm:max-w-none pointer-events-auto">
        <div className="flex flex-wrap items-center gap-2">
          <form onSubmit={handleSearch} className="relative flex items-center shadow-md rounded-xl w-64 sm:w-80">
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
              placeholder="Search address or location..."
              className="w-full bg-white/95 backdrop-blur-md border border-slate-200 rounded-xl pl-8 pr-16 py-1.5 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-[#166534] font-medium"
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

          <button
            type="button"
            onClick={() => setShowTraffic(!showTraffic)}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center space-x-1.5 shadow-md border cursor-pointer ${
              showTraffic
                ? 'bg-[#166534] text-white border-emerald-500 shadow-emerald-950/20'
                : 'bg-white/95 text-slate-700 border-slate-200 hover:bg-slate-50'
            }`}
            title="Toggle Live Traffic Flow Layer"
          >
            <span className="text-xs">🚦</span>
            <span>Traffic: {showTraffic ? 'LIVE' : 'OFF'}</span>
          </button>
        </div>

        {/* Autocomplete dropdown */}
        {searchResults.length > 1 && (
          <div className="mt-1 bg-white border border-slate-200 rounded-xl shadow-lg overflow-hidden text-xs max-h-48 overflow-y-auto w-64 sm:w-80">
            {searchResults.map((item, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleSelectResult(item)}
                className="w-full text-left px-3 py-2 hover:bg-slate-50 border-b border-slate-100 last:border-0 flex items-start space-x-2 text-slate-700"
              >
                <MapPin className="w-3.5 h-3.5 text-[#166534] shrink-0 mt-0.5" />
                <span className="truncate">{item.display_name}</span>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Google Maps Style Journey Navigation & Timing Card */}
      {showJourneyRoutes && routeInfo && (
        <div className="absolute top-3 right-3 z-20 w-80 sm:w-96 bg-white/95 backdrop-blur-md rounded-2xl border border-slate-200/90 shadow-2xl overflow-hidden transition-all duration-200 pointer-events-auto">
          {/* Card Header: Duration & Live Traffic Badge */}
          <div className="bg-gradient-to-r from-[#166534] via-[#15803d] to-[#166534] px-4 py-3 text-white flex items-center justify-between shadow-xs">
            <div className="flex items-center space-x-2.5">
              <div className="w-8 h-8 rounded-xl bg-white/15 flex items-center justify-center backdrop-blur-xs border border-white/20 shadow-xs">
                <Navigation2 className="w-4 h-4 text-white fill-white" />
              </div>
              <div>
                <div className="flex items-baseline space-x-2">
                  <span className="text-xl font-black tracking-tight">{routeInfo.durationMin} min</span>
                  <span className="text-xs font-semibold text-emerald-100">({routeInfo.distanceKm} km)</span>
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
                      <span>Pickup: {routeInfo.pickupTime}</span>
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
                      <span>Drop: {routeInfo.dropoffTime}</span>
                    </div>
                  </div>
                  <div className="text-[10px] text-slate-500 font-medium">Destination · Expected Arrival</div>
                </div>
              </div>

              {/* Bottom Quick Indicator */}
              <div className="pt-2.5 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-600">
                <span className="font-semibold text-slate-700 truncate max-w-[190px] flex items-center space-x-1">
                  <span>Corridor:</span>
                  <strong className="text-slate-900 truncate">{routeInfo.name}</strong>
                </span>
                <span className="inline-flex items-center space-x-1 text-emerald-700 font-bold text-[10px] bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-100">
                  <ArrowRight className="w-3 h-3 text-emerald-600" />
                  <span>Direction Active</span>
                </span>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Floating All-Corridors & Optimal Dispatch Switcher HUD */}
      {showJourneyRoutes && candidateRoutes && candidateRoutes.length > 0 && (
        <div className="absolute top-14 right-3 z-20 bg-white/95 backdrop-blur-md p-2.5 rounded-2xl border border-slate-200 shadow-xl max-w-[260px] animate-in fade-in duration-150">
          <div className="flex items-center justify-between text-[10.5px] font-bold text-slate-700 pb-1.5 mb-1.5 border-b border-slate-100">
            <span className="flex items-center space-x-1">
              <Navigation className="w-3 h-3 text-[#166534]" />
              <span>ALL CORRIDORS ({candidateRoutes.length})</span>
            </span>
            <span className="text-[9px] font-mono text-[#166534] bg-emerald-50 px-1.5 py-0.5 rounded font-bold border border-emerald-200">
              CLICK TO SWITCH
            </span>
          </div>
          <div className="space-y-1">
            {candidateRoutes.map((r, idx) => {
              const isSel = (selectedRoute?.id === r.id) || (!selectedRoute && idx === 0);
              const isOpt = r.isRecommended;
              const isBar = r.clearanceStatus === 'failed';

              let dotBg = 'bg-teal-500';
              if (isBar) dotBg = 'bg-rose-500';
              else if (r.id === 'route-a' || r.name.toLowerCase().includes('route a')) dotBg = 'bg-amber-500';
              else if (r.id === 'route-b' || r.name.toLowerCase().includes('route b')) dotBg = 'bg-blue-600';
              else if (isOpt) dotBg = 'bg-emerald-600';

              return (
                <button
                  key={r.id}
                  type="button"
                  onClick={() => setSelectedRoute(r)}
                  className={`w-full text-left px-2 py-1.5 rounded-xl text-xs font-semibold flex items-center justify-between transition cursor-pointer ${
                    isSel
                      ? 'bg-slate-900 text-white shadow-xs'
                      : 'bg-slate-50 hover:bg-emerald-50 text-slate-700 hover:text-emerald-950 border border-slate-200'
                  }`}
                >
                  <div className="flex items-center space-x-1.5 truncate">
                    <span className={`w-2 h-2 rounded-full shrink-0 ${dotBg}`} />
                    <span className="truncate text-[11px] font-bold">{r.name.split('—')[0].trim()}</span>
                    {isOpt && (
                      <span className={`text-[8.5px] font-extrabold px-1 rounded uppercase tracking-wider ${
                        isSel ? 'bg-emerald-400 text-slate-950' : 'bg-emerald-100 text-[#166534]'
                      }`}>
                        ★ OPTIMAL
                      </span>
                    )}
                  </div>
                  <div className="flex items-center space-x-1 shrink-0 ml-1 font-mono text-[10.5px]">
                    <span className="font-bold">{r.currentEtaMin}m</span>
                    {isBar && <span className="text-[9px] text-rose-300 font-extrabold">⛔</span>}
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {!showJourneyRoutes && (
        <div className="absolute top-14 right-3 z-10 bg-white/95 backdrop-blur-md px-3.5 py-1.5 rounded-xl border border-slate-200 shadow-md flex items-center space-x-2 text-xs">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span className="font-mono font-bold text-slate-900 text-[11px]">METROPOLITAN DIGITAL TWIN</span>
          <span className="text-slate-300">|</span>
          <span className="text-slate-600 text-[11px] font-medium">{fleet?.length || 24} Units Live</span>
        </div>
      )}

      {/* Leaflet Map DOM Container */}
      <div ref={mapContainerRef} className="w-full h-full" style={{ minHeight: '100%' }} />

      {/* Map Interactive Legend */}
      <div className="absolute bottom-3 left-3 z-10 bg-white/95 backdrop-blur-md px-3 py-2 rounded-xl border border-slate-200 shadow-md flex flex-wrap items-center gap-3 text-[11px] text-slate-700 font-semibold pointer-events-auto">
        {showJourneyRoutes ? (
          <>
            <div className="flex items-center space-x-1.5">
              <span className="w-3.5 h-3.5 rounded-full bg-[#166534] border-2 border-emerald-300 shadow-xs inline-block" />
              <span>★ Optimal Route</span>
            </div>
            <div className="flex items-center space-x-1.5">
              <span className="w-3.5 h-3.5 rounded-full bg-[#ea580c] border-2 border-orange-200 shadow-xs inline-block" />
              <span>Route A (Arterial)</span>
            </div>
            <div className="flex items-center space-x-1.5">
              <span className="w-3.5 h-3.5 rounded-full bg-[#2563eb] border-2 border-blue-200 shadow-xs inline-block" />
              <span>Route B (Bypass)</span>
            </div>
            <div className="flex items-center space-x-1.5">
              <span className="w-3.5 h-3.5 rounded-full bg-[#0d9488] border-2 border-teal-200 shadow-xs inline-block" />
              <span>Route C (Eco)</span>
            </div>
            <div className="flex items-center space-x-1.5">
              <span className="text-sm leading-none">🚧</span>
              <span>Underpass (3.8m)</span>
            </div>
            {cursorCoords && (
              <div className="text-emerald-800 pl-2 border-l border-slate-300 font-mono text-[10.5px] font-bold">
                📍 Cursor: {cursorCoords[0]}° N, {cursorCoords[1]}° E
              </div>
            )}
          </>
        ) : (
          <>
            <div className="flex items-center space-x-1.5">
              <span className="w-3.5 h-3.5 rounded-sm bg-[#166534] inline-block" />
              <span>Commercial Fleet Unit</span>
            </div>
            <div className="flex items-center space-x-1.5">
              <span className="w-3.5 h-3.5 rounded-sm bg-[#ef4444] inline-block" />
              <span>Delayed Unit</span>
            </div>
            <div className="flex items-center space-x-1.5">
              <span className="w-3.5 h-3.5 rounded-full bg-emerald-400 opacity-60 inline-block" />
              <span>Traffic Zone</span>
            </div>
            <div className="flex items-center space-x-1.5">
              <span className="text-sm leading-none">💥</span>
              <span>Regional Bottleneck</span>
            </div>
            {cursorCoords && (
              <div className="text-emerald-800 pl-2 border-l border-slate-300 font-mono text-[10.5px] font-bold">
                📍 Cursor: {cursorCoords[0]}° N, {cursorCoords[1]}° E
              </div>
            )}
          </>
        )}
      </div>

      {/* Drag & Click Instruction Floating Helper */}
      <div className="absolute bottom-3 right-3 z-10 bg-white/95 backdrop-blur-md px-3 py-1.5 rounded-xl border border-slate-200 shadow-md text-[10.5px] text-slate-600 font-mono pointer-events-auto hidden md:block">
        💡 <em>Click map to drop Pin A/B or drag markers</em>
      </div>
    </div>
  );
};
