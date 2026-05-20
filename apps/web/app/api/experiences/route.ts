import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
  const items = await prisma.experience.findMany({
    orderBy: { startDate: "desc" },
  });
  return NextResponse.json(items);
}

export async function POST(req: Request) {
  const body = await req.json();
  const item = await prisma.experience.create({
    data: {
      title: body.title,
      organization: body.organization,
      description: body.description,
      type: body.type,
      startDate: new Date(body.startDate),
      endDate: body.endDate ? new Date(body.endDate) : null,
    },
  });
  return NextResponse.json(item, { status: 201 });
}
