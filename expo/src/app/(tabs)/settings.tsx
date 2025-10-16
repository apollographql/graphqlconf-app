import { useLocalSearchParams } from "expo-router";
import { SettingsScreen } from "@/screens/Settings/SettingsScreen";
import { useBackgroundQuery } from "@apollo/client/react";
import { Suspense } from "react";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";

export default function Settings() {
  const params = useLocalSearchParams<{
    success?: string;
    error?: string;
  }>();

  const [queryRef] = useBackgroundQuery(SettingsScreen.Query, {});

  return (
    <ThemedView style={{ flex: 1 }}>
      <Suspense fallback={<ThemedText>Loading...</ThemedText>}>
        <SettingsScreen
          successMessage={params.success === "true"}
          errorMessage={params.error}
          queryRef={queryRef}
        />
      </Suspense>
    </ThemedView>
  );
}
