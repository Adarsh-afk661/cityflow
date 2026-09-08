import { FleetVehicle } from '../types';

export const INITIAL_FLEET: FleetVehicle[] = [
  {
    id: 'TRUCK-01',
    driver: 'Marcus Vance',
    type: 'truck',
    status: 'active',
    currentRouteName: 'Route B — Ring Corridor',
    routeId: 'route-b',
    etaMin: 42,
    reliabilityScore: 93,
    riskLevel: 'low',
    locationName: 'Outer Ring Viaduct km 18',
    coordinates: { x: 260, y: 240 },
    speedKmh: 68,
    destination: 'North Distribution Hub',
    vehicleSpecs: { height: 4.0, width: 2.5, length: 12.0, weight: 15.5 },
    alertsCount: 0,
    co2TodayKg: 42.1,
    recentHistory: [
      { timestamp: '10:14', event: 'Passed Grand River Flyover clearance check', status: 'ok' },
      { timestamp: '09:45', event: 'Departed Central Warehouse on schedule', status: 'ok' }
    ]
  },
  {
    id: 'TRUCK-02',
    driver: 'Elena Rostova',
    type: 'truck',
    status: 'delayed',
    currentRouteName: 'Route A — Expressway',
    routeId: 'route-a',
    etaMin: 67,
    reliabilityScore: 71,
    riskLevel: 'high',
    locationName: 'Expressway A-10 South Approach',
    coordinates: { x: 340, y: 380 },
    speedKmh: 18,
    destination: 'North Distribution Hub',
    vehicleSpecs: { height: 3.6, width: 2.4, length: 10.5, weight: 12.0 },
    alertsCount: 2,
    co2TodayKg: 58.4,
    recentHistory: [
      { timestamp: '10:32', event: 'Severe bottleneck near Financial District gateway', status: 'delay' },
      { timestamp: '10:15', event: 'Entered high-delay corridor on A-10', status: 'warning' }
    ]
  },
  {
    id: 'VAN-07',
    driver: 'Julian Chen',
    type: 'van',
    status: 'active',
    currentRouteName: 'Route C — Green Corridor',
    routeId: 'route-c',
    etaMin: 31,
    reliabilityScore: 95,
    riskLevel: 'low',
    locationName: 'Eco-Flow Parkway Sector 4',
    coordinates: { x: 360, y: 230 },
    speedKmh: 54,
    destination: 'Tech Park Corridor',
    vehicleSpecs: { height: 2.4, width: 2.1, length: 5.9, weight: 3.5 },
    alertsCount: 0,
    co2TodayKg: 14.8,
    recentHistory: [
      { timestamp: '10:20', event: 'Optimal green wave speed maintained', status: 'ok' },
      { timestamp: '09:50', event: 'Departed Harbor Depot', status: 'ok' }
    ]
  },
  {
    id: 'TRUCK-03',
    driver: 'David Okonjo',
    type: 'truck',
    status: 'active',
    currentRouteName: 'Route B — Ring Corridor',
    routeId: 'route-b',
    etaMin: 55,
    reliabilityScore: 89,
    riskLevel: 'low',
    locationName: 'West Beltway Interchange',
    coordinates: { x: 210, y: 330 },
    speedKmh: 64,
    destination: 'North Distribution Hub',
    vehicleSpecs: { height: 4.1, width: 2.5, length: 12.0, weight: 16.0 },
    alertsCount: 0,
    co2TodayKg: 38.6,
    recentHistory: [
      { timestamp: '10:25', event: 'Clearance re-validated at Sector B', status: 'ok' }
    ]
  },
  {
    id: 'VAN-12',
    driver: 'Sophia Martinez',
    type: 'van',
    status: 'delayed',
    currentRouteName: 'Arterial Central',
    routeId: 'route-a',
    etaMin: 48,
    reliabilityScore: 68,
    riskLevel: 'high',
    locationName: 'Downtown Crossing',
    coordinates: { x: 440, y: 340 },
    speedKmh: 14,
    destination: 'Financial District Gateway',
    vehicleSpecs: { height: 2.4, width: 2.1, length: 6.2, weight: 3.8 },
    alertsCount: 1,
    co2TodayKg: 22.1,
    recentHistory: [
      { timestamp: '10:28', event: 'Traffic signal failure reported', status: 'delay' }
    ]
  },
  {
    id: 'BUS-04',
    driver: 'Aiden Brooks',
    type: 'bus',
    status: 'active',
    currentRouteName: 'Rapid Transit Line 14',
    routeId: 'route-c',
    etaMin: 22,
    reliabilityScore: 92,
    riskLevel: 'low',
    locationName: 'Grand River North Viaduct',
    coordinates: { x: 480, y: 190 },
    speedKmh: 50,
    destination: 'Airport Logistics Center',
    vehicleSpecs: { height: 3.4, width: 2.55, length: 12.5, weight: 14.5 },
    alertsCount: 0,
    co2TodayKg: 31.0,
    recentHistory: [
      { timestamp: '10:30', event: 'Dedicated transit lane active', status: 'ok' }
    ]
  },
  {
    id: 'VAN-15',
    driver: 'Liam Gallagher',
    type: 'van',
    status: 'idling',
    currentRouteName: 'Staging Bay 3',
    routeId: '',
    etaMin: 0,
    reliabilityScore: 98,
    riskLevel: 'low',
    locationName: 'Central Warehouse Dock C',
    coordinates: { x: 225, y: 490 },
    speedKmh: 0,
    destination: 'Staging Complete',
    vehicleSpecs: { height: 2.4, width: 2.1, length: 5.9, weight: 3.5 },
    alertsCount: 0,
    co2TodayKg: 5.2,
    recentHistory: [
      { timestamp: '10:00', event: 'Loaded payload at Central Warehouse', status: 'ok' }
    ]
  },
  {
    id: 'TRUCK-08',
    driver: 'Hannah Weber',
    type: 'truck',
    status: 'maintenance',
    currentRouteName: 'Depot Yard',
    routeId: '',
    etaMin: 0,
    reliabilityScore: 100,
    riskLevel: 'low',
    locationName: 'East Freight Service Yard',
    coordinates: { x: 750, y: 390 },
    speedKmh: 0,
    destination: 'Scheduled Inspection',
    vehicleSpecs: { height: 4.1, width: 2.5, length: 12.0, weight: 16.0 },
    alertsCount: 0,
    co2TodayKg: 0,
    recentHistory: [
      { timestamp: '08:00', event: 'Routine pneumatic brake check underway', status: 'ok' }
    ]
  }
];
