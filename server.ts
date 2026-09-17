import express from 'express';
import cors from 'cors';
import path from 'path';
import fs from 'fs';
import dotenv from 'dotenv';
import { connectDB } from './server/config/db.ts';

// Routes
import authRoutes from './server/routes/authRoutes.ts';
import productRoutes from './server/routes/productRoutes.ts';
import categoryRoutes from './server/routes/categoryRoutes.ts';
import cartRoutes from './server/routes/cartRoutes.ts';
import wishlistRoutes from './server/routes/wishlistRoutes.ts';
import orderRoutes from './server/routes/orderRoutes.ts';
import reviewRoutes from './server/routes/reviewRoutes.ts';
import adminRoutes from './server/routes/adminRoutes.ts';
import sellerRoutes from './server/routes/sellerRoutes.ts';

dotenv.config();

const app = express();
const PORT = 3000;

// Resolve static directory
let clientPath = path.join(process.cwd(), 'client');
if (!fs.existsSync(clientPath) && fs.existsSync(path.join(process.cwd(), 'dist', 'client'))) {
  clientPath = path.join(process.cwd(), 'dist', 'client');
}

// Middlewares
app.use(cors({ origin: true, credentials: true }));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// REST API Routes
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/wishlist', wishlistRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/sellers', sellerRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'online',
    brand: 'Zenvy Wear',
    tagline: 'Wear Your Confidence.',
    timestamp: new Date().toISOString()
  });
});

// Endpoint to upload or replace MD Masum Parvej founder photo
app.post('/api/upload-founder-photo', (req, res) => {
  try {
    const { imageBase64 } = req.body;
    if (!imageBase64) {
      return res.status(400).json({ success: false, message: 'No image payload provided' });
    }
    const cleanBase64 = imageBase64.replace(/^data:image\/\w+;base64,/, '');
    const buffer = Buffer.from(cleanBase64, 'base64');
    const targetDir = path.join(clientPath, 'assets', 'images');
    if (!fs.existsSync(targetDir)) {
      fs.mkdirSync(targetDir, { recursive: true });
    }
    const targetFile = path.join(targetDir, 'masum-parvej.jpg');
    fs.writeFileSync(targetFile, buffer);
    return res.json({
      success: true,
      message: 'Photo saved successfully to client/assets/images/masum-parvej.jpg',
      url: '/assets/images/masum-parvej.jpg?v=' + Date.now()
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message || 'Failed to save photo' });
  }
});

// Dedicated route for founder photo to seamlessly serve both SVG placeholder and real JPG binary
app.get(['/assets/images/masum-parvej.jpg', '/client/assets/images/masum-parvej.jpg'], (req, res) => {
  const filePath = path.join(clientPath, 'assets', 'images', 'masum-parvej.jpg');
  if (fs.existsSync(filePath)) {
    const buffer = fs.readFileSync(filePath);
    const headerSnippet = buffer.toString('utf8', 0, 30);
    if (headerSnippet.includes('<svg') || headerSnippet.includes('<?xml')) {
      res.setHeader('Content-Type', 'image/svg+xml');
    } else if (buffer[0] === 0x89 && buffer[1] === 0x50) {
      res.setHeader('Content-Type', 'image/png');
    } else {
      res.setHeader('Content-Type', 'image/jpeg');
    }
    res.setHeader('Cache-Control', 'no-cache, must-revalidate');
    return res.send(buffer);
  }
  return res.redirect('/assets/images/avatar-placeholder.svg');
});

// Serve static frontend assets
app.use(express.static(clientPath));

// Clean URL friendly routes mapping
const htmlRoutes: Record<string, string> = {
  '/': 'index.html',
  '/shop': 'shop.html',
  '/product': 'product.html',
  '/cart': 'cart.html',
  '/wishlist': 'wishlist.html',
  '/checkout': 'checkout.html',
  '/login': 'login.html',
  '/register': 'register.html',
  '/profile': 'profile.html',
  '/orders': 'orders.html',
  '/about': 'about.html',
  '/contact': 'contact.html',
  '/flash-sale': 'flash-sale.html',
  '/compare': 'compare.html',
  '/sellers': 'sellers.html',
  '/seller-store': 'seller-store.html',
  '/seller-register': 'seller-register.html',
  '/seller-dashboard': 'seller-dashboard.html',
  '/admin': 'admin/dashboard.html',
  '/admin/login': 'admin/login.html',
  '/admin/dashboard': 'admin/dashboard.html',
  '/admin/products': 'admin/products.html',
  '/admin/orders': 'admin/orders.html',
  '/admin/users': 'admin/users.html',
  '/admin/reviews': 'admin/reviews.html'
};

Object.entries(htmlRoutes).forEach(([routePath, filePath]) => {
  app.get(routePath, (req, res) => {
    res.sendFile(path.join(clientPath, filePath));
  });
});

// Fallback for SPA/direct navigation
app.use((req, res, next) => {
  if (req.method === 'GET' && !req.path.startsWith('/api')) {
    const requestedFile = path.join(clientPath, req.path);
    if (req.path.endsWith('.html')) {
      return res.sendFile(requestedFile);
    }
    return res.sendFile(path.join(clientPath, 'index.html'));
  }
  next();
});

// Server Initialization
async function start() {
  await connectDB();
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`✨ Zenvy Wear Server running on port ${PORT}`);
    console.log(`🌐 Local endpoint: http://localhost:${PORT}`);
  });
}

start();
