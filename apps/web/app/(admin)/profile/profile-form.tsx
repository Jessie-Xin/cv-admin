"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { Save, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@workspace/ui/components/button";
import { Input } from "@workspace/ui/components/input";
import { Label } from "@workspace/ui/components/label";
import { Textarea } from "@workspace/ui/components/textarea";
import { Card, CardContent } from "@workspace/ui/components/card";
import { PageHeader } from "@/components/page-header";
import type { Profile } from "@/lib/prisma";

const MAX_AVATAR_SIZE = 5 * 1024 * 1024;
const AVATAR_DIMENSION = 256;

export function ProfileForm({ profile }: { profile: Profile }) {
  const router = useRouter();
  const [form, setForm] = useState(profile);
  const [saving, setSaving] = useState(false);
  const [processingAvatar, setProcessingAvatar] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const update =
    (key: keyof Profile) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      setForm((prev) => ({ ...prev, [key]: e.target.value }));

  async function onPickAvatar(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("请选择图片文件");
      return;
    }
    if (file.size > MAX_AVATAR_SIZE) {
      toast.error("图片不能超过 5MB");
      return;
    }

    setProcessingAvatar(true);
    try {
      const dataUrl = await compressImage(file, AVATAR_DIMENSION);
      setForm((prev) => ({ ...prev, avatarUrl: dataUrl }));
      toast.success("头像已更新，点击右上角保存生效");
    } catch (err) {
      toast.error("图片处理失败：" + (err as Error).message);
    } finally {
      setProcessingAvatar(false);
    }
  }

  function removeAvatar() {
    setForm((prev) => ({ ...prev, avatarUrl: null }));
  }

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
          avatarUrl: form.avatarUrl,
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
            {form.avatarUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={form.avatarUrl}
                alt={form.name}
                className="w-20 h-20 rounded-full object-cover shrink-0"
              />
            ) : (
              <div className="w-20 h-20 rounded-full bg-primary shrink-0 flex items-center justify-center text-2xl font-semibold text-primary-foreground">
                {form.name?.charAt(0) ?? "?"}
              </div>
            )}
            <div className="flex-1">
              <div className="text-lg font-semibold">{form.name}</div>
              <div className="text-sm text-muted-foreground mt-1">
                {form.subtitle}
              </div>
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={onPickAvatar}
            />
            <div className="flex flex-col gap-2">
              <Button
                variant="outline"
                onClick={() => fileInputRef.current?.click()}
                disabled={processingAvatar}
              >
                {processingAvatar && (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                )}
                更换头像
              </Button>
              {form.avatarUrl && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={removeAvatar}
                  disabled={processingAvatar}
                >
                  移除
                </Button>
              )}
            </div>
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
              <Field label="副标题">
                <Input
                  value={form.subtitle ?? ""}
                  onChange={update("subtitle")}
                />
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

function compressImage(file: File, size: number): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error("读取文件失败"));
    reader.onload = () => {
      const img = new Image();
      img.onerror = () => reject(new Error("图片加载失败"));
      img.onload = () => {
        const canvas = document.createElement("canvas");
        canvas.width = size;
        canvas.height = size;
        const ctx = canvas.getContext("2d");
        if (!ctx) {
          reject(new Error("浏览器不支持 Canvas"));
          return;
        }
        const side = Math.min(img.width, img.height);
        const sx = (img.width - side) / 2;
        const sy = (img.height - side) / 2;
        ctx.drawImage(img, sx, sy, side, side, 0, 0, size, size);
        resolve(canvas.toDataURL("image/jpeg", 0.85));
      };
      img.src = reader.result as string;
    };
    reader.readAsDataURL(file);
  });
}
