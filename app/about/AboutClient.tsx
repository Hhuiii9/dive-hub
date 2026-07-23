"use client";

import React, { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, useScroll, useTransform, useInView } from "framer-motion";
import {
  ShieldCheck,
  Award,
  Waves,
  Compass,
  ArrowRight,
  ChevronDown,
  VolumeX,
  Volume2,
  Calendar,
  Sparkles,
} from "lucide-react";

// Timeline Data
const timelineItems = [
  {
    year: "2015",
    title: "Foundation",
    desc: "Established Dive Hub & Marine Services with a vision to deliver world-class, safety-centric scuba training.",
  },
  {
    year: "2017",
    title: "Elite Training Academy",
    desc: "Certified over 2,000 divers and expanded programs to include rescue, emergency, and technical training.",
  },
  {
    year: "2019",
    title: "Marine Expansion",
    desc: "Launched our professional marine services division, offering underwater hull inspections, marine construction, and commercial salvage.",
  },
  {
    year: "2021",
    title: "ROV Innovation",
    desc: "Integrated state-of-the-art ROV deep-sea survey robotics for remote ocean floor exploration and subsea engineering inspections.",
  },
  {
    year: "2026",
    title: "Global Presence",
    desc: "Partnering with international marine agencies to lead deep ocean exploration, subsea structural maintenance, and conservation.",
  },
];

// Core Values Data
const values = [
  {
    icon: ShieldCheck,
    title: "Safety First",
    desc: "Zero-compromise safety protocols using military-grade redundant systems, strict checklist procedures, and elite guides.",
  },
  {
    icon: Award,
    title: "Excellence",
    desc: "Striving for peak operational perfection in elite training, industrial operations, and technical services.",
  },
  {
    icon: Waves,
    title: "Innovation",
    desc: "Leveraging advanced sonar sensors, deep-water cameras, and robotic ROVs to map and inspect subsea structures.",
  },
  {
    icon: Compass,
    title: "Exploration",
    desc: "Championing deep curiosity, mapping submerged caverns, and safeguarding precious marine ecosystems.",
  },
];

// Individual Timeline Card Component
const TimelineCard = ({ item, index }: { item: typeof timelineItems[0]; index: number }) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(cardRef, { once: true, margin: "-100px" });
  const isEven = index % 2 === 0;
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <div ref={cardRef} className="relative flex flex-col md:flex-row items-center justify-between w-full mb-16 md:mb-24">
      {/* Space for Timeline line spacer */}
      <div className="w-full md:w-5/12 hidden md:block" />

      {/* Dynamic central node */}
      <div className="absolute left-4 md:left-1/2 -translate-x-1/2 flex items-center justify-center z-10">
        <motion.div
          initial={{ scale: 0 }}
          animate={isInView ? { scale: 1 } : { scale: 0 }}
          transition={{ type: "spring", stiffness: 100, delay: 0.1 }}
          className="h-8 w-8 rounded-full border-2 border-cyan-400 bg-[#03131d] shadow-[0_0_15px_#22d3ee] flex items-center justify-center"
        >
          <div className="h-2 w-2 rounded-full bg-cyan-400" />
        </motion.div>
      </div>

      {/* Card Body */}
      <motion.div
        initial={{ opacity: 0, x: isMobile ? 0 : (isEven ? 50 : -50), y: 30, filter: "blur(8px)" }}
        animate={isInView ? { opacity: 1, x: 0, y: 0, filter: "blur(0px)" } : {}}
        transition={{ type: "spring", stiffness: 50, damping: 15, duration: 0.8 }}
        className={`w-full md:w-5/12 pl-12 md:pl-0 ${isEven ? "md:order-last" : "md:order-first md:text-right"}`}
      >
        <div className="group relative overflow-hidden rounded-3xl border border-white/10 bg-white/[0.04] backdrop-blur-xl p-8 hover:border-cyan-400/30 hover:shadow-[0_15px_40px_rgba(6,182,212,0.15)] transition-all duration-500">
          <div className={`flex items-center gap-3 mb-4 ${isEven ? "justify-start" : "justify-start md:justify-end"}`}>
            <span className="text-xs font-black tracking-widest text-cyan-400 bg-cyan-950/40 px-3 py-1 rounded-full border border-cyan-400/20">
              {item.year}
            </span>
            <Calendar className="h-4 w-4 text-cyan-400/60" />
          </div>
          <h3 className="text-2xl font-black uppercase tracking-wider text-white mb-3 group-hover:text-cyan-300 transition-colors duration-300">
            {item.title}
          </h3>
          <p className="text-base text-slate-300 font-light leading-relaxed">
            {item.desc}
          </p>
        </div>
      </motion.div>
    </div>
  );
};

// Core Value Card Component
const ValueCard = ({ item, index }: { item: typeof values[0]; index: number }) => {
  const [mouseCoords, setMouseCoords] = useState({ x: 0, y: 0 });
  const Icon = item.icon;

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setMouseCoords({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 60, scale: 0.94 }}
      whileInView={{ opacity: 1, y: 0, scale: 1 }}
      viewport={{ once: true, margin: "-100px" }}
      transition={{ duration: 0.8, delay: index * 0.15, ease: "easeOut" }}
      onMouseMove={handleMouseMove}
      whileHover={{ y: -12, scale: 1.03 }}
      className="group relative overflow-hidden rounded-[32px] border border-white/10 bg-white/[0.04] backdrop-blur-xl p-8 md:p-10 shadow-[0_24px_60px_rgba(0,0,0,0.5)] hover:border-cyan-400/30 hover:shadow-[0_20px_50px_rgba(6,182,212,0.15)] transition-all duration-500 cursor-pointer flex flex-col justify-between h-full"
    >
      <div
        className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none z-0"
        style={{
          background: `radial-gradient(350px circle at ${mouseCoords.x}px ${mouseCoords.y}px, rgba(34, 211, 238, 0.14), transparent 80%)`,
        }}
      />

      <div className="relative z-10 flex flex-col gap-6">
        {/* Glow Icon */}
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/10 border border-white/20 text-white transition-all duration-500 group-hover:scale-110 group-hover:bg-cyan-500/20 group-hover:border-cyan-400/40 group-hover:text-cyan-400">
          <Icon className="h-7 w-7 transition-transform duration-700 group-hover:rotate-[360deg]" />
        </div>

        {/* Details */}
        <div className="flex flex-col gap-3">
          <h3 className="text-xl md:text-2xl font-black uppercase tracking-wider text-white">
            {item.title}
          </h3>
          <p className="text-sm md:text-base text-slate-300 font-light leading-relaxed">
            {item.desc}
          </p>
        </div>
      </div>
    </motion.div>
  );
};

export default function AboutClient() {
  const [muted, setMuted] = useState(true);
  const heroRef = useRef<HTMLDivElement>(null);
  const storyRef = useRef<HTMLDivElement>(null);
  const timelineContainerRef = useRef<HTMLDivElement>(null);
  const videoShowcaseRef = useRef<HTMLDivElement>(null);

  const isHeroInView = useInView(heroRef, { once: false, amount: 0.1 });
  const isStoryInView = useInView(storyRef, { once: true, margin: "-100px" });
  const isVideoShowcaseInView = useInView(videoShowcaseRef, { once: false, amount: 0.1 });

  const heroVideoRef = useRef<HTMLVideoElement>(null);
  const showcaseVideoRef = useRef<HTMLVideoElement>(null);

  // Scroll animations for parallax and timeline growth
  const { scrollYProgress: timelineScroll } = useScroll({
    target: timelineContainerRef,
    offset: ["start end", "end start"],
  });
  const timelineScaleY = useTransform(timelineScroll, [0.15, 0.85], [0, 1]);

  const { scrollYProgress: heroScroll } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"],
  });
  const heroVideoScale = useTransform(heroScroll, [0, 1], [1, 1.12]);
  const heroTextY = useTransform(heroScroll, [0, 1], [0, 80]);
  const heroTextOpacity = useTransform(heroScroll, [0, 0.7], [1, 0]);

  // Handle playing/pausing of videos based on visibility
  useEffect(() => {
    const video = heroVideoRef.current;
    if (video) {
      if (isHeroInView) {
        video.play().catch(() => {});
      } else {
        video.pause();
      }
    }
  }, [isHeroInView]);

  useEffect(() => {
    const video = showcaseVideoRef.current;
    if (video) {
      if (isVideoShowcaseInView) {
        video.play().catch(() => {});
      } else {
        video.pause();
      }
    }
  }, [isVideoShowcaseInView]);

  // Title Splitting for Apple-level blur reveal
  const titleWords = "DISCOVER OUR STORY".split(" ");

  // Particles for Hero
  const particles = Array.from({ length: 24 });

  return (
    <main className="w-full bg-[#03131d] overflow-x-hidden text-white font-sans selection:bg-cyan-500/30">

      {/* SECTION 1 — CINEMATIC HERO (100vh) */}
      <section
        ref={heroRef}
        className="relative h-screen w-full flex items-center justify-center text-center overflow-hidden"
      >
        {/* Full-screen Background Video */}
        <motion.div
          style={{ scale: heroVideoScale }}
          className="absolute inset-0 w-full h-full pointer-events-none z-0"
        >
          <video
            ref={heroVideoRef}
            src="/videos/about-bg.mp4"
            muted={muted}
            loop
            playsInline
            className="w-full h-full object-cover opacity-60"
          >
            <source src="/about-bg.mp4" type="video/mp4" />
            <source src="/videos/ocean-bg.mp4" type="video/mp4" />
            <source src="/ocean-bg1.mp4" type="video/mp4" />
          </video>
        </motion.div>

        {/* Cinematic dark theme overlay */}
        <div
          className="absolute inset-0 z-10 pointer-events-none"
          style={{
            background:
              "linear-gradient(180deg, rgba(3, 19, 29, 0.45) 0%, rgba(3, 19, 29, 0.9) 100%)",
          }}
        />

        {/* Ambient floating bio-particles */}
        <div className="absolute inset-0 pointer-events-none z-10 overflow-hidden">
          {isHeroInView &&
            particles.map((_, i) => (
              <motion.div
                key={i}
                initial={{
                  x: `${Math.random() * 100}%`,
                  y: "110dvh",
                  opacity: Math.random() * 0.4 + 0.1,
                  scale: Math.random() * 0.6 + 0.3,
                }}
                animate={{
                  y: "-10dvh",
                  x: [
                    null,
                    `${Math.random() * 16 - 8}%`,
                    `${Math.random() * 16 - 8}%`,
                  ],
                }}
                transition={{
                  duration: Math.random() * 15 + 10,
                  repeat: Infinity,
                  ease: "linear",
                  delay: Math.random() * 10,
                }}
                className="absolute w-2.5 h-2.5 rounded-full bg-cyan-400/20 blur-[1px]"
              />
            ))}
        </div>

        {/* Foreground Content */}
        <motion.div
          style={{ y: heroTextY, opacity: heroTextOpacity }}
          className="relative z-20 max-w-4xl mx-auto px-6 flex flex-col gap-6 items-center"
        >
          <motion.span
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="text-xs font-black uppercase tracking-[0.45em] text-cyan-400 drop-shadow-[0_2px_10px_rgba(34,211,238,0.25)] flex items-center gap-2"
          >
            <Sparkles className="h-3.5 w-3.5" />
            ABOUT US
          </motion.span>

          {/* Letter Reveal Stagger Title */}
          <h1 className="text-5xl sm:text-7xl md:text-8xl font-black uppercase tracking-tight leading-none text-white drop-shadow-[0_12px_30px_rgba(0,0,0,0.85)] flex flex-wrap justify-center gap-x-4">
            {titleWords.map((word, wIdx) => (
              <motion.span
                key={wIdx}
                initial={{ opacity: 0, y: 40, filter: "blur(10px)" }}
                animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                transition={{
                  duration: 0.9,
                  delay: wIdx * 0.15,
                  ease: [0.16, 1, 0.3, 1],
                }}
              >
                {word}
              </motion.span>
            ))}
          </h1>

          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.0, delay: 0.5, ease: "easeOut" }}
            className="text-base sm:text-xl text-slate-200 font-light leading-relaxed max-w-2xl drop-shadow-[0_4px_8px_rgba(0,0,0,0.6)]"
          >
            Experience the world beneath the surface through premium training, exploration, and marine excellence.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1.0, delay: 0.75 }}
            className="mt-10 flex flex-wrap gap-4 justify-center items-center"
          >
            <button
              onClick={() => {
                storyRef.current?.scrollIntoView({ behavior: "smooth" });
              }}
              className="group/btn inline-flex items-center gap-3 rounded-full border border-cyan-400/40 bg-cyan-950/20 px-8 py-4 text-xs font-black uppercase tracking-[0.25em] text-cyan-400 backdrop-blur-md transition-all duration-300 hover:bg-cyan-400 hover:text-[#03131d] shadow-[0_0_20px_rgba(34,211,238,0.25)] hover:shadow-[0_0_35px_rgba(34,211,238,0.5)]"
            >
              Explore Journey
              <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover/btn:translate-x-1.5" />
            </button>
          </motion.div>
        </motion.div>

        {/* Video mute/unmute control */}
        <button
          onClick={() => setMuted(!muted)}
          className="absolute bottom-10 right-10 z-30 flex h-12 w-12 items-center justify-center rounded-full border border-white/20 bg-black/35 text-white backdrop-blur-md hover:border-cyan-400/40 hover:text-cyan-400 hover:scale-110 transition-all duration-300 shadow-[0_4px_12px_rgba(0,0,0,0.3)]"
          aria-label={muted ? "Unmute video" : "Mute video"}
        >
          {muted ? <VolumeX className="h-5 w-5" /> : <Volume2 className="h-5 w-5" />}
        </button>

        {/* Scroll Indicator */}
        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 z-20 flex flex-col items-center gap-2 pointer-events-none opacity-60">
          <span className="text-[9px] font-black uppercase tracking-[0.3em] text-white/50">
            SCROLL DOWN
          </span>
          <motion.div
            animate={{ y: [0, 8, 0] }}
            transition={{ duration: 1.5, repeat: Infinity }}
          >
            <ChevronDown className="h-4 w-4 text-white" />
          </motion.div>
        </div>
      </section>

      {/* SECTION 2 — OUR STORY (100vh) */}
      <section
        ref={storyRef}
        className="relative min-h-screen md:h-screen w-full flex items-center justify-center bg-[#03131d] py-20 px-6 sm:px-12 z-20 overflow-hidden"
      >
        <div className="max-w-7xl w-full mx-auto grid grid-cols-1 md:grid-cols-12 gap-12 md:gap-16 items-center">
          
          {/* Left Column: Shutter-reveal image */}
          <div className="md:col-span-6 relative w-full h-[400px] md:h-[600px] rounded-[32px] overflow-hidden group">
            {/* Shutter reveal layer */}
            <motion.div
              initial={{ x: "0%" }}
              whileInView={{ x: "100%" }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 1.1, ease: [0.77, 0, 0.175, 1] }}
              className="absolute inset-0 bg-cyan-400 z-10"
            />
            
            <motion.div
              initial={{ scale: 1.15 }}
              whileInView={{ scale: 1 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 1.2, ease: "easeOut" }}
              className="w-full h-full"
            >
              <Image
                src="/images/about-diver1.jpg"
                alt="Elite diver swimming in blue ocean"
                fill
                className="object-cover transition-transform duration-1000 group-hover:scale-105"
                sizes="(max-width: 768px) 100vw, 50vw"
                priority
              />
            </motion.div>
            
            {/* Deep overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-[#03131d] via-[#03131d]/20 to-transparent z-5" />
          </div>

          {/* Right Column: Premium glass storytelling card */}
          <motion.div
            initial={{ opacity: 0, y: 60 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.9, delay: 0.2 }}
            className="md:col-span-6"
          >
            <div className="relative overflow-hidden rounded-[32px] border border-white/10 bg-white/[0.04] backdrop-blur-xl p-8 sm:p-12 shadow-[0_24px_80px_rgba(0,0,0,0.6)]">
              <span className="text-xs font-black uppercase tracking-[0.4em] text-cyan-400 mb-4 block">
                WHO WE ARE
              </span>
              <h2 className="text-4xl sm:text-5xl font-black uppercase tracking-tight text-white mb-6 leading-none">
                OUR STORY
              </h2>
              <div className="flex flex-col gap-5 text-slate-300 font-light text-base leading-relaxed">
                <p>
                  Founded with an insatiable passion for deep marine ecosystems and underwater engineering, Dive Hub & Marine Services merges specialized offshore subsea construction with elite tactical diving education. We exist to map the unexplored, support ocean professionals globally, and provide certified services.
                </p>
                <p>
                  Our curriculum combines rigorous military-level safety margins with highly artistic ocean exploration and rescue diving certifications. Every dive is an execution of discipline, cutting-edge technology, and pure marine awe.
                </p>
              </div>

              {/* Minimal stats block within story */}
              <div className="grid grid-cols-3 gap-4 mt-8 pt-8 border-t border-white/10">
                <div>
                  <h4 className="text-2xl sm:text-3xl font-black text-cyan-400">10+</h4>
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">YEARS</p>
                </div>
                <div>
                  <h4 className="text-2xl sm:text-3xl font-black text-cyan-400">2K+</h4>
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">DIVERS</p>
                </div>
                <div>
                  <h4 className="text-2xl sm:text-3xl font-black text-cyan-400">99.9%</h4>
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">SAFETY</p>
                </div>
              </div>
            </div>
          </motion.div>

        </div>
      </section>

      {/* SECTION 3 — EXPERIENCE TIMELINE */}
      <section
        ref={timelineContainerRef}
        className="relative w-full py-24 md:py-36 px-6 sm:px-12 bg-[#03131d] z-20 overflow-hidden"
      >
        <div className="max-w-4xl mx-auto text-center mb-20">
          <span className="text-xs font-black uppercase tracking-[0.4em] text-cyan-400">
            CHRONICLES
          </span>
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-black uppercase tracking-tight text-white mt-4 drop-shadow-[0_4px_10px_rgba(0,0,0,0.5)]">
            JOURNEY TIMELINE
          </h2>
        </div>

        {/* Timeline body */}
        <div className="relative max-w-5xl mx-auto">
          {/* Vertical central tracking line */}
          <div className="absolute left-4 md:left-1/2 top-0 bottom-0 -translate-x-1/2 w-[2px] bg-white/10">
            <motion.div
              style={{ scaleY: timelineScaleY, originY: 0 }}
              className="w-full h-full bg-cyan-400 shadow-[0_0_15px_#22d3ee] rounded-full"
            />
          </div>

          {timelineItems.map((item, index) => (
            <TimelineCard key={index} item={item} index={index} />
          ))}
        </div>
      </section>

      {/* SECTION 4 — OUR VALUES */}
      <section className="relative w-full py-24 px-6 sm:px-12 bg-[#03131d] z-20 overflow-hidden border-t border-white/5">
        <div className="max-w-7xl mx-auto">
          
          <div className="text-center max-w-3xl mx-auto mb-20">
            <span className="text-xs font-black uppercase tracking-[0.45em] text-cyan-400">
              GUIDING VALUES
            </span>
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-black uppercase tracking-tight text-white mt-4">
              CORE PRINCIPLES
            </h2>
            <p className="text-sm md:text-base text-slate-400 font-light mt-4 max-w-xl mx-auto">
              Our culture builds upon technical excellence, strict tactical marine standards, and environmental stewardship.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {values.map((item, index) => (
              <ValueCard key={index} item={item} index={index} />
            ))}
          </div>

        </div>
      </section>

      {/* SECTION 6 — CTA */}
      <section className="relative w-full py-24 md:py-36 px-6 sm:px-12 bg-[#03131d] z-20 overflow-hidden border-t border-white/5">
        
        {/* Glowing Spotlight Overlay */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(34,211,238,0.06)_0%,transparent_70%)] pointer-events-none z-0" />

        <div className="max-w-4xl mx-auto text-center relative z-10 flex flex-col gap-6 items-center">
          <motion.span
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
            className="text-xs font-black uppercase tracking-[0.45em] text-cyan-400"
          >
            JOIN OUR SQUADRON
          </motion.span>

          <motion.h2
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.9, delay: 0.1 }}
            className="text-4xl sm:text-6xl font-black uppercase tracking-tight text-white leading-none"
          >
            READY TO DIVE WITH US?
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 25 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.9, delay: 0.2 }}
            className="text-base sm:text-lg text-slate-300 font-light max-w-xl leading-relaxed"
          >
            Connect with our expert academy, enroll in high-end certifications, or charter bespoke marine support solutions.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 1.0, delay: 0.35 }}
            className="mt-8 flex flex-wrap gap-4 justify-center"
          >
            <Link
              href="/courses"
              className="group inline-flex items-center gap-3 rounded-full border border-cyan-400/40 bg-cyan-950/20 px-8 py-4 text-xs font-black uppercase tracking-[0.25em] text-cyan-400 backdrop-blur-md transition-all duration-300 hover:bg-cyan-400 hover:text-[#03131d] shadow-[0_0_20px_rgba(34,211,238,0.25)] hover:shadow-[0_0_35px_rgba(34,211,238,0.55)]"
            >
              Explore Courses
              <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1.5" />
            </Link>
            
            <Link
              href="/contact"
              className="group inline-flex items-center gap-3 rounded-full border border-white/20 bg-white/5 hover:bg-white/10 px-8 py-4 text-xs font-black uppercase tracking-[0.25em] text-white backdrop-blur-md transition-all duration-300"
            >
              Contact Us
            </Link>
          </motion.div>
        </div>
      </section>

    </main>
  );
}
