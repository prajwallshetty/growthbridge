import React from "react";
import { getInternshipAnalytics } from "@/lib/actions/internship";
import { Users, FileText, Award, Layers, CheckCircle2, XCircle, Clock, Percent } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function InternshipDashboardPage() {
  const analytics = await getInternshipAnalytics().catch(() => ({
    counters: {
      total: 0,
      pending: 0,
      shortlisted: 0,
      selected: 0,
      rejected: 0,
      completed: 0,
      certificatesCount: 0,
      offerLettersCount: 0,
    },
    domainBreakdown: [],
    monthlyTrend: [],
    completionRate: 0,
  }));

  const { counters, domainBreakdown, monthlyTrend, completionRate } = analytics;

  const cardStats = [
    { label: "Total Applications", value: counters.total, icon: <Users size={16} />, bg: "bg-blue-50/50 text-blue-600 border-blue-100" },
    { label: "Pending Review", value: counters.pending, icon: <Clock size={16} />, bg: "bg-amber-50/50 text-amber-600 border-amber-100" },
    { label: "Selected Interns", value: counters.selected, icon: <CheckCircle2 size={16} />, bg: "bg-emerald-50/50 text-emerald-600 border-emerald-100" },
    { label: "Completed Candidates", value: counters.completed, icon: <Award size={16} />, bg: "bg-purple-50/50 text-purple-600 border-purple-100" },
    { label: "Offer Letters Issued", value: counters.offerLettersCount, icon: <FileText size={16} />, bg: "bg-indigo-50/50 text-indigo-600 border-indigo-100" },
    { label: "Certificates Generated", value: counters.certificatesCount, icon: <Award size={16} />, bg: "bg-emerald-50/50 text-emerald-600 border-emerald-100" },
  ];

  // Helper to find highest count in domains for chart scale
  const maxDomainVal = domainBreakdown.length > 0 ? Math.max(...domainBreakdown.map((d: any) => d.value)) : 1;
  // Helper to find highest count in monthly trend
  const maxMonthVal = monthlyTrend.length > 0 ? Math.max(...monthlyTrend.map((m: any) => m.count)) : 1;

  return (
    <div className="flex flex-col gap-8">
      
      {/* Overview header */}
      <div className="flex flex-col gap-1 text-left">
        <h1 className="text-[26px] font-black tracking-tight text-[#111111]">Internship Workspace Overview</h1>
        <p className="text-[13px] text-[#6A6A6A] font-medium">Real-time statistics, application flows, and issued digital credentials.</p>
      </div>

      {/* Counters Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-5">
        {cardStats.map((card) => (
          <div key={card.label} className="bg-white border border-[#E9E3DA] p-5 rounded-2xl flex flex-col gap-3 shadow-[0_4px_12px_rgba(0,0,0,0.01)] hover:border-[#D7D0C8] transition-all">
            <div className="flex items-center justify-between">
              <span className="text-[11.5px] text-[#6A6A6A] font-semibold tracking-tight">{card.label}</span>
              <div className={`w-7 h-7 rounded-lg border flex items-center justify-center ${card.bg}`}>
                {card.icon}
              </div>
            </div>
            <span className="text-[24px] font-black text-[#111111]">{card.value}</span>
          </div>
        ))}
      </div>

      {/* Charts & Analytics Visuals */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Applications per Domain */}
        <div className="lg:col-span-6 bg-white border border-[#E9E3DA] p-6 rounded-2xl shadow-[0_4px_12px_rgba(0,0,0,0.015)] flex flex-col gap-6">
          <div className="flex flex-col gap-1 text-left">
            <h3 className="text-[15px] font-bold text-[#111111]">Applications per Domain</h3>
            <span className="text-[11.5px] text-[#6A6A6A] font-semibold">Distribution of student preferences across domains.</span>
          </div>

          <div className="flex flex-col gap-4">
            {domainBreakdown.length === 0 ? (
              <div className="py-10 text-center text-[12.5px] text-[#6A6A6A] font-mono">No data registered.</div>
            ) : (
              domainBreakdown.map((domain: any) => {
                const percentage = Math.round((domain.value / maxDomainVal) * 100) || 0;
                return (
                  <div key={domain.name} className="flex flex-col gap-1.5">
                    <div className="flex items-center justify-between text-[12.5px] font-bold text-[#111111]">
                      <span>{domain.name}</span>
                      <span>{domain.value} applications</span>
                    </div>
                    {/* Visual bar */}
                    <div className="w-full h-3 rounded-full bg-[#FCFBF8] border border-[#E9E3DA] overflow-hidden">
                      <div
                        className="h-full bg-[#F4C542] rounded-full transition-all duration-500"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Applications per Month */}
        <div className="lg:col-span-6 bg-white border border-[#E9E3DA] p-6 rounded-2xl shadow-[0_4px_12px_rgba(0,0,0,0.015)] flex flex-col gap-6">
          <div className="flex flex-col gap-1 text-left">
            <h3 className="text-[15px] font-bold text-[#111111]">Applications Monthly Trend</h3>
            <span className="text-[11.5px] text-[#6A6A6A] font-semibold">Activity levels over the past 6 months.</span>
          </div>

          {/* Bar Chart Representation */}
          <div className="h-48 flex items-end justify-between gap-3 pt-4 border-b border-[#E9E3DA] px-2">
            {monthlyTrend.length === 0 ? (
              <div className="w-full text-center text-[12.5px] text-[#6A6A6A] font-mono py-10">No data registered.</div>
            ) : (
              monthlyTrend.map((trend: any) => {
                const heightPercent = Math.round((trend.count / maxMonthVal) * 100) || 5;
                return (
                  <div key={trend.month} className="flex-1 flex flex-col items-center gap-2 group cursor-pointer">
                    {/* Tooltip on hover */}
                    <span className="opacity-0 group-hover:opacity-100 text-[10px] font-bold bg-[#111111] text-white px-1.5 py-0.5 rounded transition-opacity font-mono absolute -translate-y-8">
                      {trend.count}
                    </span>
                    <div
                      className="w-full bg-[#FCFBF8] border border-[#E9E3DA] hover:bg-[#F4C542] hover:border-[#D7D0C8] rounded-t-lg transition-all duration-300"
                      style={{ height: `${heightPercent}%` }}
                    />
                    <span className="text-[10px] font-bold text-[#6A6A6A] uppercase font-mono">{trend.month}</span>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Completion rate progress */}
        <div className="lg:col-span-12 bg-white border border-[#E9E3DA] p-6 rounded-2xl shadow-[0_4px_12px_rgba(0,0,0,0.015)] flex items-center justify-between gap-6">
          <div className="flex flex-col gap-1 text-left">
            <h3 className="text-[15px] font-bold text-[#111111]">Program Completion Rate</h3>
            <p className="text-[12px] text-[#6A6A6A] font-semibold max-w-lg">Ratio of selected candidates who successfully complete all tasks and secure certificates.</p>
          </div>
          
          <div className="flex items-center gap-4 shrink-0">
            <div className="w-14 h-14 rounded-full border-4 border-[#E9E3DA] border-t-[#F4C542] flex items-center justify-center font-bold text-[14px] text-[#111111] animate-spin-slow">
              {completionRate}%
            </div>
            <div className="flex flex-col text-left">
              <span className="text-[13px] font-extrabold text-[#111111]">{counters.completed} Completed Out of {counters.selected} Selected</span>
              <span className="text-[11px] text-[#6A6A6A] font-semibold">Higher rates reflect robust task evaluation execution.</span>
            </div>
          </div>
        </div>

      </div>

    </div>
  );
}
