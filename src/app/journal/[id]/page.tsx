"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Navbar } from "@/components/ui/Navbar";
import { Footer } from "@/components/ui/Footer";
import { Scene } from "@/components/3d/Scene";
import { ArrowLeft, Calendar, BookOpen } from "lucide-react";
import Link from "next/link";

interface JournalEntry {
  week: string;
  title: string;
  content: string;
  date: string;
}

export default function JournalPage() {
  const { id } = useParams();
  const router = useRouter();
  const [entry, setEntry] = useState<JournalEntry | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEntry = async () => {
      if (typeof id !== "string") return;
      try {
        const docRef = doc(db, "journal", id);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setEntry(docSnap.data() as JournalEntry);
        }
      } catch (err) {
        console.error("Error fetching journal entry:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchEntry();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center">
        <div className="text-cyan-400 animate-pulse">Loading Journal...</div>
      </div>
    );
  }

  if (!entry) {
    return (
      <div className="min-h-screen bg-[#0a0a0f] flex flex-col items-center justify-center px-6">
        <h1 className="text-4xl font-bold text-white mb-4">Entry Not Found</h1>
        <p className="text-gray-400 mb-8">The journal entry you're looking for doesn't exist.</p>
        <Link href="/" className="px-6 py-3 bg-cyan-400 text-black font-bold rounded-xl">
          Back to Home
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a0f]">
      <Scene />
      <Navbar />
      
      <main className="relative z-10 pt-32 pb-24 px-6">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <Link 
            href="/" 
            className="inline-flex items-center gap-2 text-gray-400 hover:text-cyan-400 transition-colors mb-12 group"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            Back to Home
          </Link>

          <header className="mb-16">
            <div className="flex items-center gap-4 mb-6">
              <span className="px-3 py-1 bg-cyan-400/10 border border-cyan-400/20 text-cyan-400 text-sm font-black rounded-lg uppercase tracking-widest">
                {entry.week}
              </span>
              <div className="flex items-center gap-2 text-gray-500 text-sm">
                <Calendar className="w-4 h-4" />
                {new Date(entry.date).toLocaleDateString()}
              </div>
            </div>
            
            <h1 className="text-4xl md:text-6xl font-bold text-white leading-tight mb-8">
              {entry.title}
            </h1>

            <div className="h-px w-full bg-gradient-to-r from-cyan-400/50 via-magenta-500/50 to-transparent" />
          </header>

          {/* Content */}
          <article className="prose prose-invert prose-lg max-w-none">
            <div className="bg-white/5 border border-white/10 rounded-3xl p-8 md:p-12 backdrop-blur-sm">
              <div className="flex items-start gap-4 mb-8">
                <BookOpen className="w-6 h-6 text-cyan-400 mt-1 shrink-0" />
                <div>
                  <h3 className="text-white font-bold text-xl mb-2">Weekly Summary</h3>
                  <div className="text-gray-300 whitespace-pre-wrap leading-relaxed">
                    {entry.content}
                  </div>
                </div>
              </div>

              {/* Decorative blockquote-style accent */}
              <div className="border-l-4 border-cyan-400 pl-6 my-12 italic text-gray-400 text-xl">
                "Another week of pushing physical and digital boundaries at TxNB Studios."
              </div>
            </div>
          </article>

          {/* Footer decoration */}
          <div className="mt-16 flex items-center justify-center gap-3">
             <div className="w-2 h-2 rotate-45 bg-cyan-400" />
             <div className="w-16 h-px bg-white/10" />
             <div className="w-2 h-2 rotate-45 bg-magenta-500" />
             <div className="w-16 h-px bg-white/10" />
             <div className="w-2 h-2 rotate-45 bg-cyan-400" />
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
