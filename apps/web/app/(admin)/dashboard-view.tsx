"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  FolderOpen,
  Clock,
  Star,
  CheckCircle2,
  Plus,
  Eye,
  Pencil,
  Trash2,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@workspace/ui/components/button";
import { Card, CardContent, CardHeader } from "@workspace/ui/components/card";
import { Badge } from "@workspace/ui/components/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@workspace/ui/components/table";
import { PageHeader } from "@/components/page-header";
import { ProjectDialog } from "@/components/project-dialog";
import { ConfirmDialog } from "@/components/confirm-dialog";
import type { Project, ProjectStatus } from "@/lib/prisma";

type Stats = {
  projectCount: number;
  milestoneCount: number;
  skillCount: number;
  categoryCount: number;
};

export function DashboardView({
  projects: initialProjects,
  stats,
  yearRange,
}: {
  projects: Project[];
  stats: Stats;
  yearRange: string;
}) {
  const router = useRouter();
  const [projects, setProjects] = useState(initialProjects);
  const [editing, setEditing] = useState<Project | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleting, setDeleting] = useState<Project | null>(null);
  const [deletingLoading, setDeletingLoading] = useState(false);

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

  const statCards = [
    {
      label: "项目总数",
      value: stats.projectCount,
      suffix: "本月新增 2 个",
      Icon: FolderOpen,
      tone: "text-primary bg-primary/15",
    },
    {
      label: "时间线条目",
      value: stats.milestoneCount,
      suffix: yearRange,
      Icon: Clock,
      tone: "text-[#D58A6A] bg-[#FCE9DE]",
    },
    {
      label: "技能标签",
      value: stats.skillCount,
      suffix: `${stats.categoryCount} 个技能分类`,
      Icon: Star,
      tone: "text-[#4F8AAB] bg-[#E1ECF4]",
    },
    {
      label: "简历完成度",
      value: "85%",
      suffix: "建议补充教育经历",
      Icon: CheckCircle2,
      tone: "text-primary bg-primary/15",
      valueClass: "text-primary",
    },
  ];

  return (
    <>
      <PageHeader title="数据概览">
        <Button variant="outline">
          <Eye className="w-3.5 h-3.5" />
          预览简历
        </Button>
      </PageHeader>

      <div className="p-7 space-y-6">
        <div className="grid grid-cols-4 gap-4">
          {statCards.map((s) => (
            <Card key={s.label}>
              <CardContent className="py-5 flex flex-col gap-2">
                <div className="flex items-start justify-between">
                  <span className="text-sm text-muted-foreground">
                    {s.label}
                  </span>
                  <div
                    className={`w-8 h-8 rounded-md flex items-center justify-center ${s.tone}`}
                  >
                    <s.Icon className="w-4 h-4" />
                  </div>
                </div>
                <div className={`text-3xl font-bold ${s.valueClass ?? ""}`}>
                  {s.value}
                </div>
                <div className="text-xs text-muted-foreground">{s.suffix}</div>
              </CardContent>
            </Card>
          ))}
        </div>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <h2 className="font-semibold">项目列表</h2>
            <Button size="sm" onClick={openCreate}>
              <Plus className="w-3.5 h-3.5" />
              添加项目
            </Button>
          </CardHeader>
          <CardContent className="px-0 pb-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="pl-6">项目名称</TableHead>
                  <TableHead>角色</TableHead>
                  <TableHead>时间段</TableHead>
                  <TableHead>状态</TableHead>
                  <TableHead className="text-right pr-6">操作</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {projects.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={5}
                      className="text-center text-muted-foreground py-8"
                    >
                      暂无项目，点击「添加项目」开始
                    </TableCell>
                  </TableRow>
                ) : (
                  projects.map((p) => (
                    <TableRow key={p.id}>
                      <TableCell className="pl-6 flex items-center gap-3 font-medium">
                        <span
                          className="w-1 h-4 rounded-sm"
                          style={{ background: p.accentColor ?? "#3D8A5A" }}
                        />
                        {p.name}
                      </TableCell>
                      <TableCell>{p.role}</TableCell>
                      <TableCell className="text-muted-foreground">
                        {formatRange(p.startDate, p.endDate)}
                      </TableCell>
                      <TableCell>
                        <StatusBadge status={p.status} />
                      </TableCell>
                      <TableCell className="text-right pr-4">
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
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
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

function formatRange(start: Date | string, end: Date | string | null) {
  const fmt = (d: Date | string) => {
    const date = new Date(d);
    return `${date.getFullYear()}.${String(date.getMonth() + 1).padStart(2, "0")}`;
  };
  return `${fmt(start)} — ${end ? fmt(end) : "至今"}`;
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
