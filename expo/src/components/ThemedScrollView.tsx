import type { PropsWithChildren } from "react";
import { StyleSheet } from "react-native";
import Animated from "react-native-reanimated";

import { ThemedView } from "@/components/themed-view";
import { useThemeColor } from "@/hooks/use-theme-color";

type Props = PropsWithChildren;

export function ThemedScrollView({ children }: Props) {
  const backgroundColor = useThemeColor({}, "background");

  return (
    <Animated.ScrollView
      style={{ backgroundColor, flex: 1 }}
      scrollEventThrottle={16}
    >
      <ThemedView style={styles.content}>{children}</ThemedView>
    </Animated.ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    padding: 32,
    gap: 16,
    overflow: "hidden",
  },
});
