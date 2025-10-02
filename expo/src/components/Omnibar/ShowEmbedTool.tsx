import { availableFragmentComponents } from "@/availableFragmentComponents";
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
import { ThemedView } from "../themed-view";
import { ThemedText } from "../themed-text";
import { ApolloClient } from "@apollo/client";

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
  const details =
    availableFragmentComponents[
      componentName as keyof typeof availableFragmentComponents
    ];
  const output: Record<string, unknown> = {};
  const props = toolCall.input as Record<string, any>;
  for (const [targetTypeName, docs] of Object.entries(details.fragments)) {
    const fragmentData = client.readFragment({
      id: client.cache.identify(props[targetTypeName]),
      fragment: docs,
      fragmentName: docs.definitions.find(
        (d) => d.kind === "FragmentDefinition"
      )?.name.value,
    });
    if (!fragmentData) {
      return {
        tool: toolCall.toolName,
        toolCallId: toolCall.toolCallId,
        state: "output-error",
        errorText:
          "Could not render component in the app due to missing data. Fall back to giving the user a textual response.",
      };
    }
    output[targetTypeName] = fragmentData;
  }

  return {
    tool: toolCall.toolName,
    toolCallId: toolCall.toolCallId,
    output: ["This data has been displayed to the user:", output],
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
