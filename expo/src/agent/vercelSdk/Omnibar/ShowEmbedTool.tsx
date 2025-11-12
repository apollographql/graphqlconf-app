import {
  availableFragmentComponents,
  hasFragmentDefinitions,
} from "@/agent/clientTools/fragmentComponentEmbeds";
import {
  AbstractChat,
  ChatOnToolCallCallback,
  isToolUIPart,
  Tool,
  UIMessage,
  UITool,
  UIToolInvocation,
} from "ai";
import { Suspense } from "react";
import { ThemedView } from "@/components/ThemedView";
import { ThemedText } from "@/components/ThemedText";
import { ApolloClient } from "@apollo/client";
import { handleEmbedCacheOperations } from "@/agent/utils/handleEmbedCacheOperations";

type ShowEmbedToolUIInvocation<TOOL extends UITool | Tool> = {
  type: `tool-ShowEmbed-${string}`;
} & UIToolInvocation<TOOL>;

type ToolCall = Parameters<ChatOnToolCallCallback>[0]["toolCall"];

type ToolResult = Parameters<AbstractChat<UIMessage>["addToolResult"]>[0];

export function isShowEmbedToolUIPart(
  part: Parameters<typeof isToolUIPart>[0]
): part is ShowEmbedToolUIInvocation<UITool> {
  return isToolUIPart(part) && part.type.startsWith("tool-ShowEmbed-");
}

/**
 * @returns true if the tool call was handled, false otherwise
 */
export function handleShowEmbedToolCall(
  toolCall: ToolCall,
  client: ApolloClient
): void | ToolResult {
  if (!toolCall.toolName.startsWith("ShowEmbed-")) return;
  const componentName = toolCall.toolName.substring("ShowEmbed-".length);
  if (!(componentName in availableFragmentComponents)) {
    throw new Error(`Unknown component name: ${componentName}`);
  }
  const embed =
    availableFragmentComponents[
      componentName as keyof typeof availableFragmentComponents
    ];
  if (!hasFragmentDefinitions(embed)) return;
  const result = handleEmbedCacheOperations({
    embed,
    client,
    args: toolCall.input as any,
  });

  if (!result) {
    return;
  }
  if (result.state === "error") {
    return {
      tool: toolCall.toolName,
      toolCallId: toolCall.toolCallId,
      state: "output-error",
      errorText: result.message,
    };
  }

  console.log("ShowEmbed tool call result:", result);

  return {
    tool: toolCall.toolName,
    toolCallId: toolCall.toolCallId,
    output: result,
  };
}

export function ShowEmbedPart({
  part,
}: {
  part: ShowEmbedToolUIInvocation<UITool>;
}) {
  const componentName = part.type.substring("tool-ShowEmbed-".length);
  if (part.state === "output-available") {
    const embed =
      availableFragmentComponents[
        componentName as keyof typeof availableFragmentComponents
      ];

    return (
      <Suspense
        fallback={
          <ThemedView
            style={{
              margin: 10,
              borderWidth: 1,
              borderRadius: 8,
              padding: 10,
            }}
          >
            <ThemedText>
              Loading... {JSON.stringify(part.input, null, 2)}
            </ThemedText>
          </ThemedView>
        }
      >
        <embed.Component {...(part.input as any)} />
      </Suspense>
    );
  }
}
