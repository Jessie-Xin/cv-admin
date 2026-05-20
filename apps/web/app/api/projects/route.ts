import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
  const projects = await prisma.project.findMany({
    orderBy: { startDate: "desc" },
  });
  return NextResponse.json(projects);
}

export async function POST(req: Request) {
  const body = await req.json();
  const project = await prisma.project.create({
    data: {
      name: body.name,
      description: body.description,
      role: body.role,
      startDate: new Date(body.startDate),
      endDate: body.endDate ? new Date(body.endDate) : null,
      status: body.status ?? "ACTIVE",
      accentColor: body.accentColor ?? null,
      tags: Array.isArray(body.tags) ? body.tags : [],
    },
  });
  return NextResponse.json(project, { status: 201 });
}
