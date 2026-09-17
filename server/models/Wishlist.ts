import mongoose from 'mongoose';

export interface IWishlist {
  _id: string;
  userId: string;
  productIds: string[];
  updatedAt: Date;
}

const wishlistSchema = new mongoose.Schema<IWishlist>({
  userId: { type: String, required: true, unique: true },
  productIds: [{ type: String }],
  updatedAt: { type: Date, default: Date.now }
});

export const WishlistModel = mongoose.models.Wishlist || mongoose.model<IWishlist>('Wishlist', wishlistSchema);
