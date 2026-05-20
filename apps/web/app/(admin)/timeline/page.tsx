import { prisma } from "@/lib/prisma";
import { TimelineView } from "./timeline-view";

export const dynamic = "force-dynamic";

export default async function TimelinePage() {
  const milestones = await prisma.milestone.findMany({
    orderBy: { occurredAt: "desc" },
  });
  return <TimelineView initialItems={milestones} />;
}
