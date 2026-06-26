import ContactClient from "./ContactClient";
import { getSettings } from "@/lib/actions/cms";

export const dynamic = "force-dynamic";

export default async function ContactPage() {
  const settings = await getSettings().catch(() => null);
  return <ContactClient settings={settings} />;
}
