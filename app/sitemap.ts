import { MetadataRoute } from "next";
import { getBlogs } from "@/lib/actions/cms";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://growthbridge.live";

  // Fetch blogs for dynamic paths
  let blogs: any[] = [];
  try {
    blogs = await getBlogs();
  } catch (error) {
    console.error("Sitemap generation: failed to fetch blogs", error);
  }

  const blogUrls = blogs.map((blog) => ({
    url: `${baseUrl}/blog/${blog.slug}`,
    lastModified: blog.publishDate ? new Date(blog.publishDate) : new Date(),
    changeFrequency: "weekly" as const,
    priority: 0.6,
  }));

  const staticUrls = [
    {
      url: `${baseUrl}`,
      lastModified: new Date(),
      changeFrequency: "daily" as const,
      priority: 1.0,
    },
    {
      url: `${baseUrl}/projects`,
      lastModified: new Date(),
      changeFrequency: "weekly" as const,
      priority: 0.8,
    },
    {
      url: `${baseUrl}/team`,
      lastModified: new Date(),
      changeFrequency: "monthly" as const,
      priority: 0.5,
    },
    {
      url: `${baseUrl}/contact`,
      lastModified: new Date(),
      changeFrequency: "monthly" as const,
      priority: 0.8,
    },
  ];

  return [...staticUrls, ...blogUrls];
}
