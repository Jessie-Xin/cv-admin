import { PrismaClient } from "../src/generated/prisma/index.js";
import bcrypt from "bcryptjs";
import {
  milestones,
  projects,
  skillCategories,
} from "./portfolio-seed-data";
import type { ProjectStatus } from "../src/generated/prisma/index.js";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 开始 seed...");

  const passwordHash = await bcrypt.hash("admin123", 10);
  await prisma.adminUser.upsert({
    where: { email: "admin@cv.local" },
    update: { passwordHash },
    create: {
      email: "admin@cv.local",
      passwordHash,
      name: "陈思远",
    },
  });

  await prisma.profile.upsert({
    where: { id: "default" },
    update: {},
    create: {
      id: "default",
      name: "陈思远",
      jobTitle: "全栈工程师",
      subtitle: "全栈工程师 · 产品设计师",
      email: "siyuan@example.com",
      phone: "+86 138-0000-8888",
      city: "上海",
      github: "github.com/siyuanchen",
      bio: "8年全栈开发与产品设计经验，专注于构建高性能Web应用与创新交互体验。曾主导多个千万级用户产品的技术架构与设计。",
    },
  });

  await prisma.setting.upsert({
    where: { id: "default" },
    update: {},
    create: { id: "default" },
  });

  await prisma.milestone.deleteMany();
  await prisma.project.deleteMany();
  await prisma.skill.deleteMany();
  await prisma.skillCategory.deleteMany();

  for (const project of projects) {
    await prisma.project.create({
      data: {
        ...project,
        status: project.status as ProjectStatus,
        startDate: new Date(project.startDate),
        endDate: project.endDate ? new Date(project.endDate) : null,
      },
    });
  }

  for (const milestone of milestones) {
    await prisma.milestone.create({
      data: {
        ...milestone,
        occurredAt: new Date(milestone.occurredAt),
      },
    });
  }

  for (const [categoryIndex, category] of skillCategories.entries()) {
    await prisma.skillCategory.create({
      data: {
        id: category.id,
        name: category.name,
        color: category.color,
        order: categoryIndex,
        skills: {
          create: category.skills.map((skill, skillIndex) => ({
            name: skill,
            order: skillIndex,
          })),
        },
      },
    });
  }

  await prisma.experience.deleteMany();
  await prisma.experience.createMany({
    data: [
      {
        title: "浙江大学 · 计算机科学与技术",
        organization: "浙江大学",
        description:
          "硕士研究生，研究方向为计算机视觉与人机交互。发表SCI论文2篇，获国家奖学金。",
        type: "EDUCATION",
        startDate: new Date("2015-09-01"),
        endDate: new Date("2018-06-01"),
      },
      {
        title: "字节跳动 · 高级前端工程师",
        organization: "字节跳动",
        description:
          "负责抖音创作者平台前端架构设计，带领5人团队完成从jQuery到React的技术迁移。",
        type: "WORK",
        startDate: new Date("2020-03-01"),
        endDate: new Date("2022-05-01"),
      },
      {
        title: "AWS Solutions Architect · 专业级认证",
        organization: "Amazon Web Services",
        description:
          "Amazon Web Services 云架构专业级认证，涵盖高可用架构设计与成本优化策略。",
        type: "CERTIFICATION",
        startDate: new Date("2023-11-01"),
        endDate: null,
      },
      {
        title: "武汉大学 · 软件工程学士",
        organization: "武汉大学",
        description:
          "本科阶段主修软件工程，辅修数字媒体设计。GPA 3.8/4.0，连续3年获得校级奖学金。",
        type: "EDUCATION",
        startDate: new Date("2011-09-01"),
        endDate: new Date("2015-06-01"),
      },
    ],
  });

  console.log("✅ Seed 完成");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
