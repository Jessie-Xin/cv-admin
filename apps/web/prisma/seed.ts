import { PrismaClient } from "../src/generated/prisma/index.js";
import bcrypt from "bcryptjs";

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

  await prisma.skillCategory.deleteMany();
  await prisma.skillCategory.create({
    data: {
      name: "前端开发",
      color: "#3D8A5A",
      order: 1,
      skills: {
        create: [
          { name: "React", order: 1 },
          { name: "Vue 3", order: 2 },
          { name: "TypeScript", order: 3 },
          { name: "Next.js", order: 4 },
          { name: "CSS", order: 5 },
          { name: "Tailwind", order: 6 },
        ],
      },
    },
  });
  await prisma.skillCategory.create({
    data: {
      name: "后端开发",
      color: "#D58A6A",
      order: 2,
      skills: {
        create: [
          { name: "Node.js", order: 1 },
          { name: "Python", order: 2 },
          { name: "Go", order: 3 },
          { name: "PostgreSQL", order: 4 },
        ],
      },
    },
  });
  await prisma.skillCategory.create({
    data: {
      name: "设计与运维",
      color: "#4F8AAB",
      order: 3,
      skills: {
        create: [
          { name: "Figma", order: 1 },
          { name: "UI/UX", order: 2 },
          { name: "Docker", order: 3 },
          { name: "K8s", order: 4 },
          { name: "AWS", order: 5 },
        ],
      },
    },
  });

  await prisma.project.deleteMany();
  await prisma.project.createMany({
    data: [
      {
        name: "AI 设计助手",
        description: "基于大语言模型的智能UI设计生成与前端代码转换工具",
        role: "技术负责人",
        startDate: new Date("2024-03-01"),
        endDate: null,
        status: "ACTIVE",
        accentColor: "#3D8A5A",
        tags: ["Python", "LLM", "React"],
      },
      {
        name: "在线教育直播系统",
        description: "支持万人同时在线的互动直播课堂与学习管理系统",
        role: "高级工程师",
        startDate: new Date("2022-06-01"),
        endDate: new Date("2024-02-01"),
        status: "DONE",
        accentColor: "#D58A6A",
        tags: ["Vue 3", "Node.js"],
      },
      {
        name: "智慧城市数据平台",
        description: "城市级IoT数据采集与可视化分析平台，接入200+设备节点",
        role: "全栈工程师",
        startDate: new Date("2020-09-01"),
        endDate: new Date("2022-05-01"),
        status: "DONE",
        accentColor: "#4F8AAB",
        tags: ["Go", "React", "K8s"],
      },
      {
        name: "电商平台重构",
        description: "面向亿级流量的电商平台前端架构重构",
        role: "前端工程师",
        startDate: new Date("2018-07-01"),
        endDate: new Date("2020-08-01"),
        status: "DONE",
        accentColor: "#D5A24A",
        tags: ["React", "Webpack"],
      },
    ],
  });

  await prisma.milestone.deleteMany();
  await prisma.milestone.createMany({
    data: [
      {
        title: "AI 设计助手立项",
        description: "组建6人团队，确定产品方向与技术架构方案",
        occurredAt: new Date("2024-03-01"),
      },
      {
        title: "产品公测上线",
        description: "完成核心功能开发，开放公测注册，首月获5000+用户",
        occurredAt: new Date("2024-06-01"),
      },
      {
        title: "直播系统上线",
        description: "完成万人并发直播功能，系统可用性达99.95%",
        occurredAt: new Date("2022-06-01"),
      },
      {
        title: "智慧城市平台交付",
        description: "完成数据可视化大屏与监控模块开发，日处理数据500万+",
        occurredAt: new Date("2020-09-01"),
      },
    ],
  });

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
