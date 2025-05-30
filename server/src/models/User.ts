import { Document, Schema, model } from 'mongoose';

export interface IUser extends Document {
  telegramId: string;
  username?: string;
  firstName?: string;
  qountexId?: number;
  joinedAt: Date;
  gaveAdminAccess: boolean;
  traderId: string;
  status: string;
  registration: boolean;
  createdAt: Date;
  role: 'admin' | 'user';
}

const userSchema = new Schema({
  telegramId: { type: String, required: true, unique: true },
  username: String,
  firstName: String,
  qountexId: Number,
  joinedAt: { type: Date, default: Date.now },
  gaveAdminAccess: { type: Boolean, default: false },
  traderId: { type: String, unique: true },
  status: { type: String},
  registration: { type: Boolean,},
  createdAt: { type: Date, default: Date.now },
  role: {
    type: String,
    enum: ['admin', 'user'],
    default: 'user',
  },
});

export const User = model('User', userSchema);
