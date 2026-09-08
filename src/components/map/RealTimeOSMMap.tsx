import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import { Search, Loader2, Navigation, AlertTriangle, CloudRain, CheckCircle2, RotateCcw, MapPin, Zap } from 'lucide-react';
import { useCityFlow } from '../../context/CityFlowContext';
import { CandidateRoute } from '../../types';

interface RealTimeOSMMapProps {
  heightClass?: string;
}

export const RealTimeOSMMap: React.FC<RealTimeOSMMapProps> = ({
  heightClass = 'h-[520px]'
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
    destinationLocation
  } = useCityFlow();

  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [routeInfo, setRouteInfo] = useState<{ distanceKm: number; durationMin: number; name: string } | null>(null);

  // Initialize Leaflet map instance once
  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (!mapInstanceRef.current) {
      const map = L.map(mapContainerRef.current, {
        center: [28.6250, 77.2950],
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

  // Multi-route rendering, hazard pins (accident, weather, underpass), and interactive selection
  useEffect(() => {
    if (!mapInstanceRef.current || !routesLayerGroupRef.current || !markersGroupRef.current) return;

    const routesGroup = routesLayerGroupRef.current;
    const markersGroup = markersGroupRef.current;

    // Clear previous vector layers and markers cleanly
    routesGroup.clearLayers();
    markersGroup.clearLayers();

    if (!candidateRoutes || candidateRoutes.length === 0) return;

    const bounds = L.latLngBounds([]);

    // Helper: convert [lon, lat] pairs from OSRM coordinates into Leaflet [lat, lon]
    const extractLatLngs = (route: CandidateRoute): L.LatLngExpression[] => {
      if (route.realCoordinates && route.realCoordinates.length > 0) {
        return route.realCoordinates.map(c => [c[1], c[0]]);
      }
      return [];
    };

    const activeRoute = selectedRoute || candidateRoutes[0];
    const nonSelectedRoutes = candidateRoutes.filter(r => r.id !== activeRoute.id);

    // 1. RENDER ALTERNATIVE ROUTES FIRST (dimmer blue/slate with interactive click to select)
    nonSelectedRoutes.forEach((route, idx) => {
      const latLngs = extractLatLngs(route);
      if (latLngs.length === 0) return;

      latLngs.forEach(pt => bounds.extend(pt));

      const isBarred = route.clearanceStatus === 'failed';
      const routeColor = isBarred ? '#f87171' : '#3b82f6';

      // Alternative Polyline
      const polyline = L.polyline(latLngs, {
        color: routeColor,
        weight: 5,
        opacity: 0.65,
        dashArray: isBarred ? '8, 8' : undefined,
        lineCap: 'round',
        lineJoin: 'round',
        interactive: true
      });

      // Hover emphasis
      polyline.on('mouseover', function (e) {
        (e.target as L.Polyline).setStyle({ weight: 7, opacity: 0.95 });
      });
      polyline.on('mouseout', function (e) {
        (e.target as L.Polyline).setStyle({ weight: 5, opacity: 0.65 });
      });

      // User click: switch active route to this candidate!
      polyline.on('click', () => {
        setSelectedRoute(route);
      });

      polyline.bindTooltip(
        `<div style="font-family: inherit; font-size: 11px; padding: 2px;">
          <strong style="color: #1d4ed8;">${route.name}</strong><br/>
          <span>ETA: <b>${route.currentEtaMin} min</b> (${route.distanceKm} km)</span><br/>
          <span style="color: #2563eb; font-size: 10px; font-weight: bold;">Click route to select</span>
        </div>`,
        { sticky: true, direction: 'top' }
      );

      polyline.addTo(routesGroup);

      // Midpoint ETA Pill for alternative route (Interactive Google Maps style)
      const fraction = 0.36 + (idx * 0.18);
      const midIdx = Math.floor(latLngs.length * Math.min(0.72, fraction));
      const midPoint = latLngs[midIdx] as [number, number];

      if (midPoint) {
        const altPillIcon = L.divIcon({
          className: 'route-eta-pill-alt',
          html: `
            <div style="
              background: #1d4ed8;
              color: #ffffff;
              padding: 3px 8px;
              border-radius: 9999px;
              font-family: inherit;
              font-size: 11px;
              font-weight: 700;
              box-shadow: 0 2px 8px rgba(0,0,0,0.3);
              border: 2px solid #ffffff;
              cursor: pointer;
              display: flex;
              align-items: center;
              gap: 4px;
              white-space: nowrap;
              transition: transform 0.15s ease, background 0.15s ease;
            " onmouseover="this.style.transform='scale(1.08)'; this.style.background='#1e40af'" onmouseout="this.style.transform='scale(1)'; this.style.background='#1d4ed8'">
              <span>${route.currentEtaMin} min</span>
              <span style="font-size: 9px; opacity: 0.85; font-weight: normal;">(${route.distanceKm} km)</span>
            </div>
          `,
          iconSize: [85, 24],
          iconAnchor: [42, 12]
        });

        const pillMarker = L.marker(midPoint, { icon: altPillIcon, interactive: true });
        pillMarker.on('click', () => setSelectedRoute(route));
        pillMarker.addTo(routesGroup);
      }
    });

    // 2. RENDER ACTIVE / OPTIMAL SELECTED ROUTE (Prominently Highlighted with Outer Glow)
    if (activeRoute) {
      const activeLatLngs = extractLatLngs(activeRoute);
      if (activeLatLngs.length > 0) {
        activeLatLngs.forEach(pt => bounds.extend(pt));

        const isBarred = activeRoute.clearanceStatus === 'failed';
        const haloColor = isBarred ? '#fb7185' : '#34d399';
        const coreColor = isBarred ? '#e11d48' : '#15803d';

        // Outer glow halo polyline
        L.polyline(activeLatLngs, {
          color: haloColor,
          weight: 12,
          opacity: 0.35,
          lineCap: 'round',
          lineJoin: 'round',
          interactive: false
        }).addTo(routesGroup);

        // Core solid polyline
        const selPolyline = L.polyline(activeLatLngs, {
          color: coreColor,
          weight: 6,
          opacity: 1.0,
          lineCap: 'round',
          lineJoin: 'round',
          interactive: true
        }).addTo(routesGroup);

        selPolyline.bindTooltip(
          `<div style="font-family: inherit; font-size: 11px; padding: 2px;">
            <strong style="color: ${coreColor};">${activeRoute.name} (SELECTED)</strong><br/>
            <span>ETA: <b>${activeRoute.currentEtaMin} min</b> (${activeRoute.distanceKm} km)</span><br/>
            <span>Reliability: <b>${activeRoute.reliabilityScore}%</b> · Safety: <b>${activeRoute.safetyScore}%</b></span>
          </div>`,
          { sticky: true, direction: 'top' }
        );

        // Active Route ETA Pill
        const activeMidIdx = Math.floor(activeLatLngs.length * 0.52);
        const activeMidPoint = activeLatLngs[activeMidIdx] as [number, number];
        if (activeMidPoint) {
          const activePillIcon = L.divIcon({
            className: 'route-eta-pill-active',
            html: `
              <div style="
                background: ${isBarred ? '#be123c' : '#166534'};
                color: #ffffff;
                padding: 4px 11px;
                border-radius: 9999px;
                font-family: inherit;
                font-size: 11.5px;
                font-weight: 800;
                box-shadow: 0 4px 12px rgba(0,0,0,0.35);
                border: 2px solid #ffffff;
                display: flex;
                align-items: center;
                gap: 6px;
                white-space: nowrap;
              ">
                <span style="display: inline-block; width: 7px; height: 7px; border-radius: 50%; background: #4ade80; box-shadow: 0 0 6px #4ade80;"></span>
                <span>${activeRoute.currentEtaMin} min</span>
                <span style="background: rgba(255,255,255,0.25); padding: 1px 5px; border-radius: 4px; font-size: 9px; font-weight: 700; letter-spacing: 0.5px;">SELECTED</span>
              </div>
            `,
            iconSize: [120, 28],
            iconAnchor: [60, 14]
          });

          L.marker(activeMidPoint, { icon: activePillIcon, interactive: false }).addTo(routesGroup);
        }

        setRouteInfo({
          distanceKm: activeRoute.distanceKm,
          durationMin: activeRoute.currentEtaMin,
          name: activeRoute.name
        });
      }
    }

    // 3. RENDER ORIGIN (A) & DESTINATION (B) PINS
    const primaryRoute = activeRoute || candidateRoutes[0];
    const primaryLatLngs = extractLatLngs(primaryRoute);

    if (primaryLatLngs.length > 1) {
      const originPt = primaryLatLngs[0] as [number, number];
      const destPt = primaryLatLngs[primaryLatLngs.length - 1] as [number, number];

      // Origin Pin (A)
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

      L.marker(originPt, { icon: originIcon })
        .bindPopup(`
          <div style="font-family: inherit; min-width: 190px; padding: 2px;">
            <div style="display: flex; align-items: center; gap: 6px; margin-bottom: 3px;">
              <span style="display:inline-block; width: 10px; height: 10px; border-radius: 50%; background: #166534;"></span>
              <strong style="color: #166534; font-size: 13px;">ORIGIN (START)</strong>
            </div>
            <div style="font-size: 11.5px; color: #1e293b; font-weight: 700;">${startLocation || 'Noida Sector 62'}</div>
            <div style="font-size: 10px; color: #64748b; margin-top: 2px;">Fleet Logistics Hub · Staging Bay #4</div>
          </div>
        `)
        .addTo(markersGroup);

      // Destination Pin (B)
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

      L.marker(destPt, { icon: destIcon })
        .bindPopup(`
          <div style="font-family: inherit; min-width: 190px; padding: 2px;">
            <div style="display: flex; align-items: center; gap: 6px; margin-bottom: 3px;">
              <span style="display:inline-block; width: 10px; height: 10px; border-radius: 50%; background: #b91c1c;"></span>
              <strong style="color: #b91c1c; font-size: 13px;">DESTINATION (TARGET)</strong>
            </div>
            <div style="font-size: 11.5px; color: #1e293b; font-weight: 700;">${destinationLocation || 'Connaught Place, New Delhi'}</div>
            <div style="font-size: 10px; color: #64748b; margin-top: 2px;">Central Distribution Point</div>
          </div>
        `)
        .addTo(markersGroup);

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
  }, [candidateRoutes, selectedRoute, selectedVehicle, startLocation, destinationLocation]);

  // Real-time geocoding search handler
  const handleSearch = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!searchQuery.trim()) return;

    setIsSearching(true);
    try {
      const res = await fetch(`/api/map/geocode?q=${encodeURIComponent(searchQuery)}`);
      const results = await res.json();

      if (results && results.length > 0) {
        setSearchResults(results);
        const top = results[0];
        const newLat = parseFloat(top.lat);
        const newLon = parseFloat(top.lon);

        if (!isNaN(newLat) && !isNaN(newLon) && mapInstanceRef.current) {
          mapInstanceRef.current.flyTo([newLat, newLon], 14, { duration: 1.5 });
        }
      }
    } catch (err) {
      console.warn('Geocoding search error:', err);
    } finally {
      setIsSearching(false);
    }
  };

  const handleSelectResult = (item: any) => {
    const lat = parseFloat(item.lat);
    const lon = parseFloat(item.lon);
    if (!isNaN(lat) && !isNaN(lon)) {
      setSearchResults([]);
      setSearchQuery(item.display_name.split(',')[0]);
      if (mapInstanceRef.current) {
        mapInstanceRef.current.flyTo([lat, lon], 14, { duration: 1.2 });
      }
    }
  };

  return (
    <div className={`relative isolate z-0 w-full ${heightClass} bg-slate-100 rounded-2xl overflow-hidden border border-slate-200 shadow-sm text-left select-none`}>
      {/* Search Header Bar (Real-Time OSM Geocoding) */}
      <div className="absolute top-3 left-3 right-3 sm:right-auto sm:w-96 z-10">
        <form onSubmit={handleSearch} className="relative flex items-center shadow-md rounded-xl">
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search address or location worldwide..."
            className="w-full bg-white/95 backdrop-blur-md border border-slate-200 rounded-xl pl-9 pr-20 py-2 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-[#166534] font-medium"
          />
          <Search className="w-4 h-4 text-slate-400 absolute left-3 pointer-events-none" />
          <button
            type="submit"
            disabled={isSearching}
            className="absolute right-1 px-3 py-1 rounded-lg bg-[#166534] hover:bg-[#14532d] text-white text-xs font-bold transition flex items-center space-x-1"
          >
            {isSearching ? <Loader2 className="w-3 h-3 animate-spin" /> : <span>Search</span>}
          </button>
        </form>

        {/* Autocomplete dropdown */}
        {searchResults.length > 1 && (
          <div className="mt-1 bg-white border border-slate-200 rounded-xl shadow-lg overflow-hidden text-xs max-h-48 overflow-y-auto">
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

      {/* Live Route Telemetry HUD Pill */}
      {routeInfo && (
        <div className="absolute top-14 right-3 z-10 bg-white/95 backdrop-blur-md px-3.5 py-1.5 rounded-xl border border-slate-200 shadow-md flex items-center space-x-3 text-xs">
          <div className="flex items-center space-x-1.5">
            <Navigation className="w-3.5 h-3.5 text-[#166534]" />
            <span className="font-bold text-slate-900">{routeInfo.distanceKm} km</span>
          </div>
          <span className="text-slate-300">|</span>
          <div className="text-slate-700 font-bold">
            <span>{routeInfo.durationMin} min ETA</span>
          </div>
          <span className="text-slate-300">|</span>
          <span className="text-[10px] font-mono font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
            GOOGLE-STYLE MULTI-ROUTE
          </span>
        </div>
      )}

      {/* Leaflet Map DOM Container */}
      <div ref={mapContainerRef} className="w-full h-full" style={{ minHeight: '100%' }} />

      {/* Map Interactive Legend */}
      <div className="absolute bottom-3 left-3 z-10 bg-white/95 backdrop-blur-md px-3 py-2 rounded-xl border border-slate-200 shadow-md flex flex-wrap items-center gap-3.5 text-[11px] text-slate-700 font-semibold pointer-events-auto">
        <div className="flex items-center space-x-1.5">
          <span className="w-3.5 h-3.5 rounded-full bg-[#166534] border-2 border-white shadow-xs inline-block" />
          <span>Active Route</span>
        </div>
        <div className="flex items-center space-x-1.5">
          <span className="w-3.5 h-3.5 rounded-full bg-[#3b82f6] border-2 border-white shadow-xs inline-block" />
          <span>Alt Corridor (Click to select)</span>
        </div>
        <div className="flex items-center space-x-1.5">
          <span className="text-sm leading-none">💥</span>
          <span>Accident</span>
        </div>
        <div className="flex items-center space-x-1.5">
          <span className="text-sm leading-none">🌧️</span>
          <span>Weather Alert</span>
        </div>
        <div className="flex items-center space-x-1.5">
          <span className="text-sm leading-none">🚧</span>
          <span>Underpass (3.8m)</span>
        </div>
      </div>
    </div>
  );
};
