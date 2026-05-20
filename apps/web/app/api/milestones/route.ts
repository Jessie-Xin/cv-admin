import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
  const milestones = await prisma.milestone.findMany({
    orderBy: { occurredAt: "desc" },
  });
  return NextResponse.json(milestones);
}

export async function POST(req: Request) {
  const body = await req.json();
  const milestone = await prisma.milestone.create({
    data: {
      title: body.title,
      description: body.description,
      occurredAt: new Date(body.occurredAt),
      projectId: body.projectId ?? null,
    },
  });
  return NextResponse.json(milestone, { status: 201 });
}
