import React from "react";
import ApplicationsClient from "./ApplicationsClient";
import { getApplications, getAllApplicationsForExport } from "@/lib/actions/internship";

interface PageProps {
  searchParams: Promise<{
    status?: string;
    search?: string;
    page?: string;
  }>;
}

export const dynamic = "force-dynamic";

export default async function AdminApplicationsPage({ searchParams }: PageProps) {
  const resolvedSearchParams = await searchParams;
  const status = resolvedSearchParams.status || "All";
  const search = resolvedSearchParams.search || "";
  const page = parseInt(resolvedSearchParams.page || "1", 10);

  // Fetch paginated applications based on filters
  const result = await getApplications({
    status,
    search,
    page,
    limit: 10,
  });

  // Fetch all applications (un-paginated) for CSV export utility
  const allApplications = await getAllApplicationsForExport().catch(() => []);

  return (
    <ApplicationsClient
      initialApplications={result.data}
      pagination={result.pagination}
      allApplicationsForExport={allApplications}
      currentStatus={status}
      currentSearch={search}
    />
  );
}
