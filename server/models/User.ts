import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

export interface IUser {
  _id: string;
  name: string;
  email: string;
  phone: string;
  password?: string;
  role: 'user' | 'seller' | 'admin';
  sellerId?: string;
  isBlocked: boolean;
  addresses?: Array<{
    label: string;
    fullName: string;
    phone: string;
    address: string;
    city: string;
    area: string;
    postalCode: string;
    isDefault: boolean;
  }>;
  createdAt: Date;
}

const userSchema = new mongoose.Schema<IUser>({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  phone: { type: String, required: true, trim: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['user', 'seller', 'admin'], default: 'user' },
  sellerId: { type: String },
  isBlocked: { type: Boolean, default: false },
  addresses: [{
    label: { type: String, default: 'Home' },
    fullName: { type: String },
    phone: { type: String },
    address: { type: String },
    city: { type: String },
    area: { type: String },
    postalCode: { type: String },
    isDefault: { type: Boolean, default: false }
  }],
  createdAt: { type: Date, default: Date.now }
});

export const UserModel = mongoose.models.User || mongoose.model<IUser>('User', userSchema);
