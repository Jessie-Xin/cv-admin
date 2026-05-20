import { prisma } from "@/lib/prisma";
import { SettingsView } from "./settings-view";

export const dynamic = "force-dynamic";

export default async function SettingsPage() {
  const setting = await prisma.setting.upsert({
    where: { id: "default" },
    update: {},
    create: { id: "default" },
  });
  return <SettingsView initial={setting} />;
}
