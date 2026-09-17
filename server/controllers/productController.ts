import { Request, Response } from 'express';
import { dbStore } from '../services/dbStore.ts';

export const getProducts = async (req: Request, res: Response) => {
  try {
    const {
      category,
      subcategory,
      gender,
      sellerId,
      search,
      minPrice,
      maxPrice,
      size,
      color,
      rating,
      newArrival,
      flashSale,
      sort,
      page,
      limit
    } = req.query;

    const filter = {
      category: category ? String(category) : undefined,
      subcategory: subcategory ? String(subcategory) : undefined,
      gender: gender ? String(gender) : undefined,
      sellerId: sellerId ? String(sellerId) : undefined,
      search: search ? String(search) : undefined,
      minPrice: minPrice ? Number(minPrice) : undefined,
      maxPrice: maxPrice ? Number(maxPrice) : undefined,
      size: size ? String(size) : undefined,
      color: color ? String(color) : undefined,
      rating: rating ? Number(rating) : undefined,
      newArrival: newArrival === 'true' || newArrival === '1',
      isFlashSale: flashSale === 'true' || flashSale === '1',
      sort: sort ? String(sort) : 'newest',
      page: page ? Number(page) : 1,
      limit: limit ? Number(limit) : 12
    };

    const data = dbStore.getProducts(filter);

    return res.json({
      success: true,
      data: data.products,
      pagination: {
        total: data.total,
        page: data.page,
        totalPages: data.totalPages,
        limit: filter.limit
      }
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to retrieve products', error: (error as Error).message });
  }
};

export const getFlashSales = async (req: Request, res: Response) => {
  try {
    const flashSales = dbStore.getFlashSales();
    return res.json({ success: true, data: flashSales });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to load flash sales', error: (error as Error).message });
  }
};

export const getCompareProducts = async (req: Request, res: Response) => {
  try {
    const idsQuery = req.query.ids ? String(req.query.ids) : '';
    const ids = idsQuery.split(',').map(s => s.trim()).filter(Boolean);

    if (ids.length === 0) {
      return res.status(400).json({ success: false, message: 'Please provide product IDs to compare.' });
    }

    const prods = dbStore.getCompareProducts(ids);
    return res.json({ success: true, data: prods });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to compare products', error: (error as Error).message });
  }
};

export const getProductById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const product = dbStore.getProductById(id);

    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found.' });
    }

    const reviews = dbStore.getReviewsForProduct(product._id);
    const related = dbStore.products
      .filter(p => p._id !== product._id && (p.category === product.category || p.gender === product.gender))
      .slice(0, 4);

    return res.json({
      success: true,
      product,
      reviews,
      relatedProducts: related
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to load product details', error: (error as Error).message });
  }
};

export const createProduct = async (req: Request, res: Response) => {
  try {
    const {
      name,
      description,
      category,
      gender,
      brand,
      price,
      discountPrice,
      stock,
      images,
      colors,
      sizes,
      isFeatured,
      isNewArrival,
      sku
    } = req.body;

    if (!name || !price || !category) {
      return res.status(400).json({ success: false, message: 'Product name, category, and price are required.' });
    }

    const newProd = dbStore.createProduct({
      name,
      description,
      category,
      gender,
      brand: brand || 'Zenvy Wear',
      price: Number(price),
      discountPrice: discountPrice ? Number(discountPrice) : undefined,
      stock: stock !== undefined ? Number(stock) : 10,
      images: Array.isArray(images) && images.length > 0 ? images : undefined,
      colors: Array.isArray(colors) && colors.length > 0 ? colors : undefined,
      sizes: Array.isArray(sizes) && sizes.length > 0 ? sizes : undefined,
      isFeatured: Boolean(isFeatured),
      isNewArrival: isNewArrival !== undefined ? Boolean(isNewArrival) : true,
      sku
    });

    return res.status(201).json({
      success: true,
      message: 'Product created successfully.',
      product: newProd
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to create product', error: (error as Error).message });
  }
};

export const updateProduct = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const updated = dbStore.updateProduct(id, req.body);

    if (!updated) {
      return res.status(404).json({ success: false, message: 'Product not found.' });
    }

    return res.json({
      success: true,
      message: 'Product updated successfully.',
      product: updated
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to update product', error: (error as Error).message });
  }
};

export const deleteProduct = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const deleted = dbStore.deleteProduct(id);

    if (!deleted) {
      return res.status(404).json({ success: false, message: 'Product not found or already deleted.' });
    }

    return res.json({ success: true, message: 'Product deleted successfully.' });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to delete product', error: (error as Error).message });
  }
};
