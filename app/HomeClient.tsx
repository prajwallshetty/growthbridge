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
import { ArrowRight, ArrowUpRight, Mail, Plus, Sparkles, Menu, X } from "lucide-react";
import SideRays from "@/components/ui/SideRays";
import { CardContainer, CardBody, CardItem } from "@/components/ui/3d-card";
import { AnimatedTooltip } from "@/components/ui/animated-tooltip";

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
  const inView = useInView(ref, { once: true, margin: "-100px" });
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

const SECTION_COUNT = 7;

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
}

export default function HomeClient({
  homepage,
  services,
  projects,
  testimonials,
  settings,
}: HomeClientProps) {
  // Configs with Fallbacks
  const heroTitle = homepage?.heroTitle || "Build your startup with Growth Bridge.";
  const heroDescription = homepage?.heroDescription || "A design and engineering partner for founders who value quality, clarity, and momentum. We bridge complex engineering with premium aesthetics.";
  const heroBtnText = homepage?.heroBtnText || "Start a project";
  const heroBtnUrl = homepage?.heroBtnUrl || "#contact";
  
  const showSelectedWork = homepage?.showSelectedWork !== false;
  const showProcess = homepage?.showProcess !== false;
  const showTestimonials = homepage?.showTestimonials !== false;

  const contactEmail = settings?.contactEmail || "hello@growthbridge.studio";
  const phoneNumber = settings?.phoneNumber || "+1 (555) 019-2834";
  const officeAddress = settings?.officeAddress || "100 Pine St, San Francisco, CA";
  const socialTwitter = settings?.socialTwitter || "https://twitter.com/growthbridge";
  const socialLinkedin = settings?.socialLinkedin || "https://linkedin.com/company/growthbridge";
  const socialGithub = settings?.socialGithub || "https://github.com/growthbridge";

  // Default projects fallback
  const defaultProjects = [
    {
      title: "Northstar Commerce",
      category: "E-commerce redesign",
      description: "A premium storefront rebuild with conversion-first design and lifecycle automation worthy of the product.",
      result: "+320% revenue",
      image: "/project-northstar.png",
    },
    {
      title: "Atlas Clinics",
      category: "Healthcare platform",
      description: "Local SEO architecture and booking funnels designed to build trust from the first click.",
      result: "5× more leads",
      image: "/project-atlas.png",
    },
    {
      title: "Pulse SaaS",
      category: "Product launch",
      description: "Brand positioning, launch site, and onboarding for a product-led growth engine.",
      result: "3× faster growth",
      image: "/project-pulse.png",
    },
    {
      title: "Loam & Co.",
      category: "Brand & web",
      description: "Visual identity and lookbook site for a slow-fashion studio's debut collection.",
      result: "+180% sessions",
      image: "/why-growthbridge.png",
    },
  ];

  const displayProjects = projects && projects.length > 0
    ? projects.map((p) => ({
        title: p.title,
        category: p.category,
        description: p.description,
        result: p.resultMetric || "+100% impact",
        image: p.image || "/project-pulse.png",
      }))
    : defaultProjects;

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

  // Default testimonials fallback
  const defaultTestimonials = [
    {
      name: "Riya Shah",
      designation: "Founder, Northstar Commerce",
      image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&h=150&fit=crop&crop=face",
      quote: "Growth Bridge gave our brand the kind of presence we used to think only enterprise teams could afford.",
    },
    {
      name: "Daniel Morris",
      designation: "Director, Atlas Clinics",
      image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face",
      quote: "They turned a scattered sales process into one clean system. We saw better leads within weeks.",
    },
    {
      name: "Anika Rao",
      designation: "CEO, Pulse SaaS",
      image: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&h=150&fit=crop&crop=face",
      quote: "The design taste is obvious, but the operating discipline is what made the project special.",
    },
  ];

  const displayTestimonials = testimonials && testimonials.length > 0
    ? testimonials.map((t) => ({
        name: t.name,
        designation: t.designation || t.title || "Client Partner",
        image: t.image || "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&h=150&fit=crop&crop=face",
        quote: t.quote,
      }))
    : defaultTestimonials;

  return (
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
      {showSelectedWork && <SelectedWork projects={displayProjects} heroBtnUrl={heroBtnUrl} />}
      <Industries />
      <Services servicesList={displayServices} />
      <WhyUs />
      {showProcess && <Process />}
      <EngagementModels heroBtnUrl={heroBtnUrl} />
      {showTestimonials && <TestimonialsSection testimonials={displayTestimonials} />}
      <ContactCta contactEmail={contactEmail} heroBtnUrl={heroBtnUrl} />
      <Footer contactEmail={contactEmail} />
    </main>
  );
}

/* ============================== NAV ============================== */

function Nav({ heroBtnText, heroBtnUrl }: { heroBtnText: string; heroBtnUrl: string }) {
  const links = [
    { name: "Work", link: "#work" },
    { name: "Services", link: "#services" },
    { name: "Process", link: "#process" },
    { name: "Contact", link: "#contact" }
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
          className={`relative z-[60] mx-auto hidden w-full flex-row items-center justify-between px-6 py-3 lg:flex transition-colors duration-300 ${
            visible
              ? "bg-[#FCFBF8]/95 border border-[#E9E3DA] backdrop-blur-md rounded-full shadow-lg"
              : "bg-transparent border-transparent"
          }`}
        >
          {/* Logo */}
          <a href="#top" className="flex items-center gap-2 z-20 shrink-0">
            <span className="flex h-8 w-8 items-center justify-center rounded-[8px] bg-[#111111] text-[15px] font-extrabold text-[#F4C542]">
              G
            </span>
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
        <motion.div
          animate={{
            boxShadow: visible
              ? "0 4px 20px rgba(0, 0, 0, 0.04), 0 12px 40px rgba(0, 0, 0, 0.03)"
              : "none",
            width: visible ? "calc(100% - 2rem)" : "100%",
            borderRadius: visible ? "12px" : "0px",
            y: visible ? 10 : 0,
          }}
          transition={{
            type: "spring",
            stiffness: 200,
            damping: 50,
          }}
          className={`relative z-50 mx-auto w-full flex-col items-center justify-between px-4 py-3 flex lg:hidden transition-all duration-300 ${
            visible
              ? "bg-[#FCFBF8]/95 border border-[#E9E3DA] backdrop-blur-md shadow-lg"
              : "bg-transparent border-transparent"
          }`}
        >
          <div className="flex w-full flex-row items-center justify-between z-20">
            <a href="#top" className="flex items-center gap-2 shrink-0">
              <span className="flex h-8 w-8 items-center justify-center rounded-[8px] bg-[#111111] text-[15px] font-extrabold text-[#F4C542]">
                G
              </span>
              <span className="text-[17px] font-bold tracking-tight text-[#111111]">Growth Bridge</span>
            </a>
            <button
              className="p-2 text-[#111111]"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              aria-label="Toggle menu"
            >
              {isMobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>

          <AnimatePresence>
            {isMobileMenuOpen && (
              <motion.div
                initial={{ opacity: 0, height: 0, y: -10 }}
                animate={{ opacity: 1, height: "auto", y: 0 }}
                exit={{ opacity: 0, height: 0, y: -10 }}
                transition={{ duration: 0.25 }}
                className="w-full overflow-hidden"
              >
                <div className="flex w-full flex-col items-start justify-start gap-1 pt-6 pb-4">
                  {links.map((item) => (
                    <a
                      key={item.name}
                      href={item.link}
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="relative text-[#6A6A6A] hover:text-[#111111] hover:bg-[#111111]/5 w-full py-3 px-4 rounded-md transition-all font-semibold uppercase tracking-wider text-[13px]"
                    >
                      {item.name}
                    </a>
                  ))}
                  <div className="w-full pt-4 mt-2 border-t border-[#E9E3DA]">
                    <a
                      href={heroBtnUrl}
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="block w-full text-center rounded-full bg-[#111111] py-3 text-[14px] font-semibold text-white transition-colors hover:bg-[#2a2a2a]"
                    >
                      {heroBtnText}
                    </a>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
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
                href="#work"
                className="flex items-center gap-2 rounded-full border border-[#E9E3DA] bg-white/50 px-7 py-4 text-[14px] font-semibold text-[#111111] transition-all hover:bg-white hover:border-[#111111]"
              >
                See the work
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
    <section className="border-y border-[#E9E3DA] bg-white/30 py-12">
      <div className="mx-auto max-w-[1280px] px-6 md:px-12">
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
    </section>
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

/* ========================= SELECTED WORK ========================= */

function SelectedWork({ projects, heroBtnUrl }: { projects: any[]; heroBtnUrl: string }) {
  return (
    <section id="work" className="py-24 lg:py-32 border-t border-[#E9E3DA]">
      <div className="mx-auto max-w-[1280px] px-6 md:px-12">
        <Reveal>
          <Folio index={1} label="Selected work" />
        </Reveal>

        <Reveal>
          <h2 className="text-[clamp(32px,4.5vw,56px)] font-extrabold tracking-[-0.03em] mb-4">
            Projects that speak
            <br />
            for themselves.
          </h2>
        </Reveal>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-0 mt-8">
          {projects.map((p, i) => (
            <Reveal key={p.title} delay={i * 0.1}>
              <CardContainer containerClassName="py-8">
                <CardBody className="bg-[#FFFFFF] relative group/card hover:shadow-2xl transition-all border border-[#E9E3DA] w-full max-w-full sm:w-[30rem] h-auto rounded-[32px] p-8">
                  <CardItem
                    translateZ="50"
                    className="text-xs font-semibold uppercase tracking-[0.1em] text-[#F4C542] mb-1"
                  >
                    {p.category}
                  </CardItem>
                  <CardItem
                    translateZ="60"
                    className="text-2xl font-bold text-[#111111] tracking-tight mb-2"
                  >
                    {p.title}
                  </CardItem>
                  <CardItem
                    translateZ="80"
                    className="w-full mt-4"
                  >
                    <img
                      src={p.image}
                      height="1000"
                      width="1000"
                      className="h-60 w-full object-cover rounded-2xl shadow-sm border border-[#E9E3DA] group-hover/card:shadow-md transition-shadow"
                      alt={p.title}
                    />
                  </CardItem>
                  <CardItem
                    translateZ="50"
                    className="text-[#6A6A6A] text-sm max-w-sm mt-6 leading-[1.6]"
                  >
                    {p.description}
                  </CardItem>
                  
                  <div className="flex justify-between items-center mt-10">
                    <CardItem
                      translateZ="60"
                      className="px-4 py-2 rounded-xl text-xs font-bold text-[#111111] bg-[#F4C542]/20 border border-[#F4C542]/40"
                    >
                      {p.result}
                    </CardItem>
                    <CardItem
                      translateZ="60"
                      as="a"
                      href={heroBtnUrl}
                      className="px-4 py-2 rounded-xl bg-[#111111] text-white text-xs font-bold hover:bg-[#222222] transition-colors"
                    >
                      Case Study →
                    </CardItem>
                  </div>
                </CardBody>
              </CardContainer>
            </Reveal>
          ))}
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
    <section className="border-t border-[#E9E3DA] py-24 lg:py-32">
      <div className="mx-auto max-w-[1280px] px-6 md:px-12">
        <Reveal>
          <Folio index={2} label="Who we work with" />
        </Reveal>
        <Reveal>
          <h2 className="max-w-[640px] text-[clamp(32px,4.5vw,56px)] font-extrabold leading-[1.05] tracking-[-0.03em]">
            Six industries.
            <br />
            Same operating playbook.
          </h2>
        </Reveal>

        <div className="mt-14 grid grid-cols-1 gap-px overflow-hidden rounded-[8px] border border-[#E9E3DA] bg-[#E9E3DA] sm:grid-cols-2 lg:grid-cols-3">
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
      </div>
    </section>
  );
}

/* ============================ SERVICES ============================ */

function Services({ servicesList }: { servicesList: any[] }) {
  const [open, setOpen] = useState(0);

  return (
    <section id="services" className="border-t border-[#E9E3DA] py-24 lg:py-32">
      <div className="mx-auto max-w-[1280px] px-6 md:px-12">
        <Reveal>
          <Folio index={3} label="What we do" />
        </Reveal>

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
      </div>
    </section>
  );
}

/* ============================== WHY US ============================== */

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

function WhyUs() {
  return (
    <section id="about" className="border-t border-[#E9E3DA] bg-white/40 py-24 lg:py-32">
      <div className="mx-auto max-w-[1280px] px-6 md:px-12">
        <Reveal>
          <Folio index={4} label="Why Growth Bridge" />
        </Reveal>

        <Reveal>
          <h2 className="max-w-[640px] text-[clamp(32px,4.5vw,56px)] font-extrabold leading-[1.05] tracking-[-0.03em]">
            Built different,
            <br />
            and built to prove it.
          </h2>
        </Reveal>

        <Reveal delay={0.15} className="mt-14 overflow-hidden rounded-[8px] border border-[#E9E3DA] shadow-[0_20px_50px_-30px_rgba(0,0,0,0.15)]">
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

        <Reveal delay={0.25} className="mt-14 flex flex-col items-start gap-6 sm:flex-row sm:items-center">
          <img
            src="/founder.png"
            alt="Founder of Growth Bridge"
            className="h-16 w-16 rounded-full object-cover shadow-md border border-[#E9E3DA]"
          />
          <p className="max-w-[560px] text-[15px] leading-[1.7] text-[#6A6A6A]">
            <span className="font-semibold text-[#111111]">Prajwal Shetty, founder —</span>{" "}
            "We started Growth Bridge because we kept watching good businesses get
            mediocre work from teams that thought like vendors instead of
            operators. Fifty-plus projects later, that's still the whole pitch."
          </p>
        </Reveal>
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

function Process() {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start 80%", "end 60%"],
  });

  return (
    <section id="process" className="border-t border-[#E9E3DA] py-24 lg:py-32">
      <div className="mx-auto max-w-[1280px] px-6 md:px-12">
        <Reveal>
          <Folio index={5} label="Our process" />
        </Reveal>

        <Reveal>
          <h2 className="text-[clamp(32px,4.5vw,56px)] font-extrabold tracking-[-0.03em]">
            Five stages, always
            <br />
            in this order.
          </h2>
        </Reveal>

        <div className="mt-14 grid grid-cols-1 gap-12 lg:grid-cols-12">
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
    <section className="border-t border-[#E9E3DA] bg-white/40 py-24 lg:py-32">
      <div className="mx-auto max-w-[1280px] px-6 md:px-12">
        <Reveal>
          <Folio index={6} label="How we engage" />
        </Reveal>
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
              className={`flex flex-col rounded-[10px] border p-8 transition-shadow ${
                e.featured
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
                className={`mt-7 flex items-center gap-2 text-[14px] font-semibold ${
                  e.featured ? "text-white" : "text-[#111111]"
                }`}
              >
                Get in touch <ArrowRight size={15} />
              </a>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
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
                className={`text-[13px] font-semibold transition-all py-1.5 px-4 rounded-full border ${
                  idx === active
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

/* ============================== CONTACT ============================== */

function ContactCta({ contactEmail, heroBtnUrl }: { contactEmail: string; heroBtnUrl: string }) {
  const ref = useRef(null);
  const [pos, setPos] = useState({ x: 50, y: 50 });

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
            <Sparkles size={13} /> Get in touch
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
    </section>
  );
}

/* ============================== FOOTER ============================== */

function Footer({ contactEmail }: { contactEmail: string }) {
  const links = ["Work", "Services", "About", "Contact"];
  return (
    <footer className="border-t border-[#E9E3DA] bg-white py-12">
      <div className="mx-auto max-w-[1280px] px-6 md:px-12">
        <div className="flex flex-col gap-10 md:flex-row md:items-center md:justify-between">
          <div>
            <div className="flex items-center gap-2">
              <span className="flex h-9 w-9 items-center justify-center rounded-[10px] bg-[#111111] text-[16px] font-extrabold text-[#F4C542]">
                G
              </span>
              <span className="text-[18px] font-bold">Growth Bridge</span>
            </div>
            <p className="mt-3 max-w-[320px] text-[14px] text-[#6A6A6A]">
              Helping ambitious businesses build, launch, and scale digital
              experiences.
            </p>
          </div>
          <div className="flex flex-wrap gap-8">
            {links.map((l) => (
              <a
                key={l}
                href={`#${l.toLowerCase()}`}
                className="text-[14px] font-medium text-[#6A6A6A] transition-colors hover:text-[#111111]"
              >
                {l}
              </a>
            ))}
          </div>
        </div>
        <div className="mt-10 flex flex-col-reverse gap-4 border-t border-[#E9E3DA] pt-6 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-[13px] text-[#6A6A6A]">
            © {new Date().getFullYear()} Growth Bridge. All rights reserved.
          </p>
          <div className="flex gap-6">
            <a href="#" className="text-[13px] text-[#6A6A6A] hover:text-[#111111]">
              Privacy Policy
            </a>
            <a href="#" className="text-[13px] text-[#6A6A6A] hover:text-[#111111]">
              Terms of Service
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
