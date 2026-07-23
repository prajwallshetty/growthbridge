"use client";

import React, { useState } from "react";
import { useCRM, CRMExpense } from "./CRMProvider";
import {
  Receipt,
  Plus,
  Search,
  Filter,
  Trash2,
  IndianRupee,
  Briefcase,
  Layers,
  ArrowDownRight,
  X,
} from "lucide-react";

export default function ExpensesView() {
  const { clients, financialStats, addExpense, deleteExpense, settings } = useCRM();

  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [selectedProject, setSelectedProject] = useState<string>("All");
  const [isAddOpen, setIsAddOpen] = useState(false);

  // Form state
  const [targetProjectId, setTargetProjectId] = useState<string>(clients[0]?._id || "");
  const [expenseName, setExpenseName] = useState("");
  const [category, setCategory] = useState("Material Cost");
  const [vendor, setVendor] = useState("");
  const [amount, setAmount] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("Bank Transfer");
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [notes, setNotes] = useState("");

  const formatCurrency = (val: number) => {
    const sym = settings.currency || "₹";
    return `${sym}${val.toLocaleString("en-IN")}`;
  };

  // Compile all expenses with project metadata
  const allExpenses: Array<CRMExpense & { projectId: string; company: string }> = [];
  clients.forEach((c) => {
    if (c.expenses && c.expenses.length > 0) {
      c.expenses.forEach((e) => {
        allExpenses.push({
          ...e,
          projectId: c._id,
          company: c.company,
        });
      });
    }
  });

  // Sort descending by date
  allExpenses.sort((a, b) => (b.date || "").localeCompare(a.date || ""));

  // Filter
  const filteredExpenses = allExpenses.filter((item) => {
    const matchSearch =
      item.name.toLowerCase().includes(search.toLowerCase()) ||
      (item.vendor || "").toLowerCase().includes(search.toLowerCase()) ||
      item.company.toLowerCase().includes(search.toLowerCase());

    const matchCategory = selectedCategory === "All" || item.category === selectedCategory;
    const matchProject = selectedProject === "All" || item.projectId === selectedProject;

    return matchSearch && matchCategory && matchProject;
  });

  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetProjectId || !expenseName || !amount) return;

    await addExpense(targetProjectId, {
      name: expenseName,
      category,
      vendor,
      amount: parseFloat(amount) || 0,
      paymentMethod,
      date,
      notes,
    });

    // Reset
    setExpenseName("");
    setVendor("");
    setAmount("");
    setNotes("");
    setIsAddOpen(false);
  };

  return (
    <div className="flex flex-col gap-6 pb-12 select-none">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h2 className="text-[24px] font-extrabold tracking-tight text-[#111111]">
            Global Expense Manager
          </h2>
          <p className="text-[13px] text-[#6A6A6A] mt-1">
            Track and monitor material costs, vendor payouts, and project expenses across all active accounts.
          </p>
        </div>
        <button
          onClick={() => {
            if (clients.length > 0) setTargetProjectId(clients[0]._id);
            setIsAddOpen(true);
          }}
          className="flex items-center gap-2 bg-red-600 text-white px-4 py-2.5 rounded-xl text-[13px] font-bold hover:bg-red-700 transition-all shadow-sm cursor-pointer"
        >
          <Plus size={15} />
          <span>Record New Expense</span>
        </button>
      </div>

      {/* Expense Stats Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white border border-[#E9E3DA] rounded-2xl p-5 shadow-sm">
          <span className="text-[10.5px] font-mono text-[#6A6A6A] uppercase font-bold">Total Project Expenses</span>
          <div className="text-[24px] font-extrabold text-red-600 tracking-tight mt-1">
            {formatCurrency(financialStats.totalExpenses)}
          </div>
          <span className="text-[11px] text-[#6A6A6A] block mt-1">Across {clients.length} projects</span>
        </div>

        <div className="bg-white border border-[#E9E3DA] rounded-2xl p-5 shadow-sm">
          <span className="text-[10.5px] font-mono text-[#6A6A6A] uppercase font-bold">Expenses This Month</span>
          <div className="text-[24px] font-extrabold text-[#111111] tracking-tight mt-1">
            {formatCurrency(financialStats.expensesThisMonth)}
          </div>
          <span className="text-[11px] text-red-600 font-semibold block mt-1">Current billing period</span>
        </div>

        <div className="bg-white border border-[#E9E3DA] rounded-2xl p-5 shadow-sm">
          <span className="text-[10.5px] font-mono text-[#6A6A6A] uppercase font-bold">Material Cost</span>
          <div className="text-[24px] font-extrabold text-[#111111] tracking-tight mt-1">
            {formatCurrency(financialStats.materialCost)}
          </div>
          <span className="text-[11px] text-[#6A6A6A] block mt-1">Direct project materials</span>
        </div>

        <div className="bg-white border border-[#E9E3DA] rounded-2xl p-5 shadow-sm">
          <span className="text-[10.5px] font-mono text-[#6A6A6A] uppercase font-bold">Miscellaneous Expenses</span>
          <div className="text-[24px] font-extrabold text-[#111111] tracking-tight mt-1">
            {formatCurrency(financialStats.miscExpenses)}
          </div>
          <span className="text-[11px] text-[#6A6A6A] block mt-1">Software, tools & vendors</span>
        </div>
      </div>

      {/* Filter & Search Toolbar */}
      <div className="bg-white border border-[#E9E3DA] p-4 rounded-2xl flex flex-wrap items-center justify-between gap-4 shadow-sm">
        <div className="flex items-center gap-3 flex-1 min-w-[240px]">
          <div className="relative flex-1">
            <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#9CA3AF]" />
            <input
              type="text"
              placeholder="Search expenses by title, vendor, or project..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-[#FCFBF8] border border-[#E9E3DA] rounded-xl pl-10 pr-4 py-2 text-[13px] text-[#111111] focus:outline-none focus:border-[#111111]"
            />
          </div>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          {/* Category Filter */}
          <div className="flex items-center gap-2">
            <Filter size={13} className="text-[#6A6A6A]" />
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="bg-[#FCFBF8] border border-[#E9E3DA] rounded-xl px-3 py-2 text-[12.5px] font-semibold text-[#111111] focus:outline-none"
            >
              <option value="All">All Categories</option>
              <option value="Material Cost">Material Cost</option>
              <option value="Miscellaneous Expenses">Miscellaneous Expenses</option>
              <option value="Vendor / Subcontractor">Vendor / Subcontractor</option>
              <option value="Software & Infrastructure">Software & Infrastructure</option>
            </select>
          </div>

          {/* Project Filter */}
          <select
            value={selectedProject}
            onChange={(e) => setSelectedProject(e.target.value)}
            className="bg-[#FCFBF8] border border-[#E9E3DA] rounded-xl px-3 py-2 text-[12.5px] font-semibold text-[#111111] focus:outline-none max-w-[200px]"
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

      {/* Expenses Table */}
      <div className="bg-white border border-[#E9E3DA] rounded-2xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-[13px]">
            <thead>
              <tr className="bg-[#FCFBF8] border-b border-[#E9E3DA] text-[11px] font-mono uppercase text-[#6A6A6A]">
                <th className="py-3.5 px-5 font-bold">Date</th>
                <th className="py-3.5 px-5 font-bold">Project</th>
                <th className="py-3.5 px-5 font-bold">Expense Title</th>
                <th className="py-3.5 px-5 font-bold">Category</th>
                <th className="py-3.5 px-5 font-bold">Vendor / Payee</th>
                <th className="py-3.5 px-5 font-bold">Method</th>
                <th className="py-3.5 px-5 font-bold text-right">Amount</th>
                <th className="py-3.5 px-5 font-bold text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E9E3DA]/60">
              {filteredExpenses.map((expense) => (
                <tr key={expense._id} className="hover:bg-[#FCFBF8] transition-colors">
                  <td className="py-3.5 px-5 font-mono text-[12px] text-[#6A6A6A]">
                    {expense.date}
                  </td>
                  <td className="py-3.5 px-5 font-bold text-[#111111]">
                    {expense.company}
                  </td>
                  <td className="py-3.5 px-5 font-medium text-[#111111]">
                    {expense.name}
                    {expense.notes && (
                      <span className="block text-[11px] text-[#6A6A6A] font-normal">{expense.notes}</span>
                    )}
                  </td>
                  <td className="py-3.5 px-5">
                    <span className="px-2.5 py-0.5 rounded text-[10.5px] font-bold bg-red-50 text-red-700 border border-red-100 font-mono uppercase">
                      {expense.category}
                    </span>
                  </td>
                  <td className="py-3.5 px-5 text-[#6A6A6A]">
                    {expense.vendor || "—"}
                  </td>
                  <td className="py-3.5 px-5 text-[#6A6A6A] font-mono text-[11.5px]">
                    {expense.paymentMethod}
                  </td>
                  <td className="py-3.5 px-5 text-right font-extrabold text-red-600">
                    {formatCurrency(expense.amount)}
                  </td>
                  <td className="py-3.5 px-5 text-center">
                    <button
                      onClick={() => deleteExpense(expense.projectId, expense._id)}
                      className="p-1.5 rounded-lg text-[#9CA3AF] hover:text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
                      title="Delete Expense Record"
                    >
                      <Trash2 size={15} />
                    </button>
                  </td>
                </tr>
              ))}

              {filteredExpenses.length === 0 && (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-[#6A6A6A]">
                    <Receipt className="mx-auto text-[#6A6A6A]/30 mb-2" size={32} />
                    <p className="font-bold">No expenses found matching filter criteria.</p>
                    <p className="text-[11px] mt-0.5">Click "Record New Expense" to add a cost item.</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Expense Modal */}
      {isAddOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl p-6 max-w-lg w-full shadow-2xl border border-[#E9E3DA] flex flex-col gap-5">
            <div className="flex items-center justify-between border-b border-[#E9E3DA] pb-3">
              <h3 className="text-[16px] font-extrabold text-[#111111]">Record Project Expense</h3>
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
                  <label className="text-[11px] font-mono uppercase font-bold text-[#6A6A6A]">Expense Title</label>
                  <input
                    type="text"
                    placeholder="e.g. Domain & Server Setup"
                    value={expenseName}
                    onChange={(e) => setExpenseName(e.target.value)}
                    className="bg-[#FCFBF8] border border-[#E9E3DA] rounded-xl p-2.5 text-[13px] text-[#111111]"
                    required
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-[11px] font-mono uppercase font-bold text-[#6A6A6A]">Category</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="bg-[#FCFBF8] border border-[#E9E3DA] rounded-xl p-2.5 text-[13px] text-[#111111]"
                  >
                    <option value="Material Cost">Material Cost</option>
                    <option value="Miscellaneous Expenses">Miscellaneous Expenses</option>
                    <option value="Vendor / Subcontractor">Vendor / Subcontractor</option>
                    <option value="Software & Infrastructure">Software & Infrastructure</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-1">
                  <label className="text-[11px] font-mono uppercase font-bold text-[#6A6A6A]">Amount ({settings.currency})</label>
                  <input
                    type="number"
                    placeholder="e.g. 15000"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="bg-[#FCFBF8] border border-[#E9E3DA] rounded-xl p-2.5 text-[13px] text-[#111111] font-mono font-bold"
                    required
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-[11px] font-mono uppercase font-bold text-[#6A6A6A]">Vendor / Payee</label>
                  <input
                    type="text"
                    placeholder="e.g. Vercel Inc"
                    value={vendor}
                    onChange={(e) => setVendor(e.target.value)}
                    className="bg-[#FCFBF8] border border-[#E9E3DA] rounded-xl p-2.5 text-[13px] text-[#111111]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-1">
                  <label className="text-[11px] font-mono uppercase font-bold text-[#6A6A6A]">Payment Method</label>
                  <select
                    value={paymentMethod}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    className="bg-[#FCFBF8] border border-[#E9E3DA] rounded-xl p-2.5 text-[13px] text-[#111111]"
                  >
                    <option value="Bank Transfer">Bank Transfer</option>
                    <option value="UPI">UPI</option>
                    <option value="Credit Card">Credit Card</option>
                    <option value="Cash">Cash</option>
                  </select>
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-[11px] font-mono uppercase font-bold text-[#6A6A6A]">Date</label>
                  <input
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="bg-[#FCFBF8] border border-[#E9E3DA] rounded-xl p-2.5 text-[13px] text-[#111111]"
                    required
                  />
                </div>
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-[11px] font-mono uppercase font-bold text-[#6A6A6A]">Notes</label>
                <input
                  type="text"
                  placeholder="Optional memo or transaction details..."
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
                  className="px-5 py-2.5 rounded-xl text-[13px] font-bold bg-red-600 hover:bg-red-700 text-white shadow-sm cursor-pointer"
                >
                  Save Expense
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
