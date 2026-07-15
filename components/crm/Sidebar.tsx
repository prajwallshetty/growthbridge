"use client";

import React, { useState } from "react";
import { useCRM, CRMView } from "./CRMProvider";
import { usePathname, useRouter } from "next/navigation";
import Image from "next/image";
import {
  LayoutDashboard,
  Users,
  KanbanSquare,
  Briefcase,
  CheckSquare,
  Calendar,
  FileSpreadsheet,
  FileText,
  FileCheck,
  BarChart3,
  Settings,
  BookOpen,
  Image as ImageIcon,
  Shield,
  Layers,
  ChevronDown,
} from "lucide-react";

interface SidebarItemProps {
  viewId?: CRMView;
  label: string;
  icon: React.ReactNode;
  badge?: number;
  href?: string;
  color?: string;
}

export default function Sidebar() {
  const { view, setView, clients, setActiveClientId } = useCRM();
  const router = useRouter();
  const pathname = usePathname();

  const [osExpanded, setOsExpanded] = useState(true);
  const [cmsExpanded, setCmsExpanded] = useState(true);

  const handleItemClick = (item: SidebarItemProps) => {
    setActiveClientId(null);
    if (item.href) {
      router.push(item.href);
    } else if (item.viewId) {
      setView(item.viewId);
      if (pathname !== "/admin") {
        router.push(`/admin?view=${item.viewId}`);
      }
    }
  };

  const getBadgeValue = (viewId: CRMView) => {
    if (!clients) return undefined;
    if (viewId === "kanban") {
      return clients.filter((c) =>
        ["Lead Created", "Discovery Call", "Meeting Scheduled", "Requirements Received"].includes(c.stage)
      ).length;
    }
    if (viewId === "tasks") {
      return clients.flatMap((c) => c.tasks || []).filter((t) => t.status !== "Completed").length;
    }
    if (viewId === "invoices") {
      return clients.flatMap((c) => c.invoices || []).filter((i) => i.status === "Pending").length;
    }
    return undefined;
  };

  const agencyOSItems: SidebarItemProps[] = [
    { viewId: "dashboard", label: "Dashboard", icon: <LayoutDashboard size={18} strokeWidth={1.8} />, color: "#6366F1" },
    { viewId: "clients", label: "CRM Directory", icon: <Users size={18} strokeWidth={1.8} />, color: "#8B5CF6" },
    { viewId: "kanban", label: "Kanban Board", icon: <KanbanSquare size={18} strokeWidth={1.8} />, color: "#F59E0B", badge: getBadgeValue("kanban") },
    { viewId: "projects", label: "Projects", icon: <Briefcase size={18} strokeWidth={1.8} />, color: "#EC4899" },
    { viewId: "tasks", label: "Tasks Checklist", icon: <CheckSquare size={18} strokeWidth={1.8} />, color: "#10B981", badge: getBadgeValue("tasks") },
    { viewId: "calendar", label: "Calendar", icon: <Calendar size={18} strokeWidth={1.8} />, color: "#3B82F6" },
    { viewId: "invoices", label: "Invoices", icon: <FileSpreadsheet size={18} strokeWidth={1.8} />, color: "#F97316", badge: getBadgeValue("invoices") },
    { viewId: "proposals", label: "Proposals", icon: <FileText size={18} strokeWidth={1.8} />, color: "#14B8A6" },
    { viewId: "agreements", label: "Agreements", icon: <FileCheck size={18} strokeWidth={1.8} />, color: "#A855F7" },
    { viewId: "analytics", label: "Analytics", icon: <BarChart3 size={18} strokeWidth={1.8} />, color: "#EF4444" },
    { viewId: "settings", label: "CRM Settings", icon: <Settings size={18} strokeWidth={1.8} />, color: "#6B7280" },
  ];

  const websiteCMSItems: SidebarItemProps[] = [
    { label: "Blogs", icon: <BookOpen size={18} strokeWidth={1.8} />, href: "/admin/blogs", color: "#F59E0B" },
    { label: "Portfolio / Work", icon: <Briefcase size={18} strokeWidth={1.8} />, href: "/admin/portfolio", color: "#EC4899" },
    { label: "Services Directory", icon: <Layers size={18} strokeWidth={1.8} />, href: "/admin/services", color: "#8B5CF6" },
    { label: "Testimonials Editor", icon: <FileText size={18} strokeWidth={1.8} />, href: "/admin/testimonials", color: "#14B8A6" },
    { label: "Team Management", icon: <Users size={18} strokeWidth={1.8} />, href: "/admin/team", color: "#3B82F6" },
    { label: "Users & Admins", icon: <Shield size={18} strokeWidth={1.8} />, href: "/admin/users", color: "#EF4444" },
    { label: "Media Library", icon: <ImageIcon size={18} strokeWidth={1.8} />, href: "/admin/media", color: "#10B981" },
    { label: "Site Settings", icon: <Settings size={18} strokeWidth={1.8} />, href: "/admin/settings", color: "#6B7280" },
  ];

  const renderItem = (item: SidebarItemProps, isActive: boolean) => (
    <button
      key={item.label}
      onClick={() => handleItemClick(item)}
      className="w-full text-left cursor-pointer transition-all duration-150 animate-fade-in"
    >
      <div
        className={`flex items-center justify-between px-4 py-3 rounded-xl mx-2.5 transition-all duration-150 ${
          isActive
            ? "bg-[#EEF2FF] text-[#111827] shadow-sm"
            : "text-[#374151] hover:bg-[#F3F4F6]"
        }`}
      >
        <div className="flex items-center gap-3">
          {/* Colored icon container */}
          <div
            className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 transition-all duration-150`}
            style={{
              backgroundColor: isActive ? `${item.color}18` : `${item.color}10`,
              color: item.color,
            }}
          >
            {item.icon}
          </div>
          <span className={`text-[14px] font-semibold tracking-tight ${isActive ? "text-[#111827]" : "text-[#374151]"}`}>
            {item.label}
          </span>
        </div>
        {item.badge !== undefined && item.badge > 0 && (
          <span
            className="min-w-[20px] h-5 px-1.5 rounded-full text-[11px] font-semibold flex items-center justify-center"
            style={{
              backgroundColor: isActive ? item.color : `${item.color}15`,
              color: isActive ? "#fff" : item.color,
            }}
          >
            {item.badge}
          </span>
        )}
      </div>
    </button>
  );

  return (
    <aside className="w-[260px] bg-[#FAFAFA] border-r border-[#E5E7EB] flex flex-col h-screen select-none relative shrink-0 font-sans">
      {/* Slim scrollbar override */}
      <style>{`
        .sb-scroll::-webkit-scrollbar { width: 4px; }
        .sb-scroll::-webkit-scrollbar-track { background: transparent; }
        .sb-scroll::-webkit-scrollbar-thumb { background: rgba(0,0,0,0.08); border-radius: 99px; }
        .sb-scroll::-webkit-scrollbar-thumb:hover { background: rgba(0,0,0,0.15); }
      `}</style>

      {/* Header — Logo + Company Name */}
      <div className="px-5 py-4 border-b border-[#E5E7EB] flex items-center gap-3 bg-white/60">
        <Image
          src="/logo.png"
          alt="Growth Bridge"
          width={32}
          height={32}
          className="rounded-lg object-contain shrink-0"
        />
        <div className="flex items-center gap-1.5 min-w-0">
          <span className="text-[15px] font-bold text-[#111827] tracking-tight truncate">Growth Bridge</span>
          <ChevronDown size={14} className="text-[#9CA3AF] shrink-0" />
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-4 flex flex-col gap-6 sb-scroll">
        {/* Section: Agency Operating System */}
        <div className="flex flex-col gap-0.5">
          <button
            onClick={() => setOsExpanded(!osExpanded)}
            className="flex items-center gap-1 px-5 pb-1 text-[11px] font-semibold uppercase tracking-[0.06em] text-[#9CA3AF] hover:text-[#6B7280] transition-colors cursor-pointer text-left"
          >
            <ChevronDown size={12} className={`transition-transform duration-200 ${osExpanded ? "" : "-rotate-90"}`} />
            <span>Workspace</span>
          </button>
          {osExpanded && agencyOSItems.map((item) => {
            const isActive = pathname === "/admin" && view === item.viewId;
            return renderItem(item, isActive);
          })}
        </div>

        {/* Section: Website CMS */}
        <div className="flex flex-col gap-0.5">
          <button
            onClick={() => setCmsExpanded(!cmsExpanded)}
            className="flex items-center gap-1 px-5 pb-1 text-[11px] font-semibold uppercase tracking-[0.06em] text-[#9CA3AF] hover:text-[#6B7280] transition-colors cursor-pointer text-left"
          >
            <ChevronDown size={12} className={`transition-transform duration-200 ${cmsExpanded ? "" : "-rotate-90"}`} />
            <span>Website CMS</span>
          </button>
          {cmsExpanded && websiteCMSItems.map((item) => {
            const isActive = pathname === item.href;
            return renderItem(item, isActive);
          })}
        </div>
      </nav>

      {/* Footer — User Profile */}
      <div className="px-4 py-3.5 border-t border-[#E5E7EB] bg-white/60 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#6366F1] to-[#8B5CF6] flex items-center justify-center font-bold text-[11px] text-white shrink-0 shadow-sm">
            PS
          </div>
          <div className="min-w-0">
            <div className="text-[13px] font-semibold text-[#111827] leading-tight truncate">Prajwal Shetty</div>
            <span className="text-[11px] text-[#9CA3AF] block">Super Admin</span>
          </div>
        </div>
        <div className="w-2 h-2 rounded-full bg-[#10B981] animate-pulse shrink-0 shadow-[0_0_6px_rgba(16,185,129,0.4)]" title="Online" />
      </div>
    </aside>
  );
}
