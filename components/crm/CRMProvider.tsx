"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  getCRMClients,
  saveCRMClient,
  deleteCRMClient,
  updateClientStage,
  addCRMTask,
  toggleCRMTask,
  addCRMInvoice,
  updateCRMInvoiceStatus,
  saveCRMDocument,
  addCRMMeeting,
  addCRMFile,
  addCRMMessage
} from "@/lib/actions/crm";

export type CRMView =
  | "dashboard"
  | "clients"
  | "kanban"
  | "projects"
  | "tasks"
  | "calendar"
  | "invoices"
  | "proposals"
  | "agreements"
  | "files"
  | "messages"
  | "meetings"
  | "analytics"
  | "settings";

export interface CRMTask {
  _id: string;
  id?: string;
  title: string;
  priority: "High" | "Medium" | "Low";
  assignee: string;
  deadline: string;
  status: "Pending" | "In Progress" | "Completed";
  progress: number;
}

export interface CRMInvoice {
  _id: string;
  id?: string;
  number: string;
  amount: number;
  dueDate: string;
  status: "Paid" | "Pending" | "Overdue";
  items: { description: string; qty: number; rate: number }[];
  paidAmount: number;
}

export interface CRMQuotation {
  _id: string;
  id?: string;
  items: { description: string; qty: number; rate: number }[];
  discount: number;
  tax: number;
  subtotal: number;
  total: number;
  terms: string;
  validity: string;
  status: "Draft" | "Sent" | "Approved" | "Invoiced";
}

export interface CRMProposal {
  _id: string;
  id?: string;
  title: string;
  contentBlocks: string[];
  status: "Draft" | "Sent" | "Approved" | "Declined";
  version: number;
}

export interface CRMAgreement {
  _id: string;
  id?: string;
  scope: string;
  timeline: string;
  paymentTerms: string;
  signedStatus: "Unsigned" | "Sent" | "Signed";
  signedAt?: string;
}

export interface CRMMeeting {
  _id: string;
  id?: string;
  title: string;
  date: string;
  time: string;
  link: string;
  notes: string;
  actionItems?: string[];
  status: "Upcoming" | "Completed";
}

export interface CRMFile {
  _id: string;
  id?: string;
  name: string;
  category: "Logo" | "Brand Assets" | "Images" | "Proposal" | "Agreement" | "Invoices" | "Source Files" | "Credentials";
  size: string;
  uploadedAt: string;
  url: string;
}

export interface CRMNote {
  _id: string;
  id?: string;
  title: string;
  content: string;
  updatedAt: string;
  pinned: boolean;
}

export interface CRMMessage {
  _id: string;
  id?: string;
  sender: "client" | "studio";
  text: string;
  timestamp: string;
}

export interface CRMActivity {
  _id: string;
  id?: string;
  text: string;
  timestamp: string;
  type: "document" | "invoice" | "meeting" | "progress" | "chat";
}

export interface CRMClient {
  _id: string;
  id?: string; // fallback alias
  name: string;
  company: string;
  logo: string;
  industry: string;
  budget: number;
  stage:
    | "Lead Created"
    | "Discovery Call"
    | "Meeting Scheduled"
    | "Requirements Received"
    | "Proposal Generated"
    | "Quotation Generated"
    | "Client Approval"
    | "Agreement Generated"
    | "Advance Payment Received"
    | "Project Created Automatically"
    | "Design Phase"
    | "Development"
    | "Testing"
    | "Client Review"
    | "Deployment"
    | "Final Payment"
    | "Project Completed"
    | "Maintenance"
    | "Upsell";
  priority: "High" | "Medium" | "Low";
  assignee: string;
  progress: number;
  countryFlag: string;
  startDate: string;
  expectedDelivery: string;
  tasks: CRMTask[];
  files: CRMFile[];
  invoices: CRMInvoice[];
  quotations: CRMQuotation[];
  proposals: CRMProposal[];
  agreements: CRMAgreement[];
  meetings: CRMMeeting[];
  notes: CRMNote[];
  messages: CRMMessage[];
  activity: CRMActivity[];
}

interface CRMContextType {
  view: CRMView;
  setView: (view: CRMView) => void;
  clients: CRMClient[];
  activeClientId: string | null;
  setActiveClientId: (id: string | null) => void;
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  aiActive: boolean;
  setAiActive: (active: boolean) => void;
  loading: boolean;
  refreshClients: () => Promise<void>;
  addClient: (client: Partial<CRMClient>) => Promise<void>;
  updateClientStage: (id: string, stage: CRMClient["stage"]) => Promise<void>;
  updateClient: (id: string, updates: Partial<CRMClient>) => Promise<void>;
  addTask: (clientId: string, task: Omit<CRMTask, "_id" | "id">) => Promise<void>;
  toggleTask: (clientId: string, taskId: string) => Promise<void>;
  addInvoice: (clientId: string, invoice: Omit<CRMInvoice, "_id" | "id">) => Promise<void>;
  updateInvoiceStatus: (clientId: string, invoiceId: string, status: CRMInvoice["status"]) => Promise<void>;
  saveDocument: (clientId: string, docType: "proposal" | "quotation" | "agreement", docData: any) => Promise<void>;
  addMeeting: (clientId: string, meeting: Omit<CRMMeeting, "_id" | "id">) => Promise<void>;
  addMessage: (clientId: string, sender: "client" | "studio", text: string) => Promise<void>;
  addFile: (clientId: string, file: Omit<CRMFile, "_id" | "id">) => Promise<void>;
  addNote: (clientId: string, note: Omit<CRMNote, "_id" | "id">) => Promise<void>;
  updateNote: (clientId: string, noteId: string, noteUpdates: Partial<CRMNote>) => Promise<void>;
  globalActivities: CRMActivity[];
  isAddClientOpen: boolean;
  setIsAddClientOpen: (open: boolean) => void;
  stats: {
    totalRevenue: number;
    activeClients: number;
    completedProjects: number;
    pendingPayments: number;
    upcomingMeetings: number;
  };
}

const CRMContext = createContext<CRMContextType | undefined>(undefined);

export const CRMProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Read initial view and client parameters from URL
  const initialView = (searchParams.get("view") as CRMView) || "dashboard";
  const initialClient = searchParams.get("client") || null;

  const [view, _setView] = useState<CRMView>(initialView);
  const [clients, setClients] = useState<CRMClient[]>([]);
  const [activeClientId, _setActiveClientId] = useState<string | null>(initialClient);
  const [isAddClientOpen, setIsAddClientOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [aiActive, setAiActive] = useState(false);
  const [globalActivities, setGlobalActivities] = useState<CRMActivity[]>([]);
  const [loading, setLoading] = useState(true);

  // Sync state transitions with URL search params
  const setView = (newView: CRMView) => {
    _setView(newView);
    const params = new URLSearchParams(window.location.search);
    params.set("view", newView);
    router.push(`${window.location.pathname}?${params.toString()}`);
  };

  const setActiveClientId = (id: string | null) => {
    _setActiveClientId(id);
    const params = new URLSearchParams(window.location.search);
    if (id) {
      params.set("client", id);
    } else {
      params.delete("client");
    }
    router.push(`${window.location.pathname}?${params.toString()}`);
  };

  // Fetch initial clients list from DB
  const refreshClients = async () => {
    try {
      setLoading(true);
      const data = await getCRMClients();
      setClients(data as any);
    } catch (error) {
      console.error("Failed to load CRM clients from database:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshClients();
  }, []);

  // Compute global activities from all client logs
  useEffect(() => {
    const allActs: CRMActivity[] = [];
    clients.forEach((c) => {
      if (c.activity) {
        c.activity.forEach((act) => {
          allActs.push({
            ...act,
            text: `[${c.company}] ${act.text}`,
          });
        });
      }
    });
    // Sort descending by timestamp
    allActs.sort((a, b) => b.timestamp.localeCompare(a.timestamp));
    setGlobalActivities(allActs);
  }, [clients]);

  // Create Client
  const addClient = async (newClient: Partial<CRMClient>) => {
    try {
      const saved = await saveCRMClient(newClient);
      setClients((prev) => [saved as any, ...prev]);
    } catch (e) {
      console.error(e);
    }
  };

  // Update Client lifecycle stage
  const updateStage = async (id: string, stage: CRMClient["stage"]) => {
    try {
      const updated = await updateClientStage(id, stage);
      setClients((prev) => prev.map((c) => (c._id === id ? (updated as any) : c)));
    } catch (e) {
      console.error(e);
    }
  };

  // Generic Client edit
  const editClient = async (id: string, updates: Partial<CRMClient>) => {
    try {
      const saved = await saveCRMClient({ _id: id, ...updates });
      setClients((prev) => prev.map((c) => (c._id === id ? (saved as any) : c)));
    } catch (e) {
      console.error(e);
    }
  };

  // Add Task
  const addTask = async (clientId: string, task: Omit<CRMTask, "_id" | "id">) => {
    try {
      const updated = await addCRMTask(clientId, task);
      setClients((prev) => prev.map((c) => (c._id === clientId ? (updated as any) : c)));
    } catch (e) {
      console.error(e);
    }
  };

  // Toggle Task Status
  const toggleTask = async (clientId: string, taskId: string) => {
    try {
      const updated = await toggleCRMTask(clientId, taskId);
      setClients((prev) => prev.map((c) => (c._id === clientId ? (updated as any) : c)));
    } catch (e) {
      console.error(e);
    }
  };

  // Add Invoice
  const addInvoice = async (clientId: string, invoice: Omit<CRMInvoice, "_id" | "id">) => {
    try {
      const updated = await addCRMInvoice(clientId, invoice);
      setClients((prev) => prev.map((c) => (c._id === clientId ? (updated as any) : c)));
    } catch (e) {
      console.error(e);
    }
  };

  // Update Invoice Status
  const updateInvoiceStatusAction = async (clientId: string, invoiceId: string, status: CRMInvoice["status"]) => {
    try {
      const updated = await updateCRMInvoiceStatus(clientId, invoiceId, status);
      setClients((prev) => prev.map((c) => (c._id === clientId ? (updated as any) : c)));
    } catch (e) {
      console.error(e);
    }
  };

  // Save Document
  const saveDocument = async (clientId: string, docType: "proposal" | "quotation" | "agreement", docData: any) => {
    try {
      const updated = await saveCRMDocument(clientId, docType, docData);
      setClients((prev) => prev.map((c) => (c._id === clientId ? (updated as any) : c)));
    } catch (e) {
      console.error(e);
    }
  };

  // Add Meeting
  const addMeeting = async (clientId: string, meeting: Omit<CRMMeeting, "_id" | "id">) => {
    try {
      const updated = await addCRMMeeting(clientId, meeting);
      setClients((prev) => prev.map((c) => (c._id === clientId ? (updated as any) : c)));
    } catch (e) {
      console.error(e);
    }
  };

  // Add Message
  const addMessage = async (clientId: string, sender: "client" | "studio", text: string) => {
    try {
      const messageData = {
        sender,
        text,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      };
      const updated = await addCRMMessage(clientId, messageData);
      setClients((prev) => prev.map((c) => (c._id === clientId ? (updated as any) : c)));
    } catch (e) {
      console.error(e);
    }
  };

  // Add File
  const addFile = async (clientId: string, file: Omit<CRMFile, "_id" | "id">) => {
    try {
      const fileData = {
        ...file,
        uploadedAt: new Date().toISOString().split("T")[0],
      };
      const updated = await addCRMFile(clientId, fileData);
      setClients((prev) => prev.map((c) => (c._id === clientId ? (updated as any) : c)));
    } catch (e) {
      console.error(e);
    }
  };

  // Local Notes State Management (since notes are sub-documents but don't have automations, we can update client direct)
  const addNote = async (clientId: string, note: Omit<CRMNote, "_id" | "id">) => {
    const client = clients.find((c) => c._id === clientId);
    if (!client) return;
    const newNote = { ...note, _id: `note_${Date.now()}`, updatedAt: new Date().toISOString().split("T")[0] };
    const notes = [newNote, ...(client.notes || [])];
    await editClient(clientId, { notes } as any);
  };

  const updateNote = async (clientId: string, noteId: string, noteUpdates: Partial<CRMNote>) => {
    const client = clients.find((c) => c._id === clientId);
    if (!client) return;
    const notes = (client.notes || []).map((n) =>
      n._id === noteId ? { ...n, ...noteUpdates, updatedAt: new Date().toISOString().split("T")[0] } : n
    );
    await editClient(clientId, { notes } as any);
  };

  // Compute Metrics Dashboard Stats
  const totalRevenue = clients
    .flatMap((c) => c.invoices || [])
    .filter((inv) => inv.status === "Paid")
    .reduce((sum, inv) => sum + inv.amount, 0);

  const pendingPayments = clients
    .flatMap((c) => c.invoices || [])
    .filter((inv) => inv.status === "Pending")
    .reduce((sum, inv) => sum + inv.amount, 0);

  const activeClientsCount = clients.filter(
    (c) => c.stage !== "Project Completed" && c.stage !== "Lead Created"
  ).length;

  const completedProjects = clients.filter((c) => c.stage === "Project Completed").length;

  const upcomingMeetings = clients
    .flatMap((c) => c.meetings || [])
    .filter((m) => m.status === "Upcoming").length;

  const stats = {
    totalRevenue,
    activeClients: activeClientsCount,
    completedProjects,
    pendingPayments,
    upcomingMeetings,
  };

  return (
    <CRMContext.Provider
      value={{
        view,
        setView,
        clients,
        activeClientId,
        setActiveClientId,
        searchQuery,
        setSearchQuery,
        aiActive,
        setAiActive,
        loading,
        refreshClients,
        addClient,
        updateClientStage: updateStage,
        updateClient: editClient,
        addTask,
        toggleTask,
        addInvoice,
        updateInvoiceStatus: updateInvoiceStatusAction,
        saveDocument,
        addMeeting,
        addMessage,
        addFile,
        addNote,
        updateNote,
        globalActivities,
        isAddClientOpen,
        setIsAddClientOpen,
        stats,
      }}
    >
      {children}
    </CRMContext.Provider>
  );
};

export const useCRM = () => {
  const context = useContext(CRMContext);
  if (!context) {
    throw new Error("useCRM must be used within a CRMProvider");
  }
  return context;
};
