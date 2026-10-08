import mongoose, { type Mongoose } from "mongoose";

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  throw new Error("Please define MONGODB_URI");
}

type MongooseCache = {
  conn: Mongoose | null;
  promise: Promise<Mongoose> | null;
};

const globalWithMongoose = globalThis as typeof globalThis & {
  mongoose?: MongooseCache;
};

const cached: MongooseCache =
  globalWithMongoose.mongoose || (globalWithMongoose.mongoose = { conn: null, promise: null });

export async function connectDB(): Promise<Mongoose> {
  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    // MONGODB_URI is checked above to be defined, assert to satisfy TypeScript
    cached.promise = mongoose.connect(MONGODB_URI as string);
  }

  cached.conn = await cached.promise;

  return cached.conn;
}
