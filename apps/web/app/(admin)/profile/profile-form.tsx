"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Save } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@workspace/ui/components/button";
import { Input } from "@workspace/ui/components/input";
import { Label } from "@workspace/ui/components/label";
import { Textarea } from "@workspace/ui/components/textarea";
import { Card, CardContent } from "@workspace/ui/components/card";
import { PageHeader } from "@/components/page-header";
import type { Profile } from "@/lib/prisma";

export function ProfileForm({ profile }: { profile: Profile }) {
  const router = useRouter();
  const [form, setForm] = useState(profile);
  const [saving, setSaving] = useState(false);

  const update =
    (key: keyof Profile) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      setForm((prev) => ({ ...prev, [key]: e.target.value }));

  async function onSave() {
    setSaving(true);
    try {
      const res = await fetch(`/api/profile`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name,
          jobTitle: form.jobTitle,
          subtitle: form.subtitle,
          email: form.email,
          phone: form.phone,
          city: form.city,
          github: form.github,
          bio: form.bio,
        }),
      });
      if (!res.ok) throw new Error(await res.text());
      toast.success("保存成功");
      router.refresh();
    } catch (e) {
      toast.error("保存失败：" + (e as Error).message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <>
      <PageHeader title="个人信息">
        <Button onClick={onSave} disabled={saving}>
          <Save className="w-3.5 h-3.5" />
          {saving ? "保存中…" : "保存修改"}
        </Button>
      </PageHeader>

      <div className="p-7 space-y-5">
        <Card>
          <CardContent className="flex items-center gap-5 py-5">
            <div className="w-20 h-20 rounded-full bg-primary shrink-0" />
            <div className="flex-1">
              <div className="text-lg font-semibold">{form.name}</div>
              <div className="text-sm text-muted-foreground mt-1">
                {form.subtitle}
              </div>
            </div>
            <Button variant="outline">更换头像</Button>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="space-y-5 py-5">
            <h2 className="font-semibold">基本信息</h2>
            <div className="grid grid-cols-2 gap-5">
              <Field label="姓名">
                <Input value={form.name} onChange={update("name")} />
              </Field>
              <Field label="职位">
                <Input value={form.jobTitle} onChange={update("jobTitle")} />
              </Field>
              <Field label="邮箱">
                <Input
                  type="email"
                  value={form.email}
                  onChange={update("email")}
                />
              </Field>
              <Field label="电话">
                <Input value={form.phone ?? ""} onChange={update("phone")} />
              </Field>
              <Field label="所在城市">
                <Input value={form.city ?? ""} onChange={update("city")} />
              </Field>
              <Field label="GitHub">
                <Input value={form.github ?? ""} onChange={update("github")} />
              </Field>
            </div>

            <div className="pt-2 space-y-3">
              <h2 className="font-semibold">个人简介</h2>
              <Field label="自我介绍">
                <Textarea
                  rows={4}
                  value={form.bio ?? ""}
                  onChange={update("bio")}
                />
              </Field>
            </div>
          </CardContent>
        </Card>
      </div>
    </>
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
