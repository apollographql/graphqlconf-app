import { useLocalSearchParams, Stack } from "expo-router";
import { skipToken, useBackgroundQuery } from "@apollo/client/react";
import { Suspense } from "react";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { SafeAreaView } from "react-native-safe-area-context";
import SessionDetailScreen from "@/screens/SessionDetail/SessionDetailScreen";
import { VariablesOf } from "@graphql-typed-document-node/core";

export default function SessionDetailRoute() {
  const { id } = useLocalSearchParams<{ id: string }>();

  const variables: VariablesOf<typeof SessionDetailScreen.Query> = {
    sessionId: id || "",
  };

  const [queryRef] = useBackgroundQuery(
    SessionDetailScreen.Query,
    id ? { variables } : skipToken
  );

  if (!queryRef) {
    return null;
  }

  return (
    <>
      <Stack.Screen options={{ title: "Session" }} />
      <SafeAreaView style={{ flex: 1 }}>
        <ThemedView style={{ flex: 1 }}>
          <Suspense fallback={<ThemedText>Loading...</ThemedText>}>
            <SessionDetailScreen queryRef={queryRef} />
          </Suspense>
        </ThemedView>
      </SafeAreaView>
    </>
  );
}
