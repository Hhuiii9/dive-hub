"use client";

import Image from "next/image";
import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Waves,
  ShieldCheck,
  Anchor,
  LifeBuoy,
  BadgeCheck,
  ArrowRight,
  HardHat,
  HeartPulse
} from "lucide-react";

const WHATSAPP_NUMBER = "916235107072";

interface Course {
  category: "scuba" | "commercial";
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  desc: string;
  image: string;
}

const courses: Course[] = [
  // Scuba Diving Courses
  {
    category: "scuba",
    icon: Waves,
    title: "Open Water Diver",
    desc: "The essential entry-level global certification to start your underwater journey.",
    image: "/images/course-1.jpg",
  },
  {
    category: "scuba",
    icon: ShieldCheck,
    title: "Advanced Open Water",
    desc: "Deepen your experience with navigation, deep diving, and advanced control.",
    image: "/images/course-2.jpg",
  },
  {
    category: "scuba",
    icon: HeartPulse,
    title: "Emergency First Response",
    desc: "An essential CPR and first aid course preparing you to manage medical emergencies both in and out of the water.",
    image: "/images/course-8.png",
  },
  {
    category: "scuba",
    icon: LifeBuoy,
    title: "Rescue Diver",
    desc: "Learn to manage diving emergencies and become a highly capable dive partner.",
    image: "/images/course-4.jpg",
  },
  {
    category: "scuba",
    icon: BadgeCheck,
    title: "Dive Master",
    desc: "Take the step into professional diving, lead groups, and manage dive operations.",
    image: "/images/course-6.jpg",
  },
  
  // Commercial Diving Courses - Encompassing All Underwater Works
  {
    category: "commercial",
    icon: Anchor,
    title: "Commercial Diving",
    desc: "Career-focused industrial and offshore surface-supplied diving training covering all underwater works, structural salvage, cutting, welding, and marine infrastructure engineering.",
    image: "/images/course-5.jpg",
  },
  {
    category: "commercial",
    icon: BadgeCheck,
    title: "Marine Inspection & Survey",
    desc: "Professional non-destructive testing (NDT), structural integrity assessments, surveying, and comprehensive engineering data recording across all underwater works.",
    image: "/images/course-3.jpg",
  },
  {
    category: "commercial",
    icon: HardHat,
    title: "All Underwater Works",
    desc: "Comprehensive training in marine construction, subsea engineering, and hyperbaric operations, covering everything from civil concrete placement to deep-sea technical diving.",
    image: "/images/course-7.JPG", // Case-sensitivity fix!
  }
];

// Premium animation configs
const pageTransition = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { duration: 0.7, ease: "easeOut" as const, staggerChildren: 0.08 },
  },
};

const fadeInUp = {
  hidden: { opacity: 0, y: 40, filter: "blur(6px)" },
  visible: {
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: { duration: 0.7, ease: [0.16, 1, 0.3, 1] as const },
  },
};

export default function CoursesClient() {
  const [activeTab, setActiveTab] = useState<"scuba" | "commercial">("scuba");

  // Filters the array instantly based on the active button
  const filteredCourses = courses.filter((course) => course.category === activeTab);

  return (
    <motion.main
      initial="hidden"
      animate="visible"
      variants={pageTransition}
      className="bg-[#03131d] text-white min-h-screen overflow-hidden relative"
    >
      {/* Luxury ocean blue gradients and subtle cyan atmosphere */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(6,182,212,0.03)_0%,transparent_60%)] pointer-events-none z-0" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_80%,rgba(34,211,238,0.02)_0%,transparent_50%)] pointer-events-none z-0" />

      {/* HERO */}
      <section className="relative overflow-hidden px-4 py-16 sm:px-6 sm:py-24 md:py-28 z-10">
        <div className="mx-auto max-w-7xl text-center">
          <motion.p
            variants={fadeInUp}
            className="text-[10px] font-black uppercase tracking-[0.28em] text-[#67e8f9] sm:text-xs"
          >
            Professional Diving Courses
          </motion.p>

          <motion.h1
            variants={fadeInUp}
            className="mx-auto mt-4 max-w-5xl text-[32px] font-black leading-[1.08] text-white sm:text-5xl md:text-6xl tracking-tight"
          >
            Explore Our <span className="text-[#67e8f9]">Diving Programs</span>
          </motion.h1>

          <motion.p
            variants={fadeInUp}
            className="mx-auto mt-5 max-w-3xl text-[14px] leading-7 text-white/75 font-light sm:mt-7 sm:text-[16px] sm:leading-8"
          >
            Dive Hub & Marine Services offers beginner to advanced scuba diving
            programs, commercial diving training for all underwater works, industrial 
            rescue, and professional marine certification courses with global safety standards.
          </motion.p>
        </div>
      </section>

      {/* TWO-BUTTON CATEGORY NAVIGATION */}
      <section className="px-4 pb-12 sm:px-6 relative z-20">
        <div className="max-w-md mx-auto">
          <div className="relative grid grid-cols-2 p-1.5 bg-[#062232]/60 backdrop-blur-xl border border-white/[0.08] rounded-full shadow-[0_15px_35px_rgba(0,0,0,0.4)]">
            {/* Animated Background Slider */}
            <motion.div
              className="absolute inset-y-1.5 rounded-full bg-gradient-to-r from-cyan-500 to-blue-600 shadow-[0_0_20px_rgba(6,182,212,0.35)]"
              initial={false}
              animate={{
                left: activeTab === "scuba" ? "6px" : "50%",
                right: activeTab === "scuba" ? "50%" : "6px",
              }}
              transition={{ type: "spring", stiffness: 320, damping: 28 }}
            />

            {/* Scuba Diving Tab */}
            <button
              onClick={() => setActiveTab("scuba")}
              className={`relative z-10 flex items-center justify-center gap-2 py-3.5 text-xs font-black uppercase tracking-[0.15em] transition-colors duration-300 rounded-full sm:text-sm ${
                activeTab === "scuba" ? "text-slate-950" : "text-white/70 hover:text-white"
              }`}
            >
              <Waves className={`h-4 w-4 ${activeTab === "scuba" ? "text-slate-950" : "text-[#67e8f9]"}`} />
              Scuba Diving
            </button>

            {/* Commercial Diving Tab */}
            <button
              onClick={() => setActiveTab("commercial")}
              className={`relative z-10 flex items-center justify-center gap-2 py-3.5 text-xs font-black uppercase tracking-[0.15em] transition-colors duration-300 rounded-full sm:text-sm ${
                activeTab === "commercial" ? "text-slate-950" : "text-white/70 hover:text-white"
              }`}
            >
              <Anchor className={`h-4 w-4 ${activeTab === "commercial" ? "text-slate-950" : "text-[#67e8f9]"}`} />
              Commercial Diving
            </button>
          </div>
        </div>
      </section>

      {/* COURSES SECTION */}
      <section className="px-4 pb-16 sm:px-6 sm:pb-24 relative z-10">
        <div className="mx-auto max-w-7xl">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="mb-10 text-center sm:mb-14"
          >
            <p className="text-[10px] font-black uppercase tracking-[0.28em] text-[#67e8f9] sm:text-xs">
              Our Syllabus
            </p>
            <h2 className="mt-4 text-[30px] font-black text-white sm:text-5xl tracking-tight uppercase">
              {activeTab === "scuba" ? "Scuba Training tracks" : "Industrial Programs"}
            </h2>
          </motion.div>

          {/* Grid layout that manages child layouts beautifully during state toggles */}
          <motion.div 
            layout="position"
            className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 sm:gap-5 min-h-[400px]"
          >
            <AnimatePresence mode="popLayout">
              {filteredCourses.map((course) => {
                const Icon = course.icon;
                const message = `Hello Dive Hub & Marine Services, I want to enroll in the ${course.title} course. Please share more details.`;

                return (
                  <motion.div
                    key={course.title}
                    layout
                    initial={{ opacity: 0, scale: 0.9, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.9, y: 20 }}
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                    whileHover={{ y: -6, scale: 1.02 }}
                    className="group overflow-hidden rounded-2xl bg-white/[0.05] border border-white/[0.08] hover:border-cyan-400/30 shadow-[0_15px_35px_rgba(0,0,0,0.3)] hover:shadow-[0_25px_50px_rgba(6,182,212,0.12)] cursor-pointer flex flex-col justify-between h-full transition-all duration-500 sm:rounded-[2rem]"
                  >
                    <div>
                      <div className="relative overflow-hidden">
                        <Image
                          src={course.image}
                          alt={course.title}
                          width={600}
                          height={500}
                          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                          className="h-[180px] w-full object-cover sm:h-[240px] transition-transform duration-700 group-hover:scale-105"
                          loading="lazy"
                        />
                        <div className="absolute left-4 top-4 flex h-11 w-11 items-center justify-center rounded-xl bg-[#062232]/80 backdrop-blur-xl border border-white/10 text-[#67e8f9] sm:left-5 sm:top-5 sm:h-14 sm:w-14 sm:rounded-2xl transition-all duration-300 group-hover:scale-105 group-hover:bg-[#123b57] group-hover:text-white">
                          <Icon className="h-5 w-5 sm:h-7 sm:w-7 transition-transform duration-500 group-hover:rotate-6" />
                        </div>
                      </div>

                      <div className="p-5 sm:p-7">
                        <h3 className="text-lg font-black leading-tight text-white sm:text-2xl tracking-tight uppercase group-hover:text-[#67e8f9] transition-colors duration-300">
                          {course.title}
                        </h3>
                        <p className="mt-2 text-sm leading-6 text-white/75 font-light sm:mt-4 sm:text-[15px] sm:leading-7">
                          {course.desc}
                        </p>
                      </div>
                    </div>

                    <div className="p-5 sm:px-7 sm:pb-7 pt-0">
                      <a
                        href={`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 text-xs font-black uppercase tracking-wider text-[#67e8f9] transition-all hover:text-cyan-300 hover:translate-x-1 duration-300 sm:text-sm sm:tracking-widest"
                      >
                        Enroll Now
                        <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
                      </a>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </motion.div>
        </div>
      </section>

      {/* CTA DETAILS */}
      <section className="px-4 pb-16 sm:px-6 sm:pb-24 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="mx-auto max-w-7xl rounded-[2rem] bg-[#062232]/30 border border-white/10 p-6 text-white sm:p-10 md:p-14 relative overflow-hidden"
        >
          {/* Slow breathing background glow */}
          <motion.div
            animate={{
              scale: [1, 1.06, 1],
              opacity: [0.4, 0.6, 0.4],
            }}
            transition={{
              duration: 8,
              repeat: Infinity,
              ease: "easeInOut",
            }}
            className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(6,182,212,0.08)_0%,transparent_80%)] pointer-events-none"
          />

          <div className="relative z-10 grid gap-8 lg:grid-cols-2 lg:gap-12">
            <div>
              <motion.span
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
                className="inline-block text-[10px] font-black uppercase tracking-[0.28em] text-[#67e8f9] sm:text-xs"
              >
                Start Your Journey
              </motion.span>

              <motion.h2
                initial={{ opacity: 0, y: 25 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.7, delay: 0.1 }}
                className="mt-4 text-[30px] font-black leading-[1.1] sm:text-5xl tracking-tight text-white"
              >
                Become A Skilled <span className="text-[#67e8f9]">Professional Diver</span>
              </motion.h2>
            </div>

            <div>
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.7, delay: 0.2 }}
                className="text-[14px] leading-7 text-white/75 font-light sm:text-[16px] sm:leading-8"
              >
                Join Dive Hub & Marine Services to experience internationally
                focused diving education, commercial diving skills, and
                advanced underwater exploration programs designed for real-world
                marine careers.
              </motion.p>

              <motion.div
                initial={{ opacity: 0, scale: 0.94 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8, delay: 0.3 }}
              >
                <a
                  href={`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(
                    "Hello Dive Hub & Marine Services, I want to know more about your diving courses."
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-6 inline-flex items-center gap-2 rounded-full bg-[#67e8f9] hover:bg-cyan-300 px-6 py-3 text-[10px] font-black uppercase tracking-[0.18em] text-slate-950 transition-all duration-300 hover:scale-105 hover:shadow-[0_0_20px_rgba(34,211,238,0.4)] sm:text-xs"
                >
                  Contact Us
                  <ArrowRight className="h-4 w-4" />
                </a>
              </motion.div>
            </div>
          </div>
        </motion.div>
      </section>
    </motion.main>
  );
}
