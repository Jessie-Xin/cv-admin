import { prisma } from "@/lib/prisma";
import { ProjectsView } from "./projects-view";

export const dynamic = "force-dynamic";

export default async function ProjectsPage() {
  const projects = await prisma.project.findMany({
    orderBy: { startDate: "desc" },
  });
  return <ProjectsView initialProjects={projects} />;
}
