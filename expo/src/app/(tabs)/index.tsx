import { useBackgroundQuery } from "@apollo/client/react";
import { Suspense } from "react";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { HomeScreen } from "@/screens/Home/HomeScreen";
import { VariablesOf } from "@graphql-typed-document-node/core";

export default function Home() {
  const currentEvent =
    process.env.EXPO_PUBLIC_CURRENT_EVENT || "graphqlconf-2025";
  const variables: VariablesOf<typeof HomeScreen.Query> = {
    eventId: currentEvent,
  };

  const [queryRef] = useBackgroundQuery(HomeScreen.Query, {
    variables,
  });

  return (
    <ThemedView style={{ flex: 1 }}>
      <Suspense fallback={<ThemedText>Loading...</ThemedText>}>
        <HomeScreen queryRef={queryRef} variables={variables} />
      </Suspense>
    </ThemedView>
  );
}
