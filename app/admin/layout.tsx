"use client";

import React from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { 
  Users, 
  Settings, 
  LogOut, 
  Menu, 
  X,
  Compass,
  User as UserIcon
} from "lucide-react";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [adminUser, setAdminUser] = React.useState<any>(null);
  const [loading, setLoading] = React.useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);

  const isAuthPage = 
    pathname === "/admin/login" || 
    pathname === "/admin/forgot-password" || 
    pathname.startsWith("/admin/reset-password");

  // Global fetch interceptor for 401 token refresh
  React.useEffect(() => {
    if (typeof window !== "undefined" && !(window as any).__fetchOverridden) {
      (window as any).__fetchOverridden = true;
      const originalFetch = window.fetch;
      window.fetch = async function (input, init) {
        let response = await originalFetch(input, init);
        
        // Intercept 401 errors, but exclude auth-related endpoints to prevent loops
        const urlStr = input.toString();
        if (response.status === 401 && !urlStr.includes("/api/auth/admin/")) {
          try {
            const refreshToken = localStorage.getItem("admin_refresh_token");
            if (refreshToken) {
              const refreshRes = await originalFetch("/api/auth/admin/refresh", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ refresh_token: refreshToken })
              });

              if (refreshRes.ok) {
                const refreshJson = await refreshRes.json();
                if (refreshJson && refreshJson.success) {
                  localStorage.setItem("admin_access_token", refreshJson.data.access_token);
                  localStorage.setItem("admin_refresh_token", refreshJson.data.refresh_token);
                  localStorage.setItem("mock_admin_token", refreshJson.data.access_token);
                  
                  // Setup retrying the original request once
                  let newInit = { ...init };
                  if (newInit.headers) {
                    const headers = new Headers(newInit.headers);
                    headers.set("Authorization", `Bearer ${refreshJson.data.access_token}`);
                    newInit.headers = headers;
                  } else {
                    newInit.headers = {
                      "Authorization": `Bearer ${refreshJson.data.access_token}`
                    };
                  }
                  
                  // Write cookie again just to be safe
                  document.cookie = `admin_token=${refreshJson.data.access_token}; path=/; max-age=3600`;
                  
                  response = await originalFetch(input, newInit);
                }
              } else {
                // Refresh token invalid or expired, force logout
                localStorage.removeItem("admin_access_token");
                localStorage.removeItem("admin_refresh_token");
                localStorage.removeItem("mock_admin_token");
                document.cookie = "admin_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC";
                window.dispatchEvent(new Event("admin-logout-forced"));
                window.location.href = `/admin/login?redirect=${encodeURIComponent(window.location.pathname)}`;
              }
            }
          } catch (err) {
            console.error("Token refresh handler failed:", err);
          }
        }
        return response;
      };
    }
  }, []);

  // Fetch current admin user
  const checkAuth = React.useCallback(async () => {
    try {
      const res = await fetch("/api/auth/admin/me");
      if (res.ok) {
        const json = await res.json();
        setAdminUser(json.data);
        
        // If on login/forgot-pass page, redirect to landing
        if (isAuthPage) {
          router.replace("/admin/leads");
        }
      } else {
        setAdminUser(null);
        if (!isAuthPage) {
          router.replace(`/admin/login?redirect=${encodeURIComponent(pathname)}`);
        }
      }
    } catch (err) {
      setAdminUser(null);
      if (!isAuthPage) {
        router.replace(`/admin/login?redirect=${encodeURIComponent(pathname)}`);
      }
    } finally {
      setLoading(false);
    }
  }, [isAuthPage, pathname, router]);

  React.useEffect(() => {
    checkAuth();

    // Listen for custom authentication events
    const handleLoginSuccess = () => checkAuth();
    const handleLogoutForced = () => {
      setAdminUser(null);
      setLoading(false);
    };

    window.addEventListener("admin-login-success", handleLoginSuccess);
    window.addEventListener("admin-logout-forced", handleLogoutForced);

    return () => {
      window.removeEventListener("admin-login-success", handleLoginSuccess);
      window.removeEventListener("admin-logout-forced", handleLogoutForced);
    };
  }, [checkAuth]);

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/admin/logout", { method: "POST" });
    } catch (err) {
      // ignore
    }

    if (typeof window !== "undefined") {
      localStorage.removeItem("admin_access_token");
      localStorage.removeItem("admin_refresh_token");
      localStorage.removeItem("mock_admin_token");
      document.cookie = "admin_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC";
    }
    
    setAdminUser(null);
    router.replace("/admin/login");
  };

  // While checking authentication, show loader
  if (loading) {
    return (
      <div className="min-h-screen bg-[#03131d] flex items-center justify-center text-white font-sans">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-cyan-400"></div>
      </div>
    );
  }

  // If it's a login, forgot password or reset password page, render it directly
  if (isAuthPage) {
    return <>{children}</>;
  }

  // If unauthenticated on a protected page, don't show the layout briefly
  if (!adminUser) {
    return null;
  }

  const sidebarLinks = [
    { href: "/admin/leads", label: "Manage Leads", icon: Users },
  ];

  // Only display Form Settings to admins/super_admins
  const hasSettingsPermission = adminUser.role === "super_admin" || adminUser.role === "admin";
  if (hasSettingsPermission) {
    sidebarLinks.push({ href: "/admin/settings/lead-form", label: "Form Settings", icon: Settings });
  }

  const formatRole = (role: string) => {
    switch (role) {
      case "super_admin": return "Super Admin";
      case "admin": return "Admin";
      case "staff": return "Staff";
      default: return role;
    }
  };

  return (
    <div className="min-h-screen bg-[#03131d] text-white flex flex-col md:flex-row relative font-sans">
      
      {/* MOBILE HEADER */}
      <header className="md:hidden flex items-center justify-between px-6 py-4 border-b border-white/10 bg-[#03131d] z-50">
        <Link href="/admin/leads" className="flex items-center gap-2 text-white">
          <Compass className="h-6 w-6 text-cyan-400" />
          <span className="text-sm font-black uppercase tracking-widest">DIVEHUB ADMIN</span>
        </Link>
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="text-slate-300 hover:text-white"
        >
          {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </header>

      {/* SIDEBAR */}
      <aside className={`fixed md:sticky top-0 left-0 h-screen w-64 shrink-0 border-r border-white/10 bg-[#041a27] p-6 flex flex-col justify-between z-40 transition-transform duration-300 md:translate-x-0 ${mobileMenuOpen ? "translate-x-0" : "-translate-x-full md:block"}`}>
        <div className="space-y-8">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 flex items-center justify-center rounded-xl bg-cyan-500/10 border border-cyan-400/20 text-cyan-300">
              <Compass className="h-5 w-5" />
            </div>
            <div>
              <span className="text-[8px] font-black uppercase tracking-[0.2em] text-cyan-400 block">
                Dive Hub
              </span>
              <span className="text-xs font-black uppercase tracking-widest text-white block -mt-0.5">
                Admin Console
              </span>
            </div>
          </div>

          <nav className="space-y-2">
            {sidebarLinks.map((link) => {
              const Icon = link.icon;
              const isActive = pathname.startsWith(link.href);
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold uppercase tracking-wider transition-all duration-300 ${isActive ? "bg-cyan-400 text-slate-950 font-black" : "text-slate-300 hover:bg-white/5 hover:text-white"}`}
                >
                  <Icon className="h-4.5 w-4.5" />
                  {link.label}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* User Card & Logout */}
        <div className="space-y-4 pt-6 border-t border-white/5">
          <div className="flex items-center gap-3 px-2">
            <div className="h-8 w-8 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-cyan-400">
              <UserIcon className="h-4 w-4" />
            </div>
            <div className="min-w-0">
              <p className="text-xs font-black text-white truncate">{adminUser.name || adminUser.email}</p>
              <span className="inline-block text-[9px] font-bold px-2 py-0.5 rounded-full bg-cyan-400/10 text-cyan-400 border border-cyan-400/20 mt-0.5">
                {formatRole(adminUser.role)}
              </span>
            </div>
          </div>
          
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold uppercase tracking-wider text-rose-400 hover:bg-rose-500/10 transition-all duration-300 cursor-pointer"
          >
            <LogOut className="h-4.5 w-4.5" />
            Logout
          </button>
        </div>
      </aside>

      {/* OVERLAY FOR MOBILE SIDEBAR */}
      {mobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-30 md:hidden"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* MAIN CONTENT CONTAINER */}
      <main className="flex-1 min-w-0 p-6 md:p-10 lg:p-12 overflow-y-auto">
        <div className="max-w-7xl mx-auto">
          {children}
        </div>
      </main>

    </div>
  );
}
