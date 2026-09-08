import { TrafficState, Vehicle } from '../types';

export interface ReliabilityInputs {
  baseDurationMin: number;
  trafficLevel: TrafficState;
  vehicle: Vehicle;
  incidentCount: number;
  weatherSeverityMultiplier?: number;
}

export interface ReliabilityOutput {
  predictedEtaMin: number;
  predictedTimeRange: { min: number; max: number };
  reliabilityScore: number; // 0 - 100
  delayRiskPercent: number; // 0 - 100
}

export function predictJourneyReliability(inputs: ReliabilityInputs): ReliabilityOutput {
  const {
    baseDurationMin,
    trafficLevel,
    vehicle,
    incidentCount,
    weatherSeverityMultiplier = 1.0
  } = inputs;

  // Traffic multiplier
  let trafficDelayFactor = 1.0;
  let baseVariancePercent = 0.08;

  switch (trafficLevel) {
    case 'smooth':
      trafficDelayFactor = 1.02;
      baseVariancePercent = 0.05;
      break;
    case 'moderate':
      trafficDelayFactor = 1.15;
      baseVariancePercent = 0.12;
      break;
    case 'heavy':
      trafficDelayFactor = 1.45;
      baseVariancePercent = 0.22;
      break;
    case 'severe':
      trafficDelayFactor = 1.85;
      baseVariancePercent = 0.35;
      break;
  }

  // Heavy vehicle penalty in congested urban corridors
  const vehicleManeuverFactor = (vehicle.type === 'truck' || vehicle.type === 'bus') ? 1.08 : 1.0;
  const incidentDelayMinutes = incidentCount * 12;

  // Calculate ETA with weather
  const effectiveDelayFactor = (trafficDelayFactor - 1.0) * weatherSeverityMultiplier + 1.0;
  const rawEta = baseDurationMin * effectiveDelayFactor * vehicleManeuverFactor + incidentDelayMinutes;
  const predictedEtaMin = Math.round(rawEta);

  // Range calculation (Confidence interval)
  const spread = Math.max(3, Math.round(predictedEtaMin * baseVariancePercent * weatherSeverityMultiplier));
  const minRange = Math.max(baseDurationMin, predictedEtaMin - spread);
  const maxRange = predictedEtaMin + spread + Math.round(incidentCount * 5);

  // Reliability Score (0-100)
  // Drops with higher delays, heavy traffic, and weather volatility
  let reliability = 100;
  if (trafficLevel === 'moderate') reliability -= 8;
  if (trafficLevel === 'heavy') reliability -= 24;
  if (trafficLevel === 'severe') reliability -= 45;
  reliability -= incidentCount * 15;
  if (weatherSeverityMultiplier > 1.0) {
    reliability -= Math.round((weatherSeverityMultiplier - 1.0) * 20);
  }
  if (vehicle.type === 'truck' && trafficLevel !== 'smooth') {
    reliability -= 4; // trucks have fewer alternative cut-through lanes
  }

  const reliabilityScore = Math.max(25, Math.min(99, Math.round(reliability)));

  // Delay probability percent
  let delayRisk = (100 - reliabilityScore) * 0.75;
  if (trafficLevel === 'heavy') delayRisk += 10;
  if (trafficLevel === 'severe') delayRisk += 25;
  const delayRiskPercent = Math.max(5, Math.min(96, Math.round(delayRisk)));

  return {
    predictedEtaMin,
    predictedTimeRange: { min: minRange, max: maxRange },
    reliabilityScore,
    delayRiskPercent
  };
}
