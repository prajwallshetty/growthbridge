"use client";

import React, { Suspense } from "react";
import { usePathname } from "next/navigation";
import { CRMProvider } from "@/components/crm/CRMProvider";
import Sidebar from "@/components/crm/Sidebar";
import AIAssistantWidget from "@/components/crm/AIAssistantWidget";
import AddClientModal from "@/components/crm/AddClientModal";
import { Sun, Bell } from "lucide-react";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  // Exclude auth screen from dashboard layout shell
  if (pathname === "/admin/login") {
    return <>{children}</>;
  }

  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#FCFBF8] flex items-center justify-center font-mono text-[13px] text-[#6A6A6A]">
        Initializing Growth Bridge OS...
      </div>
    }>
      <CRMProvider>
        <div className="min-h-screen bg-[#FCFBF8] text-[#111111] flex flex-col md:flex-row relative overflow-hidden">
          {/* Redesigned Sidebar */}
          <Sidebar />

          {/* Core Content Framework */}
          <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
            
            {/* Global Header Strip */}
            <header className="h-16 border-b border-[#E9E3DA] bg-white px-8 flex items-center justify-between shrink-0">
              {/* Workspace name label */}
              <div className="flex items-center gap-1.5 text-[13px] font-bold text-[#111111]">
                <span>Growth Bridge OS Workspace</span>
              </div>

              {/* Global actions */}
              <div className="flex items-center gap-4">
                
                {/* Theme switcher */}
                <button className="p-2 rounded-lg text-[#6A6A6A] hover:text-[#111111] transition-colors hover:bg-[#FCFBF8]">
                  <Sun size={15} />
                </button>
                
                {/* Notifications */}
                <button className="p-2 rounded-lg text-[#6A6A6A] hover:text-[#111111] relative transition-colors hover:bg-[#FCFBF8]">
                  <Bell size={15} />
                  <span className="absolute top-1 right-1 w-1.5 h-1.5 bg-red-500 rounded-full" />
                </button>

                <div className="w-px h-6 bg-[#E9E3DA]" />

                {/* User profile */}
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-full bg-[#111111] text-white flex items-center justify-center font-bold text-[11px]">
                    PS
                  </div>
                  <span className="text-[12.5px] font-bold text-[#111111] hidden md:inline-block">Prajwal Shetty</span>
                </div>

              </div>
            </header>

            {/* Main Content Area Container */}
            <main className="flex-1 overflow-y-auto px-8 py-8 md:px-12 md:py-10 max-w-7xl w-full mx-auto select-none">
              {children}
            </main>

          </div>
        </div>

        {/* Global Slide-out AI Panel Drawer */}
        <AIAssistantWidget />
        <AddClientModal />
      </CRMProvider>
    </Suspense>
  );
}
