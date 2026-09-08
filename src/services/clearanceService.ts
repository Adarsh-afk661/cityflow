import { Vehicle, Infrastructure, ClearanceCheckResult } from '../types';
import { CITY_INFRASTRUCTURE } from '../data/cityNetwork';

export interface ClearanceEvaluation {
  status: 'approved' | 'failed';
  checks: ClearanceCheckResult[];
  blockingReasons: string[];
}

export function evaluateRouteClearance(
  vehicle: Vehicle,
  infrastructureIds: string[]
): ClearanceEvaluation {
  const checks: ClearanceCheckResult[] = [];
  const blockingReasons: string[] = [];

  const relevantInfra = CITY_INFRASTRUCTURE.filter(i => infrastructureIds.includes(i.id));

  for (const infra of relevantInfra) {
    let passed = true;
    let failureReason = '';
    let dimensionDiff: ClearanceCheckResult['dimensionDiff'] = undefined;

    // Height check (Critical for underpasses, tunnels)
    if (vehicle.height > infra.maxHeight) {
      passed = false;
      const excess = +(vehicle.height - infra.maxHeight).toFixed(2);
      failureReason = `Vehicle height (${vehicle.height}m) exceeds ${infra.name} clearance limit (${infra.maxHeight}m) by ${excess}m.`;
      dimensionDiff = {
        dimension: 'height',
        vehicleValue: vehicle.height,
        limitValue: infra.maxHeight,
        excess
      };
      blockingReasons.push(failureReason);
    }
    // Width check (Narrow lanes, toll arches)
    else if (vehicle.width > infra.maxWidth) {
      passed = false;
      const excess = +(vehicle.width - infra.maxWidth).toFixed(2);
      failureReason = `Vehicle width (${vehicle.width}m) exceeds ${infra.name} width limit (${infra.maxWidth}m) by ${excess}m.`;
      dimensionDiff = {
        dimension: 'width',
        vehicleValue: vehicle.width,
        limitValue: infra.maxWidth,
        excess
      };
      blockingReasons.push(failureReason);
    }
    // Weight check (Bridges, viaducts)
    else if (vehicle.weight > infra.maxWeight) {
      passed = false;
      const excess = +(vehicle.weight - infra.maxWeight).toFixed(2);
      failureReason = `Vehicle weight (${vehicle.weight}T) exceeds ${infra.name} maximum load capacity (${infra.maxWeight}T) by ${excess}T.`;
      dimensionDiff = {
        dimension: 'weight',
        vehicleValue: vehicle.weight,
        limitValue: infra.maxWeight,
        excess
      };
      blockingReasons.push(failureReason);
    }
    // Length check (Sharp curvature underpasses)
    else if (vehicle.length > infra.maxLength) {
      passed = false;
      const excess = +(vehicle.length - infra.maxLength).toFixed(2);
      failureReason = `Vehicle length (${vehicle.length}m) exceeds ${infra.name} turning geometry limit (${infra.maxLength}m) by ${excess}m.`;
      dimensionDiff = {
        dimension: 'length',
        vehicleValue: vehicle.length,
        limitValue: infra.maxLength,
        excess
      };
      blockingReasons.push(failureReason);
    }

    checks.push({
      passed,
      infrastructureId: infra.id,
      infrastructureName: infra.name,
      infrastructureType: infra.type,
      failureReason: failureReason || undefined,
      dimensionDiff
    });
  }

  const allPassed = checks.every(c => c.passed);

  return {
    status: allPassed ? 'approved' : 'failed',
    checks,
    blockingReasons
  };
}
