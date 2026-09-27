"use client";

import React, { useState, useMemo, useEffect } from "react";
import { useCRM, ReferencePerson } from "./CRMProvider";
import {
  Share2,
  Search,
  X,
  Trash2,
  Edit2,
  Phone,
  Mail,
  ArrowLeft,
  Users,
} from "lucide-react";

const TYPE_OPTIONS: ReferencePerson["type"][] = [
  "Existing Customer",
  "Friend",
  "Business Contact",
  "Freelancer",
  "Partner",
  "Other",
];

const TYPE_BADGE: Record<string, string> = {
  "Existing Customer": "bg-emerald-50 text-emerald-700 border-emerald-200",
  Friend: "bg-blue-50 text-blue-700 border-blue-200",
  "Business Contact": "bg-indigo-50 text-indigo-700 border-indigo-200",
  Freelancer: "bg-purple-50 text-purple-700 border-purple-200",
  Partner: "bg-amber-50 text-amber-700 border-amber-200",
  Other: "bg-slate-100 text-slate-600 border-slate-200",
};

const emptyForm = {
  name: "",
  phone: "",
  whatsapp: "",
  email: "",
  type: "Other" as ReferencePerson["type"],
  notes: "",
  pendingReward: "",
  paidReward: "",
};

export default function ReferenceManagerView() {
  const { references, addReference, updateReference, deleteReference, getReferralDetail, settings, setView, setActiveClientId } = useCRM();

  const [search, setSearch] = useState("");
  const [filterType, setFilterType] = useState("All");
  const [activeId, setActiveId] = useState<string | null>(null);
  const [detail, setDetail] = useState<{ leads: any[]; customers: any[] }>({ leads: [], customers: [] });

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState({ ...emptyForm });

  const formatCurrency = (val: number) => {
    const sym = settings.currency || "₹";
    return `${sym}${(val || 0).toLocaleString("en-IN")}`;
  };

  const filtered = useMemo(() => {
    return references.filter((r) => {
      if (filterType !== "All" && r.type !== filterType) return false;
      if (search.trim()) {
        const q = search.toLowerCase();
        const matches = r.name?.toLowerCase().includes(q) || r.phone?.toLowerCase().includes(q);
        if (!matches) return false;
      }
      return true;
    });
  }, [references, search, filterType]);

  const active = references.find((r) => r._id === activeId) || null;

  useEffect(() => {
    if (active) {
      getReferralDetail(active._id).then(setDetail);
    }
  }, [activeId]);

  const openAddModal = () => {
    setEditingId(null);
    setForm({ ...emptyForm });
    setIsFormOpen(true);
  };

  const openEditModal = (r: ReferencePerson) => {
    setEditingId(r._id);
    setForm({
      name: r.name,
      phone: r.phone || "",
      whatsapp: r.whatsapp || "",
      email: r.email || "",
      type: r.type,
      notes: r.notes || "",
      pendingReward: String(r.pendingReward || ""),
      paidReward: String(r.paidReward || ""),
    });
    setIsFormOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name) return;
    const payload = {
      ...form,
      pendingReward: parseFloat(form.pendingReward) || 0,
      paidReward: parseFloat(form.paidReward) || 0,
    };
    if (editingId) {
      await updateReference(editingId, payload as any);
    } else {
      await addReference(payload as any);
    }
    setIsFormOpen(false);
  };

  if (active) {
    return (
      <div className="flex flex-col gap-6 pb-16 select-none">
        <button onClick={() => setActiveId(null)} className="flex items-center gap-2 text-[13px] font-bold text-[#6A6A6A] hover:text-[#111111] cursor-pointer w-fit">
          <ArrowLeft size={15} /><span>Back to Reference Manager</span>
        </button>

        <div className="bg-white border border-[#E9E3DA] rounded-[22px] p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-5">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-teal-500 to-emerald-600 text-white font-extrabold text-[20px] flex items-center justify-center shrink-0">
              {active.name.substring(0, 2).toUpperCase()}
            </div>
            <div>
              <h2 className="text-[20px] font-extrabold text-[#111111]">{active.name}</h2>
              <span className={`inline-block mt-1 px-2.5 py-1 rounded-full text-[10px] font-mono font-extrabold uppercase tracking-wider border ${TYPE_BADGE[active.type]}`}>{active.type}</span>
              <div className="flex items-center gap-3 mt-2 flex-wrap">
                {active.phone && <span className="text-[11.5px] text-[#6A6A6A] flex items-center gap-1"><Phone size={11} />{active.phone}</span>}
                {active.email && <span className="text-[11.5px] text-[#6A6A6A] flex items-center gap-1"><Mail size={11} />{active.email}</span>}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button onClick={() => openEditModal(active)} className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-[#E9E3DA] text-[#111111] hover:bg-[#FCFBF8] text-[12px] font-bold cursor-pointer">
              <Edit2 size={13} /><span>Edit</span>
            </button>
            <button
              onClick={() => { if (confirm(`Delete reference ${active.name}?`)) { deleteReference(active._id); setActiveId(null); } }}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-red-200 text-red-600 hover:bg-red-50 text-[12px] font-bold cursor-pointer"
            >
              <Trash2 size={13} /><span>Delete</span>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <StatCard label="Leads Referred" value={String(active.stats?.totalLeadsReferred ?? 0)} color="indigo" />
          <StatCard label="Converted" value={String(active.stats?.convertedLeads ?? 0)} color="emerald" />
          <StatCard label="Active" value={String(active.stats?.activeLeads ?? 0)} color="amber" />
          <StatCard label="Lost" value={String(active.stats?.lostLeads ?? 0)} color="rose" />
          <StatCard label="Business Generated" value={formatCurrency(active.stats?.totalBusinessGenerated ?? 0)} color="emerald" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-white border border-[#E9E3DA] rounded-2xl p-5 shadow-sm">
            <span className="text-[10.5px] font-mono uppercase font-bold text-[#6A6A6A] block">Pending Reward</span>
            <div className="text-[22px] font-extrabold text-rose-600 mt-1">{formatCurrency(active.pendingReward || 0)}</div>
          </div>
          <div className="bg-white border border-[#E9E3DA] rounded-2xl p-5 shadow-sm">
            <span className="text-[10.5px] font-mono uppercase font-bold text-[#6A6A6A] block">Paid Reward</span>
            <div className="text-[22px] font-extrabold text-emerald-600 mt-1">{formatCurrency(active.paidReward || 0)}</div>
          </div>
        </div>

        {active.notes && (
          <div className="bg-white border border-[#E9E3DA] rounded-2xl p-5 shadow-sm">
            <h3 className="text-[13px] font-extrabold text-[#111111] mb-1.5">Notes</h3>
            <p className="text-[13px] text-[#6A6A6A]">{active.notes}</p>
          </div>
        )}

        {/* Every lead/customer referred */}
        <div className="bg-white border border-[#E9E3DA] rounded-2xl overflow-hidden shadow-sm">
          <div className="px-5 py-4 border-b border-[#E9E3DA]">
            <h3 className="text-[14px] font-extrabold text-[#111111] flex items-center gap-2"><Users size={15} />Every Lead & Customer Referred</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-[13px]">
              <thead>
                <tr className="bg-[#FCFBF8] border-b border-[#E9E3DA] text-[11px] font-mono uppercase text-[#6A6A6A]">
                  <th className="py-3 px-5 font-bold">Name</th>
                  <th className="py-3 px-5 font-bold">Type</th>
                  <th className="py-3 px-5 font-bold">Status</th>
                  <th className="py-3 px-5 font-bold">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E9E3DA]/60">
                {detail.leads.filter((l) => l.status !== "Converted").map((l) => (
                  <tr key={l._id}>
                    <td className="py-3 px-5 font-bold text-[#111111]">{l.name} <span className="text-[#6A6A6A] font-normal">({l.company})</span></td>
                    <td className="py-3 px-5 text-[#6A6A6A]">Lead</td>
                    <td className="py-3 px-5">
                      <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-slate-100 text-slate-700 border border-slate-200">{l.status}</span>
                    </td>
                    <td className="py-3 px-5 font-mono text-[12px] text-[#6A6A6A]">{new Date(l.createdAt).toLocaleDateString()}</td>
                  </tr>
                ))}
                {detail.customers.map((c) => (
                  <tr
                    key={c._id}
                    onClick={() => { setView("projects"); setActiveClientId(c._id); }}
                    className="cursor-pointer hover:bg-[#FCFBF8]"
                  >
                    <td className="py-3 px-5 font-bold text-[#111111]">{c.name} <span className="text-[#6A6A6A] font-normal">({c.company})</span></td>
                    <td className="py-3 px-5 text-[#6A6A6A]">Customer</td>
                    <td className="py-3 px-5">
                      <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">{c.stage}</span>
                    </td>
                    <td className="py-3 px-5 font-mono text-[12px] text-[#6A6A6A]">{new Date(c.createdAt).toLocaleDateString()}</td>
                  </tr>
                ))}
                {detail.leads.length === 0 && detail.customers.length === 0 && (
                  <tr><td colSpan={4} className="py-8 text-center text-[#6A6A6A] text-[12.5px]">No referrals recorded yet.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {isFormOpen && <ReferenceFormModal form={form} setForm={setForm} onSubmit={handleSubmit} onClose={() => setIsFormOpen(false)} editing={!!editingId} />}
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 pb-16 select-none">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-[28px] font-extrabold tracking-tight text-[#111111] leading-none">Reference Manager</h1>
          <p className="text-[13.5px] text-[#6A6A6A] mt-1.5 font-medium">Track everyone who refers business your way, and reward them accordingly.</p>
        </div>
        <button onClick={openAddModal} className="flex items-center justify-center gap-2 bg-[#111111] hover:bg-[#222222] text-white px-5 py-2.5 rounded-xl text-[13px] font-bold transition-all shadow-sm cursor-pointer shrink-0">
          <Share2 size={16} /><span>Add Reference</span>
        </button>
      </div>

      <div className="bg-white border border-[#E9E3DA] rounded-2xl p-3.5 shadow-2xs flex flex-col md:flex-row items-stretch md:items-center gap-3">
        <div className="relative flex-1">
          <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#A8A296]" />
          <input
            type="text"
            placeholder="Search by name or phone..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full h-10 pl-10 pr-4 bg-[#FCFBF8] border border-[#E9E3DA] rounded-xl text-[13px] font-medium text-[#111111] outline-none focus:border-[#111111]"
          />
        </div>
        <select value={filterType} onChange={(e) => setFilterType(e.target.value)} className="h-10 px-3 bg-[#FCFBF8] border border-[#E9E3DA] rounded-xl text-[12px] font-bold text-[#111111] outline-none cursor-pointer">
          <option value="All">All Types</option>
          {TYPE_OPTIONS.map((t) => <option key={t} value={t}>{t}</option>)}
        </select>
      </div>

      <div className="bg-white border border-[#E9E3DA] rounded-[22px] overflow-hidden shadow-2xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#FCFBF8] border-b border-[#E9E3DA] text-[11px] font-mono uppercase text-[#6A6A6A] tracking-wider">
                <th className="py-3.5 px-5 font-bold">Name</th>
                <th className="py-3.5 px-5 font-bold">Type</th>
                <th className="py-3.5 px-5 font-bold">Leads Referred</th>
                <th className="py-3.5 px-5 font-bold">Converted</th>
                <th className="py-3.5 px-5 font-bold">Business Generated</th>
                <th className="py-3.5 px-5 font-bold">Pending Reward</th>
                <th className="py-3.5 px-5 font-bold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E9E3DA]/60 text-[13px] font-semibold text-[#111111]">
              {filtered.map((r) => (
                <tr key={r._id} onClick={() => setActiveId(r._id)} className="hover:bg-[#FCFBF8] transition-colors cursor-pointer">
                  <td className="py-3.5 px-5 font-extrabold">{r.name}</td>
                  <td className="py-3.5 px-5">
                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-mono font-extrabold uppercase tracking-wider border ${TYPE_BADGE[r.type]}`}>{r.type}</span>
                  </td>
                  <td className="py-3.5 px-5 font-mono">{r.stats?.totalLeadsReferred ?? 0}</td>
                  <td className="py-3.5 px-5 font-mono text-emerald-700 font-bold">{r.stats?.convertedLeads ?? 0}</td>
                  <td className="py-3.5 px-5 font-mono font-extrabold">{formatCurrency(r.stats?.totalBusinessGenerated ?? 0)}</td>
                  <td className="py-3.5 px-5 font-mono text-rose-600 font-bold">{formatCurrency(r.pendingReward || 0)}</td>
                  <td className="py-3.5 px-5 text-right" onClick={(e) => e.stopPropagation()}>
                    <div className="flex items-center justify-end gap-1.5">
                      <button onClick={() => openEditModal(r)} className="p-1.5 rounded-lg text-[#111111] hover:bg-[#111111]/5 cursor-pointer"><Edit2 size={15} /></button>
                      <button onClick={() => { if (confirm(`Delete reference ${r.name}?`)) deleteReference(r._id); }} className="p-1.5 rounded-lg text-rose-600 hover:bg-rose-50 cursor-pointer"><Trash2 size={15} /></button>
                    </div>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={7} className="py-16 text-center text-[#6A6A6A]">
                    <Share2 className="mx-auto text-[#A8A296] mb-2" size={32} />
                    <p className="font-bold text-[#111111]">No references found</p>
                    <p className="text-[12px] mt-1">Add people who refer business to you.</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {isFormOpen && <ReferenceFormModal form={form} setForm={setForm} onSubmit={handleSubmit} onClose={() => setIsFormOpen(false)} editing={!!editingId} />}
    </div>
  );
}

function StatCard({ label, value, color }: { label: string; value: string; color: string }) {
  const colorMap: Record<string, string> = {
    indigo: "text-indigo-600",
    emerald: "text-emerald-600",
    amber: "text-amber-600",
    rose: "text-rose-600",
  };
  return (
    <div className="bg-white border border-[#E9E3DA] rounded-2xl p-4 shadow-sm">
      <span className="text-[10.5px] font-mono uppercase font-bold text-[#6A6A6A] block">{label}</span>
      <div className={`text-[18px] font-extrabold mt-1 ${colorMap[color] || "text-[#111111]"}`}>{value}</div>
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

function ReferenceFormModal({
  form,
  setForm,
  onSubmit,
  onClose,
  editing,
}: {
  form: typeof emptyForm;
  setForm: (f: typeof emptyForm) => void;
  onSubmit: (e: React.FormEvent) => void;
  onClose: () => void;
  editing: boolean;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl p-6 max-w-lg w-full shadow-2xl border border-[#E9E3DA] flex flex-col gap-5 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between border-b border-[#E9E3DA] pb-3">
          <h3 className="text-[16px] font-extrabold text-[#111111]">{editing ? "Edit Reference" : "Add Reference"}</h3>
          <button onClick={onClose} className="p-1 rounded-lg text-[#6A6A6A] hover:bg-[#F3F4F6] cursor-pointer"><X size={18} /></button>
        </div>
        <form onSubmit={onSubmit} className="flex flex-col gap-4">
          <div className="grid grid-cols-2 gap-3">
            <Field label="Name *"><input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="gb-input3" /></Field>
            <Field label="Type">
              <select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value as any })} className="gb-input3">
                {TYPE_OPTIONS.map((t) => <option key={t} value={t}>{t}</option>)}
              </select>
            </Field>
            <Field label="Phone"><input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className="gb-input3" /></Field>
            <Field label="WhatsApp"><input value={form.whatsapp} onChange={(e) => setForm({ ...form, whatsapp: e.target.value })} className="gb-input3" /></Field>
            <Field label="Email"><input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="gb-input3" /></Field>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Pending Reward"><input type="number" value={form.pendingReward} onChange={(e) => setForm({ ...form, pendingReward: e.target.value })} className="gb-input3" /></Field>
            <Field label="Paid Reward"><input type="number" value={form.paidReward} onChange={(e) => setForm({ ...form, paidReward: e.target.value })} className="gb-input3" /></Field>
          </div>
          <Field label="Notes"><textarea value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} rows={3} className="gb-input3 resize-none" /></Field>
          <div className="flex items-center justify-end gap-3 pt-2 border-t border-[#E9E3DA]">
            <button type="button" onClick={onClose} className="px-4 py-2 rounded-xl text-[13px] font-semibold text-[#6A6A6A] hover:bg-[#F3F4F6] cursor-pointer">Cancel</button>
            <button type="submit" className="px-5 py-2.5 rounded-xl text-[13px] font-bold bg-[#111111] hover:bg-[#222222] text-white cursor-pointer">{editing ? "Save Changes" : "Add Reference"}</button>
          </div>
        </form>
      </div>
      <style jsx global>{`
        .gb-input3 {
          background: #fcfbf8;
          border: 1px solid #e9e3da;
          border-radius: 0.75rem;
          padding: 0.55rem 0.75rem;
          font-size: 13px;
          color: #111111;
          outline: none;
          width: 100%;
        }
        .gb-input3:focus {
          border-color: #111111;
        }
      `}</style>
    </div>
  );
}
