import mongoose, { Schema, Document } from 'mongoose';

export interface IRoute extends Document {
  id: string;
  name: string;
  corridorCode: string;
  distanceKm: number;
  baseEtaMin: number;
  minClearanceHeightM: number;
  maxBridgeWeightT: number;
  reliabilityScore: number;
  delayProbability: number;
  co2PerTripKg: number;
  clearanceStatus: 'clear' | 'barred' | 'selected';
  criticalChokepoint: string;
  pathWaypoints: Array<{ x: number; y: number; lat?: number; lon?: number }>;
  createdAt: Date;
}

const RouteSchema = new Schema<IRoute>({
  id: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  corridorCode: { type: String, required: true },
  distanceKm: { type: Number, required: true },
  baseEtaMin: { type: Number, required: true },
  minClearanceHeightM: { type: Number, required: true },
  maxBridgeWeightT: { type: Number, required: true },
  reliabilityScore: { type: Number, required: true },
  delayProbability: { type: Number, required: true },
  co2PerTripKg: { type: Number, required: true },
  clearanceStatus: { type: String, enum: ['clear', 'barred', 'selected'], default: 'clear' },
  criticalChokepoint: { type: String, default: 'None' },
  pathWaypoints: [{ x: Number, y: Number, lat: Number, lon: Number }],
  createdAt: { type: Date, default: Date.now }
});

export const RouteModel = mongoose.model<IRoute>('Route', RouteSchema);
