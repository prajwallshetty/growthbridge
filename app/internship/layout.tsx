import React from "react";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { Inter } from "next/font/google";
import "../globals.css";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
});

export const metadata = {
  title: "GrowthBridge Internships — Build, Launch, Scale",
  description: "Join the GrowthBridge remote internship program. Work on industry capstone projects in Full Stack Development, React Native, Machine Learning, and Data Science.",
};

export default function InternshipLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={inter.variable}>
      <body className={`${inter.className} antialiased min-h-screen bg-[#FCFBF8] text-[#111111] flex flex-col font-sans selection:bg-[#F4C542] selection:text-[#111111]`}>
        {/* Editorial Navigation Header */}
        <header className="sticky top-0 z-50 bg-[#FCFBF8]/80 backdrop-blur-md border-b border-[#E9E3DA] transition-all duration-300">
          <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Link href="/" className="font-extrabold text-[16px] tracking-tight hover:opacity-80 transition-opacity">
                GROWTH BRIDGE
              </Link>
              <div className="w-px h-4 bg-[#E9E3DA]" />
              <Link href="/internship" className="font-mono text-[10.5px] font-bold tracking-[0.15em] bg-[#111111] text-white px-2 py-0.5 rounded">
                INTERNSHIPS
              </Link>
            </div>

            <nav className="hidden md:flex items-center gap-8">
              <Link href="/internship#about" className="text-[13px] font-semibold text-[#6A6A6A] hover:text-[#111111] transition-colors">
                About
              </Link>
              <Link href="/internship#domains" className="text-[13px] font-semibold text-[#6A6A6A] hover:text-[#111111] transition-colors">
                Domains
              </Link>
              <Link href="/internship#faq" className="text-[13px] font-semibold text-[#6A6A6A] hover:text-[#111111] transition-colors">
                FAQ
              </Link>
            </nav>

            <div className="flex items-center gap-1.5 md:gap-4">
              <Link
                href="/internship/apply"
                className="px-2.5 py-1.5 md:px-5 md:py-2.5 rounded-lg md:rounded-xl bg-[#111111] text-white text-[10px] md:text-[12.5px] font-bold tracking-tight hover:bg-[#F4C542] hover:text-[#111111] transition-all duration-250 flex items-center gap-1 md:gap-1.5 shadow-sm shrink-0"
              >
                <span>Apply<span className="hidden sm:inline"> Now</span></span>
                <ArrowUpRight size={10} className="shrink-0" />
              </Link>
            </div>
          </div>
        </header>

        {/* Main Content Area */}
        <main className="flex-1 w-full flex flex-col">
          {children}
        </main>

        {/* Editorial Footer */}
        <footer className="border-t border-[#E9E3DA] bg-white py-16 px-6">
          <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-12 md:gap-8">
            <div className="flex flex-col gap-4">
              <span className="font-extrabold text-[15px] tracking-tight">GROWTH BRIDGE</span>
              <p className="text-[13px] text-[#6A6A6A] leading-relaxed max-w-xs font-medium">
                We help ambitious developers build, launch, and scale real-world applications under high-caliber supervision.
              </p>
            </div>

            <div className="flex flex-col gap-3">
              <span className="font-bold text-[12px] tracking-wider uppercase text-[#A8A296] font-mono">— Programs</span>
              <nav className="flex flex-col gap-2">
                <Link href="/internship/apply" className="text-[13px] text-[#6A6A6A] hover:text-[#111111] font-semibold transition-colors">
                  Apply for Internship
                </Link>
                <Link href="/internship#domains" className="text-[13px] text-[#6A6A6A] hover:text-[#111111] font-semibold transition-colors">
                  Available Domains
                </Link>
              </nav>
            </div>

            <div className="flex flex-col gap-3">
              <span className="font-bold text-[12px] tracking-wider uppercase text-[#A8A296] font-mono">— Contact</span>
              <div className="flex flex-col gap-1 text-[13px] text-[#6A6A6A] font-semibold">
                <span>Email: <a href="mailto:contact@growthbridge.live" className="text-[#111111] hover:underline">contact@growthbridge.live</a></span>
                <span>Website: <Link href="/" className="text-[#111111] hover:underline">growthbridge.live</Link></span>
              </div>
            </div>
          </div>

          <div className="max-w-7xl mx-auto mt-12 pt-8 border-t border-[#E9E3DA]/60 flex flex-col md:flex-row items-center justify-between gap-4 text-[12px] text-[#A8A296] font-medium">
            <span>&copy; {new Date().getFullYear()} GrowthBridge Studio. All rights reserved.</span>
            <div className="flex gap-6">
              <Link href="/internship/verify/test" className="hover:text-[#111111]">Verify Certificate</Link>
              <Link href="/admin/internships" className="hover:text-[#111111]">Admin Console</Link>
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}
