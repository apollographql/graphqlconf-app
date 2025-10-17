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
import { ToolCallOptions } from "@ai-sdk/provider-utils";
import { fragmentComponentEmbeds } from "@/agent/clientTools/fragmentComponentEmbeds";
import { getTools as getBuildersMcpTools } from "@/agent/mcp/buildersMcp";
import { getTools as getSupergraphMcpTools } from "@/agent/mcp/supergraphMcp";
import { clientTools } from "@/agent/clientTools/bookmarks";
import { prompt } from "../prompt";
import { routes } from "../clientTools/routes";
import { AgentContext, AgentInternalContext } from "@/agent/AgentContext";
import { randomUUID } from "node:crypto";

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
  };

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
    stopWhen: stepCountIs(10),
    onStepFinish: async (step) => {
      // console.dir(
      //   {
      //     toolCalls: step.toolCalls?.length || 0,
      //     toolResults: step.toolResults?.length || 0,
      //     hasText: !!step.text,
      //     fullResults: step.toolResults.map((r) => r.output),
      //   },
      //   { depth: 7 }
      // );
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
