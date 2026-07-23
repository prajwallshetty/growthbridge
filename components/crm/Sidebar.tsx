"use client";

import React, { useState } from "react";
import { useCRM, CRMView } from "./CRMProvider";
import { usePathname, useRouter } from "next/navigation";
import Image from "next/image";
import { logout } from "@/lib/actions/auth";
import {
  LayoutDashboard,
  Briefcase,
  Receipt,
  IndianRupee,
  Settings,
  BookOpen,
  Image as ImageIcon,
  Layers,
  LogOut,
  ChevronDown,
  AlertTriangle,
  GitFork,
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
  const { view, setView, settings, setActiveClientId } = useCRM();
  const router = useRouter();
  const pathname = usePathname();

  const [osExpanded, setOsExpanded] = useState(true);
  const [cmsExpanded, setCmsExpanded] = useState(true);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

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

  const handleLogoutConfirm = async () => {
    try {
      setIsLoggingOut(true);
      await logout();
      router.push("/admin/login");
    } catch (error) {
      console.error("Logout failed:", error);
    } finally {
      setIsLoggingOut(false);
      setShowLogoutModal(false);
    }
  };

  const agencyOSItems: SidebarItemProps[] = [
    { viewId: "dashboard", label: "Dashboard", icon: <LayoutDashboard size={18} strokeWidth={1.8} />, color: "#6366F1" },
    { viewId: "projects", label: "Projects", icon: <Briefcase size={18} strokeWidth={1.8} />, color: "#EC4899" },
    { viewId: "client-tree", label: "Client Tree", icon: <GitFork size={18} strokeWidth={1.8} />, color: "#8B5CF6" },
    { viewId: "expenses", label: "Expenses", icon: <Receipt size={18} strokeWidth={1.8} />, color: "#EF4444" },
    { viewId: "revenue", label: "Revenue", icon: <IndianRupee size={18} strokeWidth={1.8} />, color: "#10B981" },
    { viewId: "settings", label: "Settings", icon: <Settings size={18} strokeWidth={1.8} />, color: "#6B7280" },
  ];

  const websiteCMSItems: SidebarItemProps[] = [
    { label: "Blogs", icon: <BookOpen size={18} strokeWidth={1.8} />, href: "/admin/blogs", color: "#F59E0B" },
    { label: "Portfolio / Work", icon: <Briefcase size={18} strokeWidth={1.8} />, href: "/admin/portfolio", color: "#EC4899" },
    { label: "Services Directory", icon: <Layers size={18} strokeWidth={1.8} />, href: "/admin/services", color: "#8B5CF6" },
    { label: "Media Library", icon: <ImageIcon size={18} strokeWidth={1.8} />, href: "/admin/media", color: "#10B981" },
    { label: "Site Settings", icon: <Settings size={18} strokeWidth={1.8} />, href: "/admin/settings", color: "#6B7280" },
  ];

  const renderItem = (item: SidebarItemProps, isActive: boolean) => (
    <button
      key={item.label}
      onClick={() => handleItemClick(item)}
      className="w-full text-left cursor-pointer transition-all duration-150"
    >
      <div
        className={`flex items-center justify-between px-4 py-3 rounded-xl mx-2.5 transition-all duration-150 ${
          isActive
            ? "bg-[#EEF2FF] text-[#111827] shadow-sm font-bold"
            : "text-[#374151] hover:bg-[#F3F4F6]"
        }`}
      >
        <div className="flex items-center gap-3">
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 transition-all duration-150"
            style={{
              backgroundColor: isActive ? `${item.color}18` : `${item.color}10`,
              color: item.color,
            }}
          >
            {item.icon}
          </div>
          <span className={`text-[14px] tracking-tight ${isActive ? "text-[#111827] font-bold" : "text-[#374151] font-semibold"}`}>
            {item.label}
          </span>
        </div>
      </div>
    </button>
  );

  return (
    <>
      <aside className="w-[260px] bg-[#FAFAFA] border-r border-[#E5E7EB] flex flex-col h-screen select-none relative shrink-0 font-sans">
        <style>{`
          .sb-scroll::-webkit-scrollbar { width: 4px; }
          .sb-scroll::-webkit-scrollbar-track { background: transparent; }
          .sb-scroll::-webkit-scrollbar-thumb { background: rgba(0,0,0,0.08); border-radius: 99px; }
          .sb-scroll::-webkit-scrollbar-thumb:hover { background: rgba(0,0,0,0.15); }
        `}</style>

        {/* Header — Logo + Company Name */}
        <div className="px-5 py-4 border-b border-[#E5E7EB] flex items-center gap-3 bg-white/60">
          <Image
            src={settings.logoUrl || "/logo.png"}
            alt={settings.businessName || "Growth Bridge"}
            width={32}
            height={32}
            className="rounded-lg object-contain shrink-0"
          />
          <div className="flex items-center gap-1.5 min-w-0">
            <span className="text-[15px] font-bold text-[#111827] tracking-tight truncate">
              {settings.businessName || "Growth Bridge"}
            </span>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto py-4 flex flex-col gap-6 sb-scroll">
          {/* Section: Business Management */}
          <div className="flex flex-col gap-0.5">
            <button
              onClick={() => setOsExpanded(!osExpanded)}
              className="flex items-center gap-1 px-5 pb-1 text-[11px] font-semibold uppercase tracking-[0.06em] text-[#9CA3AF] hover:text-[#6B7280] transition-colors cursor-pointer text-left"
            >
              <ChevronDown size={12} className={`transition-transform duration-200 ${osExpanded ? "" : "-rotate-90"}`} />
              <span>CRM V2 System</span>
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

        {/* Footer — Profile + Logout */}
        <div className="px-4 py-3 border-t border-[#E5E7EB] bg-white/60 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#111111] to-[#333333] flex items-center justify-center font-bold text-[11px] text-white shrink-0 shadow-sm">
              AD
            </div>
            <div className="min-w-0">
              <div className="text-[13px] font-semibold text-[#111827] leading-tight truncate">Admin</div>
              <span className="text-[10.5px] text-[#9CA3AF] block">Administrator</span>
            </div>
          </div>
          
          <button
            onClick={() => setShowLogoutModal(true)}
            className="p-2 rounded-lg text-[#9CA3AF] hover:text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
            title="Logout of Admin Portal"
          >
            <LogOut size={16} />
          </button>
        </div>
      </aside>

      {/* Logout Confirmation Modal */}
      {showLogoutModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm animate-fade-in p-4">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-2xl border border-[#E9E3DA] flex flex-col gap-4">
            <div className="w-12 h-12 rounded-xl bg-red-50 text-red-500 flex items-center justify-center font-bold">
              <AlertTriangle size={24} />
            </div>
            <div>
              <h3 className="text-[16px] font-extrabold text-[#111111]">Confirm Logout</h3>
              <p className="text-[13px] text-[#6A6A6A] mt-1">
                Are you sure you want to end your current session and log out of Growth Bridge Admin?
              </p>
            </div>
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => setShowLogoutModal(false)}
                className="px-4 py-2 rounded-xl text-[13px] font-semibold text-[#6A6A6A] hover:bg-[#F3F4F6] transition-all cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleLogoutConfirm}
                disabled={isLoggingOut}
                className="px-4 py-2 rounded-xl text-[13px] font-bold bg-red-600 hover:bg-red-700 text-white transition-all shadow-sm cursor-pointer disabled:opacity-50"
              >
                {isLoggingOut ? "Logging out..." : "Logout"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

