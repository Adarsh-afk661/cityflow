import { CandidateRoute, RoutingMode } from '../types';

export interface RankingWeights {
  timeWeight: number;
  reliabilityWeight: number;
  safetyWeight: number;
  co2Weight: number;
  clearanceWeight: number;
}

export const MODE_WEIGHTS: Record<RoutingMode, RankingWeights> = {
  fastest: {
    timeWeight: 0.55,
    reliabilityWeight: 0.20,
    safetyWeight: 0.15,
    co2Weight: 0.10,
    clearanceWeight: 0.00
  },
  reliable: {
    timeWeight: 0.15,
    reliabilityWeight: 0.55,
    safetyWeight: 0.20,
    co2Weight: 0.10,
    clearanceWeight: 0.00
  },
  eco: {
    timeWeight: 0.15,
    reliabilityWeight: 0.20,
    safetyWeight: 0.15,
    co2Weight: 0.50,
    clearanceWeight: 0.00
  },
  clearance: {
    timeWeight: 0.10,
    reliabilityWeight: 0.15,
    safetyWeight: 0.25,
    co2Weight: 0.10,
    clearanceWeight: 0.40
  },
  balanced: {
    timeWeight: 0.30,
    reliabilityWeight: 0.30,
    safetyWeight: 0.20,
    co2Weight: 0.10,
    clearanceWeight: 0.10
  }
};

export function rankCandidateRoutes(
  routes: CandidateRoute[],
  mode: RoutingMode = 'balanced'
): CandidateRoute[] {
  if (routes.length === 0) return [];

  const weights = MODE_WEIGHTS[mode];

  // Find baselines across available routes for normalization
  const minTime = Math.min(...routes.map(r => r.currentEtaMin));
  const maxTime = Math.max(...routes.map(r => r.currentEtaMin));
  const minCo2 = Math.min(...routes.map(r => r.estimatedCo2Kg));
  const maxCo2 = Math.max(...routes.map(r => r.estimatedCo2Kg));

  const scoredRoutes = routes.map(route => {
    // Clearance failure is a strict dealbreaker
    if (route.clearanceStatus === 'failed') {
      return {
        ...route,
        overallScore: 20, // baseline low score
        isRecommended: false,
        co2SavingsKg: 0
      };
    }

    // Time score (lower ETA -> higher score: 0 to 100)
    const timeRatio = maxTime === minTime ? 1 : 1 - ((route.currentEtaMin - minTime) / (maxTime || 1));
    const timeScore = Math.max(20, Math.min(100, Math.round(timeRatio * 100)));

    // Reliability score (already 0-100)
    const reliabilityScore = route.reliabilityScore;

    // Safety score (already 0-100)
    const safetyScore = route.safetyScore;

    // CO2 score (lower CO2 -> higher score: 0 to 100)
    const co2Ratio = maxCo2 === minCo2 ? 1 : 1 - ((route.estimatedCo2Kg - minCo2) / (maxCo2 || 1));
    const co2Score = Math.max(20, Math.min(100, Math.round(co2Ratio * 100)));

    // Clearance score (approved = 100)
    const clearanceScore = 100;

    const compositeScore = Math.round(
      timeScore * weights.timeWeight +
      reliabilityScore * weights.reliabilityWeight +
      safetyScore * weights.safetyWeight +
      co2Score * weights.co2Weight +
      clearanceScore * weights.clearanceWeight
    );

    // CO2 savings compared to the fastest route
    const fastestRoute = routes.reduce((prev, curr) => (curr.currentEtaMin < prev.currentEtaMin ? curr : prev), routes[0]);
    const co2Savings = Math.max(0, +(fastestRoute.estimatedCo2Kg - route.estimatedCo2Kg).toFixed(1));

    return {
      ...route,
      overallScore: Math.min(99, Math.max(30, compositeScore)),
      co2SavingsKg: co2Savings,
      isRecommended: false // will be set below
    };
  });

  // Pick best feasible route
  const feasibleRoutes = scoredRoutes.filter(r => r.clearanceStatus === 'approved');
  let bestFeasibleId = '';

  if (feasibleRoutes.length > 0) {
    const highestScored = feasibleRoutes.reduce((prev, curr) => (curr.overallScore > prev.overallScore ? curr : prev), feasibleRoutes[0]);
    bestFeasibleId = highestScored.id;
  }

  return scoredRoutes.map(r => ({
    ...r,
    isRecommended: r.id === bestFeasibleId
  }));
}
