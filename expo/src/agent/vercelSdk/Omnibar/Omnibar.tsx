import { useChat } from "@ai-sdk/react";
import { lastAssistantMessageIsCompleteWithToolCalls, UIMessage } from "ai";
import { fetch as expoFetch } from "expo/fetch";
import { useEffect, useRef } from "react";
import { generateAPIUrl } from "@/generateApiUrl";
import { useApolloClient } from "@apollo/client/react";
import { MessagePart } from "./MessagePart";
import { handleShowEmbedToolCall } from "./ShowEmbedTool";
import { handleGetBookmarksToolCall } from "./GetBookmarksTool";
import { handleToggleBookmarksToolCall } from "./ToggleBookmarksTool";
import { AgentContext } from "@/agent/AgentContext";
import { GraphQLToolChatTransport } from "./GraphQLToolChatTransport";
import {
  useLocalSearchParams,
  useRouter,
  useSegments,
} from "expo-router/build/hooks";
import { handleNavigateToRouteToolCall } from "./NavigateToRouteTool";
import { OmnibarFrame } from "@/components/Omnibar/OmnibarFrame";
import { Message } from "@/components/Omnibar/Message";

export function Omnibar({ children }: { children: React.ReactNode }) {
  const client = useApolloClient();
  const route = useSegments().join("/");
  const routeParams = useLocalSearchParams();
  const router = useRouter();

  const routeContext = useRef<AgentContext>(null);
  useEffect(() => {
    const now = new Date();
    routeContext.current = {
      currentTime: now.toISOString(),
      currentEvent: process.env.EXPO_PUBLIC_CURRENT_EVENT!,
      location:
        "The user has not shared their location. Unless they specify, assume that they are at the conference venue.",
      route,
      routeParams,
    };
  });

  const omnibarFrame = useRef<OmnibarFrame.Handle>(null);

  const {
    messages,
    error,
    sendMessage,
    status,
    addToolResult,
    setMessages,
    stop,
  } = useChat({
    transport: new GraphQLToolChatTransport(client, {
      fetch: expoFetch as unknown as typeof globalThis.fetch,
      api: generateAPIUrl("/api/chat"),
      body: (messages: UIMessage[]) => {
        return {
          messages,
          context: routeContext.current,
        };
      },
    }),
    onError: (error) => console.error(error, "ERROR"),
    sendAutomaticallyWhen: lastAssistantMessageIsCompleteWithToolCalls,
    async onToolCall({ toolCall }) {
      if (toolCall.dynamic) {
        return;
      }

      if (toolCall.toolName === "replaceChatHistory") {
        const input = toolCall.input as {
          goodbyeMessage: string;
          closeChat: boolean;
        };
        stop().then(() => {
          setMessages([
            {
              id: toolCall.toolCallId,
              role: "assistant",
              parts: [
                {
                  type: "text",
                  text: input.goodbyeMessage,
                },
              ],
            } satisfies UIMessage,
          ]);
          if (input.closeChat) {
            setTimeout(() => {
              omnibarFrame.current?.setShowChat(false);
            }, 1000);
          }
        });

        return;
      }

      const handled =
        handleShowEmbedToolCall(toolCall, client) ||
        handleGetBookmarksToolCall(toolCall) ||
        handleToggleBookmarksToolCall(toolCall, client) ||
        handleNavigateToRouteToolCall(toolCall, router);

      if (handled) {
        addToolResult(await handled);
        return;
      }
    },
  });

  return (
    <OmnibarFrame
      messages={messages.map((message) => (
        <Message role={message.role} key={message.id}>
          {message.parts.map((part, idx) => (
            <MessagePart key={`${message.id}-${idx}`} part={part} />
          ))}
        </Message>
      ))}
      error={error}
      handle={omnibarFrame}
      onSendMessage={(message) => sendMessage({ text: message })}
      onReset={() =>
        stop().then(() => {
          setMessages([]);
        })
      }
      state={
        messages.length === 0
          ? "pristine"
          : status === "streaming" || status === "submitted"
            ? "incoming"
            : "ready"
      }
    >
      {children}
    </OmnibarFrame>
  );
}
