import mongoose, { Schema, Document } from 'mongoose';

export interface IAlert extends Document {
  id: string;
  severity: 'critical' | 'warning' | 'info';
  type: string;
  title: string;
  description: string;
  timestamp: string;
  affectedVehicle?: string;
  affectedRoute?: string;
  recommendedAction: string;
  acknowledged: boolean;
}

const AlertSchema = new Schema<IAlert>({
  id: { type: String, required: true, unique: true },
  severity: { type: String, required: true },
  type: { type: String, required: true },
  title: { type: String, required: true },
  description: { type: String, required: true },
  timestamp: { type: String, required: true },
  affectedVehicle: { type: String },
  affectedRoute: { type: String },
  recommendedAction: { type: String, required: true },
  acknowledged: { type: Boolean, default: false }
});

export const AlertModel = mongoose.model<IAlert>('Alert', AlertSchema);
