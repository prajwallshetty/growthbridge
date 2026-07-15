"use client";

import React, { useState } from "react";
import { useCRM, CRMClient } from "./CRMProvider";
import { X, Loader2, Sparkles } from "lucide-react";

export default function AddClientModal() {
  const { isAddClientOpen, setIsAddClientOpen, addClient } = useCRM();
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form states
  const [company, setCompany] = useState("");
  const [name, setName] = useState("");
  const [industry, setIndustry] = useState("SaaS");
  const [budget, setBudget] = useState(150000);
  const [priority, setPriority] = useState<CRMClient["priority"]>("Medium");
  const [stage, setStage] = useState<CRMClient["stage"]>("Lead Created");
  const [assignee, setAssignee] = useState("Prajwal Shetty");
  const [startDate, setStartDate] = useState(new Date().toISOString().split("T")[0]);
  const [expectedDelivery, setExpectedDelivery] = useState("");

  if (!isAddClientOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!company || !name) return;

    try {
      setIsSubmitting(true);
      // Auto compute logo character
      const logoChar = company.charAt(0).toUpperCase();

      await addClient({
        company,
        name,
        industry,
        budget: Number(budget),
        priority,
        stage,
        assignee,
        progress: 0,
        logo: logoChar,
        countryFlag: "🇮🇳", // default flag
        startDate,
        expectedDelivery: expectedDelivery || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
        tasks: [],
        invoices: [],
        quotations: [],
        proposals: [],
        agreements: [],
        meetings: [],
        notes: [],
        messages: [],
        activity: [
          {
            _id: `act_${Date.now()}`,
            text: `CRM Account initialized for ${company}`,
            timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
            type: "progress"
          }
        ]
      });

      // Clear states
      setCompany("");
      setName("");
      setIndustry("SaaS");
      setBudget(150000);
      setPriority("Medium");
      setStage("Lead Created");
      setStartDate(new Date().toISOString().split("T")[0]);
      setExpectedDelivery("");
      
      setIsAddClientOpen(false);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-end select-none">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-[#111111]/30 backdrop-blur-sm transition-opacity" 
        onClick={() => setIsAddClientOpen(false)}
      />

      {/* Slide-over Container */}
      <div className="relative w-full max-w-md h-full bg-[#FCFBF8] border-l border-[#E9E3DA] shadow-2xl flex flex-col z-10 animate-slide-in">
        
        {/* Modal Header */}
        <div className="p-6 border-b border-[#E9E3DA] flex items-center justify-between bg-white">
          <div>
            <h3 className="text-[18px] font-extrabold text-[#111111] tracking-tight flex items-center gap-1.5">
              <Sparkles size={16} className="text-amber-500" />
              <span>Initialize Lead / Client</span>
            </h3>
            <p className="text-[12px] text-[#6A6A6A] mt-0.5">Initialize a brand new dynamic client workflow node.</p>
          </div>
          <button 
            onClick={() => setIsAddClientOpen(false)} 
            className="w-8 h-8 rounded-lg flex items-center justify-center border border-[#E9E3DA] hover:bg-[#FCFBF8] text-[#6A6A6A] hover:text-[#111111] transition-all cursor-pointer"
          >
            <X size={15} />
          </button>
        </div>

        {/* Modal Form Content */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 flex flex-col gap-5">
          
          <div className="flex flex-col gap-1.5">
            <label className="text-[11px] font-bold uppercase tracking-[0.08em] text-[#6A6A6A] font-mono">Company / Project Title</label>
            <input 
              type="text" 
              required
              placeholder="e.g. Acme Studio"
              value={company}
              onChange={e => setCompany(e.target.value)}
              className="w-full h-11 px-4 bg-white border border-[#E9E3DA] rounded-xl text-[13px] font-semibold outline-none focus:border-[#111111] transition-all"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-[11px] font-bold uppercase tracking-[0.08em] text-[#6A6A6A] font-mono">Primary Contact Name</label>
            <input 
              type="text" 
              required
              placeholder="e.g. Jane Doe"
              value={name}
              onChange={e => setName(e.target.value)}
              className="w-full h-11 px-4 bg-white border border-[#E9E3DA] rounded-xl text-[13px] font-semibold outline-none focus:border-[#111111] transition-all"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-[11px] font-bold uppercase tracking-[0.08em] text-[#6A6A6A] font-mono">Industry Vertical</label>
              <select
                value={industry}
                onChange={e => setIndustry(e.target.value)}
                className="w-full h-11 px-3 bg-white border border-[#E9E3DA] rounded-xl text-[13px] font-semibold outline-none focus:border-[#111111] transition-all cursor-pointer"
              >
                {["SaaS", "Fintech", "E-commerce", "Web3 / Crypto", "AI & ML", "Healthcare", "Creative Studio"].map(ind => (
                  <option key={ind} value={ind}>{ind}</option>
                ))}
              </select>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-[11px] font-bold uppercase tracking-[0.08em] text-[#6A6A6A] font-mono">Budget Estimate (INR)</label>
              <input 
                type="number" 
                required
                value={budget}
                onChange={e => setBudget(Number(e.target.value))}
                className="w-full h-11 px-4 bg-white border border-[#E9E3DA] rounded-xl text-[13px] font-semibold outline-none focus:border-[#111111] transition-all"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-[11px] font-bold uppercase tracking-[0.08em] text-[#6A6A6A] font-mono">Priority Node</label>
              <select
                value={priority}
                onChange={e => setPriority(e.target.value as any)}
                className="w-full h-11 px-3 bg-white border border-[#E9E3DA] rounded-xl text-[13px] font-semibold outline-none focus:border-[#111111] transition-all cursor-pointer"
              >
                <option value="High">🔴 High Priority</option>
                <option value="Medium">🟡 Medium Priority</option>
                <option value="Low">🟢 Low Priority</option>
              </select>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-[11px] font-bold uppercase tracking-[0.08em] text-[#6A6A6A] font-mono">Workflow Phase</label>
              <select
                value={stage}
                onChange={e => setStage(e.target.value as any)}
                className="w-full h-11 px-3 bg-white border border-[#E9E3DA] rounded-xl text-[13px] font-semibold outline-none focus:border-[#111111] transition-all cursor-pointer"
              >
                {["Lead Created", "Discovery Call", "Meeting Scheduled", "Requirements Received", "Design Phase", "Development"].map(st => (
                  <option key={st} value={st}>{st}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-[11px] font-bold uppercase tracking-[0.08em] text-[#6A6A6A] font-mono">Start Date</label>
              <input 
                type="date" 
                value={startDate}
                onChange={e => setStartDate(e.target.value)}
                className="w-full h-11 px-4 bg-white border border-[#E9E3DA] rounded-xl text-[13px] font-semibold outline-none focus:border-[#111111] transition-all cursor-pointer"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-[11px] font-bold uppercase tracking-[0.08em] text-[#6A6A6A] font-mono">Expected Delivery</label>
              <input 
                type="date" 
                value={expectedDelivery}
                onChange={e => setExpectedDelivery(e.target.value)}
                className="w-full h-11 px-4 bg-white border border-[#E9E3DA] rounded-xl text-[13px] font-semibold outline-none focus:border-[#111111] transition-all cursor-pointer"
              />
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-[11px] font-bold uppercase tracking-[0.08em] text-[#6A6A6A] font-mono">Account Owner</label>
            <input 
              type="text" 
              required
              value={assignee}
              onChange={e => setAssignee(e.target.value)}
              className="w-full h-11 px-4 bg-white border border-[#E9E3DA] rounded-xl text-[13px] font-semibold outline-none focus:border-[#111111] transition-all"
            />
          </div>

          {/* Spacer */}
          <div className="flex-1" />

          {/* Action buttons */}
          <div className="border-t border-[#E9E3DA] pt-4 flex gap-3 bg-[#FCFBF8]">
            <button
              type="button"
              onClick={() => setIsAddClientOpen(false)}
              className="flex-1 h-11 border border-[#E9E3DA] rounded-xl text-[13px] font-bold hover:bg-white transition-all cursor-pointer text-center"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 h-11 bg-[#111111] hover:bg-[#222222] text-white rounded-xl text-[13px] font-bold transition-all flex items-center justify-center gap-1.5 shadow-sm disabled:opacity-50 cursor-pointer"
            >
              {isSubmitting ? (
                <>
                  <Loader2 size={14} className="animate-spin" />
                  <span>Saving Lead...</span>
                </>
              ) : (
                <span>Initialize Lead</span>
              )}
            </button>
          </div>

        </form>

      </div>
    </div>
  );
}
