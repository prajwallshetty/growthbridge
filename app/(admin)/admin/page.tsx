"use client";

import React from "react";
import { useCRM } from "@/components/crm/CRMProvider";
import DashboardView from "@/components/crm/DashboardView";
import ProjectsView from "@/components/crm/ProjectsView";
import ExpensesView from "@/components/crm/ExpensesView";
import RevenueView from "@/components/crm/RevenueView";
import SettingsView from "@/components/crm/SettingsView";
import { AnimatePresence, motion } from "framer-motion";
import { RefreshCw } from "lucide-react";

export default function AdminPageDispatcher() {
  const { view, loading } = useCRM();

  const renderActiveSubView = () => {
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
    <>
      {loading ? (
        <div className="h-[60vh] flex flex-col items-center justify-center text-[#6A6A6A] font-mono text-[12.5px] gap-2">
          <RefreshCw size={24} className="animate-spin text-[#111111]" />
          <span>Accessing CRM database nodes...</span>
        </div>
      ) : (
        <AnimatePresence mode="wait">
          <motion.div
            key={view}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
            className="h-full"
          >
            {renderActiveSubView()}
          </motion.div>
        </AnimatePresence>
      )}
    </>
  );
}
