"use client";

import React, { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Compass, Eye, EyeOff, Loader2 } from "lucide-react";
import Link from "next/link";

export default function AdminLoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get("redirect") || "/admin/leads";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  // If already logged in, redirect away
  useEffect(() => {
    const checkSession = async () => {
      try {
        const res = await fetch("/api/auth/admin/me");
        if (res.ok) {
          router.replace(redirect);
        }
      } catch (err) {
        // ignore
      }
    };
    checkSession();
  }, [router, redirect]);

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!email) errs.email = "Email or Username is required.";
    if (!password) errs.password = "Password is required.";
    setValidationErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    setError("");
    setValidationErrors({});

    try {
      const res = await fetch("/api/auth/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.message || "Invalid credentials.");
        return;
      }

      // Store tokens
      if (typeof window !== "undefined") {
        localStorage.setItem("admin_access_token", data.data.access_token);
        localStorage.setItem("admin_refresh_token", data.data.refresh_token);
        localStorage.setItem("mock_admin_token", data.data.access_token); // legacy compatibility
        if (rememberMe) {
          localStorage.setItem("admin_remember", "true");
        } else {
          localStorage.removeItem("admin_remember");
        }
      }

      // Trigger login success event to layout
      window.dispatchEvent(new Event("admin-login-success"));

      router.replace(redirect);
    } catch (err: any) {
      setError("Failed to connect to authentication server.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#03131d] flex items-center justify-center px-4 relative overflow-hidden font-sans">
      {/* Background glow effects */}
      <div className="absolute left-[15%] top-1/4 h-[350px] w-[350px] rounded-full bg-cyan-500/10 blur-[90px]" />
      <div className="absolute right-[15%] bottom-1/4 h-[350px] w-[350px] rounded-full bg-blue-500/10 blur-[90px]" />

      <div className="relative z-10 max-w-md w-full rounded-[2rem] border border-white/10 bg-white/[0.02] p-8 sm:p-10 shadow-2xl backdrop-blur-2xl">
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-cyan-500/10 border border-cyan-400/20 text-cyan-300 mx-auto mb-6">
          <Compass className="h-8 w-8 animate-pulse" />
        </div>

        <h1 className="text-2xl font-black uppercase tracking-tight text-white text-center">
          Admin Login
        </h1>
        <p className="mt-2 text-xs text-slate-400 font-light text-center">
          Access the lead management system and settings console.
        </p>

        {error && (
          <div className="mt-5 p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs font-semibold text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="mt-6 space-y-4">
          <div>
            <label className="block text-[10px] font-black uppercase tracking-wider text-slate-400 mb-1">
              Email or Username
            </label>
            <input
              type="text"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={loading}
              placeholder="admin@example.com"
              className="w-full px-4 py-3 rounded-xl border border-white/10 bg-white/5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 transition duration-200"
            />
            {validationErrors.email && (
              <p className="mt-1 text-[10px] text-rose-400 font-semibold">{validationErrors.email}</p>
            )}
          </div>

          <div>
            <label className="block text-[10px] font-black uppercase tracking-wider text-slate-400 mb-1">
              Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={loading}
                placeholder="••••••••"
                className="w-full px-4 py-3 pr-10 rounded-xl border border-white/10 bg-white/5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 transition duration-200"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            {validationErrors.password && (
              <p className="mt-1 text-[10px] text-rose-400 font-semibold">{validationErrors.password}</p>
            )}
          </div>

          <div className="flex items-center justify-between text-xs mt-2">
            <label className="flex items-center gap-2 text-slate-400 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="accent-cyan-400 rounded"
              />
              Remember me
            </label>
            <Link
              href="/admin/forgot-password"
              className="text-cyan-400 hover:text-cyan-300 font-bold transition duration-200"
            >
              Forgot Password?
            </Link>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 overflow-hidden rounded-full bg-cyan-400 px-6 py-4 text-xs font-black uppercase tracking-[0.2em] text-[#03131d] shadow-[0_4px_25px_rgba(34,211,238,0.25)] transition-all duration-300 hover:scale-[1.02] hover:bg-cyan-300 hover:shadow-[0_10px_40px_rgba(34,211,238,0.45)] cursor-pointer disabled:opacity-50 disabled:pointer-events-none mt-6"
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Signing In...
              </>
            ) : (
              "Sign In"
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
