import { prisma } from "@/lib/prisma";
import { DashboardView } from "./dashboard-view";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const [projectCount, milestoneCount, skillCount, categoryCount, projects] =
    await Promise.all([
      prisma.project.count(),
      prisma.milestone.count(),
      prisma.skill.count(),
      prisma.skillCategory.count(),
      prisma.project.findMany({ orderBy: { startDate: "desc" } }),
    ]);

  const milestoneYears = await prisma.milestone.findMany({
    select: { occurredAt: true },
    orderBy: { occurredAt: "asc" },
  });
  const years = milestoneYears.map((m) => m.occurredAt.getFullYear());
  const yearRange =
    years.length > 0 ? `覆盖 ${years[0]} — ${years[years.length - 1]}` : "—";

  return (
    <DashboardView
      projects={projects}
      stats={{ projectCount, milestoneCount, skillCount, categoryCount }}
      yearRange={yearRange}
    />
  );
}
