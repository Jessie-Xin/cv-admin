import { prisma } from "@/lib/prisma";
import { ExperienceView } from "./experience-view";

export const dynamic = "force-dynamic";

export default async function ExperiencePage() {
  const items = await prisma.experience.findMany({
    orderBy: { startDate: "desc" },
  });
  return <ExperienceView initialItems={items} />;
}
