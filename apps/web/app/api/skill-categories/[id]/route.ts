import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

type Ctx = { params: Promise<{ id: string }> };

export async function PUT(req: Request, { params }: Ctx) {
  const { id } = await params;
  const body = await req.json();
  const updated = await prisma.skillCategory.update({
    where: { id },
    data: {
      name: body.name,
      color: body.color ?? null,
    },
  });
  return NextResponse.json(updated);
}

export async function DELETE(_req: Request, { params }: Ctx) {
  const { id } = await params;
  await prisma.skillCategory.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
