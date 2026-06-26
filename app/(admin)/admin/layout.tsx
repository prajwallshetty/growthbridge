"use client";

import React, { useTransition } from "react";
import { useRouter, usePathname } from "next/navigation";
import { logout } from "@/lib/actions/auth";
import {
  LayoutDashboard,
  Home,
  FileText,
  BookOpen,
  Briefcase,
  Layers,
  MessageSquare,
  Image as ImageIcon,
  Settings,
  LogOut,
  Users,
  Shield,
} from "lucide-react";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [isPending, startTransition] = useTransition();

  const handleLogout = () => {
    startTransition(async () => {
      await logout();
      router.push("/admin/login");
    });
  };

  // Don't render sidebar on the login page itself
  if (pathname === "/admin/login") {
    return <>{children}</>;
  }

  const menuItems = [
    { name: "Dashboard", href: "/admin", icon: LayoutDashboard },
    { name: "Blogs", href: "/admin/blogs", icon: BookOpen },
    { name: "Portfolio", href: "/admin/portfolio", icon: Briefcase },
    { name: "Services", href: "/admin/services", icon: Layers },
    { name: "Testimonials", href: "/admin/testimonials", icon: MessageSquare },
    { name: "Team Management", href: "/admin/team", icon: Users },
    { name: "Users & Admins", href: "/admin/users", icon: Shield },
    { name: "Media Library", href: "/admin/media", icon: ImageIcon },
    { name: "Site Settings", href: "/admin/settings", icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-[#FCFBF8] text-[#111111] flex flex-col md:flex-row relative">
      {/* Sidebar Panel */}
      <aside className="w-full md:w-[260px] md:min-h-screen border-r border-[#E9E3DA] bg-white flex flex-col shrink-0">
        {/* Header/Logo */}
        <div className="p-6 border-b border-[#E9E3DA] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-[16px] font-bold tracking-tight">Growth Bridge CMS</span>
          </div>
        </div>

        {/* Navigation list */}
        <nav className="flex-1 p-4 flex flex-col gap-1 overflow-y-auto">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <a
                key={item.name}
                href={item.href}
                className={`flex items-center gap-3 px-4 py-3 rounded-[12px] text-[14px] font-semibold transition-all ${
                  isActive
                    ? "bg-[#111111] text-white shadow-sm"
                    : "text-[#6A6A6A] hover:bg-[#111111]/5 hover:text-[#111111]"
                }`}
              >
                <Icon size={16} />
                {item.name}
              </a>
            );
          })}
        </nav>

        {/* Footer logout */}
        <div className="p-4 border-t border-[#E9E3DA]">
          <button
            onClick={handleLogout}
            disabled={isPending}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-[12px] text-[14px] font-semibold text-red-600 hover:bg-red-50 transition-all cursor-pointer disabled:opacity-60"
          >
            <LogOut size={16} />
            {isPending ? "Logging out..." : "Log out"}
          </button>
        </div>
      </aside>

      {/* Main content page area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header strip */}
        <header className="h-16 border-b border-[#E9E3DA] bg-white px-8 flex items-center justify-between shrink-0">
          <div className="text-[14px] font-semibold text-[#6A6A6A]">
            Current Workspace: <span className="text-[#111111] font-bold">Growth Bridge Studio</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-[12px] font-semibold uppercase tracking-[0.08em] text-[#6A6A6A]">
              Live Server
            </span>
          </div>
        </header>

        {/* Content body */}
        <main className="flex-1 p-8 md:p-12 overflow-y-auto max-w-[1200px]">
          {children}
        </main>
      </div>
    </div>
  );
}
