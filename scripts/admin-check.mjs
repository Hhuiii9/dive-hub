#!/usr/bin/env node
/**
 * admin-check.mjs
 *
 * Safe admin verification script.
 * Usage: npm run admin:check
 *
 * Prints ONLY:
 *   - Whether an admin user was found
 *   - Email address
 *   - Role
 *   - Active status
 *
 * NEVER prints: password hash, access tokens, MongoDB URI, or secret keys.
 */

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const USERS_FILE = path.join(__dirname, "..", "data", "users.json");

function main() {
  console.log("\n=== Dive Hub Admin Verification ===\n");

  if (!fs.existsSync(USERS_FILE)) {
    console.log("Admin found: No");
    console.log("Reason: users.json not found. Run the dev server once to initialise the database.");
    process.exit(1);
  }

  let users;
  try {
    const raw = fs.readFileSync(USERS_FILE, "utf8");
    users = JSON.parse(raw);
  } catch (err) {
    console.error("Error reading users.json:", err.message);
    process.exit(1);
  }

  if (!Array.isArray(users) || users.length === 0) {
    console.log("Admin found: No");
    console.log("Reason: No users exist in the database.");
    process.exit(1);
  }

  // Find admin users (super_admin or admin roles)
  const adminUsers = users.filter(
    (u) => u.role === "super_admin" || u.role === "admin"
  );

  if (adminUsers.length === 0) {
    console.log("Admin found: No");
    console.log("Reason: No users with admin or super_admin role found.");
    process.exit(1);
  }

  console.log(`Admin found: Yes (${adminUsers.length} admin account(s))\n`);

  adminUsers.forEach((admin, i) => {
    console.log(`--- Account ${i + 1} ---`);
    console.log(`Email:    ${admin.email}`);
    console.log(`Username: ${admin.username}`);
    console.log(`Name:     ${admin.name}`);
    console.log(`Role:     ${admin.role}`);
    console.log(`Active:   ${admin.is_active ? "Yes" : "No"}`);
    console.log("");
  });

  console.log("All admin accounts listed. No passwords or secrets were printed.");
  console.log("===================================\n");
}

main();
