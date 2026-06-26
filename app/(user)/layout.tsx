import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "../globals.css";
import { getSettings } from "@/lib/actions/cms";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "Growth Bridge — Creative Digital Agency",
  description:
    "Helping ambitious businesses build, launch and scale digital experiences. Premium websites, AI automation, brand systems, and digital products.",
  keywords: ["creative agency", "web development", "brand strategy", "UI/UX design", "AI automation", "growth marketing"],
  openGraph: {
    title: "Growth Bridge — Creative Digital Agency",
    description: "Helping ambitious businesses build, launch and scale digital experiences.",
    type: "website",
  },
};

export default async function UserRootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const settings = await getSettings().catch(() => null);

  return (
    <html lang="en" className={inter.variable}>
      <body className={`${inter.className} antialiased min-h-screen bg-[#FCFBF8] text-[#111111]`}>
        {settings?.maintenanceMode ? (
          <div className="min-h-screen flex flex-col lg:flex-row items-center justify-center p-6 md:p-12 relative overflow-hidden gap-12 lg:gap-16 w-full">
            {/* background design rays */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_rgba(244,197,66,0.06)_0%,_transparent_60%)] pointer-events-none" />
            
            {/* Left Text Block */}
            <div className="max-w-[480px] w-full relative z-20 flex flex-col items-center lg:items-start text-center lg:text-left shrink-0">
              {/* Glowing indicator */}
              <div className="flex items-center gap-2 mb-6">
                <span className="relative flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#F4C542] opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-[#F4C542]"></span>
                </span>
                <span className="text-[12px] font-extrabold uppercase tracking-[0.15em] text-[#6A6A6A]">Growth Bridge Maintenance</span>
              </div>

              <h1 className="text-[clamp(32px,5vw,48px)] font-extrabold tracking-tight leading-[1.1]">
                Refining our
                <br />
                digital spaces.
              </h1>
              
              <p className="mt-5 text-[15px] leading-[1.65] text-[#6A6A6A] font-medium">
                We are performing scheduled updates and tuning our infrastructure. We'll be back online shortly. For urgent inquiries, reach out directly.
              </p>

              <div className="mt-8 pt-6 border-t border-[#E9E3DA] w-full flex flex-col gap-1.5 text-[13px] font-semibold text-[#6A6A6A]">
                <span>Email: <a href={`mailto:${settings?.contactEmail || "hello@growthbridge.studio"}`} className="text-[#111111] hover:underline font-bold">{settings?.contactEmail || "hello@growthbridge.studio"}</a></span>
                <span>Phone: <span className="text-[#111111] font-bold">{settings?.phoneNumber || "+1 (555) 019-2834"}</span></span>
              </div>
            </div>

            {/* Right Image Block */}
            <div className="max-w-[500px] w-full relative z-20 flex justify-center float-gentle shrink-0">
              <div className="relative w-full aspect-square rounded-[36px] bg-[#FCFBF8] border border-[#E9E3DA] p-6 shadow-[0_15px_45px_rgba(0,0,0,0.03)] flex items-center justify-center overflow-hidden">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="/maintenance.png"
                  alt="Growth Bridge System Maintenance"
                  className="w-full h-full object-contain rounded-[20px]"
                />
              </div>
            </div>
          </div>
        ) : (
          children
        )}
      </body>
    </html>
  );
}
