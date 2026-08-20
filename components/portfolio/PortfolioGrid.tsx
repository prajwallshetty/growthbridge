"use client";

import React, { useState } from "react";
import { AnimatePresence } from "framer-motion";
import PortfolioCard, { PortfolioItem, normalizeProjectStatus } from "./PortfolioCard";
import { FolderOpen } from "lucide-react";

export default function PortfolioGrid({
  projects,
  showFilters = true,
}: {
  projects: PortfolioItem[];
  showFilters?: boolean;
}) {
  const [filter, setFilter] = useState<"All" | "Completed" | "Ongoing" | "Not Started">("All");

  const completedProjects = projects.filter((p) => normalizeProjectStatus(p) === "Completed");
  const ongoingProjects = projects.filter((p) => normalizeProjectStatus(p) === "Ongoing");
  const notStartedProjects = projects.filter((p) => normalizeProjectStatus(p) === "Not Started");

  const filteredProjects = projects.filter((p) => {
    if (!showFilters || filter === "All") return true;
    return normalizeProjectStatus(p) === filter;
  });

  return (
    <div className="flex flex-col gap-10 select-none">
      {/* Segmented Filter Navigation */}
      {showFilters && (
      <div className="flex items-center bg-[#FCFBF8] border border-[#E9E3DA] p-1 rounded-2xl w-fit shadow-2xs overflow-x-auto max-w-full no-scrollbar">
        <button
          onClick={() => setFilter("All")}
          className={`px-4.5 py-2.5 rounded-xl text-[13px] transition-all cursor-pointer whitespace-nowrap flex items-center gap-2 ${
            filter === "All"
              ? "bg-[#111111] text-white font-extrabold shadow-xs"
              : "text-[#6A6A6A] hover:text-[#111111] font-semibold hover:bg-neutral-100"
          }`}
        >
          <span>All</span>
          <span
            className={`px-2 py-0.5 rounded-full text-[10.5px] font-mono font-bold ${
              filter === "All" ? "bg-white/20 text-white" : "bg-[#111111]/5 text-[#111111]"
            }`}
          >
            {projects.length}
          </span>
        </button>

        <button
          onClick={() => setFilter("Completed")}
          className={`px-4.5 py-2.5 rounded-xl text-[13px] transition-all cursor-pointer whitespace-nowrap flex items-center gap-2 ${
            filter === "Completed"
              ? "bg-[#111111] text-white font-extrabold shadow-xs"
              : "text-[#6A6A6A] hover:text-[#111111] font-semibold hover:bg-neutral-100"
          }`}
        >
          <span>Completed</span>
          <span
            className={`px-2 py-0.5 rounded-full text-[10.5px] font-mono font-bold ${
              filter === "Completed" ? "bg-white/20 text-white" : "bg-[#111111]/5 text-[#111111]"
            }`}
          >
            {completedProjects.length}
          </span>
        </button>

        <button
          onClick={() => setFilter("Ongoing")}
          className={`px-4.5 py-2.5 rounded-xl text-[13px] transition-all cursor-pointer whitespace-nowrap flex items-center gap-2 ${
            filter === "Ongoing"
              ? "bg-[#111111] text-white font-extrabold shadow-xs"
              : "text-[#6A6A6A] hover:text-[#111111] font-semibold hover:bg-neutral-100"
          }`}
        >
          <span>Ongoing</span>
          <span
            className={`px-2 py-0.5 rounded-full text-[10.5px] font-mono font-bold ${
              filter === "Ongoing" ? "bg-white/20 text-white" : "bg-[#111111]/5 text-[#111111]"
            }`}
          >
            {ongoingProjects.length}
          </span>
        </button>

        <button
          onClick={() => setFilter("Not Started")}
          className={`px-4.5 py-2.5 rounded-xl text-[13px] transition-all cursor-pointer whitespace-nowrap flex items-center gap-2 ${
            filter === "Not Started"
              ? "bg-[#111111] text-white font-extrabold shadow-xs"
              : "text-[#6A6A6A] hover:text-[#111111] font-semibold hover:bg-neutral-100"
          }`}
        >
          <span>Not Started</span>
          <span
            className={`px-2 py-0.5 rounded-full text-[10.5px] font-mono font-bold ${
              filter === "Not Started" ? "bg-white/20 text-white" : "bg-[#111111]/5 text-[#111111]"
            }`}
          >
            {notStartedProjects.length}
          </span>
        </button>
      </div>
      )}

      {/* Responsive Grid Display (3 cards per row desktop, 2 tablet, 1 mobile) */}
      {filteredProjects.length === 0 ? (
        <div className="py-20 text-center border border-dashed border-[#E9E3DA] bg-white rounded-[24px] text-[#6A6A6A] flex flex-col items-center justify-center gap-2 shadow-2xs">
          <FolderOpen className="text-[#A8A296]" size={36} />
          <h4 className="text-[16px] font-bold text-[#111111]">No projects here yet.</h4>
          <p className="text-[13px] text-[#6A6A6A]">Projects in this category will appear here.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <AnimatePresence mode="popLayout">
            {filteredProjects.map((project, idx) => (
              <PortfolioCard key={project._id || idx} project={project} />
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}
