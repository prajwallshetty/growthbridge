"use client";

import React, { useState, useTransition } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Search, Download, Eye, ChevronLeft, ChevronRight, FileSpreadsheet, RefreshCw } from "lucide-react";

interface ApplicationItem {
  _id: string;
  applicationId: string;
  fullName: string;
  email: string;
  phone: string;
  college: string;
  domainId: { _id: string; name: string } | null;
  experienceLevel: string;
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

  const statuses = ["All", "Pending", "Shortlisted", "Selected", "Rejected", "Completed"];

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

  const handleStatusChange = (status: string) => {
    setStatusFilter(status);
    updateQuery(searchText, status, 1);
  };

  const handlePageChange = (newPage: number) => {
    if (newPage < 1 || newPage > pagination.totalPages) return;
    updateQuery(searchText, statusFilter, newPage);
  };

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case "Pending":
        return "bg-amber-50 text-amber-600 border border-amber-200";
      case "Shortlisted":
        return "bg-blue-50 text-blue-600 border border-blue-200";
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

  // CSV Exporter Action
  const exportToCSV = () => {
    const headers = [
      "Application ID",
      "Full Name",
      "Email Address",
      "Phone Number",
      "College Name",
      "Internship Domain",
      "Experience Level",
      "Application Status",
      "Applied Date",
    ];

    const rows = allApplicationsForExport.map((app) => [
      app.applicationId || "N/A",
      app.fullName,
      app.email,
      app.phone,
      app.college.replace(/,/g, " "), // strip commas
      app.domainId?.name || "N/A",
      app.experienceLevel,
      app.status,
      new Date(app.createdAt).toLocaleDateString(),
    ]);

    const csvContent =
      "data:text/csv;charset=utf-8," +
      [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `growthbridge_interns_${Date.now()}.csv`);
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
              onClick={() => handleStatusChange(status)}
              className={`px-3.5 py-1.5 rounded-lg text-[12px] font-bold transition-all cursor-pointer ${
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
              placeholder="Search by ID, name, college..."
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
                <th className="px-6 py-4">Application ID</th>
                <th className="px-6 py-4">Student Name</th>
                <th className="px-6 py-4">College / University</th>
                <th className="px-6 py-4">Domain</th>
                <th className="px-6 py-4">Experience</th>
                <th className="px-6 py-4 text-center">Status</th>
                <th className="px-6 py-4">Applied Date</th>
                <th className="px-6 py-4 text-right">Actions</th>
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
                initialApplications.map((app) => (
                  <tr key={app._id} className="hover:bg-[#FCFBF8]/40 transition-colors">
                    <td className="px-6 py-4 font-mono font-bold text-[#6A6A6A]">
                      {app.applicationId || "N/A"}
                    </td>
                    <td className="px-6 py-4 font-extrabold">{app.fullName}</td>
                    <td className="px-6 py-4 text-[#6A6A6A] max-w-xs truncate">{app.college}</td>
                    <td className="px-6 py-4">{app.domainId?.name || "N/A"}</td>
                    <td className="px-6 py-4 text-[#6A6A6A]">{app.experienceLevel}</td>
                    <td className="px-6 py-4 text-center">
                      <span className={`px-2.5 py-1 rounded-full text-[10.5px] font-extrabold uppercase tracking-wider ${getStatusBadgeClass(app.status)}`}>
                        {app.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-[#6A6A6A]">
                      {new Date(app.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <Link
                        href={`/admin/internships/applicants/${app._id}`}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[#E9E3DA] hover:border-[#D7D0C8] hover:bg-[#FCFBF8] text-[11px] font-bold text-[#111111] transition-all shadow-inner"
                      >
                        <Eye size={12} className="text-[#6A6A6A]" />
                        <span>View Profile</span>
                      </Link>
                    </td>
                  </tr>
                ))
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
