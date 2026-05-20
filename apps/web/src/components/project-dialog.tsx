"use client";

import { useState, useEffect } from "react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@workspace/ui/components/dialog";
import { Button } from "@workspace/ui/components/button";
import { Input } from "@workspace/ui/components/input";
import { Label } from "@workspace/ui/components/label";
import { Textarea } from "@workspace/ui/components/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@workspace/ui/components/select";
import type { Project, ProjectStatus } from "@/lib/prisma";

type Props = {
  open: boolean;
  project: Project | null;
  onOpenChange: (open: boolean) => void;
  onSaved: () => void | Promise<void>;
};

const empty = {
  name: "",
  description: "",
  role: "",
  startDate: "",
  endDate: "",
  status: "ACTIVE" as ProjectStatus,
  accentColor: "#3D8A5A",
  tagsText: "",
};

export function ProjectDialog({ open, project, onOpenChange, onSaved }: Props) {
  const isEdit = !!project;
  const [form, setForm] = useState(empty);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!open) return;
    if (project) {
      setForm({
        name: project.name,
        description: project.description,
        role: project.role,
        startDate: new Date(project.startDate).toISOString().slice(0, 10),
        endDate: project.endDate
          ? new Date(project.endDate).toISOString().slice(0, 10)
          : "",
        status: project.status,
        accentColor: project.accentColor ?? "#3D8A5A",
        tagsText: project.tags.join(", "),
      });
    } else {
      setForm(empty);
    }
  }, [open, project]);

  async function onSave() {
    setSaving(true);
    try {
      const payload = {
        name: form.name,
        description: form.description,
        role: form.role,
        startDate: form.startDate,
        endDate: form.endDate || null,
        status: form.status,
        accentColor: form.accentColor,
        tags: form.tagsText
          .split(",")
          .map((t) => t.trim())
          .filter(Boolean),
      };
      const res = await fetch(
        isEdit ? `/api/projects/${project!.id}` : "/api/projects",
        {
          method: isEdit ? "PUT" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        },
      );
      if (!res.ok) throw new Error(await res.text());
      toast.success(isEdit ? "已更新项目" : "已添加项目");
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
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{isEdit ? "编辑项目" : "添加项目"}</DialogTitle>
        </DialogHeader>

        <div className="grid gap-4">
          <Field label="项目名称">
            <Input
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="AI 设计助手"
            />
          </Field>

          <Field label="项目描述">
            <Textarea
              value={form.description}
              onChange={(e) =>
                setForm({ ...form, description: e.target.value })
              }
              rows={2}
            />
          </Field>

          <div className="grid grid-cols-2 gap-3">
            <Field label="角色">
              <Input
                value={form.role}
                onChange={(e) => setForm({ ...form, role: e.target.value })}
                placeholder="技术负责人"
              />
            </Field>
            <Field label="状态">
              <Select
                value={form.status}
                onValueChange={(v) =>
                  setForm({ ...form, status: v as ProjectStatus })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ACTIVE">进行中</SelectItem>
                  <SelectItem value="DONE">已结束</SelectItem>
                </SelectContent>
              </Select>
            </Field>
            <Field label="开始日期">
              <Input
                type="date"
                value={form.startDate}
                onChange={(e) =>
                  setForm({ ...form, startDate: e.target.value })
                }
              />
            </Field>
            <Field label="结束日期（空＝至今）">
              <Input
                type="date"
                value={form.endDate}
                onChange={(e) => setForm({ ...form, endDate: e.target.value })}
              />
            </Field>
          </div>

          <Field label="标签（逗号分隔）">
            <Input
              value={form.tagsText}
              onChange={(e) => setForm({ ...form, tagsText: e.target.value })}
              placeholder="React, Node.js"
            />
          </Field>
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

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <Label className="text-xs text-muted-foreground">{label}</Label>
      {children}
    </div>
  );
}
