"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

export function WhoWeAre() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Fade in the whole section
      gsap.fromTo(
        ".reveal-text",
        { opacity: 0, y: 20 },
        { 
          opacity: 1, 
          y: 0, 
          duration: 1, 
          stagger: 0.2,
          ease: "power3.out",
          scrollTrigger: {
            trigger: sectionRef.current,
            start: "top 70%",
          }
        }
      );

      // Founders name highlight animation
      gsap.fromTo(
        ".founder-name",
        { backgroundSize: "0% 100%" },
        {
          backgroundSize: "100% 100%",
          duration: 1.2,
          ease: "power2.inOut",
          scrollTrigger: {
            trigger: sectionRef.current,
            start: "top 60%",
          }
        }
      );
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section ref={sectionRef} className="relative py-32 overflow-hidden border-y border-white/5">
      {/* Background accents */}
      <div className="absolute inset-0 opacity-20 pointer-events-none" style={{
        backgroundImage: `
          radial-gradient(circle at 20% 30%, rgba(0, 255, 245, 0.05) 0%, transparent 50%),
          radial-gradient(circle at 80% 70%, rgba(255, 0, 255, 0.05) 0%, transparent 50%)
        `
      }} />

      <div className="relative z-10 max-w-5xl mx-auto px-6">
        <div className="flex flex-col items-center text-center">
          {/* Badge/Label */}
          <div className="reveal-text inline-flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 rounded-full mb-8">
            <span className="w-1.5 h-1.5 bg-cyan-400 rounded-full animate-pulse" />
            <span className="text-cyan-400 text-xs font-bold tracking-[0.2em] uppercase">About TxNB</span>
          </div>

          {/* Main content */}
          <div className="space-y-8">
            <h2 className="reveal-text text-3xl md:text-5xl lg:text-6xl font-black text-white leading-tight">
              TxNB Studios is an <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">independent</span> game studio focused on competitive multiplayer experiences.
            </h2>
            
            <p className="reveal-text text-xl md:text-2xl text-gray-400 font-medium max-w-3xl mx-auto leading-relaxed">
              Founded by <span className=" founder-name inline-block px-2 text-white bg-gradient-to-r from-cyan-500/20 to-magenta-500/20 bg-no-repeat bg-left transition-all duration-1000">Raghav Mathur</span>, 
              we combine design, storytelling, and technology to create unforgettable games.
            </p>
          </div>

          {/* Decorative bottom line */}
          <div className="reveal-text mt-16 flex items-center gap-4">
            <div className="h-px w-24 bg-gradient-to-r from-transparent via-cyan-400/30 to-transparent" />
            <div className="flex gap-1">
              {[1, 2, 3].map((i) => (
                <div key={i} className="w-1 h-1 rotate-45 border border-cyan-400/50" />
              ))}
            </div>
            <div className="h-px w-24 bg-gradient-to-r from-transparent via-magenta-500/30 to-transparent" />
          </div>
        </div>
      </div>
    </section>
  );
}
