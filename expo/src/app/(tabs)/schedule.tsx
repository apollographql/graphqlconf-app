import { ScheduleList } from "@/components/schedule/ScheduleList";
import { gql } from "@apollo/client";
import { useBackgroundQuery } from "@apollo/client/react";
import { Suspense } from "react";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { SafeAreaView } from "react-native-safe-area-context";
import { ScheduleScreenDocument } from "./schedule.generated";

if (false) {
  // eslint-disable-next-line no-unused-expressions
  gql`
    query ScheduleScreen($year: String!) {
      ...ScheduleList_Query
    }
  `;
}

ScheduleScreen.Query = ScheduleScreenDocument;

export default function ScheduleScreen() {
  const [queryRef] = useBackgroundQuery(ScheduleScreen.Query, {
    variables: { year: "2025" },
  });
  return (
    <SafeAreaView style={{ flex: 1 }}>
      <ThemedView style={{ flex: 1 }}>
        <Suspense fallback={<ThemedText>Loading...</ThemedText>}>
          <ScheduleList
            parent={"ROOT_QUERY" as any}
            queryRef={queryRef}
            variables={{ year: "2025" }}
          />
        </Suspense>
      </ThemedView>
    </SafeAreaView>
  );
}
