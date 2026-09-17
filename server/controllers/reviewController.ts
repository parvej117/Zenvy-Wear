import { Response } from 'express';
import { dbStore } from '../services/dbStore.ts';
import { AuthRequest } from '../middleware/auth.ts';

export const getReviewsByProduct = async (req: AuthRequest, res: Response) => {
  try {
    const { productId } = req.params;
    const reviews = dbStore.getReviewsForProduct(productId);

    // Distribution calculation
    const distribution = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    let sum = 0;
    reviews.forEach(r => {
      const star = Math.round(r.rating) as 1 | 2 | 3 | 4 | 5;
      if (distribution[star] !== undefined) {
        distribution[star]++;
      }
      sum += r.rating;
    });

    const averageRating = reviews.length > 0 ? Number((sum / reviews.length).toFixed(1)) : 5.0;

    return res.json({
      success: true,
      count: reviews.length,
      averageRating,
      distribution,
      reviews
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to fetch reviews', error: (error as Error).message });
  }
};

export const createReview = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'Please log in to submit a review.' });
    }

    const { productId, rating, comment } = req.body;

    if (!productId || !rating || !comment) {
      return res.status(400).json({ success: false, message: 'Product, rating, and comment are required.' });
    }

    const product = dbStore.getProductById(productId);
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found.' });
    }

    // Check purchase requirement: does this user have a delivered or confirmed order containing this product?
    const userOrders = dbStore.getOrders(req.user._id);
    const hasPurchased = userOrders.some(order =>
      order.items.some(it => it.productId === productId || it.name === product.name)
    );

    // If user is admin, allow them to post verified sample review, else if normal user, check purchase
    if (!hasPurchased && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Only verified customers who have purchased this product can leave a review.'
      });
    }

    const review = dbStore.addReview({
      userId: req.user._id,
      userName: req.user.name,
      userEmail: req.user.email,
      productId,
      rating: Number(rating),
      comment: comment.trim()
    });

    return res.status(201).json({
      success: true,
      message: 'Thank you! Your verified review has been posted.',
      review
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to create review', error: (error as Error).message });
  }
};

export const deleteReview = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const deleted = dbStore.deleteReview(id);

    if (!deleted) {
      return res.status(404).json({ success: false, message: 'Review not found.' });
    }

    return res.json({ success: true, message: 'Review deleted successfully.' });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to delete review', error: (error as Error).message });
  }
};

export const getAllReviews = async (req: AuthRequest, res: Response) => {
  try {
    return res.json({ success: true, count: dbStore.reviews.length, reviews: dbStore.reviews });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to load reviews', error: (error as Error).message });
  }
};
