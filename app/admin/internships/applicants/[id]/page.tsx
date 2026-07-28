import React from "react";
import { notFound } from "next/navigation";
import { getApplicationById } from "@/lib/actions/internship";
import ApplicantDetailsClient from "./ApplicantDetailsClient";

interface PageProps {
  params: Promise<{ id: string }>;
}

export const dynamic = "force-dynamic";

export default async function AdminApplicantDetailPage({ params }: PageProps) {
  const { id } = await params;
  
  // Fetch detailed application record populated with related submissions, certificate, and offer letter
  const applicant = await getApplicationById(id);

  if (!applicant) {
    notFound();
  }

  return <ApplicantDetailsClient applicant={applicant} />;
}
