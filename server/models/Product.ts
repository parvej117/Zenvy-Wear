import mongoose from 'mongoose';

export interface IProduct {
  _id: string;
  name: string;
  slug: string;
  description: string;
  category: string;
  subcategory?: string;
  gender: 'men' | 'women' | 'unisex';
  brand: string;
  sellerId?: string;
  sellerName?: string;
  sellerSlug?: string;
  price: number;
  discountPrice?: number;
  discountPercentage?: number;
  stock: number;
  images: string[];
  colors: string[];
  sizes: string[];
  rating: number;
  numReviews: number;
  isFeatured: boolean;
  isNewArrival: boolean;
  isFlashSale?: boolean;
  flashSalePrice?: number;
  flashSaleDiscount?: number;
  flashSaleEnds?: string;
  claimedPercentage?: number;
  badge?: string;
  specifications?: Record<string, string>;
  sku: string;
  createdAt: Date;
}

const productSchema = new mongoose.Schema<IProduct>({
  name: { type: String, required: true, trim: true },
  slug: { type: String, required: true, unique: true },
  description: { type: String, required: true },
  category: { type: String, required: true },
  subcategory: { type: String },
  gender: { type: String, enum: ['men', 'women', 'unisex'], default: 'unisex' },
  brand: { type: String, default: 'Zenvy Wear' },
  sellerId: { type: String, default: 'seller-zenvy' },
  sellerName: { type: String, default: 'Zenvy Official Flagship' },
  sellerSlug: { type: String, default: 'zenvy-official' },
  price: { type: Number, required: true, min: 0 },
  discountPrice: { type: Number, min: 0 },
  discountPercentage: { type: Number, min: 0, max: 100, default: 0 },
  stock: { type: Number, required: true, default: 10, min: 0 },
  images: [{ type: String }],
  colors: [{ type: String }],
  sizes: [{ type: String }],
  rating: { type: Number, default: 5, min: 1, max: 5 },
  numReviews: { type: Number, default: 0 },
  isFeatured: { type: Boolean, default: false },
  isNewArrival: { type: Boolean, default: true },
  isFlashSale: { type: Boolean, default: false },
  flashSalePrice: { type: Number },
  flashSaleDiscount: { type: Number },
  flashSaleEnds: { type: String },
  claimedPercentage: { type: Number, default: 0 },
  badge: { type: String },
  specifications: { type: Map, of: String },
  sku: { type: String, unique: true },
  createdAt: { type: Date, default: Date.now }
});

export const ProductModel = mongoose.models.Product || mongoose.model<IProduct>('Product', productSchema);
