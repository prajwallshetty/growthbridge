"use client";

import React, { useState, useEffect, useTransition } from "react";
import { getServices, saveService, deleteService } from "@/lib/actions/cms";
import { Loader2, Plus, Edit, Trash2, ArrowLeft, Save } from "lucide-react";

interface ServiceItem {
  _id?: string;
  title: string;
  description: string;
}

export default function ServicesCmsPage() {
  const [services, setServices] = useState<ServiceItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isPending, startTransition] = useTransition();
  const [editingService, setEditingService] = useState<ServiceItem | null>(null);

  const [formState, setFormState] = useState<ServiceItem>({
    title: "",
    description: "",
  });

  const fetchServices = async () => {
    try {
      setIsLoading(true);
      const data = await getServices();
      setServices(data);
    } catch (err) {
      console.error("Failed to load services:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchServices();
  }, []);

  const handleEditClick = (service: ServiceItem) => {
    setEditingService(service);
    setFormState({ ...service });
  };

  const handleCreateClick = () => {
    const defaultService: ServiceItem = {
      title: "",
      description: "",
    };
    setEditingService(defaultService);
    setFormState(defaultService);
  };

  const handleDeleteClick = async (id: string) => {
    if (!confirm("Are you sure you want to delete this service entry?")) return;
    try {
      await deleteService(id);
      fetchServices();
    } catch (err) {
      alert("Delete failed");
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormState((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    startTransition(async () => {
      try {
        await saveService(formState);
        setEditingService(null);
        fetchServices();
      } catch (err) {
        alert("Failed to save service");
      }
    });
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-3">
        <Loader2 className="h-8 w-8 animate-spin text-[#111111]" />
        <span className="text-[13px] font-semibold text-[#6A6A6A]">Loading services...</span>
      </div>
    );
  }

  // LIST STATE
  if (!editingService) {
    return (
      <div className="flex flex-col gap-10">
        <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
          <div>
            <h2 className="text-[28px] font-extrabold tracking-tight">Services CMS</h2>
            <p className="text-[14px] text-[#6A6A6A] mt-1">Configure service offerings, details, and benefits featured in landing page segments.</p>
          </div>
          <button
            onClick={handleCreateClick}
            className="flex items-center justify-center gap-2 h-12 px-6 rounded-[12px] bg-[#111111] hover:bg-[#111111]/90 text-white text-[13px] font-bold shadow-sm transition-all cursor-pointer shrink-0"
          >
            <Plus size={16} />
            Add Service
          </button>
        </div>

        <div className="bg-white border border-[#E9E3DA] rounded-[24px] overflow-hidden shadow-[0_4px_20px_rgba(0,0,0,0.02)]">
          <div className="p-8 border-b border-[#E9E3DA]">
            <h3 className="text-[16px] font-bold tracking-tight">Active Services List</h3>
          </div>

          {services.length === 0 ? (
            <div className="text-center py-16 text-[#A8A296] text-[13px] font-medium">
              No services found. Click "Add Service" to customize the capabilities directory.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-[#FCFBF8] border-b border-[#E9E3DA] text-[11px] font-bold uppercase tracking-[0.08em] text-[#6A6A6A]">
                    <th className="py-4 px-8">Service Title</th>
                    <th className="py-4 px-8">Description Snippet</th>
                    <th className="py-4 px-8 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E9E3DA]/60">
                  {services.map((service) => (
                    <tr key={service._id} className="hover:bg-[#FCFBF8]/40 transition-colors text-[13px] font-semibold">
                      <td className="py-5 px-8 text-[#111111] max-w-[200px] truncate">{service.title}</td>
                      <td className="py-5 px-8 text-[#6A6A6A] max-w-[400px] truncate">{service.description}</td>
                      <td className="py-5 px-8 text-right">
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() => handleEditClick(service)}
                            className="p-2 hover:bg-[#111111]/5 rounded-[8px] text-[#111111] cursor-pointer"
                            title="Edit Service"
                          >
                            <Edit size={16} />
                          </button>
                          <button
                            onClick={() => handleDeleteClick(service._id!)}
                            className="p-2 hover:bg-red-50 rounded-[8px] text-red-600 cursor-pointer"
                            title="Delete Service"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    );
  }

  // EDIT STATE
  return (
    <div className="flex flex-col gap-10">
      <div className="flex items-center gap-4">
        <button
          onClick={() => setEditingService(null)}
          className="p-2.5 hover:bg-[#111111]/5 rounded-[12px] border border-[#E9E3DA] text-[#111111] cursor-pointer"
        >
          <ArrowLeft size={16} />
        </button>
        <div>
          <h2 className="text-[28px] font-extrabold tracking-tight">
            {editingService._id ? "Edit Service" : "Add Service Offer"}
          </h2>
          <p className="text-[14px] text-[#6A6A6A] mt-1">Provide clear, premium descriptions of the service's deliverables.</p>
        </div>
      </div>

      <form onSubmit={handleSave} className="max-w-[700px] bg-white border border-[#E9E3DA] rounded-[24px] p-8 shadow-[0_4px_20px_rgba(0,0,0,0.02)] flex flex-col gap-6">
        <h3 className="text-[16px] font-bold tracking-tight pb-4 border-b border-[#E9E3DA]">Service Capabilities</h3>

        <div className="flex flex-col gap-2">
          <label className="text-[13px] font-bold uppercase tracking-[0.08em] text-[#6A6A6A]">
            Service Offering Title
          </label>
          <input
            type="text"
            name="title"
            required
            value={formState.title}
            onChange={handleChange}
            placeholder="e.g. Design & Engineering Studio"
            className="w-full h-12 px-4 bg-[#FCFBF8] border border-[#E9E3DA] rounded-[12px] text-[14px] font-semibold outline-none focus:border-[#111111] transition-all"
          />
        </div>

        <div className="flex flex-col gap-2">
          <label className="text-[13px] font-bold uppercase tracking-[0.08em] text-[#6A6A6A]">
            Detailed Capabilities description
          </label>
          <textarea
            name="description"
            required
            rows={5}
            value={formState.description}
            onChange={handleChange}
            placeholder="Describe what this service entails, your team's approach, and the quality standard..."
            className="w-full p-4 bg-[#FCFBF8] border border-[#E9E3DA] rounded-[12px] text-[14px] font-medium outline-none focus:border-[#111111] transition-all resize-none"
          />
        </div>

        <div className="flex gap-4 pt-4 border-t border-[#E9E3DA]/60">
          <button
            type="button"
            onClick={() => setEditingService(null)}
            className="flex-1 h-12 border border-[#E9E3DA] hover:border-[#111111] rounded-[12px] text-[#111111] text-[13px] font-bold transition-all cursor-pointer bg-white"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isPending}
            className="flex-1 flex items-center justify-center gap-2 h-12 rounded-[12px] bg-[#111111] hover:bg-[#111111]/90 text-white text-[13px] font-bold shadow-sm transition-all cursor-pointer disabled:opacity-60"
          >
            {isPending ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save size={16} />
                Save Service Details
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
