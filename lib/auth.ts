import { NextRequest } from "next/server";
import { connectDatabase } from "./mongodb";
import UserModel, { IUser } from "./models/User";
import SessionModel from "./models/Session";

export const ROLE_PERMISSIONS: Record<string, string[]> = {
  super_admin: [
    "view_leads",
    "manage_leads",
    "manage_lead_settings",
    "send_lead_email",
    "delete_leads",
    "export_leads",
    "manage_users",
  ],
};

export async function getAuthenticatedUser(request: NextRequest): Promise<IUser | null> {
  try {
    let token = "";

    const authHeader = request.headers.get("Authorization");
    if (authHeader && authHeader.startsWith("Bearer ")) {
      token = authHeader.substring(7);
    }

    if (!token) {
      const url = new URL(request.url);
      token = url.searchParams.get("token") || "";
    }

    if (!token) {
      token = request.cookies.get("admin_token")?.value || "";
    }

    if (!token) {
      return null;
    }

    await connectDatabase();

    const session = await SessionModel.findOne({ token });
    if (!session) {
      return null;
    }

    if (new Date(session.expiresAt).getTime() < Date.now()) {
      await SessionModel.deleteOne({ token });
      return null;
    }

    const user = await UserModel.findById(session.userId);
    if (!user || !user.isActive || user.role !== "super_admin") {
      return null;
    }

    return user;
  } catch (error) {
    console.error("[Auth] Authentication check error:", error);
    return null;
  }
}

export async function isAdminAuthenticated(request: NextRequest): Promise<boolean> {
  const user = await getAuthenticatedUser(request);
  return !!user && user.role === "super_admin";
}

export function hasPermission(user: IUser, permission: string): boolean {
  if (user.role !== "super_admin") return false;
  const permissions = ROLE_PERMISSIONS["super_admin"] || [];
  return permissions.includes(permission);
}
