"use client";

import React from "react";
import { useCRM } from "./CRMProvider";
import {
  IndianRupee,
  Briefcase,
  TrendingUp,
  Receipt,
  PieChart,
  Users,
  CheckCircle2,
  Clock,
  ArrowUpRight,
  Sparkles,
  Percent,
  Layers,
  ArrowDownRight,
  Calendar,
} from "lucide-react";
import { motion } from "framer-motion";

const EASE = [0.22, 1, 0.36, 1] as const;

export default function DashboardView() {
  const { financialStats, clients, setView, setActiveClientId, globalActivities, settings } = useCRM();

  const activeProjects = clients.filter((c) =>
    ["Active", "Design Phase", "Development", "Testing", "Client Review", "Deployment", "Advance Payment Received", "Project Created Automatically"].includes(c.stage)
  );

  const formatCurrency = (val: number) => {
    const sym = settings.currency || "₹";
    if (val >= 100000) {
      return `${sym}${(val / 100000).toFixed(2)}L`;
    }
    return `${sym}${val.toLocaleString("en-IN")}`;
  };

  const getStatusBadge = (stage: string) => {
    if (stage === "Completed" || stage === "Project Completed") {
      return "bg-emerald-50 text-emerald-700 border-emerald-200";
    }
    if (stage === "On Hold") {
      return "bg-amber-50 text-amber-700 border-amber-200";
    }
    if (stage === "Pending") {
      return "bg-slate-50 text-slate-700 border-slate-200";
    }
    return "bg-indigo-50 text-indigo-700 border-indigo-200";
  };

  return (
    <div className="flex flex-col gap-8 pb-12 select-none">
      {/* Top Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h2 className="text-[24px] font-extrabold tracking-tight text-[#111111] leading-tight">
            Financial & Project Overview
          </h2>
          <p className="text-[13px] text-[#6A6A6A] mt-1">
            Real-time automated business management, project progress, profitability, and partner shares.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setView("projects")}
            className="flex items-center gap-2 bg-[#111111] text-white px-4 py-2 rounded-xl text-[12.5px] font-bold hover:bg-[#222222] transition-all shadow-sm cursor-pointer"
          >
            <Briefcase size={14} />
            <span>Manage Projects</span>
          </button>
          <div className="text-[11.5px] font-mono bg-white border border-[#E9E3DA] px-3.5 py-2 rounded-xl text-[#6A6A6A] font-bold">
            {new Date().toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric", year: "numeric" })}
          </div>
        </div>
      </div>

      {/* Main 4 Metric Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* 1. Active Projects Card */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: EASE }}
          className="bg-white border border-[#E9E3DA] rounded-2xl p-5 shadow-sm flex flex-col justify-between"
        >
          <div className="flex justify-between items-start mb-3">
            <span className="text-[11px] font-mono text-[#6A6A6A] uppercase tracking-[0.08em] font-bold">Active Projects</span>
            <div className="p-2 bg-indigo-50 border border-indigo-100 rounded-xl text-indigo-600">
              <Briefcase size={16} />
            </div>
          </div>
          <div>
            <div className="text-[28px] font-extrabold text-[#111111] tracking-tight leading-none mb-4">
              {financialStats.activeProjectsCount}
            </div>
            <div className="grid grid-cols-3 gap-2 pt-3 border-t border-[#E9E3DA]/60 text-center font-mono">
              <div className="bg-[#FCFBF8] p-1.5 rounded-lg border border-[#E9E3DA]">
                <span className="text-[9.5px] text-[#6A6A6A] uppercase block">Done</span>
                <span className="text-[12px] font-bold text-emerald-600">{financialStats.completedProjectsCount}</span>
              </div>
              <div className="bg-[#FCFBF8] p-1.5 rounded-lg border border-[#E9E3DA]">
                <span className="text-[9.5px] text-[#6A6A6A] uppercase block">Pending</span>
                <span className="text-[12px] font-bold text-slate-700">{financialStats.pendingProjectsCount}</span>
              </div>
              <div className="bg-[#FCFBF8] p-1.5 rounded-lg border border-[#E9E3DA]">
                <span className="text-[9.5px] text-[#6A6A6A] uppercase block">On Hold</span>
                <span className="text-[12px] font-bold text-amber-600">{financialStats.onHoldProjectsCount}</span>
              </div>
            </div>
          </div>
        </motion.div>

        {/* 2. Revenue Card */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.05, ease: EASE }}
          className="bg-white border border-[#E9E3DA] rounded-2xl p-5 shadow-sm flex flex-col justify-between"
        >
          <div className="flex justify-between items-start mb-3">
            <span className="text-[11px] font-mono text-[#6A6A6A] uppercase tracking-[0.08em] font-bold">Total Revenue</span>
            <div className="p-2 bg-emerald-50 border border-emerald-100 rounded-xl text-emerald-600">
              <IndianRupee size={16} />
            </div>
          </div>
          <div>
            <div className="text-[28px] font-extrabold text-[#111111] tracking-tight leading-none mb-1">
              {formatCurrency(financialStats.totalRevenue)}
            </div>
            <div className="text-[11px] text-emerald-600 font-semibold mb-3 flex items-center gap-1">
              <TrendingUp size={12} />
              <span>This Month: {formatCurrency(financialStats.revenueThisMonth)}</span>
            </div>
            <div className="grid grid-cols-2 gap-2 pt-3 border-t border-[#E9E3DA]/60 text-center font-mono">
              <div className="bg-[#FCFBF8] p-1.5 rounded-lg border border-[#E9E3DA]">
                <span className="text-[9.5px] text-[#6A6A6A] uppercase block">Received</span>
                <span className="text-[11.5px] font-bold text-emerald-700">{formatCurrency(financialStats.amountReceived)}</span>
              </div>
              <div className="bg-[#FCFBF8] p-1.5 rounded-lg border border-[#E9E3DA]">
                <span className="text-[9.5px] text-[#6A6A6A] uppercase block">Pending</span>
                <span className="text-[11.5px] font-bold text-red-600">{formatCurrency(financialStats.revenuePending)}</span>
              </div>
            </div>
          </div>
        </motion.div>

        {/* 3. Expenses Card */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1, ease: EASE }}
          className="bg-white border border-[#E9E3DA] rounded-2xl p-5 shadow-sm flex flex-col justify-between"
        >
          <div className="flex justify-between items-start mb-3">
            <span className="text-[11px] font-mono text-[#6A6A6A] uppercase tracking-[0.08em] font-bold">Total Expenses</span>
            <div className="p-2 bg-red-50 border border-red-100 rounded-xl text-red-600">
              <Receipt size={16} />
            </div>
          </div>
          <div>
            <div className="text-[28px] font-extrabold text-[#111111] tracking-tight leading-none mb-1">
              {formatCurrency(financialStats.totalExpenses)}
            </div>
            <div className="text-[11px] text-red-600 font-semibold mb-3 flex items-center gap-1">
              <ArrowDownRight size={12} />
              <span>This Month: {formatCurrency(financialStats.expensesThisMonth)}</span>
            </div>
            <div className="grid grid-cols-2 gap-2 pt-3 border-t border-[#E9E3DA]/60 text-center font-mono">
              <div className="bg-[#FCFBF8] p-1.5 rounded-lg border border-[#E9E3DA]">
                <span className="text-[9.5px] text-[#6A6A6A] uppercase block">Materials</span>
                <span className="text-[11.5px] font-bold text-[#111111]">{formatCurrency(financialStats.materialCost)}</span>
              </div>
              <div className="bg-[#FCFBF8] p-1.5 rounded-lg border border-[#E9E3DA]">
                <span className="text-[9.5px] text-[#6A6A6A] uppercase block">Misc</span>
                <span className="text-[11.5px] font-bold text-[#111111]">{formatCurrency(financialStats.miscExpenses)}</span>
              </div>
            </div>
          </div>
        </motion.div>

        {/* 4. Profitability Card */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.15, ease: EASE }}
          className="bg-white border border-[#E9E3DA] rounded-2xl p-5 shadow-sm flex flex-col justify-between"
        >
          <div className="flex justify-between items-start mb-3">
            <span className="text-[11px] font-mono text-[#6A6A6A] uppercase tracking-[0.08em] font-bold">Net Profit</span>
            <div className="p-2 bg-purple-50 border border-purple-100 rounded-xl text-purple-600">
              <PieChart size={16} />
            </div>
          </div>
          <div>
            <div className="text-[28px] font-extrabold text-[#111111] tracking-tight leading-none mb-1">
              {formatCurrency(financialStats.netProfit)}
            </div>
            <div className="text-[11px] text-purple-700 font-semibold mb-3 flex items-center gap-1">
              <Percent size={12} />
              <span>Margin: {financialStats.profitMarginPct.toFixed(1)}%</span>
            </div>
            <div className="grid grid-cols-2 gap-2 pt-3 border-t border-[#E9E3DA]/60 text-center font-mono">
              <div className="bg-[#FCFBF8] p-1.5 rounded-lg border border-[#E9E3DA]">
                <span className="text-[9.5px] text-[#6A6A6A] uppercase block">Gross Profit</span>
                <span className="text-[11.5px] font-bold text-purple-800">{formatCurrency(financialStats.grossProfit)}</span>
              </div>
              <div className="bg-[#FCFBF8] p-1.5 rounded-lg border border-[#E9E3DA]">
                <span className="text-[9.5px] text-[#6A6A6A] uppercase block">Referrals Paid</span>
                <span className="text-[11.5px] font-bold text-emerald-700">{formatCurrency(financialStats.totalReferralCommissions)}</span>
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Partner Share Distribution Section */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2, ease: EASE }}
        className="bg-white border border-[#E9E3DA] rounded-2xl p-6 shadow-sm"
      >
        <div className="flex items-center justify-between flex-wrap gap-4 mb-6">
          <div>
            <h3 className="text-[16px] font-extrabold text-[#111111] flex items-center gap-2">
              <Users size={18} className="text-indigo-600" />
              <span>Partner Profit Distribution</span>
            </h3>
            <p className="text-[12px] text-[#6A6A6A] mt-0.5">
              Automated real-time partner share calculations after deducting project expenses & referral commissions.
            </p>
          </div>
          <button
            onClick={() => setView("settings")}
            className="text-[12px] font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1 cursor-pointer"
          >
            <span>Edit Share % in Settings</span>
            <ArrowUpRight size={13} />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Partner 1 — Prajwal */}
          <div className="bg-[#FCFBF8] border border-[#E9E3DA] rounded-2xl p-5 flex flex-col justify-between relative overflow-hidden group hover:border-indigo-300 transition-all">
            <div className="flex justify-between items-center mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 text-white font-bold flex items-center justify-center text-[14px]">
                  {financialStats.partner1.name.substring(0, 2).toUpperCase()}
                </div>
                <div>
                  <h4 className="text-[15px] font-extrabold text-[#111111] leading-none">
                    {financialStats.partner1.name}
                  </h4>
                  <span className="text-[11px] text-[#6A6A6A] mt-1 block">
                    Equal Equity Partner ({financialStats.partner1.sharePct}%)
                  </span>
                </div>
              </div>
              <span className="px-2.5 py-1 rounded-lg bg-indigo-50 text-indigo-700 text-[11px] font-bold font-mono border border-indigo-100">
                {financialStats.partner1.sharePct}% Equity
              </span>
            </div>

            <div className="grid grid-cols-3 gap-3 my-2 text-center">
              <div className="bg-white p-2.5 rounded-xl border border-[#E9E3DA]">
                <span className="text-[10px] text-[#6A6A6A] uppercase font-bold block">Revenue Share</span>
                <span className="text-[13px] font-bold text-emerald-700">{formatCurrency(financialStats.partner1.revenueShare)}</span>
              </div>
              <div className="bg-white p-2.5 rounded-xl border border-[#E9E3DA]">
                <span className="text-[10px] text-[#6A6A6A] uppercase font-bold block">Expenses Share</span>
                <span className="text-[13px] font-bold text-red-600">{formatCurrency(financialStats.partner1.expensesShare)}</span>
              </div>
              <div className="bg-white p-2.5 rounded-xl border border-[#E9E3DA]">
                <span className="text-[10px] text-[#6A6A6A] uppercase font-bold block">Net Profit Share</span>
                <span className="text-[13px] font-bold text-indigo-700">{formatCurrency(financialStats.partner1.netShare)}</span>
              </div>
            </div>

            <div className="mt-3 pt-3 border-t border-[#E9E3DA] flex items-center justify-between">
              <span className="text-[12px] font-bold text-[#6A6A6A]">Total Payable Balance:</span>
              <span className="text-[16px] font-extrabold text-[#111111]">
                {formatCurrency(financialStats.partner1.totalPayable)}
              </span>
            </div>
          </div>

          {/* Partner 2 — Shaz */}
          <div className="bg-[#FCFBF8] border border-[#E9E3DA] rounded-2xl p-5 flex flex-col justify-between relative overflow-hidden group hover:border-emerald-300 transition-all">
            <div className="flex justify-between items-center mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 text-white font-bold flex items-center justify-center text-[14px]">
                  {financialStats.partner2.name.substring(0, 2).toUpperCase()}
                </div>
                <div>
                  <h4 className="text-[15px] font-extrabold text-[#111111] leading-none">
                    {financialStats.partner2.name}
                  </h4>
                  <span className="text-[11px] text-[#6A6A6A] mt-1 block">
                    Equal Equity Partner ({financialStats.partner2.sharePct}%)
                  </span>
                </div>
              </div>
              <span className="px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-700 text-[11px] font-bold font-mono border border-emerald-100">
                {financialStats.partner2.sharePct}% Equity
              </span>
            </div>

            <div className="grid grid-cols-3 gap-3 my-2 text-center">
              <div className="bg-white p-2.5 rounded-xl border border-[#E9E3DA]">
                <span className="text-[10px] text-[#6A6A6A] uppercase font-bold block">Revenue Share</span>
                <span className="text-[13px] font-bold text-emerald-700">{formatCurrency(financialStats.partner2.revenueShare)}</span>
              </div>
              <div className="bg-white p-2.5 rounded-xl border border-[#E9E3DA]">
                <span className="text-[10px] text-[#6A6A6A] uppercase font-bold block">Expenses Share</span>
                <span className="text-[13px] font-bold text-red-600">{formatCurrency(financialStats.partner2.expensesShare)}</span>
              </div>
              <div className="bg-white p-2.5 rounded-xl border border-[#E9E3DA]">
                <span className="text-[10px] text-[#6A6A6A] uppercase font-bold block">Net Profit Share</span>
                <span className="text-[13px] font-bold text-emerald-700">{formatCurrency(financialStats.partner2.netShare)}</span>
              </div>
            </div>

            <div className="mt-3 pt-3 border-t border-[#E9E3DA] flex items-center justify-between">
              <span className="text-[12px] font-bold text-[#6A6A6A]">Total Payable Balance:</span>
              <span className="text-[16px] font-extrabold text-[#111111]">
                {formatCurrency(financialStats.partner2.totalPayable)}
              </span>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Lower Section: Project Progress Tracker & Live Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Project Progress Overview Table */}
        <div className="lg:col-span-2 bg-white border border-[#E9E3DA] rounded-2xl p-6 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-center mb-5">
              <div>
                <h3 className="text-[15px] font-extrabold text-[#111111]">Active Projects Progress</h3>
                <p className="text-[11.5px] text-[#6A6A6A]">Live status, progress bar, and completion targets</p>
              </div>
              <button
                onClick={() => setView("projects")}
                className="text-[11.5px] font-bold text-indigo-600 hover:underline"
              >
                View all projects
              </button>
            </div>

            <div className="flex flex-col gap-3">
              {activeProjects.slice(0, 5).map((project) => {
                const completedTasks = (project.tasks || []).filter((t) => t.status === "Completed" || t.completed).length;
                const totalTasks = (project.tasks || []).length;
                return (
                  <div
                    key={project._id}
                    onClick={() => {
                      setActiveClientId(project._id);
                      setView("projects");
                    }}
                    className="flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-2xl bg-[#FCFBF8] border border-[#E9E3DA] hover:border-[#111111] transition-all cursor-pointer gap-4"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-white border border-[#E9E3DA] flex items-center justify-center font-bold text-[13px] text-[#111111] shrink-0">
                        {project.logo || "GB"}
                      </div>
                      <div className="min-w-0">
                        <div className="text-[13.5px] font-bold text-[#111111] flex items-center gap-2 truncate">
                          <span>{project.company}</span>
                          <span className="text-[12px]">{project.countryFlag}</span>
                        </div>
                        <div className="text-[11px] text-[#6A6A6A] mt-0.5">
                          Client: {project.name} · {project.industry}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-6 min-w-[240px]">
                      {/* Progress Bar & % */}
                      <div className="flex-1">
                        <div className="flex justify-between items-center text-[11px] font-mono mb-1 font-bold">
                          <span className="text-[#6A6A6A]">Completion</span>
                          <span className="text-[#111111]">{project.progress}%</span>
                        </div>
                        <div className="w-full h-2 rounded-full bg-slate-200 overflow-hidden">
                          <div
                            className="h-full rounded-full bg-emerald-500 transition-all duration-500"
                            style={{ width: `${project.progress}%` }}
                          />
                        </div>
                      </div>

                      {/* Status badge */}
                      <div className="shrink-0 text-right">
                        <span className={`px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider border font-mono ${getStatusBadge(project.stage)}`}>
                          {project.stage}
                        </span>
                        <div className="text-[10px] text-[#6A6A6A] mt-1 font-mono flex items-center gap-1 justify-end">
                          <Clock size={10} />
                          <span>Due: {project.expectedDelivery || "TBD"}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}

              {activeProjects.length === 0 && (
                <div className="p-8 text-center bg-[#FCFBF8] border border-[#E9E3DA] rounded-2xl text-[#6A6A6A]">
                  <Briefcase className="mx-auto text-[#6A6A6A]/30 mb-2" size={32} />
                  <p className="text-[13px] font-bold">No active projects running.</p>
                  <p className="text-[11px] text-[#6A6A6A] mt-0.5">Create a project to start tracking financials and tasks.</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Workspace Activity Feed */}
        <div className="bg-white border border-[#E9E3DA] rounded-2xl p-6 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-center mb-5">
              <h3 className="text-[15px] font-extrabold text-[#111111]">Recent Activity</h3>
              <span className="text-[10.5px] font-mono bg-[#FCFBF8] border border-[#E9E3DA] px-2 py-0.5 rounded text-[#6A6A6A]">
                Live Log
              </span>
            </div>

            <div className="flex flex-col gap-4 relative pl-3 border-l border-[#E9E3DA]">
              {globalActivities.slice(0, 6).map((act, i) => (
                <div key={i} className="relative text-[12px]">
                  <span className="absolute -left-[16.5px] top-1.5 w-2 h-2 rounded-full bg-indigo-600 shadow-[0_0_8px_rgba(99,102,241,0.4)]" />
                  <p className="text-[#111111] leading-snug font-medium">{act.text}</p>
                  <span className="text-[10px] text-[#6A6A6A] block mt-1 font-mono">{act.timestamp}</span>
                </div>
              ))}
              {globalActivities.length === 0 && (
                <div className="text-[#6A6A6A] text-[12px] italic text-center py-6">
                  No activity recorded yet. Add an expense or payment to test live logging.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

