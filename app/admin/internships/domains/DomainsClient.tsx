"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { createDomain, updateDomain, deleteDomain } from "@/lib/actions/internship";
import { Plus, Edit2, Trash2, Check, RefreshCw, AlertCircle } from "lucide-react";

interface DomainItem {
  _id: string;
  name: string;
  description: string;
  duration: string;
  isActive: boolean;
}

interface DomainsClientProps {
  initialDomains: DomainItem[];
}

export default function DomainsClient({ initialDomains }: DomainsClientProps) {
  const router = useRouter();

  // Form Fields for Create / Edit
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [duration, setDuration] = useState("4 Weeks");
  const [isActive, setIsActive] = useState(true);

  // Edit states
  const [editingId, setEditingId] = useState<string | null>(null);

  // Status flags
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");

    if (!name || !duration) {
      setErrorMessage("Domain Name and Duration are required.");
      return;
    }

    setIsSubmitting(true);

    try {
      if (editingId) {
        // Update Action
        await updateDomain(editingId, { name, description, duration, isActive });
        setEditingId(null);
      } else {
        // Create Action
        await createDomain({ name, description, duration });
      }

      // Reset form
      setName("");
      setDescription("");
      setDuration("4 Weeks");
      setIsActive(true);
      
      router.refresh();
    } catch (err: any) {
      console.error(err);
      setErrorMessage(err.message || "Failed to save domain track.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditInit = (domain: DomainItem) => {
    setEditingId(domain._id);
    setName(domain.name);
    setDescription(domain.description || "");
    setDuration(domain.duration);
    setIsActive(domain.isActive);
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setName("");
    setDescription("");
    setDuration("4 Weeks");
    setIsActive(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this domain? This will not delete applications but will break track queries.")) return;
    try {
      await deleteDomain(id);
      router.refresh();
    } catch (err) {
      console.error(err);
      alert("Failed to delete domain.");
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
      
      {/* LEFT: Domains Grid / List */}
      <div className="lg:col-span-8 flex flex-col gap-6 text-left">
        <div className="flex flex-col gap-0.5">
          <h1 className="text-[22px] font-black tracking-tight text-[#111111]">Internship Domains</h1>
          <span className="text-[12.5px] text-[#6A6A6A] font-semibold">Define active internship tracks and operational durations.</span>
        </div>

        {initialDomains.length === 0 ? (
          <div className="bg-white border border-[#E9E3DA] p-10 rounded-2xl text-center text-[#A8A296] font-mono">
            No domains registered. Create one on the right to start.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {initialDomains.map((domain) => (
              <div
                key={domain._id}
                className={`bg-white border p-6 rounded-2xl flex flex-col justify-between shadow-[0_4px_12px_rgba(0,0,0,0.01)] transition-all ${
                  domain.isActive ? "border-[#E9E3DA] hover:border-[#D7D0C8]" : "border-[#E9E3DA]/60 opacity-60"
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <span className="px-2.5 py-1 rounded-full bg-[#FCFBF8] border border-[#E9E3DA] text-[10.5px] font-bold text-[#6A6A6A]">
                      {domain.duration}
                    </span>
                    
                    <span className={`px-2 py-0.5 rounded text-[9.5px] font-bold uppercase tracking-wider ${
                      domain.isActive ? "bg-emerald-50 text-emerald-600 border border-emerald-200" : "bg-gray-100 text-gray-500 border border-gray-200"
                    }`}>
                      {domain.isActive ? "Active" : "Inactive"}
                    </span>
                  </div>

                  <h3 className="text-[16px] font-extrabold text-[#111111]">{domain.name}</h3>
                  <p className="mt-3 text-[12.5px] text-[#6A6A6A] leading-relaxed font-medium">
                    {domain.description || "No description provided."}
                  </p>
                </div>

                <div className="mt-6 pt-4 border-t border-[#E9E3DA]/50 flex items-center justify-end gap-2">
                  <button
                    onClick={() => handleEditInit(domain)}
                    className="p-2 rounded-lg border border-[#E9E3DA] hover:bg-[#FCFBF8] text-[#6A6A6A] hover:text-[#111111] transition-all cursor-pointer"
                    title="Edit Domain"
                  >
                    <Edit2 size={13} />
                  </button>
                  
                  <button
                    onClick={() => handleDelete(domain._id)}
                    className="p-2 rounded-lg border border-red-100 hover:bg-red-50 text-red-500 transition-all cursor-pointer"
                    title="Delete Domain"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* RIGHT: Add/Edit Form Panel */}
      <div className="lg:col-span-4 text-left">
        <div className="bg-white border border-[#E9E3DA] p-6 rounded-2xl shadow-[0_4px_12px_rgba(0,0,0,0.01)] flex flex-col gap-6 sticky top-24">
          <div className="flex flex-col gap-0.5">
            <h3 className="text-[15px] font-bold text-[#111111]">
              {editingId ? "Modify Domain" : "Add New Domain"}
            </h3>
            <span className="text-[11.5px] text-[#6A6A6A] font-semibold">
              {editingId ? "Edit the values of the selected track." : "Setup a new internship track."}
            </span>
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div className="flex flex-col gap-1">
              <label className="text-[12px] font-bold text-[#111111]">Domain Name *</label>
              <input
                type="text"
                required
                placeholder="E.g., React Native Development"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="px-3.5 py-2.5 rounded-xl border border-[#E9E3DA] bg-[#FCFBF8] text-[12.5px] font-semibold text-[#111111] focus:outline-none focus:border-[#F4C542]"
              />
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-[12px] font-bold text-[#111111]">Duration *</label>
              <select
                value={duration}
                onChange={(e) => setDuration(e.target.value)}
                className="px-3.5 py-2.5 rounded-xl border border-[#E9E3DA] bg-[#FCFBF8] text-[12.5px] font-semibold text-[#111111] focus:outline-none focus:border-[#F4C542]"
              >
                <option value="4 Weeks">4 Weeks</option>
                <option value="6 Weeks">6 Weeks</option>
                <option value="8 Weeks">8 Weeks</option>
                <option value="12 Weeks">12 Weeks</option>
              </select>
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-[12px] font-bold text-[#111111]">Description</label>
              <textarea
                rows={4}
                placeholder="Domain scope, learning benchmarks, target projects..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="px-3.5 py-2.5 rounded-xl border border-[#E9E3DA] bg-[#FCFBF8] text-[12.5px] font-semibold text-[#111111] focus:outline-none focus:border-[#F4C542] resize-y"
              />
            </div>

            {editingId && (
              <label className="flex items-center gap-2 cursor-pointer mt-1">
                <input
                  type="checkbox"
                  checked={isActive}
                  onChange={(e) => setIsActive(e.target.checked)}
                  className="w-4 h-4 rounded border-[#E9E3DA] text-[#F4C542] focus:ring-0 cursor-pointer"
                />
                <span className="text-[12.5px] font-bold text-[#111111]">Domain is Active</span>
              </label>
            )}

            {errorMessage && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-500 flex items-center gap-2 text-[11px] font-bold">
                <AlertCircle size={14} className="shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            <div className="flex items-center gap-2 mt-2 pt-2 border-t border-[#E9E3DA]/60">
              {editingId && (
                <button
                  type="button"
                  onClick={handleCancelEdit}
                  className="flex-1 py-2.5 rounded-xl border border-[#E9E3DA] hover:bg-[#F3F4F6] text-[12px] font-bold text-[#6A6A6A] text-center transition-all cursor-pointer"
                >
                  Cancel
                </button>
              )}
              
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex-grow py-2.5 rounded-xl bg-[#111111] hover:bg-[#F4C542] hover:text-[#111111] text-white disabled:opacity-50 text-[12px] font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer"
              >
                {isSubmitting ? (
                  <RefreshCw size={12} className="animate-spin" />
                ) : editingId ? (
                  <span>Update Domain</span>
                ) : (
                  <>
                    <Plus size={14} />
                    <span>Create Domain</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>

    </div>
  );
}
