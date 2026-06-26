"use client";

import React from "react";
import { motion } from "framer-motion";
import { ArrowLeft, Mail, Sparkles } from "lucide-react";
import SideRays from "@/components/ui/SideRays";

const LinkedinIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"/>
    <rect x="2" y="9" width="4" height="12"/>
    <circle cx="4" cy="4" r="2"/>
  </svg>
);

const TwitterIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z"/>
  </svg>
);

const GithubIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4"/>
    <path d="M9 18c-4.51 2-5-2-7-2"/>
  </svg>
);

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
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, delay, ease: EASE }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

export default function FounderClient({ settings }: { settings: any }) {
  const contactEmail = settings?.contactEmail || "hello@growthbridge.studio";
  const twitterUrl = settings?.socialTwitter || "https://twitter.com";
  const linkedinUrl = settings?.socialLinkedin || "https://linkedin.com";
  const githubUrl = settings?.socialGithub || "https://github.com";

  return (
    <main className="min-h-screen bg-[#FCFBF8] text-[#111111] relative overflow-hidden pb-24">
      {/* SideRays background effects */}
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

      {/* Top Navbar */}
      <header className="fixed top-0 inset-x-0 z-40 bg-[#FCFBF8]/80 border-b border-[#E9E3DA] backdrop-blur-md">
        <div className="mx-auto max-w-[1280px] px-6 md:px-12 py-4 flex items-center justify-between">
          <a href="/" className="flex items-center gap-2">
            <span className="text-[17px] font-bold tracking-tight text-[#111111]">Growth Bridge</span>
          </a>

          <a
            href="/"
            className="inline-flex items-center gap-2 rounded-full border border-[#E9E3DA] bg-white px-5 py-2 text-[13px] font-bold text-[#111111] hover:border-[#111111] transition-all"
          >
            <ArrowLeft size={14} /> Back to Home
          </a>
        </div>
      </header>

      {/* Main layout container */}
      <div className="mx-auto max-w-[960px] px-6 md:px-12 pt-36 relative z-20">
        
        {/* Founder Bio Head */}
        <section className="grid grid-cols-1 md:grid-cols-[1fr_2fr] gap-12 items-center mb-16">
          <Reveal>
            <div className="relative h-48 w-48 mx-auto md:mx-0 rounded-[32px] overflow-hidden border border-[#E9E3DA] shadow-lg">
              <img
                src="/founder.png"
                alt="Prajwal Shetty"
                className="h-full w-full object-cover"
              />
            </div>
          </Reveal>
          
          <div className="text-center md:text-left">
            <Reveal delay={0.1}>
              <span className="inline-flex items-center gap-2 text-[13px] font-semibold uppercase tracking-[0.12em] text-[#6A6A6A]">
                <Sparkles size={13} className="text-[#F4C542]" /> Meet the Founder
              </span>
              <h1 className="mt-4 text-[44px] md:text-[56px] font-extrabold leading-[1.05] tracking-[-0.03em]">
                Prajwal Shetty
              </h1>
              <p className="text-[18px] text-[#A8A296] font-medium mt-2">
                Founder & Chief Architect at Growth Bridge
              </p>
            </Reveal>

            {/* Social icons */}
            <Reveal delay={0.2} className="flex justify-center md:justify-start gap-4 mt-6">
              <a
                href={linkedinUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="h-10 w-10 rounded-full border border-[#E9E3DA] bg-white flex items-center justify-center text-[#6A6A6A] hover:text-[#111111] hover:border-[#111111] transition-colors"
              >
                <LinkedinIcon className="h-4 w-4" />
              </a>
              <a
                href={twitterUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="h-10 w-10 rounded-full border border-[#E9E3DA] bg-white flex items-center justify-center text-[#6A6A6A] hover:text-[#111111] hover:border-[#111111] transition-colors"
              >
                <TwitterIcon className="h-4 w-4" />
              </a>
              <a
                href={githubUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="h-10 w-10 rounded-full border border-[#E9E3DA] bg-white flex items-center justify-center text-[#6A6A6A] hover:text-[#111111] hover:border-[#111111] transition-colors"
              >
                <GithubIcon className="h-4 w-4" />
              </a>
              <a
                href={`mailto:${contactEmail}`}
                className="h-10 w-10 rounded-full border border-[#E9E3DA] bg-white flex items-center justify-center text-[#6A6A6A] hover:text-[#111111] hover:border-[#111111] transition-colors"
              >
                <Mail size={16} />
              </a>
            </Reveal>
          </div>
        </section>

        {/* Founder Manifesto quote */}
        <section className="mb-20">
          <Reveal delay={0.25}>
            <blockquote className="border-l-4 border-[#111111] pl-6 md:pl-8 py-2 italic text-[20px] md:text-[24px] font-medium leading-[1.6] text-[#111111] bg-white/40 rounded-r-[16px] pr-6">
              "We started Growth Bridge because we kept watching good businesses get mediocre work from teams that thought like vendors instead of operators. Fifty-plus projects later, that's still the whole pitch."
            </blockquote>
          </Reveal>
        </section>

        {/* Narrative & Story */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-12 mb-20 text-[15px] leading-[1.75] text-[#6A6A6A]">
          <Reveal delay={0.3}>
            <h3 className="text-[20px] font-bold text-[#111111] mb-4">The Synthesis of Design & Code</h3>
            <p className="mb-4">
              For years, a massive divide existed between creative directors and software engineers. Designers built layouts in Figma, then threw static specs over the wall to developers. The resulting code was often compromised, heavy, and lacked execution.
            </p>
            <p>
              I founded Growth Bridge with a simple counter-premise: the absolute unification of engineering and design. The developers building our clients' code structures are the same individuals laying out the grid systems, components, and responsive aesthetics. This eliminates middle-management friction.
            </p>
          </Reveal>

          <Reveal delay={0.35}>
            <h3 className="text-[20px] font-bold text-[#111111] mb-4">Operator-Minded Execution</h3>
            <p className="mb-4">
              We do not treat builds like one-off template deployments. We align ourselves with our partners' primary conversion metrics, pipeline conversion rates, and performance benchmarks. 
            </p>
            <p>
              Whether we are building a high-volume storefront, booking flow, product dashboard, or brand strategy, we run with the constraint of momentum. We focus on launching quickly and iterating against actual market response, rather than holding endless planning slide decks.
            </p>
          </Reveal>
        </section>

        {/* Core Principles Cards */}
        <section className="mb-20">
          <Reveal delay={0.4}>
            <h3 className="text-[22px] font-bold text-[#111111] mb-8 text-center sm:text-left">
              Core Philosophies
            </h3>
          </Reveal>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <Reveal delay={0.45}>
              <div className="bg-white border border-[#E9E3DA] p-6 rounded-[24px] shadow-[0_4px_25px_rgba(0,0,0,0.02)] h-full">
                <span className="font-mono text-[13px] text-[#A8A296]">01 / Precision First</span>
                <h4 className="text-[17px] font-bold text-[#111111] mt-3">High Fidelity Only</h4>
                <p className="text-[13px] text-[#6A6A6A] leading-[1.65] mt-2">
                  No layout shortcuts. We build pixel-perfect representations of elite brand guidelines natively in clean code.
                </p>
              </div>
            </Reveal>

            <Reveal delay={0.5}>
              <div className="bg-white border border-[#E9E3DA] p-6 rounded-[24px] shadow-[0_4px_25px_rgba(0,0,0,0.02)] h-full">
                <span className="font-mono text-[13px] text-[#A8A296]">02 / No Bloat</span>
                <h4 className="text-[17px] font-bold text-[#111111] mt-3">Uncompromising Speed</h4>
                <p className="text-[13px] text-[#6A6A6A] leading-[1.65] mt-2">
                  Sub-second page speeds, highly optimized image parameters, lightweight motion canvases. We load content, not frameworks.
                </p>
              </div>
            </Reveal>

            <Reveal delay={0.55}>
              <div className="bg-white border border-[#E9E3DA] p-6 rounded-[24px] shadow-[0_4px_25px_rgba(0,0,0,0.02)] h-full">
                <span className="font-mono text-[13px] text-[#A8A296]">03 / Direct Partnership</span>
                <h4 className="text-[17px] font-bold text-[#111111] mt-3">No Account Managers</h4>
                <p className="text-[13px] text-[#6A6A6A] leading-[1.65] mt-2">
                  Our builders talk to you directly. We value operational feedback and launch updates over administrative processes.
                </p>
              </div>
            </Reveal>
          </div>
        </section>

        {/* Final CTA link */}
        <section className="text-center bg-[#111111] text-white py-14 rounded-[36px] overflow-hidden relative shadow-lg">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_rgba(244,197,66,0.1)_0%,_transparent_60%)] pointer-events-none" />
          <Reveal delay={0.6}>
            <h3 className="text-[26px] sm:text-[32px] font-black tracking-tight mb-4">
              Have a launch in mind?
            </h3>
            <p className="text-[14px] text-white/60 max-w-[420px] mx-auto mb-8">
              Reach out directly to discuss timelines, specifications, and operational directions.
            </p>
            <a
              href="/contact"
              className="inline-flex items-center gap-2 rounded-full bg-[#F4C542] hover:bg-white text-[#111111] px-6 py-3.5 text-[14px] font-bold transition-colors"
            >
              Start a Project
            </a>
          </Reveal>
        </section>

      </div>
    </main>
  );
}
