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
  addProjectExpense,
  deleteProjectExpense,
  addProjectPayment,
  deleteProjectPayment,
  updateProjectTask,
  deleteProjectTask,
  getCRMSettings,
  updateCRMSettings,
} from "@/lib/actions/crm";
import {
  getLeads,
  saveLead,
  deleteLead as deleteLeadAction,
  updateLeadStatus as updateLeadStatusAction,
  addLeadFollowUp as addLeadFollowUpAction,
  completeLeadFollowUp as completeLeadFollowUpAction,
  addLeadActivity as addLeadActivityAction,
  convertLeadToCustomer as convertLeadToCustomerAction,
  getFollowUpFeed,
} from "@/lib/actions/leads";
import {
  getReferences,
  saveReference as saveReferenceAction,
  deleteReference as deleteReferenceAction,
  getReferralDetail as getReferralDetailAction,
} from "@/lib/actions/references";
import {
  getFreelancers,
  saveFreelancer as saveFreelancerAction,
  deleteFreelancer as deleteFreelancerAction,
  addFreelancerPayment as addFreelancerPaymentAction,
  updateFreelancerPaymentStatus as updateFreelancerPaymentStatusAction,
} from "@/lib/actions/freelancers";
import {
  getCRMProjects,
  saveCRMProject as saveCRMProjectAction,
  deleteCRMProject as deleteCRMProjectAction,
  updateCRMProjectStatus as updateCRMProjectStatusAction,
  assignFreelancersToProject as assignFreelancersToProjectAction,
  addCRMProjectPayment as addCRMProjectPaymentAction,
  deleteCRMProjectPayment as deleteCRMProjectPaymentAction,
  addCRMProjectExpense as addCRMProjectExpenseAction,
  getAllPayments,
} from "@/lib/actions/crmProjects";

export type CRMView =
  | "dashboard"
  | "leads"
  | "projects"
  | "crm-projects"
  | "freelancers"
  | "references"
  | "activities"
  | "payments"
  | "expenses"
  | "revenue"
  | "settings"
  | "clients"
  | "client-tree";

export interface LeadFollowUp {
  _id?: string;
  type: "Call" | "WhatsApp" | "Meeting" | "Email" | "Other";
  date: string;
  time?: string;
  notes?: string;
  completed?: boolean;
  completedAt?: string;
}

export interface LeadActivity {
  _id?: string;
  text: string;
  timestamp: string;
  type: string;
}

export interface Lead {
  _id: string;
  name: string;
  company?: string;
  phone?: string;
  whatsapp?: string;
  email?: string;
  location?: string;
  source: "Direct" | "WhatsApp" | "Instagram" | "Website" | "Referral" | "LinkedIn" | "Existing Customer" | "Freelancer" | "Other";
  referenceId?: string | { _id: string; name: string; type: string } | null;
  interestedService?: string;
  estimatedBudget?: number;
  status: "New" | "Contacted" | "Discussion" | "Proposal Sent" | "Negotiation" | "Converted" | "Lost";
  priority: "High" | "Medium" | "Low";
  assignedTo?: string;
  nextFollowUp?: { date: string; time?: string; type: string };
  lastContacted?: string;
  notes?: string;
  lostReason?: string;
  followUps?: LeadFollowUp[];
  activity?: LeadActivity[];
  convertedCustomerId?: string | null;
  createdAt?: string;
}

export interface ReferenceStats {
  totalLeadsReferred: number;
  convertedLeads: number;
  lostLeads: number;
  activeLeads: number;
  totalBusinessGenerated: number;
}

export interface ReferencePerson {
  _id: string;
  name: string;
  phone?: string;
  whatsapp?: string;
  email?: string;
  type: "Existing Customer" | "Friend" | "Business Contact" | "Freelancer" | "Partner" | "Other";
  notes?: string;
  pendingReward?: number;
  paidReward?: number;
  stats?: ReferenceStats;
}

export interface FreelancerPayment {
  _id?: string;
  date: string;
  project?: string;
  projectId?: string;
  amount: number;
  status: "Paid" | "Pending";
  notes?: string;
}

export interface FreelancerStats {
  activeProjectsCount: number;
  completedProjectsCount: number;
  totalProjectsCount: number;
  totalEarnings: number;
  pendingPayment: number;
}

export interface Freelancer {
  _id: string;
  name: string;
  photo?: string;
  phone?: string;
  whatsapp?: string;
  email?: string;
  location?: string;
  skills?: string[];
  specialization?: string;
  experience?: string;
  portfolioUrl?: string;
  availability?: "Available" | "Working" | "Busy" | "Inactive";
  rateType?: "Hourly" | "Project";
  rate?: number;
  paymentDetails?: string;
  notes?: string;
  status: "Available" | "Working" | "Busy" | "Inactive";
  payments?: FreelancerPayment[];
  activity?: LeadActivity[];
  stats?: FreelancerStats;
  assignedProjects?: Array<{ _id: string; name: string; client: string; status: string; projectValue: number; freelancerCost: number }>;
}

export interface AssignedFreelancerRef {
  freelancerId: string;
  name: string;
  agreedCost: number;
}

export interface CRMProjectItem {
  _id: string;
  name: string;
  customerId: string | { _id: string; company: string; name?: string };
  service?: string;
  assignedFreelancers?: AssignedFreelancerRef[];
  startDate?: string;
  deadline?: string;
  projectValue: number;
  freelancerCost: number;
  status: "Not Started" | "In Progress" | "On Hold" | "Completed" | "Cancelled";
  notes?: string;
  payments?: any[];
  expenses?: any[];
  activity?: LeadActivity[];
  amountReceived?: number;
  amountPending?: number;
  totalExpenses?: number;
  grossProfit?: number;
}

export interface CRMSubtask {
  _id?: string;
  id?: string;
  title: string;
  completed: boolean;
}

export interface CRMTask {
  _id: string;
  id?: string;
  title: string;
  description?: string;
  priority: "High" | "Medium" | "Low";
  assignee: string;
  dueDate?: string;
  deadline?: string;
  status: "Pending" | "In Progress" | "Completed";
  completed?: boolean;
  progress: number;
  completionTime?: string;
  order?: number;
  subtasks?: CRMSubtask[];
}

export interface CRMExpense {
  _id: string;
  id?: string;
  name: string;
  category: string; // Material Cost, Miscellaneous Expenses, Vendor, Software, etc.
  vendor?: string;
  amount: number;
  paymentMethod: string;
  date: string;
  notes?: string;
  attachment?: string;
}

export interface CRMPayment {
  _id: string;
  id?: string;
  amount: number;
  paymentDate: string;
  referenceNumber?: string;
  paymentMethod: string;
  notes?: string;
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

export interface CRMActivity {
  _id: string;
  id?: string;
  text: string;
  timestamp: string;
  type: "document" | "invoice" | "meeting" | "progress" | "chat" | "expense" | "payment" | "task";
}

export interface CRMClient {
  _id: string;
  id?: string;
  name: string;
  company: string;
  logo: string;
  industry: string;
  budget: number;
  projectCost?: number;
  stage:
    | "Active"
    | "Completed"
    | "Pending"
    | "On Hold"
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
  status?: "Not Started" | "Ongoing" | "Completed";
  priority: "High" | "Medium" | "Low";
  assignee: string;
  progress: number;
  countryFlag: string;
  startDate: string;
  expectedDelivery: string;
  referredBy?: string | null;
  referrerName?: string;
  referralCommissionPct?: number;
  clientType?: "Direct" | "Referred" | "Partner";
  phone?: string;
  whatsapp?: string;
  email?: string;
  location?: string;
  source?: string;
  leadId?: string | null;
  referenceId?: string | { _id: string; name: string; type?: string } | null;
  convertedAt?: string;
  tasks: CRMTask[];
  expenses: CRMExpense[];
  payments: CRMPayment[];
  invoices?: CRMInvoice[];
  files?: any[];
  activity?: CRMActivity[];
}

export interface CRMSettingsState {
  businessName: string;
  currency: string;
  partner1Name: string;
  partner1Share: number;
  partner2Name: string;
  partner2Share: number;
  taxRate: number;
  theme: string;
  logoUrl: string;
}

interface CRMContextType {
  view: CRMView;
  setView: (view: CRMView) => void;
  clients: CRMClient[];
  activeClientId: string | null;
  setActiveClientId: (id: string | null) => void;
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  loading: boolean;
  refreshClients: () => Promise<void>;
  addClient: (client: Partial<CRMClient>) => Promise<void>;
  deleteClient: (id: string) => Promise<void>;
  updateClientStage: (id: string, stage: CRMClient["stage"]) => Promise<void>;
  updateClient: (id: string, updates: Partial<CRMClient>) => Promise<void>;
  
  // Task Handlers
  addTask: (clientId: string, task: Omit<CRMTask, "_id" | "id">) => Promise<void>;
  updateTask: (clientId: string, taskId: string, updates: Partial<CRMTask>) => Promise<void>;
  toggleTask: (clientId: string, taskId: string) => Promise<void>;
  deleteTask: (clientId: string, taskId: string) => Promise<void>;
  
  // Financial Handlers
  addExpense: (clientId: string, expense: Omit<CRMExpense, "_id" | "id">) => Promise<void>;
  deleteExpense: (clientId: string, expenseId: string) => Promise<void>;
  addPayment: (clientId: string, payment: Omit<CRMPayment, "_id" | "id">) => Promise<void>;
  deletePayment: (clientId: string, paymentId: string) => Promise<void>;

  // Settings
  settings: CRMSettingsState;
  updateSettings: (newSettings: Partial<CRMSettingsState>) => Promise<void>;

  globalActivities: CRMActivity[];
  isAddClientOpen: boolean;
  setIsAddClientOpen: (open: boolean) => void;

  // Live Financial & Overview Stats
  financialStats: {
    totalRevenue: number;
    revenueThisMonth: number;
    revenuePending: number;
    amountReceived: number;
    outstandingPayments: number;
    
    totalExpenses: number;
    expensesThisMonth: number;
    materialCost: number;
    miscExpenses: number;
    otherExpenses: number;
    outstandingClients: Array<{
      id: string;
      name: string;
      company: string;
      budget: number;
      received: number;
      pending: number;
      stage: string;
    }>;
    
    totalReferralCommissions: number;
    totalReferredClientsCount: number;
    
    grossProfit: number;
    netProfit: number;
    profitMarginPct: number;

    partner1: {
      name: string;
      sharePct: number;
      revenueShare: number;
      expensesShare: number;
      netShare: number;
      totalPayable: number;
    };
    partner2: {
      name: string;
      sharePct: number;
      revenueShare: number;
      expensesShare: number;
      netShare: number;
      totalPayable: number;
    };

    activeProjectsCount: number;
    completedProjectsCount: number;
    pendingProjectsCount: number;
    onHoldProjectsCount: number;
  };

  // Leads
  leads: Lead[];
  refreshLeads: () => Promise<void>;
  addLead: (lead: Partial<Lead>) => Promise<void>;
  updateLead: (id: string, updates: Partial<Lead>) => Promise<void>;
  deleteLead: (id: string) => Promise<void>;
  updateLeadStatus: (id: string, status: Lead["status"], lostReason?: string) => Promise<void>;
  addLeadFollowUp: (id: string, followUp: LeadFollowUp) => Promise<void>;
  completeLeadFollowUp: (id: string, followUpId: string) => Promise<void>;
  addLeadActivity: (id: string, text: string, type?: string) => Promise<void>;
  convertLeadToCustomer: (id: string) => Promise<string | null>;
  followUpFeed: { overdue: any[]; dueToday: any[]; upcoming: any[] };

  // References
  references: ReferencePerson[];
  refreshReferences: () => Promise<void>;
  addReference: (ref: Partial<ReferencePerson>) => Promise<void>;
  updateReference: (id: string, updates: Partial<ReferencePerson>) => Promise<void>;
  deleteReference: (id: string) => Promise<void>;
  getReferralDetail: (id: string) => Promise<{ leads: any[]; customers: any[] }>;

  // Freelancers
  freelancers: Freelancer[];
  refreshFreelancers: () => Promise<void>;
  addFreelancer: (f: Partial<Freelancer>) => Promise<void>;
  updateFreelancer: (id: string, updates: Partial<Freelancer>) => Promise<void>;
  deleteFreelancer: (id: string) => Promise<void>;
  addFreelancerPayment: (freelancerId: string, payment: FreelancerPayment) => Promise<void>;
  updateFreelancerPaymentStatus: (freelancerId: string, paymentId: string, status: string) => Promise<void>;

  // CRM Projects (Customer -> many Projects)
  crmProjects: CRMProjectItem[];
  refreshCRMProjects: () => Promise<void>;
  addCRMProject: (project: Partial<CRMProjectItem>) => Promise<void>;
  updateCRMProject: (id: string, updates: Partial<CRMProjectItem>) => Promise<void>;
  deleteCRMProject: (id: string) => Promise<void>;
  updateCRMProjectStatus: (id: string, status: CRMProjectItem["status"]) => Promise<void>;
  assignFreelancersToProject: (projectId: string, assignments: { freelancerId: string; agreedCost: number }[]) => Promise<void>;
  addCRMProjectPayment: (projectId: string, payment: any) => Promise<void>;
  deleteCRMProjectPayment: (projectId: string, paymentId: string) => Promise<void>;
  addCRMProjectExpense: (projectId: string, expense: any) => Promise<void>;

  // Aggregated Payments Ledger
  allPayments: any[];
  refreshAllPayments: () => Promise<void>;
}

const CRMContext = createContext<CRMContextType | undefined>(undefined);

export const CRMProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const router = useRouter();
  const searchParams = useSearchParams();

  const initialView = (searchParams.get("view") as CRMView) || "dashboard";
  const initialClient = searchParams.get("client") || null;

  const [view, _setView] = useState<CRMView>(initialView);
  const [clients, setClients] = useState<CRMClient[]>([]);
  const [activeClientId, _setActiveClientId] = useState<string | null>(initialClient);
  const [isAddClientOpen, setIsAddClientOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [globalActivities, setGlobalActivities] = useState<CRMActivity[]>([]);
  const [loading, setLoading] = useState(true);

  const [leads, setLeads] = useState<Lead[]>([]);
  const [references, setReferences] = useState<ReferencePerson[]>([]);
  const [freelancers, setFreelancers] = useState<Freelancer[]>([]);
  const [crmProjects, setCRMProjects] = useState<CRMProjectItem[]>([]);
  const [followUpFeed, setFollowUpFeed] = useState<{ overdue: any[]; dueToday: any[]; upcoming: any[] }>({
    overdue: [],
    dueToday: [],
    upcoming: [],
  });
  const [allPayments, setAllPayments] = useState<any[]>([]);

  const [settings, setSettingsState] = useState<CRMSettingsState>({
    businessName: "Growth Bridge",
    currency: "₹",
    partner1Name: "Prajwal",
    partner1Share: 50,
    partner2Name: "Shaz",
    partner2Share: 50,
    taxRate: 18,
    theme: "light",
    logoUrl: "/logo.png",
  });

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

  const refreshClients = async () => {
    try {
      setLoading(true);
      const [data, fetchedSettings] = await Promise.all([
        getCRMClients(),
        getCRMSettings().catch(() => null),
      ]);
      setClients(data as any);
      if (fetchedSettings) {
        setSettingsState((prev) => ({ ...prev, ...fetchedSettings }));
      }
    } catch (error) {
      console.error("Failed to load CRM clients:", error);
    } finally {
      setLoading(false);
    }
  };

  const refreshLeads = async () => {
    try {
      const data = await getLeads();
      setLeads(data as any);
    } catch (error) {
      console.error("Failed to load leads:", error);
    }
  };

  const refreshReferences = async () => {
    try {
      const data = await getReferences();
      setReferences(data as any);
    } catch (error) {
      console.error("Failed to load references:", error);
    }
  };

  const refreshFreelancers = async () => {
    try {
      const data = await getFreelancers();
      setFreelancers(data as any);
    } catch (error) {
      console.error("Failed to load freelancers:", error);
    }
  };

  const refreshCRMProjects = async () => {
    try {
      const data = await getCRMProjects();
      setCRMProjects(data as any);
    } catch (error) {
      console.error("Failed to load CRM projects:", error);
    }
  };

  const refreshFollowUpFeed = async () => {
    try {
      const data = await getFollowUpFeed();
      setFollowUpFeed(data as any);
    } catch (error) {
      console.error("Failed to load follow-up feed:", error);
    }
  };

  const refreshAllPayments = async () => {
    try {
      const data = await getAllPayments();
      setAllPayments(data as any);
    } catch (error) {
      console.error("Failed to load payments ledger:", error);
    }
  };

  useEffect(() => {
    refreshClients();
    refreshLeads();
    refreshReferences();
    refreshFreelancers();
    refreshCRMProjects();
    refreshFollowUpFeed();
    refreshAllPayments();
  }, []);

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
    allActs.sort((a, b) => b.timestamp.localeCompare(a.timestamp));
    setGlobalActivities(allActs);
  }, [clients]);

  // Client CRUD
  const addClient = async (newClient: Partial<CRMClient>) => {
    try {
      const saved = await saveCRMClient(newClient);
      setClients((prev) => [saved as any, ...prev]);
    } catch (e) {
      console.error(e);
    }
  };

  const deleteClient = async (id: string) => {
    try {
      await deleteCRMClient(id);
      setClients((prev) => prev.filter((c) => c._id !== id));
      if (activeClientId === id) {
        setActiveClientId(null);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const updateStage = async (id: string, stage: CRMClient["stage"]) => {
    try {
      const updated = await updateClientStage(id, stage);
      setClients((prev) => prev.map((c) => (c._id === id ? (updated as any) : c)));
    } catch (e) {
      console.error(e);
    }
  };

  const editClient = async (id: string, updates: Partial<CRMClient>) => {
    try {
      const saved = await saveCRMClient({ _id: id, ...updates });
      setClients((prev) => prev.map((c) => (c._id === id ? (saved as any) : c)));
    } catch (e) {
      console.error(e);
    }
  };

  // Task Actions
  const addTask = async (clientId: string, task: Omit<CRMTask, "_id" | "id">) => {
    try {
      const updated = await addCRMTask(clientId, task as any);
      setClients((prev) => prev.map((c) => (c._id === clientId ? (updated as any) : c)));
    } catch (e) {
      console.error(e);
    }
  };

  const updateTask = async (clientId: string, taskId: string, updates: Partial<CRMTask>) => {
    try {
      const updated = await updateProjectTask(clientId, taskId, updates);
      setClients((prev) => prev.map((c) => (c._id === clientId ? (updated as any) : c)));
    } catch (e) {
      console.error(e);
    }
  };

  const toggleTask = async (clientId: string, taskId: string) => {
    try {
      const updated = await toggleCRMTask(clientId, taskId);
      setClients((prev) => prev.map((c) => (c._id === clientId ? (updated as any) : c)));
    } catch (e) {
      console.error(e);
    }
  };

  const deleteTask = async (clientId: string, taskId: string) => {
    try {
      const updated = await deleteProjectTask(clientId, taskId);
      setClients((prev) => prev.map((c) => (c._id === clientId ? (updated as any) : c)));
    } catch (e) {
      console.error(e);
    }
  };

  // Expense Handlers
  const addExpense = async (clientId: string, expense: Omit<CRMExpense, "_id" | "id">) => {
    try {
      const updated = await addProjectExpense(clientId, expense);
      setClients((prev) => prev.map((c) => (c._id === clientId ? (updated as any) : c)));
    } catch (e) {
      console.error(e);
    }
  };

  const deleteExpense = async (clientId: string, expenseId: string) => {
    try {
      const updated = await deleteProjectExpense(clientId, expenseId);
      setClients((prev) => prev.map((c) => (c._id === clientId ? (updated as any) : c)));
    } catch (e) {
      console.error(e);
    }
  };

  // Payment Handlers
  const addPayment = async (clientId: string, payment: Omit<CRMPayment, "_id" | "id">) => {
    try {
      const updated = await addProjectPayment(clientId, payment);
      setClients((prev) => prev.map((c) => (c._id === clientId ? (updated as any) : c)));
    } catch (e) {
      console.error(e);
    }
  };

  const deletePayment = async (clientId: string, paymentId: string) => {
    try {
      const updated = await deleteProjectPayment(clientId, paymentId);
      setClients((prev) => prev.map((c) => (c._id === clientId ? (updated as any) : c)));
    } catch (e) {
      console.error(e);
    }
  };

  // Settings Handler
  const updateSettings = async (newSettings: Partial<CRMSettingsState>) => {
    try {
      const updated = await updateCRMSettings(newSettings);
      setSettingsState((prev) => ({ ...prev, ...updated }));
    } catch (e) {
      console.error(e);
    }
  };

  // ---- Lead Handlers ----
  const addLead = async (lead: Partial<Lead>) => {
    try {
      const saved = await saveLead(lead);
      setLeads((prev) => [saved as any, ...prev]);
      refreshFollowUpFeed();
    } catch (e) {
      console.error(e);
    }
  };

  const updateLead = async (id: string, updates: Partial<Lead>) => {
    try {
      const saved = await saveLead({ _id: id, ...updates });
      setLeads((prev) => prev.map((l) => (l._id === id ? (saved as any) : l)));
      refreshFollowUpFeed();
    } catch (e) {
      console.error(e);
    }
  };

  const deleteLead = async (id: string) => {
    try {
      await deleteLeadAction(id);
      setLeads((prev) => prev.filter((l) => l._id !== id));
    } catch (e) {
      console.error(e);
    }
  };

  const updateLeadStatus = async (id: string, status: Lead["status"], lostReason?: string) => {
    try {
      const updated = await updateLeadStatusAction(id, status, lostReason);
      setLeads((prev) => prev.map((l) => (l._id === id ? (updated as any) : l)));
    } catch (e) {
      console.error(e);
    }
  };

  const addLeadFollowUp = async (id: string, followUp: LeadFollowUp) => {
    try {
      const updated = await addLeadFollowUpAction(id, followUp);
      setLeads((prev) => prev.map((l) => (l._id === id ? (updated as any) : l)));
      refreshFollowUpFeed();
    } catch (e) {
      console.error(e);
    }
  };

  const completeLeadFollowUp = async (id: string, followUpId: string) => {
    try {
      const updated = await completeLeadFollowUpAction(id, followUpId);
      setLeads((prev) => prev.map((l) => (l._id === id ? (updated as any) : l)));
      refreshFollowUpFeed();
    } catch (e) {
      console.error(e);
    }
  };

  const addLeadActivity = async (id: string, text: string, type: string = "note") => {
    try {
      const updated = await addLeadActivityAction(id, text, type);
      setLeads((prev) => prev.map((l) => (l._id === id ? (updated as any) : l)));
    } catch (e) {
      console.error(e);
    }
  };

  const convertLeadToCustomer = async (id: string): Promise<string | null> => {
    try {
      const customer = await convertLeadToCustomerAction(id);
      await Promise.all([refreshClients(), refreshLeads()]);
      return (customer as any)?._id || null;
    } catch (e) {
      console.error(e);
      return null;
    }
  };

  // ---- Reference Handlers ----
  const addReference = async (ref: Partial<ReferencePerson>) => {
    try {
      await saveReferenceAction(ref);
      refreshReferences();
    } catch (e) {
      console.error(e);
    }
  };

  const updateReference = async (id: string, updates: Partial<ReferencePerson>) => {
    try {
      await saveReferenceAction({ _id: id, ...updates });
      refreshReferences();
    } catch (e) {
      console.error(e);
    }
  };

  const deleteReference = async (id: string) => {
    try {
      await deleteReferenceAction(id);
      setReferences((prev) => prev.filter((r) => r._id !== id));
    } catch (e) {
      console.error(e);
    }
  };

  const getReferralDetail = async (id: string) => {
    try {
      return (await getReferralDetailAction(id)) as any;
    } catch (e) {
      console.error(e);
      return { leads: [], customers: [] };
    }
  };

  // ---- Freelancer Handlers ----
  const addFreelancer = async (f: Partial<Freelancer>) => {
    try {
      await saveFreelancerAction(f);
      refreshFreelancers();
    } catch (e) {
      console.error(e);
    }
  };

  const updateFreelancer = async (id: string, updates: Partial<Freelancer>) => {
    try {
      await saveFreelancerAction({ _id: id, ...updates });
      refreshFreelancers();
    } catch (e) {
      console.error(e);
    }
  };

  const deleteFreelancer = async (id: string) => {
    try {
      await deleteFreelancerAction(id);
      setFreelancers((prev) => prev.filter((f) => f._id !== id));
    } catch (e) {
      console.error(e);
    }
  };

  const addFreelancerPayment = async (freelancerId: string, payment: FreelancerPayment) => {
    try {
      await addFreelancerPaymentAction(freelancerId, payment);
      refreshFreelancers();
    } catch (e) {
      console.error(e);
    }
  };

  const updateFreelancerPaymentStatus = async (freelancerId: string, paymentId: string, status: string) => {
    try {
      await updateFreelancerPaymentStatusAction(freelancerId, paymentId, status);
      refreshFreelancers();
    } catch (e) {
      console.error(e);
    }
  };

  // ---- CRM Project Handlers ----
  const addCRMProject = async (project: Partial<CRMProjectItem>) => {
    try {
      await saveCRMProjectAction(project);
      await Promise.all([refreshCRMProjects(), refreshClients()]);
    } catch (e) {
      console.error(e);
    }
  };

  const updateCRMProject = async (id: string, updates: Partial<CRMProjectItem>) => {
    try {
      await saveCRMProjectAction({ _id: id, ...updates });
      refreshCRMProjects();
    } catch (e) {
      console.error(e);
    }
  };

  const deleteCRMProject = async (id: string) => {
    try {
      await deleteCRMProjectAction(id);
      setCRMProjects((prev) => prev.filter((p) => p._id !== id));
    } catch (e) {
      console.error(e);
    }
  };

  const updateCRMProjectStatus = async (id: string, status: CRMProjectItem["status"]) => {
    try {
      const updated = await updateCRMProjectStatusAction(id, status);
      setCRMProjects((prev) => prev.map((p) => (p._id === id ? (updated as any) : p)));
    } catch (e) {
      console.error(e);
    }
  };

  const assignFreelancersToProject = async (
    projectId: string,
    assignments: { freelancerId: string; agreedCost: number }[]
  ) => {
    try {
      await assignFreelancersToProjectAction(projectId, assignments);
      await Promise.all([refreshCRMProjects(), refreshFreelancers()]);
    } catch (e) {
      console.error(e);
    }
  };

  const addCRMProjectPayment = async (projectId: string, payment: any) => {
    try {
      await addCRMProjectPaymentAction(projectId, payment);
      await Promise.all([refreshCRMProjects(), refreshAllPayments()]);
    } catch (e) {
      console.error(e);
    }
  };

  const deleteCRMProjectPayment = async (projectId: string, paymentId: string) => {
    try {
      await deleteCRMProjectPaymentAction(projectId, paymentId);
      await Promise.all([refreshCRMProjects(), refreshAllPayments()]);
    } catch (e) {
      console.error(e);
    }
  };

  const addCRMProjectExpense = async (projectId: string, expense: any) => {
    try {
      await addCRMProjectExpenseAction(projectId, expense);
      refreshCRMProjects();
    } catch (e) {
      console.error(e);
    }
  };

  // LIVE FINANCIAL CALCULATIONS
  const currentMonthStr = new Date().toISOString().substring(0, 7); // "YYYY-MM"

  // 1. Revenue & Referral Payout Calculation
  let totalRevenue = 0;
  let revenueThisMonth = 0;
  let totalBudgetSum = 0;
  let totalReferralCommissions = 0;

  // Helper map for client received payments
  const clientRevenueMap: Record<string, number> = {};

  clients.forEach((c) => {
    totalBudgetSum += c.budget || c.projectCost || 0;
    let clientReceived = 0;
    
    // Sum payments array
    if (c.payments && c.payments.length > 0) {
      c.payments.forEach((p) => {
        const amt = p.amount || 0;
        totalRevenue += amt;
        clientReceived += amt;
        if (p.paymentDate && p.paymentDate.startsWith(currentMonthStr)) {
          revenueThisMonth += amt;
        }
      });
    } else if (c.invoices && c.invoices.length > 0) {
      // fallback to paid invoices if no explicit payment log
      c.invoices.forEach((inv) => {
        if (inv.status === "Paid") {
          const amt = inv.amount || 0;
          totalRevenue += amt;
          clientReceived += amt;
          if (inv.dueDate && inv.dueDate.startsWith(currentMonthStr)) {
            revenueThisMonth += amt;
          }
        }
      });
    }

    clientRevenueMap[c._id] = clientReceived;
    if (c.id) clientRevenueMap[c.id] = clientReceived;
  });

  // Calculate referral commissions generated by referred deals
  const totalReferredClientsCount = clients.filter((c) => c.referredBy || c.clientType === "Referred").length;
  
  clients.forEach((c) => {
    if (c.referredBy) {
      const clientReceived = clientRevenueMap[c._id] || clientRevenueMap[c.id || ""] || 0;
      const commPct = c.referralCommissionPct ?? 5;
      const commission = (clientReceived * commPct) / 100;
      totalReferralCommissions += commission;
    }
  });

  const amountReceived = totalRevenue;

  // Calculate per-client outstanding payments accurately
  let revenuePending = 0;
  const outstandingClients: Array<{
    id: string;
    name: string;
    company: string;
    budget: number;
    received: number;
    pending: number;
    stage: string;
  }> = [];

  clients.forEach((c) => {
    const cost = c.budget || c.projectCost || 0;
    const clientReceived = clientRevenueMap[c._id] || clientRevenueMap[c.id || ""] || 0;
    const pending = Math.max(0, cost - clientReceived);

    if (pending > 0 && cost > 0) {
      revenuePending += pending;
      outstandingClients.push({
        id: c._id || c.id || "",
        name: c.name,
        company: c.company,
        budget: cost,
        received: clientReceived,
        pending,
        stage: c.stage || "Active",
      });
    }
  });

  const outstandingPayments = revenuePending;

  // 2. Expenses
  let totalExpenses = 0;
  let expensesThisMonth = 0;
  let materialCost = 0;
  let miscExpenses = 0;
  let otherExpenses = 0;

  clients.forEach((c) => {
    if (c.expenses && c.expenses.length > 0) {
      c.expenses.forEach((e) => {
        const amt = e.amount || 0;
        totalExpenses += amt;
        if (e.date && e.date.startsWith(currentMonthStr)) {
          expensesThisMonth += amt;
        }
        if (e.category === "Material Cost") {
          materialCost += amt;
        } else if (e.category === "Other Expenses" || e.category === "Other") {
          otherExpenses += amt;
        } else {
          miscExpenses += amt;
        }
      });
    }
  });

  // 3. Net Profit (Revenue - Direct Expenses - Referral Commissions)
  const netProfit = totalRevenue - totalExpenses - totalReferralCommissions;
  const grossProfit = totalRevenue - materialCost;
  const profitMarginPct = totalRevenue > 0 ? (netProfit / totalRevenue) * 100 : 0;

  // 4. Partner Distribution
  const p1SharePct = settings.partner1Share || 50;
  const p2SharePct = settings.partner2Share || 50;

  const partner1 = {
    name: settings.partner1Name || "Prajwal",
    sharePct: p1SharePct,
    revenueShare: (totalRevenue * p1SharePct) / 100,
    expensesShare: (totalExpenses * p1SharePct) / 100,
    netShare: (netProfit * p1SharePct) / 100,
    totalPayable: (netProfit * p1SharePct) / 100,
  };

  const partner2 = {
    name: settings.partner2Name || "Shaz",
    sharePct: p2SharePct,
    revenueShare: (totalRevenue * p2SharePct) / 100,
    expensesShare: (totalExpenses * p2SharePct) / 100,
    netShare: (netProfit * p2SharePct) / 100,
    totalPayable: (netProfit * p2SharePct) / 100,
  };

  // 5. Active Projects Breakdown
  const activeProjectsCount = clients.filter((c) =>
    ["Active", "Design Phase", "Development", "Testing", "Client Review", "Deployment", "Advance Payment Received", "Project Created Automatically"].includes(c.stage)
  ).length;

  const completedProjectsCount = clients.filter((c) =>
    ["Completed", "Project Completed"].includes(c.stage)
  ).length;

  const pendingProjectsCount = clients.filter((c) =>
    ["Pending", "Lead Created", "Discovery Call", "Meeting Scheduled", "Requirements Received"].includes(c.stage)
  ).length;

  const onHoldProjectsCount = clients.filter((c) => c.stage === "On Hold").length;

  const financialStats = {
    totalRevenue,
    revenueThisMonth,
    revenuePending,
    amountReceived,
    outstandingPayments,
    outstandingClients,
    totalExpenses,
    expensesThisMonth,
    materialCost,
    miscExpenses,
    otherExpenses,
    totalReferralCommissions,
    totalReferredClientsCount,
    grossProfit,
    netProfit,
    profitMarginPct,
    partner1,
    partner2,
    activeProjectsCount,
    completedProjectsCount,
    pendingProjectsCount,
    onHoldProjectsCount,
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
        loading,
        refreshClients,
        addClient,
        deleteClient,
        updateClientStage: updateStage,
        updateClient: editClient,
        addTask,
        updateTask,
        toggleTask,
        deleteTask,
        addExpense,
        deleteExpense,
        addPayment,
        deletePayment,
        settings,
        updateSettings,
        globalActivities,
        isAddClientOpen,
        setIsAddClientOpen,
        financialStats,

        leads,
        refreshLeads,
        addLead,
        updateLead,
        deleteLead,
        updateLeadStatus,
        addLeadFollowUp,
        completeLeadFollowUp,
        addLeadActivity,
        convertLeadToCustomer,
        followUpFeed,

        references,
        refreshReferences,
        addReference,
        updateReference,
        deleteReference,
        getReferralDetail,

        freelancers,
        refreshFreelancers,
        addFreelancer,
        updateFreelancer,
        deleteFreelancer,
        addFreelancerPayment,
        updateFreelancerPaymentStatus,

        crmProjects,
        refreshCRMProjects,
        addCRMProject,
        updateCRMProject,
        deleteCRMProject,
        updateCRMProjectStatus,
        assignFreelancersToProject,
        addCRMProjectPayment,
        deleteCRMProjectPayment,
        addCRMProjectExpense,

        allPayments,
        refreshAllPayments,
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

