import { ThemeContext } from "@react-navigation/native";
import { useContext, useEffect, useState } from "react";
import { useColorScheme as useRNColorScheme } from "react-native";

/**
 * To support static rendering, this value needs to be re-calculated on the client side for web
 */
export function useColorScheme() {
  const [hasHydrated, setHasHydrated] = useState(false);

  useEffect(() => {
    setHasHydrated(true);
  }, []);

  const colorScheme = useRNColorScheme();
  const currentScheme = useContext(ThemeContext);

  if (hasHydrated) {
    return currentScheme
      ? currentScheme.dark
        ? "dark"
        : "light"
      : colorScheme;
  }

  return "light";
}
