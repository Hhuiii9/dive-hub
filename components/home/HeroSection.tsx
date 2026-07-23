"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { motion, useMotionValue, useSpring } from "framer-motion";
import { ArrowRight, Play, Waves } from "lucide-react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

// Sub-component for rising water bubble particles
const DeepOceanBubbles = () => {
  const [bubbles, setBubbles] = useState<Array<{
    id: number;
    x: number;
    size: number;
    delay: number;
    duration: number;
    drift: number;
  }>>([]);

  useEffect(() => {
    const generated = Array.from({ length: 28 }).map((_, i) => ({
      id: i,
      x: Math.random() * 100, // percentage left
      size: Math.random() * 5 + 2, // 2px to 7px diameter
      delay: Math.random() * 6,
      duration: Math.random() * 12 + 10, // slow, cinematic rise
      drift: Math.random() * 40 - 20, // horizontal drift
    }));
    setBubbles(generated);
  }, []);

  return (
    <div className="absolute inset-0 z-[3] overflow-hidden pointer-events-none">
      {bubbles.map((bubble) => (
        <motion.div
          key={bubble.id}
          className="absolute rounded-full bg-cyan-400/20 blur-[0.5px] border border-white/5"
          style={{
            left: `${bubble.x}%`,
            width: bubble.size,
            height: bubble.size,
            bottom: "-30px",
          }}
          animate={{
            y: ["0vh", "-115vh"],
            x: [0, bubble.drift, 0],
            opacity: [0, 0.6, 0.6, 0],
          }}
          transition={{
            duration: bubble.duration,
            repeat: Infinity,
            delay: bubble.delay,
            ease: "linear",
          }}
        />
      ))}
    </div>
  );
};

export default function HeroSection() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const videoContainerRef = useRef<HTMLDivElement>(null);

  // Mouse Parallax coordinates using Framer Motion springs
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const springConfig = { damping: 25, stiffness: 120, mass: 0.5 };
  const smoothX = useSpring(mouseX, springConfig);
  const smoothY = useSpring(mouseY, springConfig);

  useEffect(() => {
    // Force Autoplay on Mobile / Desktop safely
    const video = videoRef.current;
    if (video) {
      video.muted = true;
      video.defaultMuted = true;
      video.play().catch((err) => {
        console.log("Autoplay safety block:", err);
      });
    }

    // GSAP background scale-up on scroll
    gsap.registerPlugin(ScrollTrigger);

    if (videoContainerRef.current) {
      gsap.fromTo(
        videoContainerRef.current,
        { scale: 1, filter: "brightness(1) blur(0px)" },
        {
          scale: 1.15,
          filter: "brightness(0.6) blur(6px)",
          scrollTrigger: {
            trigger: containerRef.current,
            start: "top top",
            end: "bottom top",
            scrub: true,
          },
        }
      );
    }
  }, []);

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!containerRef.current) return;
    const { clientWidth, clientHeight } = containerRef.current;
    // Calculate offset from center (-0.5 to 0.5) and scale to pixels
    const x = (e.clientX / clientWidth - 0.5) * 35;
    const y = (e.clientY / clientHeight - 0.5) * 35;
    mouseX.set(x);
    mouseY.set(y);
  };

  const handleMouseLeave = () => {
    mouseX.set(0);
    mouseY.set(0);
  };

  return (
    <section
      ref={containerRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className="relative w-full min-h-screen overflow-hidden bg-[#03131d] text-white flex items-center justify-center"
    >
      {/* VIDEO CONTAINER - Managed by GSAP ScrollTrigger */}
      <div
        ref={videoContainerRef}
        className="absolute inset-0 w-full h-full origin-center select-none pointer-events-none"
      >
        <video
          ref={videoRef}
          autoPlay
          muted
          loop
          playsInline
          preload="auto"
          className="w-full h-full object-cover"
        >
          <source src="/videos/ocean-bg.mp4" type="video/mp4" />
          Your browser does not support the video tag.
        </video>
        {/* Soft immersive dark overlays */}
        <div className="absolute inset-0 bg-[#03131d]/60 z-[1]" />
        <div className="absolute inset-0 bg-gradient-to-b from-[#03131d]/40 via-transparent to-[#03131d] z-[2]" />
      </div>

      {/* Floating particles */}
      <DeepOceanBubbles />

      {/* FOREGROUND CONTENT - Parallax Linked */}
      <motion.div
        style={{ x: smoothX, y: smoothY }}
        className="relative z-10 w-full max-w-5xl mx-auto px-6 pt-32 pb-20 text-center flex flex-col items-center justify-center"
      >
        {/* Top Tagline */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1], delay: 0.2 }}
          className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 backdrop-blur-xl px-4 py-2"
        >
          <motion.span
            animate={{ scale: [1, 1.4, 1] }}
            transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
            className="h-1.5 w-1.5 rounded-full bg-cyan-400"
          />
          <p className="text-[9px] font-semibold uppercase tracking-[0.25em] text-cyan-200 sm:text-xs">
            Experience The Deep
          </p>
        </motion.div>

        {/* Large Cinematic Header */}
        <h1 className="mt-8 text-4xl sm:text-6xl md:text-8xl font-black uppercase tracking-[0.05em] leading-[0.95] text-white">
          <motion.span
            initial={{ opacity: 0, y: 40, filter: "blur(8px)" }}
            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            transition={{ duration: 1.4, ease: [0.16, 1, 0.3, 1], delay: 0.4 }}
            className="block"
          >
            Discover
          </motion.span>
          <motion.span
            initial={{ opacity: 0, y: 40, filter: "blur(8px)" }}
            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            transition={{ duration: 1.4, ease: [0.16, 1, 0.3, 1], delay: 0.6 }}
            className="block bg-gradient-to-r from-cyan-400 via-blue-200 to-cyan-200 bg-clip-text text-transparent font-extrabold"
          >
            The Deep
          </motion.span>
        </h1>

        {/* Sub-narrative */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 0.8, y: 0 }}
          transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1], delay: 0.8 }}
          className="mt-6 max-w-lg text-[13px] leading-6 sm:text-base sm:leading-8 font-light text-slate-200/90 tracking-wide"
        >
          Experience the extraordinary beneath the surface. Professional training, commercial expertise, and premium underwater exploration.
        </motion.p>

        {/* Buttons - Dual interactive layout */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1], delay: 1 }}
          className="mt-10 flex flex-col sm:flex-row gap-4 w-full sm:w-auto"
        >
          <Link
            href="/courses"
            className="group relative inline-flex items-center justify-center gap-2 overflow-hidden rounded-full bg-white px-8 py-4 text-xs font-black uppercase tracking-[0.2em] text-[#03131d] shadow-[0_4px_30px_rgba(255,255,255,0.15)] transition-all duration-300 hover:scale-105 hover:shadow-[0_10px_40px_rgba(34,211,238,0.4)] w-full sm:w-auto"
          >
            {/* Sliding background hover effect */}
            <span className="absolute inset-0 w-full h-full bg-gradient-to-r from-cyan-400 to-blue-400 opacity-0 group-hover:opacity-100 transition-opacity duration-500 z-0" />
            <span className="relative z-10 flex items-center gap-2 group-hover:text-white transition-colors duration-300">
              Explore
              <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
            </span>
          </Link>

          <Link
            href="/contact"
            className="group relative inline-flex items-center justify-center gap-2 overflow-hidden rounded-full border border-white/20 bg-white/5 px-8 py-4 text-xs font-black uppercase tracking-[0.2em] text-white backdrop-blur-md transition-all duration-300 hover:scale-105 hover:bg-white/10 hover:border-white/40 w-full sm:w-auto"
          >
            <span className="relative z-10 flex items-center gap-2">


              Contact Us
            </span>
          </Link>
        </motion.div>
      </motion.div>
    </section>
  );
}