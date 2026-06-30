import { NextResponse } from "next/server";
import OpenAI from "openai";
import { getSession } from "@/lib/auth";
import { aiTools, executeTool, SYSTEM_PROMPT } from "@/lib/ai-tools";

export const dynamic = "force-dynamic";

type ClientMessage = { role: "user" | "assistant"; content: string };

export async function POST(req: Request) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "未登入" }, { status: 401 });
  }

  const apiKey = process.env.AI_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: "AI_API_KEY 未設定" }, { status: 500 });
  }

  const { messages: userMessages } = (await req.json().catch(() => ({}))) as {
    messages?: ClientMessage[];
  };

  if (!userMessages || userMessages.length === 0) {
    return NextResponse.json({ error: "訊息不能為空" }, { status: 400 });
  }

  const client = new OpenAI({
    apiKey,
    baseURL: process.env.AI_BASE_URL || undefined,
  });

  const model = process.env.AI_MODEL ?? "gpt-4o-mini";

  const messages: OpenAI.Chat.Completions.ChatCompletionMessageParam[] = [
    { role: "system", content: SYSTEM_PROMPT },
    ...userMessages.map((m) => ({
      role: m.role,
      content: m.content,
    })),
  ];

  const MAX_ITERATIONS = 10;

  try {
    for (let i = 0; i < MAX_ITERATIONS; i++) {
      const response = await client.chat.completions.create({
        model,
        messages,
        tools: aiTools,
      });

      const choice = response.choices[0];
      if (!choice) {
        return NextResponse.json({ content: "未收到回應" });
      }
      const msg = choice.message;

      if (msg.tool_calls && msg.tool_calls.length > 0) {
        messages.push({
          role: "assistant",
          content: msg.content ?? null,
          tool_calls: msg.tool_calls,
        });

        for (const toolCall of msg.tool_calls) {
          if (toolCall.type !== "function") continue;
          const args = JSON.parse(toolCall.function.arguments || "{}");
          const result = await executeTool(toolCall.function.name, args);
          messages.push({
            role: "tool",
            tool_call_id: toolCall.id,
            content: result,
          });
        }

        continue;
      }

      return NextResponse.json({ content: msg.content ?? "" });
    }

    return NextResponse.json({
      content: "抱歉，處理次數超過限制，請簡化你的請求。",
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "未知錯誤";
    return NextResponse.json(
      { error: `AI 服務異常：${message}` },
      { status: 502 }
    );
  }
}
