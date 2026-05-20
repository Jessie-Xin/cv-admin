"use client";

import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import {
  LayoutGrid,
  User,
  FolderOpen,
  Clock,
  BarChart3,
  Star,
  Settings,
  LogOut,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@workspace/ui/components/button";

const navItems = [
  { href: "/", label: "数据概览", icon: LayoutGrid },
  { href: "/profile", label: "个人信息", icon: User },
  { href: "/projects", label: "项目管理", icon: FolderOpen },
  { href: "/timeline", label: "项目时间线", icon: Clock },
  { href: "/experience", label: "个人历程", icon: BarChart3 },
  { href: "/skills", label: "技能标签", icon: Star },
  { href: "/settings", label: "系统设置", icon: Settings },
];

export function Sidebar({ userName }: { userName: string }) {
  const router = useRouter();
  const pathname = usePathname();

  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" });
    toast.success("已退出登录");
    router.replace("/login");
    router.refresh();
  }

  return (
    <aside className="w-[220px] shrink-0 bg-[#1A1918] text-white flex flex-col h-screen sticky top-0">
      <div className="flex items-center gap-2 px-6 py-5">
        <div className="w-7 h-7 rounded-full bg-primary" />
        <span className="font-semibold text-base">我的简历</span>
      </div>
      <div className="px-6 text-xs text-white/40 mb-2">内容管理</div>
      <nav className="flex-1 px-3 space-y-1">
        {navItems.map(({ href, label, icon: Icon }) => {
          const active =
            href === "/" ? pathname === "/" : pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors ${
                active
                  ? "bg-primary text-primary-foreground"
                  : "text-white/70 hover:bg-white/5 hover:text-white"
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{label}</span>
            </Link>
          );
        })}
      </nav>
      <div className="border-t border-white/10 px-4 py-4 flex items-center gap-3">
        <div className="w-9 h-9 rounded-full bg-primary" />
        <div className="flex-1 text-sm min-w-0">
          <div className="font-medium truncate">{userName}</div>
          <div className="text-white/40 text-xs">管理员</div>
        </div>
        <Button
          size="icon"
          variant="ghost"
          onClick={logout}
          title="退出登录"
          className="text-white/40 hover:text-white hover:bg-white/5 h-8 w-8"
        >
          <LogOut className="w-4 h-4" />
        </Button>
      </div>
    </aside>
  );
}
