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
import { getCorridorCoordinates } from '../data/corridorRoutes';

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
  const [selectedCity, setSelectedCity] = useState<string>('Delhi — Greater Noida Corridor');

  // Permanent Authentication State — Never logs out
  const DEFAULT_OPERATOR: User = {
    id: 'op-chief-dispatcher',
    name: 'Chief Dispatcher',
    email: 'adarsh@cityflow.dev',
    role: 'dispatcher',
    isVerified: true
  };

  const [user, setUser] = useState<User | null>(() => {
    try {
      const saved = localStorage.getItem('cityflow_user');
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    try {
      localStorage.setItem('cityflow_user', JSON.stringify(DEFAULT_OPERATOR));
    } catch (e) {}
    return DEFAULT_OPERATOR;
  });
  const [loginModalOpen, setLoginModalOpen] = useState<boolean>(false);
  const [dataFeedModalOpen, setDataFeedModalOpen] = useState<boolean>(false);

  // Vehicles
  const [vehicles, setVehicles] = useState<Vehicle[]>(DEFAULT_VEHICLES);
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle>(DEFAULT_VEHICLES[0]); // Heavy Delivery Truck

  // Planning Form
  const [startLocation, setStartLocation] = useState<string>('Delhi');
  const [destinationLocation, setDestinationLocation] = useState<string>('Greater Noida');
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
    if (
      (s.includes('delhi') && (d.includes('greater noida') || d.includes('noida'))) ||
      ((s.includes('greater noida') || s.includes('noida')) && d.includes('delhi'))
    ) {
      return {
        'route-a': { dist: 42.17, dur: 42, name: 'NOIDA-GREATER NOIDA EXPRESSWAY', summary: 'Direct multi-lane expressway via Sector 126 & Pari Chowk' },
        'route-b': { dist: 48.07, dur: 45, name: 'REGIONAL RING & VIADUCT BYPASS', summary: 'High-clearance circumferential viaduct (5.2m overhead clearance)' },
        'route-c': { dist: 45.8, dur: 49, name: 'DADRI ARTERIAL & SURAJPUR CORRIDOR', summary: 'Commercial freight corridor avoiding peak city bottlenecks' }
      };
    }
    // Default: Delhi -> Greater Noida
    return {
      'route-a': { dist: 42.17, dur: 42, name: 'NOIDA-GREATER NOIDA EXPRESSWAY', summary: 'Direct multi-lane expressway via Sector 126 & Pari Chowk' },
      'route-b': { dist: 48.07, dur: 45, name: 'REGIONAL RING & VIADUCT BYPASS', summary: 'High-clearance circumferential viaduct (5.2m overhead clearance)' },
      'route-c': { dist: 45.8, dur: 49, name: 'DADRI ARTERIAL & SURAJPUR CORRIDOR', summary: 'Commercial freight corridor avoiding peak city bottlenecks' }
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
    const coords = getCorridorCoordinates(startLoc, destLoc);

    const rawRoutes = INITIAL_BASE_ROUTES.map(baseRoute => {
      const m = metrics[baseRoute.id as keyof typeof metrics] || {
        dist: baseRoute.distanceKm,
        dur: baseRoute.baseDurationMin,
        name: baseRoute.corridorName,
        summary: baseRoute.description
      };
      const effectiveDist = m.dist;
      const effectiveBaseDur = m.dur;
      const routeCoords = coords[baseRoute.id as keyof typeof coords] || baseRoute.realCoordinates;

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
        clearanceChecks: clearanceEval.checks,
        realCoordinates: routeCoords
      };
    });

    return rankCandidateRoutes(rawRoutes, mode);
  };

  // Run initial evaluation on mount & fetch live backend GIS journey
  useEffect(() => {
    const evaluated = evaluateRoutes(selectedVehicle, routingMode, 'Delhi', 'Greater Noida');
    setCandidateRoutes(evaluated);
    const recommended = evaluated.find(r => r.isRecommended) || evaluated[1] || evaluated[0];
    setSelectedRoute(recommended);

    // Asynchronously call real live OSRM/Weather/Clearance backend
    runRouteAnalysis('Delhi', 'Greater Noida');
  }, []);

  // ─────────────────────────────────────────────────────────────
  // ZONE PRESSURE REFRESH (backend only — no Math.random)
  // Fetches real zone status from /api/traffic every 30s.
  // Fleet telemetry is NOT simulated — GPS NOT CONNECTED.
  // ─────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!liveTrafficEnabled) return;

    const refreshZones = async () => {
      try {
        const res = await fetch('/api/traffic');
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data.zones) && data.zones.length > 0) {
            setCityZones(data.zones);
            setLiveTick(prev => prev + 1);
          }
        }
      } catch {
        // Traffic data unavailable — keep existing zone state, do not fake
      }
    };

    refreshZones();
    const interval = setInterval(refreshZones, 30000);
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
    setUser(DEFAULT_OPERATOR);
    try {
      localStorage.setItem('cityflow_user', JSON.stringify(DEFAULT_OPERATOR));
    } catch (e) {}
  };

  // Re-evaluate routes dynamically when routing mode, destination, or vehicle changes
  useEffect(() => {
    const updated = evaluateRoutes(selectedVehicle, routingMode, startLocation, destinationLocation);
    setCandidateRoutes(updated);

    // Select the best matching route for the active preference
    let targetRoute: CandidateRoute | undefined;
    if (routingMode === 'fastest') {
      targetRoute = [...updated].sort((a, b) => a.currentEtaMin - b.currentEtaMin).find(r => r.clearanceStatus === 'approved') || updated[0];
    } else if (routingMode === 'eco') {
      targetRoute = [...updated].sort((a, b) => a.estimatedCo2Kg - b.estimatedCo2Kg).find(r => r.clearanceStatus === 'approved') || updated[2] || updated[0];
    } else if (routingMode === 'reliable') {
      targetRoute = [...updated].sort((a, b) => b.reliabilityScore - a.reliabilityScore).find(r => r.clearanceStatus === 'approved') || updated[1] || updated[0];
    } else if (routingMode === 'clearance') {
      targetRoute = updated.find(r => r.clearanceStatus === 'approved') || updated[1] || updated[0];
    } else {
      // Balanced
      targetRoute = updated.find(r => r.isRecommended) || updated.find(r => r.clearanceStatus === 'approved') || updated[0];
    }

    if (targetRoute) {
      setSelectedRoute(targetRoute);
    }
  }, [routingMode, selectedVehicle, startLocation, destinationLocation]);

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
