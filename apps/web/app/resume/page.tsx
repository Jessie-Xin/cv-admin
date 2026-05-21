import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ResumeView } from "@/components/resume-view";
import { getResumePayload } from "@/lib/resume-data";
import { PrintButton } from "./print-button";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  const payload = await getResumePayload();
  if (!payload) return { title: "简历" };
  const { profile } = payload.data;
  return {
    title: `${profile.name} · 个人简历`,
    description: profile.bio ?? profile.subtitle ?? profile.jobTitle ?? undefined,
  };
}

export default async function ResumePage() {
  const payload = await getResumePayload();
  if (!payload || !payload.publicShareEnabled) notFound();

  return (
    <div className="min-h-screen bg-neutral-100 print:bg-white py-10 print:py-0">
      <PrintButton />
      <ResumeView data={payload.data} />
    </div>
  );
}
