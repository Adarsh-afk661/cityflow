import { searchDelhiPlaces, DELHI_NCR_PLACES } from './delhiPlaces';

export interface GeocodedLocation {
  display_name: string;
  short_name: string;
  area: string;
  lat: number;
  lon: number;
  source: 'google' | 'osm' | 'local';
}

/**
 * Searches for locations matching a query using Google Maps Geocoder,
 * direct OpenStreetMap Nominatim, and high-precision Delhi-NCR places catalog.
 */
export async function searchLocations(query: string): Promise<GeocodedLocation[]> {
  const cleanQ = query.trim();
  if (cleanQ.length < 2) return [];

  const results: GeocodedLocation[] = [];
  const seen = new Set<string>();

  const addResult = (item: GeocodedLocation) => {
    const key = `${item.lat.toFixed(3)},${item.lon.toFixed(3)}`;
    if (!seen.has(key)) {
      seen.add(key);
      results.push(item);
    }
  };

  // 1. Instant match from comprehensive local Delhi-NCR logistics index
  try {
    const localMatches = searchDelhiPlaces(cleanQ, 8);
    localMatches.forEach(p => {
      addResult({
        display_name: p.name,
        short_name: p.name.split('(')[0].trim(),
        area: p.area,
        lat: p.lat,
        lon: p.lon,
        source: 'local'
      });
    });
  } catch (e) {
    console.warn('[Geocoder] Local place search error:', e);
  }

  // 2. Google Maps Geocoder in Browser if available
  if (typeof window !== 'undefined' && (window as any).google?.maps?.Geocoder) {
    try {
      const googleGeocoder = new (window as any).google.maps.Geocoder();
      const googleRes = await new Promise<any[]>((resolve) => {
        googleGeocoder.geocode(
          {
            address: cleanQ.includes('delhi') || cleanQ.includes('noida') || cleanQ.includes('gurgaon')
              ? cleanQ
              : `${cleanQ}, Delhi NCR, India`,
            region: 'IN'
          },
          (res: any[], status: string) => {
            if (status === 'OK' && Array.isArray(res)) resolve(res);
            else resolve([]);
          }
        );
      });

      googleRes.slice(0, 5).forEach((r: any) => {
        const lat = r.geometry.location.lat();
        const lon = r.geometry.location.lng();
        const name = r.formatted_address || cleanQ;
        addResult({
          display_name: name,
          short_name: r.address_components?.[0]?.long_name || cleanQ,
          area: r.address_components?.[1]?.long_name || 'Delhi NCR',
          lat,
          lon,
          source: 'google'
        });
      });
    } catch (e) {
      console.warn('[Geocoder] Google Geocode notice:', e);
    }
  }

  // 3. Direct Public OpenStreetMap Nominatim API (Works client-side directly anywhere)
  try {
    const osmUrl = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
      cleanQ.includes('delhi') || cleanQ.includes('noida') || cleanQ.includes('gurugram') || cleanQ.includes('india')
        ? cleanQ
        : `${cleanQ} Delhi NCR India`
    )}&limit=6&addressdetails=1`;

    const res = await fetch(osmUrl, {
      headers: { 'Accept-Language': 'en' },
      signal: AbortSignal.timeout(3500)
    });

    if (res.ok) {
      const osmData = await res.json();
      if (Array.isArray(osmData)) {
        osmData.forEach((item: any) => {
          const lat = parseFloat(item.lat);
          const lon = parseFloat(item.lon);
          if (!isNaN(lat) && !isNaN(lon)) {
            const shortName = item.name || item.display_name.split(',')[0];
            const area = item.address?.city || item.address?.state_district || item.address?.suburb || 'Delhi NCR';
            addResult({
              display_name: item.display_name,
              short_name: shortName,
              area: area,
              lat,
              lon,
              source: 'osm'
            });
          }
        });
      }
    }
  } catch (e) {
    console.warn('[Geocoder] Nominatim notice:', e);
  }

  return results.slice(0, 10);
}

/**
 * Resolves a single query string to exact [lat, lon] coordinates.
 * Handles coordinates like "28.6139, 77.2090", exact places, or arbitrary search queries.
 */
export async function resolveLocationCoordinates(
  query: string,
  fallback: [number, number] = [28.6139, 77.2090]
): Promise<{ name: string; coords: [number, number] }> {
  if (!query || !query.trim()) {
    return { name: 'Unknown Location', coords: fallback };
  }

  const clean = query.trim();

  // 1. Direct coordinate format check: "28.6328, 77.2197" or "28.6328 77.2197"
  const coordRegex = /^([-+]?\d{1,2}\.\d+)[,\s]+([-+]?\d{1,3}\.\d+)$/;
  const match = clean.match(coordRegex);
  if (match) {
    const lat = parseFloat(match[1]);
    const lon = parseFloat(match[2]);
    if (!isNaN(lat) && !isNaN(lon) && Math.abs(lat) <= 90 && Math.abs(lon) <= 180) {
      return { name: `Coordinates (${lat.toFixed(4)}, ${lon.toFixed(4)})`, coords: [lat, lon] };
    }
  }

  // 2. Direct exact match in local Delhi-NCR database
  const localMatch = DELHI_NCR_PLACES.find(
    p => p.name.toLowerCase() === clean.toLowerCase() ||
         p.name.toLowerCase().includes(clean.toLowerCase())
  );
  if (localMatch) {
    return { name: localMatch.name, coords: [localMatch.lat, localMatch.lon] };
  }

  // 3. Search using multi-source searchLocations
  const candidates = await searchLocations(clean);
  if (candidates.length > 0) {
    return {
      name: candidates[0].display_name,
      coords: [candidates[0].lat, candidates[0].lon]
    };
  }

  // 4. Heuristic Sector match (e.g. "Sector 62", "Dwarka Sector 21", "Rohini Sector 18")
  const secMatch = clean.match(/sector\s*[-–]?\s*(\d{1,3})/i);
  if (secMatch) {
    const secNum = parseInt(secMatch[1], 10);
    const qLower = clean.toLowerCase();
    if (qLower.includes('noida')) {
      return {
        name: `Noida Sector ${secNum}`,
        coords: [+(28.5300 + (secNum % 30) * 0.0035).toFixed(4), +(77.3300 + Math.floor(secNum / 20) * 0.004).toFixed(4)]
      };
    }
    if (qLower.includes('gurgaon') || qLower.includes('gurugram')) {
      return {
        name: `Gurugram Sector ${secNum}`,
        coords: [+(28.4400 + (secNum % 30) * 0.0035).toFixed(4), +(77.0300 + Math.floor(secNum / 20) * 0.005).toFixed(4)]
      };
    }
    if (qLower.includes('dwarka')) {
      return {
        name: `Dwarka Sector ${secNum}`,
        coords: [+(28.5700 + (secNum % 15) * 0.003).toFixed(4), +(77.0400 + Math.floor(secNum / 10) * 0.004).toFixed(4)]
      };
    }
    if (qLower.includes('rohini')) {
      return {
        name: `Rohini Sector ${secNum}`,
        coords: [+(28.7100 + (secNum % 20) * 0.003).toFixed(4), +(77.1000 + Math.floor(secNum / 12) * 0.004).toFixed(4)]
      };
    }
  }

  return { name: clean, coords: fallback };
}
