import FounderClient from "./FounderClient";
import { getSettings } from "@/lib/actions/cms";

export const dynamic = "force-dynamic";

export default async function FounderPage() {
  const settings = await getSettings().catch(() => null);
  return <FounderClient settings={settings} />;
}
