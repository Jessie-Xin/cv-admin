"use client";

import { Printer } from "lucide-react";
import { Button } from "@workspace/ui/components/button";

export function PrintButton() {
  return (
    <div className="no-print max-w-3xl mx-auto mb-4 flex items-center justify-end">
      <Button size="sm" onClick={() => window.print()}>
        <Printer className="w-4 h-4" />
        打印 / 导出 PDF
      </Button>
    </div>
  );
}
