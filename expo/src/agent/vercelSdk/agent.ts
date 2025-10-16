import { createOpenAI } from "@ai-sdk/openai";
import {
  streamText,
  UIMessage,
  convertToModelMessages,
  stepCountIs,
  smoothStream,
  StreamTextResult,
} from "ai";
import { fragmentComponentEmbeds } from "@/agent/clientTools/fragmentComponentEmbeds";
import { getTools as getBuildersMcpTools } from "@/agent/mcp/buildersMcp";
import { getTools as getSupergraphMcpTools } from "@/agent/mcp/supergraphMcp";
import { clientTools } from "@/agent/clientTools/bookmarks";
import { prompt } from "../prompt";

export interface AgentContext {
  currentTime: string;
  currentEvent: string;
  location: string;
}

export async function runAgent({
  messages,
  context,
  request,
}: {
  messages: UIMessage[];
  context: AgentContext;
  request: Request;
}): Promise<StreamTextResult<any, unknown>> {
  const [supergraphMcp, remoteEventsMcp] = await Promise.all([
    getSupergraphMcpTools(),
    getBuildersMcpTools(request),
  ]);
  const tools = {
    ...supergraphMcp.tools,
    ...remoteEventsMcp.tools,
    ...fragmentComponentEmbeds,
    ...clientTools,
  };

  console.log("Available tools:", Object.keys(tools));

  return streamText({
    model: createOpenAI({
      apiKey: process.env.OPENAI_API_KEY!,
      organization: process.env.OPENAI_ORG_ID!,
    })("gpt-4o"),
    // https://github.com/vercel/ai/issues/7099#issuecomment-3069539156
    // avoid "Item 'rs_03e6d4960e393c150068dbd1b235cc819ca60b4f637ad981e2' of type 'reasoning' was provided without its required following item." error
    // this seems to only be necessary when using GPT 5 tools
    // providerOptions: {
    //   openai: {
    //     store: false,
    //     reasoningEffort: "low",
    //     reasoningSummary: "auto",
    //     include: ["reasoning.encrypted_content"],
    //   } satisfies OpenAIResponsesProviderOptions,
    // },
    messages: convertToModelMessages([
      { role: "system", parts: [{ type: "text", text: prompt }] },
      {
        role: "system",
        parts: [
          {
            type: "text",
            text: `
This message contains information about the current state of the UI.
Date and time: ${context.currentTime}
The app configured to focus on the event with ID "${context.currentEvent}". 
Location: ${context.location}
        `.trim(),
          },
        ],
      },
      ...messages,
    ]),
    tools,
    stopWhen: stepCountIs(10),
    onStepFinish: async (step) => {
      console.dir(
        {
          toolCalls: step.toolCalls?.length || 0,
          toolResults: step.toolResults?.length || 0,
          hasText: !!step.text,
          fullResults: step.toolResults.map((r) => r.output),
        },
        { depth: 7 }
      );
    },
    experimental_transform: smoothStream({
      delayInMs: 20,
      chunking: "line",
    }),
    onFinish() {
      supergraphMcp.close();
      remoteEventsMcp.close();
    },
  });
}
