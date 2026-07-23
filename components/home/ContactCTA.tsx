"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import {
  Phone,
  Mail,
  MessageCircle,
  ArrowRight,
  MapPin,
} from "lucide-react";

export default function ContactCTA() {
  return (
    <section className="relative overflow-hidden bg-[#03131d] px-6 py-20 text-white sm:px-8 sm:py-28 md:py-36">
      
      {/* Immersive background glow spotlights */}
      <div className="absolute left-[15%] top-1/4 h-[350px] w-[350px] rounded-full bg-cyan-500/10 blur-[90px] animate-pulse pointer-events-none" />
      <div className="absolute right-[10%] bottom-1/4 h-[400px] w-[400px] rounded-full bg-blue-500/8 blur-[110px] animate-pulse pointer-events-none" />

      <div className="relative z-10 mx-auto max-w-7xl">
        
        {/* PREMIUM CONTAINER WRAPPER */}
        <div className="overflow-hidden rounded-[2.5rem] border border-white/10 bg-white/[0.02] p-8 sm:p-12 md:p-16 shadow-[0_30px_70px_rgba(0,0,0,0.45)] backdrop-blur-3xl">
          
          <div className="grid gap-12 lg:grid-cols-2 lg:gap-16 items-center">
            
            {/* LEFT DETAILS COLUMN */}
            <div className="flex flex-col items-start text-left">
              <span className="text-[10px] font-black uppercase tracking-[0.3em] text-cyan-400">
                Contact Dive Hub & Marine Services
              </span>

              <h2 className="mt-5 text-4xl sm:text-5xl md:text-6xl font-black uppercase tracking-tight leading-[0.95] text-white">
                Ready to
                <span className="block bg-gradient-to-r from-cyan-400 to-blue-300 bg-clip-text text-transparent">
                  Explore?
                </span>
              </h2>

              <p className="mt-6 text-sm sm:text-base leading-7 font-light text-slate-300">
                Start your underwater journey today. Reach out to Dive Hub & Marine Services for professional scuba courses, certified commercial diver training, and industrial marine operations.
              </p>

              {/* CONTACT BOXES (Glassmorphic cards) */}
              <div className="mt-8 grid gap-4 w-full sm:grid-cols-2">
                
                {/* PHONE */}
                <motion.div
                  whileHover={{ y: -4, borderColor: "rgba(34, 211, 238, 0.2)" }}
                  className="flex items-start gap-4 rounded-2xl border border-white/5 bg-white/[0.02] p-4 transition-all duration-300"
                >
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-cyan-500/10 border border-cyan-400/20 text-cyan-300">
                    <Phone className="h-5 w-5" />
                  </div>

                  <div>
                    <span className="text-[8px] uppercase tracking-widest text-slate-500">
                      Contact Numbers
                    </span>
                    <div className="mt-0.5 text-[11px] sm:text-xs font-black text-white flex flex-col space-y-0.5">
                      <a href="tel:04842989390" className="hover:text-cyan-300 transition-colors">
                        Landline: 0484 2989390
                      </a>
                      <a href="tel:+916235107072" className="hover:text-cyan-300 transition-colors">
                        Mobile: +91 6235107072
                      </a>
                      <a href="tel:+916235106062" className="hover:text-cyan-300 transition-colors">
                        Mobile: +91 6235106062
                      </a>
                    </div>
                  </div>
                </motion.div>

                {/* EMAIL */}
                <motion.div
                  whileHover={{ y: -4, borderColor: "rgba(34, 211, 238, 0.2)" }}
                  className="flex items-center gap-4 rounded-2xl border border-white/5 bg-white/[0.02] p-4 transition-all duration-300"
                >
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-cyan-500/10 border border-cyan-400/20 text-cyan-300">
                    <Mail className="h-5 w-5" />
                  </div>

                  <div className="min-w-0">
                    <span className="text-[8px] uppercase tracking-widest text-slate-500">
                      Email Address
                    </span>
                    <p className="mt-0.5 break-all text-[10px] sm:text-xs font-black text-white">
                      divehub@divehubmarineservices.com
                    </p>
                  </div>
                </motion.div>
              </div>

              {/* BUTTONS WITH PREMIUM GLOW */}
              <div className="mt-8 flex flex-col sm:flex-row gap-4 w-full">
                
                <a
                  href="https://wa.me/916235107072"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group relative inline-flex items-center justify-center gap-2 overflow-hidden rounded-full bg-cyan-400 px-8 py-4 text-xs font-black uppercase tracking-[0.2em] text-[#03131d] shadow-[0_4px_25px_rgba(34,211,238,0.25)] transition-all duration-300 hover:scale-105 hover:bg-cyan-300 hover:shadow-[0_10px_40px_rgba(34,211,238,0.45)] w-full sm:w-auto"
                >
                  <MessageCircle className="h-4 w-4 fill-[#03131d] text-[#03131d]" />
                  WhatsApp
                </a>

                <Link
                  href="/contact"
                  className="group relative inline-flex items-center justify-center gap-2 overflow-hidden rounded-full border border-white/10 bg-white/5 px-8 py-4 text-xs font-black uppercase tracking-[0.2em] text-white backdrop-blur-md transition-all duration-300 hover:scale-105 hover:bg-white/10 hover:border-white/30 w-full sm:w-auto"
                >
                  Contact Us
                  <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
                </Link>
              </div>
            </div>

            {/* RIGHT GOOGLE MAP COLUMN */}
            <div className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-white/[0.02] shadow-2xl">
              
              {/* TOP HEADER */}
              <div className="flex items-center gap-2 border-b border-white/10 bg-white/[0.03] px-6 py-4">
                <MapPin className="h-5 w-5 text-cyan-300" />
                <span className="text-xs font-black uppercase tracking-widest text-white">
                  Our Marine Base
                </span>
              </div>

              {/* DYNAMIC MAP */}
              <iframe
                src="https://maps.google.com/maps?q=Dive%20Hub%20%26%20Marine%20Services,%20Angamaly,%20Kerala,%20India&z=17&hl=en&output=embed"
                className="h-[280px] w-full sm:h-[350px] border-none brightness-[0.8] contrast-[1.1] grayscale-[30%] invert-[90%]"
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}