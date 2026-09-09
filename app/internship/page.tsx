import React from "react";
import InternshipClient from "./InternshipClient";
import { getDomains } from "@/lib/actions/internship";

export const dynamic = "force-dynamic";

export default async function InternshipLandingPage() {
  // Fetch active domains from the database to render them dynamically on the landing page
  const dbDomains = await getDomains().catch(() => []);

  // Default domains to seed or fallback to if the DB is empty
  const defaultDomains = [
    {
      _id: "65f1a3b8c4d2e10a0a000001",
      name: "Full Stack Web Development",
      description: "Build robust, high-performance web applications using React, Next.js, Node.js, and MongoDB. Learn advanced server action patterns, performance tuning, and database modeling.",
      duration: "3 Weeks",
      isActive: true,
    },
  ];

  // If there are no domains in the database yet, we will display the default ones.
  const domains = dbDomains && dbDomains.length > 0 ? dbDomains : defaultDomains;

  return <InternshipClient domains={domains} />;
}
