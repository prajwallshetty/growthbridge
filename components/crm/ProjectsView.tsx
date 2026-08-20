"use client";

import React, { useState, useEffect } from "react";
import { useCRM, CRMClient, CRMTask, CRMExpense, CRMPayment } from "./CRMProvider";
import {
  Briefcase,
  Clock,
  CheckCircle2,
  AlertCircle,
  ArrowUpRight,
  Plus,
  User,
  Search,
  CheckSquare,
  Receipt,
  IndianRupee,
  Calendar as CalendarIcon,
  ChevronDown,
  ChevronRight,
  X,
  Trash2,
  Edit2,
  Layers,
  Filter,
  Check,
  TrendingUp,
  Percent,
  MoreHorizontal,
  Copy,
  LayoutGrid,
  List,
  ArrowUpDown,
  SlidersHorizontal,
  Sparkles,
  ExternalLink,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function ProjectsView() {
  const {
    clients,
    activeClientId,
    setActiveClientId,
    addTask,
    updateTask,
    toggleTask,
    deleteTask,
    addExpense,
    deleteExpense,
    addPayment,
    deletePayment,
    updateClientStage,
    addClient,
    deleteClient,
    updateClient,
    settings,
    financialStats,
  } = useCRM();

  // Navigation & View Mode state
  const [projectListTab, setProjectListTab] = useState<"All" | "Ongoing" | "Completed" | "Not Started">("All");
  const [viewMode, setViewMode] = useState<"board" | "list">("board");

  // Load view mode preference from localStorage
  useEffect(() => {
    try {
      const savedView = localStorage.getItem("gb_projects_view_mode");
      if (savedView === "board" || savedView === "list") {
        setViewMode(savedView);
      }
    } catch (e) {
      // Ignore localStorage errors
    }
  }, []);

  const handleSetViewMode = (mode: "board" | "list") => {
    setViewMode(mode);
    try {
      localStorage.setItem("gb_projects_view_mode", mode);
    } catch (e) {}
  };

  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState("");
  const [filterClient, setFilterClient] = useState<string>("All");
  const [filterPriority, setFilterPriority] = useState<string>("All");
  const [filterAssignee, setFilterAssignee] = useState<string>("All");
  const [filterDueDate, setFilterDueDate] = useState<string>("All");
  const [sortOption, setSortOption] = useState<"recently_created" | "due_date" | "progress" | "budget" | "client_name">("recently_created");
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);

  // Active Menu card dropdown
  const [activeCardMenuId, setActiveCardMenuId] = useState<string | null>(null);

  // Workspace sub-tabs state
  const [activeTab, setActiveTab] = useState<"checklist" | "expenses" | "payments" | "financials" | "timeline">("checklist");
  const [isAddProjectModalOpen, setIsAddProjectModalOpen] = useState(false);

  // Edit Project State
  const [editingProject, setEditingProject] = useState<CRMClient | null>(null);
  const [editBudget, setEditBudget] = useState("");
  const [editCompany, setEditCompany] = useState("");
  const [editClientName, setEditClientName] = useState("");
  const [editStage, setEditStage] = useState("");
  const [editDeadline, setEditDeadline] = useState("");
  const [editProgress, setEditProgress] = useState(0);
  const [editStatus, setEditStatus] = useState<"Not Started" | "Ongoing" | "Completed">("Ongoing");
  const [editPriority, setEditPriority] = useState<"High" | "Medium" | "Low">("Medium");

  // Launch Project State
  const [newProjectCompany, setNewProjectCompany] = useState("");
  const [newProjectName, setNewProjectName] = useState("");
  const [newProjectBudget, setNewProjectBudget] = useState("");
  const [newProjectStartDate, setNewProjectStartDate] = useState(new Date().toISOString().split("T")[0]);
  const [newProjectDeadline, setNewProjectDeadline] = useState("");
  const [newProjectAssignee, setNewProjectAssignee] = useState("Admin");
  const [newProjectStatus, setNewProjectStatus] = useState<"Not Started" | "Ongoing" | "Completed">("Ongoing");
  const [newProjectPriority, setNewProjectPriority] = useState<"High" | "Medium" | "Low">("Medium");

  // Task Checklist state
  const [newTaskTitle, setNewTaskTitle] = useState("");
  const [newTaskDesc, setNewTaskDesc] = useState("");
  const [newTaskPriority, setNewTaskPriority] = useState<"High" | "Medium" | "Low">("Medium");
  const [newTaskAssignee, setNewTaskAssignee] = useState("Admin");
  const [newTaskDueDate, setNewTaskDueDate] = useState("");
  const [newSubtaskTitle, setNewSubtaskTitle] = useState<{ [taskId: string]: string }>({});

  // Expense form state
  const [expName, setExpName] = useState("");
  const [expCategory, setExpCategory] = useState("Material Cost");
  const [expVendor, setExpVendor] = useState("");
  const [expAmount, setExpAmount] = useState("");
  const [expMethod, setExpMethod] = useState("Bank Transfer");
  const [expDate, setExpDate] = useState(new Date().toISOString().split("T")[0]);
  const [expNotes, setExpNotes] = useState("");

  // Payment form state
  const [payAmount, setPayAmount] = useState("");
  const [payDate, setPayDate] = useState(new Date().toISOString().split("T")[0]);
  const [payRef, setPayRef] = useState("");
  const [payMethod, setPayMethod] = useState("Bank Transfer");
  const [payNotes, setPayNotes] = useState("");

  // Helper: Format currency
  const formatCurrency = (val: number) => {
    const sym = settings.currency || "₹";
    return `${sym}${val.toLocaleString("en-IN")}`;
  };

  // Helper: Format date nicely
  const formatDate = (dateStr?: string) => {
    if (!dateStr) return "TBD";
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
    } catch {
      return dateStr;
    }
  };

  // Helper: Calculate overdue days
  const getOverdueDays = (dateStr?: string) => {
    if (!dateStr) return 0;
    try {
      const due = new Date(dateStr);
      const now = new Date();
      due.setHours(0, 0, 0, 0);
      now.setHours(0, 0, 0, 0);
      const diffDays = Math.floor((now.getTime() - due.getTime()) / (1000 * 3600 * 24));
      return diffDays > 0 ? diffDays : 0;
    } catch {
      return 0;
    }
  };

  // Helper: Determine project status normalized
  const getProjectStatus = (project: CRMClient): "Not Started" | "Ongoing" | "Completed" => {
    if (project.status) {
      if (project.status === "Completed") return "Completed";
      if (project.status === "Not Started") return "Not Started";
      return "Ongoing";
    }
    const stage = project.stage;
    if (stage === "Completed" || stage === "Project Completed") return "Completed";
    if (
      [
        "Lead Created",
        "Discovery Call",
        "Meeting Scheduled",
        "Requirements Received",
        "Proposal Generated",
        "Quotation Generated",
        "Client Approval",
        "Agreement Generated",
      ].includes(stage)
    ) {
      return "Not Started";
    }
    return "Ongoing";
  };

  // Helper: Quick Status Change from card dropdown or button
  const handleQuickStatusChange = async (
    project: CRMClient,
    newStatus: "Not Started" | "Ongoing" | "Completed",
    e?: React.MouseEvent
  ) => {
    if (e) e.stopPropagation();
    setActiveCardMenuId(null);

    let nextStage = project.stage;
    let nextProgress = project.progress;
    if (newStatus === "Completed") {
      nextStage = "Completed";
      nextProgress = 100;
    } else if (newStatus === "Not Started") {
      nextStage = "Lead Created";
      nextProgress = 0;
    } else {
      if (nextProgress === 0 || nextProgress === 100) nextProgress = 10;
      if (nextStage === "Completed" || nextStage === "Project Completed" || nextStage === "Lead Created") {
        nextStage = "Development";
      }
    }

    await updateClient(project._id, {
      status: newStatus,
      stage: nextStage as any,
      progress: nextProgress,
    });
  };

  // Helper: Duplicate Project
  const handleDuplicateProject = async (project: CRMClient, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setActiveCardMenuId(null);

    await addClient({
      company: `${project.company} (Copy)`,
      name: project.name,
      budget: project.budget,
      startDate: new Date().toISOString().split("T")[0],
      expectedDelivery: project.expectedDelivery,
      assignee: project.assignee,
      stage: project.stage,
      status: getProjectStatus(project),
      priority: project.priority || "Medium",
      countryFlag: project.countryFlag || "🇮🇳",
      logo: `${project.company.substring(0, 2).toUpperCase()}`,
      tasks: project.tasks ? project.tasks.map((t) => ({ ...t, _id: t._id || Math.random().toString() })) : [],
      expenses: [],
      payments: [],
    });
  };

  // Edit Modal Open Helper
  const openEditModal = (project: CRMClient, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setActiveCardMenuId(null);
    setEditingProject(project);
    setEditBudget((project.budget || 0).toString());
    setEditCompany(project.company || "");
    setEditClientName(project.name || "");
    setEditStage(project.stage || "Active");
    setEditDeadline(project.expectedDelivery || "");
    setEditProgress(project.progress || 0);
    setEditStatus(project.status as any || getProjectStatus(project));
    setEditPriority(project.priority || "Medium");
  };

  // Save Edit Project submit handler
  const handleSaveEditProject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProject) return;

    await updateClient(editingProject._id, {
      budget: parseFloat(editBudget) || 0,
      company: editCompany,
      name: editClientName,
      stage: editStage as any,
      expectedDelivery: editDeadline,
      progress: editProgress,
      status: editStatus,
      priority: editPriority,
    });

    setEditingProject(null);
  };

  // Launch Project submit handler
  const handleCreateProject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProjectCompany || !newProjectName || !newProjectBudget) return;

    await addClient({
      company: newProjectCompany,
      name: newProjectName,
      budget: parseFloat(newProjectBudget) || 0,
      startDate: newProjectStartDate,
      expectedDelivery: newProjectDeadline || newProjectStartDate,
      assignee: newProjectAssignee,
      stage: newProjectStatus === "Completed" ? "Completed" : newProjectStatus === "Not Started" ? "Lead Created" : "Active",
      status: newProjectStatus,
      priority: newProjectPriority,
      countryFlag: "🇮🇳",
      logo: newProjectCompany.substring(0, 2).toUpperCase(),
      tasks: [],
      expenses: [],
      payments: [],
    });

    setNewProjectCompany("");
    setNewProjectName("");
    setNewProjectBudget("");
    setNewProjectStatus("Ongoing");
    setIsAddProjectModalOpen(false);
  };

  // Task / Subtask / Expense / Payment handlers
  const handleAddTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeProject || !newTaskTitle) return;

    await addTask(activeProject._id, {
      title: newTaskTitle,
      description: newTaskDesc,
      priority: newTaskPriority,
      assignee: newTaskAssignee,
      dueDate: newTaskDueDate || new Date().toISOString().split("T")[0],
      status: "Pending",
      progress: 0,
      completed: false,
      subtasks: [],
    });

    setNewTaskTitle("");
    setNewTaskDesc("");
  };

  const handleAddSubtask = async (taskId: string) => {
    if (!activeProject) return;
    const subTitle = newSubtaskTitle[taskId];
    if (!subTitle) return;

    const task = activeProject.tasks.find((t) => t._id === taskId || t.id === taskId);
    if (!task) return;

    const existingSubtasks = task.subtasks || [];
    const updatedSubtasks = [...existingSubtasks, { title: subTitle, completed: false }];

    await updateTask(activeProject._id, taskId, { subtasks: updatedSubtasks });
    setNewSubtaskTitle((prev) => ({ ...prev, [taskId]: "" }));
  };

  const handleToggleSubtask = async (taskId: string, subtaskIndex: number) => {
    if (!activeProject) return;
    const task = activeProject.tasks.find((t) => t._id === taskId || t.id === taskId);
    if (!task || !task.subtasks) return;

    const updatedSubtasks = [...task.subtasks];
    updatedSubtasks[subtaskIndex].completed = !updatedSubtasks[subtaskIndex].completed;

    await updateTask(activeProject._id, taskId, { subtasks: updatedSubtasks });
  };

  const handleAddExpenseSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeProject || !expName || !expAmount) return;

    await addExpense(activeProject._id, {
      name: expName,
      category: expCategory,
      vendor: expVendor,
      amount: parseFloat(expAmount) || 0,
      paymentMethod: expMethod,
      date: expDate,
      notes: expNotes,
    });

    setExpName("");
    setExpVendor("");
    setExpAmount("");
    setExpNotes("");
  };

  const handleAddPaymentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeProject || !payAmount) return;

    await addPayment(activeProject._id, {
      amount: parseFloat(payAmount) || 0,
      paymentDate: payDate,
      referenceNumber: payRef,
      paymentMethod: payMethod,
      notes: payNotes,
    });

    setPayAmount("");
    setPayRef("");
    setPayNotes("");
  };

  // Active Project Reference
  const activeProject = clients.find((c) => c._id === activeClientId) || null;

  // Compute Financials helper
  const getProjectFinancials = (client: CRMClient) => {
    const cost = client.budget || client.projectCost || 0;
    let received = 0;
    if (client.payments && client.payments.length > 0) {
      received = client.payments.reduce((sum, p) => sum + (p.amount || 0), 0);
    } else if (client.invoices && client.invoices.length > 0) {
      received = client.invoices.filter((i) => i.status === "Paid").reduce((sum, i) => sum + (i.amount || 0), 0);
    }
    const pendingAmount = Math.max(0, cost - received);
    let expenses = 0;
    if (client.expenses && client.expenses.length > 0) {
      expenses = client.expenses.reduce((sum, e) => sum + (e.amount || 0), 0);
    }
    const profit = received - expenses;
    return { cost, received, pendingAmount, expenses, profit };
  };

  // Categories Count Computation
  const ongoingProjects = clients.filter((p) => getProjectStatus(p) === "Ongoing");
  const completedProjects = clients.filter((p) => getProjectStatus(p) === "Completed");
  const notStartedProjects = clients.filter((p) => getProjectStatus(p) === "Not Started");

  // Dynamic dropdown list options
  const uniqueClientsList = Array.from(new Set(clients.map((c) => c.company).filter(Boolean)));
  const uniqueAssigneesList = Array.from(new Set(clients.map((c) => c.assignee).filter(Boolean)));

  // FILTER & SORT PIPELINE
  const processedProjects = clients
    .filter((project) => {
      const status = getProjectStatus(project);

      // 1. Navigation Tab Filter
      if (projectListTab !== "All" && status !== projectListTab) {
        return false;
      }

      // 2. Search Query Filter (Company, Client Contact, Assignee, Industry, Stage)
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matches =
          project.company?.toLowerCase().includes(q) ||
          project.name?.toLowerCase().includes(q) ||
          project.assignee?.toLowerCase().includes(q) ||
          project.industry?.toLowerCase().includes(q) ||
          project.stage?.toLowerCase().includes(q);
        if (!matches) return false;
      }

      // 3. Client Filter
      if (filterClient !== "All" && project.company !== filterClient) {
        return false;
      }

      // 4. Priority Filter
      if (filterPriority !== "All" && (project.priority || "Medium") !== filterPriority) {
        return false;
      }

      // 5. Assignee Filter
      if (filterAssignee !== "All" && project.assignee !== filterAssignee) {
        return false;
      }

      // 6. Due Date Filter
      if (filterDueDate !== "All") {
        const overdueDays = getOverdueDays(project.expectedDelivery);
        if (filterDueDate === "Overdue" && (overdueDays === 0 || status === "Completed")) {
          return false;
        }
        if (filterDueDate === "ThisMonth") {
          const now = new Date();
          const due = project.expectedDelivery ? new Date(project.expectedDelivery) : null;
          if (!due || due.getMonth() !== now.getMonth() || due.getFullYear() !== now.getFullYear()) {
            return false;
          }
        }
        if (filterDueDate === "Upcoming") {
          const now = new Date();
          const due = project.expectedDelivery ? new Date(project.expectedDelivery) : null;
          if (!due || due < now) return false;
        }
      }

      return true;
    })
    .sort((a, b) => {
      // 7. Sort options
      if (sortOption === "due_date") {
        const dA = a.expectedDelivery ? new Date(a.expectedDelivery).getTime() : Infinity;
        const dB = b.expectedDelivery ? new Date(b.expectedDelivery).getTime() : Infinity;
        return dA - dB;
      }
      if (sortOption === "progress") {
        return (b.progress || 0) - (a.progress || 0);
      }
      if (sortOption === "budget") {
        return (b.budget || 0) - (a.budget || 0);
      }
      if (sortOption === "client_name") {
        return a.company.localeCompare(b.company);
      }
      // default: recently_created
      return (b._id || "").localeCompare(a._id || "");
    });

  return (
    <div className="flex flex-col gap-6 pb-16 select-none" onClick={() => setActiveCardMenuId(null)}>
      {/* 1. TOP HEADER & COMPACT SUMMARY STATS */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-[28px] font-extrabold tracking-tight text-[#111111] leading-none">
            Projects
          </h1>
          <p className="text-[13.5px] text-[#6A6A6A] mt-1.5 font-medium">
            Manage and track every project from one workspace.
          </p>
        </div>

        <button
          onClick={() => setIsAddProjectModalOpen(true)}
          className="flex items-center justify-center gap-2 bg-[#111111] hover:bg-[#222222] text-white px-5 py-2.5 rounded-xl text-[13px] font-bold transition-all shadow-sm cursor-pointer shrink-0"
        >
          <Plus size={16} />
          <span>New Project</span>
        </button>
      </div>

      {/* Compact Summary Pills Row */}
      <div className="flex items-center gap-2.5 flex-wrap">
        <div className="bg-white border border-[#E9E3DA] px-3.5 py-1.5 rounded-xl text-[12.5px] font-semibold text-[#111111] flex items-center gap-2 shadow-2xs">
          <span className="w-2 h-2 rounded-full bg-[#111111]" />
          <span>
            <strong className="font-extrabold">{ongoingProjects.length}</strong> Active
          </span>
        </div>

        <div className="bg-white border border-[#E9E3DA] px-3.5 py-1.5 rounded-xl text-[12.5px] font-semibold text-[#111111] flex items-center gap-2 shadow-2xs">
          <span className="w-2 h-2 rounded-full bg-emerald-500" />
          <span>
            <strong className="font-extrabold">{completedProjects.length}</strong> Completed
          </span>
        </div>

        <div className="bg-white border border-[#E9E3DA] px-3.5 py-1.5 rounded-xl text-[12.5px] font-semibold text-[#111111] flex items-center gap-2 shadow-2xs">
          <span className="w-2 h-2 rounded-full bg-gray-400" />
          <span>
            <strong className="font-extrabold">{notStartedProjects.length}</strong> Not Started
          </span>
        </div>

        <div className="bg-white border border-[#E9E3DA] px-3.5 py-1.5 rounded-xl text-[12.5px] font-semibold text-[#111111] flex items-center gap-2 shadow-2xs">
          <IndianRupee size={13} className="text-emerald-600" />
          <span>
            Total Revenue: <strong className="font-mono font-extrabold text-[#111111]">{formatCurrency(financialStats.totalRevenue)}</strong>
          </span>
        </div>
      </div>

      {/* 2. STICKY SEGMENTED STATUS NAVIGATION & VIEW MODE TOGGLE */}
      <div className="sticky top-0 z-30 bg-[#FCFBF8]/90 backdrop-blur-md py-3.5 border-b border-[#E9E3DA]/60 -mx-4 px-4 sm:-mx-8 sm:px-8 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
        {/* Segmented Status Tabs */}
        <div className="flex items-center bg-[#FCFBF8] border border-[#E9E3DA] p-1 rounded-xl shadow-2xs overflow-x-auto max-w-full no-scrollbar">
          <button
            onClick={() => setProjectListTab("All")}
            className={`px-4 py-2 rounded-lg text-[12.5px] transition-all cursor-pointer whitespace-nowrap flex items-center gap-2 ${
              projectListTab === "All"
                ? "bg-[#111111] text-white font-extrabold shadow-xs"
                : "text-[#6A6A6A] hover:text-[#111111] font-semibold hover:bg-neutral-100"
            }`}
          >
            <span>All Projects</span>
            <span
              className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold ${
                projectListTab === "All" ? "bg-white/20 text-white" : "bg-[#111111]/5 text-[#111111]"
              }`}
            >
              {clients.length}
            </span>
          </button>

          <button
            onClick={() => setProjectListTab("Ongoing")}
            className={`px-4 py-2 rounded-lg text-[12.5px] transition-all cursor-pointer whitespace-nowrap flex items-center gap-2 ${
              projectListTab === "Ongoing"
                ? "bg-[#111111] text-white font-extrabold shadow-xs"
                : "text-[#6A6A6A] hover:text-[#111111] font-semibold hover:bg-neutral-100"
            }`}
          >
            <span>Ongoing</span>
            <span
              className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold ${
                projectListTab === "Ongoing" ? "bg-white/20 text-white" : "bg-[#111111]/5 text-[#111111]"
              }`}
            >
              {ongoingProjects.length}
            </span>
          </button>

          <button
            onClick={() => setProjectListTab("Completed")}
            className={`px-4 py-2 rounded-lg text-[12.5px] transition-all cursor-pointer whitespace-nowrap flex items-center gap-2 ${
              projectListTab === "Completed"
                ? "bg-[#111111] text-white font-extrabold shadow-xs"
                : "text-[#6A6A6A] hover:text-[#111111] font-semibold hover:bg-neutral-100"
            }`}
          >
            <span>Completed</span>
            <span
              className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold ${
                projectListTab === "Completed" ? "bg-white/20 text-white" : "bg-[#111111]/5 text-[#111111]"
              }`}
            >
              {completedProjects.length}
            </span>
          </button>

          <button
            onClick={() => setProjectListTab("Not Started")}
            className={`px-4 py-2 rounded-lg text-[12.5px] transition-all cursor-pointer whitespace-nowrap flex items-center gap-2 ${
              projectListTab === "Not Started"
                ? "bg-[#111111] text-white font-extrabold shadow-xs"
                : "text-[#6A6A6A] hover:text-[#111111] font-semibold hover:bg-neutral-100"
            }`}
          >
            <span>Not Started</span>
            <span
              className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold ${
                projectListTab === "Not Started" ? "bg-white/20 text-white" : "bg-[#111111]/5 text-[#111111]"
              }`}
            >
              {notStartedProjects.length}
            </span>
          </button>
        </div>

        {/* View Mode Toggle: Board vs List */}
        <div className="flex items-center bg-[#FCFBF8] border border-[#E9E3DA] p-1 rounded-xl shadow-2xs self-end sm:self-auto shrink-0">
          <button
            onClick={() => handleSetViewMode("board")}
            className={`px-3 py-1.5 rounded-lg text-[12px] font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              viewMode === "board" ? "bg-[#111111] text-white shadow-xs" : "text-[#6A6A6A] hover:text-[#111111]"
            }`}
          >
            <LayoutGrid size={14} />
            <span>Board</span>
          </button>
          <button
            onClick={() => handleSetViewMode("list")}
            className={`px-3 py-1.5 rounded-lg text-[12px] font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              viewMode === "list" ? "bg-[#111111] text-white shadow-xs" : "text-[#6A6A6A] hover:text-[#111111]"
            }`}
          >
            <List size={14} />
            <span>List</span>
          </button>
        </div>
      </div>

      {/* 3. SEARCH + MULTI-FILTER + SORT ROW */}
      <div className="bg-white border border-[#E9E3DA] rounded-2xl p-3.5 shadow-2xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        {/* Search input */}
        <div className="relative flex-1">
          <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#A8A296]" />
          <input
            type="text"
            placeholder="Search projects by company, client, assignee, or industry..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full h-10 pl-10 pr-4 bg-[#FCFBF8] border border-[#E9E3DA] rounded-xl text-[13px] font-medium text-[#111111] outline-none focus:border-[#111111] transition-all"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-[#A8A296] hover:text-[#111111]"
            >
              <X size={14} />
            </button>
          )}
        </div>

        {/* Desktop Filter Dropdowns */}
        <div className="hidden lg:flex items-center gap-2 flex-wrap">
          {/* Client Filter */}
          <select
            value={filterClient}
            onChange={(e) => setFilterClient(e.target.value)}
            className="h-10 px-3 bg-[#FCFBF8] border border-[#E9E3DA] rounded-xl text-[12px] font-bold text-[#111111] outline-none focus:border-[#111111] cursor-pointer"
          >
            <option value="All">All Clients</option>
            {uniqueClientsList.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>

          {/* Priority Filter */}
          <select
            value={filterPriority}
            onChange={(e) => setFilterPriority(e.target.value)}
            className="h-10 px-3 bg-[#FCFBF8] border border-[#E9E3DA] rounded-xl text-[12px] font-bold text-[#111111] outline-none focus:border-[#111111] cursor-pointer"
          >
            <option value="All">All Priorities</option>
            <option value="High">High Priority</option>
            <option value="Medium">Medium Priority</option>
            <option value="Low">Low Priority</option>
          </select>

          {/* Assignee Filter */}
          <select
            value={filterAssignee}
            onChange={(e) => setFilterAssignee(e.target.value)}
            className="h-10 px-3 bg-[#FCFBF8] border border-[#E9E3DA] rounded-xl text-[12px] font-bold text-[#111111] outline-none focus:border-[#111111] cursor-pointer"
          >
            <option value="All">All Team Members</option>
            {uniqueAssigneesList.map((a) => (
              <option key={a} value={a}>
                {a}
              </option>
            ))}
          </select>

          {/* Due Date Filter */}
          <select
            value={filterDueDate}
            onChange={(e) => setFilterDueDate(e.target.value)}
            className="h-10 px-3 bg-[#FCFBF8] border border-[#E9E3DA] rounded-xl text-[12px] font-bold text-[#111111] outline-none focus:border-[#111111] cursor-pointer"
          >
            <option value="All">All Deadlines</option>
            <option value="Overdue">Overdue Tasks</option>
            <option value="ThisMonth">Due This Month</option>
            <option value="Upcoming">Upcoming</option>
          </select>

          {/* Sort Selector */}
          <div className="flex items-center gap-1 pl-2 border-l border-[#E9E3DA]">
            <ArrowUpDown size={13} className="text-[#6A6A6A]" />
            <select
              value={sortOption}
              onChange={(e) => setSortOption(e.target.value as any)}
              className="h-10 px-3 bg-[#FCFBF8] border border-[#E9E3DA] rounded-xl text-[12px] font-bold text-[#111111] outline-none focus:border-[#111111] cursor-pointer"
            >
              <option value="recently_created">Recently Created</option>
              <option value="due_date">Target Due Date</option>
              <option value="progress">Completion %</option>
              <option value="budget">Valuation Budget</option>
              <option value="client_name">Client Alphabetical</option>
            </select>
          </div>
        </div>

        {/* Mobile Filter Button trigger */}
        <div className="flex lg:hidden justify-between items-center gap-2">
          <button
            onClick={() => setIsMobileFilterOpen(true)}
            className="flex items-center gap-2 px-3.5 py-2 bg-[#FCFBF8] border border-[#E9E3DA] rounded-xl text-[12.5px] font-bold text-[#111111] flex-1 justify-center"
          >
            <SlidersHorizontal size={14} />
            <span>Filters & Sorting</span>
          </button>
        </div>
      </div>

      {/* 4. MAIN PROJECTS DISPLAY (BOARD VIEW OR LIST VIEW) */}
      {processedProjects.length === 0 ? (
        /* 8. CATEGORY-SPECIFIC EMPTY STATES */
        <div className="py-20 text-center border border-dashed border-[#E9E3DA] bg-white rounded-[24px] text-[#6A6A6A] flex flex-col items-center justify-center gap-3 shadow-2xs px-4">
          <Briefcase className="text-[#A8A296]" size={40} />
          <div>
            <h3 className="text-[16px] font-bold text-[#111111]">
              {projectListTab === "Completed"
                ? "No completed projects yet"
                : projectListTab === "Not Started"
                ? "No unstarted projects"
                : projectListTab === "Ongoing"
                ? "No active ongoing projects"
                : "No matching projects found"}
            </h3>
            <p className="text-[13px] text-[#6A6A6A] mt-1 max-w-sm">
              {projectListTab === "Completed"
                ? "Projects you complete will appear here once delivered."
                : projectListTab === "Not Started"
                ? "Newly created projects waiting for sprint launch will appear here."
                : "Get started by launching a new project for your client."}
            </p>
          </div>

          <button
            onClick={() => setIsAddProjectModalOpen(true)}
            className="mt-2 flex items-center gap-2 bg-[#111111] text-white px-5 py-2.5 rounded-xl text-[13px] font-bold hover:bg-[#222222] transition-all cursor-pointer shadow-sm"
          >
            <Plus size={15} />
            <span>Add Project</span>
          </button>
        </div>
      ) : viewMode === "board" ? (
        /* BOARD VIEW: 3 PER ROW DESKTOP, 2 TABLET, 1 MOBILE */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <AnimatePresence mode="popLayout">
            {processedProjects.map((project) => {
              const fin = getProjectFinancials(project);
              const status = getProjectStatus(project);
              const isSelected = activeProject?._id === project._id;
              const overdueDays = getOverdueDays(project.expectedDelivery);
              const isOverdue = overdueDays > 0 && status !== "Completed";

              return (
                <motion.div
                  key={project._id}
                  layout
                  initial={{ opacity: 0, scale: 0.96 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.96 }}
                  transition={{ duration: 0.25 }}
                  onClick={() => setActiveClientId(project._id)}
                  className={`bg-white border rounded-[22px] p-5 transition-all duration-200 cursor-pointer shadow-2xs hover:shadow-md hover:-translate-y-0.5 group flex flex-col justify-between gap-5 relative ${
                    isSelected ? "border-[#111111] ring-2 ring-[#111111]/10" : "border-[#E9E3DA] hover:border-[#111111]/50"
                  }`}
                >
                  {/* Card Top Row: Logo + Names + Status Badge + Actions Menu */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                      <div className="w-10 h-10 rounded-xl bg-[#FCFBF8] border border-[#E9E3DA] flex items-center justify-center font-extrabold text-[13px] text-[#111111] shrink-0 shadow-2xs">
                        {project.logo || project.company.substring(0, 2).toUpperCase()}
                      </div>
                      <div className="min-w-0 flex-1">
                        <h3 className="text-[15.5px] font-extrabold text-[#111111] leading-snug truncate flex items-center gap-1.5 group-hover:text-indigo-600 transition-colors">
                          <span className="truncate">{project.company}</span>
                          <span className="text-[12px] shrink-0">{project.countryFlag}</span>
                        </h3>
                        <span className="text-[12px] text-[#6A6A6A] block mt-0.5 truncate font-medium">
                          {project.name}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0 relative">
                      {/* Priority indicator badge (if specified) */}
                      {project.priority && (
                        <span
                          className={`text-[9.5px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border ${
                            project.priority === "High"
                              ? "bg-rose-50 text-rose-700 border-rose-200"
                              : project.priority === "Low"
                              ? "bg-neutral-100 text-neutral-600 border-neutral-200"
                              : "bg-amber-50 text-amber-700 border-amber-200"
                          }`}
                        >
                          {project.priority}
                        </span>
                      )}

                      {/* 5. Meaningful Status Treatment */}
                      <span
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-mono font-extrabold uppercase tracking-wider border ${
                          status === "Completed"
                            ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                            : status === "Not Started"
                            ? "bg-[#111111]/5 text-[#6A6A6A] border-[#E9E3DA]"
                            : "bg-[#111111] text-white border-[#111111]"
                        }`}
                      >
                        {status === "Ongoing" && <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />}
                        <span>{status}</span>
                      </span>

                      {/* 11. Quick Card Action Menu (•••) */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setActiveCardMenuId(activeCardMenuId === project._id ? null : project._id);
                        }}
                        className="p-1 rounded-lg hover:bg-[#111111]/5 text-[#6A6A6A] hover:text-[#111111] transition-colors cursor-pointer"
                        title="Project options"
                      >
                        <MoreHorizontal size={16} />
                      </button>

                      {/* Floating Card Actions Popover Menu */}
                      {activeCardMenuId === project._id && (
                        <div
                          onClick={(e) => e.stopPropagation()}
                          className="absolute right-0 top-8 z-50 bg-white border border-[#E9E3DA] rounded-2xl shadow-xl p-1.5 min-w-[170px] flex flex-col gap-1 text-[12.5px] font-semibold text-[#111111]"
                        >
                          <button
                            onClick={() => {
                              setActiveCardMenuId(null);
                              setActiveClientId(project._id);
                            }}
                            className="flex items-center gap-2 px-3 py-2 rounded-xl hover:bg-[#FCFBF8] transition-colors text-left cursor-pointer"
                          >
                            <ArrowUpRight size={14} className="text-indigo-600" />
                            <span>Open Workspace</span>
                          </button>

                          <button
                            onClick={(e) => openEditModal(project, e)}
                            className="flex items-center gap-2 px-3 py-2 rounded-xl hover:bg-[#FCFBF8] transition-colors text-left cursor-pointer"
                          >
                            <Edit2 size={14} className="text-amber-600" />
                            <span>Edit Details</span>
                          </button>

                          {/* 12. Quick Status Change Submenu */}
                          <div className="border-t border-[#E9E3DA] my-1 pt-1">
                            <span className="px-3 py-1 text-[10px] font-mono font-bold text-[#A8A296] uppercase tracking-wider block">
                              Change Status
                            </span>
                            <button
                              onClick={(e) => handleQuickStatusChange(project, "Not Started", e)}
                              className={`w-full flex items-center justify-between px-3 py-1.5 rounded-lg hover:bg-[#FCFBF8] text-[11.5px] ${
                                status === "Not Started" ? "font-extrabold text-indigo-600" : "font-medium"
                              }`}
                            >
                              <span>Not Started</span>
                              {status === "Not Started" && <Check size={12} />}
                            </button>

                            <button
                              onClick={(e) => handleQuickStatusChange(project, "Ongoing", e)}
                              className={`w-full flex items-center justify-between px-3 py-1.5 rounded-lg hover:bg-[#FCFBF8] text-[11.5px] ${
                                status === "Ongoing" ? "font-extrabold text-indigo-600" : "font-medium"
                              }`}
                            >
                              <span>Ongoing</span>
                              {status === "Ongoing" && <Check size={12} />}
                            </button>

                            <button
                              onClick={(e) => handleQuickStatusChange(project, "Completed", e)}
                              className={`w-full flex items-center justify-between px-3 py-1.5 rounded-lg hover:bg-[#FCFBF8] text-[11.5px] ${
                                status === "Completed" ? "font-extrabold text-emerald-600" : "font-medium"
                              }`}
                            >
                              <span>Completed</span>
                              {status === "Completed" && <Check size={12} />}
                            </button>
                          </div>

                          <div className="border-t border-[#E9E3DA] pt-1">
                            <button
                              onClick={(e) => handleDuplicateProject(project, e)}
                              className="flex items-center gap-2 px-3 py-2 rounded-xl hover:bg-[#FCFBF8] transition-colors text-left cursor-pointer w-full"
                            >
                              <Copy size={14} className="text-blue-600" />
                              <span>Duplicate</span>
                            </button>

                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setActiveCardMenuId(null);
                                if (confirm(`Are you sure you want to delete ${project.company}?`)) {
                                  deleteClient(project._id);
                                }
                              }}
                              className="flex items-center gap-2 px-3 py-2 rounded-xl hover:bg-rose-50 text-rose-600 transition-colors text-left cursor-pointer w-full"
                            >
                              <Trash2 size={14} />
                              <span>Delete</span>
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* 7. Progress Bar UX */}
                  <div className="flex flex-col gap-2">
                    <div className="flex justify-between items-baseline">
                      <span className="text-[11px] font-mono font-extrabold uppercase tracking-wider text-[#6A6A6A]">
                        Progress
                      </span>
                      <span className="text-[13px] font-mono font-extrabold text-[#111111]">
                        {status === "Completed" ? "100% · Completed" : `${project.progress}%`}
                      </span>
                    </div>

                    <div className="w-full h-2.5 bg-[#111111]/5 rounded-full overflow-hidden border border-[#E9E3DA]/60">
                      <motion.div
                        className={`h-full rounded-full ${status === "Completed" ? "bg-emerald-500" : "bg-[#111111]"}`}
                        initial={{ width: 0 }}
                        animate={{ width: `${project.progress}%` }}
                        transition={{ duration: 0.5 }}
                      />
                    </div>
                  </div>

                  {/* Target Date, Overdue Indicator, and Valuation Budget */}
                  <div className="flex items-center justify-between text-[12px] font-semibold text-[#111111] flex-wrap gap-2 pt-1 border-t border-[#E9E3DA]/60">
                    <div className="flex items-center gap-2">
                      <span className="text-[#6A6A6A] flex items-center gap-1 font-mono">
                        <Clock size={13} className="text-[#A8A296]" />
                        <span>Due {formatDate(project.expectedDelivery)}</span>
                      </span>

                      {/* Overdue Warning Style Badge */}
                      {isOverdue && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-rose-50 text-rose-700 border border-rose-200">
                          <AlertCircle size={10} />
                          <span>Overdue by {overdueDays}d</span>
                        </span>
                      )}
                    </div>

                    <span className="font-mono font-extrabold text-[#111111]">
                      {formatCurrency(fin.cost)} Budget
                    </span>
                  </div>

                  {/* Financial Summary Pill */}
                  <div className="bg-[#FCFBF8] border border-[#E9E3DA] rounded-xl px-3 py-2 text-[11.5px] font-mono font-semibold text-[#6A6A6A] flex items-center justify-between">
                    <span>
                      Received <strong className="text-emerald-700 font-bold">{formatCurrency(fin.received)}</strong>
                    </span>
                    <span className="text-[#A8A296]">•</span>
                    <span>
                      Expenses <strong className="text-rose-600 font-bold">{formatCurrency(fin.expenses)}</strong>
                    </span>
                  </div>

                  {/* Card Bottom CTA */}
                  <div className="flex items-center justify-between text-[12px] font-extrabold text-indigo-600 pt-1 group-hover:translate-x-0.5 transition-transform">
                    <span className="flex items-center gap-1">
                      <span>Open Workspace</span>
                      <ArrowUpRight size={14} />
                    </span>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      ) : (
        /* LIST VIEW TABLE LAYOUT */
        <div className="bg-white border border-[#E9E3DA] rounded-[22px] overflow-hidden shadow-2xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-[#FCFBF8] border-b border-[#E9E3DA] text-[11px] font-mono uppercase text-[#6A6A6A] tracking-wider">
                  <th className="py-3.5 px-5 font-bold">Project & Client</th>
                  <th className="py-3.5 px-5 font-bold">Status</th>
                  <th className="py-3.5 px-5 font-bold">Progress</th>
                  <th className="py-3.5 px-5 font-bold">Budget</th>
                  <th className="py-3.5 px-5 font-bold">Due Date</th>
                  <th className="py-3.5 px-5 font-bold">Assigned Lead</th>
                  <th className="py-3.5 px-5 font-bold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E9E3DA]/60 text-[13px] font-semibold text-[#111111]">
                {processedProjects.map((project) => {
                  const fin = getProjectFinancials(project);
                  const status = getProjectStatus(project);
                  const overdueDays = getOverdueDays(project.expectedDelivery);
                  const isOverdue = overdueDays > 0 && status !== "Completed";

                  return (
                    <tr
                      key={project._id}
                      onClick={() => setActiveClientId(project._id)}
                      className="hover:bg-[#FCFBF8] transition-colors cursor-pointer"
                    >
                      {/* Project & Client */}
                      <td className="py-4 px-5">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-xl bg-[#FCFBF8] border border-[#E9E3DA] flex items-center justify-center font-extrabold text-[12px] text-[#111111] shrink-0">
                            {project.logo || project.company.substring(0, 2).toUpperCase()}
                          </div>
                          <div className="flex flex-col truncate">
                            <span className="font-extrabold text-[#111111] truncate flex items-center gap-1">
                              <span>{project.company}</span>
                              <span className="text-[11px]">{project.countryFlag}</span>
                            </span>
                            <span className="text-[11.5px] text-[#6A6A6A] font-medium truncate">{project.name}</span>
                          </div>
                        </div>
                      </td>

                      {/* Status */}
                      <td className="py-4 px-5">
                        <select
                          value={status}
                          onClick={(e) => e.stopPropagation()}
                          onChange={(e) => handleQuickStatusChange(project, e.target.value as any)}
                          className={`px-2.5 py-1 rounded-full text-[10px] font-mono font-extrabold uppercase tracking-wider border outline-none cursor-pointer ${
                            status === "Completed"
                              ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                              : status === "Not Started"
                              ? "bg-[#111111]/5 text-[#6A6A6A] border-[#E9E3DA]"
                              : "bg-[#111111] text-white border-[#111111]"
                          }`}
                        >
                          <option value="Not Started" className="bg-white text-black">Not Started</option>
                          <option value="Ongoing" className="bg-white text-black">Ongoing</option>
                          <option value="Completed" className="bg-white text-black">Completed</option>
                        </select>
                      </td>

                      {/* Progress */}
                      <td className="py-4 px-5 min-w-[140px]">
                        <div className="flex flex-col gap-1">
                          <span className="text-[11.5px] font-mono font-extrabold text-[#111111]">
                            {project.progress}%
                          </span>
                          <div className="w-28 h-2 bg-[#111111]/5 rounded-full overflow-hidden border border-[#E9E3DA]">
                            <div
                              className={`h-full rounded-full ${status === "Completed" ? "bg-emerald-500" : "bg-[#111111]"}`}
                              style={{ width: `${project.progress}%` }}
                            />
                          </div>
                        </div>
                      </td>

                      {/* Budget */}
                      <td className="py-4 px-5 font-mono font-extrabold text-[#111111]">
                        {formatCurrency(fin.cost)}
                      </td>

                      {/* Due Date */}
                      <td className="py-4 px-5">
                        <div className="flex flex-col">
                          <span className="font-mono text-[12px]">{formatDate(project.expectedDelivery)}</span>
                          {isOverdue && (
                            <span className="text-[10px] font-mono font-bold text-rose-600">
                              Overdue ({overdueDays}d)
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Assigned Lead */}
                      <td className="py-4 px-5 text-[#6A6A6A] font-medium">
                        {project.assignee || "Admin"}
                      </td>

                      {/* Actions */}
                      <td className="py-4 px-5 text-right">
                        <div className="flex items-center justify-end gap-2" onClick={(e) => e.stopPropagation()}>
                          <button
                            onClick={() => setActiveClientId(project._id)}
                            className="px-3 py-1.5 rounded-lg border border-[#E9E3DA] text-[12px] font-bold hover:bg-[#111111] hover:text-white transition-all cursor-pointer"
                          >
                            Workspace
                          </button>
                          <button
                            onClick={(e) => openEditModal(project, e)}
                            className="p-1.5 hover:bg-[#111111]/5 rounded-lg text-[#111111] cursor-pointer"
                            title="Edit"
                          >
                            <Edit2 size={15} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 5. EXPANDED ACTIVE PROJECT DETAILED WORKSPACE DRAWER / MODAL */}
      {activeProject && (
        <div className="bg-white border border-[#E9E3DA] rounded-[24px] p-6 shadow-xl flex flex-col gap-6 mt-4">
          {/* Workspace Top Action Bar */}
          <div className="flex items-center justify-between flex-wrap gap-4 border-b border-[#E9E3DA] pb-5">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-[#FCFBF8] border border-[#E9E3DA] flex items-center justify-center font-extrabold text-[16px] text-[#111111]">
                {activeProject.logo || activeProject.company.substring(0, 2).toUpperCase()}
              </div>
              <div>
                <h3 className="text-[20px] font-extrabold text-[#111111] leading-tight flex items-center gap-2">
                  <span>{activeProject.company} Workspace</span>
                  <span className="text-[14px]">{activeProject.countryFlag}</span>
                </h3>
                <span className="text-[12px] text-[#6A6A6A]">
                  Client: {activeProject.name} · Lead Architect: {activeProject.assignee}
                </span>
              </div>
            </div>

            {/* Navigation Tabs & Actions inside Project */}
            <div className="flex items-center gap-3">
              <button
                onClick={(e) => openEditModal(activeProject, e)}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-[#E9E3DA] text-[#111111] hover:bg-[#FCFBF8] text-[12px] font-bold transition-all cursor-pointer shadow-xs"
              >
                <Edit2 size={13} />
                <span>Edit Budget & Info</span>
              </button>

              <button
                onClick={() => {
                  if (confirm("Are you sure you want to permanently delete this project?")) {
                    deleteClient(activeProject._id);
                  }
                }}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-red-200 text-red-600 hover:bg-red-50 text-[12px] font-bold transition-all cursor-pointer shadow-xs"
              >
                <Trash2 size={13} />
                <span>Delete Project</span>
              </button>

              <div className="flex items-center gap-1.5 bg-[#FCFBF8] border border-[#E9E3DA] p-1 rounded-xl">
                <button
                  onClick={() => setActiveTab("checklist")}
                  className={`px-3.5 py-1.5 rounded-lg text-[12.5px] font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                    activeTab === "checklist" ? "bg-[#111111] text-white" : "text-[#6A6A6A] hover:text-[#111111]"
                  }`}
                >
                  <CheckSquare size={14} />
                  <span>Task Checklist</span>
                </button>
                <button
                  onClick={() => setActiveTab("expenses")}
                  className={`px-3.5 py-1.5 rounded-lg text-[12.5px] font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                    activeTab === "expenses" ? "bg-[#111111] text-white" : "text-[#6A6A6A] hover:text-[#111111]"
                  }`}
                >
                  <Receipt size={14} />
                  <span>Expense Manager</span>
                </button>
                <button
                  onClick={() => setActiveTab("payments")}
                  className={`px-3.5 py-1.5 rounded-lg text-[12.5px] font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                    activeTab === "payments" ? "bg-[#111111] text-white" : "text-[#6A6A6A] hover:text-[#111111]"
                  }`}
                >
                  <IndianRupee size={14} />
                  <span>Revenue & Payments</span>
                </button>
                <button
                  onClick={() => setActiveTab("financials")}
                  className={`px-3.5 py-1.5 rounded-lg text-[12.5px] font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                    activeTab === "financials" ? "bg-[#111111] text-white" : "text-[#6A6A6A] hover:text-[#111111]"
                  }`}
                >
                  <TrendingUp size={14} />
                  <span>Financial Breakdown</span>
                </button>
              </div>
            </div>
          </div>

          {/* TAB 1: TASK CHECKLIST SYSTEM */}
          {activeTab === "checklist" && (
            <div className="flex flex-col gap-6">
              {/* Add New Task Form */}
              <form onSubmit={handleAddTask} className="bg-[#FCFBF8] border border-[#E9E3DA] p-4 rounded-2xl flex flex-col gap-3">
                <span className="text-[12px] font-mono uppercase font-bold text-[#6A6A6A]">Add Checklist Task</span>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <input
                    type="text"
                    placeholder="Task title (e.g. Redesign Navbar UI)"
                    value={newTaskTitle}
                    onChange={(e) => setNewTaskTitle(e.target.value)}
                    className="bg-white border border-[#E9E3DA] rounded-xl px-3.5 py-2 text-[13px] text-[#111111] sm:col-span-2 focus:outline-none focus:border-[#111111]"
                    required
                  />
                  <div className="flex items-center gap-2">
                    <select
                      value={newTaskPriority}
                      onChange={(e) => setNewTaskPriority(e.target.value as any)}
                      className="bg-white border border-[#E9E3DA] rounded-xl px-3 py-2 text-[12.5px] font-bold text-[#111111] focus:outline-none"
                    >
                      <option value="High">High Priority</option>
                      <option value="Medium">Medium Priority</option>
                      <option value="Low">Low Priority</option>
                    </select>
                    <button
                      type="submit"
                      className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-xl text-[13px] font-bold transition-all cursor-pointer shadow-xs flex items-center gap-1 shrink-0"
                    >
                      <Plus size={15} />
                      <span>Add Task</span>
                    </button>
                  </div>
                </div>
              </form>

              {/* Task Checklist Items */}
              <div className="flex flex-col gap-3">
                {(activeProject.tasks || []).map((task, idx) => {
                  const isDone = task.status === "Completed" || task.completed;
                  const subtasks = task.subtasks || [];
                  const subDone = subtasks.filter((s) => s.completed).length;

                  return (
                    <div
                      key={task._id || idx}
                      className={`border rounded-2xl p-4 transition-all ${
                        isDone ? "bg-[#FCFBF8] border-[#E9E3DA]/80 opacity-80" : "bg-white border-[#E9E3DA] shadow-xs"
                      }`}
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex items-start gap-3 min-w-0 flex-1">
                          <button
                            onClick={() => toggleTask(activeProject._id, task._id)}
                            className={`w-5 h-5 rounded-md border flex items-center justify-center transition-all mt-0.5 cursor-pointer ${
                              isDone ? "bg-emerald-500 border-emerald-500 text-white" : "border-[#9CA3AF] bg-white hover:border-[#111111]"
                            }`}
                          >
                            {isDone && <Check size={13} strokeWidth={3} />}
                          </button>
                          <div className="min-w-0 flex-1">
                            <h4 className={`text-[14px] font-bold ${isDone ? "line-through text-[#6A6A6A]" : "text-[#111111]"}`}>
                              {task.title}
                            </h4>
                            {task.description && (
                              <p className="text-[12px] text-[#6A6A6A] mt-0.5">{task.description}</p>
                            )}
                            {/* Metadata */}
                            <div className="flex items-center gap-4 text-[11px] text-[#6A6A6A] mt-2 font-mono flex-wrap">
                              <span className="px-2 py-0.5 rounded bg-slate-100 font-bold border border-slate-200">
                                Assignee: {task.assignee}
                              </span>
                              {task.dueDate && <span>Due: {task.dueDate}</span>}
                              {subtasks.length > 0 && (
                                <span className="text-indigo-600 font-bold">
                                  Subtasks: {subDone}/{subtasks.length}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                          <span
                            className={`px-2.5 py-0.5 rounded text-[10px] font-mono font-bold uppercase tracking-wider ${
                              task.priority === "High"
                                ? "bg-red-50 text-red-600 border border-red-100"
                                : "bg-amber-50 text-amber-600 border border-amber-100"
                            }`}
                          >
                            {task.priority}
                          </span>
                          <button
                            onClick={() => deleteTask(activeProject._id, task._id)}
                            className="p-1 rounded text-[#9CA3AF] hover:text-red-600 hover:bg-red-50 cursor-pointer"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </div>

                      {/* Nested Subtasks List */}
                      <div className="mt-3 pt-3 border-t border-[#E9E3DA]/60 pl-8 flex flex-col gap-2">
                        {subtasks.map((sub, sIdx) => (
                          <div key={sIdx} className="flex items-center gap-2 text-[12.5px]">
                            <button
                              onClick={() => handleToggleSubtask(task._id, sIdx)}
                              className={`w-4 h-4 rounded border flex items-center justify-center cursor-pointer ${
                                sub.completed ? "bg-emerald-500 border-emerald-500 text-white" : "border-[#9CA3AF]"
                              }`}
                            >
                              {sub.completed && <Check size={10} strokeWidth={3} />}
                            </button>
                            <span className={sub.completed ? "line-through text-[#6A6A6A]" : "text-[#111111]"}>
                              {sub.title}
                            </span>
                          </div>
                        ))}

                        {/* Add Subtask input inline */}
                        <div className="flex items-center gap-2 mt-1">
                          <input
                            type="text"
                            placeholder="+ Add nested subtask..."
                            value={newSubtaskTitle[task._id] || ""}
                            onChange={(e) =>
                              setNewSubtaskTitle({ ...newSubtaskTitle, [task._id]: e.target.value })
                            }
                            onKeyDown={(e) => {
                              if (e.key === "Enter") {
                                e.preventDefault();
                                handleAddSubtask(task._id);
                              }
                            }}
                            className="bg-[#FCFBF8] border border-[#E9E3DA] rounded-lg px-2.5 py-1 text-[12px] text-[#111111] flex-1 focus:outline-none"
                          />
                          <button
                            type="button"
                            onClick={() => handleAddSubtask(task._id)}
                            className="text-[11px] font-bold text-indigo-600 hover:underline px-2 cursor-pointer"
                          >
                            Add
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}

                {(activeProject.tasks || []).length === 0 && (
                  <div className="p-8 text-center bg-[#FCFBF8] border border-[#E9E3DA] rounded-2xl text-[#6A6A6A]">
                    <CheckSquare className="mx-auto text-[#6A6A6A]/30 mb-2" size={32} />
                    <p className="text-[13px] font-bold">No tasks added to checklist yet.</p>
                    <p className="text-[11px] text-[#6A6A6A] mt-0.5">Use the form above to add project milestones.</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 2: EXPENSE MANAGER INSIDE PROJECT */}
          {activeTab === "expenses" && (
            <div className="flex flex-col gap-6">
              <form onSubmit={handleAddExpenseSubmit} className="bg-[#FCFBF8] border border-[#E9E3DA] p-4 rounded-2xl flex flex-col gap-3">
                <span className="text-[12px] font-mono uppercase font-bold text-red-600">Add Project Expense</span>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <input
                    type="text"
                    placeholder="Expense title (e.g. Domain Purchase)"
                    value={expName}
                    onChange={(e) => setExpName(e.target.value)}
                    className="bg-white border border-[#E9E3DA] rounded-xl px-3.5 py-2 text-[13px] text-[#111111]"
                    required
                  />
                  <input
                    type="text"
                    placeholder="Category (e.g. Software, Material)"
                    value={expCategory}
                    onChange={(e) => setExpCategory(e.target.value)}
                    className="bg-white border border-[#E9E3DA] rounded-xl px-3.5 py-2 text-[13px] text-[#111111]"
                    required
                  />
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      placeholder={`Amount (${settings.currency})`}
                      value={expAmount}
                      onChange={(e) => setExpAmount(e.target.value)}
                      className="bg-white border border-[#E9E3DA] rounded-xl px-3.5 py-2 text-[13px] font-mono font-bold text-[#111111] flex-1"
                      required
                    />
                    <button
                      type="submit"
                      className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-xl text-[13px] font-bold transition-all cursor-pointer shadow-xs shrink-0"
                    >
                      Save Expense
                    </button>
                  </div>
                </div>
              </form>

              <div className="bg-white border border-[#E9E3DA] rounded-2xl overflow-hidden shadow-xs">
                <table className="w-full text-left text-[13px]">
                  <thead>
                    <tr className="bg-[#FCFBF8] border-b border-[#E9E3DA] text-[11px] font-mono uppercase text-[#6A6A6A]">
                      <th className="py-3 px-4 font-bold">Date</th>
                      <th className="py-3 px-4 font-bold">Title</th>
                      <th className="py-3 px-4 font-bold">Category</th>
                      <th className="py-3 px-4 font-bold">Vendor</th>
                      <th className="py-3 px-4 font-bold text-right">Amount</th>
                      <th className="py-3 px-4 font-bold text-center">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#E9E3DA]/60">
                    {(activeProject.expenses || []).map((exp) => (
                      <tr key={exp._id} className="hover:bg-[#FCFBF8]">
                        <td className="py-3 px-4 font-mono text-[12px] text-[#6A6A6A]">{exp.date}</td>
                        <td className="py-3 px-4 font-bold text-[#111111]">{exp.name}</td>
                        <td className="py-3 px-4">
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-red-50 text-red-600 border border-red-100 uppercase font-mono">
                            {exp.category}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-[#6A6A6A]">{exp.vendor || "—"}</td>
                        <td className="py-3 px-4 text-right font-extrabold text-red-600">{formatCurrency(exp.amount)}</td>
                        <td className="py-3 px-4 text-center">
                          <button
                            onClick={() => deleteExpense(activeProject._id, exp._id)}
                            className="p-1 text-[#9CA3AF] hover:text-red-600 cursor-pointer"
                          >
                            <Trash2 size={14} />
                          </button>
                        </td>
                      </tr>
                    ))}
                    {(activeProject.expenses || []).length === 0 && (
                      <tr>
                        <td colSpan={6} className="py-8 text-center text-[#6A6A6A] italic">
                          No expenses recorded for this project yet.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 3: REVENUE & PAYMENTS INSIDE PROJECT */}
          {activeTab === "payments" && (
            <div className="flex flex-col gap-6">
              <form onSubmit={handleAddPaymentSubmit} className="bg-[#FCFBF8] border border-[#E9E3DA] p-4 rounded-2xl flex flex-col gap-3">
                <span className="text-[12px] font-mono uppercase font-bold text-emerald-600">Record Client Payment</span>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <input
                    type="number"
                    placeholder={`Amount (${settings.currency})`}
                    value={payAmount}
                    onChange={(e) => setPayAmount(e.target.value)}
                    className="bg-white border border-[#E9E3DA] rounded-xl px-3.5 py-2 text-[13px] font-mono font-bold text-[#111111]"
                    required
                  />
                  <input
                    type="text"
                    placeholder="Reference UTR Number"
                    value={payRef}
                    onChange={(e) => setPayRef(e.target.value)}
                    className="bg-white border border-[#E9E3DA] rounded-xl px-3.5 py-2 text-[13px] text-[#111111]"
                  />
                  <div className="flex items-center gap-2">
                    <input
                      type="date"
                      value={payDate}
                      onChange={(e) => setPayDate(e.target.value)}
                      className="bg-white border border-[#E9E3DA] rounded-xl px-3.5 py-2 text-[13px] text-[#111111] flex-1"
                    />
                    <button
                      type="submit"
                      className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-xl text-[13px] font-bold transition-all cursor-pointer shadow-xs shrink-0"
                    >
                      Record Payment
                    </button>
                  </div>
                </div>
              </form>

              <div className="bg-white border border-[#E9E3DA] rounded-2xl overflow-hidden shadow-xs">
                <table className="w-full text-left text-[13px]">
                  <thead>
                    <tr className="bg-[#FCFBF8] border-b border-[#E9E3DA] text-[11px] font-mono uppercase text-[#6A6A6A]">
                      <th className="py-3 px-4 font-bold">Payment Date</th>
                      <th className="py-3 px-4 font-bold">Reference UTR</th>
                      <th className="py-3 px-4 font-bold">Method</th>
                      <th className="py-3 px-4 font-bold text-right">Amount Received</th>
                      <th className="py-3 px-4 font-bold text-center">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#E9E3DA]/60">
                    {(activeProject.payments || []).map((pay) => (
                      <tr key={pay._id} className="hover:bg-[#FCFBF8]">
                        <td className="py-3 px-4 font-mono text-[12px] text-[#6A6A6A]">{pay.paymentDate}</td>
                        <td className="py-3 px-4 font-mono font-bold text-[#111111]">{pay.referenceNumber || "N/A"}</td>
                        <td className="py-3 px-4 text-[#6A6A6A]">{pay.paymentMethod}</td>
                        <td className="py-3 px-4 text-right font-extrabold text-emerald-600">+{formatCurrency(pay.amount)}</td>
                        <td className="py-3 px-4 text-center">
                          <button
                            onClick={() => deletePayment(activeProject._id, pay._id)}
                            className="p-1 text-[#9CA3AF] hover:text-red-600 cursor-pointer"
                          >
                            <Trash2 size={14} />
                          </button>
                        </td>
                      </tr>
                    ))}
                    {(activeProject.payments || []).length === 0 && (
                      <tr>
                        <td colSpan={5} className="py-8 text-center text-[#6A6A6A] italic">
                          No payments recorded for this project yet.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 4: FINANCIAL BREAKDOWN */}
          {activeTab === "financials" && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {(() => {
                const fin = getProjectFinancials(activeProject);
                return (
                  <>
                    <div className="bg-[#FCFBF8] border border-[#E9E3DA] p-4 rounded-2xl">
                      <span className="text-[10.5px] font-mono uppercase font-bold text-[#6A6A6A]">Project Cost</span>
                      <div className="text-[20px] font-extrabold text-[#111111] mt-1">{formatCurrency(fin.cost)}</div>
                    </div>
                    <div className="bg-[#FCFBF8] border border-[#E9E3DA] p-4 rounded-2xl">
                      <span className="text-[10.5px] font-mono uppercase font-bold text-[#6A6A6A]">Amount Received</span>
                      <div className="text-[20px] font-extrabold text-emerald-600 mt-1">{formatCurrency(fin.received)}</div>
                    </div>
                    <div className="bg-[#FCFBF8] border border-[#E9E3DA] p-4 rounded-2xl">
                      <span className="text-[10.5px] font-mono uppercase font-bold text-[#6A6A6A]">Pending Balance</span>
                      <div className="text-[20px] font-extrabold text-red-600 mt-1">{formatCurrency(fin.pendingAmount)}</div>
                    </div>
                    <div className="bg-[#FCFBF8] border border-[#E9E3DA] p-4 rounded-2xl">
                      <span className="text-[10.5px] font-mono uppercase font-bold text-[#6A6A6A]">Net Profit</span>
                      <div className="text-[20px] font-extrabold text-purple-600 mt-1">{formatCurrency(fin.profit)}</div>
                    </div>
                  </>
                );
              })()}
            </div>
          )}
        </div>
      )}

      {/* LAUNCH NEW PROJECT MODAL */}
      {isAddProjectModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl p-6 max-w-lg w-full shadow-2xl border border-[#E9E3DA] flex flex-col gap-5">
            <div className="flex items-center justify-between border-b border-[#E9E3DA] pb-3">
              <h3 className="text-[16px] font-extrabold text-[#111111]">Launch New Project</h3>
              <button onClick={() => setIsAddProjectModalOpen(false)} className="p-1 rounded text-[#6A6A6A]">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleCreateProject} className="flex flex-col gap-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-1">
                  <label className="text-[11px] font-mono uppercase font-bold text-[#6A6A6A]">Company / Project</label>
                  <input
                    type="text"
                    placeholder="e.g. Haramain Luxury"
                    value={newProjectCompany}
                    onChange={(e) => setNewProjectCompany(e.target.value)}
                    className="bg-[#FCFBF8] border border-[#E9E3DA] rounded-xl p-2.5 text-[13px] text-[#111111]"
                    required
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-[11px] font-mono uppercase font-bold text-[#6A6A6A]">Client Contact</label>
                  <input
                    type="text"
                    placeholder="e.g. Mohammad Al-Mansoori"
                    value={newProjectName}
                    onChange={(e) => setNewProjectName(e.target.value)}
                    className="bg-[#FCFBF8] border border-[#E9E3DA] rounded-xl p-2.5 text-[13px] text-[#111111]"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-1">
                  <label className="text-[11px] font-mono uppercase font-bold text-[#6A6A6A]">Budget ({settings.currency})</label>
                  <input
                    type="number"
                    placeholder="e.g. 1200000"
                    value={newProjectBudget}
                    onChange={(e) => setNewProjectBudget(e.target.value)}
                    className="bg-[#FCFBF8] border border-[#E9E3DA] rounded-xl p-2.5 text-[13px] font-mono font-bold text-[#111111]"
                    required
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-[11px] font-mono uppercase font-bold text-[#6A6A6A]">Lead Architect</label>
                  <input
                    type="text"
                    value={newProjectAssignee}
                    onChange={(e) => setNewProjectAssignee(e.target.value)}
                    className="bg-[#FCFBF8] border border-[#E9E3DA] rounded-xl p-2.5 text-[13px] text-[#111111]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-1">
                  <label className="text-[11px] font-mono uppercase font-bold text-[#6A6A6A]">Start Date</label>
                  <input
                    type="date"
                    value={newProjectStartDate}
                    onChange={(e) => setNewProjectStartDate(e.target.value)}
                    className="bg-[#FCFBF8] border border-[#E9E3DA] rounded-xl p-2.5 text-[13px] text-[#111111]"
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-[11px] font-mono uppercase font-bold text-[#6A6A6A]">Target Deadline</label>
                  <input
                    type="date"
                    value={newProjectDeadline}
                    onChange={(e) => setNewProjectDeadline(e.target.value)}
                    className="bg-[#FCFBF8] border border-[#E9E3DA] rounded-xl p-2.5 text-[13px] text-[#111111]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-1">
                  <label className="text-[11px] font-mono uppercase font-bold text-[#6A6A6A]">Status</label>
                  <select
                    value={newProjectStatus}
                    onChange={(e) => setNewProjectStatus(e.target.value as any)}
                    className="bg-[#FCFBF8] border border-[#E9E3DA] rounded-xl p-2.5 text-[13px] text-[#111111] focus:outline-none"
                  >
                    <option value="Not Started">Not Started</option>
                    <option value="Ongoing">Ongoing</option>
                    <option value="Completed">Completed</option>
                  </select>
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-[11px] font-mono uppercase font-bold text-[#6A6A6A]">Priority</label>
                  <select
                    value={newProjectPriority}
                    onChange={(e) => setNewProjectPriority(e.target.value as any)}
                    className="bg-[#FCFBF8] border border-[#E9E3DA] rounded-xl p-2.5 text-[13px] text-[#111111] focus:outline-none"
                  >
                    <option value="High">High</option>
                    <option value="Medium">Medium</option>
                    <option value="Low">Low</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-[#E9E3DA]">
                <button
                  type="button"
                  onClick={() => setIsAddProjectModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl text-[13px] font-bold text-[#6A6A6A] hover:bg-[#F3F4F6]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl text-[13px] font-bold bg-[#111111] hover:bg-[#222222] text-white shadow-sm cursor-pointer"
                >
                  Create Project
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* EDIT BUDGET & PROJECT DETAILS MODAL */}
      {editingProject && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl border border-[#E9E3DA] flex flex-col gap-5">
            <div className="flex items-center justify-between border-b border-[#E9E3DA] pb-3">
              <h3 className="text-[16px] font-extrabold text-[#111111]">Edit Project & Budget</h3>
              <button onClick={() => setEditingProject(null)} className="p-1 rounded text-[#6A6A6A] hover:bg-gray-100 cursor-pointer">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSaveEditProject} className="flex flex-col gap-4">
              <div className="flex flex-col gap-1">
                <label className="text-[11px] font-mono uppercase font-bold text-[#6A6A6A]">Project Budget ({settings.currency})</label>
                <input
                  type="number"
                  placeholder="e.g. 15000"
                  value={editBudget}
                  onChange={(e) => setEditBudget(e.target.value)}
                  className="bg-[#FCFBF8] border border-[#E9E3DA] rounded-xl p-2.5 text-[14px] font-mono font-extrabold text-[#111111] focus:outline-none focus:border-[#111111]"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-1">
                  <label className="text-[11px] font-mono uppercase font-bold text-[#6A6A6A]">Company / Project</label>
                  <input
                    type="text"
                    value={editCompany}
                    onChange={(e) => setEditCompany(e.target.value)}
                    className="bg-[#FCFBF8] border border-[#E9E3DA] rounded-xl p-2.5 text-[13px] text-[#111111]"
                    required
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-[11px] font-mono uppercase font-bold text-[#6A6A6A]">Client Contact</label>
                  <input
                    type="text"
                    value={editClientName}
                    onChange={(e) => setEditClientName(e.target.value)}
                    className="bg-[#FCFBF8] border border-[#E9E3DA] rounded-xl p-2.5 text-[13px] text-[#111111]"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-1">
                  <label className="text-[11px] font-mono uppercase font-bold text-[#6A6A6A]">Status</label>
                  <select
                    value={editStatus}
                    onChange={(e) => {
                      const nextStatus = e.target.value as any;
                      setEditStatus(nextStatus);
                      if (nextStatus === "Completed") {
                        setEditProgress(100);
                        setEditStage("Completed");
                      } else if (nextStatus === "Not Started") {
                        setEditProgress(0);
                        setEditStage("Lead Created");
                      } else {
                        if (editProgress === 0 || editProgress === 100) {
                          setEditProgress(10);
                        }
                        setEditStage("Development");
                      }
                    }}
                    className="bg-[#FCFBF8] border border-[#E9E3DA] rounded-xl p-2.5 text-[13px] text-[#111111] focus:outline-none"
                  >
                    <option value="Not Started">Not Started</option>
                    <option value="Ongoing">Ongoing</option>
                    <option value="Completed">Completed</option>
                  </select>
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-[11px] font-mono uppercase font-bold text-[#6A6A6A]">Priority</label>
                  <select
                    value={editPriority}
                    onChange={(e) => setEditPriority(e.target.value as any)}
                    className="bg-[#FCFBF8] border border-[#E9E3DA] rounded-xl p-2.5 text-[13px] text-[#111111] focus:outline-none"
                  >
                    <option value="High">High</option>
                    <option value="Medium">Medium</option>
                    <option value="Low">Low</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-1">
                  <label className="text-[11px] font-mono uppercase font-bold text-[#6A6A6A]">Lifecycle Stage</label>
                  <input
                    type="text"
                    value={editStage}
                    onChange={(e) => setEditStage(e.target.value)}
                    className="bg-[#FCFBF8] border border-[#E9E3DA] rounded-xl p-2.5 text-[13px] text-[#111111]"
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-[11px] font-mono uppercase font-bold text-[#6A6A6A]">Deadline</label>
                  <input
                    type="date"
                    value={editDeadline}
                    onChange={(e) => setEditDeadline(e.target.value)}
                    className="bg-[#FCFBF8] border border-[#E9E3DA] rounded-xl p-2.5 text-[13px] text-[#111111]"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <div className="flex justify-between items-center">
                  <label className="text-[11px] font-mono uppercase font-bold text-[#6A6A6A]">Project Progress</label>
                  <span className="text-[12.5px] font-mono font-extrabold text-indigo-600">{editProgress}%</span>
                </div>
                <div className="flex items-center gap-4">
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={editProgress}
                    onChange={(e) => setEditProgress(parseInt(e.target.value) || 0)}
                    className="flex-1 accent-indigo-600 h-2 bg-gray-100 rounded-lg appearance-none cursor-pointer"
                  />
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={editProgress}
                    onChange={(e) => {
                      const val = Math.min(100, Math.max(0, parseInt(e.target.value) || 0));
                      setEditProgress(val);
                    }}
                    className="w-16 bg-[#FCFBF8] border border-[#E9E3DA] rounded-xl p-2 text-center text-[13px] font-mono font-extrabold text-[#111111] focus:outline-none"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-[#E9E3DA]">
                <button
                  type="button"
                  onClick={() => setEditingProject(null)}
                  className="px-4 py-2.5 rounded-xl text-[13px] font-bold text-[#6A6A6A] hover:bg-[#F3F4F6] cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl text-[13px] font-bold bg-[#111111] hover:bg-[#222222] text-white shadow-sm cursor-pointer"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MOBILE FILTERS & SORTING BOTTOM SHEET */}
      {isMobileFilterOpen && (
        <div className="fixed inset-0 z-50 flex flex-col justify-end bg-black/40 backdrop-blur-sm lg:hidden">
          <div className="bg-white rounded-t-3xl p-6 shadow-2xl border-t border-[#E9E3DA] flex flex-col gap-5 max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-[#E9E3DA] pb-3">
              <h3 className="text-[16px] font-extrabold text-[#111111] flex items-center gap-2">
                <SlidersHorizontal size={16} />
                <span>Filters & Sorting</span>
              </h3>
              <button onClick={() => setIsMobileFilterOpen(false)} className="p-1 rounded text-[#6A6A6A]">
                <X size={18} />
              </button>
            </div>

            <div className="flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-[11px] font-mono font-bold uppercase text-[#6A6A6A]">Sort By</label>
                <select
                  value={sortOption}
                  onChange={(e) => setSortOption(e.target.value as any)}
                  className="h-11 px-3 bg-[#FCFBF8] border border-[#E9E3DA] rounded-xl text-[13px] font-bold text-[#111111]"
                >
                  <option value="recently_created">Recently Created</option>
                  <option value="due_date">Target Due Date</option>
                  <option value="progress">Completion %</option>
                  <option value="budget">Valuation Budget</option>
                  <option value="client_name">Client Alphabetical</option>
                </select>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[11px] font-mono font-bold uppercase text-[#6A6A6A]">Client</label>
                <select
                  value={filterClient}
                  onChange={(e) => setFilterClient(e.target.value)}
                  className="h-11 px-3 bg-[#FCFBF8] border border-[#E9E3DA] rounded-xl text-[13px] font-bold text-[#111111]"
                >
                  <option value="All">All Clients</option>
                  {uniqueClientsList.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[11px] font-mono font-bold uppercase text-[#6A6A6A]">Priority</label>
                <select
                  value={filterPriority}
                  onChange={(e) => setFilterPriority(e.target.value)}
                  className="h-11 px-3 bg-[#FCFBF8] border border-[#E9E3DA] rounded-xl text-[13px] font-bold text-[#111111]"
                >
                  <option value="All">All Priorities</option>
                  <option value="High">High Priority</option>
                  <option value="Medium">Medium Priority</option>
                  <option value="Low">Low Priority</option>
                </select>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[11px] font-mono font-bold uppercase text-[#6A6A6A]">Assigned Team Member</label>
                <select
                  value={filterAssignee}
                  onChange={(e) => setFilterAssignee(e.target.value)}
                  className="h-11 px-3 bg-[#FCFBF8] border border-[#E9E3DA] rounded-xl text-[13px] font-bold text-[#111111]"
                >
                  <option value="All">All Team Members</option>
                  {uniqueAssigneesList.map((a) => (
                    <option key={a} value={a}>
                      {a}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[11px] font-mono font-bold uppercase text-[#6A6A6A]">Due Date Window</label>
                <select
                  value={filterDueDate}
                  onChange={(e) => setFilterDueDate(e.target.value)}
                  className="h-11 px-3 bg-[#FCFBF8] border border-[#E9E3DA] rounded-xl text-[13px] font-bold text-[#111111]"
                >
                  <option value="All">All Deadlines</option>
                  <option value="Overdue">Overdue Tasks</option>
                  <option value="ThisMonth">Due This Month</option>
                  <option value="Upcoming">Upcoming</option>
                </select>
              </div>

              <div className="flex gap-3 pt-3 border-t border-[#E9E3DA]">
                <button
                  onClick={() => {
                    setFilterClient("All");
                    setFilterPriority("All");
                    setFilterAssignee("All");
                    setFilterDueDate("All");
                    setSearchQuery("");
                  }}
                  className="flex-1 py-3 border border-[#E9E3DA] rounded-xl text-[13px] font-bold text-[#6A6A6A]"
                >
                  Reset Filters
                </button>
                <button
                  onClick={() => setIsMobileFilterOpen(false)}
                  className="flex-1 py-3 bg-[#111111] text-white rounded-xl text-[13px] font-bold shadow-sm"
                >
                  Apply Filters
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
