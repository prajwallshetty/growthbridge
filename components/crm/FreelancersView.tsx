"use client";

import React, { useState, useMemo } from "react";
import { useCRM, Freelancer, FreelancerPayment } from "./CRMProvider";
import {
  HardHat,
  Search,
  X,
  Trash2,
  Edit2,
  Phone,
  Mail,
  Globe,
  IndianRupee,
  Briefcase,
  Plus,
  ArrowLeft,
  Clock,
} from "lucide-react";

const AVAILABILITY_OPTIONS: Freelancer["availability"][] = ["Available", "Working", "Busy", "Inactive"];

const STATUS_BADGE: Record<string, string> = {
  Available: "bg-emerald-50 text-emerald-700 border-emerald-200",
  Working: "bg-indigo-50 text-indigo-700 border-indigo-200",
  Busy: "bg-amber-50 text-amber-700 border-amber-200",
  Inactive: "bg-slate-100 text-slate-600 border-slate-200",
};

const emptyForm = {
  name: "",
  phone: "",
  whatsapp: "",
  email: "",
  location: "",
  skills: "",
  specialization: "",
  experience: "",
  portfolioUrl: "",
  rateType: "Project" as Freelancer["rateType"],
  rate: "",
  paymentDetails: "",
  notes: "",
  status: "Available" as Freelancer["status"],
};

export default function FreelancersView() {
  const { freelancers, settings, addFreelancer, updateFreelancer, deleteFreelancer, addFreelancerPayment, updateFreelancerPaymentStatus } = useCRM();

  const [search, setSearch] = useState("");
  const [filterAvailability, setFilterAvailability] = useState("All");
  const [activeId, setActiveId] = useState<string | null>(null);

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState({ ...emptyForm });

  const [isPaymentOpen, setIsPaymentOpen] = useState(false);
  const [payAmount, setPayAmount] = useState("");
  const [payProject, setPayProject] = useState("");
  const [payDate, setPayDate] = useState(new Date().toISOString().split("T")[0]);
  const [payStatus, setPayStatus] = useState<FreelancerPayment["status"]>("Pending");
  const [payNotes, setPayNotes] = useState("");

  const formatCurrency = (val: number) => {
    const sym = settings.currency || "₹";
    return `${sym}${(val || 0).toLocaleString("en-IN")}`;
  };

  const filtered = useMemo(() => {
    return freelancers.filter((f) => {
      if (filterAvailability !== "All" && f.status !== filterAvailability) return false;
      if (search.trim()) {
        const q = search.toLowerCase();
        const matches =
          f.name?.toLowerCase().includes(q) ||
          (f.skills || []).some((s) => s.toLowerCase().includes(q)) ||
          f.specialization?.toLowerCase().includes(q);
        if (!matches) return false;
      }
      return true;
    });
  }, [freelancers, search, filterAvailability]);

  const active = freelancers.find((f) => f._id === activeId) || null;

  const openAddModal = () => {
    setEditingId(null);
    setForm({ ...emptyForm });
    setIsFormOpen(true);
  };

  const openEditModal = (f: Freelancer) => {
    setEditingId(f._id);
    setForm({
      name: f.name || "",
      phone: f.phone || "",
      whatsapp: f.whatsapp || "",
      email: f.email || "",
      location: f.location || "",
      skills: (f.skills || []).join(", "),
      specialization: f.specialization || "",
      experience: f.experience || "",
      portfolioUrl: f.portfolioUrl || "",
      rateType: f.rateType || "Project",
      rate: String(f.rate || ""),
      paymentDetails: f.paymentDetails || "",
      notes: f.notes || "",
      status: f.status,
    });
    setIsFormOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name) return;
    const payload = {
      ...form,
      skills: form.skills.split(",").map((s) => s.trim()).filter(Boolean),
      rate: parseFloat(form.rate) || 0,
      availability: form.status,
    };
    if (editingId) {
      await updateFreelancer(editingId, payload as any);
    } else {
      await addFreelancer(payload as any);
    }
    setIsFormOpen(false);
  };

  const handleAddPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!active || !payAmount) return;
    await addFreelancerPayment(active._id, {
      date: payDate,
      project: payProject,
      amount: parseFloat(payAmount) || 0,
      status: payStatus,
      notes: payNotes,
    });
    setPayAmount("");
    setPayProject("");
    setPayNotes("");
    setIsPaymentOpen(false);
  };

  if (active) {
    return (
      <div className="flex flex-col gap-6 pb-16 select-none">
        <button onClick={() => setActiveId(null)} className="flex items-center gap-2 text-[13px] font-bold text-[#6A6A6A] hover:text-[#111111] cursor-pointer w-fit">
          <ArrowLeft size={15} />
          <span>Back to Freelancers</span>
        </button>

        {/* Profile Header */}
        <div className="bg-white border border-[#E9E3DA] rounded-[22px] p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-5">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 text-white font-extrabold text-[20px] flex items-center justify-center shrink-0">
              {active.name.substring(0, 2).toUpperCase()}
            </div>
            <div>
              <h2 className="text-[20px] font-extrabold text-[#111111]">{active.name}</h2>
              <p className="text-[12.5px] text-[#6A6A6A] mt-0.5">{active.specialization || "Freelancer"} · {active.experience || "—"}</p>
              <div className="flex items-center gap-2 mt-2 flex-wrap">
                <span className={`px-2.5 py-1 rounded-full text-[10px] font-mono font-extrabold uppercase tracking-wider border ${STATUS_BADGE[active.status]}`}>{active.status}</span>
                {active.phone && <span className="text-[11.5px] text-[#6A6A6A] flex items-center gap-1"><Phone size={11} />{active.phone}</span>}
                {active.email && <span className="text-[11.5px] text-[#6A6A6A] flex items-center gap-1"><Mail size={11} />{active.email}</span>}
                {active.portfolioUrl && (
                  <a href={active.portfolioUrl} target="_blank" rel="noreferrer" className="text-[11.5px] text-indigo-600 flex items-center gap-1 hover:underline">
                    <Globe size={11} />Portfolio
                  </a>
                )}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button onClick={() => openEditModal(active)} className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-[#E9E3DA] text-[#111111] hover:bg-[#FCFBF8] text-[12px] font-bold cursor-pointer">
              <Edit2 size={13} /><span>Edit</span>
            </button>
            <button
              onClick={() => { if (confirm(`Delete freelancer ${active.name}?`)) { deleteFreelancer(active._id); setActiveId(null); } }}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-red-200 text-red-600 hover:bg-red-50 text-[12px] font-bold cursor-pointer"
            >
              <Trash2 size={13} /><span>Delete</span>
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatCard label="Active Projects" value={String(active.stats?.activeProjectsCount ?? 0)} color="indigo" />
          <StatCard label="Completed Projects" value={String(active.stats?.completedProjectsCount ?? 0)} color="emerald" />
          <StatCard label="Total Earnings" value={formatCurrency(active.stats?.totalEarnings ?? 0)} color="emerald" />
          <StatCard label="Pending Payment" value={formatCurrency(active.stats?.pendingPayment ?? 0)} color="rose" />
        </div>

        {/* Skills */}
        {(active.skills || []).length > 0 && (
          <div className="bg-white border border-[#E9E3DA] rounded-2xl p-5 shadow-sm">
            <h3 className="text-[13px] font-extrabold text-[#111111] mb-3">Skills</h3>
            <div className="flex flex-wrap gap-2">
              {active.skills!.map((s) => (
                <span key={s} className="px-2.5 py-1 rounded-lg text-[11.5px] font-bold bg-[#FCFBF8] border border-[#E9E3DA] text-[#111111]">{s}</span>
              ))}
            </div>
          </div>
        )}

        {/* Assigned Projects */}
        <div className="bg-white border border-[#E9E3DA] rounded-2xl overflow-hidden shadow-sm">
          <div className="px-5 py-4 border-b border-[#E9E3DA] flex items-center justify-between">
            <h3 className="text-[14px] font-extrabold text-[#111111] flex items-center gap-2"><Briefcase size={15} />Assigned Projects</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-[13px]">
              <thead>
                <tr className="bg-[#FCFBF8] border-b border-[#E9E3DA] text-[11px] font-mono uppercase text-[#6A6A6A]">
                  <th className="py-3 px-5 font-bold">Project</th>
                  <th className="py-3 px-5 font-bold">Client</th>
                  <th className="py-3 px-5 font-bold">Value</th>
                  <th className="py-3 px-5 font-bold">Freelancer Cost</th>
                  <th className="py-3 px-5 font-bold">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E9E3DA]/60">
                {(active.assignedProjects || []).map((p) => (
                  <tr key={p._id}>
                    <td className="py-3 px-5 font-bold text-[#111111]">{p.name}</td>
                    <td className="py-3 px-5 text-[#6A6A6A]">{p.client}</td>
                    <td className="py-3 px-5 font-mono">{formatCurrency(p.projectValue)}</td>
                    <td className="py-3 px-5 font-mono text-emerald-700 font-bold">{formatCurrency(p.freelancerCost)}</td>
                    <td className="py-3 px-5">
                      <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-slate-100 text-slate-700 border border-slate-200">{p.status}</span>
                    </td>
                  </tr>
                ))}
                {(active.assignedProjects || []).length === 0 && (
                  <tr><td colSpan={5} className="py-8 text-center text-[#6A6A6A] text-[12.5px]">No projects assigned yet.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Payment History */}
        <div className="bg-white border border-[#E9E3DA] rounded-2xl overflow-hidden shadow-sm">
          <div className="px-5 py-4 border-b border-[#E9E3DA] flex items-center justify-between">
            <h3 className="text-[14px] font-extrabold text-[#111111] flex items-center gap-2"><IndianRupee size={15} />Payment History</h3>
            <button onClick={() => setIsPaymentOpen(true)} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#111111] text-white text-[12px] font-bold cursor-pointer">
              <Plus size={13} /><span>Record Payment</span>
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-[13px]">
              <thead>
                <tr className="bg-[#FCFBF8] border-b border-[#E9E3DA] text-[11px] font-mono uppercase text-[#6A6A6A]">
                  <th className="py-3 px-5 font-bold">Date</th>
                  <th className="py-3 px-5 font-bold">Project</th>
                  <th className="py-3 px-5 font-bold">Amount</th>
                  <th className="py-3 px-5 font-bold">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E9E3DA]/60">
                {(active.payments || []).map((p) => (
                  <tr key={p._id}>
                    <td className="py-3 px-5 font-mono text-[12px]">{p.date}</td>
                    <td className="py-3 px-5 text-[#111111] font-medium">{p.project || "—"}</td>
                    <td className="py-3 px-5 font-mono font-bold">{formatCurrency(p.amount)}</td>
                    <td className="py-3 px-5">
                      <select
                        value={p.status}
                        onChange={(e) => updateFreelancerPaymentStatus(active._id, p._id!, e.target.value)}
                        className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold border cursor-pointer ${p.status === "Paid" ? "bg-emerald-50 text-emerald-700 border-emerald-200" : "bg-amber-50 text-amber-700 border-amber-200"}`}
                      >
                        <option value="Pending">Pending</option>
                        <option value="Paid">Paid</option>
                      </select>
                    </td>
                  </tr>
                ))}
                {(active.payments || []).length === 0 && (
                  <tr><td colSpan={4} className="py-8 text-center text-[#6A6A6A] text-[12.5px]">No payment records yet.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Activity */}
        <div className="bg-white border border-[#E9E3DA] rounded-2xl p-5 shadow-sm">
          <h3 className="text-[14px] font-extrabold text-[#111111] mb-4 flex items-center gap-2"><Clock size={15} />Activity</h3>
          <div className="flex flex-col gap-3 relative pl-3 border-l border-[#E9E3DA]">
            {(active.activity || []).slice(0, 10).map((a, i) => (
              <div key={i} className="relative text-[12.5px]">
                <span className="absolute -left-[15px] top-1 w-1.5 h-1.5 rounded-full bg-indigo-600" />
                <p className="text-[#111111] font-medium">{a.text}</p>
                <span className="text-[10.5px] text-[#6A6A6A] font-mono">{a.timestamp}</span>
              </div>
            ))}
            {(active.activity || []).length === 0 && <div className="text-[12px] text-[#6A6A6A] italic">No activity yet.</div>}
          </div>
        </div>

        {isPaymentOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
            <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl border border-[#E9E3DA] flex flex-col gap-4">
              <div className="flex items-center justify-between border-b border-[#E9E3DA] pb-3">
                <h3 className="text-[16px] font-extrabold text-[#111111]">Record Payment</h3>
                <button onClick={() => setIsPaymentOpen(false)} className="p-1 rounded-lg text-[#6A6A6A] hover:bg-[#F3F4F6] cursor-pointer"><X size={18} /></button>
              </div>
              <form onSubmit={handleAddPayment} className="flex flex-col gap-3">
                <Field label="Project (optional)"><input value={payProject} onChange={(e) => setPayProject(e.target.value)} className="gb-input2" /></Field>
                <div className="grid grid-cols-2 gap-3">
                  <Field label="Amount"><input type="number" required value={payAmount} onChange={(e) => setPayAmount(e.target.value)} className="gb-input2" /></Field>
                  <Field label="Date"><input type="date" value={payDate} onChange={(e) => setPayDate(e.target.value)} className="gb-input2" /></Field>
                </div>
                <Field label="Status">
                  <select value={payStatus} onChange={(e) => setPayStatus(e.target.value as any)} className="gb-input2">
                    <option value="Pending">Pending</option>
                    <option value="Paid">Paid</option>
                  </select>
                </Field>
                <Field label="Notes"><textarea value={payNotes} onChange={(e) => setPayNotes(e.target.value)} rows={2} className="gb-input2 resize-none" /></Field>
                <div className="flex items-center justify-end gap-3 pt-2 border-t border-[#E9E3DA]">
                  <button type="button" onClick={() => setIsPaymentOpen(false)} className="px-4 py-2 rounded-xl text-[13px] font-semibold text-[#6A6A6A] hover:bg-[#F3F4F6] cursor-pointer">Cancel</button>
                  <button type="submit" className="px-5 py-2.5 rounded-xl text-[13px] font-bold bg-[#111111] hover:bg-[#222222] text-white cursor-pointer">Save</button>
                </div>
              </form>
            </div>
          </div>
        )}

        {isFormOpen && <FreelancerFormModal form={form} setForm={setForm} onSubmit={handleSubmit} onClose={() => setIsFormOpen(false)} editing={!!editingId} />}
        <GBInputStyles />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 pb-16 select-none">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-[28px] font-extrabold tracking-tight text-[#111111] leading-none">Freelancers</h1>
          <p className="text-[13.5px] text-[#6A6A6A] mt-1.5 font-medium">Manage the people you hire and assign work to.</p>
        </div>
        <button onClick={openAddModal} className="flex items-center justify-center gap-2 bg-[#111111] hover:bg-[#222222] text-white px-5 py-2.5 rounded-xl text-[13px] font-bold transition-all shadow-sm cursor-pointer shrink-0">
          <HardHat size={16} /><span>Add Freelancer</span>
        </button>
      </div>

      <div className="bg-white border border-[#E9E3DA] rounded-2xl p-3.5 shadow-2xs flex flex-col md:flex-row items-stretch md:items-center gap-3">
        <div className="relative flex-1">
          <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#A8A296]" />
          <input
            type="text"
            placeholder="Search by name or skill..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full h-10 pl-10 pr-4 bg-[#FCFBF8] border border-[#E9E3DA] rounded-xl text-[13px] font-medium text-[#111111] outline-none focus:border-[#111111]"
          />
        </div>
        <select value={filterAvailability} onChange={(e) => setFilterAvailability(e.target.value)} className="h-10 px-3 bg-[#FCFBF8] border border-[#E9E3DA] rounded-xl text-[12px] font-bold text-[#111111] outline-none cursor-pointer">
          <option value="All">All Statuses</option>
          {AVAILABILITY_OPTIONS.map((a) => <option key={a} value={a}>{a}</option>)}
        </select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filtered.map((f) => (
          <div
            key={f._id}
            onClick={() => setActiveId(f._id)}
            className="bg-white border border-[#E9E3DA] rounded-[22px] p-5 shadow-2xs hover:shadow-md hover:-translate-y-0.5 transition-all cursor-pointer flex flex-col gap-4"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 text-white font-extrabold text-[14px] flex items-center justify-center shrink-0">
                  {f.name.substring(0, 2).toUpperCase()}
                </div>
                <div className="min-w-0">
                  <h3 className="text-[14.5px] font-extrabold text-[#111111] truncate">{f.name}</h3>
                  <span className="text-[11.5px] text-[#6A6A6A] block truncate">{f.specialization || "Freelancer"}</span>
                </div>
              </div>
              <span className={`shrink-0 px-2.5 py-1 rounded-full text-[10px] font-mono font-extrabold uppercase tracking-wider border ${STATUS_BADGE[f.status]}`}>{f.status}</span>
            </div>

            {(f.skills || []).length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                {f.skills!.slice(0, 4).map((s) => (
                  <span key={s} className="px-2 py-0.5 rounded text-[10.5px] font-bold bg-[#FCFBF8] border border-[#E9E3DA] text-[#111111]">{s}</span>
                ))}
              </div>
            )}

            <div className="grid grid-cols-3 gap-2 pt-3 border-t border-[#E9E3DA]/60 text-center font-mono">
              <div>
                <span className="text-[9.5px] text-[#6A6A6A] uppercase block">Active</span>
                <span className="text-[12px] font-bold text-indigo-600">{f.stats?.activeProjectsCount ?? 0}</span>
              </div>
              <div>
                <span className="text-[9.5px] text-[#6A6A6A] uppercase block">Done</span>
                <span className="text-[12px] font-bold text-emerald-600">{f.stats?.completedProjectsCount ?? 0}</span>
              </div>
              <div>
                <span className="text-[9.5px] text-[#6A6A6A] uppercase block">Pending ₹</span>
                <span className="text-[11px] font-bold text-rose-600">{formatCurrency(f.stats?.pendingPayment ?? 0)}</span>
              </div>
            </div>
          </div>
        ))}

        {filtered.length === 0 && (
          <div className="col-span-full py-20 text-center border border-dashed border-[#E9E3DA] bg-white rounded-[24px] text-[#6A6A6A] flex flex-col items-center justify-center gap-3">
            <HardHat className="text-[#A8A296]" size={40} />
            <h3 className="text-[16px] font-bold text-[#111111]">No freelancers found</h3>
            <p className="text-[13px] max-w-sm">Add freelancers to start assigning them to projects.</p>
          </div>
        )}
      </div>

      {isFormOpen && <FreelancerFormModal form={form} setForm={setForm} onSubmit={handleSubmit} onClose={() => setIsFormOpen(false)} editing={!!editingId} />}
      <GBInputStyles />
    </div>
  );
}

function StatCard({ label, value, color }: { label: string; value: string; color: string }) {
  const colorMap: Record<string, string> = {
    indigo: "text-indigo-600",
    emerald: "text-emerald-600",
    rose: "text-rose-600",
  };
  return (
    <div className="bg-white border border-[#E9E3DA] rounded-2xl p-4 shadow-sm">
      <span className="text-[10.5px] font-mono uppercase font-bold text-[#6A6A6A] block">{label}</span>
      <div className={`text-[20px] font-extrabold mt-1 ${colorMap[color] || "text-[#111111]"}`}>{value}</div>
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

function FreelancerFormModal({
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
      <div className="bg-white rounded-2xl p-6 max-w-2xl w-full shadow-2xl border border-[#E9E3DA] flex flex-col gap-5 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between border-b border-[#E9E3DA] pb-3">
          <h3 className="text-[16px] font-extrabold text-[#111111]">{editing ? "Edit Freelancer" : "Add Freelancer"}</h3>
          <button onClick={onClose} className="p-1 rounded-lg text-[#6A6A6A] hover:bg-[#F3F4F6] cursor-pointer"><X size={18} /></button>
        </div>
        <form onSubmit={onSubmit} className="flex flex-col gap-4">
          <div className="grid grid-cols-2 gap-3">
            <Field label="Name *"><input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="gb-input2" /></Field>
            <Field label="Specialization"><input value={form.specialization} onChange={(e) => setForm({ ...form, specialization: e.target.value })} className="gb-input2" /></Field>
            <Field label="Phone"><input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className="gb-input2" /></Field>
            <Field label="WhatsApp"><input value={form.whatsapp} onChange={(e) => setForm({ ...form, whatsapp: e.target.value })} className="gb-input2" /></Field>
            <Field label="Email"><input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="gb-input2" /></Field>
            <Field label="Location"><input value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} className="gb-input2" /></Field>
            <Field label="Experience"><input placeholder="e.g. 3 years" value={form.experience} onChange={(e) => setForm({ ...form, experience: e.target.value })} className="gb-input2" /></Field>
            <Field label="Portfolio / GitHub URL"><input value={form.portfolioUrl} onChange={(e) => setForm({ ...form, portfolioUrl: e.target.value })} className="gb-input2" /></Field>
            <Field label="Rate Type">
              <select value={form.rateType} onChange={(e) => setForm({ ...form, rateType: e.target.value as any })} className="gb-input2">
                <option value="Project">Project</option>
                <option value="Hourly">Hourly</option>
              </select>
            </Field>
            <Field label="Rate"><input type="number" value={form.rate} onChange={(e) => setForm({ ...form, rate: e.target.value })} className="gb-input2" /></Field>
            <Field label="Status">
              <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value as any })} className="gb-input2">
                {AVAILABILITY_OPTIONS.map((a) => <option key={a} value={a}>{a}</option>)}
              </select>
            </Field>
          </div>
          <Field label="Skills (comma separated)"><input value={form.skills} onChange={(e) => setForm({ ...form, skills: e.target.value })} className="gb-input2" placeholder="e.g. Next.js, Figma, SEO" /></Field>
          <Field label="Payment Details"><input value={form.paymentDetails} onChange={(e) => setForm({ ...form, paymentDetails: e.target.value })} className="gb-input2" placeholder="Bank / UPI details" /></Field>
          <Field label="Notes"><textarea value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} rows={3} className="gb-input2 resize-none" /></Field>
          <div className="flex items-center justify-end gap-3 pt-2 border-t border-[#E9E3DA]">
            <button type="button" onClick={onClose} className="px-4 py-2 rounded-xl text-[13px] font-semibold text-[#6A6A6A] hover:bg-[#F3F4F6] cursor-pointer">Cancel</button>
            <button type="submit" className="px-5 py-2.5 rounded-xl text-[13px] font-bold bg-[#111111] hover:bg-[#222222] text-white cursor-pointer">{editing ? "Save Changes" : "Add Freelancer"}</button>
          </div>
        </form>
      </div>
    </div>
  );
}

function GBInputStyles() {
  return (
    <style jsx global>{`
      .gb-input2 {
        background: #fcfbf8;
        border: 1px solid #e9e3da;
        border-radius: 0.75rem;
        padding: 0.55rem 0.75rem;
        font-size: 13px;
        color: #111111;
        outline: none;
        width: 100%;
      }
      .gb-input2:focus {
        border-color: #111111;
      }
    `}</style>
  );
}
