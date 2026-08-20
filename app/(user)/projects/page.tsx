import ProjectsClient from "./ProjectsClient";
import { getProjects, getSettings, getTeamMembers } from "@/lib/actions/cms";

export const dynamic = "force-dynamic";

export default async function ProjectsPage() {
  const [projects, settings, teamMembers] = await Promise.all([
    getProjects().catch(() => []),
    getSettings().catch(() => null),
    getTeamMembers().catch(() => []),
  ]);

  return <ProjectsClient projects={projects} settings={settings} teamMembers={teamMembers} />;
}
