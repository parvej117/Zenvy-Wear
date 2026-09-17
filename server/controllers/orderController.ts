import { Response } from 'express';
import { dbStore } from '../services/dbStore.ts';
import { AuthRequest } from '../middleware/auth.ts';

export const createOrder = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user ? req.user._id : (req.headers['x-session-id'] as string) || 'guest';
    const {
      items,
      shippingAddress,
      paymentMethod,
      discount = 0,
      couponCode,
      deliveryZone = 'Dhaka'
    } = req.body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ success: false, message: 'Cart items are required to place an order.' });
    }

    if (!shippingAddress || !shippingAddress.fullName || !shippingAddress.phone || !shippingAddress.address) {
      return res.status(400).json({ success: false, message: 'Shipping address (Full Name, Phone, Address) is required.' });
    }

    // Enrich items with sellerId and sellerName if missing
    const enrichedItems = items.map((it: any) => {
      if (!it.sellerId && it.productId) {
        const prod = dbStore.getProductById(it.productId);
        if (prod) {
          return {
            ...it,
            sellerId: prod.sellerId || 'seller-zenvy-flagship',
            sellerName: prod.sellerName || 'Zenvy Official Flagship'
          };
        }
      }
      return {
        ...it,
        sellerId: it.sellerId || 'seller-zenvy-flagship',
        sellerName: it.sellerName || 'Zenvy Official Flagship'
      };
    });

    // Calculate subtotal
    const subtotal = enrichedItems.reduce((sum: number, it: { price: number; quantity: number }) => sum + it.price * it.quantity, 0);
    const shippingFee = deliveryZone.toLowerCase() === 'dhaka' ? 80 : 130;
    const finalDiscount = Number(discount) || 0;
    const total = Math.max(0, subtotal - finalDiscount + shippingFee);

    const validPaymentMethods = ['Cash on Delivery', 'Card Payment', 'Mobile Payment'] as const;
    const method = validPaymentMethods.includes(paymentMethod) ? paymentMethod : 'Cash on Delivery';

    const order = dbStore.createOrder({
      userId,
      items: enrichedItems,
      shippingAddress,
      paymentMethod: method,
      paymentStatus: method === 'Cash on Delivery' ? 'Pending' : 'Paid', // Simulated payment confirmation for card/mobile
      subtotal,
      discount: finalDiscount,
      couponCode: couponCode || undefined,
      shippingFee,
      total
    });

    // Clear cart
    if (userId) {
      dbStore.clearCart(userId);
    }

    return res.status(201).json({
      success: true,
      message: 'Your multi-package order has been placed successfully!',
      order
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to place order', error: (error as Error).message });
  }
};

export const getOrders = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'Please sign in to view your orders.' });
    }

    // If admin, can view all or filtered by user
    if (req.user.role === 'admin') {
      const orders = dbStore.getOrders();
      return res.json({ success: true, count: orders.length, orders });
    }

    const userOrders = dbStore.getOrders(req.user._id);
    return res.json({ success: true, count: userOrders.length, orders: userOrders });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to retrieve orders', error: (error as Error).message });
  }
};

export const getOrderById = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const order = dbStore.getOrderById(id);

    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found.' });
    }

    // Check ownership if user is logged in and not admin
    if (req.user && req.user.role !== 'admin' && order.userId !== req.user._id) {
      return res.status(403).json({ success: false, message: 'Unauthorized to view this order.' });
    }

    return res.json({ success: true, order });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to fetch order', error: (error as Error).message });
  }
};

export const updateOrderStatus = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { status, note } = req.body;

    const validStatuses = ['Pending', 'Confirmed', 'Processing', 'Shipped', 'Delivered', 'Cancelled'] as const;
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid order status value.' });
    }

    const updated = dbStore.updateOrderStatus(id, status, note);
    if (!updated) {
      return res.status(404).json({ success: false, message: 'Order not found.' });
    }

    return res.json({ success: true, message: `Order status updated to ${status}`, order: updated });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to update order status', error: (error as Error).message });
  }
};

export const updatePaymentStatus = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const valid = ['Pending', 'Paid', 'Failed'] as const;
    if (!valid.includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid payment status value.' });
    }

    const updated = dbStore.updatePaymentStatus(id, status);
    if (!updated) {
      return res.status(404).json({ success: false, message: 'Order not found.' });
    }

    return res.json({ success: true, message: `Payment status updated to ${status}`, order: updated });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to update payment status', error: (error as Error).message });
  }
};
