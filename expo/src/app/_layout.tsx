import "@/polyfills";

import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from "@react-navigation/native";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import "react-native-reanimated";
import { ApolloProvider } from "@apollo/client/react";

import { useColorScheme } from "@/hooks/use-color-scheme";
import { client } from "@/apollo_client";
import { Platform, StyleSheet } from "react-native";

export const unstable_settings = {
  anchor: "(tabs)",
};

export default function RootLayout() {
  const colorScheme = useColorScheme();

  return (
    <ApolloProvider client={client}>
      <ThemeProvider value={colorScheme === "dark" ? DarkTheme : DefaultTheme}>
        <Stack
          screenOptions={{
            contentStyle: [
              styles.screen,
              Platform.OS === "web" && styles.screenWeb,
            ],
          }}
        >
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen
            name="modal"
            options={{ presentation: "modal", title: "Modal" }}
          />
        </Stack>
        <StatusBar style="auto" />
      </ThemeProvider>
    </ApolloProvider>
  );
}

const styles = StyleSheet.create({
  screen: {},
  screenWeb: {
    width: "100%",
    maxWidth: 600,
    alignSelf: "center",
  },
});
