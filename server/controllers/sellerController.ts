import { Request, Response } from 'express';
import { dbStore } from '../services/dbStore.ts';
import { AuthRequest } from '../middleware/auth.ts';

export const getSellers = async (req: Request, res: Response) => {
  try {
    const status = req.query.status as 'approved' | 'pending' | 'suspended' | undefined;
    const sellers = dbStore.getSellers(status);
    return res.json({ success: true, count: sellers.length, sellers });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to retrieve sellers', error: (error as Error).message });
  }
};

export const getSellerProfile = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const seller = dbStore.getSellerById(id) || dbStore.getSellerBySlug(id);

    if (!seller) {
      return res.status(404).json({ success: false, message: 'Seller store not found.' });
    }

    const products = dbStore.getSellerProducts(seller._id);

    return res.json({
      success: true,
      seller,
      productCount: products.length,
      products
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to fetch seller details', error: (error as Error).message });
  }
};

export const registerSeller = async (req: AuthRequest, res: Response) => {
  try {
    const {
      storeName,
      category,
      phone,
      email,
      address,
      description,
      tradeLicense,
      logo,
      banner
    } = req.body;

    if (!storeName || !phone) {
      return res.status(400).json({ success: false, message: 'Store name and contact phone are required.' });
    }

    const userId = req.user ? req.user._id : undefined;

    // Check if store name already exists
    const existing = dbStore.sellers.find(
      s => s.storeName.toLowerCase().trim() === storeName.toLowerCase().trim()
    );
    if (existing) {
      return res.status(400).json({ success: false, message: 'A store with this name is already registered.' });
    }

    const newSeller = dbStore.createSeller({
      userId,
      storeName,
      category: category || 'Multi-Category',
      phone,
      email: email || (req.user ? req.user.email : ''),
      address: address || 'Dhaka, Bangladesh',
      description: description || 'Verified merchant on Zenvy Marketplace.',
      tradeLicense: tradeLicense || '',
      logo: logo || 'https://images.unsplash.com/photo-1544441893-675973e31985?q=80&w=200&auto=format&fit=crop',
      banner: banner || 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?q=80&w=1200&auto=format&fit=crop',
      status: 'approved' // Automatically approve for instant testing & demonstration
    });

    return res.status(201).json({
      success: true,
      message: 'Seller registration submitted and approved successfully!',
      seller: newSeller
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to register seller', error: (error as Error).message });
  }
};

export const getSellerDashboard = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'Authentication required.' });
    }

    // Identify seller ID from user or query
    let sellerId = req.user.sellerId;

    // If user is an admin or demoing, allow selecting sellerId via query
    if (req.query.sellerId && (req.user.role === 'admin' || !sellerId)) {
      sellerId = String(req.query.sellerId);
    }

    if (!sellerId) {
      // Default to the first seller for demo
      sellerId = dbStore.sellers[0]?._id;
    }

    const stats = dbStore.getSellerStats(sellerId);
    if (!stats.seller) {
      return res.status(404).json({ success: false, message: 'Seller profile not found.' });
    }

    return res.json({
      success: true,
      stats
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to load seller dashboard', error: (error as Error).message });
  }
};

export const addSellerProduct = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'Authentication required.' });
    }

    const sellerId = req.body.sellerId || req.user.sellerId || dbStore.sellers[0]._id;
    const seller = dbStore.getSellerById(sellerId);

    if (!seller) {
      return res.status(404).json({ success: false, message: 'Seller not found.' });
    }

    const {
      name,
      description,
      category,
      subcategory,
      price,
      discountPrice,
      stock,
      images,
      colors,
      sizes,
      specifications,
      isFlashSale,
      flashSalePrice
    } = req.body;

    if (!name || !price || !category) {
      return res.status(400).json({ success: false, message: 'Name, price, and category are required.' });
    }

    const product = dbStore.createProduct({
      name,
      description,
      category,
      subcategory,
      brand: seller.storeName,
      sellerId: seller._id,
      sellerName: seller.storeName,
      sellerSlug: seller.slug,
      price: Number(price),
      discountPrice: discountPrice ? Number(discountPrice) : undefined,
      stock: stock !== undefined ? Number(stock) : 10,
      images: Array.isArray(images) && images.length > 0 ? images : [
        'https://images.unsplash.com/photo-1523275335684-37898b6baf30?q=80&w=800&auto=format&fit=crop'
      ],
      colors: Array.isArray(colors) && colors.length > 0 ? colors : ['Standard'],
      sizes: Array.isArray(sizes) && sizes.length > 0 ? sizes : ['Standard'],
      specifications: specifications || {},
      isFlashSale: Boolean(isFlashSale),
      flashSalePrice: flashSalePrice ? Number(flashSalePrice) : undefined
    });

    return res.status(201).json({
      success: true,
      message: 'Product added successfully to your store.',
      product
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to create product', error: (error as Error).message });
  }
};

export const updateSellerPackageStatus = async (req: AuthRequest, res: Response) => {
  try {
    const { orderId } = req.params;
    const { sellerId, status } = req.body;

    if (!orderId || !sellerId || !status) {
      return res.status(400).json({ success: false, message: 'Order ID, seller ID, and package status are required.' });
    }

    const ok = dbStore.updateSellerPackageStatus(orderId, sellerId, status);
    if (!ok) {
      return res.status(404).json({ success: false, message: 'Order or seller package not found.' });
    }

    return res.json({
      success: true,
      message: `Package status updated to ${status}.`
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to update package status', error: (error as Error).message });
  }
};

export const updateSellerStatusByAdmin = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!['approved', 'pending', 'suspended'].includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid status value.' });
    }

    const updated = dbStore.updateSellerStatus(id, status);
    if (!updated) {
      return res.status(404).json({ success: false, message: 'Seller not found.' });
    }

    return res.json({
      success: true,
      message: `Seller status updated to ${status}.`,
      seller: updated
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to update seller status', error: (error as Error).message });
  }
};
