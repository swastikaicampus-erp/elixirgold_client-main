import mongoose, { Schema, Document } from 'mongoose';

export interface IMetals extends Document {
  metal_name: string;
  metal_price: number;
  createdAt: Date;
  updatedAt: Date;
}

const metalsSchema = new Schema<IMetals>(
  {
    metal_name: {
      type: String,
      required: [true, 'Please provide a metal name'],
      unique:true,
      trim: true,
    },
    metal_price: {
      type: Number,
      required: [true, 'Please provide metal price'],
    },
  },
  {
    timestamps: true,
  }
);

if (mongoose.models.Metals) {
  delete mongoose.models.Metals;
}

const Metals = mongoose.model<IMetals>('Metals', metalsSchema);

export default Metals;
