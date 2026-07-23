"use client";

import React from "react";
import { CRMProvider, useCRM } from "@/components/crm/CRMProvider";
import TopBar from "@/components/crm/TopBar";
import DashboardView from "@/components/crm/DashboardView";
import ProjectsView from "@/components/crm/ProjectsView";
import ExpensesView from "@/components/crm/ExpensesView";
import RevenueView from "@/components/crm/RevenueView";
import SettingsView from "@/components/crm/SettingsView";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard,
  Briefcase,
  Receipt,
  IndianRupee,
  Settings as SettingsIcon,
} from "lucide-react";

function CRMWorkspaceContent() {
  const { view, setView, setActiveClientId } = useCRM();

  const subMenuItems = [
    { id: "dashboard", label: "Dashboard", icon: <LayoutDashboard size={14} /> },
    { id: "projects", label: "Projects", icon: <Briefcase size={14} /> },
    { id: "expenses", label: "Expenses", icon: <Receipt size={14} /> },
    { id: "revenue", label: "Revenue", icon: <IndianRupee size={14} /> },
    { id: "settings", label: "Settings", icon: <SettingsIcon size={14} /> },
  ] as const;

  const handleSubMenuClick = (id: typeof subMenuItems[number]["id"]) => {
    setActiveClientId(null);
    setView(id as any);
  };

  const renderActiveView = () => {
    switch (view) {
      case "dashboard":
        return <DashboardView />;
      case "projects":
        return <ProjectsView />;
      case "expenses":
        return <ExpensesView />;
      case "revenue":
        return <RevenueView />;
      case "settings":
        return <SettingsView />;
      default:
        return <DashboardView />;
    }
  };

  return (
    <div className="flex flex-col gap-6 h-full relative">
      {/* Submenu tabs & TopBar */}
      <div className="flex items-center justify-between flex-wrap gap-4 border-b border-[#E9E3DA] pb-4 shrink-0">
        <div className="flex items-center gap-1.5 bg-[#FCFBF8] border border-[#E9E3DA] rounded-xl p-1 overflow-x-auto scrollbar-none">
          {subMenuItems.map((item) => {
            const isActive = view === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleSubMenuClick(item.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-[12.5px] font-bold transition-all whitespace-nowrap cursor-pointer ${
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

        <div className="flex items-center gap-3">
          <TopBar />
        </div>
      </div>

      {/* Main active view */}
      <div className="flex-1 overflow-y-auto">
        <AnimatePresence mode="wait">
          <motion.div
            key={view}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
          >
            {renderActiveView()}
          </motion.div>
        </AnimatePresence>
      </div>
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
