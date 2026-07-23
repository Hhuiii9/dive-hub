"use client";

import React, { useState } from "react";
import { Compass, Loader2, ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function AdminForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      setError("Email address is required.");
      return;
    }

    setLoading(true);
    setError("");
    setMessage("");

    try {
      const res = await fetch("/api/auth/admin/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();
      if (res.ok) {
        setMessage(data.message || "If an account exists, password reset instructions have been sent.");
      } else {
        setError(data.error || "Failed to process request.");
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
          Forgot Password
        </h1>
        <p className="mt-2 text-xs text-slate-400 font-light text-center">
          Enter your email to receive password reset instructions.
        </p>

        {message && (
          <div className="mt-5 p-4 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-300 text-xs font-semibold text-center">
            {message}
          </div>
        )}

        {error && (
          <div className="mt-5 p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs font-semibold text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <div>
            <label className="block text-[10px] font-black uppercase tracking-wider text-slate-400 mb-1">
              Email Address
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={loading}
              placeholder="admin@example.com"
              className="w-full px-4 py-3 rounded-xl border border-white/10 bg-white/5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 transition duration-200"
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
                Processing...
              </>
            ) : (
              "Send Instructions"
            )}
          </button>
        </form>

        <div className="mt-6 text-center">
          <Link
            href="/admin/login"
            className="inline-flex items-center gap-2 text-xs text-slate-400 hover:text-white transition duration-200"
          >
            <ArrowLeft className="h-3 w-3" />
            Back to Login
          </Link>
        </div>
      </div>
    </div>
  );
}
