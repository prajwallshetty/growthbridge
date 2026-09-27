"use server";

import { connectToDatabase } from "@/lib/db";
import Reference from "@/models/Reference";
import Lead from "@/models/Lead";
import CRMClient from "@/models/CRMClient";
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

// Fetch all references with computed referral stats (no duplicated/stored stats)
export async function getReferences() {
  await requireAuth();
  await connectToDatabase();

  const refs = await Reference.find().sort({ createdAt: -1 }).lean();
  const leads = await Lead.find().select("referenceId status estimatedBudget convertedCustomerId").lean();

  const customers = await CRMClient.find({ referenceId: { $ne: null } })
    .select("referenceId payments invoices budget")
    .lean();

  const enriched = refs.map((ref: any) => {
    const refLeads = leads.filter((l: any) => l.referenceId && l.referenceId.toString() === ref._id.toString());
    const converted = refLeads.filter((l: any) => l.status === "Converted");
    const lost = refLeads.filter((l: any) => l.status === "Lost");
    const active = refLeads.filter((l: any) => !["Converted", "Lost"].includes(l.status));

    const refCustomers = customers.filter((c: any) => c.referenceId && c.referenceId.toString() === ref._id.toString());
    let businessGenerated = 0;
    refCustomers.forEach((c: any) => {
      if (c.payments && c.payments.length > 0) {
        businessGenerated += c.payments.reduce((s: number, p: any) => s + (p.amount || 0), 0);
      } else if (c.invoices && c.invoices.length > 0) {
        businessGenerated += c.invoices
          .filter((i: any) => i.status === "Paid")
          .reduce((s: number, i: any) => s + (i.amount || 0), 0);
      }
    });

    return {
      ...ref,
      stats: {
        totalLeadsReferred: refLeads.length,
        convertedLeads: converted.length,
        lostLeads: lost.length,
        activeLeads: active.length,
        totalBusinessGenerated: businessGenerated,
      },
    };
  });

  return serialize(enriched);
}

// Get every lead & customer referred by a specific reference person
export async function getReferralDetail(referenceId: string) {
  await requireAuth();
  await connectToDatabase();

  const leads = await Lead.find({ referenceId }).sort({ createdAt: -1 }).lean();
  const customers = await CRMClient.find({ referenceId }).sort({ createdAt: -1 }).lean();

  return serialize({ leads, customers });
}

export async function saveReference(data: any) {
  await requireAuth();
  await connectToDatabase();

  const { _id, stats, ...fields } = data;

  let ref;
  if (_id) {
    ref = await Reference.findByIdAndUpdate(_id, { $set: fields }, { new: true });
  } else {
    ref = await Reference.create(fields);
  }
  return serialize(ref);
}

export async function deleteReference(id: string) {
  await requireAuth();
  await connectToDatabase();
  await Reference.findByIdAndDelete(id);
  return { success: true };
}
