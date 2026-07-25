import mongoose from "mongoose";

const MONGODB_URI = process.env.MONGODB_URI;

/**
 * Safely verify required runtime environment variables without logging values.
 */
export function checkRequiredEnvVars(): { valid: boolean; missing: string[] } {
  const required = [
    "MONGODB_URI",
    "SUPER_ADMIN_EMAIL",
    "EMAIL_HOST",
    "EMAIL_PORT",
    "EMAIL_HOST_USER",
    "EMAIL_HOST_PASSWORD",
    "DEFAULT_FROM_EMAIL",
    "ADMIN_NOTIFICATION_EMAIL",
    "ADMIN_FRONTEND_URL",
  ];

  const missing = required.filter((varName) => !process.env[varName]);
  if (missing.length > 0) {
    console.warn(`[Env Check] Missing environment variables: ${missing.join(", ")}`);
  }
  return { valid: missing.length === 0, missing };
}

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

export async function connectDatabase(): Promise<typeof mongoose> {
  if (cached.connection) {
    return cached.connection;
  }

  if (!MONGODB_URI) {
    throw new Error("MONGODB_URI is not configured in environment variables.");
  }

  if (!cached.promise) {
    const opts: mongoose.ConnectOptions = {
      bufferCommands: false,
    };

    cached.promise = mongoose
      .connect(MONGODB_URI, opts)
      .then(async (mongooseInstance) => {
        console.log("[MongoDB] Connected successfully.");
        return mongooseInstance;
      })
      .catch((err) => {
        cached.promise = null;
        console.error("[MongoDB] Connection failed:", err.message);
        throw err;
      });
  }

  cached.connection = await cached.promise;
  return cached.connection;
}
