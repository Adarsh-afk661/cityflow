import defaultCorridorCoords from './defaultCorridorCoordinates.json';

// Helper to interpolate between two points with curvature
function generatePath(
  start: [number, number],
  dest: [number, number],
  viaPoints: [number, number][],
  segments: number = 8
): [number, number][] {
  const allWaypoints = [start, ...viaPoints, dest];
  const fullPath: [number, number][] = [];

  for (let i = 0; i < allWaypoints.length - 1; i++) {
    const p1 = allWaypoints[i];
    const p2 = allWaypoints[i + 1];
    for (let s = 0; s < segments; s++) {
      const t = s / segments;
      const lon = p1[0] + (p2[0] - p1[0]) * t;
      const lat = p1[1] + (p2[1] - p1[1]) * t;
      fullPath.push([+lon.toFixed(6), +lat.toFixed(6)]);
    }
  }
  fullPath.push(dest);
  return fullPath;
}

// 1. Delhi ➔ Greater Noida
// Generate a distinct green eco corridor for Route C
const delhiGrNoidaRouteC: [number, number][] = (defaultCorridorCoords.routeB as [number, number][]).map((pt, i) => {
  // Add an eco bypass offset along the riverfront/Surajpur stretch
  const offsetLon = Math.sin((i / 50) * Math.PI) * 0.012;
  const offsetLat = -Math.cos((i / 50) * Math.PI) * 0.008;
  return [+(pt[0] + offsetLon).toFixed(6), +(pt[1] + offsetLat).toFixed(6)];
});

// 2. Greater Noida ➔ Delhi Airport (IGI T3)
// Start: [77.5030, 28.4744], Dest: [77.0850, 28.5562]
const grNoidaAirportA = generatePath(
  [77.5030, 28.4744], // Greater Noida
  [77.0850, 28.5562], // IGI Airport
  [
    [77.4120, 28.5350], // Noida Expressway
    [77.3080, 28.5720], // Kalindi Kunj
    [77.2540, 28.5710], // Ashram / Barapullah
    [77.1850, 28.5780], // AIIMS Flyover
    [77.1620, 28.5880], // Dhaula Kuan
    [77.1180, 28.5620]  // Mahipalpur
  ]
);

const grNoidaAirportB = generatePath(
  [77.5030, 28.4744],
  [77.0850, 28.5562],
  [
    [77.4420, 28.4950], // Pari Chowk outer
    [77.3320, 28.4980], // Surajpur Link
    [77.2910, 28.5080], // Badarpur Border
    [77.2180, 28.5220], // Mehrauli-Badarpur Rd
    [77.1720, 28.5310], // Qutub Minar bypass
    [77.1290, 28.5390]  // Vasant Kunj
  ]
);

const grNoidaAirportC = generatePath(
  [77.5030, 28.4744],
  [77.0850, 28.5562],
  [
    [77.4350, 28.5200], // Hindon River Parkway
    [77.3250, 28.5550], // Okhla Bird Sanctuary
    [77.2450, 28.5420], // Outer Ring Road South
    [77.1950, 28.5450], // IIT Delhi Flyover
    [77.1420, 28.5480]  // Nelson Mandela Marg
  ]
);

// 3. Noida ➔ Connaught Place
// Start: [77.3649, 28.6280] (Sec 62), Dest: [77.2167, 28.6328] (CP)
const noidaCpA = generatePath(
  [77.3649, 28.6280],
  [77.2167, 28.6328],
  [
    [77.3310, 28.6270], // NH9 Ghazipur
    [77.2980, 28.6230], // Akshardham Temple
    [77.2620, 28.6260], // Vikas Marg ITO Bridge
    [77.2410, 28.6290]  // ITO Crossing / Barakhamba
  ]
);

const noidaCpB = generatePath(
  [77.3649, 28.6280],
  [77.2167, 28.6328],
  [
    [77.3480, 28.6010], // Noida Sector 32
    [77.3110, 28.5840], // Film City / DND
    [77.2650, 28.5880], // Nizamuddin Flyover
    [77.2380, 28.6140]  // Pragati Maidan / Tilak Marg
  ]
);

const noidaCpC = generatePath(
  [77.3649, 28.6280],
  [77.2167, 28.6328],
  [
    [77.3390, 28.6410], // Anand Vihar bypass
    [77.2980, 28.6520], // Shakarpur North
    [77.2550, 28.6480], // Rajghat Parkway
    [77.2320, 28.6410]  // Deen Dayal Upadhyaya Marg
  ]
);

// 4. Cyber City Gurugram ➔ Central Delhi
// Start: [77.0878, 28.4952], Dest: [77.2167, 28.6328]
const cyberCityDelhiA = generatePath(
  [77.0878, 28.4952],
  [77.2167, 28.6328],
  [
    [77.0980, 28.5220], // Sirhaul Toll / Ambience
    [77.1120, 28.5490], // Mahipalpur Underpass
    [77.1380, 28.5720], // Subroto Park
    [77.1680, 28.5910], // Dhaula Kuan
    [77.1950, 28.6180]  // Sardar Patel Marg / Teen Murti
  ]
);

const cyberCityDelhiB = generatePath(
  [77.0878, 28.4952],
  [77.2167, 28.6328],
  [
    [77.1120, 28.4890], // Sikanderpur Metro
    [77.1420, 28.4990], // Aya Nagar Border
    [77.1780, 28.5220], // Mehrauli
    [77.2080, 28.5680], // AIIMS / Safdarjung
    [77.2120, 28.6090]  // Janpath
  ]
);

const cyberCityDelhiC = generatePath(
  [77.0878, 28.4952],
  [77.2167, 28.6328],
  [
    [77.1210, 28.5150], // Arjan Garh
    [77.1550, 28.5410], // Vasant Kunj Ridge Road
    [77.1720, 28.5620], // Munirka
    [77.1850, 28.5950], // Chanakyapuri Diplomatic Enclave
    [77.2050, 28.6210]  // Parliament Street
  ]
);

// 5. Central Hub ➔ North Depot
// Start: [77.2730, 28.5355], Dest: [77.1680, 28.7280]
const centralNorthA = generatePath(
  [77.2730, 28.5355],
  [77.1680, 28.7280],
  [
    [77.2550, 28.5710], // Ashram
    [77.2480, 28.6180], // Pragati Maidan
    [77.2380, 28.6650], // ISBT Kashmiri Gate
    [77.2150, 28.6980], // Model Town
    [77.1820, 28.7150]  // Azadpur
  ]
);

const centralNorthB = generatePath(
  [77.2730, 28.5355],
  [77.1680, 28.7280],
  [
    [77.2320, 28.5480], // Nehru Place
    [77.1980, 28.5450], // IIT Delhi
    [77.1650, 28.5920], // Dhaula Kuan
    [77.1280, 28.6520], // Punjabi Bagh
    [77.1450, 28.6990]  // Shalimar Bagh
  ]
);

const centralNorthC = generatePath(
  [77.2730, 28.5355],
  [77.1680, 28.7280],
  [
    [77.2850, 28.5820], // Kalindi Kunj
    [77.2780, 28.6250], // Mayur Vihar
    [77.2620, 28.6720], // Geeta Colony
    [77.2350, 28.7100], // Wazirabad Bridge
    [77.1920, 28.7220]  // Burari Bypass
  ]
);

export function getCorridorCoordinates(
  start: string,
  dest: string
): { 'route-a': [number, number][]; 'route-b': [number, number][]; 'route-c': [number, number][] } {
  const s = (start || '').toLowerCase();
  const d = (dest || '').toLowerCase();

  // Airport corridor
  if (
    (s.includes('airport') || d.includes('airport')) &&
    (s.includes('noida') || s.includes('greater noida') || d.includes('noida') || d.includes('greater noida'))
  ) {
    return {
      'route-a': grNoidaAirportA,
      'route-b': grNoidaAirportB,
      'route-c': grNoidaAirportC
    };
  }

  // Cyber City / Gurugram corridor
  if (s.includes('cyber city') || s.includes('gurugram') || d.includes('cyber city') || d.includes('gurugram')) {
    return {
      'route-a': cyberCityDelhiA,
      'route-b': cyberCityDelhiB,
      'route-c': cyberCityDelhiC
    };
  }

  // Noida Sector 62 -> Connaught Place
  if (
    (s.includes('62') || s.includes('sector 62')) ||
    (d.includes('connaught') && s.includes('noida'))
  ) {
    return {
      'route-a': noidaCpA,
      'route-b': noidaCpB,
      'route-c': noidaCpC
    };
  }

  // Central Hub / Warehouse -> North Depot
  if (
    (s.includes('central') && (d.includes('north') || d.includes('depot'))) ||
    (s.includes('warehouse') && d.includes('hub'))
  ) {
    return {
      'route-a': centralNorthA,
      'route-b': centralNorthB,
      'route-c': centralNorthC
    };
  }

  // Default: Delhi -> Greater Noida
  return {
    'route-a': defaultCorridorCoords.routeA as [number, number][],
    'route-b': defaultCorridorCoords.routeB as [number, number][],
    'route-c': delhiGrNoidaRouteC
  };
}
