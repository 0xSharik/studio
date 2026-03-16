"use client";

import { useRef, useEffect, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { collection, onSnapshot, query, orderBy } from "firebase/firestore";
import { db } from "@/lib/firebase";

gsap.registerPlugin(ScrollTrigger);

interface Announcement {
  id: string;
  title: string;
  description: string;
  date: string;
  type: "news" | "update" | "event" | "game_release" | "coming_soon";
}

const defaultAnnouncements: Announcement[] = [
  {
    id: "1",
    title: "New Game Announced",
    description: "We're excited to announce our upcoming title Cyber Odyssey!",
    date: "2026-03-01",
    type: "news",
  },
  {
    id: "2",
    title: "Neon Rising Update",
    description: "New tracks and customizations available now.",
    date: "2026-02-15",
    type: "update",
  },
  {
    id: "3",
    title: "Game Dev Conference",
    description: "Join us at GDC 2026 for exclusive reveals.",
    date: "2026-02-01",
    type: "event",
  },
];

export function Announcements() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const [announcements, setAnnouncements] = useState<Announcement[]>(defaultAnnouncements);

  useEffect(() => {
    const q = query(collection(db, "announcements"), orderBy("date", "desc"));
    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        if (!snapshot.empty) {
          const data = snapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          })) as Announcement[];
          setAnnouncements(data);
        }
      },
      (error) => {
        console.error("[Announcements] Firestore error:", error.code, error.message);
      }
    );
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(
        ".announcement-item",
        { opacity: 0, x: -50 },
        {
          opacity: 1,
          x: 0,
          duration: 0.6,
          stagger: 0.15,
          scrollTrigger: {
            trigger: sectionRef.current,
            start: "top 80%",
          },
        }
      );
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  const getTypeColor = (type: string) => {
    switch (type) {
      case "news":
        return "text-cyan-400";
      case "update":
        return "text-green-400";
      case "event":
        return "text-magenta-400";
      case "game_release":
        return "text-yellow-400 font-bold";
      case "coming_soon":
        return "text-orange-400";
      default:
        return "text-gray-400";
    }
  };

  return (
    <section ref={sectionRef} className="py-32 px-6">
      <div className="max-w-4xl mx-auto">
        <h2 className="text-4xl md:text-5xl font-bold text-white mb-16 text-center">
          Latest <span className="text-cyan-400">News</span>
        </h2>
        <div className="space-y-6">
          {announcements.map((item) => (
            <div
              key={item.id}
              className="announcement-item bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6 hover:border-cyan-400/50 transition-colors"
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <span className={`text-xs uppercase tracking-wider ${getTypeColor(item.type)}`}>
                    {item.type.replace("_", " ")}
                  </span>
                  <h3 className="text-xl font-bold text-white mt-1">{item.title}</h3>
                  <p className="text-gray-400 mt-2">{item.description}</p>
                </div>
                <span className="text-gray-500 text-sm whitespace-nowrap">{item.date}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
