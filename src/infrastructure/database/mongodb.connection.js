import mongoose from 'mongoose';

export async function connectMongoDB() {
  const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/ddd_task';
  
  try {
    mongoose.connection.on('connected', () => {
      console.log('[MongoDB] Successfully connected to database');
    });

    mongoose.connection.on('error', (err) => {
      console.error('[MongoDB] Connection error:', err);
    });

    mongoose.connection.on('disconnected', () => {
      console.log('[MongoDB] Disconnected from database');
    });

    await mongoose.connect(mongoUri);
  } catch (error) {
    console.error('[MongoDB] Initial connection failed:', error);
    throw error;
  }
}
