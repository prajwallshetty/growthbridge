"use client";

import React, { useState, useEffect, useTransition } from "react";
import { getProjects, saveProject, deleteProject } from "@/lib/actions/cms";
import { Loader2, Plus, Edit, Trash2, ArrowLeft, Image as ImageIcon, ExternalLink, Upload, Send } from "lucide-react";

interface PortfolioItem {
  _id?: string;
  title: string;
  image: string;
  liveUrl?: string;
}

export default function PortfolioCmsPage() {
  const [projects, setProjects] = useState<PortfolioItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isPending, startTransition] = useTransition();
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [editingProject, setEditingProject] = useState<PortfolioItem | null>(null);

  // Form State containing ONLY Project Name, Photo, and Live Link
  const [formState, setFormState] = useState<PortfolioItem>({
    title: "",
    image: "",
    liveUrl: "",
  });

  const fetchProjects = async () => {
    try {
      setIsLoading(true);
      const data = await getProjects();
      setProjects(data as any[]);
    } catch (err) {
      console.error("Error fetching portfolio projects:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  // Format Live Link URL safely
  const formatLiveUrl = (url?: string) => {
    if (!url) return "";
    const trimmed = url.trim();
    if (trimmed && !trimmed.startsWith("http://") && !trimmed.startsWith("https://")) {
      return `https://${trimmed}`;
    }
    return trimmed;
  };

  const handleEditClick = (project: PortfolioItem) => {
    setEditingProject(project);
    setFormState({
      _id: project._id,
      title: project.title || "",
      image: project.image || "",
      liveUrl: project.liveUrl || "",
    });
  };

  const handleCreateClick = () => {
    const newProj: PortfolioItem = {
      title: "",
      image: "",
      liveUrl: "",
    };
    setEditingProject(newProj);
    setFormState(newProj);
  };

  // Image Upload handler via /api/media
  const handleImageFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploadingImage(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("alt", formState.title || "Portfolio Photo");

      const res = await fetch("/api/media", {
        method: "POST",
        body: formData,
      });

      const json = await res.json();
      if (json.data && json.data.url) {
        setFormState((prev) => ({ ...prev, image: json.data.url }));
      } else {
        alert("Photo upload failed: " + (json.error || "Unknown error"));
      }
    } catch (err: any) {
      alert("Photo upload error: " + err.message);
    } finally {
      setIsUploadingImage(false);
    }
  };

  // Delete project handler with optimistic UI update and permanent DB removal
  const handleDeleteClick = async (project: PortfolioItem) => {
    if (!project._id) return;
    if (!confirm(`Are you sure you want to permanently delete "${project.title}"?`)) return;

    // Save previous state for rollback if server error occurs
    const previousProjects = [...projects];

    // Optimistic UI update
    setProjects((prev) => prev.filter((p) => p._id !== project._id));

    try {
      const res = await deleteProject(project._id);
      if (!res.success) {
        setProjects(previousProjects);
        alert("Failed to delete project from database.");
      }
    } catch (err: any) {
      setProjects(previousProjects);
      alert("Delete failed: " + (err.message || "Unauthorized"));
    }
  };

  // Save / Publish form submit handler
  const handlePublish = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formState.title.trim()) {
      alert("Please enter a project name.");
      return;
    }
    if (!formState.image.trim()) {
      alert("Please upload or enter a project photo.");
      return;
    }

    const payload = {
      ...formState,
      title: formState.title.trim(),
      image: formState.image.trim(),
      liveUrl: formatLiveUrl(formState.liveUrl),
      status: "Completed", // Published
    };

    startTransition(async () => {
      try {
        await saveProject(payload);
        setEditingProject(null);
        await fetchProjects();
      } catch (err: any) {
        alert("Failed to publish project: " + err.message);
      }
    });
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-3 select-none">
        <Loader2 className="h-8 w-8 animate-spin text-[#111111]" />
        <span className="text-[13px] font-semibold text-[#6A6A6A]">Loading portfolio projects...</span>
      </div>
    );
  }

  // 1. ADMIN LIST VIEW
  if (!editingProject) {
    return (
      <div className="flex flex-col gap-8 pb-16 select-none">
        {/* Top Header */}
        <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
          <div>
            <h1 className="text-[28px] font-extrabold tracking-tight text-[#111111]">Portfolio</h1>
            <p className="text-[13.5px] text-[#6A6A6A] mt-1 font-medium">
              Manage showcase projects published on your website.
            </p>
          </div>
          <button
            onClick={handleCreateClick}
            className="flex items-center justify-center gap-2 bg-[#111111] hover:bg-[#222222] text-white px-5 py-2.5 rounded-xl text-[13px] font-bold transition-all shadow-sm cursor-pointer shrink-0"
          >
            <Plus size={16} />
            <span>Add Project</span>
          </button>
        </div>

        {/* Portfolio Projects Cards Grid */}
        {projects.length === 0 ? (
          <div className="py-20 text-center border border-dashed border-[#E9E3DA] bg-white rounded-[24px] text-[#6A6A6A] flex flex-col items-center justify-center gap-3 shadow-2xs">
            <ImageIcon className="text-[#A8A296]" size={40} />
            <h3 className="text-[15px] font-bold text-[#111111]">No published portfolio projects yet</h3>
            <p className="text-[13px] text-[#6A6A6A]">Add a project to publish it on your website.</p>
            <button
              onClick={handleCreateClick}
              className="mt-2 flex items-center gap-2 bg-[#111111] text-white px-4 py-2 rounded-xl text-[13px] font-bold hover:bg-[#222222] transition-all cursor-pointer shadow-xs"
            >
              <Plus size={15} />
              <span>Add Project</span>
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {projects.map((project) => (
              <div
                key={project._id}
                className="bg-white border border-[#E9E3DA] rounded-[22px] p-4 flex flex-col justify-between gap-4 shadow-2xs hover:shadow-md transition-all duration-200 group"
              >
                {/* Photo */}
                <div className="w-full aspect-[16/10] bg-[#FCFBF8] border border-[#E9E3DA] rounded-[16px] overflow-hidden relative group/img">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={project.image}
                    alt={project.title}
                    className="w-full h-full object-cover group-hover/img:scale-105 transition-transform duration-300"
                    onError={(e) => {
                      (e.target as HTMLElement).style.display = "none";
                    }}
                  />
                </div>

                {/* Project Name */}
                <div className="flex items-center justify-between gap-3">
                  <h3 className="text-[16.5px] font-extrabold text-[#111111] leading-tight truncate flex-1">
                    {project.title}
                  </h3>
                </div>

                {/* Actions Footer: View Live, Edit, Delete */}
                <div className="flex items-center justify-between pt-3 border-t border-[#E9E3DA]">
                  {project.liveUrl ? (
                    <a
                      href={formatLiveUrl(project.liveUrl)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[12.5px] font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1 group-hover:translate-x-0.5 transition-transform"
                    >
                      <span>View Live</span>
                      <ExternalLink size={13} />
                    </a>
                  ) : (
                    <span className="text-[11.5px] text-[#A8A296] italic font-medium">No live link</span>
                  )}

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleEditClick(project)}
                      className="px-3 py-1.5 rounded-lg border border-[#E9E3DA] hover:bg-[#FCFBF8] text-[#111111] text-[12px] font-bold transition-all cursor-pointer shadow-xs flex items-center gap-1"
                    >
                      <Edit size={13} />
                      <span>Edit</span>
                    </button>
                    <button
                      onClick={() => handleDeleteClick(project)}
                      className="px-3 py-1.5 rounded-lg border border-rose-200 hover:bg-rose-50 text-rose-600 text-[12px] font-bold transition-all cursor-pointer shadow-xs flex items-center gap-1"
                    >
                      <Trash2 size={13} />
                      <span>Delete</span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }

  // 2. CREATE / EDIT FORM VIEW (PROJECT NAME, PHOTO, LIVE LINK, PUBLISH)
  return (
    <div className="flex flex-col gap-6 max-w-xl mx-auto pb-16 select-none">
      <div className="flex items-center gap-3 border-b border-[#E9E3DA] pb-4">
        <button
          onClick={() => setEditingProject(null)}
          className="p-2 hover:bg-gray-100 rounded-xl border border-[#E9E3DA] text-[#111111] cursor-pointer"
        >
          <ArrowLeft size={16} />
        </button>
        <div>
          <h1 className="text-[24px] font-extrabold tracking-tight text-[#111111]">
            {editingProject._id ? "Edit Portfolio Project" : "Add Portfolio Project"}
          </h1>
          <p className="text-[13px] text-[#6A6A6A]">
            Configure project name, photo, and live website link.
          </p>
        </div>
      </div>

      <form onSubmit={handlePublish} className="bg-white border border-[#E9E3DA] rounded-[24px] p-6 shadow-sm flex flex-col gap-6">
        {/* 1. Project Name */}
        <div className="flex flex-col gap-1.5">
          <label className="text-[11px] font-mono uppercase font-bold text-[#6A6A6A]">
            Project Name <span className="text-rose-500">*</span>
          </label>
          <input
            type="text"
            required
            value={formState.title}
            onChange={(e) => setFormState({ ...formState, title: e.target.value })}
            placeholder="e.g. Northstar Commerce"
            className="w-full h-11 px-4 bg-[#FCFBF8] border border-[#E9E3DA] rounded-xl text-[14px] font-semibold text-[#111111] outline-none focus:border-[#111111] transition-all"
          />
        </div>

        {/* 2. Photo (Upload + Live Preview + URL input) */}
        <div className="flex flex-col gap-2">
          <label className="text-[11px] font-mono uppercase font-bold text-[#6A6A6A]">
            Photo <span className="text-rose-500">*</span>
          </label>

          <div className="flex items-center gap-3">
            <label className="flex items-center gap-2 px-4 py-2.5 bg-[#111111] hover:bg-[#222222] text-white rounded-xl text-[12.5px] font-bold transition-all cursor-pointer shrink-0 shadow-xs">
              {isUploadingImage ? <Loader2 size={14} className="animate-spin" /> : <Upload size={14} />}
              <span>{isUploadingImage ? "Uploading..." : "Upload Photo"}</span>
              <input
                type="file"
                accept="image/*"
                onChange={handleImageFileUpload}
                disabled={isUploadingImage}
                className="hidden"
              />
            </label>

            <span className="text-[12px] font-semibold text-[#A8A296]">OR</span>

            <input
              type="text"
              required
              value={formState.image}
              onChange={(e) => setFormState({ ...formState, image: e.target.value })}
              placeholder="Paste direct photo URL..."
              className="flex-1 h-11 px-4 bg-[#FCFBF8] border border-[#E9E3DA] rounded-xl text-[13px] font-medium text-[#111111] outline-none focus:border-[#111111] transition-all"
            />
          </div>

          {/* Photo Live Preview */}
          {formState.image && (
            <div className="mt-2">
              <span className="text-[10px] font-mono uppercase font-bold text-[#6A6A6A] block mb-1">Photo Preview:</span>
              <div className="w-full aspect-[16/9] max-h-[220px] bg-[#FCFBF8] border border-[#E9E3DA] rounded-xl overflow-hidden relative">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={formState.image}
                  alt="Preview"
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    (e.target as HTMLElement).style.display = "none";
                  }}
                />
              </div>
            </div>
          )}
        </div>

        {/* 3. Live Link */}
        <div className="flex flex-col gap-1.5">
          <label className="text-[11px] font-mono uppercase font-bold text-[#6A6A6A]">
            Live Link (URL)
          </label>
          <input
            type="text"
            value={formState.liveUrl || ""}
            onChange={(e) => setFormState({ ...formState, liveUrl: e.target.value })}
            placeholder="e.g. https://northstar.growthbridge.live"
            className="w-full h-11 px-4 bg-[#FCFBF8] border border-[#E9E3DA] rounded-xl text-[13.5px] font-medium text-[#111111] outline-none focus:border-[#111111] transition-all"
          />
        </div>

        {/* 4. Publish Action Button */}
        <div className="flex justify-end gap-3 pt-4 border-t border-[#E9E3DA]">
          <button
            type="button"
            onClick={() => setEditingProject(null)}
            className="px-5 py-2.5 border border-[#E9E3DA] rounded-xl text-[13px] font-bold text-[#6A6A6A] hover:bg-[#F3F4F6] transition-all cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isPending}
            className="px-6 py-2.5 bg-[#111111] hover:bg-[#222222] text-white rounded-xl text-[13px] font-bold shadow-sm transition-all cursor-pointer flex items-center gap-2 disabled:opacity-60"
          >
            {isPending ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />}
            <span>Publish Project</span>
          </button>
        </div>
      </form>
    </div>
  );
}
