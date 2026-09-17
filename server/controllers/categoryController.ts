import { Request, Response } from 'express';
import { dbStore } from '../services/dbStore.ts';

export const getCategories = async (req: Request, res: Response) => {
  try {
    return res.json({ success: true, data: dbStore.categories });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to retrieve categories', error: (error as Error).message });
  }
};

export const createCategory = async (req: Request, res: Response) => {
  try {
    const { name, description, image, icon, subcategories = [] } = req.body;
    if (!name || !image) {
      return res.status(400).json({ success: false, message: 'Category name and image URL are required.' });
    }

    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    const newCat = {
      _id: 'cat-' + Date.now(),
      name: name.trim(),
      slug,
      description: description || '',
      image,
      icon: icon || 'fas fa-th-large',
      subcategories: Array.isArray(subcategories) ? subcategories : [],
      productCount: 0,
      itemCount: 0
    };

    dbStore.categories.push(newCat);
    return res.status(201).json({ success: true, message: 'Category created successfully.', category: newCat });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to create category', error: (error as Error).message });
  }
};

export const updateCategory = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { name, description, image } = req.body;

    const cat = dbStore.categories.find(c => c._id === id || c.slug === id);
    if (!cat) {
      return res.status(404).json({ success: false, message: 'Category not found.' });
    }

    if (name) {
      cat.name = name.trim();
      cat.slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    }
    if (description !== undefined) cat.description = description;
    if (image) cat.image = image;

    return res.json({ success: true, message: 'Category updated.', category: cat });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to update category', error: (error as Error).message });
  }
};

export const deleteCategory = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const initialLen = dbStore.categories.length;
    dbStore.categories = dbStore.categories.filter(c => c._id !== id && c.slug !== id);

    if (dbStore.categories.length === initialLen) {
      return res.status(404).json({ success: false, message: 'Category not found.' });
    }

    return res.json({ success: true, message: 'Category deleted successfully.' });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to delete category', error: (error as Error).message });
  }
};
