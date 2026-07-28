import React from "react";
import DomainsClient from "./DomainsClient";
import { getDomains } from "@/lib/actions/internship";

export const dynamic = "force-dynamic";

export default async function AdminDomainsPage() {
  const domains = await getDomains().catch(() => []);

  return <DomainsClient initialDomains={domains} />;
}
