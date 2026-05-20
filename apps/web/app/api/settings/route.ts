import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
  const setting = await prisma.setting.upsert({
    where: { id: "default" },
    update: {},
    create: { id: "default" },
  });
  return NextResponse.json(setting);
}

export async function PUT(req: Request) {
  const body = await req.json();
  const updated = await prisma.setting.update({
    where: { id: "default" },
    data: {
      themeMode: body.themeMode,
      accentColor: body.accentColor,
      defaultExportFormat: body.defaultExportFormat,
      publicShareEnabled: body.publicShareEnabled,
    },
  });
  return NextResponse.json(updated);
}
