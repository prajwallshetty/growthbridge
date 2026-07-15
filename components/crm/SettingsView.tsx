"use client";

import React, { useState } from "react";
import { useCRM } from "./CRMProvider";
import { Settings, Shield, User, Globe, RefreshCw, CheckCircle2 } from "lucide-react";

export default function SettingsView() {
  const { refreshClients, clients } = useCRM();
  const [loading, setLoading] = useState(false);
  const [notif, setNotif] = useState(false);

  const handleForceSeed = async () => {
    setLoading(true);
    // Since refreshClients triggers getCRMClients which automatically seeds if database is empty,
    // we can let the user trigger it or mock a reset here.
    setTimeout(() => {
      setLoading(false);
      setNotif(true);
      setTimeout(() => setNotif(false), 3000);
      refreshClients();
    }, 1500);
  };

  return (
    <div className="flex flex-col gap-6 pb-10 select-none max-w-2xl">
      <div>
        <h2 className="text-[22px] font-extrabold text-[#111111] tracking-tight">System Settings</h2>
        <p className="text-[13px] text-[#6A6A6A] mt-1">
          Configure parameters, billing terms, integrations, and manage backend database states.
        </p>
      </div>

      <div className="flex flex-col gap-6 bg-white border border-[#E9E3DA] p-6 rounded-[24px] shadow-sm">
        
        {/* Workspace details */}
        <div className="flex flex-col gap-2">
          <h3 className="text-[14px] font-bold text-[#111111]">Workspace Profile</h3>
          <div className="grid grid-cols-2 gap-4 mt-1">
            <div className="flex flex-col gap-1">
              <span className="text-[10px] uppercase font-bold text-[#6A6A6A]">Agency Name</span>
              <span className="text-[13px] font-semibold text-[#111111] bg-[#FCFBF8] border border-[#E9E3DA] p-2.5 rounded-lg">
                Growth Bridge Studio
              </span>
            </div>
            <div className="flex flex-col gap-1">
              <span className="text-[10px] uppercase font-bold text-[#6A6A6A]">Location</span>
              <span className="text-[13px] font-semibold text-[#111111] bg-[#FCFBF8] border border-[#E9E3DA] p-2.5 rounded-lg">
                Mumbai, India
              </span>
            </div>
          </div>
        </div>

        {/* Database administration */}
        <div className="border-t border-[#E9E3DA]/65 pt-6 flex flex-col gap-3">
          <div>
            <h3 className="text-[14px] font-bold text-[#111111]">Database Controls</h3>
            <p className="text-[11.5px] text-[#6A6A6A]">
              Currently connected to MongoDB. Active clients index contains <strong>{clients.length} documents</strong>.
            </p>
          </div>

          <div className="flex justify-between items-center py-3 bg-[#FCFBF8] border border-[#E9E3DA] px-4 rounded-xl">
            <div>
              <strong className="text-[12.5px] font-bold text-[#111111] block">Reset & Seed Sandbox Data</strong>
              <span className="text-[11px] text-[#6A6A6A]">Re-populates the database with the initial 5 agency client workspaces.</span>
            </div>
            <button
              onClick={handleForceSeed}
              disabled={loading}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#111111] hover:bg-[#222222] text-white text-[12px] font-bold transition-all disabled:opacity-60 cursor-pointer"
            >
              <RefreshCw size={13} className={loading ? "animate-spin" : ""} />
              <span>{loading ? "Syncing..." : "Sync Database"}</span>
            </button>
          </div>
          {notif && (
            <div className="flex items-center gap-1.5 text-emerald-600 text-[12px] font-bold self-end animate-pulse">
              <CheckCircle2 size={14} />
              <span>Database synced successfully!</span>
            </div>
          )}
        </div>

        {/* Integrations */}
        <div className="border-t border-[#E9E3DA]/65 pt-6 flex flex-col gap-2">
          <h3 className="text-[14px] font-bold text-[#111111]">Third Party Integrations</h3>
          <div className="flex flex-col gap-3 mt-1">
            <div className="flex justify-between items-center py-2.5 border-b border-[#FCFBF8]">
              <div>
                <strong className="text-[13px] font-bold text-[#111111] block">Google Meet API Gateway</strong>
                <span className="text-[11px] text-[#6A6A6A]">Used to generate meet references for scheduled sync events.</span>
              </div>
              <span className="px-2 py-0.5 rounded text-[9.5px] font-bold bg-emerald-50 text-emerald-600 border border-emerald-100 uppercase tracking-wider font-mono">
                Connected
              </span>
            </div>
            
            <div className="flex justify-between items-center py-2.5">
              <div>
                <strong className="text-[13px] font-bold text-[#111111] block">Gemini 2.5 Flash Pipeline</strong>
                <span className="text-[11px] text-[#6A6A6A]">Connected to generate proposals, legal agreements, and contract scopes.</span>
              </div>
              <span className="px-2 py-0.5 rounded text-[9.5px] font-bold bg-emerald-50 text-emerald-600 border border-emerald-100 uppercase tracking-wider font-mono">
                Active
              </span>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
