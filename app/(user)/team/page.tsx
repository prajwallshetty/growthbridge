import TeamClient from "./TeamClient";
import { getTeamMembers, getSettings } from "@/lib/actions/cms";

export const dynamic = "force-dynamic";

export default async function TeamPage() {
  const [team, settings] = await Promise.all([
    getTeamMembers().catch(() => []),
    getSettings().catch(() => null),
  ]);

  return <TeamClient team={team} settings={settings} />;
}
