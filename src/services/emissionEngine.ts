import { TrafficState, Vehicle } from '../types';

export interface EmissionInputs {
  distanceKm: number;
  vehicle: Vehicle;
  trafficLevel: TrafficState;
  speedVariationFactor?: number;
}

export interface EmissionResult {
  estimatedCo2Kg: number;
  fuelImpactLiters: number;
  stopAndGoPenaltyPercent: number;
}

export function calculateEmissions(inputs: EmissionInputs): EmissionResult {
  const { distanceKm, vehicle, trafficLevel } = inputs;

  // Base emission factor in kg CO2/km
  let baseRate = vehicle.emissionRate;

  // Weight penalty (heavier payloads consume more energy per km)
  const weightPenaltyFactor = 1 + (vehicle.weight / 40);

  // Traffic stop-and-go penalty
  let stopAndGoPenaltyPercent = 0;
  let trafficMultiplier = 1.0;

  switch (trafficLevel) {
    case 'smooth':
      trafficMultiplier = 1.0;
      stopAndGoPenaltyPercent = 0;
      break;
    case 'moderate':
      trafficMultiplier = 1.18;
      stopAndGoPenaltyPercent = 18;
      break;
    case 'heavy':
      trafficMultiplier = 1.48;
      stopAndGoPenaltyPercent = 48;
      break;
    case 'severe':
      trafficMultiplier = 1.85;
      stopAndGoPenaltyPercent = 85;
      break;
  }

  // Electric vehicle mitigation (regenerative braking in moderate traffic, zero tailpipe)
  if (vehicle.fuelType === 'electric') {
    trafficMultiplier = trafficMultiplier * 0.75;
  }

  const rawCo2 = distanceKm * baseRate * weightPenaltyFactor * trafficMultiplier;
  const estimatedCo2Kg = +(rawCo2.toFixed(1));

  // Fuel consumption estimate (liters of diesel equivalent: ~2.68 kg CO2 per liter)
  const fuelImpactLiters = +(rawCo2 / 2.68).toFixed(1);

  return {
    estimatedCo2Kg,
    fuelImpactLiters,
    stopAndGoPenaltyPercent
  };
}
