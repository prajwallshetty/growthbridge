"use client";

import React, { useState } from "react";
import { useCRM, CRMClient, CRMProposal } from "./CRMProvider";
import { generateAIDocument } from "@/lib/actions/crm";
import { FileText, Eye, Edit3, Send, CheckCircle, Sparkles, Plus, AlertCircle } from "lucide-react";

export default function ProposalsView() {
  const { clients, saveDocument, updateClientStage } = useCRM();
  
  // Local state for proposal generation
  const [showAddModal, setShowAddModal] = useState(false);
  const [targetClientId, setTargetClientId] = useState("");
  const [proposalTitle, setProposalTitle] = useState("");
  
  // AI generation loading status
  const [generating, setGenerating] = useState(false);
  const [aiPrompt, setAiPrompt] = useState("");

  // Editor states
  const [editingProp, setEditingProp] = useState<{ client: CRMClient; proposal: CRMProposal } | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editBlocks, setEditBlocks] = useState<string[]>([]);

  interface ExtendedProposal extends CRMProposal {
    clientCompany: string;
    clientId: string;
    client: CRMClient;
  }

  const allProposals: ExtendedProposal[] = [];
  clients.forEach((c) => {
    if (c.proposals) {
      c.proposals.forEach((prop) => {
        allProposals.push({
          ...prop,
          clientId: c._id,
          clientCompany: c.company,
          client: c,
        });
      });
    }
  });

  const handleCreateProposal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetClientId || !proposalTitle) return;

    let contentBlocks = [
      "Executive Summary: Introduction to requirements.",
      "Scope of Work: Initial design review and architecture mapping.",
      "Timeline: Milestone deliveries estimated within 90 days."
    ];

    if (aiPrompt.trim()) {
      setGenerating(true);
      try {
        const text = await generateAIDocument(targetClientId, "proposal", aiPrompt);
        contentBlocks = text.split("\n\n").filter(block => block.trim() !== "");
      } catch (err) {
        console.error(err);
      } finally {
        setGenerating(false);
      }
    }

    await saveDocument(targetClientId, "proposal", {
      title: proposalTitle,
      contentBlocks,
      status: "Draft",
      version: 1
    });

    setProposalTitle("");
    setAiPrompt("");
    setTargetClientId("");
    setShowAddModal(false);
  };

  const handleOpenEditor = (extendedProp: ExtendedProposal) => {
    setEditingProp({ client: extendedProp.client, proposal: extendedProp });
    setEditTitle(extendedProp.title);
    setEditBlocks([...extendedProp.contentBlocks]);
  };

  const handleSaveEdits = async () => {
    if (!editingProp) return;
    await saveDocument(editingProp.client._id, "proposal", {
      _id: editingProp.proposal._id,
      title: editTitle,
      contentBlocks: editBlocks,
      status: editingProp.proposal.status,
      version: editingProp.proposal.version
    });
    setEditingProp(null);
  };

  const handleUpdateStatus = async (clientId: string, propId: string, status: CRMProposal["status"]) => {
    const client = clients.find(c => c._id === clientId);
    if (!client) return;
    const prop = client.proposals.find(p => p._id === propId);
    if (!prop) return;

    await saveDocument(clientId, "proposal", {
      ...prop,
      _id: propId,
      status
    });

    if (status === "Approved") {
      // Trigger automated transition to next stage
      await updateClientStage(clientId, "Quotation Generated");
    }
  };

  const handleBlockChange = (index: number, val: string) => {
    const next = [...editBlocks];
    next[index] = val;
    setEditBlocks(next);
  };

  const addContentBlock = () => {
    setEditBlocks([...editBlocks, "New Section: Edit details here."]);
  };

  return (
    <div className="flex flex-col gap-6 pb-10 select-none">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h2 className="text-[22px] font-extrabold text-[#111111] tracking-tight">Proposal Builder</h2>
          <p className="text-[13px] text-[#6A6A6A] mt-1">
            Generate and edit digital proposals using automated templates or AI copy generation.
          </p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#111111] text-white text-[12px] font-bold transition-all shadow-sm hover:bg-[#222222] cursor-pointer"
        >
          <Plus size={13} strokeWidth={2.5} />
          <span>New Proposal</span>
        </button>
      </div>

      {/* Proposals list grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {allProposals.map((prop) => (
          <div 
            key={prop._id} 
            className="bg-white border border-[#E9E3DA] rounded-[24px] p-6 hover:border-[#111111] transition-all flex flex-col justify-between gap-5 shadow-sm group"
          >
            <div>
              <div className="flex justify-between items-start mb-3">
                <span className="text-[10px] uppercase font-bold text-[#6A6A6A] font-mono">
                  {prop.clientCompany}
                </span>
                <span className={`px-2 py-0.5 rounded text-[10px] border font-bold uppercase tracking-wider ${
                  prop.status === "Approved" ? "bg-emerald-50 text-emerald-600 border-emerald-100" :
                  prop.status === "Sent" ? "bg-blue-50 text-blue-600 border-blue-100" :
                  "bg-gray-50 text-gray-500 border-gray-150"
                }`}>
                  {prop.status}
                </span>
              </div>
              <h3 className="text-[15px] font-extrabold text-[#111111] leading-tight mb-2 group-hover:text-emerald-600 transition-colors">
                {prop.title}
              </h3>
              <p className="text-[11.5px] text-[#6A6A6A] line-clamp-3">
                {prop.contentBlocks[0]}
              </p>
            </div>

            <div className="border-t border-[#FCFBF8] pt-4 mt-1 flex justify-between items-center text-[11px] font-semibold text-[#6A6A6A]">
              <span>Version v{prop.version}</span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleOpenEditor(prop)}
                  className="p-1.5 rounded-lg border border-[#E9E3DA] hover:border-[#111111] text-[#6A6A6A] hover:text-[#111111] transition-all flex items-center gap-1"
                >
                  <Edit3 size={11} />
                  <span>Edit Draft</span>
                </button>
                {prop.status === "Draft" && (
                  <button
                    onClick={() => handleUpdateStatus(prop.clientId, prop._id, "Sent")}
                    className="p-1.5 rounded-lg bg-black text-white hover:bg-black/90 transition-all flex items-center gap-1"
                  >
                    <Send size={11} />
                    <span>Send</span>
                  </button>
                )}
                {prop.status === "Sent" && (
                  <button
                    onClick={() => handleUpdateStatus(prop.clientId, prop._id, "Approved")}
                    className="p-1.5 rounded-lg bg-emerald-50 text-emerald-600 border border-emerald-100 hover:bg-emerald-100 transition-all flex items-center gap-1 font-bold"
                  >
                    <CheckCircle size={11} />
                    <span>Approve</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}

        {allProposals.length === 0 && (
          <div className="col-span-2 bg-[#FCFBF8] border border-[#E9E3DA] rounded-[24px] p-12 text-center text-[#6A6A6A]">
            <FileText className="mx-auto text-[#6A6A6A]/20 mb-3" size={40} />
            <p className="font-semibold">No proposals generated yet.</p>
            <p className="text-[12px] text-[#6A6A6A]/80 mt-1">Create a proposal above to start client negotiation.</p>
          </div>
        )}
      </div>

      {/* Editor Modal */}
      {editingProp && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-[#E9E3DA] w-full max-w-2xl rounded-2xl p-8 shadow-2xl relative overflow-y-auto max-h-[90vh] flex flex-col gap-6">
            <div className="flex justify-between items-start border-b border-[#E9E3DA] pb-4">
              <div>
                <span className="text-[10px] uppercase font-bold text-[#6A6A6A] font-mono">{editingProp.client.company}</span>
                <h3 className="text-[16px] font-extrabold text-[#111111]">Edit Proposal</h3>
              </div>
              <button 
                onClick={() => setEditingProp(null)}
                className="px-2.5 py-1 bg-[#FCFBF8] border border-[#E9E3DA] hover:border-[#111111] rounded text-[11px] font-bold"
              >
                Cancel
              </button>
            </div>

            <div className="flex flex-col gap-4">
              <div className="flex flex-col gap-1">
                <label className="text-[10px] uppercase font-bold text-[#6A6A6A]">Document Title</label>
                <input
                  type="text"
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  className="px-3 py-2 rounded-lg border border-[#E9E3DA] font-bold text-[#111111] focus:outline-none focus:border-[#111111] text-[14px]"
                />
              </div>

              <div className="flex flex-col gap-3">
                <label className="text-[10px] uppercase font-bold text-[#6A6A6A]">Editable Blocks</label>
                {editBlocks.map((block, idx) => (
                  <div key={idx} className="flex flex-col gap-1">
                    <span className="text-[9px] font-bold text-[#A8A296]">Block #{idx + 1}</span>
                    <textarea
                      value={block}
                      onChange={(e) => handleBlockChange(idx, e.target.value)}
                      className="px-3.5 py-2.5 rounded-lg border border-[#E9E3DA] text-[13px] text-[#111111] bg-[#FCFBF8] focus:outline-none focus:border-[#111111] min-h-[100px]"
                    />
                  </div>
                ))}
                <button
                  onClick={addContentBlock}
                  className="self-start text-[11px] text-[#111111] hover:underline font-bold"
                >
                  + Add Content Block
                </button>
              </div>
            </div>

            <div className="flex justify-end gap-3 border-t border-[#E9E3DA] pt-4">
              <button
                onClick={() => setEditingProp(null)}
                className="px-4 py-2 text-[12px] font-bold text-[#6A6A6A] hover:text-[#111111]"
              >
                Close
              </button>
              <button
                onClick={handleSaveEdits}
                className="px-4 py-2 rounded-lg bg-[#111111] text-white font-bold text-[12px] hover:bg-[#222222]"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Proposal Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-[#E9E3DA] w-full max-w-md rounded-2xl p-6 shadow-2xl relative">
            <h3 className="text-[16px] font-bold text-[#111111] mb-4">Generate Proposal</h3>
            <form onSubmit={handleCreateProposal} className="flex flex-col gap-4">
              
              <div className="flex flex-col gap-1.5">
                <label className="text-[11px] font-bold text-[#6A6A6A] uppercase">Select Client Context</label>
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
                <label className="text-[11px] font-bold text-[#6A6A6A] uppercase">Proposal Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Next.js App Redevelopment Scope"
                  value={proposalTitle}
                  onChange={(e) => setProposalTitle(e.target.value)}
                  className="px-3.5 py-2 rounded-lg bg-[#FCFBF8] border border-[#E9E3DA] text-[13px] text-[#111111] focus:outline-none"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <div className="flex items-center gap-1 text-[#6A6A6A] mb-0.5">
                  <Sparkles size={12} className="text-amber-500" />
                  <label className="text-[11px] font-bold uppercase">AI Gemini Prompt (Optional)</label>
                </div>
                <textarea
                  placeholder="e.g. Focus on complex visual micro-animations, GSAP layout renders, and 99% Lighthouse performance scores."
                  value={aiPrompt}
                  onChange={(e) => setAiPrompt(e.target.value)}
                  className="px-3.5 py-2 rounded-lg bg-[#FCFBF8] border border-[#E9E3DA] text-[13px] text-[#111111] placeholder-[#6A6A6A]/40 focus:outline-none focus:border-[#111111] h-20 resize-none"
                />
              </div>

              <div className="flex items-center justify-end gap-3 mt-4 pt-4 border-t border-[#E9E3DA]">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  disabled={generating}
                  className="px-4 py-2 text-[13px] font-bold text-[#6A6A6A] hover:text-[#111111] transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={generating}
                  className="px-4 py-2 rounded-lg bg-[#111111] text-white text-[13px] font-bold transition-all hover:bg-[#222222] flex items-center gap-1.5"
                >
                  {generating && <Sparkles className="animate-spin text-white" size={13} />}
                  <span>{generating ? "AI Generating..." : "Generate"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
