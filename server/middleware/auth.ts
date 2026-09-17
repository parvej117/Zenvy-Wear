import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { dbStore } from '../services/dbStore.ts';
import { IUser } from '../models/User.ts';

export interface AuthRequest extends Request {
  user?: IUser;
}

const JWT_SECRET = process.env.JWT_SECRET || 'zenvy_wear_jwt_secret_super_secure_key_2025';

export const generateToken = (user: IUser): string => {
  return jwt.sign(
    {
      id: user._id,
      email: user.email,
      role: user.role,
      name: user.name
    },
    JWT_SECRET,
    { expiresIn: '30d' }
  );
};

export const authenticate = (req: AuthRequest, res: Response, next: NextFunction) => {
  let token: string | undefined;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
    token = req.headers.authorization.split(' ')[1];
  } else if (req.query && typeof req.query.token === 'string') {
    token = req.query.token;
  }

  if (!token) {
    return res.status(401).json({ success: false, message: 'Authorization token required. Please sign in.' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { id: string; email: string; role: string; name: string };
    const user = dbStore.findUserById(decoded.id);

    if (!user) {
      return res.status(401).json({ success: false, message: 'User not found. Please log in again.' });
    }

    if (user.isBlocked) {
      return res.status(403).json({ success: false, message: 'Your account has been suspended by administration.' });
    }

    req.user = user;
    next();
  } catch (err) {
    return res.status(401).json({ success: false, message: 'Invalid or expired token. Please sign in again.' });
  }
};

export const optionalAuth = (req: AuthRequest, res: Response, next: NextFunction) => {
  let token: string | undefined;
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
    token = req.headers.authorization.split(' ')[1];
  }
  if (token) {
    try {
      const decoded = jwt.verify(token, JWT_SECRET) as { id: string };
      const user = dbStore.findUserById(decoded.id);
      if (user && !user.isBlocked) {
        req.user = user;
      }
    } catch {
      // ignore optional auth failure
    }
  }
  next();
};

export const adminOnly = (req: AuthRequest, res: Response, next: NextFunction) => {
  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).json({ success: false, message: 'Admin access required.' });
  }
  next();
};
