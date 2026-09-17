import { Response } from 'express';
import { dbStore } from '../services/dbStore.ts';
import { AuthRequest } from '../middleware/auth.ts';

export const getWishlist = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user ? req.user._id : (req.headers['x-session-id'] as string) || 'guest';
    const data = dbStore.getWishlist(userId);

    return res.json({
      success: true,
      productIds: data.productIds,
      products: data.products,
      count: data.productIds.length
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to fetch wishlist', error: (error as Error).message });
  }
};

export const toggleWishlist = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user ? req.user._id : (req.headers['x-session-id'] as string) || 'guest';
    const { productId } = req.body;

    if (!productId) {
      return res.status(400).json({ success: false, message: 'Product ID is required.' });
    }

    const result = dbStore.toggleWishlist(userId, productId);
    return res.json({
      success: true,
      inWishlist: result.inWishlist,
      count: result.count,
      message: result.inWishlist ? 'Added to wishlist' : 'Removed from wishlist'
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to toggle wishlist item', error: (error as Error).message });
  }
};

export const removeFromWishlist = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user ? req.user._id : (req.headers['x-session-id'] as string) || 'guest';
    const { id } = req.params;

    const wl = dbStore.wishlists.get(userId);
    if (wl) {
      wl.productIds = wl.productIds.filter(pid => pid !== id);
      wl.updatedAt = new Date();
    }

    const data = dbStore.getWishlist(userId);
    return res.json({
      success: true,
      message: 'Item removed from wishlist',
      count: data.productIds.length,
      products: data.products
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to remove from wishlist', error: (error as Error).message });
  }
};
