"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@workspace/ui/components/button";
import { Card, CardContent } from "@workspace/ui/components/card";
import { Badge } from "@workspace/ui/components/badge";
import {
  Tabs,
  TabsList,
  TabsTrigger,
} from "@workspace/ui/components/tabs";
import { PageHeader } from "@/components/page-header";
import { ProjectDialog } from "@/components/project-dialog";
import { ConfirmDialog } from "@/components/confirm-dialog";
import type { Project, ProjectStatus } from "@/lib/prisma";

type Filter = "ALL" | ProjectStatus;

export function ProjectsView({
  initialProjects,
}: {
  initialProjects: Project[];
}) {
  const router = useRouter();
  const [projects, setProjects] = useState(initialProjects);
  const [filter, setFilter] = useState<Filter>("ALL");
  const [editing, setEditing] = useState<Project | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleting, setDeleting] = useState<Project | null>(null);
  const [deletingLoading, setDeletingLoading] = useState(false);

  const activeCount = projects.filter((p) => p.status === "ACTIVE").length;
  const doneCount = projects.filter((p) => p.status === "DONE").length;
  const filtered =
    filter === "ALL" ? projects : projects.filter((p) => p.status === filter);

  async function refresh() {
    const res = await fetch("/api/projects");
    setProjects(await res.json());
    router.refresh();
  }

  function openCreate() {
    setEditing(null);
    setDialogOpen(true);
  }

  function openEdit(p: Project) {
    setEditing(p);
    setDialogOpen(true);
  }

  async function onConfirmDelete() {
    if (!deleting) return;
    setDeletingLoading(true);
    try {
      await fetch(`/api/projects/${deleting.id}`, { method: "DELETE" });
      toast.success("已删除项目");
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
      <PageHeader title="项目管理">
        <Button onClick={openCreate}>
          <Plus className="w-3.5 h-3.5" />
          添加项目
        </Button>
      </PageHeader>

      <div className="p-7 space-y-5">
        <Tabs value={filter} onValueChange={(v) => setFilter(v as Filter)}>
          <TabsList>
            <TabsTrigger value="ALL">
              <span className="font-semibold mr-1.5">{projects.length}</span>
              全部项目
            </TabsTrigger>
            <TabsTrigger value="ACTIVE">
              <span className="font-semibold mr-1.5">{activeCount}</span>
              进行中
            </TabsTrigger>
            <TabsTrigger value="DONE">
              <span className="font-semibold mr-1.5">{doneCount}</span>
              已结束
            </TabsTrigger>
          </TabsList>
        </Tabs>

        <div className="grid grid-cols-3 gap-4">
          {filtered.map((p) => (
            <Card key={p.id} className="overflow-hidden">
              <CardContent className="space-y-3 py-5">
                <div className="flex items-start justify-between gap-3">
                  <h3 className="font-semibold text-base">{p.name}</h3>
                  <StatusBadge status={p.status} />
                </div>
                <p className="text-sm text-foreground/70 leading-relaxed">
                  {p.description}
                </p>
                <div className="text-xs text-muted-foreground space-y-1">
                  <div>角色：{p.role}</div>
                  <div>{formatRange(p.startDate, p.endDate)}</div>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {p.tags.map((t) => (
                    <Badge key={t} variant="secondary">
                      {t}
                    </Badge>
                  ))}
                </div>
                <div className="flex gap-2 pt-1">
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-7 px-2 text-primary hover:text-primary"
                    onClick={() => openEdit(p)}
                  >
                    <Pencil className="w-3.5 h-3.5" />
                    编辑
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-7 px-2 text-destructive hover:text-destructive"
                    onClick={() => setDeleting(p)}
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    删除
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      <ProjectDialog
        open={dialogOpen}
        project={editing}
        onOpenChange={setDialogOpen}
        onSaved={refresh}
      />
      <ConfirmDialog
        open={!!deleting}
        title="确认删除该项目？"
        description={`将永久删除「${deleting?.name ?? ""}」，此操作不可恢复。`}
        loading={deletingLoading}
        onOpenChange={(v) => !v && setDeleting(null)}
        onConfirm={onConfirmDelete}
      />
    </>
  );
}

function StatusBadge({ status }: { status: ProjectStatus }) {
  if (status === "ACTIVE") {
    return (
      <Badge className="bg-primary/15 text-primary hover:bg-primary/15">
        进行中
      </Badge>
    );
  }
  return <Badge variant="secondary">已结束</Badge>;
}

function formatRange(start: Date | string, end: Date | string | null) {
  const fmt = (d: Date | string) => {
    const date = new Date(d);
    return `${date.getFullYear()}.${String(date.getMonth() + 1).padStart(2, "0")}`;
  };
  return `${fmt(start)} — ${end ? fmt(end) : "至今"}`;
}
