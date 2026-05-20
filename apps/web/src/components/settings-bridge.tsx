"use client";

import { useEffect } from "react";
import { useTheme } from "next-themes";
import type { ThemeMode } from "@/lib/prisma";

export function SettingsBridge({
  themeMode,
  accentColor,
}: {
  themeMode: ThemeMode;
  accentColor: string;
}) {
  const { setTheme } = useTheme();

  useEffect(() => {
    setTheme(themeMode === "DARK" ? "dark" : "light");
  }, [themeMode, setTheme]);

  useEffect(() => {
    if (typeof document === "undefined") return;
    const root = document.documentElement;
    root.style.setProperty("--primary", accentColor);
    root.style.setProperty("--ring", accentColor);
    return () => {
      root.style.removeProperty("--primary");
      root.style.removeProperty("--ring");
    };
  }, [accentColor]);

  return null;
}
