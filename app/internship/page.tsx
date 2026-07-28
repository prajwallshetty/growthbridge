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
      _id: "default-fs",
      name: "Full Stack Web Development",
      description: "Build robust, high-performance web applications using React, Next.js, Node.js, and MongoDB. Learn advanced server action patterns, performance tuning, and database modeling.",
      duration: "3 Weeks",
      isActive: true,
    },
    {
      _id: "default-rn",
      name: "React Native Mobile App Development",
      description: "Design and build cross-platform mobile apps for iOS and Android. Master screen routing, native device sensors integration, state management, and push notifications.",
      duration: "3 Weeks",
      isActive: true,
    },
    {
      _id: "default-ml",
      name: "Machine Learning Engineering",
      description: "Develop, train, and deploy predictive models. Work with TensorFlow, PyTorch, and Scikit-Learn to build NLP engines, recommenders, and automated workflows.",
      duration: "3 Weeks",
      isActive: true,
    },
    {
      _id: "default-ds",
      name: "Data Science & Analytics",
      description: "Uncover insights from complex datasets. Master data cleaning, exploratory data analysis, visual storytelling, and statistical analysis using Python, Pandas, and SQL.",
      duration: "3 Weeks",
      isActive: true,
    },
  ];

  // If there are no domains in the database yet, we will display the default ones.
  const domains = dbDomains && dbDomains.length > 0 ? dbDomains : defaultDomains;

  return <InternshipClient domains={domains} />;
}
