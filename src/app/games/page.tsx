"use client";

import { useState, useEffect } from "react";
import { Navbar } from "@/components/ui/Navbar";
import { Footer } from "@/components/ui/Footer";
import { Scene } from "@/components/3d/Scene";
import { collection, onSnapshot, query, orderBy } from "firebase/firestore";
import { db } from "@/lib/firebase";

interface Game {
  id: string;
  title: string;
  genre: string;
  status: string;
  imageUrl: string;
  downloadUrl: string;
}

export default function GamesPage() {
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

  return (
    <>
      <Scene />
      <Navbar />
      <main className="min-h-screen pt-24 pb-16 px-6">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-5xl font-bold text-white text-center mb-4">
            Our <span className="text-cyan-400">Games</span>
          </h1>
          <p className="text-gray-400 text-center mb-16 max-w-2xl mx-auto">
            Explore our collection of innovative gaming experiences
          </p>
          {games.length === 0 ? (
            <p className="text-gray-500 text-center text-xl">No games available yet.</p>
          ) : (
            <div className="grid md:grid-cols-2 gap-8">
              {games.map((game, index) => (
                <div
                  key={game.id}
                  className="group relative overflow-hidden rounded-2xl aspect-video bg-[#0d0d14] border border-white/10 hover:border-cyan-400/50 transition-all duration-300 hover:shadow-[0_0_24px_rgba(34,211,238,0.15)]"
                >
                  {game.imageUrl ? (
                    <img
                      src={game.imageUrl}
                      alt={game.title}
                      className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  ) : (
                    <div className={`absolute inset-0 bg-gradient-to-br ${getGradient(index)} opacity-30 group-hover:opacity-50 transition-opacity`} />
                  )}
                  {/* Gradient overlay — dark at top edges, heavy at bottom for readability */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />
                  <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-transparent to-transparent" />
                  <div className="absolute inset-0 flex flex-col justify-end p-6">
                    <span className="text-cyan-400 text-xs font-semibold uppercase tracking-widest mb-1">{game.genre}</span>
                    <h2 className="text-2xl font-bold text-white mb-3 drop-shadow-lg">{game.title}</h2>
                    <div className="flex gap-3 flex-wrap">
                      <span className="px-3 py-1 bg-black/60 border border-white/25 backdrop-blur-sm rounded-full text-gray-200 text-xs font-medium">
                        {game.status}
                      </span>
                      {game.downloadUrl && (
                        <a
                          href={game.downloadUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-4 py-1 bg-cyan-400 text-black font-bold rounded-full text-xs hover:bg-cyan-300 transition-colors shadow-lg shadow-cyan-500/30"
                        >
                          Visit Website →
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}
