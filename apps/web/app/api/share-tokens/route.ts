import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const tokens = await prisma.shareToken.findMany({
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json(tokens);
}

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const { label, expiresInHours } = body;
  const hours = Number(expiresInHours);
  if (!hours || hours <= 0) {
    return NextResponse.json({ error: "Invalid expiration" }, { status: 400 });
  }

  const expiresAt = new Date(Date.now() + hours * 60 * 60 * 1000);
  const record = await prisma.shareToken.create({
    data: {
      label: label ?? null,
      expiresAt,
    },
  });

  const baseUrl = process.env.NEXT_PUBLIC_FRONTEND_URL ?? "http://localhost:3000";
  return NextResponse.json({
    ...record,
    shareUrl: `${baseUrl}/?token=${record.token}`,
  });
}

export async function PATCH(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { token, isActive } = await req.json();
  const updated = await prisma.shareToken.updateMany({
    where: { token },
    data: { isActive },
  });
  return NextResponse.json({ success: updated.count > 0 });
}

export async function DELETE(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });

  await prisma.shareToken.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
