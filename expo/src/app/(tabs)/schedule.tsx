import { ScheduleList } from "@/components/schedule/ScheduleList";
import { gql } from "@apollo/client";
import { useBackgroundQuery } from "@apollo/client/react";
import { Suspense } from "react";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { SafeAreaView } from "react-native-safe-area-context";

const ScheduleScreenQuery = gql`
  query ScheduleScreen {
    ...ScheduleList_Query
  }
  ${ScheduleList.fragments.Query}
`;

ScheduleScreen.Query = ScheduleScreenQuery;

export default function ScheduleScreen() {
  useBackgroundQuery(ScheduleScreen.Query);
  return (
    <SafeAreaView style={{ flex: 1 }}>
      <ThemedView style={{ flex: 1 }}>
        <Suspense fallback={<ThemedText>Loading...</ThemedText>}>
          <ScheduleList parent={"ROOT_QUERY"} />
        </Suspense>
      </ThemedView>
    </SafeAreaView>
  );
}
