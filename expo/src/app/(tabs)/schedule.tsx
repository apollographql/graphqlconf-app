import { gql } from "@apollo/client";
import { useBackgroundQuery } from "@apollo/client/react";
import { Suspense } from "react";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { SafeAreaView } from "react-native-safe-area-context";
import { ScheduleScreen } from "@/screens/Schedule/ScheduleScreen";
import { VariablesOf } from "@graphql-typed-document-node/core";

export default function ScheduleRoute() {
  const variables: VariablesOf<typeof ScheduleScreen.Query> = { year: "2025" };

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
