import React from "react";
import { getOfferLetters } from "@/lib/actions/internship";
import { FileText, Download, Eye, ArrowUpRight } from "lucide-react";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function AdminOfferLettersLogPage() {
  // Retrieve the collection of generated offer letters from the database
  const offerLetters = await getOfferLetters().catch(() => []);

  return (
    <div className="flex flex-col gap-6 text-left">
      <div className="flex flex-col gap-0.5">
        <h1 className="text-[22px] font-black tracking-tight text-[#111111]">Issued Offer Letters</h1>
        <span className="text-[12.5px] text-[#6A6A6A] font-semibold">Track selection letters, download secure PDF files, and navigate candidate profiles.</span>
      </div>

      <div className="bg-white border border-[#E9E3DA] rounded-2xl overflow-hidden shadow-[0_4px_12px_rgba(0,0,0,0.01)]">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#FCFBF8] border-b border-[#E9E3DA] text-[11px] font-extrabold uppercase tracking-wider text-[#6A6A6A]">
                <th className="px-6 py-4">Application ID</th>
                <th className="px-6 py-4">Student Name</th>
                <th className="px-6 py-4">Internship Domain</th>
                <th className="px-6 py-4">Generated At</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            
            <tbody className="divide-y divide-[#E9E3DA]/60 text-[12.5px] font-semibold text-[#111111]">
              {offerLetters.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-20 text-center text-[#A8A296] font-mono">
                    No offer letters have been generated yet.
                  </td>
                </tr>
              ) : (
                offerLetters.map((letter: any) => {
                  const appData = letter.applicationId || {};
                  const domainData = appData.domainId || {};
                  return (
                    <tr key={letter._id} className="hover:bg-[#FCFBF8]/40 transition-colors">
                      <td className="px-6 py-4 font-mono font-bold text-[#6A6A6A]">
                        {appData.applicationId || "N/A"}
                      </td>
                      <td className="px-6 py-4 font-extrabold">{appData.fullName || "N/A"}</td>
                      <td className="px-6 py-4">{domainData.name || "N/A"}</td>
                      <td className="px-6 py-4 text-[#6A6A6A]">
                        {letter.generatedAt ? new Date(letter.generatedAt).toLocaleString() : "N/A"}
                      </td>
                      <td className="px-6 py-4 text-right flex items-center justify-end gap-2">
                        <a
                          href={letter.offerLetterUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="p-2 rounded-lg border border-[#E9E3DA] hover:bg-[#FCFBF8] text-[#6A6A6A] hover:text-[#111111] transition-all cursor-pointer"
                          title="Download PDF"
                        >
                          <Download size={13} />
                        </a>
                        <Link
                          href={`/admin/internships/applicants/${appData._id}`}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[#E9E3DA] hover:border-[#D7D0C8] hover:bg-[#FCFBF8] text-[11px] font-bold text-[#111111] transition-all shadow-inner"
                        >
                          <Eye size={12} className="text-[#6A6A6A]" />
                          <span>View Profile</span>
                          <ArrowUpRight size={10} className="text-[#A8A296]" />
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
