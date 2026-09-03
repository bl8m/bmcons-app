import mongoose from 'mongoose';
import { env } from './env.js';

export async function connectDB() {
  mongoose.set('strictQuery', true);

  try {
    await mongoose.connect(env.MONGO_URI);
    console.log('✅ Connesso a MongoDB');
  } catch (error) {
    console.error('❌ Connessione a MongoDB fallita:', error.message);
    process.exit(1);
  }
}
