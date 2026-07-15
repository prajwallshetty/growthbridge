"use client";

import React, { useState } from "react";
import { useCRM, CRMClient } from "./CRMProvider";
import { ArrowUpRight } from "lucide-react";

export default function ClientsView() {
  const { clients, setView, setActiveClientId, searchQuery } = useCRM();
  const [filterStage, setFilterStage] = useState<string>("All");

  const handleRowClick = (id: string) => {
    setActiveClientId(id);
    setView("clients");
  };

  const getPriorityStyle = (p: CRMClient["priority"]) => {
    switch (p) {
      case "High":
        return "bg-red-50 text-red-600 border border-red-100";
      case "Medium":
        return "bg-amber-50 text-amber-600 border border-amber-100";
      case "Low":
        return "bg-emerald-50 text-emerald-600 border border-emerald-100";
      default:
        return "bg-gray-50 text-gray-500 border border-gray-150";
    }
  };

  const getStageStyle = (stage: CRMClient["stage"]) => {
    if (stage === "Project Completed") return "bg-emerald-50 text-emerald-600 border border-emerald-200";
    if (stage === "Lead Created") return "bg-gray-50 text-gray-500 border border-gray-200";
    return "bg-blue-50 text-blue-600 border border-blue-200";
  };

  const filteredClients = clients.filter((c) => {
    const matchesSearch =
      c.company.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.industry.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStage = filterStage === "All" || c.stage === filterStage;

    return matchesSearch && matchesStage;
  });

  return (
    <div className="flex flex-col gap-6 pb-10 select-none">
      {/* Header and stats */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h2 className="text-[22px] font-extrabold text-[#111111] tracking-tight leading-none">
            Client Directory
          </h2>
          <p className="text-[13px] text-[#6A6A6A] mt-1">
            Spreadsheet listing of all Growth Bridge partner companies.
          </p>
        </div>
      </div>

      {/* Filter Tabs / Quick filters */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-2 scrollbar-none">
        {["All", "Lead Created", "Advance Payment Received", "Development", "Project Completed", "Maintenance"].map((stage) => (
          <button
            key={stage}
            onClick={() => setFilterStage(stage)}
            className={`px-3 py-1.5 rounded-lg text-[12px] font-bold transition-all cursor-pointer ${
              filterStage === stage
                ? "bg-[#111111] text-white"
                : "bg-white border border-[#E9E3DA] text-[#6A6A6A] hover:text-[#111111]"
            }`}
          >
            {stage === "Project Completed" ? "Completed" : stage === "Advance Payment Received" ? "Advance Received" : stage === "Lead Created" ? "New Lead" : stage}
          </button>
        ))}
      </div>

      {/* Grid List Table */}
      <div className="bg-white rounded-2xl border border-[#E9E3DA] overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-[13px]">
            <thead>
              <tr className="border-b border-[#E9E3DA] bg-[#FCFBF8] text-[#6A6A6A] font-bold font-mono text-[10px] uppercase tracking-wider">
                <th className="p-4 pl-6">Company</th>
                <th className="p-4">Contact Person</th>
                <th className="p-4">Delivery Stage</th>
                <th className="p-4 text-right">Budget</th>
                <th className="p-4">Owner</th>
                <th className="p-4 text-center">Priority</th>
                <th className="p-4">Timeline Due</th>
                <th className="p-4 pr-6"></th>
              </tr>
            </thead>
            <tbody>
              {filteredClients.map((client) => (
                <tr
                  key={client._id}
                  onClick={() => handleRowClick(client._id)}
                  className="border-b border-[#E9E3DA] last:border-0 hover:bg-[#FCFBF8]/40 transition-colors cursor-pointer group"
                >
                  {/* Company Logo & Name */}
                  <td className="p-4 pl-6 flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-[#FCFBF8] border border-[#E9E3DA] flex items-center justify-center font-bold text-[11px] text-[#111111]">
                      {client.logo}
                    </div>
                    <div>
                      <div className="font-bold text-[#111111] flex items-center gap-1.5 leading-none">
                        <span>{client.company}</span>
                        <span className="text-[13px]">{client.countryFlag}</span>
                      </div>
                      <span className="text-[11px] text-[#6A6A6A] mt-1 block">{client.industry}</span>
                    </div>
                  </td>

                  {/* Contact */}
                  <td className="p-4 text-[#111111] font-semibold">{client.name}</td>

                  {/* Stage Progress badge */}
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <span className={`px-2 py-0.5 rounded text-[11.5px] font-bold ${getStageStyle(client.stage)}`}>
                        {client.stage}
                      </span>
                      <div className="w-16 h-1 rounded-full bg-[#E9E3DA] overflow-hidden hidden sm:block">
                        <div
                          className="h-full rounded-full bg-emerald-500"
                          style={{ width: `${client.progress}%` }}
                        />
                      </div>
                    </div>
                  </td>

                  {/* Budget */}
                  <td className="p-4 text-right font-bold text-[#111111]">
                    ₹{client.budget.toLocaleString()}
                  </td>

                  {/* Assignee */}
                  <td className="p-4 text-[#6A6A6A] font-medium">{client.assignee}</td>

                  {/* Priority */}
                  <td className="p-4 text-center">
                    <span className={`px-2.5 py-0.5 rounded-full text-[10.5px] font-bold ${getPriorityStyle(client.priority)}`}>
                      {client.priority}
                    </span>
                  </td>

                  {/* Expected Delivery */}
                  <td className="p-4 text-[#6A6A6A] font-mono text-[11.5px]">{client.expectedDelivery}</td>

                  {/* Action indicator */}
                  <td className="p-4 pr-6 text-right">
                    <ArrowUpRight
                      size={16}
                      className="text-[#6A6A6A] group-hover:text-black transition-all transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5 inline-block opacity-0 group-hover:opacity-100"
                    />
                  </td>
                </tr>
              ))}
              {filteredClients.length === 0 && (
                <tr>
                  <td colSpan={8} className="p-8 text-center text-[#6A6A6A] italic">
                    No clients found matching query.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
