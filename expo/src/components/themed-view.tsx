import { View, type ViewProps } from "react-native";

import { useThemeColor } from "@/hooks/use-theme-color";
import React, { JSX } from "react";
import Animated, { AnimatedProps } from "react-native-reanimated";

export type ThemedProps = {
  lightColor?: string;
  darkColor?: string;
};

export function ThemedView(Props: ThemedProps & ViewProps): JSX.Element;
export function ThemedView(
  Props: ThemedProps & {
    Component: typeof Animated.View;
  } & AnimatedProps<ViewProps>
): JSX.Element;

export function ThemedView({
  style,
  lightColor,
  darkColor,
  Component = View,
  ...otherProps
}: ThemedProps &
  (ViewProps | AnimatedProps<ViewProps>) & {
    Component?:
      | React.ComponentType<ViewProps>
      | React.ComponentType<AnimatedProps<ViewProps>>;
  }) {
  const backgroundColor = useThemeColor(
    { light: lightColor, dark: darkColor },
    "background"
  );
  const borderColor = useThemeColor(
    { light: lightColor, dark: darkColor },
    "border"
  );

  return (
    <Component
      style={[{ backgroundColor, borderColor }, style]}
      {...(otherProps as any)}
    />
  );
}
