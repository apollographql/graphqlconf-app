import { gql } from "@apollo/client";
import {
  QueryRef,
  useQueryRefHandlers,
  useSuspenseFragment,
} from "@apollo/client/react";
import { useMemo, useTransition } from "react";
import { SectionList } from "react-native";
import { ScheduleListItem } from "./ScheduleItem";
import { fragmentRegistry, From } from "@/apollo_client";
import { SectionHeader } from "./SectionHeader";
import { ThemedText } from "../themed-text";
import { ScheduleList_QueryFragmentDoc } from "./ScheduleList.generated";

if (false) {
  // eslint-disable-next-line no-unused-expressions
  gql`
    fragment ScheduleList_Query on Query {
      events(year: "2025") {
        id
        start_time_ts
        venue {
          id
        }
        ...ScheduleListItem_SchedSession
        ...SectionHeader_SchedEvent
      }
    }
  `;
}

ScheduleList.fragments = {
  Query: ScheduleList_QueryFragmentDoc,
} as const;
fragmentRegistry.register(ScheduleList.fragments.Query);

export function ScheduleList({
  parent,
  queryRef,
}: {
  parent: From<typeof ScheduleList.fragments.Query>;
  queryRef: QueryRef;
}) {
  const { refetch } = useQueryRefHandlers(queryRef);
  const [refreshing, transition] = useTransition();
  const onRefresh = () => {
    transition(() => {
      refetch();
    });
  };

  const { data } = useSuspenseFragment({
    fragment: ScheduleList.fragments.Query,
    fragmentName: "ScheduleList_Query",
    from: parent,
  });
  const sections = useMemo(() => {
    const grouped = Object.groupBy(
      data.events || [],
      (item) => item.start_time_ts ?? 0
    );
    let previousDay: undefined | string;
    return Object.entries(grouped)
      .map(([timeslot, items]) => {
        const startTime = items?.[0]?.start_time_ts;
        return {
          firstEvent: items?.[0],
          weekday: startTime
            ? new Date(startTime * 1000).toLocaleDateString(undefined, {
                weekday: "long",
              })
            : "",
          timeslot: Number(timeslot) || 0,
          data: items ?? [],
        };
      })
      .sort((a, b) => a.timeslot - b.timeslot)
      .map((section) => {
        if (section.weekday !== previousDay) {
          previousDay = section.weekday ?? undefined;
          return { ...section, firstEventOfDay: true };
        }
        return { ...section, firstEventOfDay: false };
      });
  }, [data.events]);
  return (
    <SectionList
      refreshing={refreshing}
      onRefresh={onRefresh}
      style={{ margin: 5 }}
      sections={sections}
      keyExtractor={(item) => item.id}
      renderItem={({ item }) => <ScheduleListItem schedSession={item} />}
      renderSectionHeader={({ section: { firstEvent, firstEventOfDay } }) =>
        firstEvent ? (
          <SectionHeader event={firstEvent} firstEventOfDay={firstEventOfDay} />
        ) : (
          <ThemedText>No time</ThemedText>
        )
      }
    />
  );
}
