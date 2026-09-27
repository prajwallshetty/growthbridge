"use client";

import React, { useState, useMemo } from "react";
import { useCRM, Lead, LeadFollowUp } from "./CRMProvider";
import {
  UserPlus,
  Search,
  X,
  Trash2,
  Edit2,
  Phone,
  Mail,
  ArrowRightCircle,
  Clock,
  AlertCircle,
  CalendarClock,
  Filter,
} from "lucide-react";

const STATUS_OPTIONS: Lead["status"][] = [
  "New",
  "Contacted",
  "Discussion",
  "Proposal Sent",
  "Negotiation",
  "Converted",
  "Lost",
];

const SOURCE_OPTIONS: Lead["source"][] = [
  "Direct",
  "WhatsApp",
  "Instagram",
  "Website",
  "Referral",
  "LinkedIn",
  "Existing Customer",
  "Freelancer",
  "Other",
];

const STATUS_BADGE: Record<string, string> = {
  New: "bg-slate-50 text-slate-700 border-slate-200",
  Contacted: "bg-indigo-50 text-indigo-700 border-indigo-200",
  Discussion: "bg-blue-50 text-blue-700 border-blue-200",
  "Proposal Sent": "bg-amber-50 text-amber-700 border-amber-200",
  Negotiation: "bg-purple-50 text-purple-700 border-purple-200",
  Converted: "bg-emerald-50 text-emerald-700 border-emerald-200",
  Lost: "bg-rose-50 text-rose-700 border-rose-200",
};

const emptyForm = {
  name: "",
  company: "",
  phone: "",
  whatsapp: "",
  email: "",
  location: "",
  source: "Direct" as Lead["source"],
  referenceId: "",
  interestedService: "",
  estimatedBudget: "",
  priority: "Medium" as Lead["priority"],
  assignedTo: "Unassigned",
  notes: "",
};

export default function LeadsView() {
  const {
    leads,
    references,
    addLead,
    updateLead,
    deleteLead,
    updateLeadStatus,
    addLeadFollowUp,
    convertLeadToCustomer,
    setView,
    setActiveClientId,
  } = useCRM();

  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("All");
  const [filterSource, setFilterSource] = useState("All");
  const [filterPriority, setFilterPriority] = useState("All");

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState({ ...emptyForm });

  const [followUpLeadId, setFollowUpLeadId] = useState<string | null>(null);
  const [fuType, setFuType] = useState<LeadFollowUp["type"]>("Call");
  const [fuDate, setFuDate] = useState(new Date().toISOString().split("T")[0]);
  const [fuTime, setFuTime] = useState("");
  const [fuNotes, setFuNotes] = useState("");

  const [lostLeadId, setLostLeadId] = useState<string | null>(null);
  const [lostReason, setLostReason] = useState("");

  const today = new Date().toISOString().split("T")[0];

  const filtered = useMemo(() => {
    return leads.filter((l) => {
      if (filterStatus !== "All" && l.status !== filterStatus) return false;
      if (filterSource !== "All" && l.source !== filterSource) return false;
      if (filterPriority !== "All" && l.priority !== filterPriority) return false;
      if (search.trim()) {
        const q = search.toLowerCase();
        const matches =
          l.name?.toLowerCase().includes(q) ||
          l.company?.toLowerCase().includes(q) ||
          l.phone?.toLowerCase().includes(q) ||
          l.email?.toLowerCase().includes(q);
        if (!matches) return false;
      }
      return true;
    });
  }, [leads, search, filterStatus, filterSource, filterPriority]);

  const pipelineCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    STATUS_OPTIONS.forEach((s) => (counts[s] = 0));
    leads.forEach((l) => (counts[l.status] = (counts[l.status] || 0) + 1));
    return counts;
  }, [leads]);

  const openAddModal = () => {
    setEditingId(null);
    setForm({ ...emptyForm });
    setIsFormOpen(true);
  };

  const openEditModal = (lead: Lead) => {
    setEditingId(lead._id);
    setForm({
      name: lead.name || "",
      company: lead.company || "",
      phone: lead.phone || "",
      whatsapp: lead.whatsapp || "",
      email: lead.email || "",
      location: lead.location || "",
      source: lead.source,
      referenceId: typeof lead.referenceId === "object" && lead.referenceId ? lead.referenceId._id : (lead.referenceId as string) || "",
      interestedService: lead.interestedService || "",
      estimatedBudget: String(lead.estimatedBudget || ""),
      priority: lead.priority,
      assignedTo: lead.assignedTo || "Unassigned",
      notes: lead.notes || "",
    });
    setIsFormOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name) return;

    const payload = {
      ...form,
      estimatedBudget: parseFloat(form.estimatedBudget) || 0,
      referenceId: form.source === "Referral" ? form.referenceId || null : null,
    };

    if (editingId) {
      await updateLead(editingId, payload as any);
    } else {
      await addLead(payload as any);
    }
    setIsFormOpen(false);
  };

  const handleConvert = async (lead: Lead) => {
    if (!confirm(`Convert ${lead.name} (${lead.company || "no company"}) into a Customer? This will preserve all lead & reference information.`)) return;
    const customerId = await convertLeadToCustomer(lead._id);
    if (customerId) {
      setView("projects");
      setActiveClientId(customerId);
    }
  };

  const handleQuickStatus = async (lead: Lead, status: Lead["status"]) => {
    if (status === "Lost") {
      setLostLeadId(lead._id);
      setLostReason("");
      return;
    }
    await updateLeadStatus(lead._id, status);
  };

  const submitLost = async () => {
    if (!lostLeadId) return;
    await updateLeadStatus(lostLeadId, "Lost", lostReason);
    setLostLeadId(null);
  };

  const openFollowUpModal = (leadId: string) => {
    setFollowUpLeadId(leadId);
    setFuType("Call");
    setFuDate(today);
    setFuTime("");
    setFuNotes("");
  };

  const submitFollowUp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!followUpLeadId) return;
    await addLeadFollowUp(followUpLeadId, { type: fuType, date: fuDate, time: fuTime, notes: fuNotes, completed: false });
    setFollowUpLeadId(null);
  };

  const referenceLabel = (lead: Lead) => {
    if (lead.source !== "Referral") return null;
    if (typeof lead.referenceId === "object" && lead.referenceId) return lead.referenceId.name;
    const ref = references.find((r) => r._id === lead.referenceId);
    return ref?.name || "Unknown";
  };

  return (
    <div className="flex flex-col gap-6 pb-16 select-none">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-[28px] font-extrabold tracking-tight text-[#111111] leading-none">Leads</h1>
          <p className="text-[13.5px] text-[#6A6A6A] mt-1.5 font-medium">
            Track everyone who has contacted you, been referred, or shown interest — before they become a customer.
          </p>
        </div>
        <button
          onClick={openAddModal}
          className="flex items-center justify-center gap-2 bg-[#111111] hover:bg-[#222222] text-white px-5 py-2.5 rounded-xl text-[13px] font-bold transition-all shadow-sm cursor-pointer shrink-0"
        >
          <UserPlus size={16} />
          <span>Add Lead</span>
        </button>
      </div>

      {/* Pipeline summary pills */}
      <div className="flex items-center gap-2.5 flex-wrap">
        {STATUS_OPTIONS.map((s) => (
          <button
            key={s}
            onClick={() => setFilterStatus(filterStatus === s ? "All" : s)}
            className={`px-3.5 py-1.5 rounded-xl text-[12.5px] font-semibold flex items-center gap-2 border transition-all cursor-pointer ${
              filterStatus === s ? "bg-[#111111] text-white border-[#111111]" : "bg-white border-[#E9E3DA] text-[#111111] hover:border-[#111111]/40"
            }`}
          >
            <span>{s}</span>
            <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-mono font-bold ${filterStatus === s ? "bg-white/20" : "bg-[#111111]/5"}`}>
              {pipelineCounts[s] || 0}
            </span>
          </button>
        ))}
      </div>

      {/* Search + Filters */}
      <div className="bg-white border border-[#E9E3DA] rounded-2xl p-3.5 shadow-2xs flex flex-col md:flex-row items-stretch md:items-center gap-3">
        <div className="relative flex-1">
          <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#A8A296]" />
          <input
            type="text"
            placeholder="Search leads by name, company, phone, or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full h-10 pl-10 pr-4 bg-[#FCFBF8] border border-[#E9E3DA] rounded-xl text-[13px] font-medium text-[#111111] outline-none focus:border-[#111111]"
          />
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <Filter size={14} className="text-[#6A6A6A] hidden sm:block" />
          <select value={filterSource} onChange={(e) => setFilterSource(e.target.value)} className="h-10 px-3 bg-[#FCFBF8] border border-[#E9E3DA] rounded-xl text-[12px] font-bold text-[#111111] outline-none cursor-pointer">
            <option value="All">All Sources</option>
            {SOURCE_OPTIONS.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
          <select value={filterPriority} onChange={(e) => setFilterPriority(e.target.value)} className="h-10 px-3 bg-[#FCFBF8] border border-[#E9E3DA] rounded-xl text-[12px] font-bold text-[#111111] outline-none cursor-pointer">
            <option value="All">All Priorities</option>
            <option value="High">High</option>
            <option value="Medium">Medium</option>
            <option value="Low">Low</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white border border-[#E9E3DA] rounded-[22px] overflow-hidden shadow-2xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#FCFBF8] border-b border-[#E9E3DA] text-[11px] font-mono uppercase text-[#6A6A6A] tracking-wider">
                <th className="py-3.5 px-5 font-bold">Lead</th>
                <th className="py-3.5 px-5 font-bold">Contact</th>
                <th className="py-3.5 px-5 font-bold">Source</th>
                <th className="py-3.5 px-5 font-bold">Status</th>
                <th className="py-3.5 px-5 font-bold">Priority</th>
                <th className="py-3.5 px-5 font-bold">Next Follow-up</th>
                <th className="py-3.5 px-5 font-bold">Assigned</th>
                <th className="py-3.5 px-5 font-bold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E9E3DA]/60 text-[13px] font-semibold text-[#111111]">
              {filtered.map((lead) => {
                const isOverdue = lead.nextFollowUp?.date && lead.nextFollowUp.date < today && !["Converted", "Lost"].includes(lead.status);
                const refName = referenceLabel(lead);
                return (
                  <tr key={lead._id} className="hover:bg-[#FCFBF8] transition-colors">
                    <td className="py-3.5 px-5">
                      <div className="font-extrabold text-[#111111]">{lead.name}</div>
                      <div className="text-[11.5px] text-[#6A6A6A] font-medium">{lead.company || "—"}</div>
                      {refName && <div className="text-[10.5px] text-teal-700 font-bold mt-0.5">via {refName}</div>}
                    </td>
                    <td className="py-3.5 px-5 text-[12px] text-[#6A6A6A] font-medium">
                      <div className="flex flex-col gap-0.5">
                        {lead.phone && <span className="flex items-center gap-1"><Phone size={11} />{lead.phone}</span>}
                        {lead.email && <span className="flex items-center gap-1"><Mail size={11} />{lead.email}</span>}
                      </div>
                    </td>
                    <td className="py-3.5 px-5 text-[12px] font-bold text-[#111111]">{lead.source}</td>
                    <td className="py-3.5 px-5">
                      <select
                        value={lead.status}
                        onChange={(e) => handleQuickStatus(lead, e.target.value as Lead["status"])}
                        className={`px-2.5 py-1 rounded-full text-[10px] font-mono font-extrabold uppercase tracking-wider border outline-none cursor-pointer ${STATUS_BADGE[lead.status]}`}
                      >
                        {STATUS_OPTIONS.map((s) => (
                          <option key={s} value={s} className="bg-white text-black">{s}</option>
                        ))}
                      </select>
                    </td>
                    <td className="py-3.5 px-5">
                      <span
                        className={`text-[9.5px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border ${
                          lead.priority === "High" ? "bg-rose-50 text-rose-700 border-rose-200" : lead.priority === "Low" ? "bg-neutral-100 text-neutral-600 border-neutral-200" : "bg-amber-50 text-amber-700 border-amber-200"
                        }`}
                      >
                        {lead.priority}
                      </span>
                    </td>
                    <td className="py-3.5 px-5">
                      {lead.nextFollowUp?.date ? (
                        <div className={`flex flex-col ${isOverdue ? "text-rose-600" : "text-[#111111]"}`}>
                          <span className="font-mono text-[12px] font-bold flex items-center gap-1">
                            {isOverdue ? <AlertCircle size={11} /> : <CalendarClock size={11} />}
                            {lead.nextFollowUp.date} {lead.nextFollowUp.time}
                          </span>
                          <span className="text-[10px] text-[#6A6A6A]">{lead.nextFollowUp.type}</span>
                        </div>
                      ) : (
                        <button onClick={() => openFollowUpModal(lead._id)} className="text-[11px] font-bold text-indigo-600 hover:underline cursor-pointer">
                          + Schedule
                        </button>
                      )}
                    </td>
                    <td className="py-3.5 px-5 text-[#6A6A6A] font-medium">{lead.assignedTo || "Unassigned"}</td>
                    <td className="py-3.5 px-5 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {!["Converted"].includes(lead.status) && (
                          <button
                            onClick={() => handleConvert(lead)}
                            title="Convert to Customer"
                            className="p-1.5 rounded-lg text-emerald-600 hover:bg-emerald-50 cursor-pointer"
                          >
                            <ArrowRightCircle size={16} />
                          </button>
                        )}
                        <button onClick={() => openFollowUpModal(lead._id)} title="Add Follow-up" className="p-1.5 rounded-lg text-indigo-600 hover:bg-indigo-50 cursor-pointer">
                          <Clock size={15} />
                        </button>
                        <button onClick={() => openEditModal(lead)} title="Edit" className="p-1.5 rounded-lg text-[#111111] hover:bg-[#111111]/5 cursor-pointer">
                          <Edit2 size={15} />
                        </button>
                        <button
                          onClick={() => {
                            if (confirm(`Delete lead ${lead.name}?`)) deleteLead(lead._id);
                          }}
                          title="Delete"
                          className="p-1.5 rounded-lg text-rose-600 hover:bg-rose-50 cursor-pointer"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}

              {filtered.length === 0 && (
                <tr>
                  <td colSpan={8} className="py-16 text-center text-[#6A6A6A]">
                    <UserPlus className="mx-auto text-[#A8A296] mb-2" size={32} />
                    <p className="font-bold text-[#111111]">No leads found</p>
                    <p className="text-[12px] mt-1">Add a new lead to start tracking your pipeline.</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add/Edit Lead Modal */}
      {isFormOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl p-6 max-w-2xl w-full shadow-2xl border border-[#E9E3DA] flex flex-col gap-5 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-[#E9E3DA] pb-3">
              <h3 className="text-[16px] font-extrabold text-[#111111]">{editingId ? "Edit Lead" : "Add New Lead"}</h3>
              <button onClick={() => setIsFormOpen(false)} className="p-1 rounded-lg text-[#6A6A6A] hover:bg-[#F3F4F6] cursor-pointer">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <div className="grid grid-cols-2 gap-3">
                <Field label="Name *">
                  <input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="gb-input" />
                </Field>
                <Field label="Company">
                  <input value={form.company} onChange={(e) => setForm({ ...form, company: e.target.value })} className="gb-input" />
                </Field>
                <Field label="Phone">
                  <input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className="gb-input" />
                </Field>
                <Field label="WhatsApp">
                  <input value={form.whatsapp} onChange={(e) => setForm({ ...form, whatsapp: e.target.value })} className="gb-input" />
                </Field>
                <Field label="Email">
                  <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="gb-input" />
                </Field>
                <Field label="Location">
                  <input value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} className="gb-input" />
                </Field>
                <Field label="Source">
                  <select value={form.source} onChange={(e) => setForm({ ...form, source: e.target.value as Lead["source"] })} className="gb-input">
                    {SOURCE_OPTIONS.map((s) => <option key={s} value={s}>{s}</option>)}
                  </select>
                </Field>
                {form.source === "Referral" && (
                  <Field label="Reference Person">
                    <select value={form.referenceId} onChange={(e) => setForm({ ...form, referenceId: e.target.value })} className="gb-input">
                      <option value="">Select reference...</option>
                      {references.map((r) => <option key={r._id} value={r._id}>{r.name} ({r.type})</option>)}
                    </select>
                  </Field>
                )}
                <Field label="Interested Service">
                  <input value={form.interestedService} onChange={(e) => setForm({ ...form, interestedService: e.target.value })} className="gb-input" />
                </Field>
                <Field label="Estimated Budget">
                  <input type="number" value={form.estimatedBudget} onChange={(e) => setForm({ ...form, estimatedBudget: e.target.value })} className="gb-input" />
                </Field>
                <Field label="Priority">
                  <select value={form.priority} onChange={(e) => setForm({ ...form, priority: e.target.value as Lead["priority"] })} className="gb-input">
                    <option value="High">High</option>
                    <option value="Medium">Medium</option>
                    <option value="Low">Low</option>
                  </select>
                </Field>
                <Field label="Assigned To">
                  <input value={form.assignedTo} onChange={(e) => setForm({ ...form, assignedTo: e.target.value })} className="gb-input" />
                </Field>
              </div>
              <Field label="Notes">
                <textarea value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} rows={3} className="gb-input resize-none" />
              </Field>

              <div className="flex items-center justify-end gap-3 pt-2 border-t border-[#E9E3DA]">
                <button type="button" onClick={() => setIsFormOpen(false)} className="px-4 py-2 rounded-xl text-[13px] font-semibold text-[#6A6A6A] hover:bg-[#F3F4F6] cursor-pointer">
                  Cancel
                </button>
                <button type="submit" className="px-5 py-2.5 rounded-xl text-[13px] font-bold bg-[#111111] hover:bg-[#222222] text-white cursor-pointer">
                  {editingId ? "Save Changes" : "Add Lead"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Follow-up Modal */}
      {followUpLeadId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl border border-[#E9E3DA] flex flex-col gap-4">
            <div className="flex items-center justify-between border-b border-[#E9E3DA] pb-3">
              <h3 className="text-[16px] font-extrabold text-[#111111]">Schedule Follow-up</h3>
              <button onClick={() => setFollowUpLeadId(null)} className="p-1 rounded-lg text-[#6A6A6A] hover:bg-[#F3F4F6] cursor-pointer">
                <X size={18} />
              </button>
            </div>
            <form onSubmit={submitFollowUp} className="flex flex-col gap-3">
              <Field label="Type">
                <select value={fuType} onChange={(e) => setFuType(e.target.value as LeadFollowUp["type"])} className="gb-input">
                  <option value="Call">Call</option>
                  <option value="WhatsApp">WhatsApp</option>
                  <option value="Meeting">Meeting</option>
                  <option value="Email">Email</option>
                  <option value="Other">Other</option>
                </select>
              </Field>
              <div className="grid grid-cols-2 gap-3">
                <Field label="Date"><input type="date" required value={fuDate} onChange={(e) => setFuDate(e.target.value)} className="gb-input" /></Field>
                <Field label="Time"><input type="time" value={fuTime} onChange={(e) => setFuTime(e.target.value)} className="gb-input" /></Field>
              </div>
              <Field label="Notes"><textarea value={fuNotes} onChange={(e) => setFuNotes(e.target.value)} rows={2} className="gb-input resize-none" /></Field>
              <div className="flex items-center justify-end gap-3 pt-2 border-t border-[#E9E3DA]">
                <button type="button" onClick={() => setFollowUpLeadId(null)} className="px-4 py-2 rounded-xl text-[13px] font-semibold text-[#6A6A6A] hover:bg-[#F3F4F6] cursor-pointer">Cancel</button>
                <button type="submit" className="px-5 py-2.5 rounded-xl text-[13px] font-bold bg-[#111111] hover:bg-[#222222] text-white cursor-pointer">Schedule</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Lost Reason Modal */}
      {lostLeadId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-2xl border border-[#E9E3DA] flex flex-col gap-4">
            <h3 className="text-[16px] font-extrabold text-[#111111]">Mark Lead as Lost</h3>
            <Field label="Reason (optional)">
              <textarea value={lostReason} onChange={(e) => setLostReason(e.target.value)} rows={2} className="gb-input resize-none" placeholder="e.g. Budget mismatch, went with competitor..." />
            </Field>
            <div className="flex items-center justify-end gap-3">
              <button onClick={() => setLostLeadId(null)} className="px-4 py-2 rounded-xl text-[13px] font-semibold text-[#6A6A6A] hover:bg-[#F3F4F6] cursor-pointer">Cancel</button>
              <button onClick={submitLost} className="px-5 py-2.5 rounded-xl text-[13px] font-bold bg-rose-600 hover:bg-rose-700 text-white cursor-pointer">Mark Lost</button>
            </div>
          </div>
        </div>
      )}

      <style jsx global>{`
        .gb-input {
          background: #fcfbf8;
          border: 1px solid #e9e3da;
          border-radius: 0.75rem;
          padding: 0.55rem 0.75rem;
          font-size: 13px;
          color: #111111;
          outline: none;
          width: 100%;
        }
        .gb-input:focus {
          border-color: #111111;
        }
      `}</style>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-[11px] font-mono uppercase font-bold text-[#6A6A6A]">{label}</label>
      {children}
    </div>
  );
}
