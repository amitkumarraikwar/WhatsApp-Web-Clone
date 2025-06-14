import mongoose from 'mongoose';

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI || 'mongodb+srv://amitkumarraikwar92:pk8537127@connecthub.9wh3zsb.mongodb.net/?retryWrites=true&w=majority&appName=connectHub');
    console.log(`📄 MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error('❌ Database connection failed:', error.message);
    process.exit(1);
  }
};

export default connectDB;