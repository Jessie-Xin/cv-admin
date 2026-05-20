import { prisma } from "@/lib/prisma";
import { SkillsView } from "./skills-view";

export const dynamic = "force-dynamic";

export default async function SkillsPage() {
  const categories = await prisma.skillCategory.findMany({
    orderBy: { order: "asc" },
    include: { skills: { orderBy: { order: "asc" } } },
  });
  return <SkillsView initialCategories={categories} />;
}
