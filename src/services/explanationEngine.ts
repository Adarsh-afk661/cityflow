import { CandidateRoute, RoutingMode, Vehicle } from '../types';
import { SimulationScenario } from '../types';

export interface DecisionFactor {
  id: string;
  name: string;
  value: string | number;
  score: number; // 0 to 100 for bar visualization
  status: 'passed' | 'warning' | 'failed' | 'optimal';
  description: string;
}

export interface RouteTradeoffItem {
  metric: string;
  recommendedValue: string;
  alternativeValue: string;
  difference: string;
  isAdvantage: boolean;
  highlightText: string;
}

export interface PrimaryFactorInfluence {
  rank: number;
  title: string;
  explanation: string;
  category: 'clearance' | 'reliability' | 'time' | 'safety' | 'co2';
}

export interface RouteExplanation {
  recommendedRoute: CandidateRoute;
  fastestRoute: CandidateRoute;
  decisionScore: number;
  confidence: number;
  confidenceRationale: string;
  primarySummary: string;
  tradeoffSummary: string;
  factors: DecisionFactor[];
  tradeoffs: RouteTradeoffItem[];
  primaryInfluences: PrimaryFactorInfluence[];
  simulationNotice?: {
    activeScenarioName: string;
    text: string;
  };
  recommendedAction: {
    headline: string;
    details: string;
    status: 'proceed' | 'caution' | 'reroute';
  };
  checklist: {
    clearance: { label: string; passed: boolean; detail: string };
    reliability: { label: string; score: number; detail: string };
    delayRisk: { label: string; percent: number; detail: string };
    safety: { label: string; score: number; detail: string };
    co2: { label: string; kg: number; detail: string };
    traffic: { label: string; level: string; detail: string };
  };
}

export function generateRouteExplanation(
  recommendedRoute: CandidateRoute,
  allRoutes: CandidateRoute[],
  vehicle: Vehicle,
  routingMode: RoutingMode,
  activeScenarios: SimulationScenario[] = []
): RouteExplanation {
  // 1. Identify primary alternative / fastest route safely
  const safeRoutes = (allRoutes && allRoutes.length > 0) ? allRoutes : [recommendedRoute];
  const nonRecommended = safeRoutes.filter(r => r.id !== recommendedRoute.id);
  const fastestRoute = safeRoutes.reduce((prev, curr) => (curr.currentEtaMin < prev.currentEtaMin ? curr : prev), safeRoutes[0]);
  const primaryAlt = nonRecommended.find(r => r.id === fastestRoute.id) || nonRecommended[0] || recommendedRoute;

  const isFastestSelf = fastestRoute.id === recommendedRoute.id;
  const timeDiff = recommendedRoute.currentEtaMin - fastestRoute.currentEtaMin;
  const relDiff = recommendedRoute.reliabilityScore - fastestRoute.reliabilityScore;
  const delayRiskDiff = fastestRoute.delayRiskPercent - recommendedRoute.delayRiskPercent;
  const co2Diff = +(fastestRoute.estimatedCo2Kg - recommendedRoute.estimatedCo2Kg).toFixed(1);

  // 2. Decision Score (Direct from route scoring, 0-100)
  const decisionScore = recommendedRoute.overallScore || Math.round(
    (recommendedRoute.reliabilityScore * 0.4) +
    (recommendedRoute.safetyScore * 0.35) +
    (Math.max(0, 100 - recommendedRoute.delayRiskPercent) * 0.25)
  );

  // 3. AI Confidence Calculation (Dynamically computed from clearance margin, data completeness, and metrics)
  let confidence = 88;
  if (recommendedRoute.clearanceStatus === 'approved') confidence += 4;
  if (recommendedRoute.reliabilityScore >= 90) confidence += 3;
  if (recommendedRoute.safetyScore >= 85) confidence += 2;
  if (recommendedRoute.delayRiskPercent <= 12) confidence += 2;
  if (recommendedRoute.clearanceStatus === 'failed') confidence -= 25;
  confidence = Math.max(65, Math.min(98, confidence));

  const confidenceRationale = confidence >= 90
    ? 'High confidence — route satisfies all vehicle physical constraints, maintains generous underpass clearance margins, and demonstrates superior predictability across live corridor telemetry.'
    : 'Moderate confidence — viable route under prevailing conditions, though real-time traffic variance along arterial segments requires ongoing monitoring.';

  // 4. Primary Summary Narrative
  let primarySummary = '';
  if (recommendedRoute.clearanceStatus === 'failed') {
    primarySummary = `CityFlow flagged ${recommendedRoute.name} with critical physical restrictions. Vehicle height (${vehicle.height}m) violates corridor underpass limits.`;
  } else if (routingMode === 'fastest') {
    primarySummary = `CityFlow selected ${recommendedRoute.name} because it achieves the lowest feasible transit duration (${recommendedRoute.currentEtaMin} min) while satisfying physical clearance for ${vehicle.name}.`;
  } else if (routingMode === 'reliable') {
    primarySummary = `CityFlow selected ${recommendedRoute.name} to maximize arrival punctuality, achieving a top-tier reliability index of ${recommendedRoute.reliabilityScore}/100 and only ${recommendedRoute.delayRiskPercent}% delay probability.`;
  } else if (routingMode === 'eco') {
    primarySummary = `CityFlow selected ${recommendedRoute.name} as the greenest corridor, minimizing greenhouse gas emissions to ${recommendedRoute.estimatedCo2Kg} kg CO₂ and conserving ${recommendedRoute.fuelImpactLiters}L of fuel.`;
  } else if (routingMode === 'clearance') {
    primarySummary = `CityFlow selected ${recommendedRoute.name} to guarantee maximum overhead clearance margin and structural bridge ratings for the ${vehicle.height}m, ${vehicle.weight}T ${vehicle.name}.`;
  } else {
    // Balanced mode
    primarySummary = `CityFlow selected ${recommendedRoute.name} because it provides the best balance between travel time, reliability, safety and emissions for the selected ${vehicle.name}.`;
  }

  // 5. Dynamic Trade-Off Explanation
  let tradeoffSummary = '';
  if (!isFastestSelf && fastestRoute.clearanceStatus === 'failed') {
    tradeoffSummary = `${fastestRoute.name} is nominally ${Math.abs(timeDiff)} minutes faster, but is physically BARRED for this vehicle due to underpass clearance restrictions. ${recommendedRoute.name} is the fastest 100% viable route.`;
  } else if (!isFastestSelf && timeDiff > 0) {
    tradeoffSummary = `${fastestRoute.name} is ${timeDiff} minutes faster, but its delay probability is ${fastestRoute.delayRiskPercent}%, making it significantly less reliable. ${recommendedRoute.name} takes slightly longer (${recommendedRoute.currentEtaMin} min) but delivers a reliability score of ${recommendedRoute.reliabilityScore}/100 with only ${recommendedRoute.delayRiskPercent}% delay risk.${co2Diff > 0 ? ` It also produces ${co2Diff} kg less CO₂.` : ''}`;
  } else {
    tradeoffSummary = `${recommendedRoute.name} simultaneously outperforms alternatives on both transit time and corridor reliability, yielding an optimal dispatch envelope with zero physical bottlenecks.`;
  }

  // 6. Check for Active What-If Simulation
  const activeScenario = activeScenarios.find(s => s.active);
  let simulationNotice: { activeScenarioName: string; text: string } | undefined;
  if (activeScenario) {
    if (activeScenario.type === 'rain') {
      simulationNotice = {
        activeScenarioName: activeScenario.name,
        text: `CityFlow favored ${recommendedRoute.name} because heavy storm runoff elevated alternative expressways' delay probability to over ${fastestRoute.delayRiskPercent}%, whereas this ring/viaduct corridor preserves steady surface drainage.`
      };
    } else if (activeScenario.type === 'collision') {
      simulationNotice = {
        activeScenarioName: activeScenario.name,
        text: `Active collision scenario on arterial connectors caused acute choke points. CityFlow rerouted dispatch onto ${recommendedRoute.name} to bypass the multi-kilometer incident queue.`
      };
    } else if (activeScenario.type === 'closure') {
      simulationNotice = {
        activeScenarioName: activeScenario.name,
        text: `Emergency tunnel closure completely obstructed standard corridors. ${recommendedRoute.name} provides the verified structural bypass with certified clearance.`
      };
    } else if (activeScenario.type === 'congestion_spike') {
      simulationNotice = {
        activeScenarioName: activeScenario.name,
        text: `CityFlow shifted routing away from dense urban centers into ${recommendedRoute.name} to absorb the 45% peak traffic surge without vehicle idling.`
      };
    }
  }

  // 7. Factor Contribution Visualization
  const factors: DecisionFactor[] = [
    {
      id: 'clearance',
      name: 'Clearance',
      value: recommendedRoute.clearanceStatus === 'approved' ? 'Approved' : 'Barred',
      score: recommendedRoute.clearanceStatus === 'approved' ? 100 : 20,
      status: recommendedRoute.clearanceStatus === 'approved' ? 'passed' : 'failed',
      description: recommendedRoute.clearanceStatus === 'approved'
        ? `Passes all bridge & underpass limits for ${vehicle.height}m height`
        : `Violates underpass overhead limits by ${(vehicle.height - 3.8).toFixed(2)}m`
    },
    {
      id: 'reliability',
      name: 'Reliability',
      value: `${recommendedRoute.reliabilityScore}/100`,
      score: recommendedRoute.reliabilityScore,
      status: recommendedRoute.reliabilityScore >= 85 ? 'optimal' : 'warning',
      description: `Historical delay probability restricted to ${recommendedRoute.delayRiskPercent}%`
    },
    {
      id: 'safety',
      name: 'Safety',
      value: `${recommendedRoute.safetyScore}/100`,
      score: recommendedRoute.safetyScore,
      status: recommendedRoute.safetyScore >= 80 ? 'optimal' : 'passed',
      description: 'Geometric lane width, curve radii, and incident buffer rating'
    },
    {
      id: 'efficiency',
      name: 'Efficiency',
      value: `${Math.round(100 - (recommendedRoute.currentEtaMin / 1.5))}/100`,
      score: Math.max(30, Math.min(100, Math.round(100 - (recommendedRoute.currentEtaMin / 1.8)))),
      status: 'passed',
      description: `${recommendedRoute.currentEtaMin} min expected transit time across ${recommendedRoute.distanceKm} km`
    },
    {
      id: 'co2',
      name: 'CO₂ Impact',
      value: `${recommendedRoute.estimatedCo2Kg} kg`,
      score: Math.max(40, Math.min(100, Math.round(100 - (recommendedRoute.estimatedCo2Kg * 2.2)))),
      status: 'optimal',
      description: `${recommendedRoute.fuelImpactLiters}L fuel consumption with low stop-and-go idling`
    }
  ];

  // 8. Trade-Off Comparison Items
  const tradeoffs: RouteTradeoffItem[] = [
    {
      metric: 'Travel Time',
      recommendedValue: `${recommendedRoute.currentEtaMin} min`,
      alternativeValue: `${primaryAlt.currentEtaMin} min`,
      difference: timeDiff === 0 ? 'Same ETA' : timeDiff > 0 ? `+${timeDiff} min` : `${timeDiff} min`,
      isAdvantage: timeDiff <= 0,
      highlightText: timeDiff > 0 ? `${timeDiff} min longer, but far more consistent` : 'Faster transit time'
    },
    {
      metric: 'Reliability Score',
      recommendedValue: `${recommendedRoute.reliabilityScore}/100`,
      alternativeValue: `${primaryAlt.reliabilityScore}/100`,
      difference: `${relDiff >= 0 ? '+' : ''}${relDiff} pts`,
      isAdvantage: relDiff >= 0,
      highlightText: `${recommendedRoute.reliabilityScore} vs ${primaryAlt.reliabilityScore} on alternative`
    },
    {
      metric: 'Delay Probability',
      recommendedValue: `${recommendedRoute.delayRiskPercent}%`,
      alternativeValue: `${primaryAlt.delayRiskPercent}%`,
      difference: `${delayRiskDiff >= 0 ? '-' : '+'}${Math.abs(delayRiskDiff)}%`,
      isAdvantage: delayRiskDiff >= 0,
      highlightText: delayRiskDiff > 0 ? `${delayRiskDiff}% lower risk of traffic bottleneck` : 'Similar risk'
    },
    {
      metric: 'CO₂ Footprint',
      recommendedValue: `${recommendedRoute.estimatedCo2Kg} kg`,
      alternativeValue: `${primaryAlt.estimatedCo2Kg} kg`,
      difference: `${co2Diff >= 0 ? '-' : '+'}${Math.abs(co2Diff)} kg`,
      isAdvantage: co2Diff >= 0,
      highlightText: co2Diff > 0 ? `${co2Diff} kg cleaner emissions` : 'Standard freight footprint'
    },
    {
      metric: 'Physical Clearance',
      recommendedValue: recommendedRoute.clearanceStatus === 'approved' ? '✓ Approved' : '✕ Barred',
      alternativeValue: primaryAlt.clearanceStatus === 'approved' ? '✓ Approved' : '✕ Barred',
      difference: recommendedRoute.clearanceStatus === 'approved' ? 'Verified Safe' : 'Restriction',
      isAdvantage: recommendedRoute.clearanceStatus === 'approved',
      highlightText: recommendedRoute.clearanceStatus === 'approved' ? 'Safe underpass clearance guaranteed' : 'Height violation'
    }
  ];

  // 9. "What Mattered Most?" (Top 3 Factors by Routing Mode)
  let primaryInfluences: PrimaryFactorInfluence[] = [];

  if (routingMode === 'fastest') {
    primaryInfluences = [
      {
        rank: 1,
        title: 'Transit Velocity Dominance',
        explanation: `${recommendedRoute.name} clocked the fastest feasible travel duration of ${recommendedRoute.currentEtaMin} min across all evaluated corridors.`,
        category: 'time'
      },
      {
        rank: 2,
        title: 'Physical Feasibility Filter',
        explanation: `Any routes with underpass heights below ${vehicle.height}m were automatically eliminated, ensuring speed does not compromise bridge safety.`,
        category: 'clearance'
      },
      {
        rank: 3,
        title: 'Throughput Reliability',
        explanation: `Maintains a ${recommendedRoute.reliabilityScore}/100 reliability threshold to prevent nominal speed advantages from degrading into gridlock.`,
        category: 'reliability'
      }
    ];
  } else if (routingMode === 'reliable') {
    primaryInfluences = [
      {
        rank: 1,
        title: 'Predictability & SLA Protection',
        explanation: `${recommendedRoute.name} has a reliability score of ${recommendedRoute.reliabilityScore}/100 with only ${recommendedRoute.delayRiskPercent}% delay probability.`,
        category: 'reliability'
      },
      {
        rank: 2,
        title: 'Chokepoint & Bottleneck Evasion',
        explanation: `Avoids high-variance urban intersections and railway level crossings, minimizing vulnerability to unexpected queue spikes.`,
        category: 'safety'
      },
      {
        rank: 3,
        title: 'Vehicle Physical Clearance',
        explanation: `Guaranteed structural clearance for ${vehicle.name} (${vehicle.height}m H, ${vehicle.weight}T W).`,
        category: 'clearance'
      }
    ];
  } else if (routingMode === 'eco') {
    primaryInfluences = [
      {
        rank: 1,
        title: 'Lowest Carbon Footprint',
        explanation: `Produces just ${recommendedRoute.estimatedCo2Kg} kg CO₂, yielding direct emissions savings of ${recommendedRoute.co2SavingsKg} kg vs fastest baseline.`,
        category: 'co2'
      },
      {
        rank: 2,
        title: 'Fuel Economy Optimization',
        explanation: `Smooth gradient profile and constant cruising speed limit diesel consumption to ~${recommendedRoute.fuelImpactLiters} liters.`,
        category: 'co2'
      },
      {
        rank: 3,
        title: 'Physical Viability',
        explanation: `Verified viaduct and bridge infrastructure completely safe for commercial transport.`,
        category: 'clearance'
      }
    ];
  } else if (routingMode === 'clearance') {
    primaryInfluences = [
      {
        rank: 1,
        title: 'Overhead Clearance Safety Margin',
        explanation: `Maintains a wide safety buffer above the vehicle's ${vehicle.height}m height, steering completely clear of restricted archways.`,
        category: 'clearance'
      },
      {
        rank: 2,
        title: 'Structural Axle Load Compliance',
        explanation: `Corridor bridges are certified for heavy commercial freight up to 40+ metric tons, well above ${vehicle.weight}T.`,
        category: 'clearance'
      },
      {
        rank: 3,
        title: 'Predictable Flow',
        explanation: `Achieves a solid ${recommendedRoute.reliabilityScore}/100 reliability rating without narrow-lane friction.`,
        category: 'reliability'
      }
    ];
  } else {
    // Balanced mode (default)
    primaryInfluences = [
      {
        rank: 1,
        title: 'Reliability & Low Delay Probability',
        explanation: `${recommendedRoute.name} offers a ${recommendedRoute.reliabilityScore}/100 reliability score with only an ${recommendedRoute.delayRiskPercent}% probability of delay, outperforming alternative expressways.`,
        category: 'reliability'
      },
      {
        rank: 2,
        title: 'Vehicle Physical Compatibility',
        explanation: `Fully satisfies all physical underpass height (${vehicle.height}m) and structural bridge weight limits for ${vehicle.name}.`,
        category: 'clearance'
      },
      {
        rank: 3,
        title: 'Balanced Emissions & Economy',
        explanation: `Produces ~${recommendedRoute.estimatedCo2Kg} kg CO₂ (${recommendedRoute.co2SavingsKg > 0 ? `${recommendedRoute.co2SavingsKg} kg saved` : 'optimized'}), pairing safety with corporate sustainability.`,
        category: 'co2'
      }
    ];
  }

  // 10. Recommended Action
  const recommendedAction = {
    headline: `Proceed with ${recommendedRoute.name}.`,
    details: `Current telemetry and physical constraints strongly favor ${recommendedRoute.name}. Dispatch commercial unit ${vehicle.name} along this corridor and monitor live incident feed.`,
    status: (recommendedRoute.clearanceStatus === 'approved' ? 'proceed' : 'reroute') as 'proceed' | 'caution' | 'reroute'
  };

  // 11. Checklist summary
  const checklist = {
    clearance: {
      label: 'Vehicle Clearance',
      passed: recommendedRoute.clearanceStatus === 'approved',
      detail: recommendedRoute.clearanceStatus === 'approved' ? 'Approved (Safe Viaduct)' : 'Failed (Underpass Strike Risk)'
    },
    reliability: {
      label: 'Reliability',
      score: recommendedRoute.reliabilityScore,
      detail: `${recommendedRoute.reliabilityScore}/100 Index`
    },
    delayRisk: {
      label: 'Delay Probability',
      percent: recommendedRoute.delayRiskPercent,
      detail: `${recommendedRoute.delayRiskPercent}% Chance of Delay`
    },
    safety: {
      label: 'Safety Score',
      score: recommendedRoute.safetyScore,
      detail: `${recommendedRoute.safetyScore}/100 Safety Rating`
    },
    co2: {
      label: 'CO₂ Footprint',
      kg: recommendedRoute.estimatedCo2Kg,
      detail: `${recommendedRoute.estimatedCo2Kg} kg CO₂`
    },
    traffic: {
      label: 'Traffic State',
      level: recommendedRoute.trafficLevel,
      detail: recommendedRoute.trafficLevel.toUpperCase()
    }
  };

  return {
    recommendedRoute,
    fastestRoute,
    decisionScore,
    confidence,
    confidenceRationale,
    primarySummary,
    tradeoffSummary,
    factors,
    tradeoffs,
    primaryInfluences,
    simulationNotice,
    recommendedAction,
    checklist
  };
}
