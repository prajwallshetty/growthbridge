"use client";

import React, { useState, useEffect, useTransition } from "react";
import { getTestimonials, saveTestimonial, deleteTestimonial } from "@/lib/actions/cms";
import { Loader2, Plus, Edit, Trash2, ArrowLeft, Image as ImageIcon, Save } from "lucide-react";

interface TestimonialItem {
  _id?: string;
  name: string;
  designation: string;
  image: string;
  quote: string;
}

export default function TestimonialsCmsPage() {
  const [testimonials, setTestimonials] = useState<TestimonialItem[]>([]);
  const [mediaList, setMediaList] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isPending, startTransition] = useTransition();
  const [editingTestimonial, setEditingTestimonial] = useState<TestimonialItem | null>(null);
  const [showAvatarPicker, setShowAvatarPicker] = useState(false);

  const [formState, setFormState] = useState<TestimonialItem>({
    name: "",
    designation: "",
    image: "",
    quote: "",
  });

  const fetchTestimonialsAndMedia = async () => {
    try {
      setIsLoading(true);
      const data = await getTestimonials();
      setTestimonials(data);

      const mediaRes = await fetch("/api/media");
      const mediaData = await mediaRes.json();
      if (mediaData.data) {
        setMediaList(mediaData.data);
      }
    } catch (err) {
      console.error("Failed to load testimonials:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTestimonialsAndMedia();
  }, []);

  const handleEditClick = (testimonial: TestimonialItem) => {
    setEditingTestimonial(testimonial);
    setFormState({ ...testimonial });
  };

  const handleCreateClick = () => {
    const defaultTestimonial: TestimonialItem = {
      name: "",
      designation: "",
      image: "",
      quote: "",
    };
    setEditingTestimonial(defaultTestimonial);
    setFormState(defaultTestimonial);
  };

  const handleDeleteClick = async (id: string) => {
    if (!confirm("Are you sure you want to delete this testimonial?")) return;
    try {
      await deleteTestimonial(id);
      fetchTestimonialsAndMedia();
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
    if (!formState.image) {
      alert("Please choose or provide an avatar image URL.");
      return;
    }

    startTransition(async () => {
      try {
        await saveTestimonial(formState);
        setEditingTestimonial(null);
        fetchTestimonialsAndMedia();
      } catch (err) {
        alert("Failed to save testimonial");
      }
    });
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-3">
        <Loader2 className="h-8 w-8 animate-spin text-[#111111]" />
        <span className="text-[13px] font-semibold text-[#6A6A6A]">Loading reviews...</span>
      </div>
    );
  }

  // LIST STATE
  if (!editingTestimonial) {
    return (
      <div className="flex flex-col gap-10">
        <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
          <div>
            <h2 className="text-[28px] font-extrabold tracking-tight">Testimonials CMS</h2>
            <p className="text-[14px] text-[#6A6A6A] mt-1">Configure client statements, name avatars, designations, and slider parameters.</p>
          </div>
          <button
            onClick={handleCreateClick}
            className="flex items-center justify-center gap-2 h-12 px-6 rounded-[12px] bg-[#111111] hover:bg-[#111111]/90 text-white text-[13px] font-bold shadow-sm transition-all cursor-pointer shrink-0"
          >
            <Plus size={16} />
            Add Testimonial
          </button>
        </div>

        <div className="bg-white border border-[#E9E3DA] rounded-[24px] overflow-hidden shadow-[0_4px_20px_rgba(0,0,0,0.02)]">
          <div className="p-8 border-b border-[#E9E3DA]">
            <h3 className="text-[16px] font-bold tracking-tight">Client Endorsements Directory</h3>
          </div>

          {testimonials.length === 0 ? (
            <div className="text-center py-16 text-[#A8A296] text-[13px] font-medium">
              No testimonials found. Add client quotes to highlight customer success on the homepage.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-[#FCFBF8] border-b border-[#E9E3DA] text-[11px] font-bold uppercase tracking-[0.08em] text-[#6A6A6A]">
                    <th className="py-4 px-8">Client</th>
                    <th className="py-4 px-8">Designation</th>
                    <th className="py-4 px-8">Client Quote Snippet</th>
                    <th className="py-4 px-8 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E9E3DA]/60">
                  {testimonials.map((test) => (
                    <tr key={test._id} className="hover:bg-[#FCFBF8]/40 transition-colors text-[13px] font-semibold">
                      <td className="py-5 px-8 flex items-center gap-4 max-w-[240px]">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={test.image} alt="" className="h-9 w-9 object-cover rounded-full bg-[#E9E3DA] shrink-0 border border-[#E9E3DA]" />
                        <span className="text-[#111111] truncate">{test.name}</span>
                      </td>
                      <td className="py-5 px-8 text-[#6A6A6A]">{test.designation}</td>
                      <td className="py-5 px-8 text-[#6A6A6A] max-w-[400px] truncate">"{test.quote}"</td>
                      <td className="py-5 px-8 text-right">
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() => handleEditClick(test)}
                            className="p-2 hover:bg-[#111111]/5 rounded-[8px] text-[#111111] cursor-pointer"
                            title="Edit Review"
                          >
                            <Edit size={16} />
                          </button>
                          <button
                            onClick={() => handleDeleteClick(test._id!)}
                            className="p-2 hover:bg-red-50 rounded-[8px] text-red-600 cursor-pointer"
                            title="Delete Review"
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
          onClick={() => setEditingTestimonial(null)}
          className="p-2.5 hover:bg-[#111111]/5 rounded-[12px] border border-[#E9E3DA] text-[#111111] cursor-pointer"
        >
          <ArrowLeft size={16} />
        </button>
        <div>
          <h2 className="text-[28px] font-extrabold tracking-tight">
            {editingTestimonial._id ? "Edit Testimonial" : "Add Client Review"}
          </h2>
          <p className="text-[14px] text-[#6A6A6A] mt-1">Configure user avatar images, branding metrics, and quotes.</p>
        </div>
      </div>

      <form onSubmit={handleSave} className="max-w-[700px] bg-white border border-[#E9E3DA] rounded-[24px] p-8 shadow-[0_4px_20px_rgba(0,0,0,0.02)] flex flex-col gap-6">
        <h3 className="text-[16px] font-bold tracking-tight pb-4 border-b border-[#E9E3DA]">Client Review Details</h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div className="flex flex-col gap-2">
            <label className="text-[13px] font-bold uppercase tracking-[0.08em] text-[#6A6A6A]">
              Client Name
            </label>
            <input
              type="text"
              name="name"
              required
              value={formState.name}
              onChange={handleChange}
              placeholder="e.g. Daniel Lee"
              className="w-full h-12 px-4 bg-[#FCFBF8] border border-[#E9E3DA] rounded-[12px] text-[14px] font-semibold outline-none focus:border-[#111111] transition-all"
            />
          </div>
          <div className="flex flex-col gap-2">
            <label className="text-[13px] font-bold uppercase tracking-[0.08em] text-[#6A6A6A]">
              Designation / Role & Brand
            </label>
            <input
              type="text"
              name="designation"
              required
              value={formState.designation}
              onChange={handleChange}
              placeholder="e.g. Founder at Atlas Platform"
              className="w-full h-12 px-4 bg-[#FCFBF8] border border-[#E9E3DA] rounded-[12px] text-[14px] font-medium outline-none focus:border-[#111111] transition-all"
            />
          </div>
        </div>

        {/* Avatar image selector */}
        <div className="flex flex-col gap-2 relative">
          <div className="flex justify-between items-center">
            <label className="text-[13px] font-bold uppercase tracking-[0.08em] text-[#6A6A6A]">
              Client Avatar Image URL
            </label>
            <button
              type="button"
              onClick={() => setShowAvatarPicker(!showAvatarPicker)}
              className="flex items-center gap-1 text-[11px] font-bold text-[#111111] hover:text-[#111111]/70 transition-all bg-[#FCFBF8] border border-[#E9E3DA] px-2.5 py-1 rounded-[6px] cursor-pointer"
            >
              <ImageIcon size={12} />
              Choose Uploaded
            </button>
          </div>
          
          <div className="flex items-center gap-4">
            {formState.image && (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={formState.image} alt="" className="h-12 w-12 object-cover rounded-full bg-[#E9E3DA] border border-[#E9E3DA] shrink-0" />
            )}
            <input
              type="text"
              name="image"
              required
              value={formState.image}
              onChange={handleChange}
              placeholder="Paste direct URL or select asset..."
              className="w-full h-12 px-4 bg-[#FCFBF8] border border-[#E9E3DA] rounded-[12px] text-[14px] font-medium outline-none focus:border-[#111111] transition-all"
            />
          </div>

          {showAvatarPicker && (
            <div className="absolute top-[76px] left-0 right-0 z-50 bg-white border border-[#E9E3DA] rounded-[16px] p-4 shadow-xl max-h-[220px] overflow-y-auto flex flex-col gap-2">
              <div className="text-[11px] font-bold uppercase tracking-[0.08em] text-[#6A6A6A] pb-2 border-b border-[#E9E3DA]">
                Select Avatar Graphic
              </div>
              {mediaList.length === 0 ? (
                <span className="text-[11px] text-[#A8A296] italic py-2">No uploaded media. Upload in Media Library first.</span>
              ) : (
                mediaList.map((m) => (
                  <button
                    key={m._id}
                    type="button"
                    onClick={() => {
                      setFormState(prev => ({ ...prev, image: m.url }));
                      setShowAvatarPicker(false);
                    }}
                    className="flex items-center gap-3 p-1.5 hover:bg-[#FCFBF8] border border-transparent hover:border-[#E9E3DA] rounded-[8px] text-left text-[12px] font-medium truncate cursor-pointer"
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={m.url} alt="" className="h-8 w-8 object-cover rounded-full shrink-0" />
                    <span className="truncate">{m.fileName}</span>
                  </button>
                ))
              )}
            </div>
          )}
        </div>

        <div className="flex flex-col gap-2">
          <label className="text-[13px] font-bold uppercase tracking-[0.08em] text-[#6A6A6A]">
            Client Quote
          </label>
          <textarea
            name="quote"
            required
            rows={4}
            value={formState.quote}
            onChange={handleChange}
            placeholder="e.g. Growth Bridge transformed our app interface. Their team moves with incredible momentum..."
            className="w-full p-4 bg-[#FCFBF8] border border-[#E9E3DA] rounded-[12px] text-[14px] font-medium outline-none focus:border-[#111111] transition-all resize-none font-medium"
          />
        </div>

        <div className="flex gap-4 pt-4 border-t border-[#E9E3DA]/60">
          <button
            type="button"
            onClick={() => setEditingTestimonial(null)}
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
                Save Testimonial
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
