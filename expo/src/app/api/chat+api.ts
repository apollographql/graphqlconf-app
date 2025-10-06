import type { UIMessage } from "ai";
import { runAgent } from "@/agent/agent";

export async function POST(request: Request) {
  const { messages }: { messages: UIMessage[] } = await request.json();

  const result = await runAgent({ messages, request });
  return result.toUIMessageStreamResponse({
    headers: {
      "Content-Type": "application/octet-stream",
      "Content-Encoding": "none",
    },
  });
}
