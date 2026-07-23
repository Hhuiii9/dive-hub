"use client";

import Image from "next/image";
import Link from "next/link";
import { Menu, X, ArrowRight } from "lucide-react";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

const navLinks = [
  { name: "Home", href: "/" },
  { name: "About", href: "/about" },
  { name: "What We Offer", href: "/what-we-offer" },
  { name: "Courses", href: "/courses" },
  { name: "Location", href: "/location" },
  { name: "Contact", href: "/contact" },
];

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  return (
    <header className="fixed top-0 left-0 w-full z-[99] border-b border-white/5 bg-[#03131d]/70 backdrop-blur-2xl transition-all duration-300">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4 sm:px-8">
        
        {/* BRAND LOGO */}
        <Link href="/" className="flex items-center gap-3 group">
          <div className="relative h-10 w-10 sm:h-11 sm:w-11 md:h-12 md:w-12 shrink-0 overflow-hidden rounded-full border border-white/10 bg-white/5 shadow-lg transition-transform duration-300 group-hover:scale-105">
            <Image
              src="/logo.png"
              alt="Dive Hub &amp; Marine Services"
              fill
              sizes="(max-width: 640px) 40px, (max-width: 768px) 44px, 48px"
              className="object-cover"
              priority
            />
          </div>

          <h1 className="flex items-center gap-1.5 sm:gap-2 select-none text-[10px] sm:text-xs md:text-sm font-bold tracking-[0.15em] text-white print:text-slate-900 whitespace-nowrap">
            <span>DIVE HUB</span>
            <span className="text-xs sm:text-sm font-black text-[#22D3EE] transition-transform duration-300 group-hover:scale-110 drop-shadow-[0_0_8px_rgba(34,211,238,0.35)]">&amp;</span>
            <span>MARINE SERVICES</span>
          </h1>
        </Link>

        {/* DESKTOP NAV LINKS */}
        <nav className="hidden items-center gap-8 lg:flex">
          {navLinks.map((link) => {
            const isActive = pathname === link.href;

            return (
              <Link
                key={link.name}
                href={link.href}
                className={`relative text-[11px] font-black uppercase tracking-[0.2em] transition-all duration-300 ${
                  isActive
                    ? "text-cyan-400"
                    : "text-white/60 hover:text-white"
                }`}
              >
                {link.name}
                {isActive && (
                  <motion.span
                    layoutId="navbar-underline"
                    className="absolute -bottom-2.5 left-0 h-[2px] w-full rounded-full bg-cyan-400 shadow-[0_0_8px_#22d3ee]"
                  />
                )}
              </Link>
            );
          })}
        </nav>

        {/* DESKTOP ACTION BUTTON */}
        <a
          href="https://wa.me/916235107072"
          target="_blank"
          rel="noopener noreferrer"
          className="hidden rounded-full border border-cyan-500/30 bg-cyan-500/10 px-6 py-3 text-[10px] font-black uppercase tracking-[0.25em] text-cyan-300 transition-all duration-300 hover:scale-105 hover:bg-cyan-500 hover:text-slate-950 lg:inline-flex"
        >
          Contact Now
        </a>

        {/* MOBILE MENU TOGGLE BUTTON */}
        <button
          onClick={() => setIsOpen(true)}
          className="flex h-11 w-11 items-center justify-center rounded-full border border-white/10 bg-white/5 shadow-md lg:hidden"
        >
          <Menu className="h-5 w-5 text-white" />
        </button>
      </div>

      {/* MOBILE SCREEN CURTAIN MENU */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.35, ease: "easeInOut" }}
            className="fixed inset-0 z-[100] w-full h-screen bg-[#03131d] lg:hidden flex flex-col px-6 py-5 overflow-y-auto"
          >
            <div className="flex items-center justify-between border-b border-white/5 pb-4">
              <Link
                href="/"
                onClick={() => setIsOpen(false)}
                className="flex items-center gap-3 group"
              >
                <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-full border border-white/10 bg-white/5 shadow-md">
                  <Image
                    src="/logo.png"
                    alt="Dive Hub &amp; Marine Services"
                    fill
                    sizes="40px"
                    className="object-cover"
                  />
                </div>

                <span className="flex items-center gap-1.5 sm:gap-2 select-none text-[10px] sm:text-xs md:text-sm font-bold tracking-[0.15em] text-white whitespace-nowrap">
                  <span>DIVE HUB</span>
                  <span className="text-xs sm:text-sm font-black text-[#22D3EE] transition-transform duration-300 group-hover:scale-110 drop-shadow-[0_0_8px_rgba(34,211,238,0.35)]">&amp;</span>
                  <span>MARINE SERVICES</span>
                </span>
              </Link>

              <button
                onClick={() => setIsOpen(false)}
                className="flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/5 shadow-md"
              >
                <X className="h-5 w-5 text-white" />
              </button>
            </div>

            {/* MOBILE NAV LINKS LIST */}
            <div className="mt-12 flex flex-col gap-3">
              {navLinks.map((link) => {
                const isActive = pathname === link.href;

                return (
                  <Link
                    key={link.name}
                    href={link.href}
                    onClick={() => setIsOpen(false)}
                    className={`relative rounded-2xl px-5 py-4 text-xs font-black uppercase tracking-[0.2em] transition-all duration-300 ${
                      isActive
                        ? "bg-cyan-500/10 text-cyan-300 border border-cyan-500/20"
                        : "bg-white/[0.02] text-white/70 hover:bg-white/5 border border-transparent"
                    }`}
                  >
                    <span className="relative inline-block">
                      {link.name}
                      {isActive && (
                        <span className="absolute -bottom-1 left-0 h-[2px] w-full rounded-full bg-cyan-400" />
                      )}
                    </span>
                  </Link>
                );
              })}
            </div>

            <a
              href="https://wa.me/916235107072"
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => setIsOpen(false)}
              className="mt-8 inline-flex items-center justify-center gap-2 rounded-full bg-cyan-400 px-6 py-4 text-xs font-black uppercase tracking-[0.25em] text-slate-950 shadow-lg shadow-cyan-500/20"
            >
              Contact Now
              <ArrowRight className="h-4 w-4" />
            </a>

            <div className="mt-auto rounded-3xl border border-white/5 bg-white/[0.01] p-6 text-center">
              <p className="text-xs leading-relaxed text-slate-400 font-light">
                Professional scuba diving certification, specialized commercial diving education, ROV data surveys and offshore solutions.
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}