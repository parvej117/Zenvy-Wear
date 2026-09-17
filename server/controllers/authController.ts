import { Response } from 'express';
import bcrypt from 'bcryptjs';
import { dbStore } from '../services/dbStore.ts';
import { AuthRequest, generateToken } from '../middleware/auth.ts';

export const register = async (req: AuthRequest, res: Response) => {
  try {
    const { name, email, phone, password, confirmPassword } = req.body;

    if (!name || !email || !phone || !password) {
      return res.status(400).json({ success: false, message: 'All fields are required.' });
    }

    if (confirmPassword && password !== confirmPassword) {
      return res.status(400).json({ success: false, message: 'Passwords do not match.' });
    }

    if (password.length < 6) {
      return res.status(400).json({ success: false, message: 'Password must be at least 6 characters.' });
    }

    const existingUser = dbStore.findUserByEmail(email);
    if (existingUser) {
      return res.status(400).json({ success: false, message: 'An account with this email already exists.' });
    }

    const salt = bcrypt.genSaltSync(10);
    const hashedPassword = bcrypt.hashSync(password, salt);

    const newUser = dbStore.createUser({
      name: name.trim(),
      email: email.trim().toLowerCase(),
      phone: phone.trim(),
      password: hashedPassword,
      role: 'user',
      addresses: []
    });

    const token = generateToken(newUser);

    const safeUser = {
      _id: newUser._id,
      name: newUser.name,
      email: newUser.email,
      phone: newUser.phone,
      role: newUser.role,
      addresses: newUser.addresses
    };

    return res.status(201).json({
      success: true,
      message: 'Account created successfully! Welcome to Zenvy Wear.',
      token,
      user: safeUser
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Server error during registration', error: (error as Error).message });
  }
};

export const login = async (req: AuthRequest, res: Response) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Email and password are required.' });
    }

    const user = dbStore.findUserByEmail(email);
    if (!user || !user.password) {
      return res.status(401).json({ success: false, message: 'Invalid email or password.' });
    }

    if (user.isBlocked) {
      return res.status(403).json({ success: false, message: 'Account is suspended. Please contact support.' });
    }

    const isMatch = bcrypt.compareSync(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid email or password.' });
    }

    const token = generateToken(user);

    const safeUser = {
      _id: user._id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      role: user.role,
      addresses: user.addresses
    };

    return res.json({
      success: true,
      message: 'Logged in successfully.',
      token,
      user: safeUser
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Server error during login', error: (error as Error).message });
  }
};

export const getProfile = async (req: AuthRequest, res: Response) => {
  if (!req.user) {
    return res.status(401).json({ success: false, message: 'Not authenticated' });
  }

  const safeUser = {
    _id: req.user._id,
    name: req.user.name,
    email: req.user.email,
    phone: req.user.phone,
    role: req.user.role,
    addresses: req.user.addresses || [],
    createdAt: req.user.createdAt
  };

  return res.json({ success: true, user: safeUser });
};

export const updateProfile = async (req: AuthRequest, res: Response) => {
  if (!req.user) {
    return res.status(401).json({ success: false, message: 'Not authenticated' });
  }

  const { name, phone, addresses } = req.body;
  const updates: Record<string, unknown> = {};
  if (name) updates.name = name.trim();
  if (phone) updates.phone = phone.trim();
  if (addresses) updates.addresses = addresses;

  const updated = dbStore.updateUser(req.user._id, updates);
  if (!updated) {
    return res.status(404).json({ success: false, message: 'User not found' });
  }

  return res.json({
    success: true,
    message: 'Profile updated successfully.',
    user: {
      _id: updated._id,
      name: updated.name,
      email: updated.email,
      phone: updated.phone,
      role: updated.role,
      addresses: updated.addresses
    }
  });
};

export const changePassword = async (req: AuthRequest, res: Response) => {
  if (!req.user) {
    return res.status(401).json({ success: false, message: 'Not authenticated' });
  }

  const { currentPassword, newPassword, confirmPassword } = req.body;

  if (!currentPassword || !newPassword) {
    return res.status(400).json({ success: false, message: 'Current password and new password are required.' });
  }

  if (newPassword !== confirmPassword) {
    return res.status(400).json({ success: false, message: 'New passwords do not match.' });
  }

  if (newPassword.length < 6) {
    return res.status(400).json({ success: false, message: 'Password must be at least 6 characters.' });
  }

  const user = dbStore.findUserById(req.user._id);
  if (!user || !user.password) {
    return res.status(404).json({ success: false, message: 'User not found' });
  }

  const isMatch = bcrypt.compareSync(currentPassword, user.password);
  if (!isMatch) {
    return res.status(400).json({ success: false, message: 'Current password is incorrect.' });
  }

  const salt = bcrypt.genSaltSync(10);
  const hashedPassword = bcrypt.hashSync(newPassword, salt);
  dbStore.updateUser(user._id, { password: hashedPassword });

  return res.json({ success: true, message: 'Password changed successfully.' });
};
