"use client";

import React, { useState } from "react";
import { CheckCircle2, ArrowRight, Loader2, AlertCircle } from "lucide-react";
import { createApplication } from "@/lib/actions/internship";

export interface DomainOption {
  _id: string;
  name: string;
  description?: string;
  duration?: string;
}

interface ApplyFormProps {
  domains: DomainOption[];
}

const COUNTRY_CODES = [
  { code: "+91", label: "🇮🇳 +91" },
  { code: "+1", label: "🇺🇸 +1" },
  { code: "+44", label: "🇬🇧 +44" },
  { code: "+971", label: "🇦🇪 +971" },
  { code: "+65", label: "🇸🇬 +65" },
  { code: "+61", label: "🇦🇺 +61" },
  { code: "+49", label: "🇩🇪 +49" },
  { code: "+33", label: "🇫🇷 +33" },
];

export default function ApplyForm({ domains }: ApplyFormProps) {
  // Domain selection
  const [selectedDomainId, setSelectedDomainId] = useState<string>(domains[0]?._id || "");

  // Form Fields
  const [fullName, setFullName] = useState("");
  const [countryCode, setCountryCode] = useState("+91");
  const [whatsappNumber, setWhatsappNumber] = useState("");
  const [githubUrl, setGithubUrl] = useState("");
  const [linkedinUrl, setLinkedinUrl] = useState("");

  // Validation Error state
  const [fieldErrors, setFieldErrors] = useState<{
    fullName?: string;
    whatsappNumber?: string;
    githubUrl?: string;
    linkedinUrl?: string;
    domainId?: string;
  }>({});

  // Submission Status
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionStatus, setSubmissionStatus] = useState<"idle" | "duplicate" | "error" | "success">("idle");
  const [errorMessage, setErrorMessage] = useState("");

  const resetForm = () => {
    setFullName("");
    setWhatsappNumber("");
    setGithubUrl("");
    setLinkedinUrl("");
    setFieldErrors({});
    setSubmissionStatus("idle");
    setErrorMessage("");
  };

  const validateForm = () => {
    const errors: typeof fieldErrors = {};

    if (!selectedDomainId) {
      errors.domainId = "Please select a domain track.";
    }

    if (!fullName.trim()) {
      errors.fullName = "Full name is required.";
    }

    const cleanPhone = whatsappNumber.replace(/\D/g, "");
    if (!cleanPhone) {
      errors.whatsappNumber = "WhatsApp number is required.";
    } else if (cleanPhone.length < 7 || cleanPhone.length > 15) {
      errors.whatsappNumber = "Please enter a valid phone number (7-15 digits).";
    }

    if (githubUrl.trim()) {
      const lower = githubUrl.toLowerCase().trim();
      const isGithub = lower.includes("github.com/") || lower.startsWith("github.com/");
      if (!isGithub) {
        errors.githubUrl = "Please enter a valid GitHub profile URL (e.g. github.com/username).";
      }
    }

    if (linkedinUrl.trim()) {
      const lower = linkedinUrl.toLowerCase().trim();
      const isLinkedin = lower.includes("linkedin.com/") || lower.startsWith("linkedin.com/");
      if (!isLinkedin) {
        errors.linkedinUrl = "Please enter a valid LinkedIn profile URL (e.g. linkedin.com/in/username).";
      }
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsSubmitting(true);
    setSubmissionStatus("idle");
    setErrorMessage("");

    const formattedPhone = `${countryCode} ${whatsappNumber.trim()}`;

    let finalGithub = githubUrl.trim();
    if (finalGithub && !finalGithub.startsWith("http://") && !finalGithub.startsWith("https://")) {
      finalGithub = `https://${finalGithub}`;
    }

    let finalLinkedin = linkedinUrl.trim();
    if (finalLinkedin && !finalLinkedin.startsWith("http://") && !finalLinkedin.startsWith("https://")) {
      finalLinkedin = `https://${finalLinkedin}`;
    }

    try {
      const res = await createApplication({
        fullName: fullName.trim(),
        phone: formattedPhone,
        github: finalGithub,
        linkedin: finalLinkedin,
        domainId: selectedDomainId,
        status: "Applied",
      });

      if (res && res.isDuplicate) {
        setSubmissionStatus("duplicate");
      } else if (res && res.success) {
        setSubmissionStatus("success");
      } else {
        setSubmissionStatus("error");
        setErrorMessage(res?.error || "Please try again in a moment.");
      }
    } catch (err: any) {
      console.error("Submission failed:", err);
      setSubmissionStatus("error");
      setErrorMessage("Please try again in a moment.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (submissionStatus === "success") {
    return (
      <div className="bg-white border border-[#E9E3DA] rounded-3xl p-8 sm:p-12 shadow-sm text-center flex flex-col items-center gap-6">
        <div className="w-16 h-16 rounded-full bg-[#F4C542]/20 border border-[#F4C542] flex items-center justify-center text-[#111111]">
          <CheckCircle2 size={36} />
        </div>

        <div className="flex flex-col gap-2">
          <h2 className="text-[26px] font-black text-[#111111] tracking-tight">
            Application Received ✓
          </h2>
          <p className="text-[16px] font-bold text-[#111111]">
            Thank you for applying to Growth Bridge.
          </p>
          <p className="text-[14px] font-medium text-[#6A6A6A] max-w-sm mx-auto leading-relaxed mt-1">
            We'll contact you on WhatsApp regarding the next steps.
          </p>
        </div>

        <button
          onClick={resetForm}
          className="mt-4 px-10 py-3.5 rounded-2xl bg-[#111111] hover:bg-[#F4C542] hover:text-[#111111] text-white text-[14px] font-extrabold tracking-tight transition-all duration-200 shadow-md cursor-pointer"
        >
          Done
        </button>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white border border-[#E9E3DA] rounded-3xl p-6 sm:p-10 shadow-[0_15px_45px_rgba(0,0,0,0.03)] flex flex-col gap-8 text-left"
    >
      {/* Domain Selection */}
      <div className="flex flex-col gap-3">
        <label className="text-[13px] font-extrabold uppercase tracking-wider text-[#111111]">
          Choose Your Domain *
        </label>
        
        <div className={domains.length > 1 ? "grid grid-cols-1 sm:grid-cols-3 gap-3" : "grid grid-cols-1 gap-3"}>
          {domains.map((domain) => {
            const isSelected = selectedDomainId === domain._id;
            return (
              <button
                key={domain._id}
                type="button"
                onClick={() => {
                  setSelectedDomainId(domain._id);
                  setFieldErrors((prev) => ({ ...prev, domainId: undefined }));
                }}
                className={`p-4 rounded-2xl border text-left flex flex-col justify-between transition-all cursor-pointer relative ${
                  isSelected
                    ? "bg-white border-[#F4C542] shadow-[0_4px_16px_rgba(244,197,66,0.25)] ring-2 ring-[#F4C542]"
                    : "bg-[#FCFBF8] border-[#E9E3DA] hover:border-[#D7D0C8] text-[#111111]"
                }`}
              >
                <div className="flex items-start justify-between gap-2 mb-2">
                  <span className="text-[12px] font-mono font-bold text-[#6A6A6A] uppercase tracking-wider">
                    Domain
                  </span>
                  {isSelected && (
                    <CheckCircle2 size={16} className="text-[#111111] fill-[#F4C542] shrink-0" />
                  )}
                </div>
                
                <span className="text-[13.5px] font-extrabold text-[#111111] leading-snug">
                  {domain.name}
                </span>
              </button>
            );
          })}
        </div>

        {fieldErrors.domainId && (
          <span className="text-red-500 text-[11.5px] font-bold flex items-center gap-1">
            <AlertCircle size={12} /> {fieldErrors.domainId}
          </span>
        )}
      </div>

      <div className="h-px bg-[#E9E3DA]" />

      {/* Full Name */}
      <div className="flex flex-col gap-1.5">
        <label className="text-[13px] font-bold text-[#111111]">
          Full Name <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          required
          placeholder="Enter your full name"
          value={fullName}
          onChange={(e) => {
            setFullName(e.target.value);
            if (fieldErrors.fullName) {
              setFieldErrors((prev) => ({ ...prev, fullName: undefined }));
            }
          }}
          className={`w-full px-4 py-3.5 rounded-xl border bg-[#FCFBF8] text-[14px] font-semibold text-[#111111] focus:outline-none transition-colors ${
            fieldErrors.fullName ? "border-red-400 focus:border-red-500" : "border-[#E9E3DA] focus:border-[#F4C542]"
          }`}
        />
        {fieldErrors.fullName && (
          <span className="text-red-500 text-[11.5px] font-bold flex items-center gap-1">
            <AlertCircle size={12} /> {fieldErrors.fullName}
          </span>
        )}
      </div>

      {/* WhatsApp Number */}
      <div className="flex flex-col gap-1.5">
        <label className="text-[13px] font-bold text-[#111111]">
          WhatsApp Number <span className="text-red-500">*</span>
        </label>
        
        <div className="flex items-center gap-2">
          <select
            value={countryCode}
            onChange={(e) => setCountryCode(e.target.value)}
            className="px-3 py-3.5 rounded-xl border border-[#E9E3DA] bg-[#FCFBF8] text-[13.5px] font-bold text-[#111111] focus:outline-none focus:border-[#F4C542] cursor-pointer"
          >
            {COUNTRY_CODES.map((c) => (
              <option key={c.code} value={c.code}>
                {c.label}
              </option>
            ))}
          </select>

          <input
            type="tel"
            required
            placeholder="98765 43210"
            value={whatsappNumber}
            onChange={(e) => {
              setWhatsappNumber(e.target.value);
              if (fieldErrors.whatsappNumber) {
                setFieldErrors((prev) => ({ ...prev, whatsappNumber: undefined }));
              }
            }}
            className={`flex-1 px-4 py-3.5 rounded-xl border bg-[#FCFBF8] text-[14px] font-semibold text-[#111111] focus:outline-none transition-colors ${
              fieldErrors.whatsappNumber ? "border-red-400 focus:border-red-500" : "border-[#E9E3DA] focus:border-[#F4C542]"
            }`}
          />
        </div>

        {fieldErrors.whatsappNumber && (
          <span className="text-red-500 text-[11.5px] font-bold flex items-center gap-1">
            <AlertCircle size={12} /> {fieldErrors.whatsappNumber}
          </span>
        )}
      </div>

      {/* GitHub Profile */}
      <div className="flex flex-col gap-1.5">
        <div className="flex items-center justify-between">
          <label className="text-[13px] font-bold text-[#111111]">GitHub Profile</label>
          <span className="text-[11px] font-semibold text-[#6A6A6A]">Optional</span>
        </div>
        <input
          type="text"
          placeholder="https://github.com/username"
          value={githubUrl}
          onChange={(e) => {
            setGithubUrl(e.target.value);
            if (fieldErrors.githubUrl) {
              setFieldErrors((prev) => ({ ...prev, githubUrl: undefined }));
            }
          }}
          className={`w-full px-4 py-3.5 rounded-xl border bg-[#FCFBF8] text-[14px] font-semibold text-[#111111] focus:outline-none transition-colors ${
            fieldErrors.githubUrl ? "border-red-400 focus:border-red-500" : "border-[#E9E3DA] focus:border-[#F4C542]"
          }`}
        />
        {fieldErrors.githubUrl && (
          <span className="text-red-500 text-[11.5px] font-bold flex items-center gap-1">
            <AlertCircle size={12} /> {fieldErrors.githubUrl}
          </span>
        )}
      </div>

      {/* LinkedIn Profile */}
      <div className="flex flex-col gap-1.5">
        <div className="flex items-center justify-between">
          <label className="text-[13px] font-bold text-[#111111]">LinkedIn Profile</label>
          <span className="text-[11px] font-semibold text-[#6A6A6A]">Optional</span>
        </div>
        <input
          type="text"
          placeholder="https://linkedin.com/in/username"
          value={linkedinUrl}
          onChange={(e) => {
            setLinkedinUrl(e.target.value);
            if (fieldErrors.linkedinUrl) {
              setFieldErrors((prev) => ({ ...prev, linkedinUrl: undefined }));
            }
          }}
          className={`w-full px-4 py-3.5 rounded-xl border bg-[#FCFBF8] text-[14px] font-semibold text-[#111111] focus:outline-none transition-colors ${
            fieldErrors.linkedinUrl ? "border-red-400 focus:border-red-500" : "border-[#E9E3DA] focus:border-[#F4C542]"
          }`}
        />
        {fieldErrors.linkedinUrl && (
          <span className="text-red-500 text-[11.5px] font-bold flex items-center gap-1">
            <AlertCircle size={12} /> {fieldErrors.linkedinUrl}
          </span>
        )}
      </div>

      {/* Duplicate Error Banner */}
      {submissionStatus === "duplicate" && (
        <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 flex flex-col gap-1">
          <div className="flex items-center gap-2 font-bold text-[13.5px]">
            <AlertCircle size={16} className="text-amber-600 shrink-0" />
            <span>Application Already Received</span>
          </div>
          <p className="text-[12.5px] font-medium text-amber-800 ml-6">
            You have already applied for this internship.
          </p>
        </div>
      )}

      {/* General Submission Error Banner */}
      {submissionStatus === "error" && (
        <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-900 flex flex-col gap-1">
          <div className="flex items-center gap-2 font-bold text-[13.5px]">
            <AlertCircle size={16} className="text-red-600 shrink-0" />
            <span>Something went wrong.</span>
          </div>
          <p className="text-[12.5px] font-medium text-red-800 ml-6">
            {errorMessage || "Please try again in a moment."}
          </p>
        </div>
      )}

      {/* Submit Button */}
      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full py-4 rounded-2xl bg-[#111111] hover:bg-[#F4C542] hover:text-[#111111] text-white disabled:opacity-50 text-[15px] font-extrabold tracking-tight transition-all duration-300 shadow-md flex items-center justify-center gap-2 cursor-pointer disabled:cursor-not-allowed group"
      >
        {isSubmitting ? (
          <>
            <Loader2 size={18} className="animate-spin text-[#F4C542]" />
            <span>Submitting Application...</span>
          </>
        ) : (
          <>
            <span>Submit Application</span>
            <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
          </>
        )}
      </button>
    </form>
  );
}
