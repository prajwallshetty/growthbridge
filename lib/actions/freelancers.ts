"use server";

import { connectToDatabase } from "@/lib/db";
import Freelancer from "@/models/Freelancer";
import CRMProject from "@/models/CRMProject";
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

// Fetch all freelancers with computed project/earnings stats
export async function getFreelancers() {
  await requireAuth();
  await connectToDatabase();

  const freelancers = await Freelancer.find().sort({ createdAt: -1 }).lean();
  const projects = await CRMProject.find()
    .select("name status customerId projectValue assignedFreelancers")
    .populate("customerId", "company")
    .lean();

  const enriched = freelancers.map((f: any) => {
    const assigned = projects.filter((p: any) =>
      (p.assignedFreelancers || []).some((af: any) => af.freelancerId?.toString() === f._id.toString())
    );
    const active = assigned.filter((p: any) => !["Completed", "Cancelled"].includes(p.status));
    const completed = assigned.filter((p: any) => p.status === "Completed");

    const totalEarnings = (f.payments || [])
      .filter((p: any) => p.status === "Paid")
      .reduce((s: number, p: any) => s + (p.amount || 0), 0);
    const pendingPayment = (f.payments || [])
      .filter((p: any) => p.status === "Pending")
      .reduce((s: number, p: any) => s + (p.amount || 0), 0);

    return {
      ...f,
      stats: {
        activeProjectsCount: active.length,
        completedProjectsCount: completed.length,
        totalProjectsCount: assigned.length,
        totalEarnings,
        pendingPayment,
      },
      assignedProjects: assigned.map((p: any) => {
        const mine = (p.assignedFreelancers || []).find((af: any) => af.freelancerId?.toString() === f._id.toString());
        return {
          _id: p._id,
          name: p.name,
          client: p.customerId?.company || "",
          status: p.status,
          projectValue: p.projectValue,
          freelancerCost: mine?.agreedCost || 0,
        };
      }),
    };
  });

  return serialize(enriched);
}

export async function saveFreelancer(data: any) {
  await requireAuth();
  await connectToDatabase();

  const { _id, stats, assignedProjects, ...fields } = data;

  let freelancer;
  if (_id) {
    freelancer = await Freelancer.findByIdAndUpdate(_id, { $set: fields }, { new: true });
  } else {
    freelancer = await Freelancer.create({
      ...fields,
      activity: [{ text: "Freelancer profile created", timestamp: today(), type: "system" }],
    });
  }
  return serialize(freelancer);
}

export async function deleteFreelancer(id: string) {
  await requireAuth();
  await connectToDatabase();
  await Freelancer.findByIdAndDelete(id);
  return { success: true };
}

// Add a payment record on a freelancer's payment history
export async function addFreelancerPayment(freelancerId: string, paymentData: any) {
  await requireAuth();
  await connectToDatabase();

  const freelancer = await Freelancer.findById(freelancerId);
  if (!freelancer) throw new Error("Freelancer not found");

  freelancer.payments.push(paymentData);
  freelancer.activity.unshift({
    text: `Payment ${paymentData.status === "Paid" ? "recorded" : "scheduled"}: ₹${(paymentData.amount || 0).toLocaleString()} ${paymentData.project ? `(${paymentData.project})` : ""}`,
    timestamp: today(),
    type: "payment",
  });

  await freelancer.save();
  return serialize(freelancer);
}

export async function updateFreelancerPaymentStatus(freelancerId: string, paymentId: string, status: string) {
  await requireAuth();
  await connectToDatabase();

  const freelancer = await Freelancer.findById(freelancerId);
  if (!freelancer) throw new Error("Freelancer not found");

  const payment = freelancer.payments.id(paymentId);
  if (payment) payment.status = status;

  freelancer.activity.unshift({ text: `Payment status changed to: ${status}`, timestamp: today(), type: "payment" });

  await freelancer.save();
  return serialize(freelancer);
}
