import ProjectsClient from "./ProjectsClient";
import { getProjects, getSettings } from "@/lib/actions/cms";

export const dynamic = "force-dynamic";

export default async function ProjectsPage() {
  const [projects, settings] = await Promise.all([
    getProjects().catch(() => []),
    getSettings().catch(() => null),
  ]);

  return <ProjectsClient projects={projects} settings={settings} />;
}
