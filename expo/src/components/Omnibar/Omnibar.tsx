import { Pressable, StyleSheet, TextInput, View } from "react-native";
import { ThemedView } from "../themed-view";
import { useColorScheme } from "@/hooks/use-color-scheme.web";
import { Colors } from "@/constants/theme";
import Animated, { LinearTransition } from "react-native-reanimated";

import { useChat } from "@ai-sdk/react";
import {
  DefaultChatTransport,
  lastAssistantMessageIsCompleteWithToolCalls,
} from "ai";
import { fetch as expoFetch } from "expo/fetch";
import { useRef, useState } from "react";
import { generateAPIUrl } from "@/generateApiUrl";
import { ThemedText } from "../themed-text";
import { IconSymbol } from "../ui/icon-symbol";
import { useApolloClient } from "@apollo/client/react";
import { Message } from "./Message";
import { handleShowEmbedToolCall } from "./ShowEmbedTool";

export function Omnibar({ children }: { children: React.ReactNode }) {
  const theme = useColorScheme() ?? "light";
  const [showChat, setShowChat] = useState(false);
  const client = useApolloClient();

  const inputRef = useRef<TextInput>(null);
  const scrollViewRef = useRef<Animated.ScrollView>(null);
  const { messages, error, sendMessage, status, addToolResult } = useChat({
    transport: new DefaultChatTransport({
      fetch: expoFetch as unknown as typeof globalThis.fetch,
      api: generateAPIUrl("/api/chat"),
    }),
    onError: (error) => console.error(error, "ERROR"),
    sendAutomaticallyWhen: lastAssistantMessageIsCompleteWithToolCalls,
    onToolCall({ toolCall }) {
      if (toolCall.dynamic) {
        return;
      }

      const handled = handleShowEmbedToolCall(toolCall, client);
      if (handled) {
        addToolResult(handled);
      }
    },
  });

  console.log(messages);

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
            </View>
          </Animated.ScrollView>
        )}
        <View style={styles.omnibarRow}>
          <TextInput
            ref={inputRef}
            style={[styles.input, styles[theme].input]}
            textAlign="center"
            placeholder="Ask, e.g. 'How will the weather be?'"
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
          <Pressable
            onPress={() => {
              setShowChat((v) => !v);
            }}
          >
            <IconSymbol
              size={28}
              name={showChat ? "chevron.up" : "chevron.down"}
              color={theme === "light" ? Colors.light.text : Colors.dark.text}
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
