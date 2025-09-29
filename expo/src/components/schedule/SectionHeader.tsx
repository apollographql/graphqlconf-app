import { gql } from "@apollo/client";
import { ThemedText } from "../themed-text";

import { SectionHeader_SchedEventFragmentDoc } from "./SectionHeader.generated";
import { fragmentRegistry, From } from "@/apollo_client";
import { useMemo } from "react";
import { useSuspenseFragment } from "@apollo/client/react";
import { StyleSheet } from "react-native";
import { ThemedView } from "../themed-view";
if (false) {
  // eslint-disable-next-line no-unused-expressions
  gql`
    fragment SectionHeader_SchedEvent on SchedSession {
      id
      start_time
      start_time_ts
    }
  `;
}
SectionHeader.fragments = {
  SchedEvent: SectionHeader_SchedEventFragmentDoc,
} as const;
fragmentRegistry.register(SectionHeader.fragments.SchedEvent);

export function SectionHeader({
  event,
  firstEventOfDay,
}: {
  event: From<typeof SectionHeader.fragments.SchedEvent>;
  firstEventOfDay: boolean;
}) {
  const { data } = useSuspenseFragment({
    fragment: SectionHeader.fragments.SchedEvent,
    fragmentName: "SectionHeader_SchedEvent",
    from: event,
  });
  const weekday = useMemo(
    () =>
      new Date(
        data.start_time_ts ? data.start_time_ts * 1000 : ""
      ).toLocaleDateString(undefined, {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
      }),
    [data.start_time_ts]
  );
  return (
    <ThemedView style={firstEventOfDay && styles.firstEventOfDay}>
      {!firstEventOfDay ? null : (
        <ThemedText type="title" style={styles.firstEventOfDayText}>
          {weekday}
        </ThemedText>
      )}
      <ThemedText type="subtitle">{data.start_time}</ThemedText>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  firstEventOfDay: {
    borderTopWidth: 3,
    marginTop: 10,
    paddingTop: 10,
  },
  firstEventOfDayText: {
    marginBottom: 10,
  },
});
