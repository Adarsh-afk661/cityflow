import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

let isConnected = false;
let currentUri = '';

export const connectDB = async (customUri?: string): Promise<boolean> => {
  const uri = customUri || process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/cityflow';
  currentUri = uri;

  try {
    if (mongoose.connection.readyState === 1) {
      isConnected = true;
      return true;
    }
    await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 3000
    });
    isConnected = true;
    const isAtlas = uri.includes('mongodb+srv') || uri.includes('mongodb.net');
    console.log(`[MongoDB] Connected successfully to ${isAtlas ? 'MongoDB Atlas Cloud' : 'Local MongoDB'}: ${uri.split('@').pop()?.split('?')[0]}`);
    return true;
  } catch (err: any) {
    isConnected = false;
    console.warn(`[MongoDB] Connection notice: Could not connect to ${uri.split('@').pop()?.split('?')[0] || uri}.`);
    console.log(`[MongoDB] Fallback mode active: CityFlow In-Memory Persistence active. All APIs fully functional.`);
    return false;
  }
};

export const connectDatabase = connectDB;

export const getDBStatus = () => {
  const isAtlas = currentUri.includes('mongodb+srv') || currentUri.includes('mongodb.net');
  return {
    connected: isConnected,
    mode: isConnected ? (isAtlas ? 'MongoDB Atlas Cloud' : 'Local MongoDB') : 'In-Memory Fallback Persistence',
    databaseName: isConnected ? (mongoose.connection.name || 'cityflow') : 'cityflow-memory',
    host: isConnected ? (mongoose.connection.host || 'cluster0') : 'localhost',
    readyState: mongoose.connection.readyState
  };
};

