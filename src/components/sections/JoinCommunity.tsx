"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Disc as Discord, Youtube, Instagram, MessageSquare } from "lucide-react";

gsap.registerPlugin(ScrollTrigger);

const SOCIAL_LINKS = [
  {
    name: "Discord",
    url: "https://discord.gg/txnb",
    icon: MessageSquare,
    color: "from-[#5865F2] to-[#4752C4]",
    shadow: "shadow-[#5865F2]/20"
  },
  {
    name: "YouTube",
    url: "https://youtube.com/@txnb",
    icon: Youtube,
    color: "from-[#FF0000] to-[#CC0000]",
    shadow: "shadow-[#FF0000]/20"
  },
  {
    name: "Instagram",
    url: "https://instagram.com/txnb_esports",
    icon: Instagram,
    color: "from-[#E4405F] to-[#D62976]",
    shadow: "shadow-[#E4405F]/20"
  }
];

export function JoinCommunity() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(
        ".social-btn",
        { opacity: 0, scale: 0.8, y: 30 },
        {
          opacity: 1,
          scale: 1,
          y: 0,
          duration: 0.6,
          stagger: 0.15,
          ease: "back.out(1.7)",
          scrollTrigger: {
            trigger: sectionRef.current,
            start: "top 85%",
          },
        }
      );

      gsap.fromTo(
        ".community-heading",
        { opacity: 0, y: -20 },
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

  return (
    <section ref={sectionRef} className="relative py-32 overflow-hidden border-t border-white/5">
      {/* Background decoration */}
      <div className="absolute inset-0 opacity-30  pointer-events-none" style={{
        backgroundImage: `
          radial-gradient(circle at 50% 50%, rgba(34, 211, 238, 0.1) 0%, transparent 60%)
        `
      }} />

      <div className="relative z-10 max-w-7xl mx-auto px-6 text-center">
        <h2 className="community-heading text-4xl md:text-5xl lg:text-6xl font-black text-white mb-12 tracking-tight">
          Join Our <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-magenta-500">Community</span>
        </h2>

        <div className="flex flex-wrap justify-center gap-6 md:gap-8">
          {SOCIAL_LINKS.map((social) => (
            <a
              key={social.name}
              href={social.url}
              target="_blank"
              rel="noopener noreferrer"
              className={`social-btn group relative flex items-center gap-4 px-8 py-4 bg-white/5 border border-white/10 rounded-2xl transition-all duration-300 hover:scale-105 hover:bg-white/10 ${social.shadow} hover:shadow-2xl`}
            >
              {/* Animated background glow */}
              <div className={`absolute inset-0 bg-gradient-to-r ${social.color} opacity-0 group-hover:opacity-10 rounded-2xl transition-opacity`} />
              
              <social.icon className="w-8 h-8 text-white transition-transform group-hover:scale-110" />
              <div className="text-left">
                <span className="block text-xs font-mono text-gray-500 uppercase tracking-widest group-hover:text-cyan-400 transition-colors">Follow us on</span>
                <span className="block text-xl font-bold text-white tracking-tight">{social.name}</span>
              </div>
              
              {/* Border accent */}
              <div className="absolute -bottom-px left-8 right-8 h-px bg-gradient-to-r from-transparent via-cyan-400/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            </a>
          ))}
        </div>

        {/* Decorative divider */}
        <div className="mt-20 flex items-center justify-center gap-3">
          <div className="h-px w-32 bg-gradient-to-r from-transparent to-white/10" />
          <div className="flex gap-2">
            {[1, 2, 3].map((i) => (
              <div key={i} className="w-1.5 h-1.5 rounded-full bg-cyan-400/30" />
            ))}
          </div>
          <div className="h-px w-32 bg-gradient-to-l from-transparent to-white/10" />
        </div>
      </div>
    </section>
  );
}
