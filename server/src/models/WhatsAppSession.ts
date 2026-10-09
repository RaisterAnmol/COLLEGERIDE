import mongoose, { Document, Schema } from 'mongoose';

export interface IWhatsAppSession extends Document {
  filename: string;
  data: string;
  updatedAt: Date;
}

const WhatsAppSessionSchema = new Schema<IWhatsAppSession>(
  {
    filename: { type: String, required: true, unique: true, index: true },
    data: { type: String, required: true },
  },
  {
    timestamps: true,
  }
);

export const WhatsAppSession =
  mongoose.models.WhatsAppSession ||
  mongoose.model<IWhatsAppSession>('WhatsAppSession', WhatsAppSessionSchema);
