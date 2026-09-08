export interface VehicleConstraints {
  height: number; // meters
  width: number;  // meters
  length: number; // meters
  weight: number; // metric tons
  type: string;
}

export interface ClearanceCheckItem {
  passed: boolean;
  infrastructureId: string;
  infrastructureName: string;
  infrastructureType: 'underpass' | 'bridge' | 'tunnel' | 'narrow_road';
  limitValue: number;
  vehicleValue: number;
  unit: string;
  margin: number;
  failureReason?: string;
}

export interface RouteClearanceResult {
  status: 'approved' | 'failed';
  checks: ClearanceCheckItem[];
  criticalIssue?: string;
  clearanceMarginM: number;
  verifiedAt: string;
}

export function validateVehicleClearance(
  vehicle: VehicleConstraints,
  corridorType: 'expressway' | 'beltway' | 'arterial' = 'expressway'
): RouteClearanceResult {
  const checks: ClearanceCheckItem[] = [];

  // Regional physical infrastructure limits:
  // Expressway standard underpasses typically feature 3.8m to 4.2m overhead clearances.
  // Circumferential beltways and viaducts are built to modern commercial freight codes: 4.8m - 5.2m overhead.
  const overheadLimit = corridorType === 'beltway' ? 5.2 : corridorType === 'arterial' ? 4.5 : 3.8;
  const bridgeWeightLimitT = corridorType === 'beltway' ? 50 : 40;

  // 1. Overhead Height Clearance Check
  const heightMargin = +(overheadLimit - vehicle.height).toFixed(2);
  const heightPassed = heightMargin >= 0;

  checks.push({
    passed: heightPassed,
    infrastructureId: `${corridorType}-underpass-clearance`,
    infrastructureName: `${corridorType.toUpperCase()} Railway & Arch Underpass`,
    infrastructureType: 'underpass',
    limitValue: overheadLimit,
    vehicleValue: vehicle.height,
    unit: 'm',
    margin: heightMargin,
    failureReason: heightPassed
      ? undefined
      : `Vehicle height (${vehicle.height}m) exceeds underpass clearance (${overheadLimit}m) by ${Math.abs(heightMargin)}m. Risk of bridge strike.`
  });

  // 2. Structural Weight Capacity Check
  const weightMargin = +(bridgeWeightLimitT - vehicle.weight).toFixed(1);
  const weightPassed = weightMargin >= 0;

  checks.push({
    passed: weightPassed,
    infrastructureId: `${corridorType}-bridge-tonnage`,
    infrastructureName: `${corridorType.toUpperCase()} River Crossing & Flyover Tonnage`,
    infrastructureType: 'bridge',
    limitValue: bridgeWeightLimitT,
    vehicleValue: vehicle.weight,
    unit: 'T',
    margin: weightMargin,
    failureReason: weightPassed
      ? undefined
      : `Vehicle weight (${vehicle.weight}T) exceeds structural bridge rating (${bridgeWeightLimitT}T).`
  });

  const allPassed = checks.every(c => c.passed);
  const criticalIssue = checks.find(c => !c.passed)?.failureReason;

  return {
    status: allPassed ? 'approved' : 'failed',
    checks,
    criticalIssue,
    clearanceMarginM: heightMargin,
    verifiedAt: new Date().toISOString()
  };
}
