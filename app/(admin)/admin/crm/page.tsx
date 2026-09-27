"use client";

import React from "react";
import { CRMProvider, useCRM } from "@/components/crm/CRMProvider";
import TopBar from "@/components/crm/TopBar";
import DashboardView from "@/components/crm/DashboardView";
import ProjectsView from "@/components/crm/ProjectsView";
import ExpensesView from "@/components/crm/ExpensesView";
import RevenueView from "@/components/crm/RevenueView";
import SettingsView from "@/components/crm/SettingsView";
import ClientTreeView from "@/components/crm/ClientTreeView";
import LeadsView from "@/components/crm/LeadsView";
import FreelancersView from "@/components/crm/FreelancersView";
import ReferenceManagerView from "@/components/crm/ReferenceManagerView";
import CRMProjectsView from "@/components/crm/CRMProjectsView";
import ActivitiesFollowupsView from "@/components/crm/ActivitiesFollowupsView";
import PaymentsView from "@/components/crm/PaymentsView";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard,
  Briefcase,
  GitFork,
  Receipt,
  IndianRupee,
  Settings as SettingsIcon,
  UserPlus,
  Users,
  FolderKanban,
  HardHat,
  Share2,
  ListChecks,
  Wallet,
} from "lucide-react";

function CRMWorkspaceContent() {
  const { view, setView, setActiveClientId } = useCRM();

  const subMenuItems = [
    { id: "dashboard", label: "Dashboard", icon: <LayoutDashboard size={14} /> },
    { id: "leads", label: "Leads", icon: <UserPlus size={14} /> },
    { id: "projects", label: "Customers", icon: <Users size={14} /> },
    { id: "crm-projects", label: "Projects", icon: <FolderKanban size={14} /> },
    { id: "freelancers", label: "Freelancers", icon: <HardHat size={14} /> },
    { id: "references", label: "Reference Manager", icon: <Share2 size={14} /> },
    { id: "activities", label: "Activities / Follow-ups", icon: <ListChecks size={14} /> },
    { id: "payments", label: "Payments", icon: <Wallet size={14} /> },
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
      case "leads":
        return <LeadsView />;
      case "projects":
        return <ProjectsView />;
      case "crm-projects":
        return <CRMProjectsView />;
      case "freelancers":
        return <FreelancersView />;
      case "references":
        return <ReferenceManagerView />;
      case "activities":
        return <ActivitiesFollowupsView />;
      case "payments":
        return <PaymentsView />;
      case "client-tree":
        return <ClientTreeView />;
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
