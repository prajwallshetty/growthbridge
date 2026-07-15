"use client";

import React, { useState, useEffect, useTransition } from "react";
import { getSettings, saveSettings } from "@/lib/actions/cms";
import { Loader2, Save } from "lucide-react";

export default function SettingsCmsPage() {
  const [settings, setSettings] = useState<any>({});
  const [isLoading, setIsLoading] = useState(true);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    async function loadSettings() {
      try {
        const data = await getSettings();
        setSettings(data);
      } catch (err) {
        setError("Failed to load settings configuration.");
      } finally {
        setIsLoading(false);
      }
    }
    loadSettings();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    setSettings((prev: any) => ({
      ...prev,
      [name]: type === "checkbox" ? (e.target as HTMLInputElement).checked : value,
    }));
  };

  const handleToggleChange = (name: string, checked: boolean) => {
    setSettings((prev: any) => ({
      ...prev,
      [name]: checked,
    }));
  };

  const handleBranchChange = (index: number, field: string, value: string) => {
    setSettings((prev: any) => {
      const newBranches = [...(prev.branches || [])];
      newBranches[index] = { ...newBranches[index], [field]: value };
      return { ...prev, branches: newBranches };
    });
  };

  const handleAddBranch = () => {
    setSettings((prev: any) => ({
      ...prev,
      branches: [
        ...(prev.branches || []),
        { name: "", address: "", status: "active" }
      ]
    }));
  };

  const handleRemoveBranch = (index: number) => {
    setSettings((prev: any) => ({
      ...prev,
      branches: (prev.branches || []).filter((_: any, i: number) => i !== index)
    }));
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    startTransition(async () => {
      try {
        const saved = await saveSettings(settings);
        setSettings(saved);
        setSuccess("Global Site Settings updated successfully.");
      } catch (err: any) {
        setError(err?.message || "Failed to save settings.");
      }
    });
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-3">
        <Loader2 className="h-8 w-8 animate-spin text-[#111111]" />
        <span className="text-[13px] font-semibold text-[#6A6A6A]">Loading settings...</span>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-10">
      <div>
        <h2 className="text-[28px] font-extrabold tracking-tight">Site Settings</h2>
        <p className="text-[14px] text-[#6A6A6A] mt-1">Configure global meta details, agency contact methods, and social connections.</p>
      </div>

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

      <form onSubmit={handleSave} className="grid grid-cols-1 lg:grid-cols-[1.8fr_1fr] gap-8 items-start">
        {/* Left Settings Panel: Contacts & Socials */}
        <div className="bg-white border border-[#E9E3DA] rounded-[24px] p-8 shadow-[0_4px_20px_rgba(0,0,0,0.02)] flex flex-col gap-6">
          <h3 className="text-[16px] font-bold tracking-tight pb-4 border-b border-[#E9E3DA]">Agency Contact Details</h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="flex flex-col gap-2">
              <label className="text-[13px] font-bold uppercase tracking-[0.08em] text-[#6A6A6A]">
                Primary Contact Email
              </label>
              <input
                type="email"
                name="contactEmail"
                required
                value={settings.contactEmail || ""}
                onChange={handleChange}
                placeholder="e.g. hello@growthbridge.live"
                className="w-full h-12 px-4 bg-[#FCFBF8] border border-[#E9E3DA] rounded-[12px] text-[14px] font-medium outline-none focus:border-[#111111] transition-all"
              />
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-[13px] font-bold uppercase tracking-[0.08em] text-[#6A6A6A]">
                Contact Phone Number
              </label>
              <input
                type="text"
                name="phoneNumber"
                value={settings.phoneNumber || ""}
                onChange={handleChange}
                placeholder="e.g. +91 62827 59863"
                className="w-full h-12 px-4 bg-[#FCFBF8] border border-[#E9E3DA] rounded-[12px] text-[14px] font-medium outline-none focus:border-[#111111] transition-all"
              />
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-[13px] font-bold uppercase tracking-[0.08em] text-[#6A6A6A]">
              Office Address Link / Text
            </label>
            <input
              type="text"
              name="officeAddress"
              value={settings.officeAddress || ""}
              onChange={handleChange}
              placeholder="e.g. 100 Pine St, San Francisco, CA"
              className="w-full h-12 px-4 bg-[#FCFBF8] border border-[#E9E3DA] rounded-[12px] text-[14px] font-medium outline-none focus:border-[#111111] transition-all"
            />
          </div>

          <h3 className="text-[16px] font-bold tracking-tight pb-4 border-b border-[#E9E3DA] mt-4">Social Network Connections</h3>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <div className="flex flex-col gap-2">
              <label className="text-[13px] font-bold uppercase tracking-[0.08em] text-[#6A6A6A]">
                Twitter Profile URL
              </label>
              <input
                type="text"
                name="socialTwitter"
                value={settings.socialTwitter || ""}
                onChange={handleChange}
                placeholder="e.g. https://twitter.com/..."
                className="w-full h-12 px-4 bg-[#FCFBF8] border border-[#E9E3DA] rounded-[12px] text-[14px] font-medium outline-none focus:border-[#111111] transition-all"
              />
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-[13px] font-bold uppercase tracking-[0.08em] text-[#6A6A6A]">
                LinkedIn Company Page
              </label>
              <input
                type="text"
                name="socialLinkedin"
                value={settings.socialLinkedin || ""}
                onChange={handleChange}
                placeholder="e.g. https://linkedin.com/company/..."
                className="w-full h-12 px-4 bg-[#FCFBF8] border border-[#E9E3DA] rounded-[12px] text-[14px] font-medium outline-none focus:border-[#111111] transition-all"
              />
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-[13px] font-bold uppercase tracking-[0.08em] text-[#6A6A6A]">
                GitHub Profile URL
              </label>
              <input
                type="text"
                name="socialGithub"
                value={settings.socialGithub || ""}
                onChange={handleChange}
                placeholder="e.g. https://github.com/..."
                className="w-full h-12 px-4 bg-[#FCFBF8] border border-[#E9E3DA] rounded-[12px] text-[14px] font-medium outline-none focus:border-[#111111] transition-all"
              />
            </div>
          </div>

          <div className="flex justify-between items-center pb-4 border-b border-[#E9E3DA] mt-8">
            <h3 className="text-[16px] font-bold tracking-tight">Global Branch Offices</h3>
            <button
              type="button"
              onClick={handleAddBranch}
              className="px-4 py-2 bg-[#111111] hover:bg-[#F4C542] text-white hover:text-[#111111] text-[12px] font-bold rounded-full transition-all"
            >
              + Add Branch
            </button>
          </div>

          <div className="flex flex-col gap-4">
            {(settings.branches || []).map((branch: any, index: number) => (
              <div key={index} className="p-5 rounded-[16px] border border-[#E9E3DA] bg-[#FCFBF8] flex flex-col gap-4 relative">
                <button
                  type="button"
                  onClick={() => handleRemoveBranch(index)}
                  className="absolute top-4 right-4 text-[12px] font-bold text-red-600 hover:text-red-800 transition-colors"
                >
                  Remove
                </button>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-2">
                  <div className="flex flex-col gap-2">
                    <label className="text-[11px] font-bold uppercase tracking-[0.08em] text-[#6A6A6A]">
                      Branch Name
                    </label>
                    <input
                      type="text"
                      required
                      value={branch.name || ""}
                      onChange={(e) => handleBranchChange(index, "name", e.target.value)}
                      placeholder="e.g. India"
                      className="h-10 px-3 border border-[#E9E3DA] bg-white rounded-[8px] text-[13px] font-medium outline-none focus:border-[#111111] transition-all"
                    />
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="text-[11px] font-bold uppercase tracking-[0.08em] text-[#6A6A6A]">
                      Branch Address
                    </label>
                    <input
                      type="text"
                      required
                      value={branch.address || ""}
                      onChange={(e) => handleBranchChange(index, "address", e.target.value)}
                      placeholder="e.g. Bengaluru, India"
                      className="h-10 px-3 border border-[#E9E3DA] bg-white rounded-[8px] text-[13px] font-medium outline-none focus:border-[#111111] transition-all"
                    />
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="text-[11px] font-bold uppercase tracking-[0.08em] text-[#6A6A6A]">
                      Status
                    </label>
                    <select
                      value={branch.status || "active"}
                      onChange={(e) => handleBranchChange(index, "status", e.target.value)}
                      className="h-10 px-3 border border-[#E9E3DA] bg-white rounded-[8px] text-[13px] font-medium outline-none focus:border-[#111111] transition-all"
                    >
                      <option value="active">Active</option>
                      <option value="coming_soon">Coming Soon</option>
                    </select>
                  </div>
                </div>
              </div>
            ))}
            {(settings.branches || []).length === 0 && (
              <div className="text-center py-6 text-[13px] text-[#6A6A6A] font-semibold">
                No branch offices added. Click "+ Add Branch" to define one.
              </div>
            )}
          </div>
        </div>

        {/* Right Settings Panel: SEO Defaults & Maintenance */}
        <div className="flex flex-col gap-6 w-full">
          <div className="bg-white border border-[#E9E3DA] rounded-[24px] p-8 shadow-[0_4px_20px_rgba(0,0,0,0.02)] flex flex-col gap-6">
            <h3 className="text-[15px] font-bold tracking-tight pb-4 border-b border-[#E9E3DA]">SEO Defaults</h3>

            <div className="flex flex-col gap-2">
              <label className="text-[13px] font-bold uppercase tracking-[0.08em] text-[#6A6A6A]">
                Default Meta Title
              </label>
              <input
                type="text"
                name="seoDefaultTitle"
                required
                value={settings.seoDefaultTitle || ""}
                onChange={handleChange}
                placeholder="Default index header title..."
                className="w-full h-12 px-4 bg-[#FCFBF8] border border-[#E9E3DA] rounded-[12px] text-[14px] font-medium outline-none focus:border-[#111111] transition-all"
              />
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-[13px] font-bold uppercase tracking-[0.08em] text-[#6A6A6A]">
                Default Meta Description
              </label>
              <textarea
                name="seoDefaultDescription"
                required
                rows={4}
                value={settings.seoDefaultDescription || ""}
                onChange={handleChange}
                placeholder="Default index summary snippet..."
                className="w-full p-4 bg-[#FCFBF8] border border-[#E9E3DA] rounded-[12px] text-[14px] font-medium outline-none focus:border-[#111111] transition-all resize-none"
              />
            </div>
          </div>

          <div className="bg-white border border-[#E9E3DA] rounded-[24px] p-8 shadow-[0_4px_20px_rgba(0,0,0,0.02)] flex flex-col gap-6">
            <h3 className="text-[15px] font-bold tracking-tight pb-4 border-b border-[#E9E3DA]">System Maintenance</h3>

            <div className="flex items-center justify-between p-4 rounded-[12px] bg-[#FCFBF8] border border-[#E9E3DA]">
              <div className="flex flex-col">
                <span className="text-[13px] font-bold text-[#111111]">Maintenance Mode</span>
                <span className="text-[11px] text-[#6A6A6A]">Restrict public access to site</span>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={!!settings.maintenanceMode}
                  onChange={(e) => handleToggleChange("maintenanceMode", e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-[#E9E3DA] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-[#E9E3DA] after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#111111]"></div>
              </label>
            </div>
          </div>

          <button
            type="submit"
            disabled={isPending}
            className="flex items-center justify-center gap-2 h-12 w-full rounded-[12px] bg-[#111111] hover:bg-[#111111]/90 text-white text-[13px] font-bold shadow-sm transition-all cursor-pointer disabled:opacity-60"
          >
            {isPending ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Saving settings...
              </>
            ) : (
              <>
                <Save size={16} />
                Save Site Settings
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
