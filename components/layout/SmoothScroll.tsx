"use client";

import { useEffect } from "react";
import Lenis from "lenis";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

export default function SmoothScroll({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    // Only run on client-side
    gsap.registerPlugin(ScrollTrigger);

    const lenis = new Lenis({
      duration: 1.4,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      orientation: "vertical",
      gestureOrientation: "vertical",
      smoothWheel: true,
      wheelMultiplier: 1.0,
      touchMultiplier: 1.2,
    });

    // Notify ScrollTrigger to update on Lenis scroll events
    lenis.on("scroll", () => {
      ScrollTrigger.update();
    });

    // Integrate Lenis raf loop into the GSAP ticker
    const gsapTicker = (time: number) => {
      lenis.raf(time * 1000);
    };
    
    gsap.ticker.add(gsapTicker);
    gsap.ticker.lagSmoothing(0);

    return () => {
      lenis.destroy();
      gsap.ticker.remove(gsapTicker);
      ScrollTrigger.killAll();
    };
  }, []);

  return <>{children}</>;
}
