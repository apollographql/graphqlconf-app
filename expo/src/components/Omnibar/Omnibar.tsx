import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport, UIDataTypes, UIMessagePart, UITools } from "ai";
import { fetch as expoFetch } from "expo/fetch";
import { generateAPIUrl } from "@/generateApiUrl";
import { OmnibarFrame } from "@/components/Omnibar/OmnibarFrame";
import { Message } from "@/components/Omnibar/Message";
import { ThemedText } from "../ThemedText";

export function Omnibar({ children }: { children: React.ReactNode }) {
  const { messages, error, sendMessage, status, setMessages, stop } = useChat({
    transport: new DefaultChatTransport({
      fetch: expoFetch as unknown as typeof globalThis.fetch,
      api: generateAPIUrl("/api/chat"),
    }),
    onError: (error) => console.error(error, "ERROR"),
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

export function MessagePart({
  part,
}: {
  part: UIMessagePart<UIDataTypes, UITools>;
}) {
  if (part.type === "text") {
    return <ThemedText>{part.text}</ThemedText>;
  }
}
