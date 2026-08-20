"use client";

import React from "react";
import { AnimatePresence } from "framer-motion";
import PortfolioCard, { PortfolioItem } from "./PortfolioCard";
import { FolderOpen } from "lucide-react";

export default function PortfolioGrid({ projects }: { projects: PortfolioItem[] }) {
  return (
    <div className="flex flex-col gap-10 select-none">
      {projects.length === 0 ? (
        <div className="py-20 text-center border border-dashed border-[#E9E3DA] bg-white rounded-[24px] text-[#6A6A6A] flex flex-col items-center justify-center gap-2 shadow-2xs">
          <FolderOpen className="text-[#A8A296]" size={36} />
          <h4 className="text-[16px] font-bold text-[#111111]">No portfolio projects yet.</h4>
          <p className="text-[13px] text-[#6A6A6A]">Projects added in admin will appear here.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <AnimatePresence mode="popLayout">
            {projects.map((project, idx) => (
              <PortfolioCard key={project._id || idx} project={project} />
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}
