"use client";

import React, { useState } from "react";
import { useCRM, CRMClient } from "./CRMProvider";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowUpRight, Calendar, User2, CheckCircle, HelpCircle } from "lucide-react";

// Group 19 detailed stages into 5 clean, standard Kanban columns
const PHASES = [
  {
    id: "discovery",
    label: "Discovery & Leads",
    color: "bg-purple-500",
    stages: ["Lead Created", "Discovery Call", "Meeting Scheduled", "Requirements Received"],
    defaultStage: "Lead Created",
  },
  {
    id: "proposals",
    label: "Proposals & Contracts",
    color: "bg-amber-500",
    stages: ["Proposal Generated", "Quotation Generated", "Client Approval", "Agreement Generated"],
    defaultStage: "Proposal Generated",
  },
  {
    id: "staging",
    label: "Milestones & Setup",
    color: "bg-sky-500",
    stages: ["Advance Payment Received", "Project Created Automatically", "Design Phase"],
    defaultStage: "Advance Payment Received",
  },
  {
    id: "delivery",
    label: "Delivery & Dev",
    color: "bg-indigo-500",
    stages: ["Development", "Testing", "Client Review", "Deployment", "Final Payment"],
    defaultStage: "Development",
  },
  {
    id: "completed",
    label: "Completed & Retention",
    color: "bg-emerald-500",
    stages: ["Project Completed", "Maintenance", "Upsell"],
    defaultStage: "Project Completed",
  },
] as const;

export default function KanbanView() {
  const { clients, updateClientStage, setView, setActiveClientId } = useCRM();
  const [activeDragColumn, setActiveDragColumn] = useState<string | null>(null);

  const handleDragStart = (e: any, clientId: string) => {
    e.dataTransfer.setData("text/plain", clientId);
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDragOver = (e: React.DragEvent, columnId: string) => {
    e.preventDefault();
    if (activeDragColumn !== columnId) {
      setActiveDragColumn(columnId);
    }
  };

  const handleDragLeave = () => {
    setActiveDragColumn(null);
  };

  const handleDrop = (e: React.DragEvent, targetPhaseId: typeof PHASES[number]["id"]) => {
    e.preventDefault();
    const clientId = e.dataTransfer.getData("text/plain");
    const phase = PHASES.find((p) => p.id === targetPhaseId);
    if (clientId && phase) {
      const client = clients.find((c) => c._id === clientId);
      if (client) {
        // If the client's current stage is already inside the phase, keep it. Otherwise update to default.
        if (!(phase.stages as readonly string[]).includes(client.stage)) {
          updateClientStage(clientId, phase.defaultStage as any);
        }
      }
    }
    setActiveDragColumn(null);
  };

  const handleCardClick = (id: string) => {
    setActiveClientId(id);
    setView("clients");
  };

  const getPriorityColor = (p: CRMClient["priority"]) => {
    switch (p) {
      case "High":
        return "bg-red-50 text-red-600 border-red-200/60";
      case "Medium":
        return "bg-amber-50 text-amber-600 border-amber-200/60";
      case "Low":
        return "bg-emerald-50 text-emerald-600 border-emerald-200/60";
      default:
        return "bg-gray-50 text-gray-500 border-gray-200/60";
    }
  };

  const getStageTagColor = (stage: CRMClient["stage"]) => {
    if (["Lead Created", "Discovery Call"].includes(stage)) return "bg-purple-50 text-purple-600 border-purple-100";
    if (["Proposal Generated", "Client Approval"].includes(stage)) return "bg-amber-50 text-amber-600 border-amber-100";
    if (["Advance Payment Received", "Design Phase"].includes(stage)) return "bg-sky-50 text-sky-600 border-sky-100";
    if (["Development", "Testing"].includes(stage)) return "bg-indigo-50 text-indigo-600 border-indigo-100";
    return "bg-emerald-50 text-emerald-600 border-emerald-100";
  };

  return (
    <div className="flex flex-col h-[calc(100vh-140px)] select-none">
      {/* Header Info */}
      <div className="mb-6 shrink-0">
        <h2 className="text-[22px] font-extrabold text-[#111111] tracking-tight leading-none">
          Pipeline Kanban
        </h2>
        <p className="text-[13px] text-[#6A6A6A] mt-1">
          Drag and drop client cards across project phases to update their progress stages.
        </p>
      </div>

      {/* Kanban Board Container */}
      <div className="flex-1 grid grid-cols-1 md:grid-cols-5 gap-4 pb-4 overflow-hidden items-stretch h-full">
        {PHASES.map((phase) => {
          // Filter clients belonging to this phase's stages
          const phaseClients = clients.filter((c) => (phase.stages as readonly string[]).includes(c.stage));
          const isDragOver = activeDragColumn === phase.id;

          return (
            <div
              key={phase.id}
              onDragOver={(e) => handleDragOver(e, phase.id)}
              onDragLeave={handleDragLeave}
              onDrop={(e) => handleDrop(e, phase.id)}
              className={`rounded-[20px] flex flex-col transition-all duration-200 bg-[#FCFBF8] border min-w-0 ${
                isDragOver
                  ? "border-[#111111] bg-[#F7F6F0]"
                  : "border-[#E9E3DA]/80"
              }`}
            >
              {/* Column Header */}
              <div className="p-4 flex items-center justify-between border-b border-[#E9E3DA]/60 bg-white rounded-t-[20px]">
                <div className="flex items-center gap-2">
                  <span className={`w-2 h-2 rounded-full ${phase.color}`} />
                  <span className="text-[12.5px] font-bold text-[#111111] tracking-tight">
                    {phase.label}
                  </span>
                  <span className="px-2 py-0.5 rounded-full bg-[#FCFBF8] border border-[#E9E3DA] text-[10px] font-mono font-bold text-[#6A6A6A]">
                    {phaseClients.length}
                  </span>
                </div>
              </div>

              {/* Cards Scroll Container */}
              <div className="flex-1 p-3 overflow-y-auto flex flex-col gap-3 scrollbar-none min-h-0 bg-[#FCFBF8]/45">
                <AnimatePresence mode="popLayout">
                  {phaseClients.map((client) => (
                    <motion.div
                      key={client._id}
                      layoutId={`card-${client._id}`}
                      draggable
                      onDragStart={(e: any) => handleDragStart(e, client._id)}
                      onClick={() => handleCardClick(client._id)}
                      whileHover={{ y: -2 }}
                      transition={{ type: "spring", stiffness: 400, damping: 25 }}
                      className="bg-white rounded-xl p-4 border border-[#E9E3DA]/80 hover:border-[#111111] hover:shadow-[0_4px_16px_rgba(0,0,0,0.02)] transition-all cursor-grab active:cursor-grabbing flex flex-col gap-3 relative group"
                    >
                      {/* Priority, Flag & Logo */}
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-1.5">
                          {/* Flag */}
                          <span className="text-[13px]" title={client.company}>
                            {client.countryFlag}
                          </span>
                          {/* Priority */}
                          <span className={`text-[9px] px-2 py-0.5 rounded border font-bold uppercase tracking-wider ${getPriorityColor(client.priority)}`}>
                            {client.priority}
                          </span>
                        </div>

                        {/* Logo Circle */}
                        <div className="w-8 h-8 rounded-lg bg-[#FCFBF8] border border-[#E9E3DA]/80 flex items-center justify-center font-bold text-[11px] text-[#111111]">
                          {client.logo}
                        </div>
                      </div>

                      {/* Company Name & Stage Tag */}
                      <div>
                        <h4 className="text-[13.5px] font-bold text-[#111111] group-hover:text-black transition-colors leading-tight flex items-center gap-1">
                          <span>{client.company}</span>
                          <ArrowUpRight size={11} className="text-[#6A6A6A] opacity-0 group-hover:opacity-100 transition-opacity" />
                        </h4>
                        
                        {/* Micro-stage tag */}
                        <span className={`inline-block mt-2 px-2 py-0.5 rounded border text-[9.5px] font-semibold ${getStageTagColor(client.stage)}`}>
                          {client.stage}
                        </span>
                      </div>

                      {/* Progress bar */}
                      <div>
                        <div className="flex justify-between items-center text-[10px] mb-1 font-mono">
                          <span className="text-[#6A6A6A]">Progress</span>
                          <span className="text-[#111111] font-bold">{client.progress}%</span>
                        </div>
                        <div className="h-1.5 rounded-full bg-[#E9E3DA]/65 overflow-hidden">
                          <div
                            className="h-full rounded-full bg-emerald-500 transition-all duration-300"
                            style={{ width: `${client.progress}%` }}
                          />
                        </div>
                      </div>

                      {/* Card Footer */}
                      <div className="flex items-center justify-between border-t border-[#E9E3DA]/50 pt-3 mt-1 text-[11px] text-[#6A6A6A]">
                        <div className="flex items-center gap-1.5">
                          <User2 size={11} className="text-[#6A6A6A]" />
                          <span className="truncate max-w-[90px] font-bold">{client.assignee.split(" ")[0]}</span>
                        </div>

                        <span className="font-bold text-[#111111]">
                          ₹{(client.budget / 100000).toFixed(1)}L
                        </span>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>

                {/* Dashed Dragover dropzone card placeholder */}
                {isDragOver && (
                  <div className="border-2 border-dashed border-[#A8A296]/40 rounded-xl py-12 flex flex-col items-center justify-center text-[#6A6A6A]/60 text-[11.5px] bg-[#E9E3DA]/10 animate-pulse">
                    <CheckCircle size={16} className="mb-1.5" />
                    <span>Drop card to transition stage</span>
                  </div>
                )}

                {phaseClients.length === 0 && !isDragOver && (
                  <div className="border border-dashed border-[#E9E3DA] rounded-xl py-10 text-center text-[11px] text-[#6A6A6A] italic bg-white/20">
                    No leads in phase
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
