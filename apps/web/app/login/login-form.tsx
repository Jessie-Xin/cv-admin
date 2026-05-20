"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@workspace/ui/components/button";
import { Input } from "@workspace/ui/components/input";
import { Label } from "@workspace/ui/components/label";
import { Checkbox } from "@workspace/ui/components/checkbox";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@workspace/ui/components/card";

export function LoginForm() {
  const router = useRouter();
  const [email, setEmail] = useState("admin@cv.local");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(true);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, remember }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        toast.error(data.error ?? "登录失败");
        return;
      }
      toast.success("登录成功");
      router.replace("/");
      router.refresh();
    } catch (e) {
      toast.error((e as Error).message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card className="w-[440px] shadow-[0_8px_32px_rgba(0,0,0,0.06)]">
      <CardHeader className="space-y-4 pb-4">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-full bg-primary" />
          <span className="text-xl font-semibold">我的简历</span>
        </div>
        <div className="space-y-1.5">
          <CardTitle className="text-2xl">欢迎回来</CardTitle>
          <CardDescription>登录后管理你的个人简历内容</CardDescription>
        </div>
      </CardHeader>

      <CardContent>
        <form onSubmit={onSubmit} className="space-y-5">
          <div className="space-y-1.5">
            <Label htmlFor="email">邮箱</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="your@email.com"
              required
              autoFocus
            />
          </div>

          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <Label htmlFor="password">密码</Label>
              <button
                type="button"
                className="text-xs text-primary hover:underline"
                onClick={() => toast.info("请联系管理员重置密码")}
              >
                忘记密码？
              </button>
            </div>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
            />
          </div>

          <label className="flex items-center gap-2 text-sm text-foreground/70 select-none cursor-pointer">
            <Checkbox
              checked={remember}
              onCheckedChange={(v) => setRemember(v === true)}
            />
            记住我
          </label>

          <Button type="submit" disabled={loading} className="w-full h-11">
            {loading ? "登录中…" : "登录"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
