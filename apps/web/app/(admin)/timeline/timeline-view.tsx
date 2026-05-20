"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@workspace/ui/components/button";
import { Card, CardContent } from "@workspace/ui/components/card";
import { Input } from "@workspace/ui/components/input";
import { Label } from "@workspace/ui/components/label";
import { Textarea } from "@workspace/ui/components/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@workspace/ui/components/dialog";
import { PageHeader } from "@/components/page-header";
import { ConfirmDialog } from "@/components/confirm-dialog";
import type { Milestone } from "@/lib/prisma";

export function TimelineView({ initialItems }: { initialItems: Milestone[] }) {
  const router = useRouter();
  const [items, setItems] = useState(initialItems);
  const [editing, setEditing] = useState<Milestone | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleting, setDeleting] = useState<Milestone | null>(null);
  const [deletingLoading, setDeletingLoading] = useState(false);

  async function refresh() {
    const res = await fetch("/api/milestones");
    setItems(await res.json());
    router.refresh();
  }

  async function onConfirmDelete() {
    if (!deleting) return;
    setDeletingLoading(true);
    try {
      await fetch(`/api/milestones/${deleting.id}`, { method: "DELETE" });
      toast.success("已删除里程碑");
      setDeleting(null);
      await refresh();
    } catch (e) {
      toast.error("删除失败：" + (e as Error).message);
    } finally {
      setDeletingLoading(false);
    }
  }

  return (
    <>
      <PageHeader title="项目时间线">
        <Button
          onClick={() => {
            setEditing(null);
            setDialogOpen(true);
          }}
        >
          <Plus className="w-3.5 h-3.5" />
          添加里程碑
        </Button>
      </PageHeader>

      <div className="p-7">
        <Card>
          <CardContent className="py-6">
            <ol className="relative border-l border-border ml-3 space-y-6">
              {items.length === 0 ? (
                <li className="text-sm text-muted-foreground pl-6">
                  暂无里程碑
                </li>
              ) : (
                items.map((m, idx) => {
                  const d = new Date(m.occurredAt);
                  return (
                    <li key={m.id} className="ml-6 group">
                      <span
                        className={`absolute -left-1.5 w-3 h-3 rounded-full ring-4 ring-background ${
                          idx === 0 ? "bg-primary" : "bg-foreground/70"
                        }`}
                      />
                      <div className="flex items-start gap-6">
                        <div className="w-16 shrink-0">
                          <div
                            className={`text-base font-semibold ${
                              idx === 0 ? "text-primary" : ""
                            }`}
                          >
                            {d.getFullYear()}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {d.getMonth() + 1}月
                          </div>
                        </div>
                        <div className="flex-1 bg-muted/40 rounded-lg p-4">
                          <h3 className="font-semibold text-sm">{m.title}</h3>
                          <p className="text-sm text-muted-foreground mt-1">
                            {m.description}
                          </p>
                          <div className="flex gap-2 mt-2">
                            <Button
                              size="sm"
                              variant="ghost"
                              className="h-7 px-2 text-primary hover:text-primary"
                              onClick={() => {
                                setEditing(m);
                                setDialogOpen(true);
                              }}
                            >
                              <Pencil className="w-3.5 h-3.5" />
                              编辑
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              className="h-7 px-2 text-destructive hover:text-destructive"
                              onClick={() => setDeleting(m)}
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                              删除
                            </Button>
                          </div>
                        </div>
                      </div>
                    </li>
                  );
                })
              )}
            </ol>
          </CardContent>
        </Card>
      </div>

      <MilestoneDialog
        open={dialogOpen}
        milestone={editing}
        onOpenChange={setDialogOpen}
        onSaved={refresh}
      />
      <ConfirmDialog
        open={!!deleting}
        title="确认删除该里程碑？"
        description={`将永久删除「${deleting?.title ?? ""}」。`}
        loading={deletingLoading}
        onOpenChange={(v) => !v && setDeleting(null)}
        onConfirm={onConfirmDelete}
      />
    </>
  );
}

function MilestoneDialog({
  open,
  milestone,
  onOpenChange,
  onSaved,
}: {
  open: boolean;
  milestone: Milestone | null;
  onOpenChange: (v: boolean) => void;
  onSaved: () => void | Promise<void>;
}) {
  const isEdit = !!milestone;
  const [form, setForm] = useState({
    title: "",
    description: "",
    occurredAt: "",
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!open) return;
    if (milestone) {
      setForm({
        title: milestone.title,
        description: milestone.description,
        occurredAt: new Date(milestone.occurredAt).toISOString().slice(0, 10),
      });
    } else {
      setForm({ title: "", description: "", occurredAt: "" });
    }
  }, [open, milestone]);

  async function onSave() {
    setSaving(true);
    try {
      const res = await fetch(
        isEdit ? `/api/milestones/${milestone!.id}` : "/api/milestones",
        {
          method: isEdit ? "PUT" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(form),
        },
      );
      if (!res.ok) throw new Error(await res.text());
      toast.success(isEdit ? "已更新里程碑" : "已添加里程碑");
      await onSaved();
      onOpenChange(false);
    } catch (e) {
      toast.error("保存失败：" + (e as Error).message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{isEdit ? "编辑里程碑" : "添加里程碑"}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground">标题</Label>
            <Input
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              placeholder="产品公测上线"
            />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground">描述</Label>
            <Textarea
              rows={2}
              value={form.description}
              onChange={(e) =>
                setForm({ ...form, description: e.target.value })
              }
            />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground">日期</Label>
            <Input
              type="date"
              value={form.occurredAt}
              onChange={(e) =>
                setForm({ ...form, occurredAt: e.target.value })
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
