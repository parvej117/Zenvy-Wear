import mongoose from 'mongoose';

export interface ICoupon {
  _id?: string;
  code: string;
  discountType: 'percentage' | 'fixed' | 'shipping';
  discountValue: number;
  minOrderAmount: number;
  description: string;
  expiresAt: Date;
  isActive: boolean;
  sellerId?: string;
}

const couponSchema = new mongoose.Schema<ICoupon>({
  code: { type: String, required: true, unique: true, uppercase: true, trim: true },
  discountType: { type: String, enum: ['percentage', 'fixed', 'shipping'], default: 'percentage' },
  discountValue: { type: Number, required: true },
  minOrderAmount: { type: Number, default: 0 },
  description: { type: String, default: '' },
  expiresAt: { type: Date, default: () => new Date(Date.now() + 365 * 24 * 60 * 60 * 1000) },
  isActive: { type: Boolean, default: true },
  sellerId: { type: String }
});

export const CouponModel = mongoose.models.Coupon || mongoose.model<ICoupon>('Coupon', couponSchema);
