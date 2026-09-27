"use client";

import React from "react";
import { useCRM } from "./CRMProvider";
import { ListChecks, CheckCircle2, Phone, MessageCircle, Users2, Mail, Circle } from "lucide-react";

const TYPE_ICON: Record<string, React.ReactNode> = {
  Call: <Phone size={13} />,
  WhatsApp: <MessageCircle size={13} />,
  Meeting: <Users2 size={13} />,
  Email: <Mail size={13} />,
  Other: <Circle size={13} />,
};

interface FollowUpItem {
  leadId: string;
  name: string;
  company?: string;
  assignedTo?: string;
  priority?: string;
  date: string;
  time?: string;
  type: string;
}

export default function ActivitiesFollowupsView() {
  const { followUpFeed, completeLeadFollowUp, leads, setView, globalActivities } = useCRM();

  const findLeadFollowUpId = (leadId: string) => {
    const lead = leads.find((l) => l._id === leadId);
    if (!lead) return null;
    const upcoming = (lead.followUps || []).filter((f) => !f.completed).sort((a, b) => a.date.localeCompare(b.date))[0];
    return upcoming?._id || null;
  };

  const handleComplete = async (leadId: string) => {
    const fuId = findLeadFollowUpId(leadId);
    if (fuId) await completeLeadFollowUp(leadId, fuId);
  };

  return (
    <div className="flex flex-col gap-6 pb-16 select-none">
      <div>
        <h1 className="text-[28px] font-extrabold tracking-tight text-[#111111] leading-none">Activities / Follow-ups</h1>
        <p className="text-[13.5px] text-[#6A6A6A] mt-1.5 font-medium">Every scheduled call, WhatsApp, meeting, or email — organized by urgency.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <FollowUpSection title="Overdue Follow-ups" items={followUpFeed.overdue} tone="rose" onOpenLead={() => setView("leads")} onComplete={handleComplete} />
        <FollowUpSection title="Today's Follow-ups" items={followUpFeed.dueToday} tone="indigo" onOpenLead={() => setView("leads")} onComplete={handleComplete} />
        <FollowUpSection title="Upcoming Follow-ups" items={followUpFeed.upcoming} tone="slate" onOpenLead={() => setView("leads")} onComplete={handleComplete} />
      </div>

      <div className="bg-white border border-[#E9E3DA] rounded-2xl p-6 shadow-sm">
        <h3 className="text-[15px] font-extrabold text-[#111111] mb-4 flex items-center gap-2"><ListChecks size={17} />Recent Activity Across All Customers</h3>
        <div className="flex flex-col gap-4 relative pl-3 border-l border-[#E9E3DA] max-h-[420px] overflow-y-auto">
          {globalActivities.slice(0, 20).map((act, i) => (
            <div key={i} className="relative text-[12.5px]">
              <span className="absolute -left-[16.5px] top-1.5 w-2 h-2 rounded-full bg-indigo-600 shadow-[0_0_8px_rgba(99,102,241,0.4)]" />
              <p className="text-[#111111] leading-snug font-medium">{act.text}</p>
              <span className="text-[10px] text-[#6A6A6A] block mt-1 font-mono">{act.timestamp}</span>
            </div>
          ))}
          {globalActivities.length === 0 && <div className="text-[#6A6A6A] text-[12px] italic text-center py-6">No activity recorded yet.</div>}
        </div>
      </div>
    </div>
  );
}

function FollowUpSection({
  title,
  items,
  tone,
  onOpenLead,
  onComplete,
}: {
  title: string;
  items: FollowUpItem[];
  tone: "rose" | "indigo" | "slate";
  onOpenLead: (leadId: string) => void;
  onComplete: (leadId: string) => void;
}) {
  const toneMap = {
    rose: "border-rose-200 bg-rose-50",
    indigo: "border-indigo-200 bg-indigo-50",
    slate: "border-[#E9E3DA] bg-[#FCFBF8]",
  };
  return (
    <div className="bg-white border border-[#E9E3DA] rounded-2xl overflow-hidden shadow-sm flex flex-col">
      <div className={`px-5 py-4 border-b border-[#E9E3DA] flex items-center justify-between ${toneMap[tone]}`}>
        <h3 className="text-[14px] font-extrabold text-[#111111]">{title}</h3>
        <span className="px-2 py-0.5 rounded-full text-[11px] font-mono font-bold bg-white border border-[#E9E3DA]">{items.length}</span>
      </div>
      <div className="flex flex-col divide-y divide-[#E9E3DA]/60 max-h-[420px] overflow-y-auto">
        {items.length === 0 && <div className="p-6 text-center text-[12.5px] text-[#6A6A6A] italic">Nothing here.</div>}
        {items.map((item) => (
          <div key={item.leadId + item.date} className="p-4 flex items-center justify-between gap-3 hover:bg-[#FCFBF8]">
            <button onClick={() => onOpenLead(item.leadId)} className="flex items-start gap-3 text-left flex-1 min-w-0 cursor-pointer">
              <span className="mt-0.5 text-[#6A6A6A]">{TYPE_ICON[item.type] || <Circle size={13} />}</span>
              <div className="min-w-0">
                <div className="text-[13px] font-bold text-[#111111] truncate">{item.name} <span className="text-[#6A6A6A] font-normal">({item.company || "—"})</span></div>
                <div className="text-[11px] text-[#6A6A6A] font-mono">{item.date} {item.time} · {item.assignedTo}</div>
              </div>
            </button>
            <button onClick={() => onComplete(item.leadId)} title="Mark complete" className="p-1.5 rounded-lg text-emerald-600 hover:bg-emerald-50 cursor-pointer shrink-0">
              <CheckCircle2 size={17} />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
