"use client";

import React from "react";
import { ExternalLink } from "lucide-react";
import { motion } from "framer-motion";

export interface PortfolioItem {
  _id?: string;
  title?: string;
  projectName?: string;
  image: string;
  liveUrl?: string;
  liveLink?: string;
}

export function formatLiveUrl(url?: string): string {
  if (!url) return "";
  const trimmed = url.trim();
  if (trimmed && !trimmed.startsWith("http://") && !trimmed.startsWith("https://")) {
    return `https://${trimmed}`;
  }
  return trimmed;
}

export default function PortfolioCard({ project }: { project: PortfolioItem }) {
  const name = project.projectName || project.title || "Untitled Project";
  const rawUrl = project.liveLink || project.liveUrl || "";
  const liveUrl = formatLiveUrl(rawUrl);

  const handleCardClick = () => {
    if (liveUrl) {
      window.open(liveUrl, "_blank", "noopener,noreferrer");
    }
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 15 }}
      transition={{ duration: 0.3 }}
      onClick={handleCardClick}
      className="bg-white/80 backdrop-blur-md border border-[#E9E3DA] rounded-[24px] p-5 shadow-2xs hover:shadow-xl hover:border-[#111111]/30 hover:-translate-y-1.5 transition-all duration-300 flex flex-col justify-between gap-4 group cursor-pointer"
    >
      {/* 1. Photo (Project Image Container) */}
      <div className="w-full aspect-[16/10] bg-[#FCFBF8] border border-[#E9E3DA]/80 rounded-[20px] overflow-hidden relative">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={project.image}
          alt={name}
          className="w-full h-full object-cover group-hover:scale-[1.04] transition-transform duration-500 ease-out"
          onError={(e) => {
            (e.target as HTMLElement).style.display = "none";
          }}
        />
      </div>

      {/* 2. Project Name & Live Link */}
      <div className="flex items-center justify-between gap-3 pt-1">
        <h3 className="text-[18px] font-extrabold text-[#111111] leading-snug tracking-tight group-hover:text-indigo-600 transition-colors flex-1 truncate">
          {name}
        </h3>

        {liveUrl ? (
          <a
            href={liveUrl}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
            className="inline-flex items-center gap-1.5 text-[13px] font-bold text-[#111111] group-hover:text-indigo-600 transition-colors shrink-0"
          >
            <span>View Live</span>
            <ExternalLink size={14} className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
          </a>
        ) : (
          <span className="text-[12px] text-[#A8A296] italic font-medium shrink-0">
            Preview
          </span>
        )}
      </div>
    </motion.div>
  );
}
