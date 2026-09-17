import mongoose from 'mongoose';

export interface ISeller {
  _id: string;
  userId?: string;
  storeName: string;
  slug: string;
  logo: string;
  banner: string;
  description: string;
  category: string;
  phone: string;
  email: string;
  address: string;
  status: 'pending' | 'approved' | 'suspended';
  rating: number;
  numReviews: number;
  joinedDate: Date;
  isOfficialStore: boolean;
  tradeLicense?: string;
  shippingFee: number;
  returnRate?: string;
  responseRate?: string;
  totalSales?: number;
}

const sellerSchema = new mongoose.Schema<ISeller>({
  userId: { type: String },
  storeName: { type: String, required: true, trim: true },
  slug: { type: String, required: true, unique: true },
  logo: { type: String, required: true },
  banner: { type: String, required: true },
  description: { type: String, default: '' },
  category: { type: String, default: 'Multi-Category' },
  phone: { type: String, required: true },
  email: { type: String, required: true },
  address: { type: String, required: true },
  status: { type: String, enum: ['pending', 'approved', 'suspended'], default: 'approved' },
  rating: { type: Number, default: 4.8, min: 1, max: 5 },
  numReviews: { type: Number, default: 0 },
  joinedDate: { type: Date, default: Date.now },
  isOfficialStore: { type: Boolean, default: false },
  tradeLicense: { type: String, default: '' },
  shippingFee: { type: Number, default: 80 },
  returnRate: { type: String, default: '99%' },
  responseRate: { type: String, default: '98%' },
  totalSales: { type: Number, default: 0 }
});

export const SellerModel = mongoose.models.Seller || mongoose.model<ISeller>('Seller', sellerSchema);
