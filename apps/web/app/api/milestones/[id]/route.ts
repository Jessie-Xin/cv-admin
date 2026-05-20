import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

type Ctx = { params: Promise<{ id: string }> };

export async function PUT(req: Request, { params }: Ctx) {
  const { id } = await params;
  const body = await req.json();
  const updated = await prisma.milestone.update({
    where: { id },
    data: {
      title: body.title,
      description: body.description,
      occurredAt: new Date(body.occurredAt),
      projectId: body.projectId ?? null,
    },
  });
  return NextResponse.json(updated);
}

export async function DELETE(_req: Request, { params }: Ctx) {
  const { id } = await params;
  await prisma.milestone.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
