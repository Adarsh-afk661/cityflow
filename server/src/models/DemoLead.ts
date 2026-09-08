import mongoose, { Schema, Document } from 'mongoose';

export interface IDemoLead extends Document {
  name: string;
  email: string;
  company: string;
  fleetSize: string;
  status: string;
  createdAt: Date;
}

const DemoLeadSchema = new Schema<IDemoLead>({
  name: { type: String, required: true },
  email: { type: String, required: true },
  company: { type: String, required: true },
  fleetSize: { type: String, default: '10-50' },
  status: { type: String, default: 'new' },
  createdAt: { type: Date, default: Date.now }
});

export const DemoLeadModel = mongoose.model<IDemoLead>('DemoLead', DemoLeadSchema);
