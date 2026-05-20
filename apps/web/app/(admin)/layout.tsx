import { Sidebar } from "@/components/sidebar";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();
  const user = session
    ? await prisma.adminUser.findUnique({
        where: { id: session.uid },
        select: { name: true, email: true },
      })
    : null;

  return (
    <div className="flex min-h-screen bg-[#F5F4F1]">
      <Sidebar userName={user?.name ?? user?.email ?? "管理员"} />
      <main className="flex-1 min-w-0">{children}</main>
    </div>
  );
}
