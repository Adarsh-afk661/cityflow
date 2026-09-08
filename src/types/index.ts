export type VehicleType = 'car' | 'van' | 'truck' | 'bus' | 'motorcycle' | 'custom';

export interface Vehicle {
  id: string;
  name: string;
  type: VehicleType;
  height: number; // in meters
  width: number;  // in meters
  length: number; // in meters
  weight: number; // in metric tons
  fuelType: 'diesel' | 'electric' | 'cng' | 'gasoline';
  emissionRate: number; // kg CO2 per km base
  isCustom?: boolean;
}

export type InfrastructureType = 'bridge' | 'underpass' | 'tunnel' | 'narrow_road' | 'weight_restricted';

export interface Infrastructure {
  id: string;
  name: string;
  type: InfrastructureType;
  roadName: string;
  maxHeight: number; // in meters
  maxWidth: number;  // in meters
  maxLength: number; // in meters
  maxWeight: number; // in tons
  coordinates: { x: number; y: number };
  notes?: string;
}

export interface ClearanceCheckResult {
  passed: boolean;
  infrastructureId: string;
  infrastructureName: string;
  infrastructureType: InfrastructureType;
  failureReason?: string;
  dimensionDiff?: {
    dimension: 'height' | 'width' | 'length' | 'weight';
    vehicleValue: number;
    limitValue: number;
    excess: number;
  };
}

export type TrafficState = 'smooth' | 'moderate' | 'heavy' | 'severe';

export type RoutingMode = 'fastest' | 'reliable' | 'eco' | 'clearance' | 'balanced';

export interface CandidateRoute {
  id: string;
  name: string;
  corridorName: string;
  distanceKm: number;
  baseDurationMin: number;
  currentEtaMin: number;
  predictedTimeRange: { min: number; max: number };
  reliabilityScore: number; // 0-100
  delayRiskPercent: number; // 0-100%
  safetyScore: number;      // 0-100
  safetyBreakdown: {
    trafficRisk: number;
    roadComplexity: number;
    incidentRisk: number;
    weatherRisk: number;
    infrastructureRisk: number;
  };
  estimatedCo2Kg: number;
  co2SavingsKg: number;
  fuelImpactLiters: number;
  trafficLevel: TrafficState;
  clearanceStatus: 'approved' | 'failed';
  clearanceChecks: ClearanceCheckResult[];
  overallScore: number; // 0-100
  isRecommended?: boolean;
  pathWaypoints: { x: number; y: number; name?: string }[];
  description: string;
  infrastructureEncountered: string[];
  tags: string[];
  realCoordinates?: [number, number][];
}

export interface CityZone {
  id: string;
  name: string;
  pressureScore: number; // 0-100
  status: TrafficState;
  avgSpeedKmh: number;
  activeIncidents: number;
  polygon: { x: number; y: number }[];
  center: { x: number; y: number };
}

export interface SimulationScenario {
  id: string;
  name: string;
  type: 'rain' | 'collision' | 'closure' | 'congestion_spike' | 'multi';
  description: string;
  active: boolean;
  severity: number; // 1 to 3
}

export interface FleetVehicle {
  id: string;
  driver: string;
  type: VehicleType;
  status: 'active' | 'delayed' | 'idling' | 'maintenance';
  currentRouteName: string;
  routeId: string;
  etaMin: number;
  reliabilityScore: number;
  riskLevel: 'low' | 'medium' | 'high';
  locationName: string;
  coordinates: { x: number; y: number };
  speedKmh: number;
  destination: string;
  vehicleSpecs: {
    height: number;
    width: number;
    length: number;
    weight: number;
  };
  alertsCount: number;
  co2TodayKg: number;
  recentHistory: {
    timestamp: string;
    event: string;
    status: 'ok' | 'warning' | 'delay';
  }[];
}

export interface Alert {
  id: string;
  severity: 'critical' | 'warning' | 'info';
  type: 'traffic' | 'weather' | 'clearance' | 'accident' | 'route_risk';
  title: string;
  description: string;
  timestamp: string;
  affectedVehicle?: string;
  affectedRoute?: string;
  recommendedAction: string;
  acknowledged: boolean;
}

export interface SystemStatusState {
  trafficEngine: boolean;
  routeShield: boolean;
  predictionEngine: boolean;
  simulationEngine: boolean;
  liveFeedActive: boolean;
}

export interface User {
  email: string;
  name: string;
  role: 'admin' | 'dispatcher' | 'fleet_manager';
  isVerified: boolean;
  lastLoginAt?: string;
}

export interface Corridor {
  id: string;
  name: string;
  corridorCode: string;
  distanceKm: number;
  baseEtaMin: number;
  minClearanceHeightM: number;
  maxBridgeWeightT: number;
  reliabilityScore: number;
  delayProbability: number;
  co2PerTripKg: number;
  clearanceStatus: 'clear' | 'barred' | 'selected';
  criticalChokepoint: string;
  isCustom?: boolean;
}

