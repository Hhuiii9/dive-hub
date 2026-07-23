import { NextRequest } from "next/server";
import { sessionsDB, usersDB, User } from "./db";

// Role permission mapping
export const ROLE_PERMISSIONS: Record<string, string[]> = {
  super_admin: [
    "view_leads",
    "manage_leads",
    "manage_lead_settings",
    "send_lead_email",
    "delete_leads",
    "export_leads",
    "manage_users"
  ],
  admin: [
    "view_leads",
    "manage_leads",
    "manage_lead_settings",
    "send_lead_email",
    "export_leads"
  ],
  staff: [
    "view_leads",
    "manage_leads", // only for assigned leads (checked at API level)
    "send_lead_email" // when enabled
  ]
};

// Check if token/session is authenticated and return boolean
export function isAdminAuthenticated(request: NextRequest): boolean {
  try {
    const user = getAuthenticatedUser(request);
    return !!user && (user.role === "super_admin" || user.role === "admin" || user.role === "staff");
  } catch {
    return false;
  }
}

// Get the actual authenticated user object
export function getAuthenticatedUser(request: NextRequest): User | null {
  // Check authorization header
  const authHeader = request.headers.get("Authorization");
  let token = "";
  if (authHeader && authHeader.startsWith("Bearer ")) {
    token = authHeader.substring(7);
  }

  // Check query parameter
  if (!token) {
    const url = new URL(request.url);
    token = url.searchParams.get("token") || "";
  }

  // Check cookie
  if (!token) {
    token = request.cookies.get("admin_token")?.value || "";
  }

  if (!token) {
    return null;
  }

  // Support legacy mock admin token
  if (token === "mock-admin-token") {
    // Return a default super admin for backward compatibility / testing
    const defaultAdmin = usersDB.getByEmail("admin@example.com");
    return defaultAdmin || null;
  }

  const session = sessionsDB.getByToken(token);
  if (!session) {
    return null;
  }

  // Check expiration
  if (new Date(session.expires_at).getTime() < Date.now()) {
    // Expired
    sessionsDB.deleteByToken(token);
    return null;
  }

  const user = usersDB.getById(session.user_id);
  if (!user || !user.is_active) {
    return null;
  }

  return user;
}

// Check if user has specific permission
export function hasPermission(user: User, permission: string): boolean {
  const permissions = ROLE_PERMISSIONS[user.role] || [];
  return permissions.includes(permission);
}
