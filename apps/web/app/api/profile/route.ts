import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
  const profile = await prisma.profile.findFirst({
    orderBy: { createdAt: "asc" },
  });
  return NextResponse.json(profile);
}

export async function PUT(req: Request) {
  const body = await req.json();
  const profile = await prisma.profile.findFirst({
    orderBy: { createdAt: "asc" },
  });
  if (!profile) {
    return NextResponse.json({ error: "Profile not found" }, { status: 404 });
  }
  const updated = await prisma.profile.update({
    where: { id: profile.id },
    data: {
      name: body.name,
      jobTitle: body.jobTitle,
      subtitle: body.subtitle ?? null,
      email: body.email,
      phone: body.phone ?? null,
      city: body.city ?? null,
      github: body.github ?? null,
      bio: body.bio ?? null,
    },
  });
  return NextResponse.json(updated);
}
