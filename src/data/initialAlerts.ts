import { Alert } from '../types';

export const INITIAL_ALERTS: Alert[] = [
  {
    id: 'alt-001',
    severity: 'critical',
    type: 'clearance',
    title: '3.8m Underpass Clearance Warning',
    description: 'Vehicle height (4.1m) exceeds Metro Rail Underpass maximum vertical clearance of 3.8m on Route A. Collision hazard.',
    timestamp: '2 mins ago',
    affectedVehicle: 'HEAVY-TRUCK-01',
    affectedRoute: 'Route A — Expressway',
    recommendedAction: 'Reroute via Route B Ring Corridor or Route C Green Viaduct immediately.',
    acknowledged: false
  },
  {
    id: 'alt-002',
    severity: 'critical',
    type: 'accident',
    title: 'Secondary Collision on Arterial Central',
    description: '2-vehicle collision blocking 2 eastbound lanes near Financial District junction. Average corridor speed down to 14 km/h.',
    timestamp: '7 mins ago',
    affectedRoute: 'Route A — Expressway',
    recommendedAction: 'Divert approaching commercial traffic to Outer Ring Beltway.',
    acknowledged: false
  },
  {
    id: 'alt-003',
    severity: 'warning',
    type: 'traffic',
    title: 'High Delay Spike on Ring Road Merge',
    description: 'Sudden congestion wave on West Ring Interchange. Queue length currently 1.4 km with 18 min expected delay.',
    timestamp: '14 mins ago',
    affectedVehicle: 'TRUCK-02',
    affectedRoute: 'Route B — Ring Corridor',
    recommendedAction: 'Adjust departure intervals and leverage Route C Green Viaduct.',
    acknowledged: false
  },
  {
    id: 'alt-004',
    severity: 'warning',
    type: 'weather',
    title: 'Approaching Heavy Precipitation Band (30mm)',
    description: 'Doppler radar indicates severe convective rainfall entering Metroflow basin in 25 mins. Surface friction down 35%.',
    timestamp: '22 mins ago',
    affectedRoute: 'All Express Corridors',
    recommendedAction: 'Activate What-If Stress Simulator to recalculate storm contingency routes.',
    acknowledged: false
  },
  {
    id: 'alt-005',
    severity: 'info',
    type: 'route_risk',
    title: 'Eco-Flow Corridors Fully Operational',
    description: 'Automated green-wave signal priority active on Route C. Fleet fuel consumption reduced by average 14.2%.',
    timestamp: '35 mins ago',
    affectedRoute: 'Route C — Green Corridor',
    recommendedAction: 'Prioritize for CNG and heavy diesel vehicle dispatches.',
    acknowledged: true
  }
];
