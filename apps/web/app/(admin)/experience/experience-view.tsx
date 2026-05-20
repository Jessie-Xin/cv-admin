"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Plus,
  Pencil,
  Trash2,
  GraduationCap,
  Briefcase,
  Award,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@workspace/ui/components/button";
import { Card, CardContent } from "@workspace/ui/components/card";
import { Badge } from "@workspace/ui/components/badge";
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
import {
  Tabs,
  TabsList,
  TabsTrigger,
} from "@workspace/ui/components/tabs";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@workspace/ui/components/dialog";
import { PageHeader } from "@/components/page-header";
import { ConfirmDialog } from "@/components/confirm-dialog";
import type { Experience, ExperienceType } from "@/lib/prisma";

type Filter = "ALL" | ExperienceType;

const typeMeta: Record<
  ExperienceType,
  { label: string; tone: string; Icon: typeof GraduationCap }
> = {
  EDUCATION: {
    label: "教育",
    tone: "text-primary bg-primary/15",
    Icon: GraduationCap,
  },
  WORK: { label: "工作", tone: "text-[#D58A6A] bg-[#FCE9DE]", Icon: Briefcase },
  CERTIFICATION: {
    label: "认证",
    tone: "text-[#4F8AAB] bg-[#E1ECF4]",
    Icon: Award,
  },
};

export function ExperienceView({
  initialItems,
}: {
  initialItems: Experience[];
}) {
  const router = useRouter();
  const [items, setItems] = useState(initialItems);
  const [filter, setFilter] = useState<Filter>("ALL");
  const [editing, setEditing] = useState<Experience | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleting, setDeleting] = useState<Experience | null>(null);
  const [deletingLoading, setDeletingLoading] = useState(false);

  const filtered =
    filter === "ALL" ? items : items.filter((it) => it.type === filter);

  async function refresh() {
    const res = await fetch("/api/experiences");
    setItems(await res.json());
    router.refresh();
  }

  async function onConfirmDelete() {
    if (!deleting) return;
    setDeletingLoading(true);
    try {
      await fetch(`/api/experiences/${deleting.id}`, { method: "DELETE" });
      toast.success("已删除历程");
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
      <PageHeader title="个人历程">
        <Button
          onClick={() => {
            setEditing(null);
            setDialogOpen(true);
          }}
        >
          <Plus className="w-3.5 h-3.5" />
          添加历程
        </Button>
      </PageHeader>

      <div className="p-7 space-y-4">
        <Tabs value={filter} onValueChange={(v) => setFilter(v as Filter)}>
          <TabsList>
            <TabsTrigger value="ALL">全部</TabsTrigger>
            <TabsTrigger value="EDUCATION">教育</TabsTrigger>
            <TabsTrigger value="WORK">工作</TabsTrigger>
            <TabsTrigger value="CERTIFICATION">认证</TabsTrigger>
          </TabsList>
        </Tabs>

        <div className="space-y-3">
          {filtered.length === 0 && (
            <Card>
              <CardContent className="py-10 text-center text-sm text-muted-foreground">
                暂无历程
              </CardContent>
            </Card>
          )}
          {filtered.map((it) => {
            const meta = typeMeta[it.type];
            return (
              <Card key={it.id}>
                <CardContent className="py-4 flex items-start gap-4">
                  <div
                    className={`w-11 h-11 rounded-md flex items-center justify-center shrink-0 ${meta.tone}`}
                  >
                    <meta.Icon className="w-5 h-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-semibold text-sm">{it.title}</h3>
                      <Badge variant="secondary">{meta.label}</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">
                      {it.description}
                    </p>
                    <div className="text-xs text-muted-foreground mt-2">
                      {formatRange(it.startDate, it.endDate, it.type)}
                    </div>
                  </div>
                  <div className="flex flex-col gap-1">
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-7 px-2 text-primary hover:text-primary"
                      onClick={() => {
                        setEditing(it);
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
                      onClick={() => setDeleting(it)}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      删除
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

      <ExperienceDialog
        open={dialogOpen}
        experience={editing}
        onOpenChange={setDialogOpen}
        onSaved={refresh}
      />
      <ConfirmDialog
        open={!!deleting}
        title="确认删除该历程？"
        description={`将永久删除「${deleting?.title ?? ""}」。`}
        loading={deletingLoading}
        onOpenChange={(v) => !v && setDeleting(null)}
        onConfirm={onConfirmDelete}
      />
    </>
  );
}

function formatRange(
  start: Date | string,
  end: Date | string | null,
  type: ExperienceType,
) {
  const fmt = (d: Date | string) => {
    const date = new Date(d);
    return `${date.getFullYear()}.${String(date.getMonth() + 1).padStart(2, "0")}`;
  };
  if (type === "CERTIFICATION") return `${fmt(start)} 获取`;
  return `${fmt(start)} — ${end ? fmt(end) : "至今"}`;
}

function ExperienceDialog({
  open,
  experience,
  onOpenChange,
  onSaved,
}: {
  open: boolean;
  experience: Experience | null;
  onOpenChange: (v: boolean) => void;
  onSaved: () => void | Promise<void>;
}) {
  const isEdit = !!experience;
  const [form, setForm] = useState({
    title: "",
    organization: "",
    description: "",
    type: "EDUCATION" as ExperienceType,
    startDate: "",
    endDate: "",
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!open) return;
    if (experience) {
      setForm({
        title: experience.title,
        organization: experience.organization,
        description: experience.description,
        type: experience.type,
        startDate: new Date(experience.startDate).toISOString().slice(0, 10),
        endDate: experience.endDate
          ? new Date(experience.endDate).toISOString().slice(0, 10)
          : "",
      });
    } else {
      setForm({
        title: "",
        organization: "",
        description: "",
        type: "EDUCATION",
        startDate: "",
        endDate: "",
      });
    }
  }, [open, experience]);

  async function onSave() {
    setSaving(true);
    try {
      const res = await fetch(
        isEdit ? `/api/experiences/${experience!.id}` : "/api/experiences",
        {
          method: isEdit ? "PUT" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ...form, endDate: form.endDate || null }),
        },
      );
      if (!res.ok) throw new Error(await res.text());
      toast.success(isEdit ? "已更新历程" : "已添加历程");
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
          <DialogTitle>{isEdit ? "编辑历程" : "添加历程"}</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4">
          <div className="grid grid-cols-2 gap-3">
            <Field label="类型">
              <Select
                value={form.type}
                onValueChange={(v) =>
                  setForm({ ...form, type: v as ExperienceType })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="EDUCATION">教育</SelectItem>
                  <SelectItem value="WORK">工作</SelectItem>
                  <SelectItem value="CERTIFICATION">认证</SelectItem>
                </SelectContent>
              </Select>
            </Field>
            <Field label="机构">
              <Input
                value={form.organization}
                onChange={(e) =>
                  setForm({ ...form, organization: e.target.value })
                }
              />
            </Field>
          </div>
          <Field label="标题">
            <Input
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              placeholder="浙江大学 · 计算机科学与技术"
            />
          </Field>
          <Field label="描述">
            <Textarea
              rows={3}
              value={form.description}
              onChange={(e) =>
                setForm({ ...form, description: e.target.value })
              }
            />
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="开始日期">
              <Input
                type="date"
                value={form.startDate}
                onChange={(e) =>
                  setForm({ ...form, startDate: e.target.value })
                }
              />
            </Field>
            <Field label="结束日期（空＝至今 / 认证类无需）">
              <Input
                type="date"
                value={form.endDate}
                onChange={(e) => setForm({ ...form, endDate: e.target.value })}
              />
            </Field>
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
