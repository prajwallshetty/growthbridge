"use client";

import React from "react";
import { CRMProvider, useCRM } from "@/components/crm/CRMProvider";
import TopBar from "@/components/crm/TopBar";
import AIAssistantWidget from "@/components/crm/AIAssistantWidget";
import DashboardView from "@/components/crm/DashboardView";
import ClientsView from "@/components/crm/ClientsView";
import KanbanView from "@/components/crm/KanbanView";
import ClientDetailsWorkspace from "@/components/crm/ClientDetailsWorkspace";
import CalendarView from "@/components/crm/CalendarView";
import AnalyticsView from "@/components/crm/AnalyticsView";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard,
  KanbanSquare,
  Users,
  Calendar as CalendarIcon,
  BarChart3,
  Settings as SettingsIcon,
  Sparkles,
  FileText,
  FileCheck,
  FolderOpen,
} from "lucide-react";

function CRMWorkspaceContent() {
  const { view, setView, activeClientId, setActiveClientId, aiActive } = useCRM();

  // Submenu items for internal CRM navigation inside Admin portal
  const subMenuItems = [
    { id: "dashboard", label: "Overview", icon: <LayoutDashboard size={14} /> },
    { id: "kanban", label: "Kanban Pipeline", icon: <KanbanSquare size={14} /> },
    { id: "clients", label: "Clients Directory", icon: <Users size={14} /> },
    { id: "calendar", label: "Calendar", icon: <CalendarIcon size={14} /> },
    { id: "analytics", label: "Analytics Reports", icon: <BarChart3 size={14} /> },
    { id: "settings", label: "CRM Settings", icon: <SettingsIcon size={14} /> },
  ] as const;

  const handleSubMenuClick = (id: typeof subMenuItems[number]["id"]) => {
    setActiveClientId(null);
    setView(id);
  };

  const renderActiveView = () => {
    switch (view) {
      case "dashboard":
        return <DashboardView />;
      case "clients":
        return <ClientsView />;
      case "kanban":
        return <KanbanView />;
      case "calendar":
        return <CalendarView />;
      case "analytics":
        return <AnalyticsView />;
      case "settings":
        return (
          <div className="flex flex-col gap-6 max-w-xl">
            <div>
              <h2 className="text-[20px] font-extrabold text-[#111111]">CRM Settings</h2>
              <p className="text-[13px] text-[#6A6A6A]">Configure CRM system parameters.</p>
            </div>
            <div className="flex flex-col gap-4 bg-white border border-[#E9E3DA] p-5 rounded-2xl">
              <div className="flex justify-between items-center py-2 border-b border-[#E9E3DA]">
                <div>
                  <div className="text-[13.5px] font-bold text-[#111111]">Auto-Seeding Sample Data</div>
                  <span className="text-[11px] text-[#6A6A6A]">Re-populates layout lists for test sandbox</span>
                </div>
                <span className="px-2.5 py-0.5 rounded text-[10px] bg-emerald-50 text-emerald-600 border border-emerald-200 font-bold uppercase tracking-wider font-mono">
                  Active
                </span>
              </div>
              <div className="flex justify-between items-center py-2">
                <div>
                  <div className="text-[13.5px] font-bold text-[#111111]">AI Context Indexing</div>
                  <span className="text-[11px] text-[#6A6A6A]">Sync client profile tags with document model</span>
                </div>
                <span className="px-2.5 py-0.5 rounded text-[10px] bg-amber-50 text-amber-600 border border-[#E9E3DA] font-bold uppercase tracking-wider font-mono">
                  Enabled
                </span>
              </div>
            </div>
          </div>
        );
      default:
        return <DashboardView />;
    }
  };

  return (
    <div className="flex flex-col gap-6 h-full relative">
      {/* Search & Top Action panel (Submenu tabs bar + Topbar inline actions) */}
      <div className="flex items-center justify-between flex-wrap gap-4 border-b border-[#E9E3DA] pb-4 shrink-0">
        {/* Navigation list */}
        <div className="flex items-center gap-1.5 bg-[#FCFBF8] border border-[#E9E3DA] rounded-xl p-1 overflow-x-auto scrollbar-none">
          {subMenuItems.map((item) => {
            const isActive = view === item.id && !activeClientId;
            return (
              <button
                key={item.id}
                onClick={() => handleSubMenuClick(item.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-[12.5px] font-semibold transition-all whitespace-nowrap cursor-pointer ${
                  isActive
                    ? "bg-[#111111] text-white"
                    : "text-[#6A6A6A] hover:text-[#111111] hover:bg-white"
                }`}
              >
                {item.icon}
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>

        {/* Global actions: search, add client triggers */}
        <div className="flex items-center gap-3">
          <TopBar />
        </div>
      </div>

      {/* Main active views workspace */}
      <div className={`flex-1 overflow-y-auto transition-all duration-300 ${
        aiActive ? "pr-[400px]" : ""
      }`}>
        <AnimatePresence mode="wait">
          <motion.div
            key={activeClientId || view}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
          >
            {activeClientId ? <ClientDetailsWorkspace /> : renderActiveView()}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* AI Assistant Right slide panel */}
      <AIAssistantWidget />
    </div>
  );
}

export default function CRMPage() {
  return (
    <CRMProvider>
      <div className="h-full">
        <CRMWorkspaceContent />
      </div>
    </CRMProvider>
  );
}
