import React from "react";
import { getCertificates } from "@/lib/actions/internship";
import { Award, Eye, Download, ShieldCheck, ExternalLink } from "lucide-react";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function AdminCertificatesLogPage() {
  // Retrieve the collection of issued certificates from the database
  const certificates = await getCertificates().catch(() => []);

  return (
    <div className="flex flex-col gap-6 text-left">
      <div className="flex flex-col gap-0.5">
        <h1 className="text-[22px] font-black tracking-tight text-[#111111]">Issued Certificates</h1>
        <span className="text-[12.5px] text-[#6A6A6A] font-semibold">Log register of generated credentials and public verification records.</span>
      </div>

      <div className="bg-white border border-[#E9E3DA] rounded-2xl overflow-hidden shadow-[0_4px_12px_rgba(0,0,0,0.01)]">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#FCFBF8] border-b border-[#E9E3DA] text-[11px] font-extrabold uppercase tracking-wider text-[#6A6A6A]">
                <th className="px-6 py-4">Certificate ID</th>
                <th className="px-6 py-4">Student Name</th>
                <th className="px-6 py-4">Internship Domain</th>
                <th className="px-6 py-4">Issue Date</th>
                <th className="px-6 py-4">Performance</th>
                <th className="px-6 py-4">Project Title</th>
                <th className="px-6 py-4 text-center">Verification</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            
            <tbody className="divide-y divide-[#E9E3DA]/60 text-[12.5px] font-semibold text-[#111111]">
              {certificates.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-20 text-center text-[#A8A296] font-mono">
                    No certificates have been issued yet.
                  </td>
                </tr>
              ) : (
                certificates.map((cert: any) => {
                  const appData = cert.applicationId || {};
                  const domainData = appData.domainId || {};
                  return (
                    <tr key={cert._id} className="hover:bg-[#FCFBF8]/40 transition-colors">
                      <td className="px-6 py-4 font-mono font-bold text-indigo-600">
                        {cert.certificateId}
                      </td>
                      <td className="px-6 py-4 font-extrabold">{appData.fullName || "N/A"}</td>
                      <td className="px-6 py-4">{domainData.name || "N/A"}</td>
                      <td className="px-6 py-4 text-[#6A6A6A]">
                        {cert.issueDate ? new Date(cert.issueDate).toLocaleDateString() : "N/A"}
                      </td>
                      <td className="px-6 py-4">
                        <span className="px-2.5 py-0.5 rounded bg-purple-50 text-purple-600 border border-purple-100 text-[11px] font-bold">
                          {cert.performance}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-[#6A6A6A] max-w-xs truncate italic">
                        "{cert.projectTitle || "N/A"}"
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-emerald-50 border border-emerald-200 text-[10px] font-bold text-emerald-600 uppercase tracking-wider">
                          <ShieldCheck size={11} />
                          <span>Active</span>
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right flex items-center justify-end gap-2">
                        <a
                          href={cert.certificateUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="p-2 rounded-lg border border-[#E9E3DA] hover:bg-[#FCFBF8] text-[#6A6A6A] hover:text-[#111111] transition-all cursor-pointer"
                          title="Download PDF"
                        >
                          <Download size={13} />
                        </a>
                        <Link
                          href={`/internship/verify/${cert.certificateId}`}
                          target="_blank"
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[#E9E3DA] hover:border-[#D7D0C8] hover:bg-[#FCFBF8] text-[11px] font-bold text-[#111111] transition-all shadow-inner"
                        >
                          <Eye size={12} className="text-[#6A6A6A]" />
                          <span>Portal View</span>
                          <ExternalLink size={9} className="text-[#A8A296]" />
                        </Link>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
