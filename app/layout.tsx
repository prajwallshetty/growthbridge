import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

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

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={inter.variable}>
      <body className={`${inter.className} antialiased`}>
        {children}
      </body>
    </html>
  );
}
