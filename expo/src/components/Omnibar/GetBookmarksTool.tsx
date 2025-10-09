import { getBookmarks } from "@/utils/bookmarksStorage";
import { AbstractChat, UIMessage } from "ai";

type ToolCall = {
  toolCallId: string;
  toolName: string;
  input: any;
  dynamic?: boolean;
};

type ToolResult = Parameters<AbstractChat<UIMessage>["addToolResult"]>[0];

/**
 * Client-side handler for getBookmarks tool
 * @returns ToolResult if the tool call was handled, undefined otherwise
 */
export function handleGetBookmarksToolCall(
  toolCall: ToolCall
): void | Promise<ToolResult> {
  if (toolCall.toolName !== "getBookmarks") return;

  return (async () => {
    const { typename } = toolCall.input as { typename?: string };

    const bookmarks = await getBookmarks();
    const filtered = typename
      ? bookmarks.filter((bookmark) => bookmark.typename === typename)
      : bookmarks;

    return {
      tool: toolCall.toolName,
      toolCallId: toolCall.toolCallId,
      output: {
        bookmarks: filtered.map((bookmark) => ({
          __typename: bookmark.typename,
          id: bookmark.id,
        })),
        count: filtered.length,
      },
    };
  })();
}
