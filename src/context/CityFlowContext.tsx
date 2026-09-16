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
import { calculateDynamicRoutes, RouteEndpoints } from '../services/dynamicRouting';
import { searchDelhiPlaces, findClosestPlace, DELHI_NCR_PLACES } from '../services/delhiPlaces';
import { resolveLocationCoordinates } from '../services/universalGeocoder';

export type PageName = 'landing' | 'login' | 'dashboard' | 'routeshield' | 'fleet' | 'whatif' | 'analytics' | 'alerts' | 'settings';

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
  loginAs: (user: User) => void;
  logout: () => void;

  // Mobile navigation
  mobileMenuOpen: boolean;
  setMobileMenuOpen: (open: boolean) => void;

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

  // Real Dynamic Coordinates
  startCoords: [number, number] | null;
  setStartCoords: (coords: [number, number] | null) => void;
  destCoords: [number, number] | null;
  setDestCoords: (coords: [number, number] | null) => void;
  setRouteEndpoints: (startName: string, startCoords: [number, number], destName: string, destCoords: [number, number]) => void;
  setPointFromMap: (type: 'start' | 'dest', coords: [number, number], name?: string) => void;

  // Google Maps API
  googleApiKey: string;
  setGoogleApiKey: (key: string) => void;

  // Analysis & Routes
  candidateRoutes: CandidateRoute[];
  selectedRoute: CandidateRoute | null;
  setSelectedRoute: (route: CandidateRoute | null) => void;
  isAnalyzing: boolean;
  analysisStage: number;
  runRouteAnalysis: (startOverride?: string, destOverride?: string, sCoords?: [number, number], dCoords?: [number, number]) => Promise<void>;

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
  const [activePage, setActivePage] = useState<PageName>(() => {
    try {
      const saved = localStorage.getItem('cityflow_user');
      if (saved && JSON.parse(saved)) return 'dashboard';
    } catch (e) {}
    return 'login';
  });
  const [selectedCity, setSelectedCity] = useState<string>('Delhi — Greater Noida Corridor');
  const [mobileMenuOpen, setMobileMenuOpen] = useState<boolean>(false);

  const [user, setUser] = useState<User | null>(() => {
    try {
      const saved = localStorage.getItem('cityflow_user');
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return null;
  });
  const [loginModalOpen, setLoginModalOpen] = useState<boolean>(false);
  const [dataFeedModalOpen, setDataFeedModalOpen] = useState<boolean>(false);

  // Vehicles
  const [vehicles, setVehicles] = useState<Vehicle[]>(DEFAULT_VEHICLES);
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle>(DEFAULT_VEHICLES[0]); // Heavy Delivery Truck

  // Planning Form & Specific Coordinates (Default: CP to Pari Chowk Greater Noida)
  const [startLocation, setStartLocation] = useState<string>('Connaught Place (Rajiv Chowk)');
  const [destinationLocation, setDestinationLocation] = useState<string>('Pari Chowk, Greater Noida');
  const [startCoords, setStartCoords] = useState<[number, number] | null>([28.6328, 77.2197]);
  const [destCoords, setDestCoords] = useState<[number, number] | null>([28.4744, 77.5040]);
  const [routingMode, setRoutingMode] = useState<RoutingMode>('balanced');
  const [departureTime, setDepartureTime] = useState<string>('Now (10:15 AM)');

  // Google Maps API Key
  const [googleApiKey, setGoogleApiKeyState] = useState<string>(() => {
    return (
      (import.meta.env.VITE_GOOGLE_MAPS_API_KEY as string) ||
      (typeof window !== 'undefined' ? localStorage.getItem('CITYFLOW_GOOGLE_MAPS_KEY') || '' : '')
    );
  });

  const setGoogleApiKey = (key: string) => {
    setGoogleApiKeyState(key);
    try {
      if (typeof window !== 'undefined') {
        localStorage.setItem('CITYFLOW_GOOGLE_MAPS_KEY', key);
      }
    } catch (e) {}
  };

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

  // Helper to resolve coordinates for any custom location name in Delhi or worldwide
  const resolveCoordinates = async (query: string, fallback: [number, number]): Promise<[number, number]> => {
    try {
      const res = await resolveLocationCoordinates(query, fallback);
      return res.coords;
    } catch (e) {
      console.warn('[CityFlowContext] Geocoding fallback used:', e);
      return fallback;
    }
  };

  // Set endpoints atomically and analyze
  const setRouteEndpoints = (
    startName: string,
    sCoords: [number, number],
    destName: string,
    dCoords: [number, number]
  ) => {
    setStartLocation(startName);
    setStartCoords(sCoords);
    setDestinationLocation(destName);
    setDestCoords(dCoords);
    runRouteAnalysis(startName, destName, sCoords, dCoords);
  };

  // Set origin or destination from clicking on the map
  const setPointFromMap = (type: 'start' | 'dest', coords: [number, number], name?: string) => {
    const closest = findClosestPlace(coords[0], coords[1]);
    const computedName = name || (closest ? `${closest.name}` : `Pin (${coords[0].toFixed(4)}, ${coords[1].toFixed(4)})`);
    if (type === 'start') {
      setStartLocation(computedName);
      setStartCoords(coords);
      runRouteAnalysis(computedName, destinationLocation, coords, destCoords || [28.4744, 77.5040]);
    } else {
      setDestinationLocation(computedName);
      setDestCoords(coords);
      runRouteAnalysis(startLocation, computedName, startCoords || [28.6328, 77.2197], coords);
    }
  };

  // Run initial evaluation on mount & fetch live dynamic road journey
  useEffect(() => {
    runRouteAnalysis('Connaught Place (Rajiv Chowk)', 'Pari Chowk, Greater Noida', [28.6328, 77.2197], [28.4744, 77.5040]);
  }, []);

  // Recalculate routes dynamically when vehicle or routing mode changes
  useEffect(() => {
    if (startCoords && destCoords) {
      calculateDynamicRoutes(
        {
          startName: startLocation,
          startCoords,
          destName: destinationLocation,
          destCoords
        },
        selectedVehicle,
        routingMode
      ).then(routes => {
        setCandidateRoutes(routes);
        const top = routes.find(r => r.isRecommended) || routes.find(r => r.clearanceStatus === 'approved') || routes[0];
        setSelectedRoute(top);
      });
    }
  }, [routingMode, selectedVehicle]);

  // ─────────────────────────────────────────────────────────────
  // ZONE PRESSURE REFRESH (backend only — no Math.random)
  // Fetches real zone status from /api/traffic every 30s.
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
        // Traffic data unavailable
      }
    };

    refreshZones();
    const interval = setInterval(refreshZones, 30000);
    return () => clearInterval(interval);
  }, [liveTrafficEnabled]);

  // Route Analysis animated workflow
  const runRouteAnalysis = async (
    startOverride?: string,
    destOverride?: string,
    sCoordsOverride?: [number, number],
    dCoordsOverride?: [number, number]
  ): Promise<void> => {
    const startTarget = startOverride || startLocation;
    const destTarget = destOverride || destinationLocation;

    if (startOverride) setStartLocation(startOverride);
    if (destOverride) setDestinationLocation(destOverride);

    setIsAnalyzing(true);
    setAnalysisStage(0);

    // Resolve exact GPS coordinates: if an override was provided or if the place name changed, resolve fresh coordinates
    let effectiveSCoords = sCoordsOverride;
    if (!effectiveSCoords) {
      if (startCoords && (!startOverride || startOverride === startLocation)) {
        effectiveSCoords = startCoords;
      } else {
        effectiveSCoords = await resolveCoordinates(startTarget, [28.6328, 77.2197]);
      }
    }

    let effectiveDCoords = dCoordsOverride;
    if (!effectiveDCoords) {
      if (destCoords && (!destOverride || destOverride === destinationLocation)) {
        effectiveDCoords = destCoords;
      } else {
        effectiveDCoords = await resolveCoordinates(destTarget, [28.4744, 77.5040]);
      }
    }

    setStartCoords(effectiveSCoords);
    setDestCoords(effectiveDCoords);

    // 5-stage animated analysis pipeline
    for (let step = 0; step < 5; step++) {
      setAnalysisStage(step);
      await new Promise(resolve => setTimeout(resolve, 140));
    }

    try {
      const response = await fetch('/api/routing/journey', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          start: startTarget,
          destination: destTarget,
          startCoords: effectiveSCoords,
          destCoords: effectiveDCoords,
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
      console.warn('[CityFlow] Live backend API fallback, running dynamic road routing engine:', err);
    }

    // Dynamic Geodesic / OSRM routing directly in client
    try {
      const dynamicRoutes = await calculateDynamicRoutes(
        {
          startName: startTarget,
          startCoords: effectiveSCoords,
          destName: destTarget,
          destCoords: effectiveDCoords
        },
        selectedVehicle,
        routingMode
      );
      setCandidateRoutes(dynamicRoutes);
      const topFeasible = dynamicRoutes.find(r => r.isRecommended) || dynamicRoutes.find(r => r.clearanceStatus === 'approved') || dynamicRoutes[0];
      setSelectedRoute(topFeasible);
    } catch (e) {
      console.error('Dynamic routing engine error:', e);
    } finally {
      setIsAnalyzing(false);
    }
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

  const loginAs = (newUser: User) => {
    setUser(newUser);
    try {
      localStorage.setItem('cityflow_user', JSON.stringify(newUser));
    } catch (e) {}
    setActivePage('dashboard');
  };

  const logout = () => {
    setUser(null);
    try {
      localStorage.removeItem('cityflow_user');
    } catch (e) {}
    setActivePage('login');
  };



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
    setStartLocation('Connaught Place (Rajiv Chowk)');
    setDestinationLocation('Pari Chowk, Greater Noida');
    setStartCoords([28.6328, 77.2197]);
    setDestCoords([28.4744, 77.5040]);
    setRoutingMode('balanced');
    setFleet(INITIAL_FLEET);
    setAlerts(INITIAL_ALERTS);
    setCityZones(CITY_ZONES);
    runRouteAnalysis('Connaught Place (Rajiv Chowk)', 'Pari Chowk, Greater Noida', [28.6328, 77.2197], [28.4744, 77.5040]);
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
        loginAs,
        logout,
        mobileMenuOpen,
        setMobileMenuOpen,
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
        startCoords,
        setStartCoords,
        destCoords,
        setDestCoords,
        setRouteEndpoints,
        setPointFromMap,
        googleApiKey,
        setGoogleApiKey,
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
