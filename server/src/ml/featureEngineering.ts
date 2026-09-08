export interface JourneyFeatures {
  baseDurationMin: number;
  distanceKm: number;
  congestionRatio: number;
  weatherRiskScore: number;
  rainMm: number;
  windSpeedKmh: number;
  incidentCount: number;
  hourOfDay: number;
  isWeekend: boolean;
  vehicleWeightT: number;
  roadTypeWeight: number; // expressway (1.0), beltway (0.9), arterial (1.2)
  isClearanceApproved: boolean;
}

export function extractJourneyFeatures(params: {
  baseDurationMin: number;
  distanceKm: number;
  congestionRatio: number;
  weatherRiskScore: number;
  rainMm: number;
  windSpeedKmh: number;
  incidentCount: number;
  vehicleWeightT: number;
  roadType: 'expressway' | 'beltway' | 'arterial';
  isClearanceApproved: boolean;
}): JourneyFeatures {
  const now = new Date();
  const hourOfDay = now.getHours();
  const day = now.getDay();
  const isWeekend = day === 0 || day === 6;

  const roadTypeWeight = params.roadType === 'beltway' ? 0.9 : params.roadType === 'arterial' ? 1.25 : 1.0;

  return {
    baseDurationMin: params.baseDurationMin,
    distanceKm: params.distanceKm,
    congestionRatio: params.congestionRatio,
    weatherRiskScore: params.weatherRiskScore,
    rainMm: params.rainMm,
    windSpeedKmh: params.windSpeedKmh,
    incidentCount: params.incidentCount,
    hourOfDay,
    isWeekend,
    vehicleWeightT: params.vehicleWeightT,
    roadTypeWeight,
    isClearanceApproved: params.isClearanceApproved
  };
}
