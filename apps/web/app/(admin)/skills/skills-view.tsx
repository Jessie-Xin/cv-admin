"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Plus, X, Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@workspace/ui/components/button";
import { Card, CardContent } from "@workspace/ui/components/card";
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
import { PageHeader } from "@/components/page-header";
import { ConfirmDialog } from "@/components/confirm-dialog";
import type { SkillCategory, Skill } from "@/lib/prisma";

type CategoryWithSkills = SkillCategory & { skills: Skill[] };

const palette = [
  { name: "绿", value: "#3D8A5A" },
  { name: "橙", value: "#D58A6A" },
  { name: "蓝", value: "#4F8AAB" },
  { name: "黄", value: "#D5A24A" },
  { name: "紫", value: "#8765B2" },
];

export function SkillsView({
  initialCategories,
}: {
  initialCategories: CategoryWithSkills[];
}) {
  const router = useRouter();
  const [categories, setCategories] = useState(initialCategories);
  const [skillDialog, setSkillDialog] = useState<{
    open: boolean;
    categoryId: string | null;
  }>({ open: false, categoryId: null });
  const [categoryDialog, setCategoryDialog] = useState<{
    open: boolean;
    editing: SkillCategory | null;
  }>({ open: false, editing: null });
  const [deletingCat, setDeletingCat] = useState<SkillCategory | null>(null);
  const [delCatLoading, setDelCatLoading] = useState(false);

  async function refresh() {
    const res = await fetch("/api/skill-categories");
    setCategories(await res.json());
    router.refresh();
  }

  async function deleteSkill(s: Skill) {
    try {
      await fetch(`/api/skills/${s.id}`, { method: "DELETE" });
      toast.success(`已删除「${s.name}」`);
      await refresh();
    } catch (e) {
      toast.error("删除失败：" + (e as Error).message);
    }
  }

  async function confirmDeleteCategory() {
    if (!deletingCat) return;
    setDelCatLoading(true);
    try {
      await fetch(`/api/skill-categories/${deletingCat.id}`, {
        method: "DELETE",
      });
      toast.success("已删除分类");
      setDeletingCat(null);
      await refresh();
    } catch (e) {
      toast.error("删除失败：" + (e as Error).message);
    } finally {
      setDelCatLoading(false);
    }
  }

  return (
    <>
      <PageHeader title="技能标签">
        <Button
          onClick={() =>
            setCategoryDialog({ open: true, editing: null })
          }
        >
          <Plus className="w-3.5 h-3.5" />
          添加分类
        </Button>
      </PageHeader>

      <div className="p-7 space-y-5">
        {categories.length === 0 && (
          <Card>
            <CardContent className="py-10 text-center text-sm text-muted-foreground">
              暂无分类，先添加一个吧
            </CardContent>
          </Card>
        )}

        {categories.map((c) => (
          <Card key={c.id}>
            <CardContent className="py-5 space-y-3.5">
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <span
                    className="w-2.5 h-2.5 rounded-full"
                    style={{ background: c.color ?? "#3D8A5A" }}
                  />
                  <h3 className="font-semibold">{c.name}</h3>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-xs text-muted-foreground">
                    {c.skills.length} 项技能
                  </span>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-7 px-2"
                    onClick={() =>
                      setCategoryDialog({ open: true, editing: c })
                    }
                  >
                    <Pencil className="w-3.5 h-3.5" />
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-7 px-2 text-destructive hover:text-destructive"
                    onClick={() => setDeletingCat(c)}
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </Button>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                {c.skills.map((s) => (
                  <span
                    key={s.id}
                    className="inline-flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full"
                    style={{
                      background: (c.color ?? "#3D8A5A") + "26",
                      color: c.color ?? "#3D8A5A",
                    }}
                  >
                    {s.name}
                    <button
                      onClick={() => deleteSkill(s)}
                      className="opacity-60 hover:opacity-100"
                      title="删除"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
                <Button
                  size="sm"
                  variant="outline"
                  className="h-7 px-2.5 text-xs"
                  onClick={() =>
                    setSkillDialog({ open: true, categoryId: c.id })
                  }
                >
                  <Plus className="w-3 h-3" />
                  添加技能
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <SkillDialog
        open={skillDialog.open}
        categoryId={skillDialog.categoryId}
        categories={categories}
        onOpenChange={(v) => setSkillDialog({ open: v, categoryId: null })}
        onSaved={refresh}
      />

      <CategoryDialog
        open={categoryDialog.open}
        editing={categoryDialog.editing}
        onOpenChange={(v) => setCategoryDialog({ open: v, editing: null })}
        onSaved={refresh}
      />

      <ConfirmDialog
        open={!!deletingCat}
        title="确认删除该分类？"
        description={`将永久删除「${deletingCat?.name ?? ""}」分类及其全部技能。`}
        loading={delCatLoading}
        onOpenChange={(v) => !v && setDeletingCat(null)}
        onConfirm={confirmDeleteCategory}
      />
    </>
  );
}

function SkillDialog({
  open,
  categoryId,
  categories,
  onOpenChange,
  onSaved,
}: {
  open: boolean;
  categoryId: string | null;
  categories: CategoryWithSkills[];
  onOpenChange: (v: boolean) => void;
  onSaved: () => void | Promise<void>;
}) {
  const [name, setName] = useState("");
  const [cid, setCid] = useState<string>("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!open) return;
    setName("");
    setCid(categoryId ?? categories[0]?.id ?? "");
  }, [open, categoryId, categories]);

  async function onSave() {
    if (!name.trim() || !cid) {
      toast.error("请填写技能名并选择分类");
      return;
    }
    setSaving(true);
    try {
      const res = await fetch("/api/skills", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name.trim(), categoryId: cid }),
      });
      if (!res.ok) throw new Error(await res.text());
      toast.success("已添加技能");
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
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>添加技能</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground">所属分类</Label>
            <Select value={cid} onValueChange={setCid}>
              <SelectTrigger>
                <SelectValue placeholder="选择分类" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((c) => (
                  <SelectItem key={c.id} value={c.id}>
                    {c.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground">技能名</Label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="TypeScript"
              autoFocus
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

function CategoryDialog({
  open,
  editing,
  onOpenChange,
  onSaved,
}: {
  open: boolean;
  editing: SkillCategory | null;
  onOpenChange: (v: boolean) => void;
  onSaved: () => void | Promise<void>;
}) {
  const isEdit = !!editing;
  const [form, setForm] = useState({ name: "", color: "#3D8A5A" });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!open) return;
    setForm(
      editing
        ? { name: editing.name, color: editing.color ?? "#3D8A5A" }
        : { name: "", color: "#3D8A5A" },
    );
  }, [open, editing]);

  async function onSave() {
    if (!form.name.trim()) return toast.error("请填写分类名");
    setSaving(true);
    try {
      const res = await fetch(
        isEdit
          ? `/api/skill-categories/${editing!.id}`
          : "/api/skill-categories",
        {
          method: isEdit ? "PUT" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(form),
        },
      );
      if (!res.ok) throw new Error(await res.text());
      toast.success(isEdit ? "已更新分类" : "已添加分类");
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
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>{isEdit ? "编辑分类" : "添加分类"}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground">分类名</Label>
            <Input
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="前端开发"
              autoFocus
            />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground">颜色</Label>
            <div className="flex gap-2">
              {palette.map((p) => (
                <button
                  key={p.value}
                  type="button"
                  onClick={() => setForm({ ...form, color: p.value })}
                  className={`w-7 h-7 rounded-full ring-offset-2 ${
                    form.color === p.value ? "ring-2 ring-foreground" : ""
                  }`}
                  style={{ background: p.value }}
                  title={p.name}
                />
              ))}
            </div>
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
