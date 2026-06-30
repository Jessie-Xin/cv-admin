import { prisma } from "@/lib/prisma";

export const SYSTEM_PROMPT = `你是一個簡歷管理系統的 AI 助手，可以幫用戶查詢、錄入、修改和刪除簡歷數據。

數據模型：
1. Profile（個人資料）：name, jobTitle, subtitle, email, phone, city, github, bio
2. Project（項目）：name, description, role, startDate, endDate, status(ACTIVE/DONE), accentColor, tags[]
3. Milestone（時間線）：title, description, occurredAt, projectId(可選)
4. Experience（經歷）：title, organization, description, type(EDUCATION/WORK/CERTIFICATION), startDate, endDate
5. SkillCategory（技能分類）：name, color, order
6. Skill（技能）：name, categoryId, order
7. Setting（設置）：themeMode(LIGHT/DARK), accentColor, defaultExportFormat(PDF/HTML/MARKDOWN), publicShareEnabled
8. ShareToken（分享連結）：label, expiresAt

規則：
- 使用繁體中文回覆
- 日期格式為 YYYY-MM-DD
- 刪除操作前先用文字確認意圖
- 回覆簡潔明瞭，列出操作結果
- 創建技能(Skill)前需先列出技能分類獲取 categoryId`;

type ToolDef = {
  type: "function";
  function: {
    name: string;
    description: string;
    parameters: Record<string, unknown>;
  };
};

function tool(
  name: string,
  description: string,
  parameters: Record<string, unknown>,
): ToolDef {
  return { type: "function", function: { name, description, parameters } };
}

export const aiTools: ToolDef[] = [
  // Profile
  tool("get_profile", "獲取個人資料", { type: "object", properties: {} }),
  tool("update_profile", "更新個人資料", {
    type: "object",
    properties: {
      name: { type: "string" },
      jobTitle: { type: "string" },
      subtitle: { type: "string" },
      email: { type: "string" },
      phone: { type: "string" },
      city: { type: "string" },
      github: { type: "string" },
      bio: { type: "string" },
    },
  }),
  // Projects
  tool("list_projects", "列出所有項目", { type: "object", properties: {} }),
  tool("create_project", "創建新項目", {
    type: "object",
    properties: {
      name: { type: "string", description: "項目名稱" },
      description: { type: "string", description: "項目描述" },
      role: { type: "string", description: "擔任角色" },
      startDate: { type: "string", description: "開始日期 YYYY-MM-DD" },
      endDate: { type: "string", description: "結束日期 YYYY-MM-DD（可選）" },
      status: { type: "string", enum: ["ACTIVE", "DONE"], description: "項目狀態，預設 ACTIVE" },
      accentColor: { type: "string", description: "主題色（十六進制）" },
      tags: { type: "array", items: { type: "string" }, description: "技術標籤" },
    },
    required: ["name", "description", "role", "startDate"],
  }),
  tool("update_project", "更新項目", {
    type: "object",
    properties: {
      id: { type: "string", description: "項目 ID" },
      name: { type: "string" },
      description: { type: "string" },
      role: { type: "string" },
      startDate: { type: "string", description: "YYYY-MM-DD" },
      endDate: { type: "string", description: "YYYY-MM-DD（可選）" },
      status: { type: "string", enum: ["ACTIVE", "DONE"] },
      accentColor: { type: "string" },
      tags: { type: "array", items: { type: "string" } },
    },
    required: ["id"],
  }),
  tool("delete_project", "刪除項目", {
    type: "object",
    properties: { id: { type: "string", description: "項目 ID" } },
    required: ["id"],
  }),
  // Milestones
  tool("list_milestones", "列出所有時間線條目", { type: "object", properties: {} }),
  tool("create_milestone", "創建時間線條目", {
    type: "object",
    properties: {
      title: { type: "string", description: "標題" },
      description: { type: "string", description: "描述" },
      occurredAt: { type: "string", description: "發生日期 YYYY-MM-DD" },
      projectId: { type: "string", description: "關聯項目 ID（可選）" },
    },
    required: ["title", "description", "occurredAt"],
  }),
  // Experiences
  tool("list_experiences", "列出所有經歷", { type: "object", properties: {} }),
  tool("create_experience", "創建經歷", {
    type: "object",
    properties: {
      title: { type: "string", description: "標題" },
      organization: { type: "string", description: "機構名稱" },
      description: { type: "string", description: "描述" },
      type: { type: "string", enum: ["EDUCATION", "WORK", "CERTIFICATION"], description: "經歷類型" },
      startDate: { type: "string", description: "開始日期 YYYY-MM-DD" },
      endDate: { type: "string", description: "結束日期 YYYY-MM-DD（可選）" },
    },
    required: ["title", "organization", "description", "type", "startDate"],
  }),
  tool("update_experience", "更新經歷", {
    type: "object",
    properties: {
      id: { type: "string", description: "經歷 ID" },
      title: { type: "string" },
      organization: { type: "string" },
      description: { type: "string" },
      type: { type: "string", enum: ["EDUCATION", "WORK", "CERTIFICATION"] },
      startDate: { type: "string", description: "YYYY-MM-DD" },
      endDate: { type: "string", description: "YYYY-MM-DD（可選）" },
    },
    required: ["id"],
  }),
  tool("delete_experience", "刪除經歷", {
    type: "object",
    properties: { id: { type: "string", description: "經歷 ID" } },
    required: ["id"],
  }),
  // Skills
  tool("list_skill_categories", "列出所有技能分類及其技能", { type: "object", properties: {} }),
  tool("create_skill_category", "創建技能分類", {
    type: "object",
    properties: {
      name: { type: "string", description: "分類名稱" },
      color: { type: "string", description: "顏色（十六進制，可選）" },
      order: { type: "number", description: "排序（預設 99）" },
    },
    required: ["name"],
  }),
  tool("create_skill", "創建技能", {
    type: "object",
    properties: {
      name: { type: "string", description: "技能名稱" },
      categoryId: { type: "string", description: "所屬分類 ID" },
      order: { type: "number", description: "排序（預設 99）" },
    },
    required: ["name", "categoryId"],
  }),
  tool("delete_skill", "刪除技能", {
    type: "object",
    properties: { id: { type: "string", description: "技能 ID" } },
    required: ["id"],
  }),
  // Settings
  tool("get_settings", "獲取系統設置", { type: "object", properties: {} }),
  tool("update_settings", "更新系統設置", {
    type: "object",
    properties: {
      themeMode: { type: "string", enum: ["LIGHT", "DARK"] },
      accentColor: { type: "string", description: "十六進制顏色" },
      defaultExportFormat: { type: "string", enum: ["PDF", "HTML", "MARKDOWN"] },
      publicShareEnabled: { type: "boolean" },
    },
  }),
  // Share Tokens
  tool("list_share_tokens", "列出所有分享連結", { type: "object", properties: {} }),
  tool("create_share_token", "創建分享連結", {
    type: "object",
    properties: {
      label: { type: "string", description: "標籤（可選）" },
      expiresInHours: { type: "number", description: "過期時間（小時）" },
    },
    required: ["expiresInHours"],
  }),
  tool("delete_share_token", "刪除分享連結", {
    type: "object",
    properties: { id: { type: "string", description: "分享連結 ID" } },
    required: ["id"],
  }),
];

export async function executeTool(
  name: string,
  args: Record<string, unknown>,
): Promise<string> {
  try {
    switch (name) {
      // Profile
      case "get_profile": {
        const profile = await prisma.profile.findFirst({ orderBy: { createdAt: "asc" } });
        return JSON.stringify(profile);
      }
      case "update_profile": {
        const existing = await prisma.profile.findFirst({ orderBy: { createdAt: "asc" } });
        if (!existing) return JSON.stringify({ error: "Profile 不存在" });
        const updated = await prisma.profile.update({
          where: { id: existing.id },
          data: {
            name: args.name as string | undefined,
            jobTitle: args.jobTitle as string | undefined,
            subtitle: (args.subtitle as string) ?? null,
            email: args.email as string | undefined,
            phone: (args.phone as string) ?? null,
            city: (args.city as string) ?? null,
            github: (args.github as string) ?? null,
            bio: (args.bio as string) ?? null,
          },
        });
        return JSON.stringify(updated);
      }
      // Projects
      case "list_projects": {
        const projects = await prisma.project.findMany({ orderBy: { startDate: "desc" } });
        return JSON.stringify(projects);
      }
      case "create_project": {
        const project = await prisma.project.create({
          data: {
            name: args.name as string,
            description: args.description as string,
            role: args.role as string,
            startDate: new Date(args.startDate as string),
            endDate: args.endDate ? new Date(args.endDate as string) : null,
            status: (args.status as "ACTIVE" | "DONE") ?? "ACTIVE",
            accentColor: (args.accentColor as string) ?? null,
            tags: Array.isArray(args.tags) ? (args.tags as string[]) : [],
          },
        });
        return JSON.stringify(project);
      }
      case "update_project": {
        const data: Record<string, unknown> = {};
        if (args.name !== undefined) data.name = args.name;
        if (args.description !== undefined) data.description = args.description;
        if (args.role !== undefined) data.role = args.role;
        if (args.startDate !== undefined) data.startDate = new Date(args.startDate as string);
        if (args.endDate !== undefined) data.endDate = args.endDate ? new Date(args.endDate as string) : null;
        if (args.status !== undefined) data.status = args.status;
        if (args.accentColor !== undefined) data.accentColor = args.accentColor;
        if (args.tags !== undefined) data.tags = Array.isArray(args.tags) ? args.tags : [];
        const updated = await prisma.project.update({ where: { id: args.id as string }, data });
        return JSON.stringify(updated);
      }
      case "delete_project": {
        await prisma.project.delete({ where: { id: args.id as string } });
        return JSON.stringify({ success: true, message: "項目已刪除" });
      }
      // Milestones
      case "list_milestones": {
        const milestones = await prisma.milestone.findMany({ orderBy: { occurredAt: "desc" } });
        return JSON.stringify(milestones);
      }
      case "create_milestone": {
        const milestone = await prisma.milestone.create({
          data: {
            title: args.title as string,
            description: args.description as string,
            occurredAt: new Date(args.occurredAt as string),
            projectId: (args.projectId as string) ?? null,
          },
        });
        return JSON.stringify(milestone);
      }
      // Experiences
      case "list_experiences": {
        const items = await prisma.experience.findMany({ orderBy: { startDate: "desc" } });
        return JSON.stringify(items);
      }
      case "create_experience": {
        const item = await prisma.experience.create({
          data: {
            title: args.title as string,
            organization: args.organization as string,
            description: args.description as string,
            type: args.type as "EDUCATION" | "WORK" | "CERTIFICATION",
            startDate: new Date(args.startDate as string),
            endDate: args.endDate ? new Date(args.endDate as string) : null,
          },
        });
        return JSON.stringify(item);
      }
      case "update_experience": {
        const data: Record<string, unknown> = {};
        if (args.title !== undefined) data.title = args.title;
        if (args.organization !== undefined) data.organization = args.organization;
        if (args.description !== undefined) data.description = args.description;
        if (args.type !== undefined) data.type = args.type;
        if (args.startDate !== undefined) data.startDate = new Date(args.startDate as string);
        if (args.endDate !== undefined) data.endDate = args.endDate ? new Date(args.endDate as string) : null;
        const updated = await prisma.experience.update({ where: { id: args.id as string }, data });
        return JSON.stringify(updated);
      }
      case "delete_experience": {
        await prisma.experience.delete({ where: { id: args.id as string } });
        return JSON.stringify({ success: true, message: "經歷已刪除" });
      }
      // Skills
      case "list_skill_categories": {
        const categories = await prisma.skillCategory.findMany({
          orderBy: { order: "asc" },
          include: { skills: { orderBy: { order: "asc" } } },
        });
        return JSON.stringify(categories);
      }
      case "create_skill_category": {
        const created = await prisma.skillCategory.create({
          data: {
            name: args.name as string,
            color: (args.color as string) ?? null,
            order: (args.order as number) ?? 99,
          },
        });
        return JSON.stringify(created);
      }
      case "create_skill": {
        const created = await prisma.skill.create({
          data: {
            name: args.name as string,
            categoryId: args.categoryId as string,
            order: (args.order as number) ?? 99,
          },
        });
        return JSON.stringify(created);
      }
      case "delete_skill": {
        await prisma.skill.delete({ where: { id: args.id as string } });
        return JSON.stringify({ success: true, message: "技能已刪除" });
      }
      // Settings
      case "get_settings": {
        const setting = await prisma.setting.upsert({
          where: { id: "default" },
          update: {},
          create: { id: "default" },
        });
        return JSON.stringify(setting);
      }
      case "update_settings": {
        const data: Record<string, unknown> = {};
        if (args.themeMode !== undefined) data.themeMode = args.themeMode;
        if (args.accentColor !== undefined) data.accentColor = args.accentColor;
        if (args.defaultExportFormat !== undefined) data.defaultExportFormat = args.defaultExportFormat;
        if (args.publicShareEnabled !== undefined) data.publicShareEnabled = args.publicShareEnabled;
        const updated = await prisma.setting.update({ where: { id: "default" }, data });
        return JSON.stringify(updated);
      }
      // Share Tokens
      case "list_share_tokens": {
        const tokens = await prisma.shareToken.findMany({ orderBy: { createdAt: "desc" } });
        return JSON.stringify(tokens);
      }
      case "create_share_token": {
        const hours = args.expiresInHours as number;
        const expiresAt = new Date(Date.now() + hours * 60 * 60 * 1000);
        const record = await prisma.shareToken.create({
          data: { label: (args.label as string) ?? null, expiresAt },
        });
        return JSON.stringify(record);
      }
      case "delete_share_token": {
        await prisma.shareToken.delete({ where: { id: args.id as string } });
        return JSON.stringify({ success: true, message: "分享連結已刪除" });
      }
      default:
        return JSON.stringify({ error: `未知工具: ${name}` });
    }
  } catch (err) {
    return JSON.stringify({ error: (err as Error).message });
  }
}
