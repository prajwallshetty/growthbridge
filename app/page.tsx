import HomeClient from "./HomeClient";
import {
  getHomepageConfig,
  getServices,
  getProjects,
  getTestimonials,
  getSettings,
} from "@/lib/actions/cms";

export const dynamic = "force-dynamic";

export default async function Home() {
  const [homepage, services, projects, testimonials, settings] = await Promise.all([
    getHomepageConfig().catch(() => null),
    getServices().catch(() => []),
    getProjects().catch(() => []),
    getTestimonials().catch(() => []),
    getSettings().catch(() => null),
  ]);

  return (
    <HomeClient
      homepage={homepage}
      services={services}
      projects={projects}
      testimonials={testimonials}
      settings={settings}
    />
  );
}