"use client";

import React, { useState } from "react";
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
  } = useCRM();

  const [activeTab, setActiveTab] = useState<"checklist" | "expenses" | "payments" | "financials" | "timeline">("checklist");
  const [searchQuery, setSearchQuery] = useState("");
  const [taskFilterStatus, setTaskFilterStatus] = useState<string>("All");
  const [taskFilterPriority, setTaskFilterPriority] = useState<string>("All");
  const [isAddProjectModalOpen, setIsAddProjectModalOpen] = useState(false);

  // Edit Project State
  const [editingProject, setEditingProject] = useState<CRMClient | null>(null);
  const [editBudget, setEditBudget] = useState("");
  const [editCompany, setEditCompany] = useState("");
  const [editClientName, setEditClientName] = useState("");
  const [editStage, setEditStage] = useState("");
  const [editDeadline, setEditDeadline] = useState("");

  const openEditModal = (project: CRMClient, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setEditingProject(project);
    setEditBudget((project.budget || 0).toString());
    setEditCompany(project.company || "");
    setEditClientName(project.name || "");
    setEditStage(project.stage || "Active");
    setEditDeadline(project.expectedDelivery || "");
  };

  const handleSaveEditProject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProject) return;

    await updateClient(editingProject._id, {
      budget: parseFloat(editBudget) || 0,
      company: editCompany,
      name: editClientName,
      stage: editStage as any,
      expectedDelivery: editDeadline,
    });

    setEditingProject(null);
  };

  // New Project Form
  const [newProjectCompany, setNewProjectCompany] = useState("");
  const [newProjectName, setNewProjectName] = useState("");
  const [newProjectBudget, setNewProjectBudget] = useState("");
  const [newProjectStartDate, setNewProjectStartDate] = useState(new Date().toISOString().split("T")[0]);
  const [newProjectDeadline, setNewProjectDeadline] = useState("");
  const [newProjectAssignee, setNewProjectAssignee] = useState("Admin");

  // New Task Form
  const [newTaskTitle, setNewTaskTitle] = useState("");
  const [newTaskDesc, setNewTaskDesc] = useState("");
  const [newTaskPriority, setNewTaskPriority] = useState<"High" | "Medium" | "Low">("Medium");
  const [newTaskAssignee, setNewTaskAssignee] = useState("Admin");
  const [newTaskDueDate, setNewTaskDueDate] = useState("");
  const [newSubtaskTitle, setNewSubtaskTitle] = useState<{ [taskId: string]: string }>({});

  // New Expense Form inside project
  const [expName, setExpName] = useState("");
  const [expCategory, setExpCategory] = useState("Material Cost");
  const [expVendor, setExpVendor] = useState("");
  const [expAmount, setExpAmount] = useState("");
  const [expMethod, setExpMethod] = useState("Bank Transfer");
  const [expDate, setExpDate] = useState(new Date().toISOString().split("T")[0]);
  const [expNotes, setExpNotes] = useState("");

  // New Payment Form inside project
  const [payAmount, setPayAmount] = useState("");
  const [payDate, setPayDate] = useState(new Date().toISOString().split("T")[0]);
  const [payRef, setPayRef] = useState("");
  const [payMethod, setPayMethod] = useState("Bank Transfer");
  const [payNotes, setPayNotes] = useState("");

  const formatCurrency = (val: number) => {
    const sym = settings.currency || "₹";
    return `${sym}${val.toLocaleString("en-IN")}`;
  };

  const activeProject = clients.find((c) => c._id === activeClientId) || null;

  // Compute Project Financials
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

    const referralCommission = client.referredBy
      ? (received * (client.referralCommissionPct ?? 5)) / 100
      : 0;

    const profit = received - expenses - referralCommission;
    const p1Share = (profit * (settings.partner1Share || 50)) / 100;
    const p2Share = (profit * (settings.partner2Share || 50)) / 100;

    return {
      cost,
      received,
      pendingAmount,
      expenses,
      referralCommission,
      profit,
      p1Share,
      p2Share,
    };
  };

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
      stage: "Active",
      priority: "High",
      countryFlag: "🇮🇳",
      logo: newProjectCompany.substring(0, 2).toUpperCase(),
      tasks: [],
      expenses: [],
      payments: [],
    });

    setNewProjectCompany("");
    setNewProjectName("");
    setNewProjectBudget("");
    setIsAddProjectModalOpen(false);
  };

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

  return (
    <div className="flex flex-col gap-6 pb-12 select-none">
      {/* Top Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h2 className="text-[24px] font-extrabold tracking-tight text-[#111111]">
            Projects Workspace & Execution
          </h2>
          <p className="text-[13px] text-[#6A6A6A] mt-1">
            Manage project delivery, task checklists, project financials, live expenses, and client payments.
          </p>
        </div>
        <button
          onClick={() => setIsAddProjectModalOpen(true)}
          className="flex items-center gap-2 bg-[#111111] text-white px-4 py-2.5 rounded-xl text-[13px] font-bold hover:bg-[#222222] transition-all shadow-sm cursor-pointer"
        >
          <Plus size={15} />
          <span>Launch New Project</span>
        </button>
      </div>

      {/* Projects Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {clients.map((project) => {
          const fin = getProjectFinancials(project);
          const completedTasksCount = (project.tasks || []).filter((t) => t.status === "Completed" || t.completed).length;
          const totalTasksCount = (project.tasks || []).length;
          const isSelected = activeProject?._id === project._id;

          return (
            <div
              key={project._id}
              onClick={() => setActiveClientId(project._id)}
              className={`bg-white border rounded-[24px] p-5 transition-all cursor-pointer shadow-sm group flex flex-col justify-between gap-4 relative overflow-hidden ${
                isSelected ? "border-indigo-600 ring-2 ring-indigo-500/20" : "border-[#E9E3DA] hover:border-[#111111]"
              }`}
            >
              {/* Header */}
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0 flex-1">
                  <div className="w-10 h-10 rounded-xl bg-[#FCFBF8] border border-[#E9E3DA] flex items-center justify-center font-extrabold text-[13px] text-[#111111] shrink-0">
                    {project.logo || project.company.substring(0, 2).toUpperCase()}
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="text-[15px] font-extrabold text-[#111111] leading-tight truncate flex items-center gap-1.5">
                      <span className="truncate">{project.company}</span>
                      <span className="text-[12px] shrink-0">{project.countryFlag}</span>
                    </h3>
                    <span className="text-[11.5px] text-[#6A6A6A] block mt-0.5 truncate">{project.name}</span>
                  </div>
                </div>

                <span className="px-2.5 py-1 rounded-md text-[10px] font-mono font-extrabold uppercase tracking-wider bg-indigo-50 text-indigo-700 border border-indigo-100 shrink-0 max-w-[130px] truncate text-center">
                  {project.stage}
                </span>
              </div>

              {/* Progress Bar */}
              <div>
                <div className="flex justify-between items-center text-[11.5px] font-bold text-[#111111] mb-1.5">
                  <span className="text-[#6A6A6A]">Progress</span>
                  <span className="font-mono text-[#111111]">{project.progress}%</span>
                </div>
                <div className="w-full h-2 bg-[#FCFBF8] border border-[#E9E3DA] rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full bg-emerald-500 transition-all duration-500"
                    style={{ width: `${project.progress}%` }}
                  />
                </div>
              </div>

              {/* Quick Financial Summary Pill with Budget Edit Trigger */}
              <div className="grid grid-cols-3 gap-2 bg-[#FCFBF8] border border-[#E9E3DA] rounded-xl p-2.5 text-center font-mono relative">
                <div
                  onClick={(e) => openEditModal(project, e)}
                  className="group/b text-left pl-1 cursor-pointer hover:bg-white/80 p-1 rounded-lg transition-colors"
                  title="Click to change project budget"
                >
                  <span className="text-[9px] uppercase font-bold text-[#6A6A6A] flex items-center gap-1">
                    <span>Budget</span>
                    <Edit2 size={9} className="text-indigo-600 opacity-60 group-hover/b:opacity-100" />
                  </span>
                  <span className="text-[12px] font-extrabold text-[#111111] group-hover/b:text-indigo-600 block truncate">
                    {formatCurrency(fin.cost)}
                  </span>
                </div>
                <div className="border-x border-[#E9E3DA] p-1">
                  <span className="text-[9px] uppercase font-bold text-[#6A6A6A] block">Received</span>
                  <span className="text-[12px] font-extrabold text-emerald-600 block truncate">{formatCurrency(fin.received)}</span>
                </div>
                <div className="p-1">
                  <span className="text-[9px] uppercase font-bold text-[#6A6A6A] block">Expenses</span>
                  <span className="text-[12px] font-extrabold text-red-600 block truncate">{formatCurrency(fin.expenses)}</span>
                </div>
              </div>

              {/* Footer details */}
              <div className="border-t border-[#E9E3DA] pt-3 flex items-center justify-between text-[11.5px]">
                <span className="text-[#6A6A6A] flex items-center gap-1 font-mono">
                  <Clock size={12} />
                  <span>Due: {project.expectedDelivery || "TBD"}</span>
                </span>
                <span className="font-bold text-indigo-600 flex items-center gap-1 group-hover:translate-x-0.5 transition-transform">
                  <span>Open Workspace</span>
                  <ArrowUpRight size={13} />
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Expanded Active Project Detailed Workspace Drawer / Modal */}
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
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-[#E9E3DA] text-[#111111] hover:bg-[#FCFBF8] text-[12px] font-bold transition-all cursor-pointer shadow-sm"
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
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-red-200 text-red-600 hover:bg-red-50 text-[12px] font-bold transition-all cursor-pointer shadow-sm"
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
                      className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-xl text-[13px] font-bold transition-all cursor-pointer shadow-sm flex items-center gap-1 shrink-0"
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
                        isDone ? "bg-[#FCFBF8] border-[#E9E3DA]/80 opacity-80" : "bg-white border-[#E9E3DA] shadow-sm"
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
                      className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-xl text-[13px] font-bold transition-all cursor-pointer shadow-sm shrink-0"
                    >
                      Save Expense
                    </button>
                  </div>
                </div>
              </form>

              <div className="bg-white border border-[#E9E3DA] rounded-2xl overflow-hidden shadow-sm">
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
                      className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-xl text-[13px] font-bold transition-all cursor-pointer shadow-sm shrink-0"
                    >
                      Record Payment
                    </button>
                  </div>
                </div>
              </form>

              <div className="bg-white border border-[#E9E3DA] rounded-2xl overflow-hidden shadow-sm">
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

      {/* Launch Project Modal */}
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

              <div className="flex justify-end gap-3 pt-3">
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

      {/* Edit Budget & Project Details Modal */}
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
    </div>
  );
}

