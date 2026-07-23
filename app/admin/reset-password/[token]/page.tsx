"use client";

import React, { useState, use } from "react";
import { useRouter } from "next/navigation";
import { Compass, Eye, EyeOff, Loader2, CheckCircle2 } from "lucide-react";

export default function AdminResetPasswordPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const router = useRouter();
  const { token } = use(params);

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password || !confirmPassword) {
      setError("Please fill in all fields.");
      return;
    }
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);
    setError("");
    setMessage("");

    try {
      const res = await fetch("/api/auth/admin/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          token,
          password,
          password_confirmation: confirmPassword,
        }),
      });

      const data = await res.json();
      if (res.ok) {
        setMessage(data.message || "Password reset successful! Redirecting to login...");
        setTimeout(() => {
          router.push("/admin/login");
        }, 3000);
      } else {
        setError(data.message || "Failed to reset password.");
      }
    } catch (err) {
      setError("An unexpected error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#03131d] flex items-center justify-center px-4 relative overflow-hidden font-sans">
      <div className="absolute left-[15%] top-1/4 h-[350px] w-[350px] rounded-full bg-cyan-500/10 blur-[90px]" />
      <div className="absolute right-[15%] bottom-1/4 h-[350px] w-[350px] rounded-full bg-blue-500/10 blur-[90px]" />

      <div className="relative z-10 max-w-md w-full rounded-[2rem] border border-white/10 bg-white/[0.02] p-8 sm:p-10 shadow-2xl backdrop-blur-2xl">
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-cyan-500/10 border border-cyan-400/20 text-cyan-300 mx-auto mb-6">
          <Compass className="h-8 w-8" />
        </div>

        <h1 className="text-2xl font-black uppercase tracking-tight text-white text-center">
          Reset Password
        </h1>
        <p className="mt-2 text-xs text-slate-400 font-light text-center">
          Enter and confirm your new password below.
        </p>

        {message && (
          <div className="mt-5 p-4 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-300 text-xs font-semibold text-center flex flex-col items-center gap-2">
            <CheckCircle2 className="h-5 w-5 text-cyan-400" />
            <span>{message}</span>
          </div>
        )}

        {error && (
          <div className="mt-5 p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs font-semibold text-center">
            {error}
          </div>
        )}

        {!message && (
          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            <div>
              <label className="block text-[10px] font-black uppercase tracking-wider text-slate-400 mb-1">
                New Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={loading}
                  placeholder="••••••••"
                  className="w-full px-4 py-3 pr-10 rounded-xl border border-white/10 bg-white/5 text-sm text-white focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 transition duration-200"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-black uppercase tracking-wider text-slate-400 mb-1">
                Confirm New Password
              </label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                disabled={loading}
                placeholder="••••••••"
                className="w-full px-4 py-3 rounded-xl border border-white/10 bg-white/5 text-sm text-white focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 transition duration-200"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 overflow-hidden rounded-full bg-cyan-400 px-6 py-4 text-xs font-black uppercase tracking-[0.2em] text-[#03131d] shadow-[0_4px_25px_rgba(34,211,238,0.25)] transition-all duration-300 hover:scale-[1.02] hover:bg-cyan-300 hover:shadow-[0_10px_40px_rgba(34,211,238,0.45)] cursor-pointer disabled:opacity-50 disabled:pointer-events-none mt-6"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Updating Password...
                </>
              ) : (
                "Update Password"
              )}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
