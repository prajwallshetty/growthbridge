"use client";

import React, { useState } from "react";
import { useCRM } from "@/components/crm/CRMProvider";
import TopBar from "@/components/crm/TopBar";
import AIAssistantWidget from "@/components/crm/AIAssistantWidget";
import ClientsView from "@/components/crm/ClientsView";
import KanbanView from "@/components/crm/KanbanView";
import ProjectsView from "@/components/crm/ProjectsView";
import TasksView from "@/components/crm/TasksView";
import CalendarView from "@/components/crm/CalendarView";
import InvoicesView from "@/components/crm/InvoicesView";
import ProposalsView from "@/components/crm/ProposalsView";
import AgreementsView from "@/components/crm/AgreementsView";
import FilesView from "@/components/crm/FilesView";
import MessagesView from "@/components/crm/MessagesView";
import MeetingsView from "@/components/crm/MeetingsView";
import AnalyticsView from "@/components/crm/AnalyticsView";
import SettingsView from "@/components/crm/SettingsView";
import ClientDetailsWorkspace from "@/components/crm/ClientDetailsWorkspace";
import { AnimatePresence, motion } from "framer-motion";
import {
  Sun,
  Bell,
  ChevronDown,
  User,
  TrendingUp,
  TrendingDown,
  ArrowUpRight,
  Sparkles,
  Search,
  Plus,
  Video,
  Calendar,
  Layers,
  Activity,
  FileText,
  FileCheck,
  CheckSquare,
  FolderOpen,
  CheckCircle,
  HelpCircle,
  IndianRupee,
  RefreshCw,
} from "lucide-react";

export default function AdminPageDispatcher() {
  const { 
    view, 
    setView, 
    clients, 
    activeClientId, 
    setActiveClientId, 
    aiActive, 
    setAiActive, 
    stats,
    toggleTask,
    globalActivities,
    loading
  } = useCRM();

  const [searchFocused, setSearchFocused] = useState(false);

  // Redesigned dashboard view matching the mockup exactly
  const renderDashboardView = () => {
    // Top Tasks
    const activeTasks = clients
      .flatMap((c) => c.tasks.map(t => ({ ...t, client: c })))
      .filter((t) => t.status !== "Completed")
      .slice(0, 5);

    // Recent clients list
    const recentClients = [...clients].slice(0, 5);

    // Upcoming events/meetings
    const upcomingEvents = clients
      .flatMap((c) => c.meetings.map(m => ({ ...m, client: c })))
      .filter((m) => m.status === "Upcoming")
      .slice(0, 3);

    return (
      <div className="flex flex-col gap-8 pb-10">
        
        {/* Welcome Banner */}
        <div className="flex justify-between items-center flex-wrap gap-4">
          <div>
            <h1 className="text-[28px] font-extrabold tracking-tight text-[#111111] leading-none">
              Welcome back, Prajwal 👋
            </h1>
            <p className="text-[14px] text-[#6A6A6A] mt-2">
              Here is what is happening with your projects today.
            </p>
          </div>
        </div>

        {/* 4 Stat Cards Grid with Sparkline Graph Visuals */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          
          {/* Card 1: Total Revenue */}
          <div className="bg-white border border-[#E9E3DA] rounded-[24px] p-6 shadow-[0_4px_20px_rgba(0,0,0,0.015)] flex flex-col justify-between h-40">
            <div className="flex justify-between items-start">
              <span className="text-[11px] font-mono text-[#6A6A6A] uppercase font-bold tracking-wider">Total Revenue</span>
              <span className="px-2 py-0.5 rounded text-[10px] bg-emerald-50 text-emerald-600 border border-emerald-100 font-bold">INR</span>
            </div>
            <div>
              <div className="text-[28px] font-extrabold text-[#111111] tracking-tight">₹{stats.totalRevenue.toLocaleString()}</div>
              <div className="text-[11.5px] mt-2 flex items-center gap-1 text-emerald-600 font-bold">
                <TrendingUp size={13} />
                <span>+12.5% this month</span>
              </div>
            </div>
          </div>

          {/* Card 2: Active Clients */}
          <div className="bg-white border border-[#E9E3DA] rounded-[24px] p-6 shadow-[0_4px_20px_rgba(0,0,0,0.015)] flex flex-col justify-between h-40">
            <div className="flex justify-between items-start">
              <span className="text-[11px] font-mono text-[#6A6A6A] uppercase font-bold tracking-wider">Active Clients</span>
              <span className="px-2 py-0.5 rounded text-[10px] bg-[#FCFBF8] border border-[#E9E3DA] text-[#6A6A6A] font-bold">Directory</span>
            </div>
            <div>
              <div className="text-[28px] font-extrabold text-[#111111] tracking-tight">{stats.activeClients}</div>
              <div className="text-[11.5px] mt-2 flex items-center gap-1 text-emerald-600 font-bold">
                <TrendingUp size={13} />
                <span>+8.3% this month</span>
              </div>
            </div>
          </div>

          {/* Card 3: Projects in Progress */}
          <div className="bg-white border border-[#E9E3DA] rounded-[24px] p-6 shadow-[0_4px_20px_rgba(0,0,0,0.015)] flex flex-col justify-between h-40">
            <div className="flex justify-between items-start">
              <span className="text-[11px] font-mono text-[#6A6A6A] uppercase font-bold tracking-wider">Projects In Progress</span>
              <span className="px-2 py-0.5 rounded text-[10px] bg-blue-50 text-blue-600 border border-blue-100 font-bold">Delivery</span>
            </div>
            <div>
              <div className="text-[28px] font-extrabold text-[#111111] tracking-tight">{clients.filter(c => c.stage === "Development" || c.stage === "Testing").length}</div>
              <div className="text-[11.5px] mt-2 flex items-center gap-1 text-emerald-600 font-bold">
                <TrendingUp size={13} />
                <span>+11.7% this month</span>
              </div>
            </div>
          </div>

          {/* Card 4: Pending Payments */}
          <div className="bg-white border border-[#E9E3DA] rounded-[24px] p-6 shadow-[0_4px_20px_rgba(0,0,0,0.015)] flex flex-col justify-between h-40">
            <div className="flex justify-between items-start">
              <span className="text-[11px] font-mono text-[#6A6A6A] uppercase font-bold tracking-wider">Pending Payments</span>
              <span className="px-2 py-0.5 rounded text-[10px] bg-red-50 text-red-600 border border-red-100 font-bold">Receivables</span>
            </div>
            <div>
              <div className="text-[28px] font-extrabold text-[#111111] tracking-tight">₹{stats.pendingPayments.toLocaleString()}</div>
              <div className="text-[11.5px] mt-2 flex items-center gap-1 text-red-600 font-bold">
                <TrendingDown size={13} />
                <span>-3.1% this month</span>
              </div>
            </div>
          </div>

        </div>

        {/* Core row containing Charts, Upcoming Events, recent clients, checklist */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          
          {/* Main workspace section (Col-span-2) */}
          <div className="lg:col-span-2 flex flex-col gap-8">
            
            {/* Chart: Revenue Overview */}
            <div className="bg-white border border-[#E9E3DA] rounded-[24px] p-6 shadow-sm flex flex-col gap-4">
              <div className="flex justify-between items-center flex-wrap gap-2">
                <div>
                  <h3 className="text-[14px] font-bold text-[#111111]">Revenue Overview</h3>
                  <span className="text-[11.5px] text-[#6A6A6A]">Monthly billing logs</span>
                </div>
                <select className="bg-[#FCFBF8] border border-[#E9E3DA] rounded-lg px-2.5 py-1 text-[11px] font-bold text-[#6A6A6A]">
                  <option>This Month</option>
                  <option>Last 3 Months</option>
                </select>
              </div>

              {/* Real dynamic monthly chart */}
              <div className="h-56 w-full relative flex items-end">
                {(() => {
                  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
                  const monthlyTotals = Array(12).fill(0);
                  
                  clients.forEach(c => {
                    (c.invoices || []).forEach(inv => {
                      if (inv.status === "Paid") {
                        const date = new Date(inv.dueDate);
                        if (!isNaN(date.getTime())) {
                          monthlyTotals[date.getMonth()] += inv.amount;
                        } else {
                          monthlyTotals[new Date().getMonth()] += inv.amount;
                        }
                      }
                    });
                  });
                  
                  const currentMonthIndex = new Date().getMonth();
                  const monthlyData: { label: string; value: number }[] = [];
                  for (let i = 5; i >= 0; i--) {
                    const mIndex = (currentMonthIndex - i + 12) % 12;
                    monthlyData.push({
                      label: months[mIndex],
                      value: monthlyTotals[mIndex]
                    });
                  }

                  const maxValue = Math.max(...monthlyData.map(d => d.value), 10000);
                  const points = monthlyData.map((d, index) => ({
                    x: 35 + index * 85, // Scale X from 35 to 460
                    y: 140 - (d.value / maxValue) * 90 // Scale Y from 50 to 140
                  }));
                  
                  const pathD = points.map((p, i) => (i === 0 ? `M ${p.x} ${p.y}` : `L ${p.x} ${p.y}`)).join(" ");
                  const activePoint = points[5];
                  const activeMonthData = monthlyData[5];

                  return (
                    <svg className="w-full h-full overflow-visible" viewBox="0 0 500 200">
                      {/* Grid guidelines */}
                      <line x1="20" y1="140" x2="480" y2="140" stroke="#FCFBF8" strokeWidth="1" />
                      <line x1="20" y1="95" x2="480" y2="95" stroke="#FCFBF8" strokeWidth="1" />
                      <line x1="20" y1="50" x2="480" y2="50" stroke="#FCFBF8" strokeWidth="1" />

                      {/* Real Dynamic Line Chart */}
                      <path
                        d={pathD}
                        fill="none"
                        stroke="#111111"
                        strokeWidth="3"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                      
                      {/* Points */}
                      {points.map((p, i) => (
                        <circle 
                          key={i} 
                          cx={p.x} 
                          cy={p.y} 
                          r="4" 
                          fill={i === 5 ? "#111111" : "#E9E3DA"} 
                          stroke="#111111"
                          strokeWidth="1.5"
                        />
                      ))}
                      
                      {/* Current Month Highlighting circle */}
                      <circle cx={activePoint.x} cy={activePoint.y} r="7" fill="#111111" />
                      
                      {/* Tooltip text for current month */}
                      <text 
                        x={activePoint.x - 105} 
                        y={activePoint.y - 12} 
                        className="text-[11px] font-bold fill-[#111111]" 
                        fontFamily="monospace"
                      >
                        ₹{activeMonthData.value.toLocaleString()} ({activeMonthData.label})
                      </text>

                      {/* Dynamic Month Labels */}
                      {points.map((p, i) => (
                        <text
                          key={i}
                          x={p.x}
                          y="170"
                          textAnchor="middle"
                          className="text-[10px] font-mono fill-[#8E8E93] font-bold"
                        >
                          {monthlyData[i].label}
                        </text>
                      ))}
                    </svg>
                  );
                })()}
              </div>
            </div>

            {/* List: Recent Clients */}
            <div className="bg-white border border-[#E9E3DA] rounded-[24px] p-6 shadow-sm">
              <div className="flex justify-between items-center mb-4 border-b border-[#FCFBF8] pb-3">
                <h3 className="text-[14px] font-bold text-[#111111]">Recent Clients</h3>
                <button onClick={() => setView("clients")} className="text-[11.5px] font-bold text-[#111111] hover:underline">
                  View All
                </button>
              </div>
              <div className="flex flex-col divide-y divide-[#E9E3DA]/45">
                {recentClients.map((c) => (
                  <div 
                    key={c._id}
                    onClick={() => { setActiveClientId(c._id); setView("clients"); }}
                    className="flex justify-between items-center py-3.5 hover:bg-[#FCFBF8]/30 transition-all rounded-lg px-2 cursor-pointer"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-[#FCFBF8] border border-[#E9E3DA] flex items-center justify-center font-bold text-[11px]">
                        {c.logo}
                      </div>
                      <div>
                        <strong className="text-[13px] text-[#111111] block leading-none">{c.company}</strong>
                        <span className="text-[11px] text-[#6A6A6A] mt-1 block">{c.industry}</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <strong className="text-[13px] text-[#111111] block">₹{c.budget.toLocaleString()}</strong>
                      <span className={`inline-block px-1.5 py-0.5 rounded text-[9.5px] font-bold mt-1 uppercase ${
                        c.stage === "Project Completed" ? "bg-emerald-50 text-emerald-600 border border-emerald-100" : "bg-blue-50 text-blue-600 border-blue-100"
                      }`}>
                        {c.stage}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Checklist: My Tasks */}
            <div className="bg-white border border-[#E9E3DA] rounded-[24px] p-6 shadow-sm">
              <div className="flex justify-between items-center mb-4 border-b border-[#FCFBF8] pb-3">
                <h3 className="text-[14px] font-bold text-[#111111]">My Tasks</h3>
                <button onClick={() => setView("tasks")} className="text-[11.5px] font-bold text-[#111111] hover:underline">
                  View All
                </button>
              </div>
              <div className="flex flex-col gap-2.5">
                {activeTasks.map((task) => (
                  <div 
                    key={task._id}
                    onClick={() => toggleTask(task.client._id, task._id)}
                    className="flex items-center justify-between p-3 bg-[#FCFBF8] border border-[#E9E3DA] rounded-xl hover:border-[#111111] transition-all cursor-pointer"
                  >
                    <div className="flex items-center gap-3">
                      <input 
                        type="checkbox" 
                        checked={task.status === "Completed"} 
                        readOnly 
                        className="w-4 h-4 rounded border-[#E9E3DA]" 
                      />
                      <span className="text-[13px] font-semibold text-[#111111]">{task.title}</span>
                    </div>
                    <span className="text-[10px] font-mono font-bold text-[#A8A296] bg-white border border-[#E9E3DA] px-2 py-0.5 rounded">
                      {task.client.company.split(" ")[0]}
                    </span>
                  </div>
                ))}
                {activeTasks.length === 0 && (
                  <p className="text-center text-[#6A6A6A] italic text-[12px] py-4">All tasks are up-to-date.</p>
                )}
              </div>
            </div>

          </div>

          {/* Right sidebar details (Col-span-1) */}
          <div className="flex flex-col gap-8">
            
            {/* Upcoming Events Panel */}
            <div className="bg-white border border-[#E9E3DA] rounded-[24px] p-6 shadow-sm">
              <div className="flex justify-between items-center mb-4 border-b border-[#FCFBF8] pb-3">
                <h3 className="text-[14px] font-bold text-[#111111]">Upcoming Events</h3>
                <button onClick={() => setView("calendar")} className="text-[11.5px] font-bold text-[#111111] hover:underline">
                  View Calendar
                </button>
              </div>
              <div className="flex flex-col gap-3">
                {upcomingEvents.map((meet) => (
                  <div key={meet._id} className="p-3.5 bg-[#FCFBF8] border border-[#E9E3DA] rounded-xl flex items-start gap-3">
                    <div className="w-8 h-8 rounded-lg bg-white border border-[#E9E3DA] flex items-center justify-center text-[#6A6A6A] shrink-0">
                      <Video size={15} />
                    </div>
                    <div className="min-w-0">
                      <strong className="text-[12.5px] font-bold text-[#111111] block truncate leading-tight">
                        {meet.title} - {meet.client.company}
                      </strong>
                      <span className="text-[11px] text-[#6A6A6A] mt-1 block font-medium">
                        {meet.date} at {meet.time}
                      </span>
                    </div>
                  </div>
                ))}
                {upcomingEvents.length === 0 && (
                  <p className="text-center text-[#6A6A6A] italic text-[12px] py-4">No events scheduled.</p>
                )}
              </div>
            </div>

            {/* Activity Feed Panel */}
            <div className="bg-white border border-[#E9E3DA] rounded-[24px] p-6 shadow-sm">
              <div className="flex justify-between items-center mb-4 border-b border-[#FCFBF8] pb-3">
                <h3 className="text-[14px] font-bold text-[#111111]">Activity Feed</h3>
              </div>
              <div className="flex flex-col gap-4 relative pl-3.5 border-l border-[#E9E3DA]">
                {globalActivities.slice(0, 4).map((act, index) => (
                  <div key={index} className="relative text-[12px] leading-relaxed">
                    <span className="absolute -left-[19.5px] top-1.5 w-1.5 h-1.5 rounded-full bg-emerald-500" />
                    <p className="font-semibold text-[#111111]">{act.text}</p>
                    <span className="text-[9.5px] text-[#A8A296] font-mono mt-0.5 block">{act.timestamp}</span>
                  </div>
                ))}
                {globalActivities.length === 0 && (
                  <p className="text-center text-[#6A6A6A] italic text-[11px] py-4">No activities logged yet.</p>
                )}
              </div>
            </div>

            {/* AI Assistant Banner */}
            <div className="bg-gradient-to-br from-[#111111] to-[#222222] text-white border border-[#111111] rounded-[24px] p-6 shadow-md flex flex-col gap-4">
              <div className="flex items-center gap-2">
                <Sparkles size={18} className="text-amber-400" />
                <h3 className="text-[14.5px] font-bold tracking-tight">AI Assistant Panel</h3>
              </div>
              <p className="text-[12px] text-white/70 leading-relaxed font-medium">
                Draft legal contracts, generate proposals, and summarize client sync sessions using real context.
              </p>
              <button 
                onClick={() => setAiActive(!aiActive)}
                className="w-full text-center py-2 bg-white hover:bg-white/95 text-black font-bold rounded-xl text-[12px] transition-all shadow cursor-pointer"
              >
                Open AI Panel
              </button>
            </div>

          </div>

        </div>

        {/* Quick Actions Sticky Bottom Strip */}
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-[#0B0B0BBF] backdrop-blur-md border border-[#1C1C1C] rounded-2xl py-2 px-4 shadow-2xl flex items-center gap-2.5 z-40 select-none">
          <button onClick={() => { setView("clients"); }} className="flex items-center gap-1.5 px-3 py-1.5 text-white/95 hover:text-white text-[11.5px] font-bold transition-colors cursor-pointer">
            <User size={13} />
            <span>New Client</span>
          </button>
          <button onClick={() => { setView("projects"); }} className="flex items-center gap-1.5 px-3 py-1.5 text-white/95 hover:text-white text-[11.5px] font-bold border-l border-white/10 pl-3.5 transition-colors cursor-pointer">
            <Layers size={13} />
            <span>New Project</span>
          </button>
          <button onClick={() => { setView("proposals"); }} className="flex items-center gap-1.5 px-3 py-1.5 text-white/95 hover:text-white text-[11.5px] font-bold border-l border-white/10 pl-3.5 transition-colors cursor-pointer">
            <FileText size={13} />
            <span>Create Proposal</span>
          </button>
          <button onClick={() => { setView("invoices"); }} className="flex items-center gap-1.5 px-3 py-1.5 text-white/95 hover:text-white text-[11.5px] font-bold border-l border-white/10 pl-3.5 transition-colors cursor-pointer">
            <IndianRupee size={13} />
            <span>Create Invoice</span>
          </button>
        </div>

      </div>
    );
  };

  const renderActiveSubView = () => {
    switch (view) {
      case "dashboard":
        return renderDashboardView();
      case "clients":
        return <ClientsView />;
      case "kanban":
        return <KanbanView />;
      case "projects":
        return <ProjectsView />;
      case "tasks":
        return <TasksView />;
      case "calendar":
        return <CalendarView />;
      case "invoices":
        return <InvoicesView />;
      case "proposals":
        return <ProposalsView />;
      case "agreements":
        return <AgreementsView />;
      case "files":
        return <FilesView />;
      case "messages":
        return <MessagesView />;
      case "meetings":
        return <MeetingsView />;
      case "analytics":
        return <AnalyticsView />;
      case "settings":
        return <SettingsView />;
      default:
        return renderDashboardView();
    }
  };

  return (
    <>
      {loading ? (
        <div className="h-[60vh] flex flex-col items-center justify-center text-[#6A6A6A] font-mono text-[12.5px] gap-2">
          <RefreshCw size={24} className="animate-spin text-[#111111]" />
          <span>Accessing database nodes...</span>
        </div>
      ) : (
        <AnimatePresence mode="wait">
          <motion.div
            key={activeClientId || view}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
            className="h-full"
          >
            {activeClientId ? <ClientDetailsWorkspace /> : renderActiveSubView()}
          </motion.div>
        </AnimatePresence>
      )}
    </>
  );
}
