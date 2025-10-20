import { StyleSheet, View } from "react-native";
import { ThemedView } from "@/components/themed-view";
import { ThemedText } from "@/components/themed-text";

export function Message({
  role,
  children,
}: {
  role: "assistant" | "user" | "system";
  children: React.ReactNode;
}) {
  return (
    <ThemedView
      style={role === "user" ? styles.userChat : styles.assistantChat}
    >
      <View>
        <ThemedText style={{ fontWeight: 700 }}>{role}</ThemedText>
        {children}
      </View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  assistantChat: {
    maxWidth: "90%",
    width: "90%",
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
