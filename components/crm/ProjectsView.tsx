"use client";

import React, { useState } from "react";
import { useCRM, CRMClient } from "./CRMProvider";
import { Briefcase, Clock, CheckCircle2, AlertCircle, ArrowUpRight, Plus, User } from "lucide-react";

export default function ProjectsView() {
  const { clients, setView, setActiveClientId } = useCRM();
  
  // Filter clients to those that have transitioned into projects (Agreement Signed and beyond)
  const projectClients = clients.filter(c => 
    ![
      "Lead Created", 
      "Discovery Call", 
      "Meeting Scheduled", 
      "Requirements Received", 
      "Proposal Generated", 
      "Quotation Generated", 
      "Client Approval", 
      "Agreement Generated"
    ].includes(c.stage)
  );

  const handleProjectClick = (id: string) => {
    setActiveClientId(id);
    setView("clients"); // opens the client detail workspace
  };

  const getStatusColor = (stage: CRMClient["stage"]) => {
    if (stage === "Project Completed") return "bg-emerald-50 text-emerald-600 border-emerald-100";
    if (stage === "Testing" || stage === "Client Review") return "bg-amber-50 text-amber-600 border-amber-100";
    return "bg-blue-50 text-blue-600 border-blue-100";
  };

  return (
    <div className="flex flex-col gap-6 pb-10 select-none">
      <div>
        <h2 className="text-[22px] font-extrabold text-[#111111] tracking-tight">Active Projects</h2>
        <p className="text-[13px] text-[#6A6A6A] mt-1">
          Monitor the delivery status, milestones, and progress of active client projects.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {projectClients.map((client) => {
          const completedTasks = client.tasks.filter(t => t.status === "Completed").length;
          const totalTasks = client.tasks.length;
          const pendingTasksCount = totalTasks - completedTasks;

          return (
            <div 
              key={client._id}
              onClick={() => handleProjectClick(client._id)}
              className="bg-white border border-[#E9E3DA] rounded-[24px] p-6 hover:border-[#111111] transition-all cursor-pointer shadow-sm group flex flex-col justify-between gap-6"
            >
              {/* Header block */}
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[#FCFBF8] border border-[#E9E3DA] flex items-center justify-center font-bold text-[13px] text-[#111111]">
                    {client.logo}
                  </div>
                  <div>
                    <h3 className="text-[15px] font-bold text-[#111111] flex items-center gap-1.5 leading-none">
                      <span>{client.company}</span>
                      <span className="text-[12px]">{client.countryFlag}</span>
                    </h3>
                    <span className="text-[11px] text-[#6A6A6A] block mt-1">{client.industry}</span>
                  </div>
                </div>
                <span className={`px-2.5 py-0.5 rounded text-[11px] border font-bold uppercase tracking-wider ${getStatusColor(client.stage)}`}>
                  {client.stage === "Project Created Automatically" ? "Initiating" : client.stage}
                </span>
              </div>

              {/* Progress bar */}
              <div>
                <div className="flex justify-between items-center text-[12px] font-bold text-[#111111] mb-2">
                  <span>Development Progress</span>
                  <span>{client.progress}%</span>
                </div>
                <div className="w-full h-2 bg-[#FCFBF8] border border-[#E9E3DA] rounded-full overflow-hidden">
                  <div 
                    className="h-full rounded-full bg-emerald-500 transition-all duration-500"
                    style={{ width: `${client.progress}%` }}
                  />
                </div>
              </div>

              {/* Project Stats and milestones */}
              <div className="grid grid-cols-3 gap-2 bg-[#FCFBF8] border border-[#E9E3DA] rounded-xl p-3.5 text-center">
                <div>
                  <span className="text-[10px] uppercase font-bold text-[#6A6A6A] block">Budget</span>
                  <span className="text-[13px] font-bold text-[#111111]">₹{(client.budget / 100000).toFixed(1)}L</span>
                </div>
                <div className="border-x border-[#E9E3DA]">
                  <span className="text-[10px] uppercase font-bold text-[#6A6A6A] block">Tasks Done</span>
                  <span className="text-[13px] font-bold text-[#111111]">{completedTasks}/{totalTasks}</span>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-[#6A6A6A] block">Lead Architect</span>
                  <span className="text-[13px] font-bold text-[#111111] truncate block px-1">{client.assignee.split(" ")[0]}</span>
                </div>
              </div>

              {/* Quick Tasks List / Next up */}
              <div className="border-t border-[#E9E3DA] pt-4 flex items-center justify-between">
                <div className="flex items-center gap-2 text-[12px] font-semibold text-[#6A6A6A]">
                  <Clock size={13} />
                  <span>Due: {client.expectedDelivery}</span>
                </div>
                <span className="text-[12px] font-bold text-[#111111] flex items-center gap-1 group-hover:text-emerald-600 transition-colors">
                  <span>Open Project Workspace</span>
                  <ArrowUpRight size={13} />
                </span>
              </div>
            </div>
          );
        })}

        {projectClients.length === 0 && (
          <div className="col-span-2 bg-[#FCFBF8] border border-[#E9E3DA] rounded-[24px] p-12 text-center text-[#6A6A6A]">
            <Briefcase className="mx-auto text-[#6A6A6A]/20 mb-3" size={40} />
            <p className="font-semibold">No active projects running yet.</p>
            <p className="text-[12px] text-[#6A6A6A]/80 mt-1">Move a lead client to "Agreement Signed" to launch a project automatically.</p>
          </div>
        )}
      </div>
    </div>
  );
}
