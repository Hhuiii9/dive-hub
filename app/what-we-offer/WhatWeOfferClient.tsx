"use client";

import React from "react";
import { motion } from "framer-motion";
import {
  Waves,
  ShieldCheck,
  Camera,
  Anchor,
  Fish,
  Compass,
  LifeBuoy,
  BadgeCheck,
} from "lucide-react";

const offers = [
  {
    icon: Waves,
    title: "Underwater Services",
    desc: "Marine inspections, salvage operations, underwater maintenance, and technical subsea diving support.",
  },
  {
    icon: ShieldCheck,
    title: "Diving Courses",
    desc: "Beginner to advanced scuba diving programs with strict military-grade safety-focused training.",
  },
  {
    icon: Fish,
    title: "Scuba Experiences",
    desc: "Guided scuba sessions and ocean diving tours for first-time and experienced divers.",
  },
  {
    icon: Camera,
    title: "Specialty Training",
    desc: "Deep diving, night diving, rescue diving, subsea engineering, and underwater photography.",
  },
  {
    icon: Anchor,
    title: "Commercial Diving",
    desc: "Career-focused commercial diving training for marine construction, subsea welding, and industrial engineering.",
  },
  {
    icon: Compass,
    title: "ROV Survey Support",
    desc: "Remote underwater inspection surveys, deep-sea exploration, and high-tech robotic mapping.",
  },
  {
    icon: LifeBuoy,
    title: "Rescue Support",
    desc: "Emergency response team training, first-aid instruction, and underwater safety management skills.",
  },
  {
    icon: BadgeCheck,
    title: "Certifications",
    desc: "Internationally recognized professional diving certifications for commercial and recreational careers.",
  },
];

// Premium animation configurations
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

export default function WhatWeOfferClient() {
  return (
    <motion.main
      initial="hidden"
      animate="visible"
      variants={pageTransition}
      className="bg-[#03131d] text-white overflow-hidden min-h-screen relative"
    >
      {/* Luxury background layout depth and very subtle ocean glow */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(6,182,212,0.03)_0%,transparent_60%)] pointer-events-none z-0" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_70%,rgba(34,211,238,0.02)_0%,transparent_50%)] pointer-events-none z-0" />

      {/* HERO */}
      <section className="px-4 py-16 sm:px-6 sm:py-24 md:py-28 relative z-10">
        <div className="mx-auto max-w-7xl text-center">
          <motion.p
            variants={fadeInUp}
            className="text-[10px] font-black uppercase tracking-[0.28em] text-[#7dd3fc] sm:text-xs"
          >
            What We Offer
          </motion.p>

          <motion.h1
            variants={fadeInUp}
            className="mx-auto mt-4 max-w-4xl text-[32px] font-black leading-[1.08] text-white sm:text-5xl md:text-6xl tracking-tight"
          >
            Diving Training &
            <span className="text-[#7dd3fc]"> Marine Services</span>
          </motion.h1>

          <motion.p
            variants={fadeInUp}
            className="mx-auto mt-5 max-w-3xl text-[14px] leading-7 text-white/75 font-light sm:mt-7 sm:text-[16px] sm:leading-8"
          >
            Dive Hub & Marine Services provides professional underwater
            solutions, scuba diving programs, commercial diving support, and
            advanced specialty training for beginners, professionals, and marine
            industries.
          </motion.p>
        </div>
      </section>

      {/* OFFERS GRID */}
      <section className="px-4 pb-16 sm:px-6 sm:pb-24 relative z-10">
        <div className="mx-auto max-w-7xl">
          <motion.div
            variants={{
              hidden: {},
              visible: { transition: { staggerChildren: 0.08 } }
            }}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4"
          >
            {offers.map((item, index) => {
              const Icon = item.icon;

              return (
                <motion.div
                  key={index}
                  variants={fadeInUp}
                  whileHover={{ y: -6, scale: 1.02 }}
                  className="group rounded-2xl bg-[#062232]/40 hover:bg-[#0a2b40]/50 shadow-[0_15px_35px_rgba(0,0,0,0.3)] hover:shadow-[0_25px_50px_rgba(6,182,212,0.12)] border border-white/10 hover:border-cyan-400/30 cursor-pointer flex flex-col justify-between h-full transition-all duration-500 sm:rounded-[2rem] sm:p-7 p-4"
                >
                  <div>
                    <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-[#0a2b40]/60 border border-[#123b57]/80 text-[#7dd3fc] sm:mb-5 sm:h-16 sm:w-16 sm:rounded-2xl transition-all duration-300 group-hover:scale-105 group-hover:bg-[#123b57]/80 group-hover:text-white">
                      <Icon className="h-5 w-5 sm:h-7 sm:w-7 transition-transform duration-700 group-hover:rotate-6" />
                    </div>

                    <h3 className="text-[13px] font-black leading-tight text-white sm:text-2xl tracking-tight uppercase">
                      {item.title}
                    </h3>

                    <p className="mt-2 text-[11px] leading-5 text-white/75 font-light sm:mt-4 sm:text-[15px] sm:leading-7">
                      {item.desc}
                    </p>
                  </div>
                </motion.div>
              );
            })}
          </motion.div>
        </div>
      </section>

      {/* DETAILS */}
      <section className="px-4 pb-16 sm:px-6 sm:pb-24 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.8, ease: "easeOut" as const }}
          className="mx-auto max-w-7xl rounded-[2rem] bg-[#062232]/30 border border-white/10 p-5 text-white sm:p-10 md:p-14 relative overflow-hidden"
        >
          {/* Breathing atmospheric ocean glow */}
          <motion.div
            animate={{
              scale: [1, 1.05, 1],
              opacity: [0.4, 0.6, 0.4],
            }}
            transition={{
              duration: 8,
              repeat: Infinity,
              ease: "easeInOut",
            }}
            className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(34,211,238,0.08)_0%,transparent_80%)] pointer-events-none"
          />
          
          <div className="relative z-10 grid gap-8 lg:grid-cols-2 lg:gap-12">
            <div>
              <motion.span
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
                className="inline-block text-[10px] font-black uppercase tracking-[0.28em] text-[#7dd3fc] sm:text-xs"
              >
                Professional Support
              </motion.span>

              <motion.h2
                initial={{ opacity: 0, y: 25 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.7, delay: 0.1 }}
                className="mt-4 text-[30px] font-black leading-[1.1] sm:text-5xl tracking-tight text-white"
              >
                Complete Underwater
                <span className="text-[#7dd3fc] font-black"> Service Solutions</span>
              </motion.h2>
            </div>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7, delay: 0.25 }}
              className="text-[14px] leading-7 text-white/75 font-light sm:text-[16px] sm:leading-8 flex items-center"
            >
              From recreational diving to commercial underwater operations, our
              programs are designed with expert instruction, modern equipment,
              safety protocols, and real-world marine service knowledge.
            </motion.p>
          </div>
        </motion.div>
      </section>
    </motion.main>
  );
}
