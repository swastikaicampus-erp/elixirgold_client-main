import mongoose, { Schema, type Document } from 'mongoose';

import { DEFAULT_COMMODITY_MAPPING } from '@/app/services/commodityMapping';

export interface ICommodityMapping extends Document {
  indianGoldId: number;
  indianSilverId: number;
  createdAt: Date;
  updatedAt: Date;
}

const commodityMappingSchema = new Schema<ICommodityMapping>(
  {
    indianGoldId: {
      type: Number,
      required: true,
      default: DEFAULT_COMMODITY_MAPPING.indianGoldId,
    },
    indianSilverId: {
      type: Number,
      required: true,
      default: DEFAULT_COMMODITY_MAPPING.indianSilverId,
    },
  },
  {
    timestamps: true,
  }
);

const CommodityMapping =
  mongoose.models.CommodityMapping || mongoose.model<ICommodityMapping>('CommodityMapping', commodityMappingSchema);

export default CommodityMapping;