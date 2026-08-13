"use client";

import React, { useState, useEffect, useTransition } from "react";
import { getProjects, saveProject, deleteProject } from "@/lib/actions/cms";
import { Loader2, Plus, Edit, Trash2, ArrowLeft, Image as ImageIcon, Sparkles } from "lucide-react";

interface ProjectItem {
  _id?: string;
  title: string;
  client?: string;
  category: string;
  description: string;
  detailContent?: string;
  image: string;
  gallery: string[];
  liveUrl?: string;
  githubUrl?: string;
  resultMetric?: string;
  technologies: string[];
  featured: boolean;
  completed?: boolean;
  projectType?: string;
  seoTitle?: string;
  seoDescription?: string;
}

export default function PortfolioCmsPage() {
  const [projects, setProjects] = useState<ProjectItem[]>([]);
  const [mediaList, setMediaList] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isPending, startTransition] = useTransition();
  const [aiLoading, setAiLoading] = useState(false);
  const [editingProject, setEditingProject] = useState<ProjectItem | null>(null);

  // Form inputs state
  const [formState, setFormState] = useState<ProjectItem>({
    title: "",
    client: "",
    category: "",
    description: "",
    detailContent: "",
    image: "",
    gallery: [],
    liveUrl: "",
    githubUrl: "",
    resultMetric: "",
    technologies: [],
    featured: false,
    completed: false,
    projectType: "customised",
    seoTitle: "",
    seoDescription: "",
  });

  const [techInput, setTechInput] = useState("");
  const [galleryInput, setGalleryInput] = useState("");
  const [showMainImagePicker, setShowMainImagePicker] = useState(false);

  const fetchProjectsAndMedia = async () => {
    try {
      setIsLoading(true);
      const data = await getProjects();
      setProjects(data);

      const mediaRes = await fetch("/api/media");
      const mediaData = await mediaRes.json();
      if (mediaData.data) {
        setMediaList(mediaData.data);
      }
    } catch (err) {
      console.error("Error fetching projects:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProjectsAndMedia();
  }, []);

  const handleEditClick = (project: ProjectItem) => {
    setEditingProject(project);
    setFormState({
      projectType: "customised",
      completed: project.completed ?? false,
      ...project,
    });
    setTechInput(project.technologies?.join(", ") || "");
    setGalleryInput(project.gallery?.join(", ") || "");
  };

  const handleCreateClick = () => {
    const defaultProj: ProjectItem = {
      title: "",
      client: "",
      category: "SaaS",
      description: "",
      detailContent: "",
      image: "",
      gallery: [],
      liveUrl: "",
      githubUrl: "",
      resultMetric: "",
      technologies: [],
      featured: false,
      completed: false,
      projectType: "customised",
      seoTitle: "",
      seoDescription: "",
    };
    setEditingProject(defaultProj);
    setFormState(defaultProj);
    setTechInput("");
    setGalleryInput("");
  };

  const handleDeleteClick = async (id: string) => {
    if (!confirm("Are you sure you want to delete this case study project?")) return;
    try {
      await deleteProject(id);
      fetchProjectsAndMedia();
    } catch (err) {
      alert("Delete failed");
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setFormState((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? (e.target as HTMLInputElement).checked : value,
    }));
  };

  const handleToggleChange = (name: string, checked: boolean) => {
    setFormState((prev) => ({
      ...prev,
      [name]: checked,
    }));
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formState.image) {
      alert("Please upload or enter a main mockup image URL.");
      return;
    }

    const technologies = techInput.split(",").map(t => t.trim()).filter(Boolean);
    const gallery = galleryInput.split(",").map(g => g.trim()).filter(Boolean);

    const payload = {
      ...formState,
      technologies,
      gallery,
    };

    startTransition(async () => {
      try {
        await saveProject(payload);
        setEditingProject(null);
        fetchProjectsAndMedia();
      } catch (err) {
        alert("Failed to save portfolio project");
      }
    });
  };

  // Gemini AI SEO helper
  const handleGenerateSEO = async () => {
    if (!formState.description) {
      alert("Please write a project description first so Gemini can optimize metadata.");
      return;
    }
    setAiLoading(true);
    try {
      const prompt = `Rewrite the following project description into a search-engine optimized title (max 60 chars) and meta description (max 150 chars). 
      Return JSON format exactly like:
      {
        "seoTitle": "...",
        "seoDescription": "..."
      }
      Project Title: "${formState.title}"
      Description: "${formState.description}"`;
      
      const { generateCopy } = await import("@/lib/actions/ai");
      const generated = await generateCopy(prompt);
      
      const jsonStart = generated.indexOf("{");
      const jsonEnd = generated.lastIndexOf("}") + 1;
      if (jsonStart !== -1 && jsonEnd !== -1) {
        const parsed = JSON.parse(generated.substring(jsonStart, jsonEnd));
        setFormState(prev => ({
          ...prev,
          seoTitle: parsed.seoTitle || prev.seoTitle,
          seoDescription: parsed.seoDescription || prev.seoDescription,
        }));
      } else {
        setFormState(prev => ({
          ...prev,
          seoTitle: `${prev.title} Case Study | Growth Bridge`,
          seoDescription: generated.substring(0, 150),
        }));
      }
    } catch (err) {
      alert("AI failed to optimize portfolio SEO");
    } finally {
      setAiLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-3">
        <Loader2 className="h-8 w-8 animate-spin text-[#111111]" />
        <span className="text-[13px] font-semibold text-[#6A6A6A]">Loading portfolio items...</span>
      </div>
    );
  }

  // LIST STATE
  if (!editingProject) {
    return (
      <div className="flex flex-col gap-10">
        <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
          <div>
            <h2 className="text-[28px] font-extrabold tracking-tight">Portfolio CMS</h2>
            <p className="text-[14px] text-[#6A6A6A] mt-1">Manage case studies, project stats, client metrics, and tech stacks.</p>
          </div>
          <button
            onClick={handleCreateClick}
            className="flex items-center justify-center gap-2 h-12 px-6 rounded-[12px] bg-[#111111] hover:bg-[#111111]/90 text-white text-[13px] font-bold shadow-sm transition-all cursor-pointer shrink-0"
          >
            <Plus size={16} />
            Add Project
          </button>
        </div>

        <div className="bg-white border border-[#E9E3DA] rounded-[24px] overflow-hidden shadow-[0_4px_20px_rgba(0,0,0,0.02)]">
          <div className="p-8 border-b border-[#E9E3DA]">
            <h3 className="text-[16px] font-bold tracking-tight">Projects Showcase</h3>
          </div>

          {projects.length === 0 ? (
            <div className="text-center py-16 text-[#A8A296] text-[13px] font-medium">
              No portfolio projects found. Add a project case study to showcase on your landing page.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-[#FCFBF8] border-b border-[#E9E3DA] text-[11px] font-bold uppercase tracking-[0.08em] text-[#6A6A6A]">
                    <th className="py-4 px-8">Client & Project</th>
                    <th className="py-4 px-8">Category</th>
                    <th className="py-4 px-8">Type</th>
                    <th className="py-4 px-8">Metric</th>
                    <th className="py-4 px-8">Featured</th>
                    <th className="py-4 px-8">Status</th>
                    <th className="py-4 px-8 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E9E3DA]/60">
                  {projects.map((project) => (
                    <tr key={project._id} className="hover:bg-[#FCFBF8]/40 transition-colors text-[13px] font-semibold">
                      <td className="py-5 px-8 flex items-center gap-4 max-w-[320px]">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={project.image} alt="" className="h-10 w-12 object-cover bg-[#E9E3DA] rounded-[6px] shrink-0" />
                        <div className="flex flex-col gap-0.5 truncate">
                          <span className="text-[#111111] truncate">{project.title}</span>
                          <span className="text-[11px] text-[#A8A296] truncate font-medium">{project.client || "Self-Initiated"}</span>
                        </div>
                      </td>
                      <td className="py-5 px-8 text-[#6A6A6A]">{project.category}</td>
                      <td className="py-5 px-8 text-[#6A6A6A]">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-[0.05em] bg-[#111111]/5 text-[#111111]">
                          {project.projectType || "customised"}
                        </span>
                      </td>
                      <td className="py-5 px-8 text-[#111111] font-extrabold">{project.resultMetric || "—"}</td>
                      <td className="py-5 px-8">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-[0.05em] ${
                          project.featured
                            ? "bg-amber-50 text-amber-700 border border-amber-200"
                            : "bg-[#FCFBF8] text-[#A8A296] border border-[#E9E3DA]"
                        }`}>
                          {project.featured ? "Featured" : "Standard"}
                        </span>
                      </td>
                      <td className="py-5 px-8">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-[0.05em] ${
                          project.completed
                            ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                            : "bg-[#FCFBF8] text-[#A8A296] border border-[#E9E3DA]"
                        }`}>
                          {project.completed ? "Completed" : "In Progress"}
                        </span>
                      </td>
                      <td className="py-5 px-8 text-right">
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() => handleEditClick(project)}
                            className="p-2 hover:bg-[#111111]/5 rounded-[8px] text-[#111111] cursor-pointer"
                            title="Edit Project"
                          >
                            <Edit size={16} />
                          </button>
                          <button
                            onClick={() => handleDeleteClick(project._id!)}
                            className="p-2 hover:bg-red-50 rounded-[8px] text-red-600 cursor-pointer"
                            title="Delete Project"
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
          onClick={() => setEditingProject(null)}
          className="p-2.5 hover:bg-[#111111]/5 rounded-[12px] border border-[#E9E3DA] text-[#111111] cursor-pointer"
        >
          <ArrowLeft size={16} />
        </button>
        <div>
          <h2 className="text-[28px] font-extrabold tracking-tight">
            {editingProject._id ? "Edit Case Study" : "Add Portfolio Project"}
          </h2>
          <p className="text-[14px] text-[#6A6A6A] mt-1">Configure client details, technologies, result banners, and cover graphics.</p>
        </div>
      </div>

      <form onSubmit={handleSave} className="grid grid-cols-1 lg:grid-cols-[1.8fr_1fr] gap-8 items-start">
        {/* Left primary form */}
        <div className="bg-white border border-[#E9E3DA] rounded-[24px] p-8 shadow-[0_4px_20px_rgba(0,0,0,0.02)] flex flex-col gap-6">
          <h3 className="text-[16px] font-bold tracking-tight pb-4 border-b border-[#E9E3DA]">Project Information</h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="flex flex-col gap-2">
              <label className="text-[13px] font-bold uppercase tracking-[0.08em] text-[#6A6A6A]">
                Project Name / Title
              </label>
              <input
                type="text"
                name="title"
                required
                value={formState.title}
                onChange={handleChange}
                placeholder="e.g. Project Pulse Mobile App"
                className="w-full h-12 px-4 bg-[#FCFBF8] border border-[#E9E3DA] rounded-[12px] text-[14px] font-semibold outline-none focus:border-[#111111] transition-all"
              />
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-[13px] font-bold uppercase tracking-[0.08em] text-[#6A6A6A]">
                Client Name
              </label>
              <input
                type="text"
                name="client"
                value={formState.client || ""}
                onChange={handleChange}
                placeholder="e.g. Acme Corporation"
                className="w-full h-12 px-4 bg-[#FCFBF8] border border-[#E9E3DA] rounded-[12px] text-[14px] font-medium outline-none focus:border-[#111111] transition-all"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <div className="flex flex-col gap-2">
              <label className="text-[13px] font-bold uppercase tracking-[0.08em] text-[#6A6A6A]">
                Category
              </label>
              <select
                name="category"
                required
                value={formState.category}
                onChange={handleChange}
                className="w-full h-12 px-4 bg-[#FCFBF8] border border-[#E9E3DA] rounded-[12px] text-[14px] font-bold outline-none focus:border-[#111111] transition-all"
              >
                <option value="SaaS">SaaS Platform</option>
                <option value="Mobile">Mobile Application</option>
                <option value="Branding">Branding & Strategy</option>
                <option value="E-commerce">E-commerce Portal</option>
                <option value="Fintech">Fintech Solution</option>
              </select>
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-[13px] font-bold uppercase tracking-[0.08em] text-[#6A6A6A]">
                Project Type
              </label>
              <select
                name="projectType"
                required
                value={formState.projectType || "customised"}
                onChange={handleChange}
                className="w-full h-12 px-4 bg-[#FCFBF8] border border-[#E9E3DA] rounded-[12px] text-[14px] font-bold outline-none focus:border-[#111111] transition-all"
              >
                <option value="pre-built">Pre-built</option>
                <option value="customised">Customised</option>
              </select>
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-[13px] font-bold uppercase tracking-[0.08em] text-[#6A6A6A]">
                Impact Metric / Result
              </label>
              <input
                type="text"
                name="resultMetric"
                value={formState.resultMetric || ""}
                onChange={handleChange}
                placeholder="e.g. +320% user signups"
                className="w-full h-12 px-4 bg-[#FCFBF8] border border-[#E9E3DA] rounded-[12px] text-[14px] font-medium outline-none focus:border-[#111111] transition-all font-mono"
              />
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-[13px] font-bold uppercase tracking-[0.08em] text-[#6A6A6A]">
              Short Description / Excerpt
            </label>
            <textarea
              name="description"
              required
              rows={3}
              value={formState.description}
              onChange={handleChange}
              placeholder="Provide a concise 1-2 sentence overview of what this project accomplished..."
              className="w-full p-4 bg-[#FCFBF8] border border-[#E9E3DA] rounded-[12px] text-[14px] font-medium outline-none focus:border-[#111111] transition-all resize-none"
            />
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-[13px] font-bold uppercase tracking-[0.08em] text-[#6A6A6A]">
              Extended Case Study Content (Markdown)
            </label>
            <textarea
              name="detailContent"
              rows={8}
              value={formState.detailContent || ""}
              onChange={handleChange}
              placeholder="Write the deep-dive case study context here using Markdown layout structure..."
              className="w-full p-4 bg-[#FCFBF8] border border-[#E9E3DA] rounded-[12px] text-[14px] font-medium outline-none focus:border-[#111111] transition-all resize-none font-mono"
            />
          </div>
        </div>

        {/* Right Settings Panel */}
        <div className="flex flex-col gap-6 w-full">
          {/* Mockup parameters */}
          <div className="bg-white border border-[#E9E3DA] rounded-[24px] p-8 shadow-[0_4px_20px_rgba(0,0,0,0.02)] flex flex-col gap-6">
            <h3 className="text-[15px] font-bold tracking-tight pb-4 border-b border-[#E9E3DA]">Mockup Assets</h3>

            {/* Main Cover Image picker */}
            <div className="flex flex-col gap-2 relative">
              <div className="flex justify-between items-center">
                <label className="text-[13px] font-bold uppercase tracking-[0.08em] text-[#6A6A6A]">
                  Main Mockup Image URL
                </label>
                <button
                  type="button"
                  onClick={() => setShowMainImagePicker(!showMainImagePicker)}
                  className="flex items-center gap-1 text-[11px] font-bold text-[#111111] hover:text-[#111111]/70 transition-all bg-[#FCFBF8] border border-[#E9E3DA] px-2.5 py-1 rounded-[6px] cursor-pointer"
                >
                  <ImageIcon size={12} />
                  Choose Uploaded
                </button>
              </div>
              <input
                type="text"
                name="image"
                required
                value={formState.image}
                onChange={handleChange}
                placeholder="Paste direct URL or select asset..."
                className="w-full h-12 px-4 bg-[#FCFBF8] border border-[#E9E3DA] rounded-[12px] text-[14px] font-medium outline-none focus:border-[#111111] transition-all"
              />

              {showMainImagePicker && (
                <div className="absolute top-[76px] left-0 right-0 z-50 bg-white border border-[#E9E3DA] rounded-[16px] p-4 shadow-xl max-h-[220px] overflow-y-auto flex flex-col gap-2">
                  <div className="text-[11px] font-bold uppercase tracking-[0.08em] text-[#6A6A6A] pb-2 border-b border-[#E9E3DA]">
                    Select Project Mockup
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
                          setShowMainImagePicker(false);
                        }}
                        className="flex items-center gap-3 p-1.5 hover:bg-[#FCFBF8] border border-transparent hover:border-[#E9E3DA] rounded-[8px] text-left text-[12px] font-medium truncate cursor-pointer"
                      >
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={m.url} alt="" className="h-8 w-8 object-cover rounded-[4px] shrink-0" />
                        <span className="truncate">{m.fileName}</span>
                      </button>
                    ))
                  )}
                </div>
              )}
            </div>

            {/* Gallery input */}
            <div className="flex flex-col gap-2">
              <label className="text-[13px] font-bold uppercase tracking-[0.08em] text-[#6A6A6A]">
                Gallery Images (Comma Separated)
              </label>
              <input
                type="text"
                value={galleryInput}
                onChange={(e) => setGalleryInput(e.target.value)}
                placeholder="Paste comma separated image URLs..."
                className="w-full h-12 px-4 bg-[#FCFBF8] border border-[#E9E3DA] rounded-[12px] text-[14px] font-medium outline-none focus:border-[#111111] transition-all"
              />
            </div>

            {/* Tech stack */}
            <div className="flex flex-col gap-2">
              <label className="text-[13px] font-bold uppercase tracking-[0.08em] text-[#6A6A6A]">
                Technologies Used (Comma Separated)
              </label>
              <input
                type="text"
                value={techInput}
                onChange={(e) => setTechInput(e.target.value)}
                placeholder="e.g. Next.js, Framer Motion, Tailwind"
                className="w-full h-12 px-4 bg-[#FCFBF8] border border-[#E9E3DA] rounded-[12px] text-[14px] font-medium outline-none focus:border-[#111111] transition-all"
              />
            </div>

            {/* Link destinations */}
            <div className="flex flex-col gap-2">
              <label className="text-[13px] font-bold uppercase tracking-[0.08em] text-[#6A6A6A]">
                Live Product URL
              </label>
              <input
                type="text"
                name="liveUrl"
                value={formState.liveUrl || ""}
                onChange={handleChange}
                placeholder="e.g. https://projectpulse.studio"
                className="w-full h-12 px-4 bg-[#FCFBF8] border border-[#E9E3DA] rounded-[12px] text-[14px] font-medium outline-none focus:border-[#111111] transition-all"
              />
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-[13px] font-bold uppercase tracking-[0.08em] text-[#6A6A6A]">
                GitHub Repository URL
              </label>
              <input
                type="text"
                name="githubUrl"
                value={formState.githubUrl || ""}
                onChange={handleChange}
                placeholder="e.g. https://github.com/growthbridge/pulse"
                className="w-full h-12 px-4 bg-[#FCFBF8] border border-[#E9E3DA] rounded-[12px] text-[14px] font-medium outline-none focus:border-[#111111] transition-all"
              />
            </div>

            {/* Feature toggle check */}
            <div className="flex items-center justify-between p-4 rounded-[12px] bg-[#FCFBF8] border border-[#E9E3DA]">
              <div className="flex flex-col">
                <span className="text-[13px] font-bold text-[#111111]">Featured Project</span>
                <span className="text-[11px] text-[#6A6A6A]">Feature at homepage layout</span>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={formState.featured}
                  onChange={(e) => handleToggleChange("featured", e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-[#E9E3DA] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-[#E9E3DA] after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#111111]"></div>
              </label>
            </div>

            {/* Completed toggle check */}
            <div className="flex items-center justify-between p-4 rounded-[12px] bg-[#FCFBF8] border border-[#E9E3DA]">
              <div className="flex flex-col">
                <span className="text-[13px] font-bold text-[#111111]">Completed Project</span>
                <span className="text-[11px] text-[#6A6A6A]">Mark project as completed (adds tick mark)</span>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={formState.completed || false}
                  onChange={(e) => handleToggleChange("completed", e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-[#E9E3DA] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-[#E9E3DA] after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#111111]"></div>
              </label>
            </div>
          </div>

          {/* SEO Block */}
          <div className="bg-white border border-[#E9E3DA] rounded-[24px] p-8 shadow-[0_4px_20px_rgba(0,0,0,0.02)] flex flex-col gap-6">
            <div className="flex justify-between items-center pb-2 border-b border-[#E9E3DA]">
              <h3 className="text-[15px] font-bold tracking-tight">SEO optimization</h3>
              <button
                type="button"
                onClick={handleGenerateSEO}
                disabled={aiLoading}
                className="flex items-center gap-1 text-[11px] font-bold text-[#F4C542] hover:text-[#111111] transition-all bg-[#F4C542]/10 hover:bg-[#F4C542]/20 px-2.5 py-1 rounded-[6px] cursor-pointer disabled:opacity-50"
              >
                {aiLoading ? <Loader2 size={12} className="animate-spin" /> : <Sparkles size={12} />}
                Generate with AI
              </button>
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-[13px] font-bold uppercase tracking-[0.08em] text-[#6A6A6A]">
                SEO Meta Title
              </label>
              <input
                type="text"
                name="seoTitle"
                value={formState.seoTitle || ""}
                onChange={handleChange}
                placeholder="Case Study page header title tag..."
                className="w-full h-12 px-4 bg-[#FCFBF8] border border-[#E9E3DA] rounded-[12px] text-[14px] font-medium outline-none focus:border-[#111111] transition-all"
              />
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-[13px] font-bold uppercase tracking-[0.08em] text-[#6A6A6A]">
                SEO Meta Description
              </label>
              <textarea
                name="seoDescription"
                value={formState.seoDescription || ""}
                onChange={handleChange}
                rows={3}
                placeholder="Brief meta snippet describing key results achieved..."
                className="w-full p-4 bg-[#FCFBF8] border border-[#E9E3DA] rounded-[12px] text-[14px] font-medium outline-none focus:border-[#111111] transition-all resize-none"
              />
            </div>
          </div>

          {/* Save buttons */}
          <div className="flex gap-4">
            <button
              type="button"
              onClick={() => setEditingProject(null)}
              className="flex-1 h-12 border border-[#E9E3DA] hover:border-[#111111] rounded-[12px] text-[#111111] text-[13px] font-bold transition-all cursor-pointer bg-white"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isPending}
              className="flex-1 flex items-center justify-center gap-2 h-12 rounded-[12px] bg-[#111111] hover:bg-[#111111]/90 text-white text-[13px] font-bold shadow-sm transition-all cursor-pointer disabled:opacity-60"
            >
              {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : "Save Project"}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
