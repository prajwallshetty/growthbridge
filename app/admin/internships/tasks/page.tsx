import React from "react";
import TasksClient from "./TasksClient";
import { getDomains } from "@/lib/actions/internship";

export const dynamic = "force-dynamic";

export default async function AdminTasksPage() {
  // Fetch available domains to let the admin select which domain's tasks they want to manage
  const domains = await getDomains().catch(() => []);

  return <TasksClient domains={domains} />;
}
