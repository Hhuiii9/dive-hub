import mongoose from "mongoose";

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  throw new Error(
    "MONGODB_URI is not configured. Please add it to your .env.local file."
  );
}

/**
 * Global mongoose connection cache to prevent duplicate connections
 * during Next.js hot reload in development.
 */
interface MongooseCache {
  connection: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
}

declare global {
  // eslint-disable-next-line no-var
  var mongooseConnection: MongooseCache | undefined;
}

let cached: MongooseCache = global.mongooseConnection ?? {
  connection: null,
  promise: null,
};

if (!global.mongooseConnection) {
  global.mongooseConnection = cached;
}

/**
 * Connect to MongoDB using a cached singleton connection.
 * Safe to call multiple times — returns the existing connection if available.
 */
export async function connectDatabase(): Promise<typeof mongoose> {
  if (cached.connection) {
    return cached.connection;
  }

  if (!cached.promise) {
    const opts: mongoose.ConnectOptions = {
      bufferCommands: false,
    };

    cached.promise = mongoose
      .connect(MONGODB_URI as string, opts)
      .then((mongooseInstance) => {
        console.log("[MongoDB] Connected successfully.");
        return mongooseInstance;
      })
      .catch((err) => {
        // Clear the promise on failure so next call retries
        cached.promise = null;
        console.error("[MongoDB] Connection failed:", err.message);
        throw err;
      });
  }

  cached.connection = await cached.promise;
  return cached.connection;
}
