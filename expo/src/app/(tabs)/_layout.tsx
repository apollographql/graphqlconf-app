import { Tabs } from "expo-router";
import React, { Suspense } from "react";

import { HapticTab } from "@/components/haptic-tab";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { Colors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { Omnibar } from "@/components/Omnibar";
import { SafeAreaView } from "react-native-safe-area-context";
import { gql } from "@apollo/client";
import { useSuspenseQuery } from "@apollo/client/react";
import { TabLayoutDocument } from "@/app-queries.generated";

if (false) {
  // eslint-disable-next-line no-unused-expressions
  gql`
    query TabLayout {
      __typename
      ...Omnibar_Query @unmask #for some reason the @unmask is necessary here or we end up with a white screen when changing AI providers
      ...Omnibar_Query # once we @unmask a fragment, it's not available in \`_FragmentTypes\` anymore, so we have to repeat it here. Maybe it should still be present there? This is quite hacky.
    }
  `;
}

export default function TabLayout() {
  const colorScheme = useColorScheme();

  const { data } = useSuspenseQuery(TabLayoutDocument);

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <Suspense>
        <Omnibar parent={data}>
          <Tabs
            screenOptions={{
              tabBarActiveTintColor: Colors[colorScheme ?? "light"].tint,
              headerShown: false,
              tabBarButton: HapticTab,
            }}
          >
            <Tabs.Screen
              name="index"
              options={{
                title: "Home",
                tabBarIcon: ({ color }) => (
                  <IconSymbol size={28} name="house.fill" color={color} />
                ),
              }}
            />
            <Tabs.Screen
              name="schedule"
              options={{
                title: "Schedule",
                tabBarIcon: ({ color }) => (
                  <IconSymbol size={28} name="paperplane.fill" color={color} />
                ),
              }}
            />
            <Tabs.Screen
              name="bookmarks"
              options={{
                title: "Bookmarks",
                tabBarIcon: ({ color }) => (
                  <IconSymbol size={28} name="bookmark.fill" color={color} />
                ),
              }}
            />
            <Tabs.Screen
              name="settings"
              options={{
                title: "Settings",
                tabBarIcon: ({ color }) => (
                  <IconSymbol size={28} name="gear" color={color} />
                ),
              }}
            />
          </Tabs>
        </Omnibar>
      </Suspense>
    </SafeAreaView>
  );
}
