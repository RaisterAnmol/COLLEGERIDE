import mongoose, { Document, Schema } from 'mongoose';

export interface ILocation {
  text: string;
  lat: number;
  lng: number;
}

export interface IRecurringSchedule {
  daysOfWeek: number[]; // 0 = Sunday, 1 = Monday, etc.
  time: string; // e.g. "08:30"
}

export interface IRide extends Document {
  _id: mongoose.Types.ObjectId;
  creator: mongoose.Types.ObjectId;
  origin: ILocation;
  destination: ILocation;
  departureTime: Date;
  availableSeats: number;
  pricePerSeat?: number;
  vehicleId?: mongoose.Types.ObjectId;
  status: 'active' | 'cancelled' | 'completed';
  routePolyline?: string;
  routeDistanceMeters?: number;
  routeDurationSeconds?: number;
  routeSummary?: string;
  recurring?: boolean;
  recurringSchedule?: IRecurringSchedule;
  createdAt: Date;
  updatedAt: Date;
}

const LocationSchema = new Schema<ILocation>(
  {
    text: { type: String, required: true, trim: true },
    lat: { type: Number, required: true },
    lng: { type: Number, required: true },
  },
  { _id: false }
);

const RecurringScheduleSchema = new Schema<IRecurringSchedule>(
  {
    daysOfWeek: [{ type: Number, min: 0, max: 6 }],
    time: { type: String, trim: true },
  },
  { _id: false }
);

const RideSchema = new Schema<IRide>(
  {
    creator: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    origin: { type: LocationSchema, required: true },
    destination: { type: LocationSchema, required: true },
    departureTime: { type: Date, required: true, index: true },
    availableSeats: { type: Number, required: true, min: 0, max: 8 },
    pricePerSeat: {
      type: Number,
      default: 25,
      min: [10, "Minimum fare must be at least ₹10"],
    },
    vehicleId: { type: Schema.Types.ObjectId, ref: 'Vehicle' },
    status: {
      type: String,
      enum: ['active', 'cancelled', 'completed'],
      default: 'active',
      index: true,
    },
    routePolyline: { type: String },
    routeDistanceMeters: { type: Number },
    routeDurationSeconds: { type: Number },
    routeSummary: { type: String },
    recurring: { type: Boolean, default: false },
    recurringSchedule: { type: RecurringScheduleSchema },
  },
  { timestamps: true }
);

// Compound indexes for scalable corridor searching
RideSchema.index({ status: 1, departureTime: 1 });
RideSchema.index({ "origin.lat": 1, "origin.lng": 1, status: 1 });
RideSchema.index({ "destination.lat": 1, "destination.lng": 1, status: 1 });

export const Ride = mongoose.model<IRide>('Ride', RideSchema);

