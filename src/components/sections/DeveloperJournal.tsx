"use client";

import { useEffect, useState, useRef } from "react";
import { collection, onSnapshot, query, orderBy, limit } from "firebase/firestore";
import { db } from "@/lib/firebase";
import Link from "next/link";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { BookOpen, ArrowRight } from "lucide-react";

gsap.registerPlugin(ScrollTrigger);

interface JournalEntry {
  id: string;
  week: string;
  title: string;
  content: string;
  date: string;
}

export function DeveloperJournal() {
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const sectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const q = query(collection(db, "journal"), orderBy("date", "desc"), limit(3));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as JournalEntry[];
      setEntries(data);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (entries.length > 0) {
      const ctx = gsap.context(() => {
        gsap.fromTo(
          ".journal-card",
          { opacity: 0, y: 30 },
          {
            opacity: 1,
            y: 0,
            duration: 0.8,
            stagger: 0.2,
            ease: "power2.out",
            scrollTrigger: {
              trigger: sectionRef.current,
              start: "top 80%",
            },
          }
        );
      }, sectionRef);
      return () => ctx.revert();
    }
  }, [entries]);

  if (entries.length === 0) return null;

  return (
    <section ref={sectionRef} className="relative py-32 overflow-hidden bg-black/20">
      {/* Background accents */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-magenta-500/5 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-cyan-400/5 rounded-full blur-[120px] pointer-events-none" />

      <div className="relative z-10 max-w-7xl mx-auto px-6">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 rounded-full mb-4">
            <BookOpen className="w-4 h-4 text-cyan-400" />
            <span className="text-cyan-400 text-xs font-bold tracking-widest uppercase">Development Progress</span>
          </div>
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Developer <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-magenta-500">Journal</span>
          </h2>
          <div className="w-24 h-1 bg-gradient-to-r from-cyan-400 to-magenta-500 mx-auto rounded-full" />
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {entries.map((entry) => (
            <Link 
              key={entry.id} 
              href={`/journal/${entry.id}`}
              className="journal-card group relative block"
            >
              <div className="absolute -inset-0.5 bg-gradient-to-r from-cyan-400 to-magenta-500 rounded-2xl blur opacity-20 group-hover:opacity-40 transition duration-500" />
              <div className="relative h-full bg-[#0d0d14] border border-white/10 p-8 rounded-2xl hover:border-white/20 transition-all">
                <div className="flex items-center justify-between mb-6">
                  <span className="text-cyan-400 font-bold tracking-tighter text-sm uppercase px-3 py-1 bg-cyan-400/10 rounded-md border border-cyan-400/20">
                    {entry.week}
                  </span>
                  <span className="text-gray-500 text-xs">
                    {new Date(entry.date).toLocaleDateString()}
                  </span>
                </div>
                
                <h3 className="text-xl font-bold text-white mb-4 group-hover:text-cyan-400 transition-colors">
                  {entry.title}
                </h3>
                
                <p className="text-gray-400 text-sm mb-8 line-clamp-3 leading-relaxed">
                  {entry.content}
                </p>

                <div className="mt-auto flex items-center gap-2 text-white font-bold text-sm group-hover:gap-4 transition-all">
                  Read More 
                  <ArrowRight className="w-4 h-4 text-magenta-500" />
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
