#!/usr/bin/env node
/**
 * admin-reset-password.mjs
 *
 * Safely reset an admin user's password using environment variables.
 * Usage:
 *   ADMIN_EMAIL=admin@example.com NEW_ADMIN_PASSWORD=NewSecurePass123 npm run admin:reset-password
 *
 * Or set them in a temporary .env.reset file (do NOT commit it):
 *   ADMIN_EMAIL=...
 *   NEW_ADMIN_PASSWORD=...
 *
 * Requirements:
 *   - ADMIN_EMAIL must match an existing user in data/users.json
 *   - NEW_ADMIN_PASSWORD must be at least 8 characters
 *   - Password is hashed using the same pbkdf2Sync algorithm as lib/db.ts
 *   - The existing password hash is NEVER printed
 *
 * NEVER commit ADMIN_EMAIL or NEW_ADMIN_PASSWORD values to source control.
 */

import fs from "fs";
import path from "path";
import crypto from "crypto";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const USERS_FILE = path.join(__dirname, "..", "data", "users.json");

/**
 * Must match the exact hashing algorithm used in lib/db.ts hashPassword()
 */
function hashPassword(password) {
  const salt = "divehub_salt_123_abc";
  return crypto.pbkdf2Sync(password, salt, 1000, 64, "sha512").toString("hex");
}

function main() {
  console.log("\n=== Dive Hub Admin Password Reset ===\n");

  const adminEmail = process.env.ADMIN_EMAIL;
  const newPassword = process.env.NEW_ADMIN_PASSWORD;

  if (!adminEmail) {
    console.error("ERROR: ADMIN_EMAIL environment variable is required.");
    console.error("Usage: ADMIN_EMAIL=you@example.com NEW_ADMIN_PASSWORD=YourNewPass123 npm run admin:reset-password");
    process.exit(1);
  }

  if (!newPassword) {
    console.error("ERROR: NEW_ADMIN_PASSWORD environment variable is required.");
    console.error("Usage: ADMIN_EMAIL=you@example.com NEW_ADMIN_PASSWORD=YourNewPass123 npm run admin:reset-password");
    process.exit(1);
  }

  if (newPassword.length < 8) {
    console.error("ERROR: NEW_ADMIN_PASSWORD must be at least 8 characters.");
    process.exit(1);
  }

  if (!fs.existsSync(USERS_FILE)) {
    console.error("ERROR: users.json not found. Run the dev server once to initialise the database.");
    process.exit(1);
  }

  let users;
  try {
    const raw = fs.readFileSync(USERS_FILE, "utf8");
    users = JSON.parse(raw);
  } catch (err) {
    console.error("ERROR: Failed to read users.json:", err.message);
    process.exit(1);
  }

  if (!Array.isArray(users)) {
    console.error("ERROR: users.json is malformed.");
    process.exit(1);
  }

  const userIndex = users.findIndex(
    (u) =>
      u.email?.toLowerCase() === adminEmail.toLowerCase() ||
      u.username?.toLowerCase() === adminEmail.toLowerCase()
  );

  if (userIndex === -1) {
    console.error(`ERROR: No user found with email or username: ${adminEmail}`);
    console.error("Run 'npm run admin:check' to see existing admin accounts.");
    process.exit(1);
  }

  const user = users[userIndex];

  // Confirm the user has an admin role
  if (user.role !== "super_admin" && user.role !== "admin" && user.role !== "staff") {
    console.error(`WARNING: User ${adminEmail} has role '${user.role}'. Proceeding anyway.`);
  }

  // Hash the new password using the same algorithm as lib/db.ts
  const newHash = hashPassword(newPassword);

  // Update the user record
  users[userIndex] = {
    ...user,
    password_hash: newHash,
  };

  try {
    fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2), "utf8");
  } catch (err) {
    console.error("ERROR: Failed to write users.json:", err.message);
    process.exit(1);
  }

  console.log(`Password reset successful.`);
  console.log(`Email:    ${user.email}`);
  console.log(`Username: ${user.username}`);
  console.log(`Role:     ${user.role}`);
  console.log(`Active:   ${user.is_active ? "Yes" : "No"}`);
  console.log("");
  console.log("The new password has been hashed and saved. The plain-text password was not stored.");
  console.log("You can now log in with the new password.");
  console.log("=====================================\n");
}

main();
