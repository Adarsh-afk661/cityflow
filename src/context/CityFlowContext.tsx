import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import {
  Vehicle,
  CandidateRoute,
  RoutingMode,
  CityZone,
  FleetVehicle,
  Alert,
  SystemStatusState,
  User,
  Corridor
} from '../types';
import { DEFAULT_VEHICLES } from '../data/defaultVehicles';
import { INITIAL_BASE_ROUTES, CITY_ZONES } from '../data/cityNetwork';
import { INITIAL_FLEET } from '../data/initialFleet';
import { INITIAL_ALERTS } from '../data/initialAlerts';
import { evaluateRouteClearance } from '../services/clearanceService';
import { predictJourneyReliability } from '../services/reliabilityEngine';
import { calculateSafetyScore } from '../services/safetyEngine';
import { calculateEmissions } from '../services/emissionEngine';
import { rankCandidateRoutes } from '../services/rankingEngine';

export type PageName = 'landing' | 'dashboard' | 'routeshield' | 'fleet' | 'whatif' | 'analytics' | 'alerts' | 'settings';

interface CityFlowContextType {
  activePage: PageName;
  setActivePage: (page: PageName) => void;
  selectedCity: string;
  setSelectedCity: (city: string) => void;

  // Authentication
  user: User | null;
  setUser: (user: User | null) => void;
  loginModalOpen: boolean;
  setLoginModalOpen: (open: boolean) => void;
  logout: () => void;

  // Manual Data Feeding
  dataFeedModalOpen: boolean;
  setDataFeedModalOpen: (open: boolean) => void;
  addCustomRoute: (routeData: any) => Promise<void>;
  deleteCustomRoute: (id: string) => Promise<void>;
  addCustomAlert: (alertData: any) => Promise<void>;
  deleteCustomAlert: (id: string) => Promise<void>;

  // Vehicles
  vehicles: Vehicle[];
  selectedVehicle: Vehicle;
  setSelectedVehicle: (vehicle: Vehicle) => void;
  addCustomVehicle: (vehicle: Vehicle) => void;
  deleteVehicle: (id: string) => void;

  // Route Planning
  startLocation: string;
  setStartLocation: (loc: string) => void;
  destinationLocation: string;
  setDestinationLocation: (loc: string) => void;
  routingMode: RoutingMode;
  setRoutingMode: (mode: RoutingMode) => void;
  departureTime: string;
  setDepartureTime: (time: string) => void;

  // Analysis & Routes
  candidateRoutes: CandidateRoute[];
  selectedRoute: CandidateRoute | null;
  setSelectedRoute: (route: CandidateRoute | null) => void;
  isAnalyzing: boolean;
  analysisStage: number;
  runRouteAnalysis: (startOverride?: string, destOverride?: string) => Promise<void>;

  // Live Traffic & System
  liveTrafficEnabled: boolean;
  toggleLiveTraffic: () => void;
  liveTick: number;
  systemStatus: SystemStatusState;

  // Fleet
  fleet: FleetVehicle[];
  selectedFleetVehicle: FleetVehicle | null;
  setSelectedFleetVehicle: (veh: FleetVehicle | null) => void;

  // Alerts
  alerts: Alert[];
  acknowledgeAlert: (id: string) => void;

  // Zones
  cityZones: CityZone[];
  selectedZone: CityZone | null;
  setSelectedZone: (zone: CityZone | null) => void;

  // Demo Workflow
  isDemoRunning: boolean;
  demoStep: number;
  demoFinalModalOpen: boolean;
  startGuidedDemo: () => void;
  closeDemoFinalModal: () => void;
  resetAllData: () => void;
}

const CityFlowContext = createContext<CityFlowContextType | undefined>(undefined);

export const CityFlowProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [activePage, setActivePage] = useState<PageName>('landing');
  const [selectedCity, setSelectedCity] = useState<string>('Metroflow Metropolitan');

  // Authentication State
  const [user, setUser] = useState<User | null>(() => {
    try {
      const saved = localStorage.getItem('cityflow_user');
      return saved ? JSON.parse(saved) : null;
    } catch (e) {
      return null;
    }
  });
  const [loginModalOpen, setLoginModalOpen] = useState<boolean>(false);
  const [dataFeedModalOpen, setDataFeedModalOpen] = useState<boolean>(false);

  // Vehicles
  const [vehicles, setVehicles] = useState<Vehicle[]>(DEFAULT_VEHICLES);
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle>(DEFAULT_VEHICLES[0]); // Heavy Delivery Truck

  // Planning Form
  const [startLocation, setStartLocation] = useState<string>('Noida Sector 62');
  const [destinationLocation, setDestinationLocation] = useState<string>('Connaught Place, New Delhi');
  const [routingMode, setRoutingMode] = useState<RoutingMode>('balanced');
  const [departureTime, setDepartureTime] = useState<string>('Now (10:15 AM)');

  // Routes
  const [candidateRoutes, setCandidateRoutes] = useState<CandidateRoute[]>(INITIAL_BASE_ROUTES);
  const [selectedRoute, setSelectedRoute] = useState<CandidateRoute | null>(INITIAL_BASE_ROUTES[1]);
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [analysisStage, setAnalysisStage] = useState<number>(0);

  // Live Simulation
  const [liveTrafficEnabled, setLiveTrafficEnabled] = useState<boolean>(true);
  const [liveTick, setLiveTick] = useState<number>(0);

  // Fleet & Alerts
  const [fleet, setFleet] = useState<FleetVehicle[]>(INITIAL_FLEET);
  const [selectedFleetVehicle, setSelectedFleetVehicle] = useState<FleetVehicle | null>(null);
  const [alerts, setAlerts] = useState<Alert[]>(INITIAL_ALERTS);

  // City Zones
  const [cityZones, setCityZones] = useState<CityZone[]>(CITY_ZONES);
  const [selectedZone, setSelectedZone] = useState<CityZone | null>(null);

  // Initial Data Fetching from MongoDB Backend
  useEffect(() => {
    const fetchRemoteData = async () => {
      try {
        const [vehRes, alertRes, routeRes] = await Promise.all([
          fetch('/api/vehicles').catch(() => null),
          fetch('/api/alerts').catch(() => null),
          fetch('/api/routes').catch(() => null)
        ]);

        if (vehRes && vehRes.ok) {
          const vehData = await vehRes.json();
          if (Array.isArray(vehData) && vehData.length > 0) {
            setVehicles(vehData);
            setSelectedVehicle(vehData[0]);
          }
        }

        if (alertRes && alertRes.ok) {
          const alertData = await alertRes.json();
          if (Array.isArray(alertData) && alertData.length > 0) {
            setAlerts(alertData);
          }
        }
      } catch (e) {
        console.warn('Backend sync fallback to local store');
      }
    };

    fetchRemoteData();
  }, []);

  // System Status
  const [systemStatus] = useState<SystemStatusState>({
    trafficEngine: true,
    routeShield: true,
    predictionEngine: true,
    simulationEngine: true,
    liveFeedActive: true
  });

  // Demo state
  const [isDemoRunning, setIsDemoRunning] = useState<boolean>(false);
  const [demoStep, setDemoStep] = useState<number>(0);
  const [demoFinalModalOpen, setDemoFinalModalOpen] = useState<boolean>(false);

  const getCorridorMetrics = (start: string, dest: string) => {
    const s = (start || '').toLowerCase();
    const d = (dest || '').toLowerCase();

    if (s.includes('greater noida') || d.includes('greater noida')) {
      return {
        'route-a': { dist: 51.8, dur: 64, name: 'NOIDA-GR NOIDA EXPWY & DND', summary: 'Direct corridor via Noida-Gr Noida Expy & Outer Ring' },
        'route-b': { dist: 58.4, dur: 59, name: 'EASTERN PERIPHERAL BYPASS', summary: 'Commercial bypass via EPE with 5.0m clearance' },
        'route-c': { dist: 54.2, dur: 68, name: 'YAMUNA EXPWY CONNECTOR', summary: 'High-speed corridor with steady gradient flow' }
      };
    }
    if (s.includes('cyber city') || s.includes('gurugram') || d.includes('cyber city') || d.includes('gurugram')) {
      return {
        'route-a': { dist: 27.6, dur: 42, name: 'DELHI-GURGAON EXPWY (NH48)', summary: 'Direct NH48 arterial into Central Delhi' },
        'route-b': { dist: 31.2, dur: 48, name: 'MG ROAD & SOUTH RING BYPASS', summary: 'High-clearance boulevard avoiding arterial bottlenecks' },
        'route-c': { dist: 29.5, dur: 45, name: 'MEHRAULI ARTERIAL VIADUCT', summary: 'Steady elevated corridor through South Delhi' }
      };
    }
    if ((s.includes('noida') && (d.includes('airport') || d.includes('delhi airport'))) || ((s.includes('airport') || s.includes('delhi airport')) && d.includes('noida'))) {
      return {
        'route-a': { dist: 36.8, dur: 48, name: 'NH9 & BARAPULLAH ELEVATED', summary: 'Elevated highway link directly to Airport Approach' },
        'route-b': { dist: 39.4, dur: 52, name: 'DND FLYWAY & OUTER RING ROAD', summary: 'Commercial corridor bypassing urban core intersections' },
        'route-c': { dist: 41.2, dur: 56, name: 'KALINDI KUNJ GREEN LINK', summary: 'Southern perimeter route with full height clearance' }
      };
    }
    // Default: Noida Sector 62 -> Connaught Place, New Delhi
    return {
      'route-a': { dist: 19.8, dur: 22, name: 'NH9 ARTERIAL & VIKAS MARG', summary: 'Direct NH9 corridor via Vikas Marg (3.8m Metro Arch)' },
      'route-b': { dist: 22.3, dur: 25, name: 'OUTER RING BELTWAY & FLYOVER', summary: 'Commercial ring bypass with 4.8m overhead clearance' },
      'route-c': { dist: 24.2, dur: 28, name: 'ECO-FLOW PARKWAY & VIADUCT', summary: 'Elevated green viaduct minimizing stop-and-go delays' }
    };
  };

  // Helper function to evaluate routes for a given vehicle, mode, and corridor
  const evaluateRoutes = (
    veh: Vehicle,
    mode: RoutingMode,
    startLoc: string = startLocation,
    destLoc: string = destinationLocation
  ): CandidateRoute[] => {
    const metrics = getCorridorMetrics(startLoc, destLoc);

    const rawRoutes = INITIAL_BASE_ROUTES.map(baseRoute => {
      const m = metrics[baseRoute.id as keyof typeof metrics] || {
        dist: baseRoute.distanceKm,
        dur: baseRoute.baseDurationMin,
        name: baseRoute.corridorName,
        summary: baseRoute.description
      };
      const effectiveDist = m.dist;
      const effectiveBaseDur = m.dur;

      // 1. Physical Clearance Validation
      const clearanceEval = evaluateRouteClearance(veh, baseRoute.infrastructureEncountered);

      // 2. Predictive Reliability
      const reliability = predictJourneyReliability({
        baseDurationMin: effectiveBaseDur,
        trafficLevel: baseRoute.trafficLevel,
        vehicle: veh,
        incidentCount: baseRoute.id === 'route-a' ? 1 : 0
      });

      // 3. Safety Scoring
      const safety = calculateSafetyScore({
        baseSafetyScore: baseRoute.safetyScore,
        trafficLevel: baseRoute.trafficLevel,
        hasClearanceIssue: clearanceEval.status === 'failed',
        activeIncidentsOnRoute: baseRoute.id === 'route-a' ? 1 : 0,
        roadType: baseRoute.id === 'route-a' ? 'expressway' : baseRoute.id === 'route-b' ? 'beltway' : 'parkway'
      });

      // 4. Emissions
      const emissions = calculateEmissions({
        distanceKm: effectiveDist,
        vehicle: veh,
        trafficLevel: baseRoute.trafficLevel
      });

      return {
        ...baseRoute,
        distanceKm: effectiveDist,
        baseDurationMin: effectiveBaseDur,
        currentEtaMin: reliability.predictedEtaMin,
        predictedTimeRange: reliability.predictedTimeRange,
        reliabilityScore: reliability.reliabilityScore,
        delayRiskPercent: reliability.delayRiskPercent,
        safetyScore: safety.overallScore,
        safetyBreakdown: safety.breakdown,
        estimatedCo2Kg: emissions.estimatedCo2Kg,
        fuelImpactLiters: emissions.fuelImpactLiters,
        clearanceStatus: clearanceEval.status,
        clearanceChecks: clearanceEval.checks
      };
    });

    return rankCandidateRoutes(rawRoutes, mode);
  };

  // Run initial evaluation on mount
  useEffect(() => {
    const evaluated = evaluateRoutes(selectedVehicle, routingMode, startLocation, destinationLocation);
    setCandidateRoutes(evaluated);
    const recommended = evaluated.find(r => r.isRecommended) || evaluated[1] || evaluated[0];
    setSelectedRoute(recommended);
  }, []);

  // ─────────────────────────────────────────────────────────────
  // REAL-TIME FLEET TELEMETRY SIMULATION ENGINE
  // Updates speed, ETA, reliability, CO₂, status and coordinates
  // every 3 seconds based on:
  //   • Route type free-flow speed (expressway 60, beltway 55, arterial 40)
  //   • Current hour rush-hour factor (8-10am, 5-8pm = 0.45x speed)
  //   • Zone congestion pressure from city zones
  //   • Random incident micro-events (brake, bottleneck, green wave)
  //   • CO₂ accumulation proportional to current speed + vehicle weight
  // ─────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!liveTrafficEnabled) return;

    // Route baseline free-flow speeds (km/h)
    const ROUTE_FREE_FLOW: Record<string, number> = {
      'route-a': 55,   // Expressway/Arterial
      'route-b': 65,   // Ring Beltway + Flyover
      'route-c': 60,   // Eco Green Corridor
      '': 0            // Idling / maintenance
    };

    // Route name location waypoints for GPS drift simulation
    const ROUTE_WAYPOINTS: Record<string, { x: number; y: number }[]> = {
      'route-a': [{ x: 310, y: 390 }, { x: 340, y: 370 }, { x: 370, y: 350 }, { x: 400, y: 330 }],
      'route-b': [{ x: 220, y: 310 }, { x: 250, y: 270 }, { x: 280, y: 240 }, { x: 310, y: 220 }],
      'route-c': [{ x: 360, y: 240 }, { x: 390, y: 210 }, { x: 420, y: 185 }, { x: 450, y: 165 }],
    };

    // Realistic location labels along each route
    const ROUTE_LOCATION_NAMES: Record<string, string[]> = {
      'route-a': [
        'Expressway A-10 South Approach',
        'Financial District Gateway (Bottleneck)',
        'NH-9 Arterial Interchange',
        'Vikas Marg Underpass Checkpoint',
        'Expressway A-10 North Segment'
      ],
      'route-b': [
        'Outer Ring Viaduct km 18',
        'West Beltway Interchange',
        'Ring Road Elevated Flyover',
        'Outer Ring km 24 — Smooth',
        'Beltway North Sector Entry'
      ],
      'route-c': [
        'Eco-Flow Parkway Sector 4',
        'Green Corridor — Optimal Speed',
        'Elevated Viaduct Sector 7',
        'Eco Zone — Clean Air Corridor',
        'Parkway North Exit'
      ]
    };

    const interval = setInterval(() => {
      const now = new Date();
      const hour = now.getHours();

      // Rush hour factor: 0.40x at peak, 0.85x at off-peak
      const isRushHour = (hour >= 8 && hour <= 10) || (hour >= 17 && hour <= 20);
      const rushFactor = isRushHour ? 0.42 + Math.random() * 0.18 : 0.78 + Math.random() * 0.14;

      setLiveTick(prev => prev + 1);

      // 1. Update city zone pressure
      setCityZones(prev =>
        prev.map(zone => {
          const delta = (Math.random() - 0.48) * 4;
          const newScore = Math.max(28, Math.min(96, Math.round(zone.pressureScore + delta)));
          return {
            ...zone,
            pressureScore: newScore,
            avgSpeedKmh: Math.max(10, Math.round(65 * (1 - newScore / 100))),
            status: newScore > 80 ? 'severe' : newScore > 65 ? 'heavy' : newScore > 45 ? 'moderate' : 'smooth'
          };
        })
      );

      // 2. Real-time fleet telemetry update
      setFleet(prevFleet =>
        prevFleet.map(veh => {
          // Idling / maintenance — no telemetry change, just minor ETA drift
          if (veh.status === 'idling' || veh.status === 'maintenance') {
            return veh;
          }

          const freeFlow = ROUTE_FREE_FLOW[veh.routeId] ?? 50;

          // Speed simulation: free_flow × rush_factor + micro noise + incident penalty
          const hasIncident = veh.alertsCount > 0;
          const incidentPenalty = hasIncident ? 12 + Math.random() * 8 : 0;
          const microNoise = (Math.random() - 0.5) * 6;
          let newSpeed = Math.max(8, Math.min(
            freeFlow,
            freeFlow * rushFactor - incidentPenalty + microNoise
          ));

          // Delayed vehicles are slower
          if (veh.status === 'delayed') {
            newSpeed = Math.max(6, newSpeed * (0.35 + Math.random() * 0.25));
          }
          newSpeed = Math.round(newSpeed);

          // ETA recalculation: if speed improves, ETA drops; if stuck, ETA grows
          const etaDelta = newSpeed > 40 ? -(1 + Math.random()) : (0.5 + Math.random() * 1.5);
          const newEta = Math.max(3, Math.round(veh.etaMin + etaDelta));

          // Reliability score: degrades when delayed/incident, recovers on green wave
          const reliabilityDelta = hasIncident
            ? -(Math.random() * 0.6)
            : newSpeed > 50
            ? +(Math.random() * 0.4)
            : (Math.random() - 0.5) * 0.3;
          const newReliability = Math.max(35, Math.min(99, Math.round((veh.reliabilityScore + reliabilityDelta) * 10) / 10));

          // Status: dynamically promote/demote based on speed
          let newStatus: FleetVehicle['status'] = veh.status;
          if (newSpeed < 20) {
            newStatus = 'delayed';
          } else if (newSpeed >= 20 && veh.status === 'delayed' && Math.random() > 0.85) {
            newStatus = 'active';
          }

          // CO₂ accumulates in real-time:
          // kg/tick = (speed_km_h / 3600 * 3sec_interval) * emission_rate_kg_per_km
          // Heavy trucks emit ~0.95 kg/km, vans ~0.22 kg/km, buses ~0.80 kg/km
          const emissionRate = veh.type === 'truck' ? 0.95 : veh.type === 'bus' ? 0.80 : 0.22;
          const distanceThisTick = (newSpeed / 3600) * 3; // km covered in 3s
          const co2Increment = distanceThisTick * emissionRate * veh.vehicleSpecs.weight / 10;
          const newCo2 = Math.round((veh.co2TodayKg + co2Increment) * 10) / 10;

          // Risk level follows status
          const newRisk: 'low' | 'medium' | 'high' =
            newStatus === 'delayed' ? 'high'
            : newReliability < 75 ? 'medium'
            : 'low';

          // GPS movement: move along route waypoints
          const waypoints = ROUTE_WAYPOINTS[veh.routeId];
          let newCoords = veh.coordinates;
          if (waypoints && newStatus === 'active') {
            const driftX = (Math.random() - 0.5) * 3;
            const driftY = (Math.random() - 0.5) * 3;
            newCoords = {
              x: Math.round(veh.coordinates.x + driftX),
              y: Math.round(veh.coordinates.y + driftY)
            };
          } else if (waypoints && newStatus === 'delayed') {
            // Barely moving — tiny jitter only
            newCoords = {
              x: Math.round(veh.coordinates.x + (Math.random() - 0.5) * 0.8),
              y: Math.round(veh.coordinates.y + (Math.random() - 0.5) * 0.8)
            };
          }

          // Occasionally rotate location label for realism
          const locationNames = ROUTE_LOCATION_NAMES[veh.routeId];
          const newLocationName = locationNames && Math.random() > 0.85
            ? locationNames[Math.floor(Math.random() * locationNames.length)]
            : veh.locationName;

          return {
            ...veh,
            speedKmh: newSpeed,
            etaMin: newEta,
            reliabilityScore: newReliability,
            co2TodayKg: newCo2,
            status: newStatus,
            riskLevel: newRisk,
            coordinates: newCoords,
            locationName: newLocationName
          };
        })
      );
    }, 3000);

    return () => clearInterval(interval);
  }, [liveTrafficEnabled]);

  // Route Analysis animated workflow (7 stages)
  const runRouteAnalysis = async (startOverride?: string, destOverride?: string): Promise<void> => {
    const startTarget = startOverride || startLocation;
    const destTarget = destOverride || destinationLocation;

    if (startOverride) setStartLocation(startOverride);
    if (destOverride) setDestinationLocation(destOverride);

    setIsAnalyzing(true);
    setAnalysisStage(0);

    // 7-stage animated pipeline
    for (let step = 0; step < 7; step++) {
      setAnalysisStage(step);
      await new Promise(resolve => setTimeout(resolve, 180));
    }

    try {
      const response = await fetch('/api/routing/journey', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          start: startTarget,
          destination: destTarget,
          vehicle: selectedVehicle,
          routingMode
        })
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success && Array.isArray(data.candidateRoutes) && data.candidateRoutes.length > 0) {
          setCandidateRoutes(data.candidateRoutes);
          const topFeasible =
            data.candidateRoutes.find((r: any) => r.isRecommended) ||
            data.candidateRoutes.find((r: any) => r.clearanceStatus === 'approved') ||
            data.candidateRoutes[0];
          setSelectedRoute(topFeasible);
          setIsAnalyzing(false);
          return;
        }
      }
    } catch (err) {
      console.warn('[CityFlow] Live API journey query fallback:', err);
    }

    // Offline / Network Degradation Fallback
    const calculated = evaluateRoutes(selectedVehicle, routingMode, startTarget, destTarget);
    setCandidateRoutes(calculated);
    const topFeasible = calculated.find(r => r.isRecommended) || calculated.find(r => r.clearanceStatus === 'approved') || calculated[0];
    setSelectedRoute(topFeasible);

    setIsAnalyzing(false);
  };

  const toggleLiveTraffic = () => {
    setLiveTrafficEnabled(prev => !prev);
  };

  const acknowledgeAlert = (id: string) => {
    setAlerts(prev =>
      prev.map(a => (a.id === id ? { ...a, acknowledged: true } : a))
    );
  };

  const addCustomVehicle = async (newVeh: Vehicle) => {
    setVehicles(prev => [...prev, newVeh]);
    setSelectedVehicle(newVeh);
    try {
      await fetch('/api/vehicles', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newVeh)
      });
    } catch (e) {
      console.warn('Vehicle sync fallback');
    }
  };

  const deleteVehicle = async (id: string) => {
    setVehicles(prev => prev.filter(v => v.id !== id));
    if (selectedVehicle.id === id) {
      setSelectedVehicle(DEFAULT_VEHICLES[0]);
    }
    try {
      await fetch(`/api/vehicles/${id}`, { method: 'DELETE' });
    } catch (e) {}
  };

  const addCustomRoute = async (routeData: any) => {
    try {
      await fetch('/api/routes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(routeData)
      });
    } catch (e) {}

    const isExceeded = selectedVehicle.height > (routeData.minClearanceHeightM || 4.2);
    const newCandidateRoute: CandidateRoute = {
      id: routeData.id || `custom-route-${Date.now()}`,
      name: routeData.name,
      corridorName: routeData.corridorCode || routeData.name,
      distanceKm: routeData.distanceKm,
      baseDurationMin: routeData.baseEtaMin,
      currentEtaMin: routeData.baseEtaMin,
      predictedTimeRange: { min: routeData.baseEtaMin - 3, max: routeData.baseEtaMin + 8 },
      reliabilityScore: 94,
      delayRiskPercent: 8,
      safetyScore: 92,
      safetyBreakdown: {
        trafficRisk: 8,
        roadComplexity: 6,
        incidentRisk: 5,
        weatherRisk: 4,
        infrastructureRisk: isExceeded ? 95 : 5
      },
      estimatedCo2Kg: 13.8,
      co2SavingsKg: 2.4,
      fuelImpactLiters: 11.2,
      trafficLevel: 'smooth',
      clearanceStatus: isExceeded ? 'failed' : 'approved',
      clearanceChecks: [
        {
          passed: !isExceeded,
          infrastructureId: 'custom-underpass',
          infrastructureName: routeData.criticalChokepoint || 'Highway Underpass Arch',
          infrastructureType: 'underpass',
          failureReason: isExceeded
            ? `Vehicle height (${selectedVehicle.height}m) exceeds corridor clearance limit (${routeData.minClearanceHeightM}m)`
            : undefined
        }
      ],
      overallScore: isExceeded ? 35 : 94,
      pathWaypoints: [
        { x: 140, y: 190, name: 'Custom Origin' },
        { x: 250, y: 250, name: 'Midway Viaduct' },
        { x: 370, y: 320, name: 'Destination Hub' }
      ],
      description: `Custom Corridor (${routeData.distanceKm} km, underpass clearance: ${routeData.minClearanceHeightM}m)`,
      infrastructureEncountered: [routeData.criticalChokepoint || 'Custom Underpass'],
      tags: ['Custom Corridor', 'MongoDB Atlas']
    };

    setCandidateRoutes(prev => [newCandidateRoute, ...prev]);
    setSelectedRoute(newCandidateRoute);
  };

  const deleteCustomRoute = async (id: string) => {
    setCandidateRoutes(prev => prev.filter(r => r.id !== id));
    try {
      await fetch(`/api/routes/${id}`, { method: 'DELETE' });
    } catch (e) {}
  };

  const addCustomAlert = async (alertData: any) => {
    try {
      await fetch('/api/alerts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(alertData)
      });
    } catch (e) {}
    setAlerts(prev => [alertData, ...prev]);
  };

  const deleteCustomAlert = async (id: string) => {
    setAlerts(prev => prev.filter(a => a.id !== id));
    try {
      await fetch(`/api/alerts/${id}`, { method: 'DELETE' });
    } catch (e) {}
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('cityflow_user');
  };

  // Re-evaluate routes when routing mode or vehicle changes
  useEffect(() => {
    const updated = evaluateRoutes(selectedVehicle, routingMode);
    setCandidateRoutes(updated);
    if (selectedRoute) {
      const match = updated.find(r => r.id === selectedRoute.id);
      if (match) setSelectedRoute(match);
    }
  }, [routingMode, selectedVehicle]);

  // Demo Workflow: Executes the 38-step demo story seamlessly
  const startGuidedDemo = async () => {
    setIsDemoRunning(true);
    setDemoStep(1);

    // 1. Ensure Heavy Delivery Truck is selected
    const truck = vehicles.find(v => v.id === 'veh-heavy-truck') || DEFAULT_VEHICLES[0];
    setSelectedVehicle(truck);
    setStartLocation('Central Warehouse');
    setDestinationLocation('North Distribution Hub');
    setRoutingMode('balanced');
    setActivePage('routeshield');

    // 2. Run RouteShield analysis
    await new Promise(resolve => setTimeout(resolve, 800));
    setDemoStep(2);
    await runRouteAnalysis();

    // 3. Highlight clearance rejection on Route A and show Route B as recommended
    setDemoStep(3);
    await new Promise(resolve => setTimeout(resolve, 1600));

    // 4. Select Route B and open What-If simulator
    const routeB = candidateRoutes.find(r => r.id === 'route-b') || candidateRoutes[1];
    setSelectedRoute(routeB);
    setDemoStep(4);
    await new Promise(resolve => setTimeout(resolve, 1400));
    setActivePage('whatif');

    // 5. Trigger simulation and display final contingency recommendation
    setDemoStep(5);
    await new Promise(resolve => setTimeout(resolve, 2000));
    setDemoFinalModalOpen(true);
    setIsDemoRunning(false);
  };

  const closeDemoFinalModal = () => {
    setDemoFinalModalOpen(false);
  };

  const resetAllData = () => {
    setVehicles(DEFAULT_VEHICLES);
    setSelectedVehicle(DEFAULT_VEHICLES[0]);
    setStartLocation('Central Warehouse');
    setDestinationLocation('North Distribution Hub');
    setRoutingMode('balanced');
    setFleet(INITIAL_FLEET);
    setAlerts(INITIAL_ALERTS);
    setCityZones(CITY_ZONES);
    const fresh = evaluateRoutes(DEFAULT_VEHICLES[0], 'balanced');
    setCandidateRoutes(fresh);
    setSelectedRoute(fresh.find(r => r.isRecommended) || fresh[1]);
    setActivePage('dashboard');
    setIsDemoRunning(false);
    setDemoFinalModalOpen(false);
  };

  return (
    <CityFlowContext.Provider
      value={{
        activePage,
        setActivePage,
        selectedCity,
        setSelectedCity,
        user,
        setUser,
        loginModalOpen,
        setLoginModalOpen,
        logout,
        dataFeedModalOpen,
        setDataFeedModalOpen,
        addCustomRoute,
        deleteCustomRoute,
        addCustomAlert,
        deleteCustomAlert,
        vehicles,
        selectedVehicle,
        setSelectedVehicle,
        addCustomVehicle,
        deleteVehicle,
        startLocation,
        setStartLocation,
        destinationLocation,
        setDestinationLocation,
        routingMode,
        setRoutingMode,
        departureTime,
        setDepartureTime,
        candidateRoutes,
        selectedRoute,
        setSelectedRoute,
        isAnalyzing,
        analysisStage,
        runRouteAnalysis,
        liveTrafficEnabled,
        toggleLiveTraffic,
        liveTick,
        systemStatus,
        fleet,
        selectedFleetVehicle,
        setSelectedFleetVehicle,
        alerts,
        acknowledgeAlert,
        cityZones,
        selectedZone,
        setSelectedZone,
        isDemoRunning,
        demoStep,
        demoFinalModalOpen,
        startGuidedDemo,
        closeDemoFinalModal,
        resetAllData
      }}
    >
      {children}
    </CityFlowContext.Provider>
  );
};

export const useCityFlow = (): CityFlowContextType => {
  const context = useContext(CityFlowContext);
  if (!context) {
    throw new Error('useCityFlow must be used within a CityFlowProvider');
  }
  return context;
};
