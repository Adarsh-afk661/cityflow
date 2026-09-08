import { TrafficState } from '../types';

export interface SafetyInputs {
  baseSafetyScore: number;
  trafficLevel: TrafficState;
  hasClearanceIssue: boolean;
  activeIncidentsOnRoute: number;
  weatherSeverityMultiplier?: number;
  roadType: 'expressway' | 'beltway' | 'parkway';
}

export interface SafetyEvaluation {
  overallScore: number; // 0-100
  breakdown: {
    trafficRisk: number;       // lower is better (0-100)
    roadComplexity: number;    // lower is better (0-100)
    incidentRisk: number;      // lower is better (0-100)
    weatherRisk: number;       // lower is better (0-100)
    infrastructureRisk: number;// lower is better (0-100)
  };
}

export function calculateSafetyScore(inputs: SafetyInputs): SafetyEvaluation {
  const {
    trafficLevel,
    hasClearanceIssue,
    activeIncidentsOnRoute,
    weatherSeverityMultiplier = 1.0,
    roadType
  } = inputs;

  let trafficRisk = 12;
  if (trafficLevel === 'moderate') trafficRisk = 24;
  if (trafficLevel === 'heavy') trafficRisk = 48;
  if (trafficLevel === 'severe') trafficRisk = 76;

  let roadComplexity = roadType === 'expressway' ? 22 : roadType === 'parkway' ? 14 : 10;
  let incidentRisk = activeIncidentsOnRoute * 28;
  let weatherRisk = Math.min(85, Math.round(10 * weatherSeverityMultiplier));
  let infrastructureRisk = hasClearanceIssue ? 85 : 8;

  // Composite risk calculation
  const weightedRisk = (
    trafficRisk * 0.25 +
    roadComplexity * 0.15 +
    incidentRisk * 0.25 +
    weatherRisk * 0.20 +
    infrastructureRisk * 0.15
  );

  const overallScore = Math.max(15, Math.min(99, Math.round(100 - weightedRisk)));

  return {
    overallScore,
    breakdown: {
      trafficRisk,
      roadComplexity,
      incidentRisk,
      weatherRisk,
      infrastructureRisk
    }
  };
}
