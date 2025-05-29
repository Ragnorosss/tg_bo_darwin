import { Schema, model } from 'mongoose';

const userSchema = new Schema({
  telegramId: { type: String, required: true, unique: true },
  username: String,
  firstName: String,
  qountexId: Number,
  joinedAt: { type: Date, default: Date.now },
  gaveAdminAccess: { type: Boolean, default: false },
  traderId: { type: String, required: true, unique: true },
  status: { type: String, required: true },
  registration: { type: Boolean, required: true },
  createdAt: { type: Date, default: Date.now },
  role: {
    type: String,
    enum: ['admin', 'user'],
    default: 'user',
  },
});

export const User = model('User', userSchema);
