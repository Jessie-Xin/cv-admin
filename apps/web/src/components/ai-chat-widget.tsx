"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Bot, X, Send, Loader2, Sparkles, Square } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { toast } from "sonner";
import { Button } from "@workspace/ui/components/button";
import { Textarea } from "@workspace/ui/components/textarea";
import { cn } from "@workspace/ui/lib/utils";

type ChatMessage = {
  role: "user" | "assistant";
  content: string;
};

const SUGGESTIONS = [
  "列出我所有的项目",
  "帮我新增一个项目：电商网站重构，角色是全端工程师，从 2024-01 开始",
  "我有哪些技能？",
  "查看我的个人资料",
];

export function AiChatWidget() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, loading]);

  async function send(text: string) {
    const trimmed = text.trim();
    if (!trimmed || loading) return;

    const newMessages = [
      ...messages,
      { role: "user" as const, content: trimmed },
    ];
    setMessages(newMessages);
    setInput("");
    setLoading(true);

    const controller = new AbortController();
    abortRef.current = controller;

    try {
      const res = await fetch("/api/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: newMessages }),
        signal: controller.signal,
      });

      const data = await res.json();

      if (!res.ok) {
        toast.error(data.error || "請求失敗");
        return;
      }

      setMessages([
        ...newMessages,
        { role: "assistant", content: data.content },
      ]);
      router.refresh();
    } catch (err) {
      if ((err as Error).name === "AbortError") {
        toast.info("已停止生成");
        return;
      }
      toast.error("網路錯誤：" + (err as Error).message);
    } finally {
      setLoading(false);
      abortRef.current = null;
    }
  }

  function stop() {
    abortRef.current?.abort();
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    send(input);
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      send(input);
    }
  }

  return (
    <>
      {/* Floating button */}
      {!open && (
        <button
          onClick={() => setOpen(true)}
          className="fixed bottom-6 right-6 z-50 flex items-center gap-2 rounded-full bg-primary px-4 py-3 text-primary-foreground shadow-lg transition-all hover:scale-105 hover:shadow-xl"
        >
          <Sparkles className="size-5" />
          <span className="text-sm font-medium">AI 助手</span>
        </button>
      )}

      {/* Chat panel */}
      {open && (
        <div className="fixed bottom-6 right-6 z-50 flex h-[520px] w-[400px] max-w-[calc(100vw-3rem)] flex-col rounded-xl border bg-background shadow-2xl">
          {/* Header */}
          <div className="flex items-center justify-between border-b px-4 py-3">
            <div className="flex items-center gap-2">
              <div className="flex size-7 items-center justify-center rounded-full bg-primary/15">
                <Bot className="size-4 text-primary" />
              </div>
              <div>
                <div className="text-sm font-semibold">AI 助手</div>
                <div className="text-xs text-muted-foreground">
                  帮你录入、查找、修改数据
                </div>
              </div>
            </div>
            <Button
              size="icon-sm"
              variant="ghost"
              onClick={() => setOpen(false)}
              title="关闭"
            >
              <X className="size-4" />
            </Button>
          </div>

          {/* Messages */}
          <div
            ref={scrollRef}
            className="flex-1 overflow-y-auto px-4 py-3 space-y-3"
          >
            {messages.length === 0 && (
              <div className="space-y-3">
                <div className="rounded-lg bg-muted px-3 py-2 text-sm text-muted-foreground">
                  你好！我是你的简历管理 AI 助手。试试以下操作：
                </div>
                {SUGGESTIONS.map((s) => (
                  <button
                    key={s}
                    onClick={() => send(s)}
                    className="block w-full rounded-lg border px-3 py-2 text-left text-sm transition-colors hover:bg-accent"
                  >
                    {s}
                  </button>
                ))}
              </div>
            )}

            {messages.map((msg, i) => (
              <div
                key={i}
                className={cn(
                  "flex",
                  msg.role === "user" ? "justify-end" : "justify-start"
                )}
              >
                <div
                  className={cn(
                    "max-w-[85%] rounded-lg px-3 py-2 text-sm",
                    msg.role === "user"
                      ? "bg-primary text-primary-foreground whitespace-pre-wrap"
                      : "bg-muted text-foreground"
                  )}
                >
                  {msg.role === "user" ? (
                    msg.content
                  ) : (
                    <div className="chat-markdown">
                      <ReactMarkdown remarkPlugins={[remarkGfm]}>
                        {msg.content}
                      </ReactMarkdown>
                    </div>
                  )}
                </div>
              </div>
            ))}

            {loading && (
              <div className="flex justify-start">
                <div className="flex items-center gap-2 rounded-lg bg-muted px-3 py-2 text-sm text-muted-foreground">
                  <Loader2 className="size-3.5 animate-spin" />
                  <span>思考中…</span>
                </div>
              </div>
            )}
          </div>

          {/* Input */}
          <form onSubmit={handleSubmit} className="border-t p-3">
            <div className="flex gap-2">
              <Textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="输入指令... (Enter 发送，Shift+Enter 换行)"
                disabled={loading}
                rows={1}
                className="min-h-[40px] max-h-[100px] resize-none text-sm"
              />
              {loading ? (
                <Button
                  type="button"
                  size="icon"
                  variant="destructive"
                  onClick={stop}
                  className="shrink-0"
                  title="停止生成"
                >
                  <Square className="size-4" />
                </Button>
              ) : (
                <Button
                  type="submit"
                  size="icon"
                  disabled={!input.trim()}
                  className="shrink-0"
                  title="发送"
                >
                  <Send className="size-4" />
                </Button>
              )}
            </div>
          </form>
        </div>
      )}
    </>
  );
}
