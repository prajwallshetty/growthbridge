"use server";

import { connectToDatabase } from "@/lib/db";
import Lead from "@/models/Lead";
import CRMClient from "@/models/CRMClient";
import Reference from "@/models/Reference";
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

// Fetch all leads (excludes converted ones by default is NOT applied here — UI filters)
export async function getLeads() {
  await requireAuth();
  await connectToDatabase();
  const list = await Lead.find().sort({ createdAt: -1 }).populate("referenceId", "name type").lean();
  return serialize(list);
}

// Create or update a lead
export async function saveLead(leadData: any) {
  await requireAuth();
  await connectToDatabase();

  const { _id, ...fields } = leadData;

  if (fields.referenceId === "") fields.referenceId = null;

  let lead;
  if (_id) {
    lead = await Lead.findByIdAndUpdate(_id, { $set: fields }, { new: true });
  } else {
    lead = await Lead.create({
      ...fields,
      activity: [
        { text: `Lead created via ${fields.source || "Direct"}`, timestamp: today(), type: "system" },
      ],
    });
  }

  return serialize(lead);
}

export async function deleteLead(id: string) {
  await requireAuth();
  await connectToDatabase();
  await Lead.findByIdAndDelete(id);
  return { success: true };
}

// Update lead pipeline status quickly
export async function updateLeadStatus(id: string, status: string, lostReason?: string) {
  await requireAuth();
  await connectToDatabase();

  const lead = await Lead.findById(id);
  if (!lead) throw new Error("Lead not found");

  lead.status = status;
  if (status === "Lost" && lostReason) {
    lead.lostReason = lostReason;
  }
  lead.activity.unshift({
    text: `Status updated to: ${status}${lostReason ? ` (${lostReason})` : ""}`,
    timestamp: today(),
    type: "status",
  });

  await lead.save();
  return serialize(lead);
}

// Add / reschedule a follow-up on a lead
export async function addLeadFollowUp(id: string, followUp: any) {
  await requireAuth();
  await connectToDatabase();

  const lead = await Lead.findById(id);
  if (!lead) throw new Error("Lead not found");

  lead.followUps.push(followUp);
  lead.nextFollowUp = { date: followUp.date, time: followUp.time || "", type: followUp.type || "Call" };

  lead.activity.unshift({
    text: `Follow-up scheduled: ${followUp.type} on ${followUp.date}${followUp.time ? ` at ${followUp.time}` : ""}`,
    timestamp: today(),
    type: "followup",
  });

  await lead.save();
  return serialize(lead);
}

// Mark a follow-up complete and recompute next follow-up
export async function completeLeadFollowUp(id: string, followUpId: string) {
  await requireAuth();
  await connectToDatabase();

  const lead = await Lead.findById(id);
  if (!lead) throw new Error("Lead not found");

  const fu = lead.followUps.id(followUpId);
  if (fu) {
    fu.completed = true;
    fu.completedAt = today();
  }

  lead.lastContacted = today();

  // Recompute next upcoming (incomplete) follow-up
  const upcoming = lead.followUps
    .filter((f: any) => !f.completed)
    .sort((a: any, b: any) => a.date.localeCompare(b.date))[0];
  lead.nextFollowUp = upcoming
    ? { date: upcoming.date, time: upcoming.time || "", type: upcoming.type || "Call" }
    : { date: "", time: "", type: "Call" };

  lead.activity.unshift({ text: "Follow-up marked complete", timestamp: today(), type: "followup" });

  await lead.save();
  return serialize(lead);
}

// Add a free-text note / activity entry to a lead (calls, whatsapp, meeting logs)
export async function addLeadActivity(id: string, text: string, type: string = "note") {
  await requireAuth();
  await connectToDatabase();

  const lead = await Lead.findById(id);
  if (!lead) throw new Error("Lead not found");

  lead.activity.unshift({ text, timestamp: today(), type });
  if (["call", "whatsapp", "meeting", "email"].includes(type)) {
    lead.lastContacted = today();
  }

  await lead.save();
  return serialize(lead);
}

// THE CORE WORKFLOW: Convert a Lead into a Customer (CRMClient)
// Preserves lead info, reference info, and communication/activity history.
export async function convertLeadToCustomer(leadId: string) {
  await requireAuth();
  await connectToDatabase();

  const lead = await Lead.findById(leadId);
  if (!lead) throw new Error("Lead not found");

  if (lead.status === "Converted" && lead.convertedCustomerId) {
    const existing = await CRMClient.findById(lead.convertedCustomerId);
    if (existing) return serialize(existing);
  }

  const company = lead.company || lead.name;
  const logo = company
    .split(" ")
    .map((w: string) => w[0])
    .join("")
    .toUpperCase()
    .substring(0, 2);

  // Carry over the lead's activity log as the starting customer activity/timeline
  const carriedActivity = (lead.activity || []).map((a: any) => ({
    text: a.text,
    timestamp: a.timestamp,
    type: ["followup", "status", "system"].includes(a.type) ? "progress" : "chat",
  }));

  const customer = await CRMClient.create({
    name: lead.name,
    company,
    logo,
    phone: lead.phone,
    whatsapp: lead.whatsapp,
    email: lead.email,
    location: lead.location,
    source: lead.source,
    industry: lead.interestedService || "",
    budget: lead.estimatedBudget || 0,
    priority: lead.priority || "Medium",
    assignee: lead.assignedTo || "Unassigned",
    stage: "Lead Created",
    status: "Not Started",
    progress: 0,
    leadId: lead._id,
    referenceId: lead.referenceId || null,
    clientType: lead.referenceId ? "Referred" : "Direct",
    convertedAt: new Date(),
    activity: [
      { text: `Converted from lead (originally sourced via ${lead.source})`, timestamp: today(), type: "progress" },
      ...carriedActivity,
    ],
  });

  lead.status = "Converted";
  lead.convertedCustomerId = customer._id;
  lead.convertedAt = new Date();
  lead.activity.unshift({ text: `Converted to customer: ${company}`, timestamp: today(), type: "system" });
  await lead.save();

  return serialize(customer);
}

// Follow-up aggregation for the Activities/Follow-ups dashboard section
export async function getFollowUpFeed() {
  await requireAuth();
  await connectToDatabase();

  const leads = await Lead.find({ status: { $nin: ["Converted", "Lost"] } })
    .select("name company nextFollowUp assignedTo priority status")
    .lean();

  const todayStr = today();

  const items = leads
    .filter((l: any) => l.nextFollowUp && l.nextFollowUp.date)
    .map((l: any) => ({
      leadId: l._id,
      name: l.name,
      company: l.company,
      assignedTo: l.assignedTo,
      priority: l.priority,
      date: l.nextFollowUp.date,
      time: l.nextFollowUp.time,
      type: l.nextFollowUp.type,
    }));

  const overdue = items.filter((i) => i.date < todayStr);
  const dueToday = items.filter((i) => i.date === todayStr);
  const upcoming = items.filter((i) => i.date > todayStr).sort((a, b) => a.date.localeCompare(b.date));

  return serialize({ overdue, dueToday, upcoming });
}
