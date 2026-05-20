"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@workspace/ui/components/button";
import { Card, CardContent } from "@workspace/ui/components/card";
import { Switch } from "@workspace/ui/components/switch";
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
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@workspace/ui/components/dialog";
import { Separator } from "@workspace/ui/components/separator";
import { PageHeader } from "@/components/page-header";
import { ConfirmDialog } from "@/components/confirm-dialog";
import type { Setting, ThemeMode, ExportFormat } from "@/lib/prisma";

const accentPalette = [
  "#3D8A5A",
  "#D58A6A",
  "#4F8AAB",
  "#D5A24A",
  "#8765B2",
];

export function SettingsView({ initial }: { initial: Setting }) {
  const router = useRouter();
  const [s, setS] = useState(initial);
  const [saving, setSaving] = useState(false);
  const [pwdOpen, setPwdOpen] = useState(false);
  const [delAccountOpen, setDelAccountOpen] = useState(false);

  async function persist(patch: Partial<Setting>) {
    setSaving(true);
    const optimistic = { ...s, ...patch };
    setS(optimistic);
    try {
      const res = await fetch("/api/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          themeMode: optimistic.themeMode,
          accentColor: optimistic.accentColor,
          defaultExportFormat: optimistic.defaultExportFormat,
          publicShareEnabled: optimistic.publicShareEnabled,
        }),
      });
      if (!res.ok) throw new Error(await res.text());
      toast.success("已保存");
      router.refresh();
    } catch (e) {
      toast.error("保存失败：" + (e as Error).message);
      setS(initial);
    } finally {
      setSaving(false);
    }
  }

  return (
    <>
      <PageHeader title="系统设置" />

      <div className="p-7 space-y-5 max-w-4xl">
        <SectionCard title="主题与外观">
          <Row
            title="主题模式"
            desc="选择简历预览的默认主题"
            control={
              <div className="flex gap-1 rounded-md bg-muted p-1">
                {(["LIGHT", "DARK"] as ThemeMode[]).map((m) => (
                  <button
                    key={m}
                    onClick={() => persist({ themeMode: m })}
                    disabled={saving}
                    className={`px-4 h-8 text-sm rounded ${
                      s.themeMode === m
                        ? "bg-primary text-primary-foreground"
                        : "text-foreground/70 hover:bg-background"
                    }`}
                  >
                    {m === "LIGHT" ? "浅色" : "深色"}
                  </button>
                ))}
              </div>
            }
          />
          <Separator />
          <Row
            title="强调色"
            desc="简历中使用的主题强调色"
            control={
              <div className="flex gap-2.5">
                {accentPalette.map((c) => (
                  <button
                    key={c}
                    onClick={() => persist({ accentColor: c })}
                    disabled={saving}
                    className={`w-7 h-7 rounded-full ring-offset-2 ${
                      s.accentColor === c ? "ring-2 ring-foreground" : ""
                    }`}
                    style={{ background: c }}
                  />
                ))}
              </div>
            }
          />
        </SectionCard>

        <SectionCard title="导出与分享">
          <Row
            title="默认导出格式"
            desc="导出简历时使用的文件格式"
            control={
              <Select
                value={s.defaultExportFormat}
                onValueChange={(v) =>
                  persist({ defaultExportFormat: v as ExportFormat })
                }
              >
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="PDF">PDF</SelectItem>
                  <SelectItem value="HTML">HTML</SelectItem>
                  <SelectItem value="MARKDOWN">Markdown</SelectItem>
                </SelectContent>
              </Select>
            }
          />
          <Separator />
          <Row
            title="公开分享链接"
            desc="允许他人通过链接查看你的简历"
            control={
              <Switch
                checked={s.publicShareEnabled}
                disabled={saving}
                onCheckedChange={(v) => persist({ publicShareEnabled: v })}
              />
            }
          />
        </SectionCard>

        <SectionCard title="账户与安全">
          <Row
            title="修改密码"
            desc="定期修改密码可提高账户安全"
            control={
              <Button variant="outline" onClick={() => setPwdOpen(true)}>
                修改
              </Button>
            }
          />
          <Separator />
          <Row
            title="删除账户"
            desc="永久删除你的账户和所有数据"
            control={
              <Button
                variant="destructive"
                onClick={() => setDelAccountOpen(true)}
              >
                删除账户
              </Button>
            }
          />
        </SectionCard>
      </div>

      <PasswordDialog open={pwdOpen} onOpenChange={setPwdOpen} />

      <ConfirmDialog
        open={delAccountOpen}
        title="确认删除账户？"
        description="此操作会清空所有数据，且不可恢复。此演示版本暂未启用。"
        onOpenChange={setDelAccountOpen}
        onConfirm={() => {
          toast.info("演示版本暂未实现");
          setDelAccountOpen(false);
        }}
      />
    </>
  );
}

function SectionCard({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <Card>
      <CardContent className="py-5 space-y-4">
        <h2 className="font-semibold">{title}</h2>
        <div className="space-y-4">{children}</div>
      </CardContent>
    </Card>
  );
}

function Row({
  title,
  desc,
  control,
}: {
  title: string;
  desc: string;
  control: React.ReactNode;
}) {
  return (
    <div className="flex items-center justify-between gap-6">
      <div>
        <div className="text-sm font-medium">{title}</div>
        <div className="text-xs text-muted-foreground mt-0.5">{desc}</div>
      </div>
      {control}
    </div>
  );
}

function PasswordDialog({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
}) {
  const [form, setForm] = useState({ currentPassword: "", newPassword: "" });
  const [saving, setSaving] = useState(false);

  async function onSave() {
    setSaving(true);
    try {
      const res = await fetch("/api/auth/password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error ?? "修改失败");
      toast.success("密码已更新");
      setForm({ currentPassword: "", newPassword: "" });
      onOpenChange(false);
    } catch (e) {
      toast.error((e as Error).message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>修改密码</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground">当前密码</Label>
            <Input
              type="password"
              value={form.currentPassword}
              onChange={(e) =>
                setForm({ ...form, currentPassword: e.target.value })
              }
            />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground">
              新密码（至少 6 个字符）
            </Label>
            <Input
              type="password"
              value={form.newPassword}
              onChange={(e) =>
                setForm({ ...form, newPassword: e.target.value })
              }
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            取消
          </Button>
          <Button onClick={onSave} disabled={saving}>
            {saving ? "保存中…" : "保存"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
