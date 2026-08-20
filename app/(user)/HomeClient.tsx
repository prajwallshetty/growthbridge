"use client";

import React, { useState, useRef, useEffect } from "react";
import {
  motion,
  useScroll,
  useTransform,
  useInView,
  AnimatePresence,
  useMotionValueEvent,
} from "framer-motion";
import { ArrowRight, ArrowUpRight, Mail, Plus, Sparkles, Menu, X, MapPin, Check } from "lucide-react";
import SideRays from "@/components/ui/SideRays";
import { CardContainer, CardBody, CardItem } from "@/components/ui/3d-card";
import { AnimatedTooltip } from "@/components/ui/animated-tooltip";
import PortfolioGrid from "@/components/portfolio/PortfolioGrid";

const EASE = [0.22, 1, 0.36, 1] as const;

function Reveal({
  children,
  delay = 0,
  className = "",
}: {
  children: React.ReactNode;
  delay?: number;
  className?: string;
}) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 28 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.7, delay, ease: EASE }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

function CountUp({
  to,
  suffix = "",
  prefix = "",
  duration = 1.4,
}: {
  to: number;
  suffix?: string;
  prefix?: string;
  duration?: number;
}) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-20px" });
  const [val, setVal] = useState(0);

  useEffect(() => {
    if (!inView) return;
    let start: number | null = null;
    let raf: number;
    const step = (ts: number) => {
      if (start === null) start = ts;
      const progress = Math.min((ts - start) / (duration * 1000), 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setVal(Math.round(to * eased));
      if (progress < 1) raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [inView, to, duration]);

  return (
    <span ref={ref}>
      {prefix}
      {val}
      {suffix}
    </span>
  );
}

function MagneticButton({
  href,
  children,
  className = "",
}: {
  href: string;
  children: React.ReactNode;
  className?: string;
}) {
  const ref = useRef<HTMLAnchorElement>(null);
  const [pos, setPos] = useState({ x: 0, y: 0 });

  return (
    <motion.a
      ref={ref}
      href={href}
      onMouseMove={(e) => {
        const rect = ref.current?.getBoundingClientRect();
        if (!rect) return;
        const x = (e.clientX - rect.left - rect.width / 2) * 0.3;
        const y = (e.clientY - rect.top - rect.height / 2) * 0.3;
        setPos({ x, y });
      }}
      onMouseLeave={() => setPos({ x: 0, y: 0 })}
      animate={{ x: pos.x, y: pos.y }}
      transition={{ type: "spring", stiffness: 150, damping: 12 }}
      className={className}
    >
      {children}
    </motion.a>
  );
}

const SECTION_COUNT = 9;

function Folio({ index, label }: { index: number; label: string }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true });
  return (
    <div ref={ref} className="mb-12 flex items-center gap-4 lg:mb-16">
      <span className="font-mono text-[13px] tracking-[0.05em] text-[#A8A296]">
        — {String(index).padStart(2, "0")} / {String(SECTION_COUNT).padStart(2, "0")}
      </span>
      <motion.span
        initial={{ scaleX: 0 }}
        animate={inView ? { scaleX: 1 } : {}}
        transition={{ duration: 0.8, ease: EASE }}
        style={{ originX: 0 }}
        className="h-px flex-1 bg-[#E9E3DA]"
      />
      <span className="text-[13px] font-semibold uppercase tracking-[0.12em] text-[#6A6A6A]">
        {label}
      </span>
    </div>
  );
}

interface HomeClientProps {
  homepage: any;
  services: any[];
  projects: any[];
  testimonials: any[];
  settings: any;
  blogs: any[];
}

export default function HomeClient({
  homepage,
  services,
  projects,
  testimonials,
  settings,
  blogs,
}: HomeClientProps) {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (loading) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    const timer = setTimeout(() => {
      setLoading(false);
    }, 1000);
    return () => {
      document.body.style.overflow = "";
      clearTimeout(timer);
    };
  }, [loading]);

  // Configs with Fallbacks
  const heroTitle = homepage?.heroTitle || "Build your startup with Growth Bridge.";
  const heroDescription = homepage?.heroDescription || "A design and engineering partner for founders who value quality, clarity, and momentum. We bridge complex engineering with premium aesthetics.";
  const heroBtnText = homepage?.heroBtnText || "Start a project";
  const heroBtnUrl = homepage?.heroBtnUrl || "/contact";

  const showSelectedWork = homepage?.showSelectedWork !== false;
  const showProcess = homepage?.showProcess !== false;
  const showTestimonials = homepage?.showTestimonials !== false;

  const contactEmail = settings?.contactEmail || "hello@growthbridge.live";
  const phoneNumber = settings?.phoneNumber || "+91 62827 59863";
  const officeAddress = settings?.officeAddress || "Kadri Temple Road, Kadri, Mangalore, Karnataka, India - 575002";
  const socialTwitter = settings?.socialTwitter || "https://twitter.com/growthbridge";
  const socialLinkedin = settings?.socialLinkedin || "https://linkedin.com/company/growthbridge";
  const socialGithub = settings?.socialGithub || "https://github.com/growthbridge";

  const displayProjects = (projects || [])
    .filter((p) => p.featured)
    .map((p) => ({
      title: p.title,
      category: p.category,
      description: p.description,
      result: p.resultMetric || "+100% impact",
      image: p.image || "/project-pulse.png",
      liveUrl: p.liveUrl || "",
      completed: p.completed ?? false,
    }));

  // Default services fallback
  const defaultServices = [
    {
      title: "Website development",
      description: "Fast, polished marketing sites designed to convert visitors into pipeline. Every pixel intentional, every load time respected.",
    },
    {
      title: "Brand strategy",
      description: "Positioning, naming, and visual language built on a point of view you can actually defend in a room full of competitors.",
    },
    {
      title: "Product design",
      description: "Interfaces shaped around clarity and momentum — wireframes through to a system your engineers can build without guessing.",
    },
    {
      title: "Growth marketing",
      description: "Funnels and experiment systems that turn attention into measurable, compounding pipeline rather than one-off spikes.",
    },
    {
      title: "AI automation",
      description: "Workflow systems that remove repetitive ops work so your team's time goes toward the calls only a person can make.",
    },
    {
      title: "Product development",
      description: "From prototype to launch-ready build, engineered with the same restraint and pace as the design that precedes it.",
    },
  ];

  const displayServices = services && services.length > 0 ? services : defaultServices;

  const displayTestimonials = (testimonials || []).map((t) => ({
    name: t.name,
    designation: t.designation || t.title || "Client Partner",
    image: t.image || "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&h=150&fit=crop&crop=face",
    quote: t.quote,
  }));

  return (
    <>
      <AnimatePresence>
        {loading && (
          <motion.div
            initial={{ opacity: 1 }}
            exit={{
              opacity: 0,
              y: -40,
              transition: { duration: 0.8, ease: [0.76, 0, 0.24, 1] }
            }}
            className="fixed inset-0 z-[9999] bg-[#FCFBF8] flex flex-col items-center justify-center select-none"
          >
            {/* Glowing background ray */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_rgba(244,197,66,0.06)_0%,_transparent_55%)] pointer-events-none" />

            <div className="relative flex flex-col items-center">
              {/* Text Animation */}
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, ease: EASE }}
                className="flex items-center gap-2"
              >
                <span className="text-[28px] md:text-[36px] font-extrabold tracking-tight text-[#111111]">
                  Growth Bridge
                </span>
                <motion.span
                  animate={{ scale: [1, 1.3, 1] }}
                  transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut" }}
                  className="h-2 w-2 rounded-full bg-[#F4C542] mt-2.5"
                />
              </motion.div>

              {/* Progress bar line */}
              <div className="w-[140px] h-[1px] bg-[#E9E3DA] overflow-hidden mt-6 rounded-full relative">
                <motion.div
                  initial={{ left: "-100%" }}
                  animate={{ left: "100%" }}
                  transition={{
                    duration: 0.9,
                    ease: [0.65, 0, 0.35, 1],
                  }}
                  className="absolute top-0 bottom-0 left-0 w-full bg-[#111111]"
                />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <main className="min-h-screen bg-[#FCFBF8] text-[#111111] relative overflow-hidden">
        {/* SideRays background effect to create dynamic elegant borders */}
        <div className="pointer-events-none fixed inset-0 z-10 opacity-[0.35]">
          <SideRays
            speed={0.8}
            rayColor1="#111111"
            rayColor2="#E9E3DA"
            intensity={1.0}
            spread={1.5}
            origin="top-right"
            tilt={0}
            saturation={0.5}
            blend={0.5}
            falloff={1.4}
            opacity={0.3}
          />
          <SideRays
            speed={0.6}
            rayColor1="#E9E3DA"
            rayColor2="#111111"
            intensity={0.8}
            spread={1.2}
            origin="top-left"
            tilt={10}
            saturation={0.5}
            blend={0.5}
            falloff={1.4}
            opacity={0.2}
          />
        </div>

        <Nav heroBtnText={heroBtnText} heroBtnUrl={heroBtnUrl} />
        <Hero
          heroTitle={heroTitle}
          heroDescription={heroDescription}
          heroBtnText={heroBtnText}
          heroBtnUrl={heroBtnUrl}
        />
        <AboutSection />
        {showSelectedWork && <SelectedWork projects={displayProjects} heroBtnUrl={heroBtnUrl} />}
        <ServicesSection servicesList={displayServices} />
        <GlobalPresenceSection settings={settings} />
        <WhyChooseUs />
        {showProcess && <Process heroBtnUrl={heroBtnUrl} />}
        {showTestimonials && <TestimonialsSection testimonials={displayTestimonials} />}
        <LatestBlogs blogs={blogs} />
        <FaqSection />
        <ContactCta contactEmail={contactEmail} heroBtnUrl={heroBtnUrl} settings={settings} />
      </main>
    </>
  );
}

/* ============================== NAV ============================== */

function Nav({ heroBtnText, heroBtnUrl }: { heroBtnText: string; heroBtnUrl: string }) {
  const links = [
    { name: "About", link: "/#about" },
    { name: "Work", link: "/#work" },
    { name: "Why Us", link: "/#why-us" },
    { name: "Process", link: "/#process" },
    { name: "Blogs", link: "/#blogs" },
    { name: "Team", link: "/team" },
    { name: "Contact", link: "/contact" },
  ];
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [hovered, setHovered] = useState<number | null>(null);
  const [visible, setVisible] = useState(false);

  const { scrollY } = useScroll();

  useMotionValueEvent(scrollY, "change", (latest) => {
    if (latest > 80) {
      setVisible(true);
    } else {
      setVisible(false);
    }
  });

  return (
    <div className="relative w-full">
      <div className="fixed inset-x-0 top-0 z-40 w-full">
        {/* ═══════════ Desktop Navigation ═══════════ */}
        <motion.div
          initial={false}
          animate={{
            boxShadow: visible
              ? "0 4px 20px rgba(0, 0, 0, 0.04), 0 12px 40px rgba(0, 0, 0, 0.03)"
              : "none",
            width: visible ? "85%" : "100%",
            maxWidth: visible ? "1080px" : "1280px",
            y: visible ? 20 : 0,
          }}
          transition={{
            type: "spring",
            stiffness: 200,
            damping: 50,
          }}
          className={`relative z-[60] mx-auto hidden w-full flex-row items-center justify-between px-6 py-3 lg:flex transition-colors duration-300 ${visible
            ? "bg-[#FCFBF8]/95 border border-[#E9E3DA] backdrop-blur-md rounded-full shadow-lg"
            : "bg-transparent border-transparent"
            }`}
        >
          {/* Logo */}
          <a href="#top" className="flex items-center gap-2 z-20 shrink-0">
            <span className="text-[17px] font-bold tracking-tight text-[#111111]">Growth Bridge</span>
          </a>

          {/* Center links with capsule hover animation */}
          <motion.div
            onMouseLeave={() => setHovered(null)}
            className={`absolute inset-0 hidden flex-row items-center justify-center text-[14px] font-medium lg:flex gap-1`}
          >
            {links.map((item, idx) => (
              <a
                key={item.name}
                href={item.link}
                onMouseEnter={() => setHovered(idx)}
                className={`relative px-4 py-2 transition-all duration-300 text-[#6A6A6A] hover:text-[#111111] font-semibold`}
              >
                {hovered === idx && (
                  <motion.div
                    layoutId="hoveredNav"
                    className="absolute inset-0 h-full w-full rounded-full bg-[#111111]/5"
                    transition={{ type: "spring", stiffness: 380, damping: 30 }}
                  />
                )}
                <span className="relative z-20">{item.name}</span>
              </a>
            ))}
          </motion.div>

          {/* CTA Button */}
          <div className="z-20">
            <MagneticButton
              href={heroBtnUrl}
              className="rounded-full bg-[#111111] px-5 py-2.5 text-[13px] font-semibold text-white transition-all hover:bg-[#2a2a2a] shadow-sm"
            >
              {heroBtnText}
            </MagneticButton>
          </div>
        </motion.div>

        {/* ═══════════ Mobile Navigation ═══════════ */}
        <div className="flex w-full justify-center lg:hidden relative z-50">
          <div className="w-[calc(100%-2rem)] max-w-[480px] flex items-center justify-between px-5 py-2.5 bg-[#FCFBF8]/95 border border-[#E9E3DA] backdrop-blur-md rounded-full shadow-lg mt-4">
            <a href="#top" className="flex items-center gap-1.5 shrink-0">
              <span className="text-[15px] font-extrabold tracking-tight text-[#111111]">Growth Bridge</span>
              <span className="h-1.5 w-1.5 rounded-full bg-[#F4C542] animate-pulse" />
            </a>
            <button
              className="h-9 w-9 flex items-center justify-center text-[#111111] hover:bg-[#111111]/5 rounded-full border border-[#E9E3DA] transition-all"
              onClick={() => setIsMobileMenuOpen(true)}
              aria-label="Open menu"
            >
              <Menu size={16} />
            </button>
          </div>
        </div>

        {/* ═══════════ Slide-out Drawer Panel ═══════════ */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <>
              {/* Backdrop blur/dim */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setIsMobileMenuOpen(false)}
                className="fixed inset-0 z-[100] bg-black/20 backdrop-blur-sm lg:hidden"
              />

              {/* Drawer Container */}
              <motion.div
                initial={{ x: "100%" }}
                animate={{ x: 0 }}
                exit={{ x: "100%" }}
                transition={{ type: "spring", stiffness: 380, damping: 35 }}
                className="fixed inset-y-0 right-0 z-[101] w-[290px] bg-[#FCFBF8] border-l border-[#E9E3DA] shadow-2xl p-6 flex flex-col justify-between lg:hidden"
              >
                <div>
                  <div className="flex justify-between items-center pb-6 border-b border-[#E9E3DA]">
                    <span className="text-[15px] font-bold text-[#111111] uppercase tracking-wider">Navigation</span>
                    <button
                      className="p-2 text-[#6A6A6A] hover:text-[#111111] rounded-full border border-[#E9E3DA] hover:border-[#111111] transition-colors"
                      onClick={() => setIsMobileMenuOpen(false)}
                      aria-label="Close menu"
                    >
                      <X size={16} />
                    </button>
                  </div>

                  <nav className="flex flex-col gap-1.5 pt-6">
                    {links.map((item) => (
                      <a
                        key={item.name}
                        href={item.link}
                        onClick={() => setIsMobileMenuOpen(false)}
                        className="text-[#6A6A6A] hover:text-[#111111] hover:bg-[#111111]/5 py-3 px-4 rounded-xl transition-all font-semibold uppercase tracking-wider text-[12px] block"
                      >
                        {item.name}
                      </a>
                    ))}
                  </nav>
                </div>

                <div className="pt-6 border-t border-[#E9E3DA]">
                  <a
                    href={heroBtnUrl}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="block w-full text-center rounded-full bg-[#111111] py-3.5 text-[13px] font-bold text-white hover:bg-[#2a2a2a] transition-colors"
                  >
                    {heroBtnText}
                  </a>
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </div>

      {/* Spacer to prevent layout shift */}
      <div className="h-20" />
    </div>
  );
}

/* ============================== HERO ============================== */

function Hero({
  heroTitle,
  heroDescription,
  heroBtnText,
  heroBtnUrl,
}: {
  heroTitle: string;
  heroDescription: string;
  heroBtnText: string;
  heroBtnUrl: string;
}) {
  const sectionRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end start"],
  });
  const glowY = useTransform(scrollYProgress, [0, 1], [0, 120]);
  const textY = useTransform(scrollYProgress, [0, 1], [0, 60]);

  return (
    <section
      id="top"
      ref={sectionRef}
      className="relative overflow-hidden pt-16 pb-24 lg:pt-24 lg:pb-32"
    >
      {/* layered background: grain + radial glow, tied to scroll */}
      <motion.div
        style={{ y: glowY }}
        className="pointer-events-none absolute -top-40 right-[-10%] h-[560px] w-[560px] rounded-full opacity-60 blur-[80px]"
        aria-hidden
      >
        <div className="h-full w-full rounded-full bg-[radial-gradient(circle,_#F4C542_0%,_transparent_70%)]" />
      </motion.div>
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.035] mix-blend-multiply"
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")",
        }}
        aria-hidden
      />

      <motion.div style={{ y: textY }} className="relative mx-auto max-w-[1280px] px-6 md:px-12">
        <div className="grid grid-cols-1 items-center gap-16 lg:grid-cols-12">
          <div className="lg:col-span-7">
            <motion.span
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease: EASE }}
              className="inline-flex items-center gap-2 text-[13px] font-semibold uppercase tracking-[0.12em] text-[#6A6A6A]"
            >
            </motion.span>

            <motion.h1
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.1, ease: EASE }}
              className="-ml-1 mt-5 text-[clamp(40px,5vw,72px)] font-extrabold leading-[1.05] tracking-[-0.03em]"
            >
              {heroTitle}
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.3, ease: EASE }}
              className="mt-6 max-w-[540px] text-[18px] leading-[1.65] text-[#6A6A6A]"
            >
              {heroDescription}
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.4, ease: EASE }}
              className="mt-8 flex flex-wrap gap-4"
            >
              <MagneticButton
                href={heroBtnUrl}
                className="flex items-center gap-2 rounded-full bg-[#111111] px-7 py-4 text-[14px] font-semibold text-white transition-colors hover:bg-[#2a2a2a]"
              >
                {heroBtnText} <ArrowRight size={16} />
              </MagneticButton>
              <a
                href="#about"
                className="flex items-center gap-2 rounded-full border border-[#E9E3DA] bg-white/50 px-7 py-4 text-[14px] font-semibold text-[#111111] transition-all hover:bg-white hover:border-[#111111]"
              >
                Learn More
              </a>
            </motion.div>
          </div>

          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.2, ease: EASE }}
            className="lg:col-span-5 flex justify-center float-gentle"
          >
            <div className="relative w-full max-w-[480px] aspect-square rounded-[24px] bg-[#FCFBF8] border border-[#E9E3DA] p-6 shadow-[0_15px_45px_rgba(0,0,0,0.03)] flex items-center justify-center">
              <img
                src="/hero.svg"
                alt="Growth Bridge Digital Artwork"
                className="w-full h-auto object-contain max-h-[420px]"
              />
            </div>
          </motion.div>
        </div>
      </motion.div>
    </section>
  );
}

/* ============================ STATS BAND ============================ */

const STATS = [
  { value: "52", suffix: "+", label: "Creative projects shipped since 2019" },
  { value: "14", suffix: " Days", label: "Average timeline to first prototype" },
  { value: "94", suffix: "%", label: "Client retention and rebook rate" },
  { value: "100", suffix: "%", label: "Committed transparency & alignment" },
];

function StatsBand() {
  return (
    <div className="border-y border-[#E9E3DA] bg-white/30 py-12 rounded-[24px] px-8">
      <div className="grid grid-cols-2 gap-8 lg:grid-cols-4">
        {STATS.map((s, i) => (
          <Reveal key={s.label} delay={i * 0.05}>
            <div className="text-[clamp(28px,3vw,38px)] font-extrabold tracking-tight text-[#111111]">
              <CountUp to={parseInt(s.value)} suffix={s.suffix} />
            </div>
            <p className="mt-1 text-[13px] font-medium leading-[1.4] text-[#6A6A6A]">{s.label}</p>
          </Reveal>
        ))}
      </div>
    </div>
  );
}

/* ===================== CAPABILITIES MARQUEE ===================== */

const CAPABILITIES = [
  "Brand strategy",
  "Webflow",
  "Next.js",
  "Figma systems",
  "Lifecycle email",
  "Paid media",
  "SEO architecture",
  "Product design",
  "AI workflows",
  "Motion design",
];

function CapabilitiesMarquee() {
  const loop = [...CAPABILITIES, ...CAPABILITIES];
  return (
    <section className="overflow-hidden border-b border-[#E9E3DA] bg-[#111111] py-5">
      <div className="flex w-max animate-[marquee_28s_linear_infinite] gap-12">
        {loop.map((cap, i) => (
          <span
            key={i}
            className="flex items-center gap-3 whitespace-nowrap text-[15px] font-semibold uppercase tracking-[0.08em] text-[#FCFBF8]/80"
          >
            {cap}
            <span className="h-1.5 w-1.5 rounded-full bg-[#F4C542]" />
          </span>
        ))}
      </div>
      <style>{`
        @keyframes marquee {
          from {
            transform: translateX(0);
          }
          to {
            transform: translateX(-50%);
          }
        }
      `}</style>
    </section>
  );
}

/* ==================== ABOUT GROWTH BRIDGE ==================== */

function AboutSection() {
  return (
    <section id="about" className="py-24 lg:py-32 border-t border-[#E9E3DA]">
      <div className="mx-auto max-w-[1280px] px-6 md:px-12">
        <Reveal>
          <Folio index={1} label="About Growth Bridge" />
        </Reveal>

        <div className="grid grid-cols-1 gap-12 lg:grid-cols-[0.8fr_1.2fr] items-start mb-20">
          <Reveal>
            <h2 className="text-[clamp(32px,4.5vw,56px)] font-extrabold leading-[1.05] tracking-[-0.03em]">
              Bridging elite design
              <br />
              with engineering.
            </h2>
          </Reveal>

          <Reveal delay={0.15}>
            <div className="flex flex-col gap-6 text-[15px] leading-[1.75] text-[#6A6A6A]">
              <p className="text-[18px] text-[#111111] font-medium leading-[1.6]">
                We are a boutique studio of designers and developers, working directly with founders to build clean, premium interfaces that endure.
              </p>
              <p>
                Most agencies pass your design from senior directors down to junior developers who copy templates. At Growth Bridge, we eliminate administrative overhead. Our creators code, and our coders design. The builder you talk to in our first call is the one writing the components for your platform.
              </p>
            </div>
          </Reveal>
        </div>

        <StatsBand />
      </div>
    </section>
  );
}

function ServicesSection({ servicesList }: { servicesList: any[] }) {
  return (
    <section id="services" className="py-24 lg:py-32 border-t border-[#E9E3DA]">
      <div className="mx-auto max-w-[1280px] px-6 md:px-12">
        <Reveal>
          <Folio index={3} label="Our Disciplines" />
        </Reveal>
        <Services servicesList={servicesList} />
      </div>
    </section>
  );
}

/* ========================= SELECTED WORK ========================= */

function SelectedWork({ projects, heroBtnUrl }: { projects: any[]; heroBtnUrl: string }) {
  return (
    <section id="work" className="py-24 lg:py-32 border-t border-[#E9E3DA]">
      <div className="mx-auto max-w-[1280px] px-6 md:px-12">
        <Reveal>
          <Folio index={2} label="Featured Projects" />
        </Reveal>

        <Reveal>
          <h2 className="text-[clamp(32px,4.5vw,56px)] font-extrabold tracking-[-0.03em] mb-8">
            Projects that speak
            <br />
            for themselves.
          </h2>
        </Reveal>

        <PortfolioGrid projects={projects} />

        <div className="flex justify-center mt-14">
          <Reveal delay={0.1}>
            <a
              href="/projects"
              className="inline-flex items-center gap-2 rounded-full border border-[#111111] bg-[#111111] hover:bg-transparent text-white hover:text-[#111111] px-8 py-4 text-[14px] font-semibold transition-all duration-300 shadow-sm hover:shadow-md group"
            >
              View all projects
              <ArrowRight size={16} className="transform group-hover:translate-x-1 transition-transform" />
            </a>
          </Reveal>
        </div>
      </div>
    </section>
  );
}

/* ============================ INDUSTRIES ============================ */

const INDUSTRIES = [
  { name: "E-commerce & DTC", count: "14 projects", detail: "Storefronts, lifecycle email, retention systems." },
  { name: "Healthcare", count: "9 projects", detail: "Booking funnels, compliance-aware UX, local SEO." },
  { name: "B2B SaaS", count: "18 projects", detail: "Launch sites, onboarding flows, PLG instrumentation." },
  { name: "Consumer apps", count: "7 projects", detail: "Brand systems, App Store pages, growth loops." },
  { name: "Hospitality", count: "5 projects", detail: "Booking experiences, photography direction, local presence." },
  { name: "Fintech", count: "4 projects", detail: "Trust-first UI, regulatory-aware copy, dashboarding." },
];

function Industries() {
  return (
    <div className="grid grid-cols-1 gap-px overflow-hidden rounded-[8px] border border-[#E9E3DA] bg-[#E9E3DA] sm:grid-cols-2 lg:grid-cols-3">
      {INDUSTRIES.map((ind, i) => (
        <motion.div
          key={ind.name}
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.5, delay: (i % 3) * 0.08, ease: EASE }}
          whileHover={{ backgroundColor: "#FFFFFF" }}
          className="group flex flex-col justify-between bg-[#FCFBF8] p-7"
          style={{ minHeight: 180 }}
        >
          <div>
            <h3 className="text-[18px] font-bold tracking-tight">{ind.name}</h3>
            <p className="mt-2 text-[14px] leading-[1.6] text-[#6A6A6A]">{ind.detail}</p>
          </div>
          <div className="mt-4 flex items-center justify-between">
            <span className="text-[12px] font-semibold uppercase tracking-[0.08em] text-[#A8A296]">
              {ind.count}
            </span>
            <motion.span
              initial={{ x: -4, opacity: 0 }}
              whileHover={{ x: 0, opacity: 1 }}
              className="text-[#111111]"
            >
              <ArrowUpRight size={16} />
            </motion.span>
          </div>
        </motion.div>
      ))}
    </div>
  );
}

/* ============================ SERVICES ============================ */

function Services({ servicesList }: { servicesList: any[] }) {
  const [open, setOpen] = useState(0);

  return (
    <div className="grid grid-cols-1 gap-12 lg:grid-cols-[0.7fr_1.3fr]">
      <Reveal>
        <h2 className="text-[clamp(32px,4.5vw,56px)] font-extrabold leading-[1.05] tracking-[-0.03em]">
          Six disciplines.
          <br />
          One accountable
          <br />
          team.
        </h2>
      </Reveal>

      <Reveal delay={0.15} className="border-t border-[#111111]">
        {servicesList.map((service, i) => {
          const isOpen = open === i;
          return (
            <div key={service.title} className="border-b border-[#E9E3DA]">
              <motion.button
                onClick={() => setOpen(isOpen ? -1 : i)}
                whileHover={{ paddingLeft: 8 }}
                transition={{ duration: 0.3 }}
                className="flex w-full items-center gap-6 py-6 text-left"
              >
                <span className="font-mono text-[13px] text-[#A8A296]">
                  0{i + 1}
                </span>
                <span className="flex-1 text-[20px] font-bold tracking-tight sm:text-[24px]">
                  {service.title}
                </span>
                <motion.span
                  animate={{ rotate: isOpen ? 45 : 0 }}
                  transition={{ duration: 0.3, ease: EASE }}
                  className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full border border-[#E9E3DA]"
                >
                  <Plus size={15} />
                </motion.span>
              </motion.button>
              <AnimatePresence>
                {isOpen && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.35, ease: EASE }}
                    className="overflow-hidden"
                  >
                    <p className="max-w-[480px] pb-6 pl-[40px] text-[15px] leading-[1.7] text-[#6A6A6A]">
                      {service.description}
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}
      </Reveal>
    </div>
  );
}

/* ============================ WHY CHOOSE US ============================ */

const comparison = [
  {
    without: "Three agencies for brand, build, and growth — none of them talking to each other.",
    with: "One team, accountable for the whole funnel, from first sketch to the dashboard you check on Monday.",
  },
  {
    without: "A 40-slide deck of options, due back to you to make the actual decision.",
    with: "One strong direction, argued for clearly, because you hired a point of view, not a menu.",
  },
  {
    without: "A black-box handoff you can't extend without calling us again.",
    with: "Documented source files and a system your own team can build on without us in the room.",
  },
];

function WhyChooseUs() {
  return (
    <section id="why-us" className="border-t border-[#E9E3DA] bg-white/40 py-24 lg:py-32">
      <div className="mx-auto max-w-[1280px] px-6 md:px-12">
        <Reveal>
          <Folio index={5} label="Why Choose Us" />
        </Reveal>

        <Reveal>
          <h2 className="max-w-[640px] text-[clamp(32px,4.5vw,56px)] font-extrabold leading-[1.05] tracking-[-0.03em] mb-14">
            Built different,
            <br />
            and built to prove it.
          </h2>
        </Reveal>

        <Reveal delay={0.15} className="overflow-hidden rounded-[8px] border border-[#E9E3DA] shadow-[0_20px_50px_-30px_rgba(0,0,0,0.15)]">
          <div className="grid grid-cols-2 border-b border-[#E9E3DA] bg-[#FCFBF8]">
            <div className="border-r border-[#E9E3DA] px-7 py-4">
              <span className="text-[13px] font-semibold uppercase tracking-[0.1em] text-[#A8A296]">
                The usual way
              </span>
            </div>
            <div className="px-7 py-4">
              <span className="text-[13px] font-semibold uppercase tracking-[0.1em] text-[#111111]">
                The Growth Bridge way
              </span>
            </div>
          </div>
          {comparison.map((row, i) => (
            <div
              key={i}
              className={`grid grid-cols-2 ${i !== comparison.length - 1 ? "border-b border-[#E9E3DA]" : ""}`}
            >
              <div className="border-r border-[#E9E3DA] px-7 py-7">
                <p className="text-[15px] leading-[1.7] text-[#A8A296]">{row.without}</p>
              </div>
              <div className="bg-white px-7 py-7">
                <p className="text-[15px] font-medium leading-[1.7] text-[#111111]">{row.with}</p>
              </div>
            </div>
          ))}
        </Reveal>


        <div className="mt-24 pt-20 border-t border-[#E9E3DA]/60">
          <Industries />
        </div>
      </div>
    </section>
  );
}

/* ============================== PROCESS ============================== */

const processSteps = [
  { number: "01", title: "Discover", description: "A deep-dive into your business, audience, and goals to find the real opportunity, not the obvious one." },
  { number: "02", title: "Design", description: "Editorial-quality interfaces that balance beauty with conversion logic — argued for, not A/B tested into existence." },
  { number: "03", title: "Develop", description: "Fast, robust, and scalable builds, with clean handoff documentation from day one." },
  { number: "04", title: "Launch", description: "Analytics, automations, and campaign surfaces connected before launch day, not patched on after." },
  { number: "05", title: "Grow", description: "Ongoing experimentation that compounds the result instead of resetting the clock every quarter." },
];

function Process({ heroBtnUrl }: { heroBtnUrl: string }) {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start 80%", "end 60%"],
  });

  return (
    <section id="process" className="border-t border-[#E9E3DA] py-24 lg:py-32">
      <div className="mx-auto max-w-[1280px] px-6 md:px-12">
        <Reveal>
          <Folio index={6} label="Our process" />
        </Reveal>

        <Reveal>
          <h2 className="text-[clamp(32px,4.5vw,56px)] font-extrabold tracking-[-0.03em] mb-14">
            Five stages, always
            <br />
            in this order.
          </h2>
        </Reveal>

        <div className="grid grid-cols-1 gap-12 lg:grid-cols-12 mb-24">
          {/* Left Column: Timeline steps */}
          <div ref={ref} className="relative max-w-[680px] lg:col-span-7">
            <div className="absolute left-[19px] top-5 bottom-5 w-px bg-[#E9E3DA]" />
            <motion.div
              style={{ scaleY: scrollYProgress, originY: 0 }}
              className="absolute left-[19px] top-5 bottom-5 w-px bg-[#111111]"
            />
            {processSteps.map((step, i) => (
              <Reveal key={step.number} delay={i * 0.05}>
                <div className="relative flex gap-8 pb-12 last:pb-0">
                  <span className="relative z-10 flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-[#111111] font-mono text-[12px] font-bold text-[#F4C542]">
                    {step.number}
                  </span>
                  <div className="pt-1">
                    <h3 className="text-[20px] font-bold tracking-tight">{step.title}</h3>
                    <p className="mt-2 max-w-[460px] text-[15px] leading-[1.7] text-[#6A6A6A]">
                      {step.description}
                    </p>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>

          {/* Right Column: Frame-2.svg sticky mockup */}
          <div className="lg:col-span-5 hidden lg:block">
            <div className="sticky top-32 flex justify-center">
              <div className="relative w-full max-w-[380px] rounded-[24px] bg-[#FCFBF8] border border-[#E9E3DA] p-6 shadow-[0_15px_45px_rgba(0,0,0,0.03)] flex items-center justify-center">
                <img
                  src="/Frame-2.svg"
                  alt="Growth Bridge Process Blueprint"
                  className="w-full h-auto object-contain max-h-[500px]"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ======================== ENGAGEMENT MODELS ======================== */

const ENGAGEMENTS = [
  {
    name: "Project sprint",
    price: "$18k – $45k",
    cadence: "4–8 weeks",
    detail: "A single, scoped deliverable — a rebrand, a launch site, a redesign. Fixed price, fixed timeline.",
    featured: false,
  },
  {
    name: "Growth partnership",
    price: "$12k / mo",
    cadence: "3-month minimum",
    detail: "Ongoing design, build, and growth work across your roadmap — the model most of our clients land on.",
    featured: true,
  },
  {
    name: "Embedded team",
    price: "Custom",
    cadence: "6+ months",
    detail: "A dedicated pod working inside your existing tools and rituals, for teams scaling past what one hire could cover.",
    featured: false,
  },
];

function EngagementModels({ heroBtnUrl }: { heroBtnUrl: string }) {
  return (
    <div className="mx-auto max-w-[1280px]">
      <Reveal>
        <h2 className="max-w-[640px] text-[clamp(32px,4.5vw,56px)] font-extrabold leading-[1.05] tracking-[-0.03em]">
          Three ways to
          <br />
          work together.
        </h2>
      </Reveal>

      <div className="mt-14 grid grid-cols-1 gap-6 lg:grid-cols-3">
        {ENGAGEMENTS.map((e, i) => (
          <motion.div
            key={e.name}
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.6, delay: i * 0.1, ease: EASE }}
            whileHover={{ y: -6 }}
            className={`flex flex-col rounded-[10px] border p-8 transition-shadow ${e.featured
              ? "border-[#111111] bg-[#111111] text-white shadow-[0_30px_60px_-25px_rgba(0,0,0,0.4)]"
              : "border-[#E9E3DA] bg-[#FCFBF8] hover:shadow-[0_20px_45px_-25px_rgba(0,0,0,0.15)]"
              }`}
          >
            {e.featured && (
              <span className="mb-4 w-fit rounded-full bg-[#F4C542] px-3 py-1 text-[11px] font-bold uppercase tracking-[0.06em] text-[#111111]">
                Most common
              </span>
            )}
            <h3 className="text-[22px] font-bold tracking-tight">{e.name}</h3>
            <p className={`mt-4 text-[28px] font-extrabold tracking-tight ${e.featured ? "text-[#F4C542]" : ""}`}>
              {e.price}
            </p>
            <p className={`text-[13px] ${e.featured ? "text-white/60" : "text-[#A8A296]"}`}>
              {e.cadence}
            </p>
            <p className={`mt-5 flex-1 text-[14px] leading-[1.7] ${e.featured ? "text-white/80" : "text-[#6A6A6A]"}`}>
              {e.detail}
            </p>
            <a
              href={heroBtnUrl}
              className={`mt-7 flex items-center gap-2 text-[14px] font-semibold ${e.featured ? "text-white" : "text-[#111111]"
                }`}
            >
              Get in touch <ArrowRight size={15} />
            </a>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

/* ============================== TESTIMONIALS SECTION ============================== */

function TestimonialsSection({ testimonials }: { testimonials: any[] }) {
  const [active, setActive] = useState(0);

  return (
    <section className="border-t border-[#E9E3DA] py-24 lg:py-32 bg-white/20">
      <div className="mx-auto max-w-[1280px] px-6 md:px-12 text-center">
        <Reveal>
          <Folio index={7} label="What clients say" />
        </Reveal>

        <div className="max-w-[800px] mx-auto mt-12 flex flex-col items-center">
          {/* Testimonial Quote display */}
          <div className="min-h-[140px] mb-8">
            <AnimatePresence mode="wait">
              <motion.blockquote
                key={active}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                transition={{ duration: 0.4, ease: EASE }}
                className="text-[clamp(22px,2.8vw,34px)] font-medium leading-[1.4] tracking-[-0.01em] text-[#111111] italic"
              >
                "{testimonials[active]?.quote || ""}"
              </motion.blockquote>
            </AnimatePresence>
          </div>

          {/* Animated Tooltip (avatars list) */}
          <div className="flex flex-row items-center justify-center mb-6">
            <AnimatedTooltip
              items={testimonials.map((t, idx) => ({
                id: idx, // maps to index for selection
                name: t.name,
                designation: t.designation,
                image: t.image,
              }))}
            />
          </div>

          {/* Controls / Active author identifier */}
          <div className="flex gap-3 justify-center mt-4 flex-wrap">
            {testimonials.map((t, idx) => (
              <button
                key={t.name}
                onClick={() => setActive(idx)}
                className={`text-[13px] font-semibold transition-all py-1.5 px-4 rounded-full border ${idx === active
                  ? "bg-[#111111] text-white border-[#111111] shadow-sm scale-105"
                  : "bg-white text-[#6A6A6A] border-[#E9E3DA] hover:border-[#111111]"
                  }`}
              >
                {t.name}
              </button>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

/* ========================== LATEST BLOGS ========================== */

function LatestBlogs({ blogs }: { blogs: any[] }) {
  const latestBlogs = (blogs || []).slice(0, 3);

  return (
    <section id="blogs" className="border-t border-[#E9E3DA] py-24 lg:py-32">
      <div className="mx-auto max-w-[1280px] px-6 md:px-12">
        <Reveal>
          <Folio index={8} label="Latest Blogs" />
        </Reveal>

        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-14">
          <Reveal>
            <h2 className="text-[clamp(32px,4.5vw,56px)] font-extrabold leading-[1.05] tracking-[-0.03em]">
              Latest insights &
              <br />
              field notes.
            </h2>
          </Reveal>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {latestBlogs.map((b: any, i: number) => (
            <Reveal key={b._id} delay={i * 0.1}>
              <a
                href={`/blog/${b.slug}`}
                className="group flex flex-col h-full bg-white border border-[#E9E3DA] rounded-[24px] overflow-hidden hover:shadow-xl transition-all duration-300 cursor-pointer block"
              >
                <div className="h-48 overflow-hidden relative border-b border-[#E9E3DA]">
                  <img
                    src={b.image || "https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?w=600&auto=format&fit=crop&q=80"}
                    className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-500"
                    alt={b.title}
                  />
                  <div className="absolute top-4 left-4 flex gap-1.5 flex-wrap">
                    {(b.tags || []).slice(0, 2).map((t: string) => (
                      <span key={t} className="px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-wide bg-[#111111]/90 text-white rounded-full">
                        {t}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="p-6 flex-1 flex flex-col justify-between">
                  <div>
                    <span className="text-[11px] font-extrabold uppercase tracking-wider text-[#A8A296]">
                      {b.readTime || 3} min read
                    </span>
                    <h3 className="text-[18px] font-black text-[#111111] tracking-tight leading-[1.3] mt-2 group-hover:text-[#F4C542] transition-colors">
                      {b.title}
                    </h3>
                    <p className="text-[13px] leading-[1.6] text-[#6A6A6A] mt-3 line-clamp-2">
                      {b.subtitle || b.content}
                    </p>
                  </div>

                  <div className="flex items-center justify-between mt-6 pt-4 border-t border-[#E9E3DA]/60">
                    <span className="text-[12px] font-semibold text-[#6A6A6A]">
                      By {b.author || "Prajwal Shetty"}
                    </span>
                    <span className="text-[#111111] text-[12px] font-bold group-hover:translate-x-1.5 transition-transform flex items-center gap-1">
                      Read article <ArrowRight size={13} />
                    </span>
                  </div>
                </div>
              </a>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ============================ FAQ ============================ */

const FAQS = [
  {
    q: "How long does a typical project sprint take?",
    a: "Our project sprints generally take between 4 to 8 weeks, depending on complexity. We focus on delivering a high-fidelity first prototype within the first 14 days so we can iterate quickly together.",
  },
  {
    q: "What is a growth partnership?",
    a: "A growth partnership is our retainer model (minimum 3 months). It embeds our design and engineering team into your product roadmap, handling continuous feature launches, landing pages, and conversion optimizations.",
  },
  {
    q: "Do you offer post-launch support?",
    a: "Yes! Every project sprint includes 30 days of complimentary post-launch support. For long-term iterations and scaling, clients usually transition into a monthly growth partnership.",
  },
  {
    q: "How do you handle hosting and handoff?",
    a: "We provide complete handoff of clean, commented Next.js / Tailwind repositories and Figma systems. We also configure analytics, SEO tags, and CI/CD pipelines on platforms like Vercel or Netlify so your site is ready to launch.",
  },
];

function GlobalPresenceSection({ settings }: { settings: any }) {
  const [times, setTimes] = useState<{ [key: string]: string }>({});

  useEffect(() => {
    const updateTimes = () => {
      const getLocalTime = (tz: string) => {
        try {
          return new Intl.DateTimeFormat("en-US", {
            hour: "2-digit",
            minute: "2-digit",
            second: "2-digit",
            hour12: false,
            timeZone: tz,
          }).format(new Date());
        } catch {
          return new Date().toLocaleTimeString();
        }
      };

      const computed: { [key: string]: string } = {};
      computed["San Francisco"] = getLocalTime("America/Los_Angeles");
      computed["India"] = getLocalTime("Asia/Kolkata");
      computed["Germany"] = getLocalTime("Europe/Berlin");
      computed["German"] = getLocalTime("Europe/Berlin");
      computed["France"] = getLocalTime("Europe/Paris");
      computed["Poland"] = getLocalTime("Europe/Warsaw");
      setTimes(computed);
    };

    updateTimes();
    const interval = setInterval(updateTimes, 1000);
    return () => clearInterval(interval);
  }, []);

  const dbBranches = settings?.branches || [];
  const activeBranches = dbBranches.length > 0 ? dbBranches : [
    { name: "India", address: "Mangalore, India", status: "active" },
    { name: "Germany", address: "Munich, Germany", status: "active" },
    { name: "France", address: "Paris, France", status: "active" },
    { name: "Poland", address: "Warsaw, Poland", status: "coming_soon" }
  ];

  const locations = activeBranches.map((b: any) => {
      let tz = "UTC";
      let coords = "N/A";
      let flag = "🌐";
      let label = "Global Branch";

      const nameLower = b.name.toLowerCase();
      if (nameLower.includes("india")) {
        tz = "Asia/Kolkata";
        coords = "12.9141° N, 74.8560° E";
        flag = "🇮🇳";
        label = "Engineering Hub";
      } else if (nameLower.includes("german")) {
        tz = "Europe/Berlin";
        coords = "48.1351° N, 11.5820° E";
        flag = "🇩🇪";
        label = "Design Studio";
      } else if (nameLower.includes("france")) {
        tz = "Europe/Paris";
        coords = "48.8566° N, 2.3522° E";
        flag = "🇫🇷";
        label = "Creative Studio";
      } else if (nameLower.includes("poland")) {
        tz = "Europe/Warsaw";
        coords = "52.2297° N, 21.0122° E";
        flag = "🇵🇱";
        label = "Coming Soon";
      }

      return {
        name: b.name,
        label,
        tz,
        coords,
        flag,
        status: b.status,
        address: b.address
      };
  });

  return (
    <section id="network" className="border-t border-[#E9E3DA] py-24 lg:py-32 bg-white/40">
      <div className="mx-auto max-w-[1280px] px-6">
        <Reveal>
          <Folio index={4} label="Global Network" />
        </Reveal>

        <Reveal delay={0.1}>
          <div className="text-center mb-20 max-w-[620px] mx-auto">
            <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-[#E9E3DA] bg-white text-[11px] font-extrabold uppercase tracking-[0.15em] text-[#6A6A6A] shadow-sm mb-4">
              <Sparkles size={11} className="text-[#F4C542] animate-pulse" /> Our Footprint
            </span>
            <h2 className="text-[36px] md:text-[48px] font-extrabold tracking-tight text-[#111111] leading-[1.1] tracking-tight">
              A borderless partner for ambitious brands.
            </h2>
            <p className="mt-4 text-[14px] md:text-[15px] leading-[1.65] text-[#6A6A6A] font-medium">
              We bridge design and engineering disciplines across time zones. Here is where you can find our squads compiling layout components and pushing commits.
            </p>
          </div>
        </Reveal>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {locations.map((loc: any, idx: number) => {
            const isComingSoon = loc.status === "coming_soon";
            const currentTime = times[loc.name] || "--:--:--";

            return (
              <Reveal key={loc.name} delay={idx * 0.05}>
                <div className={`group p-6 rounded-[28px] border transition-all duration-500 bg-white flex flex-col justify-between min-h-[220px] shadow-[0_4px_25px_rgba(0,0,0,0.01)] hover:shadow-[0_15px_35px_rgba(0,0,0,0.04)] relative overflow-hidden ${
                  isComingSoon 
                    ? "border-dashed border-[#E9E3DA]/80 opacity-80" 
                    : "border-[#E9E3DA] hover:border-[#111111]"
                }`}>
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_rgba(244,197,66,0.05)_0%,_transparent_50%)] opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />

                  <div>
                    <div className="flex items-start justify-between">
                      <div className="flex flex-col gap-1">
                        <span className="text-[28px] leading-none mb-2">{loc.flag}</span>
                        <h3 className="text-[17px] font-extrabold tracking-tight text-[#111111]">
                          {loc.name}
                        </h3>
                        <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#A8A296]">
                          {loc.label}
                        </span>
                      </div>

                      <span className="relative flex h-2 w-2 mt-2">
                        {isComingSoon ? (
                          <>
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-400"></span>
                          </>
                        ) : (
                          <>
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-500 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                          </>
                        )}
                      </span>
                    </div>

                    <div className="mt-6 flex flex-col gap-1.5 border-t border-[#E9E3DA]/50 pt-4">
                      <span className="font-mono text-[10px] text-[#A8A296] tracking-tight flex items-center gap-1">
                        <MapPin size={10} /> {loc.coords}
                      </span>
                      <p className="text-[12px] text-[#6A6A6A] leading-[1.5] font-semibold">
                        {loc.address}
                      </p>
                    </div>
                  </div>

                  <div className="mt-8 pt-4 border-t border-[#E9E3DA]/30 flex items-center justify-between">
                    <span className="text-[10px] font-extrabold uppercase tracking-[0.05em] text-[#A8A296]">
                      Local Time
                    </span>
                    <span className="font-mono text-[13px] font-extrabold text-[#111111]">
                      {isComingSoon ? "Soon" : currentTime}
                    </span>
                  </div>
                </div>
              </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}

function FaqSection() {
  const [openIdx, setOpenIdx] = useState<number | null>(0);
  return (
    <section className="border-t border-[#E9E3DA] py-24 lg:py-32 bg-white/40">
      <div className="mx-auto max-w-[800px] px-6">
        <Reveal>
          <Folio index={9} label="FAQ" />
        </Reveal>

        <Reveal delay={0.1}>
          <div className="text-center mb-16">
            <span className="text-[13px] font-semibold uppercase tracking-[0.12em] text-[#6A6A6A]">
              Common Questions
            </span>
            <h2 className="mt-4 text-[36px] font-extrabold tracking-tight text-[#111111]">
              Frequently Asked Questions
            </h2>
          </div>
        </Reveal>

        <div className="flex flex-col gap-4">
          {FAQS.map((faq, idx) => {
            const isOpen = openIdx === idx;
            return (
              <Reveal key={idx} delay={idx * 0.05}>
                <div className="border border-[#E9E3DA] rounded-[16px] bg-white overflow-hidden transition-all duration-300">
                  <button
                    onClick={() => setOpenIdx(isOpen ? null : idx)}
                    className="w-full flex justify-between items-center p-6 text-left font-bold text-[16px] text-[#111111]"
                  >
                    <span>{faq.q}</span>
                    <span className="h-6 w-6 rounded-full border border-[#E9E3DA] flex items-center justify-center shrink-0 text-[#6A6A6A]">
                      {isOpen ? "−" : "+"}
                    </span>
                  </button>
                  <AnimatePresence>
                    {isOpen && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3, ease: EASE }}
                      >
                        <div className="p-6 pt-0 border-t border-[#E9E3DA]/60 text-[14px] leading-[1.65] text-[#6A6A6A]">
                          {faq.a}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}

/* ============================== CONTACT ============================== */

function ContactCta({ 
  contactEmail, 
  heroBtnUrl, 
  settings 
}: { 
  contactEmail: string; 
  heroBtnUrl: string; 
  settings: any;
}) {
  const ref = useRef(null);
  const [pos, setPos] = useState({ x: 50, y: 50 });

  const officeAddress = settings?.officeAddress || "Kadri Temple Road, Kadri, Mangalore, Karnataka, India - 575002";
  const socialTwitter = settings?.socialTwitter || "https://twitter.com/growthbridge";
  const socialLinkedin = settings?.socialLinkedin || "https://linkedin.com/company/growthbridge";
  const socialGithub = settings?.socialGithub || "https://github.com/growthbridge";
  const branches = settings?.branches || [
    { name: "India", address: "Mangalore, India", status: "active" },
    { name: "Germany", address: "Munich, Germany", status: "active" },
    { name: "France", address: "Paris, France", status: "active" },
    { name: "Poland", address: "Warsaw, Poland", status: "coming_soon" }
  ];

  return (
    <section
      id="contact"
      ref={ref}
      onMouseMove={(e) => {
        const rect = (ref.current as HTMLElement | null)?.getBoundingClientRect();
        if (!rect) return;
        setPos({
          x: ((e.clientX - rect.left) / rect.width) * 100,
          y: ((e.clientY - rect.top) / rect.height) * 100,
        });
      }}
      className="relative overflow-hidden bg-[#111111] py-28 text-center text-white lg:py-36"
    >
      <div
        className="pointer-events-none absolute inset-0 opacity-40 transition-[background] duration-300"
        style={{
          background: `radial-gradient(circle at ${pos.x}% ${pos.y}%, rgba(244,197,66,0.25) 0%, transparent 55%)`,
        }}
        aria-hidden
      />
      <div className="relative mx-auto max-w-[800px] px-6">
        <Reveal>
          <span className="inline-flex items-center gap-2 text-[13px] font-semibold uppercase tracking-[0.12em] text-[#F4C542]">
            Get in touch
          </span>
        </Reveal>
        <Reveal delay={0.1}>
          <h2 className="mt-5 text-[clamp(36px,5.5vw,72px)] font-extrabold leading-[1.05] tracking-[-0.03em]">
            Let's build something
            <br />
            worth talking about.
          </h2>
        </Reveal>
        <Reveal delay={0.2}>
          <p className="mx-auto mt-6 max-w-[480px] text-[17px] leading-[1.7] text-white/60">
            Tell us what's not working yet. We'll tell you, honestly, whether
            we're the right team to fix it.
          </p>
        </Reveal>
        <Reveal delay={0.3}>
          <MagneticButton
            href={`mailto:${contactEmail}`}
            className="mt-10 inline-flex items-center gap-2 rounded-full bg-[#F4C542] px-8 py-4 text-[14px] font-semibold text-[#111111] transition-colors hover:bg-[#fff]"
          >
            Start a project <ArrowRight size={18} />
          </MagneticButton>
          <div className="mt-8 flex items-center justify-center gap-2 text-[14px] text-white/60">
            <Mail size={15} /> {contactEmail}
          </div>
        </Reveal>
      </div>

      {/* Global Footer Area */}
      <div className="relative mx-auto max-w-[1280px] px-6 md:px-12 mt-28 pt-16 border-t border-white/10 text-left grid grid-cols-1 md:grid-cols-4 gap-12 text-white/50 text-[13px] z-20">
        <div className="flex flex-col gap-4">
          <h4 className="font-extrabold text-white text-[15px] tracking-tight">Growth Bridge</h4>
          <p className="leading-[1.7] text-white/40 max-w-[240px]">
            A design and engineering partner for founders who value quality, clarity, and momentum.
          </p>
          <p className="text-[11px] text-white/30 mt-2">
            © {new Date().getFullYear()} Growth Bridge. All rights reserved.
          </p>
        </div>

        <div className="flex flex-col gap-4">
          <h4 className="font-extrabold text-white text-[15px] tracking-tight">Headquarters</h4>
          <p className="leading-[1.7] text-white/40 max-w-[200px]">
            {officeAddress}
          </p>
        </div>

        <div className="flex flex-col gap-4">
          <h4 className="font-extrabold text-white text-[15px] tracking-tight">Global Network</h4>
          <ul className="flex flex-col gap-3">
            {branches.map((b: any) => (
              <li key={b.name} className="flex flex-col gap-0.5">
                <div className="flex items-center gap-1.5">
                  <span className="font-bold text-white/80 text-[12px]">{b.name}</span>
                  {b.status === 'coming_soon' && (
                    <span className="px-1.5 py-0.2 text-[8px] font-extrabold uppercase tracking-wide bg-white/10 text-white/50 rounded-full">
                      Soon
                    </span>
                  )}
                </div>
                {b.status !== 'coming_soon' && (
                  <span className="text-[11px] text-white/30">{b.address}</span>
                )}
              </li>
            ))}
          </ul>
        </div>

        <div className="flex flex-col gap-4">
          <h4 className="font-extrabold text-white text-[15px] tracking-tight">Connect</h4>
          <div className="flex flex-col gap-2 font-semibold">
            <a href={socialTwitter} target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors w-fit">Twitter</a>
            <a href={socialLinkedin} target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors w-fit">LinkedIn</a>
            <a href={socialGithub} target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors w-fit">GitHub</a>
          </div>
        </div>
      </div>
    </section>
  );
}

