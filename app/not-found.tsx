// src/app/not-found.tsx

import Link from "next/link";
import { Home, Waves } from "lucide-react";

export default function NotFound() {
  return (
    <section className="relative flex min-h-screen items-center justify-center overflow-hidden bg-slate-950 px-6 text-white">
      {/* Background Glow */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(6,182,212,0.25),transparent_50%)]" />

      {/* Floating Blur */}
      <div className="absolute top-20 left-10 h-72 w-72 rounded-full bg-cyan-500/20 blur-3xl" />
      <div className="absolute bottom-10 right-10 h-72 w-72 rounded-full bg-blue-500/20 blur-3xl" />

      <div className="relative z-10 mx-auto max-w-2xl text-center">
        {/* Icon */}
        <div className="mx-auto mb-8 flex h-24 w-24 items-center justify-center rounded-full border border-cyan-400/30 bg-cyan-500/10 backdrop-blur-xl">
          <Waves className="h-12 w-12 text-cyan-400" />
        </div>

        {/* 404 */}
        <h1 className="bg-gradient-to-r from-cyan-300 to-blue-500 bg-clip-text text-7xl font-black text-transparent md:text-9xl">
          404
        </h1>

        {/* Title */}
        <h2 className="mt-6 text-3xl font-bold uppercase tracking-wide md:text-4xl">
          Lost In The Deep Ocean
        </h2>

        {/* Description */}
        <p className="mt-6 text-lg leading-relaxed text-slate-300">
          The page you are looking for may have drifted away beneath the waves.
          Let’s guide you back to Dive Hub & Marine Services.
        </p>

        {/* Button */}
        <div className="mt-10">
          <Link
            href="/"
            className="inline-flex items-center gap-3 rounded-full bg-cyan-500 px-8 py-4 text-sm font-bold uppercase tracking-wider text-slate-950 transition-all duration-300 hover:scale-105 hover:bg-cyan-400"
          >
            <Home className="h-5 w-5" />
            Back To Home
          </Link>
        </div>
      </div>
    </section>
  );
}