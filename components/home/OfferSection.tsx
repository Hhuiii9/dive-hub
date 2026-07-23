"use client";

import React, { useEffect, useRef, useState } from "react";
import { motion, useInView } from "framer-motion";
import { ArrowRight } from "lucide-react";
import Link from "next/link";

type Bubble = {
  id: number;
  left: string;
  size: number;
  delay: number;
  duration: number;
  opacity: number;
};

export default function OfferSection() {
  const sectionRef = useRef<HTMLDivElement>(null);

  const isInView = useInView(sectionRef, {
    once: false,
    amount: 0.25,
  });

  const [mounted, setMounted] = useState(false);
  const [bubbles, setBubbles] = useState<Bubble[]>([]);

  useEffect(() => {
    setMounted(true);

    setBubbles(
      Array.from({ length: 22 }).map((_, i) => ({
        id: i,
        left: `${Math.random() * 100}%`,
        size: Math.random() * 8 + 4,
        delay: Math.random() * 8,
        duration: Math.random() * 10 + 10,
        opacity: Math.random() * 0.35 + 0.12,
      }))
    );
  }, []);

  return (
    <section
      ref={sectionRef}
      className="relative min-h-screen w-full overflow-hidden bg-[#03131d] px-6 text-white"
    >
      {/* Background Video */}
      <motion.div
        animate={{
          scale: isInView ? 1.08 : 1,
        }}
        transition={{
          duration: 18,
          ease: "linear",
          repeat: Infinity,
          repeatType: "reverse",
        }}
        className="absolute inset-0 z-0 h-full w-full"
      >
        <video
          src="/ocean-bg1.mp4"
          autoPlay
          muted
          loop
          playsInline
          preload="auto"
          className="h-full w-full object-cover opacity-65"
        />
      </motion.div>

      {/* Dark Premium Overlay */}
      <div className="absolute inset-0 z-10 bg-gradient-to-b from-[#03131d]/30 via-[#03131d]/65 to-[#03131d]" />

      {/* Side Glow */}
      <div className="absolute left-[-120px] top-1/3 z-10 h-[340px] w-[340px] rounded-full bg-cyan-400/20 blur-[120px]" />
      <div className="absolute right-[-140px] bottom-1/4 z-10 h-[360px] w-[360px] rounded-full bg-blue-500/20 blur-[130px]" />

      {/* Bubbles */}
      {mounted && (
        <div className="pointer-events-none absolute inset-0 z-10 overflow-hidden">
          {bubbles.map((bubble) => (
            <motion.span
              key={bubble.id}
              initial={{
                y: "110vh",
                opacity: 0,
              }}
              animate={
                isInView
                  ? {
                      y: "-10vh",
                      opacity: [0, bubble.opacity, 0],
                    }
                  : {
                      y: "110vh",
                      opacity: 0,
                    }
              }
              transition={{
                duration: bubble.duration,
                delay: bubble.delay,
                repeat: Infinity,
                ease: "linear",
              }}
              style={{
                left: bubble.left,
                width: `${bubble.size}px`,
                height: `${bubble.size}px`,
              }}
              className="absolute bottom-0 rounded-full bg-cyan-300/40 blur-[1px]"
            />
          ))}
        </div>
      )}

      {/* Content */}
      <div className="relative z-20 mx-auto flex min-h-screen max-w-5xl flex-col items-center justify-center text-center">
        <motion.span
          initial={{
            opacity: 0,
            y: 30,
            filter: "blur(8px)",
          }}
          animate={
            isInView
              ? {
                  opacity: 1,
                  y: 0,
                  filter: "blur(0px)",
                }
              : {
                  opacity: 0,
                  y: 30,
                  filter: "blur(8px)",
                }
          }
          transition={{ duration: 0.8 }}
          className="mb-6 text-xs font-black uppercase tracking-[0.45em] text-cyan-300"
        >
          Discover The Deep
        </motion.span>

        <motion.h1
          initial={{
            opacity: 0,
            y: 60,
            scale: 0.95,
            filter: "blur(14px)",
          }}
          animate={
            isInView
              ? {
                  opacity: 1,
                  y: 0,
                  scale: 1,
                  filter: "blur(0px)",
                }
              : {
                  opacity: 0,
                  y: 60,
                  scale: 0.95,
                  filter: "blur(14px)",
                }
          }
          transition={{
            duration: 1.1,
            ease: [0.16, 1, 0.3, 1],
          }}
          className="text-5xl font-black uppercase leading-none tracking-tight sm:text-7xl md:text-8xl lg:text-9xl"
        >
          What We Offer
        </motion.h1>

        <motion.p
          initial={{
            opacity: 0,
            y: 35,
            filter: "blur(8px)",
          }}
          animate={
            isInView
              ? {
                  opacity: 1,
                  y: 0,
                  filter: "blur(0px)",
                }
              : {
                  opacity: 0,
                  y: 35,
                  filter: "blur(8px)",
                }
          }
          transition={{
            duration: 1,
            delay: 0.18,
          }}
          className="mt-8 max-w-2xl text-base font-light leading-relaxed text-slate-200 sm:text-xl"
        >
          Premium underwater services, diving experiences, and marine solutions
          crafted for unforgettable ocean adventures.
        </motion.p>

        <motion.div
          initial={{
            opacity: 0,
            y: 25,
            scale: 0.9,
          }}
          animate={
            isInView
              ? {
                  opacity: 1,
                  y: 0,
                  scale: 1,
                }
              : {
                  opacity: 0,
                  y: 25,
                  scale: 0.9,
                }
          }
          transition={{
            duration: 0.9,
            delay: 0.35,
          }}
          className="mt-10"
        >
          <Link href="/what-we-offer" className="group inline-flex items-center gap-3 rounded-full border border-cyan-300/40 bg-cyan-950/25 px-8 py-4 text-xs font-black uppercase tracking-[0.25em] text-cyan-300 backdrop-blur-xl transition-all duration-300 hover:bg-cyan-300 hover:text-[#03131d] hover:shadow-[0_0_35px_rgba(103,232,249,0.55)]">
            Explore Services
            <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-2" />
          </Link>
        </motion.div>
      </div>
    </section>
  );
}