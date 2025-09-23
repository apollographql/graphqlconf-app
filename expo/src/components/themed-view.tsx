import { View, type ViewProps } from "react-native";

import { useThemeColor } from "@/hooks/use-theme-color";

export type ThemedViewProps = ViewProps & {
  lightColor?: string;
  darkColor?: string;
};

export function ThemedView({
  style,
  lightColor,
  darkColor,
  ...otherProps
}: ThemedViewProps) {
  const backgroundColor = useThemeColor(
    { light: lightColor, dark: darkColor },
    "background"
  );
  const borderColor = useThemeColor(
    { light: lightColor, dark: darkColor },
    "border"
  );

  return (
    <View style={[{ backgroundColor, borderColor }, style]} {...otherProps} />
  );
}
