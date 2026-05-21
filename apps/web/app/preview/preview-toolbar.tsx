"use client";

import { Printer, Link as LinkIcon, ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@workspace/ui/components/button";

export function PreviewToolbar({
  publicShareEnabled,
}: {
  publicShareEnabled: boolean;
}) {
  const router = useRouter();

  async function copyShareLink() {
    const url = `${window.location.origin}/resume`;
    try {
      await navigator.clipboard.writeText(url);
      toast.success("分享链接已复制：" + url);
    } catch {
      toast.error("复制失败，请手动复制：" + url);
    }
  }

  return (
    <div className="no-print max-w-3xl mx-auto mb-4 flex items-center justify-between">
      <Button variant="ghost" size="sm" onClick={() => router.push("/")}>
        <ArrowLeft className="w-4 h-4" />
        返回后台
      </Button>
      <div className="flex items-center gap-2">
        {publicShareEnabled ? (
          <Button variant="outline" size="sm" onClick={copyShareLink}>
            <LinkIcon className="w-4 h-4" />
            复制分享链接
          </Button>
        ) : (
          <Button
            variant="outline"
            size="sm"
            disabled
            title="可在「系统设置 → 公开分享链接」开启"
          >
            <LinkIcon className="w-4 h-4" />
            分享已关闭
          </Button>
        )}
        <Button size="sm" onClick={() => window.print()}>
          <Printer className="w-4 h-4" />
          打印 / 导出 PDF
        </Button>
      </div>
    </div>
  );
}
