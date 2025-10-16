import { AbstractChat, UIMessage } from "ai";
import { InferSchema } from "@ai-sdk/provider-utils";
import type { NavigateToRouteTool } from "@/agent/clientTools/routes";
import { Router } from "expo-router";

type ToolCall = {
  toolCallId: string;
  toolName: string;
  input: any;
  dynamic?: boolean;
};

type ToolResult = Parameters<AbstractChat<UIMessage>["addToolResult"]>[0];

/**
 * Client-side handler for navigateToRoute tool
 * @returns ToolResult if the tool call was handled, undefined otherwise
 */
export function handleNavigateToRouteToolCall(
  toolCall: ToolCall,
  router: Router
): void | ToolResult {
  if (toolCall.toolName !== "navigateToRoute") return;

  const { routeDescription } = toolCall.input as InferSchema<
    NavigateToRouteTool["inputSchema"]
  >;

  console.log("Navigating to route:", routeDescription);

  router.push(routeDescription);

  return {
    tool: toolCall.toolName,
    toolCallId: toolCall.toolCallId,
    output: {
      success: true,
    },
  };
}
