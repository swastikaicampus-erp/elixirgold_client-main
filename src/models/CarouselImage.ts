import mongoose, { Schema, Document } from 'mongoose';

export interface ICarouselImage extends Document {
  imageData: string; // Base64 encoded image
  createdAt: Date;
  updatedAt: Date;
}

const carouselImageSchema = new Schema<ICarouselImage>(
  {
    imageData: {
      type: String,
      required: [true, 'Please provide image data'],
    },
  },
  {
    timestamps: true,
  }
);

// Clear old model cache to prevent stale schema issues
if (mongoose.models.CarouselImage) {
  delete mongoose.models.CarouselImage;
}

const CarouselImage = mongoose.model<ICarouselImage>('CarouselImage', carouselImageSchema);

export default CarouselImage;
