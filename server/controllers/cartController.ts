import { Response } from 'express';
import { dbStore } from '../services/dbStore.ts';
import { AuthRequest } from '../middleware/auth.ts';

export const getCart = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user ? req.user._id : (req.headers['x-session-id'] as string) || 'guest';
    const isOutsideDhaka = req.query.outsideDhaka === 'true';
    const cartSummary = dbStore.getCartSummary(userId, isOutsideDhaka);

    return res.json({
      success: true,
      cart: cartSummary.cart,
      sellerGroups: cartSummary.sellerGroups,
      summary: cartSummary.summary
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to get cart', error: (error as Error).message });
  }
};

export const applyCoupon = async (req: AuthRequest, res: Response) => {
  try {
    const { code, subtotal } = req.body;
    if (!code) {
      return res.status(400).json({ success: false, message: 'Coupon code is required.' });
    }

    const result = dbStore.validateCoupon(code, Number(subtotal) || 0);
    if (!result.valid) {
      return res.status(400).json({ success: false, message: result.message });
    }

    return res.json({
      success: true,
      message: result.message,
      coupon: result.coupon,
      discount: result.discount
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to validate coupon', error: (error as Error).message });
  }
};

export const addToCart = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user ? req.user._id : (req.headers['x-session-id'] as string) || 'guest';
    const { productId, size, color, quantity } = req.body;

    if (!productId) {
      return res.status(400).json({ success: false, message: 'Product ID is required.' });
    }

    const product = dbStore.getProductById(productId);
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found.' });
    }

    if (product.stock <= 0) {
      return res.status(400).json({ success: false, message: 'Sorry, this product is currently out of stock.' });
    }

    const selectedSize = size || (product.sizes.length > 0 ? product.sizes[0] : 'Standard');
    const selectedColor = color || (product.colors.length > 0 ? product.colors[0] : 'Default');
    const selectedQty = Math.max(1, Number(quantity) || 1);

    dbStore.addToCart(userId, {
      productId: product._id,
      size: selectedSize,
      color: selectedColor,
      quantity: selectedQty
    });

    const summaryData = dbStore.getCartSummary(userId);

    return res.json({
      success: true,
      message: `${product.name} added to cart.`,
      cart: summaryData.cart,
      sellerGroups: summaryData.sellerGroups,
      summary: summaryData.summary
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to add item to cart', error: (error as Error).message });
  }
};

export const updateCartItem = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user ? req.user._id : (req.headers['x-session-id'] as string) || 'guest';
    const { id } = req.params;
    const { quantity, size, color } = req.body;

    const cart = dbStore.updateCartItem(userId, id, Number(quantity), size, color);
    if (!cart) {
      return res.status(404).json({ success: false, message: 'Cart item not found.' });
    }

    const summaryData = dbStore.getCartSummary(userId);

    return res.json({
      success: true,
      message: 'Cart updated.',
      cart: summaryData.cart,
      sellerGroups: summaryData.sellerGroups,
      summary: summaryData.summary
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to update cart', error: (error as Error).message });
  }
};

export const removeCartItem = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user ? req.user._id : (req.headers['x-session-id'] as string) || 'guest';
    const { id } = req.params;

    dbStore.removeCartItem(userId, id);
    const summaryData = dbStore.getCartSummary(userId);

    return res.json({
      success: true,
      message: 'Item removed from cart.',
      cart: summaryData.cart,
      sellerGroups: summaryData.sellerGroups,
      summary: summaryData.summary
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to remove item', error: (error as Error).message });
  }
};

export const clearCart = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user ? req.user._id : (req.headers['x-session-id'] as string) || 'guest';
    const cart = dbStore.clearCart(userId);
    return res.json({ success: true, message: 'Cart cleared.', cart });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to clear cart', error: (error as Error).message });
  }
};
