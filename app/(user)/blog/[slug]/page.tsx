import React from "react";
import { notFound } from "next/navigation";
import { ArrowLeft, Calendar, Clock, User, BookOpen } from "lucide-react";
import SideRays from "@/components/ui/SideRays";
import { getBlogBySlug } from "@/lib/actions/cms";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps) {
  const { slug } = await params;
  const blog = await getBlogBySlug(slug).catch(() => null);

  if (!blog) {
    return {
      title: "Article Not Found | Growth Bridge",
      description: "The requested blog article was not found.",
    };
  }

  const desc = blog.seoDescription || blog.subtitle || "Field notes and engineering insights from the Growth Bridge team.";
  const title = `${blog.seoTitle || blog.title} | Growth Bridge`;
  const imageUrl = blog.image || "/opengraph-image.png";

  return {
    title,
    description: desc,
    openGraph: {
      title,
      description: desc,
      type: "article",
      images: [
        {
          url: imageUrl,
          width: 1200,
          height: 630,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description: desc,
      images: [imageUrl],
    },
  };
}

export default async function BlogArticlePage({ params }: PageProps) {
  const { slug } = await params;
  const blog = await getBlogBySlug(slug).catch(() => null);

  if (!blog) {
    notFound();
  }

  // Format date nicely
  const formattedDate = blog.publishDate
    ? new Date(blog.publishDate).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : "";

  return (
    <main className="min-h-screen bg-[#FCFBF8] text-[#111111] relative overflow-hidden pb-32">
      {/* SideRays background effects */}
      <div className="pointer-events-none fixed inset-0 z-10 opacity-[0.35]">
        <SideRays
          speed={0.8}
          rayColor1="#111111"
          rayColor2="#E9E3DA"
          intensity={1.0}
          spread={1.5}
          origin="top-right"
          tilt={0}
          saturation={0.5}
          blend={0.5}
          falloff={1.4}
          opacity={0.3}
        />
        <SideRays
          speed={0.6}
          rayColor1="#E9E3DA"
          rayColor2="#111111"
          intensity={0.8}
          spread={1.2}
          origin="top-left"
          tilt={10}
          saturation={0.5}
          blend={0.5}
          falloff={1.4}
          opacity={0.2}
        />
      </div>

      {/* Top Header Navbar */}
      <header className="fixed top-0 inset-x-0 z-40 bg-[#FCFBF8]/80 border-b border-[#E9E3DA] backdrop-blur-md">
        <div className="mx-auto max-w-[1280px] px-6 md:px-12 py-4 flex items-center justify-between">
          <a href="/" className="flex items-center gap-2">
            <span className="text-[17px] font-bold tracking-tight text-[#111111]">Growth Bridge</span>
          </a>

          <a
            href="/"
            className="inline-flex items-center gap-2 rounded-full border border-[#E9E3DA] bg-white px-5 py-2 text-[13px] font-bold text-[#111111] hover:border-[#111111] transition-all"
          >
            <ArrowLeft size={14} /> Back to Home
          </a>
        </div>
      </header>

      {/* Main Content Area */}
      <article className="pt-32 relative z-20 max-w-[840px] mx-auto px-6">
        {/* Article Metadata Banners */}
        <div className="flex flex-wrap items-center gap-2.5 mb-6">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-extrabold uppercase tracking-[0.06em] text-[#111111] bg-[#F4C542] border border-[#111111]/10">
            <BookOpen size={12} />
            Insights
          </span>
          {(blog.tags || []).map((tag: string) => (
            <span
              key={tag}
              className="px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-[0.06em] text-[#6A6A6A] bg-[#E9E3DA]/30 border border-[#E9E3DA]"
            >
              {tag}
            </span>
          ))}
        </div>

        {/* Title & Subtitle */}
        <h1 className="text-[clamp(32px,5vw,52px)] font-extrabold leading-[1.1] tracking-[-0.03em] text-[#111111]">
          {blog.title}
        </h1>

        {blog.subtitle && (
          <p className="mt-4 text-[18px] md:text-[20px] leading-[1.6] text-[#6A6A6A] font-medium max-w-[760px]">
            {blog.subtitle}
          </p>
        )}

        {/* Author / Read Info Section */}
        <div className="flex flex-wrap items-center gap-6 mt-8 pb-8 border-b border-[#E9E3DA] text-[13px] text-[#6A6A6A] font-semibold">
          <div className="flex items-center gap-2">
            <div className="h-7 w-7 rounded-full bg-[#111111]/5 flex items-center justify-center border border-[#E9E3DA]">
              <User size={13} className="text-[#111111]" />
            </div>
            <span>By {blog.author || "Prajwal Shetty"}</span>
          </div>

          {formattedDate && (
            <div className="flex items-center gap-1.5">
              <Calendar size={14} className="text-[#A8A296]" />
              <span>{formattedDate}</span>
            </div>
          )}

          <div className="flex items-center gap-1.5">
            <Clock size={14} className="text-[#A8A296]" />
            <span>{blog.readTime || 3} min read</span>
          </div>
        </div>

        {/* Main Cover Image */}
        {blog.image && (
          <div className="mt-10 overflow-hidden rounded-[24px] border border-[#E9E3DA] aspect-[16/9] relative bg-[#E9E3DA]/20">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={blog.image}
              alt={blog.title}
              className="w-full h-full object-cover"
            />
          </div>
        )}

        {/* Body Copy Area */}
        <div className="mt-12 text-[#111111] text-[16px] md:text-[17px] leading-[1.8] font-normal tracking-wide whitespace-pre-line max-w-[760px] mx-auto">
          {blog.content}
        </div>
      </article>
    </main>
  );
}
