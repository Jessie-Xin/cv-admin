import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
  const categories = await prisma.skillCategory.findMany({
    orderBy: { order: "asc" },
    include: { skills: { orderBy: { order: "asc" } } },
  });
  return NextResponse.json(categories);
}

export async function POST(req: Request) {
  const body = await req.json();
  const created = await prisma.skillCategory.create({
    data: {
      name: body.name,
      color: body.color ?? null,
      order: body.order ?? 99,
    },
  });
  return NextResponse.json(created, { status: 201 });
}
