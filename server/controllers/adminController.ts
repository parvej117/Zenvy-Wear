import { Response } from 'express';
import { dbStore } from '../services/dbStore.ts';
import { AuthRequest } from '../middleware/auth.ts';

export const getDashboardStats = async (req: AuthRequest, res: Response) => {
  try {
    const stats = dbStore.getAdminStats();
    return res.json({ success: true, stats });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to retrieve admin stats', error: (error as Error).message });
  }
};

export const getAllUsers = async (req: AuthRequest, res: Response) => {
  try {
    const safeUsers = dbStore.users.map(u => {
      const orderCount = dbStore.getOrders(u._id).length;
      return {
        _id: u._id,
        name: u.name,
        email: u.email,
        phone: u.phone,
        role: u.role,
        isBlocked: u.isBlocked,
        orderCount,
        createdAt: u.createdAt
      };
    });
    return res.json({ success: true, count: safeUsers.length, users: safeUsers });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to retrieve users', error: (error as Error).message });
  }
};

export const toggleUserBlock = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const user = dbStore.findUserById(id);

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    if (user.role === 'admin') {
      return res.status(400).json({ success: false, message: 'Cannot block an administrator account.' });
    }

    user.isBlocked = !user.isBlocked;

    return res.json({
      success: true,
      message: `User ${user.isBlocked ? 'blocked' : 'unblocked'} successfully.`,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        isBlocked: user.isBlocked
      }
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to toggle user status', error: (error as Error).message });
  }
};
