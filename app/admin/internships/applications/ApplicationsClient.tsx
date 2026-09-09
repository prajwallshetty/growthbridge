"use client";

import React, { useState, useTransition } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Search, Download, Eye, ChevronLeft, ChevronRight, MessageSquare, ExternalLink, RefreshCw } from "lucide-react";
import { updateApplicationStatus } from "@/lib/actions/internship";

interface ApplicationItem {
  _id: string;
  applicationId: string;
  fullName: string;
  email?: string;
  phone: string;
  github?: string;
  linkedin?: string;
  domainId: { _id: string; name: string } | null;
  status: string;
  createdAt: string;
}

interface PaginationInfo {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

interface ApplicationsClientProps {
  initialApplications: ApplicationItem[];
  pagination: PaginationInfo;
  allApplicationsForExport: ApplicationItem[];
  currentStatus: string;
  currentSearch: string;
}

export default function ApplicationsClient({
  initialApplications,
  pagination,
  allApplicationsForExport,
  currentStatus,
  currentSearch,
}: ApplicationsClientProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const [searchText, setSearchText] = useState(currentSearch);
  const [statusFilter, setStatusFilter] = useState(currentStatus);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const statuses = ["All", "Applied", "Shortlisted", "Interview", "Selected", "Rejected", "Completed"];
  const adminAllowedStatuses = ["Applied", "Shortlisted", "Interview", "Selected", "Rejected"];

  // Update query parameters in the URL
  const updateQuery = (newSearch: string, newStatus: string, newPage: number) => {
    const params = new URLSearchParams(searchParams.toString());
    
    if (newSearch) {
      params.set("search", newSearch);
    } else {
      params.delete("search");
    }
    
    if (newStatus && newStatus !== "All") {
      params.set("status", newStatus);
    } else {
      params.delete("status");
    }
    
    if (newPage > 1) {
      params.set("page", newPage.toString());
    } else {
      params.delete("page");
    }

    startTransition(() => {
      router.push(`${pathname}?${params.toString()}`);
    });
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateQuery(searchText, statusFilter, 1);
  };

  const handleStatusFilterChange = (status: string) => {
    setStatusFilter(status);
    updateQuery(searchText, status, 1);
  };

  const handlePageChange = (newPage: number) => {
    if (newPage < 1 || newPage > pagination.totalPages) return;
    updateQuery(searchText, statusFilter, newPage);
  };

  const handleQuickStatusUpdate = async (id: string, newStatus: string) => {
    setUpdatingId(id);
    try {
      await updateApplicationStatus(id, newStatus);
      router.refresh();
    } catch (err) {
      console.error("Failed to update application status:", err);
      alert("Failed to update status.");
    } finally {
      setUpdatingId(null);
    }
  };

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case "Applied":
        return "bg-amber-50 text-amber-700 border border-amber-300";
      case "Shortlisted":
        return "bg-blue-50 text-blue-600 border border-blue-200";
      case "Interview":
        return "bg-indigo-50 text-indigo-600 border border-indigo-200";
      case "Selected":
        return "bg-emerald-50 text-emerald-600 border border-emerald-200";
      case "Rejected":
        return "bg-red-50 text-red-600 border border-red-200";
      case "Completed":
        return "bg-purple-50 text-purple-600 border border-purple-200";
      default:
        return "bg-gray-50 text-gray-600 border border-gray-200";
    }
  };

  // CSV Exporter Utility
  const exportToCSV = () => {
    const headers = [
      "Application ID",
      "Full Name",
      "WhatsApp Number",
      "Internship Domain",
      "GitHub Profile",
      "LinkedIn Profile",
      "Application Status",
      "Applied Date",
    ];

    const rows = allApplicationsForExport.map((app) => [
      app.applicationId || "N/A",
      app.fullName,
      app.phone,
      app.domainId?.name || "N/A",
      app.github || "",
      app.linkedin || "",
      app.status,
      new Date(app.createdAt).toLocaleDateString(),
    ]);

    const csvContent =
      "data:text/csv;charset=utf-8," +
      [headers.join(","), ...rows.map((e) => e.map((val) => `"${val.replace(/"/g, '""')}"`).join(","))].join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `growthbridge_internship_applications_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="flex flex-col gap-6">
      
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex flex-col gap-0.5 text-left">
          <h1 className="text-[22px] font-black tracking-tight text-[#111111]">Internship Applications</h1>
          <span className="text-[12.5px] text-[#6A6A6A] font-semibold">Review, evaluate, and transition status of applicants.</span>
        </div>
        
        {/* CSV Export Button */}
        <button
          onClick={exportToCSV}
          className="px-4 py-2.5 rounded-xl border border-[#E9E3DA] hover:border-[#D7D0C8] bg-white text-[12.5px] font-bold text-[#111111] hover:bg-[#FCFBF8] transition-all flex items-center gap-2 cursor-pointer shadow-sm"
        >
          <Download size={14} className="text-[#6A6A6A]" />
          <span>Export All CSV</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white border border-[#E9E3DA] p-4 rounded-2xl flex flex-col md:flex-row items-center justify-between gap-4 shadow-[0_4px_12px_rgba(0,0,0,0.01)]">
        
        {/* Filter status tabs */}
        <div className="flex items-center gap-1 overflow-x-auto w-full md:w-auto pb-2 md:pb-0">
          {statuses.map((status) => (
            <button
              key={status}
              onClick={() => handleStatusFilterChange(status)}
              className={`px-3.5 py-1.5 rounded-lg text-[12px] font-bold transition-all cursor-pointer whitespace-nowrap ${
                statusFilter === status
                  ? "bg-[#111111] text-white shadow-sm"
                  : "text-[#6A6A6A] hover:bg-[#FCFBF8] hover:text-[#111111]"
              }`}
            >
              {status}
            </button>
          ))}
        </div>

        {/* Search input form */}
        <form onSubmit={handleSearchSubmit} className="flex items-center gap-2 w-full md:w-80">
          <div className="relative flex-1">
            <input
              type="text"
              placeholder="Search name, phone, domain..."
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              className="w-full pl-9 pr-4 py-2 rounded-xl border border-[#E9E3DA] bg-[#FCFBF8] text-[12.5px] font-semibold text-[#111111] focus:outline-none focus:border-[#F4C542]"
            />
            <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#A8A296]" />
          </div>
          <button
            type="submit"
            className="px-4 py-2 rounded-xl bg-[#111111] text-white text-[12px] font-bold hover:bg-[#F4C542] hover:text-[#111111] transition-all cursor-pointer"
          >
            Search
          </button>
        </form>

      </div>

      {/* Table Container */}
      <div className="bg-white border border-[#E9E3DA] rounded-2xl overflow-hidden shadow-[0_4px_12px_rgba(0,0,0,0.01)]">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#FCFBF8] border-b border-[#E9E3DA] text-[11px] font-extrabold uppercase tracking-wider text-[#6A6A6A]">
                <th className="px-5 py-4">Name</th>
                <th className="px-5 py-4">WhatsApp</th>
                <th className="px-5 py-4">Domain</th>
                <th className="px-5 py-4">GitHub</th>
                <th className="px-5 py-4">LinkedIn</th>
                <th className="px-5 py-4 text-center">Status</th>
                <th className="px-5 py-4">Applied</th>
                <th className="px-5 py-4 text-right">Action</th>
              </tr>
            </thead>
            
            <tbody className="divide-y divide-[#E9E3DA]/60 text-[12.5px] font-semibold text-[#111111]">
              {isPending ? (
                <tr>
                  <td colSpan={8} className="py-20 text-center text-[#6A6A6A]">
                    <div className="flex items-center justify-center gap-2">
                      <RefreshCw size={16} className="animate-spin text-[#111111]" />
                      <span>Syncing application records...</span>
                    </div>
                  </td>
                </tr>
              ) : initialApplications.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-20 text-center text-[#A8A296] font-mono">
                    No applications matched the criteria.
                  </td>
                </tr>
              ) : (
                initialApplications.map((app) => {
                  const cleanPhoneDigits = (app.phone || "").replace(/\D/g, "");
                  const whatsappLink = `https://wa.me/${cleanPhoneDigits}`;

                  return (
                    <tr key={app._id} className="hover:bg-[#FCFBF8]/60 transition-colors">
                      {/* Name */}
                      <td className="px-5 py-4 font-extrabold text-[#111111]">
                        {app.fullName}
                      </td>

                      {/* WhatsApp with Open WhatsApp Action */}
                      <td className="px-5 py-4">
                        <div className="flex flex-col gap-1 items-start">
                          <span className="font-mono text-[12px] text-[#111111]">{app.phone}</span>
                          {cleanPhoneDigits && (
                            <a
                              href={whatsappLink}
                              target="_blank"
                              rel="noreferrer"
                              className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-600 hover:text-emerald-700 bg-emerald-50 hover:bg-emerald-100 px-2 py-0.5 rounded border border-emerald-200 transition-colors"
                            >
                              <MessageSquare size={10} />
                              <span>Open WhatsApp</span>
                            </a>
                          )}
                        </div>
                      </td>

                      {/* Domain */}
                      <td className="px-5 py-4 text-[#111111] font-bold">
                        {app.domainId?.name || "N/A"}
                      </td>

                      {/* GitHub */}
                      <td className="px-5 py-4">
                        {app.github ? (
                          <a
                            href={app.github}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-1 text-[12px] font-bold text-indigo-600 hover:underline"
                          >
                            <span>GitHub</span>
                            <ExternalLink size={11} />
                          </a>
                        ) : (
                          <span className="text-[#A8A296] font-mono">—</span>
                        )}
                      </td>

                      {/* LinkedIn */}
                      <td className="px-5 py-4">
                        {app.linkedin ? (
                          <a
                            href={app.linkedin}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-1 text-[12px] font-bold text-blue-600 hover:underline"
                          >
                            <span>LinkedIn</span>
                            <ExternalLink size={11} />
                          </a>
                        ) : (
                          <span className="text-[#A8A296] font-mono">—</span>
                        )}
                      </td>

                      {/* Status Dropdown */}
                      <td className="px-5 py-4 text-center">
                        {updatingId === app._id ? (
                          <div className="flex items-center justify-center">
                            <RefreshCw size={14} className="animate-spin text-[#111111]" />
                          </div>
                        ) : (
                          <select
                            value={adminAllowedStatuses.includes(app.status) ? app.status : "Applied"}
                            onChange={(e) => handleQuickStatusUpdate(app._id, e.target.value)}
                            className={`px-2.5 py-1 rounded-full text-[11px] font-extrabold uppercase tracking-wider focus:outline-none cursor-pointer ${getStatusBadgeClass(app.status)}`}
                          >
                            {adminAllowedStatuses.map((s) => (
                              <option key={s} value={s} className="bg-white text-[#111111] font-sans text-xs">
                                {s}
                              </option>
                            ))}
                          </select>
                        )}
                      </td>

                      {/* Applied Date */}
                      <td className="px-5 py-4 text-[#6A6A6A] font-medium text-[12px]">
                        {new Date(app.createdAt).toLocaleDateString()}
                      </td>

                      {/* Action */}
                      <td className="px-5 py-4 text-right">
                        <Link
                          href={`/admin/internships/applicants/${app._id}`}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[#E9E3DA] hover:border-[#D7D0C8] hover:bg-[#FCFBF8] text-[11px] font-bold text-[#111111] transition-all shadow-inner"
                        >
                          <Eye size={12} className="text-[#6A6A6A]" />
                          <span>View Profile</span>
                        </Link>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Controls */}
        {pagination.totalPages > 1 && (
          <div className="px-6 py-4 bg-[#FCFBF8] border-t border-[#E9E3DA] flex items-center justify-between gap-4">
            <span className="text-[12px] text-[#6A6A6A] font-semibold">
              Showing page <strong>{pagination.page}</strong> of <strong>{pagination.totalPages}</strong> ({pagination.total} entries)
            </span>
            
            <div className="flex items-center gap-2">
              <button
                onClick={() => handlePageChange(pagination.page - 1)}
                disabled={pagination.page === 1}
                className="p-1.5 rounded-lg border border-[#E9E3DA] hover:border-[#D7D0C8] hover:bg-white bg-white disabled:opacity-40 transition-all cursor-pointer disabled:cursor-not-allowed"
              >
                <ChevronLeft size={16} />
              </button>
              
              <button
                onClick={() => handlePageChange(pagination.page + 1)}
                disabled={pagination.page === pagination.totalPages}
                className="p-1.5 rounded-lg border border-[#E9E3DA] hover:border-[#D7D0C8] hover:bg-white bg-white disabled:opacity-40 transition-all cursor-pointer disabled:cursor-not-allowed"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        )}
      </div>

    </div>
  );
}
