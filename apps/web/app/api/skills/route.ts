import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  const body = await req.json();
  if (!body.categoryId || !body.name) {
    return NextResponse.json(
      { error: "categoryId 与 name 必填" },
      { status: 400 },
    );
  }
  const created = await prisma.skill.create({
    data: {
      name: body.name,
      categoryId: body.categoryId,
      order: body.order ?? 99,
    },
  });
  return NextResponse.json(created, { status: 201 });
}
