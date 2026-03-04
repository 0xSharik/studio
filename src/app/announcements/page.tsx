"use client";

import { useState, useEffect } from "react";
import { Navbar } from "@/components/ui/Navbar";
import { Footer } from "@/components/ui/Footer";
import { Scene } from "@/components/3d/Scene";
import { collection, getDocs, query, orderBy } from "firebase/firestore";
import { db } from "@/lib/firebase";

interface Announcement {
  id: string;
  title: string;
  description: string;
  date: string;
  type: "news" | "update" | "event";
}

const defaultAnnouncements: Announcement[] = [
  { id: "1", title: "New Game Announced", description: "We're excited to announce our upcoming title Cyber Odyssey!", date: "2026-03-01", type: "news" },
  { id: "2", title: "Neon Rising Update", description: "New tracks and customizations available now.", date: "2026-02-15", type: "update" },
  { id: "3", title: "Game Dev Conference", description: "Join us at GDC 2026 for exclusive reveals.", date: "2026-02-01", type: "event" },
];

export default function AnnouncementsPage() {
  const [announcements, setAnnouncements] = useState<Announcement[]>(defaultAnnouncements);

  useEffect(() => {
    const fetchAnnouncements = async () => {
      try {
        const q = query(collection(db, "announcements"), orderBy("date", "desc"));
        const snapshot = await getDocs(q);
        if (!snapshot.empty) {
          const data = snapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          })) as Announcement[];
          setAnnouncements(data);
        }
      } catch (err) {
        console.log("Using default announcements");
      }
    };
    fetchAnnouncements();
  }, []);

  const getTypeColor = (type: string) => {
    switch (type) {
      case "news": return "text-cyan-400 border-cyan-400";
      case "update": return "text-green-400 border-green-400";
      case "event": return "text-magenta-400 border-magenta-400";
      default: return "text-gray-400 border-gray-400";
    }
  };

  return (
    <>
      <Scene />
      <Navbar />
      <main className="min-h-screen pt-24 pb-16 px-6">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-5xl font-bold text-white text-center mb-4">
            Latest <span className="text-cyan-400">News</span>
          </h1>
          <p className="text-gray-400 text-center mb-16">
            Stay updated with our latest announcements
          </p>
          <div className="space-y-6">
            {announcements.map((item) => (
              <div
                key={item.id}
                className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-8 hover:border-cyan-400/50 transition-colors"
              >
                <div className="flex items-center gap-4 mb-4">
                  <span className={`px-3 py-1 text-xs uppercase tracking-wider border rounded-full ${getTypeColor(item.type)}`}>
                    {item.type}
                  </span>
                  <span className="text-gray-500 text-sm">{item.date}</span>
                </div>
                <h2 className="text-2xl font-bold text-white mb-3">{item.title}</h2>
                <p className="text-gray-400 leading-relaxed">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
