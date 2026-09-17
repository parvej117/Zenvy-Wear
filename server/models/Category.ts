import mongoose from 'mongoose';

export interface ICategory {
  _id: string;
  name: string;
  slug: string;
  description: string;
  image: string;
  icon?: string;
  subcategories: string[];
  itemCount: number;
}

const categorySchema = new mongoose.Schema<ICategory>({
  name: { type: String, required: true, unique: true, trim: true },
  slug: { type: String, required: true, unique: true },
  description: { type: String, default: '' },
  image: { type: String, required: true },
  icon: { type: String, default: 'fa-tags' },
  subcategories: [{ type: String }],
  itemCount: { type: Number, default: 0 }
});

export const CategoryModel = mongoose.models.Category || mongoose.model<ICategory>('Category', categorySchema);
