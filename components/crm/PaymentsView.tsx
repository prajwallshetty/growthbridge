"use client";

import React, { useState, useMemo } from "react";
import { useCRM } from "./CRMProvider";
import { Wallet, Search, IndianRupee, Plus, X } from "lucide-react";

export default function PaymentsView() {
  const { allPayments, crmProjects, settings, addCRMProjectPayment } = useCRM();

  const [search, setSearch] = useState("");
  const [isRecordOpen, setIsRecordOpen] = useState(false);
  const [projectId, setProjectId] = useState("");
  const [amount, setAmount] = useState("");
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [reference, setReference] = useState("");
  const [notes, setNotes] = useState("");

  const formatCurrency = (val: number) => {
    const sym = settings.currency || "₹";
    return `${sym}${(val || 0).toLocaleString("en-IN")}`;
  };

  const filtered = useMemo(() => {
    return allPayments.filter((p) => {
      if (search.trim()) {
        const q = search.toLowerCase();
        return p.customer?.toLowerCase().includes(q) || p.projectName?.toLowerCase().includes(q) || p.referenceNumber?.toLowerCase().includes(q);
      }
      return true;
    });
  }, [allPayments, search]);

  const totalReceived = allPayments.reduce((s, p) => s + (p.amount || 0), 0);
  const totalPendingAcrossProjects = crmProjects.reduce((s, p) => s + (p.amountPending || 0), 0);

  const submitPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!projectId || !amount) return;
    await addCRMProjectPayment(projectId, { amount: parseFloat(amount) || 0, paymentDate: date, referenceNumber: reference, notes });
    setAmount("");
    setReference("");
    setNotes("");
    setIsRecordOpen(false);
  };

  return (
    <div className="flex flex-col gap-6 pb-16 select-none">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-[28px] font-extrabold tracking-tight text-[#111111] leading-none">Payments</h1>
          <p className="text-[13.5px] text-[#6A6A6A] mt-1.5 font-medium">Every payment recorded across all customer projects.</p>
        </div>
        <button onClick={() => setIsRecordOpen(true)} className="flex items-center justify-center gap-2 bg-[#111111] hover:bg-[#222222] text-white px-5 py-2.5 rounded-xl text-[13px] font-bold transition-all shadow-sm cursor-pointer shrink-0">
          <Plus size={16} /><span>Record Payment</span>
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="bg-white border border-[#E9E3DA] rounded-2xl p-5 shadow-sm">
          <span className="text-[10.5px] font-mono uppercase font-bold text-[#6A6A6A] block">Total Received</span>
          <div className="text-[24px] font-extrabold text-emerald-600 mt-1">{formatCurrency(totalReceived)}</div>
        </div>
        <div className="bg-white border border-[#E9E3DA] rounded-2xl p-5 shadow-sm">
          <span className="text-[10.5px] font-mono uppercase font-bold text-[#6A6A6A] block">Total Pending (Projects)</span>
          <div className="text-[24px] font-extrabold text-rose-600 mt-1">{formatCurrency(totalPendingAcrossProjects)}</div>
        </div>
      </div>

      <div className="bg-white border border-[#E9E3DA] rounded-2xl p-3.5 shadow-2xs">
        <div className="relative">
          <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#A8A296]" />
          <input
            type="text"
            placeholder="Search by customer, project, or reference..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full h-10 pl-10 pr-4 bg-[#FCFBF8] border border-[#E9E3DA] rounded-xl text-[13px] font-medium text-[#111111] outline-none focus:border-[#111111]"
          />
        </div>
      </div>

      <div className="bg-white border border-[#E9E3DA] rounded-[22px] overflow-hidden shadow-2xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#FCFBF8] border-b border-[#E9E3DA] text-[11px] font-mono uppercase text-[#6A6A6A] tracking-wider">
                <th className="py-3.5 px-5 font-bold">Date</th>
                <th className="py-3.5 px-5 font-bold">Customer</th>
                <th className="py-3.5 px-5 font-bold">Project</th>
                <th className="py-3.5 px-5 font-bold">Reference</th>
                <th className="py-3.5 px-5 font-bold">Method</th>
                <th className="py-3.5 px-5 font-bold text-right">Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E9E3DA]/60 text-[13px] font-semibold text-[#111111]">
              {filtered.map((p) => (
                <tr key={p._id} className="hover:bg-[#FCFBF8] transition-colors">
                  <td className="py-3.5 px-5 font-mono text-[12px]">{p.paymentDate}</td>
                  <td className="py-3.5 px-5 font-bold">{p.customer}</td>
                  <td className="py-3.5 px-5 text-[#6A6A6A]">{p.projectName}</td>
                  <td className="py-3.5 px-5 text-[#6A6A6A] font-mono text-[12px]">{p.referenceNumber || "—"}</td>
                  <td className="py-3.5 px-5 text-[#6A6A6A] font-mono text-[12px]">{p.paymentMethod || "—"}</td>
                  <td className="py-3.5 px-5 text-right font-extrabold text-emerald-700">{formatCurrency(p.amount)}</td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={6} className="py-16 text-center text-[#6A6A6A]">
                    <Wallet className="mx-auto text-[#A8A296] mb-2" size={32} />
                    <p className="font-bold text-[#111111]">No payments recorded yet</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {isRecordOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl border border-[#E9E3DA] flex flex-col gap-4">
            <div className="flex items-center justify-between border-b border-[#E9E3DA] pb-3">
              <h3 className="text-[16px] font-extrabold text-[#111111] flex items-center gap-2"><IndianRupee size={16} />Record Payment</h3>
              <button onClick={() => setIsRecordOpen(false)} className="p-1 rounded-lg text-[#6A6A6A] hover:bg-[#F3F4F6] cursor-pointer"><X size={18} /></button>
            </div>
            <form onSubmit={submitPayment} className="flex flex-col gap-3">
              <div className="flex flex-col gap-1">
                <label className="text-[11px] font-mono uppercase font-bold text-[#6A6A6A]">Project</label>
                <select required value={projectId} onChange={(e) => setProjectId(e.target.value)} className="gb-input5">
                  <option value="">Select project...</option>
                  {crmProjects.map((p) => (
                    <option key={p._id} value={p._id}>
                      {p.name} — {typeof p.customerId === "object" ? p.customerId.company : ""}
                    </option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-1">
                  <label className="text-[11px] font-mono uppercase font-bold text-[#6A6A6A]">Amount</label>
                  <input type="number" required value={amount} onChange={(e) => setAmount(e.target.value)} className="gb-input5" />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-[11px] font-mono uppercase font-bold text-[#6A6A6A]">Date</label>
                  <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="gb-input5" />
                </div>
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-[11px] font-mono uppercase font-bold text-[#6A6A6A]">Reference</label>
                <input value={reference} onChange={(e) => setReference(e.target.value)} className="gb-input5" />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-[11px] font-mono uppercase font-bold text-[#6A6A6A]">Notes</label>
                <textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={2} className="gb-input5 resize-none" />
              </div>
              <div className="flex items-center justify-end gap-3 pt-2 border-t border-[#E9E3DA]">
                <button type="button" onClick={() => setIsRecordOpen(false)} className="px-4 py-2 rounded-xl text-[13px] font-semibold text-[#6A6A6A] hover:bg-[#F3F4F6] cursor-pointer">Cancel</button>
                <button type="submit" className="px-5 py-2.5 rounded-xl text-[13px] font-bold bg-[#111111] hover:bg-[#222222] text-white cursor-pointer">Save Payment</button>
              </div>
            </form>
          </div>
        </div>
      )}

      <style jsx global>{`
        .gb-input5 {
          background: #fcfbf8;
          border: 1px solid #e9e3da;
          border-radius: 0.75rem;
          padding: 0.55rem 0.75rem;
          font-size: 13px;
          color: #111111;
          outline: none;
          width: 100%;
        }
        .gb-input5:focus {
          border-color: #111111;
        }
      `}</style>
    </div>
  );
}
