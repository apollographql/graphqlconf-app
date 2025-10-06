import type { UIMessage } from "ai";
import { AgentContext, runAgent } from "@/agent/agent";

export async function POST(request: Request) {
  const {
    messages,
    context,
  }: { messages: UIMessage[]; context: AgentContext } = await request.json();

  const result = await runAgent({ messages, context, request });
  return result.toUIMessageStreamResponse({
    headers: {
      "Content-Type": "application/octet-stream",
      "Content-Encoding": "none",
    },
  });
}
