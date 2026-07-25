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

function cleanEnv(val?: string): string {
  if (!val) return "";
  return val.replace(/^["']|["']$/g, "").trim();
}

/**
 * Idempotently seed or update the initial Super Admin account in MongoDB.
 */
export async function seedSuperAdmin(): Promise<void> {
  await connectDatabase();

  const name = cleanEnv(process.env.SUPER_ADMIN_NAME) || "Super Admin";
  const email = (cleanEnv(process.env.SUPER_ADMIN_EMAIL) || "divehub@divehubmarineservices.com").toLowerCase();
  const rawPassword = cleanEnv(process.env.SUPER_ADMIN_PASSWORD) || "Admin@123";

  const passwordHash = hashPassword(rawPassword);

  let user = await UserModel.findOne({ email });
  if (!user) {
    user = await UserModel.findOne({ role: "super_admin" });
  }

  if (user) {
    let updated = false;
    if (user.email !== email) {
      user.email = email;
      updated = true;
    }
    if (!user.isActive) {
      user.isActive = true;
      updated = true;
    }
    if (user.passwordHash !== passwordHash) {
      user.passwordHash = passwordHash;
      updated = true;
    }
    if (updated) {
      await user.save();
      console.log("[Seed] Super Admin account synced with current environment variables.");
    }
  } else {
    await UserModel.create({
      name,
      email,
      passwordHash,
      role: "super_admin",
      isActive: true,
    });
    console.log("[Seed] Super Admin account created successfully.");
  }
}
