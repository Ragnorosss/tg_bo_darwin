import mongoose from 'mongoose';

const PendingUserDataSchema = new mongoose.Schema({
  uid: { type: String, required: true, },
  status: String,
  registration: Boolean,
  createdAt: { type: Date, default: Date.now }, // автудаление через час, например
});

export const PendingUserData = mongoose.model('PendingUserData', PendingUserDataSchema);