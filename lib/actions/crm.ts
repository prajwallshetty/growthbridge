"use server";

import { connectToDatabase } from "@/lib/db";
import CRMClient from "@/models/CRMClient";
import { generateTextWithGemini } from "@/lib/gemini";
import { getSessionUser } from "@/lib/actions/cms";

// Helper: Ensure authenticated user
async function requireAuth() {
  const sessionUser = await getSessionUser();
  if (!sessionUser) {
    throw new Error("Unauthorized. Please log in.");
  }
  return sessionUser;
}

// Serialize MongoDB document helper
function serialize<T>(data: T): T {
  return JSON.parse(JSON.stringify(data));
}

// Initial Seeding Data
const INITIAL_CLIENTS = [
  {
    name: "Mohammad Al-Mansoori",
    company: "Haramain Luxury",
    logo: "HL",
    industry: "Real Estate & Hospitality",
    budget: 1200000,
    stage: "Advance Payment Received",
    status: "Ongoing",
    priority: "High",
    assignee: "Prajwal Shetty",
    progress: 35,
    countryFlag: "🇦🇪",
    startDate: "2026-06-15",
    expectedDelivery: "2026-09-01",
    tasks: [
      { title: "Figma Typography & Color System", priority: "High", assignee: "Prajwal", deadline: "2026-07-15", status: "Completed", progress: 100 },
      { title: "Homepage Layout Design", priority: "High", assignee: "Prajwal", deadline: "2026-07-18", status: "In Progress", progress: 60 },
      { title: "Integration with CMS Backend", priority: "Medium", assignee: "Arjun", deadline: "2026-08-05", status: "Pending", progress: 0 },
    ],
    files: [
      { name: "Haramain_Brand_Book.pdf", category: "Brand Assets", size: "14.2 MB", uploadedAt: "2026-06-16", url: "#" },
      { name: "Logo_Assets_Vector.zip", category: "Logo", size: "8.5 MB", uploadedAt: "2026-06-16", url: "#" },
      { name: "GB_Haramain_Proposal.pdf", category: "Proposal", size: "2.1 MB", uploadedAt: "2026-06-13", url: "#" },
    ],
    invoices: [
      {
        number: "GB-2026-042",
        amount: 420000,
        dueDate: "2026-06-20",
        status: "Paid",
        paidAmount: 420000,
        items: [{ description: "Project Kickoff / Advance Payment (35%)", qty: 1, rate: 420000 }],
      },
      {
        number: "GB-2026-043",
        amount: 420000,
        dueDate: "2026-08-01",
        status: "Pending",
        paidAmount: 0,
        items: [{ description: "UI/UX Signoff & Development Phase (35%)", qty: 1, rate: 420000 }],
      },
    ],
    quotations: [
      {
        items: [{ description: "Full UI/UX Redesign & Next.js Website Build", qty: 1, rate: 1200000 }],
        discount: 0,
        tax: 18,
        subtotal: 1200000,
        total: 1416000,
        terms: "Payment split: 35% advance, 35% development sign-off, 30% deployment launch.",
        validity: "30 Days",
        status: "Approved",
      }
    ],
    proposals: [
      {
        title: "Growth Bridge & Haramain Luxury Proposal",
        contentBlocks: [
          "Executive Summary: Building a digital experience fitting for high-end real estate.",
          "Phase 1: Brand Strategy and Figma wireframes.",
          "Phase 2: Next.js Frontend Development and high-speed CSS layouts.",
          "Phase 3: Automated tests, launch and SEO configuration."
        ],
        status: "Approved",
        version: 1,
      }
    ],
    agreements: [
      {
        scope: "UI/UX design system and Next.js frontend code development.",
        timeline: "Start: 2026-06-15, End: 2026-09-01",
        paymentTerms: "35-35-30 retainer split on milestones.",
        signedStatus: "Signed",
        signedAt: new Date("2026-06-14"),
      }
    ],
    meetings: [
      { title: "Project Kickoff", date: "2026-06-12", time: "14:00", link: "https://meet.google.com/abc-defg-hij", notes: "Agreed on project scope and brand aesthetic direction.", actionItems: ["Prajwal to setup Figma wireframes"], status: "Completed" },
      { title: "Design Review & Wireframes", date: "2026-07-15", time: "15:30", link: "https://meet.google.com/abc-defg-hij", notes: "Walkthrough of design drafts and typography adjustments.", actionItems: ["Adjust spacing on mobile homepage"], status: "Upcoming" },
    ],
    notes: [
      { title: "Design Direction Ideas", content: "Client prefers dark luxury themes, elegant gold highlights (#D4AF37) used sparingly, clean grid layouts inspired by high-end luxury fashion brand catalogs.", updatedAt: "2026-06-18", pinned: true },
    ],
    messages: [
      { sender: "client", text: "Hi team, when can we expect the first draft of the UI designs?", timestamp: "10:30 AM" },
      { sender: "studio", text: "Hello Mohammad! We are putting final touches on the wireframes. We have a review session scheduled for July 15.", timestamp: "11:05 AM" },
    ],
    activity: [
      { text: "Logo Assets Zip uploaded by Mohammad", timestamp: "2026-06-16", type: "document" },
      { text: "Invoice GB-2026-042 paid (₹4,20,000)", timestamp: "2026-06-15", type: "invoice" },
      { text: "Proposal approved by client", timestamp: "2026-06-14", type: "document" },
      { text: "Lead registered in CRM", timestamp: "2026-06-10", type: "chat" }
    ],
  },
  {
    name: "Arjun Sharma",
    company: "ArchViz Pro",
    logo: "AP",
    industry: "Architectural Visualizations",
    budget: 850000,
    stage: "Development",
    status: "Ongoing",
    priority: "High",
    assignee: "Arjun Dev",
    progress: 55,
    countryFlag: "🇮🇳",
    startDate: "2026-05-10",
    expectedDelivery: "2026-08-01",
    tasks: [
      { title: "Complete Platform Dashboard UI", priority: "High", assignee: "Arjun", deadline: "2026-06-20", status: "Completed", progress: 100 },
      { title: "API Gateway Integration", priority: "High", assignee: "Sarah", deadline: "2026-07-10", status: "In Progress", progress: 80 },
      { title: "Billing System & Stripe Webhooks", priority: "High", assignee: "Prajwal", deadline: "2026-07-20", status: "Pending", progress: 10 },
    ],
    files: [
      { name: "ArchViz_Logo_Light.svg", category: "Logo", size: "45 KB", uploadedAt: "2026-05-11", url: "#" },
      { name: "Attio_CRM_Data_Map.xlsx", category: "Brand Assets", size: "1.2 MB", uploadedAt: "2026-05-15", url: "#" },
    ],
    invoices: [
      { number: "GB-2026-031", amount: 300000, dueDate: "2026-05-12", status: "Paid", paidAmount: 300000, items: [{ description: "Milestone 1 — Advance retainer", qty: 1, rate: 300000 }] },
    ],
    quotations: [
      {
        items: [{ description: "Platform Dashboard, Gateway, and Stripe Integration", qty: 1, rate: 850000 }],
        discount: 0,
        tax: 18,
        subtotal: 850000,
        total: 1003000,
        terms: "Retainer setup",
        validity: "30 Days",
        status: "Approved",
      }
    ],
    proposals: [
      { title: "Dashboard Integration Proposal", contentBlocks: ["Overview: Creating a fast interface for visuals."], status: "Approved" }
    ],
    agreements: [
      { scope: "Dashboard development and integration", timeline: "3 months", paymentTerms: "300k advance, 550k final", signedStatus: "Signed" }
    ],
    meetings: [
      { title: "UX Framework & Alignment", date: "2026-05-15", time: "11:00", link: "https://meet.google.com/xyz-123", notes: "Aligned on dashboard templates layout.", actionItems: ["Arjun to setup project structure"], status: "Completed" },
    ],
    notes: [
      { title: "Integrations & APIs", content: "Needs integration with Supabase Auth, Stripe billing, and Resend email pipelines.", updatedAt: "2026-05-20", pinned: false },
    ],
    messages: [],
    activity: [
      { text: "Dashboard mockup screens signed off by Arjun", timestamp: "2026-06-25", type: "progress" },
      { text: "Advance Retainer paid (₹3,00,000)", timestamp: "2026-05-10", type: "invoice" }
    ],
  },
  {
    name: "Marcus Vance",
    company: "Vapor Wave Co",
    logo: "VW",
    industry: "AI Automations & Agents",
    budget: 680000,
    stage: "Development",
    status: "Ongoing",
    priority: "Medium",
    assignee: "Sarah Lin",
    progress: 75,
    countryFlag: "🇺🇸",
    startDate: "2026-04-18",
    expectedDelivery: "2026-07-30",
    tasks: [
      { title: "Configure LLM RAG pipelines", priority: "High", assignee: "Sarah", deadline: "2026-06-15", status: "Completed", progress: 100 },
      { title: "Design Admin UI control page", priority: "Medium", assignee: "Arjun", deadline: "2026-07-05", status: "Completed", progress: 100 },
      { title: "End-to-End automated test coverage", priority: "Low", assignee: "Sarah", deadline: "2026-07-25", status: "In Progress", progress: 40 },
    ],
    files: [
      { name: "RAG_pipeline_flows.pdf", category: "Brand Assets", size: "4.8 MB", uploadedAt: "2026-04-20", url: "#" },
    ],
    invoices: [
      { number: "GB-2026-025", amount: 340000, dueDate: "2026-04-22", status: "Paid", paidAmount: 340000, items: [{ description: "Milestone 1 — Advance payment", qty: 1, rate: 340000 }] },
    ],
    quotations: [
      { items: [{ description: "AI RAG pipeline configuration", qty: 1, rate: 680000 }], discount: 0, tax: 18, subtotal: 680000, total: 802400, terms: "Retainer setup", validity: "30 Days", status: "Approved" }
    ],
    proposals: [
      { title: "RAG AI Agent Development", contentBlocks: ["Integrating AI capabilities into backend workflows."], status: "Approved" }
    ],
    agreements: [
      { scope: "RAG Setup & Admin UI development", timeline: "2 months", paymentTerms: "50% advance, 50% completion", signedStatus: "Signed" }
    ],
    meetings: [],
    notes: [],
    messages: [],
    activity: [
      { text: "Beta staging environment successfully deployed", timestamp: "2026-07-02", type: "progress" },
    ],
  },
  {
    name: "Sophia Wright",
    company: "Cardinal Studio",
    logo: "CS",
    industry: "Luxury Fashion Branding",
    budget: 450000,
    stage: "Development",
    status: "Ongoing",
    priority: "Low",
    assignee: "Arjun Dev",
    progress: 90,
    countryFlag: "🇬🇧",
    startDate: "2026-05-01",
    expectedDelivery: "2026-07-15",
    tasks: [
      { title: "Deploy to Netlify testing branch", priority: "Low", assignee: "Arjun", deadline: "2026-06-25", status: "Completed", progress: 100 },
      { title: "Audit for web animations performance", priority: "High", assignee: "Prajwal", deadline: "2026-07-08", status: "Completed", progress: 100 },
      { title: "SEO optimizations and meta tags", priority: "Medium", assignee: "Arjun", deadline: "2026-07-12", status: "In Progress", progress: 90 },
    ],
    files: [],
    invoices: [
      { number: "GB-2026-029", amount: 225000, dueDate: "2026-05-05", status: "Paid", paidAmount: 225000, items: [{ description: "Milestone 1 Retainer (50%)", qty: 1, rate: 225000 }] },
    ],
    quotations: [
      { items: [{ description: "Fashion Brand Website Redesign", qty: 1, rate: 450000 }], discount: 0, tax: 18, subtotal: 450000, total: 531000, terms: "Retainer setup", validity: "30 Days", status: "Approved" }
    ],
    proposals: [
      { title: "Digital Brand System proposal", contentBlocks: ["Premium fashion layouts and web animations."], status: "Approved" }
    ],
    agreements: [
      { scope: "Next.js visual design and responsive branding site", timeline: "2 months", paymentTerms: "50-50 milestone split", signedStatus: "Signed" }
    ],
    meetings: [],
    notes: [],
    messages: [],
    activity: [
      { text: "Animations audit completed: locked at 60fps", timestamp: "2026-07-08", type: "progress" },
    ],
  },
  {
    name: "Ethan Thorne",
    company: "Constructo Corp",
    logo: "CC",
    industry: "Commercial Construction",
    budget: 1500000,
    stage: "Lead Created",
    status: "Not Started",
    priority: "High",
    assignee: "Unassigned",
    progress: 5,
    countryFlag: "🇸🇬",
    startDate: "2026-07-01",
    expectedDelivery: "2026-11-30",
    tasks: [
      { title: "Review business process requirements sheet", priority: "High", assignee: "Prajwal", deadline: "2026-07-16", status: "Pending", progress: 0 },
      { title: "Build custom workflow mapping slides", priority: "Medium", assignee: "Arjun", deadline: "2026-07-20", status: "Pending", progress: 0 },
    ],
    files: [
      { name: "Constructo_Workflow_Requirements.docx", category: "Brand Assets", size: "1.4 MB", uploadedAt: "2026-07-02", url: "#" },
    ],
    invoices: [],
    quotations: [],
    proposals: [],
    agreements: [],
    meetings: [
      { title: "Intro & Discovery Call", date: "2026-07-18", time: "10:00", link: "https://meet.google.com/xyz-constructo", notes: "Review construction lead flows and custom panel metrics.", actionItems: ["Prajwal to formulate requirements doc"], status: "Upcoming" },
    ],
    notes: [],
    messages: [
      { sender: "client", text: "We have an operations map document. Let me know if that helps.", timestamp: "2026-07-02" },
    ],
    activity: [
      { text: "Lead created from website form", timestamp: "2026-07-01", type: "chat" },
    ],
  },
];

// Fetch all CRM Clients
export async function getCRMClients() {
  await requireAuth();
  try {
    await connectToDatabase();
    
    let list = await CRMClient.find().sort({ updatedAt: -1 }).lean();

    if (list.length === 0) {
      // Seed initial demo data with referral linkages
      const c1 = await CRMClient.create({ ...INITIAL_CLIENTS[0], clientType: "Direct", referralCommissionPct: 5 }); // Haramain
      const c2 = await CRMClient.create({ ...INITIAL_CLIENTS[1], clientType: "Direct", referralCommissionPct: 5 }); // ArchViz
      const c3 = await CRMClient.create({ ...INITIAL_CLIENTS[2], referredBy: c1._id, clientType: "Referred", referralCommissionPct: 5 }); // Vapor Wave
      const c4 = await CRMClient.create({ ...INITIAL_CLIENTS[3], referredBy: c3._id, clientType: "Referred", referralCommissionPct: 5 }); // Cardinal Studio
      const c5 = await CRMClient.create({ ...INITIAL_CLIENTS[4], referredBy: c1._id, clientType: "Referred", referralCommissionPct: 5 }); // Constructo Corp
      list = await CRMClient.find().sort({ updatedAt: -1 }).lean();
    }

    return serialize(list);
  } catch (error) {
    console.warn("Database connection failed. Falling back to offline client data.", error);
    // Add mock IDs since the lean documents normally have _id
    const offlineList: any[] = INITIAL_CLIENTS.map((client, index) => ({
      ...client,
      _id: `offline_client_id_${index + 1}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }));
    // Resolve referral linkages offline (c3, c4, c5 referredBy)
    const hMansoori = offlineList[0];
    const vWave = offlineList[2];
    vWave.referredBy = hMansoori._id;
    const cStudio = offlineList[3];
    cStudio.referredBy = vWave._id;
    const cCorp = offlineList[4];
    cCorp.referredBy = hMansoori._id;

    return serialize(offlineList);
  }
}

// Create or Update CRM Client details
export async function saveCRMClient(clientData: any) {
  await requireAuth();
  await connectToDatabase();

  const { _id, ...fields } = clientData;

  // Sync status and stage/progress fields
  if (fields.status) {
    if (fields.status === "Completed") {
      fields.stage = fields.stage || "Completed";
      fields.progress = fields.progress !== undefined ? fields.progress : 100;
    } else if (fields.status === "Not Started") {
      fields.stage = fields.stage || "Lead Created";
      fields.progress = fields.progress !== undefined ? fields.progress : 0;
    } else {
      fields.stage = fields.stage || "Active";
    }
  } else if (fields.stage) {
    if (fields.stage === "Completed" || fields.stage === "Project Completed") {
      fields.status = "Completed";
    } else if (
      [
        "Lead Created",
        "Discovery Call",
        "Meeting Scheduled",
        "Requirements Received",
        "Proposal Generated",
        "Quotation Generated",
        "Client Approval",
        "Agreement Generated",
      ].includes(fields.stage)
    ) {
      fields.status = "Not Started";
    } else {
      fields.status = "Ongoing";
    }
  }

  let client;

  if (_id) {
    client = await CRMClient.findByIdAndUpdate(_id, { $set: fields }, { new: true });
  } else {
    // Generate initials for logo
    const company = fields.company || "New Client";
    const logo = company.split(" ").map((w: string) => w[0]).join("").toUpperCase().substring(0, 2);
    
    client = await CRMClient.create({
      ...fields,
      logo,
      stage: fields.stage || "Lead Created",
      activity: [{ text: "Lead registered in CRM", timestamp: new Date().toISOString().split("T")[0], type: "progress" }],
      timeline: [{ id: `tl_${Date.now()}`, event: "Lead Created", date: new Date().toISOString().split("T")[0], completed: true }]
    });
  }
  
  return serialize(client);
}

// Delete CRM Client
export async function deleteCRMClient(id: string) {
  await requireAuth();
  await connectToDatabase();
  await CRMClient.findByIdAndDelete(id);
  return { success: true };
}

// Stage-Based Lifecycle Automation engine
async function runLifecycleAutomation(client: any) {
  let isModified = false;
  const today = new Date().toISOString().split("T")[0];

  // Automation 1: Proposal Approved -> Automatically generate Quotation
  const latestProposal = client.proposals[client.proposals.length - 1];
  if (latestProposal && latestProposal.status === "Approved" && client.quotations.length === 0) {
    client.quotations.push({
      items: [{ description: `Standard Development Scope for ${client.company}`, qty: 1, rate: client.budget }],
      discount: 0,
      tax: 18,
      subtotal: client.budget,
      total: Math.round(client.budget * 1.18),
      terms: "18% GST applicable. 35% Retainer advance payment upon contract signing.",
      validity: "30 Days",
      status: "Draft",
    });
    client.stage = "Quotation Generated";
    client.activity.unshift({ text: "Automated: Proposal approved. Quotation generated.", timestamp: today, type: "document" });
    isModified = true;
  }

  // Automation 2: Quotation Approved -> Automatically generate Agreement draft
  const latestQuotation = client.quotations[client.quotations.length - 1];
  if (latestQuotation && latestQuotation.status === "Approved" && client.agreements.length === 0) {
    client.agreements.push({
      scope: `Technical implementation of dynamic layouts and frontend Next.js modules for ${client.company}.`,
      timeline: `Project kick-off: ${today}. Delivery timeline: 90 days.`,
      paymentTerms: `Retainer: ₹${Math.round(client.budget * 0.35).toLocaleString()} (35% advance), ₹${Math.round(client.budget * 0.35).toLocaleString()} (35% staging review), ₹${Math.round(client.budget * 0.30).toLocaleString()} (30% final deploy).`,
      signedStatus: "Unsigned",
    });
    client.stage = "Agreement Generated";
    client.activity.unshift({ text: "Automated: Quotation approved. Agreement generated.", timestamp: today, type: "document" });
    isModified = true;
  }

  // Automation 3: Agreement Signed -> Automatically create Project structure & Tasks
  const latestAgreement = client.agreements[client.agreements.length - 1];
  if (latestAgreement && latestAgreement.signedStatus === "Signed" && client.stage === "Agreement Generated") {
    client.stage = "Project Created Automatically";
    client.startDate = today;
    
    // Auto-create initial project tasks
    client.tasks = [
      { title: "Define Figma typography & core UX framework", priority: "High", assignee: client.assignee || "Prajwal", status: "Pending", progress: 0 },
      { title: "Setup repository and configure production environments", priority: "Medium", assignee: "Arjun", status: "Pending", progress: 0 },
      { title: "Stripe invoice webhooks integration", priority: "High", assignee: "Arjun", status: "Pending", progress: 0 },
      { title: "SEO optimizations and dynamic metatags audit", priority: "Low", assignee: "Unassigned", status: "Pending", progress: 0 },
    ];
    
    // Auto-generate Advance Payment Invoice (35% of budget)
    const advAmount = Math.round(client.budget * 0.35);
    client.invoices.push({
      number: `GB-INV-${Date.now().toString().slice(-4)}`,
      amount: advAmount,
      dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
      status: "Pending",
      items: [{ description: "Retainer Advance Payment (35% Milestone 1)", qty: 1, rate: advAmount }],
    });

    client.activity.unshift({ text: "Automated: Agreement signed. Project initiated. Retainer invoice generated.", timestamp: today, type: "progress" });
    isModified = true;
  }

  // Automation 4: Advance Payment Received -> Move project to Development stage
  const paidRetainerInvoice = client.invoices.find(
    (inv: any) => inv.items[0]?.description.includes("Advance") && inv.status === "Paid"
  );
  if (paidRetainerInvoice && (client.stage === "Project Created Automatically" || client.stage === "Agreement Generated")) {
    client.stage = "Development";
    client.activity.unshift({ text: "Automated: Retainer payment received. Status moved to Development.", timestamp: today, type: "invoice" });
    isModified = true;
  }

  // Automation 5: All tasks completed during Development -> Generate final invoice & request review
  if (client.stage === "Development" && client.tasks.length > 0 && client.tasks.every((t: any) => t.status === "Completed")) {
    client.stage = "Client Review";
    client.progress = 100;
    
    // Auto-generate Final Invoice (remainder 65%)
    const finalAmount = client.budget - client.invoices.reduce((sum: number, inv: any) => sum + (inv.status === "Paid" ? inv.amount : 0), 0);
    if (finalAmount > 0 && !client.invoices.some((inv: any) => inv.items[0]?.description.includes("Final"))) {
      client.invoices.push({
        number: `GB-INV-FINAL-${Date.now().toString().slice(-4)}`,
        amount: finalAmount,
        dueDate: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
        status: "Pending",
        items: [{ description: "Project Launch / Final Invoice (Balance)", qty: 1, rate: finalAmount }],
      });
      client.activity.unshift({ text: "Automated: All development tasks completed. Final invoice generated.", timestamp: today, type: "invoice" });
    }
    isModified = true;
  }

  // Automation 6: Final Invoice Paid -> Project Completed & move to Maintenance
  const paidFinalInvoice = client.invoices.find(
    (inv: any) => inv.items[0]?.description.includes("Final") && inv.status === "Paid"
  );
  if (paidFinalInvoice && client.stage === "Client Review") {
    client.stage = "Project Completed";
    client.activity.unshift({ text: "Automated: Final invoice paid. Project successfully launched & completed.", timestamp: today, type: "progress" });
    isModified = true;
  }

  const oldStatus = client.status;
  let newStatus = "Ongoing";
  if (client.stage === "Completed" || client.stage === "Project Completed") {
    newStatus = "Completed";
  } else if (
    [
      "Lead Created",
      "Discovery Call",
      "Meeting Scheduled",
      "Requirements Received",
      "Proposal Generated",
      "Quotation Generated",
      "Client Approval",
      "Agreement Generated",
    ].includes(client.stage)
  ) {
    newStatus = "Not Started";
  }
  if (oldStatus !== newStatus) {
    client.status = newStatus;
    isModified = true;
  }

  return isModified;
}

// Update CRM Client delivery lifecycle stage
export async function updateClientStage(clientId: string, stage: string) {
  await requireAuth();
  await connectToDatabase();

  const client = await CRMClient.findById(clientId);
  if (!client) throw new Error("Client not found");

  client.stage = stage;
  if (stage === "Completed" || stage === "Project Completed") {
    client.status = "Completed";
  } else if (
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
    client.status = "Not Started";
  } else {
    client.status = "Ongoing";
  }

  client.activity.unshift({
    text: `Stage manually updated to: ${stage}`,
    timestamp: new Date().toISOString().split("T")[0],
    type: "progress",
  });

  await runLifecycleAutomation(client);
  await client.save();
  return serialize(client);
}

// Add CRM Task Checklist
export async function addCRMTask(clientId: string, taskData: any) {
  await requireAuth();
  await connectToDatabase();

  const client = await CRMClient.findById(clientId);
  if (!client) throw new Error("Client not found");

  client.tasks.push(taskData);
  client.activity.unshift({
    text: `Task added: "${taskData.title}"`,
    timestamp: new Date().toISOString().split("T")[0],
    type: "progress",
  });

  // Re-calculate client progress percentage
  const comp = client.tasks.filter((t: any) => t.status === "Completed").length;
  client.progress = client.tasks.length > 0 ? Math.round((comp / client.tasks.length) * 100) : 0;

  await runLifecycleAutomation(client);
  await client.save();
  return serialize(client);
}

// Toggle CRM Task status
export async function toggleCRMTask(clientId: string, taskId: string) {
  await requireAuth();
  await connectToDatabase();

  const client = await CRMClient.findById(clientId);
  if (!client) throw new Error("Client not found");

  const task = client.tasks.id(taskId);
  if (!task) throw new Error("Task not found");

  task.status = task.status === "Completed" ? "Pending" : "Completed";
  task.progress = task.status === "Completed" ? 100 : 0;

  client.activity.unshift({
    text: `Task status updated: "${task.title}" -> ${task.status}`,
    timestamp: new Date().toISOString().split("T")[0],
    type: "progress",
  });

  // Re-calculate client progress percentage
  const comp = client.tasks.filter((t: any) => t.status === "Completed").length;
  client.progress = client.tasks.length > 0 ? Math.round((comp / client.tasks.length) * 100) : 0;

  await runLifecycleAutomation(client);
  await client.save();
  return serialize(client);
}

// Add CRM Invoice
export async function addCRMInvoice(clientId: string, invoiceData: any) {
  await requireAuth();
  await connectToDatabase();

  const client = await CRMClient.findById(clientId);
  if (!client) throw new Error("Client not found");

  client.invoices.push(invoiceData);
  client.activity.unshift({
    text: `Invoice generated: ${invoiceData.number} for ₹${invoiceData.amount.toLocaleString()}`,
    timestamp: new Date().toISOString().split("T")[0],
    type: "invoice",
  });

  await runLifecycleAutomation(client);
  await client.save();
  return serialize(client);
}

// Update CRM Invoice status
export async function updateCRMInvoiceStatus(clientId: string, invoiceId: string, status: string) {
  await requireAuth();
  await connectToDatabase();

  const client = await CRMClient.findById(clientId);
  if (!client) throw new Error("Client not found");

  const invoice = client.invoices.id(invoiceId);
  if (!invoice) throw new Error("Invoice not found");

  invoice.status = status;
  invoice.paidAmount = status === "Paid" ? invoice.amount : 0;

  client.activity.unshift({
    text: `Invoice status changed: ${invoice.number} -> ${status}`,
    timestamp: new Date().toISOString().split("T")[0],
    type: "invoice",
  });

  await runLifecycleAutomation(client);
  await client.save();
  return serialize(client);
}

// Add CRM Document (Proposal, Quotation, Agreement)
export async function saveCRMDocument(clientId: string, docType: string, docData: any) {
  await requireAuth();
  await connectToDatabase();

  const client = await CRMClient.findById(clientId);
  if (!client) throw new Error("Client not found");

  if (docType === "proposal") {
    if (docData._id) {
      const prop = client.proposals.id(docData._id);
      if (prop) {
        Object.assign(prop, docData);
        prop.version += 1;
      }
    } else {
      client.proposals.push(docData);
    }
  } else if (docType === "quotation") {
    if (docData._id) {
      const quote = client.quotations.id(docData._id);
      if (quote) Object.assign(quote, docData);
    } else {
      client.quotations.push(docData);
    }
  } else if (docType === "agreement") {
    if (docData._id) {
      const agr = client.agreements.id(docData._id);
      if (agr) {
        Object.assign(agr, docData);
        if (docData.signedStatus === "Signed") {
          agr.signedAt = new Date();
        }
      }
    } else {
      client.agreements.push(docData);
    }
  }

  client.activity.unshift({
    text: `${docType.charAt(0).toUpperCase() + docType.slice(1)} document updated`,
    timestamp: new Date().toISOString().split("T")[0],
    type: "document",
  });

  await runLifecycleAutomation(client);
  await client.save();
  return serialize(client);
}

// Add CRM Meeting
export async function addCRMMeeting(clientId: string, meetingData: any) {
  await requireAuth();
  await connectToDatabase();

  const client = await CRMClient.findById(clientId);
  if (!client) throw new Error("Client not found");

  client.meetings.push(meetingData);
  client.activity.unshift({
    text: `Meeting scheduled: "${meetingData.title}" on ${meetingData.date}`,
    timestamp: new Date().toISOString().split("T")[0],
    type: "meeting",
  });

  await client.save();
  return serialize(client);
}

// Add CRM File
export async function addCRMFile(clientId: string, fileData: any) {
  await requireAuth();
  await connectToDatabase();

  const client = await CRMClient.findById(clientId);
  if (!client) throw new Error("Client not found");

  client.files.push(fileData);
  client.activity.unshift({
    text: `File uploaded: "${fileData.name}" under folder "${fileData.category}"`,
    timestamp: new Date().toISOString().split("T")[0],
    type: "document",
  });

  await client.save();
  return serialize(client);
}

// Add CRM Client Message
export async function addCRMMessage(clientId: string, messageData: any) {
  await requireAuth();
  await connectToDatabase();

  const client = await CRMClient.findById(clientId);
  if (!client) throw new Error("Client not found");

  client.messages.push(messageData);
  client.activity.unshift({
    text: messageData.sender === "client" ? "New message from client" : "Messaged client",
    timestamp: new Date().toISOString().split("T")[0],
    type: "chat",
  });

  await client.save();
  return serialize(client);
}

// Generate AI Copywriter using Gemini
export async function generateAIDocument(clientId: string, docType: string, userPrompt: string): Promise<string> {
  await requireAuth();
  await connectToDatabase();

  const client = await CRMClient.findById(clientId);
  if (!client) throw new Error("Client not found");

  const prompt = `
    You are an expert SaaS Copywriter and legal specialist for an elite Next.js fractional agency named Growth Bridge Studio.
    You are drafting a "${docType}" document.
    
    Here is the client context:
    - Company Name: ${client.company}
    - Client Contact Name: ${client.name}
    - Client Industry Sector: ${client.industry}
    - Retainer Budget Valuation: ₹${client.budget.toLocaleString()} INR
    - Expecting Staging Launch: ${client.expectedDelivery}
    - Assigned Lead Architect: ${client.assignee}
    - Stage: ${client.stage}
    
    Instruction details from Administrator:
    "${userPrompt}"
    
    Write a highly professional, contextual draft. Use proper formatting, clear sections, bullet points, and pricing details where applicable.
  `;

  try {
    const text = await generateTextWithGemini(prompt);
    return text;
  } catch (error: any) {
    console.error("Gemini CRM Document Generation Failed:", error);
    return `AI Generation failed: ${error?.message || "Unknown error"}`;
  }
}

// Add Expense to Project (or General Overhead)
export async function addProjectExpense(clientId: string, expenseData: any) {
  await requireAuth();
  await connectToDatabase();

  let client;
  if (clientId === "general") {
    client = await CRMClient.findOne({ company: "General Company (Non-Website)" });
    if (!client) {
      client = await CRMClient.create({
        name: "Growth Bridge Studio",
        company: "General Company (Non-Website)",
        industry: "Internal Operations & Overhead",
        budget: 0,
        stage: "Active",
        status: "Ongoing",
      });
    }
  } else {
    client = await CRMClient.findById(clientId);
  }

  if (!client) throw new Error("Client project not found");

  if (!client.expenses) client.expenses = [];
  client.expenses.push(expenseData);

  client.activity.unshift({
    text: `Expense added: "${expenseData.name}" — ₹${expenseData.amount.toLocaleString()} (${expenseData.category})`,
    timestamp: new Date().toISOString().split("T")[0],
    type: "expense",
  });

  await client.save();
  return serialize(client);
}

// Delete Expense from Project (or General Overhead)
export async function deleteProjectExpense(clientId: string, expenseId: string) {
  await requireAuth();
  await connectToDatabase();

  let client;
  if (clientId === "general") {
    client = await CRMClient.findOne({ company: "General Company (Non-Website)" });
  } else {
    client = await CRMClient.findById(clientId);
  }

  if (!client) {
    client = await CRMClient.findOne({ "expenses._id": expenseId });
  }

  if (!client) throw new Error("Expense record not found");

  client.expenses = client.expenses.filter((e: any) => e._id.toString() !== expenseId && e.id !== expenseId);
  client.activity.unshift({
    text: `Expense record removed`,
    timestamp: new Date().toISOString().split("T")[0],
    type: "expense",
  });

  await client.save();
  return serialize(client);
}

// Add Payment to Project
export async function addProjectPayment(clientId: string, paymentData: any) {
  await requireAuth();
  await connectToDatabase();

  const client = await CRMClient.findById(clientId);
  if (!client) throw new Error("Client project not found");

  if (!client.payments) client.payments = [];
  client.payments.push(paymentData);

  client.activity.unshift({
    text: `Payment received: ₹${paymentData.amount.toLocaleString()} (Ref: ${paymentData.referenceNumber || "N/A"})`,
    timestamp: new Date().toISOString().split("T")[0],
    type: "payment",
  });

  await client.save();
  return serialize(client);
}

// Delete Payment from Project
export async function deleteProjectPayment(clientId: string, paymentId: string) {
  await requireAuth();
  await connectToDatabase();

  const client = await CRMClient.findById(clientId);
  if (!client) throw new Error("Client project not found");

  client.payments = client.payments.filter((p: any) => p._id.toString() !== paymentId && p.id !== paymentId);
  client.activity.unshift({
    text: `Payment record removed from project`,
    timestamp: new Date().toISOString().split("T")[0],
    type: "payment",
  });

  await client.save();
  return serialize(client);
}

// Update Project Task (including subtasks & drag ordering)
export async function updateProjectTask(clientId: string, taskId: string, taskUpdates: any) {
  await requireAuth();
  await connectToDatabase();

  const client = await CRMClient.findById(clientId);
  if (!client) throw new Error("Client project not found");

  const taskIndex = client.tasks.findIndex((t: any) => t._id.toString() === taskId || t.id === taskId);
  if (taskIndex !== -1) {
    Object.assign(client.tasks[taskIndex], taskUpdates);
  }

  // Recalculate project progress based on completed tasks
  if (client.tasks.length > 0) {
    const completedCount = client.tasks.filter((t: any) => t.status === "Completed" || t.completed).length;
    client.progress = Math.round((completedCount / client.tasks.length) * 100);
  }

  await client.save();
  return serialize(client);
}

// Delete Task
export async function deleteProjectTask(clientId: string, taskId: string) {
  await requireAuth();
  await connectToDatabase();

  const client = await CRMClient.findById(clientId);
  if (!client) throw new Error("Client project not found");

  client.tasks = client.tasks.filter((t: any) => t._id.toString() !== taskId && t.id !== taskId);

  if (client.tasks.length > 0) {
    const completedCount = client.tasks.filter((t: any) => t.status === "Completed" || t.completed).length;
    client.progress = Math.round((completedCount / client.tasks.length) * 100);
  }

  await client.save();
  return serialize(client);
}

// Get CRM Settings
export async function getCRMSettings() {
  await requireAuth();
  try {
    await connectToDatabase();
    const Setting = (await import("@/models/Setting")).default;
    let settings = await Setting.findOne();
    if (!settings) {
      settings = await Setting.create({});
    }
    return serialize(settings);
  } catch (error) {
    console.warn("Database connection failed. Falling back to default settings.", error);
    return serialize({
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
  }
}

// Update CRM Settings
export async function updateCRMSettings(settingsData: any) {
  await requireAuth();
  await connectToDatabase();
  const Setting = (await import("@/models/Setting")).default;
  let settings = await Setting.findOne();
  if (!settings) {
    settings = await Setting.create(settingsData);
  } else {
    Object.assign(settings, settingsData);
    await settings.save();
  }
  return serialize(settings);
}

