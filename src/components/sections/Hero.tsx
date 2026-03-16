"use client";

import { useRef, useEffect, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { collection, onSnapshot, query, orderBy } from "firebase/firestore";
import { db } from "@/lib/firebase";

gsap.registerPlugin(ScrollTrigger);

interface Game {
  id: string;
  title: string;
  genre: string;
  status: string;
  imageUrl: string;
  downloadUrl: string;
  featured?: boolean;
}

export function Hero() {
  const heroRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const subtitleRef = useRef<HTMLParagraphElement>(null);
  const buttonRef = useRef<HTMLAnchorElement>(null);
  const [featuredGame, setFeaturedGame] = useState<Game | null>(null);

  useEffect(() => {
    const q = query(collection(db, "games"), orderBy("title", "asc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const games = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Game[];
      
      const featured = games.find(g => g.featured === true);
      setFeaturedGame(featured || null);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(
        titleRef.current,
        { opacity: 0, y: 50 },
        { opacity: 1, y: 0, duration: 1, delay: 0.5 }
      );
      gsap.fromTo(
        subtitleRef.current,
        { opacity: 0, y: 30 },
        { opacity: 1, y: 0, duration: 1, delay: 0.8 }
      );
      gsap.fromTo(
        buttonRef.current,
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 1, delay: 1.1 }
      );
    }, heroRef);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={heroRef}
      className="min-h-screen flex items-center justify-center relative overflow-hidden"
    >
      <div className="text-center z-10 px-6">
        <h1
          ref={titleRef}
          className="text-5xl md:text-7xl font-bold text-white mb-6 tracking-tight"
        >
          We Don't Just Play Games.
          <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-magenta-500">
            We Create Them.
          </span>
        </h1>
        <p
          ref={subtitleRef}
          className="text-xl md:text-2xl text-gray-400 max-w-2xl mx-auto mb-8"
        >
          Crafting immersive experiences that push the boundaries of imagination.
        </p>
        {featuredGame ? (
          featuredGame.downloadUrl ? (
            <a
              ref={buttonRef}
              href={featuredGame.downloadUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block px-8 py-4 bg-cyan-400 text-black font-bold text-lg rounded-full hover:bg-cyan-500 transition-all transform hover:scale-105 shadow-lg shadow-cyan-400/25"
            >
              Play Our Game
            </a>
          ) : (
            <div className="mt-4">
              <span className="text-cyan-400 text-lg font-semibold">{featuredGame.title}</span>
              <p className="text-gray-500 text-sm">Coming Soon</p>
            </div>
          )
        ) : null}
      </div>
      <div className="absolute bottom-10 left-1/2 -translate-x-1/2 animate-bounce">
        <svg
          className="w-6 h-6 text-cyan-400"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 14l-7 7m0 0l-7-7m7 7V3"
          />
        </svg>
      </div>
    </section>
  );
}
