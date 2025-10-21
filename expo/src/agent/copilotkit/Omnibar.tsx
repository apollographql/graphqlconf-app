import { generateAPIUrl } from "@/generateApiUrl";
import {
  CopilotKit,
  useCopilotChatHeadless_c,
  useCopilotReadable,
} from "@copilotkit/react-core";
import { useRef } from "react";
import { useLocalSearchParams, useSegments } from "expo-router/build/hooks";
import { OmnibarFrame } from "@/components/Omnibar/OmnibarFrame";
import { Message } from "@/components/Omnibar/Message";
import { prompt } from "@/agent/prompt";
import { ThemedText } from "@/components/themed-text";

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
  const route = useSegments().join("/");
  const routeParams = useLocalSearchParams();

  // Build context for agent

  useCopilotReadable({
    description: "The app configured to focus on the event with ID",
    value: process.env.EXPO_PUBLIC_CURRENT_EVENT!,
  });
  useCopilotReadable({
    description: "Location",
    value:
      "The user has not shared their location. Unless they specify, assume that they are at the conference venue.",
  });
  useCopilotReadable({
    description: "Current route",
    value: route,
  });
  useCopilotReadable({
    description: "Current route arguments",
    value: routeParams,
  });

  const omnibarFrame = useRef<OmnibarFrame.Handle>(null);

  // Use CopilotKit's chat hook with system message injection
  const { messages, sendMessage, isLoading, stopGeneration, reset } =
    useCopilotChatHeadless_c({
      // Inject system prompt and context via makeSystemMessage
      makeSystemMessage: (contextString, additionalInstructions) => {
        return (
          `${prompt}

The user has provided you with the following context:
\`\`\`
0.Date and time: ${new Date().toISOString()}${contextString}
\`\`\`
` + (additionalInstructions ? `\n\n${additionalInstructions}` : "")
        );
      },
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
