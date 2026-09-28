import mongoose, { Document, Schema } from 'mongoose';

export interface IReview extends Document {
  _id: mongoose.Types.ObjectId;
  tripId: mongoose.Types.ObjectId;
  fromUserId: mongoose.Types.ObjectId;
  toUserId: mongoose.Types.ObjectId;
  rating: number; // 1 to 5
  comment: string;
  role?: 'driver' | 'passenger'; // Role of the user being reviewed
  tags?: string[]; // e.g. "Punctual Arrival", "Safe Driving", etc.
  createdAt: Date;
  updatedAt: Date;
}

const ReviewSchema = new Schema<IReview>(
  {
    tripId: {
      type: Schema.Types.ObjectId,
      ref: 'Trip',
      required: true,
      index: true,
    },
    fromUserId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    toUserId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },
    comment: {
      type: String,
      trim: true,
      default: '',
    },
    role: {
      type: String,
      enum: ['driver', 'passenger'],
      default: 'driver',
    },
    tags: {
      type: [String],
      default: [],
    },
  },
  { timestamps: true }
);

// Prevent multiple reviews for the same user on the same trip
ReviewSchema.index({ tripId: 1, fromUserId: 1, toUserId: 1 }, { unique: true });

export const Review = mongoose.model<IReview>('Review', ReviewSchema);
