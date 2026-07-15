"use client";

import React, { useState } from "react";
import { useCRM, CRMClient, CRMInvoice } from "./CRMProvider";
import { IndianRupee, FileText, CheckCircle, Plus, Eye, Download, Search } from "lucide-react";

export default function InvoicesView() {
  const { clients, addInvoice, updateInvoiceStatus } = useCRM();
  const [filterStatus, setFilterStatus] = useState<string>("All");
  const [filterClient, setFilterClient] = useState<string>("All");

  // Local state for invoice creation form
  const [showAddModal, setShowAddModal] = useState(false);
  const [targetClientId, setTargetClientId] = useState("");
  const [invNum, setInvNum] = useState("");
  const [invAmount, setInvAmount] = useState("");
  const [invDueDate, setInvDueDate] = useState("");
  const [invDesc, setInvDesc] = useState("");

  // Local state for invoice PDF viewing mockup
  const [viewInvoice, setViewInvoice] = useState<{ client: CRMClient; invoice: CRMInvoice } | null>(null);

  interface ExtendedInvoice extends CRMInvoice {
    clientCompany: string;
    clientId: string;
    client: CRMClient;
  }

  const allInvoices: ExtendedInvoice[] = [];
  clients.forEach((c) => {
    if (c.invoices) {
      c.invoices.forEach((inv) => {
        allInvoices.push({
          ...inv,
          clientId: c._id,
          clientCompany: c.company,
          client: c,
        });
      });
    }
  });

  const filteredInvoices = allInvoices.filter(inv => {
    const matchesClient = filterClient === "All" || inv.clientId === filterClient;
    const matchesStatus = filterStatus === "All" || inv.status === filterStatus;
    return matchesClient && matchesStatus;
  });

  const handleCreateInvoice = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetClientId || !invAmount || !invDueDate) return;
    
    const countStr = Date.now().toString().slice(-4);
    const invoiceNumber = invNum || `GB-INV-${countStr}`;
    const amountNum = Number(invAmount);

    await addInvoice(targetClientId, {
      number: invoiceNumber,
      amount: amountNum,
      dueDate: invDueDate,
      status: "Pending",
      paidAmount: 0,
      items: [{ description: invDesc || "General services rendered", qty: 1, rate: amountNum }]
    });

    setInvNum("");
    setInvAmount("");
    setInvDueDate("");
    setInvDesc("");
    setShowAddModal(false);
  };

  const getStatusStyle = (status: CRMInvoice["status"]) => {
    if (status === "Paid") return "bg-emerald-50 text-emerald-600 border-emerald-100";
    if (status === "Pending") return "bg-amber-50 text-amber-600 border-amber-100";
    return "bg-red-50 text-red-600 border-red-100";
  };

  return (
    <div className="flex flex-col gap-6 pb-10 select-none">
      {/* Title Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h2 className="text-[22px] font-extrabold text-[#111111] tracking-tight">Billing & Invoices</h2>
          <p className="text-[13px] text-[#6A6A6A] mt-1">
            Track client payments, partial balances, and generate invoice documents.
          </p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#111111] text-white text-[12px] font-bold transition-all shadow-sm hover:bg-[#222222] cursor-pointer"
        >
          <Plus size={13} strokeWidth={2.5} />
          <span>New Invoice</span>
        </button>
      </div>

      {/* Filter tab row */}
      <div className="flex items-center gap-3 flex-wrap">
        <div className="flex items-center gap-1.5">
          {["All", "Paid", "Pending", "Overdue"].map((status) => (
            <button
              key={status}
              onClick={() => setFilterStatus(status)}
              className={`px-3 py-1.5 rounded-lg text-[12px] font-bold border transition-all cursor-pointer ${
                filterStatus === status
                  ? "bg-[#111111] border-[#111111] text-white"
                  : "bg-white border-[#E9E3DA] text-[#6A6A6A] hover:text-[#111111]"
              }`}
            >
              {status}
            </button>
          ))}
        </div>

        <select
          value={filterClient}
          onChange={(e) => setFilterClient(e.target.value)}
          className="bg-white border border-[#E9E3DA] rounded-lg px-3 py-1.5 text-[12px] font-bold text-[#6A6A6A] focus:outline-none"
        >
          <option value="All">All Clients</option>
          {clients.map(c => <option key={c._id} value={c._id}>{c.company}</option>)}
        </select>
      </div>

      {/* Invoices List Table */}
      <div className="bg-white border border-[#E9E3DA] rounded-2xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-[13px]">
            <thead>
              <tr className="border-b border-[#E9E3DA] bg-[#FCFBF8] text-[#6A6A6A] font-bold font-mono text-[10px] uppercase tracking-wider">
                <th className="p-4 pl-6">Invoice No.</th>
                <th className="p-4">Client Company</th>
                <th className="p-4">Due Date</th>
                <th className="p-4 text-right">Amount</th>
                <th className="p-4 text-right">Outstanding Balance</th>
                <th className="p-4 text-center">Status</th>
                <th className="p-4 pr-6 text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredInvoices.map((inv) => {
                const outstanding = inv.status === "Paid" ? 0 : inv.amount;
                return (
                  <tr key={inv._id} className="border-b border-[#E9E3DA] last:border-0 hover:bg-[#FCFBF8]/40 transition-colors">
                    <td className="p-4 pl-6 font-bold text-[#111111]">{inv.number}</td>
                    <td className="p-4 font-semibold text-[#111111]">{inv.clientCompany}</td>
                    <td className="p-4 font-mono text-[#6A6A6A] text-[11.5px]">{inv.dueDate}</td>
                    <td className="p-4 text-right font-bold text-[#111111]">₹{inv.amount.toLocaleString()}</td>
                    <td className="p-4 text-right font-bold text-red-500">₹{outstanding.toLocaleString()}</td>
                    <td className="p-4 text-center">
                      <span className={`px-2 py-0.5 rounded text-[10.5px] border font-bold ${getStatusStyle(inv.status)}`}>
                        {inv.status}
                      </span>
                    </td>
                    <td className="p-4 pr-6 text-center flex items-center justify-center gap-2">
                      <button 
                        onClick={() => setViewInvoice({ client: inv.client, invoice: inv })}
                        className="p-1.5 rounded-lg border border-[#E9E3DA] hover:border-[#111111] transition-all text-[#6A6A6A] hover:text-[#111111]"
                        title="View PDF Invoice"
                      >
                        <Eye size={13} />
                      </button>
                      {inv.status !== "Paid" && (
                        <button 
                          onClick={() => updateInvoiceStatus(inv.clientId, inv._id, "Paid")}
                          className="p-1.5 rounded-lg bg-emerald-50 text-emerald-600 border border-emerald-100 hover:bg-emerald-100 transition-all font-bold text-[10px]"
                          title="Mark Paid"
                        >
                          Mark Paid
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
              {filteredInvoices.length === 0 && (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-[#A8A296] italic">
                    No invoices found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Invoice PDF Mockup Viewer Modal */}
      {viewInvoice && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-[#E9E3DA] w-full max-w-2xl rounded-2xl p-8 shadow-2xl relative overflow-y-auto max-h-[90vh]">
            <button 
              onClick={() => setViewInvoice(null)}
              className="absolute right-4 top-4 px-2 py-1 bg-[#FCFBF8] border border-[#E9E3DA] hover:border-[#111111] rounded text-[11px] font-bold"
            >
              Close
            </button>
            
            {/* Invoice Layout */}
            <div className="flex flex-col gap-6 text-[#111111] select-text">
              <div className="flex justify-between items-start border-b border-[#E9E3DA] pb-6">
                <div>
                  <h1 className="text-[20px] font-extrabold tracking-tight">GROWTH BRIDGE OS</h1>
                  <span className="text-[11px] text-[#6A6A6A]">Fractional Next.js Engineering Studio, India</span>
                </div>
                <div className="text-right">
                  <h2 className="text-[16px] font-extrabold text-[#111111]">INVOICE</h2>
                  <span className="text-[12px] font-bold text-[#6A6A6A] font-mono">{viewInvoice.invoice.number}</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 text-[12.5px] leading-relaxed">
                <div>
                  <span className="text-[10px] uppercase font-bold text-[#A8A296] block mb-1">Billed To:</span>
                  <strong className="block text-[13.5px]">{viewInvoice.client.company}</strong>
                  <span>Attn: {viewInvoice.client.name}</span><br />
                  <span>Sector: {viewInvoice.client.industry}</span>
                </div>
                <div className="text-right">
                  <span className="text-[10px] uppercase font-bold text-[#A8A296] block mb-1">Invoice Details:</span>
                  <span>Issued Date: {new Date().toISOString().split("T")[0]}</span><br />
                  <span>Due Date: <strong>{viewInvoice.invoice.dueDate}</strong></span><br />
                  <span>Status: <strong className="text-emerald-600">{viewInvoice.invoice.status}</strong></span>
                </div>
              </div>

              {/* Items Table */}
              <div className="border border-[#E9E3DA] rounded-xl overflow-hidden mt-2 text-[12px]">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-[#FCFBF8] border-b border-[#E9E3DA] font-bold text-[#6A6A6A] font-mono text-[9px] uppercase">
                      <th className="p-3">Description</th>
                      <th className="p-3 text-center w-16">Qty</th>
                      <th className="p-3 text-right w-24">Rate</th>
                      <th className="p-3 text-right w-28">Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(viewInvoice.invoice.items || []).map((item, idx) => (
                      <tr key={idx} className="border-b border-[#E9E3DA] last:border-0">
                        <td className="p-3 font-semibold">{item.description}</td>
                        <td className="p-3 text-center">{item.qty}</td>
                        <td className="p-3 text-right">₹{item.rate.toLocaleString()}</td>
                        <td className="p-3 text-right font-bold">₹{(item.qty * item.rate).toLocaleString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Summary block */}
              <div className="flex justify-end mt-2 text-[13px]">
                <div className="w-64 flex flex-col gap-1.5">
                  <div className="flex justify-between">
                    <span className="text-[#6A6A6A]">Subtotal:</span>
                    <span className="font-bold">₹{viewInvoice.invoice.amount.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between border-t border-[#FCFBF8] pt-1">
                    <span className="text-[#6A6A6A]">GST (18% inclusive):</span>
                    <span className="font-bold">₹{Math.round(viewInvoice.invoice.amount * 0.18).toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between border-t border-[#E9E3DA] pt-2 text-[15px] font-extrabold">
                    <span>Total Due:</span>
                    <span>₹{viewInvoice.invoice.amount.toLocaleString()}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add Invoice Dialog */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-[#E9E3DA] w-full max-w-md rounded-2xl p-6 shadow-2xl relative">
            <h3 className="text-[16px] font-bold text-[#111111] mb-4">Create New Invoice</h3>
            <form onSubmit={handleCreateInvoice} className="flex flex-col gap-4">
              
              <div className="flex flex-col gap-1.5">
                <label className="text-[11px] font-bold text-[#6A6A6A] uppercase">Select Client</label>
                <select
                  required
                  value={targetClientId}
                  onChange={(e) => setTargetClientId(e.target.value)}
                  className="px-3 py-2 rounded-lg bg-[#FCFBF8] border border-[#E9E3DA] text-[13px] text-[#111111] focus:outline-none focus:border-[#111111]"
                >
                  <option value="">-- Choose Client --</option>
                  {clients.map(c => <option key={c._id} value={c._id}>{c.company}</option>)}
                </select>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[11px] font-bold text-[#6A6A6A] uppercase">Invoice Number (Optional)</label>
                <input
                  type="text"
                  placeholder="e.g. GB-INV-052"
                  value={invNum}
                  onChange={(e) => setInvNum(e.target.value)}
                  className="px-3.5 py-2 rounded-lg bg-[#FCFBF8] border border-[#E9E3DA] text-[13px] text-[#111111] focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[11px] font-bold text-[#6A6A6A] uppercase">Amount (INR)</label>
                  <input
                    type="number"
                    required
                    placeholder="e.g. 150000"
                    value={invAmount}
                    onChange={(e) => setInvAmount(e.target.value)}
                    className="px-3.5 py-2 rounded-lg bg-[#FCFBF8] border border-[#E9E3DA] text-[13px] text-[#111111] focus:outline-none"
                  />
                </div>
                
                <div className="flex flex-col gap-1.5">
                  <label className="text-[11px] font-bold text-[#6A6A6A] uppercase">Due Date</label>
                  <input
                    type="date"
                    required
                    value={invDueDate}
                    onChange={(e) => setInvDueDate(e.target.value)}
                    className="px-3 py-1.5 rounded-lg bg-[#FCFBF8] border border-[#E9E3DA] text-[13px] text-[#111111] focus:outline-none"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[11px] font-bold text-[#6A6A6A] uppercase">Billing Description</label>
                <textarea
                  placeholder="e.g. Milestone 2 Retainer (UI/UX Review Sign-off)"
                  value={invDesc}
                  onChange={(e) => setInvDesc(e.target.value)}
                  className="px-3.5 py-2 rounded-lg bg-[#FCFBF8] border border-[#E9E3DA] text-[13px] text-[#111111] focus:outline-none focus:border-[#111111] h-20 resize-none"
                />
              </div>

              <div className="flex items-center justify-end gap-3 mt-4 pt-4 border-t border-[#E9E3DA]">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 text-[13px] font-bold text-[#6A6A6A] hover:text-[#111111] transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-[#111111] text-white text-[13px] font-bold transition-all hover:bg-[#222222]"
                >
                  Create Invoice
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
