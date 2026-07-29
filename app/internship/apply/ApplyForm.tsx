"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { createApplication } from "@/lib/actions/internship";
import { Upload, Check, AlertCircle, RefreshCw } from "lucide-react";

interface DomainOption {
  _id: string;
  name: string;
}

interface ApplyFormProps {
  domains: DomainOption[];
}

export default function ApplyForm({ domains }: ApplyFormProps) {
  const router = useRouter();

  // Form Fields
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [dob, setDob] = useState("");
  const [gender, setGender] = useState("Male");
  
  const [college, setCollege] = useState("");
  const [degree, setDegree] = useState("");
  const [branch, setBranch] = useState("");
  const [currentYear, setCurrentYear] = useState("1st Year");
  const [graduationYear, setGraduationYear] = useState("");

  const [domainId, setDomainId] = useState(domains[0]?._id || "");
  const [experienceLevel, setExperienceLevel] = useState("Beginner");

  const [resumeUrl, setResumeUrl] = useState("");
  const [github, setGithub] = useState("");
  const [linkedin, setLinkedin] = useState("");
  const [portfolio, setPortfolio] = useState("");

  const [whyJoin, setWhyJoin] = useState("");
  const [hasProjects, setHasProjects] = useState("No");

  const [declaration, setDeclaration] = useState(false);

  // Status flags
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState("");

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    setUploadError("");

    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch("/api/internship/upload", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "File upload failed");
      }

      setResumeUrl(data.url);
    } catch (err: any) {
      console.error(err);
      setUploadError(err.message || "Failed to upload file");
    } finally {
      setIsUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError("");

    // Validate Required fields
    if (!fullName || !email || !phone || !college || !degree || !branch || !currentYear || !graduationYear || !domainId || !experienceLevel) {
      setFormError("Please fill in all required fields.");
      return;
    }

    if (!resumeUrl) {
      setFormError("Please upload your resume / CV.");
      return;
    }

    if (!declaration) {
      setFormError("You must accept the declaration to submit your application.");
      return;
    }

    setIsSubmitting(true);

    try {
      const result = await createApplication({
        fullName,
        email,
        phone,
        dob: dob ? new Date(dob) : undefined,
        gender,
        college,
        degree,
        branch,
        currentYear,
        graduationYear,
        domainId,
        experienceLevel,
        whyJoin,
        hasProjects,
        github,
        linkedin,
        portfolio,
        resumeUrl,
        status: "Pending",
      });

      if (result && result._id) {
        router.push("/internship/success");
      } else {
        throw new Error("Failed to save application.");
      }
    } catch (err: any) {
      console.error(err);
      setFormError(err.message || "An error occurred while submitting your application.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white border border-[#E9E3DA] rounded-3xl p-6 sm:p-10 shadow-[0_15px_45px_rgba(0,0,0,0.03)] flex flex-col gap-10">
      
      {/* SECTION 1: Personal Information */}
      <div className="flex flex-col gap-5">
        <span className="font-mono text-[11px] font-bold text-[#A8A296] uppercase tracking-wider">— Personal Information</span>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div className="flex flex-col gap-1.5">
            <label className="text-[12.5px] font-bold text-[#111111]">Full Name *</label>
            <input
              type="text"
              required
              placeholder="E.g., Prajwal Shetty"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="px-4 py-3 rounded-xl border border-[#E9E3DA] bg-[#FCFBF8] text-[13px] font-semibold text-[#111111] focus:outline-none focus:border-[#F4C542] transition-colors"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-[12.5px] font-bold text-[#111111]">Email Address *</label>
            <input
              type="email"
              required
              placeholder="e.g., mail@domain.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="px-4 py-3 rounded-xl border border-[#E9E3DA] bg-[#FCFBF8] text-[13px] font-semibold text-[#111111] focus:outline-none focus:border-[#F4C542] transition-colors"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-[12.5px] font-bold text-[#111111]">Phone Number *</label>
            <input
              type="tel"
              required
              placeholder="e.g., +91 98765 43210"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="px-4 py-3 rounded-xl border border-[#E9E3DA] bg-[#FCFBF8] text-[13px] font-semibold text-[#111111] focus:outline-none focus:border-[#F4C542] transition-colors"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-[12.5px] font-bold text-[#111111]">Date of Birth</label>
              <input
                type="date"
                value={dob}
                onChange={(e) => setDob(e.target.value)}
                className="px-4 py-3 rounded-xl border border-[#E9E3DA] bg-[#FCFBF8] text-[13px] font-semibold text-[#6A6A6A] focus:outline-none focus:border-[#F4C542] transition-colors w-full"
              />
            </div>
            
            <div className="flex flex-col gap-1.5">
              <label className="text-[12.5px] font-bold text-[#111111]">Gender</label>
              <select
                value={gender}
                onChange={(e) => setGender(e.target.value)}
                className="px-4 py-3 rounded-xl border border-[#E9E3DA] bg-[#FCFBF8] text-[13px] font-semibold text-[#111111] focus:outline-none focus:border-[#F4C542] transition-colors"
              >
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* SECTION 2: Academic */}
      <div className="flex flex-col gap-5 pt-4 border-t border-[#E9E3DA]/65">
        <span className="font-mono text-[11px] font-bold text-[#A8A296] uppercase tracking-wider">— Academic Details</span>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div className="flex flex-col gap-1.5 md:col-span-2">
            <label className="text-[12.5px] font-bold text-[#111111]">College / University Name *</label>
            <input
              type="text"
              required
              placeholder="E.g., St. Joseph Engineering College"
              value={college}
              onChange={(e) => setCollege(e.target.value)}
              className="px-4 py-3 rounded-xl border border-[#E9E3DA] bg-[#FCFBF8] text-[13px] font-semibold text-[#111111] focus:outline-none focus:border-[#F4C542] transition-colors"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-[12.5px] font-bold text-[#111111]">Degree *</label>
            <input
              type="text"
              required
              placeholder="E.g., B.E., B.Tech, BCA"
              value={degree}
              onChange={(e) => setDegree(e.target.value)}
              className="px-4 py-3 rounded-xl border border-[#E9E3DA] bg-[#FCFBF8] text-[13px] font-semibold text-[#111111] focus:outline-none focus:border-[#F4C542] transition-colors"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-[12.5px] font-bold text-[#111111]">Branch / Specialization *</label>
            <input
              type="text"
              required
              placeholder="E.g., Computer Science, Information Science"
              value={branch}
              onChange={(e) => setBranch(e.target.value)}
              className="px-4 py-3 rounded-xl border border-[#E9E3DA] bg-[#FCFBF8] text-[13px] font-semibold text-[#111111] focus:outline-none focus:border-[#F4C542] transition-colors"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-[12.5px] font-bold text-[#111111]">Current Year *</label>
            <select
              value={currentYear}
              onChange={(e) => setCurrentYear(e.target.value)}
              className="px-4 py-3 rounded-xl border border-[#E9E3DA] bg-[#FCFBF8] text-[13px] font-semibold text-[#111111] focus:outline-none focus:border-[#F4C542] transition-colors"
            >
              <option value="1st Year">1st Year</option>
              <option value="2nd Year">2nd Year</option>
              <option value="3rd Year">3rd Year</option>
              <option value="4th Year">4th Year</option>
              <option value="Graduated">Graduated</option>
            </select>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-[12.5px] font-bold text-[#111111]">Graduation Year *</label>
            <input
              type="number"
              required
              placeholder="E.g., 2027"
              value={graduationYear}
              onChange={(e) => setGraduationYear(e.target.value)}
              className="px-4 py-3 rounded-xl border border-[#E9E3DA] bg-[#FCFBF8] text-[13px] font-semibold text-[#111111] focus:outline-none focus:border-[#F4C542] transition-colors"
            />
          </div>
        </div>
      </div>

      {/* SECTION 3: Internship Domain */}
      <div className="flex flex-col gap-5 pt-4 border-t border-[#E9E3DA]/65">
        <span className="font-mono text-[11px] font-bold text-[#A8A296] uppercase tracking-wider">— Internship Track</span>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div className="flex flex-col gap-1.5">
            <label className="text-[12.5px] font-bold text-[#111111]">Select Internship Domain *</label>
            <select
              value={domainId}
              onChange={(e) => setDomainId(e.target.value)}
              className="px-4 py-3 rounded-xl border border-[#E9E3DA] bg-[#FCFBF8] text-[13px] font-semibold text-[#111111] focus:outline-none focus:border-[#F4C542] transition-colors"
            >
              {domains.map((d) => (
                <option key={d._id} value={d._id}>{d.name}</option>
              ))}
            </select>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-[12.5px] font-bold text-[#111111]">Experience Level *</label>
            <select
              value={experienceLevel}
              onChange={(e) => setExperienceLevel(e.target.value)}
              className="px-4 py-3 rounded-xl border border-[#E9E3DA] bg-[#FCFBF8] text-[13px] font-semibold text-[#111111] focus:outline-none focus:border-[#F4C542] transition-colors"
            >
              <option value="Beginner">Beginner (No prior work, basic code skills)</option>
              <option value="Intermediate">Intermediate (Built side projects, understand git)</option>
              <option value="Advanced">Advanced (Built production apps or held past interns)</option>
            </select>
          </div>
        </div>
      </div>

      {/* SECTION 4: Professional Info & Files */}
      <div className="flex flex-col gap-5 pt-4 border-t border-[#E9E3DA]/65">
        <span className="font-mono text-[11px] font-bold text-[#A8A296] uppercase tracking-wider">— Professional Links & Attachments</span>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* Resume Upload Component */}
          <div className="flex flex-col gap-1.5 md:col-span-2">
            <label className="text-[12.5px] font-bold text-[#111111]">Resume / CV (PDF) *</label>
            <div className={`border-2 border-dashed rounded-2xl p-6 transition-all flex flex-col items-center justify-center text-center gap-3 cursor-pointer ${
              resumeUrl 
                ? "border-[#4CAF50]/40 bg-[#4CAF50]/5" 
                : uploadError 
                  ? "border-red-300 bg-red-50/50" 
                  : "border-[#E9E3DA] bg-[#FCFBF8] hover:border-[#F4C542] hover:bg-[#F4C542]/5"
            }`}
            onClick={() => document.getElementById("resume-file-input")?.click()}
            >
              <input
                id="resume-file-input"
                type="file"
                accept=".pdf"
                className="hidden"
                onChange={handleFileUpload}
                disabled={isUploading}
              />
              
              {isUploading ? (
                <div className="flex flex-col items-center gap-2">
                  <RefreshCw size={24} className="animate-spin text-[#F4C542]" />
                  <span className="text-[13px] font-bold text-[#111111]">Uploading Resume...</span>
                  <span className="text-[11.5px] font-medium text-[#6A6A6A]">Please wait while we secure your file.</span>
                </div>
              ) : resumeUrl ? (
                <div className="flex flex-col items-center gap-2">
                  <div className="w-10 h-10 rounded-full bg-[#4CAF50]/15 flex items-center justify-center text-[#4CAF50]">
                    <Check size={20} />
                  </div>
                  <span className="text-[13px] font-bold text-[#111111]">Resume Uploaded!</span>
                  <span className="text-[11.5px] font-medium text-[#6A6A6A] underline truncate max-w-xs">{resumeUrl.split('/').pop()}</span>
                  <button 
                    type="button" 
                    className="text-[11.5px] font-bold text-[#F4C542] hover:underline mt-1 focus:outline-none"
                    onClick={(e) => {
                      e.stopPropagation();
                      setResumeUrl("");
                    }}
                  >
                    Change File
                  </button>
                </div>
              ) : (
                <div className="flex flex-col items-center gap-2">
                  <div className="w-10 h-10 rounded-full bg-[#111111]/5 flex items-center justify-center text-[#111111]/60">
                    <Upload size={20} />
                  </div>
                  <span className="text-[13px] font-bold text-[#111111]">Click to upload Resume (PDF)</span>
                  <span className="text-[11.5px] font-medium text-[#6A6A6A]">Max file size: 5MB</span>
                </div>
              )}
            </div>
            {uploadError && (
              <div className="text-red-500 text-[11px] font-bold flex items-center gap-1 mt-1">
                <AlertCircle size={12} />
                <span>{uploadError}</span>
              </div>
            )}
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-[12.5px] font-bold text-[#111111]">GitHub Profile URL</label>
            <input
              type="url"
              placeholder="e.g., https://github.com/username"
              value={github}
              onChange={(e) => setGithub(e.target.value)}
              className="px-4 py-3 rounded-xl border border-[#E9E3DA] bg-[#FCFBF8] text-[13px] font-semibold text-[#111111] focus:outline-none focus:border-[#F4C542] transition-colors"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-[12.5px] font-bold text-[#111111]">LinkedIn Profile URL</label>
            <input
              type="url"
              placeholder="e.g., https://linkedin.com/in/username"
              value={linkedin}
              onChange={(e) => setLinkedin(e.target.value)}
              className="px-4 py-3 rounded-xl border border-[#E9E3DA] bg-[#FCFBF8] text-[13px] font-semibold text-[#111111] focus:outline-none focus:border-[#F4C542] transition-colors"
            />
          </div>

          <div className="flex flex-col gap-1.5 md:col-span-2">
            <label className="text-[12.5px] font-bold text-[#111111]">Portfolio Link (Website)</label>
            <input
              type="url"
              placeholder="e.g., https://myportfolio.com"
              value={portfolio}
              onChange={(e) => setPortfolio(e.target.value)}
              className="px-4 py-3 rounded-xl border border-[#E9E3DA] bg-[#FCFBF8] text-[13px] font-semibold text-[#111111] focus:outline-none focus:border-[#F4C542] transition-colors"
            />
          </div>
        </div>
      </div>

      {/* SECTION 5: Core Questions */}
      <div className="flex flex-col gap-5 pt-4 border-t border-[#E9E3DA]/65">
        <span className="font-mono text-[11px] font-bold text-[#A8A296] uppercase tracking-wider">— Candidate Questionnaire</span>
        
        <div className="flex flex-col gap-5">
          <div className="flex flex-col gap-1.5">
            <label className="text-[12.5px] font-bold text-[#111111]">Why do you want to join GrowthBridge? *</label>
            <textarea
              required
              rows={4}
              placeholder="Describe your motivations, aspirations, and what you hope to learn."
              value={whyJoin}
              onChange={(e) => setWhyJoin(e.target.value)}
              className="px-4 py-3 rounded-xl border border-[#E9E3DA] bg-[#FCFBF8] text-[13px] font-semibold text-[#111111] focus:outline-none focus:border-[#F4C542] transition-colors resize-y"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-[12.5px] font-bold text-[#111111]">Have you built any engineering projects before? *</label>
            <div className="flex items-center gap-6 mt-1.5">
              <label className="flex items-center gap-2 cursor-pointer text-[13px] font-semibold text-[#111111]">
                <input
                  type="radio"
                  name="hasProjects"
                  value="Yes"
                  checked={hasProjects === "Yes"}
                  onChange={() => setHasProjects("Yes")}
                  className="w-4 h-4 text-[#F4C542] border-[#E9E3DA] focus:ring-0 cursor-pointer"
                />
                <span>Yes, I have.</span>
              </label>
              
              <label className="flex items-center gap-2 cursor-pointer text-[13px] font-semibold text-[#111111]">
                <input
                  type="radio"
                  name="hasProjects"
                  value="No"
                  checked={hasProjects === "No"}
                  onChange={() => setHasProjects("No")}
                  className="w-4 h-4 text-[#F4C542] border-[#E9E3DA] focus:ring-0 cursor-pointer"
                />
                <span>No, I haven't.</span>
              </label>
            </div>
          </div>
        </div>
      </div>

      {/* SECTION 6: Declaration Checkboxes */}
      <div className="flex flex-col gap-4 pt-4 border-t border-[#E9E3DA]/65">
        <span className="font-mono text-[11px] font-bold text-[#A8A296] uppercase tracking-wider">— Declaration</span>
        
        <label className="flex items-start gap-3.5 cursor-pointer">
          <input
            type="checkbox"
            checked={declaration}
            onChange={(e) => setDeclaration(e.target.checked)}
            className="w-5 h-5 rounded border-[#E9E3DA] text-[#F4C542] focus:ring-0 cursor-pointer shrink-0 mt-0.5"
          />
          <div className="flex flex-col gap-1 text-[13px] text-[#6A6A6A] font-semibold leading-snug">
            <span className="text-[#111111] font-bold">I hereby declare that:</span>
            <p>1. The information provided in this registration form is accurate.</p>
            <p>2. I understand that the official internship Certificate is issued only after successful completion of all assigned weekly tasks.</p>
            <p>3. Freelance/paid client opportunities are strictly performance-based under evaluation.</p>
          </div>
        </label>
      </div>

      {/* Error display */}
      {formError && (
        <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-500 flex items-center gap-2.5">
          <AlertCircle size={16} className="shrink-0" />
          <span className="text-[12.5px] font-bold">{formError}</span>
        </div>
      )}

      {/* SUBMIT BUTTON */}
      <div className="pt-4 border-t border-[#E9E3DA]/65 flex justify-end">
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-[#111111] hover:bg-[#F4C542] hover:text-[#111111] text-white disabled:opacity-50 text-[14px] font-extrabold tracking-tight transition-all duration-350 shadow-md flex items-center justify-center gap-2 cursor-pointer disabled:cursor-not-allowed"
        >
          {isSubmitting ? (
            <>
              <RefreshCw size={15} className="animate-spin" />
              <span>Submitting Application...</span>
            </>
          ) : (
            <span>Apply for Internship</span>
          )}
        </button>
      </div>
    </form>
  );
}
