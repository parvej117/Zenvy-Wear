import mongoose from 'mongoose';

let isMongoConnected = false;

export const connectDB = async () => {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    console.log('ℹ️  No MONGODB_URI configured in environment.');
    console.log('⚡ Using Zenvy Wear high-performance in-memory persistence engine with realistic seed data.');
    return false;
  }

  try {
    console.log('⏳ Connecting to MongoDB...');
    await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 5000,
    });
    isMongoConnected = true;
    console.log('✅ MongoDB connected successfully to database:', mongoose.connection.name);
    return true;
  } catch (error) {
    console.warn('⚠️  Could not connect to remote MongoDB cluster:', (error as Error).message);
    console.log('⚡ Seamlessly active: Zenvy Wear high-performance in-memory persistence engine.');
    return false;
  }
};

export const getIsMongoConnected = () => isMongoConnected;
