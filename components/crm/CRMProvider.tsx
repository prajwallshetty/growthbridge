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

export type CRMView =
  | "dashboard"
  | "projects"
  | "expenses"
  | "revenue"
  | "settings"
  | "clients"
  | "client-tree";

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

  useEffect(() => {
    refreshClients();
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
  const revenuePending = Math.max(0, totalBudgetSum - totalRevenue);
  const outstandingPayments = revenuePending;

  // 2. Expenses
  let totalExpenses = 0;
  let expensesThisMonth = 0;
  let materialCost = 0;
  let miscExpenses = 0;

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
    totalExpenses,
    expensesThisMonth,
    materialCost,
    miscExpenses,
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

