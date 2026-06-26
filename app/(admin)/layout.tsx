import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "../globals.css";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "Growth Bridge Studio — Admin Control Panel",
  description: "Secure administrator dashboard for configuring Growth Bridge Studio.",
};

export default function AdminRootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={inter.variable}>
      <body className={`${inter.className} antialiased bg-[#FCFBF8]`}>
        {children}
      </body>
    </html>
  );
}
