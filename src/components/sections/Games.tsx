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
}

export function Games() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const [games, setGames] = useState<Game[]>([]);

  useEffect(() => {
    const q = query(collection(db, "games"), orderBy("title", "asc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Game[];
      setGames(data);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(
        ".game-card",
        { opacity: 0, y: 100 },
        {
          opacity: 1,
          y: 0,
          duration: 0.8,
          stagger: 0.2,
          scrollTrigger: {
            trigger: sectionRef.current,
            start: "top 80%",
          },
        }
      );
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  const getGradient = (index: number) => {
    const gradients = [
      "from-cyan-500 to-blue-500",
      "from-magenta-500 to-purple-500",
      "from-green-500 to-emerald-500",
      "from-orange-500 to-red-500",
      "from-pink-500 to-rose-500",
      "from-indigo-500 to-violet-500",
    ];
    return gradients[index % gradients.length];
  };

  if (games.length === 0) {
    return null;
  }

  return (
    <section ref={sectionRef} className="py-32 px-6">
      <div className="max-w-7xl mx-auto">
        <h2 className="text-4xl md:text-5xl font-bold text-white mb-16 text-center">
          Our <span className="text-cyan-400">Games</span>
        </h2>
        <div className="grid md:grid-cols-3 gap-8">
          {games.map((game, index) => (
            <div
              key={game.id}
              className="game-card group relative overflow-hidden rounded-2xl aspect-[4/5] cursor-pointer"
            >
              {game.imageUrl ? (
                <img
                  src={game.imageUrl}
                  alt={game.title}
                  className="absolute inset-0 w-full h-full object-cover"
                />
              ) : (
                <div
                  className={`absolute inset-0 bg-gradient-to-br ${getGradient(index)} opacity-30 group-hover:opacity-50 transition-opacity`}
                />
              )}
              <div className="absolute inset-0 bg-black/50" />
              <div className="absolute inset-0 flex flex-col items-center justify-end p-8">
                <span className="text-cyan-400 text-sm mb-2">{game.genre}</span>
                <h3 className="text-2xl font-bold text-white text-center">{game.title}</h3>
                {game.downloadUrl && game.downloadUrl !== "#" && (
                  <a
                    href={game.downloadUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-4 px-4 py-2 bg-cyan-400 text-black font-bold rounded-lg hover:bg-cyan-500 transition-colors"
                  >
                    Visit Website
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
