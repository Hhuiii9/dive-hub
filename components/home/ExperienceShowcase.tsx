"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { 
  ArrowUpRight, 
  ShieldCheck, 
  Waves, 
  LifeBuoy, 
  Anchor, 
  BadgeCheck,
  HardHat,
  HeartPulse
} from "lucide-react";

const courses = [
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
      icon: LifeBuoy,
      title: "Rescue Diver",
      desc: "Learn to manage diving emergencies and become a highly capable dive partner.",
      image: "/images/course-4.jpg",
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
      image: "/images/course-7.JPG",
    }
  ];

export default function ExperienceShowcase() {
  const containerRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);

    const track = trackRef.current;
    const container = containerRef.current;
    if (!track || !container) return;

    const getScrollAmount = () => {
      return -(track.scrollWidth - window.innerWidth);
    };

    const pin = gsap.to(track, {
      x: getScrollAmount,
      ease: "none",
      scrollTrigger: {
        trigger: container,
        start: "top top",
        end: () => `+=${track.scrollWidth - window.innerWidth}`,
        pin: true,
        scrub: 1.2,
        invalidateOnRefresh: true,
      },
    });

    // Inner card image parallax synced specifically to the horizontal pin timeline
    const cards = track.querySelectorAll(".showcase-card-media");
    cards.forEach((card) => {
      gsap.fromTo(
        card,
        { x: "-10%" },
        {
          x: "10%",
          ease: "none",
          scrollTrigger: {
            trigger: card,
            containerAnimation: pin, // Crucial sync with horizontal motion!
            start: "left right",
            end: "right left",
            scrub: true,
          },
        }
      );
    });

    return () => {
      pin.scrollTrigger?.kill();
      pin.kill();
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className="relative w-full h-screen overflow-hidden bg-[#03131d]"
    >
      {/* SECTION LABEL (Floating Top-Left) */}
      <div className="absolute left-6 sm:left-12 top-10 sm:top-14 z-20 flex flex-col gap-2">
        <span className="text-[10px] font-black uppercase tracking-[0.3em] text-cyan-400">
          Experience Showcase
        </span>
        <h2 className="text-xl sm:text-3xl font-black uppercase tracking-wider text-white">
          Under the Surface
        </h2>
      </div>

      {/* HORIZONTAL TRACK SCROLLER */}
      <div
        ref={trackRef}
        className="flex h-full items-center pl-6 pr-[20vw] sm:pl-12 gap-8 sm:gap-12 flex-nowrap"
      >
        {courses.map((item, index) => {
          const IconComponent = item.icon;

          return (
            <div
              key={`${item.title}-${index}`}
              className="group relative flex-none w-[80vw] sm:w-[500px] h-[60vh] rounded-[2.5rem] overflow-hidden border border-white/10 bg-white/5 backdrop-blur-md cursor-pointer select-none shadow-[0_20px_50px_rgba(0,0,0,0.3)] transition-all duration-500 hover:border-cyan-500/30"
            >
              {/* The Media Box (Glides left/right inside the container) */}
              <div className="absolute inset-0 w-[120%] h-full left-0 showcase-card-media pointer-events-none select-none">
                <Image
                  src={item.image}
                  alt={item.title}
                  fill
                  sizes="(max-w-7xl) 40vw, 80vw"
                  className="object-cover brightness-[0.5] contrast-[1.1]"
                />
                {/* Inner card shadow gradients */}
                <div className="absolute inset-0 bg-gradient-to-t from-[#03131d]/90 via-transparent to-[#03131d]/30" />
              </div>

              {/* METADATA OVERLAYS */}
              <div className="relative z-10 p-8 sm:p-10 flex flex-col h-full justify-between">
                
                {/* Card Header tag */}
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-2 bg-white/10 backdrop-blur-xl border border-white/10 px-3 py-1.5 rounded-full text-cyan-300">
                    <IconComponent className="h-3.5 w-3.5" />
                    <span className="text-[9px] font-black uppercase tracking-[0.2em]">
                      {item.category}
                    </span>
                  </div>

                  <div className="flex h-10 w-10 items-center justify-center rounded-full border border-white/15 bg-black/20 text-white backdrop-blur-md transition-all duration-300 group-hover:bg-cyan-400 group-hover:text-slate-950 group-hover:border-transparent group-hover:rotate-45">
                    <ArrowUpRight className="h-4 w-4" />
                  </div>
                </div>

                {/* Card Footer details */}
                <div className="max-w-[360px] flex flex-col gap-2">
                  <h3 className="text-2xl font-black uppercase tracking-wide text-white leading-tight">
                    {item.title}
                  </h3>
                  <p className="text-xs sm:text-sm font-light text-slate-300 leading-relaxed opacity-80 group-hover:opacity-100 transition-opacity duration-300 line-clamp-3">
                    {item.desc}
                  </p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}