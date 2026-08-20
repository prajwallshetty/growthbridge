"use client";

import React, { useState, useEffect, useTransition } from "react";
import { getProjects, saveProject, deleteProject } from "@/lib/actions/cms";
import { Loader2, Plus, Edit, Trash2, ArrowLeft, Image as ImageIcon, ExternalLink, Upload, Check } from "lucide-react";

interface PortfolioItem {
  _id?: string;
  title: string;
  image: string;
  liveUrl?: string;
  status: "Completed" | "Ongoing" | "Not Started";
}

export default function PortfolioCmsPage() {
  const [projects, setProjects] = useState<PortfolioItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isPending, startTransition] = useTransition();
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [editingProject, setEditingProject] = useState<PortfolioItem | null>(null);
  const [activeTab, setActiveTab] = useState<"All" | "Completed" | "Ongoing" | "Not Started">("All");

  // Form State containing ONLY the 4 fields
  const [formState, setFormState] = useState<PortfolioItem>({
    title: "",
    image: "",
    liveUrl: "",
    status: "Ongoing",
  });

  const fetchProjects = async () => {
    try {
      setIsLoading(true);
      const data = await getProjects();
      setProjects(data as any[]);
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
      status: (project.status as any) || "Ongoing",
    });
  };

  const handleCreateClick = () => {
    const newProj: PortfolioItem = {
      title: "",
      image: "",
      liveUrl: "",
      status: "Ongoing",
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
      formData.append("alt", formState.title || "Portfolio Project Image");

      const res = await fetch("/api/media", {
        method: "POST",
        body: formData,
      });

      const json = await res.json();
      if (json.data && json.data.url) {
        setFormState((prev) => ({ ...prev, image: json.data.url }));
      } else {
        alert("Image upload failed: " + (json.error || "Unknown error"));
      }
    } catch (err: any) {
      alert("Image upload error: " + err.message);
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

  // Save / Update form submit handler
  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formState.title.trim()) {
      alert("Please enter a project name.");
      return;
    }
    if (!formState.image.trim()) {
      alert("Please upload or enter a project image URL.");
      return;
    }

    const payload = {
      ...formState,
      title: formState.title.trim(),
      image: formState.image.trim(),
      liveUrl: formatLiveUrl(formState.liveUrl),
    };

    startTransition(async () => {
      try {
        await saveProject(payload);
        setEditingProject(null);
        await fetchProjects();
      } catch (err: any) {
        alert("Failed to save project: " + err.message);
      }
    });
  };

  // Categories Count Calculation
  const completedCount = projects.filter((p) => p.status === "Completed").length;
  const ongoingCount = projects.filter((p) => p.status === "Ongoing").length;
  const notStartedCount = projects.filter((p) => p.status === "Not Started").length;

  const filteredProjects = projects.filter((p) => {
    if (activeTab === "All") return true;
    return p.status === activeTab;
  });

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-3 select-none">
        <Loader2 className="h-8 w-8 animate-spin text-[#111111]" />
        <span className="text-[13px] font-semibold text-[#6A6A6A]">Loading portfolio projects...</span>
      </div>
    );
  }

  // 1. LIST VIEW (READ PROJECTS)
  if (!editingProject) {
    return (
      <div className="flex flex-col gap-8 pb-16 select-none">
        {/* Top Header */}
        <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
          <div>
            <h1 className="text-[28px] font-extrabold tracking-tight text-[#111111]">Portfolio</h1>
            <p className="text-[13.5px] text-[#6A6A6A] mt-1 font-medium">
              Manage showcase projects displayed on your public website.
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

        {/* Status Navigation Segmented Tabs */}
        <div className="flex items-center bg-[#FCFBF8] border border-[#E9E3DA] p-1 rounded-xl w-fit shadow-2xs">
          <button
            onClick={() => setActiveTab("All")}
            className={`px-4 py-2 rounded-lg text-[12.5px] transition-all cursor-pointer flex items-center gap-2 ${
              activeTab === "All"
                ? "bg-[#111111] text-white font-extrabold shadow-xs"
                : "text-[#6A6A6A] hover:text-[#111111] font-semibold hover:bg-neutral-100"
            }`}
          >
            <span>All Projects</span>
            <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold ${activeTab === "All" ? "bg-white/20 text-white" : "bg-[#111111]/5 text-[#111111]"}`}>{projects.length}</span>
          </button>

          <button
            onClick={() => setActiveTab("Completed")}
            className={`px-4 py-2 rounded-lg text-[12.5px] transition-all cursor-pointer flex items-center gap-2 ${
              activeTab === "Completed"
                ? "bg-[#111111] text-white font-extrabold shadow-xs"
                : "text-[#6A6A6A] hover:text-[#111111] font-semibold hover:bg-neutral-100"
            }`}
          >
            <span>Completed</span>
            <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold ${activeTab === "Completed" ? "bg-white/20 text-white" : "bg-[#111111]/5 text-[#111111]"}`}>{completedCount}</span>
          </button>

          <button
            onClick={() => setActiveTab("Ongoing")}
            className={`px-4 py-2 rounded-lg text-[12.5px] transition-all cursor-pointer flex items-center gap-2 ${
              activeTab === "Ongoing"
                ? "bg-[#111111] text-white font-extrabold shadow-xs"
                : "text-[#6A6A6A] hover:text-[#111111] font-semibold hover:bg-neutral-100"
            }`}
          >
            <span>Ongoing</span>
            <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold ${activeTab === "Ongoing" ? "bg-white/20 text-white" : "bg-[#111111]/5 text-[#111111]"}`}>{ongoingCount}</span>
          </button>

          <button
            onClick={() => setActiveTab("Not Started")}
            className={`px-4 py-2 rounded-lg text-[12.5px] transition-all cursor-pointer flex items-center gap-2 ${
              activeTab === "Not Started"
                ? "bg-[#111111] text-white font-extrabold shadow-xs"
                : "text-[#6A6A6A] hover:text-[#111111] font-semibold hover:bg-neutral-100"
            }`}
          >
            <span>Not Started</span>
            <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold ${activeTab === "Not Started" ? "bg-white/20 text-white" : "bg-[#111111]/5 text-[#111111]"}`}>{notStartedCount}</span>
          </button>
        </div>

        {/* Portfolio Projects Cards Grid */}
        {filteredProjects.length === 0 ? (
          <div className="py-20 text-center border border-dashed border-[#E9E3DA] bg-white rounded-[24px] text-[#6A6A6A] flex flex-col items-center justify-center gap-3 shadow-2xs">
            <ImageIcon className="text-[#A8A296]" size={40} />
            <h3 className="text-[15px] font-bold text-[#111111]">No portfolio projects in this category</h3>
            <p className="text-[13px] text-[#6A6A6A]">Add a project to showcase it on your public website.</p>
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
            {filteredProjects.map((project) => (
              <div
                key={project._id}
                className="bg-white border border-[#E9E3DA] rounded-[22px] p-4 flex flex-col justify-between gap-4 shadow-2xs hover:shadow-md transition-all duration-200 group"
              >
                {/* Project Cover Image */}
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

                {/* Content: Title & Status */}
                <div className="flex items-start justify-between gap-3">
                  <h3 className="text-[16px] font-extrabold text-[#111111] leading-tight truncate flex-1">
                    {project.title}
                  </h3>

                  {/* Status Badge */}
                  <span
                    className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-mono font-extrabold uppercase tracking-wider border shrink-0 ${
                      project.status === "Completed"
                        ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                        : project.status === "Not Started"
                        ? "bg-[#111111]/5 text-[#6A6A6A] border-[#E9E3DA]"
                        : "bg-[#111111] text-white border-[#111111]"
                    }`}
                  >
                    {project.status === "Ongoing" && <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />}
                    <span>{project.status}</span>
                  </span>
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
                    <span className="text-[11.5px] text-[#A8A296] italic font-medium">No link provided</span>
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

  // 2. CREATE / EDIT FORM VIEW (ONLY 4 REQUIRED FIELDS)
  return (
    <div className="flex flex-col gap-6 max-w-2xl mx-auto pb-16 select-none">
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
            Configure project name, image, website link, and status.
          </p>
        </div>
      </div>

      <form onSubmit={handleSave} className="bg-white border border-[#E9E3DA] rounded-[24px] p-6 shadow-sm flex flex-col gap-6">
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

        {/* 2. Project Image (Upload + URL input + Live Preview) */}
        <div className="flex flex-col gap-2">
          <label className="text-[11px] font-mono uppercase font-bold text-[#6A6A6A]">
            Project Image <span className="text-rose-500">*</span>
          </label>

          {/* Upload Button + URL Input */}
          <div className="flex items-center gap-3">
            <label className="flex items-center gap-2 px-4 py-2.5 bg-[#111111] hover:bg-[#222222] text-white rounded-xl text-[12.5px] font-bold transition-all cursor-pointer shrink-0 shadow-xs">
              {isUploadingImage ? <Loader2 size={14} className="animate-spin" /> : <Upload size={14} />}
              <span>{isUploadingImage ? "Uploading..." : "Upload Image"}</span>
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
              placeholder="Paste direct image URL..."
              className="flex-1 h-11 px-4 bg-[#FCFBF8] border border-[#E9E3DA] rounded-xl text-[13px] font-medium text-[#111111] outline-none focus:border-[#111111] transition-all"
            />
          </div>

          {/* Image Live Preview */}
          {formState.image && (
            <div className="mt-2">
              <span className="text-[10px] font-mono uppercase font-bold text-[#6A6A6A] block mb-1">Image Preview:</span>
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
            Live Website Link (URL)
          </label>
          <input
            type="text"
            value={formState.liveUrl || ""}
            onChange={(e) => setFormState({ ...formState, liveUrl: e.target.value })}
            placeholder="e.g. https://northstar.growthbridge.live"
            className="w-full h-11 px-4 bg-[#FCFBF8] border border-[#E9E3DA] rounded-xl text-[13.5px] font-medium text-[#111111] outline-none focus:border-[#111111] transition-all"
          />
        </div>

        {/* 4. Status */}
        <div className="flex flex-col gap-1.5">
          <label className="text-[11px] font-mono uppercase font-bold text-[#6A6A6A]">
            Project Status <span className="text-rose-500">*</span>
          </label>
          <select
            value={formState.status}
            onChange={(e) => setFormState({ ...formState, status: e.target.value as any })}
            className="w-full h-11 px-4 bg-[#FCFBF8] border border-[#E9E3DA] rounded-xl text-[13.5px] font-bold text-[#111111] outline-none focus:border-[#111111] cursor-pointer"
          >
            <option value="Completed">Completed</option>
            <option value="Ongoing">Ongoing</option>
            <option value="Not Started">Not Started</option>
          </select>
        </div>

        {/* Submit Actions */}
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
            {isPending && <Loader2 size={14} className="animate-spin" />}
            <span>Save Project</span>
          </button>
        </div>
      </form>
    </div>
  );
}
