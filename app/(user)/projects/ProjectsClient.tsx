"use client";

import React, { useState, useTransition, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  ArrowLeft, 
  Sparkles, 
  Check, 
  User, 
  Calendar, 
  TrendingUp, 
  DollarSign, 
  Briefcase, 
  AlertCircle, 
  Filter, 
  Search,
  Lock,
  ChevronRight,
  Info,
  X,
  Plus
} from "lucide-react";
import SideRays from "@/components/ui/SideRays";
import { updateProjectStatus } from "@/lib/actions/cms";

interface ProjectsClientProps {
  projects: any[];
  settings: any;
  teamMembers: any[];
}

interface ToastMessage {
  id: number;
  text: string;
  type: "success" | "error" | "info";
}

const EASE = [0.22, 1, 0.36, 1] as const;

export default function ProjectsClient({ projects, settings, teamMembers }: ProjectsClientProps) {
  // Local state for all projects (allows drag-and-drop optimistic updates)
  const [boardProjects, setBoardProjects] = useState<any[]>(projects);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const [isPending, startTransition] = useTransition();

  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedClient, setSelectedClient] = useState("All");
  const [selectedMember, setSelectedMember] = useState("All");
  const [selectedPriority, setSelectedPriority] = useState("All");
  const [selectedDueDate, setSelectedDueDate] = useState("All");
  const [selectedProjectType, setSelectedProjectType] = useState("All");
  
  // Mobile active column selector
  const [mobileActiveColumn, setMobileActiveColumn] = useState<"not-started" | "ongoing" | "completed">("ongoing");

  // Helper: Trigger custom toast notifications
  const showToast = (text: string, type: "success" | "error" | "info" = "info") => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, text, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 5000);
  };

  // Helper: Format initials
  const getInitials = (name: string) => {
    if (!name) return "?";
    return name.split(" ").map(n => n[0]).join("").toUpperCase().substring(0, 2);
  };

  // Helper: Find team member image by name
  const getMemberImage = (name: string) => {
    const member = teamMembers.find(m => m.name.toLowerCase() === name.toLowerCase());
    return member?.image || null;
  };

  // Helper: Format Date nicely
  const formatDateString = (dateVal: any) => {
    if (!dateVal) return "—";
    try {
      const d = new Date(dateVal);
      return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
    } catch (e) {
      return "—";
    }
  };

  // Extract unique clients for client filter dropdown
  const uniqueClients = useMemo(() => {
    const clients = boardProjects.map(p => p.client).filter(Boolean);
    return ["All", ...Array.from(new Set(clients))];
  }, [boardProjects]);

  // Handle HTML5 Drag and Drop Events
  const handleDragStart = (e: React.DragEvent, id: string) => {
    e.dataTransfer.setData("text/plain", id);
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDrop = async (e: React.DragEvent, targetStatus: "not-started" | "ongoing" | "completed") => {
    e.preventDefault();
    const id = e.dataTransfer.getData("text/plain");
    const projectToMove = boardProjects.find(p => p._id === id);
    if (!projectToMove || projectToMove.status === targetStatus) return;

    // Save state copy for rollback in case server action fails
    const previousProjects = [...boardProjects];

    // Optimistic Update: Transition status and values locally immediately
    setBoardProjects(prev => prev.map(p => {
      if (p._id === id) {
        const updated = { ...p, status: targetStatus };
        if (targetStatus === "completed") {
          updated.progress = 100;
          updated.completionDate = new Date().toISOString();
        } else if (targetStatus === "not-started") {
          updated.progress = 0;
          updated.completionDate = null;
        } else {
          if (updated.progress === 0 || updated.progress === 100) {
            updated.progress = 10;
          }
          updated.completionDate = null;
        }
        return updated;
      }
      return p;
    }));

    // Trigger DB persistence via Server Action inside transition
    startTransition(async () => {
      try {
        await updateProjectStatus(id, targetStatus);
        showToast(`Moved "${projectToMove.title}" to ${targetStatus.replace("-", " ")}!`, "success");
      } catch (err: any) {
        // Rollback state on error
        setBoardProjects(previousProjects);
        showToast(err.message || "Admin access required to save changes.", "error");
      }
    });
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  // Filter application logic
  const filteredProjects = useMemo(() => {
    return boardProjects.filter(p => {
      // 1. Search Query (Title, Client, Description, Category)
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        const matchesSearch = 
          p.title?.toLowerCase().includes(query) || 
          p.client?.toLowerCase().includes(query) ||
          p.description?.toLowerCase().includes(query) ||
          p.category?.toLowerCase().includes(query);
        if (!matchesSearch) return false;
      }

      // 2. Client filter
      if (selectedClient !== "All" && p.client !== selectedClient) {
        return false;
      }

      // 3. Assigned Member filter
      if (selectedMember !== "All" && !(p.assignedTeam || []).includes(selectedMember)) {
        return false;
      }

      // 4. Priority filter
      if (selectedPriority !== "All" && p.priority !== selectedPriority) {
        return false;
      }

      // 5. Project Type filter
      if (selectedProjectType !== "All" && p.projectType !== selectedProjectType) {
        return false;
      }

      // 6. Due Date filter
      if (selectedDueDate !== "All") {
        const now = new Date();
        const dueDate = p.dueDate ? new Date(p.dueDate) : null;
        
        if (!dueDate) return false;

        if (selectedDueDate === "Overdue") {
          // Overdue if due date is past today and not completed
          return dueDate < now && p.status !== "completed";
        }
        if (selectedDueDate === "ThisMonth") {
          // Target matches current year and month
          return dueDate.getMonth() === now.getMonth() && dueDate.getFullYear() === now.getFullYear();
        }
        if (selectedDueDate === "Upcoming") {
          return dueDate >= now;
        }
      }

      return true;
    });
  }, [boardProjects, searchQuery, selectedClient, selectedMember, selectedPriority, selectedDueDate, selectedProjectType]);

  // Divide into board columns
  const notStartedColumn = filteredProjects.filter(p => p.status === "not-started" || (!p.status && !p.completed));
  const ongoingColumn = filteredProjects.filter(p => p.status === "ongoing" || (!p.status && !p.completed));
  const completedColumn = filteredProjects.filter(p => p.status === "completed" || p.completed);

  return (
    <main className="min-h-screen bg-[#FCFBF8] text-[#111111] relative overflow-hidden pb-24">
      {/* Dynamic Background Effects */}
      <div className="pointer-events-none fixed inset-0 z-10 opacity-[0.35]">
        <SideRays
          speed={0.8}
          rayColor1="#111111"
          rayColor2="#E9E3DA"
          intensity={1.0}
          spread={1.5}
          origin="top-right"
          tilt={0}
          saturation={0.5}
          blend={0.5}
          falloff={1.4}
          opacity={0.3}
        />
        <SideRays
          speed={0.6}
          rayColor1="#E9E3DA"
          rayColor2="#111111"
          intensity={0.8}
          spread={1.2}
          origin="top-left"
          tilt={10}
          saturation={0.5}
          blend={0.5}
          falloff={1.4}
          opacity={0.2}
        />
      </div>

      {/* Main Toast Notifications Render */}
      <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-3 max-w-md w-full px-4 sm:px-0">
        <AnimatePresence>
          {toasts.map(t => (
            <motion.div
              key={t.id}
              initial={{ opacity: 0, y: 30, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20, scale: 0.95 }}
              className={`p-4 rounded-[16px] shadow-lg border backdrop-blur-md flex items-start gap-3 transition-colors ${
                t.type === "success" 
                  ? "bg-emerald-50/90 border-emerald-200/80 text-emerald-800" 
                  : t.type === "error"
                  ? "bg-rose-50/95 border-rose-200/80 text-rose-800"
                  : "bg-white/95 border-[#E9E3DA] text-[#111111]"
              }`}
            >
              {t.type === "error" ? (
                <Lock size={16} className="mt-0.5 shrink-0 text-rose-600" />
              ) : t.type === "success" ? (
                <Check size={16} className="mt-0.5 shrink-0 text-emerald-600" />
              ) : (
                <Info size={16} className="mt-0.5 shrink-0 text-amber-500" />
              )}
              <div className="flex-1 text-[13px] font-semibold leading-[1.4]">
                {t.text}
                {t.type === "error" && (
                  <span className="block text-[11px] font-medium text-rose-600/85 mt-1">
                    To persist moves, log in to the admin panel. Custom showcase state reverted.
                  </span>
                )}
              </div>
              <button onClick={() => setToasts(prev => prev.filter(item => item.id !== t.id))} className="text-current opacity-60 hover:opacity-100">
                <X size={14} />
              </button>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Top Navbar */}
      <header className="fixed top-0 inset-x-0 z-40 bg-[#FCFBF8]/80 border-b border-[#E9E3DA] backdrop-blur-md">
        <div className="mx-auto max-w-[1280px] px-6 md:px-12 py-4 flex items-center justify-between">
          <a href="/" className="flex items-center gap-2">
            <span className="text-[17px] font-bold tracking-tight text-[#111111]">Growth Bridge</span>
          </a>

          <div className="flex items-center gap-4">
            <a
              href="/admin/portfolio"
              className="hidden sm:inline-flex items-center gap-1.5 rounded-full border border-[#E9E3DA] bg-white px-5 py-2 text-[12px] font-bold text-[#111111] hover:border-[#111111] transition-all"
            >
              Admin Dashboard
            </a>
            <a
              href="/"
              className="inline-flex items-center gap-2 rounded-full border border-[#E9E3DA] bg-white px-5 py-2 text-[12px] font-bold text-[#111111] hover:border-[#111111] transition-all"
            >
              <ArrowLeft size={14} /> Back to Home
            </a>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="pt-32 pb-8 relative z-20">
        <div className="mx-auto max-w-[1280px] px-6 md:px-12 flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
          <div>
            <span className="inline-flex items-center gap-2 text-[13px] font-semibold uppercase tracking-[0.12em] text-[#6A6A6A]">
              <Sparkles size={13} className="text-[#F4C542]" /> Project Tracker
            </span>
            <h1 className="mt-4 text-[clamp(32px,4vw,56px)] font-extrabold leading-[1.05] tracking-[-0.03em]">
              Agency Pipeline
            </h1>
            <p className="mt-3 max-w-[540px] text-[15px] leading-[1.7] text-[#6A6A6A]">
              An interactive visual map of our active digital architecture. Drag projects across stages or filter parameters to explore our selection.
            </p>
          </div>
        </div>
      </section>

      {/* Search & Filter Toolbar */}
      <section className="relative z-20 pb-8">
        <div className="mx-auto max-w-[1280px] px-6 md:px-12">
          <div className="bg-white border border-[#E9E3DA] rounded-[24px] p-6 shadow-sm flex flex-col gap-5">
            
            {/* Row 1: Search & Filter Title */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div className="flex items-center gap-2 font-bold text-[14px]">
                <Filter size={15} />
                <span>Search & Filter Pipeline</span>
              </div>
              <div className="relative w-full sm:w-80">
                <Search size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#A8A296]" />
                <input
                  type="text"
                  placeholder="Search title, category, tech..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full h-10 pl-10 pr-4 bg-[#FCFBF8] border border-[#E9E3DA] rounded-full text-[13px] font-medium outline-none focus:border-[#111111] transition-all"
                />
              </div>
            </div>

            {/* Row 2: Select dropdowns */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-3 border-t border-[#E9E3DA]/60 pt-4">
              
              {/* Client select */}
              <div className="flex flex-col gap-1.5">
                <span className="text-[10px] font-bold uppercase tracking-[0.06em] text-[#6A6A6A]">Client</span>
                <select
                  value={selectedClient}
                  onChange={(e) => setSelectedClient(e.target.value)}
                  className="h-10 px-3 bg-[#FCFBF8] border border-[#E9E3DA] rounded-[10px] text-[12.5px] font-bold outline-none focus:border-[#111111] cursor-pointer"
                >
                  {uniqueClients.map(c => (
                    <option key={c} value={c}>{c === "All" ? "All Clients" : c}</option>
                  ))}
                </select>
              </div>

              {/* Assigned member select */}
              <div className="flex flex-col gap-1.5">
                <span className="text-[10px] font-bold uppercase tracking-[0.06em] text-[#6A6A6A]">Assigned Team</span>
                <select
                  value={selectedMember}
                  onChange={(e) => setSelectedMember(e.target.value)}
                  className="h-10 px-3 bg-[#FCFBF8] border border-[#E9E3DA] rounded-[10px] text-[12.5px] font-bold outline-none focus:border-[#111111] cursor-pointer"
                >
                  <option value="All">All Members</option>
                  {teamMembers.map(m => (
                    <option key={m._id} value={m.name}>{m.name}</option>
                  ))}
                </select>
              </div>

              {/* Priority select */}
              <div className="flex flex-col gap-1.5">
                <span className="text-[10px] font-bold uppercase tracking-[0.06em] text-[#6A6A6A]">Priority</span>
                <select
                  value={selectedPriority}
                  onChange={(e) => setSelectedPriority(e.target.value)}
                  className="h-10 px-3 bg-[#FCFBF8] border border-[#E9E3DA] rounded-[10px] text-[12.5px] font-bold outline-none focus:border-[#111111] cursor-pointer"
                >
                  <option value="All">All Priorities</option>
                  <option value="low">Low Priority</option>
                  <option value="medium">Medium Priority</option>
                  <option value="high">High Priority</option>
                </select>
              </div>

              {/* Due Date select */}
              <div className="flex flex-col gap-1.5">
                <span className="text-[10px] font-bold uppercase tracking-[0.06em] text-[#6A6A6A]">Due Date</span>
                <select
                  value={selectedDueDate}
                  onChange={(e) => setSelectedDueDate(e.target.value)}
                  className="h-10 px-3 bg-[#FCFBF8] border border-[#E9E3DA] rounded-[10px] text-[12.5px] font-bold outline-none focus:border-[#111111] cursor-pointer"
                >
                  <option value="All">All Target Windows</option>
                  <option value="Overdue">Overdue Tasks</option>
                  <option value="ThisMonth">Due This Month</option>
                  <option value="Upcoming">Upcoming / In-Future</option>
                </select>
              </div>

              {/* Project Type select */}
              <div className="flex flex-col gap-1.5 col-span-2 md:col-span-1">
                <span className="text-[10px] font-bold uppercase tracking-[0.06em] text-[#6A6A6A]">Project Type</span>
                <select
                  value={selectedProjectType}
                  onChange={(e) => setSelectedProjectType(e.target.value)}
                  className="h-10 px-3 bg-[#FCFBF8] border border-[#E9E3DA] rounded-[10px] text-[12.5px] font-bold outline-none focus:border-[#111111] cursor-pointer"
                >
                  <option value="All">All Types</option>
                  <option value="customised">Customised Builds</option>
                  <option value="pre-built">Pre-built Solutions</option>
                </select>
              </div>

            </div>
          </div>
        </div>
      </section>

      {/* Kanban Board Container */}
      <section className="relative z-20">
        <div className="mx-auto max-w-[1280px] px-6 md:px-12">
          
          {/* Mobile column selector buttons */}
          <div className="flex md:hidden bg-white border border-[#E9E3DA] rounded-full p-1.5 mb-6 shadow-sm justify-between">
            <button
              onClick={() => setMobileActiveColumn("not-started")}
              className={`flex-1 text-center py-2.5 rounded-full text-[11px] font-extrabold uppercase tracking-wider transition-all ${
                mobileActiveColumn === "not-started" 
                  ? "bg-[#111111] text-white shadow-sm" 
                  : "text-[#6A6A6A] hover:bg-[#FCFBF8]"
              }`}
            >
              Not Started ({notStartedColumn.length})
            </button>
            <button
              onClick={() => setMobileActiveColumn("ongoing")}
              className={`flex-1 text-center py-2.5 rounded-full text-[11px] font-extrabold uppercase tracking-wider transition-all ${
                mobileActiveColumn === "ongoing" 
                  ? "bg-[#111111] text-white shadow-sm" 
                  : "text-[#6A6A6A] hover:bg-[#FCFBF8]"
              }`}
            >
              Ongoing ({ongoingColumn.length})
            </button>
            <button
              onClick={() => setMobileActiveColumn("completed")}
              className={`flex-1 text-center py-2.5 rounded-full text-[11px] font-extrabold uppercase tracking-wider transition-all ${
                mobileActiveColumn === "completed" 
                  ? "bg-[#111111] text-white shadow-sm" 
                  : "text-[#6A6A6A] hover:bg-[#FCFBF8]"
              }`}
            >
              Completed ({completedColumn.length})
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-start">
            
            {/* COLUMN 1: NOT STARTED */}
            <div 
              onDragOver={handleDragOver}
              onDrop={(e) => handleDrop(e, "not-started")}
              className={`flex flex-col gap-5 bg-[#FCFBF8] border border-[#E9E3DA] p-6 rounded-[28px] transition-all min-h-[500px] shadow-[0_2px_12px_rgba(0,0,0,0.01)] ${
                mobileActiveColumn === "not-started" ? "flex" : "hidden md:flex"
              }`}
            >
              <div className="flex justify-between items-center pb-2 border-b border-[#E9E3DA]/60">
                <div className="flex items-center gap-2.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-neutral-400" />
                  <h3 className="text-[14px] font-black uppercase tracking-[0.08em] text-[#111111]">Not Started</h3>
                </div>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-[#E9E3DA]/50 text-[#111111]">{notStartedColumn.length}</span>
              </div>

              <div className="flex flex-col gap-4">
                {notStartedColumn.length === 0 ? (
                  <div className="py-12 border border-dashed border-[#E9E3DA] rounded-[20px] text-center text-[#A8A296] text-[12px] font-semibold bg-white/30">
                    No backlog items
                  </div>
                ) : (
                  <AnimatePresence mode="popLayout">
                    {notStartedColumn.map(project => (
                      <KanbanCard 
                        key={project._id} 
                        project={project} 
                        teamMembers={teamMembers} 
                        onDragStart={handleDragStart} 
                      />
                    ))}
                  </AnimatePresence>
                )}
              </div>
            </div>

            {/* COLUMN 2: ONGOING */}
            <div 
              onDragOver={handleDragOver}
              onDrop={(e) => handleDrop(e, "ongoing")}
              className={`flex flex-col gap-5 bg-blue-50/20 border border-[#E9E3DA] p-6 rounded-[28px] transition-all min-h-[500px] shadow-[0_2px_12px_rgba(0,0,0,0.01)] ${
                mobileActiveColumn === "ongoing" ? "flex" : "hidden md:flex"
              }`}
            >
              <div className="flex justify-between items-center pb-2 border-b border-[#E9E3DA]/60">
                <div className="flex items-center gap-2.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-blue-500" />
                  <h3 className="text-[14px] font-black uppercase tracking-[0.08em] text-blue-955">Ongoing</h3>
                </div>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-blue-100/50 text-blue-900">{ongoingColumn.length}</span>
              </div>

              <div className="flex flex-col gap-4">
                {ongoingColumn.length === 0 ? (
                  <div className="py-12 border border-dashed border-[#E9E3DA] rounded-[20px] text-center text-[#A8A296] text-[12px] font-semibold bg-white/30">
                    No active sprints
                  </div>
                ) : (
                  <AnimatePresence mode="popLayout">
                    {ongoingColumn.map(project => (
                      <KanbanCard 
                        key={project._id} 
                        project={project} 
                        teamMembers={teamMembers} 
                        onDragStart={handleDragStart} 
                      />
                    ))}
                  </AnimatePresence>
                )}
              </div>
            </div>

            {/* COLUMN 3: COMPLETED */}
            <div 
              onDragOver={handleDragOver}
              onDrop={(e) => handleDrop(e, "completed")}
              className={`flex flex-col gap-5 bg-emerald-50/20 border border-[#E9E3DA] p-6 rounded-[28px] transition-all min-h-[500px] shadow-[0_2px_12px_rgba(0,0,0,0.01)] ${
                mobileActiveColumn === "completed" ? "flex" : "hidden md:flex"
              }`}
            >
              <div className="flex justify-between items-center pb-2 border-b border-[#E9E3DA]/60">
                <div className="flex items-center gap-2.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                  <h3 className="text-[14px] font-black uppercase tracking-[0.08em] text-emerald-955">Completed</h3>
                </div>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-100/50 text-emerald-900">{completedColumn.length}</span>
              </div>

              <div className="flex flex-col gap-4">
                {completedColumn.length === 0 ? (
                  <div className="py-12 border border-dashed border-[#E9E3DA] rounded-[20px] text-center text-[#A8A296] text-[12px] font-semibold bg-white/30">
                    No items resolved
                  </div>
                ) : (
                  <AnimatePresence mode="popLayout">
                    {completedColumn.map(project => (
                      <KanbanCard 
                        key={project._id} 
                        project={project} 
                        teamMembers={teamMembers} 
                        onDragStart={handleDragStart} 
                      />
                    ))}
                  </AnimatePresence>
                )}
              </div>
            </div>

          </div>
        </div>
      </section>
    </main>
  );
}

// Subcomponent: Kanban Card
function KanbanCard({ 
  project, 
  teamMembers, 
  onDragStart 
}: { 
  project: any; 
  teamMembers: any[]; 
  onDragStart: (e: React.DragEvent, id: string) => void;
}) {
  const getInitials = (name: string) => {
    if (!name) return "?";
    return name.split(" ").map(n => n[0]).join("").toUpperCase().substring(0, 2);
  };

  const getMemberImage = (name: string) => {
    const member = teamMembers.find(m => m.name.toLowerCase() === name.toLowerCase());
    return member?.image || null;
  };

  const formatDateString = (dateVal: any) => {
    if (!dateVal) return "—";
    try {
      const d = new Date(dateVal);
      return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
    } catch (e) {
      return "—";
    }
  };

  const priorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "bg-rose-50 text-rose-700 border-rose-200/80";
      case "low":
        return "bg-neutral-100 text-neutral-600 border-neutral-200/80";
      default:
        return "bg-amber-50 text-amber-700 border-amber-200/80";
    }
  };

  return (
    <motion.div
      layout
      draggable
      onDragStart={(e) => onDragStart(e as any, project._id)}
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.45, ease: EASE }}
      className="bg-white border border-[#E9E3DA] hover:border-[#111111]/30 hover:-translate-y-1 hover:shadow-md cursor-grab active:cursor-grabbing transition-all duration-300 rounded-[22px] p-5 flex flex-col gap-4 select-none relative group"
    >
      
      {/* Row 1: Category & Priority */}
      <div className="flex justify-between items-center gap-3">
        <span className="text-[10px] font-black uppercase tracking-[0.15em] text-[#A8A296] bg-[#FCFBF8] border border-[#E9E3DA] px-2.5 py-0.5 rounded-[6px]">
          {project.category || "General"}
        </span>
        <span className={`text-[9.5px] font-bold uppercase tracking-[0.06em] px-2 py-0.5 rounded-full border ${priorityColor(project.priority || "medium")}`}>
          {project.priority || "medium"}
        </span>
      </div>

      {/* Row 2: Title & Client */}
      <div>
        <h4 className="text-[15.5px] font-extrabold leading-[1.3] text-[#111111] tracking-tight group-hover:text-[#F4C542] transition-colors">
          {project.title}
        </h4>
        <div className="flex items-center gap-1.5 mt-1 text-[11px] text-[#6A6A6A] font-semibold">
          <Briefcase size={11} className="text-[#A8A296] shrink-0" />
          <span>Client: {project.client || "Self-Initiated"}</span>
        </div>
      </div>

      {/* Card Content specific to statuses */}
      <div className="flex flex-col gap-2 pt-2 border-t border-[#E9E3DA]/40">
        
        {/* Progress Bar (Visible for ONGOING and COMPLETED) */}
        {project.status !== "not-started" && (
          <div className="flex flex-col gap-1.5">
            <div className="flex justify-between items-center text-[10px] font-bold text-[#6A6A6A]">
              <span>Completion progress</span>
              <span className="font-mono">{project.progress ?? 0}%</span>
            </div>
            <div className="h-1.5 w-full bg-neutral-100 rounded-full overflow-hidden border border-neutral-200/20">
              <motion.div 
                className={`h-full rounded-full ${
                  project.status === "completed" ? "bg-emerald-500" : "bg-[#111111]"
                }`}
                initial={{ width: 0 }}
                animate={{ width: `${project.progress ?? 0}%` }}
                transition={{ duration: 0.8, ease: EASE }}
              />
            </div>
          </div>
        )}

        {/* Start Date / Due Date / Completion Date details */}
        <div className="flex flex-col gap-1.5 mt-1 text-[11px] text-[#6A6A6A]">
          {project.status === "completed" ? (
            <div className="flex items-center gap-1.5 font-medium">
              <Calendar size={11} className="text-emerald-600 shrink-0" />
              <span>Finished: <strong className="text-[#111111] font-bold">{formatDateString(project.completionDate)}</strong></span>
            </div>
          ) : (
            <div className="flex flex-col gap-1 font-medium">
              <div className="flex items-center gap-1.5">
                <Calendar size={11} className="text-[#A8A296] shrink-0" />
                <span>
                  {project.status === "not-started" ? "Planned Start: " : "Started: "}
                  <strong className="text-[#111111] font-semibold">{formatDateString(project.startDate)}</strong>
                </span>
              </div>
              {project.dueDate && (
                <div className="flex items-center gap-1.5">
                  <ChevronRight size={11} className="text-[#A8A296] shrink-0" />
                  <span>Target Due: <strong className="text-[#111111] font-semibold">{formatDateString(project.dueDate)}</strong></span>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Project Value (Visible for COMPLETED) */}
        {project.status === "completed" && project.projectValue > 0 && (
          <div className="inline-flex items-center gap-1 mt-1 text-[11px] font-extrabold text-[#111111] bg-emerald-50 border border-emerald-200/50 px-2.5 py-1 rounded-[8px] w-fit">
            <DollarSign size={11} className="text-emerald-700" />
            <span>Valued at ${project.projectValue.toLocaleString("en-US")}</span>
          </div>
        )}
      </div>

      {/* Row 4: Assigned Team Members & Action Indicators */}
      <div className="flex justify-between items-center gap-4 pt-3 border-t border-[#E9E3DA]/40 mt-1">
        
        {/* Team Avatar Stack */}
        <div className="flex items-center">
          {project.assignedTeam && project.assignedTeam.length > 0 ? (
            <div className="flex -space-x-2 overflow-hidden">
              {project.assignedTeam.map((member: string, idx: number) => {
                const img = getMemberImage(member);
                return (
                  <div 
                    key={idx}
                    className="inline-block h-6 w-6 rounded-full border border-white bg-[#E9E3DA] text-[#111111] text-[9px] font-black uppercase flex items-center justify-center shadow-sm relative group/avatar cursor-pointer"
                    title={member}
                  >
                    {img ? (
                      /* eslint-disable-next-line @next/next/no-img-element */
                      <img 
                        src={img} 
                        alt={member} 
                        className="h-full w-full object-cover rounded-full"
                      />
                    ) : (
                      <span>{getInitials(member)}</span>
                    )}

                    {/* Tooltip */}
                    <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1.5 px-2 py-1 rounded bg-[#111111] text-white text-[9.5px] font-bold whitespace-nowrap opacity-0 group-hover/avatar:opacity-100 transition-opacity z-55 pointer-events-none shadow-md">
                      {member}
                    </span>
                  </div>
                );
              })}
            </div>
          ) : (
            <span className="text-[10.5px] text-[#A8A296] font-semibold italic flex items-center gap-1">
              <User size={11} /> Unassigned
            </span>
          )}
        </div>

        {/* Small live demo indicator if available */}
        {project.liveUrl && (
          <a
            href={project.liveUrl}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()} // Prevent drag trigger
            className="text-[10px] font-bold text-[#6A6A6A] hover:text-[#111111] flex items-center gap-0.5 border border-transparent hover:border-[#E9E3DA] rounded-full px-2 py-0.5 transition-all bg-white"
          >
            Demo ↗
          </a>
        )}
      </div>

    </motion.div>
  );
}
