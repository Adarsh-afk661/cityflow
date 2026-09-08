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
  runRouteAnalysis: () => Promise<void>;

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
  const [startLocation, setStartLocation] = useState<string>('Central Warehouse');
  const [destinationLocation, setDestinationLocation] = useState<string>('North Distribution Hub');
  const [routingMode, setRoutingMode] = useState<RoutingMode>('balanced');
  const [departureTime, setDepartureTime] = useState<string>('Now (10:15 AM)');

  // Routes
  const [candidateRoutes, setCandidateRoutes] = useState<CandidateRoute[]>([]);
  const [selectedRoute, setSelectedRoute] = useState<CandidateRoute | null>(null);
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

  // Helper function to evaluate routes for a given vehicle and mode
  const evaluateRoutes = (veh: Vehicle, mode: RoutingMode): CandidateRoute[] => {
    const rawRoutes = INITIAL_BASE_ROUTES.map(baseRoute => {
      // 1. Physical Clearance Validation
      const clearanceEval = evaluateRouteClearance(veh, baseRoute.infrastructureEncountered);

      // 2. Predictive Reliability
      const reliability = predictJourneyReliability({
        baseDurationMin: baseRoute.baseDurationMin,
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
        distanceKm: baseRoute.distanceKm,
        vehicle: veh,
        trafficLevel: baseRoute.trafficLevel
      });

      return {
        ...baseRoute,
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
    const evaluated = evaluateRoutes(selectedVehicle, routingMode);
    setCandidateRoutes(evaluated);
    const recommended = evaluated.find(r => r.isRecommended) || evaluated[1] || evaluated[0];
    setSelectedRoute(recommended);
  }, []);

  // Periodic simulated live traffic tick
  useEffect(() => {
    if (!liveTrafficEnabled) return;

    const interval = setInterval(() => {
      setLiveTick(prev => prev + 1);

      // Jiggle zone pressure slightly to simulate dynamic pulse
      setCityZones(prev =>
        prev.map(zone => {
          const delta = (Math.random() - 0.48) * 3;
          const newScore = Math.max(30, Math.min(98, Math.round(zone.pressureScore + delta)));
          return {
            ...zone,
            pressureScore: newScore,
            status: newScore > 80 ? 'severe' : newScore > 65 ? 'heavy' : newScore > 45 ? 'moderate' : 'smooth'
          };
        })
      );

      // Slightly move vehicles on active routes
      setFleet(prevFleet =>
        prevFleet.map(veh => {
          if (veh.status !== 'active') return veh;
          const jitterX = (Math.random() - 0.5) * 2;
          const jitterY = (Math.random() - 0.5) * 2;
          return {
            ...veh,
            coordinates: {
              x: Math.round(veh.coordinates.x + jitterX),
              y: Math.round(veh.coordinates.y + jitterY)
            }
          };
        })
      );
    }, 4000);

    return () => clearInterval(interval);
  }, [liveTrafficEnabled]);

  // Route Analysis animated workflow (7 stages)
  const runRouteAnalysis = async (): Promise<void> => {
    setIsAnalyzing(true);
    setAnalysisStage(0);

    // 7-stage animated pipeline
    for (let step = 0; step < 7; step++) {
      setAnalysisStage(step);
      await new Promise(resolve => setTimeout(resolve, 220));
    }

    try {
      const response = await fetch('/api/routing/journey', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          start: startLocation,
          destination: destinationLocation,
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
    const calculated = evaluateRoutes(selectedVehicle, routingMode);
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
