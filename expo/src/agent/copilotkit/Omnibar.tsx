import { generateAPIUrl } from "@/generateApiUrl";
import { CopilotKit, useCopilotChatHeadless_c } from "@copilotkit/react-core";
import { useRef } from "react";
import { OmnibarFrame } from "@/components/Omnibar/OmnibarFrame";
import { Message } from "@/components/Omnibar/Message";
import { ThemedText } from "@/components/themed-text";
import { useAppContext, makeSystemMessage } from "./useAppContext";

export function Omnibar({ children }: { children: React.ReactNode }) {
  return (
    <CopilotKit
      publicLicenseKey="ck_pub_96eb1536bf95dcb94115418033f28590"
      runtimeUrl={generateAPIUrl("/api/copilotkit")}
    >
      <OmnibarContent>{children}</OmnibarContent>
    </CopilotKit>
  );
}

function OmnibarContent({ children }: { children: React.ReactNode }) {
  useAppContext();

  const omnibarFrame = useRef<OmnibarFrame.Handle>(null);

  // Use CopilotKit's chat hook with system message injection
  const { messages, sendMessage, isLoading, stopGeneration, reset } =
    useCopilotChatHeadless_c({
      makeSystemMessage,
    });

  return (
    <OmnibarFrame
      messages={messages.map((message) => {
        switch (message.role) {
          case "assistant":
            const content = message.generativeUI?.() || message.content;
            return !content ? null : (
              <Message role={message.role} key={message.id}>
                <ThemedText>
                  {message.generativeUI?.() || message.content}
                </ThemedText>
              </Message>
            );
          case "user":
            return (
              <Message role={message.role} key={message.id}>
                <ThemedText>{message.content}</ThemedText>
              </Message>
            );
          default:
            return null;
        }
      })}
      handle={omnibarFrame}
      onSendMessage={(content) => {
        sendMessage({
          id: `user-${crypto.randomUUID()}`,
          role: "user",
          content,
        });
      }}
      onReset={async () => {
        stopGeneration();
        reset();
      }}
      state={
        messages.length === 0 ? "pristine" : isLoading ? "incoming" : "ready"
      }
    >
      {children}
    </OmnibarFrame>
  );
}
