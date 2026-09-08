import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import { Search, Loader2, Navigation, AlertTriangle, CheckCircle2, RotateCcw, MapPin } from 'lucide-react';
import { useCityFlow } from '../../context/CityFlowContext';

interface RealTimeOSMMapProps {
  heightClass?: string;
}

export const RealTimeOSMMap: React.FC<RealTimeOSMMapProps> = ({
  heightClass = 'h-[520px]'
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const routeLayerRef = useRef<L.Polyline | null>(null);
  const markersGroupRef = useRef<L.LayerGroup | null>(null);

  const { selectedRoute, selectedVehicle } = useCityFlow();

  const [searchQuery, setSearchQuery] = useState('Central Logistics Hub');
  const [isSearching, setIsSearching] = useState(false);
  const [routeInfo, setRouteInfo] = useState<{ distanceKm: number; durationMin: number; source: string } | null>(null);
  const [searchResults, setSearchResults] = useState<any[]>([]);

  // Default coordinate center: New Delhi Freight Hub (28.6139, 77.2090)
  const [currentCenter, setCurrentCenter] = useState<[number, number]>([28.6139, 77.2090]);

  // Initialize Leaflet map
  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (!mapInstanceRef.current) {
      const map = L.map(mapContainerRef.current, {
        center: currentCenter,
        zoom: 13,
        zoomControl: false
      });

      // Crisp, light OpenStreetMap Carto Voyager tiles
      L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>, &copy; <a href="https://carto.com/">CARTO</a>',
        subdomains: 'abcd',
        maxZoom: 19
      }).addTo(map);

      // Add zoom control in bottom right
      L.control.zoom({ position: 'bottomright' }).addTo(map);

      // Create markers layer group
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

  // Fetch real-time OSRM driving route when center or selected corridor changes
  useEffect(() => {
    if (!mapInstanceRef.current) return;

    const fetchLiveRoute = async () => {
      // Calculate realistic destination ~5-8km away based on center
      const [lat, lon] = currentCenter;
      const destLat = lat + 0.055;
      const destLon = lon + 0.045;

      try {
        const res = await fetch(`/api/map/route?start=${lat},${lon}&end=${destLat},${destLon}`);
        const data = await res.json();

        if (data.success && data.coordinates && mapInstanceRef.current) {
          setRouteInfo({
            distanceKm: data.distanceKm,
            durationMin: data.durationMin,
            source: data.source
          });

          // Convert [lon, lat] to Leaflet [lat, lon]
          const latLngs: L.LatLngExpression[] = data.coordinates.map((c: [number, number]) => [c[1], c[0]]);

          // Remove old route polyline
          if (routeLayerRef.current) {
            mapInstanceRef.current.removeLayer(routeLayerRef.current);
          }

          // Draw real road route polyline
          const isBarred = selectedRoute?.clearanceStatus === 'failed';
          const polyline = L.polyline(latLngs, {
            color: isBarred ? '#e11d48' : '#166534',
            weight: 5,
            opacity: 0.9,
            lineCap: 'round',
            lineJoin: 'round'
          }).addTo(mapInstanceRef.current);

          routeLayerRef.current = polyline;

          // Update markers
          if (markersGroupRef.current) {
            markersGroupRef.current.clearLayers();

            // Start Origin Marker (Green)
            const startIcon = L.divIcon({
              className: 'custom-div-icon',
              html: `<div style="background-color: #166534; color: white; width: 28px; height: 28px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 11px; font-weight: bold; border: 2px solid white; box-shadow: 0 2px 5px rgba(0,0,0,0.3);">A</div>`,
              iconSize: [28, 28],
              iconAnchor: [14, 14]
            });
            L.marker([lat, lon], { icon: startIcon })
              .bindPopup(`<strong>Origin: Dispatch Depot</strong><br>Clearance Approved`)
              .addTo(markersGroupRef.current);

            // Destination Marker (Blue)
            const destIcon = L.divIcon({
              className: 'custom-div-icon',
              html: `<div style="background-color: #1e3a8a; color: white; width: 28px; height: 28px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 11px; font-weight: bold; border: 2px solid white; box-shadow: 0 2px 5px rgba(0,0,0,0.3);">B</div>`,
              iconSize: [28, 28],
              iconAnchor: [14, 14]
            });
            L.marker([destLat, destLon], { icon: destIcon })
              .bindPopup(`<strong>Destination: Distribution Center</strong><br>ETA: ${data.durationMin} min (${data.distanceKm} km)`)
              .addTo(markersGroupRef.current);

            // Midpoint Clearance Underpass Marker
            const midPoint = latLngs[Math.floor(latLngs.length / 2)] as [number, number];
            if (midPoint) {
              const clearanceIcon = L.divIcon({
                className: 'custom-div-icon',
                html: `<div style="background-color: ${isBarred ? '#e11d48' : '#d97706'}; color: white; width: 26px; height: 26px; border-radius: 6px; display: flex; align-items: center; justify-content: center; font-size: 12px; font-weight: bold; border: 2px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.25);">▼</div>`,
                iconSize: [26, 26],
                iconAnchor: [13, 13]
              });
              L.marker(midPoint, { icon: clearanceIcon })
                .bindPopup(`<strong>Underpass Checkpoint</strong><br>Max Clearance: 3.8m<br>${selectedVehicle ? `Vehicle: ${selectedVehicle.height}m (${selectedVehicle.height > 3.8 ? '⚠️ BARRED' : '✓ CLEAR'})` : ''}`)
                .addTo(markersGroupRef.current);
            }
          }

          mapInstanceRef.current.fitBounds(polyline.getBounds(), { padding: [40, 40] });
        }
      } catch (err) {
        console.warn('Could not fetch real-time route:', err);
      }
    };

    fetchLiveRoute();
  }, [currentCenter, selectedRoute, selectedVehicle]);

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

        if (!isNaN(newLat) && !isNaN(newLon)) {
          setCurrentCenter([newLat, newLon]);
          if (mapInstanceRef.current) {
            mapInstanceRef.current.flyTo([newLat, newLon], 13, { duration: 1.5 });
          }
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
      setCurrentCenter([lat, lon]);
      setSearchResults([]);
      setSearchQuery(item.display_name.split(',')[0]);
      if (mapInstanceRef.current) {
        mapInstanceRef.current.flyTo([lat, lon], 14, { duration: 1.2 });
      }
    }
  };

  return (
    <div className={`relative w-full ${heightClass} bg-slate-100 rounded-2xl overflow-hidden border border-slate-200 shadow-sm text-left`}>
      {/* Search Header Bar (Real-Time OSM Geocoding) */}
      <div className="absolute top-3 left-3 right-3 sm:right-auto sm:w-96 z-[1000]">
        <form onSubmit={handleSearch} className="relative flex items-center shadow-md rounded-xl">
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search any city or address worldwide..."
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
        <div className="absolute top-3 right-3 z-[1000] bg-white/95 backdrop-blur-md px-3.5 py-1.5 rounded-xl border border-slate-200 shadow-md flex items-center space-x-3 text-xs">
          <div className="flex items-center space-x-1.5">
            <Navigation className="w-3.5 h-3.5 text-[#166534]" />
            <span className="font-bold text-slate-900">{routeInfo.distanceKm} km</span>
          </div>
          <span className="text-slate-300">|</span>
          <div className="text-slate-600 font-medium">
            <span>{routeInfo.durationMin} min ETA</span>
          </div>
          <span className="text-slate-300">|</span>
          <span className="text-[10px] font-mono font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
            LIVE OSRM ROAD TILES
          </span>
        </div>
      )}

      {/* Leaflet Map DOM Container */}
      <div ref={mapContainerRef} className="w-full h-full" style={{ minHeight: '100%' }} />

      {/* Map Legend & Layer Attribution */}
      <div className="absolute bottom-3 left-3 z-[1000] bg-white/95 backdrop-blur-md px-3 py-1.5 rounded-lg border border-slate-200 shadow-sm flex items-center space-x-4 text-[11px] text-slate-700 font-medium pointer-events-auto">
        <div className="flex items-center space-x-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-[#166534]" />
          <span>Origin (A)</span>
        </div>
        <div className="flex items-center space-x-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-[#1e3a8a]" />
          <span>Destination (B)</span>
        </div>
        <div className="flex items-center space-x-1.5">
          <span className="w-2.5 h-2.5 rounded-sm bg-[#d97706]" />
          <span>Underpass Check</span>
        </div>
      </div>
    </div>
  );
};
