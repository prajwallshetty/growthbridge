"use client";
import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Link from "next/link";

const navLinks = [
  { name: "Work", href: "#work" },
  { name: "Services", href: "#services" },
  { name: "About", href: "#about" },
  { name: "Contact", href: "#contact" },
];

export function FloatingNav() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 40);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <motion.header
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      className="fixed top-0 left-0 right-0 z-[100] flex justify-center px-4 pt-5"
    >
      <nav
        className="flex items-center justify-between w-full transition-all duration-500 ease-out"
        style={{
          maxWidth: 960,
          background: scrolled ? "rgba(255,255,255,0.95)" : "rgba(255,255,255,0.85)",
          backdropFilter: scrolled ? "blur(12px)" : "blur(8px)",
          border: "1px solid #E9E3DA",
          borderRadius: 100,
          padding: "12px 12px 12px 28px",
          boxShadow: scrolled
            ? "0 4px 20px rgba(0,0,0,0.06), 0 12px 40px rgba(0,0,0,0.04)"
            : "0 4px 20px rgba(0,0,0,0.03), 0 12px 40px rgba(0,0,0,0.02)",
        }}
      >
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 shrink-0">
          <div
            className="flex items-center justify-center"
            style={{
              width: 32,
              height: 32,
              borderRadius: 10,
              background: "#111111",
            }}
          >
            <span style={{ color: "#F4C542", fontWeight: 800, fontSize: 16, lineHeight: 1 }}>G</span>
          </div>
          <span
            style={{
              fontWeight: 700,
              fontSize: 17,
              color: "#111111",
              letterSpacing: "-0.01em",
            }}
          >
            Growth Bridge
          </span>
        </Link>

        {/* Center Links */}
        <div className="hidden md:flex items-center gap-1">
          {navLinks.map((link) => (
            <Link
              key={link.name}
              href={link.href}
              className="relative px-4 py-2 text-sm font-medium transition-colors duration-200"
              style={{ color: "#6A6A6A" }}
              onMouseEnter={(e) => {
                e.currentTarget.style.color = "#111111";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.color = "#6A6A6A";
              }}
            >
              {link.name}
            </Link>
          ))}
        </div>

        {/* CTA Button */}
        <Link
          href="#contact"
          className="shrink-0 hidden sm:inline-flex items-center transition-all duration-300"
          style={{
            background: "#111111",
            color: "#FFFFFF",
            fontSize: 14,
            fontWeight: 600,
            padding: "10px 24px",
            borderRadius: 100,
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = "#222222";
            e.currentTarget.style.transform = "scale(1.03)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = "#111111";
            e.currentTarget.style.transform = "scale(1)";
          }}
        >
          Start a Project
        </Link>
      </nav>
    </motion.header>
  );
}
