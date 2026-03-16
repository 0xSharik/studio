"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Mail } from "lucide-react";

gsap.registerPlugin(ScrollTrigger);

export function StayUpdated() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(
        containerRef.current,
        { opacity: 0, y: 30 },
        {
          opacity: 1,
          y: 0,
          duration: 0.8,
          ease: "power2.out",
          scrollTrigger: {
            trigger: sectionRef.current,
            start: "top 80%",
          },
        }
      );
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Logic for subscription can be added here
    alert("Thank you for subscribing!");
  };

  return (
    <section ref={sectionRef} className="relative py-32 overflow-hidden">
      {/* Gaming grid overlay */}
      <div className="absolute inset-0 opacity-20" style={{
        backgroundImage: `
          linear-gradient(rgba(0,255,245,0.03) 1px, transparent 1px),
          linear-gradient(90deg, rgba(0,255,245,0.03) 1px, transparent 1px)
        `,
        backgroundSize: '40px 40px'
      }} />

      {/* Glow effect */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-cyan-400/10 rounded-full blur-[100px] pointer-events-none" />

      <div className="relative z-10 max-w-4xl mx-auto px-6">
        <div 
          ref={containerRef}
          className="bg-white/5 backdrop-blur-md border border-white/10 rounded-3xl p-8 md:p-12 text-center"
        >
          {/* Icon */}
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-cyan-400/20 to-magenta-500/20 border border-cyan-400/30 mb-8">
            <Mail className="w-8 h-8 text-cyan-400" />
          </div>

          {/* Heading */}
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Stay <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-magenta-500">Updated</span>
          </h2>
          
          <p className="text-xl text-gray-400 mb-10 max-w-lg mx-auto">
            Enter your email for game updates, exclusive reveals, and community events.
          </p>

          {/* Form */}
          <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
            <div className="flex-1 relative group">
              <input
                type="email"
                required
                placeholder="Enter your email"
                className="w-full px-6 py-4 bg-white/5 border border-white/10 rounded-xl text-white placeholder:text-gray-500 focus:outline-none focus:border-cyan-400/50 transition-all"
              />
              <div className="absolute inset-0 rounded-xl bg-cyan-400/5 opacity-0 group-focus-within:opacity-100 transition-opacity pointer-events-none" />
            </div>
            
            <button
              type="submit"
              className="group relative px-8 py-4 bg-gradient-to-r from-cyan-400 to-cyan-500 text-black font-bold rounded-xl overflow-hidden transition-all hover:scale-105 hover:shadow-lg hover:shadow-cyan-400/30"
            >
              <span className="relative z-10">Subscribe</span>
              <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform" />
            </button>
          </form>

          {/* Decorative accents */}
          <div className="mt-12 flex items-center justify-center gap-2">
            <div className="w-12 h-px bg-gradient-to-r from-transparent to-cyan-400/30" />
            <div className="w-1.5 h-1.5 rotate-45 bg-cyan-400/40" />
            <div className="w-1.5 h-1.5 rotate-45 bg-magenta-500/40" />
            <div className="w-12 h-px bg-gradient-to-l from-transparent to-magenta-500/30" />
          </div>
        </div>
      </div>
    </section>
  );
}
