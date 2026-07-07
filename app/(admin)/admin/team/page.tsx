"use client";

import React, { useState, useEffect, useTransition } from "react";
import { 
  getTeamMembers, 
  saveTeamMember, 
  deleteTeamMember 
} from "@/lib/actions/cms";
import { 
  Plus, 
  Edit2, 
  Trash2, 
  Save, 
  X, 
  AlertCircle, 
  Sparkles, 
  ArrowUpRight,
  HelpCircle,
  Eye,
  ImageIcon,
  Loader2
} from "lucide-react";

export default function AdminTeamPage() {
  const [team, setTeam] = useState<any[]>([]);
  const [isPending, startTransition] = useTransition();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Editor Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingMember, setEditingMember] = useState<any | null>(null);

  // Media Library Picker State
  const [isMediaPickerOpen, setIsMediaPickerOpen] = useState(false);
  const [mediaItems, setMediaItems] = useState<any[]>([]);
  const [mediaLoading, setMediaLoading] = useState(false);

  // Form State
  const [form, setForm] = useState({
    name: "",
    role: "",
    bio: "",
    image: "",
    instagram: "",
    email: "",
    featured: false,
    order: 0,
  });

  const loadTeam = () => {
    setLoading(true);
    startTransition(async () => {
      try {
        const list = await getTeamMembers();
        setTeam(list);
        setError("");
      } catch (err: any) {
        console.error("Error fetching team:", err);
        setError("Failed to load team members from database.");
      } finally {
        setLoading(false);
      }
    });
  };

  useEffect(() => {
    loadTeam();
  }, []);

  const openEditor = (member: any | null = null) => {
    if (member) {
      setEditingMember(member);
      setForm({
        name: member.name || "",
        role: member.role || "",
        bio: member.bio || "",
        image: member.image || "",
        instagram: member.instagram || "",
        email: member.email || "",
        featured: !!member.featured,
        order: member.order || 0,
      });
    } else {
      setEditingMember(null);
      setForm({
        name: "",
        role: "",
        bio: "",
        image: "",
        instagram: "",
        email: "",
        featured: false,
        order: team.length,
      });
    }
    setError("");
    setSuccess("");
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) {
      setError("Name is required");
      return;
    }
    if (!form.role.trim()) {
      setError("Role is required");
      return;
    }

    setLoading(true);
    setError("");
    setSuccess("");

    const payload = editingMember 
      ? { ...form, _id: editingMember._id } 
      : form;

    startTransition(async () => {
      try {
        await saveTeamMember(payload);
        setSuccess(`Successfully saved ${form.name}`);
        setIsModalOpen(false);
        loadTeam();
      } catch (err: any) {
        setError(err.message || "Failed to save team member details.");
      } finally {
        setLoading(false);
      }
    });
  };

  const handleDelete = (member: any) => {
    if (!confirm(`Are you sure you want to delete "${member.name}"? This action cannot be undone.`)) {
      return;
    }

    setLoading(true);
    startTransition(async () => {
      try {
        await deleteTeamMember(member._id);
        setSuccess(`Deleted ${member.name} from the database`);
        loadTeam();
      } catch (err: any) {
        setError("Failed to delete team member.");
      } finally {
        setLoading(false);
      }
    });
  };

  return (
    <div className="flex flex-col gap-8">
      
      {/* Header and Add button */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-[28px] font-extrabold tracking-tight">Team Management</h2>
          <p className="text-[14px] text-[#6A6A6A] mt-1">Configure and manage team members displayed on the public website.</p>
        </div>
        <button
          onClick={() => openEditor(null)}
          className="inline-flex items-center gap-2 px-5 py-3 rounded-[12px] bg-[#111111] hover:bg-[#F4C542] text-white hover:text-[#111111] text-[13px] font-bold transition-all shadow-sm shrink-0 cursor-pointer"
        >
          <Plus size={16} /> Add Team Member
        </button>
      </div>

      {/* Messages */}
      {error && (
        <div className="flex items-center gap-3 p-4 bg-red-50 border border-red-200 text-red-700 rounded-[16px] text-[13px] font-semibold">
          <AlertCircle size={16} /> {error}
        </div>
      )}
      {success && (
        <div className="flex items-center gap-3 p-4 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-[16px] text-[13px] font-semibold">
          <CheckCircleIcon size={16} /> {success}
        </div>
      )}

      {/* Table grid listing */}
      {loading && team.length === 0 ? (
        <div className="text-center py-20 text-[#A8A296] text-[14px] font-medium">
          Loading team directory...
        </div>
      ) : team.length === 0 ? (
        <div className="text-center py-20 border border-dashed border-[#E9E3DA] bg-white rounded-[24px] text-[#A8A296] text-[14px] font-semibold">
          No team members stored in the database. Click "Add Team Member" to seed.
        </div>
      ) : (
        <div className="bg-white border border-[#E9E3DA] rounded-[24px] shadow-[0_4px_25px_rgba(0,0,0,0.02)] overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-[#E9E3DA] bg-[#FCFBF8] text-[11px] font-bold uppercase tracking-[0.08em] text-[#6A6A6A]">
                <th className="px-6 py-4 w-12 text-center">Order</th>
                <th className="px-6 py-4">Avatar</th>
                <th className="px-6 py-4">Name</th>
                <th className="px-6 py-4">Role</th>
                <th className="px-6 py-4">Featured</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E9E3DA]/60">
              {team.map((member) => (
                <tr key={member._id} className="hover:bg-[#FCFBF8]/40 transition-colors text-[13px]">
                  <td className="px-6 py-4 font-mono font-bold text-center text-[#A8A296]">
                    {member.order}
                  </td>
                  <td className="px-6 py-4">
                    <div className="h-10 w-10 rounded-full overflow-hidden border border-[#E9E3DA] bg-[#FCFBF8] flex items-center justify-center shrink-0">
                      {member.image ? (
                        <img src={member.image} alt={member.name} className="h-full w-full object-cover" />
                      ) : (
                        <HelpCircle size={16} className="text-[#A8A296]" />
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 font-bold text-[#111111]">
                    {member.name}
                  </td>
                  <td className="px-6 py-4 font-medium text-[#6A6A6A]">
                    {member.role}
                  </td>
                  <td className="px-6 py-4">
                    {member.featured ? (
                      <span className="px-2.5 py-1 text-[10px] font-extrabold uppercase bg-emerald-50 text-emerald-700 border border-emerald-100 rounded-full">
                        Partner
                      </span>
                    ) : (
                      <span className="text-[#A8A296] font-semibold text-[12px]">—</span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() => openEditor(member)}
                        className="h-8 w-8 rounded-full border border-[#E9E3DA] hover:border-[#111111] flex items-center justify-center text-[#6A6A6A] hover:text-[#111111] transition-all cursor-pointer bg-white"
                        title="Edit member"
                      >
                        <Edit2 size={13} />
                      </button>
                      <button
                        onClick={() => handleDelete(member)}
                        className="h-8 w-8 rounded-full border border-red-200 hover:border-red-500 hover:bg-red-50 flex items-center justify-center text-red-500 hover:text-red-700 transition-all cursor-pointer bg-white"
                        title="Delete member"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Editor Dialog Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-[#111111]/30 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white border border-[#E9E3DA] w-full max-w-[600px] rounded-[32px] overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-200">
            
            {/* Modal Header */}
            <div className="p-6 border-b border-[#E9E3DA] flex justify-between items-center bg-[#FCFBF8]">
              <h3 className="text-[18px] font-bold text-[#111111]">
                {editingMember ? `Edit Team Member: ${editingMember.name}` : "Add New Team Member"}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="h-8 w-8 rounded-full border border-[#E9E3DA] hover:border-[#111111] flex items-center justify-center text-[#6A6A6A] hover:text-[#111111] transition-all cursor-pointer"
              >
                <X size={14} />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSave} className="p-6 flex flex-col gap-5 max-h-[75vh] overflow-y-auto">
              
              {/* Primary info row */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex flex-col gap-2">
                  <label className="text-[11px] font-bold uppercase tracking-wider text-[#6A6A6A]">Full Name</label>
                  <input
                    type="text"
                    required
                    placeholder="Prajwal Shetty"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    className="w-full bg-[#FCFBF8] border border-[#E9E3DA] rounded-[12px] px-4 py-3 text-[13px] text-[#111111] font-semibold focus:outline-none focus:border-[#111111] transition-all"
                  />
                </div>

                <div className="flex flex-col gap-2">
                  <label className="text-[11px] font-bold uppercase tracking-wider text-[#6A6A6A]">Role / Designation</label>
                  <input
                    type="text"
                    required
                    placeholder="Chief Architect"
                    value={form.role}
                    onChange={(e) => setForm({ ...form, role: e.target.value })}
                    className="w-full bg-[#FCFBF8] border border-[#E9E3DA] rounded-[12px] px-4 py-3 text-[13px] text-[#111111] font-semibold focus:outline-none focus:border-[#111111] transition-all"
                  />
                </div>
              </div>

              {/* Bio description */}
              <div className="flex flex-col gap-2">
                <label className="text-[11px] font-bold uppercase tracking-wider text-[#6A6A6A]">Short Bio Description</label>
                <textarea
                  rows={3}
                  placeholder="Tell us what this team member builds..."
                  value={form.bio}
                  onChange={(e) => setForm({ ...form, bio: e.target.value })}
                  className="w-full bg-[#FCFBF8] border border-[#E9E3DA] rounded-[12px] px-4 py-3 text-[13px] text-[#111111] font-semibold focus:outline-none focus:border-[#111111] transition-all resize-none"
                />
              </div>

              {/* Image avatar path */}
              <div className="flex flex-col gap-2">
                <label className="text-[11px] font-bold uppercase tracking-wider text-[#6A6A6A]">Avatar Image Path / URL</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="/founder.png or https://unsplash.com/..."
                    value={form.image}
                    onChange={(e) => setForm({ ...form, image: e.target.value })}
                    className="flex-1 bg-[#FCFBF8] border border-[#E9E3DA] rounded-[12px] px-4 py-3 text-[13px] text-[#111111] font-semibold focus:outline-none focus:border-[#111111] transition-all"
                  />
                  <button
                    type="button"
                    onClick={async () => {
                      setIsMediaPickerOpen(true);
                      setMediaLoading(true);
                      try {
                        const res = await fetch("/api/media");
                        const data = await res.json();
                        if (data.data) setMediaItems(data.data);
                      } catch (err) {
                        console.error("Failed to load media", err);
                      } finally {
                        setMediaLoading(false);
                      }
                    }}
                    className="inline-flex items-center gap-2 px-4 py-3 bg-[#111111] hover:bg-[#F4C542] text-white hover:text-[#111111] text-[12px] font-bold rounded-[12px] transition-all cursor-pointer shrink-0"
                  >
                    <ImageIcon size={14} /> Browse Media
                  </button>
                </div>
                {form.image && (
                  <div className="mt-2 w-16 h-16 rounded-[12px] border border-[#E9E3DA] overflow-hidden bg-[#FCFBF8]">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={form.image} alt="Preview" className="w-full h-full object-cover" />
                  </div>
                )}
              </div>

              {/* Social URLs row */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex flex-col gap-2">
                  <label className="text-[11px] font-bold uppercase tracking-wider text-[#6A6A6A]">Instagram URL</label>
                  <input
                    type="url"
                    placeholder="https://instagram.com/..."
                    value={form.instagram}
                    onChange={(e) => setForm({ ...form, instagram: e.target.value })}
                    className="w-full bg-[#FCFBF8] border border-[#E9E3DA] rounded-[12px] px-4 py-3 text-[13px] text-[#111111] font-semibold focus:outline-none focus:border-[#111111] transition-all"
                  />
                </div>

                <div className="flex flex-col gap-2">
                  <label className="text-[11px] font-bold uppercase tracking-wider text-[#6A6A6A]">Direct Email Address</label>
                  <input
                    type="email"
                    placeholder="name@company.com"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    className="w-full bg-[#FCFBF8] border border-[#E9E3DA] rounded-[12px] px-4 py-3 text-[13px] text-[#111111] font-semibold focus:outline-none focus:border-[#111111] transition-all"
                  />
                </div>
              </div>

              {/* Order and Featured Toggle */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 items-center pt-2 border-t border-[#E9E3DA]/60">
                <div className="flex flex-col gap-2">
                  <label className="text-[11px] font-bold uppercase tracking-wider text-[#6A6A6A]">Sort Order Index</label>
                  <input
                    type="number"
                    min={0}
                    value={form.order}
                    onChange={(e) => setForm({ ...form, order: parseInt(e.target.value) || 0 })}
                    className="w-24 bg-[#FCFBF8] border border-[#E9E3DA] rounded-[12px] px-4 py-2.5 text-[13px] text-[#111111] font-mono font-bold focus:outline-none focus:border-[#111111] transition-all"
                  />
                </div>

                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    id="featured"
                    checked={form.featured}
                    onChange={(e) => setForm({ ...form, featured: e.target.checked })}
                    className="h-4.5 w-4.5 accent-[#111111] cursor-pointer"
                  />
                  <label htmlFor="featured" className="text-[13px] font-bold text-[#111111] cursor-pointer">
                    Highlight as Partner / Featured
                  </label>
                </div>
              </div>

              {/* Form buttons */}
              <div className="flex justify-end gap-3 pt-4 border-t border-[#E9E3DA] mt-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-5 py-2.5 border border-[#E9E3DA] hover:border-[#111111] text-[#6A6A6A] hover:text-[#111111] text-[13px] font-bold rounded-full transition-all cursor-pointer bg-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="inline-flex items-center gap-2 px-6 py-2.5 bg-[#111111] hover:bg-[#F4C542] text-white hover:text-[#111111] text-[13px] font-bold rounded-full transition-all shadow-sm cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  <Save size={14} /> Save Changes
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* Media Library Picker Modal */}
      {isMediaPickerOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-[24px] border border-[#E9E3DA] shadow-2xl w-full max-w-[720px] max-h-[80vh] flex flex-col overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-5 border-b border-[#E9E3DA]">
              <div>
                <h3 className="text-[18px] font-extrabold tracking-tight">Select from Media Library</h3>
                <p className="text-[12px] text-[#6A6A6A] mt-0.5">Click an image to use it as the avatar.</p>
              </div>
              <button
                onClick={() => setIsMediaPickerOpen(false)}
                className="p-2 rounded-full hover:bg-[#F5F2ED] transition-colors cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            {/* Grid */}
            <div className="flex-1 overflow-y-auto p-6">
              {mediaLoading ? (
                <div className="flex flex-col items-center justify-center py-16 gap-3">
                  <Loader2 className="h-7 w-7 animate-spin text-[#111111]" />
                  <span className="text-[13px] font-semibold text-[#6A6A6A]">Loading media library...</span>
                </div>
              ) : mediaItems.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 text-center">
                  <ImageIcon className="h-10 w-10 text-[#A8A296] mb-3" />
                  <p className="text-[14px] font-bold text-[#111111]">No media files uploaded yet</p>
                  <p className="text-[12px] text-[#6A6A6A] mt-1 max-w-[280px]">
                    Go to the Media Library page to upload images first.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                  {mediaItems.map((item: any) => (
                    <button
                      key={item._id}
                      type="button"
                      onClick={() => {
                        setForm({ ...form, image: item.url });
                        setIsMediaPickerOpen(false);
                      }}
                      className={`group relative aspect-square rounded-[14px] overflow-hidden border-2 transition-all cursor-pointer ${
                        form.image === item.url
                          ? "border-[#F4C542] shadow-[0_0_0_2px_rgba(244,197,66,0.3)]"
                          : "border-[#E9E3DA] hover:border-[#111111]"
                      }`}
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={item.url}
                        alt={item.altText || item.fileName}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent px-2.5 pb-2 pt-6">
                        <span className="text-[10px] font-bold text-white truncate block">
                          {item.fileName}
                        </span>
                      </div>
                      {form.image === item.url && (
                        <div className="absolute top-2 right-2 w-5 h-5 rounded-full bg-[#F4C542] flex items-center justify-center">
                          <CheckCircleIcon size={12} className="text-[#111111]" />
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

// Inline CheckCircle component to prevent export errors
const CheckCircleIcon = ({ size = 24, ...props }: React.SVGProps<SVGSVGElement> & { size?: number }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
    <polyline points="22 4 12 14.01 9 11.01"/>
  </svg>
);
