import mongoose, { Schema, Document } from 'mongoose';

export interface IVehicle extends Document {
  id: string;
  name: string;
  type: string;
  height: number;
  width: number;
  length: number;
  weight: number;
  fuelType: string;
  emissionRate: number;
  isCustom?: boolean;
  createdAt: Date;
}

const VehicleSchema = new Schema<IVehicle>({
  id: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  type: { type: String, required: true },
  height: { type: Number, required: true },
  width: { type: Number, required: true },
  length: { type: Number, required: true },
  weight: { type: Number, required: true },
  fuelType: { type: String, default: 'diesel' },
  emissionRate: { type: Number, default: 0.54 },
  isCustom: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now }
});

export const VehicleModel = mongoose.model<IVehicle>('Vehicle', VehicleSchema);
