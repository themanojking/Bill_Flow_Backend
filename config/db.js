
import mongoose from "mongoose";

let cached = globalThis.mongooseCache;

if (!cached) {
  cached = globalThis.mongooseCache = {
    conn: null,
    promise: null,
  };
}

const connectDB = async () => {
  if (cached.conn) {
    return cached.conn;
  }

  if (!process.env.MONGODB_URL) {
    throw new Error("MONGODB_URL is missing in environment variables");
  }

  if (!cached.promise) {
    cached.promise = mongoose.connect(process.env.MONGODB_URL);
  }

  try {
    cached.conn = await cached.promise;
    console.log("MongoDB Connected Successfully!");
    return cached.conn;
  } catch (error) {
    cached.promise = null;
    console.error("MongoDB Connection Failed:", error.message);
    throw error;
  }
};

export default connectDB;
