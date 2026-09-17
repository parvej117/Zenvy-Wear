import mongoose from 'mongoose';

export interface ICartItem {
  id: string;
  productId: string;
  name: string;
  sellerId?: string;
  sellerName?: string;
  price: number;
  discountPrice?: number;
  image: string;
  size: string;
  color: string;
  quantity: number;
  stock: number;
}

export interface ICart {
  _id: string;
  userId: string;
  items: ICartItem[];
  updatedAt: Date;
}

const cartItemSchema = new mongoose.Schema<ICartItem>({
  id: { type: String, required: true },
  productId: { type: String, required: true },
  name: { type: String, required: true },
  sellerId: { type: String, default: 'seller-zenvy' },
  sellerName: { type: String, default: 'Zenvy Official Flagship' },
  price: { type: Number, required: true },
  discountPrice: { type: Number },
  image: { type: String, required: true },
  size: { type: String, required: true },
  color: { type: String, required: true },
  quantity: { type: Number, required: true, min: 1 },
  stock: { type: Number, default: 10 }
});

const cartSchema = new mongoose.Schema<ICart>({
  userId: { type: String, required: true, unique: true },
  items: [cartItemSchema],
  updatedAt: { type: Date, default: Date.now }
});

export const CartModel = mongoose.models.Cart || mongoose.model<ICart>('Cart', cartSchema);
