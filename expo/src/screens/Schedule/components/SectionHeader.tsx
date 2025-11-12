import { FragmentType, gql } from "@apollo/client";
import { ThemedText } from "@/components/ThemedText";

import { SectionHeader_EventFragmentDoc } from "./SectionHeader.generated";
import { fragmentRegistry } from "@/apollo/client";
import { useMemo } from "react";
import { useSuspenseFragment } from "@apollo/client/react";
import { StyleSheet } from "react-native";
import { ThemedView } from "@/components/ThemedView";
// eslint-disable-next-line no-unused-expressions
gql`
  fragment SectionHeader_event on SchedSession {
    id
    start_time
    start_time_ts
  }
`;
SectionHeader.fragments = {
  event: SectionHeader_EventFragmentDoc,
} as const;
fragmentRegistry.register(SectionHeader.fragments.event);

export function SectionHeader({
  event,
  firstEventOfDay,
}: {
  event: FragmentType<typeof SectionHeader.fragments.event>;
  firstEventOfDay: boolean;
}) {
  const { data } = useSuspenseFragment({
    fragment: SectionHeader.fragments.event,
    fragmentName: "SectionHeader_event",
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
