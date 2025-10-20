import { createOpenAI } from "@ai-sdk/openai";
import {
  streamText,
  UIMessage,
  convertToModelMessages,
  stepCountIs,
  smoothStream,
  StreamTextResult,
  InvalidToolInputError,
  generateObject,
} from "ai";
import { tool, ToolCallOptions } from "@ai-sdk/provider-utils";
import { fragmentComponentEmbeds } from "@/agent/clientTools/fragmentComponentEmbeds";
import { getTools as getBuildersMcpTools } from "@/agent/mcp/buildersMcp";
import { getTools as getSupergraphMcpTools } from "@/agent/mcp/supergraphMcp";
import { clientTools } from "@/agent/clientTools/bookmarks";
import { prompt } from "../prompt";
import { routes } from "../clientTools/routes";
import { AgentContext, AgentInternalContext } from "@/agent/AgentContext";
import { randomUUID } from "node:crypto";
import { validatingJSONSchema } from "@/utils/validatingJSONSchema";

const model = createOpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
  organization: process.env.OPENAI_ORG_ID!,
})("gpt-4o");

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
  const {
    tools: { execute, ...supergraphMcpTools },
  } = supergraphMcp;

  const tools = {
    ...supergraphMcpTools,
    ...remoteEventsMcp.tools,
    ...fragmentComponentEmbeds,
    ...clientTools,
    ...routes,
    replaceChatHistory: tool({
      inputSchema: validatingJSONSchema<{
        goodbyeMessage: string;
        closeChat: boolean;
      }>({
        type: "object",
        properties: {
          goodbyeMessage: { type: "string" },
          closeChat: { type: "boolean" },
        },
        required: ["goodbyeMessage", "closeChat"],
        additionalProperties: false,
      }),
    }),
  };

  const safeTools = Object.keys(tools).filter(
    (key): key is keyof typeof tools => key !== "replaceChatHistory"
  );

  return streamText({
    model,
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
Current route: ${context.route}
Current route arguments: ${JSON.stringify(context.routeParams || {})}
        `.trim(),
          },
        ],
      },
      ...messages,
    ]),
    experimental_context: {
      ...context,
      async executeQuery(query, variables) {
        const executionResult = execute.execute({ query, variables }, {
          messages: [],
          toolCallId: randomUUID(),
          abortSignal: request.signal,
          experimental_context: context,
        } satisfies ToolCallOptions);
        if (isAsyncIterable(executionResult)) {
          throw new Error("Unexpected streaming response.");
        }
        const result = await executionResult;
        return result.structuredContent;
      },
    } satisfies AgentInternalContext,
    tools,
    activeTools: safeTools,
    stopWhen: [
      stepCountIs(10),
      (info) => {
        return (
          info.steps
            .at(-1)
            ?.toolCalls.some((tc) => tc.toolName === "replaceChatHistory") ||
          false
        );
      },
    ],
    async prepareStep(info) {
      const lastMessage = info.messages.at(-1);
      const navigationStep =
        lastMessage?.role === "tool" &&
        lastMessage.content.find(
          (part) =>
            part.type === "tool-result" &&
            part.toolName === "navigateToRoute" &&
            (part.output.value as any)?.success
        );
      if (!navigationStep) {
        return { ...info, activeTools: safeTools };
      }

      // Ask the model if the task is complete
      const { object: taskStatus } = await generateObject({
        model,
        schema: validatingJSONSchema<{
          isComplete: boolean;
          reasoning: string;
        }>({
          type: "object",
          properties: {
            isComplete: {
              type: "boolean",
              description:
                "Whether the user's original request has been fully satisfied by navigating to this route",
            },
            // unused output to force the model to make a more thoughtful decision
            reasoning: {
              type: "string",
              description:
                "Brief explanation of why the task is or isn't complete",
            },
          },
          required: ["isComplete", "reasoning"],
          additionalProperties: false,
        }),
        prompt: `You just navigated the user successfully to another route.

Based on the conversation history and the user's original request, has the task been fully completed by this navigation?

Consider:
- Did the user ask to be navigated somewhere, and we've done that?
- Or did they ask for information that still needs to be provided?
- If they just wanted to go to a specific page/section, the task is likely complete.
- If they asked a question that requires showing data, the task might not be complete yet.

Conversation context:
${messages.map((m) => `${m.role}: ${m.parts.map((p) => (p.type === "text" ? p.text : `[${p.type}]`)).join(" ")}`).join("\n")}`,
      });

      if (!taskStatus.isComplete) {
        return { ...info, activeTools: safeTools };
      }

      return {
        messages: [
          ...info.messages,
          {
            role: "system",
            content: `The user's request has been fulfilled by navigating to the appropriate route. Now, end the conversation politely.
Reasoning: ${taskStatus.reasoning}
Call the \`replaceChatHistory\` tool with a goodbye message and a flag indicating whether the chat should be closed.`,
          },
        ],
        toolChoice: { type: "tool", toolName: "replaceChatHistory" as const },
      };
    },
    experimental_transform: smoothStream({
      delayInMs: 20,
      chunking: "line",
    }),
    async experimental_repairToolCall({ toolCall, error, inputSchema }) {
      if (!InvalidToolInputError.isInstance(error)) {
        return null;
      }

      const tool = tools[toolCall.toolName as keyof typeof tools];
      const schema = tool.inputSchema;
      const { object: repairedArgs } = await generateObject({
        model,
        schema,
        prompt: [
          `The model tried to call the tool "${toolCall.toolName}" with the following inputs:`,
          JSON.stringify(toolCall.input),
          `However, this resulted in the following error:`,
          error.message,
          `The tool accepts the following schema:`,
          JSON.stringify(inputSchema(toolCall)),
          "Please fix the inputs.",
        ].join("\n"),
      });

      return { ...toolCall, input: JSON.stringify(repairedArgs) };
    },
    onFinish() {
      supergraphMcp.close();
      remoteEventsMcp.close();
    },
  });
}

function isAsyncIterable<T = any>(obj: any): obj is AsyncIterable<T> {
  return obj != null && typeof obj[Symbol.asyncIterator] === "function";
}
