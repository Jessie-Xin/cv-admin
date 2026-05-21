import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { ResumeView } from "@/components/resume-view";
import { getResumePayload } from "@/lib/resume-data";
import { PreviewToolbar } from "./preview-toolbar";

export const dynamic = "force-dynamic";

export default async function PreviewPage() {
  const session = await getSession();
  if (!session) redirect("/login");

  const payload = await getResumePayload();

  if (!payload) {
    return <div className="p-8">尚未建立个人信息，请先填写。</div>;
  }

  return (
    <div className="min-h-screen bg-neutral-100 print:bg-white py-10 print:py-0">
      <PreviewToolbar publicShareEnabled={payload.publicShareEnabled} />
      <ResumeView data={payload.data} />
    </div>
  );
}
