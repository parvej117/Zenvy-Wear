import mongoose from 'mongoose';

export interface IOrderItem {
  productId: string;
  name: string;
  price: number;
  image: string;
  size: string;
  color: string;
  quantity: number;
  sellerId?: string;
  sellerName?: string;
}

export interface ISellerPackage {
  sellerId: string;
  sellerName: string;
  items: IOrderItem[];
  subtotal: number;
  shippingFee: number;
  status: 'Pending' | 'Confirmed' | 'Processing' | 'Shipped' | 'Delivered' | 'Cancelled';
}

export interface IShippingAddress {
  fullName: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  area: string;
  postalCode: string;
}

export interface IOrder {
  _id: string;
  orderNumber: string;
  userId: string;
  items: IOrderItem[];
  sellerPackages?: ISellerPackage[];
  shippingAddress: IShippingAddress;
  paymentMethod: 'Cash on Delivery' | 'Card Payment' | 'Mobile Payment';
  paymentStatus: 'Pending' | 'Paid' | 'Failed';
  orderStatus: 'Pending' | 'Confirmed' | 'Processing' | 'Shipped' | 'Delivered' | 'Cancelled';
  subtotal: number;
  discount: number;
  couponCode?: string;
  shippingFee: number;
  total: number;
  trackingHistory: Array<{
    status: string;
    timestamp: Date;
    note: string;
  }>;
  createdAt: Date;
}

const orderSchema = new mongoose.Schema<IOrder>({
  orderNumber: { type: String, required: true, unique: true },
  userId: { type: String, required: true },
  items: [{
    productId: { type: String, required: true },
    name: { type: String, required: true },
    price: { type: Number, required: true },
    image: { type: String, required: true },
    size: { type: String, required: true },
    color: { type: String, required: true },
    quantity: { type: Number, required: true, min: 1 }
  }],
  shippingAddress: {
    fullName: { type: String, required: true },
    email: { type: String, required: true },
    phone: { type: String, required: true },
    address: { type: String, required: true },
    city: { type: String, required: true },
    area: { type: String, required: true },
    postalCode: { type: String, required: true }
  },
  paymentMethod: { type: String, enum: ['Cash on Delivery', 'Card Payment', 'Mobile Payment'], default: 'Cash on Delivery' },
  paymentStatus: { type: String, enum: ['Pending', 'Paid', 'Failed'], default: 'Pending' },
  orderStatus: {
    type: String,
    enum: ['Pending', 'Confirmed', 'Processing', 'Shipped', 'Delivered', 'Cancelled'],
    default: 'Pending'
  },
  subtotal: { type: Number, required: true },
  discount: { type: Number, default: 0 },
  shippingFee: { type: Number, default: 80 },
  total: { type: Number, required: true },
  trackingHistory: [{
    status: { type: String },
    timestamp: { type: Date, default: Date.now },
    note: { type: String }
  }],
  createdAt: { type: Date, default: Date.now }
});

export const OrderModel = mongoose.models.Order || mongoose.model<IOrder>('Order', orderSchema);
