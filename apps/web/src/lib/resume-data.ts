import { prisma } from "@/lib/prisma";
import type {
  Profile,
  Project,
  Milestone,
  Experience,
  SkillCategory,
  Skill,
} from "@/lib/prisma";

type CategoryWithSkills = SkillCategory & { skills: Skill[] };

export type ResumeData = {
  profile: Profile;
  projects: Project[];
  milestones: Milestone[];
  experiences: Experience[];
  categories: CategoryWithSkills[];
  accentColor: string;
};

export type ResumePayload = {
  data: ResumeData;
  publicShareEnabled: boolean;
};

const DEFAULT_ACCENT = "#3D8A5A";

export async function getResumePayload(): Promise<ResumePayload | null> {
  const [profile, projects, milestones, experiences, categories, setting] =
    await Promise.all([
      prisma.profile.findFirst({ orderBy: { createdAt: "asc" } }),
      prisma.project.findMany({ orderBy: { startDate: "desc" } }),
      prisma.milestone.findMany({ orderBy: { occurredAt: "desc" } }),
      prisma.experience.findMany({ orderBy: { startDate: "desc" } }),
      prisma.skillCategory.findMany({
        orderBy: { order: "asc" },
        include: { skills: { orderBy: { order: "asc" } } },
      }),
      prisma.setting.findUnique({ where: { id: "default" } }),
    ]);

  if (!profile) return null;

  return {
    data: {
      profile,
      projects,
      milestones,
      experiences,
      categories,
      accentColor: setting?.accentColor ?? DEFAULT_ACCENT,
    },
    publicShareEnabled: setting?.publicShareEnabled ?? false,
  };
}
