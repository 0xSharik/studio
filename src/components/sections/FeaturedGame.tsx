"use client";

import { useEffect, useState } from "react";
import { collection, onSnapshot, query } from "firebase/firestore";
import { db } from "@/lib/firebase";

interface FeaturedGame {
  id: string;
  title: string;
  subtitle: string;
  imageUrl: string;
  trailerUrl: string;
  downloadUrl: string;
}

export function FeaturedGame() {
  const [featured, setFeatured] = useState<FeaturedGame | null>(null);

  useEffect(() => {
    const q = query(collection(db, "featured"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      if (!snapshot.empty) {
        const data = snapshot.docs[0].data() as FeaturedGame;
        setFeatured({ ...data, id: snapshot.docs[0].id });
      }
    });
    return () => unsubscribe();
  }, []);

  if (!featured?.title) return null;

  return (
    <section className="relative py-24 overflow-hidden">
      {/* Gaming grid overlay */}
      <div className="absolute inset-0 opacity-30" style={{
        backgroundImage: `
          linear-gradient(rgba(0,255,245,0.03) 1px, transparent 1px),
          linear-gradient(90deg, rgba(0,255,245,0.03) 1px, transparent 1px)
        `,
        backgroundSize: '50px 50px'
      }} />

      {/* Glow effects */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] bg-cyan-400/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute top-0 right-0 w-64 h-64 bg-magenta-500/10 rounded-full blur-[80px] pointer-events-none" />

      <div className="relative z-10 max-w-7xl mx-auto px-6">
        {/* Section Heading */}
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-white">
            Featured <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-magenta-500">Game</span>
          </h2>
          <div className="mt-4 flex items-center justify-center gap-2">
            <div className="w-12 h-px bg-gradient-to-r from-transparent to-cyan-400" />
            <div className="w-2 h-2 rotate-45 bg-cyan-400" />
            <div className="w-12 h-px bg-gradient-to-l from-transparent to-magenta-500" />
          </div>
        </div>

        <div className="flex flex-col lg:flex-row items-center gap-12">
          
          {/* Image Section */}
          <div className="flex-1 w-full">
            <div className="relative group">
              {/* Glow behind */}
              <div className="absolute -inset-2 bg-gradient-to-r from-cyan-400 to-magenta-500 rounded-xl blur-lg opacity-50 group-hover:opacity-75 transition-opacity" />
              
              {/* Main image frame */}
              <div className="relative rounded-xl overflow-hidden border border-white/10">
                {featured.imageUrl ? (
                  <img
                    src={featured.imageUrl}
                    alt={featured.title}
                    className="w-full aspect-video object-cover"
                  />
                ) : (
                  <div className="w-full aspect-video bg-gradient-to-br from-cyan-900/30 to-magenta-900/30 flex items-center justify-center">
                    <span className="text-cyan-400/50 text-6xl font-bold">{featured.title.charAt(0)}</span>
                  </div>
                )}
                
                {/* Overlay gradient */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
              </div>

              {/* Corner accents */}
              <div className="absolute top-0 left-0 w-8 h-8 border-t-2 border-l-2 border-cyan-400 rounded-tl-lg" />
              <div className="absolute top-0 right-0 w-8 h-8 border-t-2 border-r-2 border-cyan-400 rounded-tr-lg" />
              <div className="absolute bottom-0 left-0 w-8 h-8 border-b-2 border-l-2 border-magenta-500 rounded-bl-lg" />
              <div className="absolute bottom-0 right-0 w-8 h-8 border-b-2 border-r-2 border-magenta-500 rounded-br-lg" />
            </div>
          </div>

          {/* Content Section */}
          <div className="flex-1 text-center lg:text-left">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-cyan-400/20 to-magenta-500/20 border border-cyan-400/30 rounded-full mb-6">
              <span className="w-2 h-2 bg-cyan-400 rounded-full" />
              <span className="text-cyan-400 text-sm font-semibold tracking-wider">FEATURED GAME</span>
            </div>

            {/* Title */}
            <h2 className="text-4xl md:text-6xl font-bold text-white mb-4 tracking-tight">
              {featured.title}
            </h2>

            {/* Subtitle */}
            {featured.subtitle && (
              <p className="text-xl text-gray-300 mb-8 flex flex-wrap justify-center lg:justify-start gap-3">
                {featured.subtitle.split('•').map((item, i) => (
                  <span key={i} className="flex items-center gap-2">
                    {i > 0 && <span className="text-cyan-400/50">•</span>}
                    <span>{item.trim()}</span>
                  </span>
                ))}
              </p>
            )}

            {/* Buttons */}
            <div className="flex flex-wrap justify-center lg:justify-start gap-4">
              {featured.downloadUrl && (
                <a
                  href={featured.downloadUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group relative px-8 py-4 bg-gradient-to-r from-cyan-400 to-cyan-500 text-black font-bold rounded-lg overflow-hidden transition-all hover:scale-105 hover:shadow-lg hover:shadow-cyan-400/30"
                >
                  <span className="relative z-10 flex items-center gap-2">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                    </svg>
                    Wishlist / Download
                  </span>
                  <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform" />
                </a>
              )}

              {featured.trailerUrl && (
                <a
                  href={featured.trailerUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group px-8 py-4 bg-white/5 border border-white/20 text-white font-bold rounded-lg hover:bg-white/10 hover:border-white/40 transition-all flex items-center gap-2"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M8 5v14l11-7z" />
                  </svg>
                  Watch Trailer
                </a>
              )}
            </div>

            {/* Decorative line */}
            <div className="mt-10 flex items-center gap-4 justify-center lg:justify-start">
              <div className="h-px w-16 bg-gradient-to-r from-transparent to-cyan-400" />
              <div className="w-2 h-2 rotate-45 bg-cyan-400" />
              <div className="w-2 h-2 rotate-45 bg-magenta-500" />
              <div className="h-px w-16 bg-gradient-to-l from-transparent to-magenta-500" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
