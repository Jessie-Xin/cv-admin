"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {

  Plus,
  Copy,
  Check,
  Trash2,
  Power,
  PowerOff,
  Clock,
} from "lucide-react";
import { Button } from "@workspace/ui/components/button";
import { Card, CardContent, CardHeader } from "@workspace/ui/components/card";
import { Input } from "@workspace/ui/components/input";
import { Label } from "@workspace/ui/components/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@workspace/ui/components/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@workspace/ui/components/table";
import { Badge } from "@workspace/ui/components/badge";
import { PageHeader } from "@/components/page-header";
import { ConfirmDialog } from "@/components/confirm-dialog";
import type { ShareToken } from "@/lib/prisma";

type TokenWithUrl = ShareToken & { shareUrl?: string };

export function SharesView({
  initialTokens,
  baseUrl,
}: {
  initialTokens: ShareToken[];
  baseUrl: string;
}) {
  const router = useRouter();
  const [tokens, setTokens] = useState<TokenWithUrl[]>(initialTokens);
  const [label, setLabel] = useState("");
  const [expiresIn, setExpiresIn] = useState("24");
  const [creating, setCreating] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState<ShareToken | null>(null);
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  async function create() {
    setCreating(true);
    try {
      const res = await fetch("/api/share-tokens", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ label: label || undefined, expiresInHours: Number(expiresIn) }),
      });
      if (!res.ok) throw new Error(await res.text());
      const data = await res.json();
      toast.success("分享链接已生成");
      setTokens((prev) => [data, ...prev]);
      setLabel("");
      router.refresh();
    } catch (e) {
      toast.error("生成失败：" + (e as Error).message);
    } finally {
      setCreating(false);
    }
  }

  async function toggle(token: ShareToken) {
    try {
      await fetch("/api/share-tokens", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token: token.token, isActive: !token.isActive }),
      });
      setTokens((prev) =>
        prev.map((t) =>
          t.id === token.id ? { ...t, isActive: !t.isActive } : t
        )
      );
      toast.success(token.isActive ? "已禁用" : "已启用");
    } catch (e) {
      toast.error("操作失败：" + (e as Error).message);
    }
  }

  async function remove(id: string) {
    try {
      await fetch(`/api/share-tokens?id=${id}`, { method: "DELETE" });
      setTokens((prev) => prev.filter((t) => t.id !== id));
      toast.success("已删除");
    } catch (e) {
      toast.error("删除失败：" + (e as Error).message);
    } finally {
      setDeleting(null);
    }
  }

  function copy(url: string, id: string) {
    navigator.clipboard.writeText(url);
    setCopiedId(id);
    toast.success("已复制到剪贴板");
    setTimeout(() => setCopiedId(null), 2000);
  }

  function isExpired(t: ShareToken) {
    return new Date() > new Date(t.expiresAt);
  }

  return (
    <>
      <PageHeader title="分享链接" />

      <div className="p-7 space-y-6 max-w-5xl">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <h2 className="font-semibold">生成新链接</h2>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-3 gap-4">
              <div className="col-span-2 space-y-2">
                <Label htmlFor="label">备注（可选）</Label>
                <Input
                  id="label"
                  placeholder="例如：给 HR 的链接"
                  value={label}
                  onChange={(e) => setLabel(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>有效期</Label>
                {mounted ? (
                <Select value={expiresIn} onValueChange={setExpiresIn}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">1 小时</SelectItem>
                    <SelectItem value="6">6 小时</SelectItem>
                    <SelectItem value="24">1 天</SelectItem>
                    <SelectItem value="168">7 天</SelectItem>
                    <SelectItem value="720">30 天</SelectItem>
                  </SelectContent>
                </Select>
                ) : (
                  <div className="flex h-9 w-full items-center justify-between rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm">
                    <span className="text-muted-foreground">1 天</span>
                  </div>
                )}
              </div>
            </div>
            <Button onClick={create} disabled={creating}>
              <Plus className="w-3.5 h-3.5" />
              生成链接
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <h2 className="font-semibold">已生成的链接</h2>
          </CardHeader>
          <CardContent className="px-0 pb-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="pl-6">备注</TableHead>
                  <TableHead>Token</TableHead>
                  <TableHead>有效期</TableHead>
                  <TableHead>状态</TableHead>
                  <TableHead className="text-right pr-6">操作</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {tokens.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={5}
                      className="text-center text-muted-foreground py-8"
                    >
                      暂无分享链接
                    </TableCell>
                  </TableRow>
                ) : (
                  tokens.map((t) => {
                    const expired = isExpired(t);
                    const url = `${baseUrl}/?token=${t.token}`;
                    return (
                      <TableRow key={t.id}>
                        <TableCell className="pl-6 font-medium">
                          {t.label || "-"}
                        </TableCell>
                        <TableCell className="font-mono text-xs text-muted-foreground">
                          {t.token.slice(0, 8)}…
                        </TableCell>
                        <TableCell className="text-muted-foreground text-sm">
                          <div className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {formatDate(t.expiresAt)}
                            {expired && (
                              <Badge variant="secondary" className="text-xs ml-1">
                                已过期
                              </Badge>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          {t.isActive && !expired ? (
                            <Badge className="bg-primary/15 text-primary hover:bg-primary/15">
                              有效
                            </Badge>
                          ) : (
                            <Badge variant="secondary">失效</Badge>
                          )}
                        </TableCell>
                        <TableCell className="text-right pr-4 space-x-1">
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-7 px-2"
                            onClick={() => copy(url, t.id)}
                          >
                            {copiedId === t.id ? (
                              <Check className="w-3.5 h-3.5 text-primary" />
                            ) : (
                              <Copy className="w-3.5 h-3.5" />
                            )}
                            复制
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-7 px-2"
                            onClick={() => toggle(t)}
                          >
                            {t.isActive ? (
                              <PowerOff className="w-3.5 h-3.5 text-muted-foreground" />
                            ) : (
                              <Power className="w-3.5 h-3.5 text-primary" />
                            )}
                            {t.isActive ? "禁用" : "启用"}
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-7 px-2 text-destructive hover:text-destructive"
                            onClick={() => setDeleting(t)}
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            删除
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>

      <ConfirmDialog
        open={!!deleting}
        title="确认删除该分享链接？"
        description={`将永久删除链接「${deleting?.label ?? deleting?.token ?? ""}」，此操作不可恢复。`}
        loading={false}
        onOpenChange={(v) => !v && setDeleting(null)}
        onConfirm={() => { if (deleting) remove(deleting.id); }}
      />
    </>
  );
}

function formatDate(d: Date | string) {
  const date = new Date(d);
  return `${date.getFullYear()}.${String(date.getMonth() + 1).padStart(2, "0")}.${String(date.getDate()).padStart(2, "0")} ${String(date.getHours()).padStart(2, "0")}:${String(date.getMinutes()).padStart(2, "0")}`;
}
