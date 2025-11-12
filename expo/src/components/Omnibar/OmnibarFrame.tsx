import { useColorScheme } from "@/hooks/use-color-scheme";
import { useThemeColor } from "@/hooks/use-theme-color";
import { useImperativeHandle, useRef, useState } from "react";
import { Pressable, StyleSheet, TextInput, View } from "react-native";
import Animated, { LinearTransition } from "react-native-reanimated";
import { ThemedView } from "../ThemedView";
import { ThemedText } from "../ThemedText";
import { TypingIndicator } from "./TypingIndicator";
import { IconSymbol } from "../ui/icon-symbol";
import { Colors } from "@/constants/theme";

export declare namespace OmnibarFrame {
  interface Handle {
    setShowChat: (show: boolean) => void;
  }
}

export function OmnibarFrame({
  children,
  messages,
  handle,
  onSendMessage,
  onReset,
  error,
  state,
}: {
  children: React.ReactNode;
  messages: React.ReactNode;
  handle: React.Ref<OmnibarFrame.Handle>;
  onSendMessage: (message: string) => void;
  onReset: () => Promise<void>;
  error?: Error;
  state: "pristine" | "ready" | "incoming";
}) {
  const theme = useColorScheme() ?? "light";
  const textColor = useThemeColor({}, "text");
  const [showChat, setShowChat] = useState(false);
  const inputRef = useRef<TextInput>(null);
  const scrollViewRef = useRef<Animated.ScrollView>(null);

  useImperativeHandle(
    handle,
    () => ({
      setShowChat,
    }),
    []
  );

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
              {messages}
              <View style={{ flexDirection: "row", height: 24 }}>
                {state === "incoming" && <TypingIndicator />}
              </View>
            </View>
          </Animated.ScrollView>
        )}
        <View style={styles.omnibarRow}>
          <TextInput
            ref={inputRef}
            style={[styles.input, styles[theme].input]}
            textAlign="center"
            placeholder={
              state === "incoming"
                ? "Responding"
                : state === "pristine"
                  ? "Ask, e.g. 'What is the topic of the next talk?' or 'Can you find me a cafe nearby?'"
                  : ""
            }
            submitBehavior="blurAndSubmit"
            editable={state !== "incoming"}
            onSubmitEditing={(e) => {
              inputRef.current?.clear();
              setShowChat(true);
              onSendMessage(e.nativeEvent.text);
            }}
          />
          {state !== "pristine" && (
            <Pressable
              onPress={() => {
                onReset().then(() => {
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
