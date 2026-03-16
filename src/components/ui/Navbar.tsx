"use client";

import Link from "next/link";
import { useState, useEffect, useRef } from "react";
import { usePathname, useRouter } from "next/navigation";
import { X, Menu } from "lucide-react";
import { gsap } from "gsap";

const NAV_LINKS = [
  { href: "/", label: "HOME" },
  { href: "/games", label: "GAMES" },
  { href: "/announcements", label: "NEWS" },
  { href: "/admin/login", label: "ADMIN" },
];

export function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();

  const overlayRef = useRef<HTMLDivElement>(null);
  const linksRef = useRef<HTMLDivElement>(null);
  const isAnimating = useRef(false);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 50);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = isMobileMenuOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [isMobileMenuOpen]);

  const openMobileMenu = () => {
    if (isAnimating.current) return;
    isAnimating.current = true;
    setIsMobileMenuOpen(true);

    const tl = gsap.timeline({ onComplete: () => { isAnimating.current = false; } });
    tl.set(overlayRef.current, { display: "flex" })
      .fromTo(overlayRef.current, { opacity: 0 }, { opacity: 1, duration: 0.35, ease: "power2.out" })
      .fromTo(
        linksRef.current?.children ?? [],
        { opacity: 0, y: 30 },
        { opacity: 1, y: 0, duration: 0.4, stagger: 0.08, ease: "power3.out" },
        "-=0.15"
      );
  };

  const closeMobileMenu = (onDone?: () => void) => {
    if (isAnimating.current) return;
    isAnimating.current = true;

    gsap.to(overlayRef.current, {
      opacity: 0,
      duration: 0.3,
      ease: "power2.in",
      onComplete: () => {
        gsap.set(overlayRef.current, { display: "none" });
        setIsMobileMenuOpen(false);
        isAnimating.current = false;
        onDone?.();
      },
    });
  };

  const handleNavigate = (href: string) => {
    const navigate = () => {
      gsap.to("#page-content", {
        opacity: 0,
        duration: 0.3,
        ease: "power2.in",
        onComplete: () => {
          router.push(href);
          gsap.set("#page-content", { opacity: 1 });
        },
      });
    };

    if (isMobileMenuOpen) {
      closeMobileMenu(navigate);
    } else {
      navigate();
    }
  };

  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href);

  return (
    <>
      {/*
        ── Navbar ──
        Always centered via left-1/2 + -translate-x-1/2.
        On scroll: narrows to a pill. This prevents the left-slide glitch.
      */}
      <nav
        className={`fixed top-4 left-1/2 -translate-x-1/2 z-50 transition-all duration-500 ease-out ${isScrolled
          ? "bg-black/90 backdrop-blur-xl rounded-full border border-cyan-500/30 shadow-2xl shadow-cyan-500/20 px-8 py-2 max-w-2xl w-[90vw]"
          : "bg-transparent border-transparent px-4 py-4 w-full max-w-7xl"
          }`}
      >
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link href="/">
            <img
              src="/logo.png"
              alt="TxNB Esports"
              className={`object-cover object-center transition-all duration-500 w-[160px] ${isScrolled ? "h-16" : "h-28"}`}
            />
          </Link>

          {/* Desktop Links */}
          <div className="hidden md:flex items-center gap-1">
            {NAV_LINKS.map(({ href, label }) => (
              <button
                key={href}
                onClick={() => handleNavigate(href)}
                className={`relative px-4 py-2 rounded-full font-medium transition-all duration-300 group ${isScrolled ? "text-xs" : "text-sm"
                  } ${isActive(href) ? "text-cyan-400" : "text-gray-400 hover:text-white"
                  }`}
              >
                {isActive(href) && (
                  <span className="absolute inset-0 rounded-full bg-cyan-400/10 border border-cyan-400/30" />
                )}
                <span className="relative z-10">{label}</span>
                {!isActive(href) && (
                  <span className="absolute bottom-1 left-1/2 -translate-x-1/2 w-0 h-px bg-cyan-400 group-hover:w-3/4 transition-all duration-300" />
                )}
              </button>
            ))}
          </div>

          {/* Mobile Hamburger */}
          <button
            className="md:hidden p-2 rounded-lg border border-white/10 bg-white/5 hover:bg-white/10 transition-all duration-200"
            onClick={openMobileMenu}
            aria-label="Open menu"
          >
            <Menu size={20} className="text-white/80" />
          </button>
        </div>
      </nav>

      {/* ── Mobile Full-Screen Overlay (GSAP controlled) ── */}
      <div
        ref={overlayRef}
        className="fixed inset-0 z-[100] flex-col items-center justify-center px-6"
        style={{
          display: "none",
          background: "rgba(0,0,0,0.97)",
          backdropFilter: "blur(24px)",
        }}
      >
        {/* Ambient glows */}
        <div className="absolute top-1/4 left-1/4 w-72 h-72 bg-cyan-500/15 rounded-full blur-3xl animate-pulse pointer-events-none" />
        <div className="absolute bottom-1/4 right-1/4 w-56 h-56 bg-purple-500/15 rounded-full blur-3xl animate-pulse delay-700 pointer-events-none" />

        {/* Close button */}
        <button
          className="absolute top-5 right-5 p-2 rounded-lg border border-cyan-400/30 bg-cyan-400/10 hover:bg-cyan-400/20 transition-all duration-200"
          onClick={() => closeMobileMenu()}
          aria-label="Close menu"
        >
          <X size={22} className="text-cyan-400" />
        </button>

        {/* Header label */}
        <div className="text-center mb-10">
          <p className="text-xs font-mono text-cyan-400/60 tracking-[0.4em] uppercase mb-3">Navigation</p>
          <div className="w-12 h-px bg-gradient-to-r from-cyan-400 to-purple-400 mx-auto" />
        </div>

        {/* Links — GSAP staggers these on open */}
        <div ref={linksRef} className="flex flex-col items-center gap-8 w-full">
          {NAV_LINKS.map(({ href, label }) => (
            <button
              key={href}
              onClick={() => handleNavigate(href)}
              className={`relative text-4xl font-light tracking-[0.15em] transition-colors duration-300 group ${isActive(href) ? "text-cyan-400" : "text-white/80 hover:text-white"
                }`}
            >
              {isActive(href) && (
                <span
                  className="absolute -left-7 top-1/2 -translate-y-1/2 w-2 h-2 bg-cyan-400 rounded-full"
                  style={{ boxShadow: "0 0 8px #22d3ee" }}
                />
              )}
              {label}
              <span className="absolute -bottom-1 left-0 w-0 h-px bg-gradient-to-r from-cyan-400 to-purple-400 group-hover:w-full transition-all duration-300" />
            </button>
          ))}
        </div>

        {/* Footer strip */}
        <div className="absolute bottom-8 left-0 right-0 text-center">
          <p className="text-xs text-white/30 tracking-widest font-mono">TxNB ESPORTS © 2026</p>
        </div>
      </div>
    </>
  );
}
