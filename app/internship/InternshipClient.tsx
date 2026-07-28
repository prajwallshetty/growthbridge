"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import {
  ArrowRight,
  ArrowUpRight,
  Sparkles,
  CheckCircle2,
  Clock,
  Layers,
  Smartphone,
  Cpu,
  BarChart2,
  ChevronDown,
  BookOpen,
  Award,
  Zap,
} from "lucide-react";
import SideRays from "@/components/ui/SideRays";

const EASE = [0.22, 1, 0.36, 1] as const;

interface DomainItem {
  _id: string;
  name: string;
  description: string;
  duration: string;
  isActive: boolean;
}

interface InternshipClientProps {
  domains: DomainItem[];
}

export default function InternshipClient({ domains }: InternshipClientProps) {
  const [activeFaq, setActiveFaq] = useState<number | null>(null);

  const getDomainIcon = (name: string) => {
    const lowercaseName = name.toLowerCase();
    if (lowercaseName.includes("mobile") || lowercaseName.includes("native") || lowercaseName.includes("react native")) {
      return <Smartphone size={20} className="text-[#F4C542]" />;
    }
    if (lowercaseName.includes("machine") || lowercaseName.includes("learning") || lowercaseName.includes("ml")) {
      return <Cpu size={20} className="text-[#F4C542]" />;
    }
    if (lowercaseName.includes("data") || lowercaseName.includes("science") || lowercaseName.includes("analyt")) {
      return <BarChart2 size={20} className="text-[#F4C542]" />;
    }
    return <Layers size={20} className="text-[#F4C542]" />;
  };

  const faqItems = [
    {
      q: "Who is eligible to apply for this internship?",
      a: "The program is open to undergraduate and graduate students pursuing Computer Science, Information Technology, Data Science, or related engineering fields. Enthusiastic self-taught developers with strong portfolios are also highly encouraged to apply.",
    },
    {
      q: "Is this a remote or in-office internship?",
      a: "This is a 100% remote internship. You can work from anywhere. Weekly syncs and review meetings will be conducted online.",
    },
    {
      q: "What is the duration of the internship program?",
      a: "The internship spans 3 weeks, designed as a highly structured sprint. The duration is specified under each domain's details.",
    },
    {
      q: "Are these internships paid or stipend-based?",
      a: "These are educational and training-based internships aimed at building robust industry portfolios. Outstanding performers will be prioritized for paid freelance client contracts and high-growth job roles at GrowthBridge Studio.",
    },
    {
      q: "When will I receive my offer letter and certificate?",
      a: "Offer letters are automatically generated and emailed once you are shortlisted and selected. Certificates of completion, alongside verified web verification links, are issued immediately upon the successful submission and grading of all weekly tasks.",
    },
  ];

  return (
    <div className="relative overflow-hidden w-full bg-[#FCFBF8]">
      {/* Background Decorative rays */}
      <div className="absolute top-0 inset-x-0 h-[600px] bg-[radial-gradient(circle_at_center,_rgba(244,197,66,0.05)_0%,_transparent_75%)] pointer-events-none" />
      <div className="pointer-events-none absolute inset-0 z-0 opacity-45">
        <SideRays />
      </div>

      {/* --- HERO SECTION --- */}
      <section className="relative z-10 max-w-7xl mx-auto px-6 pt-24 pb-20 md:pt-36 md:pb-32 flex flex-col items-center text-center">
        {/* Glow pill */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: EASE }}
          className="flex items-center gap-2 mb-8 px-4 py-1.5 rounded-full border border-[#E9E3DA] bg-white shadow-[0_4px_12px_rgba(0,0,0,0.02)]"
        >
          <Sparkles size={13} className="text-[#F4C542] animate-pulse" />
          <span className="font-mono text-[10px] font-extrabold uppercase tracking-[0.18em] text-[#6A6A6A]">
            Fall Cohort 2026 Open
          </span>
        </motion.div>

        {/* Headline */}
        <motion.h1
          initial={{ opacity: 0, y: 25 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.1, ease: EASE }}
          className="text-[clamp(36px,7vw,76px)] font-black tracking-tight leading-[1.05] text-[#111111] max-w-5xl"
        >
          Bridge the gap <br className="hidden sm:inline" />
          between <span className="underline decoration-[#F4C542] decoration-4 underline-offset-4">code</span> and production.
        </motion.h1>

        {/* Subtitle */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2, ease: EASE }}
          className="mt-8 text-[15px] sm:text-[18px] text-[#6A6A6A] leading-relaxed max-w-2xl font-medium"
        >
          GrowthBridge remote internships equip you with industry-level capstone projects, hands-on reviews, and verified credentials.
        </motion.p>

        {/* Call to Actions */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3, ease: EASE }}
          className="mt-10 flex flex-col sm:flex-row items-center gap-4 w-full justify-center"
        >
          <Link
            href="/internship/apply"
            className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-[#111111] hover:bg-[#F4C542] hover:text-[#111111] text-white text-[14px] font-extrabold tracking-tight transition-all duration-350 shadow-md flex items-center justify-center gap-2 group"
          >
            <span>Apply for Internship</span>
            <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
          </Link>
          
          <Link
            href="#domains"
            className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-white border border-[#E9E3DA] text-[#111111] hover:border-[#D7D0C8] text-[14px] font-bold tracking-tight transition-all duration-200 flex items-center justify-center gap-1.5"
          >
            <span>Explore Tracks</span>
            <ArrowUpRight size={15} className="text-[#6A6A6A]" />
          </Link>
        </motion.div>
      </section>

      {/* --- ABOUT SECTION --- */}
      <section id="about" className="relative z-10 max-w-7xl mx-auto px-6 py-20 border-t border-[#E9E3DA]">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16">
          <div className="lg:col-span-5 flex flex-col gap-4">
            <span className="font-mono text-[11px] font-bold tracking-[0.2em] text-[#A8A296] uppercase">
              — The Program
            </span>
            <h2 className="text-[32px] sm:text-[42px] font-extrabold tracking-tight leading-[1.1]">
              A portal dedicated to high-fidelity engineering.
            </h2>
          </div>
          
          <div className="lg:col-span-7 flex flex-col justify-center">
            <p className="text-[15px] sm:text-[16px] text-[#6A6A6A] leading-relaxed font-medium">
              We believe internships should reflect actual product engineering. That's why at GrowthBridge, you won't do simple tutorials. You'll build architectural products, configure database modeling schemas, write production-ready code, and push your weekly work directly. Every track is led by high-caliber guidelines to ensure you emerge with a premium, employable portfolio.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mt-10">
              <div className="flex flex-col gap-2 p-5 bg-white border border-[#E9E3DA] rounded-2xl shadow-[0_4px_12px_rgba(0,0,0,0.01)]">
                <span className="font-extrabold text-[24px] text-[#111111]">100%</span>
                <span className="text-[12px] text-[#6A6A6A] font-bold uppercase tracking-wider">Remote Learning</span>
              </div>
              <div className="flex flex-col gap-2 p-5 bg-white border border-[#E9E3DA] rounded-2xl shadow-[0_4px_12px_rgba(0,0,0,0.01)]">
                <span className="font-extrabold text-[24px] text-[#111111]">3 Wks</span>
                <span className="text-[12px] text-[#6A6A6A] font-bold uppercase tracking-wider">Structured Tracks</span>
              </div>
              <div className="flex flex-col gap-2 p-5 bg-white border border-[#E9E3DA] rounded-2xl shadow-[0_4px_12px_rgba(0,0,0,0.01)]">
                <span className="font-extrabold text-[24px] text-[#111111]">1-click</span>
                <span className="text-[12px] text-[#6A6A6A] font-bold uppercase tracking-wider">QR Verification</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* --- DOMAINS SECTION --- */}
      <section id="domains" className="relative z-10 max-w-7xl mx-auto px-6 py-24 border-t border-[#E9E3DA]">
        <div className="flex flex-col items-center text-center gap-4 mb-16">
          <span className="font-mono text-[11px] font-bold tracking-[0.2em] text-[#A8A296] uppercase">
            — Available tracks
          </span>
          <h2 className="text-[32px] sm:text-[46px] font-extrabold tracking-tight">
            Choose your learning domain
          </h2>
          <p className="text-[14px] sm:text-[15px] text-[#6A6A6A] max-w-xl font-medium mt-1">
            Pick a specialized track to build hands-on applications and earn verified credits.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {domains.map((domain, index) => (
            <motion.div
              key={domain._id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: index * 0.1, ease: EASE }}
              className="paper-card group relative flex flex-col justify-between"
            >
              <div>
                {/* Header info */}
                <div className="flex items-center justify-between mb-8">
                  <div className="w-12 h-12 rounded-2xl bg-[#FCFBF8] border border-[#E9E3DA] flex items-center justify-center shadow-inner group-hover:border-[#D7D0C8] transition-colors">
                    {getDomainIcon(domain.name)}
                  </div>
                  <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FCFBF8] border border-[#E9E3DA] text-[11px] font-bold text-[#6A6A6A] group-hover:border-[#D7D0C8] transition-colors">
                    <Clock size={12} className="text-[#A8A296]" />
                    <span>{domain.duration}</span>
                  </div>
                </div>

                <h3 className="text-[20px] sm:text-[24px] font-extrabold text-[#111111] group-hover:text-[#F4C542] transition-colors">
                  {domain.name}
                </h3>
                
                <p className="mt-4 text-[13.5px] text-[#6A6A6A] leading-relaxed font-medium">
                  {domain.description}
                </p>
              </div>

              <div className="mt-10 pt-6 border-t border-[#E9E3DA]/60 flex items-center justify-between">
                <span className="text-[11.5px] font-mono uppercase tracking-wider text-[#A8A296] font-bold">
                  Curriculum Approved
                </span>
                <Link
                  href="/internship/apply"
                  className="flex items-center gap-1.5 text-[13px] font-bold text-[#111111] group-hover:translate-x-1.5 transition-transform"
                >
                  <span>Apply Track</span>
                  <ArrowRight size={14} className="text-[#F4C542]" />
                </Link>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* --- BENEFITS & WHY JOIN --- */}
      <section className="relative z-10 bg-white border-y border-[#E9E3DA] py-24 px-6">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-16">
          <div className="lg:col-span-5 flex flex-col gap-5 justify-center">
            <span className="font-mono text-[11px] font-bold tracking-[0.2em] text-[#A8A296] uppercase">
              — Why GrowthBridge
            </span>
            <h2 className="text-[32px] sm:text-[42px] font-extrabold tracking-tight leading-[1.1]">
              Engineered to elevate your resume and skills.
            </h2>
            <p className="text-[14.5px] text-[#6A6A6A] leading-relaxed font-medium mt-2">
              Our internship is highly selective, fully structured, and focused entirely on architectural outcomes. We don't settle for baseline tutorials; we require candidates to build, push, and test.
            </p>
          </div>

          <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-8">
            <div className="flex flex-col gap-3 p-6 rounded-2xl bg-[#FCFBF8] border border-[#E9E3DA]">
              <div className="w-10 h-10 rounded-xl bg-white border border-[#E9E3DA] flex items-center justify-center text-[#F4C542]">
                <Award size={18} />
              </div>
              <h3 className="text-[16px] font-extrabold text-[#111111]">Premium Certification</h3>
              <p className="text-[13px] text-[#6A6A6A] leading-relaxed font-medium">
                Get an official certificate complete with custom project titles, ratings, and a secure QR code for verification.
              </p>
            </div>

            <div className="flex flex-col gap-3 p-6 rounded-2xl bg-[#FCFBF8] border border-[#E9E3DA]">
              <div className="w-10 h-10 rounded-xl bg-white border border-[#E9E3DA] flex items-center justify-center text-[#F4C542]">
                <Zap size={18} />
              </div>
              <h3 className="text-[16px] font-extrabold text-[#111111]">Freelance Opportunities</h3>
              <p className="text-[13px] text-[#6A6A6A] leading-relaxed font-medium">
                Top-performing interns will be directly prioritized for paid client projects and remote freelance contracts.
              </p>
            </div>

            <div className="flex flex-col gap-3 p-6 rounded-2xl bg-[#FCFBF8] border border-[#E9E3DA]">
              <div className="w-10 h-10 rounded-xl bg-white border border-[#E9E3DA] flex items-center justify-center text-[#F4C542]">
                <BookOpen size={18} />
              </div>
              <h3 className="text-[16px] font-extrabold text-[#111111]">Portfolio-Scale Projects</h3>
              <p className="text-[13px] text-[#6A6A6A] leading-relaxed font-medium">
                Complete structured capstones that resolve design-to-code bottlenecks and make your GitHub stand out.
              </p>
            </div>

            <div className="flex flex-col gap-3 p-6 rounded-2xl bg-[#FCFBF8] border border-[#E9E3DA]">
              <div className="w-10 h-10 rounded-xl bg-white border border-[#E9E3DA] flex items-center justify-center text-[#F4C542]">
                <CheckCircle2 size={18} />
              </div>
              <h3 className="text-[16px] font-extrabold text-[#111111]">Code Review Syncs</h3>
              <p className="text-[13px] text-[#6A6A6A] leading-relaxed font-medium">
                Gain hands-on feedback on your submissions, learning clean coding styles and optimal folder structures.
              </p>
            </div>
          </div>
        </div>
      </section>



      {/* --- FAQ SECTION --- */}
      <section id="faq" className="relative z-10 max-w-4xl mx-auto px-6 py-24 border-t border-[#E9E3DA]">
        <div className="flex flex-col items-center text-center gap-4 mb-16">
          <span className="font-mono text-[11px] font-bold tracking-[0.2em] text-[#A8A296] uppercase">
            — Support
          </span>
          <h2 className="text-[32px] sm:text-[40px] font-extrabold tracking-tight">
            Frequently Asked Questions
          </h2>
        </div>

        <div className="flex flex-col gap-4">
          {faqItems.map((faq, idx) => (
            <div
              key={idx}
              className="bg-white border border-[#E9E3DA] rounded-2xl overflow-hidden transition-all duration-300"
            >
              <button
                onClick={() => setActiveFaq(activeFaq === idx ? null : idx)}
                className="w-full text-left p-6 flex items-center justify-between gap-4 font-bold text-[14.5px] text-[#111111] hover:bg-[#FCFBF8]"
              >
                <span>{faq.q}</span>
                <ChevronDown
                  size={16}
                  className={`text-[#6A6A6A] transition-transform duration-300 ${
                    activeFaq === idx ? "rotate-180 text-[#F4C542]" : ""
                  }`}
                />
              </button>

              <AnimatePresence initial={false}>
                {activeFaq === idx && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.25, ease: "easeInOut" }}
                  >
                    <div className="px-6 pb-6 pt-1 border-t border-[#E9E3DA]/55 text-[13.5px] text-[#6A6A6A] leading-relaxed font-medium">
                      {faq.a}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))}
        </div>
      </section>

      {/* --- CTA SECTION --- */}
      <section className="relative z-10 max-w-7xl mx-auto px-6 pb-28 pt-8 text-center flex flex-col items-center">
        <div className="w-full bg-[#111111] rounded-3xl p-12 md:p-20 relative overflow-hidden flex flex-col items-center shadow-lg">
          {/* Subtle gold decoration */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-bl from-[#F4C542]/10 to-transparent rounded-full pointer-events-none" />

          <span className="font-mono text-[10px] font-bold tracking-[0.18em] text-[#F4C542] uppercase">
            Start Your Journey
          </span>
          <h2 className="text-[28px] sm:text-[44px] font-extrabold text-white tracking-tight mt-4 leading-tight">
            Build production-grade applications. <br className="hidden sm:inline" />
            Apply for your track today.
          </h2>
          <p className="mt-6 text-[14px] text-gray-400 max-w-md leading-relaxed font-medium">
            Limited seats are available for each domain. Start your application process now and get onboarded next week.
          </p>

          <Link
            href="/internship/apply"
            className="mt-10 px-8 py-4 rounded-2xl bg-[#FCFBF8] hover:bg-[#F4C542] text-[#111111] hover:text-[#111111] text-[14px] font-extrabold tracking-tight transition-all duration-350 shadow-md flex items-center gap-2 group"
          >
            <span>Apply Online</span>
            <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>
      </section>
    </div>
  );
}
