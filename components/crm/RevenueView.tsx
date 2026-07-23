"use client";

import React, { useState } from "react";
import { useCRM, CRMPayment } from "./CRMProvider";
import {
  IndianRupee,
  Plus,
  Search,
  Filter,
  Trash2,
  TrendingUp,
  CheckCircle2,
  Clock,
  X,
  CreditCard,
} from "lucide-react";

export default function RevenueView() {
  const { clients, financialStats, addPayment, deletePayment, settings } = useCRM();

  const [search, setSearch] = useState("");
  const [selectedProject, setSelectedProject] = useState<string>("All");
  const [isAddOpen, setIsAddOpen] = useState(false);

  // Form state
  const [targetProjectId, setTargetProjectId] = useState<string>(clients[0]?._id || "");
  const [amount, setAmount] = useState("");
  const [paymentDate, setPaymentDate] = useState(new Date().toISOString().split("T")[0]);
  const [referenceNumber, setReferenceNumber] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("Bank Transfer");
  const [notes, setNotes] = useState("");

  const formatCurrency = (val: number) => {
    const sym = settings.currency || "₹";
    return `${sym}${val.toLocaleString("en-IN")}`;
  };

  // Compile all payments with project metadata
  const allPayments: Array<CRMPayment & { projectId: string; company: string; name: string }> = [];
  clients.forEach((c) => {
    if (c.payments && c.payments.length > 0) {
      c.payments.forEach((p) => {
        allPayments.push({
          ...p,
          projectId: c._id,
          company: c.company,
          name: c.name,
        });
      });
    }
  });

  // Sort descending by payment date
  allPayments.sort((a, b) => (b.paymentDate || "").localeCompare(a.paymentDate || ""));

  // Filter
  const filteredPayments = allPayments.filter((item) => {
    const matchSearch =
      (item.referenceNumber || "").toLowerCase().includes(search.toLowerCase()) ||
      item.company.toLowerCase().includes(search.toLowerCase()) ||
      item.name.toLowerCase().includes(search.toLowerCase());

    const matchProject = selectedProject === "All" || item.projectId === selectedProject;

    return matchSearch && matchProject;
  });

  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetProjectId || !amount) return;

    await addPayment(targetProjectId, {
      amount: parseFloat(amount) || 0,
      paymentDate,
      referenceNumber,
      paymentMethod,
      notes,
    });

    // Reset
    setAmount("");
    setReferenceNumber("");
    setNotes("");
    setIsAddOpen(false);
  };

  return (
    <div className="flex flex-col gap-6 pb-12 select-none">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h2 className="text-[24px] font-extrabold tracking-tight text-[#111111]">
            Revenue & Client Payments
          </h2>
          <p className="text-[13px] text-[#6A6A6A] mt-1">
            Monitor incoming client payment transactions, retainers, and outstanding project balances.
          </p>
        </div>
        <button
          onClick={() => {
            if (clients.length > 0) setTargetProjectId(clients[0]._id);
            setIsAddOpen(true);
          }}
          className="flex items-center gap-2 bg-emerald-600 text-white px-4 py-2.5 rounded-xl text-[13px] font-bold hover:bg-emerald-700 transition-all shadow-sm cursor-pointer"
        >
          <Plus size={15} />
          <span>Record New Payment</span>
        </button>
      </div>

      {/* Revenue Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white border border-[#E9E3DA] rounded-2xl p-5 shadow-sm">
          <span className="text-[10.5px] font-mono text-[#6A6A6A] uppercase font-bold">Total Revenue Generated</span>
          <div className="text-[24px] font-extrabold text-emerald-600 tracking-tight mt-1">
            {formatCurrency(financialStats.totalRevenue)}
          </div>
          <span className="text-[11px] text-[#6A6A6A] block mt-1">Gross received revenue</span>
        </div>

        <div className="bg-white border border-[#E9E3DA] rounded-2xl p-5 shadow-sm">
          <span className="text-[10.5px] font-mono text-[#6A6A6A] uppercase font-bold">Revenue This Month</span>
          <div className="text-[24px] font-extrabold text-[#111111] tracking-tight mt-1">
            {formatCurrency(financialStats.revenueThisMonth)}
          </div>
          <span className="text-[11px] text-emerald-600 font-semibold block mt-1">Current calendar month</span>
        </div>

        <div className="bg-white border border-[#E9E3DA] rounded-2xl p-5 shadow-sm">
          <span className="text-[10.5px] font-mono text-[#6A6A6A] uppercase font-bold">Amount Received</span>
          <div className="text-[24px] font-extrabold text-[#111111] tracking-tight mt-1">
            {formatCurrency(financialStats.amountReceived)}
          </div>
          <span className="text-[11px] text-[#6A6A6A] block mt-1">Cleared in bank account</span>
        </div>

        <div className="bg-white border border-[#E9E3DA] rounded-2xl p-5 shadow-sm">
          <span className="text-[10.5px] font-mono text-[#6A6A6A] uppercase font-bold">Outstanding Payments</span>
          <div className="text-[24px] font-extrabold text-red-600 tracking-tight mt-1">
            {formatCurrency(financialStats.outstandingPayments)}
          </div>
          <span className="text-[11px] text-red-600 font-semibold block mt-1">Pending client release</span>
        </div>
      </div>

      {/* Partner Revenue Split (50/50) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="bg-[#FCFBF8] border border-[#E9E3DA] rounded-2xl p-5 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-[10.5px] font-mono text-[#6A6A6A] uppercase font-bold">
              {financialStats.partner1.name} Share ({financialStats.partner1.sharePct}%)
            </span>
            <div className="text-[20px] font-extrabold text-[#111111] tracking-tight mt-1">
              {formatCurrency(financialStats.partner1.revenueShare)}
            </div>
            <span className="text-[11px] text-[#6A6A6A] block mt-0.5 font-medium">Revenue allocation</span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-100 flex items-center justify-center font-bold text-[13px]">
            {financialStats.partner1.name.substring(0, 2).toUpperCase()}
          </div>
        </div>

        <div className="bg-[#FCFBF8] border border-[#E9E3DA] rounded-2xl p-5 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-[10.5px] font-mono text-[#6A6A6A] uppercase font-bold">
              {financialStats.partner2.name} Share ({financialStats.partner2.sharePct}%)
            </span>
            <div className="text-[20px] font-extrabold text-[#111111] tracking-tight mt-1">
              {formatCurrency(financialStats.partner2.revenueShare)}
            </div>
            <span className="text-[11px] text-[#6A6A6A] block mt-0.5 font-medium">Revenue allocation</span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-100 flex items-center justify-center font-bold text-[13px]">
            {financialStats.partner2.name.substring(0, 2).toUpperCase()}
          </div>
        </div>
      </div>

      {/* Search & Filter Toolbar */}
      <div className="bg-white border border-[#E9E3DA] p-4 rounded-2xl flex flex-wrap items-center justify-between gap-4 shadow-sm">
        <div className="flex items-center gap-3 flex-1 min-w-[240px]">
          <div className="relative flex-1">
            <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#9CA3AF]" />
            <input
              type="text"
              placeholder="Search by client, project, or reference number..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-[#FCFBF8] border border-[#E9E3DA] rounded-xl pl-10 pr-4 py-2 text-[13px] text-[#111111] focus:outline-none focus:border-[#111111]"
            />
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Filter size={13} className="text-[#6A6A6A]" />
          <select
            value={selectedProject}
            onChange={(e) => setSelectedProject(e.target.value)}
            className="bg-[#FCFBF8] border border-[#E9E3DA] rounded-xl px-3 py-2 text-[12.5px] font-semibold text-[#111111] focus:outline-none"
          >
            <option value="All">All Projects</option>
            {clients.map((c) => (
              <option key={c._id} value={c._id}>
                {c.company}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Revenue Payments Table */}
      <div className="bg-white border border-[#E9E3DA] rounded-2xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-[13px]">
            <thead>
              <tr className="bg-[#FCFBF8] border-b border-[#E9E3DA] text-[11px] font-mono uppercase text-[#6A6A6A]">
                <th className="py-3.5 px-5 font-bold">Payment Date</th>
                <th className="py-3.5 px-5 font-bold">Project / Client</th>
                <th className="py-3.5 px-5 font-bold">Reference No.</th>
                <th className="py-3.5 px-5 font-bold">Method</th>
                <th className="py-3.5 px-5 font-bold">Notes</th>
                <th className="py-3.5 px-5 font-bold text-right">Amount Received</th>
                <th className="py-3.5 px-5 font-bold text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E9E3DA]/60">
              {filteredPayments.map((payment) => (
                <tr key={payment._id} className="hover:bg-[#FCFBF8] transition-colors">
                  <td className="py-3.5 px-5 font-mono text-[12px] text-[#6A6A6A]">
                    {payment.paymentDate}
                  </td>
                  <td className="py-3.5 px-5">
                    <div className="font-bold text-[#111111]">{payment.company}</div>
                    <span className="text-[11px] text-[#6A6A6A]">{payment.name}</span>
                  </td>
                  <td className="py-3.5 px-5 font-mono text-[12px] text-[#111111]">
                    {payment.referenceNumber ? (
                      <span className="px-2 py-0.5 rounded bg-slate-100 font-bold border border-slate-200">
                        {payment.referenceNumber}
                      </span>
                    ) : (
                      "N/A"
                    )}
                  </td>
                  <td className="py-3.5 px-5 text-[#6A6A6A] font-mono text-[11.5px]">
                    {payment.paymentMethod}
                  </td>
                  <td className="py-3.5 px-5 text-[#6A6A6A]">
                    {payment.notes || "—"}
                  </td>
                  <td className="py-3.5 px-5 text-right font-extrabold text-emerald-600">
                    +{formatCurrency(payment.amount)}
                  </td>
                  <td className="py-3.5 px-5 text-center">
                    <button
                      onClick={() => deletePayment(payment.projectId, payment._id)}
                      className="p-1.5 rounded-lg text-[#9CA3AF] hover:text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
                      title="Delete Payment Record"
                    >
                      <Trash2 size={15} />
                    </button>
                  </td>
                </tr>
              ))}

              {filteredPayments.length === 0 && (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-[#6A6A6A]">
                    <IndianRupee className="mx-auto text-[#6A6A6A]/30 mb-2" size={32} />
                    <p className="font-bold">No payment transaction records found.</p>
                    <p className="text-[11px] mt-0.5">Click "Record New Payment" to log a client transfer.</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Payment Modal */}
      {isAddOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl p-6 max-w-lg w-full shadow-2xl border border-[#E9E3DA] flex flex-col gap-5">
            <div className="flex items-center justify-between border-b border-[#E9E3DA] pb-3">
              <h3 className="text-[16px] font-extrabold text-[#111111]">Record Client Payment</h3>
              <button
                onClick={() => setIsAddOpen(false)}
                className="p-1 rounded-lg text-[#6A6A6A] hover:bg-[#F3F4F6]"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleAddSubmit} className="flex flex-col gap-4">
              <div className="flex flex-col gap-1">
                <label className="text-[11px] font-mono uppercase font-bold text-[#6A6A6A]">Select Project</label>
                <select
                  value={targetProjectId}
                  onChange={(e) => setTargetProjectId(e.target.value)}
                  className="bg-[#FCFBF8] border border-[#E9E3DA] rounded-xl p-2.5 text-[13px] font-bold text-[#111111]"
                  required
                >
                  {clients.map((c) => (
                    <option key={c._id} value={c._id}>
                      {c.company} ({c.name})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-1">
                  <label className="text-[11px] font-mono uppercase font-bold text-[#6A6A6A]">Amount ({settings.currency})</label>
                  <input
                    type="number"
                    placeholder="e.g. 150000"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="bg-[#FCFBF8] border border-[#E9E3DA] rounded-xl p-2.5 text-[13px] text-[#111111] font-mono font-bold"
                    required
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-[11px] font-mono uppercase font-bold text-[#6A6A6A]">Payment Date</label>
                  <input
                    type="date"
                    value={paymentDate}
                    onChange={(e) => setPaymentDate(e.target.value)}
                    className="bg-[#FCFBF8] border border-[#E9E3DA] rounded-xl p-2.5 text-[13px] text-[#111111]"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-1">
                  <label className="text-[11px] font-mono uppercase font-bold text-[#6A6A6A]">Reference Number / UTR</label>
                  <input
                    type="text"
                    placeholder="e.g. UTR9842107482"
                    value={referenceNumber}
                    onChange={(e) => setReferenceNumber(e.target.value)}
                    className="bg-[#FCFBF8] border border-[#E9E3DA] rounded-xl p-2.5 text-[13px] text-[#111111] font-mono"
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-[11px] font-mono uppercase font-bold text-[#6A6A6A]">Payment Method</label>
                  <select
                    value={paymentMethod}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    className="bg-[#FCFBF8] border border-[#E9E3DA] rounded-xl p-2.5 text-[13px] text-[#111111]"
                  >
                    <option value="Bank Transfer">Bank Transfer</option>
                    <option value="UPI">UPI</option>
                    <option value="Wire Transfer">Wire Transfer</option>
                    <option value="Credit Card">Credit Card</option>
                    <option value="Cheque">Cheque</option>
                  </select>
                </div>
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-[11px] font-mono uppercase font-bold text-[#6A6A6A]">Notes</label>
                <input
                  type="text"
                  placeholder="e.g. Milestone 1 Advance (35%)"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="bg-[#FCFBF8] border border-[#E9E3DA] rounded-xl p-2.5 text-[13px] text-[#111111]"
                />
              </div>

              <div className="flex justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setIsAddOpen(false)}
                  className="px-4 py-2.5 rounded-xl text-[13px] font-bold text-[#6A6A6A] hover:bg-[#F3F4F6]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl text-[13px] font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm cursor-pointer"
                >
                  Record Payment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
