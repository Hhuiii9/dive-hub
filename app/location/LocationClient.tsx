"use client";

import React from "react";
import { motion } from "framer-motion";
import { MapPin, Phone, Mail, Clock3, ArrowRight, Sparkles, Navigation, Globe } from "lucide-react";

const pageTransition = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { duration: 0.8, ease: "easeOut" as const, staggerChildren: 0.08 },
  },
};

const fadeInUp = {
  hidden: { opacity: 0, y: 40, filter: "blur(6px)" },
  visible: {
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] as const },
  },
};

const fadeInLeft = {
  hidden: { opacity: 0, x: -50, filter: "blur(6px)" },
  visible: {
    opacity: 1,
    x: 0,
    filter: "blur(0px)",
    transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] as const },
  },
};

const fadeInRight = {
  hidden: { opacity: 0, x: 50, scale: 0.96, filter: "blur(6px)" },
  visible: {
    opacity: 1,
    x: 0,
    scale: 1,
    filter: "blur(0px)",
    transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] as const },
  },
};

export default function LocationClient() {
  return (
    <motion.main
      initial="hidden"
      animate="visible"
      variants={pageTransition}
      className="bg-[#03131d] text-white min-h-screen overflow-hidden relative"
    >
      {/* Immersive radial glows */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(6,182,212,0.03)_0%,transparent_60%)] pointer-events-none z-0" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_80%,rgba(34,211,238,0.02)_0%,transparent_50%)] pointer-events-none z-0" />

      {/* HERO */}
      <section className="relative overflow-hidden px-4 py-16 sm:px-6 sm:py-24 md:py-28 z-10">
        <div className="mx-auto max-w-7xl text-center">
          <motion.p
            variants={fadeInUp}
            className="text-[10px] font-black uppercase tracking-[0.28em] text-[#67e8f9] sm:text-xs flex items-center justify-center gap-1.5"
          >
            <Sparkles className="h-3.5 w-3.5" />
            OUR MARINE BASE
          </motion.p>

          <motion.h1
            variants={fadeInUp}
            className="mx-auto mt-4 max-w-5xl text-[32px] font-black leading-[1.08] text-white sm:text-5xl md:text-6xl tracking-tight"
          >
            Dive Hub <span className="text-[#67e8f9]">Location & Base</span>
          </motion.h1>

          <motion.p
            variants={fadeInUp}
            className="mx-auto mt-5 max-w-3xl text-[14px] leading-7 text-white/72 font-light sm:mt-7 sm:text-[16px] sm:leading-8"
          >
            Visit our training academy and marine service headquarters based in Angamaly, Ernakulam, Kerala, India. Find detailed coordinates, directions, maps, and hours of operation below.
          </motion.p>
        </div>
      </section>

      {/* GRID DETAILS */}
      <section className="px-4 pb-24 sm:px-6 relative z-10">
        <div className="mx-auto max-w-7xl">
          <div className="grid gap-8 lg:grid-cols-12 lg:gap-10">
            
            {/* LOCATION DETAILS CARD */}
            <motion.div
              variants={fadeInLeft}
              className="lg:col-span-5 rounded-[2rem] bg-[#062232]/30 border border-white/10 p-6 sm:p-10 shadow-[0_20px_50px_rgba(0,0,0,0.3)] flex flex-col justify-between"
            >
              <div className="space-y-8">
                <div>
                  <span className="text-[10px] font-black uppercase tracking-[0.28em] text-[#67e8f9] sm:text-xs">
                    Base Coordinates
                  </span>
                  <h2 className="mt-2 text-2xl sm:text-3xl font-black text-white uppercase tracking-wider">
                    Angamaly, Kerala
                  </h2>
                </div>

                <div className="space-y-6">
                  {/* Address */}
                  <div className="flex items-start gap-4">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-cyan-500/10 border border-cyan-400/20 text-[#67e8f9]">
                      <MapPin className="h-5 w-5" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-white uppercase tracking-wider">Address</h4>
                      <p className="mt-1 text-sm text-slate-300 font-light leading-relaxed">
                        Dive Hub & Marine Services<br />
                        Angamaly, Ernakulam District,<br />
                        Kerala, 683572, India
                      </p>
                    </div>
                  </div>

                  {/* Coordinates info */}
                  <div className="flex items-start gap-4">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-cyan-500/10 border border-cyan-400/20 text-[#67e8f9]">
                      <Globe className="h-5 w-5" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-white uppercase tracking-wider">GPS Coordinates</h4>
                      <p className="mt-1 text-sm text-slate-300 font-light leading-relaxed">
                        Latitude: 10.1926394 N<br />
                        Longitude: 76.3869289 E
                      </p>
                    </div>
                  </div>

                  {/* Hours */}
                  <div className="flex items-start gap-4">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-cyan-500/10 border border-cyan-400/20 text-[#67e8f9]">
                      <Clock3 className="h-5 w-5" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-white uppercase tracking-wider">Business Hours</h4>
                      <p className="mt-1 text-sm text-slate-300 font-light leading-relaxed">
                        Monday - Saturday: 9:00 AM - 7:00 PM<br />
                        Sunday: Closed (Available for emergency marine support)
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Button */}
              <div className="mt-8 pt-6 border-t border-white/5 flex flex-col gap-4">
                <a
                  href="https://www.google.com/maps/place/Dive+Hub+%26+Marine+Services/@10.1926394,76.3869289,17z/data=!3m1!4b1!4m6!3m5!1s0x3b0807c7ec9c75e9:0xbc174757022bb9ee!8m2!3d10.1926394!4d76.3869289!16s%2Fg%2F11z9rfxttv?entry=ttu&g_ep=EgoyMDI2MDYwMy4xIKXMDSoASAFQAw%3D%3D"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group inline-flex items-center justify-center gap-2 rounded-full bg-[#67e8f9] hover:bg-cyan-300 px-6 py-3.5 text-xs font-black uppercase tracking-[0.18em] text-slate-950 transition-all duration-300 hover:scale-105"
                >
                  <Navigation className="h-4 w-4" />
                  Get Navigation Directions
                  <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
                </a>

                <p className="text-[10px] text-slate-400 text-center font-light">
                  Located near Cochin International Airport (COK) for easy offshore client access.
                </p>
              </div>
            </motion.div>

            {/* MAP & STREET VIEW WIDGET */}
            <motion.div
              variants={fadeInRight}
              className="lg:col-span-7 overflow-hidden rounded-[2rem] bg-[#062232]/30 border border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.3)] flex flex-col"
            >
              <div className="flex items-center justify-between bg-[#0a2b40]/60 border-b border-white/10 px-5 py-4">
                <div className="flex items-center gap-2">
                  <MapPin className="h-5 w-5 text-[#67e8f9]" />
                  <p className="text-sm font-black uppercase tracking-wide text-white">
                    Interactive Map Widget
                  </p>
                </div>
                <span className="text-[10px] font-bold text-[#67e8f9] bg-cyan-950/40 border border-cyan-400/25 px-2 py-0.5 rounded-full">
                  HQ Base
                </span>
              </div>

              <div className="aspect-[4/3] w-full overflow-hidden sm:aspect-video lg:h-full lg:aspect-auto flex-1">
                <iframe
                  src="https://maps.google.com/maps?q=Dive%20Hub%20%26%20Marine%20Services,%20Angamaly,%20Kerala,%20India&z=16&hl=en&output=embed"
                  className="h-full w-full border-0 opacity-80"
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                />
              </div>
            </motion.div>

          </div>
        </div>
      </section>
    </motion.main>
  );
}
