"use client";

import React, { useState, useEffect, useTransition } from "react";
import { getHomepageConfig, saveHomepageConfig } from "@/lib/actions/cms";
import { Loader2, Sparkles, Check, Save } from "lucide-react";

export default function HomepageCmsPage() {
  const [config, setConfig] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isPending, startTransition] = useTransition();
  const [aiLoading, setAiLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    async function loadConfig() {
      try {
        const data = await getHomepageConfig();
        setConfig(data);
      } catch (err) {
        setError("Failed to load homepage configuration.");
      } finally {
        setIsLoading(false);
      }
    }
    loadConfig();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    setConfig((prev: any) => ({
      ...prev,
      [name]: type === "checkbox" ? (e.target as HTMLInputElement).checked : value,
    }));
  };

  const handleToggleChange = (name: string, checked: boolean) => {
    setConfig((prev: any) => ({
      ...prev,
      [name]: checked,
    }));
  };

  const handleSave = () => {
    setError("");
    setSuccess("");
    startTransition(async () => {
      try {
        const saved = await saveHomepageConfig(config);
        setConfig(saved);
        setSuccess("Homepage configuration updated successfully.");
      } catch (err: any) {
        setError(err?.message || "Failed to save homepage settings.");
      }
    });
  };

  // AI copywriting helper
  const handleOptimizeDescription = async () => {
    setError("");
    setAiLoading(true);
    try {
      // Call standard server action for AI content generation
      const prompt = `You are a premium branding copywriter. Rewrite the following homepage hero description for a digital studio to make it more compelling, concise, and professional, maintaining an elegant, premium tone. Keep it under 160 characters. Current description: "${config.heroDescription}"`;
      
      // Let's call the server action we will implement or define in our AI helper
      const { generateCopy } = await import("@/lib/actions/ai");
      const optimized = await generateCopy(prompt);
      if (optimized && !optimized.startsWith("AI Generation failed")) {
        setConfig((prev: any) => ({ ...prev, heroDescription: optimized.trim() }));
        setSuccess("Optimized description using Google Gemini AI.");
      } else {
        setError(optimized || "AI optimize request failed.");
      }
    } catch (err: any) {
      setError(err?.message || "Gemini AI generation failed.");
    } finally {
      setAiLoading(false);
    }
  };

  const handleOptimizeTitle = async () => {
    setError("");
    setAiLoading(true);
    try {
      const prompt = `You are a premium branding copywriter. Rewrite the following homepage hero headline for a creative engineering agency to be punchy, premium, and inspiring. Keep it to 5-8 words. Current headline: "${config.heroTitle}"`;
      const { generateCopy } = await import("@/lib/actions/ai");
      const optimized = await generateCopy(prompt);
      if (optimized && !optimized.startsWith("AI Generation failed")) {
        setConfig((prev: any) => ({ ...prev, heroTitle: optimized.trim() }));
        setSuccess("Optimized headline using Google Gemini AI.");
      } else {
        setError(optimized || "AI optimize request failed.");
      }
    } catch (err: any) {
      setError(err?.message || "Gemini AI generation failed.");
    } finally {
      setAiLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-3">
        <Loader2 className="h-8 w-8 animate-spin text-[#111111]" />
        <span className="text-[13px] font-semibold text-[#6A6A6A]">Loading configurations...</span>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-10">
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
        <div>
          <h2 className="text-[28px] font-extrabold tracking-tight">Homepage CMS</h2>
          <p className="text-[14px] text-[#6A6A6A] mt-1">Manage global landing sections, hero banners, and structural layout visibilities.</p>
        </div>
        <button
          onClick={handleSave}
          disabled={isPending}
          className="flex items-center justify-center gap-2 h-12 px-6 rounded-[12px] bg-[#111111] hover:bg-[#111111]/90 text-white text-[13px] font-bold shadow-sm transition-all cursor-pointer disabled:opacity-60 shrink-0"
        >
          {isPending ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Saving Changes...
            </>
          ) : (
            <>
              <Save size={16} />
              Save Layout Config
            </>
          )}
        </button>
      </div>

      {/* Notifications */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-[12px] text-[13px] font-semibold">
          {error}
        </div>
      )}
      {success && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-700 px-4 py-3 rounded-[12px] text-[13px] font-semibold">
          {success}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-[1.8fr_1fr] gap-8 items-start">
        {/* Left Form Panel: Hero details */}
        <div className="bg-white border border-[#E9E3DA] rounded-[24px] p-8 shadow-[0_4px_20px_rgba(0,0,0,0.02)] flex flex-col gap-6">
          <h3 className="text-[16px] font-bold tracking-tight pb-4 border-b border-[#E9E3DA]">Hero Section Settings</h3>

          {/* Hero Headline Input */}
          <div className="flex flex-col gap-2">
            <div className="flex justify-between items-center">
              <label className="text-[13px] font-bold uppercase tracking-[0.08em] text-[#6A6A6A]">
                Hero Headline Text
              </label>
              <button
                onClick={handleOptimizeTitle}
                disabled={aiLoading}
                className="flex items-center gap-1 text-[11px] font-bold text-[#F4C542] hover:text-[#111111] transition-all bg-[#F4C542]/10 hover:bg-[#F4C542]/20 px-2.5 py-1 rounded-[6px] cursor-pointer disabled:opacity-50"
              >
                {aiLoading ? <Loader2 size={12} className="animate-spin" /> : <Sparkles size={12} />}
                Optimize Headline (Gemini AI)
              </button>
            </div>
            <input
              type="text"
              name="heroTitle"
              value={config.heroTitle || ""}
              onChange={handleChange}
              placeholder="e.g. Build your startup with Growth Bridge."
              className="w-full h-12 px-4 bg-[#FCFBF8] border border-[#E9E3DA] rounded-[12px] text-[14px] font-medium outline-none focus:border-[#111111] transition-all"
            />
          </div>

          {/* Hero Description Textarea */}
          <div className="flex flex-col gap-2">
            <div className="flex justify-between items-center">
              <label className="text-[13px] font-bold uppercase tracking-[0.08em] text-[#6A6A6A]">
                Hero Description Body
              </label>
              <button
                onClick={handleOptimizeDescription}
                disabled={aiLoading}
                className="flex items-center gap-1 text-[11px] font-bold text-[#F4C542] hover:text-[#111111] transition-all bg-[#F4C542]/10 hover:bg-[#F4C542]/20 px-2.5 py-1 rounded-[6px] cursor-pointer disabled:opacity-50"
              >
                {aiLoading ? <Loader2 size={12} className="animate-spin" /> : <Sparkles size={12} />}
                Optimize Paragraph (Gemini AI)
              </button>
            </div>
            <textarea
              name="heroDescription"
              value={config.heroDescription || ""}
              onChange={handleChange}
              rows={4}
              placeholder="e.g. A design and engineering partner for founders who value quality, clarity, and momentum..."
              className="w-full p-4 bg-[#FCFBF8] border border-[#E9E3DA] rounded-[12px] text-[14px] font-medium outline-none focus:border-[#111111] transition-all resize-none"
            />
          </div>

          {/* Button Configurations */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="flex flex-col gap-2">
              <label className="text-[13px] font-bold uppercase tracking-[0.08em] text-[#6A6A6A]">
                Primary CTA Button Label
              </label>
              <input
                type="text"
                name="heroBtnText"
                value={config.heroBtnText || ""}
                onChange={handleChange}
                placeholder="e.g. Start a project"
                className="w-full h-12 px-4 bg-[#FCFBF8] border border-[#E9E3DA] rounded-[12px] text-[14px] font-medium outline-none focus:border-[#111111] transition-all"
              />
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-[13px] font-bold uppercase tracking-[0.08em] text-[#6A6A6A]">
                Primary CTA Button Link Destination
              </label>
              <input
                type="text"
                name="heroBtnUrl"
                value={config.heroBtnUrl || ""}
                onChange={handleChange}
                placeholder="e.g. #contact"
                className="w-full h-12 px-4 bg-[#FCFBF8] border border-[#E9E3DA] rounded-[12px] text-[14px] font-medium outline-none focus:border-[#111111] transition-all"
              />
            </div>
          </div>
        </div>

        {/* Right Form Panel: Section Toggles */}
        <div className="bg-white border border-[#E9E3DA] rounded-[24px] p-8 shadow-[0_4px_20px_rgba(0,0,0,0.02)] flex flex-col gap-6">
          <h3 className="text-[16px] font-bold tracking-tight pb-4 border-b border-[#E9E3DA]">Layout Controls</h3>
          <p className="text-[12px] text-[#6A6A6A] leading-relaxed">
            Turn sections on or off on the homepage in one click. Disabling a section will completely hide it from users.
          </p>

          <div className="flex flex-col gap-4 mt-2">
            {/* Toggle 1: Selected Work */}
            <div className="flex items-center justify-between p-4 rounded-[12px] bg-[#FCFBF8] border border-[#E9E3DA]">
              <div className="flex flex-col">
                <span className="text-[13px] font-bold text-[#111111]">Selected Work Section</span>
                <span className="text-[11px] text-[#6A6A6A]">Showcase portfolio case studies grid</span>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={!!config.showSelectedWork}
                  onChange={(e) => handleToggleChange("showSelectedWork", e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-[#E9E3DA] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-[#E9E3DA] after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#111111]"></div>
              </label>
            </div>

            {/* Toggle 2: Process */}
            <div className="flex items-center justify-between p-4 rounded-[12px] bg-[#FCFBF8] border border-[#E9E3DA]">
              <div className="flex flex-col">
                <span className="text-[13px] font-bold text-[#111111]">Timeline Process Section</span>
                <span className="text-[11px] text-[#6A6A6A]">Visual studio delivery stages</span>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={!!config.showProcess}
                  onChange={(e) => handleToggleChange("showProcess", e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-[#E9E3DA] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-[#E9E3DA] after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#111111]"></div>
              </label>
            </div>

            {/* Toggle 3: Testimonials */}
            <div className="flex items-center justify-between p-4 rounded-[12px] bg-[#FCFBF8] border border-[#E9E3DA]">
              <div className="flex flex-col">
                <span className="text-[13px] font-bold text-[#111111]">Client Testimonials</span>
                <span className="text-[11px] text-[#6A6A6A]">Animated reviews and tooltip slider</span>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={!!config.showTestimonials}
                  onChange={(e) => handleToggleChange("showTestimonials", e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-[#E9E3DA] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-[#E9E3DA] after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#111111]"></div>
              </label>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
