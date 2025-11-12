import { useBackgroundQuery } from "@apollo/client/react";
import { Suspense } from "react";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { SafeAreaView } from "react-native-safe-area-context";
import { ScheduleScreen } from "@/screens/Schedule/ScheduleScreen";
import { VariablesOf } from "@graphql-typed-document-node/core";

export default function ScheduleRoute() {
  const currentEvent =
    process.env.EXPO_PUBLIC_CURRENT_EVENT || "graphqlconf-2025";
  const variables: VariablesOf<typeof ScheduleScreen.Query> = {
    eventId: currentEvent,
  };

  const [queryRef] = useBackgroundQuery(ScheduleScreen.Query, {
    variables,
  });
  return (
    <SafeAreaView style={{ flex: 1 }}>
      <ThemedView style={{ flex: 1 }}>
        <Suspense fallback={<ThemedText>Loading...</ThemedText>}>
          <ScheduleScreen queryRef={queryRef} variables={variables} />
        </Suspense>
      </ThemedView>
    </SafeAreaView>
  );
}
