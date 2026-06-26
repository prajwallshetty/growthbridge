"use server";

import { cookies } from "next/headers";
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
  const list = await Blog.find().sort({ createdAt: -1 }).lean();
  return serialize(list);
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
   PORTFOLIO (PROJECT) CMS ACTIONS
   ========================================== */
export async function getProjects() {
  await connectToDatabase();
  let list = await Project.find().sort({ createdAt: -1 }).lean();
  
  if (list.length === 0) {
    const defaultProjects = [
      {
        title: "Northstar Commerce",
        category: "E-commerce redesign",
        description: "A premium storefront rebuild with conversion-first design and lifecycle automation worthy of the product.",
        resultMetric: "+320% revenue",
        image: "/project-northstar.png",
        liveUrl: "https://northstar.growthbridge.studio",
        featured: true,
      },
      {
        title: "Atlas Clinics",
        category: "Healthcare platform",
        description: "Local SEO architecture and booking funnels designed to build trust from the first click.",
        resultMetric: "5× more leads",
        image: "/project-atlas.png",
        liveUrl: "https://atlas.growthbridge.studio",
        featured: true,
      },
      {
        title: "Pulse SaaS",
        category: "Product launch",
        description: "Brand positioning, launch site, and onboarding for a product-led growth engine.",
        resultMetric: "3× faster growth",
        image: "/project-pulse.png",
        liveUrl: "https://pulse.growthbridge.studio",
        featured: true,
      },
      {
        title: "Loam & Co.",
        category: "Brand & web",
        description: "Visual identity and lookbook site for a slow-fashion studio's debut collection.",
        resultMetric: "+180% sessions",
        image: "/why-growthbridge.png",
        liveUrl: "https://loam.growthbridge.studio",
        featured: false,
      },
    ];
    await Project.insertMany(defaultProjects);
    list = await Project.find().sort({ createdAt: -1 }).lean();
  }
  
  return serialize(list);
}

export async function saveProject(data: any) {
  const user = await getSessionUser();
  if (!user) throw new Error("Unauthorized");

  await connectToDatabase();
  let project;
  if (data._id) {
    project = await Project.findByIdAndUpdate(data._id, data, { new: true });
    await logActivity(`Updated portfolio project: "${data.title}"`);
  } else {
    project = await Project.create(data);
    await logActivity(`Created new portfolio project: "${data.title}"`);
  }
  return serialize(project);
}

export async function deleteProject(id: string) {
  const user = await getSessionUser();
  if (!user) throw new Error("Unauthorized");

  await connectToDatabase();
  const project = await Project.findById(id);
  if (project) {
    await Project.findByIdAndDelete(id);
    await logActivity(`Deleted portfolio project: "${project.title}"`);
  }
  return { success: true };
}

/* ==========================================
   SERVICES CMS ACTIONS
   ========================================== */
export async function getServices() {
  await connectToDatabase();
  const list = await Service.find().sort({ createdAt: -1 }).lean();
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
      contactEmail: "hello@growthbridge.studio",
      phoneNumber: "+1 (555) 019-2834",
      officeAddress: "100 Pine St, San Francisco, CA",
      socialTwitter: "https://twitter.com/growthbridge",
      socialLinkedin: "https://linkedin.com/company/growthbridge",
      socialGithub: "https://github.com/growthbridge",
      seoDefaultTitle: "Growth Bridge — Creative Digital Agency",
      seoDefaultDescription: "We design and build enduring digital interfaces for startups.",
      maintenanceMode: false,
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
