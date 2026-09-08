import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { SimulationScenario } from '../types';
import { PRESET_SCENARIOS, SimulationResult, runStressSimulation } from '../services/simulationEngine';
import { useCityFlow } from './CityFlowContext';

interface SimulationContextType {
  scenarios: SimulationScenario[];
  toggleScenario: (id: string) => void;
  setScenarioSeverity: (id: string, severity: number) => void;
  simulationResult: SimulationResult | null;
  isSimulating: boolean;
  runSimulation: () => Promise<void>;
  resetSimulation: () => void;
}

const SimulationContext = createContext<SimulationContextType | undefined>(undefined);

export const SimulationProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { candidateRoutes } = useCityFlow();
  const [scenarios, setScenarios] = useState<SimulationScenario[]>(PRESET_SCENARIOS);
  const [simulationResult, setSimulationResult] = useState<SimulationResult | null>(null);
  const [isSimulating, setIsSimulating] = useState<boolean>(false);

  // Initialize with initial simulation calculation
  useEffect(() => {
    if (candidateRoutes.length > 0 && !simulationResult) {
      const initial = runStressSimulation(candidateRoutes, scenarios);
      setSimulationResult(initial);
    }
  }, [candidateRoutes]);

  const toggleScenario = (id: string) => {
    setScenarios(prev =>
      prev.map(s => (s.id === id ? { ...s, active: !s.active } : s))
    );
  };

  const setScenarioSeverity = (id: string, severity: number) => {
    setScenarios(prev =>
      prev.map(s => (s.id === id ? { ...s, severity } : s))
    );
  };

  const runSimulation = async () => {
    setIsSimulating(true);
    // Short simulation delay for visual feedback
    await new Promise(resolve => setTimeout(resolve, 600));
    const result = runStressSimulation(candidateRoutes, scenarios);
    setSimulationResult(result);
    setIsSimulating(false);
  };

  const resetSimulation = () => {
    setScenarios(PRESET_SCENARIOS);
    const result = runStressSimulation(candidateRoutes, PRESET_SCENARIOS);
    setSimulationResult(result);
  };

  return (
    <SimulationContext.Provider
      value={{
        scenarios,
        toggleScenario,
        setScenarioSeverity,
        simulationResult,
        isSimulating,
        runSimulation,
        resetSimulation
      }}
    >
      {children}
    </SimulationContext.Provider>
  );
};

export const useSimulation = (): SimulationContextType => {
  const context = useContext(SimulationContext);
  if (!context) {
    throw new Error('useSimulation must be used within a SimulationProvider');
  }
  return context;
};
