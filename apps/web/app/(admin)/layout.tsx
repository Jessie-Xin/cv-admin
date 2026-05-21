import { Sidebar } from "@/components/sidebar";
import { SettingsBridge } from "@/components/settings-bridge";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();
  const [user, setting] = await Promise.all([
    session
      ? prisma.adminUser.findUnique({
          where: { id: session.uid },
          select: { name: true, email: true },
        })
      : Promise.resolve(null),
    prisma.setting.upsert({
      where: { id: "default" },
      update: {},
      create: { id: "default" },
    }),
  ]);

  return (
    <div className="flex min-h-screen bg-background">
      <SettingsBridge
        themeMode={setting.themeMode}
        accentColor={setting.accentColor}
      />
      <Sidebar userName={user?.name ?? user?.email ?? "管理员"} />
      <main className="flex-1 min-w-0">{children}</main>
    </div>
  );
}
