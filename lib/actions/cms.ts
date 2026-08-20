"use server";

import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import * as jose from "jose";
import { connectToDatabase } from "@/lib/db";
import Blog from "@/models/Blog";
import Project from "@/models/Project";
import Service from "@/models/Service";
import Testimonial from "@/models/Testimonial";
import Page from "@/models/Page";
import Homepage from "@/models/Homepage";
import Setting from "@/models/Setting";
import ActivityLog from "@/models/ActivityLog";
import TeamMember from "@/models/TeamMember";

const JWT_SECRET = process.env.JWT_SECRET || "growthbridge_admin_jwt_secret_token_12345";

// Helper: Get authenticated session user
export async function getSessionUser() {
  const cookieStore = await cookies();
  const token = cookieStore.get("admin_session")?.value;
  if (!token) return null;

  try {
    const secret = new TextEncoder().encode(JWT_SECRET);
    const { payload } = await jose.jwtVerify(token, secret);
    return payload as { userId: string; name: string; email: string; role: string };
  } catch (error) {
    console.error("JWT Verify Error in session helper:", error);
    return null;
  }
}

// Helper: Log admin activity
export async function logActivity(action: string) {
  try {
    const user = await getSessionUser();
    if (!user) return;

    await connectToDatabase();
    await ActivityLog.create({
      userName: user.name,
      userEmail: user.email,
      action,
    });
  } catch (error) {
    console.error("Failed to log activity:", error);
  }
}

// Serialize helper to avoid Next.js "Only plain objects can be passed to Client Components"
function serialize<T>(data: T): T {
  return JSON.parse(JSON.stringify(data));
}

/* ==========================================
   BLOG CMS ACTIONS
   ========================================== */
export async function getBlogs() {
  await connectToDatabase();
  let list = await Blog.find({ status: "Published" }).sort({ publishDate: -1 }).lean();

  if (list.length === 0) {
    const defaultBlogs = [
      {
        title: "The design-to-code gap is costing you momentum.",
        subtitle: "How fractional engineering teams bridge complex layout execution with premium developer-first systems.",
        slug: "design-to-code-gap",
        content: "A detailed post about how modern design workflows can be translated directly into high-fidelity code components.",
        author: "Prajwal Shetty",
        image: "https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?w=800&auto=format&fit=crop&q=80",
        readTime: 5,
        tags: ["Design", "Engineering"],
        categories: ["Workflow"],
        status: "Published",
        publishDate: new Date(),
      },
      {
        title: "Why we built a static-first CMS pipeline for Next.js 16.",
        subtitle: "A deep dive into combining incremental static generation with flexible, dynamic administrator panels.",
        slug: "static-first-cms-pipeline",
        content: "We explore the architecture behind building performant web applications with sub-second page loads.",
        author: "Prajwal Shetty",
        image: "https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=800&auto=format&fit=crop&q=80",
        readTime: 4,
        tags: ["Next.js", "CMS"],
        categories: ["Technology"],
        status: "Published",
        publishDate: new Date(Date.now() - 86400000), // 1 day ago
      },
      {
        title: "How to optimize LCP and INP on dynamic landing pages.",
        subtitle: "Actionable steps to keep your user interfaces interactive and lightweight while loading dynamic media.",
        slug: "optimize-lcp-inp-dynamic-pages",
        content: "Practical tips on lazy loading components, image optimizations, and fine-tuning Framer Motion paints.",
        author: "Prajwal Shetty",
        image: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&auto=format&fit=crop&q=80",
        readTime: 6,
        tags: ["Performance", "Core Web Vitals"],
        categories: ["Optimization"],
        status: "Published",
        publishDate: new Date(Date.now() - 172800000), // 2 days ago
      },
    ];
    await Blog.create(defaultBlogs);
    list = await Blog.find({ status: "Published" }).sort({ publishDate: -1 }).lean();
  }

  return serialize(list);
}

export async function getBlogBySlug(slug: string) {
  await connectToDatabase();
  const blog = await Blog.findOne({ slug, status: "Published" }).lean();
  return blog ? serialize(blog) : null;
}

export async function saveBlog(data: any) {
  const user = await getSessionUser();
  if (!user) throw new Error("Unauthorized");

  await connectToDatabase();
  let blog;
  if (data._id) {
    blog = await Blog.findByIdAndUpdate(data._id, data, { new: true });
    await logActivity(`Updated blog post: "${data.title}"`);
  } else {
    blog = await Blog.create(data);
    await logActivity(`Created new blog post: "${data.title}"`);
  }
  return serialize(blog);
}

export async function deleteBlog(id: string) {
  const user = await getSessionUser();
  if (!user) throw new Error("Unauthorized");

  await connectToDatabase();
  const blog = await Blog.findById(id);
  if (blog) {
    await Blog.findByIdAndDelete(id);
    await logActivity(`Deleted blog post: "${blog.title}"`);
  }
  return { success: true };
}

/* ==========================================
   TEAM MEMBER CMS ACTIONS
   ========================================== */
export async function getTeamMembers() {
  await connectToDatabase();
  let list = await TeamMember.find().sort({ order: 1, createdAt: -1 }).lean();

  if (list.length === 0) {
    const defaultTeam = [
      {
        name: "Prajwal Shetty",
        role: "Founder & Chief Architect",
        bio: "We started Growth Bridge because we kept watching good businesses get mediocre work from teams that thought like vendors instead of operators. Fifty-plus projects later, that's still the whole pitch.",
        image: "/founder.png",
        instagram: "https://instagram.com",
        email: "hello@growthbridge.live",
        featured: true,
        order: 0,
      },
      {
        name: "Sarah Jenkins",
        role: "Lead Product Designer",
        bio: "Designing digital experiences that bridge brand strategy with production-ready frontends. Former designer at Stripe and Vercel.",
        image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&h=400&fit=crop&crop=face",
        instagram: "https://instagram.com",
        email: "sarah@growthbridge.studio",
        featured: true,
        order: 1,
      },
      {
        name: "Alex Rivera",
        role: "Senior Fullstack Engineer",
        bio: "Specializing in low-latency Next.js integrations, dynamic content pipelines, and clean API structure. Obsessed with sub-second page performance.",
        image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop&crop=face",
        instagram: "https://instagram.com",
        email: "alex@growthbridge.studio",
        featured: true,
        order: 2,
      },
    ];
    await TeamMember.insertMany(defaultTeam);
    list = await TeamMember.find().sort({ order: 1, createdAt: -1 }).lean();
  }

  return serialize(list);
}

export async function saveTeamMember(data: any) {
  const user = await getSessionUser();
  if (!user) throw new Error("Unauthorized");

  await connectToDatabase();
  let member;
  if (data._id) {
    member = await TeamMember.findByIdAndUpdate(data._id, data, { new: true });
    await logActivity(`Updated team member: "${data.name}"`);
  } else {
    member = await TeamMember.create(data);
    await logActivity(`Created new team member: "${data.name}"`);
  }
  return serialize(member);
}

export async function deleteTeamMember(id: string) {
  const user = await getSessionUser();
  if (!user) throw new Error("Unauthorized");

  await connectToDatabase();
  const member = await TeamMember.findById(id);
  if (member) {
    await TeamMember.findByIdAndDelete(id);
    await logActivity(`Deleted team member: "${member.name}"`);
  }
  return { success: true };
}

/* ==========================================
   PORTFOLIO (PROJECT) CMS ACTIONS
   ========================================== */
export async function getProjects() {
  await connectToDatabase();
  const list = await Project.find().sort({ createdAt: -1 }).lean();

  // Normalize status, client, and categories for all retrieved documents
  const mappedList = list.map((p: any) => {
    const updated = { ...p };
    if (!updated.status) {
      updated.status = updated.completed ? "Completed" : "Ongoing";
    } else {
      const lower = updated.status.toLowerCase();
      if (lower === "completed") updated.status = "Completed";
      else if (lower === "ongoing") updated.status = "Ongoing";
      else if (lower === "not-started" || lower === "not started") updated.status = "Not Started";
    }
    if (!updated.client) {
      updated.client = "Client Project";
    }
    if (!updated.category) {
      updated.category = "Website";
    }
    return updated;
  });

  return serialize(mappedList);
}

export async function saveProject(data: any) {
  const user = await getSessionUser();
  if (!user) throw new Error("Unauthorized");

  await connectToDatabase();
  let project;
  
  const cleanedData = { ...data };

  // Normalize status string & sync completed boolean
  if (cleanedData.status) {
    const lower = cleanedData.status.toLowerCase();
    if (lower === "completed") {
      cleanedData.status = "Completed";
      cleanedData.completed = true;
      cleanedData.progress = 100;
    } else if (lower === "ongoing") {
      cleanedData.status = "Ongoing";
      cleanedData.completed = false;
      if (!cleanedData.progress || cleanedData.progress === 0 || cleanedData.progress === 100) {
        cleanedData.progress = 50;
      }
    } else {
      cleanedData.status = "Not Started";
      cleanedData.completed = false;
      cleanedData.progress = 0;
    }
  } else {
    cleanedData.status = "Ongoing";
    cleanedData.completed = false;
  }

  if (!cleanedData.category) cleanedData.category = "Website";
  if (!cleanedData.description) cleanedData.description = cleanedData.title || "Portfolio Project";

  // Clean dates if provided
  if (cleanedData.startDate) cleanedData.startDate = new Date(cleanedData.startDate);
  if (cleanedData.dueDate) cleanedData.dueDate = new Date(cleanedData.dueDate);
  if (cleanedData.completionDate) {
    cleanedData.completionDate = new Date(cleanedData.completionDate);
  } else if (cleanedData.status === "Completed" && !cleanedData.completionDate) {
    cleanedData.completionDate = new Date();
  } else {
    cleanedData.completionDate = null;
  }

  if (cleanedData._id) {
    project = await Project.findByIdAndUpdate(cleanedData._id, cleanedData, { new: true });
    await logActivity(`Updated portfolio project: "${cleanedData.title}"`);
  } else {
    project = await Project.create(cleanedData);
    await logActivity(`Created new portfolio project: "${cleanedData.title}"`);
  }

  revalidatePath("/");
  revalidatePath("/projects");
  revalidatePath("/admin/portfolio");
  return serialize(project);
}

export async function deleteProject(id: string) {
  const user = await getSessionUser();
  if (!user) throw new Error("Unauthorized");

  await connectToDatabase();
  const project = await Project.findById(id);
  if (project) {
    // Storage image cleanup if Cloudinary publicId exists
    try {
      if (project.image && project.image.includes("cloudinary")) {
        const Media = (await import("@/models/Media")).default;
        const mediaRecord = await Media.findOne({ url: project.image });
        if (mediaRecord && mediaRecord.publicId) {
          const cloudinary = (await import("@/lib/cloudinary")).default;
          await cloudinary.uploader.destroy(mediaRecord.publicId).catch(() => {});
          await Media.findByIdAndDelete(mediaRecord._id).catch(() => {});
        }
      }
    } catch (e) {
      console.warn("Storage cleanup warning:", e);
    }

    await Project.findByIdAndDelete(id);
    await logActivity(`Deleted portfolio project: "${project.title}"`);
  }

  revalidatePath("/");
  revalidatePath("/projects");
  revalidatePath("/admin/portfolio");
  return { success: true };
}

export async function updateProjectStatus(id: string, status: "not-started" | "ongoing" | "completed") {
  const user = await getSessionUser();
  if (!user) throw new Error("Unauthorized: Please log in to the admin panel to update project status.");

  await connectToDatabase();
  const updateData: any = {
    status,
    completed: status === "completed",
  };

  if (status === "completed") {
    updateData.completionDate = new Date();
    updateData.progress = 100;
  } else if (status === "not-started") {
    updateData.progress = 0;
    updateData.completionDate = null;
  } else {
    // For ongoing, reset progress to a default of 10% if it was 0 or 100, otherwise keep it
    const existing = await Project.findById(id).lean() as any;
    if (existing) {
      if (existing.progress === 0 || existing.progress === 100) {
        updateData.progress = 10;
      }
    }
    updateData.completionDate = null;
  }

  const project = await Project.findByIdAndUpdate(id, updateData, { new: true });
  await logActivity(`Moved project "${project.title}" to status: ${status}`);

  revalidatePath("/");
  revalidatePath("/projects");
  return serialize(project);
}

/* ==========================================
   SERVICES CMS ACTIONS
   ========================================== */
export async function getServices() {
  await connectToDatabase();
  let list = await Service.find().sort({ createdAt: 1 }).lean();

  if (list.length === 0) {
    const defaultServices = [
      {
        title: "Website development",
        description: "Fast, polished marketing sites designed to convert visitors into pipeline. Every pixel intentional, every load time respected.",
      },
      {
        title: "Brand strategy",
        description: "Positioning, naming, and visual language built on a point of view you can actually defend in a room full of competitors.",
      },
      {
        title: "Product design",
        description: "Interfaces shaped around clarity and momentum — wireframes through to a system your engineers can build without guessing.",
      },
      {
        title: "Growth marketing",
        description: "Funnels and experiment systems that turn attention into measurable, compounding pipeline rather than one-off spikes.",
      },
      {
        title: "AI automation",
        description: "Workflow systems that remove repetitive ops work so your team's time goes toward the calls only a person can make.",
      },
      {
        title: "Product development",
        description: "From prototype to launch-ready build, engineered with the same restraint and pace as the design that precedes it.",
      },
    ];
    await Service.insertMany(defaultServices);
    list = await Service.find().sort({ createdAt: 1 }).lean();
  }
  return serialize(list);
}

export async function saveService(data: any) {
  const user = await getSessionUser();
  if (!user) throw new Error("Unauthorized");

  await connectToDatabase();
  let service;
  if (data._id) {
    service = await Service.findByIdAndUpdate(data._id, data, { new: true });
    await logActivity(`Updated service details: "${data.title}"`);
  } else {
    service = await Service.create(data);
    await logActivity(`Created new service item: "${data.title}"`);
  }
  revalidatePath("/");
  return serialize(service);
}

export async function deleteService(id: string) {
  const user = await getSessionUser();
  if (!user) throw new Error("Unauthorized");

  await connectToDatabase();
  const service = await Service.findById(id);
  if (service) {
    await Service.findByIdAndDelete(id);
    await logActivity(`Deleted service item: "${service.title}"`);
  }
  revalidatePath("/");
  return { success: true };
}

/* ==========================================
   TESTIMONIALS CMS ACTIONS
   ========================================== */
export async function getTestimonials() {
  await connectToDatabase();
  let list = await Testimonial.find().sort({ createdAt: -1 }).lean();

  if (list.length === 0) {
    const defaultTestimonials = [
      {
        name: "Riya Shah",
        designation: "Founder, Northstar Commerce",
        image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&h=150&fit=crop&crop=face",
        quote: "Growth Bridge gave our brand the kind of presence we used to think only enterprise teams could afford.",
      },
      {
        name: "Daniel Morris",
        designation: "Director, Atlas Clinics",
        image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face",
        quote: "They turned a scattered sales process into one clean system. We saw better leads within weeks.",
      },
      {
        name: "Anika Rao",
        designation: "CEO, Pulse SaaS",
        image: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&h=150&fit=crop&crop=face",
        quote: "The design taste is obvious, but the operating discipline is what made the project special.",
      },
    ];
    await Testimonial.insertMany(defaultTestimonials);
    list = await Testimonial.find().sort({ createdAt: -1 }).lean();
  }

  return serialize(list);
}

export async function saveTestimonial(data: any) {
  const user = await getSessionUser();
  if (!user) throw new Error("Unauthorized");

  await connectToDatabase();
  let testimonial;
  if (data._id) {
    testimonial = await Testimonial.findByIdAndUpdate(data._id, data, { new: true });
    await logActivity(`Updated testimonial client: "${data.name}"`);
  } else {
    testimonial = await Testimonial.create(data);
    await logActivity(`Created new testimonial client: "${data.name}"`);
  }
  return serialize(testimonial);
}

export async function deleteTestimonial(id: string) {
  const user = await getSessionUser();
  if (!user) throw new Error("Unauthorized");

  await connectToDatabase();
  const testimonial = await Testimonial.findById(id);
  if (testimonial) {
    await Testimonial.findByIdAndDelete(id);
    await logActivity(`Deleted testimonial client: "${testimonial.name}"`);
  }
  return { success: true };
}

/* ==========================================
   PAGES CMS ACTIONS
   ========================================== */
export async function getPages() {
  await connectToDatabase();
  const list = await Page.find().sort({ title: 1 }).lean();
  return serialize(list);
}

export async function savePage(data: any) {
  const user = await getSessionUser();
  if (!user) throw new Error("Unauthorized");

  await connectToDatabase();
  let page;
  if (data._id) {
    page = await Page.findByIdAndUpdate(data._id, data, { new: true });
    await logActivity(`Updated static page: "${data.title}"`);
  } else {
    page = await Page.create(data);
    await logActivity(`Created static page: "${data.title}"`);
  }
  return serialize(page);
}

export async function deletePage(id: string) {
  const user = await getSessionUser();
  if (!user) throw new Error("Unauthorized");

  await connectToDatabase();
  const page = await Page.findById(id);
  if (page) {
    await Page.findByIdAndDelete(id);
    await logActivity(`Deleted static page: "${page.title}"`);
  }
  return { success: true };
}

/* ==========================================
   HOMEPAGE CMS CONFIG ACTIONS
   ========================================== */
export async function getHomepageConfig() {
  await connectToDatabase();
  let config = await Homepage.findOne().lean();
  if (!config) {
    // Seed initial values
    config = await Homepage.create({
      heroTitle: "Build your startup with Growth Bridge.",
      heroDescription: "A design and engineering partner for founders who value quality, clarity, and momentum. We bridge complex engineering with premium aesthetics.",
      heroBtnText: "Start a project",
      heroBtnUrl: "#contact",
      showSelectedWork: true,
      showProcess: true,
      showTestimonials: true,
    });
    config = config.toObject();
  }
  return serialize(config);
}

export async function saveHomepageConfig(data: any) {
  const user = await getSessionUser();
  if (!user) throw new Error("Unauthorized");

  await connectToDatabase();
  let config = await Homepage.findOne();
  if (config) {
    config = await Homepage.findByIdAndUpdate(config._id, data, { new: true });
  } else {
    config = await Homepage.create(data);
  }
  await logActivity("Updated Homepage CMS configuration details");
  return serialize(config);
}

/* ==========================================
   SITE SETTINGS ACTIONS
   ========================================== */
export async function getSettings() {
  await connectToDatabase();
  let settings = await Setting.findOne().lean();
  if (!settings) {
    // Seed initial values
    settings = await Setting.create({
      contactEmail: "hello@growthbridge.live",
      phoneNumber: "+91 62827 59863",
      officeAddress: "Kadri Temple Road, Kadri, Mangalore, Karnataka, India - 575002",
      socialTwitter: "https://twitter.com/growthbridge",
      socialLinkedin: "https://linkedin.com/company/growthbridge",
      socialGithub: "https://github.com/growthbridge",
      seoDefaultTitle: "Growth Bridge — Creative Digital Agency in Mangalore",
      seoDefaultDescription: "Helping ambitious businesses build, launch and scale digital experiences. Premium websites, AI automation, brand systems, and digital products in Mangalore, India.",
      maintenanceMode: false,
      branches: [
        { name: "India", address: "Mangalore, India", status: "active" },
        { name: "Germany", address: "Munich, Germany", status: "active" },
        { name: "France", address: "Paris, France", status: "active" },
        { name: "Poland", address: "Warsaw, Poland", status: "coming_soon" }
      ]
    });
    settings = settings.toObject();
  }
  return serialize(settings);
}

export async function saveSettings(data: any) {
  const user = await getSessionUser();
  if (!user) throw new Error("Unauthorized");

  await connectToDatabase();
  let settings = await Setting.findOne();
  if (settings) {
    settings = await Setting.findByIdAndUpdate(settings._id, data, { new: true });
  } else {
    settings = await Setting.create(data);
  }
  await logActivity("Updated global Site Settings");
  return serialize(settings);
}
