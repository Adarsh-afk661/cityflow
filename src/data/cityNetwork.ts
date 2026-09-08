import { Infrastructure, CityZone, CandidateRoute } from '../types';
import defaultCorridorCoords from './defaultCorridorCoordinates.json';

export interface CityHub {
  id: string;
  name: string;
  type: 'warehouse' | 'hub' | 'terminal' | 'corridor';
  coordinates: { x: number; y: number };
  description: string;
}

export const CITY_HUBS: CityHub[] = [
  { id: 'hub-1', name: 'Central Warehouse', type: 'warehouse', coordinates: { x: 220, y: 480 }, description: 'Primary multimodal freight depot with 60 loading bays' },
  { id: 'hub-2', name: 'North Distribution Hub', type: 'hub', coordinates: { x: 620, y: 120 }, description: 'Regional distribution cross-dock center' },
  { id: 'hub-3', name: 'East Freight Terminal', type: 'terminal', coordinates: { x: 760, y: 370 }, description: 'Intermodal rail & sea container interchange' },
  { id: 'hub-4', name: 'Tech Park Corridor', type: 'corridor', coordinates: { x: 380, y: 220 }, description: 'High-tech logistics campus & EV charging hub' },
  { id: 'hub-5', name: 'Financial District Gateway', type: 'corridor', coordinates: { x: 460, y: 350 }, description: 'Urban core arterial checkpoint with time-window access' },
  { id: 'hub-6', name: 'Airport Logistics Center', type: 'terminal', coordinates: { x: 740, y: 190 }, description: 'Air-cargo cargo handling and cold-storage facility' },
  { id: 'hub-7', name: 'Harbor Container Yard', type: 'terminal', coordinates: { x: 160, y: 310 }, description: 'Deep-water port terminal & heavy vehicle staging area' }
];

export const CITY_INFRASTRUCTURE: Infrastructure[] = [
  {
    id: 'infra-underpass-1',
    name: 'Metro Rail Underpass (A-10)',
    type: 'underpass',
    roadName: 'Expressway A-10 Central Link',
    maxHeight: 3.8, // 3.8 meters limit!
    maxWidth: 3.2,
    maxLength: 18.0,
    maxWeight: 32.0,
    coordinates: { x: 370, y: 350 },
    notes: 'Low-overhead railway arch. Rigid height sensor barrier installed.'
  },
  {
    id: 'infra-bridge-1',
    name: 'Harbor Cable Bridge',
    type: 'bridge',
    roadName: 'Coastal Expressway B-4',
    maxHeight: 5.0,
    maxWidth: 3.6,
    maxLength: 25.0,
    maxWeight: 45.0,
    coordinates: { x: 210, y: 360 },
    notes: 'Wind-monitoring suspension bridge. High clearance.'
  },
  {
    id: 'infra-underpass-2',
    name: 'Old Town Underpass',
    type: 'underpass',
    roadName: 'Historic Causeway Link',
    maxHeight: 3.5,
    maxWidth: 2.8,
    maxLength: 12.0,
    maxWeight: 14.0,
    coordinates: { x: 310, y: 440 },
    notes: 'Restricted masonry tunnel. Heavy trucks prohibited.'
  },
  {
    id: 'infra-tunnel-1',
    name: 'East Ridge Mountain Tunnel',
    type: 'tunnel',
    roadName: 'East Freight Corridor',
    maxHeight: 4.5,
    maxWidth: 3.8,
    maxLength: 22.0,
    maxWeight: 40.0,
    coordinates: { x: 680, y: 270 },
    notes: 'Modern twin-bore tunnel with automatic fire suppression.'
  },
  {
    id: 'infra-bridge-2',
    name: 'Grand River Flyover',
    type: 'bridge',
    roadName: 'Outer Ring Beltway',
    maxHeight: 4.8,
    maxWidth: 3.8,
    maxLength: 24.0,
    maxWeight: 50.0,
    coordinates: { x: 490, y: 230 },
    notes: 'Heavy commercial rated 6-lane elevated viaduct.'
  },
  {
    id: 'infra-bridge-3',
    name: 'Green Eco Viaduct',
    type: 'bridge',
    roadName: 'Green Corridor Parkway',
    maxHeight: 5.2,
    maxWidth: 4.0,
    maxLength: 24.0,
    maxWeight: 44.0,
    coordinates: { x: 310, y: 260 },
    notes: 'Modern bio-corridor viaduct with sound barrier panels.'
  }
];

export const CITY_ZONES: CityZone[] = [
  {
    id: 'zone-financial',
    name: 'Financial District',
    pressureScore: 72,
    status: 'heavy',
    avgSpeedKmh: 28,
    activeIncidents: 2,
    center: { x: 460, y: 350 },
    polygon: [
      { x: 410, y: 300 },
      { x: 520, y: 310 },
      { x: 530, y: 390 },
      { x: 420, y: 400 }
    ]
  },
  {
    id: 'zone-industrial',
    name: 'Industrial Zone',
    pressureScore: 89,
    status: 'severe',
    avgSpeedKmh: 22,
    activeIncidents: 4,
    center: { x: 240, y: 430 },
    polygon: [
      { x: 170, y: 390 },
      { x: 310, y: 390 },
      { x: 320, y: 520 },
      { x: 180, y: 510 }
    ]
  },
  {
    id: 'zone-tech',
    name: 'Tech Park',
    pressureScore: 54,
    status: 'moderate',
    avgSpeedKmh: 45,
    activeIncidents: 1,
    center: { x: 380, y: 210 },
    polygon: [
      { x: 310, y: 160 },
      { x: 450, y: 170 },
      { x: 440, y: 260 },
      { x: 320, y: 250 }
    ]
  },
  {
    id: 'zone-airport',
    name: 'Airport Corridor',
    pressureScore: 93,
    status: 'severe',
    avgSpeedKmh: 19,
    activeIncidents: 3,
    center: { x: 710, y: 210 },
    polygon: [
      { x: 640, y: 140 },
      { x: 790, y: 150 },
      { x: 800, y: 270 },
      { x: 650, y: 260 }
    ]
  }
];

export const INITIAL_BASE_ROUTES: CandidateRoute[] = [
  {
    id: 'route-a',
    name: 'ROUTE A — EXPRESSWAY',
    corridorName: 'NH9 Arterial & Vikas Marg Direct',
    distanceKm: 19.8,
    baseDurationMin: 22,
    currentEtaMin: 40,
    predictedTimeRange: { min: 36, max: 44 },
    reliabilityScore: 68,
    delayRiskPercent: 32,
    safetyScore: 74,
    safetyBreakdown: {
      trafficRisk: 34,
      roadComplexity: 18,
      incidentRisk: 28,
      weatherRisk: 14,
      infrastructureRisk: 44
    },
    estimatedCo2Kg: 8.4,
    co2SavingsKg: 0,
    fuelImpactLiters: 3.2,
    trafficLevel: 'heavy',
    clearanceStatus: 'failed',
    clearanceChecks: [],
    overallScore: 65,
    pathWaypoints: [
      { x: 220, y: 480, name: 'Noida Sector 62' },
      { x: 290, y: 410 },
      { x: 370, y: 350, name: 'Metro Rail Underpass (3.8m)' },
      { x: 450, y: 270 },
      { x: 540, y: 180 },
      { x: 620, y: 120, name: 'Connaught Place, New Delhi' }
    ],
    description: 'Direct arterial highway via NH9 and Vikas Marg. Shortest distance, but runs through heavy urban congestion with a strict 3.8m railway underpass.',
    infrastructureEncountered: ['infra-underpass-1'],
    tags: ['Shortest Distance', 'Underpass Warning', 'Congestion Sensitive'],
    realCoordinates: defaultCorridorCoords.routeA as [number, number][]
  },
  {
    id: 'route-b',
    name: 'ROUTE B — RING CORRIDOR',
    corridorName: 'Outer Ring Beltway & Flyover Bypass',
    distanceKm: 22.3,
    baseDurationMin: 25,
    currentEtaMin: 28,
    predictedTimeRange: { min: 26, max: 32 },
    reliabilityScore: 94,
    delayRiskPercent: 8,
    safetyScore: 92,
    safetyBreakdown: {
      trafficRisk: 12,
      roadComplexity: 10,
      incidentRisk: 8,
      weatherRisk: 14,
      infrastructureRisk: 5
    },
    estimatedCo2Kg: 6.8,
    co2SavingsKg: 1.6,
    fuelImpactLiters: 2.6,
    trafficLevel: 'smooth',
    clearanceStatus: 'approved',
    clearanceChecks: [],
    overallScore: 94,
    isRecommended: true,
    pathWaypoints: [
      { x: 220, y: 480, name: 'Noida Sector 62' },
      { x: 200, y: 360 },
      { x: 250, y: 240 },
      { x: 380, y: 180 },
      { x: 490, y: 230, name: 'Grand River Flyover (4.8m)' },
      { x: 570, y: 180 },
      { x: 620, y: 120, name: 'Connaught Place, New Delhi' }
    ],
    description: 'High-clearance commercial ring road bypass avoiding city center congestion. Generous 4.8m overhead clearance throughout with high on-time reliability.',
    infrastructureEncountered: ['infra-bridge-2'],
    tags: ['Clearance Approved', 'High Reliability', 'Recommended'],
    realCoordinates: defaultCorridorCoords.routeB as [number, number][]
  },
  {
    id: 'route-c',
    name: 'ROUTE C — GREEN CORRIDOR',
    corridorName: 'Eco-Flow Parkway & Elevated Viaduct',
    distanceKm: 24.2,
    baseDurationMin: 28,
    currentEtaMin: 31,
    predictedTimeRange: { min: 29, max: 35 },
    reliabilityScore: 91,
    delayRiskPercent: 9,
    safetyScore: 89,
    safetyBreakdown: {
      trafficRisk: 14,
      roadComplexity: 12,
      incidentRisk: 10,
      weatherRisk: 10,
      infrastructureRisk: 6
    },
    estimatedCo2Kg: 5.9,
    co2SavingsKg: 2.5,
    fuelImpactLiters: 2.2,
    trafficLevel: 'smooth',
    clearanceStatus: 'approved',
    clearanceChecks: [],
    overallScore: 91,
    pathWaypoints: [
      { x: 220, y: 480, name: 'Noida Sector 62' },
      { x: 260, y: 370 },
      { x: 310, y: 260, name: 'Green Eco Viaduct (5.2m)' },
      { x: 390, y: 210 },
      { x: 510, y: 160 },
      { x: 620, y: 120, name: 'Connaught Place, New Delhi' }
    ],
    description: 'Optimized gradient elevated viaduct minimizing stop-and-go energy loss with continuous steady velocity and maximum weather resilience.',
    infrastructureEncountered: ['infra-bridge-3'],
    tags: ['Lowest CO₂', 'Weather Resilient', 'Clearance Approved'],
    realCoordinates: defaultCorridorCoords.routeB as [number, number][]
  }
];
