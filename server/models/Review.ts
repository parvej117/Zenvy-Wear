import mongoose from 'mongoose';

export interface IReview {
  _id: string;
  userId: string;
  userName: string;
  userEmail?: string;
  productId: string;
  rating: number;
  comment: string;
  isVerifiedPurchase: boolean;
  createdAt: Date;
}

const reviewSchema = new mongoose.Schema<IReview>({
  userId: { type: String, required: true },
  userName: { type: String, required: true },
  userEmail: { type: String },
  productId: { type: String, required: true },
  rating: { type: Number, required: true, min: 1, max: 5 },
  comment: { type: String, required: true, trim: true },
  isVerifiedPurchase: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now }
});

export const ReviewModel = mongoose.models.Review || mongoose.model<IReview>('Review', reviewSchema);
