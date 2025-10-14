import { Pressable, StyleSheet, TextInput, View } from "react-native";
import { ThemedView } from "../themed-view";
import { useColorScheme } from "@/hooks/use-color-scheme.web";
import { Colors } from "@/constants/theme";
import Animated, { LinearTransition } from "react-native-reanimated";

import { useChat } from "@ai-sdk/react";
import { lastAssistantMessageIsCompleteWithToolCalls, UIMessage } from "ai";
import { fetch as expoFetch } from "expo/fetch";
import { useRef, useState } from "react";
import { generateAPIUrl } from "@/generateApiUrl";
import { ThemedText } from "../themed-text";
import { IconSymbol } from "../ui/icon-symbol";
import { useApolloClient } from "@apollo/client/react";
import { Message } from "./Message";
import { handleShowEmbedToolCall } from "./ShowEmbedTool";
import { handleGetBookmarksToolCall } from "./GetBookmarksTool";
import { handleToggleBookmarksToolCall } from "./ToggleBookmarksTool";
import { AgentContext } from "@/agent/agent";
import { TypingIndicator } from "./TypingIndicator";
import { useThemeColor } from "@/hooks/use-theme-color";
import { GraphQLToolChatTransport } from "./GraphQLToolChatTransport";

export function Omnibar({ children }: { children: React.ReactNode }) {
  const theme = useColorScheme() ?? "light";
  const textColor = useThemeColor({}, "text");
  const [showChat, setShowChat] = useState(false);
  const client = useApolloClient();

  const inputRef = useRef<TextInput>(null);
  const scrollViewRef = useRef<Animated.ScrollView>(null);
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
        const now = new Date();
        return {
          messages,
          context: {
            currentTime: now.toISOString(),
            currentEvent: process.env.EXPO_PUBLIC_CURRENT_EVENT!,
            location:
              "The user has not shared their location. Unless they specify, assume that they are at the conference venue.",
          } satisfies AgentContext,
        };
      },
    }),
    onError: (error) => console.error(error, "ERROR"),
    sendAutomaticallyWhen: lastAssistantMessageIsCompleteWithToolCalls,
    async onToolCall({ toolCall }) {
      if (toolCall.dynamic) {
        return;
      }
      const handled =
        handleShowEmbedToolCall(toolCall, client) ||
        handleGetBookmarksToolCall(toolCall) ||
        handleToggleBookmarksToolCall(toolCall, client);

      if (handled) {
        addToolResult(await handled);
        return;
      }
    },
  });

  return (
    <View style={styles.wrapper}>
      {children}
      <ThemedView
        style={[styles.panel, showChat && styles.expanded]}
        Component={Animated.View}
        layout={LinearTransition.duration(500)}
      >
        {error ? (
          <ThemedText>{error.message}</ThemedText>
        ) : (
          <Animated.ScrollView
            contentContainerStyle={styles.chatContainer}
            ref={scrollViewRef}
            onContentSizeChange={() =>
              scrollViewRef.current?.scrollToEnd({ animated: true })
            }
          >
            <View style={styles.chatContentWrapper}>
              {messages.map((message) => (
                <Message key={message.id} message={message} />
              ))}
              <View style={{ flexDirection: "row" }}>
                <ThemedText type="muted">{status} </ThemedText>
                {(status === "streaming" || status === "submitted") && (
                  <TypingIndicator />
                )}
              </View>
            </View>
          </Animated.ScrollView>
        )}
        <View style={styles.omnibarRow}>
          <TextInput
            ref={inputRef}
            style={[styles.input, styles[theme].input]}
            textAlign="center"
            placeholder="Ask, e.g. 'What is the topic of the next talk?' or 'Can you find me a cafe nearby?'"
            submitBehavior="blurAndSubmit"
            editable={status === "ready"}
            onSubmitEditing={(e) => {
              inputRef.current?.clear();
              setShowChat(true);
              sendMessage({
                text: e.nativeEvent.text,
              });
            }}
          />
          {messages.length > 0 && (
            <Pressable
              onPress={() => {
                stop().then(() => {
                  setMessages([]);
                  setShowChat(false);
                });
              }}
              style={styles.iconButton}
            >
              <IconSymbol size={28} name="trash" color={textColor} />
            </Pressable>
          )}
          <Pressable
            onPress={() => {
              setShowChat((v) => !v);
            }}
          >
            <IconSymbol
              size={28}
              name={showChat ? "chevron.up" : "chevron.down"}
              color={textColor}
            />
          </Pressable>
        </View>
      </ThemedView>
    </View>
  );
}

const styles = Object.assign(
  StyleSheet.create({
    wrapper: {
      position: "relative",
      paddingTop: 60,
      flex: 1,
    },
    panel: {
      flexDirection: "column",
      alignItems: "stretch",
      paddingHorizontal: 10,
      paddingBottom: 10,
      position: "absolute",
      top: 0,
      left: 0,
      right: 0,
      height: 60,
      borderTopWidth: 0,
      borderBottomWidth: 1,
      borderWidth: 1,
      borderBottomLeftRadius: 12,
      borderBottomRightRadius: 12,
    },
    expanded: {
      height: "70%",
    },
    chatContainer: { flexGrow: 1 },
    chatContentWrapper: { flexGrow: 1, justifyContent: "flex-end" },
    omnibarRow: {
      flexDirection: "row",
      marginTop: 10,
      justifyContent: "space-evenly",
      alignItems: "center",
      gap: 10,
    },
    input: {
      flex: 1,
      borderWidth: 1,
      borderRadius: 8,
      padding: 8,
    },
    typingBubble: {
      maxWidth: "90%",
      width: "90%",
      alignSelf: "flex-start",
      borderWidth: 1,
      borderRadius: 8,
      padding: 8,
      margin: 8,
    },
    iconButton: {
      width: 44,
      height: 44,
      justifyContent: "center",
      alignItems: "center",
    },
  }),
  {
    light: {
      input: {
        backgroundColor: "#eee",
        color: Colors.light.text,
      },
    },
    dark: {
      input: {
        backgroundColor: "#333",
        color: Colors.dark.text,
      },
    },
  }
);
