import React from "react";
import { connectToDatabase } from "@/lib/db";
import Blog from "@/models/Blog";
import Project from "@/models/Project";
import Service from "@/models/Service";
import ActivityLog from "@/models/ActivityLog";
import { BookOpen, Briefcase, Layers, Activity, AlertCircle, ArrowUpRight } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function AdminDashboardPage() {
  let stats = {
    blogs: 0,
    projects: 4, // Default cases mapped statically
    services: 0,
    drafts: 0,
  };
  
  let recentLogs: any[] = [];

  try {
    await connectToDatabase();
    
    // Fetch real metrics
    const bCount = await Blog.countDocuments();
    const pCount = await Project.countDocuments();
    const sCount = await Service.countDocuments();
    const dCount = await Blog.countDocuments({ status: "Draft" });

    stats = {
      blogs: bCount,
      projects: pCount > 0 ? pCount : 4,
      services: sCount,
      drafts: dCount,
    };

    recentLogs = await ActivityLog.find().sort({ createdAt: -1 }).limit(5).lean();
  } catch (error) {
    console.error("Dashboard database fetch error:", error);
  }

  return (
    <div className="flex flex-col gap-10">
      <div>
        <h2 className="text-[28px] font-extrabold tracking-tight">Overview</h2>
        <p className="text-[14px] text-[#6A6A6A] mt-1">Here is a quick look at your website's content and health metrics.</p>
      </div>

      {/* Metrics Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white border border-[#E9E3DA] rounded-[24px] p-6 shadow-[0_4px_20px_rgba(0,0,0,0.02)]">
          <div className="flex justify-between items-start mb-4">
            <span className="text-[12px] font-bold uppercase tracking-[0.08em] text-[#6A6A6A]">
              Total Blogs
            </span>
            <div className="p-2 bg-[#FCFBF8] border border-[#E9E3DA] rounded-[10px] text-[#111111]">
              <BookOpen size={16} />
            </div>
          </div>
          <div className="text-[32px] font-extrabold text-[#111111]">{stats.blogs}</div>
          <div className="text-[12px] font-semibold text-[#A8A296] mt-2">
            {stats.drafts} drafts awaiting publication
          </div>
        </div>

        <div className="bg-white border border-[#E9E3DA] rounded-[24px] p-6 shadow-[0_4px_20px_rgba(0,0,0,0.02)]">
          <div className="flex justify-between items-start mb-4">
            <span className="text-[12px] font-bold uppercase tracking-[0.08em] text-[#6A6A6A]">
              Total Projects
            </span>
            <div className="p-2 bg-[#FCFBF8] border border-[#E9E3DA] rounded-[10px] text-[#111111]">
              <Briefcase size={16} />
            </div>
          </div>
          <div className="text-[32px] font-extrabold text-[#111111]">{stats.projects}</div>
          <div className="text-[12px] font-semibold text-[#A8A296] mt-2">
            4 featured on selected work
          </div>
        </div>

        <div className="bg-white border border-[#E9E3DA] rounded-[24px] p-6 shadow-[0_4px_20px_rgba(0,0,0,0.02)]">
          <div className="flex justify-between items-start mb-4">
            <span className="text-[12px] font-bold uppercase tracking-[0.08em] text-[#6A6A6A]">
              Total Services
            </span>
            <div className="p-2 bg-[#FCFBF8] border border-[#E9E3DA] rounded-[10px] text-[#111111]">
              <Layers size={16} />
            </div>
          </div>
          <div className="text-[32px] font-extrabold text-[#111111]">{stats.services}</div>
          <div className="text-[12px] font-semibold text-[#A8A296] mt-2">
            Active services in directory
          </div>
        </div>

        <div className="bg-white border border-[#E9E3DA] rounded-[24px] p-6 shadow-[0_4px_20px_rgba(0,0,0,0.02)]">
          <div className="flex justify-between items-start mb-4">
            <span className="text-[12px] font-bold uppercase tracking-[0.08em] text-[#6A6A6A]">
              Drafts Queue
            </span>
            <div className="p-2 bg-[#FCFBF8] border border-[#E9E3DA] rounded-[10px] text-[#111111]">
              <AlertCircle size={16} />
            </div>
          </div>
          <div className="text-[32px] font-extrabold text-[#111111]">{stats.drafts}</div>
          <div className="text-[12px] font-semibold text-[#A8A296] mt-2">
            Items offline / internal staging
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1.5fr_1fr] gap-8 items-start">
        {/* Recent Activity Log card */}
        <div className="bg-white border border-[#E9E3DA] rounded-[24px] p-8 shadow-[0_4px_20px_rgba(0,0,0,0.02)] flex flex-col gap-6">
          <div className="flex items-center justify-between pb-4 border-b border-[#E9E3DA]">
            <div className="flex items-center gap-2">
              <Activity size={18} className="text-[#6A6A6A]" />
              <h3 className="text-[16px] font-bold tracking-tight">Recent Activity Log</h3>
            </div>
          </div>

          <div className="flex flex-col gap-4">
            {recentLogs.length === 0 ? (
              <div className="text-center py-8 text-[#A8A296] text-[13px] font-medium">
                No activity logged yet. Seeding logs on operations...
              </div>
            ) : (
              recentLogs.map((log: any) => (
                <div key={log._id.toString()} className="flex items-start gap-4 p-3 rounded-[12px] bg-[#FCFBF8] border border-[#E9E3DA]">
                  <div className="flex flex-col gap-0.5 flex-1 min-w-0">
                    <p className="text-[13px] text-[#111111] font-semibold truncate">
                      {log.action}
                    </p>
                    <span className="text-[11px] text-[#6A6A6A]">
                      by {log.userName} ({log.userEmail})
                    </span>
                  </div>
                  <span className="text-[11px] text-[#A8A296] shrink-0 font-medium">
                    {new Date(log.createdAt).toLocaleDateString()}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Quick Actions Panel */}
        <div className="bg-white border border-[#E9E3DA] rounded-[24px] p-8 shadow-[0_4px_20px_rgba(0,0,0,0.02)] flex flex-col gap-6">
          <h3 className="text-[16px] font-bold tracking-tight pb-4 border-b border-[#E9E3DA]">Quick Tools</h3>
          <div className="flex flex-col gap-3">
            <a
              href="/admin/blogs?new=true"
              className="flex items-center justify-between p-4 rounded-[12px] bg-[#FCFBF8] border border-[#E9E3DA] hover:border-[#111111] transition-all text-[13px] font-semibold"
            >
              <span>Draft New Blog Post</span>
              <ArrowUpRight size={16} />
            </a>
            <a
              href="/admin/portfolio?new=true"
              className="flex items-center justify-between p-4 rounded-[12px] bg-[#FCFBF8] border border-[#E9E3DA] hover:border-[#111111] transition-all text-[13px] font-semibold"
            >
              <span>Upload Case Study Project</span>
              <ArrowUpRight size={16} />
            </a>
            <a
              href="/admin/services"
              className="flex items-center justify-between p-4 rounded-[12px] bg-[#FCFBF8] border border-[#E9E3DA] hover:border-[#111111] transition-all text-[13px] font-semibold"
            >
              <span>Manage Active Services</span>
              <ArrowUpRight size={16} />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
