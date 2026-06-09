import { prisma } from "@/lib/prisma";
import { SharesView } from "./shares-view";

export const dynamic = "force-dynamic";

export default async function SharesPage() {
  const tokens = await prisma.shareToken.findMany({
    orderBy: { createdAt: "desc" },
  });
  const baseUrl = process.env.NEXT_PUBLIC_FRONTEND_URL ?? "http://localhost:3000";
  return <SharesView initialTokens={tokens} baseUrl={baseUrl} />;
}
