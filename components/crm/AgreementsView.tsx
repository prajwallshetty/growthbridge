"use client";

import React, { useState } from "react";
import { useCRM, CRMClient, CRMAgreement } from "./CRMProvider";
import { FileCheck, CheckCircle2, Send, Download, Plus, Eye, Key } from "lucide-react";

export default function AgreementsView() {
  const { clients, saveDocument, updateClientStage } = useCRM();
  const [showAddModal, setShowAddModal] = useState(false);
  const [targetClientId, setTargetClientId] = useState("");
  const [scope, setScope] = useState("");
  const [timeline, setTimeline] = useState("");
  const [paymentTerms, setPaymentTerms] = useState("");

  const [viewAgreement, setViewAgreement] = useState<{ client: CRMClient; agreement: CRMAgreement } | null>(null);

  interface ExtendedAgreement extends CRMAgreement {
    clientCompany: string;
    clientId: string;
    client: CRMClient;
  }

  const allAgreements: ExtendedAgreement[] = [];
  clients.forEach((c) => {
    if (c.agreements) {
      c.agreements.forEach((agr) => {
        allAgreements.push({
          ...agr,
          clientId: c._id,
          clientCompany: c.company,
          client: c,
        });
      });
    }
  });

  const handleCreateAgreement = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetClientId || !scope) return;

    const clientObj = clients.find(c => c._id === targetClientId);
    if (!clientObj) return;

    await saveDocument(targetClientId, "agreement", {
      scope,
      timeline: timeline || "90 Days from Kickoff",
      paymentTerms: paymentTerms || `₹${Math.round(clientObj.budget * 0.35).toLocaleString()} advance retainer payment`,
      signedStatus: "Unsigned"
    });

    setScope("");
    setTimeline("");
    setPaymentTerms("");
    setShowAddModal(false);
  };

  const handleSignAgreement = async (clientId: string, agrId: string) => {
    const client = clients.find(c => c._id === clientId);
    if (!client) return;
    const agr = client.agreements.find(a => a._id === agrId);
    if (!agr) return;

    await saveDocument(clientId, "agreement", {
      ...agr,
      _id: agrId,
      signedStatus: "Signed"
    });

    // Automated trigger is run inside the Server Action!
    // But we trigger the lifecycle update here:
    await updateClientStage(clientId, "Project Created Automatically");
  };

  const handleSendAgreement = async (clientId: string, agrId: string) => {
    const client = clients.find(c => c._id === clientId);
    if (!client) return;
    const agr = client.agreements.find(a => a._id === agrId);
    if (!agr) return;

    await saveDocument(clientId, "agreement", {
      ...agr,
      _id: agrId,
      signedStatus: "Sent"
    });
  };

  return (
    <div className="flex flex-col gap-6 pb-10 select-none">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h2 className="text-[22px] font-extrabold text-[#111111] tracking-tight">Contract Agreements</h2>
          <p className="text-[13px] text-[#6A6A6A] mt-1">
            Review legal contracts, scope documentation, and trace digital signatures.
          </p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#111111] text-white text-[12px] font-bold transition-all shadow-sm hover:bg-[#222222] cursor-pointer"
        >
          <Plus size={13} strokeWidth={2.5} />
          <span>New Agreement</span>
        </button>
      </div>

      {/* Grid of contracts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {allAgreements.map((agr) => (
          <div 
            key={agr._id} 
            className="bg-white border border-[#E9E3DA] rounded-[24px] p-6 hover:border-[#111111] transition-all flex flex-col justify-between gap-5 shadow-sm group"
          >
            <div>
              <div className="flex justify-between items-start mb-3">
                <span className="text-[10px] uppercase font-bold text-[#6A6A6A] font-mono">
                  {agr.clientCompany}
                </span>
                <span className={`px-2.5 py-0.5 rounded text-[10px] border font-bold uppercase tracking-wider ${
                  agr.signedStatus === "Signed" ? "bg-emerald-50 text-emerald-600 border-emerald-100" :
                  agr.signedStatus === "Sent" ? "bg-blue-50 text-blue-600 border-blue-100" :
                  "bg-gray-50 text-gray-500 border-gray-150"
                }`}>
                  {agr.signedStatus}
                </span>
              </div>
              <h3 className="text-[15px] font-extrabold text-[#111111] leading-tight mb-2 group-hover:text-emerald-600 transition-colors">
                Master Services Agreement (MSA)
              </h3>
              <p className="text-[11.5px] text-[#6A6A6A] line-clamp-3 leading-relaxed">
                Scope: {agr.scope}
              </p>
            </div>

            <div className="border-t border-[#FCFBF8] pt-4 mt-1 flex justify-between items-center text-[11px] font-semibold text-[#6A6A6A]">
              <span>Timeline: {agr.timeline}</span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setViewAgreement({ client: agr.client, agreement: agr })}
                  className="p-1.5 rounded-lg border border-[#E9E3DA] hover:border-[#111111] text-[#6A6A6A] hover:text-[#111111] transition-all flex items-center gap-1"
                >
                  <Eye size={11} />
                  <span>View Contract</span>
                </button>
                {agr.signedStatus === "Unsigned" && (
                  <button
                    onClick={() => handleSendAgreement(agr.clientId, agr._id)}
                    className="p-1.5 rounded-lg bg-black text-white hover:bg-black/90 transition-all flex items-center gap-1"
                  >
                    <Send size={11} />
                    <span>Send</span>
                  </button>
                )}
                {agr.signedStatus !== "Signed" && (
                  <button
                    onClick={() => handleSignAgreement(agr.clientId, agr._id)}
                    className="p-1.5 rounded-lg bg-emerald-50 text-emerald-600 border border-emerald-100 hover:bg-emerald-100 transition-all flex items-center gap-1 font-bold"
                  >
                    <CheckCircle2 size={11} />
                    <span>Execute (Sign)</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}

        {allAgreements.length === 0 && (
          <div className="col-span-2 bg-[#FCFBF8] border border-[#E9E3DA] rounded-[24px] p-12 text-center text-[#6A6A6A]">
            <FileCheck className="mx-auto text-[#6A6A6A]/20 mb-3" size={40} />
            <p className="font-semibold">No agreements compiled yet.</p>
            <p className="text-[12px] text-[#6A6A6A]/80 mt-1">Approve a client quotation to compile contract documents automatically.</p>
          </div>
        )}
      </div>

      {/* Contract PDF Mockup Modal */}
      {viewAgreement && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-[#E9E3DA] w-full max-w-2xl rounded-2xl p-8 shadow-2xl relative overflow-y-auto max-h-[90vh]">
            <button 
              onClick={() => setViewAgreement(null)}
              className="absolute right-4 top-4 px-2.5 py-1 bg-[#FCFBF8] border border-[#E9E3DA] hover:border-[#111111] rounded text-[11px] font-bold"
            >
              Close
            </button>
            
            <div className="flex flex-col gap-6 text-[#111111] select-text">
              <div className="text-center border-b border-[#E9E3DA] pb-6">
                <h1 className="text-[18px] font-extrabold tracking-tight">MASTER SERVICES AGREEMENT</h1>
                <span className="text-[11px] text-[#6A6A6A] font-mono">GROWTH BRIDGE OS &bull; LEGAL DEPT</span>
              </div>

              <div className="text-[12.5px] leading-relaxed flex flex-col gap-4">
                <p>
                  This Master Services Agreement ("Agreement") is executed as of the effective date by and between:
                </p>
                <div>
                  <strong>Growth Bridge Studio</strong>, hereinafter referred to as "Studio", and <br />
                  <strong>{viewAgreement.client.company}</strong>, represented by <strong>{viewAgreement.client.name}</strong>, hereinafter referred to as "Client".
                </div>

                <div>
                  <h3 className="text-[13px] font-bold text-[#111111] mb-1">1. SCOPE OF SERVICES</h3>
                  <p>{viewAgreement.agreement.scope}</p>
                </div>

                <div>
                  <h3 className="text-[13px] font-bold text-[#111111] mb-1">2. PROJECT TIMELINE</h3>
                  <p>{viewAgreement.agreement.timeline}</p>
                </div>

                <div>
                  <h3 className="text-[13px] font-bold text-[#111111] mb-1">3. BILLING & PAYMENT SCHEDULE</h3>
                  <p>{viewAgreement.agreement.paymentTerms}</p>
                </div>

                <div>
                  <h3 className="text-[13px] font-bold text-[#111111] mb-1">4. EXECUTION STATUS</h3>
                  <p>
                    Current digital contract status is: <strong className="text-emerald-600">{viewAgreement.agreement.signedStatus.toUpperCase()}</strong>.
                    {viewAgreement.agreement.signedAt && (
                      <span> Signed effectively on: {new Date(viewAgreement.agreement.signedAt).toLocaleDateString()}.</span>
                    )}
                  </p>
                </div>
              </div>

              {/* Signatures placeholder */}
              <div className="grid grid-cols-2 gap-12 mt-6 text-[12px] border-t border-[#E9E3DA] pt-8">
                <div>
                  <span className="text-[10px] uppercase font-bold text-[#6A6A6A] block mb-6">For Growth Bridge Studio:</span>
                  <div className="border-b border-[#E9E3DA] h-6 flex items-end">
                    <span className="font-mono italic text-[13px] text-emerald-600">Prajwal Shetty</span>
                  </div>
                  <span className="text-[10px] text-[#A8A296] block mt-1">Managing Director</span>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-[#6A6A6A] block mb-6">For {viewAgreement.client.company}:</span>
                  <div className="border-b border-[#E9E3DA] h-6 flex items-end">
                    {viewAgreement.agreement.signedStatus === "Signed" ? (
                      <span className="font-mono italic text-[13px] text-emerald-600">{viewAgreement.client.name}</span>
                    ) : (
                      <span className="text-[#A8A296] italic text-[11px]">Awaiting execution</span>
                    )}
                  </div>
                  <span className="text-[10px] text-[#A8A296] block mt-1">Authorized Client Representative</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Compile Manual Agreement Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-[#E9E3DA] w-full max-w-md rounded-2xl p-6 shadow-2xl relative">
            <h3 className="text-[16px] font-bold text-[#111111] mb-4">Compile Contract Agreement</h3>
            <form onSubmit={handleCreateAgreement} className="flex flex-col gap-4">
              
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
                <label className="text-[11px] font-bold text-[#6A6A6A] uppercase">Project Scope of Work</label>
                <textarea
                  required
                  placeholder="e.g. Design platform user dashboard, configure Stripe billing, and connect to Resend API gateway."
                  value={scope}
                  onChange={(e) => setScope(e.target.value)}
                  className="px-3.5 py-2 rounded-lg bg-[#FCFBF8] border border-[#E9E3DA] text-[13px] text-[#111111] placeholder-[#6A6A6A]/40 focus:outline-none focus:border-[#111111] h-20 resize-none"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[11px] font-bold text-[#6A6A6A] uppercase">Timeline</label>
                <input
                  type="text"
                  placeholder="e.g. 90 days from contract date"
                  value={timeline}
                  onChange={(e) => setTimeline(e.target.value)}
                  className="px-3.5 py-2 rounded-lg bg-[#FCFBF8] border border-[#E9E3DA] text-[13px] text-[#111111] focus:outline-none"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[11px] font-bold text-[#6A6A6A] uppercase">Milestone Retainer split (Optional)</label>
                <input
                  type="text"
                  placeholder="e.g. 35% advance, 35% staging review, 30% deployment"
                  value={paymentTerms}
                  onChange={(e) => setPaymentTerms(e.target.value)}
                  className="px-3.5 py-2 rounded-lg bg-[#FCFBF8] border border-[#E9E3DA] text-[13px] text-[#111111] focus:outline-none"
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
                  Create Agreement
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
