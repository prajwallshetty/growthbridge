"use client";

import React, { useState } from "react";
import { 
  useCRM, 
  CRMClient, 
  CRMTask, 
  CRMInvoice, 
  CRMMeeting, 
  CRMNote, 
  CRMFile, 
  CRMQuotation, 
  CRMProposal, 
  CRMAgreement 
} from "./CRMProvider";
import {
  ArrowLeft,
  Calendar,
  IndianRupee,
  User,
  Plus,
  CheckCircle,
  CheckCircle2,
  Clock,
  Sparkles,
  Paperclip,
  Video,
  FileText,
  FileCheck,
  MessageSquare,
  Activity,
  ChevronDown,
  Pin,
  Send,
  Download,
  AlertCircle,
  Settings,
  Trash2,
  Trash
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

type WorkspaceTab =
  | "overview"
  | "timeline"
  | "tasks"
  | "files"
  | "invoices"
  | "quotations"
  | "proposals"
  | "agreement"
  | "payments"
  | "meetings"
  | "notes"
  | "messages"
  | "activity"
  | "settings";

export default function ClientDetailsWorkspace() {
  const {
    clients,
    activeClientId,
    setActiveClientId,
    updateClientStage,
    updateClient,
    addTask,
    toggleTask,
    addInvoice,
    updateInvoiceStatus,
    saveDocument,
    addMeeting,
    addNote,
    updateNote,
    addMessage,
    addFile,
  } = useCRM();

  const [activeTab, setActiveTab] = useState<WorkspaceTab>("overview");

  // Local task form states
  const [taskTitle, setTaskTitle] = useState("");
  const [taskPriority, setTaskPriority] = useState<"High" | "Medium" | "Low">("Medium");
  const [taskAssignee, setTaskAssignee] = useState("");
  const [taskDeadline, setTaskDeadline] = useState("");

  // Local meeting form states
  const [meetTitle, setMeetTitle] = useState("");
  const [meetDate, setMeetDate] = useState("");
  const [meetTime, setMeetTime] = useState("");
  const [meetLink, setMeetLink] = useState("");
  const [meetNotes, setMeetNotes] = useState("");

  // Local invoice form states
  const [invNumber, setInvNumber] = useState("");
  const [invAmount, setInvAmount] = useState("");
  const [invDueDate, setInvDueDate] = useState("");
  const [invDesc, setInvDesc] = useState("");

  // Local note form states
  const [noteTitle, setNoteTitle] = useState("");
  const [noteContent, setNoteContent] = useState("");

  // Local chat state
  const [chatMessage, setChatMessage] = useState("");

  // Local Quotation Builder states
  const [quoteItems, setQuoteItems] = useState<{ description: string; qty: number; rate: number }[]>([
    { description: "Fractional Development Retainer", qty: 1, rate: 100000 }
  ]);
  const [quoteDiscount, setQuoteDiscount] = useState<number>(0);
  const [quoteTerms, setQuoteTerms] = useState("18% GST applicable. Net 30 payment terms.");
  const [quoteValidity, setQuoteValidity] = useState("30 Days");

  // Local Proposal creation states
  const [newProposalTitle, setNewProposalTitle] = useState("");
  const [newProposalBlocks, setNewProposalBlocks] = useState<string[]>([
    "Executive Brief: Tailored tech layouts.",
    "Scope: Design systems, Next.js build.",
    "Cost details: Net 30 retainer."
  ]);

  // Client Details Settings form states
  const [clientSettingsName, setClientSettingsName] = useState("");
  const [clientSettingsCompany, setClientSettingsCompany] = useState("");
  const [clientSettingsIndustry, setClientSettingsIndustry] = useState("");
  const [clientSettingsBudget, setClientSettingsBudget] = useState("");
  const [clientSettingsDelivery, setClientSettingsDelivery] = useState("");

  const client = clients.find((c) => c._id === activeClientId || c.id === activeClientId);

  if (!client) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] text-[#6A6A6A]">
        <AlertCircle size={48} className="text-[#6A6A6A]/30 mb-4" />
        <p>Client workspace not found.</p>
        <button onClick={() => setActiveClientId(null)} className="mt-4 text-[#111111] hover:underline text-[13px] font-bold">
          Return to directory
        </button>
      </div>
    );
  }

  // Load settings on active tab change or client change
  const initializeSettings = () => {
    setClientSettingsName(client.name);
    setClientSettingsCompany(client.company);
    setClientSettingsIndustry(client.industry);
    setClientSettingsBudget(String(client.budget));
    setClientSettingsDelivery(client.expectedDelivery);
  };

  const handleAddTaskSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!taskTitle) return;
    await addTask(client._id, {
      title: taskTitle,
      priority: taskPriority,
      assignee: taskAssignee || "Unassigned",
      deadline: taskDeadline || new Date().toISOString().split("T")[0],
      status: "Pending",
      progress: 0,
    });
    setTaskTitle("");
    setTaskAssignee("");
    setTaskDeadline("");
  };

  const handleAddMeetingSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!meetTitle) return;
    await addMeeting(client._id, {
      title: meetTitle,
      date: meetDate || new Date().toISOString().split("T")[0],
      time: meetTime || "12:00",
      link: meetLink || "https://meet.google.com/xyz-gb-sync",
      notes: meetNotes || "Design/Development sync.",
      actionItems: ["Review backlog checklist"],
      status: "Upcoming",
    });
    setMeetTitle("");
    setMeetDate("");
    setMeetTime("");
    setMeetLink("");
    setMeetNotes("");
  };

  const handleAddInvoiceSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!invNumber || !invAmount) return;
    await addInvoice(client._id, {
      number: invNumber,
      amount: Number(invAmount),
      dueDate: invDueDate || new Date().toISOString().split("T")[0],
      status: "Pending",
      paidAmount: 0,
      items: [{ description: invDesc || "Project milestone retainer", qty: 1, rate: Number(invAmount) }],
    });
    setInvNumber("");
    setInvAmount("");
    setInvDueDate("");
    setInvDesc("");
  };

  const handleAddNoteSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!noteTitle) return;
    await addNote(client._id, {
      title: noteTitle,
      content: noteContent || "Draft note content...",
      pinned: false,
      updatedAt: new Date().toISOString().split("T")[0],
    });
    setNoteTitle("");
    setNoteContent("");
  };

  const handleSendMessageSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatMessage) return;
    await addMessage(client._id, "studio", chatMessage);
    setChatMessage("");
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const fileObj = e.target.files?.[0];
    if (!fileObj) return;
    await addFile(client._id, {
      name: fileObj.name,
      category: "Brand Assets",
      size: `${(fileObj.size / (1024 * 1024)).toFixed(1)} MB`,
      uploadedAt: new Date().toISOString().split("T")[0],
      url: "#",
    });
  };

  // Quotation handlers
  const handleAddQuoteItem = () => {
    setQuoteItems([...quoteItems, { description: "", qty: 1, rate: 0 }]);
  };

  const handleQuoteItemChange = (index: number, field: string, val: any) => {
    const next = [...quoteItems];
    (next[index] as any)[field] = val;
    setQuoteItems(next);
  };

  const handleSaveQuotation = async () => {
    const subtotal = quoteItems.reduce((sum, item) => sum + (item.qty * item.rate), 0);
    const discountAmt = subtotal * (quoteDiscount / 100);
    const total = Math.round((subtotal - discountAmt) * 1.18); // 18% tax

    await saveDocument(client._id, "quotation", {
      items: quoteItems,
      discount: quoteDiscount,
      tax: 18,
      subtotal,
      total,
      terms: quoteTerms,
      validity: quoteValidity,
      status: "Draft"
    });
  };

  const handleConvertQuoteToInvoice = async (quote: CRMQuotation) => {
    // Generate Invoice from Approved quotation
    await addInvoice(client._id, {
      number: `GB-INV-Q-${Date.now().toString().slice(-4)}`,
      amount: quote.total,
      dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
      status: "Pending",
      paidAmount: 0,
      items: quote.items.map(item => ({ description: item.description, qty: item.qty, rate: item.rate })),
    });

    // Mark quotation status as invoiced
    await saveDocument(client._id, "quotation", {
      ...quote,
      _id: quote._id,
      status: "Invoiced"
    });
  };

  // Proposal handlers
  const handleSaveProposal = async () => {
    if (!newProposalTitle) return;
    await saveDocument(client._id, "proposal", {
      title: newProposalTitle,
      contentBlocks: newProposalBlocks,
      status: "Draft",
      version: 1
    });
    setNewProposalTitle("");
  };

  // Agreement handlers
  const handleSaveAgreementDetails = async (scopeText: string, termsText: string) => {
    await saveDocument(client._id, "agreement", {
      scope: scopeText,
      timeline: `${client.expectedDelivery} deadline`,
      paymentTerms: termsText,
      signedStatus: "Unsigned"
    });
  };

  // Settings save handler
  const handleSaveClientSettings = async () => {
    await updateClient(client._id, {
      name: clientSettingsName,
      company: clientSettingsCompany,
      industry: clientSettingsIndustry,
      budget: Number(clientSettingsBudget),
      expectedDelivery: clientSettingsDelivery,
    });
  };

  const getPriorityStyle = (p: CRMTask["priority"]) => {
    switch (p) {
      case "High":
        return "bg-red-50 text-red-600 border border-red-100";
      case "Medium":
        return "bg-amber-50 text-amber-600 border border-amber-100";
      case "Low":
        return "bg-emerald-50 text-emerald-600 border border-emerald-100";
      default:
        return "bg-gray-50 text-gray-500 border border-gray-150";
    }
  };

  return (
    <div className="flex flex-col gap-6 pb-12 select-none">
      {/* Back button and profile details */}
      <div className="flex items-center gap-4 shrink-0">
        <button
          onClick={() => setActiveClientId(null)}
          className="p-2 rounded-xl bg-white hover:bg-[#FCFBF8] border border-[#E9E3DA] text-[#6A6A6A] hover:text-[#111111] transition-all cursor-pointer"
        >
          <ArrowLeft size={16} />
        </button>

        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#FCFBF8] border border-[#E9E3DA] flex items-center justify-center font-bold text-[#111111] text-[14px]">
            {client.logo}
          </div>
          <div>
            <h2 className="text-[20px] font-extrabold text-[#111111] leading-tight flex items-center gap-2">
              <span>{client.company}</span>
              <span className="text-[14px]">{client.countryFlag}</span>
            </h2>
            <p className="text-[12px] text-[#6A6A6A] mt-0.5">Workspace for {client.name} · {client.industry}</p>
          </div>
        </div>
      </div>

      {/* Workspace Tabs layout grid */}
      <div className="grid grid-cols-1 xl:grid-cols-4 gap-6 items-start">
        {/* Left main area (col-span-3) */}
        <div className="xl:col-span-3 flex flex-col gap-6">
          
          {/* Tab Navigation row */}
          <div className="flex items-center gap-1.5 bg-[#FCFBF8] border border-[#E9E3DA] rounded-xl p-1 overflow-x-auto scrollbar-none">
            {[
              { id: "overview", label: "Overview", icon: <FileText size={13} /> },
              { id: "timeline", label: "Timeline", icon: <Clock size={13} /> },
              { id: "tasks", label: "Tasks", icon: <CheckCircle size={13} /> },
              { id: "quotations", label: "Quotations", icon: <FileText size={13} /> },
              { id: "proposals", label: "Proposals", icon: <FileText size={13} /> },
              { id: "agreement", label: "Agreement", icon: <FileCheck size={13} /> },
              { id: "invoices", label: "Invoices", icon: <IndianRupee size={13} /> },
              { id: "payments", label: "Payments", icon: <IndianRupee size={13} /> },
              { id: "notes", label: "Notes", icon: <FileText size={13} /> },
              { id: "activity", label: "Activity", icon: <Activity size={13} /> },
              { id: "settings", label: "Settings", icon: <Settings size={13} /> },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => {
                  setActiveTab(tab.id as WorkspaceTab);
                  if (tab.id === "settings") initializeSettings();
                }}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-[12px] font-bold transition-all whitespace-nowrap cursor-pointer ${
                  activeTab === tab.id
                    ? "bg-[#111111] text-white"
                    : "text-[#6A6A6A] hover:text-[#111111] hover:bg-white"
                }`}
              >
                {tab.icon}
                <span>{tab.label}</span>
              </button>
            ))}
          </div>

          {/* Active Tab Panel Body */}
          <div className="bg-white rounded-2xl border border-[#E9E3DA] p-6 min-h-[400px] shadow-sm">
            
            {/* OVERVIEW TAB */}
            {activeTab === "overview" && (
              <div className="flex flex-col gap-6">
                <div>
                  <h3 className="text-[15px] font-bold text-[#111111] mb-2">Project Brief Summary</h3>
                  <p className="text-[13px] text-[#6A6A6A] leading-relaxed">
                    Partnering with {client.company} to design and deploy premium tech solutions in the {client.industry} sector. The project kickstarted on {client.startDate} with an allocated budget of ₹{client.budget.toLocaleString()}.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Progress Card */}
                  <div className="p-4 bg-[#FCFBF8] border border-[#E9E3DA] rounded-xl flex items-center justify-between">
                    <div>
                      <span className="text-[10px] font-mono text-[#6A6A6A] uppercase tracking-wider font-bold">Overall Status</span>
                      <div className="text-[15px] font-bold text-[#111111] mt-1">{client.stage}</div>
                    </div>
                    <div className="text-right">
                      <span className="text-[18px] font-extrabold text-emerald-600">{client.progress}%</span>
                      <p className="text-[10px] text-[#6A6A6A] font-medium">Complete</p>
                    </div>
                  </div>

                  {/* Financials Card */}
                  <div className="p-4 bg-[#FCFBF8] border border-[#E9E3DA] rounded-xl flex items-center justify-between">
                    <div>
                      <span className="text-[10px] font-mono text-[#6A6A6A] uppercase tracking-wider font-bold">Retainer Status</span>
                      <div className="text-[15px] font-bold text-[#111111] mt-1">₹{client.budget.toLocaleString()}</div>
                    </div>
                    <span className="px-2 py-0.5 rounded text-[10px] bg-emerald-50 text-emerald-600 border border-emerald-100 font-bold font-mono">
                      ACTIVE
                    </span>
                  </div>
                </div>

                {/* Main Action Tasks summary */}
                <div>
                  <h4 className="text-[13px] font-bold text-[#111111] mb-3">Priority Action Items</h4>
                  <div className="flex flex-col gap-2">
                    {client.tasks.slice(0, 3).map((t) => (
                      <div key={t._id} className="flex items-center justify-between p-2.5 rounded-lg bg-[#FCFBF8] border border-[#E9E3DA] text-[12.5px]">
                        <span className="text-[#111111] font-semibold">{t.title}</span>
                        <span className="text-[#6A6A6A] font-mono text-[11px] font-bold">{t.deadline}</span>
                      </div>
                    ))}
                    {client.tasks.length === 0 && (
                      <p className="text-[#6A6A6A] text-[12px] italic">No active tasks in queue.</p>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* TIMELINE TAB */}
            {activeTab === "timeline" && (
              <div className="flex flex-col gap-6">
                <h3 className="text-[15px] font-bold text-[#111111] mb-2">Milestone Timeline</h3>
                <div className="relative pl-6 border-l border-[#E9E3DA] flex flex-col gap-6">
                  {client.activity.map((event, idx) => (
                    <div key={idx} className="relative text-[13px]">
                      {/* Bullet point */}
                      <span className="absolute -left-[31px] top-1.5 w-3 h-3 rounded-full border-2 bg-emerald-500 border-emerald-500" />
                      <div>
                        <div className="font-bold text-[#111111]">{event.text}</div>
                        <span className="text-[11px] text-[#6A6A6A] font-mono">{event.timestamp}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* TASKS TAB */}
            {activeTab === "tasks" && (
              <div className="flex flex-col gap-6">
                <div className="flex justify-between items-center flex-wrap gap-4">
                  <h3 className="text-[15px] font-bold text-[#111111]">Project Checklist</h3>
                  <span className="text-[11.5px] text-[#6A6A6A] font-bold">
                    {client.tasks.filter((t) => t.status === "Completed").length} of {client.tasks.length} Completed
                  </span>
                </div>

                <form onSubmit={handleAddTaskSubmit} className="grid grid-cols-1 md:grid-cols-4 gap-3 bg-[#FCFBF8] p-4 rounded-xl border border-[#E9E3DA] items-end">
                  <div className="md:col-span-2 flex flex-col gap-1.5">
                    <label className="text-[10px] font-bold text-[#6A6A6A] uppercase">Task name</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Design user profiles screen"
                      value={taskTitle}
                      onChange={(e) => setTaskTitle(e.target.value)}
                      className="px-3 py-1.5 rounded-lg bg-white border border-[#E9E3DA] text-[12.5px] text-[#111111] focus:outline-none"
                    />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] font-bold text-[#6A6A6A] uppercase">Priority</label>
                    <select
                      value={taskPriority}
                      onChange={(e: any) => setTaskPriority(e.target.value)}
                      className="px-3 py-1.5 rounded-lg bg-white border border-[#E9E3DA] text-[12.5px] text-[#111111] focus:outline-none"
                    >
                      <option value="High">High</option>
                      <option value="Medium">Medium</option>
                      <option value="Low">Low</option>
                    </select>
                  </div>
                  <button type="submit" className="px-4 py-2 rounded-lg bg-[#111111] hover:bg-[#222222] text-white text-[12.5px] font-bold transition-all cursor-pointer">
                    Add Item
                  </button>
                </form>

                <div className="flex flex-col gap-2">
                  {client.tasks.map((task) => (
                    <div
                      key={task._id}
                      onClick={() => toggleTask(client._id, task._id)}
                      className={`flex items-center justify-between p-3.5 rounded-xl border cursor-pointer transition-all ${
                        task.status === "Completed"
                          ? "bg-[#FCFBF8]/40 border-[#E9E3DA] opacity-60"
                          : "bg-white border-[#E9E3DA] hover:border-[#111111]"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-4 h-4 rounded border flex items-center justify-center shrink-0 ${
                          task.status === "Completed" ? "bg-emerald-500 border-emerald-500" : "border-[#A8A296]"
                        }`}>
                          {task.status === "Completed" && (
                            <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                              <path d="M2 5l2 2 4-4" stroke="white" strokeWidth="2.5" strokeLinecap="round" />
                            </svg>
                          )}
                        </div>
                        <span className={`text-[13px] font-semibold ${
                          task.status === "Completed" ? "line-through text-[#6A6A6A]" : "text-[#111111]"
                        }`}>
                          {task.title}
                        </span>
                      </div>

                      <div className="flex items-center gap-4 text-[11px] font-mono text-[#6A6A6A]">
                        <span className={`px-2 py-0.5 rounded ${getPriorityStyle(task.priority)}`}>{task.priority}</span>
                        <span className="font-bold">{task.deadline}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* FILES TAB */}
            {activeTab === "files" && (
              <div className="flex flex-col gap-6">
                <div className="flex justify-between items-center">
                  <h3 className="text-[15px] font-bold text-[#111111]">Assets Vault</h3>
                  <div>
                    <input type="file" id="file-upload-input" onChange={handleFileUpload} className="hidden" />
                    <label
                      htmlFor="file-upload-input"
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[#E9E3DA] hover:border-[#111111] bg-white text-[12px] text-[#111111] font-bold cursor-pointer transition-all"
                    >
                      <Plus size={13} strokeWidth={2.5} />
                      <span>Upload File</span>
                    </label>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {client.files.map((file) => (
                    <div key={file._id} className="p-4 bg-white border border-[#E9E3DA] rounded-xl flex items-center justify-between hover:border-[#111111] transition-colors">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-[#FCFBF8] border border-[#E9E3DA] flex items-center justify-center text-[10px] font-mono text-[#111111] font-bold">
                          {file.category.substring(0, 4).toUpperCase()}
                        </div>
                        <div>
                          <div className="text-[13px] font-bold text-[#111111] truncate max-w-[180px]">{file.name}</div>
                          <span className="text-[11px] text-[#6A6A6A] block mt-0.5">{file.size} · {file.uploadedAt}</span>
                        </div>
                      </div>
                      <button className="p-2 rounded-lg bg-[#FCFBF8] border border-[#E9E3DA] text-[#6A6A6A] hover:text-[#111111] cursor-pointer">
                        <Download size={14} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* QUOTATIONS TAB */}
            {activeTab === "quotations" && (
              <div className="flex flex-col gap-6">
                <h3 className="text-[15px] font-bold text-[#111111]">Quotation Builder</h3>
                
                {/* Quotation Creator Form */}
                <div className="bg-[#FCFBF8] border border-[#E9E3DA] rounded-xl p-5 flex flex-col gap-4">
                  <h4 className="text-[12.5px] font-bold text-[#111111]">Configure Line Items</h4>
                  {quoteItems.map((item, index) => (
                    <div key={index} className="grid grid-cols-1 md:grid-cols-4 gap-3 items-end">
                      <div className="md:col-span-2 flex flex-col gap-1.5">
                        <span className="text-[10px] font-mono text-[#6A6A6A] uppercase font-bold">Description</span>
                        <input
                          type="text"
                          required
                          value={item.description}
                          onChange={(e) => handleQuoteItemChange(index, "description", e.target.value)}
                          className="px-3 py-1.5 bg-white border border-[#E9E3DA] rounded-lg text-[12.5px] focus:outline-none"
                        />
                      </div>
                      <div className="flex flex-col gap-1.5">
                        <span className="text-[10px] font-mono text-[#6A6A6A] uppercase font-bold">Qty</span>
                        <input
                          type="number"
                          value={item.qty}
                          onChange={(e) => handleQuoteItemChange(index, "qty", Number(e.target.value))}
                          className="px-3 py-1.5 bg-white border border-[#E9E3DA] rounded-lg text-[12.5px] focus:outline-none"
                        />
                      </div>
                      <div className="flex flex-col gap-1.5">
                        <span className="text-[10px] font-mono text-[#6A6A6A] uppercase font-bold">Rate (INR)</span>
                        <input
                          type="number"
                          value={item.rate}
                          onChange={(e) => handleQuoteItemChange(index, "rate", Number(e.target.value))}
                          className="px-3 py-1.5 bg-white border border-[#E9E3DA] rounded-lg text-[12.5px] focus:outline-none"
                        />
                      </div>
                    </div>
                  ))}
                  <button 
                    onClick={handleAddQuoteItem}
                    className="self-start text-[11.5px] text-[#111111] hover:underline font-bold"
                  >
                    + Add Item Row
                  </button>

                  <div className="grid grid-cols-2 gap-4 border-t border-[#E9E3DA] pt-4 mt-2">
                    <div className="flex flex-col gap-1">
                      <span className="text-[10px] uppercase font-bold text-[#6A6A6A]">Discount %</span>
                      <input
                        type="number"
                        value={quoteDiscount}
                        onChange={(e) => setQuoteDiscount(Number(e.target.value))}
                        className="px-3 py-1.5 bg-white border border-[#E9E3DA] rounded-lg text-[12.5px] focus:outline-none"
                      />
                    </div>
                    <div className="flex flex-col gap-1">
                      <span className="text-[10px] uppercase font-bold text-[#6A6A6A]">Validity</span>
                      <input
                        type="text"
                        value={quoteValidity}
                        onChange={(e) => setQuoteValidity(e.target.value)}
                        className="px-3 py-1.5 bg-white border border-[#E9E3DA] rounded-lg text-[12.5px] focus:outline-none"
                      />
                    </div>
                  </div>

                  <button 
                    onClick={handleSaveQuotation}
                    className="self-end px-4 py-2 bg-[#111111] hover:bg-[#222222] text-white text-[12.5px] font-bold rounded-lg transition-all"
                  >
                    Save Quotation Draft
                  </button>
                </div>

                {/* Quotations List */}
                <div className="flex flex-col gap-3">
                  <h4 className="text-[13px] font-bold text-[#111111]">Saved Quotations</h4>
                  {client.quotations?.map((quote) => (
                    <div key={quote._id} className="p-4 bg-white border border-[#E9E3DA] rounded-xl flex items-center justify-between">
                      <div>
                        <strong className="text-[14px] text-[#111111] block">Retainer Valuation: ₹{quote.total.toLocaleString()}</strong>
                        <span className="text-[11px] text-[#6A6A6A]">Subtotal: ₹{quote.subtotal.toLocaleString()} &bull; Tax GST (18%)</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`px-2 py-0.5 rounded text-[10px] border font-bold ${
                          quote.status === "Approved" ? "bg-emerald-50 text-emerald-600 border-emerald-100" : "bg-gray-50 text-gray-500 border-gray-150"
                        }`}>
                          {quote.status}
                        </span>
                        {quote.status === "Approved" && (
                          <button 
                            onClick={() => handleConvertQuoteToInvoice(quote)}
                            className="px-3 py-1 bg-black text-white hover:bg-black/90 rounded text-[11px] font-bold transition-all"
                          >
                            1-Click Invoice
                          </button>
                        )}
                        {quote.status === "Draft" && (
                          <button 
                            onClick={async () => {
                              await saveDocument(client._id, "quotation", { ...quote, _id: quote._id, status: "Approved" });
                            }}
                            className="px-3 py-1 bg-emerald-500 text-white rounded text-[11px] font-bold hover:bg-emerald-600 transition-all"
                          >
                            Approve
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* PROPOSALS TAB */}
            {activeTab === "proposals" && (
              <div className="flex flex-col gap-6">
                <h3 className="text-[15px] font-bold text-[#111111]">Proposal Templates</h3>
                
                {/* Creator */}
                <div className="bg-[#FCFBF8] border border-[#E9E3DA] rounded-xl p-5 flex flex-col gap-4">
                  <div className="flex flex-col gap-1">
                    <span className="text-[10px] font-mono text-[#6A6A6A] uppercase font-bold">Proposal Title</span>
                    <input
                      type="text"
                      placeholder="e.g. Redesign Project Proposal"
                      value={newProposalTitle}
                      onChange={(e) => setNewProposalTitle(e.target.value)}
                      className="px-3 py-1.5 bg-white border border-[#E9E3DA] rounded-lg text-[12.5px] focus:outline-none"
                    />
                  </div>
                  <button 
                    onClick={handleSaveProposal}
                    className="self-end px-4 py-2 bg-[#111111] hover:bg-[#222222] text-white text-[12.5px] font-bold rounded-lg transition-all"
                  >
                    Create Proposal Draft
                  </button>
                </div>

                {/* List */}
                <div className="flex flex-col gap-3">
                  {client.proposals?.map((prop) => (
                    <div key={prop._id} className="p-4 bg-white border border-[#E9E3DA] rounded-xl flex items-center justify-between">
                      <div>
                        <strong className="text-[13.5px] font-bold text-[#111111]">{prop.title}</strong>
                        <span className="text-[11px] text-[#6A6A6A] block mt-0.5">Version v{prop.version || 1} &bull; {prop.contentBlocks.length} sections</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 rounded text-[10px] bg-gray-50 border border-gray-150 text-[#6A6A6A] font-bold">
                          {prop.status}
                        </span>
                        {prop.status === "Draft" && (
                          <button
                            onClick={async () => {
                              await saveDocument(client._id, "proposal", { ...prop, _id: prop._id, status: "Approved" });
                              await updateClientStage(client._id, "Quotation Generated");
                            }}
                            className="px-3 py-1 bg-emerald-500 text-white rounded text-[11px] font-bold"
                          >
                            Approve
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* AGREEMENT TAB */}
            {activeTab === "agreement" && (
              <div className="flex flex-col gap-6">
                <h3 className="text-[15px] font-bold text-[#111111]">Master Services Contract (MSA)</h3>
                
                {/* Active Agreements or Creator */}
                {client.agreements && client.agreements.length > 0 ? (
                  client.agreements.map((agr) => (
                    <div key={agr._id} className="bg-[#FCFBF8] border border-[#E9E3DA] rounded-xl p-5 flex flex-col gap-4 text-[#111111]">
                      <div className="flex justify-between items-center border-b border-[#E9E3DA]/65 pb-2">
                        <span className="text-[11px] font-bold uppercase text-[#6A6A6A]">Contract terms</span>
                        <span className={`px-2 py-0.5 rounded text-[10px] border font-bold ${
                          agr.signedStatus === "Signed" ? "bg-emerald-50 text-emerald-600 border-emerald-100" : "bg-amber-50 text-amber-600 border-amber-100"
                        }`}>
                          {agr.signedStatus}
                        </span>
                      </div>
                      <div className="text-[12.5px] leading-relaxed flex flex-col gap-2">
                        <p><strong>Scope:</strong> {agr.scope}</p>
                        <p><strong>Timeline:</strong> {agr.timeline}</p>
                        <p><strong>Payment details:</strong> {agr.paymentTerms}</p>
                      </div>
                      {agr.signedStatus !== "Signed" && (
                        <button
                          onClick={async () => {
                            await saveDocument(client._id, "agreement", { ...agr, _id: agr._id, signedStatus: "Signed" });
                            await updateClientStage(client._id, "Project Created Automatically");
                          }}
                          className="self-end px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white text-[12.5px] font-bold rounded-lg transition-all"
                        >
                          Execute Signature
                        </button>
                      )}
                    </div>
                  ))
                ) : (
                  <div className="p-8 border border-dashed border-[#E9E3DA] rounded-xl text-center text-[#6A6A6A] flex flex-col gap-4">
                    <p className="text-[13px]">No agreement initialized yet.</p>
                    <button 
                      onClick={() => handleSaveAgreementDetails("Design & developer operations support", "35-35-30 retainer model")}
                      className="self-center px-4 py-2 bg-[#111111] text-white text-[12.5px] font-bold rounded-lg"
                    >
                      Pre-populate MSA Contract template
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* PAYMENTS TAB */}
            {activeTab === "payments" && (
              <div className="flex flex-col gap-6 text-[#111111]">
                <h3 className="text-[15px] font-bold text-[#111111]">Retainer Milestones</h3>
                
                {/* Grid stats */}
                <div className="grid grid-cols-3 gap-4">
                  <div className="p-4 bg-[#FCFBF8] border border-[#E9E3DA] rounded-xl">
                    <span className="text-[10px] uppercase font-bold text-[#6A6A6A]">Advance Retainer</span>
                    <strong className="block text-[15px] mt-1">₹{Math.round(client.budget * 0.35).toLocaleString()}</strong>
                  </div>
                  <div className="p-4 bg-[#FCFBF8] border border-[#E9E3DA] rounded-xl">
                    <span className="text-[10px] uppercase font-bold text-[#6A6A6A]">Development Sync</span>
                    <strong className="block text-[15px] mt-1">₹{Math.round(client.budget * 0.35).toLocaleString()}</strong>
                  </div>
                  <div className="p-4 bg-[#FCFBF8] border border-[#E9E3DA] rounded-xl">
                    <span className="text-[10px] uppercase font-bold text-[#6A6A6A]">Final Deployment</span>
                    <strong className="block text-[15px] mt-1">₹{Math.round(client.budget * 0.30).toLocaleString()}</strong>
                  </div>
                </div>

                <div className="border-t border-[#E9E3DA] pt-4 flex justify-between items-center text-[13px]">
                  <div>
                    <span className="text-[#6A6A6A] block">Total Project Value:</span>
                    <strong className="text-[16px] text-emerald-600">₹{client.budget.toLocaleString()}</strong>
                  </div>
                  <div className="text-right">
                    <span className="text-[#6A6A6A] block">Late payments warning status:</span>
                    <strong className="text-emerald-500 uppercase">Clear</strong>
                  </div>
                </div>
              </div>
            )}

            {/* INVOICES TAB */}
            {activeTab === "invoices" && (
              <div className="flex flex-col gap-6">
                <h3 className="text-[15px] font-bold text-[#111111]">Invoices Ledger</h3>

                <form onSubmit={handleAddInvoiceSubmit} className="grid grid-cols-1 md:grid-cols-4 gap-3 bg-[#FCFBF8] p-4 rounded-xl border border-[#E9E3DA] items-end">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] font-bold text-[#6A6A6A] uppercase">Invoice ID</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. GB-2026-050"
                      value={invNumber}
                      onChange={(e) => setInvNumber(e.target.value)}
                      className="w-full px-3 py-1.5 rounded-lg bg-white border border-[#E9E3DA] text-[12.5px] focus:outline-none"
                    />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] font-bold text-[#6A6A6A] uppercase">Amount (INR)</label>
                    <input
                      type="number"
                      required
                      placeholder="e.g. 350000"
                      value={invAmount}
                      onChange={(e) => setInvAmount(e.target.value)}
                      className="w-full px-3 py-1.5 rounded-lg bg-white border border-[#E9E3DA] text-[12.5px] focus:outline-none"
                    />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] font-bold text-[#6A6A6A] uppercase">Due Date</label>
                    <input
                      type="date"
                      value={invDueDate}
                      onChange={(e) => setInvDueDate(e.target.value)}
                      className="w-full px-3 py-1.5 rounded-lg bg-white border border-[#E9E3DA] text-[12.5px] focus:outline-none"
                    />
                  </div>
                  <button type="submit" className="w-full px-4 py-2 rounded-lg bg-[#111111] hover:bg-[#222222] text-white text-[12.5px] font-bold transition-all cursor-pointer">
                    Create Invoice
                  </button>
                </form>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {client.invoices.map((inv) => (
                    <div key={inv._id} className="p-4 bg-white border border-[#E9E3DA] rounded-xl flex flex-col justify-between hover:border-[#111111] transition-colors">
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <span className="text-[11px] font-mono text-[#6A6A6A] tracking-wide font-bold">{inv.number}</span>
                          <div className="text-[18px] font-extrabold text-[#111111] mt-1">₹{inv.amount.toLocaleString()}</div>
                        </div>
                        <button
                          onClick={() => updateInvoiceStatus(client._id, inv._id, inv.status === "Paid" ? "Pending" : "Paid")}
                          className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
                            inv.status === "Paid"
                              ? "bg-emerald-50 text-emerald-600 border-emerald-200"
                              : "bg-amber-50 text-amber-600 border-amber-200"
                          }`}
                        >
                          {inv.status}
                        </button>
                      </div>

                      <div className="flex items-center justify-between text-[11px] text-[#6A6A6A] border-t border-[#E9E3DA] pt-3 mt-1">
                        <span>Due: {inv.dueDate}</span>
                        <button className="flex items-center gap-1 text-[#111111] hover:underline font-bold">
                          <Download size={12} />
                          <span>PDF</span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* MEETINGS TAB */}
            {activeTab === "meetings" && (
              <div className="flex flex-col gap-6">
                <h3 className="text-[15px] font-bold text-[#111111]">Sync Sessions</h3>

                <form onSubmit={handleAddMeetingSubmit} className="grid grid-cols-1 md:grid-cols-4 gap-3 bg-[#FCFBF8] p-4 rounded-xl border border-[#E9E3DA] items-end">
                  <div className="md:col-span-2 flex flex-col gap-1.5">
                    <label className="text-[10px] font-bold text-[#6A6A6A] uppercase">Meeting Topic</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. UX Review Sync"
                      value={meetTitle}
                      onChange={(e) => setMeetTitle(e.target.value)}
                      className="w-full px-3 py-1.5 rounded-lg bg-white border border-[#E9E3DA] text-[12.5px] focus:outline-none"
                    />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] font-bold text-[#6A6A6A] uppercase">Date & Time</label>
                    <input
                      type="datetime-local"
                      required
                      onChange={(e) => {
                        const [d, t] = e.target.value.split("T");
                        setMeetDate(d);
                        setMeetTime(t);
                      }}
                      className="w-full px-3 py-1.5 rounded-lg bg-white border border-[#E9E3DA] text-[12.5px] text-[#6A6A6A] focus:outline-none"
                    />
                  </div>
                  <button type="submit" className="w-full px-4 py-2 rounded-lg bg-[#111111] hover:bg-[#222222] text-white text-[12.5px] font-bold transition-all cursor-pointer">
                    Schedule
                  </button>
                </form>

                <div className="flex flex-col gap-3">
                  {client.meetings.map((meet) => (
                    <div key={meet._id} className="p-4 bg-white border border-[#E9E3DA] rounded-xl flex items-center justify-between">
                      <div className="flex items-center gap-3.5">
                        <div className="w-9 h-9 rounded-xl bg-[#FCFBF8] border border-[#E9E3DA] flex items-center justify-center text-[#111111]">
                          <Video size={16} />
                        </div>
                        <div>
                          <h4 className="text-[13.5px] font-bold text-[#111111]">{meet.title}</h4>
                          <span className="text-[11px] text-[#6A6A6A] block mt-0.5">{meet.date} at {meet.time}</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <a
                          href={meet.link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-3.5 py-2 rounded-lg bg-[#FCFBF8] hover:bg-white text-[#111111] text-[12px] font-bold transition-all border border-[#E9E3DA] hover:border-[#111111]"
                        >
                          Join Call
                        </a>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* NOTES TAB */}
            {activeTab === "notes" && (
              <div className="flex flex-col gap-6">
                <div className="flex justify-between items-center">
                  <h3 className="text-[15px] font-bold text-[#111111]">Notebook Notes</h3>
                  <button
                    onClick={() => {
                      const t = prompt("Note Title:");
                      if (t) addNote(client._id, { title: t, content: "Draft note content...", pinned: false, updatedAt: new Date().toISOString().split("T")[0] });
                    }}
                    className="flex items-center gap-1 text-[#111111] text-[12.5px] font-bold hover:underline cursor-pointer"
                  >
                    <Plus size={14} />
                    <span>New Note</span>
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {client.notes?.map((note) => (
                    <div key={note._id} className="p-4 bg-white border border-[#E9E3DA] rounded-xl flex flex-col justify-between hover:border-[#111111] transition-colors relative group">
                      <div>
                        <div className="flex justify-between items-center mb-2 border-b border-[#FCFBF8] pb-1.5">
                          <h4 className="text-[13.5px] font-bold text-[#111111] flex items-center gap-1.5">
                            {note.pinned && <Pin size={12} className="text-[#111111] rotate-45" />}
                            <span>{note.title}</span>
                          </h4>
                          <span className="text-[10px] text-[#6A6A6A] font-mono">{note.updatedAt}</span>
                        </div>
                        <textarea
                          value={note.content}
                          onChange={(e) => updateNote(client._id, note._id, { content: e.target.value })}
                          className="w-full text-[12px] text-[#6A6A6A] bg-transparent resize-none h-24 focus:outline-none font-medium leading-relaxed"
                        />
                      </div>
                      <div className="flex items-center justify-end gap-2 border-t border-[#FCFBF8] pt-2 mt-2">
                        <button
                          onClick={() => updateNote(client._id, note._id, { pinned: !note.pinned })}
                          className="text-[11px] text-[#6A6A6A] hover:text-[#111111] font-semibold cursor-pointer"
                        >
                          {note.pinned ? "Unpin" : "Pin"}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* MESSAGES TAB */}
            {activeTab === "messages" && (
              <div className="flex flex-col h-[420px] justify-between">
                <div className="p-3 border-b border-[#E9E3DA] flex justify-between items-center shrink-0">
                  <span className="text-[12.5px] font-bold text-[#111111]">Thread Conversation</span>
                  <span className="h-2.5 w-2.5 rounded-full bg-emerald-500 animate-pulse" />
                </div>

                <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-4 scrollbar-none">
                  {client.messages.map((msg) => (
                    <div
                      key={msg._id}
                      className={`flex flex-col max-w-[70%] ${msg.sender === "studio" ? "ml-auto items-end" : "mr-auto items-start"}`}
                    >
                      <div className={`p-3 rounded-2xl text-[12.5px] leading-relaxed border ${
                        msg.sender === "studio"
                          ? "bg-[#111111] text-white border-[#111111] rounded-tr-none font-semibold"
                          : "bg-[#FCFBF8] text-[#111111] border-[#E9E3DA] rounded-tl-none font-medium"
                      }`}>
                        {msg.text}
                      </div>
                      <span className="text-[9.5px] text-[#6A6A6A] mt-1 font-mono">{msg.timestamp}</span>
                    </div>
                  ))}
                </div>

                <form onSubmit={handleSendMessageSubmit} className="flex gap-2 border-t border-[#E9E3DA] p-3 shrink-0">
                  <input
                    type="text"
                    placeholder="Type client message..."
                    value={chatMessage}
                    onChange={(e) => setChatMessage(e.target.value)}
                    className="flex-1 px-4 py-2 rounded-xl bg-[#FCFBF8] border border-[#E9E3DA] text-[13px] text-[#111111] focus:outline-none placeholder-[#6A6A6A]"
                  />
                  <button type="submit" className="p-2.5 rounded-xl bg-[#111111] text-white hover:bg-[#222222] transition-colors cursor-pointer">
                    <Send size={14} />
                  </button>
                </form>
              </div>
            )}

            {/* ACTIVITY TAB */}
            {activeTab === "activity" && (
              <div className="flex flex-col gap-5">
                <h3 className="text-[15px] font-bold text-[#111111] mb-2">Live Logs Feed</h3>
                <div className="flex flex-col gap-4 relative pl-3 border-l border-[#E9E3DA]">
                  {client.activity.map((act) => (
                    <div key={act._id} className="relative text-[12.5px]">
                      <span className="absolute -left-[16.5px] top-1.5 w-2 h-2 rounded-full bg-emerald-500" />
                      <p className="text-[#111111] font-semibold">{act.text}</p>
                      <span className="text-[10px] text-[#6A6A6A] block mt-1 font-mono">{act.timestamp}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* SETTINGS TAB */}
            {activeTab === "settings" && (
              <div className="flex flex-col gap-6 text-[#111111]">
                <h3 className="text-[15px] font-bold text-[#111111]">Workspace Settings</h3>
                <div className="flex flex-col gap-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex flex-col gap-1.5">
                      <span className="text-[10px] font-mono text-[#6A6A6A] uppercase font-bold">Contact Name</span>
                      <input
                        type="text"
                        value={clientSettingsName}
                        onChange={(e) => setClientSettingsName(e.target.value)}
                        className="px-3 py-2 bg-[#FCFBF8] border border-[#E9E3DA] rounded-lg text-[13px]"
                      />
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <span className="text-[10px] font-mono text-[#6A6A6A] uppercase font-bold">Company Name</span>
                      <input
                        type="text"
                        value={clientSettingsCompany}
                        onChange={(e) => setClientSettingsCompany(e.target.value)}
                        className="px-3 py-2 bg-[#FCFBF8] border border-[#E9E3DA] rounded-lg text-[13px]"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    <div className="flex flex-col gap-1.5">
                      <span className="text-[10px] font-mono text-[#6A6A6A] uppercase font-bold">Industry Sector</span>
                      <input
                        type="text"
                        value={clientSettingsIndustry}
                        onChange={(e) => setClientSettingsIndustry(e.target.value)}
                        className="px-3 py-2 bg-[#FCFBF8] border border-[#E9E3DA] rounded-lg text-[13px]"
                      />
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <span className="text-[10px] font-mono text-[#6A6A6A] uppercase font-bold">Budget (INR)</span>
                      <input
                        type="number"
                        value={clientSettingsBudget}
                        onChange={(e) => setClientSettingsBudget(e.target.value)}
                        className="px-3 py-2 bg-[#FCFBF8] border border-[#E9E3DA] rounded-lg text-[13px]"
                      />
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <span className="text-[10px] font-mono text-[#6A6A6A] uppercase font-bold">Delivery Deadline</span>
                      <input
                        type="date"
                        value={clientSettingsDelivery}
                        onChange={(e) => setClientSettingsDelivery(e.target.value)}
                        className="px-3 py-1.5 bg-[#FCFBF8] border border-[#E9E3DA] rounded-lg text-[13px]"
                      />
                    </div>
                  </div>

                  <button
                    onClick={handleSaveClientSettings}
                    className="self-end px-4 py-2 bg-black text-white font-bold text-[12.5px] rounded-lg mt-2"
                  >
                    Save Changes
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right side Info Sidebar (col-span-1) */}
        <div className="flex flex-col gap-4">
          <div className="bg-white border border-[#E9E3DA] rounded-2xl p-5 flex flex-col gap-4 shadow-sm">
            <h3 className="text-[12.5px] font-bold text-[#111111] border-b border-[#E9E3DA] pb-2.5 uppercase tracking-wider font-mono">
              Lead Parameters
            </h3>

            {/* Delivery Stage drop menu selection */}
            <div className="flex flex-col gap-1">
              <label className="text-[10px] font-mono text-[#6A6A6A] uppercase font-bold">Delivery Stage</label>
              <select
                value={client.stage}
                onChange={(e: any) => updateClientStage(client._id, e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-[#FCFBF8] border border-[#E9E3DA] text-[12.5px] text-[#111111] focus:outline-none cursor-pointer mt-1"
              >
                {[
                  "Lead Created",
                  "Discovery Call",
                  "Meeting Scheduled",
                  "Requirements Received",
                  "Proposal Generated",
                  "Quotation Generated",
                  "Client Approval",
                  "Agreement Generated",
                  "Advance Payment Received",
                  "Project Created Automatically",
                  "Design Phase",
                  "Development",
                  "Testing",
                  "Client Review",
                  "Deployment",
                  "Final Payment",
                  "Project Completed",
                  "Maintenance",
                  "Upsell"
                ].map((st) => (
                  <option key={st} value={st}>
                    {st}
                  </option>
                ))}
              </select>
            </div>

            {/* Budget Display */}
            <div>
              <span className="text-[10px] font-mono text-[#6A6A6A] uppercase font-bold">Project Retainer</span>
              <div className="text-[18px] font-extrabold text-[#111111] mt-1">₹{client.budget.toLocaleString()}</div>
            </div>

            {/* Assignee */}
            <div>
              <span className="text-[10px] font-mono text-[#6A6A6A] uppercase font-bold">Assigned Owner</span>
              <div className="flex items-center gap-2 mt-1.5">
                <div className="w-5.5 h-5.5 rounded-full bg-[#FCFBF8] flex items-center justify-center text-[10px] text-[#111111] border border-[#E9E3DA]">
                  <User size={11} />
                </div>
                <span className="text-[13px] font-bold text-[#111111]">{client.assignee}</span>
              </div>
            </div>

            {/* Dates */}
            <div className="grid grid-cols-2 gap-4 pt-3 border-t border-[#E9E3DA] mt-1">
              <div>
                <span className="text-[10px] font-mono text-[#6A6A6A] uppercase font-bold">Start Date</span>
                <span className="text-[12.5px] font-semibold text-[#111111] block mt-1">{client.startDate}</span>
              </div>
              <div>
                <span className="text-[10px] font-mono text-[#6A6A6A] uppercase font-bold">Due Delivery</span>
                <span className="text-[12.5px] font-semibold text-[#111111] block mt-1">{client.expectedDelivery}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
