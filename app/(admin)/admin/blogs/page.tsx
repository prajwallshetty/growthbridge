"use client";

import React, { useState, useEffect, useTransition } from "react";
import { getBlogs, saveBlog, deleteBlog } from "@/lib/actions/cms";
import { Loader2, Plus, Edit, Trash2, Eye, ArrowLeft, Sparkles, Check, Image as ImageIcon } from "lucide-react";

interface BlogItem {
  _id?: string;
  title: string;
  subtitle?: string;
  slug: string;
  content: string;
  author: string;
  image?: string;
  readTime: number;
  tags: string[];
  categories: string[];
  status: "Draft" | "Published" | "Scheduled";
  publishDate?: string;
  seoTitle?: string;
  seoDescription?: string;
  seoKeywords: string[];
}

export default function BlogsCmsPage() {
  const [blogs, setBlogs] = useState<BlogItem[]>([]);
  const [mediaList, setMediaList] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isPending, startTransition] = useTransition();
  const [aiLoading, setAiLoading] = useState(false);
  const [editingBlog, setEditingBlog] = useState<BlogItem | null>(null);
  const [activeTab, setActiveTab] = useState<"write" | "preview">("write");
  
  // Form states
  const [formState, setFormState] = useState<BlogItem>({
    title: "",
    subtitle: "",
    slug: "",
    content: "",
    author: "",
    image: "",
    readTime: 3,
    tags: [],
    categories: [],
    status: "Draft",
    seoTitle: "",
    seoDescription: "",
    seoKeywords: [],
  });

  // Auxiliary state for list items input
  const [tagInput, setTagInput] = useState("");
  const [categoryInput, setCategoryInput] = useState("");
  const [keywordInput, setKeywordInput] = useState("");
  const [showMediaPicker, setShowMediaPicker] = useState(false);

  const fetchBlogsAndMedia = async () => {
    try {
      setIsLoading(true);
      const data = await getBlogs();
      setBlogs(data);

      const mediaRes = await fetch("/api/media");
      const mediaData = await mediaRes.json();
      if (mediaData.data) {
        setMediaList(mediaData.data);
      }
    } catch (err) {
      console.error("Error loading blog details:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchBlogsAndMedia();
  }, []);

  const handleEditClick = (blog: BlogItem) => {
    setEditingBlog(blog);
    setFormState({ ...blog });
    setTagInput(blog.tags?.join(", ") || "");
    setCategoryInput(blog.categories?.join(", ") || "");
    setKeywordInput(blog.seoKeywords?.join(", ") || "");
  };

  const handleCreateClick = () => {
    setEditingBlog({
      title: "",
      slug: "",
      content: "",
      author: "Growth Bridge Team",
      status: "Draft",
      readTime: 3,
      tags: [],
      categories: [],
      seoKeywords: [],
    });
    setFormState({
      title: "",
      subtitle: "",
      slug: "",
      content: "",
      author: "Growth Bridge Team",
      image: "",
      readTime: 3,
      tags: [],
      categories: [],
      status: "Draft",
      seoTitle: "",
      seoDescription: "",
      seoKeywords: [],
    });
    setTagInput("");
    setCategoryInput("");
    setKeywordInput("");
  };

  const handleDeleteClick = async (id: string) => {
    if (!confirm("Are you sure you want to delete this blog post?")) return;
    try {
      await deleteBlog(id);
      fetchBlogsAndMedia();
    } catch (err) {
      alert("Delete failed");
    }
  };

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormState((prev) => {
      const updated = { ...prev, [name]: value };
      // Auto-generate slug from title if writing a new post
      if (name === "title" && !editingBlog?._id) {
        updated.slug = value
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/(^-|-$)+/g, "");
      }
      return updated;
    });
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Parse tag/category inputs
    const tags = tagInput.split(",").map(t => t.trim()).filter(Boolean);
    const categories = categoryInput.split(",").map(c => c.trim()).filter(Boolean);
    const seoKeywords = keywordInput.split(",").map(k => k.trim()).filter(Boolean);

    const payload = {
      ...formState,
      tags,
      categories,
      seoKeywords,
    };

    startTransition(async () => {
      try {
        await saveBlog(payload);
        setEditingBlog(null);
        fetchBlogsAndMedia();
      } catch (err) {
        alert("Failed to save blog post");
      }
    });
  };

  // Gemini AI Tools
  const handleGenerateAIOutline = async () => {
    if (!formState.title) {
      alert("Please enter a title first.");
      return;
    }
    setAiLoading(true);
    try {
      const prompt = `Write a clean Markdown outline for a blog post titled "${formState.title}". Include intro, key talking points, and conclusion. Do not include frontmatter or html.`;
      const { generateCopy } = await import("@/lib/actions/ai");
      const generated = await generateCopy(prompt);
      if (generated && !generated.startsWith("AI Generation failed")) {
        setFormState(prev => ({ ...prev, content: generated }));
      }
    } catch (err) {
      alert("AI failed to generate outline");
    } finally {
      setAiLoading(false);
    }
  };

  const handleGenerateSEO = async () => {
    if (!formState.content) {
      alert("Please write some content first so AI can extract SEO details.");
      return;
    }
    setAiLoading(true);
    try {
      const prompt = `Analyze this blog post content and generate a SEO title and a SEO description (max 150 chars). 
      Return JSON format exactly like this:
      {
        "seoTitle": "...",
        "seoDescription": "..."
      }
      Content: "${formState.content.substring(0, 1000)}"`;
      
      const { generateCopy } = await import("@/lib/actions/ai");
      const generated = await generateCopy(prompt);
      
      // Attempt to parse json
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
        // Fallback
        setFormState(prev => ({
          ...prev,
          seoTitle: formState.title,
          seoDescription: generated.substring(0, 150),
        }));
      }
    } catch (err) {
      alert("AI failed to generate SEO metadata");
    } finally {
      setAiLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-3">
        <Loader2 className="h-8 w-8 animate-spin text-[#111111]" />
        <span className="text-[13px] font-semibold text-[#6A6A6A]">Loading blogs...</span>
      </div>
    );
  }

  // LIST STATE
  if (!editingBlog) {
    return (
      <div className="flex flex-col gap-10">
        <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
          <div>
            <h2 className="text-[28px] font-extrabold tracking-tight">Blog CMS</h2>
            <p className="text-[14px] text-[#6A6A6A] mt-1">Create, edit, or delete articles and manage SEO visibility filters.</p>
          </div>
          <button
            onClick={handleCreateClick}
            className="flex items-center justify-center gap-2 h-12 px-6 rounded-[12px] bg-[#111111] hover:bg-[#111111]/90 text-white text-[13px] font-bold shadow-sm transition-all cursor-pointer shrink-0"
          >
            <Plus size={16} />
            Write Article
          </button>
        </div>

        <div className="bg-white border border-[#E9E3DA] rounded-[24px] overflow-hidden shadow-[0_4px_20px_rgba(0,0,0,0.02)]">
          <div className="p-8 border-b border-[#E9E3DA]">
            <h3 className="text-[16px] font-bold tracking-tight">Articles Directory</h3>
          </div>
          
          {blogs.length === 0 ? (
            <div className="text-center py-16 text-[#A8A296] text-[13px] font-medium">
              No blog posts found. Click "Write Article" to publish your first post.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-[#FCFBF8] border-b border-[#E9E3DA] text-[11px] font-bold uppercase tracking-[0.08em] text-[#6A6A6A]">
                    <th className="py-4 px-8">Title</th>
                    <th className="py-4 px-8">Status</th>
                    <th className="py-4 px-8">Author</th>
                    <th className="py-4 px-8">Read Time</th>
                    <th className="py-4 px-8 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E9E3DA]/60">
                  {blogs.map((blog) => (
                    <tr key={blog._id} className="hover:bg-[#FCFBF8]/40 transition-colors text-[13px] font-semibold">
                      <td className="py-5 px-8 max-w-[300px]">
                        <div className="flex flex-col gap-0.5">
                          <span className="text-[#111111] truncate">{blog.title}</span>
                          <span className="text-[11px] text-[#A8A296] truncate font-medium">/{blog.slug}</span>
                        </div>
                      </td>
                      <td className="py-5 px-8">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-[0.05em] ${
                          blog.status === "Published"
                            ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                            : "bg-amber-50 text-amber-700 border border-amber-200"
                        }`}>
                          {blog.status}
                        </span>
                      </td>
                      <td className="py-5 px-8 text-[#6A6A6A]">{blog.author}</td>
                      <td className="py-5 px-8 text-[#6A6A6A]">{blog.readTime} min read</td>
                      <td className="py-5 px-8 text-right">
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() => handleEditClick(blog)}
                            className="p-2 hover:bg-[#111111]/5 rounded-[8px] text-[#111111] cursor-pointer"
                            title="Edit Article"
                          >
                            <Edit size={16} />
                          </button>
                          <button
                            onClick={() => handleDeleteClick(blog._id!)}
                            className="p-2 hover:bg-red-50 rounded-[8px] text-red-600 cursor-pointer"
                            title="Delete Article"
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

  // EDIT / NEW STATE
  return (
    <div className="flex flex-col gap-10">
      <div className="flex items-center gap-4">
        <button
          onClick={() => setEditingBlog(null)}
          className="p-2.5 hover:bg-[#111111]/5 rounded-[12px] border border-[#E9E3DA] text-[#111111] cursor-pointer"
        >
          <ArrowLeft size={16} />
        </button>
        <div>
          <h2 className="text-[28px] font-extrabold tracking-tight">
            {editingBlog._id ? "Edit Article" : "Write New Article"}
          </h2>
          <p className="text-[14px] text-[#6A6A6A] mt-1">Compose detailed blog content and customize search previews.</p>
        </div>
      </div>

      <form onSubmit={handleSave} className="grid grid-cols-1 lg:grid-cols-[1.8fr_1fr] gap-8 items-start">
        {/* Left main editor panel */}
        <div className="bg-white border border-[#E9E3DA] rounded-[24px] p-8 shadow-[0_4px_20px_rgba(0,0,0,0.02)] flex flex-col gap-6">
          <div className="flex justify-between items-center pb-4 border-b border-[#E9E3DA]">
            <h3 className="text-[16px] font-bold tracking-tight">Post Composition</h3>
            
            {/* Editor vs Preview tabs */}
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
              {/* Title & Subtitle */}
              <div className="flex flex-col gap-2">
                <label className="text-[13px] font-bold uppercase tracking-[0.08em] text-[#6A6A6A]">
                  Article Title
                </label>
                <input
                  type="text"
                  name="title"
                  required
                  value={formState.title}
                  onChange={handleFormChange}
                  placeholder="e.g. Navigating Digital Aesthetics in Web Design"
                  className="w-full h-12 px-4 bg-[#FCFBF8] border border-[#E9E3DA] rounded-[12px] text-[14px] font-semibold outline-none focus:border-[#111111] transition-all"
                />
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-[13px] font-bold uppercase tracking-[0.08em] text-[#6A6A6A]">
                  Subtitle / Excerpt
                </label>
                <input
                  type="text"
                  name="subtitle"
                  value={formState.subtitle}
                  onChange={handleFormChange}
                  placeholder="e.g. A review of minimalism, micro-interactions, and premium layouts in modern web design."
                  className="w-full h-12 px-4 bg-[#FCFBF8] border border-[#E9E3DA] rounded-[12px] text-[14px] font-medium outline-none focus:border-[#111111] transition-all"
                />
              </div>

              {/* Editor Workspace */}
              <div className="flex flex-col gap-2">
                <div className="flex justify-between items-center">
                  <label className="text-[13px] font-bold uppercase tracking-[0.08em] text-[#6A6A6A]">
                    Markdown Content Body
                  </label>
                  <button
                    type="button"
                    onClick={handleGenerateAIOutline}
                    disabled={aiLoading}
                    className="flex items-center gap-1 text-[11px] font-bold text-[#F4C542] hover:text-[#111111] transition-all bg-[#F4C542]/10 hover:bg-[#F4C542]/20 px-2.5 py-1 rounded-[6px] cursor-pointer disabled:opacity-50"
                  >
                    {aiLoading ? <Loader2 size={12} className="animate-spin" /> : <Sparkles size={12} />}
                    Generate Draft Outline (Gemini AI)
                  </button>
                </div>
                <textarea
                  name="content"
                  required
                  rows={15}
                  value={formState.content}
                  onChange={handleFormChange}
                  placeholder="Write your article in Markdown syntax here..."
                  className="w-full p-4 bg-[#FCFBF8] border border-[#E9E3DA] rounded-[12px] text-[14px] font-medium outline-none focus:border-[#111111] transition-all resize-none font-mono"
                />
              </div>
            </div>
          ) : (
            <div className="prose prose-stone max-w-none bg-[#FCFBF8] border border-[#E9E3DA] rounded-[16px] p-6 min-h-[300px] text-[14px] font-medium leading-relaxed whitespace-pre-wrap">
              {formState.content || <em className="text-[#A8A296]">Write some content to see a live preview here.</em>}
            </div>
          )}
        </div>

        {/* Right Settings & metadata sidebar */}
        <div className="flex flex-col gap-6 w-full">
          {/* Metadata Block */}
          <div className="bg-white border border-[#E9E3DA] rounded-[24px] p-8 shadow-[0_4px_20px_rgba(0,0,0,0.02)] flex flex-col gap-6">
            <h3 className="text-[15px] font-bold tracking-tight pb-4 border-b border-[#E9E3DA]">Article Parameters</h3>

            <div className="flex flex-col gap-2">
              <label className="text-[13px] font-bold uppercase tracking-[0.08em] text-[#6A6A6A]">
                Post Slug (URL)
              </label>
              <input
                type="text"
                name="slug"
                required
                value={formState.slug}
                onChange={handleFormChange}
                placeholder="e.g. digital-aesthetics-design"
                className="w-full h-12 px-4 bg-[#FCFBF8] border border-[#E9E3DA] rounded-[12px] text-[14px] font-medium outline-none focus:border-[#111111] transition-all"
              />
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-[13px] font-bold uppercase tracking-[0.08em] text-[#6A6A6A]">
                Author Name
              </label>
              <input
                type="text"
                name="author"
                required
                value={formState.author}
                onChange={handleFormChange}
                placeholder="e.g. Prajwal Shetty"
                className="w-full h-12 px-4 bg-[#FCFBF8] border border-[#E9E3DA] rounded-[12px] text-[14px] font-medium outline-none focus:border-[#111111] transition-all"
              />
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-[13px] font-bold uppercase tracking-[0.08em] text-[#6A6A6A]">
                Read Time (Minutes)
              </label>
              <input
                type="number"
                name="readTime"
                min={1}
                required
                value={formState.readTime}
                onChange={handleFormChange}
                className="w-full h-12 px-4 bg-[#FCFBF8] border border-[#E9E3DA] rounded-[12px] text-[14px] font-medium outline-none focus:border-[#111111] transition-all"
              />
            </div>

            {/* Image Selector */}
            <div className="flex flex-col gap-2 relative">
              <div className="flex justify-between items-center">
                <label className="text-[13px] font-bold uppercase tracking-[0.08em] text-[#6A6A6A]">
                  Cover Image URL
                </label>
                <button
                  type="button"
                  onClick={() => setShowMediaPicker(!showMediaPicker)}
                  className="flex items-center gap-1 text-[11px] font-bold text-[#111111] hover:text-[#111111]/70 transition-all bg-[#FCFBF8] border border-[#E9E3DA] px-2.5 py-1 rounded-[6px] cursor-pointer"
                >
                  <ImageIcon size={12} />
                  Choose Uploaded
                </button>
              </div>
              <input
                type="text"
                name="image"
                value={formState.image || ""}
                onChange={handleFormChange}
                placeholder="Paste URL or click Choose Uploaded..."
                className="w-full h-12 px-4 bg-[#FCFBF8] border border-[#E9E3DA] rounded-[12px] text-[14px] font-medium outline-none focus:border-[#111111] transition-all"
              />

              {showMediaPicker && (
                <div className="absolute top-[76px] left-0 right-0 z-50 bg-white border border-[#E9E3DA] rounded-[16px] p-4 shadow-xl max-h-[220px] overflow-y-auto flex flex-col gap-2">
                  <div className="text-[11px] font-bold uppercase tracking-[0.08em] text-[#6A6A6A] pb-2 border-b border-[#E9E3DA]">
                    Select Asset URL
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
                          setShowMediaPicker(false);
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

            <div className="flex flex-col gap-2">
              <label className="text-[13px] font-bold uppercase tracking-[0.08em] text-[#6A6A6A]">
                Post Status
              </label>
              <select
                name="status"
                value={formState.status}
                onChange={handleFormChange}
                className="w-full h-12 px-4 bg-[#FCFBF8] border border-[#E9E3DA] rounded-[12px] text-[14px] font-bold outline-none focus:border-[#111111] transition-all"
              >
                <option value="Draft">Draft</option>
                <option value="Published">Published</option>
                <option value="Scheduled">Scheduled</option>
              </select>
            </div>

            {/* List arrays parsed on save */}
            <div className="flex flex-col gap-2">
              <label className="text-[13px] font-bold uppercase tracking-[0.08em] text-[#6A6A6A]">
                Tags (Comma Separated)
              </label>
              <input
                type="text"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                placeholder="e.g. Design, Tech, Studio"
                className="w-full h-12 px-4 bg-[#FCFBF8] border border-[#E9E3DA] rounded-[12px] text-[14px] font-medium outline-none focus:border-[#111111] transition-all"
              />
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-[13px] font-bold uppercase tracking-[0.08em] text-[#6A6A6A]">
                Categories (Comma Separated)
              </label>
              <input
                type="text"
                value={categoryInput}
                onChange={(e) => setCategoryInput(e.target.value)}
                placeholder="e.g. Case Study, Thought Piece"
                className="w-full h-12 px-4 bg-[#FCFBF8] border border-[#E9E3DA] rounded-[12px] text-[14px] font-medium outline-none focus:border-[#111111] transition-all"
              />
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
                Meta Title
              </label>
              <input
                type="text"
                name="seoTitle"
                value={formState.seoTitle || ""}
                onChange={handleFormChange}
                placeholder="Search engine title tag..."
                className="w-full h-12 px-4 bg-[#FCFBF8] border border-[#E9E3DA] rounded-[12px] text-[14px] font-medium outline-none focus:border-[#111111] transition-all"
              />
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-[13px] font-bold uppercase tracking-[0.08em] text-[#6A6A6A]">
                Meta Description
              </label>
              <textarea
                name="seoDescription"
                value={formState.seoDescription || ""}
                onChange={handleFormChange}
                rows={3}
                placeholder="Search engine brief snippet description..."
                className="w-full p-4 bg-[#FCFBF8] border border-[#E9E3DA] rounded-[12px] text-[14px] font-medium outline-none focus:border-[#111111] transition-all resize-none"
              />
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-[13px] font-bold uppercase tracking-[0.08em] text-[#6A6A6A]">
                Keywords (Comma Separated)
              </label>
              <input
                type="text"
                value={keywordInput}
                onChange={(e) => setKeywordInput(e.target.value)}
                placeholder="e.g. engineering, design studio, growth bridge"
                className="w-full h-12 px-4 bg-[#FCFBF8] border border-[#E9E3DA] rounded-[12px] text-[14px] font-medium outline-none focus:border-[#111111] transition-all"
              />
            </div>
          </div>

          {/* Form Actions footer */}
          <div className="flex gap-4">
            <button
              type="button"
              onClick={() => setEditingBlog(null)}
              className="flex-1 h-12 border border-[#E9E3DA] hover:border-[#111111] rounded-[12px] text-[#111111] text-[13px] font-bold transition-all cursor-pointer bg-white"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isPending}
              className="flex-1 flex items-center justify-center gap-2 h-12 rounded-[12px] bg-[#111111] hover:bg-[#111111]/90 text-white text-[13px] font-bold shadow-sm transition-all cursor-pointer disabled:opacity-60"
            >
              {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : "Save Article"}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
