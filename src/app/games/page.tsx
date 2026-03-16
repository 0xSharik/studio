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

interface FeaturedGame {
  id: string;
  title: string;
  subtitle: string;
  imageUrl: string;
  trailerUrl: string;
  downloadUrl: string;
}

export default function GamesPage() {
  const [games, setGames] = useState<Game[]>([]);
  const [featured, setFeatured] = useState<FeaturedGame | null>(null);

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
    const q = query(collection(db, "featured"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      if (!snapshot.empty) {
        const data = snapshot.docs[0].data() as FeaturedGame;
        setFeatured({ ...data, id: snapshot.docs[0].id });
      }
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

  const isFeatured = (gameTitle: string) => featured?.title === gameTitle;

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

          {/* Featured Game Section */}
          {featured && featured.title && (
            <div className="mb-16">
              <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
                <span className="px-3 py-1 bg-gradient-to-r from-cyan-400 to-magenta-500 text-black text-sm font-bold rounded">
                  ★
                </span>
                Featured
              </h2>
              <div className="group relative overflow-hidden rounded-2xl aspect-video bg-[#0d0d14] border border-cyan-400/30 hover:border-cyan-400/60 transition-all duration-300">
                {featured.imageUrl ? (
                  <img
                    src={featured.imageUrl}
                    alt={featured.title}
                    className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                ) : (
                  <div className={`absolute inset-0 bg-gradient-to-br ${getGradient(0)} opacity-30`} />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/70 to-transparent" />
                <div className="absolute inset-0 flex flex-col justify-end p-8">
                  <span className="text-cyan-400 text-xs font-bold uppercase tracking-widest mb-1">Featured Game</span>
                  <h3 className="text-3xl md:text-4xl font-bold text-white mb-2">{featured.title}</h3>
                  {featured.subtitle && <p className="text-gray-300 mb-4">{featured.subtitle}</p>}
                  <div className="flex gap-3 flex-wrap">
                    {featured.downloadUrl && (
                      <a
                        href={featured.downloadUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-6 py-2 bg-gradient-to-r from-cyan-400 to-cyan-500 text-black font-bold rounded-full hover:from-cyan-300 hover:to-cyan-400 transition-all shadow-lg shadow-cyan-500/30"
                      >
                        Visit Website →
                      </a>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* All Games */}
          {games.length === 0 && !featured ? (
            <p className="text-gray-500 text-center text-xl">No games available yet.</p>
          ) : (
            <div>
              <h2 className="text-2xl font-bold text-white mb-6">All Games</h2>
              <div className="grid md:grid-cols-2 gap-8">
                {/* Hero Featured Game card in list */}
                {featured && featured.title && (
                  <div className="group relative overflow-hidden rounded-2xl aspect-video bg-[#0d0d14] border border-cyan-400/30 hover:border-cyan-400/60 transition-all duration-300 hover:shadow-[0_0_24px_rgba(34,211,238,0.15)]">
                    {featured.imageUrl ? (
                      <img
                        src={featured.imageUrl}
                        alt={featured.title}
                        className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-60"
                      />
                    ) : (
                      <div className={`absolute inset-0 bg-gradient-to-br ${getGradient(0)} opacity-30 group-hover:opacity-50 transition-opacity`} />
                    )}
                    <div className="absolute top-4 right-4 z-20">
                      <span className="px-3 py-1 bg-gradient-to-r from-cyan-400 to-magenta-500 text-black text-xs font-bold rounded shadow-lg">
                        ★ HERO FEATURED
                      </span>
                    </div>
                    <div className="absolute inset-0 bg-gradient-to-t from-black via-black/70 to-transparent" />
                    <div className="absolute inset-0 flex flex-col justify-end p-6">
                      <span className="text-cyan-400 text-xs font-bold uppercase tracking-widest block mb-1">Featured Title</span>
                      <h3 className="text-2xl font-bold text-white leading-tight mb-3">{featured.title}</h3>
                      <div className="flex gap-3 flex-wrap">
                        {featured.downloadUrl && (
                          <a
                            href={featured.downloadUrl}
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
                )}

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
                    <div className="absolute inset-0 bg-gradient-to-t from-black via-black/70 to-transparent" />
                    <div className="absolute inset-0 flex flex-col justify-end p-6">
                      <span
                        className="text-cyan-400 text-xs font-bold uppercase tracking-widest block mb-1"
                      >{game.genre}</span>
                      <h3
                        className="text-2xl font-bold text-white leading-tight mb-3"
                      >{game.title}</h3>
                      <div className="flex gap-3 flex-wrap">
                        <span className="px-3 py-1 bg-black/70 border border-white/25 backdrop-blur-sm rounded-full text-gray-200 text-xs font-medium">
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
            </div>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}
