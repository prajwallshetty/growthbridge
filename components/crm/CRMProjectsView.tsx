"use client";

import React, { useState, useMemo } from "react";
import { useCRM, CRMProjectItem } from "./CRMProvider";
import {
  FolderKanban,
  Search,
  X,
  Trash2,
  Edit2,
  Plus,
  ArrowLeft,
  IndianRupee,
  Users,
  TrendingUp,
  Clock,
} from "lucide-react";

const STATUS_OPTIONS: CRMProjectItem["status"][] = ["Not Started", "In Progress", "On Hold", "Completed", "Cancelled"];

const STATUS_BADGE: Record<string, string> = {
  "Not Started": "bg-slate-100 text-slate-600 border-slate-200",
  "In Progress": "bg-[#111111] text-white border-[#111111]",
  "On Hold": "bg-amber-50 text-amber-700 border-amber-200",
  Completed: "bg-emerald-50 text-emerald-700 border-emerald-200",
  Cancelled: "bg-rose-50 text-rose-700 border-rose-200",
};

const emptyForm = {
  name: "",
  customerId: "",
  service: "",
  startDate: new Date().toISOString().split("T")[0],
  deadline: "",
  projectValue: "",
  status: "Not Started" as CRMProjectItem["status"],
  notes: "",
};

export default function CRMProjectsView() {
  const {
    crmProjects,
    clients,
    freelancers,
    settings,
    addCRMProject,
    updateCRMProject,
    deleteCRMProject,
    updateCRMProjectStatus,
    assignFreelancersToProject,
    addCRMProjectPayment,
    addCRMProjectExpense,
    setView,
    setActiveClientId,
  } = useCRM();

  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("All");
  const [filterCustomer, setFilterCustomer] = useState("All");
  const [activeId, setActiveId] = useState<string | null>(null);

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState({ ...emptyForm });

  const [isAssignOpen, setIsAssignOpen] = useState(false);
  const [assignments, setAssignments] = useState<{ freelancerId: string; agreedCost: string }[]>([]);

  const [isPaymentOpen, setIsPaymentOpen] = useState(false);
  const [payAmount, setPayAmount] = useState("");
  const [payDate, setPayDate] = useState(new Date().toISOString().split("T")[0]);
  const [payRef, setPayRef] = useState("");
  const [payNotes, setPayNotes] = useState("");

  const [isExpenseOpen, setIsExpenseOpen] = useState(false);
  const [expName, setExpName] = useState("");
  const [expAmount, setExpAmount] = useState("");
  const [expDate, setExpDate] = useState(new Date().toISOString().split("T")[0]);

  const formatCurrency = (val: number) => {
    const sym = settings.currency || "₹";
    return `${sym}${(val || 0).toLocaleString("en-IN")}`;
  };

  const customerName = (p: CRMProjectItem) => (typeof p.customerId === "object" ? p.customerId.company : clients.find((c) => c._id === p.customerId)?.company || "—");

  const filtered = useMemo(() => {
    return crmProjects.filter((p) => {
      if (filterStatus !== "All" && p.status !== filterStatus) return false;
      const custId = typeof p.customerId === "object" ? p.customerId._id : p.customerId;
      if (filterCustomer !== "All" && custId !== filterCustomer) return false;
      if (search.trim()) {
        const q = search.toLowerCase();
        const matches = p.name?.toLowerCase().includes(q) || customerName(p).toLowerCase().includes(q) || (p.service || "").toLowerCase().includes(q);
        if (!matches) return false;
      }
      return true;
    });
  }, [crmProjects, search, filterStatus, filterCustomer]);

  const active = crmProjects.find((p) => p._id === activeId) || null;

  const openAddModal = () => {
    setEditingId(null);
    setForm({ ...emptyForm, customerId: clients[0]?._id || "" });
    setIsFormOpen(true);
  };

  const openEditModal = (p: CRMProjectItem) => {
    setEditingId(p._id);
    setForm({
      name: p.name,
      customerId: typeof p.customerId === "object" ? p.customerId._id : p.customerId,
      service: p.service || "",
      startDate: p.startDate || "",
      deadline: p.deadline || "",
      projectValue: String(p.projectValue || ""),
      status: p.status,
      notes: p.notes || "",
    });
    setIsFormOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.customerId) return;
    const payload = { ...form, projectValue: parseFloat(form.projectValue) || 0 };
    if (editingId) {
      await updateCRMProject(editingId, payload as any);
    } else {
      await addCRMProject(payload as any);
    }
    setIsFormOpen(false);
  };

  const openAssignModal = () => {
    if (!active) return;
    setAssignments(
      (active.assignedFreelancers || []).map((af) => ({ freelancerId: af.freelancerId, agreedCost: String(af.agreedCost || "") }))
    );
    setIsAssignOpen(true);
  };

  const submitAssign = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!active) return;
    await assignFreelancersToProject(
      active._id,
      assignments.filter((a) => a.freelancerId).map((a) => ({ freelancerId: a.freelancerId, agreedCost: parseFloat(a.agreedCost) || 0 }))
    );
    setIsAssignOpen(false);
  };

  const submitPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!active || !payAmount) return;
    await addCRMProjectPayment(active._id, { amount: parseFloat(payAmount) || 0, paymentDate: payDate, referenceNumber: payRef, notes: payNotes });
    setPayAmount("");
    setPayRef("");
    setPayNotes("");
    setIsPaymentOpen(false);
  };

  const submitExpense = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!active || !expName || !expAmount) return;
    await addCRMProjectExpense(active._id, { name: expName, amount: parseFloat(expAmount) || 0, date: expDate });
    setExpName("");
    setExpAmount("");
    setIsExpenseOpen(false);
  };

  if (active) {
    return (
      <div className="flex flex-col gap-6 pb-16 select-none">
        <button onClick={() => setActiveId(null)} className="flex items-center gap-2 text-[13px] font-bold text-[#6A6A6A] hover:text-[#111111] cursor-pointer w-fit">
          <ArrowLeft size={15} /><span>Back to Projects</span>
        </button>

        <div className="bg-white border border-[#E9E3DA] rounded-[22px] p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-5">
          <div>
            <h2 className="text-[20px] font-extrabold text-[#111111]">{active.name}</h2>
            <button
              onClick={() => { setView("projects"); setActiveClientId(typeof active.customerId === "object" ? active.customerId._id : active.customerId); }}
              className="text-[12.5px] text-indigo-600 font-bold hover:underline mt-0.5"
            >
              Customer: {customerName(active)}
            </button>
            <div className="flex items-center gap-2 mt-2 flex-wrap">
              <select
                value={active.status}
                onChange={(e) => updateCRMProjectStatus(active._id, e.target.value as any)}
                className={`px-2.5 py-1 rounded-full text-[10px] font-mono font-extrabold uppercase tracking-wider border cursor-pointer ${STATUS_BADGE[active.status]}`}
              >
                {STATUS_OPTIONS.map((s) => <option key={s} value={s} className="bg-white text-black">{s}</option>)}
              </select>
              {active.service && <span className="px-2.5 py-1 rounded-lg text-[11px] font-bold bg-[#FCFBF8] border border-[#E9E3DA] text-[#111111]">{active.service}</span>}
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button onClick={() => openEditModal(active)} className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-[#E9E3DA] text-[#111111] hover:bg-[#FCFBF8] text-[12px] font-bold cursor-pointer">
              <Edit2 size={13} /><span>Edit</span>
            </button>
            <button
              onClick={() => { if (confirm(`Delete project ${active.name}?`)) { deleteCRMProject(active._id); setActiveId(null); } }}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-red-200 text-red-600 hover:bg-red-50 text-[12px] font-bold cursor-pointer"
            >
              <Trash2 size={13} /><span>Delete</span>
            </button>
          </div>
        </div>

        {/* Financial Breakdown */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatCard label="Project Value" value={formatCurrency(active.projectValue)} color="default" />
          <StatCard label="Freelancer Cost" value={formatCurrency(active.freelancerCost)} color="purple" />
          <StatCard label="Expenses" value={formatCurrency(active.totalExpenses || 0)} color="rose" />
          <StatCard label="Gross Profit" value={formatCurrency(active.grossProfit || 0)} color="emerald" />
          <StatCard label="Amount Received" value={formatCurrency(active.amountReceived || 0)} color="emerald" />
          <StatCard label="Amount Pending" value={formatCurrency(active.amountPending || 0)} color="rose" />
          <StatCard label="Start Date" value={active.startDate || "TBD"} color="default" />
          <StatCard label="Deadline" value={active.deadline || "TBD"} color="default" />
        </div>

        {/* Assigned Freelancers */}
        <div className="bg-white border border-[#E9E3DA] rounded-2xl p-5 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-[14px] font-extrabold text-[#111111] flex items-center gap-2"><Users size={15} />Assigned Freelancers</h3>
            <button onClick={openAssignModal} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#111111] text-white text-[12px] font-bold cursor-pointer">
              <Plus size={13} /><span>Assign</span>
            </button>
          </div>
          <div className="flex flex-wrap gap-2">
            {(active.assignedFreelancers || []).map((af) => (
              <span key={af.freelancerId} className="px-3 py-1.5 rounded-xl text-[12px] font-bold bg-[#FCFBF8] border border-[#E9E3DA] text-[#111111] flex items-center gap-1.5">
                {af.name} <span className="text-emerald-700 font-mono">{formatCurrency(af.agreedCost)}</span>
              </span>
            ))}
            {(active.assignedFreelancers || []).length === 0 && <span className="text-[12.5px] text-[#6A6A6A] italic">No freelancers assigned yet.</span>}
          </div>
        </div>

        {/* Payments */}
        <div className="bg-white border border-[#E9E3DA] rounded-2xl overflow-hidden shadow-sm">
          <div className="px-5 py-4 border-b border-[#E9E3DA] flex items-center justify-between">
            <h3 className="text-[14px] font-extrabold text-[#111111] flex items-center gap-2"><IndianRupee size={15} />Payments</h3>
            <button onClick={() => setIsPaymentOpen(true)} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#111111] text-white text-[12px] font-bold cursor-pointer">
              <Plus size={13} /><span>Record Payment</span>
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-[13px]">
              <thead>
                <tr className="bg-[#FCFBF8] border-b border-[#E9E3DA] text-[11px] font-mono uppercase text-[#6A6A6A]">
                  <th className="py-3 px-5 font-bold">Date</th>
                  <th className="py-3 px-5 font-bold">Reference</th>
                  <th className="py-3 px-5 font-bold">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E9E3DA]/60">
                {(active.payments || []).map((p: any) => (
                  <tr key={p._id}>
                    <td className="py-3 px-5 font-mono text-[12px]">{p.paymentDate}</td>
                    <td className="py-3 px-5 text-[#6A6A6A]">{p.referenceNumber || "—"}</td>
                    <td className="py-3 px-5 font-mono font-bold text-emerald-700">{formatCurrency(p.amount)}</td>
                  </tr>
                ))}
                {(active.payments || []).length === 0 && <tr><td colSpan={3} className="py-8 text-center text-[#6A6A6A] text-[12.5px]">No payments recorded yet.</td></tr>}
              </tbody>
            </table>
          </div>
        </div>

        {/* Expenses */}
        <div className="bg-white border border-[#E9E3DA] rounded-2xl overflow-hidden shadow-sm">
          <div className="px-5 py-4 border-b border-[#E9E3DA] flex items-center justify-between">
            <h3 className="text-[14px] font-extrabold text-[#111111] flex items-center gap-2"><TrendingUp size={15} />Expenses</h3>
            <button onClick={() => setIsExpenseOpen(true)} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#111111] text-white text-[12px] font-bold cursor-pointer">
              <Plus size={13} /><span>Add Expense</span>
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-[13px]">
              <thead>
                <tr className="bg-[#FCFBF8] border-b border-[#E9E3DA] text-[11px] font-mono uppercase text-[#6A6A6A]">
                  <th className="py-3 px-5 font-bold">Date</th>
                  <th className="py-3 px-5 font-bold">Name</th>
                  <th className="py-3 px-5 font-bold">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E9E3DA]/60">
                {(active.expenses || []).map((exp: any) => (
                  <tr key={exp._id}>
                    <td className="py-3 px-5 font-mono text-[12px]">{exp.date}</td>
                    <td className="py-3 px-5 text-[#111111] font-medium">{exp.name}</td>
                    <td className="py-3 px-5 font-mono font-bold text-rose-600">{formatCurrency(exp.amount)}</td>
                  </tr>
                ))}
                {(active.expenses || []).length === 0 && <tr><td colSpan={3} className="py-8 text-center text-[#6A6A6A] text-[12.5px]">No expenses recorded yet.</td></tr>}
              </tbody>
            </table>
          </div>
        </div>

        {active.notes && (
          <div className="bg-white border border-[#E9E3DA] rounded-2xl p-5 shadow-sm">
            <h3 className="text-[13px] font-extrabold text-[#111111] mb-1.5">Notes</h3>
            <p className="text-[13px] text-[#6A6A6A]">{active.notes}</p>
          </div>
        )}

        {/* Activity */}
        <div className="bg-white border border-[#E9E3DA] rounded-2xl p-5 shadow-sm">
          <h3 className="text-[14px] font-extrabold text-[#111111] mb-4 flex items-center gap-2"><Clock size={15} />Activity</h3>
          <div className="flex flex-col gap-3 relative pl-3 border-l border-[#E9E3DA]">
            {(active.activity || []).slice(0, 10).map((a: any, i: number) => (
              <div key={i} className="relative text-[12.5px]">
                <span className="absolute -left-[15px] top-1 w-1.5 h-1.5 rounded-full bg-indigo-600" />
                <p className="text-[#111111] font-medium">{a.text}</p>
                <span className="text-[10.5px] text-[#6A6A6A] font-mono">{a.timestamp}</span>
              </div>
            ))}
            {(active.activity || []).length === 0 && <div className="text-[12px] text-[#6A6A6A] italic">No activity yet.</div>}
          </div>
        </div>

        {isAssignOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
            <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl border border-[#E9E3DA] flex flex-col gap-4">
              <div className="flex items-center justify-between border-b border-[#E9E3DA] pb-3">
                <h3 className="text-[16px] font-extrabold text-[#111111]">Assign Freelancers</h3>
                <button onClick={() => setIsAssignOpen(false)} className="p-1 rounded-lg text-[#6A6A6A] hover:bg-[#F3F4F6] cursor-pointer"><X size={18} /></button>
              </div>
              <form onSubmit={submitAssign} className="flex flex-col gap-3">
                {assignments.map((a, idx) => (
                  <div key={idx} className="flex items-center gap-2">
                    <select
                      value={a.freelancerId}
                      onChange={(e) => setAssignments(assignments.map((x, i) => (i === idx ? { ...x, freelancerId: e.target.value } : x)))}
                      className="gb-input4 flex-1"
                    >
                      <option value="">Select freelancer...</option>
                      {freelancers.map((f) => <option key={f._id} value={f._id}>{f.name}</option>)}
                    </select>
                    <input
                      type="number"
                      placeholder="Cost"
                      value={a.agreedCost}
                      onChange={(e) => setAssignments(assignments.map((x, i) => (i === idx ? { ...x, agreedCost: e.target.value } : x)))}
                      className="gb-input4 w-28"
                    />
                    <button type="button" onClick={() => setAssignments(assignments.filter((_, i) => i !== idx))} className="p-1.5 text-rose-600 cursor-pointer">
                      <X size={16} />
                    </button>
                  </div>
                ))}
                <button
                  type="button"
                  onClick={() => setAssignments([...assignments, { freelancerId: "", agreedCost: "" }])}
                  className="text-[12px] font-bold text-indigo-600 hover:underline cursor-pointer text-left"
                >
                  + Add another freelancer
                </button>
                <div className="flex items-center justify-end gap-3 pt-2 border-t border-[#E9E3DA]">
                  <button type="button" onClick={() => setIsAssignOpen(false)} className="px-4 py-2 rounded-xl text-[13px] font-semibold text-[#6A6A6A] hover:bg-[#F3F4F6] cursor-pointer">Cancel</button>
                  <button type="submit" className="px-5 py-2.5 rounded-xl text-[13px] font-bold bg-[#111111] hover:bg-[#222222] text-white cursor-pointer">Save Assignment</button>
                </div>
              </form>
            </div>
          </div>
        )}

        {isPaymentOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
            <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl border border-[#E9E3DA] flex flex-col gap-4">
              <div className="flex items-center justify-between border-b border-[#E9E3DA] pb-3">
                <h3 className="text-[16px] font-extrabold text-[#111111]">Record Payment</h3>
                <button onClick={() => setIsPaymentOpen(false)} className="p-1 rounded-lg text-[#6A6A6A] hover:bg-[#F3F4F6] cursor-pointer"><X size={18} /></button>
              </div>
              <form onSubmit={submitPayment} className="flex flex-col gap-3">
                <div className="grid grid-cols-2 gap-3">
                  <Field label="Amount"><input type="number" required value={payAmount} onChange={(e) => setPayAmount(e.target.value)} className="gb-input4" /></Field>
                  <Field label="Date"><input type="date" value={payDate} onChange={(e) => setPayDate(e.target.value)} className="gb-input4" /></Field>
                </div>
                <Field label="Reference"><input value={payRef} onChange={(e) => setPayRef(e.target.value)} className="gb-input4" /></Field>
                <Field label="Notes"><textarea value={payNotes} onChange={(e) => setPayNotes(e.target.value)} rows={2} className="gb-input4 resize-none" /></Field>
                <div className="flex items-center justify-end gap-3 pt-2 border-t border-[#E9E3DA]">
                  <button type="button" onClick={() => setIsPaymentOpen(false)} className="px-4 py-2 rounded-xl text-[13px] font-semibold text-[#6A6A6A] hover:bg-[#F3F4F6] cursor-pointer">Cancel</button>
                  <button type="submit" className="px-5 py-2.5 rounded-xl text-[13px] font-bold bg-[#111111] hover:bg-[#222222] text-white cursor-pointer">Save</button>
                </div>
              </form>
            </div>
          </div>
        )}

        {isExpenseOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
            <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl border border-[#E9E3DA] flex flex-col gap-4">
              <div className="flex items-center justify-between border-b border-[#E9E3DA] pb-3">
                <h3 className="text-[16px] font-extrabold text-[#111111]">Add Expense</h3>
                <button onClick={() => setIsExpenseOpen(false)} className="p-1 rounded-lg text-[#6A6A6A] hover:bg-[#F3F4F6] cursor-pointer"><X size={18} /></button>
              </div>
              <form onSubmit={submitExpense} className="flex flex-col gap-3">
                <Field label="Name"><input required value={expName} onChange={(e) => setExpName(e.target.value)} className="gb-input4" /></Field>
                <div className="grid grid-cols-2 gap-3">
                  <Field label="Amount"><input type="number" required value={expAmount} onChange={(e) => setExpAmount(e.target.value)} className="gb-input4" /></Field>
                  <Field label="Date"><input type="date" value={expDate} onChange={(e) => setExpDate(e.target.value)} className="gb-input4" /></Field>
                </div>
                <div className="flex items-center justify-end gap-3 pt-2 border-t border-[#E9E3DA]">
                  <button type="button" onClick={() => setIsExpenseOpen(false)} className="px-4 py-2 rounded-xl text-[13px] font-semibold text-[#6A6A6A] hover:bg-[#F3F4F6] cursor-pointer">Cancel</button>
                  <button type="submit" className="px-5 py-2.5 rounded-xl text-[13px] font-bold bg-[#111111] hover:bg-[#222222] text-white cursor-pointer">Save</button>
                </div>
              </form>
            </div>
          </div>
        )}

        {isFormOpen && <ProjectFormModal form={form} setForm={setForm} onSubmit={handleSubmit} onClose={() => setIsFormOpen(false)} editing={!!editingId} clients={clients} />}
        <GBInputStyles />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 pb-16 select-none">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-[28px] font-extrabold tracking-tight text-[#111111] leading-none">Projects</h1>
          <p className="text-[13.5px] text-[#6A6A6A] mt-1.5 font-medium">Every project across all customers — value, freelancer cost, and profitability at a glance.</p>
        </div>
        <button onClick={openAddModal} className="flex items-center justify-center gap-2 bg-[#111111] hover:bg-[#222222] text-white px-5 py-2.5 rounded-xl text-[13px] font-bold transition-all shadow-sm cursor-pointer shrink-0">
          <Plus size={16} /><span>New Project</span>
        </button>
      </div>

      <div className="bg-white border border-[#E9E3DA] rounded-2xl p-3.5 shadow-2xs flex flex-col md:flex-row items-stretch md:items-center gap-3">
        <div className="relative flex-1">
          <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#A8A296]" />
          <input
            type="text"
            placeholder="Search projects by name, customer, or service..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full h-10 pl-10 pr-4 bg-[#FCFBF8] border border-[#E9E3DA] rounded-xl text-[13px] font-medium text-[#111111] outline-none focus:border-[#111111]"
          />
        </div>
        <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} className="h-10 px-3 bg-[#FCFBF8] border border-[#E9E3DA] rounded-xl text-[12px] font-bold text-[#111111] outline-none cursor-pointer">
          <option value="All">All Statuses</option>
          {STATUS_OPTIONS.map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
        <select value={filterCustomer} onChange={(e) => setFilterCustomer(e.target.value)} className="h-10 px-3 bg-[#FCFBF8] border border-[#E9E3DA] rounded-xl text-[12px] font-bold text-[#111111] outline-none cursor-pointer max-w-[200px]">
          <option value="All">All Customers</option>
          {clients.map((c) => <option key={c._id} value={c._id}>{c.company}</option>)}
        </select>
      </div>

      <div className="bg-white border border-[#E9E3DA] rounded-[22px] overflow-hidden shadow-2xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#FCFBF8] border-b border-[#E9E3DA] text-[11px] font-mono uppercase text-[#6A6A6A] tracking-wider">
                <th className="py-3.5 px-5 font-bold">Project</th>
                <th className="py-3.5 px-5 font-bold">Customer</th>
                <th className="py-3.5 px-5 font-bold">Freelancer(s)</th>
                <th className="py-3.5 px-5 font-bold">Value</th>
                <th className="py-3.5 px-5 font-bold">Received / Pending</th>
                <th className="py-3.5 px-5 font-bold">Status</th>
                <th className="py-3.5 px-5 font-bold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E9E3DA]/60 text-[13px] font-semibold text-[#111111]">
              {filtered.map((p) => (
                <tr key={p._id} onClick={() => setActiveId(p._id)} className="hover:bg-[#FCFBF8] transition-colors cursor-pointer">
                  <td className="py-3.5 px-5">
                    <div className="font-extrabold">{p.name}</div>
                    <div className="text-[11px] text-[#6A6A6A]">{p.service || "—"}</div>
                  </td>
                  <td className="py-3.5 px-5 text-[#6A6A6A] font-medium">{customerName(p)}</td>
                  <td className="py-3.5 px-5 text-[12px] text-[#6A6A6A]">
                    {(p.assignedFreelancers || []).map((af) => af.name).join(", ") || "—"}
                  </td>
                  <td className="py-3.5 px-5 font-mono font-extrabold">{formatCurrency(p.projectValue)}</td>
                  <td className="py-3.5 px-5 font-mono text-[12px]">
                    <span className="text-emerald-700 font-bold">{formatCurrency(p.amountReceived || 0)}</span>
                    <span className="text-[#A8A296]"> / </span>
                    <span className="text-rose-600 font-bold">{formatCurrency(p.amountPending || 0)}</span>
                  </td>
                  <td className="py-3.5 px-5">
                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-mono font-extrabold uppercase tracking-wider border ${STATUS_BADGE[p.status]}`}>{p.status}</span>
                  </td>
                  <td className="py-3.5 px-5 text-right" onClick={(e) => e.stopPropagation()}>
                    <div className="flex items-center justify-end gap-1.5">
                      <button onClick={() => openEditModal(p)} className="p-1.5 rounded-lg text-[#111111] hover:bg-[#111111]/5 cursor-pointer"><Edit2 size={15} /></button>
                      <button onClick={() => { if (confirm(`Delete project ${p.name}?`)) deleteCRMProject(p._id); }} className="p-1.5 rounded-lg text-rose-600 hover:bg-rose-50 cursor-pointer"><Trash2 size={15} /></button>
                    </div>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={7} className="py-16 text-center text-[#6A6A6A]">
                    <FolderKanban className="mx-auto text-[#A8A296] mb-2" size={32} />
                    <p className="font-bold text-[#111111]">No projects found</p>
                    <p className="text-[12px] mt-1">Create a project attached to a customer to start tracking.</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {isFormOpen && <ProjectFormModal form={form} setForm={setForm} onSubmit={handleSubmit} onClose={() => setIsFormOpen(false)} editing={!!editingId} clients={clients} />}
      <GBInputStyles />
    </div>
  );
}

function StatCard({ label, value, color }: { label: string; value: string; color: string }) {
  const colorMap: Record<string, string> = {
    purple: "text-purple-600",
    emerald: "text-emerald-600",
    rose: "text-rose-600",
    default: "text-[#111111]",
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

function ProjectFormModal({
  form,
  setForm,
  onSubmit,
  onClose,
  editing,
  clients,
}: {
  form: typeof emptyForm;
  setForm: (f: typeof emptyForm) => void;
  onSubmit: (e: React.FormEvent) => void;
  onClose: () => void;
  editing: boolean;
  clients: any[];
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl p-6 max-w-lg w-full shadow-2xl border border-[#E9E3DA] flex flex-col gap-5 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between border-b border-[#E9E3DA] pb-3">
          <h3 className="text-[16px] font-extrabold text-[#111111]">{editing ? "Edit Project" : "New Project"}</h3>
          <button onClick={onClose} className="p-1 rounded-lg text-[#6A6A6A] hover:bg-[#F3F4F6] cursor-pointer"><X size={18} /></button>
        </div>
        <form onSubmit={onSubmit} className="flex flex-col gap-4">
          <Field label="Project Name *"><input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="gb-input4" /></Field>
          <Field label="Customer *">
            <select required value={form.customerId} onChange={(e) => setForm({ ...form, customerId: e.target.value })} className="gb-input4">
              <option value="">Select customer...</option>
              {clients.map((c) => <option key={c._id} value={c._id}>{c.company}</option>)}
            </select>
          </Field>
          <Field label="Service"><input value={form.service} onChange={(e) => setForm({ ...form, service: e.target.value })} className="gb-input4" placeholder="e.g. Website Redesign" /></Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Start Date"><input type="date" value={form.startDate} onChange={(e) => setForm({ ...form, startDate: e.target.value })} className="gb-input4" /></Field>
            <Field label="Deadline"><input type="date" value={form.deadline} onChange={(e) => setForm({ ...form, deadline: e.target.value })} className="gb-input4" /></Field>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Project Value"><input type="number" value={form.projectValue} onChange={(e) => setForm({ ...form, projectValue: e.target.value })} className="gb-input4" /></Field>
            <Field label="Status">
              <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value as any })} className="gb-input4">
                {STATUS_OPTIONS.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
            </Field>
          </div>
          <Field label="Notes"><textarea value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} rows={3} className="gb-input4 resize-none" /></Field>
          <div className="flex items-center justify-end gap-3 pt-2 border-t border-[#E9E3DA]">
            <button type="button" onClick={onClose} className="px-4 py-2 rounded-xl text-[13px] font-semibold text-[#6A6A6A] hover:bg-[#F3F4F6] cursor-pointer">Cancel</button>
            <button type="submit" className="px-5 py-2.5 rounded-xl text-[13px] font-bold bg-[#111111] hover:bg-[#222222] text-white cursor-pointer">{editing ? "Save Changes" : "Create Project"}</button>
          </div>
        </form>
      </div>
    </div>
  );
}

function GBInputStyles() {
  return (
    <style jsx global>{`
      .gb-input4 {
        background: #fcfbf8;
        border: 1px solid #e9e3da;
        border-radius: 0.75rem;
        padding: 0.55rem 0.75rem;
        font-size: 13px;
        color: #111111;
        outline: none;
        width: 100%;
      }
      .gb-input4:focus {
        border-color: #111111;
      }
    `}</style>
  );
}
