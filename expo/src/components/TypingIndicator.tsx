import { useEffect } from "react";
import { StyleSheet, View } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from "react-native-reanimated";
import { useColorScheme } from "@/hooks/use-color-scheme";

export function TypingIndicator() {
  const theme = useColorScheme() ?? "light";

  const progress = useSharedValue(0);

  useEffect(() => {
    progress.value = withRepeat(withTiming(3, { duration: 1200 }), -1, false);
  }, [progress]);

  const computeDotValue = (value: number, offset: number) => {
    "worklet";
    const phase = (value + offset) % 3;
    return phase < 1 ? phase : phase < 2 ? 2 - phase : 0;
  };

  const dot1Style = useAnimatedStyle(() => {
    const value = computeDotValue(progress.value, 0);
    return {
      opacity: 0.3 + value * 0.7,
      transform: [{ translateY: -value * 4 }],
    };
  });

  const dot2Style = useAnimatedStyle(() => {
    const value = computeDotValue(progress.value, 2);
    return {
      opacity: 0.3 + value * 0.7,
      transform: [{ translateY: -value * 4 }],
    };
  });

  const dot3Style = useAnimatedStyle(() => {
    const value = computeDotValue(progress.value, 1);
    return {
      opacity: 0.3 + value * 0.7,
      transform: [{ translateY: -value * 4 }],
    };
  });

  const dotColor = theme === "light" ? "#666" : "#aaa";

  return (
    <View style={styles.container}>
      <Animated.View
        style={[styles.dot, { backgroundColor: dotColor }, dot1Style]}
      />
      <Animated.View
        style={[styles.dot, { backgroundColor: dotColor }, dot2Style]}
      />
      <Animated.View
        style={[styles.dot, { backgroundColor: dotColor }, dot3Style]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    gap: 6,
    paddingVertical: 8,
    alignItems: "center",
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
});
