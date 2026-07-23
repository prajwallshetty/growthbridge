"use client";

import React, { useState } from "react";
import { useCRM } from "./CRMProvider";
import { Settings, Shield, User, Globe, RefreshCw, CheckCircle2, Save, Users, Building, Percent, IndianRupee } from "lucide-react";

export default function SettingsView() {
  const { settings, updateSettings, refreshClients, clients } = useCRM();

  const [businessName, setBusinessName] = useState(settings.businessName || "Growth Bridge");
  const [currency, setCurrency] = useState(settings.currency || "₹");
  const [partner1Name, setPartner1Name] = useState(settings.partner1Name || "Prajwal");
  const [partner1Share, setPartner1Share] = useState(settings.partner1Share?.toString() || "50");
  const [partner2Name, setPartner2Name] = useState(settings.partner2Name || "Shaz");
  const [partner2Share, setPartner2Share] = useState(settings.partner2Share?.toString() || "50");
  const [taxRate, setTaxRate] = useState(settings.taxRate?.toString() || "18");
  const [theme, setTheme] = useState(settings.theme || "light");
  const [logoUrl, setLogoUrl] = useState(settings.logoUrl || "/logo.png");

  const [saving, setSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [seedLoading, setSeedLoading] = useState(false);
  const [seedNotif, setSeedNotif] = useState(false);

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSaving(true);
      await updateSettings({
        businessName,
        currency,
        partner1Name,
        partner1Share: parseFloat(partner1Share) || 50,
        partner2Name,
        partner2Share: parseFloat(partner2Share) || 50,
        taxRate: parseFloat(taxRate) || 18,
        theme,
        logoUrl,
      });
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 3000);
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  const handleForceSeed = async () => {
    setSeedLoading(true);
    setTimeout(() => {
      setSeedLoading(false);
      setSeedNotif(true);
      setTimeout(() => setSeedNotif(false), 3000);
      refreshClients();
    }, 1200);
  };

  return (
    <div className="flex flex-col gap-6 pb-12 select-none max-w-3xl">
      <div>
        <h2 className="text-[24px] font-extrabold text-[#111111] tracking-tight">CRM V2 System Settings</h2>
        <p className="text-[13px] text-[#6A6A6A] mt-1">
          Configure agency business details, partner profit distribution shares, currency, tax rates, and database state.
        </p>
      </div>

      <form onSubmit={handleSaveSettings} className="flex flex-col gap-6">
        {/* Business & Financial Settings Block */}
        <div className="bg-white border border-[#E9E3DA] p-6 rounded-[24px] shadow-sm flex flex-col gap-5">
          <div className="flex items-center justify-between border-b border-[#E9E3DA]/65 pb-3">
            <h3 className="text-[15px] font-extrabold text-[#111111] flex items-center gap-2">
              <Building size={18} className="text-indigo-600" />
              <span>Business Profile & Currency</span>
            </h3>
            {savedSuccess && (
              <span className="flex items-center gap-1 text-emerald-600 text-[12px] font-bold animate-pulse">
                <CheckCircle2 size={14} />
                <span>Settings Saved!</span>
              </span>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-[11px] font-mono uppercase font-bold text-[#6A6A6A]">Business Name</label>
              <input
                type="text"
                value={businessName}
                onChange={(e) => setBusinessName(e.target.value)}
                className="bg-[#FCFBF8] border border-[#E9E3DA] p-2.5 rounded-xl text-[13px] font-bold text-[#111111]"
                required
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-[11px] font-mono uppercase font-bold text-[#6A6A6A]">Currency Symbol</label>
              <select
                value={currency}
                onChange={(e) => setCurrency(e.target.value)}
                className="bg-[#FCFBF8] border border-[#E9E3DA] p-2.5 rounded-xl text-[13px] font-bold text-[#111111]"
              >
                <option value="₹">₹ (INR - Indian Rupee)</option>
                <option value="$">$ (USD - US Dollar)</option>
                <option value="€">€ (EUR - Euro)</option>
                <option value="£">£ (GBP - British Pound)</option>
                <option value="AED">AED (Emirati Dirham)</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-[11px] font-mono uppercase font-bold text-[#6A6A6A]">Tax % (GST/VAT)</label>
              <input
                type="number"
                value={taxRate}
                onChange={(e) => setTaxRate(e.target.value)}
                className="bg-[#FCFBF8] border border-[#E9E3DA] p-2.5 rounded-xl text-[13px] font-bold text-[#111111] font-mono"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-[11px] font-mono uppercase font-bold text-[#6A6A6A]">Theme Preference</label>
              <select
                value={theme}
                onChange={(e) => setTheme(e.target.value)}
                className="bg-[#FCFBF8] border border-[#E9E3DA] p-2.5 rounded-xl text-[13px] text-[#111111]"
              >
                <option value="light">Light SaaS (Default)</option>
                <option value="dark">Dark Glassmorphism</option>
                <option value="system">System Preference</option>
              </select>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-[11px] font-mono uppercase font-bold text-[#6A6A6A]">Logo URL</label>
              <input
                type="text"
                value={logoUrl}
                onChange={(e) => setLogoUrl(e.target.value)}
                className="bg-[#FCFBF8] border border-[#E9E3DA] p-2.5 rounded-xl text-[13px] text-[#111111]"
              />
            </div>
          </div>
        </div>

        {/* Partner Share % Configuration Block */}
        <div className="bg-white border border-[#E9E3DA] p-6 rounded-[24px] shadow-sm flex flex-col gap-5">
          <div className="border-b border-[#E9E3DA]/65 pb-3">
            <h3 className="text-[15px] font-extrabold text-[#111111] flex items-center gap-2">
              <Users size={18} className="text-emerald-600" />
              <span>Partner Profit Share Allocation</span>
            </h3>
            <p className="text-[12px] text-[#6A6A6A] mt-0.5">
              System automatically computes net partner payout shares after deductable project expenses.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {/* Partner 1 */}
            <div className="bg-[#FCFBF8] border border-[#E9E3DA] p-4 rounded-2xl flex flex-col gap-3">
              <span className="text-[11px] font-mono uppercase font-bold text-indigo-700">Partner 1 Details</span>
              <div className="flex flex-col gap-1.5">
                <label className="text-[11px] text-[#6A6A6A] font-bold">Partner Name</label>
                <input
                  type="text"
                  value={partner1Name}
                  onChange={(e) => setPartner1Name(e.target.value)}
                  className="bg-white border border-[#E9E3DA] p-2.5 rounded-xl text-[13px] font-bold text-[#111111]"
                  required
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-[11px] text-[#6A6A6A] font-bold">Share Percentage (%)</label>
                <input
                  type="number"
                  value={partner1Share}
                  onChange={(e) => {
                    setPartner1Share(e.target.value);
                    const val = parseFloat(e.target.value);
                    if (!isNaN(val) && val <= 100) {
                      setPartner2Share((100 - val).toString());
                    }
                  }}
                  className="bg-white border border-[#E9E3DA] p-2.5 rounded-xl text-[13px] font-bold text-[#111111] font-mono"
                  required
                />
              </div>
            </div>

            {/* Partner 2 */}
            <div className="bg-[#FCFBF8] border border-[#E9E3DA] p-4 rounded-2xl flex flex-col gap-3">
              <span className="text-[11px] font-mono uppercase font-bold text-emerald-700">Partner 2 Details</span>
              <div className="flex flex-col gap-1.5">
                <label className="text-[11px] text-[#6A6A6A] font-bold">Partner Name</label>
                <input
                  type="text"
                  value={partner2Name}
                  onChange={(e) => setPartner2Name(e.target.value)}
                  className="bg-white border border-[#E9E3DA] p-2.5 rounded-xl text-[13px] font-bold text-[#111111]"
                  required
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-[11px] text-[#6A6A6A] font-bold">Share Percentage (%)</label>
                <input
                  type="number"
                  value={partner2Share}
                  onChange={(e) => {
                    setPartner2Share(e.target.value);
                    const val = parseFloat(e.target.value);
                    if (!isNaN(val) && val <= 100) {
                      setPartner1Share((100 - val).toString());
                    }
                  }}
                  className="bg-white border border-[#E9E3DA] p-2.5 rounded-xl text-[13px] font-bold text-[#111111] font-mono"
                  required
                />
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={saving}
            className="flex items-center gap-2 px-6 py-3 rounded-xl bg-[#111111] hover:bg-[#222222] text-white text-[13px] font-extrabold transition-all shadow-md cursor-pointer disabled:opacity-50"
          >
            <Save size={16} />
            <span>{saving ? "Saving..." : "Save Settings Changes"}</span>
          </button>
        </div>
      </form>

      {/* Database Controls Block */}
      <div className="bg-white border border-[#E9E3DA] p-6 rounded-[24px] shadow-sm flex flex-col gap-4 mt-2">
        <div>
          <h3 className="text-[15px] font-extrabold text-[#111111]">Database Controls</h3>
          <p className="text-[12px] text-[#6A6A6A] mt-0.5">
            Connected to MongoDB. Active CRM database contains <strong>{clients.length} projects</strong>.
          </p>
        </div>

        <div className="flex justify-between items-center py-3 bg-[#FCFBF8] border border-[#E9E3DA] px-4 rounded-xl flex-wrap gap-4">
          <div>
            <strong className="text-[13px] font-bold text-[#111111] block">Sync & Refresh Project Records</strong>
            <span className="text-[11px] text-[#6A6A6A]">Re-fetches and synchronizes all project live financial calculations.</span>
          </div>
          <button
            onClick={handleForceSeed}
            disabled={seedLoading}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#111111] hover:bg-[#222222] text-white text-[12.5px] font-bold transition-all disabled:opacity-60 cursor-pointer"
          >
            <RefreshCw size={14} className={seedLoading ? "animate-spin" : ""} />
            <span>{seedLoading ? "Syncing..." : "Sync Database"}</span>
          </button>
        </div>
        {seedNotif && (
          <div className="flex items-center gap-1.5 text-emerald-600 text-[12px] font-bold self-end animate-pulse">
            <CheckCircle2 size={14} />
            <span>Database synced successfully!</span>
          </div>
        )}
      </div>
    </div>
  );
}

