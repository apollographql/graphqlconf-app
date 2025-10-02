import { StyleSheet, View } from "react-native";
import { ThemedView } from "../themed-view";
import { UIDataTypes, UIMessage, UIMessagePart, UITools } from "ai";
import { ThemedText } from "../themed-text";
import { isShowEmbedToolUIPart, ShowEmbedPart } from "./ShowEmbedTool";

export function Message({
  message,
}: {
  message: UIMessage<unknown, UIDataTypes, UITools>;
}) {
  return (
    <ThemedView
      style={message.role === "user" ? styles.userChat : styles.assistantChat}
    >
      <View>
        <ThemedText style={{ fontWeight: 700 }}>{message.role}</ThemedText>
        {message.parts.map((part, idx) => (
          <MessagePart key={`${message.id}-${idx}`} part={part} />
        ))}
      </View>
    </ThemedView>
  );
}

function MessagePart({ part }: { part: UIMessagePart<UIDataTypes, UITools> }) {
  if (part.type === "text") {
    return <ThemedText>{part.text}</ThemedText>;
  }
  if (isShowEmbedToolUIPart(part)) {
    return <ShowEmbedPart part={part} />;
  }
}
const styles = StyleSheet.create({
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
});
