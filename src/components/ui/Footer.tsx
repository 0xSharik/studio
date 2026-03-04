"use client";

import Link from "next/link";

export function Footer() {
  return (
    <footer className="py-12 px-6 border-t border-white/10">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <Link href="/" className="text-2xl font-bold text-white tracking-wider">
            <span className="text-cyan-400">GAME</span>STUDIO
          </Link>
          <div className="flex items-center gap-6">
            <Link href="/games" className="text-gray-400 hover:text-cyan-400 transition-colors">
              Games
            </Link>
            <Link href="/announcements" className="text-gray-400 hover:text-cyan-400 transition-colors">
              News
            </Link>
            <Link href="/admin/login" className="text-gray-400 hover:text-cyan-400 transition-colors">
              Admin
            </Link>
          </div>
          <p className="text-gray-500 text-sm">
            © 2026 GameStudio. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
