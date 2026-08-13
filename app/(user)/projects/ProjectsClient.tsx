"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, ArrowUpRight, Sparkles, Check } from "lucide-react";
import SideRays from "@/components/ui/SideRays";
import { CardContainer, CardBody, CardItem } from "@/components/ui/3d-card";

const EASE = [0.22, 1, 0.36, 1] as const;

interface ProjectsClientProps {
  projects: any[];
  settings: any;
}

export default function ProjectsClient({ projects, settings }: { projects: any[]; settings: any }) {
  const displayProjects = (projects || []).map((p) => ({
    title: p.title,
    category: p.category || "General",
    description: p.description,
    result: p.resultMetric || "+100% impact",
    image: p.image || "/project-pulse.png",
    liveUrl: p.liveUrl || "",
    completed: p.completed ?? false,
  }));

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

      {/* Hero Section */}
      <section className="pt-32 pb-12 relative z-20">
        <div className="mx-auto max-w-[1280px] px-6 md:px-12 text-center sm:text-left">
          <span className="inline-flex items-center gap-2 text-[13px] font-semibold uppercase tracking-[0.12em] text-[#6A6A6A]">
            <Sparkles size={13} className="text-[#F4C542]" /> Portfolio
          </span>
          <h1 className="mt-4 text-[clamp(36px,5vw,64px)] font-extrabold leading-[1.05] tracking-[-0.03em]">
            Selected engineering
            <br />
            & design archives.
          </h1>
          <p className="mt-6 max-w-[580px] text-[16px] leading-[1.75] text-[#6A6A6A]">
            A comprehensive look at our builds — storefronts, medical booking channels, complex dashboards, and SaaS design systems engineered for high performance.
          </p>
        </div>
      </section>

      {/* All Projects */}
      <section className="relative z-20 pb-16">
        <div className="mx-auto max-w-[1280px] px-6 md:px-12">
          {displayProjects.length === 0 ? (
            <div className="py-12 border border-dashed border-[#E9E3DA] rounded-[36px] text-center text-[#A8A296] text-[13px] font-semibold bg-white/40">
              No projects match this filter.
            </div>
          ) : (
            <motion.div
              layout
              className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6"
            >
              <AnimatePresence mode="popLayout">
                {displayProjects.map((p) => (
                  <motion.div
                    layout
                    key={p.title}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.45, ease: EASE }}
                  >
                    <CardContainer containerClassName="py-4">
                      <CardBody className="bg-[#FFFFFF]/80 backdrop-blur-md relative group/card hover:shadow-3xl hover:border-[#111111]/30 transition-all duration-500 border border-[#E9E3DA] w-full max-w-full sm:w-[32rem] h-auto rounded-[36px] p-8 lg:p-10 flex flex-col gap-5">
                        <div className="flex justify-between items-start gap-4">
                          <div className="flex flex-col">
                            <CardItem
                              translateZ="50"
                              className="text-[11px] font-extrabold uppercase tracking-[0.15em] text-[#F4C542]"
                            >
                              {p.category}
                            </CardItem>
                            <CardItem
                              translateZ="60"
                              className="text-2xl font-black text-[#111111] tracking-tight mt-1 transition-colors flex items-center gap-2"
                            >
                              <span>{p.title}</span>
                              {p.completed && (
                                <span className="inline-flex items-center justify-center bg-emerald-100 text-emerald-700 rounded-full p-0.5 shadow-sm shrink-0" title="Completed">
                                  <Check size={12} className="stroke-[3]" />
                                </span>
                              )}
                            </CardItem>
                          </div>
                          <CardItem
                            translateZ="70"
                            className="px-3.5 py-1.5 rounded-full text-[11px] font-extrabold uppercase tracking-[0.06em] text-[#111111] bg-[#F4C542] border border-[#111111]/10 shadow-[0_4px_12px_rgba(244,197,66,0.15)] shrink-0"
                          >
                            {p.result}
                          </CardItem>
                        </div>

                        <CardItem
                          translateZ="80"
                          className="w-full overflow-hidden rounded-[20px] border border-[#E9E3DA] relative mt-2"
                        >
                          <img
                            src={p.image}
                            className="h-64 w-full object-cover transform group-hover/card:scale-105 transition-transform duration-700 ease-[cubic-bezier(0.22,1,0.36,1)]"
                            alt={p.title}
                          />
                        </CardItem>

                        <CardItem
                          translateZ="50"
                          className="text-[#6A6A6A] text-[14px] leading-[1.65] font-medium"
                        >
                          {p.description}
                        </CardItem>
                        
                        <div className="flex justify-end gap-2.5 mt-4 pt-4 border-t border-[#E9E3DA]/60">
                          {p.liveUrl && (
                            <CardItem
                              translateZ="60"
                              as="a"
                              href={p.liveUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="px-5 py-2.5 rounded-full bg-[#111111] hover:bg-[#F4C542] text-white hover:text-[#111111] text-[12px] font-bold border border-[#111111] hover:border-[#F4C542] transition-all duration-300 shadow-sm shrink-0"
                            >
                              View Demo ↗
                            </CardItem>
                          )}
                        </div>
                      </CardBody>
                    </CardContainer>
                  </motion.div>
                ))}
              </AnimatePresence>
            </motion.div>
          )}
        </div>
      </section>
    </main>
  );
}
