import mongoose, { Schema, Document } from 'mongoose';

export interface ITrip extends Document {
  tripId: string;
  originName: string;
  destinationName: string;
  originCoords: { lat: number; lon: number };
  destinationCoords: { lat: number; lon: number };
  vehicle: {
    id: string;
    name: string;
    height: number;
    weight: number;
  };
  routingMode: string;
  recommendedRouteName: string;
  distanceKm: number;
  etaMin: number;
  reliabilityScore: number;
  delayProbability: number;
  co2Kg: number;
  weatherCondition: string;
  temperatureC: number;
  isRealData: boolean;
  createdAt: Date;
}

const TripSchema = new Schema<ITrip>({
  tripId: { type: String, required: true, unique: true },
  originName: { type: String, required: true },
  destinationName: { type: String, required: true },
  originCoords: {
    lat: { type: Number, required: true },
    lon: { type: Number, required: true }
  },
  destinationCoords: {
    lat: { type: Number, required: true },
    lon: { type: Number, required: true }
  },
  vehicle: {
    id: String,
    name: String,
    height: Number,
    weight: Number
  },
  routingMode: { type: String, default: 'balanced' },
  recommendedRouteName: { type: String, required: true },
  distanceKm: { type: Number, required: true },
  etaMin: { type: Number, required: true },
  reliabilityScore: { type: Number, required: true },
  delayProbability: { type: Number, required: true },
  co2Kg: { type: Number, required: true },
  weatherCondition: { type: String, default: 'Clear' },
  temperatureC: { type: Number, default: 25 },
  isRealData: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now }
});

export const TripModel = mongoose.model<ITrip>('Trip', TripSchema);
