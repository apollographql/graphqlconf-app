import { AbstractChat, UIMessage } from "ai";
import { ApolloClient } from "@apollo/client";
import { ToggleBookmarkDocument } from "@/mutations/ToggleBookmark";

type ToolCall = {
  toolCallId: string;
  toolName: string;
  input: any;
  dynamic?: boolean;
};

type ToolResult = Parameters<AbstractChat<UIMessage>["addToolResult"]>[0];

interface BookmarkItem {
  typename: string;
  id: string;
  bookmarked?: boolean;
}

/**
 * Client-side handler for toggleBookmarks tool
 * @returns ToolResult if the tool call was handled, undefined otherwise
 */
export function handleToggleBookmarksToolCall(
  toolCall: ToolCall,
  client: ApolloClient
): void | Promise<ToolResult> {
  if (toolCall.toolName !== "toggleBookmarks") return;

  return (async () => {
    const { items } = toolCall.input as { items: BookmarkItem[] };

    if (!Array.isArray(items)) {
      return {
        tool: toolCall.toolName,
        toolCallId: toolCall.toolCallId,
        output: {
          error: "items must be an array",
          success: false,
        },
      };
    }

    const results = await Promise.all(
      items.map(async (item) => {
        console.log("bookmarking", item);
        const { data } = await client.mutate({
          mutation: ToggleBookmarkDocument,
          variables: {
            id: item.id,
            typename: item.typename,
            isBookmarked: item.bookmarked,
          },
        });
        console.log("bookmark result", data);
        return data?.toggleBookmark;
      })
    );

    return {
      tool: toolCall.toolName,
      toolCallId: toolCall.toolCallId,
      output: {
        results,
        success: true,
      },
    };
  })();
}
