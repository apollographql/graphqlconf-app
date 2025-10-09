import { getFavorites } from "@/utils/favoritesStorage";
import { AbstractChat, UIMessage } from "ai";

type ToolCall = {
  toolCallId: string;
  toolName: string;
  input: any;
  dynamic?: boolean;
};

type ToolResult = Parameters<AbstractChat<UIMessage>["addToolResult"]>[0];

/**
 * Client-side handler for getFavorites tool
 * @returns ToolResult if the tool call was handled, undefined otherwise
 */
export function handleGetFavoritesToolCall(
  toolCall: ToolCall
): void | Promise<ToolResult> {
  if (toolCall.toolName !== "getFavorites") return;

  return (async () => {
    const { typename } = toolCall.input as { typename?: string };

    const favorites = await getFavorites();
    const filtered = typename
      ? favorites.filter((fav) => fav.typename === typename)
      : favorites;

    return {
      tool: toolCall.toolName,
      toolCallId: toolCall.toolCallId,
      output: {
        favorites: filtered.map((fav) => ({
          __typename: fav.typename,
          id: fav.id,
        })),
        count: filtered.length,
      },
    };
  })();
}
