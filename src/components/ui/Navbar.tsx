"use client";

import Link from "next/link";
import { useState, useEffect } from "react";

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled ? "bg-black/80 backdrop-blur-md py-4" : "bg-transparent py-6"
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
        <Link href="/" className="text-2xl font-bold text-white tracking-wider">
          <span className="text-cyan-400">GAME</span>STUDIO
        </Link>
        <div className="hidden md:flex items-center gap-8">
          <Link href="/games" className="text-gray-300 hover:text-cyan-400 transition-colors">
            Games
          </Link>
          <Link href="/announcements" className="text-gray-300 hover:text-cyan-400 transition-colors">
            News
          </Link>
          <Link
            href="/admin/login"
            className="px-4 py-2 border border-cyan-400 text-cyan-400 rounded hover:bg-cyan-400/10 transition-colors"
          >
            Admin
          </Link>
        </div>
      </div>
    </nav>
  );
}
