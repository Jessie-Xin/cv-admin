import { prisma } from "@/lib/prisma";
import { ProfileForm } from "./profile-form";

export const dynamic = "force-dynamic";

export default async function ProfilePage() {
  const profile = await prisma.profile.findFirst({
    orderBy: { createdAt: "asc" },
  });

  if (!profile) {
    return <div className="p-7">尚未建立个人信息，请先执行 seed。</div>;
  }

  return <ProfileForm profile={profile} />;
}
