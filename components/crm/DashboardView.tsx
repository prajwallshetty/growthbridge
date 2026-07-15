"use client";

import React from "react";
import { useCRM } from "./CRMProvider";
import {
  IndianRupee,
  Users,
  Briefcase,
  AlertCircle,
  Video,
  ArrowUpRight,
  TrendingUp,
  FileSpreadsheet,
  Calendar,
  Sparkles,
} from "lucide-react";
import { motion } from "framer-motion";

const EASE = [0.22, 1, 0.36, 1] as const;

export default function DashboardView() {
  const { stats, clients, setView, setActiveClientId, globalActivities, setAiActive } = useCRM();

  const recentClients = [...clients]
    .sort((a, b) => b.startDate.localeCompare(a.startDate))
    .slice(0, 4);

  const recentActs = globalActivities.slice(0, 5);

  const handleClientClick = (id: string) => {
    setActiveClientId(id);
    setView("clients");
  };

  const revenueHistory = [
    { month: "Jan", revenue: 800000 },
    { month: "Feb", revenue: 950000 },
    { month: "Mar", revenue: 1400000 },
    { month: "Apr", revenue: 1200000 },
    { month: "May", revenue: 1850000 },
    { month: "Jun", revenue: 2300000 },
    { month: "Jul", revenue: stats.totalRevenue || 2500000 },
  ];

  const maxRev = Math.max(...revenueHistory.map((d) => d.revenue));

  return (
    <div className="flex flex-col gap-8 pb-10 select-none">
      {/* Welcome banner */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h2 className="text-[22px] font-extrabold tracking-tight text-[#111111] leading-tight">
            Studio Overview
          </h2>
          <p className="text-[13px] text-[#6A6A6A] mt-1">
            CRM Operational analytics and metrics dashboard.
          </p>
        </div>
        <div className="text-[11.5px] font-mono bg-white border border-[#E9E3DA] px-3.5 py-1.5 rounded-lg text-[#6A6A6A] font-bold">
          Today: {new Date().toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" })}
        </div>
      </div>

      {/* Top Statistics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {/* Total Revenue */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: EASE }}
          className="bg-white border border-[#E9E3DA] rounded-2xl p-5 shadow-sm relative overflow-hidden"
        >
          <div className="flex justify-between items-start mb-3">
            <span className="text-[11px] font-mono text-[#6A6A6A] uppercase tracking-[0.08em] font-bold">Total Revenue</span>
            <div className="p-1.5 bg-[#FCFBF8] border border-[#E9E3DA] rounded-lg text-[#111111]">
              <IndianRupee size={14} />
            </div>
          </div>
          <div className="text-[24px] font-extrabold text-[#111111] tracking-tight leading-none">
            ₹{(stats.totalRevenue / 100000).toFixed(1)}L
          </div>
          <div className="text-[10px] mt-2 flex items-center gap-1 text-emerald-600 font-semibold">
            <TrendingUp size={12} />
            <span>+18.4% vs last month</span>
          </div>
        </motion.div>

        {/* Active Clients */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.05, ease: EASE }}
          className="bg-white border border-[#E9E3DA] rounded-2xl p-5 shadow-sm relative overflow-hidden"
        >
          <div className="flex justify-between items-start mb-3">
            <span className="text-[11px] font-mono text-[#6A6A6A] uppercase tracking-[0.08em] font-bold">Active Clients</span>
            <div className="p-1.5 bg-[#FCFBF8] border border-[#E9E3DA] rounded-lg text-[#111111]">
              <Users size={14} />
            </div>
          </div>
          <div className="text-[24px] font-extrabold text-[#111111] tracking-tight leading-none">
            {stats.activeClients}
          </div>
          <div className="text-[10px] text-[#6A6A6A] mt-2 font-medium">
            Leads in pipeline
          </div>
        </motion.div>

        {/* Projects Completed */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1, ease: EASE }}
          className="bg-white border border-[#E9E3DA] rounded-2xl p-5 shadow-sm relative overflow-hidden"
        >
          <div className="flex justify-between items-start mb-3">
            <span className="text-[11px] font-mono text-[#6A6A6A] uppercase tracking-[0.08em] font-bold">Completed</span>
            <div className="p-1.5 bg-[#FCFBF8] border border-[#E9E3DA] rounded-lg text-[#111111]">
              <Briefcase size={14} />
            </div>
          </div>
          <div className="text-[24px] font-extrabold text-[#111111] tracking-tight leading-none">
            {stats.completedProjects}
          </div>
          <div className="text-[10px] text-[#6A6A6A] mt-2 font-medium">
            Projects delivered
          </div>
        </motion.div>

        {/* Pending Payments */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.15, ease: EASE }}
          className="bg-white border border-[#E9E3DA] rounded-2xl p-5 shadow-sm relative overflow-hidden"
        >
          <div className="flex justify-between items-start mb-3">
            <span className="text-[11px] font-mono text-[#6A6A6A] uppercase tracking-[0.08em] font-bold">Unpaid Invoices</span>
            <div className="p-1.5 bg-red-50 border border-red-100 rounded-lg text-red-500">
              <AlertCircle size={14} />
            </div>
          </div>
          <div className="text-[24px] font-extrabold text-[#111111] tracking-tight leading-none">
            ₹{(stats.pendingPayments / 100000).toFixed(1)}L
          </div>
          <div className="text-[10px] text-[#6A6A6A] mt-2 font-medium">
            Awaiting client release
          </div>
        </motion.div>

        {/* Upcoming Meetings */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2, ease: EASE }}
          className="bg-white border border-[#E9E3DA] rounded-2xl p-5 shadow-sm relative overflow-hidden"
        >
          <div className="flex justify-between items-start mb-3">
            <span className="text-[11px] font-mono text-[#6A6A6A] uppercase tracking-[0.08em] font-bold">Meetings</span>
            <div className="p-1.5 bg-[#FCFBF8] border border-[#E9E3DA] rounded-lg text-[#111111]">
              <Video size={14} />
            </div>
          </div>
          <div className="text-[24px] font-extrabold text-[#111111] tracking-tight leading-none">
            {stats.upcomingMeetings}
          </div>
          <div className="text-[10px] text-[#6A6A6A] mt-2 font-medium">
            Scheduled this week
          </div>
        </motion.div>
      </div>

      {/* Chart & Side Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Revenue Chart */}
        <div className="lg:col-span-2 bg-white border border-[#E9E3DA] rounded-2xl p-6 shadow-sm flex flex-col justify-between">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h3 className="text-[14px] font-bold text-[#111111]">Monthly Revenue Output</h3>
              <p className="text-[11.5px] text-[#6A6A6A]">Consolidated agency invoicing stats</p>
            </div>
            <span className="text-[11px] bg-[#FCFBF8] border border-[#E9E3DA] px-2.5 py-1 rounded text-[#111111] font-mono font-bold">
              ₹ INR
            </span>
          </div>

          {/* Stark Black/White/Gray Bar Chart */}
          <div className="relative h-[180px] w-full flex items-end justify-between px-2 pt-4">
            {/* Gridlines */}
            <div className="absolute inset-x-0 top-0 h-full flex flex-col justify-between pointer-events-none">
              <div className="w-full border-t border-[#FCFBF8] h-px" />
              <div className="w-full border-t border-[#FCFBF8] h-px" />
              <div className="w-full border-t border-[#FCFBF8] h-px" />
              <div className="w-full border-t border-[#FCFBF8] h-px" />
            </div>

            {revenueHistory.map((item, idx) => {
              const heightPct = (item.revenue / maxRev) * 85;
              return (
                <div key={idx} className="flex flex-col items-center gap-2.5 z-10 w-[12%] group relative">
                  <div className="absolute -top-10 scale-0 group-hover:scale-100 transition-all bg-white border border-[#E9E3DA] px-2 py-1 rounded text-[10.5px] text-[#111111] font-mono z-20 whitespace-nowrap shadow-xl">
                    ₹{(item.revenue / 100000).toFixed(2)} Lakhs
                  </div>

                  {/* Vertical bar */}
                  <div className="w-full bg-[#FCFBF8] border border-[#E9E3DA] rounded-t-lg h-[160px] flex items-end overflow-hidden">
                    <motion.div
                      initial={{ height: 0 }}
                      animate={{ height: `${heightPct}%` }}
                      transition={{ duration: 1, ease: EASE, delay: idx * 0.05 }}
                      className="w-full bg-[#111111] rounded-t-lg transition-all cursor-pointer"
                    />
                  </div>

                  {/* X Axis Label */}
                  <span className="text-[11px] font-mono text-[#6A6A6A] font-bold uppercase">
                    {item.month}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Quick Actions Panel */}
        <div className="bg-white border border-[#E9E3DA] rounded-2xl p-6 shadow-sm flex flex-col justify-between">
          <div>
            <h3 className="text-[14px] font-bold text-[#111111] mb-4">Quick Studio Actions</h3>
            <div className="flex flex-col gap-2.5">
              {/* Kanban trigger */}
              <button
                onClick={() => setView("kanban")}
                className="flex items-center justify-between p-3.5 rounded-xl bg-white border border-[#E9E3DA] hover:border-[#111111] transition-all text-left cursor-pointer"
              >
                <div>
                  <div className="text-[13px] font-bold text-[#111111]">Open Kanban Pipeline</div>
                  <div className="text-[10.5px] text-[#6A6A6A] mt-0.5">Drag & drop dashboard</div>
                </div>
                <ArrowUpRight size={14} className="text-[#6A6A6A]" />
              </button>

              {/* Generate Invoice with AI */}
              <button
                onClick={() => {
                  setView("invoices");
                  setAiActive(true);
                }}
                className="flex items-center justify-between p-3.5 rounded-xl bg-white border border-[#E9E3DA] hover:border-[#111111] transition-all text-left cursor-pointer"
              >
                <div>
                  <div className="text-[13px] font-bold text-[#111111] flex items-center gap-1.5">
                    <span>Draft Invoices / Retainers</span>
                    <Sparkles size={11} className="text-amber-500" />
                  </div>
                  <div className="text-[10.5px] text-[#6A6A6A] mt-0.5">Automated accounting</div>
                </div>
                <FileSpreadsheet size={14} className="text-[#6A6A6A]" />
              </button>

              {/* Calendar deadline scheduling */}
              <button
                onClick={() => setView("calendar")}
                className="flex items-center justify-between p-3.5 rounded-xl bg-white border border-[#E9E3DA] hover:border-[#111111] transition-all text-left cursor-pointer"
              >
                <div>
                  <div className="text-[13px] font-bold text-[#111111]">Check Delivery Calendar</div>
                  <div className="text-[10.5px] text-[#6A6A6A] mt-0.5">Sprint deadlines & meetings</div>
                </div>
                <Calendar size={14} className="text-[#6A6A6A]" />
              </button>
            </div>
          </div>

          <div className="text-[10.5px] font-mono text-[#6A6A6A] mt-6 border-t border-[#E9E3DA] pt-3 text-center">
            Linear-style minimal CRM interface v1.0
          </div>
        </div>
      </div>

      {/* Bottom Grid: Recent Clients & Activity Feed */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Clients List */}
        <div className="lg:col-span-2 bg-white border border-[#E9E3DA] rounded-2xl p-6 shadow-sm">
          <div className="flex justify-between items-center mb-5">
            <div>
              <h3 className="text-[14px] font-bold text-[#111111]">Recent Client Onboarding</h3>
              <p className="text-[11.5px] text-[#6A6A6A]">New client integrations and kickoffs</p>
            </div>
            <button
              onClick={() => setView("clients")}
              className="text-[11.5px] font-semibold text-[#111111] hover:underline"
            >
              See all clients
            </button>
          </div>

          <div className="flex flex-col gap-3">
            {recentClients.map((client) => (
              <div
                key={client._id}
                onClick={() => handleClientClick(client._id)}
                className="flex items-center justify-between p-3.5 rounded-xl bg-white border border-[#E9E3DA] hover:border-[#111111] cursor-pointer transition-all"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-[#FCFBF8] border border-[#E9E3DA] flex items-center justify-center font-bold text-[12px] text-[#111111]">
                    {client.logo}
                  </div>
                  <div>
                    <div className="text-[13px] font-bold text-[#111111] flex items-center gap-1.5 leading-none">
                      <span>{client.company}</span>
                      <span className="text-[13px]">{client.countryFlag}</span>
                    </div>
                    <div className="text-[11px] text-[#6A6A6A] mt-1.5">{client.name} · {client.industry}</div>
                  </div>
                </div>

                <div className="flex items-center gap-6">
                  {/* Budget */}
                  <div className="text-right">
                    <span className="text-[13.5px] font-bold text-[#111111]">
                      ₹{(client.budget / 100000).toFixed(1)}L
                    </span>
                    <p className="text-[10px] text-[#6A6A6A] mt-0.5">Budget</p>
                  </div>

                  {/* Stage indicator badge */}
                  <div className="w-32 hidden sm:block">
                    <div className="flex justify-between items-center text-[10px] mb-1">
                      <span className="text-[#6A6A6A] font-semibold leading-none">{client.stage}</span>
                      <span className="text-[#111111] font-mono leading-none">{client.progress}%</span>
                    </div>
                    <div className="h-1.5 rounded-full bg-[#E9E3DA] overflow-hidden">
                      <div
                        className="h-full rounded-full bg-emerald-500"
                        style={{ width: `${client.progress}%` }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Live Activity Feed */}
        <div className="bg-white border border-[#E9E3DA] rounded-2xl p-6 shadow-sm flex flex-col justify-between">
          <div>
            <h3 className="text-[14px] font-bold text-[#111111] mb-5">Workspace Live Activity</h3>
            <div className="flex flex-col gap-4 relative pl-3 border-l border-[#E9E3DA]">
              {recentActs.map((act) => (
                <div key={act.id} className="relative text-[12px]">
                  <span className="absolute -left-[16.5px] top-1.5 w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.3)]" />
                  <p className="text-[#111111] leading-normal font-medium">{act.text}</p>
                  <span className="text-[10px] text-[#6A6A6A] block mt-1 font-mono">{act.timestamp}</span>
                </div>
              ))}
              {recentActs.length === 0 && (
                <div className="text-[#6A6A6A] text-[12px] italic text-center py-6">
                  No activity logged yet. Modify a client status or upload a file.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
