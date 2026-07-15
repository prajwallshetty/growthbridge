"use client";

import React from "react";
import { useCRM } from "./CRMProvider";
import { BarChart3, TrendingUp, DollarSign, Target, Award } from "lucide-react";
import { motion } from "framer-motion";

const EASE = [0.22, 1, 0.36, 1] as const;

export default function AnalyticsView() {
  const { clients, stats } = useCRM();

  const totalDealsCount = clients.length;
  const averageDealSize = totalDealsCount > 0
    ? Math.round(clients.reduce((sum, c) => sum + c.budget, 0) / totalDealsCount)
    : 0;

  const countryCounts: Record<string, { count: number; name: string }> = {};
  clients.forEach((c) => {
    if (!countryCounts[c.countryFlag]) {
      let cName = "Other";
      if (c.countryFlag === "🇮🇳") cName = "India";
      if (c.countryFlag === "🇦🇪") cName = "UAE";
      if (c.countryFlag === "🇬🇧") cName = "UK";
      if (c.countryFlag === "🇺🇸") cName = "USA";
      if (c.countryFlag === "🇸🇬") cName = "Singapore";
      countryCounts[c.countryFlag] = { count: 0, name: cName };
    }
    countryCounts[c.countryFlag].count += 1;
  });

  const countryArray = Object.entries(countryCounts).map(([flag, data]) => ({
    flag,
    name: data.name,
    count: data.count,
  }));

  const pipelineStages = [
    { name: "Leads", count: clients.filter((c) => ["Lead Created", "Discovery Call", "Meeting Scheduled", "Requirements Received"].includes(c.stage)).length },
    { name: "Proposals", count: clients.filter((c) => ["Proposal Generated", "Quotation Generated", "Client Approval", "Agreement Generated"].includes(c.stage)).length },
    { name: "Design & Dev", count: clients.filter((c) => ["Advance Payment Received", "Project Created Automatically", "Design Phase", "Development", "Testing", "Client Review", "Deployment", "Final Payment"].includes(c.stage)).length },
    { name: "Completed", count: clients.filter((c) => ["Project Completed", "Maintenance", "Upsell"].includes(c.stage as any)).length },
  ];

  const maxPipelineCount = Math.max(...pipelineStages.map((p) => p.count));

  return (
    <div className="flex flex-col gap-8 pb-10 select-none">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4 shrink-0">
        <div>
          <h2 className="text-[22px] font-extrabold text-[#111111] tracking-tight leading-none flex items-center gap-2">
            <BarChart3 size={20} className="text-[#111111]" />
            <span>Operational Analytics</span>
          </h2>
          <p className="text-[13px] text-[#6A6A6A] mt-1">
            Realtime performance metrics, geography spread, and pipeline conversions.
          </p>
        </div>
      </div>

      {/* Top row mini-stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Metric 1 */}
        <div className="bg-white border border-[#E9E3DA] rounded-2xl p-5 shadow-sm">
          <div className="flex items-center gap-3 text-emerald-600 mb-2">
            <DollarSign size={16} />
            <span className="text-[11px] font-mono text-[#6A6A6A] uppercase tracking-wider font-bold">Average Budget</span>
          </div>
          <div className="text-[22px] font-extrabold text-[#111111] tracking-tight leading-none">
            ₹{averageDealSize.toLocaleString()}
          </div>
          <p className="text-[10px] text-[#6A6A6A] mt-2 font-medium">Calculated across {totalDealsCount} pipeline leads</p>
        </div>

        {/* Metric 2 */}
        <div className="bg-white border border-[#E9E3DA] rounded-2xl p-5 shadow-sm">
          <div className="flex items-center gap-3 text-blue-600 mb-2">
            <Target size={16} />
            <span className="text-[11px] font-mono text-[#6A6A6A] uppercase tracking-wider font-bold">Conversion Rate</span>
          </div>
          <div className="text-[22px] font-extrabold text-[#111111] tracking-tight leading-none">
            78.2%
          </div>
          <p className="text-[10px] text-[#6A6A6A] mt-2 font-medium">Conversion to advance retainer retainer</p>
        </div>

        {/* Metric 3 */}
        <div className="bg-white border border-[#E9E3DA] rounded-2xl p-5 shadow-sm">
          <div className="flex items-center gap-3 text-amber-600 mb-2">
            <Award size={16} />
            <span className="text-[11px] font-mono text-[#6A6A6A] uppercase tracking-wider font-bold">Pipeline Output</span>
          </div>
          <div className="text-[22px] font-extrabold text-[#111111] tracking-tight leading-none">
            ₹{((stats.totalRevenue + stats.pendingPayments) / 1000000).toFixed(2)}M
          </div>
          <p className="text-[10px] text-[#6A6A6A] mt-2 font-medium">Total contract value in CRM</p>
        </div>
      </div>

      {/* Main grids */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left: Pipeline conversion status */}
        <div className="bg-white border border-[#E9E3DA] rounded-2xl p-6 shadow-sm flex flex-col justify-between">
          <div className="mb-6">
            <h3 className="text-[14px] font-bold text-[#111111]">Pipeline Conversion Efficiency</h3>
            <p className="text-[11.5px] text-[#6A6A6A]">Client counts across pipeline segments</p>
          </div>

          <div className="flex flex-col gap-4">
            {pipelineStages.map((stage, idx) => {
              const widthPct = maxPipelineCount > 0 ? (stage.count / maxPipelineCount) * 100 : 0;
              return (
                <div key={idx} className="flex flex-col gap-1.5 text-[12.5px]">
                  <div className="flex justify-between items-center text-[12px]">
                    <span className="text-[#111111] font-semibold">{stage.name}</span>
                    <span className="font-mono text-[#6A6A6A] font-bold">{stage.count} Clients</span>
                  </div>
                  <div className="h-6 bg-[#FCFBF8] border border-[#E9E3DA] rounded-lg overflow-hidden flex items-center">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${widthPct}%` }}
                      transition={{ duration: 0.8, ease: EASE, delay: idx * 0.05 }}
                      className="h-full bg-[#111111]/5 border-r-2 border-[#111111] transition-all flex items-center pl-3"
                    >
                      <span className="text-[10px] font-bold text-[#111111] font-mono">
                        {Math.round(widthPct)}%
                      </span>
                    </motion.div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right: Geographical country distribution */}
        <div className="bg-white border border-[#E9E3DA] rounded-2xl p-6 shadow-sm flex flex-col justify-between">
          <div className="mb-6">
            <h3 className="text-[14px] font-bold text-[#111111]">Geographic Client Spread</h3>
            <p className="text-[11.5px] text-[#6A6A6A]">Active leads count by country code</p>
          </div>

          <div className="flex flex-col gap-3">
            {countryArray.map((country, idx) => (
              <div key={idx} className="flex items-center justify-between p-3 rounded-xl bg-[#FCFBF8] border border-[#E9E3DA]">
                <div className="flex items-center gap-3">
                  <span className="text-[20px] select-none">{country.flag}</span>
                  <div>
                    <div className="text-[12.5px] font-bold text-[#111111] leading-none">{country.name}</div>
                    <span className="text-[10px] text-[#6A6A6A] mt-1 block">Active operations</span>
                  </div>
                </div>
                <span className="px-2 py-0.5 rounded bg-white border border-[#E9E3DA] text-[11px] font-mono font-bold text-[#111111]">
                  {country.count} {country.count === 1 ? "lead" : "leads"}
                </span>
              </div>
            ))}
            {countryArray.length === 0 && (
              <p className="text-[#6B6B6B] text-[12px] italic text-center py-6">No countries mapped.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
