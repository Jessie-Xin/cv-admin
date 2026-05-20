import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { SESSION_COOKIE, signSession } from "@/lib/auth";

export const dynamic = "force-dynamic";

const SEVEN_DAYS = 60 * 60 * 24 * 7;
const ONE_DAY = 60 * 60 * 24;

export async function POST(req: Request) {
  const { email, password, remember } = (await req.json().catch(() => ({}))) as {
    email?: string;
    password?: string;
    remember?: boolean;
  };

  if (!email || !password) {
    return NextResponse.json(
      { error: "邮箱和密码不能为空" },
      { status: 400 },
    );
  }

  const user = await prisma.adminUser.findUnique({ where: { email } });
  if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
    return NextResponse.json({ error: "邮箱或密码错误" }, { status: 401 });
  }

  const maxAge = remember ? SEVEN_DAYS : ONE_DAY;
  const token = await signSession({ uid: user.id, email: user.email }, maxAge);

  const res = NextResponse.json({ ok: true });
  res.cookies.set(SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge,
  });
  return res;
}
