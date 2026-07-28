import React from "react";
import { getSessionUser } from "@/lib/actions/cms";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Inter } from "next/font/google";
import "../../globals.css";
import {
  LayoutDashboard,
  Users,
  Layers,
  CheckSquare,
  Award,
  FileText,
  ArrowLeft,
  Briefcase,
} from "lucide-react";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
});

export const metadata = {
  title: "GrowthBridge Internship OS",
  description: "GrowthBridge Internship Management Workspace",
};

export default async function InternshipAdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Enforce session check using the existing admin authentication helpers
  const adminUser = await getSessionUser();
  
  if (!adminUser) {
    redirect("/admin/login");
  }

  const menuItems = [
    { label: "Dashboard", href: "/admin/internships", icon: <LayoutDashboard size={17} /> },
    { label: "Applications", href: "/admin/internships/applications", icon: <Users size={17} /> },
    { label: "Domains CRUD", href: "/admin/internships/domains", icon: <Layers size={17} /> },
    { label: "Task Management", href: "/admin/internships/tasks", icon: <CheckSquare size={17} /> },
    { label: "Certificates", href: "/admin/internships/certificates", icon: <Award size={17} /> },
    { label: "Offer Letters", href: "/admin/internships/offer-letters", icon: <FileText size={17} /> },
  ];

  return (
    <html lang="en" className={inter.variable}>
      <body className={`${inter.className} antialiased min-h-screen bg-[#FCFBF8] text-[#111111] flex flex-col md:flex-row relative selection:bg-[#F4C542] selection:text-[#111111]`}>
        
        {/* Isolated Sidebar */}
        <aside className="w-full md:w-[260px] bg-white border-r border-[#E9E3DA] flex flex-col shrink-0 font-sans md:h-screen sticky top-0">
          
          {/* Header Branding */}
          <div className="px-6 py-5 border-b border-[#E9E3DA] flex items-center justify-between">
            <div className="flex flex-col">
              <span className="font-extrabold text-[14px] tracking-tight">GROWTH BRIDGE</span>
              <span className="font-mono text-[9px] font-bold text-[#F4C542] tracking-wider uppercase">Internship OS</span>
            </div>
          </div>

          {/* Navigation links */}
          <nav className="flex-1 px-4 py-6 flex flex-col gap-1.5 overflow-y-auto">
            {menuItems.map((item) => (
              <Link
                key={item.label}
                href={item.href}
                className="flex items-center gap-3.5 px-4 py-3 rounded-xl text-[13px] font-semibold text-[#6A6A6A] hover:bg-[#FCFBF8] hover:text-[#111111] transition-all duration-150"
              >
                <div className="text-[#A8A296]">{item.icon}</div>
                <span>{item.label}</span>
              </Link>
            ))}

            <div className="w-full h-px bg-[#E9E3DA] my-4" />

            {/* CRM back link */}
            <Link
              href="/admin"
              className="flex items-center gap-3.5 px-4 py-3 rounded-xl text-[13px] font-semibold text-indigo-600 hover:bg-[#EEF2FF] transition-all duration-150"
            >
              <ArrowLeft size={16} />
              <span>Return to CRM Panel</span>
            </Link>
          </nav>

          {/* User profile footer */}
          <div className="px-5 py-4 border-t border-[#E9E3DA] bg-[#FCFBF8]/60 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#111111] to-[#333333] flex items-center justify-center font-bold text-[11px] text-white shrink-0">
                AD
              </div>
              <div className="min-w-0">
                <div className="text-[12.5px] font-bold text-[#111827] leading-tight truncate">
                  {adminUser.name}
                </div>
                <span className="text-[10px] text-[#A8A296] block truncate">
                  {adminUser.role}
                </span>
              </div>
            </div>
          </div>
        </aside>

        {/* Main content framework */}
        <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
          
          {/* Global header strip */}
          <header className="h-16 border-b border-[#E9E3DA] bg-white px-8 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-2">
              <Briefcase size={16} className="text-[#A8A296]" />
              <span className="text-[12.5px] font-bold text-[#111111]">Internships Management System</span>
            </div>
            
            <div className="flex items-center gap-3">
              <span className="text-[11.5px] font-semibold text-[#6A6A6A]">Authenticated:</span>
              <span className="px-2 py-0.5 rounded bg-emerald-50 text-emerald-600 border border-emerald-200 text-[10.5px] font-bold tracking-tight">
                {adminUser.email}
              </span>
            </div>
          </header>

          {/* Body content wrapper */}
          <main className="flex-1 overflow-y-auto px-6 py-6 md:px-10 md:py-8 max-w-7xl w-full mx-auto select-none">
            {children}
          </main>
        </div>

      </body>
    </html>
  );
}
