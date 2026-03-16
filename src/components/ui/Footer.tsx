"use client";

import Link from "next/link";
import { MessageSquare, Youtube, Instagram, Linkedin, ArrowUpRight } from "lucide-react";

const SOCIAL_LINKS = [
  { name: "Discord", url: "https://discord.gg/kKngDdFQ", icon: MessageSquare },
  { name: "YouTube", url: "https://www.youtube.com/@TxNBesports", icon: Youtube },
  { name: "Instagram", url: "https://www.instagram.com/txnb_esports?igsh=MW01ZGRwMjBpOHYzZA==", icon: Instagram },
  { name: "Linkedin", url: "https://www.linkedin.com/company/txnb/", icon: Linkedin },
];

const QUICK_LINKS = [
  { name: "Home", href: "/" },
  { name: "Games", href: "/games" },
  { name: "News", href: "/announcements" },
  { name: "Admin", href: "/admin/login" },
];

export function Footer() {
  return (
    <footer className="relative py-20 px-6 border-t border-white/10 bg-[#050507]">
      {/* Background glow */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-cyan-500/5 blur-[120px] pointer-events-none" />

      <div className="relative z-10 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">

          {/* Brand Info */}
          <div className="lg:col-span-2 space-y-6">
            <Link href="/" className="inline-block text-3xl font-black font-mono tracking-tighter">
              <span className="text-cyan-400">TxNB</span>
              <span className="text-white"> ESPORTS</span>
            </Link>
            <p className="text-gray-400 text-lg max-w-md leading-relaxed">
              Empowering the next generation of competitive gamers through innovation, storytelling, and premium experiences.
            </p>
            <div className="flex items-center gap-4 text-sm text-cyan-400/80 font-mono tracking-widest uppercase">
              <span className="w-1.5 h-1.5 bg-cyan-400 rounded-full animate-pulse" />
              Next Gen Gaming Studio
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-6">
            <h4 className="text-white font-black uppercase tracking-widest text-sm">Navigation</h4>
            <ul className="space-y-4">
              {QUICK_LINKS.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="group flex items-center gap-2 text-gray-500 hover:text-cyan-400 transition-colors"
                  >
                    {link.name}
                    <ArrowUpRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-all -translate-y-1 group-hover:translate-y-0" />
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Community */}
          <div className="space-y-6">
            <h4 className="text-white font-black uppercase tracking-widest text-sm">Community</h4>
            <ul className="space-y-4">
              {SOCIAL_LINKS.map((social) => {
                const Icon = social.icon;
                return (
                  <li key={social.name}>
                    <a
                      href={social.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group flex items-center gap-3 text-gray-500 hover:text-white transition-colors"
                    >
                      <span className="p-2 bg-white/5 border border-white/10 rounded-lg group-hover:border-cyan-400/50 group-hover:bg-cyan-400/10 transition-all">
                        <Icon size={18} className="group-hover:text-cyan-400" />
                      </span>
                      <span className="group-hover:translate-x-1 transition-transform">{social.name}</span>
                    </a>
                  </li>
                );
              })}
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-white/5 flex flex-col md:flex-row items-center justify-between gap-6">
          <p className="text-gray-600 text-xs font-mono tracking-widest uppercase">
            © 2026 TxNB Esports. All rights reserved.
          </p>

          <div className="flex gap-8 text-xs font-mono text-gray-600 uppercase tracking-widest">
            <a href="#" className="hover:text-cyan-400 transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-cyan-400 transition-colors">Terms of Service</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
