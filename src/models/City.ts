import mongoose, { Schema, Document } from 'mongoose';

export interface ICity extends Document {
  cityName: string;
  gold_price: number;
  silver_price: number;
  createdAt: Date;
  updatedAt: Date;
}

const citySchema = new Schema<ICity>(
  {
    cityName: {
      type: String,
      required: [true, 'Please provide a city name'],
      unique: true,
      trim: true,
    },
    gold_price: {
      type: Number,
      required: [true, 'Please provide gold price'],
    },
    silver_price: {
      type: Number,
      required: [true, 'Please provide silver price'],
    },
  },
  {
    timestamps: true,
  }
);

// Clear old model cache to prevent stale schema issues
if (mongoose.models.City) {
  delete mongoose.models.City;
}

const City = mongoose.model<ICity>('City', citySchema);

export default City;