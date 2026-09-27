"use server";

import { connectToDatabase } from "@/lib/db";
import CRMProject from "@/models/CRMProject";
import CRMClient from "@/models/CRMClient";
import Freelancer from "@/models/Freelancer";
import { getSessionUser } from "@/lib/actions/cms";

async function requireAuth() {
  const sessionUser = await getSessionUser();
  if (!sessionUser) {
    throw new Error("Unauthorized. Please log in.");
  }
  return sessionUser;
}

function serialize<T>(data: T): T {
  return JSON.parse(JSON.stringify(data));
}

function today() {
  return new Date().toISOString().split("T")[0];
}

function withFinancials(project: any) {
  const received = (project.payments || []).reduce((s: number, p: any) => s + (p.amount || 0), 0);
  const expensesTotal = (project.expenses || []).reduce((s: number, e: any) => s + (e.amount || 0), 0);
  const pending = Math.max(0, (project.projectValue || 0) - received);
  const grossProfit = (project.projectValue || 0) - (project.freelancerCost || 0) - expensesTotal;
  return { ...project, amountReceived: received, amountPending: pending, totalExpenses: expensesTotal, grossProfit };
}

// Fetch all CRM projects (across all customers), with customer info populated
export async function getCRMProjects() {
  await requireAuth();
  await connectToDatabase();

  const projects = await CRMProject.find()
    .sort({ createdAt: -1 })
    .populate("customerId", "company name")
    .lean();

  return serialize(projects.map(withFinancials));
}

// Fetch all projects for a single customer
export async function getCRMProjectsByCustomer(customerId: string) {
  await requireAuth();
  await connectToDatabase();

  const projects = await CRMProject.find({ customerId }).sort({ createdAt: -1 }).lean();
  return serialize(projects.map(withFinancials));
}

export async function saveCRMProject(data: any) {
  await requireAuth();
  await connectToDatabase();

  const { _id, ...fields } = data;

  let project;
  if (_id) {
    project = await CRMProject.findByIdAndUpdate(_id, { $set: fields }, { new: true });
  } else {
    if (!fields.customerId) throw new Error("A project must be linked to a customer");
    project = await CRMProject.create({
      ...fields,
      activity: [{ text: `Project created: ${fields.name}`, timestamp: today(), type: "system" }],
    });

    // Reflect back onto the customer timeline
    const customer = await CRMClient.findById(fields.customerId);
    if (customer) {
      customer.activity.unshift({ text: `New project started: ${fields.name}`, timestamp: today(), type: "progress" });
      await customer.save();
    }
  }

  return serialize(withFinancials(project.toObject ? project.toObject() : project));
}

export async function deleteCRMProject(id: string) {
  await requireAuth();
  await connectToDatabase();
  await CRMProject.findByIdAndDelete(id);
  return { success: true };
}

export async function updateCRMProjectStatus(id: string, status: string) {
  await requireAuth();
  await connectToDatabase();

  const project = await CRMProject.findById(id);
  if (!project) throw new Error("Project not found");

  project.status = status;
  project.activity.unshift({ text: `Status updated to: ${status}`, timestamp: today(), type: "status" });

  await project.save();
  return serialize(withFinancials(project.toObject()));
}

// Assign one or more freelancers to a project, each with an agreed cost
export async function assignFreelancersToProject(
  projectId: string,
  assignments: { freelancerId: string; agreedCost: number }[]
) {
  await requireAuth();
  await connectToDatabase();

  const project = await CRMProject.findById(projectId);
  if (!project) throw new Error("Project not found");

  const freelancers = await Freelancer.find({ _id: { $in: assignments.map((a) => a.freelancerId) } });

  project.assignedFreelancers = assignments.map((a) => {
    const f = freelancers.find((fl: any) => fl._id.toString() === a.freelancerId);
    return { freelancerId: a.freelancerId, name: f?.name || "", agreedCost: a.agreedCost || 0 };
  });
  project.freelancerCost = assignments.reduce((s, a) => s + (a.agreedCost || 0), 0);

  project.activity.unshift({
    text: `Freelancer(s) assigned: ${project.assignedFreelancers.map((af: any) => af.name).join(", ")}`,
    timestamp: today(),
    type: "assignment",
  });

  await project.save();

  // Log on each freelancer's activity feed & mark them Working
  for (const a of assignments) {
    const freelancer = await Freelancer.findById(a.freelancerId);
    if (freelancer) {
      freelancer.activity.unshift({
        text: `Assigned to project: ${project.name} (Cost: ₹${(a.agreedCost || 0).toLocaleString()})`,
        timestamp: today(),
        type: "assignment",
      });
      if (freelancer.status === "Available") freelancer.status = "Working";
      await freelancer.save();
    }
  }

  return serialize(withFinancials(project.toObject()));
}

export async function addCRMProjectPayment(projectId: string, paymentData: any) {
  await requireAuth();
  await connectToDatabase();

  const project = await CRMProject.findById(projectId);
  if (!project) throw new Error("Project not found");

  project.payments.push(paymentData);
  project.activity.unshift({
    text: `Payment received: ₹${(paymentData.amount || 0).toLocaleString()} (Ref: ${paymentData.referenceNumber || "N/A"})`,
    timestamp: today(),
    type: "payment",
  });

  await project.save();
  return serialize(withFinancials(project.toObject()));
}

export async function deleteCRMProjectPayment(projectId: string, paymentId: string) {
  await requireAuth();
  await connectToDatabase();

  const project = await CRMProject.findById(projectId);
  if (!project) throw new Error("Project not found");

  project.payments = project.payments.filter((p: any) => p._id.toString() !== paymentId);
  project.activity.unshift({ text: "Payment record removed", timestamp: today(), type: "payment" });

  await project.save();
  return serialize(withFinancials(project.toObject()));
}

export async function addCRMProjectExpense(projectId: string, expenseData: any) {
  await requireAuth();
  await connectToDatabase();

  const project = await CRMProject.findById(projectId);
  if (!project) throw new Error("Project not found");

  project.expenses.push(expenseData);
  project.activity.unshift({
    text: `Expense added: ${expenseData.name} — ₹${(expenseData.amount || 0).toLocaleString()}`,
    timestamp: today(),
    type: "expense",
  });

  await project.save();
  return serialize(withFinancials(project.toObject()));
}

// Aggregated payments ledger across every project (for the Payments CRM section)
export async function getAllPayments() {
  await requireAuth();
  await connectToDatabase();

  const projects = await CRMProject.find()
    .select("name customerId payments projectValue")
    .populate("customerId", "company")
    .lean();

  const rows: any[] = [];
  projects.forEach((p: any) => {
    (p.payments || []).forEach((pay: any) => {
      rows.push({
        _id: pay._id,
        projectId: p._id,
        projectName: p.name,
        customer: p.customerId?.company || "",
        amount: pay.amount,
        paymentDate: pay.paymentDate,
        paymentMethod: pay.paymentMethod,
        referenceNumber: pay.referenceNumber,
        notes: pay.notes,
      });
    });
  });

  rows.sort((a, b) => (b.paymentDate || "").localeCompare(a.paymentDate || ""));
  return serialize(rows);
}
