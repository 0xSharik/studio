"use client";

import Link from "next/link";

export function Footer() {
  return (
    <footer className="py-10 px-6 border-t border-white/10">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
        <Link href="/" className="text-xl font-bold font-mono tracking-wider">
          <span className="text-cyan-400">TxNB</span>
          <span className="text-white"> Esports</span>
        </Link>
        <p className="text-gray-500 text-sm">
          © 2026 TxNB Esports. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
