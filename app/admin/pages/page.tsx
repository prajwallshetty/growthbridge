"use client";

import React, { useState, useEffect, useTransition } from "react";
import { getPages, savePage, deletePage } from "@/lib/actions/cms";
import { Loader2, Plus, Edit, Trash2, ArrowLeft, Eye, Sparkles } from "lucide-react";

interface PageItem {
  _id?: string;
  title: string;
  slug: string;
  content: string;
  seoTitle?: string;
  seoDescription?: string;
  active: boolean;
}

export default function PagesCmsPage() {
  const [pages, setPages] = useState<PageItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isPending, startTransition] = useTransition();
  const [aiLoading, setAiLoading] = useState(false);
  const [editingPage, setEditingPage] = useState<PageItem | null>(null);
  const [activeTab, setActiveTab] = useState<"write" | "preview">("write");

  const [formState, setFormState] = useState<PageItem>({
    title: "",
    slug: "",
    content: "",
    seoTitle: "",
    seoDescription: "",
    active: true,
  });

  const fetchPages = async () => {
    try {
      setIsLoading(true);
      const data = await getPages();
      setPages(data);
    } catch (err) {
      console.error("Failed to load CMS pages:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPages();
  }, []);

  const handleEditClick = (page: PageItem) => {
    setEditingPage(page);
    setFormState({ ...page });
  };

  const handleCreateClick = () => {
    const defaultPage: PageItem = {
      title: "",
      slug: "",
      content: "",
      seoTitle: "",
      seoDescription: "",
      active: true,
    };
    setEditingPage(defaultPage);
    setFormState(defaultPage);
  };

  const handleDeleteClick = async (id: string) => {
    if (!confirm("Are you sure you want to delete this static page?")) return;
    try {
      await deletePage(id);
      fetchPages();
    } catch (err) {
      alert("Delete failed");
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    setFormState((prev) => {
      const updated = {
        ...prev,
        [name]: type === "checkbox" ? (e.target as HTMLInputElement).checked : value,
      };
      // Auto-generate slug from title for new pages
      if (name === "title" && !editingPage?._id) {
        updated.slug = value
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/(^-|-$)+/g, "");
      }
      return updated;
    });
  };

  const handleToggleChange = (name: string, checked: boolean) => {
    setFormState((prev) => ({
      ...prev,
      [name]: checked,
    }));
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    startTransition(async () => {
      try {
        await savePage(formState);
        setEditingPage(null);
        fetchPages();
      } catch (err) {
        alert("Failed to save static page");
      }
    });
  };

  // Gemini SEO helper
  const handleGenerateSEO = async () => {
    if (!formState.content) {
      alert("Please write page content first so Gemini can optimize SEO details.");
      return;
    }
    setAiLoading(true);
    try {
      const prompt = `Optimize the following web page content into a clean SEO Meta Title (max 60 chars) and Meta Description (max 150 chars). 
      Return JSON format exactly like:
      {
        "seoTitle": "...",
        "seoDescription": "..."
      }
      Page Title: "${formState.title}"
      Content: "${formState.content.substring(0, 1000)}"`;
      
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
          seoTitle: `${prev.title} | Growth Bridge`,
          seoDescription: generated.substring(0, 150),
        }));
      }
    } catch (err) {
      alert("AI failed to optimize Page SEO");
    } finally {
      setAiLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-3">
        <Loader2 className="h-8 w-8 animate-spin text-[#111111]" />
        <span className="text-[13px] font-semibold text-[#6A6A6A]">Loading pages...</span>
      </div>
    );
  }

  // LIST VIEW
  if (!editingPage) {
    return (
      <div className="flex flex-col gap-10">
        <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
          <div>
            <h2 className="text-[28px] font-extrabold tracking-tight">Static Pages CMS</h2>
            <p className="text-[14px] text-[#6A6A6A] mt-1">Manage subpages like About, Contact, Terms of Service, and Privacy Policies.</p>
          </div>
          <button
            onClick={handleCreateClick}
            className="flex items-center justify-center gap-2 h-12 px-6 rounded-[12px] bg-[#111111] hover:bg-[#111111]/90 text-white text-[13px] font-bold shadow-sm transition-all cursor-pointer shrink-0"
          >
            <Plus size={16} />
            Create Page
          </button>
        </div>

        <div className="bg-white border border-[#E9E3DA] rounded-[24px] overflow-hidden shadow-[0_4px_20px_rgba(0,0,0,0.02)]">
          <div className="p-8 border-b border-[#E9E3DA]">
            <h3 className="text-[16px] font-bold tracking-tight">Active Pages Directory</h3>
          </div>

          {pages.length === 0 ? (
            <div className="text-center py-16 text-[#A8A296] text-[13px] font-medium">
              No static pages found. Create your first page to start customizing subpage routes.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-[#FCFBF8] border-b border-[#E9E3DA] text-[11px] font-bold uppercase tracking-[0.08em] text-[#6A6A6A]">
                    <th className="py-4 px-8">Title</th>
                    <th className="py-4 px-8">Slug URL</th>
                    <th className="py-4 px-8">Status</th>
                    <th className="py-4 px-8 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E9E3DA]/60">
                  {pages.map((page) => (
                    <tr key={page._id} className="hover:bg-[#FCFBF8]/40 transition-colors text-[13px] font-semibold">
                      <td className="py-5 px-8 text-[#111111]">{page.title}</td>
                      <td className="py-5 px-8 text-[#6A6A6A] font-mono text-[12px]">/{page.slug}</td>
                      <td className="py-5 px-8">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-[0.05em] ${
                          page.active
                            ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                            : "bg-[#FCFBF8] text-[#A8A296] border border-[#E9E3DA]"
                        }`}>
                          {page.active ? "Active" : "Hidden"}
                        </span>
                      </td>
                      <td className="py-5 px-8 text-right">
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() => handleEditClick(page)}
                            className="p-2 hover:bg-[#111111]/5 rounded-[8px] text-[#111111] cursor-pointer"
                            title="Edit Page"
                          >
                            <Edit size={16} />
                          </button>
                          <button
                            onClick={() => handleDeleteClick(page._id!)}
                            className="p-2 hover:bg-red-50 rounded-[8px] text-red-600 cursor-pointer"
                            title="Delete Page"
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

  // EDIT VIEW
  return (
    <div className="flex flex-col gap-10">
      <div className="flex items-center gap-4">
        <button
          onClick={() => setEditingPage(null)}
          className="p-2.5 hover:bg-[#111111]/5 rounded-[12px] border border-[#E9E3DA] text-[#111111] cursor-pointer"
        >
          <ArrowLeft size={16} />
        </button>
        <div>
          <h2 className="text-[28px] font-extrabold tracking-tight">
            {editingPage._id ? "Edit Static Page" : "Create Static Page"}
          </h2>
          <p className="text-[14px] text-[#6A6A6A] mt-1">Design customizable layout content for specific subpage routes.</p>
        </div>
      </div>

      <form onSubmit={handleSave} className="grid grid-cols-1 lg:grid-cols-[1.8fr_1fr] gap-8 items-start">
        {/* Left primary form panel */}
        <div className="bg-white border border-[#E9E3DA] rounded-[24px] p-8 shadow-[0_4px_20px_rgba(0,0,0,0.02)] flex flex-col gap-6">
          <div className="flex justify-between items-center pb-4 border-b border-[#E9E3DA]">
            <h3 className="text-[16px] font-bold tracking-tight">Page Composer</h3>
            
            {/* Tabs write/preview */}
            <div className="flex bg-[#FCFBF8] border border-[#E9E3DA] p-1 rounded-[10px]">
              <button
                type="button"
                onClick={() => setActiveTab("write")}
                className={`px-3 py-1.5 rounded-[6px] text-[11px] font-bold uppercase tracking-[0.05em] cursor-pointer transition-all ${
                  activeTab === "write" ? "bg-[#111111] text-white" : "text-[#6A6A6A]"
                }`}
              >
                Write
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("preview")}
                className={`px-3 py-1.5 rounded-[6px] text-[11px] font-bold uppercase tracking-[0.05em] cursor-pointer transition-all ${
                  activeTab === "preview" ? "bg-[#111111] text-white" : "text-[#6A6A6A]"
                }`}
              >
                Preview
              </button>
            </div>
          </div>

          {activeTab === "write" ? (
            <div className="flex flex-col gap-6">
              <div className="flex flex-col gap-2">
                <label className="text-[13px] font-bold uppercase tracking-[0.08em] text-[#6A6A6A]">
                  Page Title
                </label>
                <input
                  type="text"
                  name="title"
                  required
                  value={formState.title}
                  onChange={handleChange}
                  placeholder="e.g. Terms of Service"
                  className="w-full h-12 px-4 bg-[#FCFBF8] border border-[#E9E3DA] rounded-[12px] text-[14px] font-semibold outline-none focus:border-[#111111] transition-all"
                />
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-[13px] font-bold uppercase tracking-[0.08em] text-[#6A6A6A]">
                  Markdown Layout Content
                </label>
                <textarea
                  name="content"
                  required
                  rows={15}
                  value={formState.content}
                  onChange={handleChange}
                  placeholder="# Terms of Service&#10;&#10;Write the content page outline here..."
                  className="w-full p-4 bg-[#FCFBF8] border border-[#E9E3DA] rounded-[12px] text-[14px] font-medium outline-none focus:border-[#111111] transition-all resize-none font-mono"
                />
              </div>
            </div>
          ) : (
            <div className="prose prose-stone max-w-none bg-[#FCFBF8] border border-[#E9E3DA] rounded-[16px] p-6 min-h-[300px] text-[14px] font-medium leading-relaxed whitespace-pre-wrap">
              {formState.content || <em className="text-[#A8A296]">Write page layout details to preview.</em>}
            </div>
          )}
        </div>

        {/* Right side settings panel */}
        <div className="flex flex-col gap-6 w-full">
          <div className="bg-white border border-[#E9E3DA] rounded-[24px] p-8 shadow-[0_4px_20px_rgba(0,0,0,0.02)] flex flex-col gap-6">
            <h3 className="text-[15px] font-bold tracking-tight pb-4 border-b border-[#E9E3DA]">Settings</h3>

            <div className="flex flex-col gap-2">
              <label className="text-[13px] font-bold uppercase tracking-[0.08em] text-[#6A6A6A]">
                URL Route Slug
              </label>
              <input
                type="text"
                name="slug"
                required
                value={formState.slug}
                onChange={handleChange}
                placeholder="e.g. terms-of-service"
                className="w-full h-12 px-4 bg-[#FCFBF8] border border-[#E9E3DA] rounded-[12px] text-[14px] font-medium outline-none focus:border-[#111111] transition-all"
              />
            </div>

            <div className="flex items-center justify-between p-4 rounded-[12px] bg-[#FCFBF8] border border-[#E9E3DA]">
              <div className="flex flex-col">
                <span className="text-[13px] font-bold text-[#111111]">Active Status</span>
                <span className="text-[11px] text-[#6A6A6A]">Visible to public website</span>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={formState.active}
                  onChange={(e) => handleToggleChange("active", e.target.checked)}
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
                placeholder="Search engine index tag title..."
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
                placeholder="Search index snippet description..."
                className="w-full p-4 bg-[#FCFBF8] border border-[#E9E3DA] rounded-[12px] text-[14px] font-medium outline-none focus:border-[#111111] transition-all resize-none"
              />
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex gap-4">
            <button
              type="button"
              onClick={() => setEditingPage(null)}
              className="flex-1 h-12 border border-[#E9E3DA] hover:border-[#111111] rounded-[12px] text-[#111111] text-[13px] font-bold transition-all cursor-pointer bg-white"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isPending}
              className="flex-1 flex items-center justify-center gap-2 h-12 rounded-[12px] bg-[#111111] hover:bg-[#111111]/90 text-white text-[13px] font-bold shadow-sm transition-all cursor-pointer disabled:opacity-60"
            >
              {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : "Save Page"}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
