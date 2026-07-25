import crypto from "crypto";
import UserModel from "./models/User";
import { connectDatabase } from "./mongodb";

export function hashPassword(password: string): string {
  const salt = process.env.PASSWORD_SALT || "divehub_salt_123_abc";
  return crypto.pbkdf2Sync(password, salt, 1000, 64, "sha512").toString("hex");
}

export function verifyPassword(password: string, hash: string): boolean {
  const calculated = hashPassword(password);
  return crypto.timingSafeEqual(Buffer.from(calculated), Buffer.from(hash));
}

/**
 * Idempotently seed the initial Super Admin account if no Super Admin user exists.
 */
export async function seedSuperAdmin(): Promise<void> {
  await connectDatabase();
  const existingCount = await UserModel.countDocuments({ role: "super_admin" });

  if (existingCount > 0) {
    return;
  }

  const name = process.env.SUPER_ADMIN_NAME || "Super Admin";
  const email = (process.env.SUPER_ADMIN_EMAIL || "divehub@divehubmarineservices.com").toLowerCase().trim();
  const rawPassword = process.env.SUPER_ADMIN_PASSWORD || "Admin@123";

  if (!email || !rawPassword) {
    console.warn("[Seed] Missing SUPER_ADMIN_EMAIL or SUPER_ADMIN_PASSWORD env vars.");
    return;
  }

  const passwordHash = hashPassword(rawPassword);

  await UserModel.create({
    name,
    email,
    passwordHash,
    role: "super_admin",
    isActive: true,
  });

  console.log("[Seed] Super Admin account created successfully.");
}
