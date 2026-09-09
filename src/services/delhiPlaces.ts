export interface PlaceItem {
  id: string;
  name: string;
  area: string;
  category: 'commercial' | 'logistics' | 'metro' | 'landmark' | 'industrial' | 'residential';
  lat: number;
  lon: number;
  description?: string;
}

export const DELHI_NCR_PLACES: PlaceItem[] = [
  // Central Delhi
  { id: 'del-cp', name: 'Connaught Place (Rajiv Chowk)', area: 'Central Delhi', category: 'commercial', lat: 28.6328, lon: 77.2197, description: 'Commercial Hub, Inner & Outer Circle' },
  { id: 'del-india-gate', name: 'India Gate & Kartavya Path', area: 'Central Delhi', category: 'landmark', lat: 28.6129, lon: 77.2295, description: 'Central Vista & Diplomatic Perimeter' },
  { id: 'del-karol-bagh', name: 'Karol Bagh Market', area: 'Central Delhi', category: 'commercial', lat: 28.6514, lon: 77.1907, description: 'Commercial and Automobile Distribution District' },
  { id: 'del-pahar-ganj', name: 'Paharganj & New Delhi Railway Station', area: 'Central Delhi', category: 'logistics', lat: 28.6429, lon: 77.2193, description: 'Central Rail Freight & Passenger Terminal' },
  { id: 'del-chandni-chowk', name: 'Chandni Chowk & Old Delhi Station', area: 'Central Delhi', category: 'commercial', lat: 28.6562, lon: 77.2300, description: 'Historic Wholesale Commercial Market' },
  { id: 'del-kashmere-gate', name: 'Kashmere Gate ISBT & Metro Interchange', area: 'Central Delhi', category: 'logistics', lat: 28.6675, lon: 77.2285, description: 'Interstate Bus Terminal & Multi-modal Hub' },
  { id: 'del-civil-lines', name: 'Civil Lines', area: 'Central Delhi', category: 'residential', lat: 28.6814, lon: 77.2227, description: 'Administrative & Heritage Corridor' },
  { id: 'del-ito', name: 'ITO Crossing & Pragati Maidan (Bharat Mandapam)', area: 'Central Delhi', category: 'commercial', lat: 28.6253, lon: 77.2435, description: 'Institutional Corridor & International Trade Centre' },

  // South Delhi
  { id: 'del-saket', name: 'Saket (Select Citywalk & District Centre)', area: 'South Delhi', category: 'commercial', lat: 28.5284, lon: 77.2185, description: 'South Delhi Commercial & Retail Hub' },
  { id: 'del-hauz-khas', name: 'Hauz Khas & IIT Delhi', area: 'South Delhi', category: 'landmark', lat: 28.5494, lon: 77.1932, description: 'Institutional and Urban Corridor' },
  { id: 'del-lajpat-nagar', name: 'Lajpat Nagar Central Market', area: 'South Delhi', category: 'commercial', lat: 28.5677, lon: 77.2433, description: 'Major South Commercial Trade Zone' },
  { id: 'del-south-ex', name: 'South Extension (Part I & II)', area: 'South Delhi', category: 'commercial', lat: 28.5714, lon: 77.2212, description: 'Ring Road Commercial Belt' },
  { id: 'del-aiims', name: 'AIIMS & Safdarjung Hospital Flyover', area: 'South Delhi', category: 'landmark', lat: 28.5672, lon: 77.2100, description: 'Major Ring Road Interchange' },
  { id: 'del-nehru-place', name: 'Nehru Place Commercial Complex', area: 'South Delhi', category: 'commercial', lat: 28.5494, lon: 77.2536, description: 'IT & Hardware Commercial District' },
  { id: 'del-okhla-ind-3', name: 'Okhla Industrial Area Phase III', area: 'South Delhi', category: 'industrial', lat: 28.5412, lon: 77.2721, description: 'Industrial & Freight Logistics Cluster' },
  { id: 'del-okhla-ind-1', name: 'Okhla Industrial Area Phase I', area: 'South Delhi', category: 'industrial', lat: 28.5204, lon: 77.2831, description: 'Heavy Commercial & Warehousing Zone' },
  { id: 'del-vasant-kunj', name: 'Vasant Kunj Commercial Hub (DLF Promenade)', area: 'South Delhi', category: 'commercial', lat: 28.5402, lon: 77.1565, description: 'Airport Perimeter Commercial Belt' },
  { id: 'del-kalkaji', name: 'Kalkaji & Lotus Temple', area: 'South Delhi', category: 'landmark', lat: 28.5535, lon: 77.2588, description: 'South East Residential & Commercial Corridor' },
  { id: 'del-sarita-vihar', name: 'Sarita Vihar & Mathura Road NH44', area: 'South Delhi', category: 'logistics', lat: 28.5312, lon: 77.2941, description: 'Delhi-Faridabad Industrial Gateway' },
  { id: 'del-badarpur', name: 'Badarpur Border & Toll Plaza', area: 'South Delhi', category: 'logistics', lat: 28.5028, lon: 77.3069, description: 'NH44 Interstate Freight Border' },

  // South-West & Airport
  { id: 'del-igi-t3', name: 'Indira Gandhi International Airport (IGI T3 Cargo)', area: 'South West Delhi', category: 'logistics', lat: 28.5562, lon: 77.1000, description: 'International Air Freight & Logistics Hub' },
  { id: 'del-aerocity', name: 'Aerocity Hospitality & Commercial District', area: 'South West Delhi', category: 'commercial', lat: 28.5501, lon: 77.1207, description: 'High-speed Airport Expressway Corridor' },
  { id: 'del-dwarka-sec21', name: 'Dwarka Sector 21 Multi-modal Transit Hub', area: 'South West Delhi', category: 'metro', lat: 28.5524, lon: 77.0581, description: 'Dwarka Expressway & Airport Express Interchange' },
  { id: 'del-dwarka-sec10', name: 'Dwarka Sector 10 District Centre', area: 'South West Delhi', category: 'commercial', lat: 28.5815, lon: 77.0573, description: 'South-West Sub-city Commercial Core' },
  { id: 'del-dwarka-expwy', name: 'Dwarka Expressway (NH 248-BB) Interchange', area: 'South West Delhi', category: 'logistics', lat: 28.5305, lon: 77.0125, description: 'High-speed Elevated 8-lane Freight Viaduct' },
  { id: 'del-dhaula-kuan', name: 'Dhaula Kuan Flyover & Army Cantonment', area: 'South West Delhi', category: 'logistics', lat: 28.5912, lon: 77.1620, description: 'Crucial Intersection connecting NH48 and Ring Road' },
  { id: 'del-cantt-rly', name: 'Delhi Cantonment Railway Station', area: 'South West Delhi', category: 'logistics', lat: 28.5985, lon: 77.1265, description: 'Western Rail Freight Corridors' },

  // West Delhi
  { id: 'del-janakpuri', name: 'Janakpuri District Centre', area: 'West Delhi', category: 'commercial', lat: 28.6297, lon: 77.0792, description: 'Major West Delhi Institutional & Retail Hub' },
  { id: 'del-punjabi-bagh', name: 'Punjabi Bagh Club & Ring Road Flyover', area: 'West Delhi', category: 'logistics', lat: 28.6685, lon: 77.1275, description: 'West Ring Road Intersection & Rohtak Road link' },
  { id: 'del-rajouri-garden', name: 'Rajouri Garden Ring Road', area: 'West Delhi', category: 'commercial', lat: 28.6472, lon: 77.1215, description: 'Central West Commercial Belt' },
  { id: 'del-paschim-vihar', name: 'Paschim Vihar Outer Ring Road', area: 'West Delhi', category: 'residential', lat: 28.6710, lon: 77.0980, description: 'Outer Ring Corridor connecting Peeragarhi' },
  { id: 'del-peeragarhi', name: 'Peeragarhi Chowk (Rohtak Road NH9)', area: 'West Delhi', category: 'logistics', lat: 28.6791, lon: 77.0935, description: 'Major Freight Interchange to Haryana/Punjab' },

  // North & North-West Delhi
  { id: 'del-rohini-sec18', name: 'Rohini Sector 18 Commercial Hub', area: 'North West Delhi', category: 'commercial', lat: 28.7425, lon: 77.1350, description: 'North-West Delhi Sub-city Corridor' },
  { id: 'del-rohini-sec10', name: 'Rohini Sector 10 (City Centre & Metro Walk)', area: 'North West Delhi', category: 'commercial', lat: 28.7150, lon: 77.1142, description: 'District Hub & Shopping District' },
  { id: 'del-rohini-sec3', name: 'Rohini Sector 3 & Madhuban Chowk', area: 'North West Delhi', category: 'logistics', lat: 28.6990, lon: 77.1245, description: 'Outer Ring Road North-West Junction' },
  { id: 'del-pitampura', name: 'Pitampura (Netaji Subhash Place - NSP)', area: 'North West Delhi', category: 'commercial', lat: 28.6917, lon: 77.1519, description: 'High-density Commercial Tower District' },
  { id: 'del-azadpur', name: 'Azadpur Mandi Wholesale Agricultural Hub', area: 'North Delhi', category: 'logistics', lat: 28.7125, lon: 77.1775, description: "Asia's Largest Wholesale Produce Terminal" },
  { id: 'del-alipur-icd', name: 'Alipur Inland Container Depot & GT Karnal Rd', area: 'North Delhi', category: 'industrial', lat: 28.7980, lon: 77.1350, description: 'NH44 North Heavy Freight Hub' },
  { id: 'del-kundli', name: 'Kundli Border (Delhi-Sonipat Border)', area: 'North Delhi Border', category: 'industrial', lat: 28.8710, lon: 77.1250, description: 'KMP Expressway & North Logistics Gateway' },
  { id: 'del-model-town', name: 'Model Town Ring Road', area: 'North Delhi', category: 'residential', lat: 28.7025, lon: 77.1945, description: 'Northern Arterial Belt' },

  // East Delhi & Trans-Yamuna
  { id: 'del-laxmi-nagar', name: 'Laxmi Nagar Metro & Vikas Marg', area: 'East Delhi', category: 'commercial', lat: 28.6308, lon: 77.2773, description: 'High-density East Delhi Commercial Arterial' },
  { id: 'del-anand-vihar-isbt', name: 'Anand Vihar ISBT & Railway Terminal', area: 'East Delhi', category: 'logistics', lat: 28.6475, lon: 77.3150, description: 'Interstate Rail, Bus & Metro Hub' },
  { id: 'del-mayur-vihar-1', name: 'Mayur Vihar Phase 1 & Noida Link Rd', area: 'East Delhi', category: 'residential', lat: 28.6045, lon: 77.2985, description: 'Link Corridor between Central Delhi and Noida' },
  { id: 'del-akshardham', name: 'Akshardham Setu & NH9 Viaduct', area: 'East Delhi', category: 'landmark', lat: 28.6125, lon: 77.2770, description: 'NH9 High-speed Flyover to Ghaziabad' },
  { id: 'del-ghazipur-icd', name: 'Ghazipur Container Depot & Mandi', area: 'East Delhi', category: 'logistics', lat: 28.6265, lon: 77.3295, description: 'Eastern Logistics & Wholesale Meat/Fish Terminal' },
  { id: 'del-dilshad-garden', name: 'Dilshad Garden & GT Road Border', area: 'East Delhi', category: 'logistics', lat: 28.6765, lon: 77.3205, description: 'Delhi-Ghaziabad Northern Arterial Link' },

  // Noida & Greater Noida
  { id: 'noida-sec18', name: 'Noida Sector 18 (Atta Market & DLF Mall)', area: 'Noida', category: 'commercial', lat: 28.5695, lon: 77.3235, description: 'Noida Central Commercial District' },
  { id: 'noida-sec62', name: 'Noida Sector 62 (Electronic City & NH9 Link)', area: 'Noida', category: 'commercial', lat: 28.6280, lon: 77.3649, description: 'IT Sector & Eastern Expressway Access' },
  { id: 'noida-sec126', name: 'Noida Sector 126 (Expressway Logistics Belt)', area: 'Noida', category: 'industrial', lat: 28.5390, lon: 77.3480, description: 'Noida-Greater Noida Expressway Front' },
  { id: 'noida-sec137', name: 'Noida Sector 137 Metro & Residential Corridor', area: 'Noida', category: 'residential', lat: 28.5085, lon: 77.4080, description: 'Mid-Expressway Link Corridor' },
  { id: 'noida-sec142', name: 'Noida Sector 142 (Advant Navis Business Park)', area: 'Noida', category: 'commercial', lat: 28.4985, lon: 77.4210, description: 'Corporate & Freight Staging Zone' },
  { id: 'noida-dnd', name: 'DND Flyway Toll Plaza (Yamuna Crossing)', area: 'Noida / South Delhi', category: 'logistics', lat: 28.5830, lon: 77.2970, description: 'High-capacity 8-lane Expressway Connector' },
  { id: 'gr-noida-pari-chowk', name: 'Pari Chowk, Greater Noida', area: 'Greater Noida', category: 'landmark', lat: 28.4744, lon: 77.5040, description: 'Greater Noida Logistics & Urban Gateway' },
  { id: 'gr-noida-kp3', name: 'Knowledge Park III, Greater Noida', area: 'Greater Noida', category: 'commercial', lat: 28.4610, lon: 77.4890, description: 'Institutional and Warehousing Corridor' },
  { id: 'gr-noida-ecotech', name: 'Ecotech Industrial Area & Logistics Park', area: 'Greater Noida', category: 'industrial', lat: 28.4520, lon: 77.5210, description: 'Heavy Commercial Fleet & Multi-modal Depot' },
  { id: 'gr-noida-surajpur', name: 'Surajpur Industrial Area & Dadri Depot', area: 'Greater Noida', category: 'logistics', lat: 28.5150, lon: 77.4580, description: 'Container Freight Station & Manufacturing Belt' },

  // Gurugram (Gurgaon)
  { id: 'ggn-cyber-city', name: 'DLF Cyber City & Cyber Hub, Gurugram', area: 'Gurugram', category: 'commercial', lat: 28.4950, lon: 77.0890, description: 'NH48 Gateway & High-density Corporate Core' },
  { id: 'ggn-udyog-vihar', name: 'Udyog Vihar Phase IV Industrial Zone', area: 'Gurugram', category: 'industrial', lat: 28.5065, lon: 77.0785, description: 'Commercial Freight & Manufacturing Corridor' },
  { id: 'ggn-iffco-chowk', name: 'IFFCO Chowk Flyover & MG Road Interchange', area: 'Gurugram', category: 'logistics', lat: 28.4720, lon: 77.0725, description: 'Major Arterial Junction on NH48' },
  { id: 'ggn-rajiv-chowk', name: 'Rajiv Chowk Underpass & Sohna Road Junction', area: 'Gurugram', category: 'logistics', lat: 28.4505, lon: 77.0340, description: 'Underpass & Elevated Corridor to Sohna' },
  { id: 'ggn-golf-course', name: 'Golf Course Road (Horizon Centre & Sec 54)', area: 'Gurugram', category: 'commercial', lat: 28.4680, lon: 77.1020, description: '16-lane Underpass High-speed Boulevard' },
  { id: 'ggn-manesar-imtd', name: 'IMT Manesar Industrial Expressway Depot', area: 'Gurugram', category: 'industrial', lat: 28.3580, lon: 76.9280, description: 'Automobile & Heavy Commercial Manufacturing Base' },

  // Ghaziabad & Faridabad
  { id: 'gzb-sahibabad-ind', name: 'Sahibabad Industrial Area Site 4', area: 'Ghaziabad', category: 'industrial', lat: 28.6650, lon: 77.3480, description: 'Manufacturing & Central Freight Staging' },
  { id: 'gzb-mohan-nagar', name: 'Mohan Nagar Crossing & GT Road', area: 'Ghaziabad', category: 'logistics', lat: 28.6780, lon: 77.3820, description: 'Hindon Elevated Road Terminal' },
  { id: 'gzb-raj-nagar', name: 'Raj Nagar Extension & Elevated Bypass', area: 'Ghaziabad', category: 'residential', lat: 28.7080, lon: 77.4120, description: 'Bypass Highway connecting Meerut Expressway' },
  { id: 'fbd-bata-chowk', name: 'Bata Chowk & Mathura Road NH44, Faridabad', area: 'Faridabad', category: 'industrial', lat: 28.3890, lon: 77.3120, description: 'Heavy Engineering & Industrial Belt' },
  { id: 'fbd-ballabgarh', name: 'Ballabgarh Freight Depot & EPE Interchange', area: 'Faridabad', category: 'logistics', lat: 28.3340, lon: 77.3280, description: 'Eastern Peripheral Expressway Connector' }
];

/**
 * Searches Delhi NCR places by query string, or parses coordinate input.
 */
export function searchDelhiPlaces(query: string, maxResults: number = 8): PlaceItem[] {
  const q = (query || '').trim().toLowerCase();
  if (!q) return [];

  // 1. Check if user typed coordinates directly: "lat, lon" or "lat lon"
  const coordRegex = /^([-+]?\d+(\.\d+)?)[,\s]+([-+]?\d+(\.\d+)?)$/;
  const match = q.match(coordRegex);
  if (match) {
    const lat = parseFloat(match[1]);
    const lon = parseFloat(match[3]);
    if (!isNaN(lat) && !isNaN(lon) && Math.abs(lat) <= 90 && Math.abs(lon) <= 180) {
      return [{
        id: `custom-coords-${lat.toFixed(4)}-${lon.toFixed(4)}`,
        name: `Custom Location Coordinates (${lat.toFixed(4)}° N, ${lon.toFixed(4)}° E)`,
        area: 'Exact GPS Coordinate Input',
        category: 'landmark',
        lat,
        lon,
        description: `Direct latitude/longitude coordinate pin`
      }];
    }
  }

  // 2. Score and filter places from catalog
  const scored = DELHI_NCR_PLACES.map(place => {
    let score = 0;
    const nameLower = place.name.toLowerCase();
    const areaLower = place.area.toLowerCase();
    const descLower = (place.description || '').toLowerCase();

    if (nameLower === q) score += 100;
    else if (nameLower.startsWith(q)) score += 60;
    else if (nameLower.includes(q)) score += 40;

    if (areaLower.includes(q)) score += 25;
    if (descLower.includes(q)) score += 15;

    // Word boundary match
    const words = q.split(/\s+/);
    for (const w of words) {
      if (w.length > 1 && nameLower.includes(w)) score += 12;
      if (w.length > 1 && areaLower.includes(w)) score += 8;
    }

    return { place, score };
  })
  .filter(item => item.score > 0)
  .sort((a, b) => b.score - a.score)
  .slice(0, maxResults)
  .map(item => item.place);

  return scored;
}

/**
 * Finds the closest known place in Delhi to given coordinates
 */
export function findClosestPlace(lat: number, lon: number): PlaceItem | null {
  let closest: PlaceItem | null = null;
  let minDist = Infinity;

  for (const place of DELHI_NCR_PLACES) {
    const dLat = place.lat - lat;
    const dLon = place.lon - lon;
    const distSq = dLat * dLat + dLon * dLon;
    if (distSq < minDist) {
      minDist = distSq;
      closest = place;
    }
  }

  return closest;
}
