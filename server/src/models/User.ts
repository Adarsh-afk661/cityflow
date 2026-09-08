import mongoose, { Schema, Document } from 'mongoose';

export interface IUser extends Document {
  email: string;
  name: string;
  role: 'admin' | 'dispatcher' | 'fleet_manager';
  isVerified: boolean;
  lastLoginAt: Date;
  createdAt: Date;
}

const UserSchema = new Schema<IUser>({
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  name: { type: String, default: 'Fleet Dispatcher' },
  role: { type: String, enum: ['admin', 'dispatcher', 'fleet_manager'], default: 'dispatcher' },
  isVerified: { type: Boolean, default: false },
  lastLoginAt: { type: Date, default: Date.now },
  createdAt: { type: Date, default: Date.now }
});

export const UserModel = mongoose.model<IUser>('User', UserSchema);
