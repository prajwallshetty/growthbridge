import React from "react";
import Link from "next/link";
import { getCertificateByVerificationId } from "@/lib/actions/internship";
import { ShieldCheck, AlertCircle, ArrowUpRight, Award, Calendar, Check, ExternalLink } from "lucide-react";

interface VerificationPageProps {
  params: Promise<{ certificateId: string }>;
}

export const dynamic = "force-dynamic";

export default async function CertificateVerificationPage({ params }: VerificationPageProps) {
  const { certificateId } = await params;

  // Query database for verification record
  const cert = await getCertificateByVerificationId(certificateId).catch(() => null);

  if (!cert) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center py-16 px-6">
        <div className="max-w-md w-full bg-white border border-[#E9E3DA] rounded-3xl p-8 sm:p-10 text-center shadow-md flex flex-col items-center">
          <div className="w-16 h-16 rounded-full bg-red-50 text-red-500 border border-red-100 flex items-center justify-center mb-6">
            <AlertCircle size={32} strokeWidth={1.8} />
          </div>
          
          <span className="font-mono text-[10px] font-bold text-red-400 uppercase tracking-[0.18em]">
            Verification Failed
          </span>
          
          <h1 className="text-[22px] font-black tracking-tight text-[#111111] mt-3">
            Certificate Not Found
          </h1>
          
          <p className="mt-3 text-[13px] text-[#6A6A6A] leading-relaxed font-semibold">
            The certificate ID you are trying to verify does not match our records. Please double-check the ID or URL.
          </p>

          <div className="mt-8 pt-6 border-t border-[#E9E3DA]/60 w-full flex flex-col gap-3">
            <Link
              href="/internship"
              className="w-full py-3 rounded-xl bg-[#111111] text-white text-[12.5px] font-bold hover:bg-[#F4C542] hover:text-[#111111] transition-all"
            >
              Go to Internship Portal
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const appData = cert.applicationId || {};
  const domainData = appData.domainId || {};

  return (
    <div className="min-h-screen bg-[#FCFBF8] py-16 px-4 sm:px-6 lg:px-8 relative">
      <div className="absolute top-0 inset-x-0 h-96 bg-[radial-gradient(circle_at_center,_rgba(244,197,66,0.03)_0%,_transparent_75%)] pointer-events-none" />
      
      <div className="max-w-2xl mx-auto relative z-10">
        
        {/* Verification Card */}
        <div className="bg-white border border-[#E9E3DA] rounded-3xl p-6 sm:p-10 shadow-[0_15px_45px_rgba(0,0,0,0.02)] flex flex-col gap-8">
          
          {/* Header verified badge */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pb-6 border-b border-[#E9E3DA]/65">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-emerald-50 text-emerald-500 border border-emerald-100 flex items-center justify-center">
                <ShieldCheck size={26} strokeWidth={1.8} />
              </div>
              <div className="text-left">
                <span className="font-mono text-[10px] font-bold text-emerald-500 uppercase tracking-widest block">Credential Verification</span>
                <span className="text-[16px] font-extrabold text-[#111111]">Successfully Verified</span>
              </div>
            </div>
            
            <span className="px-3.5 py-1.5 rounded-full bg-emerald-50 border border-emerald-200 text-[11px] font-extrabold text-emerald-600 uppercase tracking-wider flex items-center gap-1.5 shadow-sm">
              <Check size={12} strokeWidth={3} />
              <span>Verified Candidate</span>
            </span>
          </div>

          {/* Details layout */}
          <div className="flex flex-col gap-6">
            <h2 className="text-[12px] font-mono font-bold uppercase tracking-wider text-[#A8A296]">— Credential Details</h2>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-5 gap-x-8">
              
              <div className="flex flex-col gap-1">
                <span className="text-[11.5px] font-semibold text-[#6A6A6A]">Student Name</span>
                <span className="text-[14.5px] font-bold text-[#111111]">{appData.fullName || "N/A"}</span>
              </div>

              <div className="flex flex-col gap-1">
                <span className="text-[11.5px] font-semibold text-[#6A6A6A]">Certificate ID</span>
                <span className="text-[14.5px] font-mono font-bold text-[#111111]">{cert.certificateId}</span>
              </div>

              <div className="flex flex-col gap-1">
                <span className="text-[11.5px] font-semibold text-[#6A6A6A]">Internship Domain</span>
                <span className="text-[14.5px] font-bold text-[#111111]">{domainData.name || "N/A"}</span>
              </div>

              <div className="flex flex-col gap-1">
                <span className="text-[11.5px] font-semibold text-[#6A6A6A]">Program Duration</span>
                <span className="text-[14.5px] font-bold text-[#111111]">{domainData.duration || "4 Weeks"}</span>
              </div>

              <div className="flex flex-col gap-1">
                <span className="text-[11.5px] font-semibold text-[#6A6A6A]">Issue Date</span>
                <span className="text-[14.5px] font-bold text-[#111111]">
                  {cert.issueDate ? new Date(cert.issueDate).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" }) : "N/A"}
                </span>
              </div>

              <div className="flex flex-col gap-1">
                <span className="text-[11.5px] font-semibold text-[#6A6A6A]">Performance Evaluation</span>
                <span className="text-[14.5px] font-bold text-[#111111]">{cert.performance || "Excellent"}</span>
              </div>

              <div className="flex flex-col gap-1 sm:col-span-2">
                <span className="text-[11.5px] font-semibold text-[#6A6A6A]">Capstone Project Title</span>
                <span className="text-[14px] font-bold text-[#111111] italic">"{cert.projectTitle || "N/A"}"</span>
              </div>

            </div>
          </div>

          {/* Action Links */}
          <div className="pt-6 border-t border-[#E9E3DA]/65 flex flex-col sm:flex-row items-center gap-4">
            <a
              href={cert.certificateUrl}
              target="_blank"
              rel="noreferrer"
              className="w-full sm:w-auto px-6 py-3 rounded-xl bg-[#111111] hover:bg-[#F4C542] hover:text-[#111111] text-white text-[12.5px] font-bold tracking-tight transition-all duration-300 flex items-center justify-center gap-1.5 shadow-sm"
            >
              <span>Download PDF Document</span>
              <ExternalLink size={13} />
            </a>
            
            <Link
              href="/internship"
              className="w-full sm:w-auto px-6 py-3 rounded-xl bg-white border border-[#E9E3DA] text-[#6A6A6A] text-[12.5px] font-semibold hover:border-[#D7D0C8] hover:text-[#111111] transition-all flex items-center justify-center gap-1"
            >
              <span>Back to Portal</span>
            </Link>
          </div>

        </div>

        {/* Floating disclaimer */}
        <div className="mt-6 text-center text-[11px] text-[#A8A296] font-semibold flex items-center justify-center gap-1.5">
          <ShieldCheck size={12} className="text-emerald-500" />
          <span>Secured and verified by GrowthBridge Studio cryptographic records.</span>
        </div>

      </div>
    </div>
  );
}
