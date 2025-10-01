import { Pressable, StyleSheet, TextInput, View } from "react-native";
import { ThemedView } from "./themed-view";
import { useColorScheme } from "@/hooks/use-color-scheme.web";
import { Colors } from "@/constants/theme";
import Animated, { LinearTransition } from "react-native-reanimated";

import { useChat } from "@ai-sdk/react";
import {
  DefaultChatTransport,
  lastAssistantMessageIsCompleteWithToolCalls,
} from "ai";
import { fetch as expoFetch } from "expo/fetch";
import { Suspense, useRef, useState } from "react";
import { generateAPIUrl } from "@/generateApiUrl";
import { ThemedText } from "./themed-text";
import { IconSymbol } from "./ui/icon-symbol";
import { availableFragmentComponents } from "@/availableFragmentComponents";
import { useApolloClient } from "@apollo/client/react";

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
      if (toolCall.toolName.startsWith("ShowEmbed-")) {
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
        for (const [targetTypeName, docs] of Object.entries(
          details.fragments
        )) {
          const fragmentData = client.readFragment({
            id: client.cache.identify(props[targetTypeName]),
            fragment: docs,
            fragmentName: docs.definitions.find(
              (d) => d.kind === "FragmentDefinition"
            )?.name.value,
          });
          if (!fragmentData) {
            addToolResult({
              tool: toolCall.toolName,
              toolCallId: toolCall.toolCallId,
              state: "output-error",
              errorText:
                "Could not render component in the app due to missing data. Fall back to giving the user a textual response.",
            });
            return;
          }
          output[targetTypeName] = fragmentData;
        }

        addToolResult({
          tool: toolCall.toolName,
          toolCallId: toolCall.toolCallId,
          output: ["This data has been displayed to the user:", output],
        });
      }
    },
  });

  function isToolEmbedPart(part: {
    type: string;
  }): part is { type: `tool-${string}` } {
    return part.type.startsWith("tool-ShowEmbed-");
  }

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
              {messages.map((m) => (
                <ThemedView
                  key={m.id}
                  style={
                    m.role === "user" ? styles.userChat : styles.assistantChat
                  }
                >
                  <View>
                    <ThemedText style={{ fontWeight: 700 }}>
                      {m.role}
                    </ThemedText>
                    {m.parts.map((part, i) => {
                      if (part.type === "text") {
                        return (
                          <ThemedText key={`${m.id}-${i}`}>
                            {part.text}
                          </ThemedText>
                        );
                      }
                      if (isToolEmbedPart(part)) {
                        const componentName = part.type.substring(
                          "tool-ShowEmbed-".length
                        );
                        if (part.state === "output-available") {
                          const embed =
                            availableFragmentComponents[
                              componentName as keyof typeof availableFragmentComponents
                            ];

                          return (
                            <Suspense
                              key={`${m.id}-${i}`}
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
                                    Loading...{" "}
                                    {JSON.stringify(part.input, null, 2)}
                                  </ThemedText>
                                </ThemedView>
                              }
                            >
                              <embed.Component {...(part.input as any)} />
                            </Suspense>
                          );
                        }
                      }
                    })}
                  </View>
                </ThemedView>
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
    assistantChat: {
      maxWidth: "90%",
      alignSelf: "flex-start",
      borderWidth: 1,
      borderRadius: 8,
      padding: 8,
      margin: 8,
    },
    userChat: {
      maxWidth: "90%",
      alignSelf: "flex-end",
      borderWidth: 1,
      borderRadius: 8,
      padding: 8,
      margin: 8,
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
