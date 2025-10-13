import { ThemeContext } from "@react-navigation/native";
import { useContext } from "react";
import { ColorSchemeName, useColorScheme as useOrig } from "react-native";

export function useColorScheme(): ColorSchemeName {
  const rnScheme = useOrig();
  const currentScheme = useContext(ThemeContext);
  return currentScheme ? (currentScheme.dark ? "dark" : "light") : rnScheme;
}
