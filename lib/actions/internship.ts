"use server";

import { connectToDatabase } from "@/lib/db";
import InternshipDomain from "@/models/InternshipDomain";
import InternshipApplication from "@/models/InternshipApplication";
import InternshipOfferLetter from "@/models/InternshipOfferLetter";
import InternshipCertificate from "@/models/InternshipCertificate";
import InternshipTask from "@/models/InternshipTask";
import InternshipSubmission from "@/models/InternshipSubmission";
import InternshipNotification from "@/models/InternshipNotification";
import { generateOfferLetterPdf, generateCertificatePdf } from "@/lib/utils/pdf-generator";
import { revalidatePath } from "next/cache";

// Helper to serialize Mongoose documents to plain JS objects (solving Next.js client component boundary issues)
function serialize<T>(data: T): T {
  return JSON.parse(JSON.stringify(data));
}

// Helper: Auto-generate the next sequential Application ID (e.g. GBINT00001)
async function generateNextApplicationId(): Promise<string> {
  const lastApp = await InternshipApplication.findOne().sort({ createdAt: -1 });
  if (!lastApp || !lastApp.applicationId) {
    return "GBINT00001";
  }
  const lastNumStr = lastApp.applicationId.replace("GBINT", "");
  const nextNum = parseInt(lastNumStr, 10) + 1;
  return `GBINT${String(nextNum).padStart(5, "0")}`;
}

/* =========================================================================
   DOMAIN ACTIONS
   ========================================================================= */
export async function getDomains() {
  await connectToDatabase();
  let domains = await InternshipDomain.find().sort({ createdAt: -1 }).lean();
  if (!domains || domains.length === 0) {
    const defaultDomains = [
      { _id: "65f1a3b8c4d2e10a0a000001", name: "Full Stack Web Development", description: "Learn Next.js, Node.js, and MongoDB", duration: "4 Weeks" },
      { _id: "65f1a3b8c4d2e10a0a000002", name: "React Native Mobile App Development", description: "Build cross-platform mobile apps", duration: "4 Weeks" },
      { _id: "65f1a3b8c4d2e10a0a000003", name: "Machine Learning Engineering", description: "Build and deploy machine learning models", duration: "4 Weeks" },
      { _id: "65f1a3b8c4d2e10a0a000004", name: "Data Science & Analytics", description: "Analyze data and build insights", duration: "4 Weeks" },
    ];
    await InternshipDomain.create(defaultDomains);
    domains = await InternshipDomain.find().sort({ createdAt: -1 }).lean();
  }
  return serialize(domains);
}

export async function createDomain(data: { name: string; description: string; duration: string }) {
  await connectToDatabase();
  const domain = await InternshipDomain.create({
    name: data.name,
    description: data.description,
    duration: data.duration,
    isActive: true,
  });
  revalidatePath("/admin/internships/domains");
  return serialize(domain);
}

export async function updateDomain(id: string, data: { name: string; description: string; duration: string; isActive: boolean }) {
  await connectToDatabase();
  const domain = await InternshipDomain.findByIdAndUpdate(id, data, { new: true });
  revalidatePath("/admin/internships/domains");
  return serialize(domain);
}

export async function deleteDomain(id: string) {
  await connectToDatabase();
  // Clean up domain
  await InternshipDomain.findByIdAndDelete(id);
  revalidatePath("/admin/internships/domains");
  return { success: true };
}

/* =========================================================================
   APPLICATION ACTIONS
   ========================================================================= */
export async function getApplications(params: {
  status?: string;
  search?: string;
  page?: number;
  limit?: number;
}) {
  await connectToDatabase();
  const page = params.page || 1;
  const limit = params.limit || 10;
  const skip = (page - 1) * limit;

  const query: any = {};
  
  if (params.status && params.status !== "All") {
    query.status = params.status;
  }
  
  if (params.search) {
    query.$or = [
      { fullName: { $regex: params.search, $options: "i" } },
      { email: { $regex: params.search, $options: "i" } },
      { college: { $regex: params.search, $options: "i" } },
      { applicationId: { $regex: params.search, $options: "i" } },
    ];
  }

  const [applications, total] = await Promise.all([
    InternshipApplication.find(query)
      .populate("domainId")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean(),
    InternshipApplication.countDocuments(query),
  ]);

  return {
    data: serialize(applications),
    pagination: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    },
  };
}

export async function getAllApplicationsForExport() {
  await connectToDatabase();
  const apps = await InternshipApplication.find()
    .populate("domainId")
    .sort({ createdAt: -1 })
    .lean();
  return serialize(apps);
}

export async function getApplicationById(id: string) {
  await connectToDatabase();
  const application = await InternshipApplication.findById(id).populate("domainId").lean();
  if (!application) return null;

  // Fetch associated documents
  const offerLetter = await InternshipOfferLetter.findOne({ applicationId: id }).lean();
  const certificate = await InternshipCertificate.findOne({ applicationId: id }).lean();
  const submissions = await InternshipSubmission.find({ applicationId: id }).populate("taskId").lean();

  return serialize({
    ...application,
    offerLetter,
    certificate,
    submissions,
  });
}

export async function createApplication(data: any) {
  await connectToDatabase();
  const nextId = await generateNextApplicationId();
  
  const app = await InternshipApplication.create({
    ...data,
    applicationId: nextId,
    status: "Pending",
  });

  // Create initial notification
  await InternshipNotification.create({
    applicationId: app._id,
    title: "Application Received",
    message: `Hello ${app.fullName}, your application for the internship program (ID: ${nextId}) has been successfully received. We will review it shortly.`,
  });

  return serialize(app);
}

export async function updateApplicationStatus(id: string, status: string, remarks?: string) {
  await connectToDatabase();
  const app = await InternshipApplication.findById(id).populate("domainId");
  if (!app) throw new Error("Application not found");

  const oldStatus = app.status;
  app.status = status;
  if (remarks !== undefined) {
    app.remarks = remarks;
  }
  await app.save();

  // On Transition - Handle PDF Automations
  if (status === "Selected" && oldStatus !== "Selected") {
    // Generate Offer Letter Automatically
    const domain = app.domainId as any;
    const joiningDate = new Date(Date.now() + 86400000 * 7).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });

    try {
      const offerUrl = await generateOfferLetterPdf({
        applicationId: app.applicationId,
        studentName: app.fullName,
        domainName: domain?.name || "Internship Program",
        duration: domain?.duration || "3 Weeks",
        joiningDate: joiningDate,
      });

      // Save Offer Letter record
      await InternshipOfferLetter.findOneAndUpdate(
        { applicationId: app._id },
        { offerLetterUrl: offerUrl, generatedAt: new Date() },
        { upsert: true, new: true }
      );

      // Save Notification
      await InternshipNotification.create({
        applicationId: app._id,
        title: "Offer Letter Issued",
        message: `Congratulations! Your offer letter has been generated. Access URL: ${offerUrl}. Joining date: ${joiningDate}.`,
      });

      console.log(`[Email Mock Automation] To: ${app.email} | Subject: Internship Offer Letter | Content: Congrats, download here: ${offerUrl}`);
    } catch (err) {
      console.error("Failed to generate and save offer letter:", err);
    }
  } else if (status === "Completed" && oldStatus !== "Completed") {
    // Generate Certificate Automatically
    const domain = app.domainId as any;
    const certId = `GBCERT${Math.floor(10000 + Math.random() * 90000)}`;

    try {
      const { pdfUrl, qrCodeUrl } = await generateCertificatePdf({
        certificateId: certId,
        studentName: app.fullName,
        domainName: domain?.name || "Internship Program",
        duration: domain?.duration || "3 Weeks",
        issueDate: new Date().toLocaleDateString("en-US", {
          year: "numeric",
          month: "long",
          day: "numeric",
        }),
        projectTitle: remarks || "Full Stack Capstone Application",
        performance: "Outstanding",
      });

      // Save Certificate record
      await InternshipCertificate.findOneAndUpdate(
        { applicationId: app._id },
        {
          certificateId: certId,
          certificateUrl: pdfUrl,
          qrCode: qrCodeUrl,
          issueDate: new Date(),
          performance: "Outstanding",
          projectTitle: remarks || "Full Stack Capstone Application",
          verified: true,
        },
        { upsert: true, new: true }
      );

      // Save Notification
      await InternshipNotification.create({
        applicationId: app._id,
        title: "Certificate of Completion Issued",
        message: `Congratulations! You have successfully completed your internship. Your certificate (ID: ${certId}) has been generated. Access URL: ${pdfUrl}`,
      });

      console.log(`[Email Mock Automation] To: ${app.email} | Subject: Internship Certificate | Content: Congrats on completing your internship. Certificate: ${pdfUrl}`);
    } catch (err) {
      console.error("Failed to generate and save certificate:", err);
    }
  }

  revalidatePath(`/admin/internships/applicants/${id}`);
  revalidatePath("/admin/internships/applications");
  return serialize(app);
}

/* =========================================================================
   TASK ACTIONS
   ========================================================================= */
export async function getTasksByDomain(domainId: string) {
  await connectToDatabase();
  const tasks = await InternshipTask.find({ domainId }).sort({ week: 1, order: 1 }).lean();
  return serialize(tasks);
}

export async function createTask(data: { domainId: string; title: string; description: string; week: number; order: number }) {
  await connectToDatabase();
  const task = await InternshipTask.create(data);
  revalidatePath("/admin/internships/tasks");
  return serialize(task);
}

export async function updateTask(id: string, data: { title: string; description: string; week: number; order: number }) {
  await connectToDatabase();
  const task = await InternshipTask.findByIdAndUpdate(id, data, { new: true });
  revalidatePath("/admin/internships/tasks");
  return serialize(task);
}

export async function deleteTask(id: string) {
  await connectToDatabase();
  await InternshipTask.findByIdAndDelete(id);
  revalidatePath("/admin/internships/tasks");
  return { success: true };
}

export async function reorderTasks(tasks: { _id: string; order: number }[]) {
  await connectToDatabase();
  const bulkOps = tasks.map((t) => ({
    updateOne: {
      filter: { _id: t._id },
      update: { order: t.order },
    },
  }));
  await InternshipTask.bulkWrite(bulkOps);
  revalidatePath("/admin/internships/tasks");
  return { success: true };
}

/* =========================================================================
   SUBMISSION ACTIONS
   ========================================================================= */
export async function getSubmissions(applicationId: string) {
  await connectToDatabase();
  const submissions = await InternshipSubmission.find({ applicationId })
    .populate("taskId")
    .lean();
  return serialize(submissions);
}

export async function submitTask(data: {
  applicationId: string;
  taskId: string;
  githubUrl: string;
  demoUrl?: string;
  remarks?: string;
}) {
  await connectToDatabase();
  const submission = await InternshipSubmission.create({
    ...data,
    status: "Pending",
  });
  return serialize(submission);
}

export async function gradeSubmission(submissionId: string, marks: number, remarks: string) {
  await connectToDatabase();
  const submission = await InternshipSubmission.findByIdAndUpdate(
    submissionId,
    { marks, remarks, status: "Reviewed" },
    { new: true }
  );
  return serialize(submission);
}

/* =========================================================================
   NOTIFICATIONS ACTIONS
   ========================================================================= */
export async function getNotifications(applicationId: string) {
  await connectToDatabase();
  const notifications = await InternshipNotification.find({ applicationId }).sort({ createdAt: -1 }).lean();
  return serialize(notifications);
}

export async function markNotificationRead(id: string) {
  await connectToDatabase();
  const notification = await InternshipNotification.findByIdAndUpdate(id, { read: true }, { new: true });
  return serialize(notification);
}

/* =========================================================================
   CERTIFICATES / OFFER LETTERS LOGS
   ========================================================================= */
export async function getCertificates() {
  await connectToDatabase();
  const certs = await InternshipCertificate.find()
    .populate({
      path: "applicationId",
      populate: { path: "domainId" }
    })
    .sort({ issueDate: -1 })
    .lean();
  return serialize(certs);
}

export async function getOfferLetters() {
  await connectToDatabase();
  const letters = await InternshipOfferLetter.find()
    .populate({
      path: "applicationId",
      populate: { path: "domainId" }
    })
    .sort({ generatedAt: -1 })
    .lean();
  return serialize(letters);
}

export async function getCertificateByVerificationId(certificateId: string) {
  await connectToDatabase();
  const cert = await InternshipCertificate.findOne({ certificateId })
    .populate({
      path: "applicationId",
      populate: { path: "domainId" }
    })
    .lean();
  return serialize(cert);
}

/* =========================================================================
   ANALYTICS & REPORTS
   ========================================================================= */
export async function getInternshipAnalytics() {
  await connectToDatabase();

  // Basic counters
  const total = await InternshipApplication.countDocuments();
  const pending = await InternshipApplication.countDocuments({ status: "Pending" });
  const shortlisted = await InternshipApplication.countDocuments({ status: "Shortlisted" });
  const selected = await InternshipApplication.countDocuments({ status: "Selected" });
  const rejected = await InternshipApplication.countDocuments({ status: "Rejected" });
  const completed = await InternshipApplication.countDocuments({ status: "Completed" });

  const certificatesCount = await InternshipCertificate.countDocuments();
  const offerLettersCount = await InternshipOfferLetter.countDocuments();

  // Domain breakdown
  const domains = await InternshipDomain.find().lean();
  const domainBreakdown = await Promise.all(
    domains.map(async (d) => {
      const count = await InternshipApplication.countDocuments({ domainId: d._id });
      return { name: d.name, value: count };
    })
  );

  // Applications monthly trend (past 6 months)
  const monthlyTrend = [];
  const now = new Date();
  for (let i = 5; i >= 0; i--) {
    const startOfMonth = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() - i + 1, 0, 23, 59, 59);
    
    const count = await InternshipApplication.countDocuments({
      createdAt: { $gte: startOfMonth, $lte: endOfMonth },
    });

    const monthName = startOfMonth.toLocaleString("default", { month: "short" });
    monthlyTrend.push({ month: monthName, count });
  }

  // Completion rate (completed / selected * 100)
  const completionRate = selected > 0 ? Math.round((completed / selected) * 100) : 0;

  return serialize({
    counters: {
      total,
      pending,
      shortlisted,
      selected,
      rejected,
      completed,
      certificatesCount,
      offerLettersCount,
    },
    domainBreakdown,
    monthlyTrend,
    completionRate,
  });
}
