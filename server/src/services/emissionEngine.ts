export interface EmissionResult {
  estimatedCo2Kg: number;
  fuelImpactLiters: number;
  co2SavingsKg: number;
  baselineCo2Kg: number;
  methodology: string;
}

/**
 * Standard EPA / DEFRA Commercial Transport GHG Methodology:
 * CO2 (kg) = Distance (km) * Fuel Rate (L/km) * (1 + Congestion Penalty) * Diesel Emission Factor (2.68 kg CO2/L)
 */
export function calculateCommercialEmissions(
  distanceKm: number,
  vehicleWeightT: number,
  fuelType: string = 'diesel',
  congestionRatio: number = 1.0,
  isOptimizedRoute: boolean = false
): EmissionResult {
  // Base fuel consumption rate based on Gross Vehicle Weight (GVW)
  // Van (~3T): 0.11 L/km
  // Rigid Truck (12-16T): 0.28 - 0.32 L/km
  // Semi-Trailer (28-40T): 0.38 - 0.44 L/km
  let baseFuelLitersPerKm = 0.28;
  if (vehicleWeightT <= 3.5) baseFuelLitersPerKm = 0.11;
  else if (vehicleWeightT <= 16) baseFuelLitersPerKm = 0.29;
  else if (vehicleWeightT <= 28) baseFuelLitersPerKm = 0.36;
  else baseFuelLitersPerKm = 0.42;

  // Congestion idling penalty: stop-and-go driving increases consumption by 15% to 40%
  const idlingPenalty = Math.max(0, (congestionRatio - 1.0) * 0.45);
  const effectiveFuelRate = baseFuelLitersPerKm * (1 + idlingPenalty);

  // Diesel emissions factor: 2.68 kg CO2 / Liter (DEFRA standard)
  // Electric vehicles: 0.08 kg CO2 / kWh equivalent
  const emissionFactor = fuelType === 'electric' ? 0.45 : 2.68;

  const totalFuelLiters = +(distanceKm * effectiveFuelRate).toFixed(1);
  const estimatedCo2Kg = +(totalFuelLiters * emissionFactor).toFixed(1);

  // Baseline comparison (unoptimized direct route in heavy congestion)
  const baselineFuelLiters = +(distanceKm * baseFuelLitersPerKm * 1.35).toFixed(1);
  const baselineCo2Kg = +(baselineFuelLiters * emissionFactor).toFixed(1);
  const co2SavingsKg = Math.max(0, +(baselineCo2Kg - estimatedCo2Kg).toFixed(1));

  return {
    estimatedCo2Kg,
    fuelImpactLiters: totalFuelLiters,
    co2SavingsKg,
    baselineCo2Kg,
    methodology: 'DEFRA/EPA Commercial Freight Emissions Factor (2.68 kg CO₂ / L Diesel, GVW-Adjusted)'
  };
}
