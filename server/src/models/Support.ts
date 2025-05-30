import { Schema, model } from 'mongoose';

const supportLinkScema = new Schema({
  telegramId: { type: String },
  link: { type: String },
});

export const SupportLink = model('SupportLink', supportLinkScema);
