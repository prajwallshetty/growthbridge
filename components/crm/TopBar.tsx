"use client";

import React, { useState } from "react";
import { useCRM } from "./CRMProvider";
import { Plus, ChevronRight } from "lucide-react";

export default function TopBar() {
  const {
    clients,
    activeClientId,
    setActiveClientId,
    addClient,
  } = useCRM();

  const [showAddClientModal, setShowAddClientModal] = useState(false);
  const [newClientName, setNewClientName] = useState("");
  const [newClientCompany, setNewClientCompany] = useState("");
  const [newClientBudget, setNewClientBudget] = useState("");
  const [newReferredBy, setNewReferredBy] = useState("");
  const [newReferralCommissionPct, setNewReferralCommissionPct] = useState("5");

  const activeClient = clients.find((c) => c._id === activeClientId || c.id === activeClientId);

  const handleCreateClient = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newClientName || !newClientCompany) return;
    const isReferred = Boolean(newReferredBy);
    addClient({
      name: newClientName,
      company: newClientCompany,
      budget: Number(newClientBudget) || 200000,
      referredBy: newReferredBy || null,
      referralCommissionPct: Number(newReferralCommissionPct) || 5,
      clientType: isReferred ? "Referred" : "Direct",
    });
    setNewClientName("");
    setNewClientCompany("");
    setNewClientBudget("");
    setNewReferredBy("");
    setNewReferralCommissionPct("5");
    setShowAddClientModal(false);
  };

  return (
    <div className="flex items-center gap-3 select-none">
      {/* Breadcrumbs for Active Client */}
      {activeClient && (
        <div className="flex items-center gap-1 text-[12.5px] font-medium mr-2">
          <button
            onClick={() => setActiveClientId(null)}
            className="text-[#6A6A6A] hover:text-[#111111] transition-colors"
          >
            All
          </button>
          <ChevronRight size={11} className="text-[#A8A296]" />
          <span className="text-[#111111] font-bold">{activeClient.company}</span>
        </div>
      )}

      {/* Quick Action button */}
      <button
        onClick={() => setShowAddClientModal(true)}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#111111] hover:bg-[#222222] text-white text-[12px] font-bold transition-all shadow-sm cursor-pointer"
      >
        <Plus size={13} strokeWidth={2.5} />
        <span>Add Client Project</span>
      </button>

      {/* Add Client Dialog Overlay Modal */}
      {showAddClientModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-[#E9E3DA] w-full max-w-md rounded-2xl p-6 shadow-2xl relative">
            <h3 className="text-[16px] font-bold text-[#111111] mb-4">Create New Client Project</h3>
            <form onSubmit={handleCreateClient} className="flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-[11px] font-bold text-[#6A6A6A] uppercase">Client / Contact Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. John Doe"
                  value={newClientName}
                  onChange={(e) => setNewClientName(e.target.value)}
                  className="px-3.5 py-2 rounded-lg bg-[#FCFBF8] border border-[#E9E3DA] text-[13px] text-[#111111] placeholder-[#6A6A6A]/40 focus:outline-none focus:border-[#111111]"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[11px] font-bold text-[#6A6A6A] uppercase">Company Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Acme Corp"
                  value={newClientCompany}
                  onChange={(e) => setNewClientCompany(e.target.value)}
                  className="px-3.5 py-2 rounded-lg bg-[#FCFBF8] border border-[#E9E3DA] text-[13px] text-[#111111] placeholder-[#6A6A6A]/40 focus:outline-none focus:border-[#111111]"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[11px] font-bold text-[#6A6A6A] uppercase">Project Budget (INR)</label>
                <input
                  type="number"
                  placeholder="e.g. 500000"
                  value={newClientBudget}
                  onChange={(e) => setNewClientBudget(e.target.value)}
                  className="px-3.5 py-2 rounded-lg bg-[#FCFBF8] border border-[#E9E3DA] text-[13px] text-[#111111] placeholder-[#6A6A6A]/40 focus:outline-none focus:border-[#111111]"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[11px] font-bold text-[#6A6A6A] uppercase">Referred By (Optional Referrer)</label>
                <select
                  value={newReferredBy}
                  onChange={(e) => setNewReferredBy(e.target.value)}
                  className="px-3.5 py-2 rounded-lg bg-[#FCFBF8] border border-[#E9E3DA] text-[13px] text-[#111111] focus:outline-none focus:border-[#111111]"
                >
                  <option value="">(None - Direct Client)</option>
                  {clients.map((c) => (
                    <option key={c._id} value={c._id}>
                      {c.company} ({c.name})
                    </option>
                  ))}
                </select>
              </div>

              {newReferredBy && (
                <div className="flex flex-col gap-1.5">
                  <label className="text-[11px] font-bold text-[#6A6A6A] uppercase">Referral Commission Rate (%)</label>
                  <input
                    type="number"
                    min="0"
                    max="50"
                    value={newReferralCommissionPct}
                    onChange={(e) => setNewReferralCommissionPct(e.target.value)}
                    className="px-3.5 py-2 rounded-lg bg-[#FCFBF8] border border-[#E9E3DA] text-[13px] text-[#111111] focus:outline-none focus:border-[#111111]"
                  />
                </div>
              )}

              <div className="flex items-center justify-end gap-3 mt-4 pt-4 border-t border-[#E9E3DA]">
                <button
                  type="button"
                  onClick={() => setShowAddClientModal(false)}
                  className="px-4 py-2 text-[13px] font-bold text-[#6A6A6A] hover:text-[#111111] transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-[#111111] hover:bg-[#222222] text-white text-[13px] font-bold transition-all"
                >
                  Create Project
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

