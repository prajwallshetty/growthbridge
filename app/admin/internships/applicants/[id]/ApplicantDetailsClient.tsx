"use client";

import React, { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { updateApplicationStatus, gradeSubmission } from "@/lib/actions/internship";
import {
  ArrowLeft,
  Mail,
  Phone,
  Calendar,
  User,
  GraduationCap,
  Briefcase,
  FileText,
  Globe,
  Award,
  AlertCircle,
  CheckCircle,
  RefreshCw,
  Edit2,
  ExternalLink,
} from "lucide-react";
import Link from "next/link";

interface ApplicantDetailsProps {
  applicant: any;
}

export default function ApplicantDetailsClient({ applicant }: ApplicantDetailsProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  // Status triggers
  const [status, setStatus] = useState(applicant.status);
  const [remarks, setRemarks] = useState(applicant.remarks || "");
  const [isSavingStatus, setIsSavingStatus] = useState(false);
  const [errorStatus, setErrorStatus] = useState("");

  // Certificate Modal Inputs
  const [projectTitle, setProjectTitle] = useState(applicant.certificate?.projectTitle || "");
  const [performanceRating, setPerformanceRating] = useState(applicant.certificate?.performance || "Outstanding");

  // Grade State
  const [gradingSubmissionId, setGradingSubmissionId] = useState<string | null>(null);
  const [gradeMarks, setGradeMarks] = useState<number>(0);
  const [gradeRemarks, setGradeRemarks] = useState<string>("");
  const [isGrading, setIsGrading] = useState(false);

  const handleStatusChange = async (newStatus: string) => {
    setIsSavingStatus(true);
    setErrorStatus("");
    try {
      await updateApplicationStatus(applicant._id, newStatus, remarks);
      setStatus(newStatus);
      router.refresh();
    } catch (err: any) {
      setErrorStatus(err.message || "Failed to update status.");
    } finally {
      setIsSavingStatus(false);
    }
  };

  const handleManualCertificateGen = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingStatus(true);
    setErrorStatus("");
    try {
      await updateApplicationStatus(applicant._id, "Completed", projectTitle || remarks);
      setStatus("Completed");
      router.refresh();
    } catch (err: any) {
      setErrorStatus(err.message || "Failed to generate certificate.");
    } finally {
      setIsSavingStatus(false);
    }
  };

  const handleManualOfferLetterGen = async () => {
    setIsSavingStatus(true);
    setErrorStatus("");
    try {
      await updateApplicationStatus(applicant._id, "Selected", remarks);
      setStatus("Selected");
      router.refresh();
    } catch (err: any) {
      setErrorStatus(err.message || "Failed to generate offer letter.");
    } finally {
      setIsSavingStatus(false);
    }
  };

  const handleGradeSubmit = async (submissionId: string) => {
    setIsGrading(true);
    try {
      await gradeSubmission(submissionId, gradeMarks, gradeRemarks);
      setGradingSubmissionId(null);
      router.refresh();
    } catch (err) {
      console.error(err);
      alert("Failed to grade submission.");
    } finally {
      setIsGrading(false);
    }
  };

  const getStatusClass = (currStatus: string) => {
    switch (currStatus) {
      case "Pending":
        return "text-amber-600 bg-amber-50 border-amber-200";
      case "Shortlisted":
        return "text-blue-600 bg-blue-50 border-blue-200";
      case "Selected":
        return "text-emerald-600 bg-emerald-50 border-emerald-200";
      case "Rejected":
        return "text-red-600 bg-red-50 border-red-200";
      case "Completed":
        return "text-purple-600 bg-purple-50 border-purple-200";
      default:
        return "text-gray-600 bg-gray-50 border-gray-200";
    }
  };

  return (
    <div className="flex flex-col gap-8">
      
      {/* Back breadcrumb */}
      <div className="flex items-center gap-3">
        <Link
          href="/admin/internships/applications"
          className="p-2 rounded-lg border border-[#E9E3DA] hover:border-[#D7D0C8] bg-white text-[#6A6A6A] hover:text-[#111111] transition-all shadow-sm"
        >
          <ArrowLeft size={14} />
        </Link>
        <div className="flex flex-col text-left">
          <span className="text-[11px] font-mono font-bold text-[#A8A296] uppercase tracking-wider">Candidate Directory</span>
          <h1 className="text-[22px] font-black tracking-tight text-[#111111]">
            Applicant: {applicant.fullName}
          </h1>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* LEFT COLUMN: Details, Resume & Answers */}
        <div className="lg:col-span-8 flex flex-col gap-8">
          
          {/* Card 1: Bio Roster */}
          <div className="bg-white border border-[#E9E3DA] rounded-2xl p-6 sm:p-8 flex flex-col gap-6 shadow-[0_4px_12px_rgba(0,0,0,0.01)] text-left">
            <span className="font-mono text-[11px] font-bold text-[#A8A296] uppercase tracking-wider">— Bio & Academic Roster</span>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              
              {/* Personal */}
              <div className="flex flex-col gap-3">
                <h3 className="text-[13px] font-bold text-[#111111] flex items-center gap-1.5 border-b border-[#E9E3DA]/50 pb-2">
                  <User size={13} className="text-[#A8A296]" />
                  <span>Personal Info</span>
                </h3>
                <div className="flex flex-col gap-1.5 text-[12.5px] font-semibold text-[#6A6A6A]">
                  <span>Email: <strong className="text-[#111111]">{applicant.email}</strong></span>
                  <span>Phone: <strong className="text-[#111111]">{applicant.phone}</strong></span>
                  <span>Gender: <strong className="text-[#111111]">{applicant.gender || "N/A"}</strong></span>
                  <span>DOB: <strong className="text-[#111111]">{applicant.dob ? new Date(applicant.dob).toLocaleDateString() : "N/A"}</strong></span>
                </div>
              </div>

              {/* Academic */}
              <div className="flex flex-col gap-3">
                <h3 className="text-[13px] font-bold text-[#111111] flex items-center gap-1.5 border-b border-[#E9E3DA]/50 pb-2">
                  <GraduationCap size={13} className="text-[#A8A296]" />
                  <span>College & Course</span>
                </h3>
                <div className="flex flex-col gap-1.5 text-[12.5px] font-semibold text-[#6A6A6A]">
                  <span>Institution: <strong className="text-[#111111] truncate block max-w-xs">{applicant.college}</strong></span>
                  <span>Degree & Branch: <strong className="text-[#111111]">{applicant.degree} in {applicant.branch}</strong></span>
                  <span>Graduation Year: <strong className="text-[#111111]">{applicant.graduationYear} ({applicant.currentYear})</strong></span>
                </div>
              </div>

              {/* Track Selection */}
              <div className="flex flex-col gap-3 sm:col-span-2">
                <h3 className="text-[13px] font-bold text-[#111111] flex items-center gap-1.5 border-b border-[#E9E3DA]/50 pb-2">
                  <Briefcase size={13} className="text-[#A8A296]" />
                  <span>Internship Target</span>
                </h3>
                <div className="grid grid-cols-2 gap-4 text-[12.5px] font-semibold text-[#6A6A6A]">
                  <span>Applied Track: <strong className="text-[#111111]">{applicant.domainId?.name || "N/A"}</strong></span>
                  <span>Experience Declared: <strong className="text-[#111111]">{applicant.experienceLevel}</strong></span>
                </div>
              </div>

            </div>
          </div>

          {/* Card 2: Professional Profiles */}
          <div className="bg-white border border-[#E9E3DA] rounded-2xl p-6 sm:p-8 flex flex-col gap-5 shadow-[0_4px_12px_rgba(0,0,0,0.01)] text-left">
            <span className="font-mono text-[11px] font-bold text-[#A8A296] uppercase tracking-wider">— Developer Profiles</span>
            
            <div className="flex flex-wrap items-center gap-4">
              {applicant.github && (
                <a
                  href={applicant.github}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-[#E9E3DA] hover:border-[#D7D0C8] hover:bg-[#FCFBF8] text-[12.5px] font-bold text-[#111111]"
                >
                  <svg viewBox="0 0 24 24" width="14" height="14" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" className="text-[#6A6A6A]"><path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"></path></svg>
                  <span>GitHub</span>
                  <ExternalLink size={10} className="text-[#A8A296]" />
                </a>
              )}
              {applicant.linkedin && (
                <a
                  href={applicant.linkedin}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-[#E9E3DA] hover:border-[#D7D0C8] hover:bg-[#FCFBF8] text-[12.5px] font-bold text-[#111111]"
                >
                  <svg viewBox="0 0 24 24" width="14" height="14" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" className="text-blue-600"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"></path><rect x="2" y="9" width="4" height="12"></rect><circle cx="4" cy="4" r="2"></circle></svg>
                  <span>LinkedIn</span>
                  <ExternalLink size={10} className="text-[#A8A296]" />
                </a>
              )}
              {applicant.portfolio && (
                <a
                  href={applicant.portfolio}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-[#E9E3DA] hover:border-[#D7D0C8] hover:bg-[#FCFBF8] text-[12.5px] font-bold text-[#111111]"
                >
                  <Globe size={14} className="text-[#F4C542]" />
                  <span>Portfolio Site</span>
                  <ExternalLink size={10} className="text-[#A8A296]" />
                </a>
              )}
              {!applicant.github && !applicant.linkedin && !applicant.portfolio && (
                <span className="text-[12.5px] text-[#A8A296] font-mono">No profile links submitted.</span>
              )}
            </div>
          </div>

          {/* Card 3: Questions/Motivation */}
          <div className="bg-white border border-[#E9E3DA] rounded-2xl p-6 sm:p-8 flex flex-col gap-6 shadow-[0_4px_12px_rgba(0,0,0,0.01)] text-left">
            <span className="font-mono text-[11px] font-bold text-[#A8A296] uppercase tracking-wider">— Motivation & Projects</span>
            
            <div className="flex flex-col gap-4 text-[13px] font-semibold text-[#111111]">
              <div className="flex flex-col gap-1">
                <span className="text-[11.5px] font-bold text-[#6A6A6A]">Why do you want to join GrowthBridge?</span>
                <p className="bg-[#FCFBF8] border border-[#E9E3DA] p-4 rounded-xl leading-relaxed text-[#6A6A6A] font-medium font-sans">
                  {applicant.whyJoin || "N/A"}
                </p>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-[11.5px] font-bold text-[#6A6A6A]">Has built engineering projects before:</span>
                <span className="text-[#111111] font-bold uppercase">{applicant.hasProjects || "No"}</span>
              </div>
            </div>
          </div>

          {/* Card 4: Resume PDF Preview */}
          <div className="bg-white border border-[#E9E3DA] rounded-2xl p-6 sm:p-8 flex flex-col gap-5 shadow-[0_4px_12px_rgba(0,0,0,0.01)] text-left">
            <span className="font-mono text-[11px] font-bold text-[#A8A296] uppercase tracking-wider">— Resume Preview</span>
            {applicant.resumeUrl ? (
              <div className="flex flex-col gap-4">
                <div className="flex items-center justify-between">
                  <span className="text-[12.5px] text-[#6A6A6A] font-medium">Inline Document View</span>
                  <a
                    href={applicant.resumeUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-1 text-[11.5px] font-bold text-[#F4C542] hover:underline"
                  >
                    <span>Open in New Tab</span>
                    <ExternalLink size={11} />
                  </a>
                </div>
                <iframe
                  src={applicant.resumeUrl}
                  className="w-full h-[500px] border border-[#E9E3DA] rounded-2xl"
                  title="Resume PDF Preview"
                />
              </div>
            ) : (
              <div className="p-10 text-center text-[#A8A296] font-mono">No resume PDF uploaded.</div>
            )}
          </div>

          {/* Card 5: Task Submissions Log */}
          <div className="bg-white border border-[#E9E3DA] rounded-2xl p-6 sm:p-8 flex flex-col gap-6 shadow-[0_4px_12px_rgba(0,0,0,0.01)] text-left">
            <span className="font-mono text-[11px] font-bold text-[#A8A296] uppercase tracking-wider">— Weekly Submissions Log</span>
            
            {applicant.submissions?.length === 0 ? (
              <div className="py-12 text-center text-[12.5px] text-[#6A6A6A] font-mono">No tasks submitted by candidate yet.</div>
            ) : (
              <div className="flex flex-col gap-6">
                {applicant.submissions.map((sub: any) => (
                  <div key={sub._id} className="border border-[#E9E3DA] p-5 rounded-2xl flex flex-col gap-4">
                    <div className="flex items-center justify-between pb-3 border-b border-[#E9E3DA]/60">
                      <div className="flex flex-col">
                        <span className="text-[13.5px] font-extrabold text-[#111111]">
                          Week {sub.taskId?.week || 1} Task: {sub.taskId?.title || "Task"}
                        </span>
                        <span className="text-[11px] text-[#6A6A6A] font-semibold font-mono">Submitted: {new Date(sub.createdAt).toLocaleDateString()}</span>
                      </div>
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                        sub.status === "Reviewed" ? "bg-emerald-50 text-emerald-600 border border-emerald-200" : "bg-amber-50 text-amber-600 border border-amber-200"
                      }`}>
                        {sub.status}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-4 text-[12.5px] font-semibold text-[#6A6A6A]">
                      <span>GitHub Repo: <a href={sub.githubUrl} target="_blank" rel="noreferrer" className="text-indigo-600 hover:underline">{sub.githubUrl}</a></span>
                      <span>Demo Link: {sub.demoUrl ? <a href={sub.demoUrl} target="_blank" rel="noreferrer" className="text-[#F4C542] hover:underline">{sub.demoUrl}</a> : "N/A"}</span>
                      <span className="col-span-2">Intern Comments: <span className="text-[#111111]">{sub.remarks || "No comments"}</span></span>
                    </div>

                    <div className="bg-[#FCFBF8] border border-[#E9E3DA] p-4 rounded-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                      <div className="flex flex-col text-left">
                        <span className="text-[11.5px] font-bold text-[#6A6A6A]">Grade & Eval</span>
                        <span className="text-[13px] font-bold text-[#111111]">
                          Marks: <span className="text-indigo-600 font-extrabold">{sub.marks} / 100</span> | Remarks: {sub.remarks || "None"}
                        </span>
                      </div>

                      {gradingSubmissionId === sub._id ? (
                        <div className="flex flex-col gap-3 w-full sm:w-auto">
                          <div className="flex items-center gap-2">
                            <input
                              type="number"
                              placeholder="Marks"
                              max={100}
                              value={gradeMarks}
                              onChange={(e) => setGradeMarks(parseInt(e.target.value, 10))}
                              className="w-20 px-3 py-1.5 rounded-lg border border-[#E9E3DA] bg-white text-[12.5px]"
                            />
                            <input
                              type="text"
                              placeholder="Remarks"
                              value={gradeRemarks}
                              onChange={(e) => setGradeRemarks(e.target.value)}
                              className="px-3 py-1.5 rounded-lg border border-[#E9E3DA] bg-white text-[12.5px] flex-1 min-w-[150px]"
                            />
                          </div>
                          <div className="flex items-center gap-2 justify-end">
                            <button
                              onClick={() => setGradingSubmissionId(null)}
                              className="text-[11px] font-bold text-[#6A6A6A] px-3 py-1.5 rounded-lg border hover:bg-[#F3F4F6] cursor-pointer"
                            >
                              Cancel
                            </button>
                            <button
                              onClick={() => handleGradeSubmit(sub._id)}
                              className="text-[11px] font-bold text-white bg-indigo-600 hover:bg-indigo-700 px-3 py-1.5 rounded-lg cursor-pointer"
                            >
                              Save Evaluation
                            </button>
                          </div>
                        </div>
                      ) : (
                        <button
                          onClick={() => {
                            setGradingSubmissionId(sub._id);
                            setGradeMarks(sub.marks);
                            setGradeRemarks(sub.remarks || "");
                          }}
                          className="px-3 py-1.5 rounded-lg border border-[#E9E3DA] hover:border-[#D7D0C8] hover:bg-white text-[11px] font-bold text-[#111111]"
                        >
                          Grade Submission
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>

        {/* RIGHT COLUMN: Evaluation Actions, Certificates & Offer Letters */}
        <div className="lg:col-span-4 flex flex-col gap-8">
          
          {/* Card 1: Review Panel & Evaluation Actions */}
          <div className="bg-white border border-[#E9E3DA] rounded-2xl p-6 flex flex-col gap-5 shadow-[0_4px_12px_rgba(0,0,0,0.01)] text-left">
            <span className="font-mono text-[11px] font-bold text-[#A8A296] uppercase tracking-wider">— Review Panel</span>
            
            <div className="flex flex-col gap-3">
              <span className="text-[11.5px] font-bold text-[#6A6A6A]">Current Evaluation Status</span>
              <div className={`px-4 py-2.5 rounded-xl border text-[13px] font-extrabold uppercase tracking-wider text-center ${getStatusClass(status)}`}>
                {status}
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <span className="text-[11.5px] font-bold text-[#6A6A6A]">Transition Status</span>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => handleStatusChange("Shortlisted")}
                  disabled={isSavingStatus}
                  className="px-3 py-2 rounded-xl border border-blue-200 text-blue-600 hover:bg-blue-50 disabled:opacity-50 text-[11.5px] font-bold transition-all cursor-pointer"
                >
                  Shortlist
                </button>
                <button
                  onClick={() => handleStatusChange("Rejected")}
                  disabled={isSavingStatus}
                  className="px-3 py-2 rounded-xl border border-red-200 text-red-600 hover:bg-red-50 disabled:opacity-50 text-[11.5px] font-bold transition-all cursor-pointer"
                >
                  Reject
                </button>
                <button
                  onClick={() => handleStatusChange("Selected")}
                  disabled={isSavingStatus}
                  className="px-3 py-2 rounded-xl border border-emerald-200 text-emerald-600 hover:bg-emerald-50 disabled:opacity-50 text-[11.5px] font-bold transition-all col-span-2 cursor-pointer flex items-center justify-center gap-1"
                >
                  <CheckCircle size={12} />
                  <span>Select & Issue Offer</span>
                </button>
              </div>
            </div>

            <div className="flex flex-col gap-1.5 mt-2">
              <label className="text-[11.5px] font-bold text-[#6A6A6A]">Evaluation Remarks / Notes</label>
              <textarea
                rows={3}
                placeholder="Internal evaluator notes..."
                value={remarks}
                onChange={(e) => setRemarks(e.target.value)}
                className="w-full px-3 py-2 text-[12.5px] font-semibold border border-[#E9E3DA] bg-[#FCFBF8] rounded-xl focus:outline-none focus:border-[#F4C542]"
              />
            </div>

            {errorStatus && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-500 flex items-center gap-2 text-[11px] font-bold">
                <AlertCircle size={14} className="shrink-0" />
                <span>{errorStatus}</span>
              </div>
            )}
          </div>

          {/* Card 2: Offer Letter Generator */}
          <div className="bg-white border border-[#E9E3DA] rounded-2xl p-6 flex flex-col gap-5 shadow-[0_4px_12px_rgba(0,0,0,0.01)] text-left">
            <span className="font-mono text-[11px] font-bold text-[#A8A296] uppercase tracking-wider">— Offer Letter</span>
            
            {applicant.offerLetter ? (
              <div className="flex flex-col gap-3">
                <div className="flex items-center gap-2 bg-emerald-50 border border-emerald-100 p-3.5 rounded-xl text-emerald-600">
                  <CheckCircle size={16} className="shrink-0" />
                  <div className="text-left leading-tight text-[12.5px] font-bold">
                    <span>Generated & Issued</span>
                    <span className="text-[10px] text-emerald-500 font-semibold block mt-0.5">
                      {new Date(applicant.offerLetter.generatedAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>
                
                <a
                  href={applicant.offerLetter.offerLetterUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="w-full py-2.5 rounded-xl border border-[#E9E3DA] hover:border-[#D7D0C8] hover:bg-[#FCFBF8] text-[12px] font-bold text-[#111111] flex items-center justify-center gap-1.5 transition-all shadow-sm"
                >
                  <FileText size={14} className="text-[#6A6A6A]" />
                  <span>Download Offer Letter</span>
                  <ExternalLink size={10} className="text-[#A8A296]" />
                </a>
              </div>
            ) : (
              <div className="flex flex-col gap-3 text-center py-4">
                <span className="text-[12px] text-[#6A6A6A] font-semibold">No offer letter issued. To generate, select/approve the candidate.</span>
                <button
                  onClick={handleManualOfferLetterGen}
                  disabled={isSavingStatus}
                  className="mt-2 w-full py-2.5 rounded-xl bg-[#111111] hover:bg-[#F4C542] hover:text-[#111111] disabled:opacity-50 text-white text-[12px] font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5"
                >
                  {isSavingStatus ? <RefreshCw size={12} className="animate-spin" /> : <FileText size={14} />}
                  <span>Generate Offer Letter PDF</span>
                </button>
              </div>
            )}
          </div>

          {/* Card 3: Certificate Generator */}
          <div className="bg-white border border-[#E9E3DA] rounded-2xl p-6 flex flex-col gap-5 shadow-[0_4px_12px_rgba(0,0,0,0.01)] text-left">
            <span className="font-mono text-[11px] font-bold text-[#A8A296] uppercase tracking-wider">— Certificate</span>
            
            {applicant.certificate ? (
              <div className="flex flex-col gap-3">
                <div className="flex items-center gap-2 bg-emerald-50 border border-emerald-100 p-3.5 rounded-xl text-emerald-600">
                  <CheckCircle size={16} className="shrink-0" />
                  <div className="text-left leading-tight text-[12.5px] font-bold">
                    <span>Issued & Verified</span>
                    <span className="text-[9.5px] font-mono text-emerald-500 block mt-0.5">
                      ID: {applicant.certificate.certificateId}
                    </span>
                  </div>
                </div>
                
                <a
                  href={applicant.certificate.certificateUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="w-full py-2.5 rounded-xl border border-[#E9E3DA] hover:border-[#D7D0C8] hover:bg-[#FCFBF8] text-[12px] font-bold text-[#111111] flex items-center justify-center gap-1.5 transition-all shadow-sm"
                >
                  <Award size={14} className="text-[#6A6A6A]" />
                  <span>Download Certificate</span>
                  <ExternalLink size={10} className="text-[#A8A296]" />
                </a>

                <Link
                  href={`/internship/verify/${applicant.certificate.certificateId}`}
                  target="_blank"
                  className="w-full py-2.5 rounded-xl bg-white border border-indigo-200 hover:bg-indigo-50 text-[12px] font-bold text-indigo-600 flex items-center justify-center gap-1 transition-all"
                >
                  <span>Verification Portal Link</span>
                  <ExternalLink size={10} />
                </Link>
              </div>
            ) : (
              <form onSubmit={handleManualCertificateGen} className="flex flex-col gap-3">
                <span className="text-[12px] text-[#6A6A6A] font-semibold">Generate certificate by finalizing the capstone details:</span>
                
                <div className="flex flex-col gap-1.5">
                  <label className="text-[11px] font-bold text-[#6A6A6A]">Capstone Project Title</label>
                  <input
                    type="text"
                    required
                    placeholder="E.g., CRM Workspace System"
                    value={projectTitle}
                    onChange={(e) => setProjectTitle(e.target.value)}
                    className="w-full px-3 py-2 text-[12px] font-semibold border border-[#E9E3DA] bg-[#FCFBF8] rounded-xl focus:outline-none focus:border-[#F4C542]"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-[11px] font-bold text-[#6A6A6A]">Rating / Performance</label>
                  <select
                    value={performanceRating}
                    onChange={(e) => setPerformanceRating(e.target.value)}
                    className="w-full px-3 py-2 text-[12px] font-semibold border border-[#E9E3DA] bg-[#FCFBF8] rounded-xl focus:outline-none focus:border-[#F4C542]"
                  >
                    <option value="Outstanding">Outstanding</option>
                    <option value="Excellent">Excellent</option>
                    <option value="Very Good">Very Good</option>
                    <option value="Good">Good</option>
                  </select>
                </div>

                <button
                  type="submit"
                  disabled={isSavingStatus}
                  className="mt-2 w-full py-2.5 rounded-xl bg-[#111111] hover:bg-[#F4C542] hover:text-[#111111] disabled:opacity-50 text-white text-[12px] font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5"
                >
                  {isSavingStatus ? <RefreshCw size={12} className="animate-spin" /> : <Award size={14} />}
                  <span>Generate Certificate PDF</span>
                </button>
              </form>
            )}
          </div>

        </div>

      </div>

    </div>
  );
}
