"use client";

import { useRef, useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, useScroll, useTransform } from "framer-motion";
import { ArrowRight, ShieldCheck, Award, Waves } from "lucide-react";

const features = [
  { icon: ShieldCheck, title: "Safety First", desc: "Rigorous standards for all ocean operations." },
  { icon: Award, title: "Certified Trainers", desc: "Expert instructors guiding every depth." },
  { icon: Waves, title: "Modern Equipment", desc: "Top-tier diving gear and technical support." },
];

export default function AboutPreview() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 1024);
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);
  
  // Track scroll progression specifically for this section
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"],
  });

  // Map scroll progress to cinematic transformations, scaled down on mobile to prevent overflow
  const imageY = useTransform(scrollYProgress, [0, 1], isMobile ? [-20, 20] : [-80, 80]);
  const imageScale = useTransform(scrollYProgress, [0, 0.45], [1.18, 1]);
  const imageBlur = useTransform(scrollYProgress, [0, 0.45], ["blur(25px)", "blur(0px)"]);
  const imageOpacity = useTransform(scrollYProgress, [0, 0.4], [0, 1]);
  
  const floatingBadgeY = useTransform(scrollYProgress, [0, 1], isMobile ? [15, -15] : [60, -60]);
  const textY = useTransform(scrollYProgress, [0, 0.5], isMobile ? [0, 0] : [40, 0]);

  return (
    <section
      ref={containerRef}
      className="relative overflow-hidden bg-[#03131d] px-6 py-20 text-white sm:px-8 sm:py-28 md:py-36"
    >
      {/* Decorative ambient glowing backdrops */}
      <div className="absolute left-[-10%] top-[20%] h-[400px] w-[400px] rounded-full bg-cyan-500/5 blur-[120px] pointer-events-none" />
      <div className="absolute right-[-10%] bottom-[10%] h-[450px] w-[450px] rounded-full bg-blue-500/5 blur-[120px] pointer-events-none" />

      <div className="relative z-10 mx-auto max-w-7xl grid gap-14 lg:grid-cols-2 lg:gap-20 items-center">
        
        {/* LEFT COLUMN: STORYTELLING */}
        <motion.div
          style={{ y: textY }}
          className="flex flex-col items-start order-2 lg:order-1"
        >
          <span className="text-[10px] font-black uppercase tracking-[0.3em] text-cyan-400">
            About Dive Hub & Marine Services
          </span>

          <h2 className="mt-4 text-3xl sm:text-5xl md:text-6xl font-black uppercase tracking-tight leading-[0.98] text-white">
            Trusted Diving &
            <span className="block bg-gradient-to-r from-cyan-400 to-blue-300 bg-clip-text text-transparent">
              Marine Experts
            </span>
          </h2>

          <p className="mt-6 text-sm sm:text-base leading-7 sm:leading-8 font-light text-slate-300 tracking-wide">
            Dive Hub & Marine Services provides elite scuba diving training, commercial diving credentials, underwater engineering, and comprehensive marine solutions for hobbyists and offshore agencies alike.
          </p>

          <p className="mt-4 text-sm leading-7 font-light text-slate-400/80">
            Our mission is defined by strict safety protocols, advanced navigation systems, and crafting unforgettable underwater journeys guided by seasoned commercial divers.
          </p>

          {/* Luxury glassmorphic feature rows */}
          <div className="mt-10 grid gap-3 w-full max-w-md">
            {features.map((item, index) => {
              const Icon = item.icon;

              return (
                <motion.div
                  key={index}
                  whileHover={{ x: 6, backgroundColor: "rgba(255, 255, 255, 0.08)" }}
                  className="flex items-center gap-4 rounded-2xl border border-white/5 bg-white/[0.03] p-4 backdrop-blur-xl transition-all duration-300"
                >
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-cyan-500/10 border border-cyan-400/20">
                    <Icon className="h-5 w-5 text-cyan-300" />
                  </div>

                  <div>
                    <h3 className="text-xs sm:text-sm font-black uppercase tracking-widest text-white">
                      {item.title}
                    </h3>
                    <p className="text-[10px] sm:text-xs font-light text-slate-400 mt-0.5">
                      {item.desc}
                    </p>
                  </div>
                </motion.div>
              );
            })}
          </div>

          <div className="mt-10">
            <Link
              href="/about"
              className="group inline-flex items-center gap-2 rounded-full border border-cyan-500/30 bg-cyan-500/10 px-8 py-4 text-xs font-black uppercase tracking-[0.2em] text-cyan-300 transition-all duration-300 hover:scale-105 hover:bg-cyan-500 hover:text-slate-950"
            >
              Learn More
              <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
            </Link>
          </div>
        </motion.div>

        {/* RIGHT COLUMN: DEPTH-ILLUSION IMAGE CONTAINER */}
        <div className="relative order-1 lg:order-2 flex justify-center items-center">
          
          {/* Subtle under-image background halo */}
          <div className="absolute inset-0 rounded-[2rem] bg-gradient-to-tr from-cyan-500/10 to-blue-500/5 blur-2xl z-0" />

          {/* Interactive Parallax Frame */}
          <motion.div
            style={{
              y: imageY,
              scale: imageScale,
              filter: imageBlur,
              opacity: imageOpacity,
            }}
            className="relative w-full max-w-[500px] aspect-[4/5] overflow-hidden rounded-[2.5rem] border border-white/10 shadow-[0_20px_50px_rgba(2,13,27,0.4)] z-10"
          >
            {/* The Background Layer Image */}
            <Image
              src="/images/about-diver.jpg"
              alt="Diver descending into the ocean"
              fill
              sizes="(max-width: 1024px) 100vw, 50vw"
              priority
              className="object-cover scale-[1.05]"
            />
            {/* Dark glass tint overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-[#03131d]/60 via-transparent to-transparent" />
          </motion.div>

          {/* Floating Depth-Illusion Luxury Glass Card */}
          <motion.div
            style={{ y: floatingBadgeY }}
            className="absolute bottom-6 left-6 right-6 sm:-left-6 sm:right-auto sm:bottom-12 z-20 max-w-[280px] rounded-2xl border border-white/15 bg-[#03131d]/75 p-5 shadow-[0_15px_35px_rgba(0,0,0,0.3)] backdrop-blur-2xl"
          >
            <span className="text-[9px] font-black uppercase tracking-[0.25em] text-cyan-400">
              Underwater Excellence
            </span>
            <h3 className="mt-1 text-lg font-bold text-white leading-tight">
              Dive Beyond Conventional Limits
            </h3>
            <p className="mt-2 text-[10px] font-light text-slate-400 leading-normal">
              Safe training and offshore support for marine industries.
            </p>
          </motion.div>
        </div>
      </div>
    </section>
  );
}